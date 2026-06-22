"use client";

import { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  FolderTree,
  Hash,
  Layers,
  Package,
  Settings,
  TestTube,
  Type,
  Zap,
  Code2,
} from "lucide-react";

import AnimatedBackground from "@/components/common/animated-background";
import Footer from "@/components/common/footer";
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
import { useRules, tabOrder, type SidebarTab } from "@/shared/contexts/rules-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const navItems: Array<{ id: SidebarTab; label: string; icon: any }> = [
  { id: "overview", label: "Project Settings", icon: Settings },
  { id: "structure", label: "Folder Structure", icon: FolderTree },
  { id: "packages", label: "Package Rules", icon: Package },
  { id: "naming", label: "Naming Conventions", icon: Type },
  { id: "code", label: "Code Style", icon: Code2 },
  { id: "components", label: "Component Rules", icon: Layers },
  { id: "imports", label: "Import Rules", icon: Package },
  { id: "testing", label: "Testing setup", icon: TestTube },
  { id: "performance", label: "Performance rules", icon: Zap },
  { id: "custom", label: "Custom Rules", icon: Hash },
];

function RulesBuilderInner() {
  const {
    activeTab,
    setActiveTab,
    config,
    update,
    packagesConfig,
    setPackagesConfig,
    previewMode,
    fileName,
    markdown,
  } = useRules();

  const [newRule, setNewRule] = useState("");
  const [newImportGroup, setNewImportGroup] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const showConfigPanel = previewMode !== "only";
  const showPreviewPanel = previewMode !== "hidden";
  const isSplitPreview = previewMode === "both";

  const handlePrevTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(tabOrder[currentIndex - 1]);
    }
  };

  const handleNextTab = () => {
    const currentIndex = tabOrder.indexOf(activeTab);
    if (currentIndex < tabOrder.length - 1) {
      setActiveTab(tabOrder[currentIndex + 1]);
    }
  };

  const addRule = () => {
    const rule = newRule.trim();
    if (!rule) return;
    update("customRules", [...config.customRules, rule]);
    setNewRule("");
  };

  const removeRule = (index: number) => {
    update("customRules", config.customRules.filter(
      (_, itemIndex) => itemIndex !== index,
    ));
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
      className="relative isolate min-h-screen overflow-x-hidden text-[color:var(--theme-text)] pt-24 pb-28"
    >
      <AnimatedBackground />

      {/* Main Content Area */}
      <div
        className={[
          "relative z-10 mx-auto grid w-full px-5 py-6 md:px-8",
          isSplitPreview
            ? "max-w-7xl gap-x-6 gap-y-4 lg:grid-cols-[minmax(0,1fr)_440px] lg:grid-rows-[auto_auto]"
            : "max-w-4xl gap-6",
        ].join(" ")}
      >
        {showConfigPanel && (
          <div className={isSplitPreview ? "lg:col-start-1 lg:row-start-1 min-w-0" : "min-w-0"}>
            {mainPanel}
          </div>
        )}

        {showConfigPanel && (
          <div className={isSplitPreview ? "lg:col-start-1 lg:row-start-2 min-w-0" : "min-w-0"}>
            {/* Form Footer Navigation (Next and Previous Step Buttons under the Form) */}
            <div className="flex items-center justify-between gap-4 mt-2 px-1">
              <button
                onClick={handlePrevTab}
                disabled={!mounted || activeTab === tabOrder[0]}
                className="flex items-center gap-1.5 rounded-md border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] px-4 py-2 text-xs font-semibold text-[color:var(--theme-text)] hover:bg-black/5 dark:hover:bg-white/5 transition disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer outline-none"
              >
                <ChevronLeft size={14} />
                <span>Previous Step</span>
              </button>
              
              <span className="text-xs text-[color:var(--theme-muted)] font-mono font-medium">
                Step {tabOrder.indexOf(activeTab) + 1} of {tabOrder.length}
              </span>

              <button
                onClick={handleNextTab}
                disabled={mounted ? activeTab === tabOrder[tabOrder.length - 1] : false}
                className="flex items-center gap-1.5 rounded-md bg-[color:var(--theme-accent)] px-4 py-2 text-xs font-semibold text-[color:var(--theme-accent-fg)] hover:opacity-90 shadow-[0_2px_8px_rgba(0,0,0,0.05)] transition disabled:opacity-40 cursor-pointer outline-none"
              >
                <span>Next Step</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}

        {showPreviewPanel && (
          <div
            className={
              isSplitPreview
                ? "hidden lg:block lg:col-start-2 lg:row-start-1 lg:row-span-1 min-h-0 h-full animate-in fade-in slide-in-from-right-3 duration-300"
                : "min-w-0 h-full"
            }
          >
            <PreviewPanel fileName={fileName} markdown={markdown} className="h-full" />
          </div>
        )}
      </div>

      {/* Bottom Floating Step Bar (Clean icon-only dock with tooltips) */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 flex h-12 items-center gap-1 rounded-full border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] px-2 shadow-[0_2px_12px_rgba(0,0,0,0.03)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.15)] transition-all">
        <TooltipProvider>
          {navItems.map((item) => {
            const active = activeTab === item.id;
            return (
              <Tooltip key={item.id} delayDuration={100}>
                <TooltipTrigger asChild>
                  <button
                    onClick={() => setActiveTab(item.id)}
                    className={`grid h-8 w-8 place-items-center rounded-full transition-colors cursor-pointer outline-none ${
                      active
                        ? "bg-[color:var(--theme-accent)] text-[color:var(--theme-accent-fg)] shadow-[0_0_8px_var(--theme-shadow)]"
                        : "text-[color:var(--theme-muted)] hover:bg-black/5 dark:hover:bg-white/5 hover:text-[color:var(--theme-text)]"
                    }`}
                  >
                    <item.icon size={14} />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs font-medium bg-[color:var(--theme-surface)] border-[color:var(--theme-border)] text-[color:var(--theme-text)]">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </TooltipProvider>
      </div>

      <Footer />
    </main>
  );
}

export default function RulesBuilder() {
  return <RulesBuilderInner />;
}
