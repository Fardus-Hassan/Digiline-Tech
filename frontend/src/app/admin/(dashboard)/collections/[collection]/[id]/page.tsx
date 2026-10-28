"use client";

import { use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { ChevronLeft, Copy, ExternalLink, Link2, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { emptyEntryData, getCollectionSchema, type CollectionSchema } from "@/lib/cms/schema";
import type { Seo } from "@/lib/cms/types";
import { entryTitle, errorMessage, refreshSite, slugify, tagsForCollection, timeAgo, type AdminEntry, type EntryStatus } from "@/lib/admin";
import { AdminButton, adminButton, Card, inputClass, SegmentedControl, Spinner, StatusBadge, useConfirm } from "@/components/admin/ui";
import { PanelCard, PanelNav } from "@/components/admin/form/panel-card";
import { SaveBar, useEditorShortcuts } from "@/components/admin/form/save-bar";
import { SeoCard } from "@/components/admin/seo-card";
import { EntryList } from "@/components/admin/entry-list";
import { cn } from "@/lib/utils";

type Obj = Record<string, unknown>;
type State = { slug: string; status: EntryStatus; parentId: string | null; data: Obj; seo: Seo };

export default function EntryEditorPage({ params }: { params: Promise<{ collection: string; id: string }> }) {
  const { collection, id } = use(params);
  const schema = getCollectionSchema(collection);
  if (!schema) notFound();
  return <EntryEditor key={`${collection}/${id}`} schema={schema} id={id} />;
}

function EntryEditor({ schema, id }: { schema: CollectionSchema; id: string }) {
  const router = useRouter();
  const confirm = useConfirm();
  const isNew = id === "new";
  const parentFromQuery = useSearchParams().get("parent");

  const [initial] = useState<State | null>(() =>
    isNew ? { slug: "", status: "PUBLISHED", parentId: parentFromQuery, data: emptyEntryData(schema), seo: null } : null,
  );
  const [saved, setSaved] = useState<State | null>(initial);
  const [draft, setDraft] = useState<State | null>(initial);
  const [entry, setEntry] = useState<AdminEntry | null>(null);
  const [parents, setParents] = useState<AdminEntry[]>([]);
  const [saving, setSaving] = useState(false);
  const [slugError, setSlugError] = useState<string>();
  // While creating, the slug follows the title until it's edited by hand.
  const slugTouched = useRef(!isNew);

  useEffect(() => {
    if (isNew) return;
    api<{ entry: AdminEntry }>(`/admin/entries/${schema.key}/${id}`)
      .then(({ entry }) => {
        const state: State = { slug: entry.slug, status: entry.status, parentId: entry.parentId, data: { ...emptyEntryData(schema), ...entry.data }, seo: entry.seo };
        setEntry(entry);
        setSaved(state);
        setDraft(state);
      })
      .catch((err) => {
        toast.error(errorMessage(err, "Couldn't load this item"));
        router.replace(`/admin/collections/${schema.parent ?? schema.key}`);
      });
  }, [id, isNew, router, schema]);

  useEffect(() => {
    if (!schema.parent) return;
    api<{ entries: AdminEntry[] }>(`/admin/entries/${schema.parent}`)
      .then(({ entries }) => setParents(entries))
      .catch(() => {});
  }, [schema.parent]);

  const dirty = useMemo(() => !!draft && JSON.stringify(draft) !== JSON.stringify(saved), [draft, saved]);
  const parent = parents.find((p) => p.id === draft?.parentId) ?? entry?.parent ?? null;
  const parentSchema = schema.parent ? getCollectionSchema(schema.parent) : undefined;
  const backHref = schema.parent && parent ? `/admin/collections/${schema.parent}/${parent.id}` : `/admin/collections/${schema.key}`;
  const backLabel = schema.parent && parent ? entryTitle(parent.data, parentSchema?.titleField) : schema.label;

  const updateData = (data: Obj) => {
    setDraft((d) => {
      if (!d) return d;
      const next = { ...d, data };
      if (!slugTouched.current) next.slug = slugify(entryTitle(data, schema.titleField) === "Untitled" ? "" : entryTitle(data, schema.titleField));
      return next;
    });
  };

  const save = useCallback(async () => {
    if (!draft || saving || (!dirty && !isNew)) return;
    if (!draft.slug) {
      setSlugError("Add a URL slug");
      toast.error("Add a title or URL slug first");
      return;
    }
    if (schema.parent && !draft.parentId) {
      toast.error(`Choose a ${parentSchema?.singular.toLowerCase() ?? "parent"} first`);
      return;
    }
    setSaving(true);
    setSlugError(undefined);
    try {
      const { entry: result } = await api<{ entry: AdminEntry }>(isNew ? `/admin/entries/${schema.key}` : `/admin/entries/${schema.key}/${id}`, {
        method: isNew ? "POST" : "PUT",
        body: JSON.stringify(draft),
      });
      await refreshSite(tagsForCollection(schema.key));
      setSaved(draft);
      toast.success(draft.status === "PUBLISHED" ? "Saved — live on your website" : "Saved as draft");
      if (isNew) router.replace(`/admin/collections/${schema.key}/${result.id}`);
      else setEntry((e) => (e ? { ...e, ...result, parent: e.parent } : e));
    } catch (err) {
      if (err instanceof ApiError && err.errors?.slug) setSlugError(err.errors.slug[0]);
      toast.error(errorMessage(err, "Couldn't save"));
    } finally {
      setSaving(false);
    }
  }, [draft, saving, dirty, isNew, schema.parent, schema.key, parentSchema, id, router]);

  useEditorShortcuts(dirty, save);

  async function duplicate() {
    try {
      const { entry: copy } = await api<{ entry: AdminEntry }>(`/admin/entries/${schema.key}/${id}/duplicate`, { method: "POST" });
      toast.success("Duplicated as a draft");
      router.push(`/admin/collections/${schema.key}/${copy.id}`);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function remove() {
    const ok = await confirm({
      title: `Delete this ${schema.singular.toLowerCase()}?`,
      description: schema.child ? `All its ${schema.child.label.toLowerCase()} will be deleted too. This can't be undone.` : "It will be removed from your website. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/admin/entries/${schema.key}/${id}`, { method: "DELETE" });
      await refreshSite(tagsForCollection(schema.key));
      setSaved(draft);
      toast.success("Deleted");
      router.replace(backHref);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  if (!draft) return <Spinner />;

  const title = entryTitle(draft.data, schema.titleField);
  const publicPath = schema.path?.(draft.slug || "your-url", parent?.slug);
  const liveHref = !isNew && saved?.status === "PUBLISHED" && saved.slug ? schema.path?.(saved.slug, parent?.slug) : undefined;
  const childSchema = schema.child ? getCollectionSchema(schema.child.collection) : undefined;
  const extraNav = [
    ...(childSchema && !isNew ? [{ id: "children", label: schema.child!.label }] : []),
    ...(schema.seo ? [{ id: "seo", label: "SEO" }] : []),
  ];
  const description = String(draft.data.description ?? draft.data.excerpt ?? draft.data.summary ?? draft.data.quote ?? "");

  return (
    <div className="mx-auto max-w-7xl pb-28">
      <div className="mb-6">
        <Link href={backHref} className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ChevronLeft className="size-4" /> {backLabel}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <h1 className="truncate text-2xl font-semibold tracking-tight">{isNew && title === "Untitled" ? `New ${schema.singular.toLowerCase()}` : title}</h1>
              {!isNew && saved && <StatusBadge status={saved.status} />}
            </div>
            {entry && <p className="mt-1 text-sm text-muted-foreground">Last saved {timeAgo(entry.updatedAt)}</p>}
          </div>
          <div className="flex items-center gap-2">
            {liveHref && (
              <a href={liveHref} target="_blank" rel="noreferrer" className={adminButton("secondary", "md")}>
                <ExternalLink /> View
              </a>
            )}
            {isNew && (
              <AdminButton variant="primary" onClick={save} loading={saving}>
                Create {schema.singular.toLowerCase()}
              </AdminButton>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1 space-y-6">
          {schema.panels.map((panel) => (
            <PanelCard key={panel.title} panel={panel} value={draft.data} onChange={updateData} />
          ))}

          {childSchema && !isNew && entry && (
            <Card id="children" className="scroll-mt-24 p-5">
              <h2 className="font-semibold">{schema.child!.label}</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Services shown inside “{title}”. Each one gets its own detail page.
              </p>
              <EntryList schema={childSchema} parentId={entry.id} parentSlug={saved?.slug} />
            </Card>
          )}

          {schema.seo && (
            <SeoCard
              value={draft.seo}
              onChange={(seo) => setDraft({ ...draft, seo })}
              fallbackTitle={title}
              fallbackDescription={description || "Description from the content above"}
              path={publicPath ?? "/"}
            />
          )}
        </div>

        <aside className="w-full shrink-0 space-y-4 lg:sticky lg:top-24 lg:w-80">
          <Card className="space-y-4 p-5">
            <SideField label="Visibility" help={draft.status === "PUBLISHED" ? "Visible on your website" : "Only you can see this in the admin"}>
              <SegmentedControl
                className="flex w-full [&>*]:flex-1"
                value={draft.status}
                onChange={(status) => setDraft({ ...draft, status })}
                options={[
                  { value: "PUBLISHED", label: "Published" },
                  { value: "DRAFT", label: "Draft" },
                ]}
              />
            </SideField>

            {schema.parent && (
              <SideField label={`Inside ${parentSchema?.singular.toLowerCase() ?? "parent"}`}>
                <select
                  value={draft.parentId ?? ""}
                  onChange={(e) => setDraft({ ...draft, parentId: e.target.value || null })}
                  className={cn(inputClass, "h-10")}
                >
                  <option value="">Choose...</option>
                  {parents.map((p) => (
                    <option key={p.id} value={p.id}>
                      {entryTitle(p.data, parentSchema?.titleField)}
                    </option>
                  ))}
                </select>
              </SideField>
            )}

            <SideField label="URL slug" error={slugError} help={publicPath && <span className="break-all">{publicPath}</span>}>
              <div className="relative">
                <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={draft.slug}
                  aria-invalid={!!slugError}
                  onChange={(e) => {
                    slugTouched.current = true;
                    setSlugError(undefined);
                    setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]+/g, "-").replace(/-{2,}/g, "-") });
                  }}
                  placeholder="my-page-url"
                  className={cn(inputClass, "h-10 pl-9")}
                />
              </div>
            </SideField>
          </Card>

          {!isNew && (
            <Card className="flex gap-2 p-3">
              <AdminButton variant="ghost" size="sm" className="flex-1" onClick={duplicate}>
                <Copy /> Duplicate
              </AdminButton>
              <AdminButton variant="danger-ghost" size="sm" className="flex-1" onClick={remove}>
                <Trash2 /> Delete
              </AdminButton>
            </Card>
          )}

          <PanelNav panels={schema.panels} extra={extraNav} />
        </aside>
      </div>

      <SaveBar dirty={dirty && !isNew} saving={saving} onSave={save} onDiscard={() => setDraft(saved)} />
    </div>
  );
}

function SideField({ label, help, error, children }: { label: string; help?: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-medium">{label}</p>
      {children}
      {error ? <p className="mt-1.5 text-xs text-red-600">{error}</p> : help && <p className="mt-1.5 text-xs text-muted-foreground">{help}</p>}
    </div>
  );
}