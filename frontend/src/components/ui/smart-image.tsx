"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";
import { imagePlaceholders } from "@/lib/image-placeholders";
import { cn } from "@/lib/utils";

/**
 * `next/image` with a blur-up reveal: shows the generated blur placeholder (or a pulsing skeleton for images
 * without one, e.g. CMS uploads) and sharpens into the real image once it loads.
 */
export function SmartImage({ src, alt, className, onLoad, ...props }: ImageProps) {
  const [loaded, setLoaded] = useState(false);
  const blur = typeof src === "string" ? imagePlaceholders[src] : undefined;

  return (
    <Image
      src={src}
      alt={alt}
      placeholder={blur ? "blur" : "empty"}
      blurDataURL={blur}
      onLoad={(e) => {
        setLoaded(true);
        onLoad?.(e);
      }}
      className={cn(
        "transition-[filter,transform,opacity] duration-700 ease-out",
        loaded ? "blur-0" : blur ? "scale-[1.04] blur-lg" : "animate-pulse bg-muted",
        className,
      )}
      {...props}
    />
  );
}
