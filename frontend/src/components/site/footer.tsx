import Link from "next/link";
import { Fragment } from "react";
import { Globe, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/logo";
import { Swoosh } from "@/components/decor/swoosh";
import { SocialLinks } from "@/components/site/social-links";
import { NewsletterForm } from "@/components/site/newsletter-form";
import { CurrentYear } from "@/components/site/current-year";
import { getSection, getServices, getSiteSettings } from "@/lib/content";

export async function Footer() {
  const [site, footer, services] = await Promise.all([getSiteSettings(), getSection("footer"), getServices()]);

  return (
    <footer className="dark relative overflow-hidden border-t border-border bg-background pb-[calc(8.5rem+env(safe-area-inset-bottom))] text-foreground sm:pb-32">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 pt-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:pt-20">
        <div className="lg:col-span-4">
          <Logo brand={site} showTagline />
          <p className="mt-5 max-w-xs text-sm text-muted-foreground">{site.description}</p>
          <SocialLinks socials={site.socials} className="mt-6" />
        </div>

        <div className="lg:col-span-3">
          <h3 className="font-semibold">{footer.quickLinksTitle}</h3>
          <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
            {footer.quickLinks.map((link, i) => (
              <li key={i}>
                <Link href={link.href} className="text-muted-foreground transition-colors hover:text-accent">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-2">
          <h3 className="font-semibold">{footer.servicesTitle}</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {services.slice(0, footer.servicesCount).map((s) => (
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
          <h3 className="font-semibold">{footer.newsletterTitle}</h3>
          <p className="mt-4 text-sm text-muted-foreground">{footer.newsletterText}</p>
          <div className="mt-4">
            <NewsletterForm placeholder={footer.newsletterPlaceholder} successText={footer.newsletterSuccess} />
          </div>
          <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
            {site.email && (
              <li className="flex items-center gap-2">
                <Mail className="size-4 shrink-0 text-accent" />
                <a href={`mailto:${site.email}`} className="hover:text-accent">
                  {site.email}
                </a>
              </li>
            )}
            {site.phone && (
              <li className="flex items-center gap-2">
                <Phone className="size-4 shrink-0 text-accent" />
                <a href={`tel:${site.phone.replace(/\s/g, "")}`} className="hover:text-accent">
                  {site.phone}
                </a>
              </li>
            )}
            {site.location && (
              <li className="flex items-center gap-2">
                <MapPin className="size-4 shrink-0 text-accent" /> {site.location}
              </li>
            )}
          </ul>
        </div>
      </div>

      <div className="relative mx-auto mt-12 flex max-w-7xl flex-col gap-3 border-t border-border px-4 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p>
          &copy; <CurrentYear /> {footer.copyright}
        </p>
        {footer.regions.length > 0 && (
          <p className="flex items-center gap-2">
            <Globe className="size-3.5 text-accent" />
            {footer.regions.map((region, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="size-1 rounded-full bg-accent" />}
                {region}
              </Fragment>
            ))}
          </p>
        )}
      </div>
      <Swoosh />
    </footer>
  );
}
