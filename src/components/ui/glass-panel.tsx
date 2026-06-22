import type { ComponentPropsWithoutRef } from "react";

import { cn } from "@/shared/lib/utils";

export function GlassPanel({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cn(
        "relative overflow-hidden rounded-xl border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] shadow-[0_2px_8px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_8px_rgba(0,0,0,0.15)] transition-all",
        className
      )}
      {...props}
    />
  );
}
