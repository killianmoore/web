import type { Metadata } from "next";
import Link from "next/link";
import { getSiteContent } from "@/lib/content";

const EMAIL = "killian@killianmoore.com";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Killian Moore for commissions, editions, and collaborations."
};

export default async function ContactPage() {
  const site = await getSiteContent();
  const sectionLabelClass = "text-[11px] tracking-[0.35em] uppercase text-white/50";
  const bioBodyClass = "text-[15px] leading-[1.8] text-white/85 sm:text-[17px] sm:leading-[1.9] lg:text-[18px]";
  const socialsOrder = ["X", "Instagram", "SuperRare", "Foundation"] as const;
  const socials = socialsOrder
    .map((label) => site.socials.find((social) => social.label === label))
    .filter((social): social is (typeof site.socials)[number] => Boolean(social));
  const deca = { label: "Deca", url: "https://deca.art/deca" };
  const contactSocials = [...socials, deca];

  return (
    <section className="mx-auto w-[min(94vw,1160px)] py-28">
      <div className="space-y-5">
        <p className={sectionLabelClass}>Contact</p>
        <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">Commissions & Collaborations</h1>
        <p className="mt-8 text-[17px] leading-[1.9] text-white/70">
          If the work resonates, feel free to reach out.
        </p>
        <p className="mt-4 text-[17px] leading-[1.9] text-white/70">
          Available for commissioned projects, print releases, and select digital works.
        </p>
        <div className="mt-10 space-y-3">
          <p className="mt-12 text-[11px] tracking-[0.35em] uppercase text-white/50">Direct Inquiries</p>
          <a
            href={`mailto:${EMAIL}`}
            className={`${bioBodyClass} transition hover:text-white`}
          >
            {EMAIL}
          </a>
        </div>
        <div className="space-y-2">
          <p className={sectionLabelClass}>Socials</p>
          <div className="mt-14 flex gap-6 text-[15px] text-white/50">
            {contactSocials.map((social) => (
              <Link
                key={social.label}
                className="transition hover:text-white"
                href={social.url}
                rel="noreferrer"
                target="_blank"
              >
                {social.label}
              </Link>
            ))}
          </div>
        </div>
        <p className="mt-24 text-[11px] tracking-[0.35em] uppercase text-white/35">
          Born in Ireland · Made a home in NYC
        </p>
      </div>
    </section>
  );
}
