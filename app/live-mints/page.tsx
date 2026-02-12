import Image from "next/image";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Live Mints",
  description: "Live mint drops by Killian Moore."
};

export default function LiveMintsPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-5xl px-6 pb-14 pt-28 text-center md:px-12">
        <h1 className="text-[11px] font-light uppercase tracking-[0.55em] text-white/60 md:text-xs">Live Mints</h1>
        <p className="mx-auto mt-6 max-w-2xl text-xs uppercase tracking-[0.3em] text-white/50">Active release available now</p>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-28 md:px-12">
        <article className="border border-white/15 bg-white/[0.02] p-5 md:p-8">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/40">
            <Image
              src="/images/live-mints/in-bsy-we-trust.jpg"
              alt="In BSY We Trust live mint artwork"
              fill
              priority
              className="object-cover"
              sizes="(min-width: 1024px) 960px, 100vw"
            />
          </div>

          <div className="mx-auto mt-8 max-w-3xl text-center">
            <h2 className="text-sm uppercase tracking-[0.3em] text-white/70">In BSY We Trust</h2>

            <div className="mt-6 space-y-5 text-[15px] leading-[1.8] text-white/78 md:text-[16px]">
              <p>
                This piece reinterprets a timeless symbol of freedom through the lens of collective artistic agency.
                Standing not with a torch but with a raised fist and the inscription "IN BSY WE TRUST," this work
                represents the power of community to redefine tradition and amplify unheard voices.
              </p>

              <p>
                Minted in support of the BSY initiative, a decentralized effort to champion creativity,
                collaboration, and shared cultural momentum in the NFT space, this token embodies both resistance
                and resurgence.
              </p>

              <p>
                Where stone once held scripture, now lives a declaration that art should be shaped by the people,
                for the people, and that supporting artists is itself an act of liberation.
              </p>

              <p>
                Each view, each revision, and each future state of this work is a testament to the living energy
                within BSY, a movement rooted not in authority but in collective trust.
              </p>

              <p>This NFT is more than an image. It is an emblem of a community rewriting its own narrative.</p>
              <p className="uppercase tracking-[0.2em] text-white/88">In BSY we trust.</p>
            </div>

            <a
              className="mt-10 inline-flex items-center justify-center border border-white/40 px-6 py-2 text-[11px] uppercase tracking-[0.25em] text-white/85 transition-colors duration-300 hover:border-white/70 hover:text-white"
              href="https://www.transient.xyz/mint/in-bsy-we-trust"
              rel="noreferrer"
              target="_blank"
            >
              Mint Now
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
