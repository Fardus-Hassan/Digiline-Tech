import type { Metadata } from "next";
import { getSection, getSectionSeo } from "@/lib/content";
import { pageSeoDefaults, type SectionData, type SectionKey } from "@/lib/cms/defaults";
import type { Seo } from "@/lib/cms/types";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const absoluteUrl = (path = "/") => (/^https?:\/\//.test(path) ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`);

type MetaInput = {
  seo: Seo;
  title?: string;
  description?: string;
  image?: string;
  path: string;
  type?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
};

/** Builds page metadata, letting the admin's SEO fields override the content-derived defaults. */
export async function buildMetadata({
  seo,
  title,
  description,
  image,
  path,
  type = "website",
  publishedTime,
  modifiedTime,
}: MetaInput): Promise<Metadata> {
  const site = await getSection("seo");
  const finalTitle = seo?.title || title;
  const finalDescription = seo?.description || description || site.description;
  const finalImage = seo?.image || image || site.ogImage;
  const images = finalImage ? [{ url: absoluteUrl(finalImage) }] : undefined;

  return {
    ...(finalTitle ? { title: finalTitle } : {}),
    description: finalDescription,
    ...(seo?.keywords ? { keywords: seo.keywords } : {}),
    alternates: { canonical: absoluteUrl(path) },
    robots: seo?.noindex ? { index: false, follow: true } : undefined,
    openGraph: {
      type,
      url: absoluteUrl(path),
      ...(finalTitle ? { title: finalTitle } : {}),
      description: finalDescription,
      images,
      ...(publishedTime ? { publishedTime } : {}),
      ...(modifiedTime ? { modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      ...(finalTitle ? { title: finalTitle } : {}),
      description: finalDescription,
      images: images?.map((i) => i.url),
    },
  };
}

/** Metadata for a fixed page (home, about, contact...) whose SEO is edited on its page section. */
export async function pageMetadata(key: SectionKey, image?: string): Promise<Metadata> {
  const defaults = pageSeoDefaults[key];
  return buildMetadata({
    seo: await getSectionSeo(key),
    title: defaults?.title,
    description: defaults?.description,
    image,
    path: defaults?.path ?? "/",
  });
}

export function organizationJsonLd(site: SectionData<"settings">, seo: SectionData<"seo">) {
  return {
    "@context": "https://schema.org",
    "@type": seo.organizationType || "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: site.siteName,
    description: site.description,
    url: SITE_URL,
    logo: absoluteUrl(site.logo),
    image: absoluteUrl(seo.ogImage || site.logo),
    ...(site.email ? { email: site.email } : {}),
    ...(site.phone ? { telephone: site.phone } : {}),
    ...(site.location ? { address: { "@type": "PostalAddress", addressLocality: site.location } } : {}),
    sameAs: site.socials.map((s) => s.url).filter(Boolean),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
