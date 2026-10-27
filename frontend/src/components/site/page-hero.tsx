import { Swoosh } from "@/components/decor/swoosh";
import { FadeUp } from "@/components/animations/fade-up";
import { Eyebrow } from "@/components/ui/section-heading";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  highlight?: string;
  description?: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
  className?: string;
};

/** Always-dark page header used at the top of inner pages. */
export function PageHero({ eyebrow, title, highlight, description, children, aside, className }: PageHeroProps) {
  return (
    <section
      className={cn(
        "dark relative overflow-hidden bg-background pt-28 pb-24 text-foreground sm:pt-36 sm:pb-32",
        className,
      )}
    >
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 size-[28rem] rounded-full bg-brand-blue/25 blur-3xl" />
        <div className="absolute -right-24 bottom-0 size-[22rem] rounded-full bg-brand-orange/15 blur-3xl" />
      </div>
      <div
        className={cn(
          "relative mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:px-8",
          aside && "items-center lg:grid-cols-2",
        )}
      >
        <div>
          <FadeUp>
            <Eyebrow className="mb-4">{eyebrow}</Eyebrow>
          </FadeUp>
          <FadeUp delay={0.1}>
            <h1 className="text-4xl leading-[1.1] font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
              {title}
              {highlight && (
                <>
                  <br />
                  <span className="text-gradient">{highlight}</span>
                </>
              )}
            </h1>
          </FadeUp>
          {description && (
            <FadeUp delay={0.2}>
              <p className="mt-5 max-w-xl text-base text-muted-foreground sm:text-lg">{description}</p>
            </FadeUp>
          )}
          {children && <FadeUp delay={0.3}>{children}</FadeUp>}
        </div>
        {aside && <FadeUp delay={0.25}>{aside}</FadeUp>}
      </div>
      <Swoosh />
    </section>
  );
}
