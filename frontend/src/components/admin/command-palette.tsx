"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { CornerDownLeft, FileText, Loader2, Plus, Search, type LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import { collectionSchemas, getCollectionSchema, sectionSchemas, type Field } from "@/lib/cms/schema";
import { entryTitle } from "@/lib/admin";
import { Kbd } from "@/components/admin/ui";
import { cn } from "@/lib/utils";
import { adminNav } from "@/components/admin/nav";

type Item = { id: string; label: string; hint: string; href: string; icon: LucideIcon; keywords: string; group: string };

const fieldLabels = (fields: Field[]): string[] =>
  fields.flatMap((f) => [f.label, f.help ?? "", ...("fields" in f ? fieldLabels(f.fields) : [])]);

/** Every page, setting and field label, so searching "logo" or "button" finds the right editor. */
const staticItems: Item[] = [
  ...adminNav.map((n) => ({ id: n.href, label: n.label, hint: "Go to", href: n.href, icon: n.icon, keywords: n.keywords ?? "", group: "Navigation" })),
  ...sectionSchemas.map((s) => ({
    id: `section-${s.key}`,
    label: s.label,
    hint: s.group,
    href: `/admin/sections/${s.key}`,
    icon: s.icon,
    keywords: [s.description, ...s.panels.flatMap((p) => [p.title, p.description ?? "", ...fieldLabels(p.fields)])].join(" "),
    group: "Pages & settings",
  })),
  ...collectionSchemas
    .filter((c) => !c.hidden)
    .flatMap((c) => [
      { id: `collection-${c.key}`, label: c.label, hint: "Content", href: `/admin/collections/${c.key}`, icon: c.icon, keywords: c.description, group: "Content" },
      { id: `new-${c.key}`, label: `New ${c.singular.toLowerCase()}`, hint: "Create", href: `/admin/collections/${c.key}/new`, icon: Plus, keywords: `add create ${c.label}`, group: "Create" },
    ]),
];

function matches(item: Item, q: string) {
  const haystack = `${item.label} ${item.keywords}`.toLowerCase();
  return q.split(/\s+/).every((word) => haystack.includes(word));
}

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const q = query.trim().toLowerCase();

  useEffect(() => {
    if (q.length < 2) return;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api<{ entries: { id: string; collection: string; slug: string; data: Record<string, unknown> }[] }>(
          `/admin/search?q=${encodeURIComponent(q)}`,
        );
        setEntries(
          res.entries.flatMap((e) => {
            const schema = getCollectionSchema(e.collection);
            if (!schema) return [];
            return [{ id: e.id, label: entryTitle(e.data, schema.titleField), hint: schema.singular, href: `/admin/collections/${e.collection}/${e.id}`, icon: schema.icon ?? FileText, keywords: "", group: "Content items" }];
          }),
        );
      } catch {
        setEntries([]);
      } finally {
        setLoading(false);
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [q]);

  const results = useMemo(() => {
    const found = q ? staticItems.filter((item) => matches(item, q)) : staticItems.filter((i) => i.group !== "Create");
    return [...found.slice(0, 30), ...(q.length >= 2 ? entries : [])];
  }, [q, entries]);

  const groups = useMemo(() => {
    const map = new Map<string, { item: Item; index: number }[]>();
    results.forEach((item, index) => map.set(item.group, [...(map.get(item.group) ?? []), { item, index }]));
    return [...map];
  }, [results]);

  function close() {
    onClose();
    setQuery("");
    setEntries([]);
    setActive(0);
  }

  function go(item: Item) {
    router.push(item.href);
    close();
  }

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[active]) {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === "Escape") {
      close();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-start justify-center p-3 pt-[12vh]">
          <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={close} />
          <motion.div
            role="dialog"
            aria-label="Search"
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.15 }}
            className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
          >
            <div className="flex items-center gap-3 border-b border-border px-4">
              {loading ? <Loader2 className="size-5 animate-spin text-muted-foreground" /> : <Search className="size-5 text-muted-foreground" />}
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="Search pages, settings, services, posts..."
                className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
              />
              <Kbd>Esc</Kbd>
            </div>

            <div ref={listRef} className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
              {results.length === 0 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">{loading ? "Searching..." : `No results for “${query}”`}</p>
              ) : (
                groups.map(([group, items]) => (
                  <div key={group} className="mb-1">
                    <p className="px-3 pt-2 pb-1 text-xs font-semibold text-muted-foreground">{group}</p>
                    {items.map(({ item, index }) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          data-index={index}
                          onMouseMove={() => setActive(index)}
                          onClick={() => go(item)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                            index === active ? "bg-accent/10 text-foreground" : "text-foreground/80",
                          )}
                        >
                          <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg border border-border bg-background", index === active && "border-accent/30 text-accent")}>
                            <Icon className="size-4" />
                          </span>
                          <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                          <span className="shrink-0 text-xs text-muted-foreground">{item.hint}</span>
                          {index === active && <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" />}
                        </button>
                      );
                    })}
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-4 border-t border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Kbd>↑</Kbd><Kbd>↓</Kbd> navigate</span>
              <span className="flex items-center gap-1"><Kbd>Enter</Kbd> open</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
