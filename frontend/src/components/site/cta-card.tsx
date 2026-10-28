import { ArrowRight } from "lucide-react";
import { ScrubScale } from "@/components/animations/scrub-scale";
import { ButtonLink } from "@/components/ui/button";
import { Swoosh } from "@/components/decor/swoosh";
import { DynamicIcon } from "@/components/site/icon-map";
import { getSection } from "@/lib/content";

export async function CtaCard() {
  const cta = await getSection("cta");

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <ScrubScale className="dark relative overflow-hidden rounded-3xl border border-border bg-card px-6 py-12 text-center text-foreground sm:px-12 sm:py-16">
        <div aria-hidden className="absolute -top-20 -left-16 size-56 rounded-full bg-brand-orange/25 blur-3xl" />
        <div aria-hidden className="absolute -right-16 -bottom-24 size-64 rounded-full bg-brand-blue/30 blur-3xl" />
        <Swoosh className="opacity-70" flip />
        <div className="relative">
          <span
            data-gsap-fade
            className="mx-auto mb-5 inline-flex size-12 items-center justify-center rounded-2xl bg-accent/15 text-accent"
          >
            <DynamicIcon name={cta.icon} className="size-6" />
          </span>
          <h2 data-gsap-fade className="text-2xl font-bold tracking-tight sm:text-4xl">
            {cta.title}
          </h2>
          <p data-gsap-fade className="mx-auto mt-3 max-w-md text-muted-foreground">
            {cta.description}
          </p>
          {cta.buttonLabel && (
            <div data-gsap-fade className="mt-8">
              <ButtonLink href={cta.buttonHref} size="lg">
                {cta.buttonLabel} <ArrowRight className="size-4" />
              </ButtonLink>
            </div>
          )}
        </div>
      </ScrubScale>
    </section>
  );
}
