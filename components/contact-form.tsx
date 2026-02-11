"use client";

import { FormEvent, useState } from "react";

export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(true);
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
            required
          />
        </div>
        <button
          className="rounded-full border border-white/70 px-5 py-2 text-xs uppercase tracking-[0.16em] text-white transition hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          type="submit"
        >
          Send message
        </button>
      </form>
      {submitted ? (
        <p aria-live="polite" className="text-sm text-white/85">
          Message received. Replace this handler with your email API endpoint when ready.
        </p>
      ) : null}
    </div>
  );
}
