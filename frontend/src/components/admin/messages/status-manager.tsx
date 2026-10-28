"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowDown, ArrowUp, Info, Lock, Plus, Trash2 } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage } from "@/lib/admin";
import { cn } from "@/lib/utils";
import { AdminButton, Dialog, Toggle, inputClass } from "@/components/admin/ui";
import { REPLIED, STATUS_COLORS, type MessageStatus, type StatusColor } from "./shared";

type Row = { id: string; key?: string; label: string; color: StatusColor; inInbox: boolean };

export function StatusManager({
  statuses,
  onClose,
  onSaved,
}: {
  statuses: MessageStatus[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [rows, setRows] = useState<Row[]>(() => statuses.map((s) => ({ id: s.key, key: s.key, label: s.label, color: s.color, inInbox: s.inInbox })));
  const [colorFor, setColorFor] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const invalid = rows.some((r) => !r.label.trim());

  const update = (id: string, patch: Partial<Row>) => setRows((list) => list.map((r) => (r.id === id ? { ...r, ...patch } : r)));

  function move(index: number, by: -1 | 1) {
    setRows((list) => {
      const next = [...list];
      [next[index], next[index + by]] = [next[index + by], next[index]];
      return next;
    });
  }

  function add() {
    const used = new Set(rows.map((r) => r.color));
    const color = (Object.keys(STATUS_COLORS) as StatusColor[]).find((c) => !used.has(c)) ?? "violet";
    setRows((list) => [...list, { id: crypto.randomUUID(), label: "", color, inInbox: true }]);
  }

  async function save() {
    setSaving(true);
    try {
      await api("/contact/statuses", {
        method: "PUT",
        body: JSON.stringify({ statuses: rows.map(({ key, label, color, inInbox }) => ({ key, label: label.trim(), color, inInbox })) }),
      });
      toast.success("Statuses saved");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title="Message statuses"
      description="Add, rename, recolor and reorder the statuses you use to track messages."
      size="lg"
      footer={
        <>
          <AdminButton variant="ghost" className="mr-auto" onClick={add} disabled={rows.length >= 20}>
            <Plus /> Add status
          </AdminButton>
          <AdminButton onClick={onClose}>Cancel</AdminButton>
          <AdminButton variant="primary" loading={saving} disabled={invalid} onClick={save}>
            Save
          </AdminButton>
        </>
      }
    >
      <div className="space-y-4 p-5">
        <div className="flex gap-3 rounded-xl border border-border bg-muted/40 p-3.5 text-sm text-muted-foreground">
          <Info className="mt-0.5 size-4 shrink-0 text-accent" />
          <ul className="space-y-1">
            <li>New messages go into the <b className="text-foreground">first</b> status.</li>
            <li>
              <b className="text-foreground">Replied</b> is set automatically when you reply, so it can be renamed but not deleted.
            </li>
            <li>
              Turn <b className="text-foreground">Inbox</b> off for statuses like Spam or Archive to hide them from the inbox and the unread count.
            </li>
            <li>Deleting a status moves its messages to the first status.</li>
          </ul>
        </div>

        <ul className="space-y-2">
          {rows.map((row, index) => {
            const locked = row.key === REPLIED;
            return (
              <li key={row.id} className="rounded-xl border border-border bg-background p-2.5">
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      type="button"
                      onClick={() => move(index, -1)}
                      disabled={index === 0}
                      aria-label="Move up"
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-25"
                    >
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => move(index, 1)}
                      disabled={index === rows.length - 1}
                      aria-label="Move down"
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-25"
                    >
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setColorFor(colorFor === row.id ? null : row.id)}
                    aria-label="Change color"
                    title="Change color"
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border hover:bg-muted"
                  >
                    <span className={cn("size-3.5 rounded-full", STATUS_COLORS[row.color].dot)} />
                  </button>
                  <input
                    value={row.label}
                    onChange={(e) => update(row.id, { label: e.target.value })}
                    placeholder="Status name, e.g. Quote sent"
                    maxLength={40}
                    autoFocus={!row.key}
                    aria-label="Status name"
                    aria-invalid={!row.label.trim() || undefined}
                    className={cn(inputClass, "h-9 min-w-0 flex-1")}
                  />
                  <label className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground" title="Show in inbox and unread count">
                    <span className="hidden sm:inline">Inbox</span>
                    <Toggle checked={row.inInbox} onChange={(inInbox) => update(row.id, { inInbox })} label="Show in inbox" />
                  </label>
                  {locked ? (
                    <span className="flex size-8 shrink-0 items-center justify-center text-muted-foreground" title="Used automatically when you reply">
                      <Lock className="size-3.5" />
                    </span>
                  ) : (
                    <AdminButton
                      variant="danger-ghost"
                      size="icon-sm"
                      aria-label="Delete status"
                      title="Delete status"
                      disabled={rows.length <= 1}
                      onClick={() => setRows((list) => list.filter((r) => r.id !== row.id))}
                    >
                      <Trash2 />
                    </AdminButton>
                  )}
                </div>
                {index === 0 && <p className="mt-1.5 ml-7 text-xs text-accent">New messages start here</p>}
                {colorFor === row.id && (
                  <div className="mt-2.5 ml-7 flex flex-wrap gap-1.5">
                    {(Object.keys(STATUS_COLORS) as StatusColor[]).map((color) => (
                      <button
                        key={color}
                        type="button"
                        aria-label={color}
                        title={color}
                        onClick={() => {
                          update(row.id, { color });
                          setColorFor(null);
                        }}
                        className={cn(
                          "flex size-7 items-center justify-center rounded-lg border border-border hover:bg-muted",
                          row.color === color && "ring-2 ring-accent",
                        )}
                      >
                        <span className={cn("size-3.5 rounded-full", STATUS_COLORS[color].dot)} />
                      </button>
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </Dialog>
  );
}
