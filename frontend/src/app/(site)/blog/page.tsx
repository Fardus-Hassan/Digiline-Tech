import type { Metadata } from "next";
import { StaggerList } from "@/components/animations/stagger-list";
import { PageHero } from "@/components/site/page-hero";
import { BlogCard } from "@/components/site/blog-card";
import { CtaCard } from "@/components/site/cta-card";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = {
  title: "Blog",
  description: "Tips, guides and insights on digital marketing, web and technology.",
};

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Insights &"
        highlight="Resources"
        description="Practical tips and guides on marketing, websites and technology to help your business grow."
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <StaggerList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} className="h-full">
              <BlogCard post={post} />
            </li>
          ))}
        </StaggerList>
      </section>
      <CtaCard />
    </>
  );
}
