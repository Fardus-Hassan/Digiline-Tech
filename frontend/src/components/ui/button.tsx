import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-accent-gradient text-accent-foreground shadow-lg shadow-brand-orange/25 hover:shadow-brand-orange/40 hover:-translate-y-0.5",
  outline: "border border-foreground/25 text-foreground hover:border-accent hover:text-accent",
  ghost: "text-foreground hover:text-accent",
};

const sizes = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-sm",
  lg: "h-12 px-6 text-base",
};

export type ButtonVariant = keyof typeof variants;
export type ButtonSize = keyof typeof sizes;

export function buttonClasses(variant: ButtonVariant = "primary", size: ButtonSize = "md", className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 select-none active:scale-[0.96] disabled:pointer-events-none disabled:opacity-60",
    variants[variant],
    sizes[size],
    className,
  );
}

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: ButtonVariant; size?: ButtonSize };

export function ButtonLink({ variant = "primary", size, className, ...props }: ButtonLinkProps) {
  return (
    <Link
      data-magnetic={variant === "primary" || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}

type ButtonProps = ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize };

export function Button({ variant = "primary", size, className, ...props }: ButtonProps) {
  return (
    <button
      data-magnetic={variant === "primary" || undefined}
      className={buttonClasses(variant, size, className)}
      {...props}
    />
  );
}
