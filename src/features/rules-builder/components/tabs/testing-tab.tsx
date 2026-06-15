"use client";

import { TestTube } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { RulesConfig } from "@/shared/types/rules";

import { Field, NumberInput, SectionTitle, SelectInput, Toggle, type UpdateRulesConfig } from "./tab-controls";

export default function TestingTab({
  config,
  update,
}: {
  config: RulesConfig;
  update: UpdateRulesConfig;
}) {
  return (
    <GlassPanel className="p-5">
      <SectionTitle icon={TestTube} kicker="quality" title="Testing Rules" />
      <div className="grid gap-3 md:grid-cols-2">
        <Toggle checked={config.testing.enabled} label="Include testing rules" onChange={(checked) => update("testing", { enabled: checked })} />
        <Toggle checked={config.testing.testingLibrary} label="Use Testing Library" onChange={(checked) => update("testing", { testingLibrary: checked })} />
        <Field label="Framework">
          <SelectInput value={config.testing.framework} onChange={(event) => update("testing", { framework: event.target.value as RulesConfig["testing"]["framework"] })}>
            <option value="vitest">Vitest</option>
            <option value="jest">Jest</option>
            <option value="none">None</option>
          </SelectInput>
        </Field>
        <Field label="Coverage threshold">
          <NumberInput value={config.testing.coverageThreshold} min={0} max={100} onChange={(event) => update("testing", { coverageThreshold: Number(event.target.value) })} />
        </Field>
        <Field label="Test location">
          <SelectInput value={config.testing.testFilePattern} onChange={(event) => update("testing", { testFilePattern: event.target.value as RulesConfig["testing"]["testFilePattern"] })}>
            <option value="__tests__">__tests__/</option>
            <option value="co-located">Co-located</option>
          </SelectInput>
        </Field>
        <Field label="Naming pattern">
          <SelectInput value={config.testing.namingPattern} onChange={(event) => update("testing", { namingPattern: event.target.value as RulesConfig["testing"]["namingPattern"] })}>
            <option value="*.test.ts">*.test.ts</option>
            <option value="*.spec.ts">*.spec.ts</option>
          </SelectInput>
        </Field>
      </div>
    </GlassPanel>
  );
}
