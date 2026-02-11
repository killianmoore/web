import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description: "Bio and artist statement for photographer Killian Moore."
};

export default async function AboutPage() {
  const site = await getSiteContent();

  return (
    <article className="mx-auto w-[min(94vw,1160px)] space-y-10 py-28">
      <header className="space-y-3">
        <p className="text-[0.64rem] uppercase tracking-[0.24em] text-white/50">About</p>
        <h1 className="font-display text-5xl text-white">Bio + Statement</h1>
      </header>

      <section className="max-w-3xl space-y-5 text-base leading-relaxed text-white/78">
        {site.bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </section>

      <section className="max-w-3xl space-y-3 rounded-xl border border-white/15 bg-white/[0.02] p-6">
        <h2 className="font-display text-3xl text-white">Artist statement</h2>
        <p className="text-sm leading-relaxed text-white/78">{site.statement}</p>
      </section>
    </article>
  );
}
