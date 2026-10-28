import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";
import { getSection, getSiteSettings } from "@/lib/content";

export default async function NotFound() {
  const [page, site] = await Promise.all([getSection("notFound"), getSiteSettings()]);

  return (
    <main className="dark flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <LogoMark brand={site} className="h-14" />
      <p className="mt-8 text-gradient text-7xl font-bold">404</p>
      <h1 className="mt-2 text-2xl font-bold">{page.title}</h1>
      <p className="mt-2 text-muted-foreground">{page.text}</p>
      <ButtonLink href="/" className="mt-8">
        <ArrowLeft className="size-4" /> {page.buttonLabel}
      </ButtonLink>
    </main>
  );
}
