import Link from "next/link";
import { ArrowUpRight, Clock } from "lucide-react";
import { StartingPrice } from "@/components/site/service-card";
import { getSection, type Entry, type SubService } from "@/lib/content";

export async function SubServiceCard({
  serviceSlug,
  subService,
  index,
}: {
  serviceSlug: string;
  subService: Entry<SubService>;
  index: number;
}) {
  const { subDetail } = await getSection("servicesPage");

  return (
    <Link
      href={`/services/${serviceSlug}/${subService.slug}`}
      data-spotlight
      data-cursor="Details"
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 transition-all duration-300 hover:-translate-y-1 hover:border-accent/60 hover:shadow-xl hover:shadow-brand-orange/10 active:scale-[0.98] sm:p-6"
    >
      <div
        aria-hidden
        className="absolute -top-12 -right-12 size-32 rounded-full bg-accent/0 blur-2xl transition-colors duration-500 group-hover:bg-accent/20"
      />
      <div className="flex items-start justify-between gap-4">
        <span className="font-mono text-sm font-bold text-accent">{String(index + 1).padStart(2, "0")}</span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-[0.7rem] text-muted-foreground">
          <Clock className="size-3" />
          {subService.turnaround}
        </span>
      </div>
      <h3 className="mt-4 text-lg leading-snug font-semibold">{subService.title}</h3>
      <p className="mt-2 pb-5 text-sm text-muted-foreground">{subService.excerpt}</p>
      <div className="mt-auto flex items-end justify-between gap-2 border-t border-dashed border-border pt-4">
        <StartingPrice price={subService.startingPrice} />
        <span className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-accent">
          {subDetail.cardButton}
          <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}
