import path from "node:path";
import { mkdirSync } from "node:fs";

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? "uploads");

mkdirSync(path.join(UPLOAD_DIR, ".tmp"), { recursive: true });
