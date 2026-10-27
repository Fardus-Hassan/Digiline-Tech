"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { StoryVideo } from "@/components/ui/story-video";
import { cn } from "@/lib/utils";

export function VideoCard() {
  const [playing, setPlaying] = useState(false);

  return (
    <div className="dark group relative overflow-hidden rounded-3xl border border-border text-foreground">
      <div className="relative aspect-[16/10] sm:aspect-[21/9]">
        <StoryVideo label="The Digiline Tech team at work" onPlayingChange={setPlaying} className="absolute inset-0" />
        <div
          className={cn(
            "pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent transition-opacity duration-500",
            playing && "opacity-60",
          )}
        />
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center transition-all duration-500 sm:size-20",
            playing && "scale-75 opacity-0",
          )}
        >
          <span className="absolute inset-0 animate-ping rounded-full bg-accent/40" />
          <span className="relative flex size-full items-center justify-center rounded-full bg-accent-gradient shadow-lg shadow-brand-orange/40">
            <Play className="ml-1 size-6 fill-white text-white sm:size-8" />
          </span>
        </span>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-5 pb-16 sm:p-8 sm:pb-20">
          <p className="max-w-md text-lg leading-snug font-bold sm:text-2xl">
            Strategy. Creativity. Technology. Real Business Growth.
          </p>
          <Link
            href="/about"
            className="pointer-events-auto mt-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-accent"
          >
            Watch Our Story <ArrowRight className="size-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
