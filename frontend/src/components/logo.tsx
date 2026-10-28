import Image from "next/image";
import Link from "next/link";
import { Fragment } from "react";
import { sectionDefaults } from "@/lib/cms/defaults";
import { cn } from "@/lib/utils";

export type Brand = Pick<
  typeof sectionDefaults.settings,
  "logo" | "logoAlt" | "brandFirst" | "brandSecond" | "tagline" | "siteName"
>;

const defaultBrand: Brand = sectionDefaults.settings;

type LogoProps = {
  brand?: Brand;
  href?: string;
  className?: string;
  showText?: boolean;
  showTagline?: boolean;
  suffix?: string;
};

export function LogoMark({ brand = defaultBrand, className }: { brand?: Brand; className?: string }) {
  return (
    <Image
      src={brand.logo || defaultBrand.logo}
      alt={brand.logoAlt}
      width={127}
      height={80}
      preload
      className={cn("h-9 w-auto dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.35)]", className)}
    />
  );
}

export function Logo({ brand = defaultBrand, href = "/", className, showText = true, showTagline = false, suffix }: LogoProps) {
  const taglineParts = brand.tagline.split("•").map((part) => part.trim()).filter(Boolean);

  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)} aria-label={`${brand.siteName} home`}>
      <LogoMark brand={brand} />
      {showText && (
        <>
          <span aria-hidden className="h-8 w-px bg-border" />
          <span className="flex flex-col leading-none">
            <span className="text-lg font-bold tracking-tight sm:text-xl">
              <span className="text-brand-navy dark:text-white">{brand.brandFirst}</span>{" "}
              <span className="text-brand-orange">{brand.brandSecond}</span>
              {suffix && <span className="ml-1.5 text-sm font-medium text-muted-foreground">{suffix}</span>}
            </span>
            {showTagline && taglineParts.length > 0 && (
              <span className="mt-1 flex items-center gap-1.5 text-[0.55rem] font-medium tracking-[0.2em] text-brand-navy uppercase dark:text-white/80">
                {taglineParts.map((part, i) => (
                  <Fragment key={i}>
                    {i > 0 && <Dot />}
                    {part}
                  </Fragment>
                ))}
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
