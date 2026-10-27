import { Router, type CookieOptions } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { AUTH_COOKIE, signToken } from "../../lib/jwt.js";
import { HttpError } from "../../lib/http-error.js";
import { requireAuth } from "../../middleware/auth.js";
import { isProd } from "../../config/env.js";

const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

const cookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: "lax",
  path: "/",
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = loginSchema.parse(req.body);

  const admin = await prisma.admin.findUnique({ where: { email } });
  const valid = admin && (await bcrypt.compare(password, admin.passwordHash));
  if (!admin || !valid) throw new HttpError(401, "Invalid email or password");

  res.cookie(AUTH_COOKIE, signToken({ sub: admin.id }), cookieOptions);
  res.json({ admin: { id: admin.id, name: admin.name, email: admin.email } });
});

router.post("/logout", (_req, res) => {
  res.clearCookie(AUTH_COOKIE, { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Logged out" });
});

router.get("/me", requireAuth, async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.adminId },
    select: { id: true, name: true, email: true },
  });
  if (!admin) throw new HttpError(401, "Unauthorized");
  res.json({ admin });
});

export default router;
