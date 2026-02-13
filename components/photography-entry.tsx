"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { SeriesGrid } from "@/components/series-grid";
import type { Photo } from "@/lib/content";
import { pickRandomHero, photographyDesktopHeroPool, photographyMobileHeroPool } from "@/lib/hero-sync";

export function PhotographyEntry({ photos }: { photos: Photo[] }) {
  type Tone = "night" | "gold" | "warm" | "cool" | "mono";
  const getTone = (photo: Photo): Tone | undefined => (photo as Photo & { tone?: Tone }).tone;
  const toneOrder: Tone[] = ["night", "gold", "warm", "cool", "mono"];
  const [activeTone, setActiveTone] = useState<Tone | null>(null);
  const [currentDesktopHeroSrc, setCurrentDesktopHeroSrc] = useState(photographyDesktopHeroPool[0] ?? "/hero.jpg");
  const [currentMobileHeroSrc, setCurrentMobileHeroSrc] = useState(photographyMobileHeroPool[0] ?? "/hero.jpg");

  useEffect(() => {
    document.body.classList.remove("route-fade-black");
    setCurrentDesktopHeroSrc(
      pickRandomHero(photographyDesktopHeroPool, photographyDesktopHeroPool[0] ?? "/hero.jpg")
    );
    setCurrentMobileHeroSrc(
      pickRandomHero(photographyMobileHeroPool, photographyMobileHeroPool[0] ?? "/hero.jpg")
    );
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

  useEffect(() => {
    if (availableTones.length === 0) {
      setActiveTone(null);
      return;
    }
    if (!activeTone || !availableTones.includes(activeTone)) {
      setActiveTone(availableTones[0]);
    }
  }, [availableTones, activeTone]);

  const filteredPhotos = useMemo(() => {
    if (!activeTone) {
      return photos;
    }
    return photos.filter((photo) => getTone(photo) === activeTone);
  }, [activeTone, photos]);

  const labelForTone = (tone: Tone) => tone.charAt(0).toUpperCase() + tone.slice(1);

  return (
    <>
      <section className="relative h-[100dvh] w-full overflow-hidden">
        <Image
          alt="Photography entry hero"
          className="hidden object-cover brightness-[1.05] contrast-[1.02] saturate-[1.03] sm:block"
          fill
          onError={() => setCurrentDesktopHeroSrc(photographyDesktopHeroPool[0] ?? "/hero.jpg")}
          priority
          sizes="100vw"
          src={currentDesktopHeroSrc}
        />
        <Image
          alt="Photography entry hero mobile"
          className="object-cover brightness-[1.05] contrast-[1.02] saturate-[1.03] sm:hidden"
          fill
          onError={() => setCurrentMobileHeroSrc(photographyMobileHeroPool[0] ?? "/hero.jpg")}
          priority
          sizes="100vw"
          src={currentMobileHeroSrc}
          unoptimized
        />
        <div className="absolute inset-0 bg-black/12" />
        <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.38)_0%,rgba(0,0,0,0.04)_34%,rgba(0,0,0,0.04)_68%,rgba(0,0,0,0.30)_100%)]" />

        <p className="hero-title-fade absolute bottom-24 left-1/2 -translate-x-1/2 text-center text-[11px] font-light uppercase tracking-[0.55em] text-white/55 md:bottom-28 md:text-xs">
          KILLIAN MOORE PHOTOGRAPHY
        </p>
      </section>

      <section className="mx-auto mt-40 max-w-[1600px] px-6 pb-24 md:mt-48 md:px-12">
        <div className="mb-10 flex flex-wrap items-center justify-center gap-2 md:mb-14">
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

        <SeriesGrid photos={filteredPhotos} />
      </section>
    </>
  );
}
