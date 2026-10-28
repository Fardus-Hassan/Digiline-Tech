"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { CaseStudyCard } from "@/components/site/case-study-card";
import type { CaseStudy, Entry } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

type CaseStudiesFilterProps = {
  studies: Entry<CaseStudy>[];
  categories: string[];
  allLabel: string;
  emptyText: string;
};

export function CaseStudiesFilter({ studies, categories, allLabel, emptyText }: CaseStudiesFilterProps) {
  const [active, setActive] = useState<string | null>(null);
  const filtered = active === null ? studies : studies.filter((s) => s.category === active);
  const filters: { value: string | null; label: string }[] = [
    { value: null, label: allLabel },
    ...categories.map((c) => ({ value: c, label: c })),
  ];

  return (
    <LayoutGroup>
      <div role="tablist" aria-label="Filter case studies" className="flex flex-wrap gap-2">
        {filters.map(({ value, label }) => (
          <button
            key={label}
            role="tab"
            aria-selected={active === value}
            onClick={() => setActive(value)}
            className={cn(
              "relative rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
              active === value ? "border-transparent text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active === value && (
              <motion.span
                layoutId="case-filter-pill"
                className="absolute inset-0 rounded-full bg-accent-gradient"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{label}</span>
          </button>
        ))}
      </div>

      <motion.ul layout className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map((study) => (
            <motion.li
              key={study.slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
            >
              <CaseStudyCard study={study} />
            </motion.li>
          ))}
        </AnimatePresence>
      </motion.ul>
      {filtered.length === 0 && <p className="mt-8 text-center text-muted-foreground">{emptyText}</p>}
    </LayoutGroup>
  );
}
