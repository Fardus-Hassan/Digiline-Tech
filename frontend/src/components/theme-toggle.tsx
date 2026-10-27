"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};

/** Sliding sun/moon switch. Styles come from the resolved theme, not `dark:`, because the navbar forces `.dark`. */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const isDark = mounted ? resolvedTheme === "dark" : true;

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Light mode" : "Dark mode"}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "group relative inline-flex h-9 w-[4.25rem] shrink-0 items-center rounded-full border p-1 transition-colors duration-500 focus-visible:ring-2 focus-visible:ring-brand-orange focus-visible:outline-none",
        isDark
          ? "justify-end border-white/10 bg-gradient-to-r from-[#061c39] to-[#0a2a55] shadow-[inset_0_1px_4px_rgba(0,0,0,0.5)]"
          : "justify-start border-orange-200 bg-gradient-to-r from-orange-50 to-sky-100 shadow-[inset_0_1px_4px_rgba(0,35,79,0.12)]",
        className,
      )}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-full">
        <span
          className={cn(
            "absolute top-2 left-3 size-0.5 rounded-full bg-white transition-opacity duration-500",
            isDark ? "opacity-80" : "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute top-5 left-5 size-[3px] rounded-full bg-white transition-opacity delay-100 duration-500",
            isDark ? "opacity-60" : "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute top-3 left-7 size-0.5 rounded-full bg-white transition-opacity delay-200 duration-500",
            isDark ? "opacity-70" : "opacity-0",
          )}
        />
        <span
          className={cn(
            "absolute top-1/2 right-2.5 h-1.5 w-4 -translate-y-1/2 rounded-full bg-white transition-opacity duration-500",
            isDark ? "opacity-0" : "opacity-90",
          )}
        />
      </span>

      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 32 }}
        className={cn(
          "relative z-10 flex size-7 items-center justify-center rounded-full text-white transition-[background-color,box-shadow] duration-500 group-hover:scale-105",
          isDark
            ? "bg-gradient-to-br from-[#2f80e0] to-[#0057af] shadow-[0_0_12px_rgba(47,128,224,0.6)]"
            : "bg-gradient-to-br from-[#ff8a1f] to-[#fe4602] shadow-[0_0_12px_rgba(252,100,1,0.55)]",
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={isDark ? "moon" : "sun"}
            initial={{ rotate: -90, scale: 0, opacity: 0 }}
            animate={{ rotate: 0, scale: 1, opacity: 1 }}
            exit={{ rotate: 90, scale: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="flex"
          >
            {isDark ? <Moon className="size-4 fill-white/90" /> : <Sun className="size-4" />}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </button>
  );
}
