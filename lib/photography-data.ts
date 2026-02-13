import rawSeries from "@/content/photography-series.json";
import rawCuration from "@/content/photography-curation.json";
import fs from "node:fs/promises";
import path from "node:path";

export type ExifData = {
  camera?: string;
  lens?: string;
  iso?: string;
  shutter?: string;
  aperture?: string;
};

export type Tone = "warm" | "cool" | "mono" | "night" | "gold" | "neon";

export type PhotoImage = {
  id?: string;
  src: string;
  alt: string;
  caption: string;
  tone?: Tone;
  exif?: ExifData;
};

export type Photo = {
  id: string;
  src: string;
  alt?: string;
  tone?: Tone;
  width?: number;
  height?: number;
  orientation?: "landscape" | "portrait";
};

export type PhotoSeries = {
  slug: string;
  title: string;
  year: number;
  cover: string;
  description: string;
  images: PhotoImage[];
};

const seriesData = rawSeries as PhotoSeries[];
type CurationConfig = {
  pinned?: string[];
  exclude?: string[];
};
const curationData = (rawCuration as CurationConfig) ?? {};

const toneKeywordMap: Record<Tone, string[]> = {
  warm: ["warm", "sunset", "dawn", "rose", "pink", "amber", "orange", "red"],
  cool: ["cool", "cyan", "teal", "ice", "aqua", "blue"],
  mono: ["mono", "monochrome", "blackwhite", "black-white", "bw", "b&w", "noir", "grayscale"],
  night: ["night", "dark", "midnight", "moon", "twilight", "nocturne"],
  gold: ["gold", "golden", "gilded"],
  neon: ["neon", "chrome", "electric", "cyber", "fluoro"]
};

function inferToneFromText(text: string): Tone {
  const haystack = text.toLowerCase();
  let bestTone: Tone = "night";
  let bestScore = 0;

  (Object.keys(toneKeywordMap) as Tone[]).forEach((tone) => {
    const score = toneKeywordMap[tone].reduce((sum, token) => (haystack.includes(token) ? sum + 1 : sum), 0);
    if (score > bestScore) {
      bestScore = score;
      bestTone = tone;
    }
  });

  return bestTone;
}

function getJpegSize(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  const sofMarkers = new Set([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf]);

  while (offset + 9 < buffer.length) {
    if (buffer[offset] !== 0xff) {
      offset += 1;
      continue;
    }

    const marker = buffer[offset + 1];
    if (marker === 0xd8 || marker === 0xd9) {
      offset += 2;
      continue;
    }

    if (offset + 4 >= buffer.length) {
      break;
    }

    const segmentLength = buffer.readUInt16BE(offset + 2);
    if (segmentLength < 2) {
      break;
    }

    if (sofMarkers.has(marker)) {
      const height = buffer.readUInt16BE(offset + 5);
      const width = buffer.readUInt16BE(offset + 7);
      return { width, height };
    }

    offset += 2 + segmentLength;
  }

  return null;
}

function getPngSize(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 24) {
    return null;
  }
  const pngSignature = "89504e470d0a1a0a";
  if (buffer.subarray(0, 8).toString("hex") !== pngSignature) {
    return null;
  }
  const width = buffer.readUInt32BE(16);
  const height = buffer.readUInt32BE(20);
  return { width, height };
}

async function getImageMetaForPublicPath(publicPath: string): Promise<Pick<Photo, "width" | "height" | "orientation">> {
  const absolutePath = path.join(process.cwd(), "public", publicPath.slice(1));
  const extension = path.extname(publicPath).toLowerCase();

  try {
    const buffer = await fs.readFile(absolutePath);
    let size: { width: number; height: number } | null = null;

    if (extension === ".jpg" || extension === ".jpeg") {
      size = getJpegSize(buffer);
    } else if (extension === ".png") {
      size = getPngSize(buffer);
    }

    if (!size) {
      return {};
    }

    return {
      width: size.width,
      height: size.height,
      orientation: size.width >= size.height ? "landscape" : "portrait"
    };
  } catch {
    return {};
  }
}

