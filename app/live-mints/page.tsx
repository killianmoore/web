import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Mints",
  description: "Live mint drops by Killian Moore."
};

export default function LiveMintsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 pb-24 pt-28 text-center md:px-12">
        <h1 className="text-[11px] font-light uppercase tracking-[0.55em] text-white/60 md:text-xs">Live Mints</h1>
        <p className="mx-auto mt-6 max-w-2xl text-xs uppercase tracking-[0.3em] text-white/45">
          Active release available now
        </p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-28 md:px-12">
        <article className="border border-white/15 bg-white/[0.02] p-8 text-center md:p-12">
          <h2 className="text-sm uppercase tracking-[0.3em] text-white/70">In BSY We Trust</h2>
          <p className="mx-auto mt-6 max-w-2xl text-sm leading-relaxed text-white/60">
            Artwork and caption details coming next. Use the link below to mint directly.
          </p>

          <a
            className="mt-10 inline-flex items-center justify-center border border-white/40 px-6 py-2 text-[11px] uppercase tracking-[0.25em] text-white/85 transition-colors duration-300 hover:border-white/70 hover:text-white"
            href="https://www.transient.xyz/mint/in-bsy-we-trust"
            rel="noreferrer"
            target="_blank"
          >
            Mint Now
          </a>
        </article>
      </section>
    </main>
  );
}
