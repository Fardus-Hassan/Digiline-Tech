"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Color, FontFamily, FontSize, TextStyle } from "@tiptap/extension-text-style";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import { CharacterCount, Placeholder } from "@tiptap/extensions";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Code,
  Highlighter,
  Italic,
  Link2,
  List,
  ListOrdered,
  Minus,
  Quote,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Subscript as SubscriptIcon,
  Superscript as SuperscriptIcon,
  Underline,
  Undo2,
  Unlink,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const FONTS = [
  { label: "Default font", value: "" },
  { label: "Arial", value: "Arial, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Times New Roman", value: "'Times New Roman', serif" },
  { label: "Verdana", value: "Verdana, sans-serif" },
  { label: "Tahoma", value: "Tahoma, sans-serif" },
  { label: "Trebuchet MS", value: "'Trebuchet MS', sans-serif" },
  { label: "Courier New", value: "'Courier New', monospace" },
];
const SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px"];
const TEXT_COLORS = [
  "#0f172a", "#475569", "#94a3b8", "#ffffff", "#dc2626", "#ea580c", "#ff5a00", "#ca8a04",
  "#16a34a", "#0d9488", "#2563eb", "#4f46e5", "#9333ea", "#db2777",
];
const HIGHLIGHTS = ["#fef08a", "#fed7aa", "#fecaca", "#fbcfe8", "#e9d5ff", "#bfdbfe", "#bbf7d0", "#e2e8f0"];

type Props = {
  value?: string;
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  maxLength?: number;
  invalid?: boolean;
  ariaLabel?: string;
  className?: string;
  contentClassName?: string;
};

const noopSubscribe = () => () => {};

/** Word-processor style editor. Output is HTML; the backend sanitizes it before storing. */
export function RichTextEditor(props: Props) {
  // Tiptap generates random ids, so it can't run during prerendering
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  if (!mounted)
    return (
      <div className={cn("overflow-hidden rounded-xl border border-border bg-background", props.className)}>
        <div className="h-11 border-b border-border bg-muted/50" />
        <div className={cn("min-h-40", props.contentClassName)} />
      </div>
    );
  return <EditorField {...props} />;
}

function EditorField({ value = "", onChange, placeholder, maxLength, invalid, ariaLabel, className, contentClassName }: Props) {
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  });

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: "https" },
      }),
      TextStyle,
      Color,
      FontFamily,
      FontSize,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      Placeholder.configure({ placeholder: placeholder ?? "" }),
      CharacterCount.configure({ limit: maxLength }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: cn("rich-text min-h-40 px-4 py-3 text-base outline-none sm:text-sm", contentClassName),
        ...(ariaLabel ? { "aria-label": ariaLabel } : {}),
        role: "textbox",
        "aria-multiline": "true",
      },
    },
    onUpdate: ({ editor }) => onChangeRef.current(editor.isEmpty ? "" : editor.getHTML(), editor.getText().trim()),
  });

  return (
    <div
      className={cn(
        "overflow-hidden rounded-xl border border-border bg-background transition-[border-color,box-shadow] focus-within:border-accent focus-within:ring-2 focus-within:ring-accent/20",
        invalid && "border-red-500 focus-within:border-red-500 focus-within:ring-red-500/20",
        className,
      )}
    >
      {editor ? <Toolbar editor={editor} /> : <div className="h-11 border-b border-border bg-muted/50" />}
      <EditorContent editor={editor} />
      {editor && maxLength && <Counter editor={editor} max={maxLength} />}
    </div>
  );
}

