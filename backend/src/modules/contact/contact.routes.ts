import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { createRateLimiter } from "../../lib/rate-limit.js";
import { cleanHtml, htmlToText } from "../../lib/html.js";
import { notifyNewMessage } from "../../lib/mailer.js";
import { requireAuth } from "../../middleware/auth.js";
import type { Prisma } from "../../generated/prisma/client.js";

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((value) => value || undefined);

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.email("Please enter a valid email").max(200),
  phone: optionalText(30).refine((v) => !v || /^[+\d][\d\s()-]{5,}$/.test(v), "Please enter a valid phone number"),
  subject: optionalText(150),
  message: z.string().max(5000).optional(),
  messageHtml: z.string().max(60_000).optional(),
  // Honeypot: hidden from people, filled in by bots
  website: z.string().optional(),
});

const messageText = z
  .string()
  .trim()
  .min(10, "Message should be at least 10 characters")
  .max(5000, "Message is too long (max 5000 characters)");

/** Set automatically when a reply is saved, so it can't be deleted. */
const REPLIED = "REPLIED";
const STATUS_COLORS = ["sky", "amber", "emerald", "slate", "red", "zinc", "violet", "pink", "teal", "orange", "indigo", "lime"] as const;

const statusSchema = z.string().min(1).max(60);
/** "inbox" = statuses shown in the inbox (everything except spam/archive by default). */
const listSchema = z.object({
  status: statusSchema.default("inbox"),
  q: z.string().trim().max(100).optional(),
});
const statusesSchema = z.object({
  statuses: z
    .array(
      z.object({
        key: z.string().max(60).optional(),
        label: z.string().trim().min(1, "Give the status a name").max(40),
        color: z.enum(STATUS_COLORS),
        inInbox: z.boolean(),
      }),
    )
    .min(1)
    .max(20),
});

const idSchema = z.object({ id: z.string().min(1) });
const updateSchema = z
  .object({ read: z.boolean(), status: statusSchema, notes: z.string().max(10_000) })
  .partial()
  .refine((v) => Object.keys(v).length > 0, "Nothing to update");
const replySchema = z.object({
  subject: z.string().trim().min(1).max(200),
  html: z.string().min(1).max(100_000),
});
const bulkSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("status"), ids: z.array(z.string()).min(1).max(500), status: statusSchema }),
  z.object({ action: z.enum(["read", "unread", "delete"]), ids: z.array(z.string()).min(1).max(500) }),
]);

const rateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many messages. Please try again in a few minutes.",
});

const router = Router();

router.post("/", async (req, res) => {
  const { website, messageHtml, message, ...data } = contactSchema.parse(req.body);
  if (website) {
    res.status(201).json({ message: "Message received" });
    return;
  }

  const html = messageHtml ? cleanHtml(messageHtml) : null;
  const text = messageText.safeParse(html ? htmlToText(html) : (message ?? ""));
  if (!text.success) throw new HttpError(400, "Please check the highlighted fields.", { message: [text.error.issues[0].message] });

  rateLimit(req);
  const first = await prisma.messageStatus.findFirst({ orderBy: { sortOrder: "asc" }, select: { key: true } });
  const created = await prisma.contactMessage.create({
    data: {
      ...data,
      status: first?.key ?? "NEW",
      message: text.data,
      messageHtml: html,
      ip: req.ip,
      userAgent: req.get("user-agent")?.slice(0, 300),
    },
  });
  void notifyNewMessage(created);
  res.status(201).json({ message: "Message received" });
});

router.use(requireAuth);

const getStatuses = () => prisma.messageStatus.findMany({ orderBy: { sortOrder: "asc" } });

async function inboxKeys() {
  const rows = await prisma.messageStatus.findMany({ where: { inInbox: true }, select: { key: true } });
  return rows.map((r) => r.key);
}

async function assertStatus(key: string) {
  if (!(await prisma.messageStatus.findUnique({ where: { key } }))) throw new HttpError(400, "That status doesn't exist anymore");
}

