"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { Brand as BrandData, Wordmark } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

/** A brand with its icon already rendered on the server. */
export type Brand = BrandData & { iconNode?: React.ReactNode };

const wordmarks: Record<Wordmark, string> = {
  bold: "text-lg font-extrabold tracking-tight sm:text-xl",
  serif: "font-serif text-lg font-semibold italic sm:text-xl",
  mono: "font-mono text-sm font-bold tracking-widest uppercase sm:text-base",
  wide: "text-xs font-semibold tracking-[0.25em] uppercase sm:text-sm",
};

function BrandTile({ brand }: { brand: Brand }) {
  return (
    <li className="group/brand flex h-16 shrink-0 items-center justify-center gap-2.5 rounded-2xl border border-border bg-card/60 px-6 text-muted-foreground backdrop-blur transition-[color,border-color,background-color,transform] duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:bg-card hover:text-foreground sm:h-20 sm:px-8">
      {brand.logo ? (
        <Image
          src={brand.logo}
          alt={brand.name}
          width={140}
          height={48}
          className="h-8 w-auto opacity-70 grayscale transition duration-300 group-hover/brand:opacity-100 group-hover/brand:grayscale-0 sm:h-10"
        />
      ) : (
        <>
          {brand.iconNode && (
            <span className="inline-flex shrink-0 transition-colors duration-300 group-hover/brand:text-accent [&_svg]:size-5 sm:[&_svg]:size-6">
              {brand.iconNode}
            </span>
          )}
          <span className={cn("whitespace-nowrap", wordmarks[brand.wordmark ?? "bold"] ?? wordmarks.bold)}>
            {brand.name}
          </span>
        </>
      )}
    </li>
  );
}

function Row({ brands, hidden }: { brands: Brand[]; hidden?: boolean }) {
  return (
    <div className="brand-row flex w-max" aria-hidden={hidden || undefined}>
      {[0, 1].map((copy) => (
        <ul key={copy} aria-hidden={copy === 1 || undefined} className="flex shrink-0 gap-3 pr-3 sm:gap-4 sm:pr-4">
          {brands.map((brand) => (
            <BrandTile key={brand.name} brand={brand} />
          ))}
        </ul>
      ))}
    </div>
  );
}

/** "Trusted by" strip: two logo rows looping in opposite directions; hovering a row eases it to a stop. */
export function BrandMarquee({ brands, label }: { brands: Brand[]; label: string }) {
  const ref = useRef<HTMLElement>(null);
  const half = Math.ceil(brands.length / 2);
  const rows = [brands, [...brands.slice(half), ...brands.slice(0, half)]];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const rowEls = gsap.utils.toArray<HTMLElement>(".brand-row");
        const loops = rowEls.map((row, i) =>
          gsap.fromTo(
            row,
            { xPercent: i % 2 ? -50 : 0 },
            { xPercent: i % 2 ? 0 : -50, duration: 45, ease: "none", repeat: -1 },
          ),
        );

        const cleanups = rowEls.map((row, i) => {
          const slow = () => gsap.to(loops[i], { timeScale: 0, duration: 0.8, ease: "power2.out", overwrite: true });
          const resume = () => gsap.to(loops[i], { timeScale: 1, duration: 0.8, ease: "power2.in", overwrite: true });
          row.addEventListener("pointerenter", slow);
          row.addEventListener("pointerleave", resume);
          return () => {
            row.removeEventListener("pointerenter", slow);
            row.removeEventListener("pointerleave", resume);
          };
        });

        ScrollTrigger.create({
          trigger: ref.current,
          start: "top bottom",
          end: "bottom top",
          onUpdate(self) {
            const boost = gsap.utils.clamp(1, 4, 1 + Math.abs(self.getVelocity()) / 400);
            if (boost <= 1.05) return;
            loops.forEach((loop) => {
              loop.timeScale(boost);
              gsap.to(loop, { timeScale: 1, duration: 1.2, ease: "power2.out", overwrite: true });
            });
          },
        });

        gsap
          .timeline({ scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } })
          .from(".brand-line", { scaleX: 0, duration: 1, ease: "expo.out", stagger: 0.1 })
          .from(".brand-label", { autoAlpha: 0, y: 12, duration: 0.7, ease: "power3.out" }, 0.1)
          .from(".brand-row", { autoAlpha: 0, x: (i) => (i % 2 ? -80 : 80), duration: 1.2, ease: "expo.out" }, 0.15);

        return () => cleanups.forEach((fn) => fn());
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} aria-label="Brands we have worked with" className="relative overflow-hidden py-14 sm:py-20">
      <div className="mx-auto mb-8 flex max-w-7xl items-center gap-4 px-4 sm:mb-10 sm:px-6 lg:px-8">
        <span className="brand-line h-px flex-1 origin-right bg-gradient-to-r from-transparent to-border" />
        <p className="brand-label text-center text-xs font-semibold tracking-[0.18em] text-muted-foreground uppercase sm:text-sm">
          {label}
        </p>
        <span className="brand-line h-px flex-1 origin-left bg-gradient-to-l from-transparent to-border" />
      </div>

      <div className="flex flex-col gap-3 [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] sm:gap-4">
        {rows.map((row, i) => (
          <Row key={i} brands={row} hidden={i === 1} />
        ))}
      </div>
    </section>
  );
}
