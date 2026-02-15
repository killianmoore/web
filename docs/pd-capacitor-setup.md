# Pocket Directory Capacitor Setup

This project now includes Capacitor for an iOS shell.

## Current model
- Native shell loads a hosted web app URL via `CAP_SERVER_URL`.
- This is the fastest path to TestFlight for the current Next.js architecture.

## One-time setup
1. Install dependencies (already done in this repo):
   - `@capacitor/core`
   - `@capacitor/cli`
   - `@capacitor/ios`
2. Add iOS platform:
   - `npm run cap:add:ios`

## Regular workflow
1. Set app base URL once in `.env.local`:
   - `PD_APP_BASE_URL=https://your-domain.com`
   - `PD_LAB_KEY=...` must already exist
2. Sync native config (auto-builds `/pd-lab?k=...` URL):
   - `npm run cap:sync:auto`
3. Open Xcode:
   - `npm run cap:open:ios`

## Notes
- `CAP_SERVER_URL` is read from `capacitor.config.ts` when syncing.
- `cap:sync:auto` calculates `CAP_SERVER_URL` from env vars and injects it for sync.
- Base URL fallback order:
  - `PD_APP_BASE_URL`
  - `NEXT_PUBLIC_SITE_URL`
  - `CAP_BASE_URL`
  - `http://localhost:3000`
- If the URL is `http://...`, `cleartext` is enabled automatically.
- For App Store/TestFlight, use `https://...`.
