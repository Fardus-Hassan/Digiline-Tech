import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = { title: "Terms & Conditions" };

export default function TermsPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Terms & Conditions" />
      <article className="mx-auto max-w-3xl space-y-5 px-4 py-16 leading-relaxed text-muted-foreground sm:px-6">
        <p>
          By using this website you agree to these terms. All content on this site belongs to Digiline Tech unless
          stated otherwise.
        </p>
        <p>Project terms, timelines and payments are agreed separately in each client proposal.</p>
      </article>
    </>
  );
}
