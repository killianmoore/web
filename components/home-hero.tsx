"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { homeDesktopHeroPool, homeMobileHeroPool, pickFirstLoadableHero, pickRandomHero } from "@/lib/hero-sync";

export function HomeHero() {
  const [desktopHeroSrc, setDesktopHeroSrc] = useState(homeDesktopHeroPool[0] ?? "/hero.jpg");
  const [mobileHeroSrc, setMobileHeroSrc] = useState(homeMobileHeroPool[0] ?? "/hero.jpg");

  useEffect(() => {
    setDesktopHeroSrc(pickRandomHero(homeDesktopHeroPool, homeDesktopHeroPool[0] ?? "/hero.jpg"));
    void pickFirstLoadableHero(homeMobileHeroPool, homeDesktopHeroPool[0] ?? "/hero.jpg")
      .then((src) => setMobileHeroSrc(src));
  }, []);

  return (
    <section className="relative h-[100dvh] w-full overflow-hidden" id="home-hero-root">
      <Image
        alt="Cinematic hero photograph by Killian Moore"
        className="hidden object-cover object-center sm:block"
        fill
        onError={() => setDesktopHeroSrc(homeDesktopHeroPool[0] ?? "/hero.jpg")}
        priority
        sizes="100vw"
        src={desktopHeroSrc}
      />
      <img
        alt="Portrait hero photograph by Killian Moore"
        className="absolute inset-0 h-full w-full object-cover object-center sm:hidden"
        onError={() => setMobileHeroSrc(homeDesktopHeroPool[0] ?? "/hero.jpg")}
        src={mobileHeroSrc}
      />

      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.54)_0%,rgba(0,0,0,0.08)_33%,rgba(0,0,0,0.08)_67%,rgba(0,0,0,0.44)_100%)]" />

      <div className="absolute left-1/2 top-[76%] w-[min(76vw,430px)] -translate-x-1/2 -translate-y-1/2 sm:left-[63.5%] sm:top-[55%] sm:w-[min(35vw,460px)] sm:-translate-x-[51.5%]">
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandMark priority />
        </motion.div>
      </div>

      <p className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center text-[10px] uppercase tracking-[0.34em] text-white/55 sm:bottom-10 sm:text-[11px] sm:tracking-[0.48em]">
        IN THE STILLNESS
      </p>
    </section>
  );
}
