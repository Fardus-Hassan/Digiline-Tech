import type { Metadata } from "next";
import { PageHero } from "@/components/site/page-hero";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPolicyPage() {
  return (
    <>
      <PageHero eyebrow="Legal" title="Privacy Policy" />
      <article className="mx-auto max-w-3xl space-y-5 px-4 py-16 leading-relaxed text-muted-foreground sm:px-6">
        <p>
          Digiline Tech respects your privacy. We only collect the information you share with us through our contact and
          newsletter forms, and we use it solely to respond to you and send updates you have asked for.
        </p>
        <p>We never sell your personal data. You can ask us to update or delete your information at any time.</p>
      </article>
    </>
  );
}
