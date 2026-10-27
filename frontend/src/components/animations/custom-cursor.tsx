"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const INTERACTIVE = "a, button, [role='button'], [role='switch'], label, select, summary";
const QUERY = "(pointer: fine) and (prefers-reduced-motion: no-preference)";

function subscribeMedia(onChange: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

function getMediaMatch() {
  return window.matchMedia(QUERY).matches;
}

/**
 * Orange dot + trailing ring that grows over interactive elements and shows a label over `[data-cursor]`.
 * Also feeds `--mx`/`--my` to the hovered `[data-spotlight]` card for its glow.
 */
export function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const enabled = useSyncExternalStore(subscribeMedia, getMediaMatch, () => false);
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    const root = document.documentElement;
    root.classList.add("has-custom-cursor");

    gsap.set([dot.current, ring.current], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3.out" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3.out" });
    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3.out" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3.out" });
    let visible = false;

    const onMove = (e: PointerEvent) => {
      if (!visible) {
        visible = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 });
      }
      dotX(e.clientX);
      dotY(e.clientY);
      ringX(e.clientX);
      ringY(e.clientY);

      const target = e.target as Element | null;
      const labelled = target?.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor ?? null);
      setHovering(!labelled && !!target?.closest(INTERACTIVE));

      const card = target?.closest<HTMLElement>("[data-spotlight]");
      if (card) {
        const rect = card.getBoundingClientRect();
        card.style.setProperty("--mx", `${e.clientX - rect.left}px`);
        card.style.setProperty("--my", `${e.clientY - rect.top}px`);
      }
    };
    const onLeave = () => {
      visible = false;
      gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.3 });
    };
    const onDown = () => gsap.to(ring.current, { scale: 0.8, duration: 0.2 });
    const onUp = () => gsap.to(ring.current, { scale: 1, duration: 0.4, ease: "elastic.out(1, 0.5)" });

    document.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerleave", onLeave);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("pointerup", onUp);
    return () => {
      root.classList.remove("has-custom-cursor");
      document.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("pointerup", onUp);
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[100]">
      <div ref={dot} className="fixed top-0 left-0 size-2 rounded-full bg-brand-orange" />
      <div
        ref={ring}
        className={cn(
          "fixed top-0 left-0 flex items-center justify-center rounded-full border text-[0.7rem] font-semibold tracking-wider text-white uppercase transition-[width,height,background-color,border-color,backdrop-filter] duration-300 ease-out",
          label
            ? "size-20 border-transparent bg-accent-gradient shadow-xl shadow-brand-orange/30"
            : hovering
              ? "size-14 border-brand-orange/60 bg-brand-orange/10 backdrop-blur-[2px]"
              : "size-9 border-brand-orange/50",
        )}
      >
        <span className={cn("transition-opacity duration-200", label ? "opacity-100" : "opacity-0")}>{label}</span>
      </div>
    </div>
  );
}
