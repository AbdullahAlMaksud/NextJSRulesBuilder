"use client";

import { FileText } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";

import { cn } from "@/shared/lib/utils";

export default function PreviewPanel({
  fileName,
  markdown,
  className,
}: {
  fileName: string;
  markdown: string;
  className?: string;
}) {
  return (
    <GlassPanel className={cn("flex flex-col overflow-hidden h-full", className)}>
      <div className="flex items-center justify-between border-b border-[color:var(--theme-border)] px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--theme-muted)]">
          <FileText size={14} className="text-[color:var(--theme-accent)]" />
          {fileName}
        </div>
        <span className="font-mono text-[11px] text-[color:var(--theme-muted)]">{markdown.split("\n").length} lines</span>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-all md:break-words bg-[color:var(--theme-preview-bg)] p-4 font-mono text-[12px] leading-6 text-[color:var(--theme-preview-text)]">
        {markdown}
      </pre>
    </GlassPanel>
  );
}
