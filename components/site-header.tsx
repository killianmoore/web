import Link from "next/link";
import { getSiteContent } from "@/lib/content";

const nav = [
  { href: "/", label: "Home" },
  { href: "/photography", label: "Photography" },
  { href: "/nfts", label: "NFTs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export async function SiteHeader() {
  const site = await getSiteContent();

  return (
    <header className="border-b border-line/80">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
        <Link className="font-display text-3xl tracking-tight text-ink" href="/">
          {site.name}
        </Link>
        <nav aria-label="Main navigation" className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-ink/90">
          {nav.map((item) => (
            <Link
              className="rounded-sm px-1 py-1 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
