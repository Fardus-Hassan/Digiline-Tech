import Link from "next/link";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { Swoosh } from "@/components/decor/swoosh";
import { SocialLinks } from "@/components/site/social-links";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { CurrentYear } from "@/components/site/current-year";
import { getServices, getSiteSettings } from "@/lib/content";

const quickLinks = [
  { href: "/", label: "Home" },
  { href: "/services", label: "Services" },
  { href: "/case-studies", label: "Case Studies" },
  { href: "/about", label: "About Us" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy-policy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms & Conditions" },
];

export async function Footer() {
  const [site, services] = await Promise.all([getSiteSettings(), getServices()]);

  return (
    <footer className="dark relative overflow-hidden border-t border-border bg-background pb-[calc(8.5rem+env(safe-area-inset-bottom))] text-foreground sm:pb-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-20">
        <div className="lg:col-span-4">
          <Logo showTagline />
          <p className="mt-5 max-w-xs text-sm text-muted-foreground">{site.description}</p>
          <SocialLinks socials={site.socials} className="mt-6" />
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-semibold">Quick Links</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {quickLinks.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-muted-foreground transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-semibold">Services</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.slice(0, 5).map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/services/${s.slug}`}
                  className="text-muted-foreground transition-colors hover:text-accent"
                >
                  {s.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-semibold">Stay Updated</h3>
          <p className="mt-4 text-sm text-muted-foreground">Get the latest tips, resources and updates.</p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <Mail className="size-4 text-accent" /> {site.email}
            </li>
            <li className="flex items-center gap-2">
              <Phone className="size-4 text-accent" /> {site.phone}
            </li>
            <li className="flex items-center gap-2">
              <MapPin className="size-4 text-accent" /> {site.location}
            </li>
          </ul>
        </div>
      </div>

      <div className="relative mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-border px-4 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          &copy; <CurrentYear /> Digiline Tech. All rights reserved.
        </p>
        <p className="flex items-center gap-2">
          <Globe className="size-3.5 text-accent" /> Bangladesh <span className="size-1 rounded-full bg-accent" />{" "}
          Global
        </p>
      </div>
      <Swoosh />
    </footer>
  );
}
