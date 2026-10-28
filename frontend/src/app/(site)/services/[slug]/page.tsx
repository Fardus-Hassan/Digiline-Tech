import type { Metadata } from "next";
import { SmartImage } from "@/components/ui/smart-image";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, HeartHandshake } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { StaggerList } from "@/components/animations/stagger-list";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/site/page-hero";
import { ServiceCard } from "@/components/site/service-card";
import { CtaCard } from "@/components/site/cta-card";
import { SubServiceCard } from "@/components/site/sub-service-card";
import { JsonLd } from "@/components/seo/json-ld";
import { getSection, getService, getServices, getSiteSettings, getSubServices } from "@/lib/content";
import { absoluteUrl, breadcrumbJsonLd, buildMetadata, SITE_URL } from "@/lib/seo";
import { cn } from "@/lib/utils";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return buildMetadata({
    seo: service.seo,
    title: service.title,
    description: service.description || service.excerpt,
    image: service.image,
    path: `/services/${service.slug}`,
  });
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, services, subServices, page, site] = await Promise.all([
    getService(slug),
    getServices(),
    getSubServices(slug),
    getSection("servicesPage"),
    getSiteSettings(),
  ]);
  if (!service) notFound();

  const { detail, pricing } = page;
  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);
  const fill = (text: string) =>
    text.replaceAll("{count}", String(subServices.length)).replaceAll("{service}", service.shortTitle);

  return (
    <>
      <JsonLd
        data={[
          {
            "@context": "https://schema.org",
            "@type": "Service",
            name: service.title,
            description: service.description || service.excerpt,
            url: absoluteUrl(`/services/${service.slug}`),
            image: absoluteUrl(service.image),
            provider: { "@id": `${SITE_URL}/#organization`, name: site.siteName },
            offers: {
              "@type": "Offer",
              price: service.startingPrice.amount,
              priceCurrency: pricing.currency === "৳" ? "BDT" : pricing.currency,
            },
          },
          breadcrumbJsonLd([
            { name: page.subDetail.breadcrumb, path: "/services" },
            { name: service.title, path: `/services/${service.slug}` },
          ]),
        ]}
      />
      <PageHero
        eyebrow={service.title}
        title={service.heroTitle || service.title}
        description={service.description || service.excerpt}
        aside={
          service.image ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-border shadow-2xl">
              <SmartImage
                src={service.image}
                alt={service.title}
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
        {detail.getStarted && (
          <ButtonLink href="/contact" size="lg" className="mt-8">
            {detail.getStarted} <ArrowRight className="size-4" />
          </ButtonLink>
        )}
      </PageHero>

      {subServices.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <SectionHeading
            eyebrow={fill(detail.subServicesEyebrow)}
            title={fill(detail.subServicesTitle)}
            highlight={fill(detail.subServicesHighlight)}
            description={fill(detail.subServicesDescription)}
          />
          <StaggerList className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {subServices.map((sub, i) => (
              <li key={sub.slug} className="h-full">
                <SubServiceCard serviceSlug={service.slug} subService={sub} index={i} />
              </li>
            ))}
          </StaggerList>
        </section>
      )}

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-24">
        <Reveal className={cn("rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10", service.whyItWorks ? "lg:col-span-3" : "lg:col-span-5")}>
          <h2 className="text-2xl font-bold">{detail.whatWeDo}</h2>
          <ul className="mt-6 space-y-4">
            {service.features.map((feature, i) => (
              <li key={i} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          {detail.getStarted && (
            <ButtonLink href="/contact" size="lg" className="mt-8 w-full sm:w-auto">
              {detail.getStarted} <ArrowRight className="size-4" />
            </ButtonLink>
          )}
        </Reveal>

        {service.whyItWorks && (
        <Reveal
          delay={0.1}
          className="dark relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-foreground sm:p-10 lg:col-span-2"
        >
          <div aria-hidden className="absolute -right-16 -bottom-16 size-48 rounded-full bg-brand-orange/25 blur-3xl" />
          <HeartHandshake className="size-10 text-accent" />
          <h2 className="mt-4 text-2xl font-bold">{detail.whyItWorks}</h2>
          <p className="mt-3 text-muted-foreground">{service.whyItWorks}</p>
        </Reveal>
        )}
      </section>

      {others.length > 0 && (
        <section className="bg-muted/50">
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
            <SectionHeading eyebrow={detail.moreEyebrow} title={detail.moreTitle} highlight={detail.moreHighlight} />
            <StaggerList className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {others.map((s) => (
                <li key={s.slug} className="h-full">
                  <ServiceCard service={s} />
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