function Counter({ editor, max }: { editor: Editor; max: number }) {
  const count = useEditorState({ editor, selector: ({ editor }) => editor.storage.characterCount.characters() as number });
  return (
    <p className={cn("px-4 pb-2 text-right text-xs text-muted-foreground", count >= max && "text-red-500")}>
      {count.toLocaleString()} / {max.toLocaleString()}
    </p>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const s = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive("heading", { level: 1 })
        ? "h1"
        : e.isActive("heading", { level: 2 })
          ? "h2"
          : e.isActive("heading", { level: 3 })
            ? "h3"
            : "p",
      font: (e.getAttributes("textStyle").fontFamily as string) ?? "",
      size: (e.getAttributes("textStyle").fontSize as string) ?? "",
      color: (e.getAttributes("textStyle").color as string) ?? "",
      highlight: (e.getAttributes("highlight").color as string) ?? "",
      bold: e.isActive("bold"),
      italic: e.isActive("italic"),
      underline: e.isActive("underline"),
      strike: e.isActive("strike"),
      sub: e.isActive("subscript"),
      sup: e.isActive("superscript"),
      code: e.isActive("code"),
      link: e.isActive("link"),
      bullet: e.isActive("bulletList"),
      ordered: e.isActive("orderedList"),
      quote: e.isActive("blockquote"),
      codeBlock: e.isActive("codeBlock"),
      align: (["center", "right", "justify"] as const).find((a) => e.isActive({ textAlign: a })) ?? "left",
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });
  const chain = () => editor.chain().focus();

  return (
    <div className="flex flex-wrap items-center gap-0.5 border-b border-border bg-muted/50 px-1.5 py-1.5" role="toolbar" aria-label="Text formatting">
      <Btn icon={Undo2} label="Undo (Ctrl+Z)" disabled={!s.canUndo} onClick={() => chain().undo().run()} />
      <Btn icon={Redo2} label="Redo (Ctrl+Y)" disabled={!s.canRedo} onClick={() => chain().redo().run()} />
      <Divider />

      <Select
        label="Text style"
        value={s.block}
        onChange={(v) => (v === "p" ? chain().setParagraph().run() : chain().setHeading({ level: Number(v[1]) as 1 | 2 | 3 }).run())}
        options={[
          { value: "p", label: "Normal" },
          { value: "h1", label: "Heading 1" },
          { value: "h2", label: "Heading 2" },
          { value: "h3", label: "Heading 3" },
        ]}
        className="w-28"
      />
      <Select
        label="Font"
        value={s.font}
        onChange={(v) => (v ? chain().setFontFamily(v).run() : chain().unsetFontFamily().run())}
        options={FONTS}
        className="w-32"
      />
      <Select
        label="Font size"
        value={s.size}
        onChange={(v) => (v ? chain().setFontSize(v).run() : chain().unsetFontSize().run())}
        options={[{ value: "", label: "Size" }, ...SIZES.map((v) => ({ value: v, label: v.replace("px", "") }))]}
        className="w-18"
      />
      <Divider />

      <Btn icon={Bold} label="Bold (Ctrl+B)" active={s.bold} onClick={() => chain().toggleBold().run()} />
      <Btn icon={Italic} label="Italic (Ctrl+I)" active={s.italic} onClick={() => chain().toggleItalic().run()} />
      <Btn icon={Underline} label="Underline (Ctrl+U)" active={s.underline} onClick={() => chain().toggleUnderline().run()} />
      <Btn icon={Strikethrough} label="Strikethrough" active={s.strike} onClick={() => chain().toggleStrike().run()} />
      <Btn icon={SubscriptIcon} label="Subscript" active={s.sub} onClick={() => chain().toggleSubscript().run()} />
      <Btn icon={SuperscriptIcon} label="Superscript" active={s.sup} onClick={() => chain().toggleSuperscript().run()} />
      <Btn icon={Code} label="Inline code" active={s.code} onClick={() => chain().toggleCode().run()} />
      <Divider />

      <ColorMenu
        icon={Baseline}
        label="Text color"
        current={s.color}
        colors={TEXT_COLORS}
        onPick={(c) => (c ? chain().setColor(c).run() : chain().unsetColor().run())}
      />
      <ColorMenu
        icon={Highlighter}
        label="Highlight"
        current={s.highlight}
        colors={HIGHLIGHTS}
        onPick={(c) => (c ? chain().setHighlight({ color: c }).run() : chain().unsetHighlight().run())}
      />
      <Divider />

      <Btn icon={AlignLeft} label="Align left" active={s.align === "left"} onClick={() => chain().setTextAlign("left").run()} />
      <Btn icon={AlignCenter} label="Align center" active={s.align === "center"} onClick={() => chain().setTextAlign("center").run()} />
      <Btn icon={AlignRight} label="Align right" active={s.align === "right"} onClick={() => chain().setTextAlign("right").run()} />
      <Btn icon={AlignJustify} label="Justify" active={s.align === "justify"} onClick={() => chain().setTextAlign("justify").run()} />
      <Divider />

      <Btn icon={List} label="Bullet list" active={s.bullet} onClick={() => chain().toggleBulletList().run()} />
      <Btn icon={ListOrdered} label="Numbered list" active={s.ordered} onClick={() => chain().toggleOrderedList().run()} />
      <Btn icon={Quote} label="Quote" active={s.quote} onClick={() => chain().toggleBlockquote().run()} />
      <Btn icon={SquareCode} label="Code block" active={s.codeBlock} onClick={() => chain().toggleCodeBlock().run()} />
      <Btn icon={Minus} label="Divider line" onClick={() => chain().setHorizontalRule().run()} />
      <Divider />

      <LinkMenu editor={editor} active={s.link} />
      <Btn icon={Unlink} label="Remove link" disabled={!s.link} onClick={() => chain().extendMarkRange("link").unsetLink().run()} />
      <Btn icon={RemoveFormatting} label="Clear formatting" onClick={() => chain().unsetAllMarks().clearNodes().run()} />
    </div>
  );
}

