import rawSeries from "@/content/photography-series.json";

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

export async function getPhotoSeries(): Promise<PhotoSeries[]> {
  return seriesData;
}

export async function getPhotoSeriesBySlug(slug: string): Promise<PhotoSeries | null> {
  return seriesData.find((item) => item.slug === slug) ?? null;
}

export async function getAllPhotos(): Promise<Photo[]> {
  const all = seriesData.flatMap((series) =>
    series.images.map((image) => ({
      src: image.src,
      alt: image.alt
    }))
  );

  if (all.length <= 6) {
    return all;
  }

  const shuffled = [...all];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, 6);
}
