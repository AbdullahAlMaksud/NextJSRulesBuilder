"use client";

import { useState, useEffect, useCallback } from "react";
import dynamic from "next/dynamic";
import Lenis from "lenis";
import { useTheme, ThemeProvider } from "./store/themeStore";
import { defaultConfig, type RulesConfig } from "./store/rulesStore";
import { defaultPackagesConfig, type PackagesConfig } from "./store/packagesStore";
import { generateMarkdown } from "./lib/generateMarkdown";
import {
  FolderOpen, Code2, Type, Package, TestTube, Zap, Plus, Trash2,
  Download, Copy, Check, Settings, FileText, Layers, AlignLeft,
  ExternalLink, Hash,
} from "lucide-react";

const AnimatedBackground = dynamic(() => import("./components/AnimatedBackground"), { ssr: false });
const FloatingSidebar    = dynamic(() => import("./components/FloatingSidebar"),    { ssr: false });
const FolderTreeEditor   = dynamic(() => import("./components/FolderTreeEditor"),   { ssr: false, loading: () => (
  <div className="flex-1 flex items-center justify-center text-sm opacity-40">Loading editor…</div>
)});
const PackagesTab = dynamic(() => import("./components/PackagesTab"), { ssr: false, loading: () => (
  <div className="py-8 text-center text-sm opacity-40">Loading…</div>
)});

// ─── Themed primitives ────────────────────────────────────────────────────────

function useT() { return useTheme().theme; }

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  const t = useT();
  return (
    <button onClick={() => onChange(!checked)}
      className="relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none"
      style={{ background: checked ? t.accent : t.surfaceBorder }}>
      <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[18px]" : "translate-x-[3px]"}`} />
    </button>
  );
}

