"use client";

import {
  useState, useEffect, useRef, useCallback, useLayoutEffect,
} from "react";
import { createPortal } from "react-dom";
import {
  Search, Plus, Trash2, Check, Copy, Package,
  X, Loader2, ExternalLink, ArrowUpDown, Zap,
} from "lucide-react";
import {
  PackagesConfig, PackageEntry, PackageManager, DepType,
  PM_LABELS, generateInstallCommands, genPkgId, defaultPackagesConfig,
} from "@/shared/types/packages";
import { useTheme } from "@/shared/hooks/use-theme";

// ─── npm suggestions API ──────────────────────────────────────────────────────

interface NpmSuggestion {
  name: string;
  version: string;
  description: string;
  keywords?: string[];
}

interface NpmSuggestionResult {
  name?: string;
  version?: string;
  description?: string;
  keywords?: string[];
}

interface RegistrySearchResult {
  objects?: Array<{
    package: NpmSuggestionResult;
  }>;
}

async function fetchSuggestions(query: string): Promise<NpmSuggestion[]> {
  if (!query.trim()) return [];
  try {
    const res = await fetch(
      `https://www.npmjs.com/search/suggestions?q=${encodeURIComponent(query)}`,
      { headers: { "x-spiferack-v": "1" } }
    );
    if (!res.ok) throw new Error("suggestions failed");
    const data = (await res.json()) as NpmSuggestionResult[];
    return (Array.isArray(data) ? data : []).slice(0, 10).map((p) => ({
      name: p.name ?? "",
      version: p.version ?? "latest",
      description: p.description ?? "",
      keywords: p.keywords ?? [],
    }));
  } catch {
    // Fallback to registry search
    try {
      const res2 = await fetch(
        `https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=10`
      );
      const d = (await res2.json()) as RegistrySearchResult;
      return (d.objects || []).map((o) => ({
        name: o.package.name ?? "",
        version: o.package.version ?? "latest",
        description: o.package.description ?? "",
        keywords: o.package.keywords ?? [],
      }));
    } catch {
      return [];
    }
  }
}

