export const desktopHeroPool = [
  "/images/hero/_web/Website2.jpg",
  "/images/hero/_web/Website11.jpg",
  "/images/hero/_web/Website13.jpg",
  "/images/hero/_web/Website15.jpg",
  "/images/hero/_web/Website18.jpg",
  "/images/hero/_web/Website28.jpg",
  "/images/hero/_web/Website31.jpg",
  "/images/hero/_web/Website35.jpg",
  "/images/hero/_web/Website36.jpg",
  "/images/hero/_web/Website38.jpg",
  "/images/hero/_web/Website51.jpg",
  "/images/hero/_web/Website56.jpg",
  "/images/hero/_web/Website65.jpg",
  "/images/hero/_web/Website66.jpg",
  "/images/hero/_web/Website67.jpg",
  "/images/hero/_web/Website91.jpg",
  "/images/hero/_web/Website94.jpg",
  "/images/hero/_web/Website97.jpg",
  "/images/hero/_web/Website98.jpg",
  "/images/hero/_web/Website102.jpg"
];

export const mobileHeroPool = [
  "/images/hero/mobile/Website10.jpg",
  "/images/hero/mobile/Website17.jpg",
  "/images/hero/mobile/Website23.jpg",
  "/images/hero/mobile/Website24.jpg",
  "/images/hero/mobile/Website26.jpg",
  "/images/hero/mobile/Website27.jpg",
  "/images/hero/mobile/Website32.jpg",
  "/images/hero/mobile/Website37.jpg",
  "/images/hero/mobile/Website4.jpg",
  "/images/hero/mobile/Website41.jpg",
  "/images/hero/mobile/Website44.jpg",
  "/images/hero/mobile/Website55.jpg",
  "/images/hero/mobile/Website57.jpg",
  "/images/hero/mobile/Website59.jpg",
  "/images/hero/mobile/Website68.jpg",
  "/images/hero/mobile/Website69.jpg",
  "/images/hero/mobile/Website70.jpg",
  "/images/hero/mobile/Website72.jpg",
  "/images/hero/mobile/Website75.jpg",
  "/images/hero/mobile/Website77.jpg",
  "/images/hero/mobile/Website86.jpg",
  "/images/hero/mobile/Website9.jpg"
];

export const HERO_STORAGE_KEYS = {
  homeDesktop: "km:hero:home:desktop",
  homeMobile: "km:hero:home:mobile",
  photographyDesktop: "km:hero:photography:desktop",
  photographyMobile: "km:hero:photography:mobile"
} as const;

function pickRandom(pool: string[], avoid?: string): string {
  if (pool.length === 0) {
    return "";
  }
  const candidates = avoid ? pool.filter((item) => item !== avoid) : pool;
  const source = candidates.length > 0 ? candidates : pool;
  return source[Math.floor(Math.random() * source.length)] ?? source[0];
}

export function pickSyncedHero({
  selfKey,
  otherKey,
  pool,
  fallback
}: {
  selfKey: string;
  otherKey: string;
  pool: string[];
  fallback: string;
}): string {
  if (typeof window === "undefined") {
    return fallback;
  }

  const otherValue = window.localStorage.getItem(otherKey) ?? undefined;
  const selected = pickRandom(pool, otherValue) || fallback;
  window.localStorage.setItem(selfKey, selected);
  return selected;
}
