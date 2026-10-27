"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";

/** Hero section wrapper that drives the GSAP scroll effects for its `.hero-*` children. */
export function HeroScroll({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const section = ref.current;
      if (!section) return;
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const scrub = { trigger: section, start: "top top", end: "bottom top", scrub: true };

        gsap.to(".hero-content", { yPercent: -12, opacity: 0.25, ease: "none", scrollTrigger: scrub });
        gsap.to(".hero-glow-a", { yPercent: 40, ease: "none", scrollTrigger: scrub });
        gsap.to(".hero-glow-b", { yPercent: -30, ease: "none", scrollTrigger: scrub });
        gsap.fromTo(
          ".hero-swoosh",
          { xPercent: 6 },
          { xPercent: -6, ease: "none", scrollTrigger: { ...scrub, start: "top bottom" } },
        );
        gsap.fromTo(
          ".hero-swoosh-alt",
          { xPercent: -8 },
          { xPercent: 8, ease: "none", scrollTrigger: { ...scrub, start: "top bottom" } },
        );
        gsap.fromTo(
          ".hero-img",
          { yPercent: -6, scale: 1.14 },
          {
            yPercent: 6,
            scale: 1.05,
            ease: "none",
            scrollTrigger: { trigger: ".hero-media", start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });

      mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
        const layers = [
          { el: ".hero-glow-a", depth: 60 },
          { el: ".hero-glow-b", depth: -45 },
          { el: ".hero-media-frame", depth: -18 },
          { el: ".hero-float", depth: 28 },
        ].flatMap(({ el, depth }) =>
          gsap.utils.toArray<HTMLElement>(el, section).map((node) => ({
            x: gsap.quickTo(node, "x", { duration: 1.2, ease: "power3.out" }),
            y: gsap.quickTo(node, "y", { duration: 1.2, ease: "power3.out" }),
            depth,
          })),
        );
        const onMove = (e: PointerEvent) => {
          const rect = section.getBoundingClientRect();
          const nx = (e.clientX - rect.left) / rect.width - 0.5;
          const ny = (e.clientY - rect.top) / rect.height - 0.5;
          layers.forEach((l) => {
            l.x(nx * l.depth);
            l.y(ny * l.depth);
          });
        };
        section.addEventListener("pointermove", onMove);
        return () => section.removeEventListener("pointermove", onMove);
      });

      mm.add("(prefers-reduced-motion: no-preference) and (min-width: 1024px)", () => {
        gsap.to(".hero-float", {
          yPercent: -14,
          duration: 2.4,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          stagger: 0.6,
        });
        gsap.to(".hero-scroll-down", {
          opacity: 0,
          y: 20,
          ease: "none",
          scrollTrigger: { trigger: section, start: "top top", end: "+=200", scrub: true },
        });
      });

      mm.add("(prefers-reduced-motion: no-preference) and (max-width: 1023px)", () => {
        gsap.fromTo(
          ".hero-media-frame",
          { clipPath: "inset(14% 8% 14% 8% round 28px)" },
          {
            clipPath: "inset(0% 0% 0% 0% round 0px)",
            duration: 1.3,
            ease: "power3.out",
            clearProps: "clipPath",
            scrollTrigger: { trigger: ".hero-media", start: "top 90%" },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <section ref={ref} className={className}>
      {children}
    </section>
  );
}
