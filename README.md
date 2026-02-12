# Killian Moore Portfolio

Minimal, always-dark, photo-forward portfolio site with integrated NFT presentation.

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS
- Framer Motion (subtle transitions and hero/nav interactions)
- JSON content files in `/content`
- Public assets in `/public`

## Core Features

- Full-viewport homepage hero with overlay signature mark
- Signature animation:
  - fades in on initial load
  - subtly scales down and moves upward on scroll
- Hidden floating nav:
  - reveals near top-edge mouse movement or light scroll
  - fades out when inactive
- Always dark mode (no toggle)
- Photography portfolio pages with optional EXIF toggle
- NFT collections/items with external marketplace links
- Accessible focus states and semantic structure

## Required Branding Asset

Primary logo mark path:

- `/public/brand/signature.svg`

A placeholder signature is included and can be replaced with your real SVG anytime.

## Content Editing

- Site text/socials: `/content/site.json`
- Photography series/images: `/content/photography-series.json`
- NFT data/placeholders: `/content/nfts.json`

## Run Locally

1. Install dependencies:

```bash
npm install
```

2. Start dev server:

```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000)

## Production Build

```bash
npm run build
npm run start
```

## Run In Production Locally

1. Run `npm run build`.
2. Run `npm run start`.
3. Open [http://localhost:3000](http://localhost:3000).

## Notes

- Replace hero placeholder in `/public/images/hero/hero-placeholder.svg`.
- Use `next/image`-friendly formats (`.jpg`, `.png`, `.webp`, `.avif`, `.svg`) for best performance.
- NFT data model remains provider-agnostic for OpenSea/Reservoir/Alchemy adapter integration later.
