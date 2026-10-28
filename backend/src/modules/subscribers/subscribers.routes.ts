import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { createRateLimiter } from "../../lib/rate-limit.js";
import { requireAuth } from "../../middleware/auth.js";

const rateLimit = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 5,
  message: "Too many attempts. Please try again in a few minutes.",
});

const router = Router();

router.post("/", async (req, res) => {
  const { email, website } = z
    .object({ email: z.email("Please enter a valid email").max(200), website: z.string().optional() })
    .parse(req.body);
  if (!website) {
    rateLimit(req);
    const normalized = email.trim().toLowerCase();
    await prisma.subscriber.upsert({ where: { email: normalized }, create: { email: normalized }, update: {} });
  }
  res.status(201).json({ message: "Subscribed" });
});

router.get("/", requireAuth, async (_req, res) => {
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  res.json({ subscribers });
});

router.get("/export", requireAuth, async (_req, res) => {
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });
  const csv = ["email,subscribed_at", ...subscribers.map((s) => `${s.email},${s.createdAt.toISOString()}`)].join("\n");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="subscribers.csv"');
  res.send(csv);
});

router.delete("/:id", requireAuth, async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  await prisma.subscriber.delete({ where: { id } }).catch(() => {
    throw new HttpError(404, "Subscriber not found");
  });
  res.status(204).end();
});

export default router;