function Btn({ icon: Icon, label, active, disabled, onClick }: { icon: LucideIcon; label: string; active?: boolean; disabled?: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground disabled:pointer-events-none disabled:opacity-35",
        active && "bg-accent/15 text-accent hover:bg-accent/20 hover:text-accent",
      )}
    >
      <Icon className="size-4" />
    </button>
  );
}

const Divider = () => <span aria-hidden className="mx-0.5 h-5 w-px bg-border" />;

function Select({
  label,
  value,
  options,
  onChange,
  className,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  className?: string;
}) {
  return (
    <select
      aria-label={label}
      title={label}
      value={options.some((o) => o.value === value) ? value : ""}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-8 cursor-pointer rounded-md border border-transparent bg-transparent px-1.5 text-sm text-foreground outline-none hover:border-border hover:bg-card focus:border-accent [&>option]:bg-card",
        className,
      )}
    >
      {options.map((o) => (
        <option key={o.label} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function usePopover() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);
  return { open, setOpen, ref };
}

function ColorMenu({
  icon: Icon,
  label,
  current,
  colors,
  onPick,
}: {
  icon: LucideIcon;
  label: string;
  current: string;
  colors: string[];
  onPick: (color: string) => void;
}) {
  const { open, setOpen, ref } = usePopover();
  const pick = (c: string) => {
    onPick(c);
    setOpen(false);
  };
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(!open)}
        className="flex h-8 w-9 flex-col items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
      >
        <Icon className="size-4" />
        <span className="mt-0.5 h-1 w-4 rounded-full border border-border" style={{ background: current || "transparent" }} />
      </button>
      {open && (
        <div className="absolute top-full left-0 z-30 mt-1 w-52 rounded-xl border border-border bg-card p-3 shadow-xl">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{label}</p>
          <div className="grid grid-cols-7 gap-1.5">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                aria-label={c}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => pick(c)}
                className={cn(
                  "size-6 rounded-md border border-black/10 transition-transform hover:scale-110 dark:border-white/15",
                  current.toLowerCase() === c && "ring-2 ring-accent ring-offset-1 ring-offset-card",
                )}
                style={{ background: c }}
              />
            ))}
          </div>
          <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
            <label className="flex flex-1 cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <input type="color" className="size-6 cursor-pointer rounded border-0 bg-transparent p-0" onChange={(e) => onPick(e.target.value)} />
              Custom
            </label>
            <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => pick("")} className="text-xs font-medium text-muted-foreground hover:text-foreground">
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function LinkMenu({ editor, active }: { editor: Editor; active: boolean }) {
  const { open, setOpen, ref } = usePopover();
  const [url, setUrl] = useState("");

  function openMenu() {
    setUrl((editor.getAttributes("link").href as string) ?? "");
    setOpen(true);
  }

  function apply(e: React.FormEvent) {
    e.preventDefault();
    const href = url.trim();
    const chain = editor.chain().focus().extendMarkRange("link");
    if (!href) chain.unsetLink().run();
    else {
      const full = /^(https?:|mailto:|tel:)/i.test(href) ? href : `https://${href}`;
      if (editor.state.selection.empty && !active) chain.insertContent({ type: "text", text: href, marks: [{ type: "link", attrs: { href: full } }] }).run();
      else chain.setLink({ href: full }).run();
    }
    setOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <Btn icon={Link2} label="Add link" active={active} onClick={() => (open ? setOpen(false) : openMenu())} />
      {open && (
        <form onSubmit={apply} className="absolute top-full right-0 z-30 mt-1 flex w-72 gap-2 rounded-xl border border-border bg-card p-2 shadow-xl sm:right-auto sm:left-0">
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            aria-label="Link address"
            className="h-8 min-w-0 flex-1 rounded-md border border-border bg-background px-2 text-sm outline-none focus:border-accent"
          />
          <button type="submit" className="h-8 rounded-md bg-accent px-3 text-sm font-medium text-white">
            Apply
          </button>
        </form>
      )}
    </div>
  );
}
