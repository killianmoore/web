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

export type PhotoImage = {
  src: string;
  alt: string;
  caption: string;
  exif?: ExifData;
};

export type Photo = {
  src: string;
  alt?: string;
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
      src: image.src,
      alt: image.alt
    }))
  );
}
