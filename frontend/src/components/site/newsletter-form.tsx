"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";

export function NewsletterForm() {
  const [done, setDone] = useState(false);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    // TODO: save subscriber through the Express API
    e.currentTarget.reset();
    setDone(true);
  }

  return (
    <form onSubmit={onSubmit} className="flex overflow-hidden rounded-xl border border-border bg-card">
      <input
        type="email"
        required
        placeholder={done ? "Thanks for subscribing!" : "Your Email Address"}
        aria-label="Email address"
        className="min-w-0 flex-1 bg-transparent px-4 py-3 text-base outline-none placeholder:text-muted-foreground sm:text-sm"
      />
      <button
        type="submit"
        aria-label="Subscribe"
        className="flex w-12 shrink-0 items-center justify-center bg-accent-gradient text-white"
      >
        {done ? <Check className="size-5" /> : <ArrowRight className="size-5" />}
      </button>
    </form>
  );
}
