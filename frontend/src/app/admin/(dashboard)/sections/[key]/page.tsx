"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { toast } from "sonner";
import { ExternalLink, History } from "lucide-react";
import { api } from "@/lib/api";
import { getSectionSchema } from "@/lib/cms/schema";
import { mergeContent, pageSeoDefaults, sectionDefaults, type SectionKey } from "@/lib/cms/defaults";
import type { Seo } from "@/lib/cms/types";
import { errorMessage, refreshSite, timeAgo } from "@/lib/admin";
import { adminButton, PageHeader, Spinner } from "@/components/admin/ui";
import { PanelCard, PanelNav } from "@/components/admin/form/panel-card";
import { SaveBar, useEditorShortcuts } from "@/components/admin/form/save-bar";
import { SeoCard } from "@/components/admin/seo-card";

type Obj = Record<string, unknown>;
type State = { data: Obj; seo: Seo };

export default function SectionEditorPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = use(params);
  const schema = getSectionSchema(key);
  if (!schema) notFound();
  return <SectionEditor key={key} sectionKey={schema.key} />;
}

function SectionEditor({ sectionKey }: { sectionKey: SectionKey }) {
  const schema = getSectionSchema(sectionKey)!;
  const [saved, setSaved] = useState<State | null>(null);
  const [draft, setDraft] = useState<State | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api<{ section: { data: Obj; seo: Seo; updatedAt: string | null } }>(`/admin/sections/${sectionKey}`)
      .then(({ section }) => {
        const state = { data: mergeContent(sectionDefaults[sectionKey], section.data) as Obj, seo: section.seo };
        setSaved(state);
        setDraft(state);
        setUpdatedAt(section.updatedAt);
      })
      .catch((err) => toast.error(errorMessage(err, "Couldn't load this section")));
  }, [sectionKey]);

  const dirty = useMemo(() => !!draft && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);

  const save = useCallback(async () => {
    if (!draft || !dirty || saving) return;
    setSaving(true);
    try {
      const { section } = await api<{ section: { updatedAt: string } }>(`/admin/sections/${sectionKey}`, {
        method: "PUT",
        body: JSON.stringify(draft),
      });
      await refreshSite(["sections"]);
      setSaved(draft);
      setUpdatedAt(section.updatedAt);
      toast.success("Saved — your website is updated");
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save"));
    } finally {
      setSaving(false);
    }
  }, [draft, dirty, saving, sectionKey]);

  useEditorShortcuts(dirty, save);

  const seoDefaults = pageSeoDefaults[sectionKey];

  return (
    <div className="mx-auto flex max-w-6xl gap-8 pb-28">
      <div className="min-w-0 flex-1">
        <PageHeader
          title={schema.label}
          description={schema.description}
          icon={schema.icon}
          actions={
            schema.path && (
              <Link href={schema.path} target="_blank" className={adminButton("secondary", "md")}>
                <ExternalLink /> View page
              </Link>
            )
          }
        >
          <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            {schema.group}
            {updatedAt && (
              <>
                <span>·</span>
                <History className="size-3" /> Saved {timeAgo(updatedAt)}
              </>
            )}
          </p>
        </PageHeader>

        {!draft ? (
          <Spinner />
        ) : (
          <div className="space-y-6">
            {schema.panels.map((panel) => (
              <PanelCard key={panel.title} panel={panel} value={draft.data} onChange={(data) => setDraft({ ...draft, data })} />
            ))}
            {schema.seo && seoDefaults && (
              <SeoCard
                value={draft.seo}
                onChange={(seo) => setDraft({ ...draft, seo })}
                fallbackTitle={seoDefaults.title ?? sectionDefaults.seo.titleDefault}
                fallbackDescription={seoDefaults.description}
                path={seoDefaults.path}
              />
            )}
          </div>
        )}
      </div>

      <PanelNav panels={schema.panels} extra={schema.seo ? [{ id: "seo", label: "SEO" }] : undefined} />

      <SaveBar dirty={dirty} saving={saving} onSave={save} onDiscard={() => setDraft(saved)} />
    </div>
  );
}
