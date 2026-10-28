"use client";

import { Card } from "@/components/admin/ui";
import { FieldsGrid } from "@/components/admin/form/fields";
import type { Panel } from "@/lib/cms/schema";
import { slugify } from "@/lib/admin";

type Obj = Record<string, unknown>;

export const panelId = (panel: Panel) => `panel-${slugify(panel.title)}`;

/** A titled card of fields; `panel.path` scopes the fields to a nested object of `value`. */
export function PanelCard({ panel, value, onChange }: { panel: Panel; value: Obj; onChange: (value: Obj) => void }) {
  const scoped = panel.path ? ((value[panel.path] as Obj) ?? {}) : value;
  const update = (next: Obj) => onChange(panel.path ? { ...value, [panel.path]: next } : next);

  return (
    <Card id={panelId(panel)} className="scroll-mt-24">
      <div className="border-b border-border px-5 py-4">
        <h2 className="font-semibold">{panel.title}</h2>
        {panel.description && <p className="mt-0.5 text-sm text-muted-foreground">{panel.description}</p>}
      </div>
      <div className="p-5">
        <FieldsGrid fields={panel.fields} value={scoped} onChange={update} />
      </div>
    </Card>
  );
}

/** Sticky "on this page" navigation for long editors (desktop only). */
export function PanelNav({ panels, extra }: { panels: Panel[]; extra?: { id: string; label: string }[] }) {
  const links = [...panels.map((p) => ({ id: panelId(p), label: p.title })), ...(extra ?? [])];
  if (links.length < 3) return null;
  return (
    <nav aria-label="Sections" className="sticky top-24 hidden w-48 shrink-0 xl:block">
      <p className="mb-2 px-3 text-xs font-semibold tracking-wider text-muted-foreground uppercase">On this page</p>
      <ul className="space-y-0.5 border-l border-border">
        {links.map((link) => (
          <li key={link.id}>
            <a
              href={`#${link.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(link.id)?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              className="-ml-px block border-l border-transparent py-1.5 pr-2 pl-3 text-sm text-muted-foreground transition-colors hover:border-accent hover:text-foreground"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
