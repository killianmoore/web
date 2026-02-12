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
  return seriesData.flatMap((series) =>
    series.images.map((image) => ({
      src: image.src,
      alt: image.alt
    }))
  );
}
