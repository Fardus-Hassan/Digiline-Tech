import type { Metadata } from "next";
import { SmartImage } from "@/components/ui/smart-image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { FadeUp } from "@/components/animations/fade-up";
import { CountUp } from "@/components/animations/count-up";
import { PageHero } from "@/components/site/page-hero";
import { CtaCard } from "@/components/site/cta-card";
import { getCaseStudies, getCaseStudy } from "@/lib/content";

export async function generateStaticParams() {
  const studies = await getCaseStudies();
  return studies.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/case-studies/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) return {};
  return { title: study.title, description: study.summary };
}

export default async function CaseStudyPage({ params }: PageProps<"/case-studies/[slug]">) {
  const { slug } = await params;
  const study = await getCaseStudy(slug);
  if (!study) notFound();

  return (
    <>
      <PageHero eyebrow={study.category} title={study.title} description={study.summary}>
        <Link
          href="/case-studies"
          className="mt-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-accent"
        >
          <ArrowLeft className="size-4" /> All case studies
        </Link>
      </PageHero>

      <section className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <FadeUp
          delay={0.3}
          className="relative -mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-border shadow-2xl sm:-mt-16"
        >
          <SmartImage
            src={study.image}
            alt={study.title}
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
          />
        </FadeUp>

        <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-5">
          {study.results.map((r, i) => (
            <Reveal
              key={r.label}
              delay={i * 0.08}
              className="rounded-2xl border border-border bg-card p-4 text-center sm:p-6"
            >
              <p className="text-gradient text-2xl font-bold sm:text-4xl">
                <CountUp value={r.value} />
              </p>
              <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{r.label}</p>
            </Reveal>
          ))}
        </div>

        <div className="grid gap-10 py-16 md:grid-cols-3">
          <div className="space-y-10 md:col-span-2">
            <Reveal>
              <h2 className="text-2xl font-bold">The Challenge</h2>
              <p className="mt-3 text-muted-foreground">{study.challenge}</p>
            </Reveal>
            <Reveal>
              <h2 className="text-2xl font-bold">Our Solution</h2>
              <p className="mt-3 text-muted-foreground">{study.solution}</p>
            </Reveal>
          </div>
          <Reveal className="h-fit rounded-2xl border border-border bg-card p-6">
            <p className="text-sm text-muted-foreground">Client</p>
            <p className="font-semibold">{study.client}</p>
            <p className="mt-5 text-sm text-muted-foreground">Services</p>
            <ul className="mt-2 space-y-2">
              {study.services.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="size-4 text-accent" /> {s}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <CtaCard />
    </>
  );
}
