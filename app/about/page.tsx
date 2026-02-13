import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Bio and artist statement by Killian Moore."
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto w-full max-w-5xl px-6 pb-24 pt-24 sm:px-8 sm:pt-28 lg:px-12">
        <div className="mb-12 text-center sm:mb-14">
          <div className="text-[11px] tracking-[0.35em] text-white/60 sm:text-[12px]">ABOUT</div>
        </div>

        <section className="mb-14 sm:mb-16">
          <div className="mb-4 text-[10px] tracking-[0.35em] text-white/35">BIO</div>

          <div className="space-y-5 text-[15px] leading-[1.8] text-white/85 sm:text-[17px] sm:leading-[1.9] lg:text-[18px]">
            <p>
              Killian Moore is a visual artist drawn to silence, scale, and the
              feeling of standing at the edge of something larger than language.
            </p>

            <p>
              His work moves between remote landscapes, night skies, and aerial
              vantage points above New York City, where his office is quite
              literally a helicopter doorframe over the metropolis. Across these
              environments, he returns to a single question: what changes in us
              when distance reshapes what we think we know.
            </p>

            <p>
              Through stillness, patience, and light, his images invite viewers
              to leave their current place behind and drift toward the dreams
              that have been waiting for them.
            </p>
          </div>
        </section>

        <section className="mb-14 sm:mb-16">
          <div className="mb-4 text-[10px] tracking-[0.35em] text-white/35">ARTIST STATEMENT</div>

          <div className="space-y-5 text-[15px] leading-[1.8] text-white/85 sm:text-[17px] sm:leading-[1.9] lg:text-[18px]">
            <p>
              I make photographs for people who are searching. Not for answers,
              but for a feeling that life can be wider, quieter, and more
              luminous than the day in front of them.
            </p>

            <p>
              Sometimes I work in vast landscapes and open horizons. Sometimes I
              work under night skies, where time feels suspended and the world
              becomes tender. And sometimes I work far above the ground, hanging
              out of a helicopter over New York City, where the familiar turns
              into pattern and the city becomes a living map.
            </p>

            <p>
              Photography is meditative for me. It asks for stillness and
              attention. I am not trying to document a place as much as I am
              trying to translate what it feels like to be there.
            </p>

            <p>
              My hope is simple: that the image becomes a doorway. That someone
              can step through it for a moment, leave their current world, and
              arrive closer to the one they have been dreaming of.
            </p>

            <p className="text-white/70">
              Silence and scale run through everything I make. Light is what
              holds it together.
            </p>
          </div>
        </section>

        <div className="pt-8 text-center sm:pt-10">
          <div className="text-[10px] tracking-[0.4em] text-white/25">KILLIAN MOORE</div>
        </div>
      </div>
    </main>
  );
}
