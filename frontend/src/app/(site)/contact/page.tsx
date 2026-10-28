import { Mail, MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { PageHero } from "@/components/site/page-hero";
import { SocialLinks } from "@/components/site/social-links";
import { ContactForm } from "@/components/site/contact-form";
import { getSection, getSiteSettings } from "@/lib/content";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("contactPage");
}

export default async function ContactPage() {
  const [site, page] = await Promise.all([getSiteSettings(), getSection("contactPage")]);
  const { labels } = page;

  const details = [
    site.email && { icon: Mail, label: labels.email, value: site.email, href: `mailto:${site.email}` },
    site.phone && {
      icon: Phone,
      label: labels.phone,
      value: site.phone,
      href: `tel:${site.phone.replace(/\s/g, "")}`,
    },
    site.location && { icon: MapPin, label: labels.location, value: site.location, note: site.locationNote },
  ].filter((d) => !!d) as { icon: typeof Mail; label: string; value: string; href?: string; note?: string }[];

  return (
    <>
      <PageHero
        eyebrow={page.hero.eyebrow}
        title={page.hero.title}
        highlight={page.hero.highlight}
        description={page.hero.description}
      />

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-5 lg:px-8 lg:py-24">
        <div className="lg:col-span-2">
          <ul className="space-y-5">
            {details.map(({ icon: Icon, label, value, href, note }, i) => (
              <Reveal as="li" key={label} delay={i * 0.06} className="flex items-start gap-4">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="font-semibold">{label}</p>
                  {href ? (
                    <a href={href} className="text-muted-foreground hover:text-accent">
                      {value}
                    </a>
                  ) : (
                    <p className="text-muted-foreground">{value}</p>
                  )}
                  {note && <p className="text-sm text-muted-foreground/80">({note})</p>}
                </div>
              </Reveal>
            ))}
          </ul>
          {site.socials.length > 0 && (
            <Reveal className="mt-8">
              <p className="mb-3 font-semibold">{labels.follow}</p>
              <SocialLinks socials={site.socials} />
            </Reveal>
          )}
        </div>

        <Reveal delay={0.1} className="lg:col-span-3">
          <ContactForm labels={page.form} />
        </Reveal>
      </section>
    </>
  );
}
