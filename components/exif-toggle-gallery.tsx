"use client";

import { useState } from "react";
import Image from "next/image";
import type { PhotoImage } from "@/lib/content";

export function ExifToggleGallery({ images }: { images: PhotoImage[] }) {
  const [showExif, setShowExif] = useState(false);

  return (
    <section aria-label="Series image gallery" className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-sm uppercase tracking-[0.2em] text-white/50">Gallery</h2>
        <button
          aria-pressed={showExif}
          className="rounded-full border border-white/20 px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-white transition hover:border-white/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          onClick={() => setShowExif((v) => !v)}
          type="button"
        >
          {showExif ? "Hide EXIF" : "Show EXIF"}
        </button>
      </div>

      <div className="masonry-grid">
        {images.map((image) => (
          <figure className="masonry-item overflow-hidden rounded-xl border border-white/15 bg-white/[0.02]" key={image.src}>
            <Image alt={image.alt} className="h-auto w-full object-cover" height={900} src={image.src} width={1200} />
            <figcaption className="space-y-2 px-4 py-3">
              {showExif && image.exif ? (
                <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-white/52">
                  {Object.entries(image.exif).map(([key, value]) => (
                    <div className="contents" key={`${image.src}-${key}`}>
                      <dt className="capitalize">{key}</dt>
                      <dd className="text-right text-white/78">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : null}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
