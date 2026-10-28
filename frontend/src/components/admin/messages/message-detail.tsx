"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  ExternalLink,
  History,
  Mail,
  MailOpen,
  Phone,
  Reply,
  Send,
  StickyNote,
  Trash2,
} from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, timeAgo } from "@/lib/admin";
import { cn } from "@/lib/utils";
import { AdminButton, Card, Spinner, inputClass, useConfirm } from "@/components/admin/ui";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Avatar, StatusPill, statusColor, type MessageDetail as Detail, type MessageStatus } from "./shared";

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export function MessageDetail({
  id,
  statuses,
  onClose,
  onChanged,
  onDeleted,
}: {
  id: string;
  statuses: MessageStatus[];
  onClose: () => void;
  /** Called after anything that changes the list (read state, status, replies). */
  onChanged: () => void;
  onDeleted: (id: string) => void;
}) {
  const confirm = useConfirm();
  const [message, setMessage] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const onChangedRef = useRef(onChanged);
  useEffect(() => {
    onChangedRef.current = onChanged;
  });

  useEffect(() => {
    let alive = true;
    api<{ message: Detail }>(`/contact/${id}`)
      .then(async ({ message }) => {
        if (!alive) return;
        setMessage({ ...message, read: true });
        if (!message.read) {
          await api(`/contact/${id}`, { method: "PATCH", body: JSON.stringify({ read: true }) });
          onChangedRef.current();
        }
      })
      .catch((err) => alive && setError(errorMessage(err, "Couldn't load this message")));
    return () => {
      alive = false;
    };
  }, [id]);

  async function update(patch: Partial<Pick<Detail, "read" | "status" | "notes">>, success?: string) {
    setMessage((m) => (m ? { ...m, ...patch } : m));
    try {
      await api(`/contact/${id}`, { method: "PATCH", body: JSON.stringify(patch) });
      if (success) toast.success(success);
      onChanged();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  async function reload() {
    const res = await api<{ message: Detail }>(`/contact/${id}`).catch(() => null);
    if (res) setMessage(res.message);
    onChanged();
  }

  async function remove() {
    if (!message) return;
    const ok = await confirm({
      title: `Delete the message from ${message.name}?`,
      description: "The message, its notes and reply history will be removed. This can't be undone.",
      confirmLabel: "Delete",
      danger: true,
    });
    if (!ok) return;
    try {
      await api(`/contact/${id}`, { method: "DELETE" });
      toast.success("Message deleted");
      onDeleted(id);
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  if (error)
    return (
      <Card className="p-8 text-center">
        <p className="text-sm text-red-500">{error}</p>
        <AdminButton size="sm" className="mt-4" onClick={onClose}>
          Back to messages
        </AdminButton>
      </Card>
    );
  if (!message)
    return (
      <Card>
        <Spinner />
      </Card>
    );

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-2.5 sm:px-6">
          <AdminButton variant="ghost" size="sm" className="-ml-2 lg:hidden" onClick={onClose}>
            <ArrowLeft /> Back
          </AdminButton>
          <StatusMenu
            value={message.status}
            statuses={statuses}
            onChange={(status) => update({ status }, `Moved to ${statuses.find((s) => s.key === status)?.label}`)}
          />
          <span className="flex-1" />
          <AdminButton
            variant="ghost"
            size="icon-sm"
            title="Mark as unread"
            aria-label="Mark as unread"
            onClick={() => update({ read: false }, "Marked as unread")}
          >
            <MailOpen />
          </AdminButton>
          <AdminButton variant="danger-ghost" size="icon-sm" title="Delete" aria-label="Delete message" onClick={remove}>
            <Trash2 />
          </AdminButton>
        </div>

        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-start gap-4">
            <Avatar name={message.name} size="lg" />
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">{message.name}</h2>
              <div className="mt-1.5 flex flex-wrap gap-2 text-sm">
                <ContactChip icon={Mail} value={message.email} href={`mailto:${message.email}`} />
                {message.phone && <ContactChip icon={Phone} value={message.phone} href={`tel:${message.phone}`} />}
              </div>
            </div>
            <div className="text-right text-xs text-muted-foreground">
              <p className="font-medium text-foreground">{dateFormat.format(new Date(message.createdAt))}</p>
              <p className="mt-0.5">{timeAgo(message.createdAt)}</p>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-border bg-muted/40 p-5 sm:p-6">
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Subject</p>
            <h3 className="mt-1 text-lg font-semibold">{message.subject || "No subject"}</h3>
            <div className="my-4 h-px bg-border" />
            {message.messageHtml ? (
              <div className="rich-text text-[0.95rem]" dangerouslySetInnerHTML={{ __html: message.messageHtml }} />
            ) : (
              <p className="text-[0.95rem] leading-relaxed whitespace-pre-wrap">{message.message}</p>
            )}
          </div>

          {(message.ip || message.userAgent) && (
            <p className="mt-3 truncate text-xs text-muted-foreground" title={message.userAgent ?? undefined}>
              Sent from {message.ip ?? "unknown IP"}
              {message.userAgent && ` · ${message.userAgent}`}
            </p>
          )}
        </div>
      </Card>

      <Notes key={message.id} initial={message.notes} onSave={(notes) => update({ notes })} />

      <ReplyComposer message={message} onSaved={reload} />

      {message.replies.length > 0 && <ReplyHistory message={message} onChanged={reload} />}
    </div>
  );
}

function ContactChip({ icon: Icon, value, href }: { icon: typeof Mail; value: string; href: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    await navigator.clipboard.writeText(value).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }
  return (
    <span className="inline-flex max-w-full items-center overflow-hidden rounded-lg border border-border bg-background">
      <a href={href} className="flex min-w-0 items-center gap-1.5 px-2.5 py-1.5 hover:text-accent">
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate">{value}</span>
      </a>
      <button
        type="button"
        onClick={copy}
        title="Copy"
        aria-label={`Copy ${value}`}
        className="border-l border-border px-2 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
      >
        {copied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
      </button>
    </span>
  );
}

function StatusMenu({ value, statuses, onChange }: { value: string; statuses: MessageStatus[]; onChange: (status: string) => void }) {
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

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex items-center gap-1 rounded-full py-0.5 pr-1.5 hover:bg-muted"
      >
        <StatusPill status={statuses.find((s) => s.key === value)} />
        <ChevronDown className="size-3.5 text-muted-foreground" />
      </button>
      {open && (
        <ul role="listbox" className="absolute top-full left-0 z-30 mt-1.5 max-h-80 w-52 overflow-y-auto rounded-xl border border-border bg-card p-1 shadow-xl">
          {statuses.map((s) => (
            <li key={s.key}>
              <button
                type="button"
                role="option"
                aria-selected={s.key === value}
                onClick={() => {
                  setOpen(false);
                  if (s.key !== value) onChange(s.key);
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm hover:bg-muted"
              >
                <span className={cn("size-2 rounded-full", statusColor(s).dot)} />
                <span className="flex-1 truncate text-left">{s.label}</span>
                {s.key === value && <Check className="size-4 text-accent" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Notes({ initial, onSave }: { initial: string; onSave: (notes: string) => Promise<void> }) {
  const [notes, setNotes] = useState(initial);
  const [saved, setSaved] = useState(initial);
  const [state, setState] = useState<"idle" | "saving" | "saved">("idle");

  async function save() {
    if (notes === saved) return;
    setState("saving");
    await onSave(notes);
    setSaved(notes);
    setState("saved");
    setTimeout(() => setState("idle"), 2000);
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <StickyNote className="size-4 text-amber-500" />
        <h3 className="font-semibold">Private notes</h3>
        <span className="text-xs text-muted-foreground">Only admins can see this</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {state === "saving" ? "Saving…" : state === "saved" ? "Saved ✓" : notes !== saved ? "Unsaved" : ""}
        </span>
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        onBlur={save}
        rows={3}
        maxLength={10_000}
        placeholder="e.g. Called on Monday, sending a quote by Friday…"
        className={cn(inputClass, "mt-3 resize-y py-2.5 leading-relaxed")}
      />
    </Card>
  );
}

const emailWrapper = (html: string) => `<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6">${html}</div>`;

async function copyRich(html: string, text: string) {
  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        "text/html": new Blob([emailWrapper(html)], { type: "text/html" }),
        "text/plain": new Blob([text], { type: "text/plain" }),
      }),
    ]);
    return true;
  } catch {
    return navigator.clipboard
      .writeText(text)
      .then(() => true)
      .catch(() => false);
  }
}

function ReplyComposer({ message, onSaved }: { message: Detail; onSaved: () => Promise<void> }) {
  const [subject, setSubject] = useState(`Re: ${message.subject || "Your message to Digiline Tech"}`);
  const [body, setBody] = useState({ html: "", text: "" });
  const [editorKey, setEditorKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const empty = !body.text.trim();

  async function save() {
    setSaving(true);
    try {
      await api(`/contact/${message.id}/replies`, { method: "POST", body: JSON.stringify({ subject, html: body.html }) });
      setBody({ html: "", text: "" });
      setEditorKey((k) => k + 1);
      await onSaved();
    } catch (err) {
      toast.error(errorMessage(err, "Couldn't save the reply to history"));
    } finally {
      setSaving(false);
    }
  }

  async function openGmail() {
    const copied = copyRich(body.html, body.text);
    const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(message.email)}&su=${encodeURIComponent(subject)}`;
    window.open(url, "_blank", "noopener");
    if (await copied) toast.success("Reply copied. In Gmail, click the email body and press Ctrl+V, then Send.", { duration: 8000 });
    else toast.warning("Gmail opened, but the reply couldn't be copied. Use “Copy reply” and paste it in.");
    await save();
  }

  async function openMailApp() {
    const text = body.text.length > 1800 ? `${body.text.slice(0, 1800)}…` : body.text;
    window.location.href = `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    toast.success("Opening your email app. Check the email and press Send.");
    await save();
  }

  async function copyOnly() {
    if (await copyRich(body.html, body.text)) toast.success("Reply copied with formatting");
    else toast.error("Couldn't copy. Select the text and copy it manually.");
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <Reply className="size-4 text-accent" />
        <h3 className="font-semibold">Reply to {message.name.split(" ")[0]}</h3>
      </div>

      <label className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-background px-3 text-sm focus-within:border-accent">
        <span className="text-muted-foreground">To</span>
        <span className="truncate py-2.5">{message.email}</span>
      </label>
      <label className="mt-2 flex items-center gap-3 rounded-lg border border-border bg-background px-3 text-sm focus-within:border-accent focus-within:ring-3 focus-within:ring-accent/15">
        <span className="text-muted-foreground">Subject</span>
        <input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          className="min-w-0 flex-1 bg-transparent py-2.5 outline-none"
        />
      </label>

      <RichTextEditor
        key={editorKey}
        value={body.html}
        onChange={(html, text) => setBody({ html, text })}
        placeholder={`Hi ${message.name.split(" ")[0]}, thanks for reaching out…`}
        ariaLabel="Reply"
        className="mt-3"
        contentClassName="min-h-56"
      />

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <AdminButton variant="primary" disabled={empty || !subject.trim()} loading={saving} onClick={openGmail}>
          {!saving && <Send />} Copy & open Gmail
        </AdminButton>
        <AdminButton disabled={empty || !subject.trim() || saving} onClick={openMailApp}>
          <ExternalLink /> Open in email app
        </AdminButton>
        <AdminButton variant="ghost" disabled={empty} onClick={copyOnly}>
          <Copy /> Copy reply
        </AdminButton>
      </div>
      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Gmail opens with the address and subject filled in, and your formatted reply is copied, so just paste it (Ctrl+V) and press
        Send. The email app option sends plain text. Either way the reply is saved to this message&apos;s history and the status
        changes to Replied.
      </p>
    </Card>
  );
}

function ReplyHistory({ message, onChanged }: { message: Detail; onChanged: () => Promise<void> }) {
  const confirm = useConfirm();

  async function remove(replyId: string) {
    const ok = await confirm({ title: "Remove this reply from history?", confirmLabel: "Remove", danger: true });
    if (!ok) return;
    await api(`/contact/${message.id}/replies/${replyId}`, { method: "DELETE" }).catch((err) => toast.error(errorMessage(err)));
    await onChanged();
  }

  return (
    <Card className="p-5 sm:p-6">
      <div className="flex items-center gap-2">
        <History className="size-4 text-muted-foreground" />
        <h3 className="font-semibold">Reply history</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">{message.replies.length}</span>
      </div>
      <ol className="mt-5 space-y-5 border-l-2 border-border pl-6">
        {message.replies.map((reply) => (
          <li key={reply.id} className="relative">
            <span className="absolute top-1 -left-[1.95rem] flex size-4 items-center justify-center rounded-full border-2 border-card bg-emerald-500" />
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <p className="font-medium">{reply.subject}</p>
              <p className="text-xs text-muted-foreground" title={dateFormat.format(new Date(reply.createdAt))}>
                {timeAgo(reply.createdAt)}
              </p>
              <button
                type="button"
                onClick={() => remove(reply.id)}
                className="ml-auto text-xs text-muted-foreground hover:text-red-500"
              >
                Remove
              </button>
            </div>
            <div className="rich-text mt-2 rounded-xl border border-border bg-muted/30 p-4 text-sm" dangerouslySetInnerHTML={{ __html: reply.html }} />
          </li>
        ))}
      </ol>
    </Card>
  );
}
