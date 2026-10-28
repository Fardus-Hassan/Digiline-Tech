import { Router } from "express";
import { z } from "zod";
import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import {
  CHILD_COLLECTIONS,
  COLLECTIONS,
  collectionSchema,
  jsonObject,
  sectionKeySchema,
  seoSchema,
  slugSchema,
} from "./collections.js";

/** Admin CRUD for sections and entries. Mounted behind `requireAuth`. */
const router = Router();

const toJson = (value: unknown) => (value == null ? Prisma.DbNull : (value as Prisma.InputJsonValue));

const entryInput = z.object({
  slug: slugSchema,
  status: z.enum(["DRAFT", "PUBLISHED"]).default("PUBLISHED"),
  data: jsonObject,
  seo: seoSchema,
  parentId: z.string().nullable().optional(),
});

const idParams = z.object({ collection: collectionSchema, id: z.string().min(1) });

async function assertParent(collection: z.infer<typeof collectionSchema>, parentId?: string | null) {
  const parentCollection = CHILD_COLLECTIONS[collection];
  if (!parentCollection) return null;
  if (!parentId) throw new HttpError(400, "Please choose a parent");
  const parent = await prisma.entry.findFirst({ where: { id: parentId, collection: parentCollection } });
  if (!parent) throw new HttpError(400, "Parent not found");
  return parent.id;
}

function slugConflict(err: unknown): never {
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
    throw new HttpError(409, "This URL slug is already used", { slug: ["This URL slug is already used"] });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025") {
    throw new HttpError(404, "Entry not found");
  }
  throw err;
}

// ---------- Sections ----------

router.get("/sections", async (_req, res) => {
  const sections = await prisma.section.findMany({ select: { key: true, updatedAt: true } });
  res.json({ sections });
});

router.get("/sections/:key", async (req, res) => {
  const key = sectionKeySchema.parse(req.params.key);
  const section = await prisma.section.findUnique({ where: { key } });
  res.json({ section: section ?? { key, data: {}, seo: null, updatedAt: null } });
});

router.put("/sections/:key", async (req, res) => {
  const key = sectionKeySchema.parse(req.params.key);
  const { data, seo } = z.object({ data: jsonObject, seo: seoSchema }).parse(req.body);
  const section = await prisma.section.upsert({
    where: { key },
    create: { key, data: data as Prisma.InputJsonValue, seo: toJson(seo) },
    update: { data: data as Prisma.InputJsonValue, seo: toJson(seo) },
  });
  res.json({ section });
});

// ---------- Entries ----------

router.get("/entries", async (_req, res) => {
  const groups = await prisma.entry.groupBy({ by: ["collection", "status"], _count: true });
  const counts = Object.fromEntries(COLLECTIONS.map((c) => [c, { total: 0, published: 0, draft: 0 }]));
  for (const g of groups) {
    const bucket = counts[g.collection];
    if (!bucket) continue;
    bucket.total += g._count;
    bucket[g.status === "PUBLISHED" ? "published" : "draft"] += g._count;
  }
  res.json({ counts });
});

router.get("/entries/:collection", async (req, res) => {
  const collection = collectionSchema.parse(req.params.collection);
  const { parentId } = z.object({ parentId: z.string().optional() }).parse(req.query);
  const entries = await prisma.entry.findMany({
    where: { collection, ...(parentId ? { parentId } : {}) },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { parent: { select: { id: true, slug: true, data: true } }, _count: { select: { children: true } } },
  });
  res.json({ entries });
});

router.get("/entries/:collection/:id", async (req, res) => {
  const { collection, id } = idParams.parse(req.params);
  const entry = await prisma.entry.findFirst({
    where: { id, collection },
    include: { parent: { select: { id: true, slug: true, data: true } } },
  });
  if (!entry) throw new HttpError(404, "Entry not found");
  res.json({ entry });
});

