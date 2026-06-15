"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Code2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  Hash,
  Layers,
  Maximize,
  Minimize,
  Package,
  Palette,
  Pin,
  PinOff,
  Settings,
  TestTube,
  Type,
  Zap,
} from "lucide-react";

import AnimatedLogo from "@/components/common/animated-logo";
import { THEMES, useTheme } from "@/shared/hooks/use-theme";

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

interface SidebarProps {
  activeTab: SidebarTab;
  copied: boolean;
  onCopy: () => void;
  onExport: () => void;
  onCyclePreview: () => void;
  previewMode: PreviewMode;
  setActiveTab: (tab: SidebarTab) => void;
}

const navItems: Array<{ id: SidebarTab; label: string; icon: LucideIcon }> = [
  { id: "overview", label: "Project", icon: Settings },
  { id: "structure", label: "Structure", icon: FolderTree },
  { id: "packages", label: "Packages", icon: Package },
  { id: "naming", label: "Naming", icon: Type },
  { id: "code", label: "Code Style", icon: Code2 },
  { id: "components", label: "Components", icon: Layers },
  { id: "imports", label: "Imports", icon: Package },
  { id: "testing", label: "Testing", icon: TestTube },
  { id: "performance", label: "Performance", icon: Zap },
  { id: "custom", label: "Custom Rules", icon: Hash },
];

function Tooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="group relative grid place-items-center">
      {children}
      <div
        role="tooltip"
        className="pointer-events-none absolute left-full z-[90] ml-3 whitespace-nowrap rounded-lg border border-[color:var(--theme-border)] bg-[color:var(--theme-surface)] px-2.5 py-1.5 text-xs font-medium text-[color:var(--theme-text)] opacity-0 shadow-xl backdrop-blur-xl transition group-hover:translate-x-1 group-hover:opacity-100"
      >
        {label}
      </div>
    </div>
  );
}

function SidebarButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
}) {
  return (
    <Tooltip label={label}>
      <button
        aria-label={label}
        title={label}
        onClick={onClick}
        className={[
          "grid h-8 w-8 place-items-center rounded-full border transition",
          active
            ? "border-[color:var(--theme-accent)] bg-[color:var(--theme-accent)] text-[color:var(--theme-accent-fg)] shadow-[0_0_24px_var(--theme-shadow)]"
            : "border-white/5 bg-white/[0.04] text-[color:var(--theme-muted)] hover:border-[color:var(--theme-border)] hover:bg-white/[0.08] hover:text-[color:var(--theme-text)]",
        ].join(" ")}
      >
        <Icon size={15} strokeWidth={active ? 2.4 : 1.8} />
      </button>
    </Tooltip>
  );
}

export default function Sidebar({
  activeTab,
  copied,
  onCopy,
  onExport,
  onCyclePreview,
  previewMode,
  setActiveTab,
}: SidebarProps) {
  const { theme, themeId, setTheme } = useTheme();
  const [pinned, setPinned] = useState(true);
  const [visible, setVisible] = useState(true);
  const [showThemes, setShowThemes] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (event.key.toLowerCase() !== "f" || event.repeat) return;
      const target = event.target as HTMLElement | null;
      if (target && ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName)) return;
      event.preventDefault();
      void toggleFullscreen();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [toggleFullscreen]);

  useEffect(() => {
    const onMouseMove = (event: MouseEvent) => {
      if (pinned) {
        setVisible(true);
        return;
      }

      if (event.clientX < 86) {
        setVisible(true);
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
      } else if (event.clientX > 170) {
        if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
        hideTimerRef.current = setTimeout(() => setVisible(false), 800);
      }
    };

    window.addEventListener("mousemove", onMouseMove);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [pinned]);

  const previewLabel =
    previewMode === "both" ? "Preview: both" : previewMode === "hidden" ? "Preview: hidden" : "Preview: only";
  const previewIcon = previewMode === "both" ? Eye : previewMode === "hidden" ? EyeOff : FileText;

  return (
    <>
      {!pinned && <div className="fixed left-0 top-0 z-20 hidden h-full w-4 md:block" />}

      <aside
        className="fixed left-4 z-30 hidden rounded-full border px-2 py-3 shadow-[0_24px_80px_rgba(0,0,0,0.45)] backdrop-blur-2xl transition-transform duration-300 md:block"
        style={{
          background: theme.surface,
          borderColor: theme.surfaceBorder,
          boxShadow: `0 24px 80px rgba(0,0,0,0.45), 0 0 36px ${theme.shadow}`,
          maxHeight: "calc(100vh - 40px)",
          overflow: "visible",
          top: "50%",
          transform: `translateY(-50%) translateX(${visible ? "0" : "-92px"})`,
        }}
      >
        <div className="mb-3 grid place-items-center">
          <AnimatedLogo size={29} color={theme.accent} accentColor={theme.accent} animate={false} hoverReplay />
        </div>

        <nav className="flex flex-col gap-1.5">
          {navItems.map((item) => (
            <SidebarButton
              key={item.id}
              active={activeTab === item.id}
              icon={item.icon}
              label={item.label}
              onClick={() => setActiveTab(item.id)}
            />
          ))}
        </nav>

        <div className="my-3 h-px" style={{ background: theme.surfaceBorder }} />

        <div className="flex flex-col gap-1.5">
          <SidebarButton
            active={previewMode !== "both"}
            icon={previewIcon}
            label={`${previewLabel} (click to cycle)`}
            onClick={onCyclePreview}
          />
          <SidebarButton active={copied} icon={Copy} label={copied ? "Copied" : "Copy markdown"} onClick={onCopy} />
          <SidebarButton icon={Download} label="Download file" onClick={onExport} />

          <div className="my-1 h-px" style={{ background: theme.surfaceBorder }} />

          <div className="relative">
            <SidebarButton
              active={showThemes}
              icon={Palette}
              label="Theme"
              onClick={() => setShowThemes((current) => !current)}
            />
            {showThemes && (
              <div
                className="absolute bottom-0 left-full ml-3 w-48 rounded-2xl border p-2 shadow-2xl backdrop-blur-2xl"
                style={{
                  background: theme.surface,
                  borderColor: theme.surfaceBorder,
                  color: theme.text,
                  boxShadow: `0 24px 80px ${theme.shadow}`,
                }}
              >
                <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: theme.textMuted }}>
                  Theme
                </p>
                <div className="grid gap-1">
                  {Object.values(THEMES).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setTheme(item.id);
                        setShowThemes(false);
                      }}
                      className="flex items-center gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition hover:bg-white/10"
                      style={{
                        background: themeId === item.id ? theme.accentLight : "transparent",
                        color: themeId === item.id ? theme.accent : theme.text,
                      }}
                    >
                      <span
                        className="grid h-6 w-6 place-items-center rounded-full text-[10px] font-bold"
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
          </div>

          <SidebarButton
            icon={isFullscreen ? Minimize : Maximize}
            label={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={toggleFullscreen}
          />
          <SidebarButton
            active={pinned}
            icon={pinned ? Pin : PinOff}
            label={pinned ? "Unpin sidebar" : "Pin sidebar"}
            onClick={() => {
              setPinned((current) => !current);
              setVisible(true);
            }}
          />
        </div>
      </aside>

      {showThemes && <button aria-label="Close theme picker" className="fixed inset-0 z-20 cursor-default" onClick={() => setShowThemes(false)} />}
    </>
  );
}
