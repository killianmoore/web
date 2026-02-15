"use client";

import { useEffect, useMemo, useState } from "react";
import type { DirectoryMember } from "@/lib/pd-directory";
import { PDFavoriteButton, PD_FAVORITES_STORAGE_KEY } from "@/components/pd-favorite-button";

type Props = {
  members: DirectoryMember[];
  showFavoritesOnly: boolean;
  clearHref: string;
};

function readFavoriteKeys(): Set<string> {
  try {
    const raw = window.localStorage.getItem(PD_FAVORITES_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((item): item is string => typeof item === "string"));
  } catch {
    return new Set();
  }
}

export function PDMembersResults({ members, showFavoritesOnly, clearHref }: Props) {
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    const refresh = () => setFavoriteKeys(readFavoriteKeys());
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("pd-favorites-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pd-favorites-changed", refresh);
    };
  }, []);

  const filteredMembers = useMemo(() => {
    if (!showFavoritesOnly) return members;
    return members.filter((member) => favoriteKeys.has(`member:${member.id}`));
  }, [favoriteKeys, members, showFavoritesOnly]);

  if (filteredMembers.length === 0) {
    return (
      <div className="pd-empty-state">
        <p>
          {showFavoritesOnly ? "No favorite members yet." : "No member results for the current search."}
        </p>
        {!showFavoritesOnly ? (
          <p className="pd-empty-actions">
            <a href={clearHref}>Reset filters</a>
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <>
      {filteredMembers.map((member) => (
        <article className="pd-vendor-card" key={member.id} aria-label="Member listing">
          <p className="pd-vendor-category">{member.section}</p>
          <h2 className="pd-vendor-name">{member.fullName}</h2>
          {member.addressLine1 ? <p className="pd-vendor-line">{member.addressLine1}</p> : null}
          {member.addressLine2 ? <p className="pd-vendor-line">{member.addressLine2}</p> : null}
          {member.phone ? <p className="pd-vendor-line">Tel: {member.phone}</p> : null}
          {member.email ? <p className="pd-vendor-line">{member.email}</p> : null}
          <div className="pd-vendor-actions">
            <PDFavoriteButton itemKey={`member:${member.id}`} />
            {member.phone ? <a href={`tel:${member.phone.replace(/[^+\d]/g, "")}`}>Call</a> : null}
            {member.email ? <a href={`mailto:${member.email}`}>Email</a> : null}
          </div>
        </article>
      ))}
    </>
  );
}