router.post("/entries/:collection", async (req, res) => {
  const collection = collectionSchema.parse(req.params.collection);
  const input = entryInput.parse(req.body);
  const parentId = await assertParent(collection, input.parentId);
  const last = await prisma.entry.findFirst({
    where: { collection, parentId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });
  const entry = await prisma.entry
    .create({
      data: {
        collection,
        slug: input.slug,
        status: input.status,
        data: input.data as Prisma.InputJsonValue,
        seo: toJson(input.seo),
        parentId,
        sortOrder: (last?.sortOrder ?? -1) + 1,
        publishedAt: input.status === "PUBLISHED" ? new Date() : null,
      },
    })
    .catch(slugConflict);
  res.status(201).json({ entry });
});

router.put("/entries/:collection/:id", async (req, res) => {
  const { collection, id } = idParams.parse(req.params);
  const input = entryInput.parse(req.body);
  const existing = await prisma.entry.findFirst({ where: { id, collection } });
  if (!existing) throw new HttpError(404, "Entry not found");
  const parentId = await assertParent(collection, input.parentId ?? existing.parentId);
  const entry = await prisma.entry
    .update({
      where: { id },
      data: {
        slug: input.slug,
        status: input.status,
        data: input.data as Prisma.InputJsonValue,
        seo: toJson(input.seo),
        parentId,
        publishedAt: input.status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt,
      },
    })
    .catch(slugConflict);
  res.json({ entry });
});

router.patch("/entries/:collection/:id/status", async (req, res) => {
  const { collection, id } = idParams.parse(req.params);
  const { status } = z.object({ status: z.enum(["DRAFT", "PUBLISHED"]) }).parse(req.body);
  const existing = await prisma.entry.findFirst({ where: { id, collection } });
  if (!existing) throw new HttpError(404, "Entry not found");
  const entry = await prisma.entry.update({
    where: { id },
    data: { status, publishedAt: status === "PUBLISHED" ? (existing.publishedAt ?? new Date()) : existing.publishedAt },
  });
  res.json({ entry });
});

router.post("/entries/:collection/:id/duplicate", async (req, res) => {
  const { collection, id } = idParams.parse(req.params);
  const source = await prisma.entry.findFirst({ where: { id, collection } });
  if (!source) throw new HttpError(404, "Entry not found");

  let slug = `${source.slug}-copy`;
  for (let i = 2; await prisma.entry.findUnique({ where: { collection_slug: { collection, slug } } }); i++) {
    slug = `${source.slug}-copy-${i}`;
  }
  const data = { ...(source.data as Record<string, unknown>) };
  for (const key of ["title", "name"]) if (typeof data[key] === "string") data[key] = `${data[key]} (copy)`;

  const entry = await prisma.entry.create({
    data: {
      collection,
      slug,
      status: "DRAFT",
      data: data as Prisma.InputJsonValue,
      seo: toJson(source.seo),
      parentId: source.parentId,
      sortOrder: source.sortOrder + 1,
    },
  });
  res.status(201).json({ entry });
});

router.post("/entries/:collection/reorder", async (req, res) => {
  const collection = collectionSchema.parse(req.params.collection);
  const { ids } = z.object({ ids: z.array(z.string()).min(1).max(1000) }).parse(req.body);
  await prisma.$transaction(
    ids.map((id, sortOrder) => prisma.entry.updateMany({ where: { id, collection }, data: { sortOrder } })),
  );
  res.json({ ok: true });
});

router.delete("/entries/:collection/:id", async (req, res) => {
  const { collection, id } = idParams.parse(req.params);
  const { count } = await prisma.entry.deleteMany({ where: { id, collection } });
  if (!count) throw new HttpError(404, "Entry not found");
  res.status(204).end();
});

// ---------- Search (Ctrl+K) ----------

router.get("/search", async (req, res) => {
  const { q } = z.object({ q: z.string().trim().min(1).max(100) }).parse(req.query);
  const pattern = `%${q.replace(/[%_\\]/g, "\\$&")}%`;
  const entries = await prisma.$queryRaw<{ id: string; collection: string; slug: string; data: unknown }[]>`
    SELECT id, collection, slug, data FROM "Entry"
    WHERE slug ILIKE ${pattern} OR data::text ILIKE ${pattern}
    ORDER BY "updatedAt" DESC
    LIMIT 20`;
  res.json({ entries });
});

export default router;
