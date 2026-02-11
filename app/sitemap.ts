import type { MetadataRoute } from "next";
import { getPhotoSeries } from "@/lib/content";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://killianmoore.studio";
  const series = await getPhotoSeries();

  const staticRoutes = ["", "/photography", "/nfts", "/about", "/contact"].map((route) => ({
    url: `${base}${route}`,
    lastModified: new Date()
  }));

  const seriesRoutes = series.map((item) => ({
    url: `${base}/photography/${item.slug}`,
    lastModified: new Date()
  }));

  return [...staticRoutes, ...seriesRoutes];
}
