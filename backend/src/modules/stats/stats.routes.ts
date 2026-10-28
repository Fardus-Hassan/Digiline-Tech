import { Router } from "express";
import { prisma } from "../../lib/prisma.js";

const router = Router();

const inboxStatuses = () => prisma.messageStatus.findMany({ where: { inInbox: true }, select: { key: true } });

router.get("/", async (_req, res) => {
  const [unread, messages, subscribers, media, drafts, recentMessages, recentEntries] = await Promise.all([
    prisma.contactMessage.count({ where: { read: false, status: { in: (await inboxStatuses()).map((s) => s.key) } } }),
    prisma.contactMessage.count(),
    prisma.subscriber.count(),
    prisma.media.count(),
    prisma.entry.count({ where: { status: "DRAFT" } }),
    prisma.contactMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, subject: true, read: true, createdAt: true },
    }),
    prisma.entry.findMany({
      orderBy: { updatedAt: "desc" },
      take: 6,
      select: { id: true, collection: true, slug: true, status: true, data: true, updatedAt: true },
    }),
  ]);
  res.json({ unread, messages, subscribers, media, drafts, recentMessages, recentEntries });
});

export default router;
