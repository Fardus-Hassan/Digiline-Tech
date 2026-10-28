"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { api, ApiError } from "@/lib/api";
import type { SectionData } from "@/lib/cms/defaults";
import { cn } from "@/lib/utils";

const fieldClass =
  "w-full rounded-xl border border-border bg-background px-4 py-3 text-base outline-none transition-colors sm:text-sm placeholder:text-muted-foreground focus:border-accent focus:ring-2 focus:ring-accent/20 aria-invalid:border-red-500 aria-invalid:focus:ring-red-500/20";

type FieldErrors = Partial<Record<"name" | "email" | "phone" | "subject" | "message", string[]>>;

function FieldError({ id, errors }: { id: string; errors?: string[] }) {
  if (!errors?.length) return null;
  return (
    <p id={id} className="mt-1.5 px-1 text-xs text-red-500">
      {errors[0]}
    </p>
  );
}

export function ContactForm({
  labels,
  className,
}: {
  labels: SectionData<"contactPage">["form"];
  className?: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [body, setBody] = useState({ html: "", text: "" });
  const [editorKey, setEditorKey] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (body.text.length < 10) {
      setFieldErrors({ message: ["Please write at least 10 characters."] });
      return;
    }
    setStatus("sending");
    setError("");
    setFieldErrors({});
    try {
      await api("/contact", {
        method: "POST",
        body: JSON.stringify({ ...Object.fromEntries(new FormData(form)), message: body.text, messageHtml: body.html }),
      });
      form.reset();
      setBody({ html: "", text: "" });
      setEditorKey((k) => k + 1);
      setStatus("sent");
    } catch (err) {
      setStatus("idle");
      if (!(err instanceof ApiError) || err.status >= 500) {
        setError(labels.error);
      } else if (err.errors) {
        setFieldErrors(err.errors);
        setError("Please check the highlighted fields.");
      } else {
        setError(err.message);
      }
    }
  }

  const field = (name: keyof FieldErrors) => ({
    name,
    "aria-invalid": fieldErrors[name] ? true : undefined,
    "aria-describedby": fieldErrors[name] ? `${name}-error` : undefined,
    onInput: () => fieldErrors[name] && setFieldErrors((errors) => ({ ...errors, [name]: undefined })),
  });

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
            <h3 className="mt-4 text-xl font-semibold">{labels.successTitle}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{labels.successText}</p>
            <Button variant="outline" size="sm" className="mt-6" onClick={() => setStatus("idle")}>
              {labels.again}
            </Button>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} exit={{ opacity: 0 }} className="space-y-4">
            <input
              name="website"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden
              className="absolute -left-[9999px] size-px opacity-0"
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  {...field("name")}
                  required
                  minLength={2}
                  maxLength={100}
                  autoComplete="name"
                  placeholder={labels.name}
                  aria-label="Your name"
                  className={fieldClass}
                />
                <FieldError id="name-error" errors={fieldErrors.name} />
              </div>
              <div>
                <input
                  {...field("email")}
                  type="email"
                  required
                  maxLength={200}
                  autoComplete="email"
                  placeholder={labels.email}
                  aria-label="Your email"
                  className={fieldClass}
                />
                <FieldError id="email-error" errors={fieldErrors.email} />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <input
                  {...field("phone")}
                  type="tel"
                  maxLength={30}
                  autoComplete="tel"
                  placeholder={labels.phone}
                  aria-label="Phone number"
                  className={fieldClass}
                />
                <FieldError id="phone-error" errors={fieldErrors.phone} />
              </div>
              <div>
                <input
                  {...field("subject")}
                  maxLength={150}
                  placeholder={labels.subject}
                  aria-label="Subject"
                  className={fieldClass}
                />
                <FieldError id="subject-error" errors={fieldErrors.subject} />
              </div>
            </div>
            <div>
              <RichTextEditor
                key={editorKey}
                value={body.html}
                onChange={(html, text) => {
                  setBody({ html, text });
                  if (fieldErrors.message) setFieldErrors((errors) => ({ ...errors, message: undefined }));
                }}
                placeholder={labels.message}
                ariaLabel="Your message"
                maxLength={5000}
                invalid={!!fieldErrors.message}
              />
              <FieldError id="message-error" errors={fieldErrors.message} />
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  role="alert"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-start gap-2 overflow-hidden rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500"
                >
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <Button type="submit" size="lg" className="w-full" disabled={status === "sending"}>
              {status === "sending" ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> {labels.sending}
                </>
              ) : (
                <>
                  {labels.submit} <ArrowRight className="size-4" />
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
