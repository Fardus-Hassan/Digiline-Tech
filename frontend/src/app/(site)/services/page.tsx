import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { StaggerList } from "@/components/animations/stagger-list";
import { ButtonLink } from "@/components/ui/button";
import { PageHero } from "@/components/site/page-hero";
import { ServiceCard } from "@/components/site/service-card";
import { VideoCard } from "@/components/site/video-card";
import { CtaCard } from "@/components/site/cta-card";
import { getSection, getServices, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("servicesPage");
}

export default async function ServicesPage() {
  const [site, page, services] = await Promise.all([getSiteSettings(), getSection("servicesPage"), getServices()]);

  return (
    <>
      <PageHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        highlight={page.hero.highlight}
        description={page.hero.description}
      >
        {page.hero.buttonLabel && (
          <ButtonLink href="#all-services" variant="ghost" className="mt-6 px-0">
            {page.hero.buttonLabel} <ArrowRight className="size-4" />
          </ButtonLink>
        )}
      </PageHero>

      <section id="all-services" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <StaggerList className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug} className="h-full">
              <ServiceCard service={service} />
            </li>
          ))}
        </StaggerList>
        {site.storyVideo.src && (
          <Reveal className="mt-8">
            <VideoCard video={site.storyVideo} />
          </Reveal>
        )}
      </section>

      <CtaCard />
    </>
  );
}
