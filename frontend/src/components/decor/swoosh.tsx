import { cn } from "@/lib/utils";

/** Orange + blue curved ribbons inspired by the DT logo swoosh. */
export function Swoosh({ className, flip = false }: { className?: string; flip?: boolean }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 400 160"
      preserveAspectRatio="none"
      className={cn(
        "pointer-events-none absolute inset-x-0 bottom-0 h-24 w-full sm:h-32",
        flip && "-scale-x-100",
        className,
      )}
    >
      <defs>
        <linearGradient id="swoosh-orange" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#fe4602" stopOpacity="0" />
          <stop offset="45%" stopColor="#fe4602" />
          <stop offset="100%" stopColor="#fc7100" />
        </linearGradient>
        <linearGradient id="swoosh-blue" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#0057af" stopOpacity="0" />
          <stop offset="100%" stopColor="#0057af" />
        </linearGradient>
      </defs>
      <path d="M0 150 C 140 150, 260 110, 400 30 L 400 160 L 0 160 Z" fill="url(#swoosh-blue)" opacity="0.55" />
      <path d="M60 160 C 190 140, 300 100, 400 60 L 400 90 C 300 125, 200 150, 120 160 Z" fill="url(#swoosh-orange)" />
    </svg>
  );
}
