"use client";

import { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "pd_lab_favorites_v1";
const META_STORAGE_KEY = "pd_lab_favorites_meta_v1";
export const PD_FAVORITES_STORAGE_KEY = STORAGE_KEY;
export const PD_FAVORITES_META_STORAGE_KEY = META_STORAGE_KEY;

function readFavorites(): Set<string> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return new Set();
  }
}

function writeFavorites(next: Set<string>) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
    window.dispatchEvent(new Event("pd-favorites-changed"));
  } catch {
    // Ignore localStorage failures (private mode, quotas, etc.)
  }
}

function readFavoriteMeta(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(META_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const output: Record<string, number> = {};
    for (const [key, value] of Object.entries(parsed)) {
      if (typeof value === "number" && Number.isFinite(value)) {
        output[key] = value;
      }
    }
    return output;
  } catch {
    return {};
  }
}

function writeFavoriteMeta(next: Record<string, number>) {
  try {
    window.localStorage.setItem(META_STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Ignore localStorage failures.
  }
}

type Props = {
  itemKey: string;
};

export function PDFavoriteButton({ itemKey }: Props) {
  const [ready, setReady] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const favorites = readFavorites();
    setIsFavorite(favorites.has(itemKey));
    setReady(true);
  }, [itemKey]);

  const label = useMemo(() => (isFavorite ? "Favorited" : "Favorite"), [isFavorite]);

  function toggle() {
    const favorites = readFavorites();
    const favoriteMeta = readFavoriteMeta();
    if (favorites.has(itemKey)) {
      favorites.delete(itemKey);
      delete favoriteMeta[itemKey];
      setIsFavorite(false);
    } else {
      favorites.add(itemKey);
      favoriteMeta[itemKey] = Date.now();
      setIsFavorite(true);
    }
    writeFavoriteMeta(favoriteMeta);
    writeFavorites(favorites);
  }

  return (
    <button
      type="button"
      className={`pd-favorite-btn ${isFavorite ? "is-active" : ""}`}
      aria-pressed={isFavorite}
      aria-label={label}
      title={label}
      onClick={toggle}
      disabled={!ready}
    >
      {isFavorite ? "☘ Saved" : "☘ Save"}
    </button>
  );
}
