import type { MetadataRoute } from "next";
import { getCaseStudies, getPosts, getSectionSeo, getServices, getSubServices } from "@/lib/content";
import { pageSeoDefaults, type SectionKey } from "@/lib/cms/defaults";
import { absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [services, studies, posts] = await Promise.all([getServices(), getCaseStudies(), getPosts()]);
  const subServices = (await Promise.all(services.map((s) => getSubServices(s.slug)))).flat();

  const pages = await Promise.all(
    (Object.entries(pageSeoDefaults) as [SectionKey, { path: string }][]).map(async ([key, { path }]) => ({
      path,
      noindex: (await getSectionSeo(key))?.noindex,
    })),
  );

  const entry = (path: string, lastModified?: string, priority = 0.7): MetadataRoute.Sitemap[number] => ({
    url: absoluteUrl(path),
    ...(lastModified ? { lastModified } : {}),
    priority,
  });

  return [
    ...pages.filter((p) => !p.noindex).map((p) => entry(p.path, undefined, p.path === "/" ? 1 : 0.8)),
    ...services.filter((s) => !s.seo?.noindex).map((s) => entry(`/services/${s.slug}`, s.updatedAt, 0.9)),
    ...subServices
      .filter((s) => !s.seo?.noindex)
      .map((s) => entry(`/services/${s.parentSlug}/${s.slug}`, s.updatedAt, 0.8)),
    ...studies.filter((s) => !s.seo?.noindex).map((s) => entry(`/case-studies/${s.slug}`, s.updatedAt)),
    ...posts.filter((p) => !p.seo?.noindex).map((p) => entry(`/blog/${p.slug}`, p.updatedAt)),
  ];
}
