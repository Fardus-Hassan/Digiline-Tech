"use client";

import { useRef } from "react";
import { Sparkle } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

function Track({ items, className, itemClassName }: { items: string[]; className?: string; itemClassName?: string }) {
  return (
    <div className={cn("marquee-track flex w-max", className)}>
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 items-center">
          {items.map((item) => (
            <li
              key={item}
              className={cn("flex items-center gap-6 px-6 whitespace-nowrap sm:gap-10 sm:px-10", itemClassName)}
            >
              {item}
              <Sparkle className="size-5 shrink-0 fill-current sm:size-7" />
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

/** Two crossing ribbons that loop forever and speed up with scroll velocity. */
export function Marquee({ items }: { items: string[] }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tracks = gsap.utils.toArray<HTMLElement>(".marquee-track");
        const loops = tracks.map((track, i) =>
          gsap.fromTo(
            track,
            { xPercent: i % 2 ? -50 : 0 },
            { xPercent: i % 2 ? 0 : -50, duration: 38, ease: "none", repeat: -1 },
          ),
        );

        ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate(self) {
            const boost = gsap.utils.clamp(1, 6, 1 + Math.abs(self.getVelocity()) / 250);
            loops.forEach((loop) => {
              loop.timeScale(boost);
              gsap.to(loop, { timeScale: 1, duration: 1.2, ease: "power2.out", overwrite: true });
            });
          },
        });

        gsap.fromTo(
          ".marquee-band",
          { rotation: (i) => (i ? -3 : 3) },
          {
            rotation: 0,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className="relative overflow-hidden pt-20 pb-12 sm:py-20">
      <div className="marquee-band absolute inset-x-[-5%] top-8 rotate-3 bg-brand-blue py-3 sm:top-1/2 sm:-translate-y-1/2 sm:rotate-2 sm:py-4">
        <Track
          items={items}
          itemClassName="text-xl font-bold uppercase tracking-wide text-transparent [-webkit-text-stroke:1px_rgba(255,255,255,0.8)] sm:text-3xl"
          className="text-white/50"
        />
      </div>
      <div className="marquee-band relative -mx-[5%] -rotate-2 bg-accent-gradient py-3 shadow-2xl shadow-brand-orange/30 sm:py-4">
        <Track items={items} itemClassName="text-xl font-bold uppercase tracking-wide text-white sm:text-3xl" />
      </div>
    </div>
  );
}
