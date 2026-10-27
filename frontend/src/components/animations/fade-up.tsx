import { cn } from "@/lib/utils";

type FadeUpProps = React.ComponentProps<"div"> & { delay?: number };

/** CSS entrance animation for above-the-fold content; use `Reveal` for scroll-triggered sections. */
export function FadeUp({ delay = 0, className, style, ...props }: FadeUpProps) {
  return (
    <div className={cn("animate-fade-up", className)} style={{ animationDelay: `${delay}s`, ...style }} {...props} />
  );
}
