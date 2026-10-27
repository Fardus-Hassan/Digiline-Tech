import type { Metadata } from "next";
import { StoryVideo } from "@/components/ui/story-video";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { FadeUp } from "@/components/animations/fade-up";
import { CountUp } from "@/components/animations/count-up";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/site/page-hero";
import { DynamicIcon } from "@/components/site/icon-map";
import { CtaCard } from "@/components/site/cta-card";
import { getSiteSettings, getValues } from "@/lib/content";

export const metadata: Metadata = {
  title: "About Us",
  description: "Meet Digiline Tech ? a team of digital experts helping brands grow.",
};

export default async function AboutPage() {
  const [site, values] = await Promise.all([getSiteSettings(), getValues()]);

  return (
    <>
      <PageHero
        eyebrow="About Us"
        title={site.about.title}
        highlight={site.about.titleHighlight}
        description={site.about.description}
      >
        <div className="mt-8 grid max-w-lg grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/60 backdrop-blur">
          {site.aboutStats.map((stat) => (
            <div key={stat.label} className="flex flex-col items-center gap-1 p-4 text-center">
              <DynamicIcon name={stat.icon} className="size-5 text-accent" />
              <p className="text-2xl font-bold sm:text-3xl">
                <CountUp value={stat.value} />
              </p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeUp
          delay={0.3}
          className="relative -mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-border shadow-2xl sm:-mt-16 lg:aspect-[21/9]"
        >
          <StoryVideo label="The Digiline Tech team at work" className="absolute inset-0" />
        </FadeUp>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow="What drives us"
          title="Our Values"
          description="The principles that guide everything we do."
        />
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {values.map((value, i) => (
            <Reveal
              as="li"
              key={value.title}
              delay={i * 0.06}
              className="group rounded-2xl border border-border bg-card p-5 transition-all hover:-translate-y-1 hover:border-accent/60 sm:p-7"
            >
              <span className="inline-flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white">
                <DynamicIcon name={value.icon} className="size-5" />
              </span>
              <h3 className="mt-4 font-semibold sm:text-lg">{value.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
            </Reveal>
          ))}
        </ul>

        <Reveal className="dark relative mt-10 overflow-hidden rounded-3xl border border-border bg-card p-8 text-foreground sm:p-12">
          <div aria-hidden className="absolute -right-10 -bottom-20 size-64 rounded-full bg-brand-orange/25 blur-3xl" />
          <Quote className="size-10 fill-accent text-accent" />
          <blockquote className="mt-4 text-2xl leading-snug font-bold sm:text-4xl">
            {site.about.quote.split(" ").slice(0, 2).join(" ")}
            <br />
            <span className="text-gradient">{site.about.quote.split(" ").slice(2).join(" ")}</span>
          </blockquote>
          <p className="mt-4 text-sm text-muted-foreground">? Digiline Tech</p>
        </Reveal>
      </section>

      <CtaCard />
    </>
  );
}
