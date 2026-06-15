"use client";

import { FolderTree } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import FolderTreeEditor from "@/features/rules-builder/components/folder-tree-editor";

import { SectionTitle } from "./tab-controls";

export default function StructureTab() {
  return (
    <GlassPanel className="h-[680px] overflow-hidden">
      <div className="border-b border-[color:var(--theme-border)] px-5 py-4">
        <SectionTitle icon={FolderTree} kicker="src/app/main" title="Folder Structure Editor" />
      </div>
      <div className="h-[calc(100%-112px)]">
        <FolderTreeEditor />
      </div>
    </GlassPanel>
  );
}
