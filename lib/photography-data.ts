import rawSeries from "@/content/photography-series.json";
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

export async function getPhotoSeries(): Promise<PhotoSeries[]> {
  return getValidSeriesData();
}

export async function getPhotoSeriesBySlug(slug: string): Promise<PhotoSeries | null> {
  const validSeries = await getValidSeriesData();
  return validSeries.find((item) => item.slug === slug) ?? null;
}

export async function getAllPhotos(): Promise<Photo[]> {
  const validSeries = await getValidSeriesData();
  return validSeries.flatMap((series) =>
    series.images.map((image) => ({
      id: image.id ?? image.src,
      src: image.src,
      alt: image.alt,
      tone: image.tone ?? inferToneFromText(`${image.src} ${image.alt} ${image.caption ?? ""}`)
    }))
  );
}
