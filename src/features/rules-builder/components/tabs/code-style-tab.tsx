"use client";

import { Code2 } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { RulesConfig } from "@/shared/types/rules";

import { Field, NumberInput, SectionTitle, SelectInput, Toggle, type UpdateRulesConfig } from "./tab-controls";

export default function CodeStyleTab({
  config,
  update,
}: {
  config: RulesConfig;
  update: UpdateRulesConfig;
}) {
  return (
    <GlassPanel className="p-5">
      <SectionTitle icon={Code2} kicker="formatting" title="Code Style" />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Language">
          <SelectInput value={config.codeStyle.language} onChange={(event) => update("codeStyle", { language: event.target.value as RulesConfig["codeStyle"]["language"] })}>
            <option value="typescript">TypeScript</option>
            <option value="javascript">JavaScript</option>
          </SelectInput>
        </Field>
        <Field label="Quotes">
          <SelectInput value={config.codeStyle.quotes} onChange={(event) => update("codeStyle", { quotes: event.target.value as RulesConfig["codeStyle"]["quotes"] })}>
            <option value="double">Double</option>
            <option value="single">Single</option>
          </SelectInput>
        </Field>
        <Field label="Indent size">
          <SelectInput value={String(config.codeStyle.indentSize)} onChange={(event) => update("codeStyle", { indentSize: Number(event.target.value) as RulesConfig["codeStyle"]["indentSize"] })}>
            <option value="2">2 spaces</option>
            <option value="4">4 spaces</option>
          </SelectInput>
        </Field>
        <Field label="Max line length">
          <NumberInput value={config.codeStyle.maxLineLength} min={60} max={200} step={10} onChange={(event) => update("codeStyle", { maxLineLength: Number(event.target.value) })} />
        </Field>
        <Toggle checked={config.codeStyle.strictMode} label="TypeScript strict mode" onChange={(checked) => update("codeStyle", { strictMode: checked })} />
        <Toggle checked={config.codeStyle.semicolons} label="Use semicolons" onChange={(checked) => update("codeStyle", { semicolons: checked })} />
        <Toggle checked={config.codeStyle.constOverLet} label="Prefer const over let" onChange={(checked) => update("codeStyle", { constOverLet: checked })} />
        <Toggle checked={config.codeStyle.earlyReturn} label="Prefer early returns" onChange={(checked) => update("codeStyle", { earlyReturn: checked })} />
      </div>
    </GlassPanel>
  );
}
