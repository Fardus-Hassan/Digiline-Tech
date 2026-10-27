import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";
import { CaseStudiesFilter } from "@/components/site/case-studies-filter";
import { CtaCard } from "@/components/site/cta-card";
import { caseStudyCategories, getCaseStudies } from "@/lib/content";

export const metadata: Metadata = {
  title: "Case Studies",
  description: "Real brands. Real strategies. Real results.",
};

export default async function CaseStudiesPage() {
  const studies = await getCaseStudies();

  return (
    <>
      <PageHero eyebrow="Our Work" title="Case Studies" description="Real brands. Real strategies. Real results." />
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <CaseStudiesFilter studies={studies} categories={caseStudyCategories} />
      </section>
      <CtaCard />
    </>
  );
}
