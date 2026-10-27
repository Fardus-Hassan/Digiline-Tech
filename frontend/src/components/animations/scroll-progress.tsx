"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";

export function ScrollProgress() {
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const setScale = gsap.quickTo(el, "scaleX", { duration: 0.25, ease: "power2.out" });
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setScale(max > 0 ? window.scrollY / max : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[3px] origin-left scale-x-0 bg-accent-gradient shadow-[0_0_10px_rgba(252,100,1,0.7)]"
    />
  );
}
