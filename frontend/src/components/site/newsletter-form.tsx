"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2 } from "lucide-react";
import { api, ApiError } from "@/lib/api";

export function NewsletterForm({ placeholder, successText }: { placeholder: string; successText: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    setError("");
    try {
      await api("/subscribers", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) });
      form.reset();
      setStatus("done");
    } catch (err) {
      setStatus("idle");
      setError(err instanceof ApiError && err.status < 500 ? err.message : "Something went wrong. Please try again.");
    }
  }

  return (
    <div>
      <form onSubmit={onSubmit} className="flex overflow-hidden rounded-xl border border-border bg-card">
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="absolute -left-[9999px] size-px" />
        <input
          type="email"
          name="email"
          required
          maxLength={200}
          placeholder={status === "done" ? successText : placeholder}
          aria-label="Email address"
          className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
        />
        <button
          type="submit"
          aria-label="Subscribe"
          disabled={status === "sending"}
          className="flex w-12 shrink-0 items-center justify-center bg-accent-gradient text-white"
        >
          {status === "sending" ? (
            <Loader2 className="size-5 animate-spin" />
          ) : status === "done" ? (
            <Check className="size-5" />
          ) : (
            <ArrowRight className="size-5" />
          )}
        </button>
      </form>
      {error && (
        <p role="alert" className="mt-2 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
