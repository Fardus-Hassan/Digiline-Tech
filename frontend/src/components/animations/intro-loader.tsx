"use client";

import { Fragment, useRef } from "react";
import Image from "next/image";
import { gsap, useGSAP } from "@/lib/gsap";
import type { Brand } from "@/components/logo";
import type { SectionData } from "@/lib/cms/defaults";

const SEEN_KEY = "dt-intro-seen";
const COLUMNS = 5;
const RING_RADIUS = 62;
const RING_LENGTH = 2 * Math.PI * RING_RADIUS;

function Chars({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {Array.from(text).map((char, i) => (
        <span key={i} className="intro-char inline-block [transform-origin:50%_100%]">
          {char}
        </span>
      ))}
    </span>
  );
}

/**
 * First-visit-per-session intro. It is server-rendered and shown via CSS (`.js:not(.intro-done) .intro-loader`)
 * so it covers the page before hydration; the inline script in the root layout adds `.intro-done` on repeat visits.
 */
export function IntroLoader({ brand, intro }: { brand: Brand; intro: SectionData<"intro"> }) {
  const ref = useRef<HTMLDivElement>(null);
  const taglineParts = brand.tagline.split("•").map((part) => part.trim()).filter(Boolean);

  useGSAP(
    () => {
      const root = document.documentElement;
      const el = ref.current;
      if (!el || root.classList.contains("intro-done") || getComputedStyle(el).display === "none") return;

      const number = el.querySelector<HTMLElement>(".intro-count");
      const counter = { value: 0 };
      const accents = el.parentElement?.querySelector<HTMLElement>(".intro-accents");

      // Keep both layers mounted while `.intro-done` releases the page underneath the curtain.
      const release = () => {
        gsap.set([el, accents], { display: "flex" });
        root.classList.add("intro-done");
        try {
          sessionStorage.setItem(SEEN_KEY, "1");
        } catch {}
      };
      const loops: gsap.core.Tween[] = [];
      const cleanup = () => {
        loops.forEach((loop) => loop.kill());
        gsap.set([el, accents], { display: "none" });
      };

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.to(el, { autoAlpha: 0, duration: 0.4, delay: 0.3, onStart: release, onComplete: cleanup });
        return;
      }

      const loop = { ease: "sine.inOut", yoyo: true, repeat: -1 };
      loops.push(
        gsap.to(".intro-orbit", { rotate: 360, duration: 2.2, ease: "none", repeat: -1 }),
        gsap.to(".intro-halo", { scale: 1.15, opacity: 0.9, duration: 1.2, ...loop }),
        gsap.to(".intro-glow-a", { xPercent: 18, yPercent: -12, duration: 3, ...loop }),
        gsap.to(".intro-glow-b", { xPercent: -16, yPercent: 14, duration: 3.4, ...loop }),
      );

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .from(".intro-glow", { autoAlpha: 0, scale: 0.6, duration: 1.6, stagger: 0.15 }, 0)
        .from(".intro-grid", { autoAlpha: 0, duration: 1.2 }, 0)
        .from(".intro-ring-track", { scale: 0.6, autoAlpha: 0, duration: 1.1, transformOrigin: "50% 50%" }, 0.05)
        .from(".intro-logo", { scale: 0.4, autoAlpha: 0, filter: "blur(14px)", rotate: -12, duration: 1.3 }, 0.15)
        .from(
          ".intro-char",
          { yPercent: 120, rotateX: -90, autoAlpha: 0, duration: 1, stagger: 0.045, ease: "back.out(1.6)" },
          0.45,
        )
        .from(".intro-tagline", { autoAlpha: 0, letterSpacing: "0.8em", duration: 1.4, ease: "power3.out" }, 0.8)
        .from(".intro-corner", { autoAlpha: 0, y: 20, duration: 0.8, stagger: 0.1, ease: "power3.out" }, 0.4)
        .to(
          counter,
          {
            value: 100,
            duration: 2.2,
            ease: "power3.inOut",
            onUpdate: () => {
              if (number) number.textContent = String(Math.round(counter.value)).padStart(2, "0");
            },
          },
          0.2,
        )
        .fromTo(
          ".intro-ring-progress",
          { strokeDashoffset: RING_LENGTH },
          { strokeDashoffset: 0, duration: 2.2, ease: "power3.inOut" },
          0.2,
        )
        .to(".intro-bar", { scaleX: 1, duration: 2.2, ease: "power3.inOut" }, 0.2)
        .addLabel("exit", "+=0.2")
        .to(".intro-flash", { autoAlpha: 1, scale: 1.6, duration: 0.35, ease: "power2.out" }, "exit")
        .to(".intro-flash", { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "exit+=0.35")
        .to(
          ".intro-logo-wrap",
          { scale: 1.25, autoAlpha: 0, filter: "blur(10px)", duration: 0.7, ease: "power3.in" },
          "exit",
        )
        .to(".intro-char", { yPercent: -120, autoAlpha: 0, duration: 0.5, stagger: 0.02, ease: "power3.in" }, "exit")
        .to(
          [".intro-tagline", ".intro-corner", ".intro-bar-wrap"],
          { autoAlpha: 0, duration: 0.4, ease: "power2.in" },
          "exit",
        )
        .to(".intro-glow, .intro-grid", { autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "exit+=0.2")
        .call(release, [], "exit+=0.55")
        .to(
          ".intro-col",
          { yPercent: -100, duration: 1, ease: "expo.inOut", stagger: { each: 0.07, from: "center" } },
          "exit+=0.55",
        )
        .to(
          accents ? accents.children : [],
          { yPercent: -100, duration: 1, ease: "expo.inOut", stagger: { each: 0.07, from: "center" } },
          "exit+=0.7",
        )
        .call(cleanup);
    },
    { scope: ref },
  );

  const columns = Array.from({ length: COLUMNS });

  return (
    <>
      <div aria-hidden className="intro-loader intro-accents pointer-events-none fixed inset-0 z-[89] hidden">
        {columns.map((_, i) => (
          <div key={i} className="h-full flex-1 bg-accent-gradient" />
        ))}
      </div>

      <div
        ref={ref}
        aria-hidden
        className="intro-loader fixed inset-0 z-[90] hidden items-center justify-center overflow-hidden text-white"
      >
        <div className="absolute inset-0 flex">
          {columns.map((_, i) => (
            <div key={i} className="intro-col -mx-px h-full flex-1 bg-[#03162f]" />
          ))}
        </div>

        <div className="intro-grid absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)] bg-[size:56px_56px]" />
        <div className="intro-glow intro-glow-a absolute top-1/2 left-1/2 size-[36rem] -translate-x-[70%] -translate-y-[60%] rounded-full bg-brand-blue/35 blur-[110px]" />
        <div className="intro-glow intro-glow-b absolute top-1/2 left-1/2 size-[30rem] -translate-x-[25%] -translate-y-[30%] rounded-full bg-brand-orange/25 blur-[110px]" />

        <div className="intro-inner relative flex flex-col items-center px-6">
          <div className="intro-logo-wrap relative grid size-40 place-items-center sm:size-48">
            <div className="intro-halo absolute inset-6 rounded-full bg-brand-blue/30 opacity-60 blur-2xl" />
            <div className="intro-flash absolute inset-0 rounded-full bg-white/40 opacity-0 blur-2xl" />
            <svg viewBox="0 0 140 140" className="absolute inset-0 size-full -rotate-90">
              <defs>
                <linearGradient id="intro-ring" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#0057af" />
                  <stop offset="100%" stopColor="#fc6401" />
                </linearGradient>
              </defs>
              <circle
                className="intro-ring-track"
                cx="70"
                cy="70"
                r={RING_RADIUS}
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="1.5"
              />
              <circle
                className="intro-ring-progress"
                cx="70"
                cy="70"
                r={RING_RADIUS}
                fill="none"
                stroke="url(#intro-ring)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={RING_LENGTH}
                strokeDashoffset={RING_LENGTH}
              />
            </svg>
            <div className="intro-orbit absolute inset-0">
              <span className="absolute top-[3.5%] left-1/2 size-2.5 -translate-x-1/2 rounded-full bg-brand-orange shadow-[0_0_14px_4px_rgba(252,100,1,0.7)]" />
            </div>
            <Image
              src={brand.logo || "/logo.png"}
              alt=""
              width={318}
              height={201}
              preload
              className="intro-logo relative h-16 w-auto drop-shadow-[0_0_18px_rgba(0,87,175,0.6)] sm:h-20"
            />
          </div>

          <p className="mt-8 flex gap-3 text-4xl font-bold tracking-tight [perspective:600px] sm:text-5xl">
            <Chars text={brand.brandFirst} />
            <Chars text={brand.brandSecond} className="text-brand-orange" />
          </p>
          <p className="intro-tagline mt-4 text-[0.65rem] font-medium tracking-[0.35em] text-white/60 uppercase sm:text-xs">
            {taglineParts.map((part, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="text-brand-orange"> • </span>}
                {part}
              </Fragment>
            ))}
          </p>
        </div>

        <div className="intro-corner absolute bottom-[calc(2rem+env(safe-area-inset-bottom))] left-6 font-mono text-[0.65rem] tracking-[0.25em] text-white/50 uppercase sm:left-10 sm:text-xs">
          <p className="text-white/80">{intro.cornerTitle}</p>
          <p className="mt-1">{intro.cornerSubtitle}</p>
        </div>
        <p className="intro-corner absolute right-6 bottom-[calc(1.25rem+env(safe-area-inset-bottom))] flex items-start text-6xl leading-none font-bold tracking-tighter tabular-nums sm:right-10 sm:text-8xl">
          <span className="intro-count">00</span>
          <span className="mt-1 text-lg text-brand-orange sm:mt-2 sm:text-2xl">%</span>
        </p>
        <div className="intro-bar-wrap absolute inset-x-0 bottom-0 h-[3px] bg-white/10">
          <div className="intro-bar h-full origin-left scale-x-0 bg-accent-gradient" />
        </div>
      </div>
    </>
  );
}
