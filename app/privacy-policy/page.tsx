import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy policy for the Emerald Guild Pocket Directory application.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Privacy Policy</h1>
      <div className="space-y-4 text-sm leading-7 text-zinc-300">
        <p>Effective date: February 14, 2026</p>
        <p>
          The Emerald Guild Pocket Directory app is intended for approved association members and
          vendors. We only display directory data provided by your organization.
        </p>
        <p>
          We do not sell personal data. We do not use third-party advertising trackers in the app.
        </p>
        <p>
          Favorites are stored locally on your device. They are not shared with other users unless
          your organization later enables cloud sync.
        </p>
        <p>
          If your organization requests updates or removals of directory information, contact the
          directory administrator using the support page.
        </p>
        <p>
          For privacy questions, visit <Link href="/support" className="underline">Support</Link>.
        </p>
      </div>
    </main>
  );
}
