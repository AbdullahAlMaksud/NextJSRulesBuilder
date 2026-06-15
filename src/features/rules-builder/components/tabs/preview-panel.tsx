"use client";

import { FileText } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";

export default function PreviewPanel({
  fileName,
  markdown,
}: {
  fileName: string;
  markdown: string;
}) {
  return (
    <GlassPanel className="flex min-h-[520px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[color:var(--theme-border)] px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--theme-muted)]">
          <FileText size={14} className="text-[color:var(--theme-accent)]" />
          {fileName}
        </div>
        <span className="font-mono text-[11px] text-[color:var(--theme-muted)]">{markdown.split("\n").length} lines</span>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto bg-[color:var(--theme-preview-bg)] p-4 font-mono text-[12px] leading-6 text-[color:var(--theme-preview-text)]">
        {markdown}
      </pre>
    </GlassPanel>
  );
}
