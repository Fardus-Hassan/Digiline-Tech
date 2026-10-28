import { cn } from "@/lib/utils";

export const STATUS_COLORS = {
  sky: { dot: "bg-sky-500", pill: "bg-sky-500/10 text-sky-700 dark:text-sky-300" },
  amber: { dot: "bg-amber-500", pill: "bg-amber-500/10 text-amber-700 dark:text-amber-300" },
  emerald: { dot: "bg-emerald-500", pill: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" },
  slate: { dot: "bg-slate-400", pill: "bg-slate-500/10 text-slate-600 dark:text-slate-300" },
  red: { dot: "bg-red-500", pill: "bg-red-500/10 text-red-700 dark:text-red-300" },
  zinc: { dot: "bg-zinc-400", pill: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-300" },
  violet: { dot: "bg-violet-500", pill: "bg-violet-500/10 text-violet-700 dark:text-violet-300" },
  pink: { dot: "bg-pink-500", pill: "bg-pink-500/10 text-pink-700 dark:text-pink-300" },
  teal: { dot: "bg-teal-500", pill: "bg-teal-500/10 text-teal-700 dark:text-teal-300" },
  orange: { dot: "bg-orange-500", pill: "bg-orange-500/10 text-orange-700 dark:text-orange-300" },
  indigo: { dot: "bg-indigo-500", pill: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300" },
  lime: { dot: "bg-lime-500", pill: "bg-lime-500/10 text-lime-700 dark:text-lime-300" },
};
export type StatusColor = keyof typeof STATUS_COLORS;

export type MessageStatus = { key: string; label: string; color: StatusColor; inInbox: boolean; sortOrder: number };

/** Set automatically when a reply is saved, so it can't be deleted. */
export const REPLIED = "REPLIED";

export const statusColor = (status?: MessageStatus) => STATUS_COLORS[status?.color ?? "slate"] ?? STATUS_COLORS.slate;

export type MessageSummary = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  status: string;
  read: boolean;
  createdAt: string;
  _count: { replies: number };
};

export type MessageReply = { id: string; subject: string; html: string; text: string; createdAt: string };

export type MessageDetail = Omit<MessageSummary, "_count"> & {
  messageHtml: string | null;
  notes: string;
  ip: string | null;
  userAgent: string | null;
  replies: MessageReply[];
};

export function StatusPill({ status, className }: { status?: MessageStatus; className?: string }) {
  const c = statusColor(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap", c.pill, className)}>
      <span className={cn("size-1.5 rounded-full", c.dot)} />
      {status?.label ?? "Unknown"}
    </span>
  );
}

const GRADIENTS = [
  "from-orange-500 to-rose-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-violet-500 to-fuchsia-500",
  "from-amber-500 to-orange-600",
  "from-pink-500 to-rose-600",
];

export function Avatar({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const initials =
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "?";
  const hash = [...name].reduce((sum, ch) => sum + ch.charCodeAt(0), 0);
  return (
    <span
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-linear-to-br font-semibold text-white",
        GRADIENTS[hash % GRADIENTS.length],
        size === "sm" && "size-9 text-xs",
        size === "md" && "size-11 text-sm",
        size === "lg" && "size-14 text-lg",
      )}
    >
      {initials}
    </span>
  );
}
