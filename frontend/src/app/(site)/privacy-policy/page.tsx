import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("privacy");
}

export default function PrivacyPolicyPage() {
  return <LegalPage section="privacy" />;
}
