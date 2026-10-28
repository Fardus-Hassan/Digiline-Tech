import type { Request } from "express";
import { HttpError } from "./http-error.js";

/** Small in-memory fixed-window limiter, keyed by IP. Fine for a single server instance. */
export function createRateLimiter({ windowMs, max, message }: { windowMs: number; max: number; message: string }) {
  const hits = new Map<string, number[]>();

  return (req: Request) => {
    const key = req.ip ?? "unknown";
    const now = Date.now();
    const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
    if (recent.length >= max) throw new HttpError(429, message);
    recent.push(now);
    hits.set(key, recent);
    if (hits.size > 5000) {
      for (const [ip, times] of hits) if (now - times[times.length - 1] >= windowMs) hits.delete(ip);
    }
  };
}
