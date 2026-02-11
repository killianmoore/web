import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { getSiteContent } from "@/lib/content";

export async function SiteFooter() {
  const site = await getSiteContent();

  return (
    <footer className="border-t border-white/12 bg-black/50">
      <div className="mx-auto flex w-[min(94vw,1160px)] flex-col gap-6 py-9 text-xs uppercase tracking-[0.14em] text-white/62 sm:flex-row sm:items-center sm:justify-between">
        <Link className="w-32 opacity-80 transition hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href="/">
          <BrandMark />
        </Link>
        <div className="flex flex-wrap items-center gap-4">
          {site.socials.map((social) => (
            <Link
              className="rounded-sm transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              href={social.url}
              key={social.label}
              rel="noreferrer"
              target="_blank"
            >
              {social.label}
            </Link>
          ))}
          <p className="text-white/42">© {new Date().getFullYear()}</p>
        </div>
      </div>
    </footer>
  );
}
