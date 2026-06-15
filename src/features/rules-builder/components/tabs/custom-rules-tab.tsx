"use client";

import { Hash, Plus, Trash2 } from "lucide-react";

import { GlassPanel } from "@/components/ui/glass-panel";

import { SectionTitle, TextInput } from "./tab-controls";

export default function CustomRulesTab({
  customRules,
  newRule,
  addRule,
  removeRule,
  setNewRule,
}: {
  customRules: string[];
  newRule: string;
  addRule: () => void;
  removeRule: (index: number) => void;
  setNewRule: (value: string) => void;
}) {
  return (
    <GlassPanel className="p-5">
      <SectionTitle icon={Hash} kicker="project" title="Custom Rules" />
      <div className="rounded-2xl border border-[color:var(--theme-border)] bg-black/20 p-3">
        <div className="flex gap-2">
          <TextInput
            value={newRule}
            onChange={(event) => setNewRule(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") addRule();
            }}
            placeholder="Add a custom rule"
          />
          <button
            type="button"
            onClick={addRule}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--theme-accent)] text-[color:var(--theme-accent-fg)] transition brightness-100 hover:brightness-110"
          >
            <Plus size={17} />
          </button>
        </div>
        <div className="mt-3 grid gap-2">
          {customRules.map((rule, index) => (
            <div key={`${rule}-${index}`} className="flex items-center gap-2 rounded-xl border border-[color:var(--theme-border)] bg-white/[0.04] px-3 py-2 text-sm text-[color:var(--theme-text)]">
              <span className="flex-1">{rule}</span>
              <button type="button" onClick={() => removeRule(index)} className="text-white/35 transition hover:text-red-300">
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </GlassPanel>
  );
}