function useDebounce<T>(value: T, delay: number): T {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

// ─── Portal Dropdown ──────────────────────────────────────────────────────────

interface DropdownRect {
  top: number;
  left: number;
  width: number;
}

function PortalDropdown({
  anchor,
  children,
}: {
  anchor: React.RefObject<HTMLElement | null>;
  children: React.ReactNode;
}) {
  const [rect, setRect] = useState<DropdownRect | null>(null);

  useLayoutEffect(() => {
    const update = () => {
      if (!anchor.current) return;
      const r = anchor.current.getBoundingClientRect();
      setRect({
        top: r.bottom + window.scrollY + 4,
        left: r.left + window.scrollX,
        width: r.width,
      });
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [anchor]);

  if (!rect || typeof document === "undefined") return null;

  return createPortal(
    <div
      style={{
        position: "absolute",
        top: rect.top,
        left: rect.left,
        width: rect.width,
        zIndex: 9999,
      }}
    >
      {children}
    </div>,
    document.body
  );
}

// ─── Package Manager Selector ─────────────────────────────────────────────────

function PmSelector({
  value,
  onChange,
}: {
  value: PackageManager;
  onChange: (v: PackageManager) => void;
}) {
  const { theme: t } = useTheme();
  return (
    <div className="grid grid-cols-4 gap-2.5">
      {(Object.keys(PM_LABELS) as PackageManager[]).map((pm) => {
        const info = PM_LABELS[pm];
        const selected = value === pm;
        return (
          <button
            key={pm}
            onClick={() => onChange(pm)}
            className="flex flex-col items-center gap-2 py-3.5 px-2 rounded-xl border-2 transition-all duration-150"
            style={{
              background: selected ? t.accent + "20" : t.bgSecondary,
              borderColor: selected ? t.accent : t.surfaceBorder,
              boxShadow: selected ? `0 0 0 2px ${t.accent}30` : undefined,
            }}
          >
            <span className="text-2xl leading-none">{info.icon}</span>
            <span className="text-xs font-bold tracking-wide" style={{ color: selected ? t.accent : t.textMuted }}>
              {info.label}
            </span>
            <span className="text-[10px] font-mono" style={{ color: t.textMuted }}>
              {info.installCmd.split(" ")[0]} add
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─── Search Box ───────────────────────────────────────────────────────────────

function PackageSearchBox({
  onAdd,
  existingNames,
}: {
  onAdd: (pkg: NpmSuggestion, type: DepType) => void;
  existingNames: Set<string>;
}) {
  const [query, setQuery]       = useState("");
  const [results, setResults]   = useState<NpmSuggestion[]>([]);
  const [loading, setLoading]   = useState(false);
  const [open, setOpen]         = useState(false);
  const [selected, setSelected] = useState<NpmSuggestion | null>(null);
  const [addType, setAddType]   = useState<DepType>("dependencies");
  const [focusedIdx, setFocusedIdx] = useState(-1);

  const inputRef    = useRef<HTMLInputElement>(null);
  const inputWrap   = useRef<HTMLDivElement>(null);
  const listRef     = useRef<HTMLDivElement>(null);

  const debouncedQ  = useDebounce(query, 250);

  // Fetch suggestions
  useEffect(() => {
    if (!debouncedQ.trim()) {
      const timer = window.setTimeout(() => {
        setResults([]);
        setLoading(false);
        setOpen(false);
      }, 0);
      return () => window.clearTimeout(timer);
    }
    const loadingTimer = window.setTimeout(() => {
      setLoading(true);
    }, 0);
    let cancelled = false;
    fetchSuggestions(debouncedQ).then((r) => {
      if (cancelled) return;
      setResults(r);
      setLoading(false);
      setOpen(r.length > 0);
      setFocusedIdx(-1);
    });
    return () => {
      cancelled = true;
      window.clearTimeout(loadingTimer);
    };
  }, [debouncedQ]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideWrap = inputWrap.current?.contains(target);
      const insidePortal = listRef.current?.contains(target);
      if (!insideWrap && !insidePortal) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (pkg: NpmSuggestion) => {
    setSelected(pkg);
    setQuery(pkg.name);
    setOpen(false);
    setFocusedIdx(-1);
  };

  const handleAdd = () => {
    const name = selected?.name || query.trim();
    if (!name || existingNames.has(name)) return;
    onAdd(
      selected ?? { name, version: "latest", description: "" },
      addType
    );
    setQuery("");
    setSelected(null);
    setResults([]);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open || results.length === 0) {
      if (e.key === "Enter") handleAdd();
      if (e.key === "Escape") { setQuery(""); setSelected(null); setOpen(false); }
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIdx((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedIdx >= 0 && results[focusedIdx]) {
        handleSelect(results[focusedIdx]);
      } else {
        handleAdd();
      }
    } else if (e.key === "Escape") {
      setOpen(false);
      setFocusedIdx(-1);
    }
  };

  const alreadyAdded = existingNames.has(selected?.name ?? query.trim());

  return (
    <div className="space-y-2.5">
      {/* Input row */}
      <div className="flex gap-2 items-center">
        {/* Search input wrapper — this is the anchor for the portal */}
        <div ref={inputWrap} className="relative flex-1">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none z-10"
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelected(null);
            }}
            onFocus={() => { if (results.length > 0) setOpen(true); }}
            onKeyDown={handleKeyDown}
            placeholder="Search npm… (e.g. zustand, framer-motion)"
            className="w-full h-9 pl-9 pr-8 rounded-xl text-sm focus:outline-none focus:ring-2 transition-shadow" style={{ background: "var(--inp-bg, #fff)", color: "var(--inp-color, #111)", border: "1px solid var(--inp-border, #e4e4e7)" }}
          />
          {/* Right icon: spinner or clear */}
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
            {loading ? (
              <Loader2 size={13} className="text-zinc-400 animate-spin" />
            ) : query ? (
              <button
                onClick={() => {
                  setQuery("");
                  setSelected(null);
                  setResults([]);
                  setOpen(false);
                  inputRef.current?.focus();
                }}
                className="text-zinc-300 hover:text-zinc-600 transition-colors"
              >
                <X size={13} />
              </button>
            ) : null}
          </div>

          {/* Portal Dropdown */}
          {open && results.length > 0 && (
            <PortalDropdown anchor={inputWrap as React.RefObject<HTMLElement>}>
              <div
                ref={listRef}
                className="rounded-2xl overflow-hidden"
                style={{ background: "var(--portal-bg, #fff)", border: "1px solid var(--portal-border, #e4e4e7)", boxShadow: "0 8px 40px rgba(0,0,0,0.18), 0 2px 8px rgba(0,0,0,0.1)" }}
              >
                <div className="max-h-72 overflow-y-auto" style={{ borderColor: "var(--portal-border, #e4e4e7)" }}>
                  {results.map((pkg, idx) => {
                    const added = existingNames.has(pkg.name);
                    const focused = idx === focusedIdx;
                    return (
                      <button
                        key={pkg.name}
                        onMouseDown={(e) => { e.preventDefault(); if (!added) handleSelect(pkg); }}
                        onMouseEnter={() => setFocusedIdx(idx)}
                        className={[
                          "w-full flex items-start gap-3 px-3.5 py-2.5 text-left transition-colors",
                          added
                            ? "opacity-40 cursor-not-allowed bg-zinc-50"
                            : focused
                            ? "bg-indigo-50"
                            : "hover:bg-zinc-50",
                        ].join(" ")}
                        disabled={added}
                      >
                        {/* npm icon */}
                        <div className="shrink-0 mt-0.5 w-5 h-5 flex items-center justify-center rounded bg-red-500">
                          <span className="text-[9px] font-black text-white leading-none">npm</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[13px] font-semibold font-mono text-zinc-800 truncate">
                              {pkg.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                              v{pkg.version}
                            </span>
                            {added && (
                              <span className="text-[10px] text-green-600 font-medium shrink-0 flex items-center gap-0.5">
                                <Check size={9} /> added
                              </span>
                            )}
                          </div>
                          {pkg.description && (
                            <p className="text-[11px] text-zinc-500 mt-0.5 line-clamp-1">
                              {pkg.description}
                            </p>
                          )}
                          {pkg.keywords && pkg.keywords.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {pkg.keywords.slice(0, 5).map((k) => (
                                <span
                                  key={k}
                                  className="text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-500"
                                >
                                  {k}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <a
                          href={`https://www.npmjs.com/package/${pkg.name}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onMouseDown={(e) => e.stopPropagation()}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 text-zinc-300 hover:text-indigo-500 mt-0.5 transition-colors"
                          title="View on npm"
                        >
                          <ExternalLink size={12} />
                        </a>
                      </button>
                    );
                  })}
                </div>
                <div className="px-3.5 py-2 flex items-center justify-between" style={{ borderTop: "1px solid var(--portal-border, #e4e4e7)", background: "var(--portal-bg, #f9f9f9)" }}>
                  <p className="text-[10px] text-zinc-400 flex items-center gap-1.5">
                    <span className="w-3 h-3 inline-flex items-center justify-center rounded bg-red-500">
                      <span className="text-[7px] font-black text-white leading-none">n</span>
                    </span>
                    npm registry · {results.length} results
                  </p>
                  <p className="text-[10px] text-zinc-400">↑↓ navigate · Enter select · Esc close</p>
                </div>
              </div>
            </PortalDropdown>
          )}
        </div>

        {/* Dep / Dev toggle */}
        <div className="flex rounded-lg border border-zinc-200 bg-zinc-50 p-0.5 shrink-0">
          {(["dependencies", "devDependencies"] as DepType[]).map((t) => (
            <button
              key={t}
              onClick={() => setAddType(t)}
              className={[
                "px-2.5 py-1.5 rounded-md text-[11px] font-semibold transition-colors",
                addType === t
                  ? "bg-white shadow-sm text-zinc-800 border border-zinc-200"
                  : "text-zinc-500 hover:text-zinc-700",
              ].join(" ")}
            >
              {t === "dependencies" ? "Dep" : "Dev"}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          disabled={!query.trim() || alreadyAdded}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-indigo-500 text-white hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
        >
          <Plus size={13} />
          Add
        </button>
      </div>

      {/* Selected preview chip */}
      {selected && !open && (
        <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg bg-indigo-50 border border-indigo-200">
          <div className="w-5 h-5 flex items-center justify-center rounded bg-red-500 shrink-0">
            <span className="text-[9px] font-black text-white leading-none">npm</span>
          </div>
          <span className="font-mono font-semibold text-indigo-700 text-xs">{selected.name}</span>
          <span className="text-indigo-400 font-mono text-[11px]">v{selected.version}</span>
          {selected.description && (
            <span className="text-zinc-500 text-[11px] truncate flex-1">{selected.description}</span>
          )}
          <button
            onClick={() => { setSelected(null); setQuery(""); inputRef.current?.focus(); }}
            className="text-indigo-300 hover:text-indigo-600 shrink-0 transition-colors"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Package Row ──────────────────────────────────────────────────────────────

function PkgRow({
  pkg,
  onChange,
  onDelete,
}: {
  pkg: PackageEntry;
  onChange: (p: Partial<PackageEntry>) => void;
  onDelete: () => void;
}) {
  const [editVer, setEditVer] = useState(false);
  const [ver, setVer]         = useState(pkg.version);
  const verRef                = useRef<HTMLInputElement>(null);
  const { theme: t }          = useTheme();

  useEffect(() => {
    if (editVer) setTimeout(() => verRef.current?.select(), 20);
  }, [editVer]);

  const confirmVer = () => {
    onChange({ version: ver.trim() || "latest" });
    setEditVer(false);
  };

  return (
    <div className="group flex items-center gap-2.5 py-2 px-3 rounded-xl transition-colors" style={{ background: "transparent" }} onMouseEnter={(e) => (e.currentTarget.style.background = t.accent + "10")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
      {/* npm mini badge */}
      <div className="w-5 h-5 flex items-center justify-center rounded bg-red-500 shrink-0">
        <span className="text-[8px] font-black text-white leading-none">npm</span>
      </div>

      {/* Name */}
      <span className="text-xs font-mono font-semibold text-zinc-800 flex-1 min-w-0 truncate">
        {pkg.name}
      </span>

      {/* Version */}
      {editVer ? (
        <input
          ref={verRef}
          value={ver}
          onChange={(e) => setVer(e.target.value)}
          onBlur={confirmVer}
          onKeyDown={(e) => {
            if (e.key === "Enter") confirmVer();
            if (e.key === "Escape") setEditVer(false);
          }}
          className="w-24 h-6 px-1.5 text-xs font-mono rounded outline-none" style={{ background: t.surface, color: t.text, border: `1px solid ${t.accent}` }}
        />
      ) : (
        <button
          onClick={() => { setVer(pkg.version); setEditVer(true); }}
          className="text-[11px] font-mono px-2 py-0.5 rounded-lg transition-colors" style={{ background: t.bgSecondary, color: t.textMuted }}
          title="Click to edit version"
        >
          {pkg.version}
        </button>
      )}

      {/* Dep type badge */}
      <button
        onClick={() => onChange({ type: pkg.type === "dependencies" ? "devDependencies" : "dependencies" })}
        className={[
          "text-[10px] font-semibold px-2 py-0.5 rounded-md border transition-colors",
          pkg.type === "devDependencies"
            ? "bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100"
            : "bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100",
        ].join(" ")}
        title="Toggle dep / devDep"
      >
        {pkg.type === "devDependencies" ? "dev" : "dep"}
      </button>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 p-1 rounded transition-all shrink-0" style={{ color: t.textMuted }}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ─── Install Command Preview ──────────────────────────────────────────────────

function InstallPreview({ config }: { config: PackagesConfig }) {
  const [copied, setCopied] = useState(false);
  const { theme: t } = useTheme();
  const commands = generateInstallCommands(config);
  if (!config.packages.length) return null;

  const copy = async () => {
    await navigator.clipboard.writeText(commands);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: t.previewBg, border: `1px solid ${t.surfaceBorder}50` }}>
      <div className="flex items-center justify-between px-4 py-2.5" style={{ borderBottom: `1px solid ${t.surfaceBorder}40` }}>
        <div className="flex items-center gap-2">
          <Zap size={13} className="text-indigo-400" />
          <span className="text-xs font-mono" style={{ color: t.textMuted }}>Install commands</span>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-200 transition-colors"
        >
          {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="px-4 py-3 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre" style={{ color: t.previewText }}>
        {commands}
      </pre>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SCard({
  icon, title, right, children,
}: {
  icon: React.ReactNode;
  title: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  const { theme: t } = useTheme();
  return (
    <div className="rounded-2xl overflow-visible" style={{ background: t.surface, border: `1px solid ${t.surfaceBorder}` }}>
      <div className="flex items-center gap-2.5 px-5 py-3.5 rounded-t-2xl" style={{ borderBottom: `1px solid ${t.surfaceBorder}`, background: t.bgSecondary + "60" }}>
        <span style={{ color: t.accent }}>{icon}</span>
        <span className="text-sm font-semibold" style={{ color: t.text }}>{title}</span>
        {right && <div className="ml-auto">{right}</div>}
      </div>
      <div className="overflow-visible">{children}</div>
    </div>
  );
}

// ─── Main PackagesTab ─────────────────────────────────────────────────────────

export default function PackagesTab({
  config,
  onChange,
}: {
  config: PackagesConfig;
  onChange: (c: PackagesConfig) => void;
}) {
  const { theme: t } = useTheme();
  const existingNames = new Set(config.packages.map((p) => p.name));

  const addPackage = (pkg: NpmSuggestion, type: DepType) => {
    if (existingNames.has(pkg.name)) return;
    const entry: PackageEntry = {
      id: genPkgId(),
      name: pkg.name,
      version: pkg.version || "latest",
      type,
      description: pkg.description,
    };
    onChange({ ...config, packages: [...config.packages, entry] });
  };

  const updatePackage = (id: string, patch: Partial<PackageEntry>) => {
    onChange({
      ...config,
      packages: config.packages.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    });
  };

  const removePackage = (id: string) => {
    onChange({ ...config, packages: config.packages.filter((p) => p.id !== id) });
  };

  const deps    = config.packages.filter((p) => p.type === "dependencies");
  const devDeps = config.packages.filter((p) => p.type === "devDependencies");

  return (
    <div className="space-y-4 overflow-visible" style={{
      "--inp-bg": t.bgSecondary,
      "--inp-color": t.text,
      "--inp-border": t.surfaceBorder,
      "--portal-bg": t.surface,
      "--portal-border": t.surfaceBorder,
    } as React.CSSProperties}>

      {/* Package Manager */}
      <SCard icon={<Package size={15} />} title="Package Manager">
        <div className="p-4">
          <PmSelector
            value={config.manager}
            onChange={(v) => onChange({ ...config, manager: v })}
          />
        </div>
      </SCard>

      {/* Search — overflow:visible so portal can escape */}
      <SCard
        icon={<Search size={15} />}
        title="Search & Add Packages"
        right={
          <span className="text-[11px] text-zinc-400 flex items-center gap-1">
            <span className="w-3.5 h-3.5 inline-flex items-center justify-center rounded bg-red-500">
              <span className="text-[7px] font-black text-white">n</span>
            </span>
            npm registry
          </span>
        }
      >
        <div className="p-4 overflow-visible">
          <PackageSearchBox onAdd={addPackage} existingNames={existingNames} />
        </div>
      </SCard>

      {/* Package List */}
      <SCard
        icon={<ArrowUpDown size={15} />}
        title="Installed Packages"
        right={
          <span className="text-xs text-zinc-400 font-mono">{config.packages.length} total</span>
        }
      >
        {config.packages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
            <Package size={28} className="mb-2 opacity-20" />
            <p className="text-xs">No packages yet — search above to add</p>
          </div>
        ) : (
          <div className="p-2 space-y-0.5">
            {deps.length > 0 && (
              <>
                <p className="px-3 pt-1.5 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: t.accent }}>
                  Dependencies ({deps.length})
                </p>
                {deps.map((p) => (
                  <PkgRow
                    key={p.id}
                    pkg={p}
                    onChange={(patch) => updatePackage(p.id, patch)}
                    onDelete={() => removePackage(p.id)}
                  />
                ))}
              </>
            )}
            {devDeps.length > 0 && (
              <>
                <p className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: "#7C3AED" }}>
                  Dev Dependencies ({devDeps.length})
                </p>
                {devDeps.map((p) => (
                  <PkgRow
                    key={p.id}
                    pkg={p}
                    onChange={(patch) => updatePackage(p.id, patch)}
                    onDelete={() => removePackage(p.id)}
                  />
                ))}
              </>
            )}
          </div>
        )}
      </SCard>

      {/* Install commands */}
      <InstallPreview config={config} />
    </div>
  );
}
