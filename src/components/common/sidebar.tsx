"use client";

import { useState, useRef, useEffect } from "react";
import { useTheme, THEMES, type ThemeId } from "../store/themeStore";
import {
  Settings, FolderOpen, Type, Code2, Layers, Package,
  TestTube, Zap, Hash, Pin, PinOff, Maximize, Minimize,
  Copy, Download, Eye, SplitSquareHorizontal, Palette,
} from "lucide-react";
import AnimatedLogo from "./AnimatedLogo";

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

const NAV_ITEMS: NavItem[] = [
  { id: "meta",        label: "Project",     icon: <Settings size={16} /> },
  { id: "folders",     label: "Structure",   icon: <FolderOpen size={16} /> },
  { id: "packages",    label: "Packages",    icon: <Package size={16} /> },
  { id: "naming",      label: "Naming",      icon: <Type size={16} /> },
  { id: "code",        label: "Code Style",  icon: <Code2 size={16} /> },
  { id: "components",  label: "Components",  icon: <Layers size={16} /> },
  { id: "imports",     label: "Imports",     icon: <Package size={16} /> },
  { id: "testing",     label: "Testing",     icon: <TestTube size={16} /> },
  { id: "performance", label: "Performance", icon: <Zap size={16} /> },
  { id: "custom",      label: "Custom",      icon: <Hash size={16} /> },
];

interface SidebarProps {
  activeTab: string;
  setActiveTab: (id: string) => void;
  onCopy: () => void;
  onExport: () => void;
  copied: boolean;
  previewMode: "split" | "preview";
  setPreviewMode: (m: "split" | "preview") => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
}

function Tooltip({ label, side = "right", children }: {
  label: string;
  side?: "right" | "top";
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const { theme } = useTheme();

  return (
    <div className="relative flex items-center" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div
          className={`absolute ${side === "right" ? "left-full ml-3" : "bottom-full mb-2 left-1/2 -translate-x-1/2"} z-[200] px-2.5 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap pointer-events-none shadow-xl`}
          style={{
            background: theme.surface,
            color: theme.text,
            border: `1px solid ${theme.surfaceBorder}`,
            boxShadow: `0 8px 24px ${theme.accent}20`,
          }}
        >
          {label}
          <div
            className={`absolute ${side === "right" ? "right-full top-1/2 -translate-y-1/2 border-r-[6px] border-y-[5px] border-y-transparent" : "top-full left-1/2 -translate-x-1/2 border-t-[6px] border-x-[5px] border-x-transparent"}`}
            style={{ borderRightColor: side === "right" ? theme.surfaceBorder : undefined, borderTopColor: side === "top" ? theme.surfaceBorder : undefined }}
          />
        </div>
      )}
    </div>
  );
}

