import { Images, Inbox, LayoutDashboard, Users, type LucideIcon } from "lucide-react";
import { collectionSchemas, sectionSchemas } from "@/lib/cms/schema";

export type NavItem = { href: string; label: string; icon: LucideIcon; keywords?: string };
export type NavGroup = { title: string; items: NavItem[] };

export const adminNav: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, keywords: "home overview stats" },
  { href: "/admin/messages", label: "Messages", icon: Inbox, keywords: "contact form inbox leads" },
  { href: "/admin/media", label: "Media library", icon: Images, keywords: "images videos photos files upload" },
  { href: "/admin/subscribers", label: "Subscribers", icon: Users, keywords: "newsletter emails export csv" },
];

export const navGroups: NavGroup[] = [
  { title: "", items: adminNav.slice(0, 2) },
  {
    title: "Content",
    items: collectionSchemas
      .filter((c) => !c.hidden)
      .map((c) => ({ href: `/admin/collections/${c.key}`, label: c.label, icon: c.icon })),
  },
  {
    title: "Pages",
    items: sectionSchemas.filter((s) => s.group === "Pages").map((s) => ({ href: `/admin/sections/${s.key}`, label: s.label, icon: s.icon })),
  },
  {
    title: "Site settings",
    items: sectionSchemas
      .filter((s) => s.group === "Site settings")
      .map((s) => ({ href: `/admin/sections/${s.key}`, label: s.label, icon: s.icon })),
  },
  { title: "Library", items: adminNav.slice(2) },
];
