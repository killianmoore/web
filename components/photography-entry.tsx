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
        <SeriesGrid photos={photos} />
      </section>
    </>
  );
}
