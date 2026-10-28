import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { SmartImage } from "@/components/ui/smart-image";
import { Reveal } from "@/components/animations/reveal";
import { StaggerList } from "@/components/animations/stagger-list";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/site/page-hero";
import { StartingPrice } from "@/components/site/service-card";
import { SubServiceCard } from "@/components/site/sub-service-card";
import { CtaCard } from "@/components/site/cta-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getSection, getService, getServices, getSubService, getSubServices } from "@/lib/content";
import { breadcrumbJsonLd, buildMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const services = await getServices();
  const params = await Promise.all(
    services.map(async (service) =>
      (await getSubServices(service.slug)).map((sub) => ({ slug: service.slug, sub: sub.slug })),
    ),
  );
  return params.flat();
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]/[sub]">): Promise<Metadata> {
  const { slug, sub } = await params;
  const [service, subService] = await Promise.all([getService(slug), getSubService(slug, sub)]);
  if (!service || !subService) return {};
  return buildMetadata({
    seo: subService.seo,
    title: subService.title,
    description: subService.description || subService.excerpt,
    image: subService.image || service.image,
    path: `/services/${slug}/${sub}`,
  });
}

export default async function SubServicePage({ params }: PageProps<"/services/[slug]/[sub]">) {
  const { slug, sub } = await params;
  const [service, subService, siblings, page] = await Promise.all([
    getService(slug),
    getSubService(slug, sub),
    getSubServices(slug),
    getSection("servicesPage"),
  ]);
  if (!service || !subService) notFound();

  const { detail, subDetail } = page;
  const others = siblings.filter((s) => s.slug !== subService.slug);
  const image = subService.image || service.image;
  const hasDeliverables = subService.deliverables?.length > 0;

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: subDetail.breadcrumb, path: "/services" },
          { name: service.shortTitle, path: `/services/${service.slug}` },
          { name: subService.title, path: `/services/${service.slug}/${subService.slug}` },
        ])}
      />
      <PageHero
        eyebrow={service.title}
        title={subService.title}
        description={subService.description || subService.excerpt}
        aside={
          image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border shadow-2xl">
              <SmartImage
                src={image}
                alt={subService.title}
                fill
                preload
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-brand-navy/60 to-transparent" />
            </div>
          ) : undefined
        }
      >
        <nav aria-label="Breadcrumb" className="mt-6 flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/services" className="hover:text-accent">
            {subDetail.breadcrumb}
          </Link>
          <ChevronRight className="size-3.5" />
          <Link href={`/services/${service.slug}`} className="hover:text-accent">
            {service.shortTitle}
          </Link>
          <ChevronRight className="size-3.5" />
          <span className="text-foreground">{subService.title}</span>
        </nav>
        {detail.getStarted && (
          <ButtonLink href="/contact" size="lg" className="mt-8">
            {detail.getStarted} <ArrowRight className="size-4" />
          </ButtonLink>
        )}
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-24">
        {hasDeliverables && (
        <Reveal className="rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10 lg:col-span-3">
          <h2 className="text-2xl font-bold">{subDetail.included}</h2>
          <ul className="mt-6 space-y-4">
            {subService.deliverables.map((item, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        )}

        <Reveal
          delay={0.1}
          className={cn(
            "dark relative flex flex-col overflow-hidden rounded-3xl border border-border bg-card p-6 text-foreground sm:p-10",
            hasDeliverables ? "lg:col-span-2" : "lg:col-span-5",
          )}
        >
          <div aria-hidden className="absolute -right-16 -bottom-16 size-48 rounded-full bg-brand-orange/25 blur-3xl" />
          <h2 className="text-2xl font-bold">{subDetail.pricing}</h2>
          <StartingPrice price={subService.startingPrice} size="lg" className="mt-5" />
          {subService.turnaround && (
            <p className="mt-5 inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="size-4 text-accent" />
              {subService.turnaround}
            </p>
          )}
          <p className="mt-3 text-sm text-muted-foreground">{subDetail.pricingNote}</p>
          {subDetail.quoteButton && (
            <ButtonLink href="/contact" size="lg" className="relative mt-8 w-full">
              {subDetail.quoteButton} <ArrowRight className="size-4" />
            </ButtonLink>
          )}
        </Reveal>
      </section>

      {others.length > 0 && (
        <section className="bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <SectionHeading eyebrow={service.title} title={subDetail.othersTitle} highlight={service.shortTitle} />
              <Link
                href={`/services/${service.slug}`}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:underline"
              >
                <ArrowLeft className="size-4" /> {subDetail.backTo} {service.shortTitle}
              </Link>
            </div>
            <StaggerList className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {others.map((s) => (
                <li key={s.slug} className="h-full">
                  <SubServiceCard serviceSlug={service.slug} subService={s} index={siblings.indexOf(s)} />
                </li>
              ))}
            </StaggerList>
          </div>
        </section>
      )}

      <CtaCard />
    </>
  );
}
