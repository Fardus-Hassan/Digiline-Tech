"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Video with native controls that starts when it scrolls into view and pauses when it leaves.
 * Browsers only allow autoplay with sound after the visitor has interacted with the site,
 * so it falls back to muted playback and the visitor can unmute from the controls.
 * A manual pause is respected until the visitor presses play again.
 */
export function StoryVideo({
  src,
  poster,
  className,
  label,
  onPlayingChange,
}: {
  src: string;
  poster?: string;
  className?: string;
  label: string;
  onPlayingChange?: (playing: boolean) => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const autoPausing = useRef(false);
  const userPaused = useRef(false);

  useEffect(() => {
    const video = ref.current;
    if (!video || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const start = async () => {
      if (userPaused.current) return;
      if (video.preload === "none") video.preload = "auto";
      try {
        await video.play();
      } catch {
        video.muted = true;
        await video.play().catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          start();
        } else if (!video.paused) {
          autoPausing.current = true;
          video.pause();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, [src]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster || undefined}
      aria-label={label}
      controls
      loop
      playsInline
      preload="none"
      onPlay={() => (userPaused.current = false)}
      onPlaying={() => onPlayingChange?.(true)}
      onPause={() => {
        userPaused.current = !autoPausing.current;
        autoPausing.current = false;
        onPlayingChange?.(false);
      }}
      className={cn("size-full object-cover", className)}
    />
  );
}
