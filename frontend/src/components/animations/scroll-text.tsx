"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

/** Large statement whose words light up one by one as it scrolls through the viewport. `*word*` marks an accent word. */
export function ScrollText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLParagraphElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          ".scroll-word",
          { opacity: 0.15, filter: "blur(4px)" },
          {
            opacity: 1,
            filter: "blur(0px)",
            stagger: 0.1,
            ease: "none",
            scrollTrigger: { trigger: ref.current, start: "top 80%", end: "bottom 45%", scrub: true },
          },
        );
      });
    },
    { scope: ref },
  );

  return (
    <p ref={ref} className={cn("flex flex-wrap gap-x-[0.25em]", className)}>
      {text.split(" ").map((raw, i) => {
        const accent = raw.startsWith("*") && raw.endsWith("*");
        const word = accent ? raw.slice(1, -1) : raw;
        return (
          <span key={i} className={cn("scroll-word inline-block", accent && "text-gradient")}>
            {word}
          </span>
        );
      })}
    </p>
  );
}
