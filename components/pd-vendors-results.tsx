"use client";

import { useEffect, useMemo, useState } from "react";
import type { DirectoryVendor } from "@/lib/pd-directory";
import { PDFavoriteButton, PD_FAVORITES_STORAGE_KEY } from "@/components/pd-favorite-button";

type Props = {
  vendors: DirectoryVendor[];
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

export function PDVendorsResults({ vendors, showFavoritesOnly, clearHref }: Props) {
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

  const filteredVendors = useMemo(() => {
    if (!showFavoritesOnly) return vendors;
    return vendors.filter((vendor) => favoriteKeys.has(`vendor:${vendor.id}`));
  }, [favoriteKeys, showFavoritesOnly, vendors]);

  const vendorsByCategory = useMemo(
    () =>
      filteredVendors.reduce(
        (acc, vendor) => {
          const key = vendor.category || "Uncategorized";
          if (!acc[key]) acc[key] = [];
          acc[key].push(vendor);
          return acc;
        },
        {} as Record<string, DirectoryVendor[]>,
      ),
    [filteredVendors],
  );

  if (Object.keys(vendorsByCategory).length === 0) {
    return (
      <div className="pd-empty-state">
        <p>
          {showFavoritesOnly ? "No favorite vendors yet." : "No vendor results for the current filters."}
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
      {Object.entries(vendorsByCategory).map(([category, categoryVendors]) => (
        <section className="pd-vendor-group" key={category}>
          <h2 className="pd-vendor-group-header">{category}</h2>
          {categoryVendors.map((vendor) => (
            <article className="pd-vendor-card" key={vendor.id} aria-label="Vendor listing">
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
    </>
  );
}
