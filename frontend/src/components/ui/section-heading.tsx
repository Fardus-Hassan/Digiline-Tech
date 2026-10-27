"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  highlight?: string;
  highlightOnNewLine?: boolean;
  description?: string;
  align?: "left" | "center";
  as?: "h1" | "h2";
  className?: string;
};

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold tracking-[0.18em] text-accent uppercase sm:text-sm", className)}>
      {children}
    </p>
  );
}

function Words({ text, className }: { text: string; className?: string }) {
  return text.split(" ").map((word, i) => (
    <span key={i}>
      {i > 0 && " "}
      <span className="-mb-[0.15em] inline-block overflow-hidden pb-[0.15em] align-top">
        <span className={cn("split-word-inner inline-block origin-bottom-left", className)}>{word}</span>
      </span>
    </span>
  ));
}

export function SectionHeading({
  eyebrow,
  title,
  highlight,
  highlightOnNewLine = true,
  description,
  align = "left",
  as: Tag = "h2",
  className,
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ scrollTrigger: { trigger: ref.current, start: "top 88%", once: true } })
          .fromTo(
            ".split-word-inner",
            { y: 0, yPercent: 110, rotate: 5 },
            { y: 0, yPercent: 0, rotate: 0, duration: 1.1, ease: "expo.out", stagger: 0.05 },
          )
          .fromTo(
            "[data-gsap-fade]",
            { autoAlpha: 0, y: 20 },
            { autoAlpha: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.12 },
            0.1,
          );
      });
    },
    { scope: ref },
  );

  return (
    <div ref={ref} className={cn("max-w-2xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && (
        <Eyebrow className="mb-3">
          <span data-gsap-fade className="inline-block">
            {eyebrow}
          </span>
        </Eyebrow>
      )}
      <Tag className="text-3xl leading-tight font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
        <Words text={title} />
        {highlight && (
          <>
            {highlightOnNewLine ? <br /> : " "}
            <Words text={highlight} className="text-gradient" />
          </>
        )}
      </Tag>
      {description && (
        <p data-gsap-fade className="mt-4 text-base text-muted-foreground sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}
