"use client";

import { Zap } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { RulesConfig } from "@/shared/types/rules";

import { SectionTitle, Toggle, type UpdateRulesConfig } from "./tab-controls";

export default function PerformanceTab({
  config,
  update,
}: {
  config: RulesConfig;
  update: UpdateRulesConfig;
}) {
  return (
    <GlassPanel className="p-5">
      <SectionTitle icon={Zap} kicker="speed" title="Performance Rules" />
      <div className="grid gap-3 md:grid-cols-2">
        <Toggle checked={config.performance.imagePriority} label="Prioritize above-fold images" onChange={(checked) => update("performance", { imagePriority: checked })} />
        <Toggle checked={config.performance.lazyLoading} label="Lazy load below-fold assets" onChange={(checked) => update("performance", { lazyLoading: checked })} />
        <Toggle checked={config.performance.dynamicImports} label="Use dynamic imports" onChange={(checked) => update("performance", { dynamicImports: checked })} />
        <Toggle checked={config.performance.cacheStrategies} label="Include cache strategy guidance" onChange={(checked) => update("performance", { cacheStrategies: checked })} />
        <Toggle checked={config.performance.bundleAnalysis} label="Require bundle analysis" onChange={(checked) => update("performance", { bundleAnalysis: checked })} />
      </div>
    </GlassPanel>
  );
}
