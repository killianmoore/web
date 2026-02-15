import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import { Uncial_Antiqua } from "next/font/google";
import { PDFavoritesPanel } from "@/components/pd-favorites-panel";
import { PDLabBodyGuard } from "@/components/pd-lab-body-guard";
import { PDModeToggle } from "@/components/pd-mode-toggle";
import { PDMembersResults } from "@/components/pd-members-results";
import { PDVendorsResults } from "@/components/pd-vendors-results";
import { loadDirectoryData } from "@/lib/pd-csv";
import { FRONT_PAGES, type FrontBlock } from "@/lib/pd-front-pages";

const celticDisplay = Uncial_Antiqua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pd-celtic",
});

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

type Props = {
  searchParams?: {
    k?: string;
    mode?: string;
    q?: string;
    category?: string;
    fav?: string;
  };
};

export default function PocketDirectoryLabPage({ searchParams }: Props) {
  const providedKey = searchParams?.k;
  const expectedKey = process.env.PD_LAB_KEY;
  const { members, vendors, lastUpdatedAt } = loadDirectoryData();
  const mode =
    searchParams?.mode === "vendors"
      ? "vendors"
      : searchParams?.mode === "favorites"
        ? "favorites"
      : searchParams?.mode === "front"
        ? "front"
        : "members";
  const q = (searchParams?.q ?? "").trim();
  const category = (searchParams?.category ?? "").trim();
  const showFavoritesOnly = searchParams?.fav === "1";
  const normalizedQuery = normalizeForSearch(q);
  const buildModeHref = (nextMode: "front" | "members" | "vendors" | "favorites") => {
    const params = new URLSearchParams();
    params.set("k", providedKey ?? "");
    params.set("mode", nextMode);
    if (q) params.set("q", q);
    if (category && (nextMode === "vendors" || nextMode === "favorites")) {
      params.set("category", category);
    }
    if (showFavoritesOnly && (nextMode === "members" || nextMode === "vendors")) {
      params.set("fav", "1");
    }
    return `/pd-lab?${params.toString()}`;
  };
  const membersHref = buildModeHref("members");
  const vendorsHref = buildModeHref("vendors");
  const frontHref = buildModeHref("front");
  const favoritesHref = buildModeHref("favorites");
  const membersFiltered = members.filter((member) => {
    if (!normalizedQuery) return true;
    const haystack = [
      member.fullName,
      member.addressLine1,
      member.addressLine2,
      member.phone,
      member.email,
      member.section,
    ]
      .join(" ")
      .trim();
    return normalizeForSearch(haystack).includes(normalizedQuery);
  });
  const vendorCategoryCounts = vendors.reduce(
    (acc, vendor) => {
      const key = vendor.category?.trim();
      if (!key) return acc;
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );
  const vendorCategories = Object.keys(vendorCategoryCounts).sort((a, b) => a.localeCompare(b));
  const selectedCategory = category && vendorCategoryCounts[category] ? category : "";
  const vendorsFiltered = vendors.filter((vendor) => {
    if (selectedCategory && vendor.category !== selectedCategory) return false;
    if (!normalizedQuery) return true;
    const haystack = [
      vendor.category,
      vendor.businessName,
      vendor.contactName,
      vendor.phone,
      vendor.email,
      vendor.website ?? "",
    ]
      .join(" ")
      .trim();
    return normalizeForSearch(haystack).includes(normalizedQuery);
  });
  const featuredVendor =
    vendorsFiltered.find((vendor) => vendor.tier === "featured") ?? vendorsFiltered[0];
  const favoritesToggleParams = new URLSearchParams();
  favoritesToggleParams.set("k", providedKey ?? "");
  favoritesToggleParams.set("mode", mode);
  if (q) favoritesToggleParams.set("q", q);
  if (mode === "vendors" && selectedCategory) favoritesToggleParams.set("category", selectedCategory);
  if (!showFavoritesOnly) favoritesToggleParams.set("fav", "1");
  const favoritesToggleHref = `/pd-lab?${favoritesToggleParams.toString()}`;
  const clearParams = new URLSearchParams();
  clearParams.set("k", providedKey ?? "");
  clearParams.set("mode", mode);
  const clearHref = `/pd-lab?${clearParams.toString()}`;
  const categoryResetParams = new URLSearchParams();
  categoryResetParams.set("k", providedKey ?? "");
  categoryResetParams.set("mode", "vendors");
  if (q) categoryResetParams.set("q", q);
  if (showFavoritesOnly) categoryResetParams.set("fav", "1");
  const categoryResetHref = `/pd-lab?${categoryResetParams.toString()}`;

  // Keep this page private in non-public docs by requiring a shared key.
  if (!expectedKey || !providedKey || providedKey !== expectedKey) {
    notFound();
  }

  return (
    <main className={`pd-lab ${celticDisplay.variable}`}>
      <PDLabBodyGuard />
      <section className="pd-preview">
        <PDModeToggle
          mode={mode}
          frontHref={frontHref}
          membersHref={membersHref}
          vendorsHref={vendorsHref}
          favoritesHref={favoritesHref}
        />

        <header className="pd-header">
          <p className="pd-brand">EMERALD GUILD SOCIETY</p>
          <p className="pd-brand-sub">EST. 1992</p>
          {mode === "front" ? (
            <h1 className="pd-title">ROLL OF HONOR</h1>
          ) : (
            <h1 className="pd-title">
              {mode === "members"
                ? "MEMBERS DIRECTORY"
                : mode === "vendors"
                  ? "VENDOR DIRECTORY"
                : "FAVORITES"}
            </h1>
          )}
        </header>

        {mode !== "front" && mode !== "favorites" ? (
          <form className="pd-filters" method="get">
            <input type="hidden" name="k" value={providedKey} />
            <input type="hidden" name="mode" value={mode} />
            {showFavoritesOnly ? <input type="hidden" name="fav" value="1" /> : null}
            <label className="pd-filter-field">
              <span>Search</span>
              <input
                type="search"
                name="q"
                defaultValue={q}
                placeholder={
                  mode === "members" ? "Name, email, phone, address..." : "Company, category..."
                }
              />
            </label>

            {mode === "vendors" ? (
              <label className="pd-filter-field">
                <span>Category</span>
                <select name="category" defaultValue={selectedCategory}>
                  <option value="">All categories</option>
                  {vendorCategories.map((option) => (
                    <option key={option} value={option}>
                      {option} ({vendorCategoryCounts[option]})
                    </option>
                  ))}
                </select>
                {selectedCategory ? (
                  <a className="pd-inline-reset" href={categoryResetHref}>
                    Reset category
                  </a>
                ) : null}
              </label>
            ) : null}

            <div className="pd-filter-actions">
              <button type="submit">Apply</button>
              <a href={clearHref}>Clear</a>
              {lastUpdatedAt ? (
                <p className="pd-data-freshness" aria-live="polite">
                  <span className="pd-data-freshness-full">
                    Updated {formatUpdatedAt(lastUpdatedAt)}
                  </span>
                  <span className="pd-data-freshness-compact">
                    Upd {formatUpdatedAtCompact(lastUpdatedAt)}
                  </span>
                </p>
              ) : null}
            </div>
          </form>
        ) : null}
        {mode === "members" || mode === "vendors" ? (
          <div className="pd-subtools">
            <a className={showFavoritesOnly ? "is-active" : ""} href={favoritesToggleHref}>
              {showFavoritesOnly ? "Showing favorites only" : "Show only favorites"}
            </a>
          </div>
        ) : null}

        <div className="pd-list">
          {mode === "front" ? (
            <div className="pd-front-sections">
              {Array.from({ length: 15 }, (_, index) => index).map((page) => (
                <article className="pd-front-card pd-front-book-page" key={page}>
                  <p className="pd-front-sticky-header">{getFrontSectionLabel(page)}</p>
                  {page === 0 ? (
                    <FrontTitlePage />
                  ) : (
                    <FrontPageContent page={page} />
                  )}
                  {page > 0 ? <p className="pd-front-page-number">{page}</p> : null}
                </article>
              ))}
            </div>
          ) : mode === "favorites" ? (
            <PDFavoritesPanel members={members} vendors={vendors} />
          ) : mode === "members" ? (
            <PDMembersResults
              members={membersFiltered}
              showFavoritesOnly={showFavoritesOnly}
              clearHref={clearHref}
            />
          ) : (
            <PDVendorsResults
              vendors={vendorsFiltered}
              showFavoritesOnly={showFavoritesOnly}
              clearHref={clearHref}
            />
          )}
        </div>

        {mode === "vendors" && featuredVendor && !showFavoritesOnly ? (
          <article className="pd-ad-block" aria-label="Sponsor ad sample">
            <p className="pd-ad-label">FEATURED SPONSOR</p>
            <div className="pd-ad-art">AD IMAGE AREA</div>
            <h3 className="pd-ad-title">{featuredVendor.businessName}</h3>
            <p className="pd-ad-copy">{featuredVendor.blurb ?? "Premium listing preview."}</p>
            <a
              className="pd-ad-cta"
              href={`tel:${featuredVendor.phone.replace(/[^+\d]/g, "")}`}
            >
              Call Sponsor
            </a>
          </article>
        ) : null}
      </section>
    </main>
  );
}

function normalizeForSearch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function formatUpdatedAt(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatUpdatedAtCompact(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown";
  return new Intl.DateTimeFormat("en-US", {
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function getFrontSectionLabel(page: number): string {
  return getFrontPageData(page).label;
}

function getFrontPageData(page: number) {
  return FRONT_PAGES[page] ?? FRONT_PAGES[14];
}

function FrontTitlePage() {
  return (
    <div className="pd-front-title-native">
      <p className="pd-front-title-brand">EMERALD GUILD SOCIETY</p>
      <p className="pd-front-title-brand-sub">EST. 1992</p>
      <div className="pd-front-title-crest-wrap">
        <Image
          src="/pd-lab/emerald-guild-logo-web.png"
          alt="Emerald Guild crest"
          width={1800}
          height={1800}
          className="pd-front-title-crest"
          priority
        />
      </div>
      <p className="pd-front-title-year">2024</p>
      <p className="pd-front-title-main">POCKET DIRECTORY</p>
      <p className="pd-front-title-main">& ROSTER</p>
    </div>
  );
}

function FrontPageContent({ page }: { page: number }) {
  const pageData = getFrontPageData(page);

  return (
    <>
      {pageData.blocks.map((block, index) => (
        <FrontBlockView block={block} key={`${block.type}-${index}`} />
      ))}
    </>
  );
}

function FrontBlockView({ block }: { block: FrontBlock }) {
  if (block.type === "brand") {
    return <p className="pd-front-brand">EMERALD GUILD SOCIETY</p>;
  }

  if (block.type === "emblem") {
    return <div className="pd-front-emblem">✢</div>;
  }

  if (block.type === "title") {
    return <h2 className="pd-front-title">{block.text}</h2>;
  }

  if (block.type === "subtitle") {
    return <p className="pd-front-subtitle">{block.text}</p>;
  }

  if (block.type === "minorTitle") {
    return <h3 className="pd-front-minor-title">{block.text}</h3>;
  }

  if (block.type === "highlightYear") {
    return <p className="pd-front-highlight-year">{block.text}</p>;
  }

  if (block.type === "highlightName") {
    return <p className="pd-front-highlight-name">{block.text}</p>;
  }

  return (
    <ul className={`pd-front-list ${block.twoCol ? "pd-front-list-two-col" : ""}`}>
      {block.items.map((item, itemIndex) => (
        <li key={`${item}-${itemIndex}`}>{item}</li>
      ))}
    </ul>
  );
}
