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
  const socials = site.socials.filter((social) => ["Instagram", "Foundation", "SuperRare"].includes(social.label));

  return (
    <section className="mx-auto w-[min(94vw,1160px)] py-28">
      <div className="space-y-5">
        <p className={sectionLabelClass}>Contact</p>
        <h1 className="font-serif text-4xl leading-tight text-white sm:text-5xl">Commissions & Collaborations</h1>
        <p className={bioBodyClass}>
          If the work resonates, feel free to reach out.
        </p>
        <p className={bioBodyClass}>
          Available for commissioned projects, print releases, and select digital works.
        </p>
        <div className="mt-10 space-y-3">
          <p className={sectionLabelClass}>Direct Inquiries</p>
          <a
            href={`mailto:${EMAIL}`}
            className={`${bioBodyClass} transition hover:text-white`}
          >
            {EMAIL}
          </a>
        </div>
        <div className="space-y-2">
          <p className={sectionLabelClass}>Socials</p>
          <div className="mt-3 flex flex-col gap-2">
            {socials.map((social) => (
              <div key={social.label}>
                <Link
                  className={`${bioBodyClass} underline underline-offset-4 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
                  href={social.url}
                  rel="noreferrer"
                  target="_blank"
                >
                  {social.label}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
