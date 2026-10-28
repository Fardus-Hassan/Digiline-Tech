import type { Metadata } from "next";
import { SmartImage } from "@/components/ui/smart-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { FadeUp } from "@/components/animations/fade-up";
import { PageHero } from "@/components/site/page-hero";
import { CtaCard } from "@/components/site/cta-card";
import { Markdown } from "@/components/ui/markdown";
import { JsonLd } from "@/components/seo/json-ld";
import { getPost, getPosts, getSection, getSiteSettings } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, SITE_URL } from "@/lib/seo";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return buildMetadata({
    seo: post.seo,
    title: post.title,
    description: post.excerpt,
    image: post.image,
    path: `/blog/${post.slug}`,
    type: "article",
    publishedTime: post.date,
    modifiedTime: post.updatedAt,
  });
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const [post, page, site] = await Promise.all([getPost(slug), getSection("blogPage"), getSiteSettings()]);
  if (!post) notFound();

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.image ? absoluteUrl(post.image) : undefined,
            datePublished: post.date,
            dateModified: post.updatedAt,
            url: absoluteUrl(`/blog/${post.slug}`),
            mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
            author: { "@type": "Organization", name: site.siteName, url: SITE_URL },
            publisher: { "@id": `${SITE_URL}/#organization` },
          },
          breadcrumbJsonLd([
            { name: page.hero.eyebrow || "Blog", path: "/blog" },
            { name: post.title, path: `/blog/${post.slug}` },
          ]),
        ]}
      />
      <PageHero eyebrow={post.category} title={post.title}>
        <p className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
          {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
          {post.readTime && (
            <span className="flex items-center gap-1">
              <Clock className="size-4" /> {post.readTime}
            </span>
          )}
        </p>
      </PageHero>

      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        {post.image && (
          <FadeUp
            delay={0.3}
            className="relative -mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-border shadow-2xl sm:-mt-16"
          >
            <SmartImage
              src={post.image}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              className="object-cover"
            />
          </FadeUp>
        )}
        <div className="py-12 text-lg text-muted-foreground">
          <p className="mb-5 text-xl font-medium text-foreground">{post.excerpt}</p>
          <Markdown>{post.content}</Markdown>
        </div>
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium hover:text-accent">
          <ArrowLeft className="size-4" /> {page.backLabel}
        </Link>
      </article>

      <CtaCard />
    </>
  );
}
