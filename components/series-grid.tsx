"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import type { Photo } from "@/lib/content";

export function SeriesGrid({ photos }: { photos: Photo[] }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeIndex === null) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialogRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActiveIndex(null);
      }

      if (event.key === "ArrowRight") {
        setActiveIndex((current) => {
          if (current === null) return null;
          return (current + 1) % photos.length;
        });
      }

      if (event.key === "ArrowLeft") {
        setActiveIndex((current) => {
          if (current === null) return null;
          return (current - 1 + photos.length) % photos.length;
        });
      }

      // Modal has no visible interactive controls; keep keyboard focus contained.
      if (event.key === "Tab") {
        event.preventDefault();
      }
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [activeIndex, photos.length]);

  return (
    <>
      <div className="grid grid-cols-1 gap-x-12 gap-y-20 md:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo, index) => (
          <motion.article
            initial={{ opacity: 0 }}
            key={`${photo.src}-${index}`}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView={{ opacity: 1 }}
          >
            <button
              aria-label={`Open photo ${index + 1}`}
              className="group block w-full cursor-zoom-in transition-opacity duration-300 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80"
              onClick={() => setActiveIndex(index)}
              type="button"
            >
              <Image
                alt={photo.alt ?? `Gallery photo ${index + 1}`}
                className="h-auto w-full object-contain transition-transform duration-500 group-hover:scale-[1.02]"
                height={photo.height ?? 1800}
                sizes="(max-width: 767px) 92vw, (max-width: 1023px) 44vw, 30vw"
                src={photo.src}
                width={photo.width ?? 2600}
              />
            </button>
          </motion.article>
        ))}
      </div>

      <AnimatePresence>
        {activeIndex !== null ? (
          <motion.div
            animate={{ opacity: 1 }}
            aria-label="Photo viewer"
            aria-modal="true"
            className="fixed inset-0 z-[120]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            role="dialog"
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-black/95"
              onClick={() => setActiveIndex(null)}
            />

            <motion.div
              animate={{ opacity: 1 }}
              className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center p-6 sm:p-10"
              initial={{ opacity: 0 }}
              ref={dialogRef}
              tabIndex={-1}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="pointer-events-auto" onClick={(e) => e.stopPropagation()}>
                <Image
                  alt={photos[activeIndex].alt ?? `Gallery photo ${activeIndex + 1}`}
                  className="h-auto max-h-[92vh] w-auto max-w-[92vw] object-contain"
                  height={photos[activeIndex].height ?? 1800}
                  priority
                  sizes="92vw"
                  src={photos[activeIndex].src}
                  width={photos[activeIndex].width ?? 2600}
                />
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