async function fileExistsForPublicPath(publicPath: string): Promise<boolean> {
  if (!publicPath.startsWith("/")) {
    return false;
  }

  try {
    const absolutePath = path.join(process.cwd(), "public", publicPath.slice(1));
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

async function getValidSeriesData(): Promise<PhotoSeries[]> {
  const validated = await Promise.all(
    seriesData.map(async (series) => {
      const validImages = [];

      for (const image of series.images) {
        if (await fileExistsForPublicPath(image.src)) {
          validImages.push(image);
        }
      }

      const coverExists = await fileExistsForPublicPath(series.cover);
      const safeCover = coverExists || validImages.length === 0 ? series.cover : validImages[0].src;

      return {
        ...series,
        cover: safeCover,
        images: validImages
      };
    })
  );

  return validated.filter((series) => series.images.length > 0);
}

function applyCurationOrder(photos: Photo[]): Photo[] {
  const pinned = curationData.pinned ?? [];
  const excludeSet = new Set(curationData.exclude ?? []);
  const byKey = new Map<string, Photo>();

  photos.forEach((photo) => {
    byKey.set(photo.id, photo);
    byKey.set(photo.src, photo);
  });

  const pinnedOrdered: Photo[] = [];
  const seen = new Set<string>();

  pinned.forEach((key) => {
    const photo = byKey.get(key);
    if (!photo) return;
    if (excludeSet.has(photo.id) || excludeSet.has(photo.src)) return;
    if (seen.has(photo.id)) return;
    seen.add(photo.id);
    pinnedOrdered.push(photo);
  });

  const remaining = photos.filter((photo) => {
    if (excludeSet.has(photo.id) || excludeSet.has(photo.src)) {
      return false;
    }
    return !seen.has(photo.id);
  });

  return [...pinnedOrdered, ...remaining];
}

function extractWebsiteNumber(photo: Photo): number | null {
  const match = photo.src.match(/Website(\d+)\.(jpg|jpeg|png|webp|avif)$/i);
  if (!match) {
    return null;
  }
  const num = Number.parseInt(match[1], 10);
  return Number.isFinite(num) ? num : null;
}

function autoDiversifyByTone(items: Photo[]): Photo[] {
  if (items.length <= 2) {
    return items;
  }

  const remaining = [...items];
  const first = remaining.shift();
  if (!first) return [];

  const ordered: Photo[] = [first];

  while (remaining.length > 0) {
    const prev = ordered[ordered.length - 1];
    const prevTone = prev.tone;
    const prevNum = extractWebsiteNumber(prev);

    let bestIndex = 0;
    let bestScore = Number.NEGATIVE_INFINITY;

    for (let i = 0; i < remaining.length; i += 1) {
      const candidate = remaining[i];
      let score = 0;

      if (candidate.tone && prevTone && candidate.tone !== prevTone) {
        score += 3;
      }
      if (candidate.tone && prevTone && candidate.tone === prevTone) {
        score -= 2;
      }

      const candidateNum = extractWebsiteNumber(candidate);
      if (candidateNum !== null && prevNum !== null) {
        const distance = Math.abs(candidateNum - prevNum);
        if (distance >= 10) score += 2;
        else if (distance <= 2) score -= 1;
      }

      if (score > bestScore) {
        bestScore = score;
        bestIndex = i;
      }
    }

    const next = remaining.splice(bestIndex, 1)[0];
    ordered.push(next);
  }

  return ordered;
}

function interleaveInBlocks(landscapes: Photo[], portraits: Photo[], blockSize = 3): Photo[] {
  const output: Photo[] = [];
  let l = 0;
  let p = 0;

  while (l < landscapes.length || p < portraits.length) {
    for (let i = 0; i < blockSize && l < landscapes.length; i += 1) {
      output.push(landscapes[l]);
      l += 1;
    }
    for (let i = 0; i < blockSize && p < portraits.length; i += 1) {
      output.push(portraits[p]);
      p += 1;
    }
  }

  return output;
}

function autoCuratePhotos(photos: Photo[]): Photo[] {
  const pinnedKeys = new Set((curationData.pinned ?? []).filter(Boolean));
  const pinned: Photo[] = [];
  const flexible: Photo[] = [];

  photos.forEach((photo) => {
    if (pinnedKeys.has(photo.id) || pinnedKeys.has(photo.src)) {
      pinned.push(photo);
    } else {
      flexible.push(photo);
    }
  });

  const landscapes = flexible.filter((photo) => photo.orientation === "landscape");
  const portraits = flexible.filter((photo) => photo.orientation === "portrait");
  const unknown = flexible.filter((photo) => !photo.orientation);

  const landscapeSorted = autoDiversifyByTone(
    [...landscapes].sort((a, b) => {
      const an = extractWebsiteNumber(a) ?? Number.MAX_SAFE_INTEGER;
      const bn = extractWebsiteNumber(b) ?? Number.MAX_SAFE_INTEGER;
      return an - bn;
    })
  );
  const portraitSorted = autoDiversifyByTone(
    [...portraits].sort((a, b) => {
      const an = extractWebsiteNumber(a) ?? Number.MAX_SAFE_INTEGER;
      const bn = extractWebsiteNumber(b) ?? Number.MAX_SAFE_INTEGER;
      return an - bn;
    })
  );
  const unknownSorted = autoDiversifyByTone(
    [...unknown].sort((a, b) => {
      const an = extractWebsiteNumber(a) ?? Number.MAX_SAFE_INTEGER;
      const bn = extractWebsiteNumber(b) ?? Number.MAX_SAFE_INTEGER;
      return an - bn;
    })
  );

  return [...pinned, ...interleaveInBlocks(landscapeSorted, portraitSorted, 3), ...unknownSorted];
}

export async function getPhotoSeries(): Promise<PhotoSeries[]> {
  return getValidSeriesData();
}

export async function getPhotoSeriesBySlug(slug: string): Promise<PhotoSeries | null> {
  const validSeries = await getValidSeriesData();
  return validSeries.find((item) => item.slug === slug) ?? null;
}

export async function getAllPhotos(): Promise<Photo[]> {
  const validSeries = await getValidSeriesData();
  const photos = await Promise.all(
    validSeries.flatMap((series) =>
      series.images.map(async (image) => {
        const meta = await getImageMetaForPublicPath(image.src);
        return {
          id: image.id ?? image.src,
          src: image.src,
          alt: image.alt,
          tone: image.tone ?? inferToneFromText(`${image.src} ${image.alt} ${image.caption ?? ""}`),
          ...meta
        } satisfies Photo;
      })
    )
  );

  return autoCuratePhotos(applyCurationOrder(photos));
}
