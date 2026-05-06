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

## Member And Vendor Data Updates
Use these files for quick data-only updates:

- Members: `/Users/killian/Documents/Codex/content/pd/members-2024.csv`
- Vendors: `/Users/killian/Documents/Codex/content/pd/vendors-2024.csv`

For member building/address edits, update the member row in `members-2024.csv`. The key columns are `Work Address`, `Apt. #`, `City`, `State`, and `Zip`.

For vendors in multiple categories, add one vendor row per category in `vendors-2024.csv`. The app keeps the same vendor across different categories, but removes duplicate rows within the same category.

After CSV edits, run:
```bash
cd /Users/killian/Documents/Codex
npm run typecheck:pd
npm run build:pd
```

Then deploy the website. A new TestFlight build is not required for CSV-only changes because the iOS app loads the live PD website.

## TestFlight Renewal / Xcode Signing
Use this when the current TestFlight beta is expiring and the app code is unchanged.

1. Open the project:
```bash
cd /Users/killian/Documents/Codex
npm run cap:sync:auto
npm run cap:open:ios
```

Pre-archive rule: always run `npm run cap:sync:auto` before opening/archive in Xcode. This is mandatory for every TestFlight upload because it writes the production web URL into the generated iOS Capacitor config.

After syncing, confirm this file:
```text
/Users/killian/Documents/Codex/ios/App/App/capacitor.config.json
```

must contain:
```text
https://emeraldguildpd.org/pd-lab?k=...
```

If it contains `localhost`, `.com`, or any non-production URL, stop and fix `.env.local` before archiving. A wrong URL will package successfully but can open to a black screen on members' phones.

2. In Xcode:
- Select the `App` target
- Open `General` -> `Identity`
- Keep `Version` unchanged, for example `1.0`
- Increment `Build`, for example `2` -> `3`

3. If Xcode reports no development provisioning profiles or says the team has no devices, do not connect a phone just for TestFlight. Use the App Store profile instead:
- Go to Apple Developer -> `Certificates, Identifiers & Profiles` -> `Profiles`
- Open/download the active profile named `EGPD App Store`
- Double-click the downloaded `.mobileprovision` file to install it
- In Xcode, open `App` target -> `Signing & Capabilities`
- Select the `Release` filter
- Uncheck `Automatically manage signing`
- Set `Signing Certificate` to `Apple Distribution`
- Set `Provisioning Profile` to `EGPD App Store`

4. Confirm archive settings:
- `Product` -> `Scheme` -> `Edit Scheme...`
- Select `Archive`
- Confirm `Build Configuration` is `Release`

5. Upload:
- Set destination to `Any iOS Device (arm64)`
- `Product` -> `Archive`
- Organizer -> `Distribute App` -> `App Store Connect` -> `Upload`
- In App Store Connect, add the processed build to the same TestFlight tester group

## Automated Workflow Test
- Start the app locally (or point to deployed env):
```bash
npm run dev
```
- In another terminal, run the end-to-end workflow smoke test:
```bash
PD_LAB_KEY=your_shared_key npm run test:pd:workflow
```
- Optional full-route checks for application and committee portals:
```bash
PD_LAB_KEY=your_shared_key \
PD_TEST_BASE_URL=https://your-domain.com \
PD_APPLICATION_URL=https://your-domain.com/application \
PD_APPLICATION_EXPECT_TEXT="Apply" \
PD_COMMITTEE_URL=https://your-domain.com/committee \
PD_COMMITTEE_EXPECT_TEXT="Committee" \
npm run test:pd:workflow
```
- Optional strict mode (fails if external portal URLs are missing):
```bash
PD_REQUIRE_EXTERNAL=1 PD_LAB_KEY=your_shared_key npm run test:pd:workflow
```

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

## Android Internal Testing
Use Google Play Console for Android testers:

```text
https://play.google.com/console
```

Add Android testers:
- Open Google Play Console
- Select `Emerald Guild Pocket Directory`
- Go to `Test and release` -> `Testing` -> `Internal testing`
- Open the `Testers` tab
- Edit the `OG Beta` email list
- Type the tester's Google email address
- Press `Enter` so the email moves into `Email addresses added`
- Click `Save changes`
- Send the tester the internal testing opt-in link

Tester note: the tester must open the opt-in link while signed into the same Google account that was added to the list.

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
