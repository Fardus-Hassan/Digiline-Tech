"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Quote, Star } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Testimonial } from "@/lib/content";
import { cn } from "@/lib/utils";

const AUTOPLAY_SECONDS = 7;
const avatarGradients = [
  "from-[#ff8a1f] to-[#fe4602]",
  "from-[#2f80e0] to-[#00234f]",
  "from-[#fc6401] to-[#0057af]",
  "from-[#0057af] to-[#2f80e0]",
  "from-[#fe4602] to-[#00234f]",
];

const initials = (name: string) =>
  name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("");

function Avatar({ person, index, className }: { person: Testimonial; index: number; className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br font-bold text-white",
        avatarGradients[index % avatarGradients.length],
        className,
      )}
    >
      {person.avatar ? (
        <Image src={person.avatar} alt={person.name} fill sizes="64px" className="object-cover" />
      ) : (
        initials(person.name)
      )}
    </span>
  );
}

function Stars({ rating, className }: { rating: number; className?: string }) {
  return (
    <div className={cn("flex gap-1", className)} aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn("t-star size-4 sm:size-5", i < rating ? "fill-accent text-accent" : "text-border")}
        />
      ))}
    </div>
  );
}

/** Featured testimonial carousel with GSAP word reveals, autoplay progress, swipe and a stacked-card look. */
export function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  const ref = useRef<HTMLElement>(null);
  const progress = useRef<gsap.core.Tween | null>(null);
  const state = useRef({ inView: false, hovered: false });
  const swipeStart = useRef<number | null>(null);
  const [index, setIndex] = useState(0);
  const total = testimonials.length;
  const current = testimonials[index];

  const go = (dir: number) => setIndex((i) => (i + dir + total) % total);
  const syncPlayback = () => {
    const { inView, hovered } = state.current;
    if (inView && !hovered) progress.current?.play();
    else progress.current?.pause();
  };

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: ref.current, start: "top 75%", once: true } })
          .from(".t-summary > *", { autoAlpha: 0, y: 30, duration: 0.9, ease: "power3.out", stagger: 0.12 })
          .from(
            ".t-card",
            { autoAlpha: 0, y: 80, rotateX: -12, transformPerspective: 1200, duration: 1.2, ease: "expo.out" },
            0.1,
          )
          .from(".t-ghost", { scale: 0.9, y: 40, autoAlpha: 0, duration: 1.2, ease: "expo.out", stagger: 0.1 }, 0.3);
      });

      ScrollTrigger.create({
        trigger: ref.current,
        start: "top 70%",
        end: "bottom 30%",
        onToggle: (self) => {
          state.current.inView = self.isActive;
          syncPlayback();
        },
      });
    },
    { scope: ref },
  );

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline()
          .fromTo(
            ".t-quote-icon",
            { rotate: -25, scale: 0.6, autoAlpha: 0 },
            { rotate: 0, scale: 1, autoAlpha: 1, duration: 0.9, ease: "expo.out" },
          )
          .from(".t-card .t-star", { scale: 0, rotate: -60, duration: 0.5, ease: "back.out(3)", stagger: 0.05 }, 0)
          .from(".t-word", { yPercent: 110, autoAlpha: 0, duration: 0.8, ease: "expo.out", stagger: 0.012 }, 0.05)
          .from(".t-author > *", { y: 20, autoAlpha: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 0.2);

        progress.current = gsap.fromTo(
          `.t-progress-${index}`,
          { scaleX: 0 },
          { scaleX: 1, duration: AUTOPLAY_SECONDS, ease: "none", onComplete: () => go(1) },
        );
        syncPlayback();
      });
    },
    { scope: ref, dependencies: [index], revertOnUpdate: true },
  );

  const onPointerUp = (e: React.PointerEvent) => {
    if (swipeStart.current === null) return;
    const dx = e.clientX - swipeStart.current;
    swipeStart.current = null;
    if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
  };

  const renderControls = (className: string) => (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        onClick={() => go(-1)}
        aria-label="Previous testimonial"
        className="inline-flex size-12 items-center justify-center rounded-full border border-border transition-colors hover:border-accent hover:bg-accent hover:text-white active:scale-95"
      >
        <ArrowLeft className="size-5" />
      </button>
      <button
        type="button"
        onClick={() => go(1)}
        aria-label="Next testimonial"
        className="inline-flex size-12 items-center justify-center rounded-full bg-accent-gradient text-white shadow-lg shadow-brand-orange/30 transition-transform active:scale-95"
      >
        <ArrowRight className="size-5" />
      </button>
      <p className="ml-2 font-mono text-sm text-muted-foreground tabular-nums">
        <span className="text-lg font-bold text-foreground">{String(index + 1).padStart(2, "0")}</span> /{" "}
        {String(total).padStart(2, "0")}
      </p>
    </div>
  );

  return (
    <section ref={ref} className="dark relative overflow-hidden bg-background text-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-0 size-[34rem] rounded-full bg-brand-blue/25 blur-3xl" />
        <div className="absolute -bottom-40 -left-20 size-[28rem] rounded-full bg-brand-orange/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)] bg-[size:64px_64px]" />
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-12 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:items-center lg:gap-16 lg:px-8 lg:py-28">
        <div className="lg:col-span-5">
          <SectionHeading
            eyebrow="Testimonials"
            title="What Our Clients"
            highlight="Say About Us"
            description="Real words from the founders and teams we have helped grow."
          />

          <div className="t-summary mt-8 space-y-6">
            <div className="flex items-center gap-5 rounded-3xl border border-border bg-card/60 p-5 backdrop-blur sm:p-6">
              <p className="text-5xl font-bold tracking-tight sm:text-6xl">
                4.9<span className="text-2xl text-muted-foreground">/5</span>
              </p>
              <div className="space-y-2">
                <Stars rating={5} />
                <p className="text-sm text-muted-foreground">Average rating from 50+ happy clients</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {testimonials.slice(0, 4).map((person, i) => (
                  <button
                    key={person.name}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show review from ${person.name}`}
                    className={cn(
                      "rounded-full ring-4 ring-background transition-transform hover:z-10 hover:-translate-y-1",
                      i === index && "z-10 -translate-y-1",
                    )}
                  >
                    <Avatar person={person} index={i} className="size-11 text-sm" />
                  </button>
                ))}
                <span className="z-0 inline-flex size-11 items-center justify-center rounded-full bg-muted text-xs font-bold ring-4 ring-background">
                  50+
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Trusted by founders &amp; marketing teams across <span className="text-foreground">Bangladesh</span> and
                beyond
              </p>
            </div>

            {renderControls("hidden lg:flex")}
          </div>
        </div>

        <div className="lg:col-span-7">
          <div className="relative">
            <div
              aria-hidden
              className="t-ghost absolute inset-x-6 inset-y-4 -rotate-3 rounded-[2rem] border border-border bg-card/40"
            />
            <div
              aria-hidden
              className="t-ghost absolute inset-x-3 inset-y-2 rotate-2 rounded-[2rem] border border-border bg-card/60"
            />

            <figure
              className="t-card relative touch-pan-y overflow-hidden rounded-[2rem] border border-border bg-card/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-xl select-none sm:p-10"
              onPointerEnter={() => {
                state.current.hovered = true;
                syncPlayback();
              }}
              onPointerLeave={() => {
                state.current.hovered = false;
                syncPlayback();
              }}
              onPointerDown={(e) => (swipeStart.current = e.clientX)}
              onPointerUp={onPointerUp}
              onPointerCancel={() => (swipeStart.current = null)}
            >
              <div
                aria-hidden
                className="absolute -top-16 -right-16 size-56 rounded-full bg-brand-orange/15 blur-3xl"
              />
              <Quote
                aria-hidden
                className="t-quote-icon absolute top-6 right-6 size-16 fill-accent/15 text-accent/40 sm:top-8 sm:right-8 sm:size-24"
              />

              <div key={index} className="relative">
                <Stars rating={current.rating} />

                <blockquote className="mt-6 min-h-[9.5rem] text-lg leading-relaxed font-medium sm:min-h-[11rem] sm:text-2xl sm:leading-snug lg:text-[1.65rem]">
                  <p className="flex flex-wrap gap-x-[0.28em]">
                    <span className="text-3xl leading-none text-accent">&ldquo;</span>
                    {current.quote.split(" ").map((word, i) => (
                      <span key={i} className="inline-block overflow-hidden pb-[0.1em] align-top">
                        <span className="t-word inline-block">{word}</span>
                      </span>
                    ))}
                  </p>
                </blockquote>

                <figcaption className="t-author mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-border pt-6">
                  <div className="flex items-center gap-4">
                    <Avatar person={current} index={index} className="size-14 text-base shadow-lg" />
                    <div>
                      <p className="text-lg font-semibold">{current.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {current.role}, <span className="text-accent">{current.company}</span>
                      </p>
                    </div>
                  </div>
                  {current.result && (
                    <div className="rounded-2xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-right">
                      <p className="text-gradient text-2xl leading-none font-bold">{current.result.value}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{current.result.label}</p>
                    </div>
                  )}
                </figcaption>
              </div>

              <div className="relative mt-8 flex gap-2">
                {testimonials.map((person, i) => (
                  <button
                    key={person.name}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show review ${i + 1} of ${total}`}
                    aria-current={i === index || undefined}
                    className="group/bar h-6 flex-1 py-2.5"
                  >
                    <span className="block h-1 overflow-hidden rounded-full bg-border transition-colors group-hover/bar:bg-muted-foreground/40">
                      <span
                        className={cn(
                          `t-progress-${i} block h-full origin-left rounded-full bg-accent-gradient`,
                          i < index ? "scale-x-100" : "scale-x-0",
                          i === index && "motion-reduce:scale-x-100",
                        )}
                      />
                    </span>
                  </button>
                ))}
              </div>
            </figure>
          </div>

          {renderControls("mt-10 justify-center lg:hidden")}
        </div>
      </div>
    </section>
  );
}
