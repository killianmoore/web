import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About",
  description: "Bio and artist statement by Killian Moore."
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-[900px] mx-auto px-6 md:px-12">
        <div className="pt-28 md:pt-36 pb-10 md:pb-14 text-center">
          <h1 className="text-[11px] md:text-xs uppercase tracking-[0.55em] text-white/55 font-light">About</h1>
        </div>

        <section className="pb-14 md:pb-16">
          <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-white/40 leading-[1.2]">Bio</h2>

          <div className="mt-6 space-y-6 text-white/78 leading-relaxed text-[15px] md:text-[16px]">
            <p>
              Killian Moore is a visual artist drawn to silence, scale, and the spaces where the human presence feels
              small but not insignificant.
            </p>
            <p>
              From remote landscapes and night skies to aerial vantage points far above the city, his work explores
              perspective - how distance reshapes what we think we know. Whether grounded in stillness or suspended in
              motion, his images invite viewers to slow down, step away from the noise, and enter something quieter and
              more expansive.
            </p>
          </div>
        </section>

        <section className="pb-28 md:pb-36">
          <h2 className="text-[10px] md:text-[11px] uppercase tracking-[0.28em] text-white/40 leading-[1.2]">
            Artist Statement
          </h2>

          <div className="mt-6 space-y-6 text-white/78 leading-relaxed text-[15px] md:text-[16px]">
            <p>I'm drawn to places where sound falls away and scale takes over.</p>

            <p>
              Much of my work happens in the quiet - in wide landscapes, under night skies, and sometimes far above
              the ground, where perspective shifts and the familiar becomes abstract.
            </p>

            <p>Photographing is a meditative process for me. It asks for stillness and patience, even when suspended in motion.</p>

            <p>
              I don't approach these places to document them. I approach them to feel them - and to translate that
              feeling into something visible.
            </p>

            <p>Vast horizons and distant stars aren't subjects. They're thresholds. So are cities seen from a distance.</p>

            <p>
              If the work succeeds, it carries the viewer somewhere else - away from the noise of the present and into
              something slower, quieter, and more expansive.
            </p>

            <p>Silence and scale are the threads running through it all. Light is what holds it together.</p>
          </div>

          <div className="mt-14 md:mt-16 text-center">
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/25">Killian Moore</p>
          </div>
        </section>
      </div>
    </main>
  );
}
