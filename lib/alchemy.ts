import { nftContracts } from "@/content/nftContracts";
import { getNftsForContracts } from "@/lib/nfts-alchemy";

export type AlchemyNftItem = {
  contract: string;
  tokenId: string;
  name: string;
  image: string;
};

export async function getNFTs(): Promise<AlchemyNftItem[]> {
  const items = await Promise.race([
    getNftsForContracts([...nftContracts]),
    new Promise<Awaited<ReturnType<typeof getNftsForContracts>>>((resolve) => {
      setTimeout(() => resolve([]), 9_000);
    })
  ]);

  return items.map((item) => ({
    contract: item.contract,
    tokenId: item.tokenId,
    name: item.name,
    image: item.imageUrl
  }));
}
