import { Alchemy, Network } from "alchemy-sdk";

export type NftImageItem = {
  contract: string;
  tokenId: string;
  name: string;
  imageUrl: string;
};

const REVALIDATE_SECONDS = 60 * 60 * 12;
const MAX_PAGES_PER_CONTRACT = 2;
const MAX_TOTAL_ITEMS = 96;
const TOKEN_URI_FETCH_TIMEOUT_MS = 5_000;
const CONTRACT_CALL_TIMEOUT_MS = 8_000;
const EXCLUDED_TOKENS = new Set(["0x1d0a7c9db496ae18fc36f57b6be976de0a2230f6:1"]);
const NETWORKS = [Network.ETH_MAINNET, Network.BASE_MAINNET] as const;

function readAlchemyApiKey(): string {
  const raw = process.env.ALCHEMY_API_KEY ?? process.env.NEXT_PUBLIC_ALCHEMY_API_KEY ?? "";
  const trimmed = raw.trim();

  // Handle accidental quoted values in env providers.
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

function normalizeContract(address: string): string {
  return address.toLowerCase();
}

function normalizeTokenId(tokenId: string): string {
  if (tokenId.startsWith("0x")) {
    try {
      return BigInt(tokenId).toString(10);
    } catch {
      return tokenId;
    }
  }
  return tokenId;
}

function normalizeIpfsUrl(value: string): string {
  if (!value.startsWith("ipfs://")) {
    return value;
  }

  const raw = value.replace("ipfs://", "");
  const normalized = raw.startsWith("ipfs/") ? raw.slice(5) : raw;
  return `https://ipfs.io/ipfs/${normalized}`;
}

function normalizeImageUrl(value?: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return normalizeIpfsUrl(trimmed);
}

function pickFirstString(values: Array<unknown>): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

async function fetchImageFromTokenUri(tokenUriRaw?: string | null): Promise<string | null> {
  const normalizedTokenUri = normalizeImageUrl(tokenUriRaw);
  if (!normalizedTokenUri) {
    return null;
  }

  try {
    const response = await fetch(normalizedTokenUri, {
      signal: AbortSignal.timeout(TOKEN_URI_FETCH_TIMEOUT_MS),
      next: { revalidate: REVALIDATE_SECONDS }
    });

    if (!response.ok) {
      return null;
    }

    const data = (await response.json()) as { image?: string | null };
    return normalizeImageUrl(data.image);
  } catch {
    return null;
  }
}

async function fetchAllNftsForContract(alchemy: Alchemy, contractAddress: string) {
  const allNfts: unknown[] = [];
  let pageKey: string | undefined;
  let pageCount = 0;

  do {
    const response = await alchemy.nft.getNftsForContract(contractAddress, {
      pageKey,
      omitMetadata: false
    });

    allNfts.push(...response.nfts);
    pageKey = response.pageKey;
    pageCount += 1;
  } while (pageKey && pageCount < MAX_PAGES_PER_CONTRACT);

  return allNfts;
}

async function fetchAllNftsForContractWithTimeout(alchemy: Alchemy, contractAddress: string) {
  return Promise.race<unknown[]>([
    fetchAllNftsForContract(alchemy, contractAddress),
    new Promise<unknown[]>((resolve) => {
      setTimeout(() => resolve([]), CONTRACT_CALL_TIMEOUT_MS);
    })
  ]);
}

async function normalizeNft(nftInput: unknown): Promise<NftImageItem | null> {
  const nft = (nftInput ?? {}) as { [key: string]: unknown };
  const contract = normalizeContract(
    pickFirstString([
      (nft.contract as { address?: string } | undefined)?.address,
      nft.contractAddress
    ]) ?? ""
  );
  const tokenIdRaw = String(nft.tokenId ?? "");

  if (!contract || !tokenIdRaw) {
    return null;
  }

  const tokenId = normalizeTokenId(tokenIdRaw);
  const tokenUriRaw = pickFirstString([
    (nft.tokenUri as { raw?: string } | undefined)?.raw,
    nft.tokenUri,
    (nft.raw as { tokenUri?: string } | undefined)?.tokenUri
  ]);

  const imageCandidate = pickFirstString([
    // New Alchemy SDK v3+ shape
    (nft.image as { originalUrl?: string } | undefined)?.originalUrl,
    (nft.image as { cachedUrl?: string } | undefined)?.cachedUrl,
    (nft.raw as { metadata?: { image?: string } } | undefined)?.metadata?.image,
    // Older shape fallback
    (nft.media as Array<{ gateway?: string }> | undefined)?.[0]?.gateway,
    (nft.rawMetadata as { image?: string } | undefined)?.image
  ]);

  let imageUrl = normalizeImageUrl(imageCandidate);
  if (!imageUrl) {
    imageUrl = await fetchImageFromTokenUri(tokenUriRaw);
  }

  if (!imageUrl) {
    return null;
  }

  const nameRaw = typeof nft.name === "string" ? nft.name.trim() : "";
  const contractName = (nft.contract as { name?: string } | undefined)?.name;

  return {
    contract,
    tokenId,
    name: nameRaw || `${contractName || "Token"} #${tokenId}`,
    imageUrl
  };
}

export async function getNftsForContracts(addresses: string[]): Promise<NftImageItem[]> {
  return getNftsForContractsUncached(addresses);
}

async function getNftsForContractsUncached(addresses: string[]): Promise<NftImageItem[]> {
  const apiKey = readAlchemyApiKey();
  if (!apiKey) {
    console.warn("ALCHEMY_API_KEY is missing. NFT feed will be empty.");
    return [];
  }

  const networkResults = await Promise.all(
    NETWORKS.map(async (network) => {
      const alchemy = new Alchemy({
        apiKey,
        network
      });

      const results = await Promise.allSettled(
        addresses.map((address) => fetchAllNftsForContractWithTimeout(alchemy, address))
      );

      return results
        .filter((result): result is PromiseFulfilledResult<unknown[]> => result.status === "fulfilled")
        .flatMap((result) => result.value);
    })
  );

  const allNfts = networkResults.flat();

  const normalized = (await Promise.all(allNfts.map((nft) => normalizeNft(nft)))).filter(
    (item): item is NftImageItem => Boolean(item)
  );

  const unique = new Map<string, NftImageItem>();
  for (const item of normalized) {
    const key = `${item.contract}:${item.tokenId}`;
    if (EXCLUDED_TOKENS.has(key)) {
      continue;
    }
    unique.set(key, item);
    if (unique.size >= MAX_TOTAL_ITEMS) {
      break;
    }
  }

  return Array.from(unique.values());
}
