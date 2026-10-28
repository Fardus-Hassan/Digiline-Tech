"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileEdit, Home, Images, Inbox, Menu, Newspaper, Palette, Plus, Users, type LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import { getCollectionSchema } from "@/lib/cms/schema";
import { entryTitle, timeAgo, type EntryStatus } from "@/lib/admin";
import { Card, PageHeader, Spinner, StatusBadge } from "@/components/admin/ui";
import { cn } from "@/lib/utils";

type Stats = {
  unread: number;
  messages: number;
  subscribers: number;
  media: number;
  drafts: number;
  recentMessages: { id: string; name: string; subject: string | null; read: boolean; createdAt: string }[];
  recentEntries: { id: string; collection: string; slug: string; status: EntryStatus; data: Record<string, unknown>; updatedAt: string }[];
};

const quickActions: { href: string; label: string; description: string; icon: LucideIcon }[] = [
  { href: "/admin/sections/settings", label: "Logo & brand", description: "Logo, name, contact info, socials", icon: Palette },
  { href: "/admin/sections/home", label: "Home page", description: "Hero text, buttons, sections", icon: Home },
  { href: "/admin/sections/navigation", label: "Menu", description: "Navbar links & button texts", icon: Menu },
  { href: "/admin/collections/posts/new", label: "Write a blog post", description: "Publish a new article", icon: Newspaper },
  { href: "/admin/collections/services", label: "Services", description: "Services, sub-services & prices", icon: FileEdit },
  { href: "/admin/media", label: "Upload media", description: "Images and videos", icon: Images },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>("/admin/stats").then(setStats).catch(() => {});
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader title={greeting} description="Everything on your website can be changed from here. Press Ctrl K to find anything fast." />

      {!stats ? (
        <Spinner />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <StatCard href="/admin/messages" label="Unread messages" value={stats.unread} sub={`${stats.messages} total`} icon={Inbox} highlight={stats.unread > 0} />
            <StatCard href="/admin/subscribers" label="Subscribers" value={stats.subscribers} sub="Newsletter" icon={Users} />
            <StatCard href="/admin/media" label="Media files" value={stats.media} sub="Images & videos" icon={Images} />
            <StatCard href="/admin/collections/services" label="Drafts" value={stats.drafts} sub="Not yet published" icon={FileEdit} />
          </div>

          <div>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Quick actions</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {quickActions.map(({ href, label, description, icon: Icon }) => (
                <Link key={href} href={href} className="group flex items-center gap-3 rounded-2xl border border-border bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
                  <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Icon className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium">{label}</span>
                    <span className="block truncate text-sm text-muted-foreground">{description}</span>
                  </span>
                  <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-accent" />
                </Link>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-semibold">Recently edited</h2>
              </div>
              {stats.recentEntries.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">Nothing yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {stats.recentEntries.map((entry) => {
                    const schema = getCollectionSchema(entry.collection);
                    const Icon = schema?.icon ?? FileEdit;
                    return (
                      <li key={entry.id}>
                        <Link href={`/admin/collections/${entry.collection}/${entry.id}`} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40">
                          <Icon className="size-4 shrink-0 text-muted-foreground" />
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium">{entryTitle(entry.data, schema?.titleField)}</span>
                            <span className="block text-xs text-muted-foreground">
                              {schema?.singular} · {timeAgo(entry.updatedAt)}
                            </span>
                          </span>
                          <StatusBadge status={entry.status} />
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </Card>

            <Card>
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <h2 className="font-semibold">Latest messages</h2>
                <Link href="/admin/messages" className="text-sm font-medium text-accent hover:underline">
                  View all
                </Link>
              </div>
              {stats.recentMessages.length === 0 ? (
                <p className="px-5 py-10 text-center text-sm text-muted-foreground">No messages yet.</p>
              ) : (
                <ul className="divide-y divide-border">
                  {stats.recentMessages.map((m) => (
                    <li key={m.id}>
                      <Link href="/admin/messages" className="flex items-center gap-3 px-5 py-3 hover:bg-muted/40">
                        <span className={cn("size-2 shrink-0 rounded-full", m.read ? "bg-transparent" : "bg-accent")} />
                        <span className="min-w-0 flex-1">
                          <span className={cn("block truncate text-sm", !m.read && "font-semibold")}>{m.name}</span>
                          <span className="block truncate text-xs text-muted-foreground">{m.subject || "No subject"}</span>
                        </span>
                        <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(m.createdAt)}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </div>

          <Link href="/admin/collections/posts/new" className="flex items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-4 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/50 hover:text-accent sm:hidden">
            <Plus className="size-4" /> New blog post
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ href, label, value, sub, icon: Icon, highlight }: { href: string; label: string; value: number; sub: string; icon: LucideIcon; highlight?: boolean }) {
  return (
    <Link href={href} className={cn("rounded-2xl border bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-md sm:p-5", highlight ? "border-accent/40" : "border-border")}>
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <Icon className={cn("size-4", highlight ? "text-accent" : "text-muted-foreground")} />
      </div>
      <p className="mt-2 text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>
    </Link>
  );
}
