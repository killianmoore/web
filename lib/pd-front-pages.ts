import fs from "node:fs";
import path from "node:path";

export type FrontBlock =
  | { type: "brand" }
  | { type: "emblem" }
  | { type: "title"; text: string }
  | { type: "subtitle"; text: string }
  | { type: "minorTitle"; text: string }
  | { type: "highlightYear"; text: string }
  | { type: "highlightName"; text: string }
  | { type: "list"; items: string[]; twoCol?: boolean };

export type FrontPageData = {
  label: string;
  blocks: FrontBlock[];
};

const frontPagesPath = path.join(process.cwd(), "content/pd/front-pages-2024.json");

const FALLBACK_FRONT_PAGES: Record<number, FrontPageData> = {
  0: { label: "Cover", blocks: [] },
  14: {
    label: "Friends & Supporters",
    blocks: [
      { type: "brand" },
      { type: "title", text: "FRIENDS & SUPPORTERS OF THE GUILD" },
      { type: "list", items: ["Patrick & Mary Hurley"] },
    ],
  },
};

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string");
}

function toFrontBlock(value: unknown): FrontBlock | null {
  if (!value || typeof value !== "object") return null;
  const block = value as Record<string, unknown>;
  const type = block.type;

  if (type === "brand" || type === "emblem") {
    return { type };
  }

  if (
    (type === "title" ||
      type === "subtitle" ||
      type === "minorTitle" ||
      type === "highlightYear" ||
      type === "highlightName") &&
    typeof block.text === "string"
  ) {
    return { type, text: block.text };
  }

  if (type === "list" && isStringArray(block.items)) {
    return { type: "list", items: block.items, twoCol: block.twoCol === true };
  }

  return null;
}

function parseFrontPages(raw: unknown): Record<number, FrontPageData> | null {
  if (!raw || typeof raw !== "object") return null;
  const input = raw as Record<string, unknown>;
  const parsed: Record<number, FrontPageData> = {};

  for (const [key, value] of Object.entries(input)) {
    const page = Number.parseInt(key, 10);
    if (!Number.isFinite(page)) continue;
    if (!value || typeof value !== "object") continue;

    const pageData = value as Record<string, unknown>;
    if (typeof pageData.label !== "string") continue;
    if (!Array.isArray(pageData.blocks)) continue;

    const blocks = pageData.blocks.map(toFrontBlock).filter((block): block is FrontBlock => !!block);
    parsed[page] = { label: pageData.label, blocks };
  }

  return Object.keys(parsed).length > 0 ? parsed : null;
}

function loadFrontPagesFromJson(): Record<number, FrontPageData> {
  try {
    if (!fs.existsSync(frontPagesPath)) return FALLBACK_FRONT_PAGES;
    const rawText = fs.readFileSync(frontPagesPath, "utf8");
    const parsedJson = JSON.parse(rawText);
    return parseFrontPages(parsedJson) ?? FALLBACK_FRONT_PAGES;
  } catch {
    return FALLBACK_FRONT_PAGES;
  }
}

export const FRONT_PAGES = loadFrontPagesFromJson();
