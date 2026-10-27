import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { StaggerList } from "@/components/animations/stagger-list";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/site/page-hero";
import { ServiceCard } from "@/components/site/service-card";
import { VideoCard } from "@/components/site/video-card";
import { CtaCard } from "@/components/site/cta-card";
import { getServices } from "@/lib/content";

export const metadata: Metadata = {
  title: "Services",
  description: "Social media marketing, paid ads, SEO, websites, growth consulting and IT solutions.",
};

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Full-Service Digital"
        highlight="Growth Solutions"
        description="From strategy to execution, we provide end-to-end digital marketing and tech services to help your brand grow faster, smarter and stronger."
      >
        <ButtonLink href="#all-services" variant="ghost" className="mt-6 px-0">
          Explore All Services <ArrowRight className="size-4" />
        </ButtonLink>
      </PageHero>

      <section id="all-services" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <StaggerList className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug} className="h-full">
              <ServiceCard service={service} />
            </li>
          ))}
        </StaggerList>
        <Reveal className="mt-8">
          <VideoCard />
        </Reveal>
      </section>

      <CtaCard />
    </>
  );
}