function Sel({ value, options, onChange, className = "" }: {
  value: string; options: { value: string; label: string }[]; onChange: (v: any) => void; className?: string;
}) {
  const t = useT();
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={`h-8 rounded-lg px-2.5 text-sm cursor-pointer focus:outline-none focus:ring-2 transition-colors ${className}`}
      style={{
        background: t.bgSecondary, color: t.text,
        border: `1px solid ${t.surfaceBorder}`,
        // @ts-ignore
        "--tw-ring-color": t.accent + "40",
      }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function Inp({ value, onChange, placeholder, className = "" }: {
  value: string; onChange: (v: string) => void; placeholder?: string; className?: string;
}) {
  const t = useT();
  return (
    <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      className={`h-8 rounded-lg px-2.5 text-sm placeholder:opacity-40 focus:outline-none focus:ring-2 transition-colors ${className}`}
      style={{
        background: t.bgSecondary, color: t.text,
        border: `1px solid ${t.surfaceBorder}`,
      }} />
  );
}

function NumInp({ value, onChange, min, max, step = 1 }: {
  value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number;
}) {
  const t = useT();
  return (
    <input type="number" value={value} min={min} max={max} step={step} onChange={(e) => onChange(Number(e.target.value))}
      className="h-8 w-20 rounded-lg px-2.5 text-sm focus:outline-none focus:ring-2 transition-colors"
      style={{ background: t.bgSecondary, color: t.text, border: `1px solid ${t.surfaceBorder}` }} />
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  const t = useT();
  return (
    <div className="flex items-center justify-between gap-4 py-2.5" style={{ borderBottom: `1px solid ${t.surfaceBorder}20` }}>
      <div className="min-w-0">
        <span className="text-sm font-medium" style={{ color: t.text }}>{label}</span>
        {hint && <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>{hint}</p>}
      </div>
      <div className="flex items-center gap-2 shrink-0">{children}</div>
    </div>
  );
}

function Card({ title, icon, children, right }: { title: string; icon: React.ReactNode; children: React.ReactNode; right?: React.ReactNode }) {
  const t = useT();
  return (
    <div className="rounded-2xl overflow-hidden transition-all" style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}` }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5" style={{ borderBottom: `1px solid ${t.surfaceBorder}`, background: t.bgSecondary + "60" }}>
        <span style={{ color: t.accent }}>{icon}</span>
        <span className="text-sm font-semibold" style={{ color: t.text }}>{title}</span>
        {right && <div className="ml-auto">{right}</div>}
      </div>
      <div className="px-5">{children}</div>
    </div>
  );
}

function Chips({ values, options, onChange }: { values: string[]; options: { value: string; label: string }[]; onChange: (v: any[]) => void }) {
  const t = useT();
  const toggle = (v: string) => onChange(values.includes(v) ? values.filter((x) => x !== v) : [...values, v]);
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o.value} onClick={() => toggle(o.value)}
          className="px-2.5 py-1 rounded-lg text-xs font-medium border transition-all"
          style={{
            background: values.includes(o.value) ? t.accent + "20" : t.bgSecondary,
            border: `1px solid ${values.includes(o.value) ? t.accent + "60" : t.surfaceBorder}`,
            color: values.includes(o.value) ? t.accent : t.textMuted,
          }}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

const NAMING_OPTS = [
  { value: "camelCase", label: "camelCase" },
  { value: "PascalCase", label: "PascalCase" },
  { value: "kebab-case", label: "kebab-case" },
  { value: "snake_case", label: "snake_case" },
  { value: "SCREAMING_SNAKE", label: "SCREAMING_SNAKE" },
];

// ─── Main App (inner, uses theme) ─────────────────────────────────────────────

function AppInner() {
  const { theme } = useTheme();
  const t = theme;

  const [config, setConfig]         = useState<RulesConfig>(defaultConfig);
  const [packagesConfig, setPkg]    = useState<PackagesConfig>(defaultPackagesConfig);
  const [activeTab, setActiveTab]   = useState("meta");
  const [copied, setCopied]         = useState(false);
  const [previewMode, setPreviewMode] = useState<"split" | "preview">("split");
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const lenis = new Lenis({ autoRaf: true });
    return () => lenis.destroy();
  }, []);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", handler);
    return () => document.removeEventListener("fullscreenchange", handler);
  }, []);

  const markdown = generateMarkdown(config, packagesConfig);

  const upd = useCallback(<K extends keyof RulesConfig>(section: K, value: Partial<RulesConfig[K]>) => {
    setConfig((prev) => ({ ...prev, [section]: { ...(prev[section] as object), ...value } }));
  }, []);

  const copy = async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const dl = () => {
    const names: Record<string, string> = {
      claude: "CLAUDE.md", cursor: ".cursorrules",
      copilot: "copilot-instructions.md", generic: "PROJECT_RULES.md",
    };
    const blob = new Blob([markdown], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = names[config.meta.targetAgent];
    a.click();
  };

  const isStructureTab = activeTab === "folders";

  return (
    <div className="min-h-screen relative" style={{ color: t.text }}>
      {/* Background */}
      <AnimatedBackground />

      {/* Floating Sidebar */}
      <FloatingSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCopy={copy}
        onExport={dl}
        copied={copied}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />

      {/* Main content */}
      <div
        className={`relative z-10 mx-auto px-6 py-6 flex gap-6 ${isStructureTab ? "h-screen overflow-hidden" : "min-h-screen"}`}
        style={{ maxWidth: 1400, paddingLeft: 80 }}
      >
        {/* Config Panel */}
        {previewMode !== "preview" && (
          <div className={`flex-1 min-w-0 ${isStructureTab ? "h-full overflow-hidden" : ""}`}>
            {/* Tab title */}
            <div className="mb-4">
              <h2 className="text-lg font-bold" style={{ color: t.text }}>
                {["meta","folders","packages","naming","code","components","imports","testing","performance","custom"].includes(activeTab)
                  ? { meta:"Project", folders:"Folder Structure", packages:"Packages", naming:"Naming", code:"Code Style", components:"Components", imports:"Imports", testing:"Testing", performance:"Performance", custom:"Custom Rules" }[activeTab]
                  : "Settings"}
              </h2>
              <p className="text-xs mt-0.5" style={{ color: t.textMuted }}>
                Hover the left edge to open sidebar
              </p>
            </div>

            <div className={isStructureTab ? "h-[calc(100%-5rem)] overflow-hidden" : "space-y-4"}>
              {activeTab === "meta"        && <MetaTab config={config} upd={upd} />}
              {activeTab === "folders"     && <StructureTab />}
              {activeTab === "packages"    && <PackagesTab config={packagesConfig} onChange={setPkg} />}
              {activeTab === "naming"      && <NamingTab config={config} upd={upd} />}
              {activeTab === "code"        && <CodeTab config={config} upd={upd} />}
              {activeTab === "components"  && <ComponentsTab config={config} upd={upd} />}
              {activeTab === "imports"     && <ImportsTab config={config} upd={upd} />}
              {activeTab === "testing"     && <TestingTab config={config} upd={upd} />}
              {activeTab === "performance" && <PerfTab config={config} upd={upd} />}
              {activeTab === "custom"      && <CustomTab config={config} upd={upd} />}
            </div>
          </div>
        )}

        {/* Preview Panel */}
        <div className={`${previewMode === "preview" ? "flex-1" : "w-[460px] shrink-0"} sticky top-6 h-[calc(100vh-48px)]`}>
          <div className="h-full flex flex-col rounded-2xl overflow-hidden border shadow-2xl"
            style={{ background: t.previewBg, borderColor: t.surfaceBorder + "60" }}>
            <div className="flex items-center justify-between px-4 py-3 shrink-0"
              style={{ borderBottom: `1px solid ${t.surfaceBorder}40`, background: t.previewBg }}>
              <div className="flex items-center gap-2">
                <FileText size={14} style={{ color: t.accent }} />
                <span className="text-xs font-mono" style={{ color: t.textMuted }}>
                  {config.meta.targetAgent === "claude" ? "CLAUDE.md" : config.meta.targetAgent === "cursor" ? ".cursorrules" : config.meta.targetAgent === "copilot" ? "copilot-instructions.md" : "PROJECT_RULES.md"}
                </span>
              </div>
              <span className="text-xs font-mono" style={{ color: t.textMuted + "80" }}>
                {markdown.split("\n").length} lines
              </span>
            </div>
            <div className="flex-1 overflow-y-auto" data-lenis-prevent>
              <pre className="p-4 text-xs leading-relaxed whitespace-pre-wrap break-words"
                style={{ color: t.previewText, fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>
                {markdown}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Root with Provider ───────────────────────────────────────────────────────

export default function App() {
  return (
    <ThemeProvider>
      <AppInner />
    </ThemeProvider>
  );
}

// ─── Structure Tab ────────────────────────────────────────────────────────────

function StructureTab() {
  const t = useT();
  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden"
      style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}` }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 shrink-0"
        style={{ borderBottom: `1px solid ${t.surfaceBorder}`, background: t.bgSecondary + "60" }}>
        <span style={{ color: t.accent }}><FolderOpen size={15} /></span>
        <span className="text-sm font-semibold" style={{ color: t.text }}>Folder Structure Editor</span>
        <span className="ml-2 px-2 py-0.5 rounded-full text-[11px] font-medium"
          style={{ background: t.accent + "20", color: t.accent, border: `1px solid ${t.accent}40` }}>
          Visual
        </span>
      </div>
      <div className="flex-1 overflow-hidden">
        <FolderTreeEditor />
      </div>
    </div>
  );
}

// ─── Tab types ────────────────────────────────────────────────────────────────

type UpdFn = <K extends keyof RulesConfig>(s: K, v: Partial<RulesConfig[K]>) => void;

// ─── Meta Tab ─────────────────────────────────────────────────────────────────

function MetaTab({ config, upd }: { config: RulesConfig; upd: UpdFn }) {
  const t = useT();
  return (
    <div className="space-y-4">
      <Card title="Project Info" icon={<Settings size={15} />}>
        <Row label="Project name">
          <Inp value={config.meta.name} onChange={(v) => upd("meta", { name: v })} placeholder="My Next.js App" className="w-52" />
        </Row>
        <Row label="Description">
          <Inp value={config.meta.description} onChange={(v) => upd("meta", { description: v })} placeholder="Coding standards..." className="w-52" />
        </Row>
        <Row label="Version">
          <Inp value={config.meta.version} onChange={(v) => upd("meta", { version: v })} className="w-24" />
        </Row>
      </Card>
      <Card title="Target Agent" icon={<ExternalLink size={15} />}>
        <div className="py-4 space-y-3">
          <p className="text-xs" style={{ color: t.textMuted }}>Controls the output filename and header format.</p>
          <div className="grid grid-cols-2 gap-2">
            {([
              { value: "claude",  label: "Claude (Anthropic)", file: "CLAUDE.md" },
              { value: "cursor",  label: "Cursor IDE",         file: ".cursorrules" },
              { value: "copilot", label: "GitHub Copilot",     file: "copilot-instructions.md" },
              { value: "generic", label: "Generic / Other",    file: "PROJECT_RULES.md" },
            ] as const).map((a) => (
              <button key={a.value} onClick={() => upd("meta", { targetAgent: a.value })}
                className="flex flex-col items-start px-4 py-3 rounded-xl text-left transition-all"
                style={{
                  background: config.meta.targetAgent === a.value ? t.accent + "20" : t.bgSecondary,
                  border: `1px solid ${config.meta.targetAgent === a.value ? t.accent + "60" : t.surfaceBorder}`,
                }}>
                <span className="text-sm font-semibold" style={{ color: t.text }}>{a.label}</span>
                <span className="text-xs font-mono mt-0.5" style={{ color: t.textMuted }}>{a.file}</span>
              </button>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}

function NamingTab({ config, upd }: { config: RulesConfig; upd: UpdFn }) {
  return (
    <div className="space-y-4">
      <Card title="Naming Conventions" icon={<Type size={15} />}>
        <Row label="Components"><Sel value={config.naming.components} onChange={(v) => upd("naming", { components: v })} options={NAMING_OPTS} /></Row>
        <Row label="Files"><Sel value={config.naming.files} onChange={(v) => upd("naming", { files: v })} options={NAMING_OPTS} /></Row>
        <Row label="Functions"><Sel value={config.naming.functions} onChange={(v) => upd("naming", { functions: v })} options={NAMING_OPTS} /></Row>
        <Row label="Variables"><Sel value={config.naming.variables} onChange={(v) => upd("naming", { variables: v })} options={NAMING_OPTS} /></Row>
        <Row label="Constants"><Sel value={config.naming.constants} onChange={(v) => upd("naming", { constants: v })} options={NAMING_OPTS} /></Row>
        <Row label="CSS Classes"><Sel value={config.naming.cssClasses} onChange={(v) => upd("naming", { cssClasses: v })} options={NAMING_OPTS} /></Row>
        <Row label="API Routes"><Sel value={config.naming.apiRoutes} onChange={(v) => upd("naming", { apiRoutes: v })} options={NAMING_OPTS} /></Row>
      </Card>
      <Card title="Prefixes" icon={<Type size={15} />}>
        <Row label="Hook prefix" hint="e.g. use → useUserData"><Inp value={config.naming.hooks} onChange={(v) => upd("naming", { hooks: v })} className="w-24" /></Row>
        <Row label="Interface prefix" hint="Empty = no prefix"><Inp value={config.naming.interfaces} onChange={(v) => upd("naming", { interfaces: v })} placeholder="I" className="w-24" /></Row>
        <Row label="Type prefix" hint="Empty = no prefix"><Inp value={config.naming.types} onChange={(v) => upd("naming", { types: v })} placeholder="T" className="w-24" /></Row>
      </Card>
    </div>
  );
}

function CodeTab({ config, upd }: { config: RulesConfig; upd: UpdFn }) {
  return (
    <div className="space-y-4">
      <Card title="Language & Formatting" icon={<Code2 size={15} />}>
        <Row label="Language"><Sel value={config.codeStyle.language} onChange={(v) => upd("codeStyle", { language: v })} options={[{ value: "typescript", label: "TypeScript" }, { value: "javascript", label: "JavaScript" }]} /></Row>
        <Row label="Strict mode"><Toggle checked={config.codeStyle.strictMode} onChange={(v) => upd("codeStyle", { strictMode: v })} /></Row>
        <Row label="Semicolons"><Toggle checked={config.codeStyle.semicolons} onChange={(v) => upd("codeStyle", { semicolons: v })} /></Row>
        <Row label="Quotes"><Sel value={config.codeStyle.quotes} onChange={(v) => upd("codeStyle", { quotes: v })} options={[{ value: "single", label: "Single '" }, { value: "double", label: 'Double "' }]} /></Row>
        <Row label="Indent size"><Sel value={String(config.codeStyle.indentSize)} onChange={(v) => upd("codeStyle", { indentSize: Number(v) as 2|4 })} options={[{ value: "2", label: "2 spaces" }, { value: "4", label: "4 spaces" }]} /></Row>
        <Row label="Max line length"><NumInp value={config.codeStyle.maxLineLength} onChange={(v) => upd("codeStyle", { maxLineLength: v })} min={60} max={200} step={10} /></Row>
        <Row label="Trailing commas"><Sel value={config.codeStyle.trailingCommas} onChange={(v) => upd("codeStyle", { trailingCommas: v })} options={[{ value: "none", label: "None" }, { value: "es5", label: "ES5" }, { value: "all", label: "All" }]} /></Row>
      </Card>
      <Card title="Code Patterns" icon={<AlignLeft size={15} />}>
        <Row label="Arrow functions"><Toggle checked={config.codeStyle.arrowFunctions} onChange={(v) => upd("codeStyle", { arrowFunctions: v })} /></Row>
        <Row label="const over let"><Toggle checked={config.codeStyle.constOverLet} onChange={(v) => upd("codeStyle", { constOverLet: v })} /></Row>
        <Row label="Named exports"><Toggle checked={config.codeStyle.namedExports} onChange={(v) => upd("codeStyle", { namedExports: v })} /></Row>
        <Row label="Default exports"><Toggle checked={config.codeStyle.defaultExports} onChange={(v) => upd("codeStyle", { defaultExports: v })} /></Row>
        <Row label="async/await"><Toggle checked={config.codeStyle.asyncAwait} onChange={(v) => upd("codeStyle", { asyncAwait: v })} /></Row>
        <Row label="Early return"><Toggle checked={config.codeStyle.earlyReturn} onChange={(v) => upd("codeStyle", { earlyReturn: v })} /></Row>
      </Card>
    </div>
  );
}

function ComponentsTab({ config, upd }: { config: RulesConfig; upd: UpdFn }) {
  return (
    <div className="space-y-4">
      <Card title="Component Rules" icon={<Layers size={15} />}>
        <Row label="Functional only"><Toggle checked={config.components.preferFunctional} onChange={(v) => upd("components", { preferFunctional: v })} /></Row>
        <Row label="Props interface"><Toggle checked={config.components.propsInterface} onChange={(v) => upd("components", { propsInterface: v })} /></Row>
        <Row label="Destructure props"><Toggle checked={config.components.propsDestructuring} onChange={(v) => upd("components", { propsDestructuring: v })} /></Row>
        <Row label="Server Components"><Toggle checked={config.components.serverComponents} onChange={(v) => upd("components", { serverComponents: v })} /></Row>
        <Row label="'use client' placement"><Sel value={config.components.clientDirective} onChange={(v) => upd("components", { clientDirective: v })} options={[{ value: "minimal", label: "Minimal (only when needed)" }, { value: "top", label: "Top of every file" }]} /></Row>
        <Row label="Memoization"><Sel value={config.components.memoization} onChange={(v) => upd("components", { memoization: v })} options={[{ value: "none", label: "None" }, { value: "selective", label: "Selective" }, { value: "always", label: "Always" }]} /></Row>
      </Card>
      <Card title="State Management" icon={<Layers size={15} />}>
        <div className="py-3">
          <Chips values={config.components.stateManagement} onChange={(v) => upd("components", { stateManagement: v })}
            options={[{ value: "useState", label: "useState" }, { value: "useReducer", label: "useReducer" }, { value: "zustand", label: "Zustand" }, { value: "jotai", label: "Jotai" }, { value: "redux", label: "Redux Toolkit" }]} />
        </div>
      </Card>
      <Card title="Styling" icon={<Code2 size={15} />}>
        <div className="py-3">
          <Chips values={config.components.styling} onChange={(v) => upd("components", { styling: v })}
            options={[{ value: "tailwind", label: "Tailwind CSS" }, { value: "css-modules", label: "CSS Modules" }, { value: "styled-components", label: "styled-components" }, { value: "emotion", label: "Emotion" }]} />
        </div>
      </Card>
    </div>
  );
}

function ImportsTab({ config, upd }: { config: RulesConfig; upd: UpdFn }) {
  const [newGroup, setNewGroup] = useState("");
  return (
    <div className="space-y-4">
      <Card title="Import Settings" icon={<Package size={15} />}>
        <Row label="Absolute imports"><Toggle checked={config.imports.absoluteImports} onChange={(v) => upd("imports", { absoluteImports: v })} /></Row>
        <Row label="Import alias"><Inp value={config.imports.importAlias} onChange={(v) => upd("imports", { importAlias: v })} className="w-20" /></Row>
        <Row label="Group imports"><Toggle checked={config.imports.grouping} onChange={(v) => upd("imports", { grouping: v })} /></Row>
        <Row label="No barrel index.ts"><Toggle checked={config.imports.noDefaultFromIndex} onChange={(v) => upd("imports", { noDefaultFromIndex: v })} /></Row>
      </Card>
      {config.imports.grouping && (
        <Card title="Import Order Groups" icon={<AlignLeft size={15} />}>
          <div className="py-3 space-y-1.5">
            {config.imports.orderGroups.map((g, i) => {
              const t = useT();
              return (
                <div key={g} className="flex items-center gap-2 group">
                  <span className="text-xs w-4 font-mono" style={{ color: t.textMuted }}>{i + 1}.</span>
                  <div className="flex-1 px-2.5 py-1.5 rounded-lg text-xs font-mono" style={{ background: t.bgSecondary, color: t.text, border: `1px solid ${t.surfaceBorder}` }}>{g}</div>
                  <button onClick={() => upd("imports", { orderGroups: config.imports.orderGroups.filter((x) => x !== g) })} className="opacity-0 group-hover:opacity-100 p-1 rounded" style={{ color: t.textMuted }}>
                    <Trash2 size={12} />
                  </button>
                </div>
              );
            })}
            <div className="flex gap-2 pt-1">
              <Inp value={newGroup} onChange={setNewGroup} placeholder="group name" className="flex-1" />
              <button onClick={() => { if (newGroup.trim()) { upd("imports", { orderGroups: [...config.imports.orderGroups, newGroup.trim()] }); setNewGroup(""); } }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
                style={{ background: useT().accent, color: "#fff" }}>
                <Plus size={13} /> Add
              </button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}

function TestingTab({ config, upd }: { config: RulesConfig; upd: UpdFn }) {
  return (
    <div className="space-y-4">
      <Card title="Testing" icon={<TestTube size={15} />}>
        <Row label="Enable testing rules"><Toggle checked={config.testing.enabled} onChange={(v) => upd("testing", { enabled: v })} /></Row>
        {config.testing.enabled && (
          <>
            <Row label="Framework"><Sel value={config.testing.framework} onChange={(v) => upd("testing", { framework: v })} options={[{ value: "jest", label: "Jest" }, { value: "vitest", label: "Vitest" }, { value: "none", label: "None" }]} /></Row>
            <Row label="@testing-library/react"><Toggle checked={config.testing.testingLibrary} onChange={(v) => upd("testing", { testingLibrary: v })} /></Row>
            <Row label="Coverage threshold (%)"><NumInp value={config.testing.coverageThreshold} onChange={(v) => upd("testing", { coverageThreshold: v })} min={0} max={100} /></Row>
            <Row label="Test file location"><Sel value={config.testing.testFilePattern} onChange={(v) => upd("testing", { testFilePattern: v })} options={[{ value: "co-located", label: "Co-located" }, { value: "__tests__", label: "__tests__/" }]} /></Row>
            <Row label="Naming pattern"><Sel value={config.testing.namingPattern} onChange={(v) => upd("testing", { namingPattern: v })} options={[{ value: "*.test.ts", label: "*.test.ts" }, { value: "*.spec.ts", label: "*.spec.ts" }]} /></Row>
          </>
        )}
      </Card>
    </div>
  );
}

function PerfTab({ config, upd }: { config: RulesConfig; upd: UpdFn }) {
  return (
    <div className="space-y-4">
      <Card title="Performance Rules" icon={<Zap size={15} />}>
        <Row label="Image priority"><Toggle checked={config.performance.imagePriority} onChange={(v) => upd("performance", { imagePriority: v })} /></Row>
        <Row label="Lazy loading"><Toggle checked={config.performance.lazyLoading} onChange={(v) => upd("performance", { lazyLoading: v })} /></Row>
        <Row label="Dynamic imports"><Toggle checked={config.performance.dynamicImports} onChange={(v) => upd("performance", { dynamicImports: v })} /></Row>
        <Row label="Cache strategies"><Toggle checked={config.performance.cacheStrategies} onChange={(v) => upd("performance", { cacheStrategies: v })} /></Row>
        <Row label="Bundle analysis"><Toggle checked={config.performance.bundleAnalysis} onChange={(v) => upd("performance", { bundleAnalysis: v })} /></Row>
      </Card>
    </div>
  );
}

function CustomTab({ config, upd }: { config: RulesConfig; upd: UpdFn }) {
  const [newRule, setNewRule] = useState("");
  const t = useT();
  const add = () => { if (newRule.trim()) { upd("customRules", [...config.customRules, newRule.trim()]); setNewRule(""); } };
  const EXAMPLES = [
    "Never use `any` as a TypeScript type — use `unknown` or proper types",
    "All API calls go through a service layer, never fetch directly in components",
    "Comment non-obvious business logic with a //WHY: prefix",
    "Every new feature must include a Storybook story",
  ];
  return (
    <div className="space-y-4">
      <Card title="Custom Rules" icon={<Hash size={15} />}>
        <div className="py-3 space-y-3">
          {config.customRules.map((rule, i) => (
            <div key={i} className="flex gap-2 items-start group">
              <span className="text-xs font-mono mt-2 shrink-0" style={{ color: t.textMuted }}>–</span>
              <textarea value={rule} onChange={(e) => { const r = [...config.customRules]; r[i] = e.target.value; upd("customRules", r); }}
                rows={2} className="flex-1 rounded-xl px-2.5 py-1.5 text-sm resize-none focus:outline-none focus:ring-2 transition-colors"
                style={{ background: t.bgSecondary, color: t.text, border: `1px solid ${t.surfaceBorder}` }} />
              <button onClick={() => upd("customRules", config.customRules.filter((_, j) => j !== i))} className="mt-1 opacity-0 group-hover:opacity-100 p-1 rounded" style={{ color: t.textMuted }}>
                <Trash2 size={14} />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <textarea value={newRule} onChange={(e) => setNewRule(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); add(); } }}
              placeholder="Add a rule… (Enter to save)" rows={2}
              className="flex-1 rounded-xl px-2.5 py-1.5 text-sm resize-none placeholder:opacity-40 focus:outline-none focus:ring-2 transition-colors"
              style={{ background: t.bgSecondary, color: t.text, border: `1px solid ${t.surfaceBorder}` }} />
            <button onClick={add} className="self-end flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium transition-colors"
              style={{ background: t.accent, color: "#fff" }}>
              <Plus size={13} /> Add
            </button>
          </div>
        </div>
      </Card>
      <div className="rounded-2xl p-4" style={{ border: `1px dashed ${t.surfaceBorder}`, background: t.bgSecondary + "40" }}>
        <p className="text-xs font-semibold mb-2" style={{ color: t.text }}>💡 Quick-add examples</p>
        <ul className="space-y-1.5">
          {EXAMPLES.map((ex) => (
            <li key={ex} className="text-xs flex gap-2 items-start" style={{ color: t.textMuted }}>
              <button onClick={() => upd("customRules", [...config.customRules, ex])} style={{ color: t.accent }} className="shrink-0 mt-0.5">
                <Plus size={11} />
              </button>
              {ex}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
