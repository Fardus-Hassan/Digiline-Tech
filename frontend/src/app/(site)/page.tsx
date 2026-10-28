import { SmartImage } from "@/components/ui/smart-image";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { FadeUp } from "@/components/animations/fade-up";
import { CountUp } from "@/components/animations/count-up";
import { Swoosh } from "@/components/decor/swoosh";
import { LogoMark } from "@/components/logo";
import { ButtonLink } from "@/components/ui/button";
import { Eyebrow, SectionHeading } from "@/components/ui/section-heading";
import { DynamicIcon } from "@/components/site/icon-map";
import { ScrollDown } from "@/components/site/scroll-down";
import { HeroScroll } from "@/components/site/hero-scroll";
import { Marquee } from "@/components/site/marquee";
import { StaggerList } from "@/components/animations/stagger-list";
import { RevealImage } from "@/components/animations/reveal-image";
import { ScrollText } from "@/components/animations/scroll-text";
import { ServiceCard } from "@/components/site/service-card";
import { CaseStudyCard } from "@/components/site/case-study-card";
import { VideoCard } from "@/components/site/video-card";
import { CtaCard } from "@/components/site/cta-card";
import { BlogCard } from "@/components/site/blog-card";
import { BrandMarquee } from "@/components/site/brand-marquee";
import { Testimonials } from "@/components/site/testimonials";
import {
  getBrands,
  getCaseStudies,
  getPosts,
  getSection,
  getServices,
  getSiteSettings,
  getTestimonials,
  getValues,
} from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("home");
}

