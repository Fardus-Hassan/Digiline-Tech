"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { useTheme } from "next-themes";
import { Toaster } from "sonner";
import { ExternalLink, LogOut, Menu, Search, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { Logo } from "@/components/logo";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { ConfirmProvider, Kbd } from "@/components/admin/ui";
import { CommandPalette } from "@/components/admin/command-palette";
import { navGroups } from "@/components/admin/nav";

type Admin = { id: string; name: string; email: string };

const isActive = (pathname: string, href: string) => (href === "/admin" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    api<{ admin: Admin }>("/auth/me")
      .then((res) => setAdmin(res.admin))
      .catch(() => router.replace("/admin/login"));
  }, [router]);

  useEffect(() => {
    api<{ unread: number }>("/admin/stats")
      .then((res) => setUnread(res.unread))
      .catch(() => {});
  }, [pathname]);

  useEffect(() => {
    const onUnread = (e: Event) => setUnread((e as CustomEvent<number>).detail);
    window.addEventListener("admin:unread", onUnread);
    return () => window.removeEventListener("admin:unread", onUnread);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((open) => !open);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  async function logout() {
    await api("/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/admin/login");
    router.refresh();
  }

  const sidebar = (
    <aside className="flex h-full w-64 flex-col border-r border-border bg-card">
      <div className="flex h-16 shrink-0 items-center justify-between px-5">
        <Logo href="/admin" suffix="Admin" />
        <button type="button" className="lg:hidden" aria-label="Close menu" onClick={() => setSidebarOpen(false)}>
          <X className="size-5" />
        </button>
      </div>

      <div className="px-3 pb-2">
        <button
          type="button"
          onClick={() => {
            setSidebarOpen(false);
            setSearchOpen(true);
          }}
          className="flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/25"
        >
          <Search className="size-4" />
          <span className="flex-1 text-left">Search...</span>
          <Kbd>Ctrl K</Kbd>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 pb-4">
        {navGroups.map((group) => (
          <div key={group.title || "main"} className="mt-3 first:mt-1">
            {group.title && <p className="mb-1 px-3 text-[0.7rem] font-semibold tracking-wider text-muted-foreground/80 uppercase">{group.title}</p>}
            <ul className="space-y-0.5">
              {group.items.map(({ href, label, icon: Icon }) => {
                const active = isActive(pathname, href);
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        active ? "bg-accent/10 text-accent" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {active && <span className="absolute inset-y-1.5 left-0 w-0.5 rounded-full bg-accent" />}
                      <Icon className="size-4 shrink-0" />
                      <span className="flex-1 truncate">{label}</span>
                      {href === "/admin/messages" && unread > 0 && (
                        <span className="rounded-full bg-accent px-1.5 py-0.5 text-[0.65rem] leading-none font-semibold text-white">{unread}</span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-border p-3">
        <div className="flex items-center gap-3 rounded-lg px-2 py-1.5">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-sm font-semibold text-white">
            {(admin?.name || admin?.email || "A").charAt(0).toUpperCase()}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-medium">{admin?.name || "Admin"}</span>
            <span className="block truncate text-xs text-muted-foreground">{admin?.email}</span>
          </span>
          <button
            type="button"
            onClick={logout}
            title="Log out"
            aria-label="Log out"
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <ConfirmProvider>
      <div className="flex min-h-dvh bg-muted/40">
        <div className="sticky top-0 hidden h-dvh lg:block">{sidebar}</div>

        <AnimatePresence>
          {sidebarOpen && (
            <>
              <motion.div
                className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSidebarOpen(false)}
              />
              <motion.div
                className="fixed inset-y-0 left-0 z-50 lg:hidden"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
              >
                {sidebar}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-2 border-b border-border bg-background/80 px-4 backdrop-blur-xl sm:px-6">
            <button
              type="button"
              aria-label="Open menu"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex size-10 items-center justify-center rounded-lg border border-border lg:hidden"
            >
              <Menu className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/25 sm:max-w-sm"
            >
              <Search className="size-4 shrink-0" />
              <span className="flex-1 truncate text-left">Search anything...</span>
              <Kbd className="hidden sm:inline-flex">Ctrl K</Kbd>
            </button>
            <div className="ml-auto flex items-center gap-2">
              <a
                href="/"
                target="_blank"
                rel="noreferrer"
                className="hidden h-10 items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm font-medium transition-colors hover:bg-muted sm:inline-flex"
              >
                <ExternalLink className="size-4" /> View website
              </a>
              <ThemeToggle />
            </div>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>

      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <Toaster richColors closeButton position="top-right" theme={resolvedTheme === "dark" ? "dark" : "light"} />
    </ConfirmProvider>
  );
}
