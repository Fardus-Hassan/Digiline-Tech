import { PageHero } from "@/components/site/page-hero";
import { CaseStudiesFilter } from "@/components/site/case-studies-filter";
import { CtaCard } from "@/components/site/cta-card";
import { getCaseStudies, getSection } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("caseStudiesPage");
}

export default async function CaseStudiesPage() {
  const [page, studies] = await Promise.all([getSection("caseStudiesPage"), getCaseStudies()]);

  return (
    <>
      <PageHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        highlight={page.hero.highlight}
        description={page.hero.description}
      />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <CaseStudiesFilter
          studies={studies}
          categories={page.categories}
          allLabel={page.allLabel}
          emptyText={page.emptyText}
        />
      </section>
      <CtaCard />
    </>
  );
}
