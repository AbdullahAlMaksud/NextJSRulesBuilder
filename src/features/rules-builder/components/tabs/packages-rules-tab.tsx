"use client";

import { Package } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import PackagesTab from "@/features/rules-builder/components/packages-tab";
import type { PackagesConfig } from "@/shared/types/packages";

import { SectionTitle } from "./tab-controls";

export default function PackagesRulesTab({
  config,
  onChange,
}: {
  config: PackagesConfig;
  onChange: (config: PackagesConfig) => void;
}) {
  return (
    <GlassPanel className="overflow-hidden p-5">
      <SectionTitle icon={Package} kicker="dependencies" title="Package Rules" />
      <PackagesTab config={config} onChange={onChange} />
    </GlassPanel>
  );
}
