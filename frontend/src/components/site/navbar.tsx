"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, ChevronDown, Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo, LogoMark, type Brand } from "@/components/logo";
import { SocialLinks } from "@/components/site/social-links";
import { ButtonLink } from "@/components/ui/button";
import type { SectionData, SocialPlatform } from "@/lib/cms/defaults";
import { cn } from "@/lib/utils";

type NavItem = { href: string; label: string; icon: React.ReactNode; children?: { href: string; label: string }[] };

type NavbarProps = {
  brand: Brand;
  navigation: SectionData<"navigation">;
  /** Icons rendered on the server, in the same order as `navigation.items`. */
  icons: { items: React.ReactNode[]; mobileCard: React.ReactNode };
  services: { slug: string; title: string }[];
  socials: { platform: SocialPlatform; url: string }[];
};

export function Navbar({ brand, navigation, icons, services, socials }: NavbarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);

  const items: NavItem[] = navigation.items.map((item, i) => ({
    href: item.href,
    label: item.label,
    icon: icons.items[i],
    children: item.servicesDropdown
      ? [
          { href: "/services", label: navigation.allServicesLabel },
          ...services.map((s) => ({ href: `/services/${s.slug}`, label: s.title })),
        ]
      : undefined,
  }));
  const { cta, mobileCard } = navigation;

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => {
    setOpen(false);
    setExpanded(null);
  };

  return (
    <>
      <header
        className={cn(
          "dark fixed inset-x-0 top-0 z-50 text-foreground transition-all duration-300",
          scrolled
            ? "border-b border-border bg-background/95 shadow-lg shadow-black/20 backdrop-blur-lg"
            : "bg-transparent",
        )}
      >
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-20 sm:px-6 lg:px-8">
          <Logo brand={brand} />

          <ul className="hidden items-center gap-7 lg:flex">
            {items.map((item) => (
              <li key={item.href} className="group relative">
                <Link
                  href={item.href}
                  className={cn(
                    "inline-flex items-center gap-1 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                    isActive(item.href) && "text-foreground",
                  )}
                >
                  {item.label}
                  {item.children && <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180" />}
                </Link>
                {isActive(item.href) && (
                  <motion.span
                    layoutId="nav-underline"
                    className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-accent-gradient"
                  />
                )}
                {item.children && (
                  <div className="invisible absolute top-full left-1/2 w-64 -translate-x-1/2 translate-y-2 pt-3 opacity-0 transition-all duration-200 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                    <ul className="rounded-2xl border border-border bg-card p-2 shadow-2xl">
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2">
            <ThemeToggle className="hidden sm:inline-flex" />
            {cta.label && (
              <ButtonLink href={cta.href} size="sm" className="hidden lg:inline-flex">
                {cta.label}
              </ButtonLink>
            )}
            <button
              type="button"
              aria-label="Open menu"
              aria-expanded={open}
              onClick={() => setOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-lg lg:hidden"
            >
              <Menu className="size-6" />
            </button>
          </div>
        </nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 32, stiffness: 300 }}
            className="fixed inset-0 z-[60] flex h-dvh flex-col overflow-y-auto bg-background text-foreground transition-colors duration-500 lg:hidden"
          >
            <div className="flex h-16 shrink-0 items-center justify-between px-4 sm:h-20 sm:px-6">
              <Link href="/" onClick={close} aria-label={`${brand.siteName} home`}>
                <LogoMark brand={brand} />
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  aria-label="Close menu"
                  onClick={close}
                  className="inline-flex size-10 items-center justify-center rounded-lg"
                >
                  <X className="size-6" />
                </button>
              </div>
            </div>

            <ul className="space-y-1 px-4 pt-4 sm:px-6">
              {items.map((item, i) => {
                const isOpen = expanded === item.href;
                return (
                  <motion.li
                    key={item.href}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.04 }}
                  >
                    <div
                      className={cn(
                        "flex items-center rounded-xl transition-colors",
                        isActive(item.href) ? "bg-accent/10 text-accent" : "text-foreground hover:bg-muted",
                      )}
                    >
                      <Link
                        href={item.href}
                        onClick={close}
                        className="flex flex-1 items-center gap-4 px-4 py-3.5 font-medium"
                      >
                        <span
                          className={cn(
                            "inline-flex [&_svg]:size-5",
                            isActive(item.href) ? "text-accent" : "text-muted-foreground",
                          )}
                        >
                          {item.icon}
                        </span>
                        {item.label}
                      </Link>
                      {item.children && (
                        <button
                          type="button"
                          aria-label={`Toggle ${item.label}`}
                          aria-expanded={isOpen}
                          onClick={() => setExpanded(isOpen ? null : item.href)}
                          className="px-4 py-3.5"
                        >
                          <ChevronDown
                            className={cn("size-5 transition-transform", isOpen ? "rotate-180" : "-rotate-90")}
                          />
                        </button>
                      )}
                    </div>
                    <AnimatePresence initial={false}>
                      {item.children && isOpen && (
                        <motion.ul
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="ml-9 overflow-hidden border-l border-border"
                        >
                          {item.children.map((child) => (
                            <li key={child.href}>
                              <Link
                                href={child.href}
                                onClick={close}
                                className="block px-4 py-2.5 text-sm text-muted-foreground hover:text-accent"
                              >
                                {child.label}
                              </Link>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="mx-4 mt-8 rounded-2xl border border-border bg-muted/60 p-5 transition-colors duration-500 sm:mx-6"
            >
              <p className="flex items-center gap-2 font-semibold">
                <span className="inline-flex text-accent [&_svg]:size-5">{icons.mobileCard}</span>
                {mobileCard.title}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{mobileCard.text}</p>
              {mobileCard.buttonLabel && (
                <ButtonLink href={mobileCard.buttonHref} onClick={close} className="mt-4 w-full">
                  {mobileCard.buttonLabel} <ArrowRight className="size-4" />
                </ButtonLink>
              )}
            </motion.div>

            <SocialLinks socials={socials} variant="plain" className="mt-auto px-4 py-8 sm:px-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