export default async function HomePage() {
  const [site, home, blogPage, services, studies, values, posts, brands, testimonials] = await Promise.all([
    getSiteSettings(),
    getSection("home"),
    getSection("blogPage"),
    getServices(),
    getCaseStudies(),
    getValues(),
    getPosts(),
    getBrands(),
    getTestimonials(),
  ]);
  const { hero, about } = home;

  return (
    <>
      {/* Hero */}
      <HeroScroll className="dark relative overflow-hidden bg-background text-foreground">
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <div className="hero-glow-a absolute -top-40 -left-32 size-[36rem] rounded-full bg-brand-blue/25 blur-3xl" />
          <div className="hero-glow-b absolute right-0 bottom-0 size-[28rem] rounded-full bg-brand-orange/15 blur-3xl" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_75%)] bg-[size:64px_64px]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-24 sm:px-6 sm:pt-36 lg:grid-cols-2 lg:gap-16 lg:px-8 lg:pb-40">
          <div className="hero-content">
            <FadeUp>
              <Eyebrow className="mb-3 text-[0.68rem] text-foreground/85 sm:mb-4 sm:text-xs">
                {hero.eyebrow}
              </Eyebrow>
            </FadeUp>
            <FadeUp delay={0.1}>
              <h1 className="text-[2.75rem] leading-[1.08] font-bold tracking-tight sm:text-6xl lg:text-7xl">
                {hero.titleStart} <span className="text-gradient">{hero.titleHighlight}</span>
              </h1>
            </FadeUp>
            <FadeUp delay={0.2}>
              <p className="mt-5 max-w-xl text-[0.95rem] leading-relaxed text-foreground/80 sm:mt-6 sm:text-lg sm:text-muted-foreground">
                {hero.description}
              </p>
            </FadeUp>
            <FadeUp delay={0.3} className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:flex sm:flex-wrap">
              {hero.primaryButton.label && (
                <ButtonLink
                  href={hero.primaryButton.href}
                  className="px-2 text-[0.8rem] whitespace-nowrap sm:h-12 sm:px-6 sm:text-base"
                >
                  {hero.primaryButton.label} <ArrowRight className="size-4" />
                </ButtonLink>
              )}
              {hero.secondaryButton.label && (
                <ButtonLink
                  href={hero.secondaryButton.href}
                  variant="outline"
                  className="px-2 text-[0.8rem] whitespace-nowrap sm:h-12 sm:px-6 sm:text-base"
                >
                  {hero.secondaryButton.label}
                </ButtonLink>
              )}
            </FadeUp>
            <FadeUp delay={0.4}>
              <div className="mt-8 grid grid-cols-3 divide-x divide-border sm:mt-10 sm:max-w-lg sm:gap-4 sm:divide-x-0">
                {hero.stats.map((stat, i) => (
                  <div
                    key={i}
                    className="flex flex-col items-center gap-1 px-1 text-center sm:flex-row sm:items-start sm:gap-2 sm:px-0 sm:text-left"
                  >
                    <div className="flex items-center gap-1.5 sm:contents">
                      <DynamicIcon name={stat.icon} className="size-5 shrink-0 text-accent sm:mt-1" />
                      <p className="text-xl font-bold sm:hidden">
                        <CountUp value={stat.value} />
                      </p>
                    </div>
                    <div>
                      <p className="hidden text-3xl font-bold sm:block">
                        <CountUp value={stat.value} />
                      </p>
                      <p className="text-[0.7rem] leading-tight text-muted-foreground sm:text-sm">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </FadeUp>
          </div>

          <FadeUp delay={0.3} className="hero-media relative -mx-4 sm:-mx-6 lg:mx-0">
            <div className="hero-media-frame relative aspect-[4/3.4] overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_70%,transparent)] sm:aspect-[16/10] lg:aspect-[4/3] lg:rounded-3xl lg:border lg:border-border lg:[mask-image:none] lg:shadow-2xl lg:shadow-brand-blue/20">
              <div className="hero-img absolute inset-0">
                <SmartImage
                  src={hero.image}
                  alt={hero.imageAlt}
                  fill
                  preload
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-brand-navy/40 via-transparent to-brand-navy/60 lg:hidden" />
              <div className="absolute inset-0 hidden bg-gradient-to-tr from-brand-navy/70 via-transparent to-brand-orange/20 lg:block" />
            </div>
            <div
              aria-hidden
              className="hero-swoosh-alt pointer-events-none absolute -top-6 -left-[10%] h-24 w-[90%] -rotate-6 rounded-[100%] bg-gradient-to-r from-brand-orange-deep/0 via-brand-orange-deep/45 to-brand-orange/0 blur-2xl lg:hidden"
            />
            <div className="hero-float absolute -bottom-6 -left-6 hidden items-center gap-3 rounded-2xl border border-border bg-card/90 p-4 pr-5 shadow-xl backdrop-blur lg:flex">
              <span className="flex size-10 items-center justify-center rounded-xl bg-accent-gradient text-white">
                <DynamicIcon name={hero.badge.icon} className="size-5" />
              </span>
              <div>
                <p className="text-lg font-bold">{hero.badge.value}</p>
                <p className="text-xs text-muted-foreground">{hero.badge.label}</p>
              </div>
            </div>
            <div className="hero-float absolute -top-5 -right-5 hidden rounded-2xl border border-border bg-card/90 p-3 shadow-xl backdrop-blur lg:block">
              <LogoMark brand={site} className="h-8" />
            </div>
          </FadeUp>
        </div>

        <Swoosh className="hero-swoosh -inset-x-[10%] h-36 w-[120%] sm:h-32" />
        <div className="hero-scroll-down relative z-10 -mt-6 flex justify-center pb-8 lg:absolute lg:inset-x-0 lg:bottom-8 lg:mt-0 lg:pb-0">
          <ScrollDown />
        </div>
      </HeroScroll>

      {brands.length > 0 && (
        <BrandMarquee
          brands={brands.map((brand) => ({ ...brand, iconNode: <DynamicIcon name={brand.icon} /> }))}
          label={home.brands.label}
        />
      )}

      {/* Services */}
      <section id="services" className="mx-auto max-w-7xl scroll-mt-24 px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow={home.services.eyebrow}
            title={home.services.title}
            highlight={home.services.highlight}
            description={home.services.description}
          />
          {home.services.linkLabel && (
            <Reveal>
              <Link href="/services" className="inline-flex items-center gap-2 font-semibold hover:text-accent">
                {home.services.linkLabel} <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          )}
        </div>
        <StaggerList className="mt-10 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
          {services.map((service) => (
            <li key={service.slug} className="h-full">
              <ServiceCard service={service} />
            </li>
          ))}
        </StaggerList>
        <Reveal className="mt-8">
          <VideoCard video={site.storyVideo} />
        </Reveal>
      </section>

      {/* Statement */}
      <section className="relative overflow-hidden">
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 size-[40rem] -translate-1/2 rounded-full bg-brand-blue/10 blur-3xl"
        />
        <div className="relative mx-auto max-w-5xl px-4 py-24 sm:px-6 lg:px-8 lg:py-36">
          <Eyebrow className="mb-6">{home.statement.eyebrow}</Eyebrow>
          <ScrollText
            text={home.statement.text}
            className="text-3xl leading-[1.2] font-bold tracking-tight sm:text-5xl lg:text-6xl"
          />
        </div>
      </section>

      {/* About preview */}
      <section className="bg-muted/50">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-28">
          <div className="relative">
            <RevealImage className="aspect-[4/3] rounded-3xl">
              <SmartImage
                src={about.image}
                alt={about.imageAlt}
                fill
                sizes="(min-width: 1024px) 50vw, 100vw"
                className="object-cover"
              />
            </RevealImage>
            <Reveal
              delay={0.6}
              className="absolute -right-3 -bottom-6 rounded-2xl bg-accent-gradient p-5 text-white shadow-xl sm:-right-6"
            >
              <p className="text-3xl font-bold">
                <CountUp value={about.badge.value} />
              </p>
              <p className="text-sm text-white/85">{about.badge.label}</p>
            </Reveal>
          </div>
          <div>
            <SectionHeading
              eyebrow={about.eyebrow}
              title={about.title}
              highlight={about.highlight}
              description={about.description}
            />
            <StaggerList className="mt-8 grid grid-cols-2 gap-3">
              {values.map((v) => (
                <li key={v.slug} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                  <CheckCircle2 className="size-5 shrink-0 text-accent" />
                  <span className="text-sm font-medium">{v.title}</span>
                </li>
              ))}
            </StaggerList>
            {about.buttonLabel && (
              <Reveal className="mt-8">
                <ButtonLink href={about.buttonHref} variant="outline">
                  {about.buttonLabel} <ArrowRight className="size-4" />
                </ButtonLink>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <Marquee
        items={[...(home.marquee.includeServices ? services.map((s) => s.title) : []), ...home.marquee.extraItems]}
      />

      {/* Case studies */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow={home.caseStudies.eyebrow}
            title={home.caseStudies.title}
            highlight={home.caseStudies.highlight}
            description={home.caseStudies.description}
          />
          {home.caseStudies.linkLabel && (
            <Reveal>
              <Link href="/case-studies" className="inline-flex items-center gap-2 font-semibold hover:text-accent">
                {home.caseStudies.linkLabel} <ArrowRight className="size-4" />
              </Link>
            </Reveal>
          )}
        </div>
        <StaggerList className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {studies.slice(0, home.caseStudies.count).map((study) => (
            <li key={study.slug} className="h-full">
              <CaseStudyCard study={study} />
            </li>
          ))}
        </StaggerList>
      </section>

      {testimonials.length > 0 && <Testimonials testimonials={testimonials} content={home.testimonials} />}

      {/* Blog */}
      <section className="bg-muted/50">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <SectionHeading
              eyebrow={home.blog.eyebrow}
              title={home.blog.title}
              highlight={home.blog.highlight}
              description={home.blog.description}
            />
            {home.blog.linkLabel && (
              <Reveal>
                <Link href="/blog" className="inline-flex items-center gap-2 font-semibold hover:text-accent">
                  {home.blog.linkLabel} <ArrowRight className="size-4" />
                </Link>
              </Reveal>
            )}
          </div>
          <StaggerList className="mt-10 grid gap-6 md:grid-cols-3">
            {posts.slice(0, home.blog.count).map((post) => (
              <li key={post.slug} className="h-full">
                <BlogCard post={post} readMoreLabel={blogPage.readMoreLabel} />
              </li>
            ))}
          </StaggerList>
        </div>
      </section>

      <CtaCard />
    </>
  );
}
