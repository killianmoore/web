import type { Metadata } from "next";
import { getSiteContent } from "@/lib/content";

const EMAIL = "killian@killianmoore.com";

export const metadata: Metadata = {
  title: "Contact",
  description: "Contact Killian Moore for commissions, editions, and collaborations."
};

export default async function ContactPage() {
  const site = await getSiteContent();
  const getSocialUrl = (label: string) => site.socials.find((social) => social.label === label)?.url ?? "#";

  return (
    <div className="min-h-screen bg-black px-6 text-white">
      <div className="mx-auto max-w-[760px] pb-40 pt-40">
        <p className="text-center text-[11px] tracking-[0.35em] uppercase text-white/50">
          Contact
        </p>

        <h1 className="mt-8 text-center font-serif text-4xl font-medium tracking-[-0.015em] sm:text-5xl">
          Commissions & Collaborations
        </h1>

        <div className="mx-auto mt-14 max-w-[600px] text-left">
          <p className="text-center text-[18px] leading-[1.85] text-white/80 sm:text-[19px]">
            If the work resonates, feel free to reach out.
          </p>

          <p className="mt-6 text-[18px] leading-[1.85] text-white/80 sm:text-[19px]">
            Available for commissioned projects, print releases, and select 1/1 digital works.
          </p>

          <p className="mt-14 text-center text-[11px] tracking-[0.35em] uppercase text-white/60 underline underline-offset-4 decoration-white/35">
            Direct Inquiries
          </p>

          <a
            href={`mailto:${EMAIL}`}
            className="mt-3 block text-center text-[17px] text-white/90 transition hover:text-white"
          >
            {EMAIL}
          </a>

          <div className="mt-14 flex justify-center gap-8 text-[16px] text-white/70">
            <a href={getSocialUrl("X")} className="transition hover:text-white" rel="noreferrer" target="_blank">X</a>
            <a href={getSocialUrl("Instagram")} className="transition hover:text-white" rel="noreferrer" target="_blank">Instagram</a>
            <a href={getSocialUrl("SuperRare")} className="transition hover:text-white" rel="noreferrer" target="_blank">SuperRare</a>
            <a href={getSocialUrl("Foundation")} className="transition hover:text-white" rel="noreferrer" target="_blank">Foundation</a>
          </div>

        </div>

        <p className="pt-8 text-center text-[15px] text-white/60 sm:pt-10 sm:text-[16px]">
          Born in Ireland. Made a home in New York City.
        </p>
      </div>
    </div>
  );
}
