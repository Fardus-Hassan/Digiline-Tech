import { Navbar } from "@/components/site/navbar";
import { ScrollProgress } from "@/components/animations/scroll-progress";
import { MagneticEffects } from "@/components/animations/magnetic-effects";
import { SmoothScroll } from "@/components/animations/smooth-scroll";
import { CustomCursor } from "@/components/animations/custom-cursor";
import { IntroLoader } from "@/components/animations/intro-loader";
import { Footer } from "@/components/site/footer";
import { BottomNav } from "@/components/site/bottom-nav";
import { getServices, getSiteSettings } from "@/lib/content";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [site, services] = await Promise.all([getSiteSettings(), getServices()]);

  return (
    <>
      <IntroLoader />
      <SmoothScroll />
      <ScrollProgress />
      <MagneticEffects />
      <CustomCursor />
      <Navbar services={services.map(({ slug, title }) => ({ slug, title }))} socials={site.socials} />
      <main className="flex-1">{children}</main>
      <Footer />
      <BottomNav />
      <div aria-hidden className="grain pointer-events-none fixed inset-0 z-[80] opacity-[0.04]" />
    </>
  );
}
