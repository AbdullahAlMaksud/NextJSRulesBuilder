"use client";

import { createContext, useContext, useState, useMemo, useCallback, useEffect, type ReactNode } from "react";
import { generateMarkdown } from "@/shared/lib/generate-markdown";
import { defaultPackagesConfig, type PackagesConfig } from "@/shared/types/packages";
import { defaultConfig, type RulesConfig } from "@/shared/types/rules";

export type SidebarTab =
  | "overview"
  | "structure"
  | "packages"
  | "naming"
  | "code"
  | "components"
  | "imports"
  | "testing"
  | "performance"
  | "custom";

export type PreviewMode = "both" | "hidden" | "only";

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

export const tabOrder: SidebarTab[] = [
  "overview",
  "structure",
  "packages",
  "naming",
  "code",
  "components",
  "imports",
  "testing",
  "performance",
  "custom",
];

interface RulesContextType {
  activeTab: SidebarTab;
  setActiveTab: (tab: SidebarTab) => void;
  config: RulesConfig;
  setConfig: React.Dispatch<React.SetStateAction<RulesConfig>>;
  update: <K extends keyof RulesConfig>(section: K, value: Partial<RulesConfig[K]>) => void;
  packagesConfig: PackagesConfig;
  setPackagesConfig: React.Dispatch<React.SetStateAction<PackagesConfig>>;
  previewMode: PreviewMode;
  setPreviewMode: (mode: PreviewMode) => void;
  cyclePreviewMode: () => void;
  copied: boolean;
  copyMarkdown: () => void;
  exportFile: () => void;
  fileName: string;
  markdown: string;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  exportBackup: () => void;
  importBackup: (file: File) => Promise<boolean>;
  resetWorkspace: () => void;
}

const RulesContext = createContext<RulesContextType | undefined>(undefined);

export function RulesProvider({ children }: { children: ReactNode }) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("overview");
  const [config, setConfig] = useState<RulesConfig>(initialConfig);
  const [packagesConfig, setPackagesConfig] = useState<PackagesConfig>(defaultPackagesConfig);
  const [copied, setCopied] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("both");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const fileName = targetFiles[config.meta.targetAgent];
  const markdown = useMemo(
    () => generateMarkdown(config, packagesConfig),
    [config, packagesConfig],
  );

  const update = useCallback(<K extends keyof RulesConfig>(
    section: K,
    value: Partial<RulesConfig[K]>,
  ) => {
    setConfig((current) => ({
      ...current,
      [section]: { ...(current[section] as object), ...value },
    }));
  }, []);

  const copyMarkdown = useCallback(async () => {
    await navigator.clipboard.writeText(markdown);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [markdown]);

  const exportFile = useCallback(() => {
    const blob = new Blob([markdown], { type: "text/markdown" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [markdown, fileName]);

  const cyclePreviewMode = useCallback(() => {
    setPreviewMode((current) => {
      if (current === "both") return "only";
      if (current === "only") return "hidden";
      return "both";
    });
  }, []);

  const togglePreviewVisibility = useCallback(() => {
    setPreviewMode((current) => (current === "hidden" ? "both" : "hidden"));
  }, []);

  const toggleFullscreen = useCallback(async () => {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (key === "v" && !event.repeat) {
        const target = event.target as HTMLElement | null;
        if (target && (["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName) || target.isContentEditable)) return;
        event.preventDefault();
        togglePreviewVisibility();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [togglePreviewVisibility]);

  const exportBackup = useCallback(() => {
    const data = {
      version: "1.0",
      config,
      packagesConfig,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${config.meta.name || "rulekit"}-backup.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  }, [config, packagesConfig]);

  const importBackup = useCallback((file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const data = JSON.parse(text);
          if (data && data.config && data.packagesConfig) {
            setConfig(data.config);
            setPackagesConfig(data.packagesConfig);
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          console.error("Failed to parse backup JSON file:", error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }, []);

  const resetWorkspace = useCallback(() => {
    if (window.confirm("Are you sure you want to reset all rules and configurations to defaults?")) {
      setConfig(initialConfig);
      setPackagesConfig(defaultPackagesConfig);
      setActiveTab("overview");
      setPreviewMode("both");
    }
  }, []);

  return (
    <RulesContext.Provider
      value={{
        activeTab,
        setActiveTab,
        config,
        setConfig,
        update,
        packagesConfig,
        setPackagesConfig,
        previewMode,
        setPreviewMode,
        cyclePreviewMode,
        copied,
        copyMarkdown,
        exportFile,
        fileName,
        markdown,
        isFullscreen,
        toggleFullscreen,
        exportBackup,
        importBackup,
        resetWorkspace,
      }}
    >
      {children}
    </RulesContext.Provider>
  );
}

export function useRules() {
  const context = useContext(RulesContext);
  if (context === undefined) {
    throw new Error("useRules must be used within a RulesProvider");
  }
  return context;
}
