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

export type MarketplaceLink = {
  name: string;
  url: string;
};

export type NFTItem = {
  name: string;
  tokenId: string;
  image: string;
  marketplaces: MarketplaceLink[];
};

export type NFTCollection = {
  slug: string;
  title: string;
  chain: string;
  contractAddress: string;
  description: string;
  cover: string;
  marketplaces: MarketplaceLink[];
  items: NFTItem[];
  integration: {
    providerAgnostic: true;
    adapters: string[];
  };
};

function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const absolutePath = path.join(process.cwd(), filePath);
  const raw = await fs.readFile(absolutePath, "utf8");
  return JSON.parse(raw) as T;
}

async function existsInPublic(publicUrl: string): Promise<boolean> {
  const normalized = publicUrl.startsWith("/") ? publicUrl.slice(1) : publicUrl;
  const decoded = normalized
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment))
    .join("/");
  const absolutePath = path.join(process.cwd(), "public", decoded);

  try {
    await fs.access(absolutePath);
    return true;
  } catch {
    return false;
  }
}

function toPublicUrl(absolutePath: string): string {
  const relative = path.relative(path.join(process.cwd(), "public"), absolutePath);
  return `/${relative.split(path.sep).join("/")}`;
}

function encodePublicUrl(publicUrl: string): string {
  const hasLeadingSlash = publicUrl.startsWith("/");
  const segments = publicUrl.split("/").filter(Boolean).map((segment) => encodeURIComponent(segment));
  return `${hasLeadingSlash ? "/" : ""}${segments.join("/")}`;
}

function makeAltFromFilename(filePath: string): string {
  const base = path.basename(filePath, path.extname(filePath));
  return base.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

function publicUrlToAbsolute(publicUrl: string): string {
  const normalized = publicUrl.startsWith("/") ? publicUrl.slice(1) : publicUrl;
  const decoded = normalized
    .split("/")
    .filter(Boolean)
    .map((segment) => decodeURIComponent(segment))
    .join("/");
  return path.join(process.cwd(), "public", decoded);
}

function toWebDerivativePublicUrl(publicUrl: string): string {
  const dirname = path.posix.dirname(publicUrl);
  const basename = path.posix.basename(publicUrl, path.posix.extname(publicUrl));
  return `${dirname}/_web/${basename}.jpg`;
}

async function listFilesRecursive(dirPath: string): Promise<string[]> {
  const entries = await fs.readdir(dirPath, { withFileTypes: true });
  const nested = await Promise.all(
    entries.map(async (entry) => {
      const absolute = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        return listFilesRecursive(absolute);
      }
      if (entry.isFile()) {
        return [absolute];
      }
      return [];
    })
  );
  return nested.flat();
}

