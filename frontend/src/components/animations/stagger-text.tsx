"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

export function StaggerText({ text, className }: { text: string; className?: string }) {
  const ref = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap.from(".word", {
          yPercent: 110,
          opacity: 0,
          duration: 0.9,
          ease: "power4.out",
          stagger: 0.06,
        });
      });
    },
    { scope: ref },
  );

  return (
    <h1 ref={ref} className={cn("flex flex-wrap", className)} aria-label={text}>
      {text.split(" ").map((word, i) => (
        <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-1" aria-hidden>
          <span className="word inline-block">{word}</span>
        </span>
      ))}
    </h1>
  );
}
