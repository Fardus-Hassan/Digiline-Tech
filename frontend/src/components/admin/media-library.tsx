"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import {
  Check,
  Copy,
  FileText,
  Film,
  ImageIcon,
  Search,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, formatBytes, timeAgo, uploadMedia, type Media } from "@/lib/admin";
import { AdminButton, Dialog, EmptyState, inputClass, SegmentedControl, Spinner, useConfirm } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Kind = "all" | Media["kind"];

const accept: Record<Kind, string> = {
  all: "image/*,video/mp4,video/webm,video/quicktime,application/pdf",
  image: "image/*",
  video: "video/mp4,video/webm,video/quicktime",
  document: "application/pdf",
};

function MediaThumb({ media, className }: { media: Media; className?: string }) {
  if (media.kind === "image") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={media.url} alt={media.alt} loading="lazy" className={cn("size-full object-cover", className)} />;
  }
  if (media.kind === "video") {
    return (
      <div className={cn("relative size-full bg-black", className)}>
        <video src={`${media.url}#t=0.5`} preload="metadata" muted className="size-full object-cover opacity-80" />
        <Film className="absolute top-2 left-2 size-4 text-white drop-shadow" />
      </div>
    );
  }
  return (
    <div className={cn("flex size-full items-center justify-center bg-muted text-muted-foreground", className)}>
      <FileText className="size-8" />
    </div>
  );
}

