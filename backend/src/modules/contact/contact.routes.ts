import { Router, type Request } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { requireAuth } from "../../middleware/auth.js";

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
  message: z.string().trim().min(10, "Message should be at least 10 characters").max(5000),
  // Honeypot: hidden from people, filled in by bots
  website: z.string().optional(),
});

const listSchema = z.object({
  filter: z.enum(["all", "unread"]).default("all"),
});

const idSchema = z.object({ id: z.string().min(1) });
const updateSchema = z.object({ read: z.boolean() });

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 5;
const hits = new Map<string, number[]>();

function rateLimit(req: Request) {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_PER_WINDOW) {
    throw new HttpError(429, "Too many messages. Please try again in a few minutes.");
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) {
    for (const [ip, times] of hits) if (now - times[times.length - 1] >= WINDOW_MS) hits.delete(ip);
  }
}

const router = Router();

router.post("/", async (req, res) => {
  const { website, ...data } = contactSchema.parse(req.body);
  if (website) {
    res.status(201).json({ message: "Message received" });
    return;
  }

  rateLimit(req);
  await prisma.contactMessage.create({
    data: { ...data, ip: req.ip, userAgent: req.get("user-agent")?.slice(0, 300) },
  });
  res.status(201).json({ message: "Message received" });
});

router.get("/", requireAuth, async (req, res) => {
  const { filter } = listSchema.parse(req.query);
  const [messages, unread] = await Promise.all([
    prisma.contactMessage.findMany({
      where: filter === "unread" ? { read: false } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      omit: { ip: true, userAgent: true },
    }),
    prisma.contactMessage.count({ where: { read: false } }),
  ]);
  res.json({ messages, unread });
});

router.patch("/:id", requireAuth, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  const { read } = updateSchema.parse(req.body);
  const message = await prisma.contactMessage.update({ where: { id }, data: { read } }).catch(() => {
    throw new HttpError(404, "Message not found");
  });
  res.json({ message });
});

router.delete("/:id", requireAuth, async (req, res) => {
  const { id } = idSchema.parse(req.params);
  await prisma.contactMessage.delete({ where: { id } }).catch(() => {
    throw new HttpError(404, "Message not found");
  });
  res.status(204).end();
});

export default router;
