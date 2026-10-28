import { LegalPage } from "@/components/site/legal-page";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return pageMetadata("terms");
}

export default function TermsPage() {
  return <LegalPage section="terms" />;
}
