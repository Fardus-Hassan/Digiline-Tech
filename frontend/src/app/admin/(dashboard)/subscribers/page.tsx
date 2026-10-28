"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Download, Mail, Search, Trash2, Users } from "lucide-react";
import { api } from "@/lib/api";
import { errorMessage, timeAgo } from "@/lib/admin";
import { AdminButton, adminButton, EmptyState, inputClass, PageHeader, Spinner, useConfirm } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Subscriber = { id: string; email: string; createdAt: string };

export default function SubscribersPage() {
  const confirm = useConfirm();
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    api<{ subscribers: Subscriber[] }>("/subscribers")
      .then((res) => setSubscribers(res.subscribers))
      .catch((err) => {
        toast.error(errorMessage(err));
        setSubscribers([]);
      });
  }, []);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (subscribers ?? []).filter((s) => s.email.includes(q));
  }, [subscribers, query]);

  async function remove(subscriber: Subscriber) {
    const ok = await confirm({ title: "Remove subscriber?", description: subscriber.email, confirmLabel: "Remove", danger: true });
    if (!ok) return;
    setSubscribers((list) => list?.filter((s) => s.id !== subscriber.id) ?? null);
    try {
      await api(`/subscribers/${subscriber.id}`, { method: "DELETE" });
      toast.success("Removed");
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <PageHeader
        title="Subscribers"
        description="People who joined your newsletter from the website footer."
        icon={Users}
        actions={
          subscribers && subscribers.length > 0 && (
            <a href="/api/subscribers/export" className={adminButton("secondary", "md")}>
              <Download /> Export CSV
            </a>
          )
        }
      />

      {!subscribers ? (
        <Spinner />
      ) : subscribers.length === 0 ? (
        <EmptyState icon={Users} title="No subscribers yet" description="When someone subscribes from your website, they'll appear here." />
      ) : (
        <>
          <div className="relative mb-4">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={`Search ${subscribers.length} subscribers...`} className={cn(inputClass, "h-10 pl-9")} />
          </div>
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
            {visible.map((s) => (
              <li key={s.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <Mail className="size-4" />
                </span>
                <a href={`mailto:${s.email}`} className="min-w-0 flex-1 truncate text-sm font-medium hover:text-accent">
                  {s.email}
                </a>
                <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">{timeAgo(s.createdAt)}</span>
                <AdminButton variant="ghost" size="icon-sm" title="Remove" onClick={() => remove(s)} className="hover:text-red-600">
                  <Trash2 />
                </AdminButton>
              </li>
            ))}
            {visible.length === 0 && <li className="py-10 text-center text-sm text-muted-foreground">No match.</li>}
          </ul>
        </>
      )}
    </div>
  );
}
