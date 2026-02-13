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

export const homeDesktopHeroPool = desktopHeroPool.filter((_, index) => index % 2 === 0);
export const photographyDesktopHeroPool = desktopHeroPool.filter((_, index) => index % 2 === 1);
export const homeMobileHeroPool = mobileHeroPool.filter((_, index) => index % 2 === 0);
export const photographyMobileHeroPool = mobileHeroPool.filter((_, index) => index % 2 === 1);

export function pickRandomHero(pool: string[], fallback: string): string {
  if (pool.length === 0) {
    return fallback;
  }
  return pool[Math.floor(Math.random() * pool.length)] ?? fallback;
}

function shuffle(values: string[]): string[] {
  const out = [...values];
  for (let index = out.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [out[index], out[swapIndex]] = [out[swapIndex], out[index]];
  }
  return out;
}

export function canLoadImage(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(false);
      return;
    }
    const image = new window.Image();
    image.onload = () => resolve(true);
    image.onerror = () => resolve(false);
    image.src = src;
  });
}

export async function pickFirstLoadableHero(pool: string[], fallback: string): Promise<string> {
  for (const candidate of shuffle(pool)) {
    // eslint-disable-next-line no-await-in-loop
    if (await canLoadImage(candidate)) {
      return candidate;
    }
  }
  return fallback;
}

export function shouldUseMobileHeroes(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  const widthMobile = window.matchMedia("(max-width: 1024px)").matches;
  const uaMobile = /Mobi|Android|iPhone|iPad|iPod|Mobile/i.test(window.navigator.userAgent);
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;

  return widthMobile || uaMobile || coarsePointer;
}

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

function getImageSize(src: string): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") {
      resolve(null);
      return;
    }

    const image = new window.Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

export async function pickPortraitSyncedHero({
  selfKey,
  otherKey,
  pool,
  fallback
}: {
  selfKey: string;
  otherKey: string;
  pool: string[];
  fallback: string;
}): Promise<string> {
  if (typeof window === "undefined") {
    return fallback;
  }

  const sized = await Promise.all(
    pool.map(async (src) => {
      const size = await getImageSize(src);
      return { src, size };
    })
  );

  const portraitPool = sized
    .filter(({ size }) => size && size.height >= size.width)
    .map(({ src }) => src);

  const selected = pickSyncedHero({
    selfKey,
    otherKey,
    pool: portraitPool.length > 0 ? portraitPool : pool,
    fallback
  });

  return selected;
}
