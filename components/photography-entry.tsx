"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SeriesGrid } from "@/components/series-grid";
import type { Photo } from "@/lib/content";

const curatedHeroImages = [
  "/images/hero/_web/hero-01.jpg",
  "/images/hero/_web/hero-02.jpg",
  "/images/hero/_web/hero-03.jpg",
  "/images/hero/_web/hero-04.jpg"
];

export function PhotographyEntry({ photos }: { photos: Photo[] }) {
  type Tone = "night" | "neon" | "gold" | "warm" | "cool" | "mono";
  const getTone = (photo: Photo): Tone | undefined => (photo as Photo & { tone?: Tone }).tone;
  const toneOrder: Tone[] = ["night", "neon", "gold", "warm", "cool", "mono"];
  const [activeTone, setActiveTone] = useState<"all" | Tone>("all");

  const heroImage = useMemo(() => {
    if (curatedHeroImages.length === 0) {
      return "/hero.jpg";
    }
    const index = Math.floor(Math.random() * curatedHeroImages.length);
    return curatedHeroImages[index];
  }, []);
  const [currentHeroSrc, setCurrentHeroSrc] = useState(heroImage);

  useEffect(() => {
    document.body.classList.remove("route-fade-black");
  }, []);

  const availableTones = useMemo(() => {
    const tones = new Set<Tone>();
    photos.forEach((photo) => {
      const tone = getTone(photo);
      if (tone) {
        tones.add(tone);
      }
    });
    return toneOrder.filter((tone) => tones.has(tone));
  }, [photos]);

  const filteredPhotos = useMemo(() => {
    if (activeTone === "all") {
      return photos;
    }
    return photos.filter((photo) => getTone(photo) === activeTone);
  }, [activeTone, photos]);

  const sequencedPhotos = useMemo(() => {
    const landscapes = filteredPhotos.filter((photo) => photo.orientation === "landscape");
    const portraits = filteredPhotos.filter((photo) => photo.orientation === "portrait");
    const unknown = filteredPhotos.filter((photo) => !photo.orientation);
    const ordered: Photo[] = [];

    let l = 0;
    let p = 0;

    while (l < landscapes.length || p < portraits.length) {
      for (let i = 0; i < 3 && l < landscapes.length; i += 1) {
        ordered.push(landscapes[l]);
        l += 1;
      }
      for (let i = 0; i < 3 && p < portraits.length; i += 1) {
        ordered.push(portraits[p]);
        p += 1;
      }
    }

    return [...ordered, ...unknown];
  }, [filteredPhotos]);

  const labelForTone = (tone: Tone | "all") => (tone === "all" ? "All" : tone.charAt(0).toUpperCase() + tone.slice(1));

  return (
    <>
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <Image
          alt="Photography entry hero"
          className="object-cover brightness-[1.05] contrast-[1.02] saturate-[1.03]"
          fill
          onError={() => setCurrentHeroSrc("/hero.jpg")}
          priority
          sizes="100vw"
          src={currentHeroSrc}
        />
        <div className="absolute inset-0 bg-black/12" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.04)_34%,rgba(0,0,0,0.04)_68%,rgba(0,0,0,0.30)_100%)]" />

        <p className="hero-title-fade absolute bottom-24 left-1/2 -translate-x-1/2 text-center text-[11px] font-light uppercase tracking-[0.55em] text-white/55 md:bottom-28 md:text-xs">
          KILLIAN MOORE PHOTOGRAPHY
        </p>
      </section>

      <section className="mx-auto mt-40 max-w-[1600px] px-6 pb-24 md:mt-48 md:px-12">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2 md:mb-14">
          <button
            className={`border px-3 py-1 text-[10px] uppercase tracking-[0.24em] transition-colors ${
              activeTone === "all" ? "border-white/75 text-white" : "border-white/25 text-white/65 hover:border-white/45 hover:text-white/85"
            }`}
            onClick={() => setActiveTone("all")}
            type="button"
          >
            {labelForTone("all")}
          </button>

          {availableTones.map((tone) => (
            <button
              className={`border px-3 py-1 text-[10px] uppercase tracking-[0.24em] transition-colors ${
                activeTone === tone ? "border-white/75 text-white" : "border-white/25 text-white/65 hover:border-white/45 hover:text-white/85"
              }`}
              key={tone}
              onClick={() => setActiveTone(tone)}
              type="button"
            >
              {labelForTone(tone)}
            </button>
          ))}
        </div>

        <SeriesGrid photos={sequencedPhotos} />
      </section>
    </>
  );
}
