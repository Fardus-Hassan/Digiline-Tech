import { PageHero } from "@/components/site/page-hero";
import { Markdown } from "@/components/ui/markdown";
import { getSection } from "@/lib/content";

export async function LegalPage({ section }: { section: "privacy" | "terms" }) {
  const page = await getSection(section);

  return (
    <>
      <PageHero eyebrow={page.eyebrow} title={page.title} />
      <article className="mx-auto max-w-3xl px-4 py-16 text-muted-foreground sm:px-6">
        <Markdown>{page.content}</Markdown>
      </article>
    </>
  );
}
