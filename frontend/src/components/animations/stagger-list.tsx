"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";

/** `<ul>` whose direct children rise in with a 3D tilt, batched as they scroll into view. */
export function StaggerList({ className, children }: { className?: string; children: React.ReactNode }) {
  const ref = useRef<HTMLUListElement>(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray<HTMLElement>(ref.current?.children ?? []);
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        ScrollTrigger.batch(items, {
          start: "top 90%",
          once: true,
          onEnter: (batch) =>
            gsap.fromTo(
              batch,
              { autoAlpha: 0, y: 70, rotateX: -18, scale: 0.96, transformPerspective: 900, transformOrigin: "50% 0%" },
              {
                autoAlpha: 1,
                y: 0,
                rotateX: 0,
                scale: 1,
                duration: 1.1,
                ease: "expo.out",
                stagger: 0.09,
                clearProps: "transform",
              },
            ),
        });
      });
    },
    { scope: ref },
  );

  return (
    <ul ref={ref} data-gsap-stagger className={className}>
      {children}
    </ul>
  );
}
