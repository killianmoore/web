/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "ipfs.io" },
      { protocol: "https", hostname: "gateway.pinata.cloud" },
      { protocol: "https", hostname: "raw.seadn.io" },
      { protocol: "https", hostname: "i.seadn.io" },
      { protocol: "https", hostname: "i2c.seadn.io" },
      { protocol: "https", hostname: "cloudflare-ipfs.com" },
      { protocol: "https", hostname: "ipfs.infura.io" },
      { protocol: "https", hostname: "nft-cdn.alchemy.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "ipfs.pixura.io" },
      { protocol: "https", hostname: "alchemy.mypinata.cloud" },
      { protocol: "https", hostname: "arweave.net" }
    ]
  }
};

module.exports = nextConfig;
