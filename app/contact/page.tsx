import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/contact-form";
import { getSiteContent } from "@/lib/content";

const EMAIL = "killian@killianmoore.com";

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
        <p className="text-[16px] leading-[1.9] text-white/80 sm:text-[17px]">
          Use the form to start a conversation about commissions, print releases, 1/1 digital originals, or just to
          have a chat.
        </p>
        <div className="mt-10 space-y-3">
          <p className="text-[16px] leading-[1.9] text-white/80 sm:text-[17px]">Direct Inquiries</p>
          <a
            href={`mailto:${EMAIL}`}
            className="text-[16px] leading-[1.9] text-white/80 transition hover:text-white sm:text-[17px]"
          >
            {EMAIL}
          </a>
        </div>
        <div className="space-y-2">
          <p className="text-[16px] leading-[1.9] text-white/80 sm:text-[17px]">Socials</p>
          <ul className="flex flex-wrap gap-3">
            {site.socials.map((social) => (
              <li key={social.label}>
                <Link
                  className="text-[16px] leading-[1.9] text-white/80 underline underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:text-[17px]"
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
