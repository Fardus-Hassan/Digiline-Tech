"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition-colors sm:text-sm placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20";

export function ContactForm({ className }: { className?: string }) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    // TODO: send to the Express API once the contact messages module exists
    await new Promise((r) => setTimeout(r, 800));
    form.reset();
    setStatus("sent");
  }

  return (
    <div className={cn("relative rounded-3xl border border-border bg-card p-5 shadow-xl sm:p-8", className)}>
      <AnimatePresence mode="wait">
        {status === "sent" ? (
          <motion.div
            key="sent"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center py-10 text-center"
          >
            <CheckCircle2 className="size-14 text-accent" />
            <h3 className="mt-4 text-xl font-semibold">Message sent!</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Thanks for reaching out. We&apos;ll get back to you soon.
            </p>
            <Button variant="outline" size="sm" className="mt-6" onClick={() => setStatus("idle")}>
              Send another message
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0 }} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <input name="name" required placeholder="Your Name *" aria-label="Your name" className={fieldClass} />
              <input
                name="email"
                type="email"
                required
                placeholder="Your Email *"
                aria-label="Your email"
                className={fieldClass}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="phone"
                type="tel"
                placeholder="Phone Number"
                aria-label="Phone number"
                className={fieldClass}
              />
              <input name="subject" placeholder="Subject" aria-label="Subject" className={fieldClass} />
            </div>
            <textarea
              name="message"
              required
              rows={5}
              placeholder="Your Message *"
              aria-label="Your message"
              className={cn(fieldClass, "resize-none")}
            />
            <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
              {status === "sending" ? <Loader2 className="size-4 animate-spin" /> : null}
              Send Message <ArrowRight className="size-4" />
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
