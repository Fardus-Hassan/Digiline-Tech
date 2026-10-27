import { ArrowLeft } from "lucide-react";
import { ButtonLink } from "@/components/ui/button";
import { LogoMark } from "@/components/logo";

export default function NotFound() {
  return (
    <main className="dark flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <LogoMark className="h-14" />
      <p className="mt-8 text-gradient text-7xl font-bold">404</p>
      <h1 className="mt-2 text-2xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground">The page you&apos;re looking for doesn&apos;t exist or was moved.</p>
      <ButtonLink href="/" className="mt-8">
        <ArrowLeft className="size-4" /> Back to home
      </ButtonLink>
    </main>
  );
}
