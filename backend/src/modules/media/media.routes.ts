import { Router } from "express";
import multer from "multer";
import sharp from "sharp";
import path from "node:path";
import { randomBytes } from "node:crypto";
import { mkdir, rename, rm, stat } from "node:fs/promises";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { UPLOAD_DIR } from "../../config/uploads.js";

const MB = 1024 * 1024;
const MAX_IMAGE_SIZE = 15 * MB;
const MAX_FILE_SIZE = 250 * MB;
const MAX_IMAGE_WIDTH = 2400;

/** Raster images are re-encoded to WebP; these are stored untouched. */
const PASSTHROUGH_IMAGES = new Set(["image/svg+xml", "image/gif", "image/x-icon", "image/vnd.microsoft.icon"]);
const RASTER_IMAGES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const VIDEOS = new Set(["video/mp4", "video/webm", "video/quicktime"]);
const DOCUMENTS = new Set(["application/pdf"]);

const kindOf = (mime: string) =>
  RASTER_IMAGES.has(mime) || PASSTHROUGH_IMAGES.has(mime)
    ? "image"
    : VIDEOS.has(mime)
      ? "video"
      : DOCUMENTS.has(mime)
        ? "document"
        : null;

const upload = multer({
  dest: path.join(UPLOAD_DIR, ".tmp"),
  limits: { fileSize: MAX_FILE_SIZE, files: 20 },
  fileFilter: (_req, file, cb) => {
    if (kindOf(file.mimetype)) cb(null, true);
    else cb(new HttpError(400, `"${file.originalname}" is not a supported file type`));
  },
});

const baseName = (name: string) =>
  path
    .parse(name)
    .name.normalize("NFKD")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "file";

async function processFile(file: Express.Multer.File) {
  const kind = kindOf(file.mimetype)!;
  const now = new Date();
  const folder = path.join(String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"));
  await mkdir(path.join(UPLOAD_DIR, folder), { recursive: true });
  const id = randomBytes(4).toString("hex");

  try {
    if (kind === "image" && RASTER_IMAGES.has(file.mimetype)) {
      if (file.size > MAX_IMAGE_SIZE) throw new HttpError(400, `"${file.originalname}" is larger than 15 MB`);
      const filename = `${baseName(file.originalname)}-${id}.webp`;
      const image = sharp(file.path, { failOn: "none" }).rotate();
      const info = await image
        .clone()
        .resize({ width: MAX_IMAGE_WIDTH, withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(path.join(UPLOAD_DIR, folder, filename));
      const blur = await image.clone().resize(16).webp({ quality: 40 }).toBuffer();
      return {
        kind,
        filename,
        url: `/uploads/${folder.replace(/\\/g, "/")}/${filename}`,
        mime: "image/webp",
        size: info.size,
        width: info.width,
        height: info.height,
        blurDataUrl: `data:image/webp;base64,${blur.toString("base64")}`,
      };
    }

    const ext = path.extname(file.originalname).toLowerCase().replace(/[^.a-z0-9]/g, "") || "";
    const filename = `${baseName(file.originalname)}-${id}${ext}`;
    await rename(file.path, path.join(UPLOAD_DIR, folder, filename));
    let width: number | undefined;
    let height: number | undefined;
    if (kind === "image" && file.mimetype !== "image/x-icon") {
      const meta = await sharp(path.join(UPLOAD_DIR, folder, filename)).metadata().catch(() => null);
      width = meta?.width;
      height = meta?.height;
    }
    return {
      kind,
      filename,
      url: `/uploads/${folder.replace(/\\/g, "/")}/${filename}`,
      mime: file.mimetype,
      size: file.size,
      width,
      height,
    };
  } finally {
    await rm(file.path, { force: true });
  }
}

/** Number of sections/entries that reference a media URL. */
async function usageCount(url: string) {
  const pattern = `%${url.replace(/[%_\\]/g, "\\$&")}%`;
  const [{ count }] = await prisma.$queryRaw<{ count: bigint }[]>`
    SELECT (
      (SELECT COUNT(*) FROM "Entry" WHERE data::text ILIKE ${pattern} OR seo::text ILIKE ${pattern}) +
      (SELECT COUNT(*) FROM "Section" WHERE data::text ILIKE ${pattern} OR seo::text ILIKE ${pattern})
    ) AS count`;
  return Number(count);
}

const router = Router();

router.get("/", async (req, res) => {
  const { kind, q } = z
    .object({ kind: z.enum(["image", "video", "document"]).optional(), q: z.string().trim().max(100).optional() })
    .parse(req.query);
  const media = await prisma.media.findMany({
    where: {
      ...(kind ? { kind } : {}),
      ...(q
        ? { OR: [{ filename: { contains: q, mode: "insensitive" } }, { alt: { contains: q, mode: "insensitive" } }] }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });
  res.json({ media });
});

router.post("/", upload.array("files", 20), async (req, res) => {
  const files = (req.files as Express.Multer.File[] | undefined) ?? [];
  if (!files.length) throw new HttpError(400, "Please choose a file to upload");

  const created = [];
  try {
    for (const file of files) {
      const processed = await processFile(file);
      created.push(await prisma.media.create({ data: { ...processed, alt: "" } }));
    }
  } finally {
    await Promise.all(files.map((f) => rm(f.path, { force: true })));
  }
  res.status(201).json({ media: created });
});

router.patch("/:id", async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const { alt } = z.object({ alt: z.string().trim().max(300) }).parse(req.body);
  const media = await prisma.media.update({ where: { id }, data: { alt } }).catch(() => {
    throw new HttpError(404, "File not found");
  });
  res.json({ media });
});

router.get("/:id/usage", async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new HttpError(404, "File not found");
  res.json({ count: await usageCount(media.url) });
});

router.delete("/:id", async (req, res) => {
  const id = z.string().min(1).parse(req.params.id);
  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) throw new HttpError(404, "File not found");

  await prisma.media.delete({ where: { id } });
  if (media.url.startsWith("/uploads/")) {
    const file = path.join(UPLOAD_DIR, media.url.slice("/uploads/".length));
    if (file.startsWith(UPLOAD_DIR) && (await stat(file).catch(() => null))) await rm(file, { force: true });
  }
  res.status(204).end();
});

export default router;
