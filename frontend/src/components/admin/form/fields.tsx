"use client";

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, Reorder, useDragControls } from "motion/react";
import {
  Bold,
  ChevronDown,
  Copy,
  Film,
  GripVertical,
  Heading2,
  ImageIcon,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  Plus,
  Quote,
  Star,
  Trash2,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { AdminButton, inputClass, SegmentedControl, Toggle } from "@/components/admin/ui";
import { IconPicker } from "@/components/admin/icon-picker";
import { MediaPickerDialog } from "@/components/admin/media-library";
import { Markdown } from "@/components/ui/markdown";
import { emptyObject, type Field } from "@/lib/cms/schema";
import { errorMessage, uploadMedia } from "@/lib/admin";
import { cn } from "@/lib/utils";

type Obj = Record<string, unknown>;

const internalPages = ["/", "/services", "/case-studies", "/about", "/blog", "/contact", "/privacy-policy", "/terms"];

let keyCounter = 0;
const newKey = () => `k${++keyCounter}`;

/** Stable keys for list items so they can be dragged and animated without losing state. */
function useItemKeys(length: number) {
  const [keys, setKeys] = useState<string[]>(() => Array.from({ length }, newKey));
  if (keys.length !== length) {
    const synced = keys.length < length ? [...keys, ...Array.from({ length: length - keys.length }, newKey)] : keys.slice(0, length);
    setKeys(synced);
    return [synced, setKeys] as const;
  }
  return [keys, setKeys] as const;
}

// ---------- Layout helpers ----------

export function FieldShell({
  field,
  htmlFor,
  children,
  aside,
}: {
  field: Pick<Field, "label" | "help" | "width" | "type">;
  htmlFor?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className={cn("min-w-0", field.width === "half" ? "col-span-2 sm:col-span-1" : "col-span-2")}>
      {field.label && (
        <div className="mb-1.5 flex items-end justify-between gap-3">
          <label htmlFor={htmlFor} className="text-sm font-medium">
            {field.label}
          </label>
          {aside}
        </div>
      )}
      {children}
      {field.help && <p className="mt-1.5 text-xs text-muted-foreground">{field.help}</p>}
    </div>
  );
}

export function FieldsGrid({ fields, value, onChange }: { fields: Field[]; value: Obj; onChange: (value: Obj) => void }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-5">
      {fields.map((field) => (
        <FieldRenderer
          key={field.name}
          field={field}
          value={value?.[field.name]}
          onChange={(v) => onChange({ ...value, [field.name]: v })}
        />
      ))}
    </div>
  );
}

// ---------- Field renderer ----------

