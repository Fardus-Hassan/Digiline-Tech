"use client";

import { Globe, SearchCheck } from "lucide-react";
import { Card, Toggle } from "@/components/admin/ui";
import { FieldRenderer } from "@/components/admin/form/fields";
import type { Seo } from "@/lib/cms/types";

const TITLE_MAX = 60;
const DESCRIPTION_MAX = 160;

/** Per-page SEO overrides with a live Google result preview. */
export function SeoCard({
  value,
  onChange,
  fallbackTitle,
  fallbackDescription,
  path,
  compact,
}: {
  value: Seo;
  onChange: (value: Seo) => void;
  fallbackTitle: string;
  fallbackDescription: string;
  path: string;
  compact?: boolean;
}) {
  const seo = value ?? {};
  const set = (patch: Partial<NonNullable<Seo>>) => onChange({ ...seo, ...patch });
  const title = seo.title || fallbackTitle;
  const description = seo.description || fallbackDescription;
  const host = typeof window === "undefined" ? "" : window.location.host;

  return (
    <Card id="seo" className="scroll-mt-24 overflow-hidden">
      <div className="flex items-start gap-3 border-b border-border px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
          <SearchCheck className="size-5" />
        </span>
        <div>
          <h2 className="font-semibold">Search engine (SEO)</h2>
          <p className="text-sm text-muted-foreground">How this page looks on Google. Empty fields use the page content automatically.</p>
        </div>
      </div>
      <div className="space-y-5 p-5">
        <div className="rounded-xl border border-border bg-background p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex size-5 items-center justify-center rounded-full bg-muted">
              <Globe className="size-3" />
            </span>
            <span className="truncate">
              {host}
              {path === "/" ? "" : path.replaceAll("/", " › ")}
            </span>
          </p>
          <p className="mt-1 line-clamp-1 text-lg leading-snug text-[#1a0dab] dark:text-[#8ab4f8]">{title}</p>
          <p className="mt-0.5 line-clamp-2 text-sm text-muted-foreground">{description}</p>
        </div>

        <div className="space-y-5">
          <FieldRenderer
            field={{ type: "text", name: "title", label: "SEO title", maxLength: TITLE_MAX, placeholder: fallbackTitle, help: compact ? undefined : "Best under 60 characters" }}
            value={seo.title ?? ""}
            onChange={(v) => set({ title: String(v) })}
          />
          <FieldRenderer
            field={{ type: "textarea", name: "description", label: "Meta description", rows: 3, maxLength: DESCRIPTION_MAX, placeholder: fallbackDescription, help: compact ? undefined : "Best between 120 and 160 characters" }}
            value={seo.description ?? ""}
            onChange={(v) => set({ description: String(v) })}
          />
          <FieldRenderer
            field={{ type: "text", name: "keywords", label: "Keywords", help: "Comma separated (optional)" }}
            value={seo.keywords ?? ""}
            onChange={(v) => set({ keywords: String(v) })}
          />
          <FieldRenderer
            field={{ type: "image", name: "image", label: "Social share image", help: "1200×630. Uses the page image when empty." }}
            value={seo.image ?? ""}
            onChange={(v) => set({ image: String(v) })}
          />
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3">
          <div>
            <p className="text-sm font-medium">Hide from search engines</p>
            <p className="text-xs text-muted-foreground">Google won&apos;t show this page in results.</p>
          </div>
          <Toggle checked={!!seo.noindex} onChange={(noindex) => set({ noindex })} label="Hide from search engines" />
        </div>
      </div>
    </Card>
  );
}
