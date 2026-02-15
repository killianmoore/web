"use client";

import { useEffect, useState } from "react";
import { PD_FAVORITES_STORAGE_KEY } from "@/components/pd-favorite-button";

type Props = {
  mode: "front" | "members" | "vendors" | "favorites";
  frontHref: string;
  membersHref: string;
  vendorsHref: string;
  favoritesHref: string;
};

function readFavoritesCount(): number {
  try {
    const raw = window.localStorage.getItem(PD_FAVORITES_STORAGE_KEY);
    if (!raw) return 0;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return 0;
    return parsed.filter((item): item is string => typeof item === "string").length;
  } catch {
    return 0;
  }
}

export function PDModeToggle({
  mode,
  frontHref,
  membersHref,
  vendorsHref,
  favoritesHref,
}: Props) {
  const [favoritesCount, setFavoritesCount] = useState(0);

  useEffect(() => {
    const refresh = () => setFavoritesCount(readFavoritesCount());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("pd-favorites-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pd-favorites-changed", refresh);
    };
  }, []);

  return (
    <nav className="pd-mode-toggle" aria-label="Preview mode">
      <a className={mode === "front" ? "is-active" : ""} href={frontHref}>
        COVER
      </a>
      <a className={mode === "members" ? "is-active" : ""} href={membersHref}>
        MEMBERS
      </a>
      <a className={mode === "vendors" ? "is-active" : ""} href={vendorsHref}>
        VENDORS
      </a>
      <a className={mode === "favorites" ? "is-active" : ""} href={favoritesHref}>
        FAVORITES
        {favoritesCount > 0 ? <span className="pd-favorites-badge">{favoritesCount}</span> : null}
      </a>
    </nav>
  );
}
