"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitted(false);
    setSubmitting(true);

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      email: String(formData.get("email") ?? ""),
      message: String(formData.get("message") ?? "")
    };

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(body?.error ?? "Failed to send message. Please try again.");
        return;
      }

      form.reset();
      setSubmitted(true);
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-5 rounded-xl border border-white/15 bg-white/[0.02] p-5">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-white/55" htmlFor="name">
            Name
          </label>
          <input
            className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-white focus-visible:ring-2 focus-visible:ring-white/45"
            id="name"
            name="name"
            disabled={submitting}
            required
            type="text"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-white/55" htmlFor="email">
            Email
          </label>
          <input
            className="w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-white focus-visible:ring-2 focus-visible:ring-white/45"
            id="email"
            name="email"
            disabled={submitting}
            required
            type="email"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs uppercase tracking-[0.12em] text-white/55" htmlFor="message">
            Message
          </label>
          <textarea
            className="min-h-32 w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm text-white outline-none transition focus:border-white focus-visible:ring-2 focus-visible:ring-white/45"
            id="message"
            name="message"
            disabled={submitting}
            required
          />
        </div>
        <button
          className="rounded-full border border-white/70 px-5 py-2 text-xs uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          disabled={submitting}
          type="submit"
        >
          {submitting ? "Sending..." : "Send message"}
        </button>
      </form>
      {error ? (
        <p aria-live="polite" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
      {submitted ? (
        <p aria-live="polite" className="text-sm text-white/85">
          Message sent. Thanks, I will get back to you soon.
        </p>
      ) : null}
    </div>
  );
}
