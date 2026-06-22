"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import * as React from "react";
import type { LucideIcon } from "lucide-react";

import type { RulesConfig } from "@/shared/types/rules";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type UpdateRulesConfig = <K extends keyof RulesConfig>(section: K, value: Partial<RulesConfig[K]>) => void;

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[color:var(--theme-muted)]">
      {label}
      {children}
    </label>
  );
}

export function TextInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-10 w-full rounded-md border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)] px-3 py-2 text-sm normal-case tracking-normal text-[color:var(--theme-text)] outline-none transition-colors placeholder:text-[color:var(--theme-muted)] focus:border-[color:var(--theme-accent)] focus:ring-1 focus:ring-[color:var(--theme-accent)]"
    />
  );
}

export function SelectInput({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (event: { target: { value: string } }) => void;
  children: React.ReactNode;
}) {
  const options = React.useMemo(() => {
    return React.Children.toArray(children)
      .map((child) => {
        if (React.isValidElement(child) && child.type === "option") {
          const props = child.props as { value?: string | number; children?: React.ReactNode };
          return {
            value: String(props.value ?? ""),
            label: String(props.children || ""),
          };
        }
        return null;
      })
      .filter(Boolean) as Array<{ value: string; label: string }>;
  }, [children]);

  const activeOption = options.find((opt) => opt.value === value);

  return (
    <Select value={value} onValueChange={(val) => onChange({ target: { value: val } })}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select...">
          {activeOption?.label || ""}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt.value} value={opt.value}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function NumberInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="number"
      className="h-10 w-full rounded-md border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)] px-3 py-2 text-sm normal-case tracking-normal text-[color:var(--theme-text)] outline-none transition-colors placeholder:text-[color:var(--theme-muted)] focus:border-[color:var(--theme-accent)] focus:ring-1 focus:ring-[color:var(--theme-accent)]"
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
      className="flex items-center justify-between gap-4 rounded-md border border-[color:var(--theme-border)] bg-[color:var(--theme-bg)] px-4 py-2.5 text-left text-sm text-[color:var(--theme-text)] transition-colors hover:bg-black/5 dark:hover:bg-white/5"
    >
      <span>{label}</span>
      <span
        className={[
          "relative h-5 w-9 rounded-full transition-colors duration-200",
          checked ? "bg-[color:var(--theme-accent)]" : "bg-zinc-200 dark:bg-zinc-700",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-[3px] left-[3px] h-3.5 w-3.5 rounded-full bg-white shadow-sm transition-transform duration-200",
            checked ? "translate-x-4" : "translate-x-0",
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
              "rounded-md border px-3 py-1.5 text-sm transition-colors",
              active
                ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)] text-[color:var(--theme-accent-fg)]"
                : "border-[color:var(--theme-border)] bg-[color:var(--theme-bg)] text-[color:var(--theme-muted)] hover:text-[color:var(--theme-text)] hover:bg-black/5 dark:hover:bg-white/5",
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
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.25em] text-[color:var(--theme-accent)]">{kicker}</p>
        <h2 className="text-lg font-bold tracking-tight text-[color:var(--theme-text)]">{title}</h2>
      </div>
      <div className="grid h-8 w-8 place-items-center rounded-md border border-[color:var(--theme-border)] bg-[color:var(--theme-accent-light)] text-[color:var(--theme-accent)]">
        <Icon size={15} />
      </div>
    </div>
  );
}
