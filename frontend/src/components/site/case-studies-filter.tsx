"use client";

import { useState } from "react";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { CaseStudyCard } from "@/components/site/case-study-card";
import type { CaseStudy, CaseStudyCategory } from "@/lib/content";
import { cn } from "@/lib/utils";

type Filter = "All" | CaseStudyCategory;

export function CaseStudiesFilter({ studies, categories }: { studies: CaseStudy[]; categories: CaseStudyCategory[] }) {
  const [active, setActive] = useState<Filter>("All");
  const filtered = active === "All" ? studies : studies.filter((s) => s.category === active);

  return (
    <LayoutGroup>
      <div role="tablist" aria-label="Filter case studies" className="flex flex-wrap gap-2">
        {(["All", ...categories] as Filter[]).map((cat) => (
          <button
            key={cat}
            role="tab"
            aria-selected={active === cat}
            onClick={() => setActive(cat)}
            className={cn(
              "relative rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors",
              active === cat ? "border-transparent text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {active === cat && (
              <motion.span
                layoutId="case-filter-pill"
                className="absolute inset-0 rounded-full bg-accent-gradient"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
            <span className="relative">{cat}</span>
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
      {filtered.length === 0 && (
        <p className="mt-8 text-center text-muted-foreground">No case studies in this category yet.</p>
      )}
    </LayoutGroup>
  );
}
