import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Killian Moore for commissions, editions, and collaborations."
};

export default async function ContactPage() {
  const site = await getSiteContent();

  return (
    <section className="mx-auto grid w-[min(94vw,1160px)] gap-10 py-28 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="space-y-5">
        <p className="text-[0.64rem] uppercase tracking-[0.24em] text-white/50">Contact</p>
        <h1 className="font-display text-5xl text-white">Commissions & Collaborations</h1>
        <p className="text-sm leading-relaxed text-white/78">
          Use the form to start a conversation about commissions, print releases, speaking, or NFT drops.
        </p>
        <p className="text-sm text-white">
          Email:{" "}
          <a className="underline underline-offset-4 transition hover:text-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white" href={`mailto:${site.email}`}>
            {site.email}
          </a>
        </p>
        <div className="space-y-2 text-sm text-white/62">
          <p>Socials</p>
          <ul className="flex flex-wrap gap-3">
            {site.socials.map((social) => (
              <li key={social.label}>
                <Link
                  className="underline underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                  href={social.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {social.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <ContactForm />
    </section>
  );
}
