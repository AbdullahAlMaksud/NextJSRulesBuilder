"use client";

import { ReactLenis } from "lenis/react";
import type { ReactNode } from "react";

export default function LenisProvider({ children }: { children: ReactNode }) {
  return (
    <ReactLenis
      root
      options={{
        duration: 1.05,
        smoothWheel: true,
        syncTouch: false,
        wheelMultiplier: 0.85,
      }}
    >
      {children}
    </ReactLenis>
  );
}
