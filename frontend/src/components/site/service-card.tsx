import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DynamicIcon } from "@/components/site/icon-map";
import type { Service } from "@/lib/content";
import { cn } from "@/lib/utils";

export function ServiceCard({ service, compact = false }: { service: Service; compact?: boolean }) {
  return (
    <Link
      href={`/services/${service.slug}`}
      data-spotlight
      data-cursor="Explore"
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-4 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl hover:shadow-brand-orange/10 active:scale-[0.98] sm:p-6",
      )}
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 size-32 rounded-full bg-accent/0 blur-2xl transition-colors duration-500 group-hover:bg-accent/20"
      />
      <span className="mb-4 inline-flex size-11 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors group-hover:bg-accent group-hover:text-white sm:size-12">
        <DynamicIcon name={service.icon} className="size-5 sm:size-6" />
      </span>
      <h3 className="text-sm leading-snug font-semibold sm:text-lg">{service.title}</h3>
      {!compact && <p className="mt-2 hidden text-sm text-muted-foreground sm:block">{service.excerpt}</p>}
      <span className="mt-auto hidden items-center gap-1 pt-4 text-sm font-medium text-accent sm:inline-flex">
        Learn more
        <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </span>
    </Link>
  );
}
