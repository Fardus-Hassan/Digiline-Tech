// Website content, loaded from the CMS API and cached until the admin panel publishes a change.
import { cacheLife, cacheTag } from "next/cache";
import { mergeContent, sectionDefaults, type SectionData, type SectionKey } from "@/lib/cms/defaults";
import type { CollectionData, CollectionKey, Entry, Seo } from "@/lib/cms/types";

export type * from "@/lib/cms/types";
export type { SocialPlatform, Stat } from "@/lib/cms/defaults";

const API_URL = process.env.API_URL ?? "http://localhost:5000";

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}/api${path}`);
  if (!res.ok) throw new Error(`CMS request failed: ${res.status} ${path}`);
  return res.json();
}

type RawEntry = {
  id: string;
  slug: string;
  data: Record<string, unknown>;
  seo: Seo;
  updatedAt: string;
  publishedAt: string | null;
  parent: { slug: string } | null;
};

async function getAllSections() {
  "use cache";
  cacheLife("days");
  cacheTag("sections");
  const { sections } = await getJson<{ sections: Record<string, { data: unknown; seo: Seo }> }>("/content/sections");
  return sections;
}

async function getCollection<K extends CollectionKey>(collection: K): Promise<Entry<CollectionData[K]>[]> {
  "use cache";
  cacheLife("days");
  cacheTag(`entries:${collection}`);
  const { entries } = await getJson<{ entries: RawEntry[] }>(`/content/entries/${collection}`);
  return entries.map(({ data, parent, ...meta }) => ({
    ...(data as CollectionData[K]),
    ...meta,
    ...(parent ? { parentSlug: parent.slug } : {}),
  }));
}

export async function getSection<K extends SectionKey>(key: K): Promise<SectionData<K>> {
  const sections = await getAllSections();
  return mergeContent(sectionDefaults[key], sections[key]?.data);
}

export async function getSectionSeo(key: SectionKey): Promise<Seo> {
  const sections = await getAllSections();
  return sections[key]?.seo ?? null;
}

export const getSiteSettings = () => getSection("settings");

export const getServices = () => getCollection("services");

export async function getService(slug: string) {
  return (await getServices()).find((s) => s.slug === slug) ?? null;
}

export async function getSubServices(serviceSlug: string) {
  return (await getCollection("subServices")).filter((s) => s.parentSlug === serviceSlug);
}

export async function getSubService(serviceSlug: string, slug: string) {
  return (await getSubServices(serviceSlug)).find((s) => s.slug === slug) ?? null;
}

export const getCaseStudies = () => getCollection("caseStudies");

export async function getCaseStudy(slug: string) {
  return (await getCaseStudies()).find((c) => c.slug === slug) ?? null;
}

export async function getPosts() {
  const posts = await getCollection("posts");
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string) {
  return (await getPosts()).find((p) => p.slug === slug) ?? null;
}

export const getTestimonials = () => getCollection("testimonials");
export const getBrands = () => getCollection("brands");
export const getValues = () => getCollection("values");
