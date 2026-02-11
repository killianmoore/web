import type { Metadata } from "next";
import { Cormorant_Garamond, Sora } from "next/font/google";
import "./globals.css";
import { FloatingNav } from "@/components/floating-nav";
import { PageShell } from "@/components/page-shell";
import { SiteFooter } from "@/components/site-footer";

const sora = Sora({
  subsets: ["latin"],
  variable: "--font-sora"
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-cormorant"
});

export const metadata: Metadata = {
  metadataBase: new URL("https://killianmoore.studio"),
  title: {
    default: "Killian Moore | Photography + NFTs",
    template: "%s | Killian Moore"
  },
  description: "Always-dark, photo-forward portfolio and NFT archive for photographer Killian Moore.",
  openGraph: {
    title: "Killian Moore | Photography + NFTs",
    description: "Always-dark, photo-forward portfolio and NFT archive for photographer Killian Moore.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "Killian Moore | Photography + NFTs",
    description: "Always-dark, photo-forward portfolio and NFT archive for photographer Killian Moore."
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html className="dark" lang="en">
      <body className={`${sora.variable} ${cormorant.variable} bg-black font-sans text-white antialiased`}>
        <div aria-hidden="true" className="route-fade-overlay" />
        <FloatingNav />
        <PageShell>{children}</PageShell>
        <SiteFooter />
      </body>
    </html>
  );
}
