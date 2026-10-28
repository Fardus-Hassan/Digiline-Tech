import { StaggerList } from "@/components/animations/stagger-list";
import { PageHero } from "@/components/site/page-hero";
import { BlogCard } from "@/components/site/blog-card";
import { CtaCard } from "@/components/site/cta-card";
import { getPosts, getSection } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("blogPage");
}

export default async function BlogPage() {
  const [page, posts] = await Promise.all([getSection("blogPage"), getPosts()]);

  return (
    <>
      <PageHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        highlight={page.hero.highlight}
        description={page.hero.description}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <StaggerList className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <li key={post.slug} className="h-full">
              <BlogCard post={post} readMoreLabel={page.readMoreLabel} />
            </li>
          ))}
        </StaggerList>
      </section>
      <CtaCard />
    </>
  );
}
