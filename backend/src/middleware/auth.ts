import type { NextFunction, Request, Response } from "express";
import { AUTH_COOKIE, verifyToken } from "../lib/jwt.js";
import { HttpError } from "../lib/http-error.js";

declare global {
  namespace Express {
    interface Request {
      adminId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const token: string | undefined = req.cookies?.[AUTH_COOKIE];
  if (!token) throw new HttpError(401, "Unauthorized");

  try {
    req.adminId = verifyToken(token).sub;
  } catch {
    throw new HttpError(401, "Invalid or expired session");
  }
  next();
}
