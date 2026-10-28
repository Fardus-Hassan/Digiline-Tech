"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Inbox, Mail, MailOpen, MessageSquareText, RefreshCw, Reply, Search, Settings2, Trash2, X } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, timeAgo } from "@/lib/admin";
import { cn } from "@/lib/utils";
import { AdminButton, Card, EmptyState, PageHeader, Spinner, inputClass, useConfirm } from "@/components/admin/ui";
import { MessageDetail } from "@/components/admin/messages/message-detail";
import { StatusManager } from "@/components/admin/messages/status-manager";
import { Avatar, StatusPill, statusColor, type MessageStatus, type MessageSummary } from "@/components/admin/messages/shared";

/** "inbox", "all" or a status key */
type Tab = string;
type ListResponse = { messages: MessageSummary[]; statuses: MessageStatus[]; counts: Record<string, number>; unread: number };

export default function MessagesPage() {
  return (
    <Suspense fallback={<Spinner />}>
      <Messages />
    </Suspense>
  );
}

function setOpenParam(id: string | null) {
  const url = new URL(window.location.href);
  if (id) url.searchParams.set("id", id);
  else url.searchParams.delete("id");
  window.history.pushState(null, "", url);
}

function Messages() {
  const confirm = useConfirm();
  const openId = useSearchParams().get("id");
  const [tab, setTab] = useState<Tab>("inbox");
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [data, setData] = useState<ListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [managing, setManaging] = useState(false);
  /** Bumped when statuses change so the open message reloads (its status may have been deleted). */
  const [statusVersion, setStatusVersion] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setQuery(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ status: tab, ...(query && { q: query }) });
      const res = await api<ListResponse>(`/contact?${params}`);
      if (tab !== "inbox" && tab !== "all" && !res.statuses.some((s) => s.key === tab)) {
        setTab("inbox");
        return;
      }
      setData(res);
      setError("");
      setSelected((current) => new Set([...current].filter((id) => res.messages.some((m) => m.id === id))));
    } catch (err) {
      setError(errorMessage(err, "Couldn't load messages"));
    } finally {
      setLoading(false);
    }
  }, [tab, query, setSelected]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch + refetch when the tab or search changes
    load();
  }, [load]);

  const unread = data?.unread;
  useEffect(() => {
    if (unread !== undefined) window.dispatchEvent(new CustomEvent("admin:unread", { detail: unread }));
  }, [unread]);

  const messages = data?.messages ?? [];
  const statuses = data?.statuses ?? [];
  const statusOf = (key: string) => statuses.find((s) => s.key === key);
  const tabs = [
    { value: "inbox", label: "Inbox", dot: null },
    ...statuses.map((s) => ({ value: s.key, label: s.label, dot: statusColor(s).dot })),
    { value: "all", label: "All", dot: null },
  ];
  const allSelected = messages.length > 0 && messages.every((m) => selected.has(m.id));

  function toggle(id: string) {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function open(id: string) {
    setOpenParam(id);
    setData((d) => d && { ...d, messages: d.messages.map((m) => (m.id === id ? { ...m, read: true } : m)) });
  }

  async function bulk(action: { action: "status"; status: string } | { action: "read" | "unread" | "delete" }) {
    const ids = [...selected];
    if (action.action === "delete") {
      const ok = await confirm({
        title: `Delete ${ids.length} message${ids.length > 1 ? "s" : ""}?`,
        description: "Their notes and reply history will be removed too. This can't be undone.",
        confirmLabel: "Delete",
        danger: true,
      });
      if (!ok) return;
    }
    try {
      await api("/contact/bulk", { method: "POST", body: JSON.stringify({ ...action, ids }) });
      const what =
        action.action === "status"
          ? `moved to ${statusOf(action.status)?.label}`
          : action.action === "delete"
            ? "deleted"
            : `marked as ${action.action}`;
      toast.success(`${ids.length} message${ids.length > 1 ? "s" : ""} ${what}`);
      if (action.action === "delete" && openId && ids.includes(openId)) setOpenParam(null);
      setSelected(new Set());
      await load();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  const inboxCount = data?.counts.inbox ?? 0;

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        title="Messages"
        icon={MessageSquareText}
        description={
          unread
            ? `${unread} unread message${unread > 1 ? "s" : ""} · ${inboxCount} in inbox`
            : `You're all caught up · ${inboxCount} in inbox`
        }
        actions={
          <>
            <AdminButton onClick={() => setManaging(true)} disabled={!data}>
              <Settings2 /> Manage statuses
            </AdminButton>
            <AdminButton size="icon" onClick={load} aria-label="Refresh" title="Refresh">
              <RefreshCw className={cn(loading && "animate-spin")} />
            </AdminButton>
          </>
        }
      />
      {managing && (
        <StatusManager
          statuses={statuses}
          onClose={() => setManaging(false)}
          onSaved={() => {
            setStatusVersion((v) => v + 1);
            load();
          }}
        />
      )}

      <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
        <div className="-mx-1 flex gap-1 overflow-x-auto px-1 [scrollbar-width:none]">
          {tabs.map((t) => {
            const active = tab === t.value;
            const count = data?.counts[t.value] ?? 0;
            const dot = t.dot;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  setTab(t.value);
                  setSelected(new Set());
                }}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-accent/40 bg-accent/10 text-accent"
                    : "border-border bg-card text-muted-foreground hover:border-foreground/20 hover:text-foreground",
                )}
              >
                {dot ? <span className={cn("size-2 rounded-full", dot)} /> : <Inbox className="size-3.5" />}
                {t.label}
                <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-accent/15" : "bg-muted")}>{count}</span>
              </button>
            );
          })}
        </div>
        <div className="relative xl:ml-auto xl:w-72">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, text…"
            aria-label="Search messages"
            className={cn(inputClass, "h-10 pr-9 pl-9")}
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              aria-label="Clear search"
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {error && <p className="mt-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>}

      <div className="mt-4 grid items-start gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
        <Card className={cn("overflow-hidden lg:sticky lg:top-20", openId && "hidden lg:block")}>
          <div className="flex min-h-12 items-center gap-2 border-b border-border px-4 py-2">
            <input
              type="checkbox"
              checked={allSelected}
              disabled={!messages.length}
              onChange={() => setSelected(allSelected ? new Set() : new Set(messages.map((m) => m.id)))}
              aria-label="Select all"
              className="size-4 cursor-pointer accent-accent"
            />
            {selected.size > 0 ? (
              <>
                <span className="text-sm font-medium">{selected.size} selected</span>
                <span className="flex-1" />
                <select
                  value=""
                  onChange={(e) => e.target.value && bulk({ action: "status", status: e.target.value })}
                  aria-label="Move selected to"
                  className="h-8 cursor-pointer rounded-md border border-border bg-background px-2 text-xs font-medium outline-none hover:bg-muted"
                >
                  <option value="">Move to…</option>
                  {statuses.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
                <AdminButton variant="ghost" size="icon-sm" title="Mark as read" aria-label="Mark as read" onClick={() => bulk({ action: "read" })}>
                  <MailOpen />
                </AdminButton>
                <AdminButton variant="ghost" size="icon-sm" title="Mark as unread" aria-label="Mark as unread" onClick={() => bulk({ action: "unread" })}>
                  <Mail />
                </AdminButton>
                <AdminButton variant="danger-ghost" size="icon-sm" title="Delete" aria-label="Delete selected" onClick={() => bulk({ action: "delete" })}>
                  <Trash2 />
                </AdminButton>
              </>
            ) : (
              <span className="text-sm text-muted-foreground">
                {messages.length} message{messages.length === 1 ? "" : "s"}
                {query && ` matching “${query}”`}
              </span>
            )}
          </div>

          {loading && !data ? (
            <Spinner />
          ) : messages.length === 0 ? (
            <div className="p-4">
              <EmptyState
                icon={query ? Search : Inbox}
                title={query ? "No matching messages" : "Nothing here"}
                description={query ? "Try a different name, email or word." : "Messages from the contact form will show up here."}
              />
            </div>
          ) : (
            <ul className="divide-y divide-border lg:max-h-[calc(100vh-17rem)] lg:overflow-y-auto">
              {messages.map((m) => {
                const active = m.id === openId;
                return (
                  <li
                    key={m.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => open(m.id)}
                    onKeyDown={(e) => e.key === "Enter" && open(m.id)}
                    className={cn(
                      "relative flex cursor-pointer gap-3 px-4 py-3.5 transition-colors outline-none hover:bg-muted/60 focus-visible:bg-muted/60",
                      active && "bg-accent/[0.07] hover:bg-accent/10",
                      selected.has(m.id) && "bg-accent/5",
                    )}
                  >
                    {active && <span className="absolute inset-y-0 left-0 w-0.5 bg-accent" />}
                    <input
                      type="checkbox"
                      checked={selected.has(m.id)}
                      onChange={() => toggle(m.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select message from ${m.name}`}
                      className="mt-2.5 size-4 shrink-0 cursor-pointer accent-accent"
                    />
                    <Avatar name={m.name} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className={cn("flex-1 truncate text-sm", m.read ? "font-medium" : "font-bold")}>{m.name}</span>
                        <time className="shrink-0 text-xs text-muted-foreground" dateTime={m.createdAt}>
                          {timeAgo(m.createdAt)}
                        </time>
                      </div>
                      <p className={cn("truncate text-sm", m.read ? "text-foreground/80" : "font-semibold")}>{m.subject || "No subject"}</p>
                      <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">{m.message}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <StatusPill status={statusOf(m.status)} />
                        {m._count.replies > 0 && (
                          <span className="inline-flex items-center gap-1 text-xs text-muted-foreground" title="Replies">
                            <Reply className="size-3" /> {m._count.replies}
                          </span>
                        )}
                        {!m.read && <span className="ml-auto size-2 rounded-full bg-accent shadow-[0_0_8px_rgba(252,100,1,0.6)]" title="Unread" />}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>

        <div className={cn("min-w-0", !openId && "hidden lg:block")}>
          {openId ? (
            <MessageDetail
              key={`${openId}-${statusVersion}`}
              id={openId}
              statuses={statuses}
              onClose={() => setOpenParam(null)}
              onChanged={load}
              onDeleted={() => {
                setOpenParam(null);
                load();
              }}
            />
          ) : (
            <Card className="flex min-h-96 flex-col items-center justify-center p-10 text-center">
              <span className="flex size-16 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <MessageSquareText className="size-8" />
              </span>
              <p className="mt-4 font-semibold">Select a message to read it</p>
              <p className="mt-1 max-w-xs text-sm text-muted-foreground">
                Change its status, keep private notes and write a formatted reply, all in one place.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
