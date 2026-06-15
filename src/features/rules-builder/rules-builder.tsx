"use client";

import { useMemo, useState, type CSSProperties } from "react";
import {
  Check,
  Code2,
  Copy,
  Download,
  EyeOff,
  FileText,
  FolderTree,
  Hash,
  Layers,
  Package,
  Plus,
  Settings,
  TestTube,
  Trash2,
  Type,
  Zap,
  type LucideIcon,
} from "lucide-react";

import AnimatedBackground from "@/components/common/animated-background";
import Footer from "@/components/common/footer";
import Navbar from "@/components/common/navbar";
import Sidebar, { type PreviewMode, type SidebarTab } from "@/components/common/sidebar";
import { GlassPanel } from "@/components/ui/glass-panel";
import FolderTreeEditor from "@/features/rules-builder/components/folder-tree-editor";
import PackagesTab from "@/features/rules-builder/components/packages-tab";
import { ThemeProvider, useTheme } from "@/shared/hooks/use-theme";
import { generateMarkdown } from "@/shared/lib/generate-markdown";
import { defaultPackagesConfig, type PackagesConfig } from "@/shared/types/packages";
import { defaultConfig, type RulesConfig } from "@/shared/types/rules";

const initialConfig: RulesConfig = {
  ...defaultConfig,
  meta: {
    ...defaultConfig.meta,
    name: "my-project",
    description: "Clean Next.js agent rules with a src-first architecture",
  },
  folderStructure: {
    ...defaultConfig.folderStructure,
    useSrcDir: true,
    customFolders: ["components", "features", "shared"],
  },
};

const targetFiles: Record<RulesConfig["meta"]["targetAgent"], string> = {
  claude: "CLAUDE.md",
  cursor: ".cursorrules",
  copilot: "copilot-instructions.md",
  generic: "PROJECT_RULES.md",
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-xs font-medium uppercase tracking-[0.18em] text-[color:var(--theme-muted)]">
      {label}
      {children}
    </label>
  );
}

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-11 rounded-xl border border-[color:var(--theme-border)] bg-black/25 px-3 text-sm normal-case tracking-normal text-[color:var(--theme-text)] outline-none transition placeholder:text-[color:var(--theme-muted)] focus:border-[color:var(--theme-accent)] focus:bg-black/35"
    />
  );
}

function SelectInput(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="h-11 rounded-xl border border-[color:var(--theme-border)] bg-black/25 px-3 text-sm normal-case tracking-normal text-[color:var(--theme-text)] outline-none transition focus:border-[color:var(--theme-accent)]"
    />
  );
}

function NumberInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      type="number"
      className="h-11 rounded-xl border border-[color:var(--theme-border)] bg-black/25 px-3 text-sm normal-case tracking-normal text-[color:var(--theme-text)] outline-none transition placeholder:text-[color:var(--theme-muted)] focus:border-[color:var(--theme-accent)] focus:bg-black/35"
    />
  );
}

