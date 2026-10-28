import { Navbar } from "@/components/site/navbar";
import { ScrollProgress } from "@/components/animations/scroll-progress";
import { MagneticEffects } from "@/components/animations/magnetic-effects";
import { SmoothScroll } from "@/components/animations/smooth-scroll";
import { CustomCursor } from "@/components/animations/custom-cursor";
import { IntroLoader } from "@/components/animations/intro-loader";
import { Footer } from "@/components/site/footer";
import { BottomNav } from "@/components/site/bottom-nav";
import { DynamicIcon } from "@/components/site/icon-map";
import { JsonLd } from "@/components/seo/json-ld";
import { getSection, getServices, getSiteSettings } from "@/lib/content";
import { organizationJsonLd } from "@/lib/seo";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, navigation, intro, seo, services] = await Promise.all([
    getSiteSettings(),
    getSection("navigation"),
    getSection("intro"),
    getSection("seo"),
    getServices(),
  ]);

  return (
    <>
      <JsonLd data={organizationJsonLd(site, seo)} />
      {intro.enabled && <IntroLoader brand={site} intro={intro} />}
      <SmoothScroll />
      <ScrollProgress />
      <MagneticEffects />
      <CustomCursor />
      <Navbar
        brand={site}
        navigation={navigation}
        icons={{
          items: navigation.items.map((item, i) => <DynamicIcon key={i} name={item.icon} />),
          mobileCard: <DynamicIcon name={navigation.mobileCard.icon} />,
        }}
        services={services.map(({ slug, title }) => ({ slug, title }))}
        socials={site.socials}
      />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav
        tabs={navigation.bottomTabs.map((tab) => ({ ...tab, icon: <DynamicIcon name={tab.icon} /> }))}
        center={{ ...navigation.bottomCenter, icon: <DynamicIcon name={navigation.bottomCenter.icon} /> }}
      />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[80] opacity-[0.04]" />
    </>
  );
}
