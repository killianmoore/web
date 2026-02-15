"use client";

import { useEffect } from "react";

export function PDLabBodyGuard() {
  useEffect(() => {
    document.body.classList.add("pd-lab-active");
    return () => {
      document.body.classList.remove("pd-lab-active");
    };
  }, []);

  return null;
}
