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
import { getService, getServices } from "@/lib/content";

export async function generateStaticParams() {
  const services = await getServices();
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/services/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const service = await getService(slug);
  if (!service) return {};
  return { title: service.title, description: service.description };
}

export default async function ServiceDetailPage({ params }: PageProps<"/services/[slug]">) {
  const { slug } = await params;
  const [service, services] = await Promise.all([getService(slug), getServices()]);
  if (!service) notFound();

  const others = services.filter((s) => s.slug !== service.slug).slice(0, 3);

  return (
    <>
      <PageHero
        eyebrow={service.title}
        title={service.heroTitle}
        description={service.description}
        aside={
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
        }
      >
        <ButtonLink href="/contact" size="lg" className="mt-8">
          Get Started <ArrowRight className="size-4" />
        </ButtonLink>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-24">
        <Reveal className="rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-10 lg:col-span-3">
          <h2 className="text-2xl font-bold">What We Do</h2>
          <ul className="mt-6 space-y-4">
            {service.features.map((feature) => (
              <li key={feature} className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-accent" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
          <ButtonLink href="/contact" size="lg" className="mt-8 w-full sm:w-auto">
            Get Started <ArrowRight className="size-4" />
          </ButtonLink>
        </Reveal>

        <Reveal
          delay={0.1}
          className="dark relative overflow-hidden rounded-3xl border border-border bg-card p-6 text-foreground sm:p-10 lg:col-span-2"
        >
          <div aria-hidden className="absolute -right-16 -bottom-16 size-48 rounded-full bg-brand-orange/25 blur-3xl" />
          <HeartHandshake className="size-10 text-accent" />
          <h2 className="mt-4 text-2xl font-bold">Why It Works</h2>
          <p className="mt-3 text-muted-foreground">{service.whyItWorks}</p>
        </Reveal>
      </section>

      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
          <SectionHeading eyebrow="More Services" title="Explore Other" highlight="Solutions" />
          <StaggerList className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {others.map((s) => (
              <li key={s.slug} className="h-full">
                <ServiceCard service={s} />
              </li>
            ))}
          </StaggerList>
        </div>
      </section>

      <CtaCard />
    </>
  );
}
