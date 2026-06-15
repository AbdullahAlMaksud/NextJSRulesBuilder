"use client";

import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { Check, Copy, Download, EyeOff, FileText } from "lucide-react";

import AnimatedBackground from "@/components/common/animated-background";
import Footer from "@/components/common/footer";
import Sidebar, {
  type PreviewMode,
  type SidebarTab,
} from "@/components/common/sidebar";
import {
  CodeStyleTab,
  ComponentsTab,
  CustomRulesTab,
  ImportsTab,
  NamingTab,
  OverviewTab,
  PackagesRulesTab,
  PerformanceTab,
  PreviewPanel,
  StructureTab,
  TestingTab,
} from "@/features/rules-builder/components/tabs";
import { ThemeProvider, useTheme } from "@/shared/hooks/use-theme";
import { generateMarkdown } from "@/shared/lib/generate-markdown";
import {
  defaultPackagesConfig,
  type PackagesConfig,
} from "@/shared/types/packages";
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

function RulesBuilderInner() {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");
  const [config, setConfig] = useState<RulesConfig>(initialConfig);
  const [packagesConfig, setPackagesConfig] = useState<PackagesConfig>(
    defaultPackagesConfig,
  );
  const [newRule, setNewRule] = useState("");
  const [newImportGroup, setNewImportGroup] = useState("");
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("both");

  const fileName = targetFiles[config.meta.targetAgent];
  const markdown = useMemo(
    () => generateMarkdown(config, packagesConfig),
    [config, packagesConfig],
  );
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

  const update = <K extends keyof RulesConfig>(
    section: K,
    value: Partial<RulesConfig[K]>,
  ) => {
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

  const togglePreviewVisibility = useCallback(() => {
    setPreviewMode((current) => (current === "hidden" ? "both" : "hidden"));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "v" || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable)) return;
      event.preventDefault();
      togglePreviewVisibility();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePreviewVisibility]);

  const addRule = () => {
    const rule = newRule.trim();
    if (!rule) return;
    setConfig((current) => ({
      ...current,
      customRules: [...current.customRules, rule],
    }));
    setNewRule("");
  };

  const removeRule = (index: number) => {
    setConfig((current) => ({
      ...current,
      customRules: current.customRules.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    }));
  };

  const mainPanel = (() => {
    switch (activeTab) {
      case "structure":
        return <StructureTab />;
      case "packages":
        return (
          <PackagesRulesTab
            config={packagesConfig}
            onChange={setPackagesConfig}
          />
        );
      case "naming":
        return <NamingTab config={config} update={update} />;
      case "code":
        return <CodeStyleTab config={config} update={update} />;
      case "components":
        return <ComponentsTab config={config} update={update} />;
      case "imports":
        return (
          <ImportsTab
            config={config}
            newImportGroup={newImportGroup}
            setNewImportGroup={setNewImportGroup}
            update={update}
          />
        );
      case "testing":
        return <TestingTab config={config} update={update} />;
      case "performance":
        return <PerformanceTab config={config} update={update} />;
      case "custom":
        return (
          <CustomRulesTab
            customRules={config.customRules}
            newRule={newRule}
            addRule={addRule}
            removeRule={removeRule}
            setNewRule={setNewRule}
          />
        );
      default:
        return <OverviewTab config={config} update={update} />;
    }
  })();

  return (
    <main
      className="relative isolate min-h-screen overflow-x-hidden text-[color:var(--theme-text)]"
      style={themeVars}
    >
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
      {/* <Navbar /> */}

      <div
        className={[
          "relative z-10 mx-auto grid w-full gap-5 px-5 py-8 md:px-8",
          isSplitPreview
            ? "max-w-7xl lg:grid-cols-[minmax(0,1fr)_440px]"
            : "max-w-4xl",
        ].join(" ")}
      >
        <section
          className={[
            "mx-auto w-full max-w-2xl text-center",
            isSplitPreview ? "lg:col-span-2" : "",
          ].join(" ")}
        >
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.44em] text-[color:var(--theme-accent)]">
            Focus
          </p>
          <h1 className="font-mono text-3xl font-medium tracking-wide text-[color:var(--theme-text)] md:text-4xl">
            rules builder
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[color:var(--theme-muted)]">
            Clean `src` architecture, glass UI, and export-ready instructions
            for Claude, Cursor, Copilot, or any coding agent.
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
        <button
          onClick={copyMarkdown}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[color:var(--theme-text)]"
        >
          {copied ? (
            <Check size={17} className="text-[color:var(--theme-accent)]" />
          ) : (
            <Copy size={17} />
          )}
        </button>
        <button
          onClick={exportFile}
          className="grid h-10 w-10 place-items-center rounded-full bg-[color:var(--theme-accent)] text-[color:var(--theme-accent-fg)]"
        >
          <Download size={17} />
        </button>
        <button
          onClick={cyclePreviewMode}
          className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-[color:var(--theme-text)]"
        >
          {previewMode === "both" ? (
            <EyeOff size={17} />
          ) : previewMode === "only" ? (
            <FileText size={17} />
          ) : (
            <FileText size={17} />
          )}
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