async function statusCounts() {
  const [statuses, groups] = await Promise.all([
    getStatuses(),
    prisma.contactMessage.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const inbox = statuses.filter((s) => s.inInbox).map((s) => s.key);
  const unread = await prisma.contactMessage.count({ where: { read: false, status: { in: inbox } } });
  const counts: Record<string, number> = Object.fromEntries(statuses.map((s) => [s.key, 0]));
  for (const g of groups) counts[g.status] = (counts[g.status] ?? 0) + g._count._all;
  counts.all = groups.reduce((sum, g) => sum + g._count._all, 0);
  counts.inbox = inbox.reduce((sum, key) => sum + (counts[key] ?? 0), 0);
  return { statuses, counts, unread };
}

router.get("/statuses", async (_req, res) => {
  res.json({ statuses: await getStatuses() });
});

/** Replaces the whole list: order = array order, missing keys are deleted and their messages move to the first status. */
router.put("/statuses", async (req, res) => {
  const { statuses } = statusesSchema.parse(req.body);
  if (!statuses.some((s) => s.key === REPLIED)) throw new HttpError(400, "The “Replied” status is used automatically and can't be removed");

  const existing = await getStatuses();
  const taken = new Set(existing.map((s) => s.key));
  const rows = statuses.map((s, sortOrder) => {
    let key = s.key && taken.has(s.key) ? s.key : undefined;
    if (!key) {
      const base =
        s.label
          .toUpperCase()
          .replace(/[^A-Z0-9]+/g, "_")
          .replace(/^_+|_+$/g, "")
          .slice(0, 40) || "STATUS";
      key = base;
      for (let n = 2; taken.has(key); n++) key = `${base}_${n}`;
      taken.add(key);
    }
    return { key, label: s.label, color: s.color, inInbox: s.inInbox, sortOrder };
  });
  const keep = rows.map((r) => r.key);
  const removed = existing.map((s) => s.key).filter((key) => !keep.includes(key));

  await prisma.$transaction([
    ...rows.map((row) => prisma.messageStatus.upsert({ where: { key: row.key }, create: row, update: row })),
    prisma.contactMessage.updateMany({ where: { status: { in: removed } }, data: { status: rows[0].key } }),
    prisma.messageStatus.deleteMany({ where: { key: { in: removed } } }),
  ]);
  res.json(await statusCounts());
});

router.get("/", async (req, res) => {
  const { status, q } = listSchema.parse(req.query);
  const where: Prisma.ContactMessageWhereInput = {
    ...(status === "inbox" ? { status: { in: await inboxKeys() } } : status === "all" ? {} : { status }),
    ...(q && {
      OR: ["name", "email", "phone", "subject", "message"].map((field) => ({ [field]: { contains: q, mode: "insensitive" } })),
    }),
  };
  const [messages, stats] = await Promise.all([
    prisma.contactMessage.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 300,
      omit: { ip: true, userAgent: true, messageHtml: true, notes: true },
      include: { _count: { select: { replies: true } } },
    }),
    statusCounts(),
  ]);
  res.json({ messages, ...stats });
});

router.get("/:id", async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const message = await prisma.contactMessage.findUnique({
    where: { id },
    include: { replies: { orderBy: { createdAt: "desc" } } },
  });
  if (!message) throw new HttpError(404, "Message not found");
  res.json({ message });
});

router.patch("/:id", async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const data = updateSchema.parse(req.body);
  if (data.status) await assertStatus(data.status);
  const message = await prisma.contactMessage.update({ where: { id }, data }).catch(() => {
    throw new HttpError(404, "Message not found");
  });
  res.json({ message });
});

router.post("/bulk", async (req, res) => {
  const input = bulkSchema.parse(req.body);
  const where = { id: { in: input.ids } };
  if (input.action === "status") await assertStatus(input.status);
  if (input.action === "delete") await prisma.contactMessage.deleteMany({ where });
  else
    await prisma.contactMessage.updateMany({
      where,
      data: input.action === "status" ? { status: input.status } : { read: input.action === "read" },
    });
  res.json(await statusCounts());
});

router.post("/:id/replies", async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const { subject, html } = replySchema.parse(req.body);
  const clean = cleanHtml(html);
  const text = htmlToText(clean);
  if (!text) throw new HttpError(400, "Write a reply first");
  const [reply] = await prisma
    .$transaction([
      prisma.messageReply.create({ data: { messageId: id, subject, html: clean, text } }),
      prisma.contactMessage.update({ where: { id }, data: { status: REPLIED, read: true } }),
    ])
    .catch(() => {
      throw new HttpError(404, "Message not found");
    });
  res.status(201).json({ reply });
});

router.delete("/:id/replies/:replyId", async (req, res) => {
  const { id, replyId } = z.object({ id: z.string().min(1), replyId: z.string().min(1) }).parse(req.params);
  await prisma.messageReply.deleteMany({ where: { id: replyId, messageId: id } });
  res.status(204).end();
});

router.delete("/:id", async (req, res) => {
  const { id } = idSchema.parse(req.params);
  await prisma.contactMessage.delete({ where: { id } }).catch(() => {
    throw new HttpError(404, "Message not found");
  });
  res.status(204).end();
});

export default router;
