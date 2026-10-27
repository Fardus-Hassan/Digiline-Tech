import { SmartImage } from "@/components/ui/smart-image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { CaseStudy } from "@/lib/content";

export function CaseStudyCard({ study }: { study: CaseStudy }) {
  return (
    <Link
      href={`/case-studies/${study.slug}`}
      data-spotlight
      data-cursor="View"
      className="group flex h-full gap-4 overflow-hidden rounded-2xl border border-border bg-card p-3 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl hover:shadow-brand-orange/10 active:scale-[0.98] sm:flex-col sm:p-0"
    >
      <div className="relative aspect-square w-28 shrink-0 overflow-hidden rounded-xl sm:aspect-[4/3] sm:w-full sm:rounded-none">
        <SmartImage
          src={study.image}
          alt={study.title}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 112px"
          className="object-cover duration-700 group-hover:scale-105"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col py-1 sm:p-5">
        <span className="w-fit rounded-full bg-accent/10 px-2.5 py-1 text-[0.7rem] font-medium text-accent">
          {study.category}
        </span>
        <h3 className="mt-2 text-base leading-snug font-semibold sm:text-lg">{study.title}</h3>
        <p className="mt-1 text-sm">
          <span className="font-bold text-accent">{study.metric.value}</span>{" "}
          <span className="text-muted-foreground">{study.metric.label}</span>
        </p>
        <ArrowRight className="mt-auto ml-auto size-5 text-accent transition-transform group-hover:translate-x-1" />
      </div>
    </Link>
  );
}
