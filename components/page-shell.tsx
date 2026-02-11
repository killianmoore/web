"use client";

import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

export function PageShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    document.body.classList.remove("route-fade-black");
  }, [pathname]);

  return (
    <AnimatePresence mode="wait">
      <motion.main
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen"
        initial={{ opacity: 0, y: 10 }}
        key={pathname}
        transition={{ duration: 0.36, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.main>
    </AnimatePresence>
  );
}
