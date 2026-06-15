"use client";

import { Settings } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { RulesConfig } from "@/shared/types/rules";

import { Field, SectionTitle, SelectInput, TextInput, Toggle, type UpdateRulesConfig } from "./tab-controls";

export default function OverviewTab({
  config,
  update,
}: {
  config: RulesConfig;
  update: UpdateRulesConfig;
}) {
  return (
    <GlassPanel className="p-5">
      <SectionTitle icon={Settings} kicker="focus" title="Rules Builder" />
      <div className="grid gap-4">
        <Field label="Project name">
          <TextInput value={config.meta.name} onChange={(event) => update("meta", { name: event.target.value })} />
        </Field>
        <Field label="Description">
          <TextInput value={config.meta.description} onChange={(event) => update("meta", { description: event.target.value })} />
        </Field>
        <Field label="Target agent">
          <SelectInput
            value={config.meta.targetAgent}
            onChange={(event) => update("meta", { targetAgent: event.target.value as RulesConfig["meta"]["targetAgent"] })}
          >
            <option value="claude">Claude</option>
            <option value="cursor">Cursor</option>
            <option value="copilot">GitHub Copilot</option>
            <option value="generic">Generic</option>
          </SelectInput>
        </Field>
        <div className="grid gap-3 md:grid-cols-2">
          <Toggle checked={config.folderStructure.useSrcDir} label="Use src directory" onChange={(checked) => update("folderStructure", { useSrcDir: checked })} />
          <Toggle checked={config.folderStructure.useAppRouter} label="Use App Router" onChange={(checked) => update("folderStructure", { useAppRouter: checked })} />
        </div>
      </div>
    </GlassPanel>
  );
}
