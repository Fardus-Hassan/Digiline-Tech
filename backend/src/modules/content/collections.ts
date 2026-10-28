import { z } from "zod";

/** Collections the CMS manages. Field definitions live in the frontend schema registry. */
export const COLLECTIONS = ["services", "subServices", "caseStudies", "posts", "testimonials", "brands", "values"] as const;

export type Collection = (typeof COLLECTIONS)[number];

/** Collections whose entries belong to a parent entry (sub-services live under a service). */
export const CHILD_COLLECTIONS: Partial<Record<Collection, Collection>> = { subServices: "services" };

export const collectionSchema = z.enum(COLLECTIONS, "Unknown collection");

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1, "URL slug is required")
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use only lowercase letters, numbers and dashes");

export const sectionKeySchema = z.string().regex(/^[a-zA-Z][a-zA-Z0-9-]{1,50}$/, "Invalid section key");

export const jsonObject = z.record(z.string(), z.unknown());

export const seoSchema = z
  .object({
    title: z.string().max(200).optional(),
    description: z.string().max(500).optional(),
    image: z.string().max(500).optional(),
    keywords: z.string().max(500).optional(),
    noindex: z.boolean().optional(),
  })
  .nullable()
  .optional();