export function MediaLibrary({
  kind: fixedKind,
  onSelect,
  selectLabel = "Use this file",
}: {
  kind?: Media["kind"];
  onSelect?: (media: Media) => void;
  selectLabel?: string;
}) {
  const confirm = useConfirm();
  const [items, setItems] = useState<Media[] | null>(null);
  const [kind, setKind] = useState<Kind>(fixedKind ?? "all");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    try {
      const res = await api<{ media: Media[] }>("/admin/media");
      setItems(res.media);
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't load media"));
      setItems([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch + refetch on filter change
    load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (items ?? []).filter(
      (m) =>
        (kind === "all" || m.kind === kind) &&
        (!q || m.filename.toLowerCase().includes(q) || m.alt.toLowerCase().includes(q)),
    );
  }, [items, kind, query]);

  const selected = items?.find((m) => m.id === selectedId) ?? null;

  async function upload(files: File[]) {
    if (!files.length) return;
    setProgress(0);
    try {
      const created = await uploadMedia(files, setProgress);
      setItems((list) => [...created, ...(list ?? [])]);
      setSelectedId(created[0]?.id ?? null);
      toast.success(created.length > 1 ? `${created.length} files uploaded` : "File uploaded");
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed"));
    } finally {
      setProgress(null);
    }
  }

  async function saveAlt(media: Media, alt: string) {
    if (alt === media.alt) return;
    setItems((list) => list?.map((m) => (m.id === media.id ? { ...m, alt } : m)) ?? null);
    try {
      await api(`/admin/media/${media.id}`, { method: "PATCH", body: JSON.stringify({ alt }) });
      toast.success("Description saved");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function remove(media: Media) {
    const { count } = await api<{ count: number }>(`/admin/media/${media.id}/usage`).catch(() => ({ count: 0 }));
    const ok = await confirm({
      title: `Delete “${media.filename}”?`,
      description: count
        ? `This file is used in ${count} place${count > 1 ? "s" : ""} on your website. Those spots will show nothing until you pick another file.`
        : "This file isn't used anywhere on your website. This can't be undone.",
      confirmLabel: "Delete file",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/admin/media/${media.id}`, { method: "DELETE" });
      setItems((list) => list?.filter((m) => m.id !== media.id) ?? null);
      setSelectedId(null);
      toast.success("File deleted");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function copyUrl(media: Media) {
    await navigator.clipboard?.writeText(new URL(media.url, window.location.origin).href);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div
      className="relative flex min-h-[28rem] flex-col"
      onDragOver={(e) => {
        if (!e.dataTransfer.types.includes("Files")) return;
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        upload(Array.from(e.dataTransfer.files));
      }}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border p-3 sm:p-4">
        <div className="relative min-w-48 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search files..."
            className={cn(inputClass, "h-9 pl-9")}
          />
        </div>
        {!fixedKind && (
          <SegmentedControl
            value={kind}
            onChange={setKind}
            options={[
              { value: "all", label: "All" },
              { value: "image", label: "Images" },
              { value: "video", label: "Videos" },
              { value: "document", label: "Docs" },
            ]}
          />
        )}
        <AdminButton variant="primary" onClick={() => fileInput.current?.click()} loading={progress !== null}>
          {progress === null && <UploadCloud />}
          {progress === null ? "Upload" : `${progress}%`}
        </AdminButton>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept={accept[fixedKind ?? kind]}
          className="hidden"
          onChange={(e) => {
            upload(Array.from(e.target.files ?? []));
            e.target.value = "";
          }}
        />
      </div>

      {progress !== null && (
        <div className="h-1 bg-muted">
          <div className="h-full bg-accent-gradient transition-[width]" style={{ width: `${progress}%` }} />
        </div>
      )}

      <div className="flex min-h-0 flex-1">
        <div className="min-w-0 flex-1 p-3 sm:p-4">
          {items === null ? (
            <Spinner />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={ImageIcon}
              title={items.length ? "No files match" : "No files yet"}
              description="Drag & drop files here, or click Upload. Images are optimised automatically."
            />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
              {filtered.map((media) => (
                <li key={media.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedId(media.id)}
                    onDoubleClick={() => onSelect?.(media)}
                    className={cn(
                      "group relative block aspect-square w-full overflow-hidden rounded-xl border-2 bg-muted text-left transition-all",
                      selectedId === media.id
                        ? "border-accent ring-4 ring-accent/15"
                        : "border-transparent hover:border-foreground/20",
                    )}
                  >
                    <MediaThumb media={media} className="transition-transform duration-300 group-hover:scale-105" />
                    <span className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-2 pt-6 pb-1.5 text-[0.7rem] text-white">
                      {media.filename}
                    </span>
                    {selectedId === media.id && (
                      <span className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-accent text-white shadow">
                        <Check className="size-3.5" />
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <AnimatePresence>
          {selected && (
            <motion.aside
              key={selected.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              className="fixed inset-x-0 bottom-0 z-10 max-h-[70dvh] overflow-y-auto border-t border-border bg-card p-4 shadow-2xl sm:static sm:z-auto sm:max-h-none sm:w-72 sm:shrink-0 sm:border-t-0 sm:border-l sm:shadow-none"
            >
              <div className="mb-3 flex items-center justify-between sm:hidden">
                <p className="font-semibold">File details</p>
                <AdminButton variant="ghost" size="icon-sm" onClick={() => setSelectedId(null)} aria-label="Close">
                  <X />
                </AdminButton>
              </div>
              <div className="aspect-video overflow-hidden rounded-xl border border-border bg-muted">
                {selected.kind === "video" ? (
                  <video src={selected.url} controls preload="metadata" className="size-full bg-black object-contain" />
                ) : selected.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selected.url} alt={selected.alt} className="size-full object-contain" />
                ) : (
                  <MediaThumb media={selected} />
                )}
              </div>
              <p className="mt-3 text-sm font-medium break-all">{selected.filename}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {formatBytes(selected.size)}
                {selected.width && selected.height ? ` · ${selected.width}×${selected.height}` : ""} · {timeAgo(selected.createdAt)}
              </p>

              {selected.kind === "image" && (
                <label className="mt-4 block">
                  <span className="text-xs font-medium">Description (alt text)</span>
                  <textarea
                    key={selected.id}
                    defaultValue={selected.alt}
                    rows={2}
                    placeholder="What's in this image? Helps Google & screen readers."
                    onBlur={(e) => saveAlt(selected, e.target.value.trim())}
                    className={cn(inputClass, "mt-1 resize-none py-2")}
                  />
                </label>
              )}

              <div className="mt-4 flex flex-col gap-2">
                {onSelect && (
                  <AdminButton variant="primary" onClick={() => onSelect(selected)}>
                    <Check /> {selectLabel}
                  </AdminButton>
                )}
                <div className="flex gap-2">
                  <AdminButton size="sm" className="flex-1" onClick={() => copyUrl(selected)}>
                    {copied ? <Check /> : <Copy />} {copied ? "Copied" : "Copy link"}
                  </AdminButton>
                  <AdminButton size="sm" variant="danger-ghost" onClick={() => remove(selected)}>
                    <Trash2 /> Delete
                  </AdminButton>
                </div>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {dragging && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-2 z-20 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-accent bg-accent/10 backdrop-blur-sm"
          >
            <UploadCloud className="size-10 text-accent" />
            <p className="mt-2 font-semibold">Drop files to upload</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function MediaPickerDialog({
  open,
  onClose,
  kind,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  kind?: Media["kind"];
  onSelect: (media: Media) => void;
}) {
  const label = kind === "video" ? "video" : kind === "image" ? "image" : "file";
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="xl"
      title={`Choose ${label === "image" ? "an" : "a"} ${label}`}
      description="Pick from your library or upload a new one. Double-click to select quickly."
    >
      <MediaLibrary
        kind={kind}
        selectLabel={`Use this ${label}`}
        onSelect={(media) => {
          onSelect(media);
          onClose();
        }}
      />
    </Dialog>
  );
}
