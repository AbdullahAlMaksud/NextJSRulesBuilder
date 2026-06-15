"use client";

import { Layers } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { RulesConfig } from "@/shared/types/rules";

import { Chips, Field, SectionTitle, SelectInput, Toggle, type UpdateRulesConfig } from "./tab-controls";

export default function ComponentsTab({
  config,
  update,
}: {
  config: RulesConfig;
  update: UpdateRulesConfig;
}) {
  return (
    <GlassPanel className="p-5">
      <SectionTitle icon={Layers} kicker="react" title="Component Rules" />
      <div className="grid gap-3 md:grid-cols-2">
        <Toggle checked={config.components.preferFunctional} label="Functional components only" onChange={(checked) => update("components", { preferFunctional: checked })} />
        <Toggle checked={config.components.propsInterface} label="Require props interfaces" onChange={(checked) => update("components", { propsInterface: checked })} />
        <Toggle checked={config.components.propsDestructuring} label="Destructure props" onChange={(checked) => update("components", { propsDestructuring: checked })} />
        <Toggle checked={config.components.serverComponents} label="Prefer Server Components" onChange={(checked) => update("components", { serverComponents: checked })} />
        <Field label="Client directive">
          <SelectInput value={config.components.clientDirective} onChange={(event) => update("components", { clientDirective: event.target.value as RulesConfig["components"]["clientDirective"] })}>
            <option value="minimal">Minimal only</option>
            <option value="top">Top of every client file</option>
          </SelectInput>
        </Field>
        <Field label="Memoization">
          <SelectInput value={config.components.memoization} onChange={(event) => update("components", { memoization: event.target.value as RulesConfig["components"]["memoization"] })}>
            <option value="none">None</option>
            <option value="selective">Selective</option>
            <option value="always">Always</option>
          </SelectInput>
        </Field>
      </div>
      <div className="mt-5 grid gap-4">
        <Field label="State management">
          <Chips
            values={config.components.stateManagement}
            onChange={(values) => update("components", { stateManagement: values as RulesConfig["components"]["stateManagement"] })}
            options={[
              { value: "useState", label: "useState" },
              { value: "useReducer", label: "useReducer" },
              { value: "zustand", label: "Zustand" },
              { value: "jotai", label: "Jotai" },
              { value: "redux", label: "Redux Toolkit" },
            ]}
          />
        </Field>
        <Field label="Styling">
          <Chips
            values={config.components.styling}
            onChange={(values) => update("components", { styling: values as RulesConfig["components"]["styling"] })}
            options={[
              { value: "tailwind", label: "Tailwind" },
              { value: "css-modules", label: "CSS Modules" },
              { value: "styled-components", label: "styled-components" },
              { value: "emotion", label: "Emotion" },
            ]}
          />
        </Field>
      </div>
    </GlassPanel>
  );
}