export function FieldRenderer({ field, value, onChange }: { field: Field; value: unknown; onChange: (value: unknown) => void }) {
  const id = useId();
  const str = typeof value === "string" ? value : value == null ? "" : String(value);

  switch (field.type) {
    case "text":
      return (
        <FieldShell field={field} htmlFor={id} aside={field.maxLength ? <Counter value={str} max={field.maxLength} /> : null}>
          <input id={id} value={str} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "h-10")} />
        </FieldShell>
      );

    case "textarea":
      return (
        <FieldShell field={field} htmlFor={id} aside={field.maxLength ? <Counter value={str} max={field.maxLength} /> : null}>
          <textarea
            id={id}
            value={str}
            rows={field.rows ?? 3}
            placeholder={field.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={cn(inputClass, "field-sizing-content min-h-20 resize-y py-2.5 leading-relaxed")}
          />
        </FieldShell>
      );

    case "markdown":
      return (
        <FieldShell field={field}>
          <MarkdownEditor value={str} onChange={onChange} />
        </FieldShell>
      );

    case "number":
      return (
        <FieldShell field={field} htmlFor={id}>
          <input
            id={id}
            type="number"
            value={typeof value === "number" ? value : str}
            min={field.min}
            max={field.max}
            step={field.step ?? 1}
            onChange={(e) => onChange(e.target.value === "" ? 0 : Number(e.target.value))}
            className={cn(inputClass, "h-10")}
          />
        </FieldShell>
      );

    case "url":
      return (
        <FieldShell field={field} htmlFor={id}>
          <UrlInput id={id} value={str} onChange={onChange} placeholder={field.placeholder} />
        </FieldShell>
      );

    case "date":
      return (
        <FieldShell field={field} htmlFor={id}>
          <input id={id} type="date" value={str} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "h-10")} />
        </FieldShell>
      );

    case "select":
      return (
        <FieldShell field={field} htmlFor={id}>
          <div className="relative">
            <select id={id} value={str} onChange={(e) => onChange(e.target.value)} className={cn(inputClass, "h-10 appearance-none pr-9")}>
              {field.options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </FieldShell>
      );

    case "toggle":
      return (
        <div className={cn("flex items-center justify-between gap-4 rounded-xl border border-border bg-muted/30 px-4 py-3", field.width === "half" ? "col-span-2 sm:col-span-1" : "col-span-2")}>
          <div>
            <label htmlFor={id} className="text-sm font-medium">
              {field.label}
            </label>
            {field.help && <p className="mt-0.5 text-xs text-muted-foreground">{field.help}</p>}
          </div>
          <Toggle id={id} checked={!!value} onChange={onChange} label={field.label} />
        </div>
      );

    case "icon":
      return (
        <FieldShell field={field}>
          <IconPicker value={str} onChange={onChange} />
        </FieldShell>
      );

    case "image":
    case "video":
      return (
        <FieldShell field={field}>
          <MediaField kind={field.type} value={str} onChange={onChange} />
        </FieldShell>
      );

    case "rating":
      return (
        <FieldShell field={field}>
          <RatingInput value={typeof value === "number" ? value : 5} onChange={onChange} />
        </FieldShell>
      );

    case "price":
      return (
        <FieldShell field={field}>
          <PriceInput value={(value as { amount: number; period?: string }) ?? { amount: 0, period: "month" }} onChange={onChange} />
        </FieldShell>
      );

    case "link": {
      const link = (value as { label?: string; href?: string }) ?? {};
      return (
        <FieldShell field={field}>
          <div className="grid gap-2 rounded-xl border border-border bg-muted/30 p-3 sm:grid-cols-2">
            <div>
              <span className="mb-1 block text-xs text-muted-foreground">Text</span>
              <input
                value={link.label ?? ""}
                placeholder="Leave empty to hide"
                onChange={(e) => onChange({ ...link, label: e.target.value })}
                className={cn(inputClass, "h-9")}
              />
            </div>
            <div>
              <span className="mb-1 block text-xs text-muted-foreground">Link</span>
              <UrlInput value={link.href ?? ""} onChange={(href) => onChange({ ...link, href })} small />
            </div>
          </div>
        </FieldShell>
      );
    }

    case "list":
      return (
        <FieldShell field={field}>
          <ListInput value={Array.isArray(value) ? (value as string[]) : []} onChange={onChange} addLabel={field.addLabel} />
        </FieldShell>
      );

    case "group":
      return (
        <div className="col-span-2 rounded-xl border border-border bg-muted/20 p-4">
          <p className="mb-4 text-sm font-semibold">{field.label}</p>
          <FieldsGrid fields={field.fields} value={(value as Obj) ?? emptyObject(field.fields)} onChange={onChange} />
          {field.help && <p className="mt-3 text-xs text-muted-foreground">{field.help}</p>}
        </div>
      );

    case "repeater":
      return (
        <FieldShell field={field}>
          <Repeater field={field} value={Array.isArray(value) ? (value as Obj[]) : []} onChange={onChange} />
        </FieldShell>
      );
  }
}

// ---------- Inputs ----------

function Counter({ value, max }: { value: string; max: number }) {
  const over = value.length > max;
  return <span className={cn("text-xs tabular-nums", over ? "font-medium text-amber-600" : "text-muted-foreground")}>{value.length}/{max}</span>;
}

function UrlInput({
  id,
  value,
  onChange,
  placeholder = "/contact or https://...",
  small,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  small?: boolean;
}) {
  const listId = useId();
  return (
    <div className="relative">
      <Link2 className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        id={id}
        value={value}
        list={listId}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value.trim())}
        className={cn(inputClass, small ? "h-9" : "h-10", "pl-9")}
      />
      <datalist id={listId}>
        {internalPages.map((p) => (
          <option key={p} value={p} />
        ))}
      </datalist>
    </div>
  );
}

function RatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex h-10 items-center gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          onMouseEnter={() => setHover(n)}
          onClick={() => onChange(n)}
          className="rounded p-0.5 transition-transform hover:scale-110"
        >
          <Star className={cn("size-6", n <= (hover || value) ? "fill-amber-400 text-amber-400" : "text-border")} />
        </button>
      ))}
      <span className="ml-2 text-sm text-muted-foreground">{value}/5</span>
    </div>
  );
}

