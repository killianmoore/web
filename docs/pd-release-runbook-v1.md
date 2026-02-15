# Pocket Directory v1.0 Release Runbook

## Scope
- Product: Emerald Guild Pocket Directory (iOS shell + web app route)
- Route: `/pd-lab`
- Bundle ID: `org.emeraldguild.pocketdirectory`

## Owners
- Product owner (you):
  - Final go/no-go decision
  - App Store Connect metadata
  - TestFlight tester invites
- Engineering (me):
  - Code updates and fixes
  - Build/sync command support
  - QA issue triage and patches

## Prerequisites
- Apple Developer account active
- Xcode installed and opened once
- Repo path: `/Users/killian/Documents/Codex`
- `.env.local` includes:
  - `PD_LAB_KEY=...`
  - `PD_APP_BASE_URL=https://killianmoore.studio` (or current production domain)

## Release Commands (in order)
1. Install deps:
```bash
cd /Users/killian/Documents/Codex
npm install
```

2. Type safety:
```bash
npm run typecheck
```

3. Production sync to iOS shell:
```bash
npm run cap:sync:auto
```

4. Open Xcode project:
```bash
npm run cap:open:ios
```

5. In Xcode:
- Select `App` target
- Set destination to `Any iOS Device (arm64)` for archive
- `Product` -> `Archive`
- Use Organizer -> `Distribute App` -> `App Store Connect` -> `Upload`

## Go/No-Go QA Checklist
- App opens to Pocket Directory route (not blank)
- `COVER`, `MEMBERS`, `VENDORS`, `FAVORITES` tabs work
- Favorites save/remove works
- Favorites badge count updates
- “Recently favorited” sort works
- Vendor category filter works
- Long email/website text wraps cleanly
- Last updated stamp visible
- Export buttons work:
  - Export Current Data
  - Export Quality Report
- No personal portfolio footer/nav inside `/pd-lab`

## App Store Connect Checklist
- App Name + Subtitle entered
- Description entered
- Support URL set: `https://killianmoore.studio/support`
- Privacy URL set: `https://killianmoore.studio/privacy-policy`
- Screenshots uploaded
- Test details / review notes added

## Internal TestFlight Rollout
1. Add internal testers first
2. Verify install on at least:
- one modern iPhone
- one older/smaller iPhone size
3. Collect issues for 24-48 hours
4. Patch critical issues only

## Rollback Plan
- If build regression appears:
  - Stop adding testers to new build
  - Revert to last stable commit
  - Re-run:
```bash
npm run typecheck
npm run cap:sync:auto
```
  - Archive/upload a new fixed build

## Post-Launch Rhythm
- Weekly:
  - Refresh CSV data
  - Run export quality report
  - Spot-check top member/vendor records
- Monthly:
  - Review favorites UX feedback
  - Prioritize quality-of-life updates
