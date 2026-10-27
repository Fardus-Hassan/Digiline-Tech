import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

type LogoProps = {
  href?: string;
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  suffix?: string;
};

export function LogoMark({ className }: { className?: string }) {
  return (
    <Image
      src="/logo.png"
      alt="Digiline Tech logo"
      width={127}
      height={80}
      preload
      className={cn("h-9 w-auto dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]", className)}
    />
  );
}

export function Logo({ href = "/", className, showText = true, showTagline = false, suffix }: LogoProps) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)} aria-label="Digiline Tech home">
      <LogoMark />
      {showText && (
        <>
          <span aria-hidden className="h-8 w-px bg-border" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight sm:text-xl">
              <span className="text-brand-navy dark:text-white">Digiline</span>{" "}
              <span className="text-brand-orange">Tech</span>
              {suffix && <span className="ml-1.5 text-sm font-medium text-muted-foreground">{suffix}</span>}
            </span>
            {showTagline && (
              <span className="mt-1 flex items-center gap-1.5 text-[0.55rem] font-medium tracking-[0.2em] text-brand-navy uppercase dark:text-white/80">
                Marketing <Dot /> Web <Dot /> IT Solutions
              </span>
            )}
          </span>
        </>
      )}
    </Link>
  );
}

function Dot() {
  return <span className="size-1 rounded-full bg-brand-orange" />;
}