function PriceInput({ value, onChange }: { value: { amount: number; period?: string }; onChange: (value: unknown) => void }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 sm:flex-row sm:items-center">
      <div className="relative sm:w-48">
        <span className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-sm text-muted-foreground">৳</span>
        <input
          type="number"
          min={0}
          step={500}
          value={value.amount ?? 0}
          onChange={(e) => onChange({ ...value, amount: Number(e.target.value) || 0 })}
          className={cn(inputClass, "h-10 pl-7 font-semibold")}
          aria-label="Amount"
        />
      </div>
      <SegmentedControl
        value={value.period ?? ""}
        onChange={(period) => onChange({ ...value, period })}
        options={[
          { value: "month", label: "/ month" },
          { value: "project", label: "/ project" },
          { value: "session", label: "/ session" },
          { value: "", label: "None" },
        ]}
      />
    </div>
  );
}

function ListInput({ value, onChange, addLabel = "Add item" }: { value: string[]; onChange: (value: string[]) => void; addLabel?: string }) {
  const [keys, setKeys] = useItemKeys(value.length);
  const inputs = useRef<Map<string, HTMLInputElement>>(new Map());

  const add = (at = value.length) => {
    const key = newKey();
    setKeys((k) => [...k.slice(0, at), key, ...k.slice(at)]);
    onChange([...value.slice(0, at), "", ...value.slice(at)]);
    requestAnimationFrame(() => inputs.current.get(key)?.focus());
  };
  const remove = (i: number) => {
    setKeys((k) => k.filter((_, j) => j !== i));
    onChange(value.filter((_, j) => j !== i));
  };
  const reorder = (newKeys: string[]) => {
    const byKey = new Map(keys.map((k, i) => [k, value[i]]));
    setKeys(newKeys);
    onChange(newKeys.map((k) => byKey.get(k) ?? ""));
  };

  return (
    <div>
      <Reorder.Group axis="y" values={keys} onReorder={reorder} className="space-y-2">
        {value.map((item, i) => (
          <ListRow key={keys[i]} id={keys[i]}>
            <input
              ref={(el) => {
                if (el) inputs.current.set(keys[i], el);
              }}
              value={item}
              onChange={(e) => onChange(value.map((v, j) => (j === i ? e.target.value : v)))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  add(i + 1);
                } else if (e.key === "Backspace" && !item && value.length > 1) {
                  e.preventDefault();
                  remove(i);
                }
              }}
              className={cn(inputClass, "h-9 flex-1")}
            />
            <AdminButton variant="ghost" size="icon-sm" onClick={() => remove(i)} aria-label="Remove">
              <Trash2 />
            </AdminButton>
          </ListRow>
        ))}
      </Reorder.Group>
      <AdminButton size="sm" className="mt-2" onClick={() => add()}>
        <Plus /> {addLabel}
      </AdminButton>
    </div>
  );
}

function ListRow({ id, children }: { id: string; children: React.ReactNode }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={id} dragListener={false} dragControls={controls} className="flex items-center gap-1.5">
      <DragHandle onPointerDown={(e) => controls.start(e)} />
      {children}
    </Reorder.Item>
  );
}

function DragHandle({ onPointerDown }: { onPointerDown: (e: React.PointerEvent) => void }) {
  return (
    <button
      type="button"
      aria-label="Drag to reorder"
      onPointerDown={onPointerDown}
      className="flex size-8 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing"
    >
      <GripVertical className="size-4" />
    </button>
  );
}

// ---------- Repeater ----------

