import { Router } from "express";
import { z } from "zod";
import { prisma } from "../../lib/prisma.js";
import { HttpError } from "../../lib/http-error.js";
import { collectionSchema, sectionKeySchema } from "./collections.js";

/** Public, read-only content API used by the website. Only published entries are exposed. */
const router = Router();

const publicEntry = {
  id: true,
  slug: true,
  sortOrder: true,
  data: true,
  seo: true,
  publishedAt: true,
  updatedAt: true,
  parent: { select: { slug: true } },
} as const;

router.get("/sections", async (_req, res) => {
  const sections = await prisma.section.findMany();
  res.json({ sections: Object.fromEntries(sections.map((s) => [s.key, { data: s.data, seo: s.seo }])) });
});

router.get("/sections/:key", async (req, res) => {
  const key = sectionKeySchema.parse(req.params.key);
  const section = await prisma.section.findUnique({ where: { key } });
  if (!section) throw new HttpError(404, "Section not found");
  res.json({ data: section.data, seo: section.seo });
});

router.get("/entries/:collection", async (req, res) => {
  const collection = collectionSchema.parse(req.params.collection);
  const { parent } = z.object({ parent: z.string().optional() }).parse(req.query);
  const entries = await prisma.entry.findMany({
    where: {
      collection,
      status: "PUBLISHED",
      ...(parent ? { parent: { slug: parent, status: "PUBLISHED" } } : {}),
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: publicEntry,
  });
  res.json({ entries });
});

router.get("/entries/:collection/:slug", async (req, res) => {
  const collection = collectionSchema.parse(req.params.collection);
  const slug = z.string().min(1).parse(req.params.slug);
  const entry = await prisma.entry.findFirst({
    where: { collection, slug, status: "PUBLISHED" },
    select: publicEntry,
  });
  if (!entry) throw new HttpError(404, "Not found");
  res.json({ entry });
});

export default router;
