"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Tab = { href: string; label: string; icon: React.ReactNode };

const haptic = () => navigator.vibrate?.(8);

/**
 * App-style tab bar for phones and small tablets: hides while scrolling down, returns on scroll up.
 * Tabs are split evenly around the centre button; icons arrive pre-rendered from the server.
 */
export function BottomNav({ tabs, center }: { tabs: Tab[]; center: Tab }) {
  const half = Math.ceil(tabs.length / 2);
  const left = tabs.slice(0, half);
  const right = tabs.slice(half);
  const pathname = usePathname();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      const nearBottom = window.innerHeight + y >= document.documentElement.scrollHeight - 80;
      if (Math.abs(y - last) < 6) return;
      setHidden(y > last && y > 160 && !nearBottom);
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const talkActive = isActive(center.href);

  const renderTab = ({ href, label, icon }: Tab) => {
    const active = isActive(href);
    return (
      <Link
        key={href}
        href={href}
        onClick={haptic}
        aria-current={active ? "page" : undefined}
        className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-transform active:scale-90"
      >
        {active && (
          <motion.span
            layoutId="bottom-nav-pill"
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className="absolute inset-x-1.5 inset-y-1 -z-10 rounded-2xl bg-accent/12"
          />
        )}
        <span
          className={cn(
            "inline-flex transition-colors [&_svg]:size-5",
            active ? "text-accent [&_svg]:stroke-[2.4]" : "text-muted-foreground",
          )}
        >
          {icon}
        </span>
        <span
          className={cn(
            "text-[0.65rem] leading-none font-medium transition-colors",
            active ? "text-accent" : "text-muted-foreground",
          )}
        >
          {label}
        </span>
      </Link>
    );
  };

  return (
    <motion.nav
      aria-label="Quick navigation"
      initial={false}
      animate={{ y: hidden ? "140%" : "0%" }}
      transition={{ type: "spring", stiffness: 380, damping: 36 }}
      className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md lg:hidden"
    >
      <div className="relative isolate flex items-stretch rounded-[1.75rem] border border-border bg-background/80 px-1.5 py-1 shadow-[0_12px_40px_-8px_rgba(0,20,50,0.45)] backdrop-blur-xl backdrop-saturate-150">
        {left.map(renderTab)}

        <div className="relative flex w-20 shrink-0 justify-center">
          <Link
            href={center.href}
            onClick={haptic}
            aria-label={center.label}
            aria-current={talkActive ? "page" : undefined}
            className="absolute -top-6 flex flex-col items-center gap-1 transition-transform active:scale-90"
          >
            <span className="relative flex size-14 items-center justify-center rounded-full bg-accent-gradient text-white shadow-lg ring-4 shadow-brand-orange/40 ring-background">
              <span
                aria-hidden
                className="absolute inset-0 animate-ping rounded-full bg-brand-orange/30 [animation-duration:2.4s]"
              />
              <span className="relative inline-flex [&_svg]:size-6 [&_svg]:stroke-[2.2]">{center.icon}</span>
            </span>
            <span
              className={cn(
                "text-[0.65rem] leading-none font-semibold",
                talkActive ? "text-accent" : "text-foreground",
              )}
            >
              {center.label}
            </span>
          </Link>
        </div>

        {right.map(renderTab)}
      </div>
    </motion.nav>
  );
}
