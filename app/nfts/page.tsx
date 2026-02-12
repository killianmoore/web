import Image from "next/image";
import { NftGallery } from "@/components/nft-gallery";
import { getNFTs } from "@/lib/alchemy";

export const dynamic = "force-dynamic";

export default async function NFTsPage() {
  const nfts = await getNFTs();
  const galleryItems = nfts.map((nft) => ({
    contract: nft.contract,
    tokenId: nft.tokenId,
    name: nft.name,
    imageUrl: nft.image
  }));

  return (
    <main className="bg-black text-white">
      <section className="relative h-screen w-full overflow-hidden">
        <Image alt="Works On-Chain" className="object-cover" fill priority src="/images/nft-hero.jpg" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black" />
      </section>

      <section className="pb-16 pt-24 text-center">
        <h1 className="text-[11px] font-light uppercase tracking-[0.55em] text-white/55 md:text-xs">Works On-Chain</h1>
        <p className="mt-6 text-xs uppercase tracking-[0.3em] text-white/30">1/1s and Editions</p>
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
