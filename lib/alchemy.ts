import { nftContracts } from "@/content/nftContracts";
import { getNftCollections } from "@/lib/content";
import { getNftsForContracts } from "@/lib/nfts-alchemy";

export type AlchemyNftItem = {
  contract: string;
  tokenId: string;
  name: string;
  image: string;
};

async function getFallbackNFTs(): Promise<AlchemyNftItem[]> {
  const collections = await getNftCollections();
  return collections.flatMap((collection) =>
    collection.items.map((item) => ({
      contract: collection.contractAddress,
      tokenId: item.tokenId,
      name: item.name,
      image: item.image
    }))
  );
}

export async function getNFTs(): Promise<AlchemyNftItem[]> {
  const items = await Promise.race([
    getNftsForContracts([...nftContracts]),
    new Promise<Awaited<ReturnType<typeof getNftsForContracts>>>((resolve) => {
      setTimeout(() => resolve([]), 9_000);
    })
  ]);

  if (items.length > 0) {
    return items.map((item) => ({
      contract: item.contract,
      tokenId: item.tokenId,
      name: item.name,
      image: item.imageUrl
    }));
  }

  return getFallbackNFTs();
}
