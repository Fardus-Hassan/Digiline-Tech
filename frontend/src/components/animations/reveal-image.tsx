"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Curtain-style clip reveal with a slow zoom-out, plus a gentle scroll parallax on the image. */
export function RevealImage({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: ref.current, start: "top 85%", once: true } })
          .fromTo(
            ref.current,
            { clipPath: "inset(100% 0% 0% 0%)" },
            { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.inOut" },
          )
          .fromTo(".reveal-image-zoom", { scale: 1.35 }, { scale: 1, duration: 1.8, ease: "expo.out" }, 0);

        gsap.fromTo(
          ".reveal-image-parallax",
          { yPercent: -6 },
          {
            yPercent: 6,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} data-gsap-clip className={cn("relative overflow-hidden", className)}>
      <div className="reveal-image-parallax absolute -inset-[8%]">
        <div className="reveal-image-zoom absolute inset-0">{children}</div>
      </div>
    </div>
  );
}