function Toggle({
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

function Chips({
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

function SectionTitle({
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

function PreviewPanel({
  fileName,
  markdown,
}: {
  fileName: string;
  markdown: string;
}) {
  return (
    <GlassPanel className="flex min-h-[520px] flex-col overflow-hidden">
      <div className="flex items-center justify-between border-b border-[color:var(--theme-border)] px-4 py-3">
        <div className="flex items-center gap-2 text-xs font-medium text-[color:var(--theme-muted)]">
          <FileText size={14} className="text-[color:var(--theme-accent)]" />
          {fileName}
        </div>
        <span className="font-mono text-[11px] text-[color:var(--theme-muted)]">{markdown.split("\n").length} lines</span>
      </div>
      <pre className="min-h-0 flex-1 overflow-auto bg-[color:var(--theme-preview-bg)] p-4 font-mono text-[12px] leading-6 text-[color:var(--theme-preview-text)]">
        {markdown}
      </pre>
    </GlassPanel>
  );
}

function RulesBuilderInner() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");
  const [config, setConfig] = useState<RulesConfig>(initialConfig);
  const [packagesConfig, setPackagesConfig] = useState<PackagesConfig>(defaultPackagesConfig);
  const [newRule, setNewRule] = useState("");
  const [newImportGroup, setNewImportGroup] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("both");

  const fileName = targetFiles[config.meta.targetAgent];
  const markdown = useMemo(() => generateMarkdown(config, packagesConfig), [config, packagesConfig]);
  const showConfigPanel = previewMode !== "only";
  const showPreviewPanel = previewMode !== "hidden";
  const isSplitPreview = previewMode === "both";
  const themeVars = {
    "--theme-bg": theme.bg,
    "--theme-surface": theme.surface,
    "--theme-border": theme.surfaceBorder,
    "--theme-text": theme.text,
    "--theme-muted": theme.textMuted,
    "--theme-accent": theme.accent,
    "--theme-accent-light": theme.accentLight,
    "--theme-accent-fg": theme.accentFg,
    "--theme-preview-bg": theme.previewBg,
    "--theme-preview-text": theme.previewText,
    "--theme-shadow": theme.shadow,
    color: theme.text,
  } as CSSProperties;

  const update = <K extends keyof RulesConfig>(section: K, value: Partial<RulesConfig[K]>) => {
    setConfig((current) => ({
      ...current,
      [section]: { ...(current[section] as object), ...value },
    }));
  };

  const copyMarkdown = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  };

  const exportFile = () => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  const cyclePreviewMode = () => {
    setPreviewMode((current) => {
      if (current === "both") return "only";
      if (current === "only") return "hidden";
      return "both";
    });
  };

  const addRule = () => {
    const rule = newRule.trim();
    if (!rule) return;
    setConfig((current) => ({ ...current, customRules: [...current.customRules, rule] }));
    setNewRule("");
  };

  const removeRule = (index: number) => {
    setConfig((current) => ({
      ...current,
      customRules: current.customRules.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const mainPanel = (() => {
    if (activeTab === "structure") {
      return (
        <GlassPanel className="h-[680px] overflow-hidden">
          <div className="border-b border-[color:var(--theme-border)] px-5 py-4">
            <SectionTitle icon={FolderTree} kicker="src/app/main" title="Folder Structure Editor" />
          </div>
          <div className="h-[calc(100%-112px)]">
            <FolderTreeEditor />
          </div>
        </GlassPanel>
      );
    }

    if (activeTab === "packages") {
      return (
        <GlassPanel className="overflow-hidden p-5">
          <SectionTitle icon={Package} kicker="dependencies" title="Package Rules" />
          <PackagesTab config={packagesConfig} onChange={setPackagesConfig} />
        </GlassPanel>
      );
    }

    if (activeTab === "naming") {
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
              <SelectInput
                value={config.naming.files}
                onChange={(event) => update("naming", { files: event.target.value as RulesConfig["naming"]["files"] })}
              >
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

    if (activeTab === "code") {
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
              <SelectInput
                value={config.codeStyle.quotes}
                onChange={(event) => update("codeStyle", { quotes: event.target.value as RulesConfig["codeStyle"]["quotes"] })}
              >
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

    if (activeTab === "components") {
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

    if (activeTab === "imports") {
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
                  if (event.key === "Enter" && newImportGroup.trim()) {
                    update("imports", { orderGroups: [...config.imports.orderGroups, newImportGroup.trim()] });
                    setNewImportGroup("");
                  }
                }}
                placeholder="Add import group"
              />
              <button
                type="button"
                onClick={() => {
                  if (!newImportGroup.trim()) return;
                  update("imports", { orderGroups: [...config.imports.orderGroups, newImportGroup.trim()] });
                  setNewImportGroup("");
                }}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[color:var(--theme-accent)] text-[color:var(--theme-accent-fg)] transition brightness-100 hover:brightness-110"
              >
                <Plus size={17} />
              </button>
            </div>
          </div>
        </GlassPanel>
      );
    }

    if (activeTab === "testing") {
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

    if (activeTab === "performance") {
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

    if (activeTab === "custom") {
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
              {config.customRules.map((rule, index) => (
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
  })();

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden text-[color:var(--theme-text)]" style={themeVars}>
      <AnimatedBackground />
      <Sidebar
        activeTab={activeTab}
        copied={copied}
        onCopy={copyMarkdown}
        onExport={exportFile}
        onCyclePreview={cyclePreviewMode}
        previewMode={previewMode}
        setActiveTab={setActiveTab}
      />
      <Navbar />

      <div
        className={[
          "relative z-10 mx-auto grid w-full gap-5 px-5 py-8 md:px-8",
          isSplitPreview ? "max-w-7xl lg:grid-cols-[minmax(0,1fr)_440px]" : "max-w-4xl",
        ].join(" ")}
      >
        <section className={["mx-auto w-full max-w-2xl text-center", isSplitPreview ? "lg:col-span-2" : ""].join(" ")}>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.44em] text-[color:var(--theme-accent)]">Focus</p>
          <h1 className="font-mono text-3xl font-medium tracking-wide text-[color:var(--theme-text)] md:text-4xl">rules builder</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[color:var(--theme-muted)]">
            Clean `src` architecture, glass UI, and export-ready instructions for Claude, Cursor, Copilot, or any coding agent.
          </p>
        </section>

        {showConfigPanel && <div className="min-w-0">{mainPanel}</div>}

        {showPreviewPanel && (
          <div className={isSplitPreview ? "hidden lg:block" : "min-w-0"}>
            <PreviewPanel fileName={fileName} markdown={markdown} />
          </div>
        )}
      </div>

      <div className="fixed bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-3 rounded-full border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] px-3 py-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] backdrop-blur-2xl md:hidden">
        <button onClick={copyMarkdown} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[color:var(--theme-text)]">
          {copied ? <Check size={17} className="text-[color:var(--theme-accent)]" /> : <Copy size={17} />}
        </button>
        <button onClick={exportFile} className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--theme-accent)] text-[color:var(--theme-accent-fg)]">
          <Download size={17} />
        </button>
        <button onClick={cyclePreviewMode} className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[color:var(--theme-text)]">
          {previewMode === "both" ? <EyeOff size={17} /> : previewMode === "only" ? <FileText size={17} /> : <FileText size={17} />}
        </button>
      </div>

      <Footer />
    </main>
  );
}

export default function RulesBuilder() {
  return (
    <ThemeProvider>
      <RulesBuilderInner />
    </ThemeProvider>
  );
}
