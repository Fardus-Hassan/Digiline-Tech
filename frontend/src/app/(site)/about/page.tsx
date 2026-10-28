import { StoryVideo } from "@/components/ui/story-video";
import { Quote } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { FadeUp } from "@/components/animations/fade-up";
import { CountUp } from "@/components/animations/count-up";
import { SectionHeading } from "@/components/ui/section-heading";
import { PageHero } from "@/components/site/page-hero";
import { DynamicIcon } from "@/components/site/icon-map";
import { CtaCard } from "@/components/site/cta-card";
import { getSection, getSiteSettings, getValues } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("about");
}

export default async function AboutPage() {
  const [site, about, values] = await Promise.all([getSiteSettings(), getSection("about"), getValues()]);
  const video = site.storyVideo;

  return (
    <>
      <PageHero
        eyebrow={about.hero.eyebrow}
        title={about.hero.title}
        highlight={about.hero.highlight}
        description={about.hero.description}
      >
        {about.stats.length > 0 && (
          <div className="mt-8 grid max-w-lg grid-cols-3 divide-x divide-border rounded-2xl border border-border bg-card/60 backdrop-blur">
            {about.stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 p-4 text-center">
                <DynamicIcon name={stat.icon} className="size-5 text-accent" />
                <p className="text-2xl font-bold sm:text-3xl">
                  <CountUp value={stat.value} />
                </p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        )}
      </PageHero>

      {video.src && (
        <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeUp
            delay={0.3}
            className="relative -mt-12 aspect-[16/9] overflow-hidden rounded-3xl border border-border shadow-2xl sm:-mt-16 lg:aspect-[21/9]"
          >
            <StoryVideo src={video.src} poster={video.poster} label={video.label} className="absolute inset-0" />
          </FadeUp>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <SectionHeading
          eyebrow={about.values.eyebrow}
          title={about.values.title}
          highlight={about.values.highlight}
          description={about.values.description}
        />
        <ul className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {values.map((value, i) => (
            <Reveal
              as="li"
              key={value.slug}
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

        {(about.quote.start || about.quote.highlight) && (
          <Reveal className="dark relative mt-10 overflow-hidden rounded-3xl border border-border bg-card p-8 text-foreground sm:p-12">
            <div aria-hidden className="absolute -right-10 -bottom-20 size-64 rounded-full bg-brand-orange/25 blur-3xl" />
            <Quote className="size-10 fill-accent text-accent" />
            <blockquote className="mt-4 text-2xl leading-snug font-bold sm:text-4xl">
              {about.quote.start}
              <br />
              <span className="text-gradient">{about.quote.highlight}</span>
            </blockquote>
            {about.quote.author && <p className="mt-4 text-sm text-muted-foreground">{about.quote.author}</p>}
          </Reveal>
        )}
      </section>

      <CtaCard />
    </>
  );
}
