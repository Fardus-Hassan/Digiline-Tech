import "dotenv/config";
import path from "node:path";
import { readdir, stat } from "node:fs/promises";
import bcrypt from "bcryptjs";
import sharp from "sharp";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.js";
import * as content from "./seed-content.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const PUBLIC_DIR = path.resolve(import.meta.dirname, "../../frontend/public");

async function seedAdmin() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password) throw new Error("ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env");

  await prisma.admin.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: process.env.ADMIN_NAME ?? "Admin",
      passwordHash: await bcrypt.hash(password, 12),
    },
  });
  console.log(`Admin ready: ${email}`);
}

/** Imports a collection only when it is still empty, so re-running the seed never overwrites edits. */
async function seedCollection(collection: string, entries: { slug: string; data: object }[], parentId?: string) {
  const existing = await prisma.entry.count({ where: { collection, ...(parentId ? { parentId } : {}) } });
  if (existing) return false;
  for (const [sortOrder, entry] of entries.entries()) {
    await prisma.entry.create({
      data: {
        collection,
        slug: entry.slug,
        data: entry.data,
        sortOrder,
        parentId,
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    });
  }
  return true;
}

async function seedContent() {
  if (await seedCollection("services", content.services)) {
    for (const service of content.services) {
      if (!service.children) continue;
      const parent = await prisma.entry.findUniqueOrThrow({
        where: { collection_slug: { collection: "services", slug: service.slug } },
      });
      await seedCollection("subServices", service.children, parent.id);
    }
  }
  await seedCollection("caseStudies", content.caseStudies);
  await seedCollection("posts", content.posts);
  await seedCollection("testimonials", content.testimonials);
  await seedCollection("brands", content.brands);
  await seedCollection("values", content.values);
  console.log("Content ready");
}

/** Registers the images/videos that ship with the site so they can be picked from the media library. */
async function seedMedia() {
  const folders = [
    { dir: "images", kind: "image" },
    { dir: "videos", kind: "video" },
  ];
  const mimes: Record<string, string> = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".webp": "image/webp",
    ".svg": "image/svg+xml",
    ".mp4": "video/mp4",
    ".webm": "video/webm",
  };

  const files = [{ url: "/logo.png", file: path.join(PUBLIC_DIR, "logo.png"), kind: "image" }];
  for (const { dir, kind } of folders) {
    const names = await readdir(path.join(PUBLIC_DIR, dir)).catch(() => []);
    for (const name of names) files.push({ url: `/${dir}/${name}`, file: path.join(PUBLIC_DIR, dir, name), kind });
  }

  for (const { url, file, kind } of files) {
    const mime = mimes[path.extname(file).toLowerCase()];
    if (!mime || (await prisma.media.findUnique({ where: { url } }))) continue;
    const info = await stat(file).catch(() => null);
    if (!info) continue;
    const actualKind = mime.startsWith("image/") ? "image" : kind;
    const meta = actualKind === "image" ? await sharp(file).metadata().catch(() => null) : null;
    await prisma.media.create({
      data: {
        kind: actualKind,
        url,
        filename: path.basename(file),
        mime,
        size: info.size,
        width: meta?.width,
        height: meta?.height,
      },
    });
  }
  console.log("Media library ready");
}

async function main() {
  await seedAdmin();
  await seedContent();
  await seedMedia();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
