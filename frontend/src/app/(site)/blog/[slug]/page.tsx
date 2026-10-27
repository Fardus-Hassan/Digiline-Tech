import type { Metadata } from "next";
import { SmartImage } from "@/components/ui/smart-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock } from "lucide-react";
import { FadeUp } from "@/components/animations/fade-up";
import { PageHero } from "@/components/site/page-hero";
import { CtaCard } from "@/components/site/cta-card";
import { getPost, getPosts } from "@/lib/content";
import { formatDate } from "@/lib/format";

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return {};
  return { title: post.title, description: post.excerpt };
}

export default async function BlogPostPage({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <PageHero eyebrow={post.category} title={post.title}>
        <p className="mt-5 flex items-center gap-4 text-sm text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span className="flex items-center gap-1">
            <Clock className="size-4" /> {post.readTime}
          </span>
        </p>
      </PageHero>

      <article className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
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
        <div className="space-y-5 py-12 text-lg leading-relaxed text-muted-foreground">
          <p className="text-xl font-medium text-foreground">{post.excerpt}</p>
          {post.content.map((paragraph, i) => (
            <p key={i}>{paragraph}</p>
          ))}
        </div>
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm font-medium hover:text-accent">
          <ArrowLeft className="size-4" /> Back to blog
        </Link>
      </article>

      <CtaCard />
    </>
  );
}
