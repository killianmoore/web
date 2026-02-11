"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";

export function HomeHero() {
  const [heroSrc, setHeroSrc] = useState("/hero.jpg");

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden" id="home-hero-root">
      <Image
        alt="Cinematic hero photograph by Killian Moore"
        className="object-cover"
        fill
        onError={() => setHeroSrc("/images/hero/_web/Wide TOTR Dark (1 of 1).jpg")}
        priority
        sizes="100vw"
        src={heroSrc}
      />

      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.54)_0%,rgba(0,0,0,0.08)_33%,rgba(0,0,0,0.08)_67%,rgba(0,0,0,0.44)_100%)]" />

      <div className="absolute left-[63.5%] top-[52%] w-[min(37.9vw,488px)] -translate-x-[51.5%] -translate-y-1/2">
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandMark priority />
        </motion.div>
      </div>

      <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-center text-[11px] uppercase tracking-[0.48em] text-white/55">
        IN THE STILLNESS
      </p>
    </section>
  );
}
