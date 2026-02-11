"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

const navItems = [
  { href: "/photography", label: "Photography" },
  { href: "/nfts", label: "NFTs" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

export function FloatingNav() {
  const pathname = usePathname();
  const router = useRouter();
  const hideTimeoutRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const armHideTimer = useCallback((delay = 2800) => {
    if (hideTimeoutRef.current) {
      window.clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(false);
    }, delay);
  }, []);

  const reveal = useCallback(
    (delay?: number) => {
      setIsVisible(true);
      armHideTimer(delay);
    },
    [armHideTimer]
  );

  useEffect(() => {
    document.body.classList.remove("route-fade-black");
    navItems.forEach((item) => router.prefetch(item.href));

    const onMouseMove = () => {
      reveal();
    };

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (hideTimeoutRef.current) {
        window.clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [pathname, reveal]);

  function handlePhotographyClick(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    document.body.classList.add("route-fade-black");
    window.setTimeout(() => {
      router.push("/photography");
    }, 420);
  }

  function handleNavClick(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (href === pathname) {
      event.preventDefault();
      return;
    }

    if (href === "/photography") {
      handlePhotographyClick(event);
      return;
    }

    event.preventDefault();
    router.push(href);
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-40">
      <nav
        aria-label="Primary"
        className={`absolute right-6 top-10 flex items-center gap-4 text-[11px] uppercase tracking-wide transition-opacity duration-500 sm:gap-6 ${
          isVisible ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onMouseEnter={() => reveal(10_000)}
        onMouseLeave={() => armHideTimer()}
      >
        {navItems.map((item) => (
          <Link
            aria-current={
              pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`)) ? "page" : undefined
            }
            className={`text-white/70 transition-colors duration-300 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/90 ${
              pathname === item.href || (item.href !== "/" && pathname.startsWith(`${item.href}/`))
                ? "text-white/90"
                : ""
            }`}
            href={item.href}
            key={item.href}
            onClick={(event) => handleNavClick(event, item.href)}
            onFocus={() => reveal(5000)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
