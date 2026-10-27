import { SmartImage } from "@/components/ui/smart-image";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";

export function VideoCard({ image = "/images/office.jpg" }: { image?: string }) {
  return (
    <Link
      href="/about"
      data-cursor="Play"
      className="dark group relative block overflow-hidden rounded-3xl border border-border text-foreground"
    >
      <div className="relative aspect-[16/10] sm:aspect-[21/9]">
        <SmartImage
          src={image}
          alt="Inside the Digiline Tech office"
          fill
          sizes="(min-width: 1024px) 1200px, 100vw"
          className="object-cover duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <span className="absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center sm:size-20">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
          <span className="relative flex size-full items-center justify-center rounded-full bg-accent-gradient shadow-lg shadow-brand-orange/40">
            <Play className="ml-1 size-6 fill-white text-white sm:size-8" />
          </span>
        </span>
        <div className="absolute inset-x-0 bottom-0 p-5 sm:p-8">
          <p className="max-w-md text-lg leading-snug font-bold sm:text-2xl">
            Strategy. Creativity. Technology. Real Business Growth.
          </p>
          <span className="mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground group-hover:text-accent">
            Watch Our Story <ArrowRight className="size-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
