"use client";

import { motion } from "motion/react";

export function ScrollDown({ href = "#services" }: { href?: string }) {
  return (
    <a href={href} className="flex flex-col items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
      <span className="flex h-9 w-6 justify-center rounded-full border-2 border-current pt-1.5">
        <motion.span
          className="h-2 w-1 rounded-full bg-current"
          animate={{ y: [0, 10, 0], opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
      Scroll Down
    </a>
  );
}