function Repeater({ field, value, onChange }: { field: Extract<Field, { type: "repeater" }>; value: Obj[]; onChange: (value: Obj[]) => void }) {
  const [keys, setKeys] = useItemKeys(value.length);
  const [openKey, setOpenKey] = useState<string | null>(null);
  const full = field.max !== undefined && value.length >= field.max;

  const reorder = (newKeys: string[]) => {
    const byKey = new Map(keys.map((k, i) => [k, value[i]]));
    setKeys(newKeys);
    onChange(newKeys.map((k) => byKey.get(k) ?? {}));
  };
  const add = () => {
    const key = newKey();
    setKeys((k) => [...k, key]);
    onChange([...value, emptyObject(field.fields)]);
    setOpenKey(key);
  };
  const duplicate = (i: number) => {
    const key = newKey();
    setKeys((k) => [...k.slice(0, i + 1), key, ...k.slice(i + 1)]);
    onChange([...value.slice(0, i + 1), structuredClone(value[i]), ...value.slice(i + 1)]);
    setOpenKey(key);
  };
  const remove = (i: number) => {
    setKeys((k) => k.filter((_, j) => j !== i));
    onChange(value.filter((_, j) => j !== i));
  };

  return (
    <div>
      {value.length === 0 && (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted-foreground">Nothing added yet.</p>
      )}
      <Reorder.Group axis="y" values={keys} onReorder={reorder} className="space-y-2">
        {value.map((item, i) => {
          const key = keys[i];
          const titleValue = field.itemTitle ? item?.[field.itemTitle] : undefined;
          const title = typeof titleValue === "string" && titleValue ? titleValue : `Item ${i + 1}`;
          return (
            <RepeaterItem
              key={key}
              id={key}
              title={title}
              index={i}
              open={openKey === key}
              onToggle={() => setOpenKey(openKey === key ? null : key)}
              onDuplicate={full ? undefined : () => duplicate(i)}
              onRemove={() => remove(i)}
            >
              <FieldsGrid fields={field.fields} value={item ?? {}} onChange={(v) => onChange(value.map((x, j) => (j === i ? v : x)))} />
            </RepeaterItem>
          );
        })}
      </Reorder.Group>
      <div className="mt-2 flex items-center gap-3">
        <AdminButton size="sm" onClick={add} disabled={full}>
          <Plus /> {field.addLabel ?? "Add item"}
        </AdminButton>
        {field.max !== undefined && (
          <span className="text-xs text-muted-foreground">
            {value.length}/{field.max}
          </span>
        )}
      </div>
    </div>
  );
}

function RepeaterItem({
  id,
  title,
  index,
  open,
  onToggle,
  onDuplicate,
  onRemove,
  children,
}: {
  id: string;
  title: string;
  index: number;
  open: boolean;
  onToggle: () => void;
  onDuplicate?: () => void;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  const controls = useDragControls();
  return (
    <Reorder.Item
      value={id}
      dragListener={false}
      dragControls={controls}
      className={cn("overflow-hidden rounded-xl border bg-card transition-colors", open ? "border-accent/40 shadow-sm" : "border-border")}
    >
      <div className="flex items-center gap-1 pr-1.5 pl-1">
        <DragHandle onPointerDown={(e) => controls.start(e)} />
        <button type="button" onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-2.5 py-2.5 text-left text-sm">
          <span className="flex size-5 shrink-0 items-center justify-center rounded bg-muted text-[0.65rem] font-semibold text-muted-foreground">{index + 1}</span>
          <span className="truncate font-medium capitalize">{title}</span>
          <ChevronDown className={cn("ml-auto size-4 shrink-0 text-muted-foreground transition-transform", open && "rotate-180")} />
        </button>
        {onDuplicate && (
          <AdminButton variant="ghost" size="icon-sm" onClick={onDuplicate} aria-label="Duplicate">
            <Copy />
          </AdminButton>
        )}
        <AdminButton variant="ghost" size="icon-sm" onClick={onRemove} aria-label="Remove" className="hover:text-red-600">
          <Trash2 />
        </AdminButton>
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="border-t border-border p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </Reorder.Item>
  );
}

// ---------- Media field ----------

function MediaField({ kind, value, onChange }: { kind: "image" | "video"; value: string; onChange: (value: string) => void }) {
  const [picking, setPicking] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [dragging, setDragging] = useState(false);
  const Icon = kind === "video" ? Film : ImageIcon;

  async function upload(files: File[]) {
    const file = files.find((f) => f.type.startsWith(`${kind}/`));
    if (!file) return toast.error(`Please drop ${kind === "image" ? "an image" : "a video"} file`);
    setUploading(0);
    try {
      const [media] = await uploadMedia([file], setUploading);
      onChange(media.url);
      toast.success("Uploaded");
    } catch (err) {
      toast.error(errorMessage(err, "Upload failed"));
    } finally {
      setUploading(null);
    }
  }

  return (
    <>
      <div
        onDragOver={(e) => {
          if (!e.dataTransfer.types.includes("Files")) return;
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(Array.from(e.dataTransfer.files));
        }}
        className={cn(
          "flex flex-col gap-3 rounded-xl border bg-muted/30 p-3 transition-colors sm:flex-row sm:items-center",
          dragging ? "border-accent bg-accent/5" : "border-border",
        )}
      >
        <button
          type="button"
          onClick={() => setPicking(true)}
          className="relative flex aspect-video w-full shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-[repeating-conic-gradient(var(--muted)_0_25%,transparent_0_50%)] bg-[length:16px_16px] sm:w-44"
        >
          {value ? (
            kind === "video" ? (
              <video src={`${value}#t=0.5`} preload="metadata" muted className="size-full bg-black object-cover" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={value} alt="" className="size-full object-contain" />
            )
          ) : (
            <span className="flex flex-col items-center gap-1 text-muted-foreground">
              <Icon className="size-6" />
              <span className="text-xs">No {kind}</span>
            </span>
          )}
          {uploading !== null && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-sm font-semibold text-white">{uploading}%</span>
          )}
        </button>
        <div className="min-w-0 flex-1">
          {value ? (
            <p className="truncate text-xs text-muted-foreground" title={value}>
              {value.split("/").pop()}
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              <UploadCloud className="mr-1 inline size-3.5" />
              Drop a file here, or choose one
            </p>
          )}
          <div className="mt-2 flex flex-wrap gap-2">
            <AdminButton size="sm" onClick={() => setPicking(true)}>
              <ImagePlus /> {value ? "Replace" : `Choose ${kind}`}
            </AdminButton>
            {value && (
              <AdminButton size="sm" variant="danger-ghost" onClick={() => onChange("")}>
                <Trash2 /> Remove
              </AdminButton>
            )}
          </div>
        </div>
      </div>
      <MediaPickerDialog open={picking} onClose={() => setPicking(false)} kind={kind} onSelect={(m) => onChange(m.url)} />
    </>
  );
}

