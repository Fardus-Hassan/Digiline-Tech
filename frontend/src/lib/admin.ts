import { toast } from "sonner";
import { refreshSiteContent } from "@/app/admin/actions";
import { ApiError } from "@/lib/api";
import type { CollectionKey, Seo } from "@/lib/cms/types";

export type EntryStatus = "DRAFT" | "PUBLISHED";

export type AdminEntry = {
  id: string;
  collection: CollectionKey;
  slug: string;
  status: EntryStatus;
  sortOrder: number;
  data: Record<string, unknown>;
  seo: Seo;
  parentId: string | null;
  parent?: { id: string; slug: string; data: Record<string, unknown> } | null;
  _count?: { children: number };
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Media = {
  id: string;
  kind: "image" | "video" | "document";
  url: string;
  filename: string;
  mime: string;
  size: number;
  width: number | null;
  height: number | null;
  alt: string;
  blurDataUrl: string | null;
  createdAt: string;
};

/** Cache tags to refresh on the website after a collection changes. */
export function tagsForCollection(collection: CollectionKey) {
  // Sub-service pages read their parent service, and URLs include the parent slug
  return collection === "services" ? ["entries:services", "entries:subServices"] : [`entries:${collection}`];
}

export async function refreshSite(tags: string[]) {
  await refreshSiteContent(tags).catch(() =>
    toast.warning("Saved, but the website couldn't refresh. Save again or reload the site in a minute."),
  );
}

export const errorMessage = (err: unknown, fallback = "Something went wrong") =>
  err instanceof ApiError ? err.message : err instanceof Error && err.message ? err.message : fallback;

export const slugify = (value: string) =>
  value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

export function timeAgo(date: string | Date) {
  const seconds = (new Date(date).getTime() - Date.now()) / 1000;
  const units: [Intl.RelativeTimeFormatUnit, number][] = [
    ["year", 31536000],
    ["month", 2592000],
    ["week", 604800],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [unit, size] of units) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}

/** Uploads files to the media library with progress (fetch can't report upload progress). */
export function uploadMedia(files: File[], onProgress?: (percent: number) => void): Promise<Media[]> {
  return new Promise((resolve, reject) => {
    const body = new FormData();
    files.forEach((file) => body.append("files", file));
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/media");
    xhr.withCredentials = true;
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let data: { media?: Media[]; message?: string } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {}
      if (xhr.status >= 200 && xhr.status < 300 && data.media) resolve(data.media);
      else reject(new ApiError(xhr.status, data.message ?? "Upload failed"));
    };
    xhr.onerror = () => reject(new ApiError(0, "Upload failed. Check your connection."));
    xhr.send(body);
  });
}

/** Display title for an entry in lists, search and breadcrumbs. */
export function entryTitle(data: Record<string, unknown>, field = "title") {
  const value = data[field] ?? data.title ?? data.name;
  return typeof value === "string" && value.trim() ? value : "Untitled";
}
