import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Support",
  description: "Support for the Emerald Guild Pocket Directory application.",
};

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-6 text-3xl font-semibold">Support</h1>
      <div className="space-y-4 text-sm leading-7 text-zinc-300">
        <p>
          Need help with the Emerald Guild Pocket Directory app? Use the contact page and include
          your device type, app version, and issue details.
        </p>
        <p>
          Contact: <Link href="/contact" className="underline">/contact</Link>
        </p>
        <p>
          Privacy policy: <Link href="/privacy-policy" className="underline">/privacy-policy</Link>
        </p>
        <p>
          Typical support issues we can help with: access key problems, missing listings, and
          corrections to member/vendor data.
        </p>
      </div>
    </main>
  );
}
