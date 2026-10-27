import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DynamicIcon } from "@/components/site/icon-map";
import type { Service } from "@/lib/content";
import { cn } from "@/lib/utils";

const periodLabel = { month: "/ month", project: "/ project", session: "/ session" } as const;

export function StartingPrice({
  price,
  size = "md",
  className,
}: {
  price: Service["startingPrice"];
  size?: "md" | "lg";
  className?: string;
}) {
  return (
    <p className={cn("min-w-0", className)}>
      <span className="block text-[0.6rem] font-semibold tracking-[0.15em] text-muted-foreground uppercase sm:text-[0.65rem]">
        Starting from
      </span>
      <span className="mt-0.5 flex flex-wrap items-baseline gap-x-1">
        <span
          className={cn(
            "text-gradient font-bold tracking-tight",
            size === "lg" ? "text-3xl sm:text-4xl" : "text-sm sm:text-lg",
          )}
        >
          ৳{price.amount.toLocaleString("en-US")}
        </span>
        {price.period && (
          <span className="text-[0.65rem] text-muted-foreground sm:text-xs">{periodLabel[price.period]}</span>
        )}
      </span>
    </p>
  );
}

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
      <h3 className="pb-3 text-sm leading-snug font-semibold sm:text-lg">{service.title}</h3>
      {!compact && <p className="hidden pb-4 text-sm text-muted-foreground sm:block">{service.excerpt}</p>}
      <div className="mt-auto flex items-end justify-between gap-2 border-t border-dashed border-border pt-3 sm:pt-4">
        <StartingPrice price={service.startingPrice} />
        <span className="hidden size-9 shrink-0 items-center justify-center rounded-full border border-border text-accent transition-colors group-hover:border-accent group-hover:bg-accent group-hover:text-white sm:inline-flex">
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
