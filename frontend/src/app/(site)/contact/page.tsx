import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { Reveal } from "@/components/animations/reveal";
import { PageHero } from "@/components/site/page-hero";
import { SocialLinks } from "@/components/site/social-links";
import { ContactForm } from "@/components/site/contact-form";
import { getSiteSettings } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Have a project in mind? Get in touch with Digiline Tech.",
};

export default async function ContactPage() {
  const site = await getSiteSettings();

  const details = [
    { icon: Mail, label: "Email", value: site.email, href: `mailto:${site.email}` },
    { icon: Phone, label: "Phone", value: site.phone, href: `tel:${site.phone.replace(/\s/g, "")}` },
    { icon: MapPin, label: "Location", value: site.location, note: site.locationNote },
  ];

  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="Let's Work"
        highlight="Together"
        description="Have a project in mind? We're here to help. Reach out and let's create something great together."
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
          <Reveal className="mt-8">
            <p className="mb-3 font-semibold">Follow us</p>
            <SocialLinks socials={site.socials} />
          </Reveal>
        </div>

        <Reveal delay={0.1} className="lg:col-span-3">
          <ContactForm />
        </Reveal>
      </section>
    </>
  );
}
