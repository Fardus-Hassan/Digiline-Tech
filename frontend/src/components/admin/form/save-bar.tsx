"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Save, Undo2 } from "lucide-react";
import { AdminButton, Kbd } from "@/components/admin/ui";

/** Warns before leaving with unsaved changes and saves on Ctrl/⌘+S. */
export function useEditorShortcuts(dirty: boolean, onSave: () => void) {
  const save = useRef(onSave);
  useEffect(() => {
    save.current = onSave;
  });

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
        e.preventDefault();
        save.current();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!dirty) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [dirty]);
}

export function SaveBar({
  dirty,
  saving,
  onSave,
  onDiscard,
  saveLabel = "Save changes",
}: {
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  onDiscard: () => void;
  saveLabel?: string;
}) {
  return (
    <AnimatePresence>
      {dirty && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
          className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 mx-auto max-w-xl lg:left-64"
        >
          <div className="dark flex items-center gap-3 rounded-2xl border border-border bg-background/95 py-2.5 pr-2.5 pl-4 text-foreground shadow-2xl shadow-black/30 backdrop-blur-xl">
            <span className="relative flex size-2.5 shrink-0">
              <span className="absolute inset-0 animate-ping rounded-full bg-accent/60" />
              <span className="relative size-2.5 rounded-full bg-accent" />
            </span>
            <p className="min-w-0 flex-1 truncate text-sm font-medium">Unsaved changes</p>
            <AdminButton variant="ghost" size="sm" onClick={onDiscard} disabled={saving}>
              <Undo2 /> <span className="hidden sm:inline">Discard</span>
            </AdminButton>
            <AdminButton variant="primary" size="sm" onClick={onSave} loading={saving}>
              {!saving && <Save />} {saveLabel}
              <Kbd className="ml-1 hidden border-white/30 bg-white/15 text-white sm:inline-flex">Ctrl S</Kbd>
            </AdminButton>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
