"use client";

import { Type } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { RulesConfig } from "@/shared/types/rules";

import { Field, SectionTitle, SelectInput, TextInput, type UpdateRulesConfig } from "./tab-controls";

export default function NamingTab({
  config,
  update,
}: {
  config: RulesConfig;
  update: UpdateRulesConfig;
}) {
  return (
    <GlassPanel className="p-5">
      <SectionTitle icon={Type} kicker="conventions" title="Naming Rules" />
      <div className="grid gap-3 md:grid-cols-2">
        <Field label="Components">
          <SelectInput value={config.naming.components} onChange={(event) => update("naming", { components: event.target.value as RulesConfig["naming"]["components"] })}>
            <option value="PascalCase">PascalCase</option>
            <option value="camelCase">camelCase</option>
            <option value="kebab-case">kebab-case</option>
            <option value="snake_case">snake_case</option>
          </SelectInput>
        </Field>
        <Field label="Files">
          <SelectInput value={config.naming.files} onChange={(event) => update("naming", { files: event.target.value as RulesConfig["naming"]["files"] })}>
            <option value="kebab-case">kebab-case</option>
            <option value="PascalCase">PascalCase</option>
            <option value="camelCase">camelCase</option>
            <option value="snake_case">snake_case</option>
          </SelectInput>
        </Field>
        <Field label="Functions">
          <SelectInput value={config.naming.functions} onChange={(event) => update("naming", { functions: event.target.value as RulesConfig["naming"]["functions"] })}>
            <option value="camelCase">camelCase</option>
            <option value="PascalCase">PascalCase</option>
            <option value="snake_case">snake_case</option>
          </SelectInput>
        </Field>
        <Field label="Constants">
          <SelectInput value={config.naming.constants} onChange={(event) => update("naming", { constants: event.target.value as RulesConfig["naming"]["constants"] })}>
            <option value="SCREAMING_SNAKE">SCREAMING_SNAKE</option>
            <option value="camelCase">camelCase</option>
            <option value="PascalCase">PascalCase</option>
          </SelectInput>
        </Field>
        <Field label="Hook prefix">
          <TextInput value={config.naming.hooks} onChange={(event) => update("naming", { hooks: event.target.value })} />
        </Field>
        <Field label="Interface prefix">
          <TextInput value={config.naming.interfaces} onChange={(event) => update("naming", { interfaces: event.target.value })} />
        </Field>
      </div>
    </GlassPanel>
  );
}
