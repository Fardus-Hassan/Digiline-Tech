"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Grows from a smaller, rounder card to full size as it scrolls into view, then reveals its `[data-gsap-fade]` children. */
export function ScrubScale({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ref.current,
          { scale: 0.86, borderRadius: 64 },
          {
            scale: 1,
            borderRadius: 24,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "top 45%", scrub: 0.6 },
          },
        );
        gsap.fromTo(
          "[data-gsap-fade]",
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.12,
            scrollTrigger: { trigger: ref.current, start: "top 70%", once: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("will-change-transform", className)}>
      {children}
    </div>
  );
}
