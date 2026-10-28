import type { NextFunction, Request, Response } from "express";
import multer from "multer";
import { ZodError, z } from "zod";
import { HttpError } from "../lib/http-error.js";
import { isProd } from "../config/env.js";

export function notFound(req: Request, res: Response) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    res.status(400).json({ message: "Validation failed", errors: z.flattenError(err).fieldErrors });
    return;
  }

  if (err instanceof multer.MulterError) {
    const message = err.code === "LIMIT_FILE_SIZE" ? "File is too large (max 250 MB)" : err.message;
    res.status(400).json({ message });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.status).json({ message: err.message, ...(err.errors ? { errors: err.errors } : {}) });
    return;
  }

  console.error(err);
  res.status(500).json({
    message: "Internal server error",
    ...(isProd ? {} : { error: err instanceof Error ? err.message : String(err) }),
  });
}
