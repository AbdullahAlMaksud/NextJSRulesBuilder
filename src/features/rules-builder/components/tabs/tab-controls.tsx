"use client";

import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import type { LucideIcon } from "lucide-react";

import type { RulesConfig } from "@/shared/types/rules";

export type UpdateRulesConfig = <K extends keyof RulesConfig>(section: K, value: Partial<RulesConfig[K]>) => void;

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--theme-muted)]">
      {label}
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 rounded-xl border border-[color:var(--theme-border)] bg-black/25 px-3 text-sm normal-case tracking-normal text-[color:var(--theme-text)] outline-none transition placeholder:text-[color:var(--theme-muted)] focus:border-[color:var(--theme-accent)] focus:bg-black/35"
    />
  );
}

export function SelectInput(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-11 rounded-xl border border-[color:var(--theme-border)] bg-black/25 px-3 text-sm normal-case tracking-normal text-[color:var(--theme-text)] outline-none transition focus:border-[color:var(--theme-accent)]"
    />
  );
}

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="number"
      className="h-11 rounded-xl border border-[color:var(--theme-border)] bg-black/25 px-3 text-sm normal-case tracking-normal text-[color:var(--theme-text)] outline-none transition placeholder:text-[color:var(--theme-muted)] focus:border-[color:var(--theme-accent)] focus:bg-black/35"
    />
  );
}

export function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center justify-between gap-4 rounded-xl border border-[color:var(--theme-border)] bg-black/20 px-3 py-2.5 text-left text-sm text-[color:var(--theme-text)] transition hover:bg-white/[0.06]"
    >
      <span>{label}</span>
      <span
        className={[
          "relative h-5 w-9 rounded-full border transition",
          checked ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)]" : "border-[color:var(--theme-border)] bg-white/5",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-white transition",
            checked ? "left-4" : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

export function Chips({
  options,
  values,
  onChange,
}: {
  options: Array<{ value: string; label: string }>;
  values: string[];
  onChange: (values: string[]) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = values.includes(option.value);
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onChange(active ? values.filter((value) => value !== option.value) : [...values, option.value]);
            }}
            className={[
              "rounded-xl border px-3 py-2 text-sm transition",
              active
                ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent-light)] text-[color:var(--theme-accent)]"
                : "border-[color:var(--theme-border)] bg-black/20 text-[color:var(--theme-muted)] hover:text-[color:var(--theme-text)]",
            ].join(" ")}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function SectionTitle({
  icon: Icon,
  kicker,
  title,
}: {
  icon: LucideIcon;
  kicker: string;
  title: string;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-4">
      <div>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--theme-accent)]">{kicker}</p>
        <h2 className="text-xl font-semibold text-[color:var(--theme-text)]">{title}</h2>
      </div>
      <div className="grid h-10 w-10 place-items-center rounded-full border border-[color:var(--theme-border)] bg-[color:var(--theme-accent-light)] text-[color:var(--theme-accent)]">
        <Icon size={18} />
      </div>
    </div>
  );
}
