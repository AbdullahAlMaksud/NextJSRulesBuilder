"use client";

import { useState, useRef } from "react";
import {
  Home,
  Sparkles,
  Palette,
  Maximize,
  Minimize,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  FileText,
  Save,
  Upload,
  X,
  RotateCcw,
  Layers,
  SaveIcon,
} from "lucide-react";

import AnimatedLogo from "@/components/common/animated-logo";
import { useRules } from "@/shared/contexts/rules-context";
import { useTheme, THEMES } from "@/shared/hooks/use-theme";
import { ParentNavigator } from "./parent-navigator";
import { Button } from "../ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function Navbar() {
  const {
    setActiveTab,
    previewMode,
    setPreviewMode,
    cyclePreviewMode,
    copied,
    copyMarkdown,
    exportFile,
    isFullscreen,
    toggleFullscreen,
    exportBackup,
    importBackup,
    resetWorkspace,
  } = useRules();

  const { theme, themeId, setTheme } = useTheme();
  const [showThemes, setShowThemes] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState({ title: "", description: "", type: "success" as "success" | "error" });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const success = await importBackup(file);
    if (success) {
      setModalMessage({
        title: "Backup Restored",
        description: "Your workspace settings and custom rules have been successfully imported.",
        type: "success"
      });
      setModalOpen(true);
    } else {
      setModalMessage({
        title: "Import Failed",
        description: "The backup file format was invalid. Please upload a valid RuleKit JSON backup.",
        type: "error"
      });
      setModalOpen(true);
    }
    event.target.value = "";
  };

  return (
    <>
      <TooltipProvider>
        <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex h-14 w-[calc(100%-32px)] max-w-4xl items-center justify-between rounded-full border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] px-4 shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.25)] transition-all">
          {/* Left: Home & Logo */}
          <div className="flex items-center gap-3">
            <ParentNavigator variant="plain" size={24} iconFill={"green"} />

            <Separator orientation="vertical" className="h-4" />

            <div className="flex items-center gap-1.5">
              <AnimatedLogo size={18} color={theme.accent} accentColor={theme.accent} animate={false} hoverReplay />
              <span className="font-sans text-sm font-bold tracking-tight" style={{ color: theme.accent }}>
                RuleKit
              </span>
              <span className="rounded px-1.5 py-0.5 text-[8px] font-black uppercase leading-none text-white tracking-widest ml-0.5" style={{ background: theme.accent }}>
                AI
              </span>
            </div>
          </div>

          {/* Center: Switcher (Projects/Configure vs Draw/Preview) */}
          <div className="flex items-center gap-3">
            <Separator orientation="vertical" className="h-4 hidden md:block" />

            <div className="flex items-center gap-1 rounded-full border border-[color:var(--theme-border)] bg-black/5 dark:bg-white/5 p-1">
              <button
                onClick={() => setPreviewMode("both")}
                className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs transition cursor-pointer outline-none ${previewMode !== "only"
                  ? "bg-[color:var(--theme-surface)] font-semibold text-[color:var(--theme-text)] border border-[color:var(--theme-border)] shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                  : "font-medium text-[color:var(--theme-muted)] hover:text-[color:var(--theme-text)]"
                  }`}
              >
                <Layers size={12} className="text-[color:var(--theme-muted)]" />
                <span>Projects</span>
              </button>


            </div>
          </div>

          {/* Right: Export, Copy, Theme, View, Reset */}
          <div className="flex items-center gap-1">
            <Separator orientation="vertical" className="h-4 hidden md:block mr-1" />

            {/* Restore Backup JSON (Upload) */}
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  onClick={handleRestoreClick}
                  variant="ghost"
                  size="icon"
                  className="group h-8 w-8 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-none bg-transparent outline-none relative"
                  aria-label="Restore Settings"
                >
                  <Upload size={14} className="text-[color:var(--theme-muted)] group-hover:text-[color:var(--theme-text)] transition-colors" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-[color:var(--theme-surface)] border-[color:var(--theme-border)] text-[color:var(--theme-text)]">
                Restore from JSON
              </TooltipContent>
            </Tooltip>


            {/* Save Backup JSON (File/Save with blue dot) */}
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  onClick={exportBackup}
                  variant="ghost"
                  size="icon"
                  className="group h-8 w-8 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-none bg-transparent outline-none relative"
                  aria-label="Backup Settings"
                >
                  <div className="relative">
                    <Download size={14} className="text-[color:var(--theme-muted)] group-hover:text-[color:var(--theme-text)] transition-colors" />

                  </div>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-[color:var(--theme-surface)] border-[color:var(--theme-border)] text-[color:var(--theme-text)]">
                Backup to JSON
              </TooltipContent>
            </Tooltip>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />

            {/* Reset Workspace (RotateCcw) */}
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  onClick={resetWorkspace}
                  variant="ghost"
                  size="icon"
                  className="group h-8 w-8 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-none bg-transparent outline-none relative"
                  aria-label="Reset Workspace"
                >
                  <RotateCcw size={14} className="text-[color:var(--theme-muted)] group-hover:text-[color:var(--theme-text)] transition-colors" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-[color:var(--theme-surface)] border-[color:var(--theme-border)] text-[color:var(--theme-text)]">
                Reset Workspace
              </TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-4 hidden md:block mx-1" />


            {/* Theme Selector */}
            <div className="relative">

              {showThemes && (
                <div
                  className="absolute right-0 top-full mt-2 w-48 rounded-xl border p-2 shadow-[0_4px_16px_rgba(0,0,0,0.05)] dark:shadow-[0_4px_16px_rgba(0,0,0,0.3)] z-50 animate-in fade-in slide-in-from-top-1"
                  style={{
                    background: theme.surface,
                    borderColor: theme.surfaceBorder,
                    color: theme.text,
                  }}
                >
                  <p className="px-2 pb-2 text-[9px] font-semibold uppercase tracking-[0.25em]" style={{ color: theme.textMuted }}>
                    Select Theme
                  </p>
                  <div className="grid gap-1">
                    {Object.values(THEMES).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => {
                          setTheme(item.id);
                          setShowThemes(false);
                        }}
                        className="flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-left text-xs transition hover:bg-black/5 dark:hover:bg-white/5 cursor-pointer outline-none"
                        style={{
                          background: themeId === item.id ? theme.accentLight : "transparent",
                          color: themeId === item.id ? theme.accent : theme.text,
                        }}
                      >
                        <span
                          className="grid h-5 w-5 place-items-center rounded-full text-[9px] font-bold"
                          style={{ background: item.accent, color: item.accentFg }}
                        >
                          {item.label}
                        </span>
                        <span>{item.name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Fullscreen (View) */}
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    onClick={toggleFullscreen}
                    variant="ghost"
                    size="icon"
                    className="group h-8 w-8 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-none bg-transparent outline-none relative"
                    aria-label="Fullscreen"
                  >
                    {isFullscreen ? (
                      <Minimize size={14} className="text-[color:var(--theme-muted)] group-hover:text-[color:var(--theme-text)] transition-colors" />
                    ) : (
                      <Maximize size={14} className="text-[color:var(--theme-muted)] group-hover:text-[color:var(--theme-text)] transition-colors" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs bg-[color:var(--theme-surface)] border-[color:var(--theme-border)] text-[color:var(--theme-text)]">
                  {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                </TooltipContent>
              </Tooltip>
            </div>






            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setShowThemes((curr) => !curr)}
                  variant="ghost"
                  size="icon"
                  className="group h-8 w-8 cursor-pointer border-none bg-transparent outline-none relative"
                  aria-label="Select Theme"
                >
                  <Palette size={14} className="text-[color:var(--theme-muted)] group-hover:text-[color:var(--theme-text)] transition-colors" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-[color:var(--theme-surface)] border-[color:var(--theme-border)] text-[color:var(--theme-text)]">
                Select Theme
              </TooltipContent>
            </Tooltip>




            <Separator orientation="vertical" className="h-4 hidden md:block mx-1" />
            {/* Copy Rules (Copy MD) */}
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  onClick={copyMarkdown}
                  variant="ghost"
                  size="icon"
                  className="group h-8 w-8 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-none bg-transparent outline-none relative"
                  aria-label="Copy Rules Markdown"
                >
                  {copied ? (
                    <Check size={14} className="text-emerald-500 animate-bounce" />
                  ) : (
                    <Copy size={14} className="text-[color:var(--theme-muted)] group-hover:text-[color:var(--theme-text)] transition-colors" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-[color:var(--theme-surface)] border-[color:var(--theme-border)] text-[color:var(--theme-text)]">
                {copied ? "Copied!" : "Copy Rules"}
              </TooltipContent>
            </Tooltip>
            {/* Export Rules File (Download MD) */}
            <Tooltip delayDuration={100}>
              <TooltipTrigger asChild>
                <Button
                  onClick={exportFile}
                  variant="ghost"
                  size="icon"
                  className="group h-8 w-8 cursor-pointer hover:bg-black/5 dark:hover:bg-white/5 border-none bg-transparent outline-none relative"
                  aria-label="Export Rules File"
                >
                  <SaveIcon size={14} className="text-[color:var(--theme-muted)] group-hover:text-[color:var(--theme-text)] transition-colors" />
                  <div className="absolute top-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs bg-[color:var(--theme-surface)] border-[color:var(--theme-border)] text-[color:var(--theme-text)]">
                Export Rules File
              </TooltipContent>
            </Tooltip>

          </div>
        </header>
      </TooltipProvider>

      {showThemes && (
        <button
          onClick={() => setShowThemes(false)}
          className="fixed inset-0 z-40 cursor-default bg-transparent"
          aria-label="Close theme selector"
        />
      )}

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {modalMessage.type === "success" ? (
                <div className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/10 text-emerald-500">
                  <Check size={14} />
                </div>
              ) : (
                <div className="grid h-6 w-6 place-items-center rounded-full bg-rose-500/10 text-rose-500">
                  <X size={14} />
                </div>
              )}
              <span>{modalMessage.title}</span>
            </DialogTitle>
            <DialogDescription className="pt-2 text-xs text-[color:var(--theme-muted)]">
              {modalMessage.description}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button
              onClick={() => setModalOpen(false)}
              className="cursor-pointer bg-[color:var(--theme-accent)] text-[color:var(--theme-accent-fg)] hover:opacity-90 outline-none text-xs font-semibold px-4 py-2 rounded-xl transition"
            >
              Okay, got it
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
