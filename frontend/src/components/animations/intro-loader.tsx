"use client";

import { useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";

const SEEN_KEY = "dt-intro-seen";

/**
 * First-visit-per-session intro. It is server-rendered and shown via CSS (`.js:not(.intro-done) .intro-loader`)
 * so it covers the page before hydration; the inline script in the root layout adds `.intro-done` on repeat visits.
 */
export function IntroLoader() {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = document.documentElement;
      const el = ref.current;
      if (!el || root.classList.contains("intro-done") || getComputedStyle(el).display === "none") return;

      const counter = { value: 0 };
      const number = el.querySelector<HTMLElement>(".intro-count");
      const finish = () => {
        root.classList.add("intro-done");
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
      };

      gsap
        .timeline({ defaults: { ease: "expo.out" }, onComplete: finish })
        .from(".intro-logo", { scale: 0.6, autoAlpha: 0, rotate: -8, duration: 1 })
        .from(".intro-word", { yPercent: 110, duration: 0.9, stagger: 0.08 }, 0.2)
        .to(
          counter,
          {
            value: 100,
            duration: 1.3,
            ease: "power2.inOut",
            onUpdate: () => {
              if (number) number.textContent = String(Math.round(counter.value));
            },
          },
          0,
        )
        .to(".intro-bar", { scaleX: 1, duration: 1.3, ease: "power2.inOut" }, 0)
        .to(".intro-inner", { yPercent: -30, autoAlpha: 0, duration: 0.6, ease: "power3.in" }, "+=0.15")
        .to(el, { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "-=0.2")
        .to(".intro-accent", { yPercent: -100, duration: 0.9, ease: "expo.inOut" }, "<0.08");
    },
    { scope: ref },
  );

  return (
    <>
      <div
        aria-hidden
        className="intro-loader intro-accent pointer-events-none fixed inset-0 z-[89] hidden bg-accent-gradient"
      />
      <div
        ref={ref}
        aria-hidden
        className="intro-loader fixed inset-0 z-[90] hidden flex-col items-center justify-center bg-[#03162f] text-white"
      >
        <div className="intro-inner flex flex-col items-center">
          <Image src="/logo.png" alt="" width={318} height={201} preload className="intro-logo h-20 w-auto sm:h-24" />
          <p className="mt-6 flex gap-2 overflow-hidden text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="intro-word inline-block">Digiline</span>
            <span className="intro-word inline-block text-gradient">Tech</span>
          </p>
          <div className="mt-8 h-px w-48 overflow-hidden bg-white/15">
            <div className="intro-bar h-full origin-left scale-x-0 bg-accent-gradient" />
          </div>
          <p className="mt-3 font-mono text-xs text-white/60 tabular-nums">
            <span className="intro-count">0</span>%
          </p>
        </div>
      </div>
    </>
  );
}
