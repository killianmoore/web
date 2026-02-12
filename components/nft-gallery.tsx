"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { NftImageItem } from "@/lib/nfts-alchemy";

type NftGalleryProps = {
  items: Array<NftImageItem & { marketUrl?: string }>;
};

export function NftGallery({ items }: NftGalleryProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [mountedIndex, setMountedIndex] = useState<number | null>(null);

  const closeModal = () => {
    setIsModalVisible(false);
    window.setTimeout(() => {
      setMountedIndex(null);
    }, 260);
  };

  const openModal = (index: number) => {
    setMountedIndex(index);
    requestAnimationFrame(() => setIsModalVisible(true));
  };

  useEffect(() => {
    if (mountedIndex === null) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mountedIndex]);

  return (
    <>
      <section className="mx-auto mt-40 grid max-w-[1600px] grid-cols-1 gap-6 px-6 md:mt-48 md:grid-cols-2 md:px-12 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, index) => (
          <motion.article
            className="group"
            initial={{ opacity: 0 }}
            key={`${item.contract}:${item.tokenId}`}
            transition={{ duration: 0.6, ease: "easeOut" }}
            viewport={{ once: true, amount: 0.2 }}
            whileInView={{ opacity: 1 }}
          >
            <button
              aria-label={`Open ${item.name}`}
              className="block w-full text-left"
              onClick={() => openModal(index)}
              type="button"
            >
              <img
                alt={item.name}
                className="block h-auto w-full cursor-zoom-in object-contain"
                loading="lazy"
                src={item.imageUrl}
              />
            </button>
            {item.marketUrl ? (
              <a
                className="mt-4 block text-[10px] uppercase leading-[1.2] tracking-[0.28em] text-white/40 transition-colors duration-300 hover:text-white/70 md:text-[11px]"
                href={item.marketUrl}
                rel="noreferrer"
                target="_blank"
              >
                {item.name}
              </a>
            ) : (
              <p className="mt-4 text-[10px] uppercase leading-[1.2] tracking-[0.28em] text-white/40 transition-colors duration-300 group-hover:text-white/70 md:text-[11px]">
                {item.name}
              </p>
            )}
          </motion.article>
        ))}
      </section>

      {mountedIndex !== null ? (
        <div
          aria-modal="true"
          className={`fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-6 transition-opacity duration-300 ease-out ${
            isModalVisible ? "opacity-100" : "opacity-0"
          }`}
          onClick={closeModal}
          role="dialog"
        >
          <div className="max-h-[92vh] max-w-[92vw]" onClick={(event) => event.stopPropagation()}>
            <img
              alt={items[mountedIndex]?.name ?? "NFT image"}
              className="max-h-[92vh] max-w-[92vw] object-contain"
              src={items[mountedIndex]?.imageUrl}
            />
          </div>
        </div>
      ) : null}
    </>
  );
}
