"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentProps } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { AlertTriangle, Loader2, X, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------- Buttons ----------

const buttonVariants = {
  primary: "bg-accent-gradient text-white shadow-sm shadow-brand-orange/30 hover:shadow-md hover:shadow-brand-orange/30 hover:brightness-105",
  secondary: "border border-border bg-card text-foreground shadow-xs hover:bg-muted",
  ghost: "text-muted-foreground hover:bg-muted hover:text-foreground",
  danger: "bg-red-600 text-white hover:bg-red-700",
  "danger-ghost": "text-red-600 hover:bg-red-500/10 dark:text-red-400",
};

const buttonSizes = {
  xs: "h-7 gap-1 rounded-md px-2 text-xs [&_svg]:size-3.5",
  sm: "h-8 gap-1.5 rounded-lg px-3 text-sm [&_svg]:size-4",
  md: "h-10 gap-2 rounded-lg px-4 text-sm [&_svg]:size-4",
  icon: "size-9 rounded-lg [&_svg]:size-4",
  "icon-sm": "size-8 rounded-md [&_svg]:size-4",
};

type ButtonProps = ComponentProps<"button"> & {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  loading?: boolean;
};

export function adminButton(variant: keyof typeof buttonVariants = "secondary", size: keyof typeof buttonSizes = "md", className?: string) {
  return cn(
    "inline-flex shrink-0 items-center justify-center font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-accent/50 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50",
    buttonVariants[variant],
    buttonSizes[size],
    className,
  );
}

export function AdminButton({ variant, size, loading, className, children, disabled, type = "button", ...props }: ButtonProps) {
  return (
    <button type={type} disabled={disabled || loading} className={adminButton(variant, size, className)} {...props}>
      {loading && <Loader2 className="animate-spin" />}
      {children}
    </button>
  );
}

// ---------- Layout ----------

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-border bg-card shadow-xs", className)} {...props} />;
}

export function PageHeader({
  title,
  description,
  icon: Icon,
  actions,
  children,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex min-w-0 items-start gap-4">
        {Icon && (
          <span className="hidden size-12 shrink-0 items-center justify-center rounded-2xl bg-accent/10 text-accent sm:inline-flex">
            <Icon className="size-6" />
          </span>
        )}
        <div className="min-w-0">
          {children}
          <h1 className="text-2xl font-bold tracking-tight sm:text-[1.7rem]">{title}</h1>
          {description && <p className="mt-1 text-sm text-muted-foreground sm:text-base">{description}</p>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card px-6 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <Icon className="size-7" />
      </span>
      <p className="mt-4 font-semibold">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Spinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex justify-center py-20 text-muted-foreground", className)}>
      <Loader2 className="size-6 animate-spin" />
    </div>
  );
}

export function Kbd({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded border border-border bg-muted px-1 font-sans text-[0.65rem] font-medium text-muted-foreground",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

export function StatusBadge({ status }: { status: "DRAFT" | "PUBLISHED" }) {
  return status === "PUBLISHED" ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
      <span className="size-1.5 rounded-full bg-emerald-500" />
      Published
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
      <span className="size-1.5 rounded-full bg-amber-500" />
      Draft
    </span>
  );
}

// ---------- Form controls ----------

export const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 text-sm shadow-xs outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground/70 hover:border-foreground/25 focus:border-accent focus:ring-3 focus:ring-accent/15 aria-invalid:border-red-500 aria-invalid:ring-red-500/15";

export function Toggle({
  checked,
  onChange,
  label,
  id,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  id?: string;
}) {
  return (
    <button
      id={id}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors outline-none focus-visible:ring-2 focus-visible:ring-accent/50",
        checked ? "bg-accent" : "bg-foreground/15",
      )}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 600, damping: 35 }}
        className={cn("size-5 rounded-full bg-white shadow", checked ? "ml-[1.375rem]" : "ml-0.5")}
      />
    </button>
  );
}

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
}: {
  value: T;
  onChange: (value: T) => void;
  options: { value: T; label: string; count?: number }[];
  className?: string;
}) {
  return (
    <div className={cn("inline-flex rounded-lg border border-border bg-muted/60 p-0.5 text-sm", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={cn(
            "relative rounded-md px-3 py-1.5 font-medium transition-colors",
            value === option.value ? "text-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === option.value && (
            <motion.span
              layoutId={`segment-${options.map((o) => o.value).join("-")}`}
              className="absolute inset-0 rounded-md bg-card shadow-sm"
              transition={{ type: "spring", stiffness: 500, damping: 38 }}
            />
          )}
          <span className="relative">
            {option.label}
            {option.count !== undefined && <span className="ml-1.5 text-xs text-muted-foreground">{option.count}</span>}
          </span>
        </button>
      ))}
    </div>
  );
}

// ---------- Dialog ----------

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  className,
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- portal target only exists after mount
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6" data-lenis-prevent>
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 34 }}
            className={cn(
              "relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl border border-border bg-card shadow-2xl sm:rounded-2xl",
              { sm: "sm:max-w-md", md: "sm:max-w-xl", lg: "sm:max-w-3xl", xl: "sm:max-w-6xl" }[size],
              className,
            )}
          >
            {title && (
              <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
                <div>
                  <h2 className="font-semibold">{title}</h2>
                  {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
                </div>
                <AdminButton variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close">
                  <X />
                </AdminButton>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto">{children}</div>
            {footer && <div className="flex justify-end gap-2 border-t border-border bg-muted/30 px-5 py-3">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ---------- Confirm ----------

type ConfirmOptions = { title: string; description?: string; confirmLabel?: string; danger?: boolean };
const ConfirmContext = createContext<(options: ConfirmOptions) => Promise<boolean>>(async () => false);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolver = useRef<(value: boolean) => void>(null);

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    return new Promise<boolean>((resolve) => (resolver.current = resolve));
  }, []);

  const close = (value: boolean) => {
    resolver.current?.(value);
    setOptions(null);
  };

  return (
    <ConfirmContext value={confirm}>
      {children}
      <Dialog
        open={!!options}
        onClose={() => close(false)}
        size="sm"
        footer={
          <>
            <AdminButton onClick={() => close(false)}>Cancel</AdminButton>
            <AdminButton variant={options?.danger ? "danger" : "primary"} onClick={() => close(true)} autoFocus>
              {options?.confirmLabel ?? "Confirm"}
            </AdminButton>
          </>
        }
      >
        <div className="flex gap-4 p-5">
          {options?.danger && (
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-red-500/10 text-red-600">
              <AlertTriangle className="size-5" />
            </span>
          )}
          <div>
            <h2 className="font-semibold">{options?.title}</h2>
            {options?.description && <p className="mt-1 text-sm text-muted-foreground">{options.description}</p>}
          </div>
        </div>
      </Dialog>
    </ConfirmContext>
  );
}

export const useConfirm = () => useContext(ConfirmContext);
