"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Inbox, Loader2, Mail, MailOpen, Phone, RefreshCw, Trash2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { cn } from "@/lib/utils";

type Message = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  read: boolean;
  createdAt: string;
};

const dateFormat = new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" });

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [unread, setUnread] = useState(0);
  const [filter, setFilter] = useState<"all" | "unread">("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api<{ messages: Message[]; unread: number }>(`/contact?filter=${filter}`);
      setMessages(res.messages);
      setUnread(res.unread);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't load messages");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial fetch + refetch on filter change
    load();
  }, [load]);

  async function setRead(message: Message, read: boolean) {
    if (message.read === read) return;
    setMessages((list) => list.map((m) => (m.id === message.id ? { ...m, read } : m)));
    setUnread((n) => n + (read ? -1 : 1));
    await api(`/contact/${message.id}`, { method: "PATCH", body: JSON.stringify({ read }) }).catch(load);
  }

  async function remove(message: Message) {
    if (!confirm(`Delete the message from ${message.name}?`)) return;
    setMessages((list) => list.filter((m) => m.id !== message.id));
    if (!message.read) setUnread((n) => n - 1);
    await api(`/contact/${message.id}`, { method: "DELETE" }).catch(load);
  }

  function toggle(message: Message) {
    const opening = openId !== message.id;
    setOpenId(opening ? message.id : null);
    if (opening) setRead(message, true);
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Messages</h1>
          <p className="mt-1 text-muted-foreground">
            {unread > 0 ? `${unread} unread message${unread > 1 ? "s" : ""}` : "You're all caught up"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-border bg-card p-1 text-sm">
            {(["all", "unread"] as const).map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={cn(
                  "rounded-md px-3 py-1.5 font-medium capitalize transition-colors",
                  filter === value ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={load}
            aria-label="Refresh"
            className="inline-flex size-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {error && (
          <p className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>
        )}

        {loading && messages.length === 0 ? (
          <div className="flex justify-center py-20 text-muted-foreground">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : messages.length === 0 && !error ? (
          <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
            <Inbox className="size-10 text-muted-foreground" />
            <p className="mt-3 font-medium">No messages yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Contact form submissions will show up here.</p>
          </div>
        ) : (
          messages.map((message) => {
            const open = openId === message.id;
            return (
              <article
                key={message.id}
                className={cn(
                  "overflow-hidden rounded-2xl border bg-card transition-colors",
                  message.read ? "border-border" : "border-accent/40",
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(message)}
                  aria-expanded={open}
                  className="flex w-full items-start gap-4 p-4 text-left sm:p-5"
                >
                  <span
                    className={cn(
                      "mt-1.5 size-2.5 shrink-0 rounded-full",
                      message.read ? "bg-transparent" : "bg-accent shadow-[0_0_8px_rgba(252,100,1,0.6)]",
                    )}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                      <span className={cn("truncate", message.read ? "font-medium" : "font-semibold")}>
                        {message.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {dateFormat.format(new Date(message.createdAt))}
                      </span>
                    </span>
                    <span className="mt-0.5 block truncate text-sm">{message.subject || "No subject"}</span>
                    {!open && (
                      <span className="mt-1 line-clamp-1 block text-sm text-muted-foreground">{message.message}</span>
                    )}
                  </span>
                </button>

                <AnimatePresence initial={false}>
                  {open && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border px-4 pt-4 pb-5 sm:px-5 sm:pl-[3.15rem]">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.message}</p>
                        <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
                          <a
                            href={`mailto:${message.email}?subject=${encodeURIComponent(`Re: ${message.subject || "Your message to Digiline Tech"}`)}`}
                            className="inline-flex items-center gap-2 rounded-lg bg-accent-gradient px-3 py-2 font-medium text-white"
                          >
                            <Mail className="size-4" /> {message.email}
                          </a>
                          {message.phone && (
                            <a
                              href={`tel:${message.phone}`}
                              className="inline-flex items-center gap-2 rounded-lg border border-border px-3 py-2 font-medium hover:bg-muted"
                            >
                              <Phone className="size-4" /> {message.phone}
                            </a>
                          )}
                          <span className="flex-1" />
                          <button
                            type="button"
                            onClick={() => setRead(message, false)}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground"
                          >
                            <MailOpen className="size-4" /> Mark unread
                          </button>
                          <button
                            type="button"
                            onClick={() => remove(message)}
                            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-red-500 hover:bg-red-500/10"
                          >
                            <Trash2 className="size-4" /> Delete
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </article>
            );
          })
        )}
      </div>
    </div>
  );
}
