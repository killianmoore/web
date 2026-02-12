import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ExifToggleGallery } from "@/components/exif-toggle-gallery";
import { getPhotoSeries, getPhotoSeriesBySlug } from "@/lib/photography-data";

type Params = { slug: string };

export async function generateStaticParams() {
  const series = await getPhotoSeries();
  return series.map((item) => ({ slug: item.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const series = await getPhotoSeriesBySlug(params.slug);

  if (!series) {
    return { title: "Series not found" };
  }

  return {
    title: series.title,
    description: `${series.title} (${series.year}) by Killian Moore.`
  };
}

export default async function SeriesPage({ params }: { params: Params }) {
  const series = await getPhotoSeriesBySlug(params.slug);

  if (!series) {
    notFound();
  }

  return (
    <article className="mx-auto w-[min(94vw,1160px)] space-y-8 py-28">
      <Link className="text-sm text-white/65 underline underline-offset-4 transition hover:text-white" href="/photography">
        Back to all series
      </Link>
      <header className="grid gap-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div className="space-y-3">
          <p className="text-[0.64rem] uppercase tracking-[0.24em] text-white/50">Series</p>
          <h1 className="font-display text-5xl leading-tight text-white">{series.title}</h1>
          <p className="text-sm text-white/50">{series.year}</p>
          <p className="max-w-xl text-sm leading-relaxed text-white/80">{series.description}</p>
        </div>
        <div className="overflow-hidden rounded-xl border border-white/15">
          <Image alt={`${series.title} cover`} className="aspect-[4/3] w-full object-cover" height={1200} src={series.cover} width={1600} />
        </div>
      </header>
      <ExifToggleGallery images={series.images} />
    </article>
  );
}