// ---------- Markdown ----------

const markdownTools = [
  { icon: Bold, label: "Bold" },
  { icon: Italic, label: "Italic" },
  { icon: Heading2, label: "Heading" },
  { icon: List, label: "Bullet list" },
  { icon: ListOrdered, label: "Numbered list" },
  { icon: Quote, label: "Quote" },
  { icon: Link2, label: "Link" },
  { icon: ImageIcon, label: "Image" },
] as const;

function MarkdownEditor({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [picking, setPicking] = useState(false);

  function wrap(before: string, after = before, placeholder = "text") {
    const el = ref.current;
    if (!el) return;
    const { selectionStart: start, selectionEnd: end } = el;
    const selected = value.slice(start, end) || placeholder;
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }

  function linePrefix(prefix: string) {
    const el = ref.current;
    if (!el) return;
    const start = value.lastIndexOf("\n", el.selectionStart - 1) + 1;
    onChange(value.slice(0, start) + prefix + value.slice(start));
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(el.selectionStart + prefix.length, el.selectionStart + prefix.length);
    });
  }

  function run(label: (typeof markdownTools)[number]["label"]) {
    if (label === "Bold") wrap("**");
    else if (label === "Italic") wrap("_");
    else if (label === "Heading") linePrefix("## ");
    else if (label === "Bullet list") linePrefix("- ");
    else if (label === "Numbered list") linePrefix("1. ");
    else if (label === "Quote") linePrefix("> ");
    else if (label === "Link") wrap("[", "](https://)", "link text");
    else setPicking(true);
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-background focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/15">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-muted/40 px-2 py-1.5">
        <div className="flex flex-wrap items-center">
          {markdownTools.map(({ icon: Icon, label }) => (
            <button
              key={label}
              type="button"
              title={label}
              aria-label={label}
              disabled={tab === "preview"}
              onClick={() => run(label)}
              className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:opacity-40"
            >
              <Icon className="size-4" />
            </button>
          ))}
        </div>
        <SegmentedControl
          value={tab}
          onChange={setTab}
          options={[
            { value: "write", label: "Write" },
            { value: "preview", label: "Preview" },
          ]}
        />
      </div>
      {tab === "write" ? (
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={14}
          placeholder="Start writing... Leave an empty line between paragraphs."
          className="field-sizing-content block min-h-72 w-full resize-y bg-transparent px-4 py-3 font-mono text-sm leading-relaxed outline-none"
        />
      ) : (
        <div className="min-h-72 px-5 py-4 text-muted-foreground">
          {value.trim() ? <Markdown>{value}</Markdown> : <p className="text-sm">Nothing to preview yet.</p>}
        </div>
      )}
      <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">
        **bold**, _italic_, ## heading, - list, [link](https://...)
      </p>
      <MediaPickerDialog
        open={picking}
        onClose={() => setPicking(false)}
        kind="image"
        onSelect={(m) => wrap(`![${m.alt || "image"}](${m.url})`, "", "")}
      />
    </div>
  );
}