import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

export function GlassPanel({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-2xl border border-[color:var(--theme-border)] bg-[linear-gradient(145deg,rgba(255,255,255,0.13),rgba(255,255,255,0.045)_42%,rgba(255,255,255,0.025))] shadow-[0_24px_80px_rgba(0,0,0,0.36),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-[radial-gradient(circle_at_18%_0%,rgba(255,255,255,0.13),transparent_34%)]",
        className
      )}
      {...props}
    />
  );
}