export default function FloatingSidebar({
  activeTab, setActiveTab, onCopy, onExport, copied,
  previewMode, setPreviewMode, isFullscreen, toggleFullscreen,
}: SidebarProps) {
  const { theme, themeId, setTheme, cycleTheme } = useTheme();
  const [pinned, setPinned] = useState(false);
  const [visible, setVisible] = useState(false);
  const [showThemePicker, setShowThemePicker] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Auto-hide logic
  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (pinned) { setVisible(true); return; }
      if (e.clientX < 80) {
        setVisible(true);
        if (timerRef.current) clearTimeout(timerRef.current);
      } else if (e.clientX > 160) {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => setVisible(false), 800);
      }
    };
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, [pinned]);

  const iconBtn = (label: string, onClick: () => void, children: React.ReactNode, active = false) => (
    <Tooltip label={label}>
      <button
        onClick={onClick}
        className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150"
        style={{
          background: active ? theme.accent + "30" : "transparent",
          color: active ? theme.accent : theme.textMuted,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLElement).style.background = theme.accent + "20";
          (e.currentTarget as HTMLElement).style.color = theme.accent;
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLElement).style.background = active ? theme.accent + "30" : "transparent";
          (e.currentTarget as HTMLElement).style.color = active ? theme.accent : theme.textMuted;
        }}
      >
        {children}
      </button>
    </Tooltip>
  );

  return (
    <>
      {/* Trigger edge zone */}
      {!pinned && (
        <div
          className="fixed left-0 top-0 w-4 h-full z-[90]"
          onMouseEnter={() => setVisible(true)}
        />
      )}

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed left-0 top-0 h-full z-[100] flex flex-col py-3 items-center gap-1"
        style={{
          width: 56,
          background: theme.surface + "E8",
          borderRight: `1px solid ${theme.surfaceBorder}`,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          boxShadow: `4px 0 24px ${theme.accent}15`,
          transform: `translateX(${visible || pinned ? "0" : "-100%"})`,
          transition: "transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Logo */}
        <div className="mb-2 flex items-center justify-center">
          <AnimatedLogo size={28} animate hoverReplay color={theme.accent} accentColor={theme.accent + "CC"} />
        </div>

        {/* Divider */}
        <div className="w-8 h-px my-1" style={{ background: theme.surfaceBorder }} />

        {/* Nav items */}
        <nav className="flex flex-col gap-0.5 flex-1 items-center w-full px-2">
          {NAV_ITEMS.map((item) => (
            <Tooltip key={item.id} label={item.label}>
              <button
                onClick={() => setActiveTab(item.id)}
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150 relative"
                style={{
                  background: activeTab === item.id ? theme.accent + "25" : "transparent",
                  color: activeTab === item.id ? theme.accent : theme.textMuted,
                }}
                onMouseEnter={(e) => {
                  if (activeTab !== item.id) {
                    (e.currentTarget as HTMLElement).style.background = theme.accent + "15";
                    (e.currentTarget as HTMLElement).style.color = theme.text;
                  }
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = activeTab === item.id ? theme.accent + "25" : "transparent";
                  (e.currentTarget as HTMLElement).style.color = activeTab === item.id ? theme.accent : theme.textMuted;
                }}
              >
                {item.icon}
                {activeTab === item.id && (
                  <div
                    className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-l-full"
                    style={{ background: theme.accent }}
                  />
                )}
              </button>
            </Tooltip>
          ))}
        </nav>

        {/* Divider */}
        <div className="w-8 h-px my-1" style={{ background: theme.surfaceBorder }} />

        {/* Bottom controls */}
        <div className="flex flex-col gap-0.5 items-center px-2">
          {/* Preview toggle */}
          {iconBtn(
            previewMode === "split" ? "Preview Only" : "Split View",
            () => setPreviewMode(previewMode === "split" ? "preview" : "split"),
            previewMode === "split" ? <SplitSquareHorizontal size={15} /> : <Eye size={15} />,
          )}

          {/* Copy */}
          {iconBtn("Copy Markdown", onCopy, copied
            ? <span className="text-[10px] font-bold" style={{ color: "#22C55E" }}>✓</span>
            : <Copy size={15} />, copied)}

          {/* Export */}
          {iconBtn("Export File", onExport, <Download size={15} />)}

          {/* Divider */}
          <div className="w-8 h-px my-1" style={{ background: theme.surfaceBorder }} />

          {/* Theme picker */}
          <div className="relative">
            <Tooltip label="Theme (D)">
              <button
                onClick={() => setShowThemePicker((v) => !v)}
                className="flex items-center justify-center w-9 h-9 rounded-xl transition-all duration-150"
                style={{ color: theme.accent }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = theme.accent + "20"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <Palette size={15} />
              </button>
            </Tooltip>

            {showThemePicker && (
              <div
                className="absolute left-full bottom-0 ml-3 p-2 rounded-2xl shadow-2xl z-[200] min-w-[160px]"
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.surfaceBorder}`,
                  boxShadow: `0 16px 48px ${theme.accent}30`,
                }}
              >
                <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-2" style={{ color: theme.textMuted }}>
                  Theme
                </p>
                <div className="space-y-0.5">
                  {(Object.values(THEMES)).map((t) => (
                    <button
                      key={t.id}
                      onClick={() => { setTheme(t.id); setShowThemePicker(false); }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-medium transition-all"
                      style={{
                        background: themeId === t.id ? theme.accent + "20" : "transparent",
                        color: themeId === t.id ? theme.accent : theme.text,
                      }}
                    >
                      <span>{t.label}</span>
                      <span>{t.name}</span>
                      {themeId === t.id && <span className="ml-auto text-[10px]" style={{ color: theme.accent }}>✓</span>}
                    </button>
                  ))}
                </div>
                <div className="mt-2 pt-2 px-2" style={{ borderTop: `1px solid ${theme.surfaceBorder}` }}>
                  <p className="text-[10px]" style={{ color: theme.textMuted }}>
                    Press <kbd className="px-1 py-0.5 rounded text-[9px]" style={{ background: theme.surfaceBorder }}>D</kbd> to cycle
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Fullscreen */}
          {iconBtn(
            isFullscreen ? "Exit Fullscreen" : "Fullscreen",
            toggleFullscreen,
            isFullscreen ? <Minimize size={15} /> : <Maximize size={15} />,
          )}

          {/* Pin */}
          {iconBtn(
            pinned ? "Unpin Sidebar" : "Pin Sidebar",
            () => setPinned((v) => !v),
            pinned ? <Pin size={15} /> : <PinOff size={15} />,
            pinned,
          )}
        </div>
      </div>

      {/* Click outside to close theme picker */}
      {showThemePicker && (
        <div className="fixed inset-0 z-[150]" onClick={() => setShowThemePicker(false)} />
      )}
    </>
  );
}
