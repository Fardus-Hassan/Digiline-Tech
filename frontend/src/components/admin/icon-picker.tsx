"use client";

import { useDeferredValue, useMemo, useState } from "react";
import { Search, Sparkles } from "lucide-react";
import { DynamicIcon, iconNames, type IconName } from "lucide-react/dynamic";
import { AdminButton, Dialog, inputClass } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

const MAX_RESULTS = 180;

const popular: IconName[] = [
  "megaphone", "target", "search", "monitor-smartphone", "chart-column", "settings", "award", "dollar-sign",
  "users", "globe", "heart", "lightbulb", "zap", "rocket", "trending-up", "shield-check", "star", "sparkles",
  "mail", "phone", "map-pin", "message-circle", "calendar", "clock", "camera", "video", "pen-tool", "palette",
  "code", "cloud", "cpu", "database", "lock", "shopping-bag", "shopping-cart", "credit-card", "wallet", "gift",
  "briefcase-business", "building-2", "house", "graduation-cap", "book-open", "newspaper", "layout-grid",
  "folder-kanban", "user-round", "handshake", "thumbs-up", "badge-check", "circle-check", "leaf", "plane",
  "utensils-crossed", "heart-pulse", "car", "music", "gamepad-2", "wifi", "smartphone", "laptop", "headphones",
];

const validNames = new Set<string>(iconNames);

export function IconPreview({ name, className }: { name?: string; className?: string }) {
  if (!name || !validNames.has(name)) return <Sparkles className={className} />;
  return <DynamicIcon name={name as IconName} className={className} fallback={() => <span className={className} />} />;
}

export function IconPicker({ value, onChange }: { value: string; onChange: (name: string) => void }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);

  const results = useMemo(() => {
    const q = deferred.trim().toLowerCase().replace(/\s+/g, "-");
    if (!q) return popular;
    const starts = iconNames.filter((n) => n.startsWith(q));
    const contains = iconNames.filter((n) => !n.startsWith(q) && n.includes(q));
    return [...starts, ...contains].slice(0, MAX_RESULTS);
  }, [deferred]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(inputClass, "flex h-10 items-center gap-3 text-left")}
      >
        <span className="flex size-7 items-center justify-center rounded-md bg-accent/10 text-accent">
          <IconPreview name={value} className="size-4" />
        </span>
        <span className={cn("flex-1 truncate", !value && "text-muted-foreground")}>{value || "Choose an icon"}</span>
        <span className="text-xs font-medium text-accent">Change</span>
      </button>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title="Choose an icon"
        description={`Search ${iconNames.length.toLocaleString()} icons by name, e.g. “chart”, “rocket”, “phone”.`}
      >
        <div className="sticky top-0 z-10 border-b border-border bg-card p-4">
          <div className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search icons..."
              className={cn(inputClass, "h-10 pl-9")}
            />
          </div>
          {!deferred && <p className="mt-2 text-xs text-muted-foreground">Popular icons</p>}
        </div>
        <div className="p-4">
          {results.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">No icons found for “{deferred}”.</p>
          ) : (
            <ul className="grid grid-cols-5 gap-2 sm:grid-cols-8">
              {results.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    title={name}
                    onClick={() => {
                      onChange(name);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex aspect-square w-full flex-col items-center justify-center gap-1 rounded-xl border p-1 transition-colors",
                      value === name
                        ? "border-accent bg-accent/10 text-accent"
                        : "border-transparent hover:border-border hover:bg-muted",
                    )}
                  >
                    <DynamicIcon name={name} className="size-5" />
                    <span className="w-full truncate text-center text-[0.6rem] text-muted-foreground">{name}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {results.length === MAX_RESULTS && (
            <p className="mt-4 text-center text-xs text-muted-foreground">Showing the first {MAX_RESULTS} — type more to narrow down.</p>
          )}
        </div>
        {value && (
          <div className="flex justify-end border-t border-border px-4 py-3">
            <AdminButton
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
            >
              Remove icon
            </AdminButton>
          </div>
        )}
      </Dialog>
    </>
  );
}
