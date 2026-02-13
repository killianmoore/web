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

  return applyCurationOrder(photos);
}