function parseSvgDimension(value: string): number | null {
  const parsed = Number.parseFloat(value.replace(/[^\d.]+/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function getJpegSize(buffer: Buffer): { width: number; height: number } | null {
  if (buffer.length < 4 || buffer[0] !== 0xff || buffer[1] !== 0xd8) {
    return null;
  }

  let offset = 2;
  const sofMarkers = new Set([
    0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf
  ]);

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

async function getImageMeta(publicUrl: string): Promise<Pick<Photo, "width" | "height" | "orientation">> {
  const absolutePath = publicUrlToAbsolute(publicUrl);
  const extension = path.extname(publicUrl).toLowerCase();

  try {
    if (extension === ".svg") {
      const svg = await fs.readFile(absolutePath, "utf8");
      const widthMatch = svg.match(/\bwidth\s*=\s*"([^"]+)"/i);
      const heightMatch = svg.match(/\bheight\s*=\s*"([^"]+)"/i);
      const viewBoxMatch = svg.match(/\bviewBox\s*=\s*"([^"]+)"/i);

      const width =
        (widthMatch ? parseSvgDimension(widthMatch[1]) : null) ??
        (viewBoxMatch ? Number.parseFloat(viewBoxMatch[1].trim().split(/\s+/)[2]) : null);
      const height =
        (heightMatch ? parseSvgDimension(heightMatch[1]) : null) ??
        (viewBoxMatch ? Number.parseFloat(viewBoxMatch[1].trim().split(/\s+/)[3]) : null);

      if (width && height) {
        return { width, height, orientation: width >= height ? "landscape" : "portrait" };
      }
      return {};
    }

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

async function resolveRenderableSource(publicUrl: string): Promise<{ src: string; filePublicUrl: string } | null> {
  const ext = path.extname(publicUrl).toLowerCase();
  const webDerivative = toWebDerivativePublicUrl(publicUrl);

  if (await existsInPublic(webDerivative)) {
    return { src: encodePublicUrl(webDerivative), filePublicUrl: webDerivative };
  }

  if (ext === ".tif" || ext === ".tiff") {
    const jpegCandidate = `${publicUrl.slice(0, -ext.length)}.jpg`;
    const jpegWebDerivative = toWebDerivativePublicUrl(jpegCandidate);
    if (await existsInPublic(jpegWebDerivative)) {
      return { src: encodePublicUrl(jpegWebDerivative), filePublicUrl: jpegWebDerivative };
    }
    if (await existsInPublic(jpegCandidate)) {
      return { src: encodePublicUrl(jpegCandidate), filePublicUrl: jpegCandidate };
    }
    return null;
  }

  if (await existsInPublic(publicUrl)) {
    return { src: encodePublicUrl(publicUrl), filePublicUrl: publicUrl };
  }

  return null;
}

export async function getPhotoSeries(): Promise<PhotoSeries[]> {
  const rawSeries = await readJsonFile<PhotoSeries[]>("content/photography-series.json");

  const resolved = await Promise.all(
    rawSeries.map(async (series) => {
      const filteredImages = (
        await Promise.all(
          series.images.map(async (image) => {
            if (await existsInPublic(image.src)) {
              return image;
            }
            return null;
          })
        )
      ).filter((image): image is PhotoImage => Boolean(image));

      if (filteredImages.length === 0) {
        return null;
      }

      const cover = (await existsInPublic(series.cover)) ? series.cover : filteredImages[0].src;

      return {
        ...series,
        cover,
        images: filteredImages
      };
    })
  );

  return resolved.filter((series): series is PhotoSeries => Boolean(series));
}

const curatedPhotoOrder = [
  "/images/series-neon-city/n03.jpg",
  "/images/series-neon-city/n09.jpg",
  "/images/series-neon-city/n12.jpg",
  "/images/series-neon-city/n01.jpg",
  "/images/series-neon-city/n06.jpg",
  "/images/series-neon-city/Wide TOTR Dark (1 of 1).jpg",
  "/images/series-neon-city/Golden  Bridge1 (1 of 1).jpg",
  "/images/series-neon-city/WTC Pink +1 (1 of 1).jpg",
  "/images/series-neon-city/Cine Bridge (1 of 1).jpg",
  "/images/series-neon-city/ESB-E-W.jpg",
  "/images/series-neon-city/Billy (1 of 1).jpg"
];

export async function getAllPhotos(): Promise<Photo[]> {
  const series = await getPhotoSeries();

  const fromSeriesContent = (
    await Promise.all(
      series.flatMap((group) =>
        group.images.map(async (image) => {
          const resolved = await resolveRenderableSource(image.src);
          if (!resolved) {
            return null;
          }
          const meta = await getImageMeta(resolved.filePublicUrl);
          return {
            src: resolved.src,
            alt: image.alt,
            ...meta
          } satisfies Photo;
        })
      )
    )
  ).filter(isDefined);

  const imagesRoot = path.join(process.cwd(), "public", "images");
  const entries = await fs.readdir(imagesRoot, { withFileTypes: true });
  const seriesDirs = entries.filter((entry) => entry.isDirectory() && entry.name.startsWith("series-"));
  const supportedExts = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".svg", ".tif", ".tiff"]);

  const discoveredLists = await Promise.all(
    seriesDirs.map(async (dir) => {
      const dirPath = path.join(imagesRoot, dir.name);
      const files = await listFilesRecursive(dirPath);
      return files
        .filter((absolute) => supportedExts.has(path.extname(absolute).toLowerCase()))
        .map((absolute) => {
          const publicUrl = toPublicUrl(absolute);
          return {
            _publicUrl: publicUrl,
            alt: makeAltFromFilename(publicUrl)
          };
        });
    })
  );

  const discoveredPhotos = (
    await Promise.all(
      discoveredLists.flat().map(async (photo) => {
        const resolved = await resolveRenderableSource(photo._publicUrl);
        if (!resolved) {
          return null;
        }
        const meta = await getImageMeta(resolved.filePublicUrl);
        return {
          src: resolved.src,
          alt: photo.alt,
          ...meta
        } satisfies Photo;
      })
    )
  ).filter(isDefined);

  const allPhotos = [...fromSeriesContent];
  const seen = new Set(fromSeriesContent.map((photo) => photo.src));
  for (const photo of discoveredPhotos) {
    if (!seen.has(photo.src)) {
      seen.add(photo.src);
      allPhotos.push(photo);
    }
  }

  const photoBySrc = new Map(allPhotos.map((photo) => [photo.src, photo]));
  const curatedPhotos = curatedPhotoOrder
    .map((src) => photoBySrc.get(encodePublicUrl(src)))
    .filter(isDefined);
  const curatedSrcs = new Set(curatedPhotos.map((photo) => photo.src));
  const remaining = allPhotos.filter((photo) => !curatedSrcs.has(photo.src));

  const ordered = [...curatedPhotos, ...remaining];
  const landscapes = ordered.filter((photo) => photo.orientation === "landscape");
  const portraits = ordered.filter((photo) => photo.orientation === "portrait");
  const unknown = ordered.filter((photo) => !photo.orientation);

  return [...landscapes, ...portraits, ...unknown];
}

export async function getPhotoSeriesBySlug(slug: string): Promise<PhotoSeries | null> {
  const series = await getPhotoSeries();
  return series.find((item) => item.slug === slug) ?? null;
}

export async function getNftCollections(): Promise<NFTCollection[]> {
  return readJsonFile<NFTCollection[]>("content/nfts.json");
}

export async function getSiteContent(): Promise<{
  name: string;
  intro: string;
  bio: string[];
  statement: string;
  socials: { label: string; url: string }[];
  email: string;
}> {
  return readJsonFile("content/site.json");
}
