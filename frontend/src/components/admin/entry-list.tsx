"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Reorder, useDragControls } from "motion/react";
import { toast } from "sonner";
import { Copy, Eye, EyeOff, ExternalLink, GripVertical, Layers, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import type { CollectionSchema } from "@/lib/cms/schema";
import { entryTitle, errorMessage, refreshSite, tagsForCollection, timeAgo, type AdminEntry, type EntryStatus } from "@/lib/admin";
import { AdminButton, adminButton, EmptyState, inputClass, SegmentedControl, Spinner, StatusBadge, useConfirm } from "@/components/admin/ui";
import { IconPreview } from "@/components/admin/icon-picker";
import { cn } from "@/lib/utils";

type Filter = "all" | EntryStatus;

export function EntryList({ schema, parentId, parentSlug }: { schema: CollectionSchema; parentId?: string; parentSlug?: string }) {
  const confirm = useConfirm();
  const [entries, setEntries] = useState<AdminEntry[] | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const orderRef = useRef<AdminEntry[]>([]);

  const load = useCallback(async () => {
    try {
      const res = await api<{ entries: AdminEntry[] }>(`/admin/entries/${schema.key}${parentId ? `?parentId=${parentId}` : ""}`);
      setEntries(res.entries);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't load entries"));
      setEntries([]);
    }
  }, [schema.key, parentId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch
    load();
  }, [load]);

  useEffect(() => {
    orderRef.current = entries ?? [];
  }, [entries]);

  const filtering = !!query.trim() || filter !== "all";
  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (entries ?? []).filter(
      (e) =>
        (filter === "all" || e.status === filter) &&
        (!q || JSON.stringify(e.data).toLowerCase().includes(q) || e.slug.includes(q)),
    );
  }, [entries, query, filter]);

  const counts = useMemo(
    () => ({
      all: entries?.length ?? 0,
      PUBLISHED: entries?.filter((e) => e.status === "PUBLISHED").length ?? 0,
      DRAFT: entries?.filter((e) => e.status === "DRAFT").length ?? 0,
    }),
    [entries],
  );

  const changed = () => refreshSite(tagsForCollection(schema.key));

  async function persistOrder() {
    const ids = orderRef.current.map((e) => e.id);
    try {
      await api(`/admin/entries/${schema.key}/reorder`, { method: "POST", body: JSON.stringify({ ids }) });
      await changed();
      toast.success("Order saved");
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save the order"));
      load();
    }
  }

  async function setStatus(entry: AdminEntry, status: EntryStatus) {
    setEntries((list) => list?.map((e) => (e.id === entry.id ? { ...e, status } : e)) ?? null);
    try {
      await api(`/admin/entries/${schema.key}/${entry.id}/status`, { method: "PATCH", body: JSON.stringify({ status }) });
      await changed();
      toast.success(status === "PUBLISHED" ? "Published — now live on your website" : "Moved to drafts — hidden from your website");
    } catch (err) {
      toast.error(errorMessage(err));
      load();
    }
  }

  async function duplicate(entry: AdminEntry) {
    try {
      await api(`/admin/entries/${schema.key}/${entry.id}/duplicate`, { method: "POST" });
      toast.success("Duplicated as a draft");
      load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function remove(entry: AdminEntry) {
    const title = entryTitle(entry.data, schema.titleField);
    const children = entry._count?.children ?? 0;
    const ok = await confirm({
      title: `Delete “${title}”?`,
      description: children
        ? `Its ${children} ${schema.child?.label.toLowerCase() ?? "items"} will be deleted too. This can't be undone.`
        : "It will be removed from your website. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    setEntries((list) => list?.filter((e) => e.id !== entry.id) ?? null);
    try {
      await api(`/admin/entries/${schema.key}/${entry.id}`, { method: "DELETE" });
      await changed();
      toast.success("Deleted");
    } catch (err) {
      toast.error(errorMessage(err));
      load();
    }
  }

  const newHref = `/admin/collections/${schema.key}/new${parentId ? `?parent=${parentId}` : ""}`;

  if (entries === null) return <Spinner />;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${schema.label.toLowerCase()}...`} className={cn(inputClass, "h-9 pl-9")} />
        </div>
        <SegmentedControl
          value={filter}
          onChange={setFilter}
          options={[
            { value: "all", label: "All", count: counts.all },
            { value: "PUBLISHED", label: "Live", count: counts.PUBLISHED },
            { value: "DRAFT", label: "Drafts", count: counts.DRAFT },
          ]}
        />
        <Link href={newHref} className={adminButton("primary", "md")}>
          <Plus /> New {schema.singular.toLowerCase()}
        </Link>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          icon={schema.icon}
          title={`No ${schema.label.toLowerCase()} yet`}
          description={`Create your first ${schema.singular.toLowerCase()} and it will appear on your website.`}
          action={
            <Link href={newHref} className={adminButton("primary", "md")}>
              <Plus /> New {schema.singular.toLowerCase()}
            </Link>
          }
        />
      ) : visible.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">Nothing matches your search.</p>
      ) : (
        <>
          <Reorder.Group
            axis="y"
            values={visible}
            onReorder={(order) => !filtering && setEntries(order)}
            className="overflow-hidden rounded-2xl border border-border bg-card"
          >
            {visible.map((entry) => (
              <EntryRow
                key={entry.id}
                entry={entry}
                schema={schema}
                parentSlug={parentSlug ?? entry.parent?.slug}
                draggable={!filtering}
                onDragEnd={persistOrder}
                onStatus={setStatus}
                onDuplicate={duplicate}
                onRemove={remove}
              />
            ))}
          </Reorder.Group>
          <p className="mt-3 text-xs text-muted-foreground">
            {filtering ? "Clear the search and filter to reorder." : "Drag the handle to change the order shown on your website."}
          </p>
        </>
      )}
    </div>
  );
}

function EntryRow({
  entry,
  schema,
  parentSlug,
  draggable,
  onDragEnd,
  onStatus,
  onDuplicate,
  onRemove,
}: {
  entry: AdminEntry;
  schema: CollectionSchema;
  parentSlug?: string;
  draggable: boolean;
  onDragEnd: () => void;
  onStatus: (entry: AdminEntry, status: EntryStatus) => void;
  onDuplicate: (entry: AdminEntry) => void;
  onRemove: (entry: AdminEntry) => void;
}) {
  const controls = useDragControls();
  const editHref = `/admin/collections/${schema.key}/${entry.id}`;
  const title = entryTitle(entry.data, schema.titleField);
  const subtitle = schema.subtitleField ? String(entry.data[schema.subtitleField] ?? "") : "";
  const image = schema.imageField ? String(entry.data[schema.imageField] ?? "") : "";
  const icon = schema.iconField ? String(entry.data[schema.iconField] ?? "") : "";
  const viewHref = entry.status === "PUBLISHED" ? schema.path?.(entry.slug, parentSlug) : undefined;
  const children = entry._count?.children ?? 0;

  return (
    <Reorder.Item
      value={entry}
      dragListener={false}
      dragControls={controls}
      onDragEnd={onDragEnd}
      className="group relative flex items-center gap-3 border-b border-border bg-card px-2 py-2.5 last:border-b-0 hover:bg-muted/40 sm:px-3"
    >
      <button
        type="button"
        aria-label="Drag to reorder"
        disabled={!draggable}
        onPointerDown={(e) => draggable && controls.start(e)}
        className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
      >
        <GripVertical className="size-4" />
      </button>

      <Link href={editHref} className="flex min-w-0 flex-1 items-center gap-3">
        <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-accent/10 text-accent">
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="size-full object-cover" />
          ) : icon ? (
            <IconPreview name={icon} className="size-5" />
          ) : (
            <span className="font-semibold">{title.charAt(0).toUpperCase()}</span>
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="truncate font-medium group-hover:text-accent">{title}</span>
            <span className="sm:hidden">
              {entry.status === "DRAFT" && <StatusBadge status="DRAFT" />}
            </span>
          </span>
          <span className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
            {subtitle && <span className="truncate">{subtitle}</span>}
            {schema.child && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-muted px-1.5 py-0.5">
                <Layers className="size-3" /> {children}
              </span>
            )}
          </span>
        </span>
      </Link>

      <span className="hidden shrink-0 sm:block">
        <StatusBadge status={entry.status} />
      </span>
      <span className="hidden w-24 shrink-0 text-right text-xs text-muted-foreground lg:block">{timeAgo(entry.updatedAt)}</span>

      <div className="flex shrink-0 items-center">
        {viewHref && (
          <a href={viewHref} target="_blank" rel="noreferrer" className={cn(adminButton("ghost", "icon-sm"), "hidden md:inline-flex")} title="View on website">
            <ExternalLink />
          </a>
        )}
        <AdminButton
          variant="ghost"
          size="icon-sm"
          title={entry.status === "PUBLISHED" ? "Unpublish (move to drafts)" : "Publish"}
          onClick={() => onStatus(entry, entry.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED")}
          className="hidden sm:inline-flex"
        >
          {entry.status === "PUBLISHED" ? <EyeOff /> : <Eye />}
        </AdminButton>
        <AdminButton variant="ghost" size="icon-sm" title="Duplicate" onClick={() => onDuplicate(entry)} className="hidden md:inline-flex">
          <Copy />
        </AdminButton>
        <Link href={editHref} className={adminButton("ghost", "icon-sm")} title="Edit">
          <Pencil />
        </Link>
        <AdminButton variant="ghost" size="icon-sm" title="Delete" onClick={() => onRemove(entry)} className="hover:text-red-600">
          <Trash2 />
        </AdminButton>
      </div>
    </Reorder.Item>
  );
}
