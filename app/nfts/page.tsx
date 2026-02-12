import Image from "next/image";
import { NftGallery } from "@/components/nft-gallery";
import { getNFTs } from "@/lib/alchemy";
import marketLinkRulesRaw from "@/content/nft-market-links.json";

export const dynamic = "force-dynamic";

type MarketLinkRule = {
  title?: string;
  contract?: string;
  tokenId?: string;
  url: string;
};

const marketLinkRules = marketLinkRulesRaw as MarketLinkRule[];

function normalizeValue(value: string): string {
  return value.trim().toLowerCase();
}

function resolveMarketUrl(nft: { name: string; contract: string; tokenId: string }): string {
  const matchedRule = marketLinkRules.find((rule) => {
    if (!rule.url || !rule.url.trim()) {
      return false;
    }

    if (rule.title && normalizeValue(rule.title) !== normalizeValue(nft.name)) {
      return false;
    }

    if (rule.contract && normalizeValue(rule.contract) !== normalizeValue(nft.contract)) {
      return false;
    }

    if (rule.tokenId && normalizeValue(rule.tokenId) !== normalizeValue(nft.tokenId)) {
      return false;
    }

    return true;
  });

  if (matchedRule?.url) {
    return matchedRule.url.trim();
  }

  return `https://opensea.io/assets/ethereum/${nft.contract}/${nft.tokenId}`;
}

export default async function NFTsPage() {
  const nfts = await getNFTs();
  const galleryItems = nfts.map((nft) => {
    return {
      contract: nft.contract,
      tokenId: nft.tokenId,
      name: nft.name,
      imageUrl: nft.image,
      marketUrl: resolveMarketUrl(nft)
    };
  });

  return (
    <main className="bg-black text-white">
      <section className="relative h-screen w-full overflow-hidden">
        <Image alt="Works On-Chain" className="object-cover" fill priority src="/images/nft-hero.jpg" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
      </section>

      <section className="pb-16 pt-24 text-center">
        <h1 className="text-[11px] font-light uppercase tracking-[0.55em] text-white/50 md:text-xs">Works On-Chain</h1>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/50">1/1s and Editions</p>
        <p className="mb-16 mt-6 text-center text-xs uppercase tracking-[0.3em] text-white/50">
          Selected works released as digital originals
        </p>
        <a
          className="inline-flex items-center justify-center border border-white/40 px-6 py-2 text-[11px] uppercase tracking-[0.25em] text-white/85 transition-colors duration-300 hover:border-white/70 hover:text-white"
          href="https://www.transient.xyz/mint/in-bsy-we-trust"
          rel="noreferrer"
          target="_blank"
        >
          Mint Live
        </a>
      </section>

      {galleryItems.length === 0 ? (
        <section className="mx-auto mt-20 max-w-[1600px] px-6 pb-28 text-center text-sm text-white/65 md:px-12">
          NFT feed is temporarily unavailable. Refresh in a moment.
        </section>
      ) : (
        <NftGallery items={galleryItems} />
      )}
    </main>
  );
}
