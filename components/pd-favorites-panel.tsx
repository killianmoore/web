"use client";

import { useEffect, useMemo, useState } from "react";
import type { DirectoryMember, DirectoryVendor } from "@/lib/pd-directory";
import {
  PDFavoriteButton,
  PD_FAVORITES_META_STORAGE_KEY,
  PD_FAVORITES_STORAGE_KEY,
} from "@/components/pd-favorite-button";

type Props = {
  members: DirectoryMember[];
  vendors: DirectoryVendor[];
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

function readFavoriteMeta(): Record<string, number> {
  try {
    const raw = window.localStorage.getItem(PD_FAVORITES_META_STORAGE_KEY);
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

export function PDFavoritesPanel({ members, vendors }: Props) {
  const [favoriteKeys, setFavoriteKeys] = useState<Set<string>>(new Set());
  const [favoriteMeta, setFavoriteMeta] = useState<Record<string, number>>({});
  const [sortMode, setSortMode] = useState<"alpha" | "recent">("alpha");

  useEffect(() => {
    const refresh = () => {
      setFavoriteKeys(readFavoriteKeys());
      setFavoriteMeta(readFavoriteMeta());
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener("pd-favorites-changed", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("pd-favorites-changed", refresh);
    };
  }, []);

  const favoriteMembers = useMemo(
    () => members.filter((member) => favoriteKeys.has(`member:${member.id}`)),
    [members, favoriteKeys],
  );

  const favoriteVendors = useMemo(
    () => vendors.filter((vendor) => favoriteKeys.has(`vendor:${vendor.id}`)),
    [vendors, favoriteKeys],
  );

  const favoriteMembersBySection = useMemo(
    () => {
      const sorted = favoriteMembers.slice().sort((a, b) => {
        if (sortMode === "recent") {
          const aTs = favoriteMeta[`member:${a.id}`] ?? 0;
          const bTs = favoriteMeta[`member:${b.id}`] ?? 0;
          if (bTs !== aTs) return bTs - aTs;
        }
        return a.section.localeCompare(b.section) || a.fullName.localeCompare(b.fullName);
      });

      return sorted.reduce(
        (acc, member) => {
          if (!acc[member.section]) acc[member.section] = [];
          acc[member.section].push(member);
          return acc;
        },
        {} as Record<string, DirectoryMember[]>,
      );
    },
    [favoriteMembers, favoriteMeta, sortMode],
  );

  const favoriteVendorsByCategory = useMemo(
    () => {
      const sorted = favoriteVendors.slice().sort((a, b) => {
        if (sortMode === "recent") {
          const aTs = favoriteMeta[`vendor:${a.id}`] ?? 0;
          const bTs = favoriteMeta[`vendor:${b.id}`] ?? 0;
          if (bTs !== aTs) return bTs - aTs;
        }
        return a.category.localeCompare(b.category) || a.businessName.localeCompare(b.businessName);
      });

      return sorted.reduce(
        (acc, vendor) => {
          if (!acc[vendor.category]) acc[vendor.category] = [];
          acc[vendor.category].push(vendor);
          return acc;
        },
        {} as Record<string, DirectoryVendor[]>,
      );
    },
    [favoriteMeta, favoriteVendors, sortMode],
  );

  function clearAllFavorites() {
    try {
      window.localStorage.setItem(PD_FAVORITES_STORAGE_KEY, JSON.stringify([]));
      window.localStorage.setItem(PD_FAVORITES_META_STORAGE_KEY, JSON.stringify({}));
      window.dispatchEvent(new Event("pd-favorites-changed"));
      setFavoriteKeys(new Set());
      setFavoriteMeta({});
    } catch {
      // no-op
    }
  }

  if (favoriteMembers.length === 0 && favoriteVendors.length === 0) {
    return <p className="pd-empty-state">No favorites yet. Tap ☘ Save on any card.</p>;
  }

  return (
    <div className="pd-favorites-wrap">
      <div className="pd-favorites-toolbar">
        <button
          type="button"
          className={sortMode === "recent" ? "is-active" : ""}
          onClick={() => setSortMode((prev) => (prev === "alpha" ? "recent" : "alpha"))}
        >
          {sortMode === "recent" ? "Sorting: recent" : "Sort: recently favorited"}
        </button>
        <button type="button" onClick={clearAllFavorites}>
          Clear all favorites
        </button>
      </div>

      {Object.entries(favoriteMembersBySection).map(([section, sectionMembers]) => (
        <section className="pd-vendor-group" key={section}>
          <h2 className="pd-vendor-group-header">{section}</h2>
          {sectionMembers.map((member) => (
            <article className="pd-vendor-card" key={member.id}>
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
        </section>
      ))}

      {Object.entries(favoriteVendorsByCategory).map(([category, categoryVendors]) => (
        <section className="pd-vendor-group" key={category}>
          <h2 className="pd-vendor-group-header">{category}</h2>
          {categoryVendors.map((vendor) => (
            <article className="pd-vendor-card" key={vendor.id}>
              <p className="pd-vendor-category">{vendor.category}</p>
              <h2 className="pd-vendor-name">{vendor.businessName}</h2>
              {vendor.contactName ? (
                <p className="pd-vendor-line">Contact: {vendor.contactName}</p>
              ) : null}
              {vendor.phone ? <p className="pd-vendor-line">Tel: {vendor.phone}</p> : null}
              {vendor.email ? <p className="pd-vendor-line">{vendor.email}</p> : null}
              <div className="pd-vendor-actions">
                <PDFavoriteButton itemKey={`vendor:${vendor.id}`} />
                {vendor.phone ? <a href={`tel:${vendor.phone.replace(/[^+\d]/g, "")}`}>Call</a> : null}
                {vendor.email ? <a href={`mailto:${vendor.email}`}>Email</a> : null}
                {vendor.website ? (
                  <a href={vendor.website} target="_blank" rel="noreferrer">
                    Website
                  </a>
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ))}
    </div>
  );
}
