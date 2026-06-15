"use client";

import { Package, Plus, Trash2 } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";
import type { RulesConfig } from "@/shared/types/rules";

import { Field, SectionTitle, TextInput, Toggle, type UpdateRulesConfig } from "./tab-controls";

export default function ImportsTab({
  config,
  newImportGroup,
  setNewImportGroup,
  update,
}: {
  config: RulesConfig;
  newImportGroup: string;
  setNewImportGroup: (value: string) => void;
  update: UpdateRulesConfig;
}) {
  const addImportGroup = () => {
    if (!newImportGroup.trim()) return;
    update("imports", { orderGroups: [...config.imports.orderGroups, newImportGroup.trim()] });
    setNewImportGroup("");
  };

  return (
    <GlassPanel className="p-5">
      <SectionTitle icon={Package} kicker="modules" title="Import Rules" />
      <div className="grid gap-3 md:grid-cols-2">
        <Toggle checked={config.imports.absoluteImports} label="Use absolute imports" onChange={(checked) => update("imports", { absoluteImports: checked })} />
        <Toggle checked={config.imports.grouping} label="Group imports" onChange={(checked) => update("imports", { grouping: checked })} />
        <Toggle checked={config.imports.noDefaultFromIndex} label="Avoid barrel index exports" onChange={(checked) => update("imports", { noDefaultFromIndex: checked })} />
        <Field label="Import alias">
          <TextInput value={config.imports.importAlias} onChange={(event) => update("imports", { importAlias: event.target.value })} />
        </Field>
      </div>
      <div className="mt-5 rounded-2xl border border-[color:var(--theme-border)] bg-black/20 p-3">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--theme-muted)]">Import order</p>
        <div className="grid gap-2">
          {config.imports.orderGroups.map((group, index) => (
            <div key={`${group}-${index}`} className="flex items-center gap-2 rounded-xl border border-[color:var(--theme-border)] bg-white/[0.04] px-3 py-2 text-sm text-[color:var(--theme-text)]">
              <span className="font-mono text-[color:var(--theme-muted)]">{index + 1}.</span>
              <span className="flex-1">{group}</span>
              <button type="button" onClick={() => update("imports", { orderGroups: config.imports.orderGroups.filter((item) => item !== group) })} className="text-white/35 transition hover:text-red-300">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <TextInput
            value={newImportGroup}
            onChange={(event) => setNewImportGroup(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addImportGroup();
            }}
            placeholder="Add import group"
          />
          <button
            type="button"
            onClick={addImportGroup}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--theme-accent)] text-[color:var(--theme-accent-fg)] transition brightness-100 hover:brightness-110"
          >
            <Plus size={17} />
          </button>
        </div>
      </div>
    </GlassPanel>
  );
}
