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

## Deploy

### Vercel (recommended)

1. Push project to GitHub/GitLab/Bitbucket.
2. Import the repo in Vercel.
3. Vercel detects Next.js automatically.
4. Click Deploy.

### Manual Node deployment

1. Run `npm run build`.
2. Run `npm run start` on your server.
3. Put a reverse proxy (like Nginx) in front if needed.

## Notes

- Replace hero placeholder in `/public/images/hero/hero-placeholder.svg`.
- Use `next/image`-friendly formats (`.jpg`, `.png`, `.webp`, `.avif`, `.svg`) for best performance.
- NFT data model remains provider-agnostic for OpenSea/Reservoir/Alchemy adapter integration later.
