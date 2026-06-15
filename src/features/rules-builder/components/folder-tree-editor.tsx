"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  DndContext, DragEndEvent, DragStartEvent, PointerSensor,
  useSensor, useSensors, DragOverlay, closestCenter,
} from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronRight, ChevronDown, Folder, FolderOpen, File,
  Trash2, Edit2, Check, X, FolderPlus, FilePlus,
  GripVertical, Copy, Upload, Terminal,
} from "lucide-react";
import {
  TreeNode, FlatNode, genId, cloneTree, findNode,
  removeNode, insertNode, updateNode, flattenTree, generateASCII, defaultTree,
} from "../store/treeStore";
import { useTheme } from "../store/themeStore";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileColor(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  const map: Record<string, string> = {
    tsx: "#61DAFB", ts: "#3178C6", jsx: "#61DAFB", js: "#F7DF1E",
    css: "#1572B6", scss: "#CC6699", json: "#FAD000", md: "#083FA1",
    png: "#FF6B6B", jpg: "#FF6B6B", svg: "#FFB020", env: "#ECD53F",
    gitignore: "#F05032", lock: "#888",
  };
  return map[ext] || "#94A3B8";
}

function FolderIco({ open, special }: { open: boolean; special?: boolean }) {
  const color = special ? "#F97316" : "#F59E0B";
  return open ? <FolderOpen size={15} style={{ color }} /> : <Folder size={15} style={{ color }} />;
}
function FileIco({ name }: { name: string }) {
  return <File size={13} style={{ color: fileColor(name) }} />;
}

// ─── Inline input ─────────────────────────────────────────────────────────────

function InlineInput({ type, depth, onConfirm, onCancel }: {
  type: "folder" | "file"; depth: number;
  onConfirm: (name: string) => void; onCancel: () => void;
}) {
  const [val, setVal] = useState("");
  const ref = useRef<HTMLInputElement>(null);
  const { theme: t } = useTheme();

  useEffect(() => { ref.current?.focus(); }, []);

  const confirm = () => { const n = val.trim(); if (n) onConfirm(n); else onCancel(); };

  return (
    <div className="flex items-center gap-1 py-[3px] pr-2 my-0.5 mx-0.5 rounded-lg"
      style={{ background: t.accent + "15", border: `1px solid ${t.accent}40` }}>
      <div className="w-[18px] shrink-0" />
      <div style={{ width: depth * 16 + 8 }} className="shrink-0" />
      <div className="w-4 shrink-0" />
      <div className="shrink-0">
        {type === "folder" ? <FolderIco open special={false} /> : <FileIco name={val || "file.tsx"} />}
      </div>
      <input ref={ref} value={val} onChange={(e) => setVal(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); confirm(); } if (e.key === "Escape") { e.preventDefault(); onCancel(); } }}
        onBlur={confirm}
        placeholder={type === "folder" ? "folder-name" : "file.tsx"}
        className="flex-1 min-w-0 px-1.5 py-0.5 text-xs font-mono rounded outline-none"
        style={{ background: t.surface, color: t.text, border: `1px solid ${t.accent}` }} />
      <button onMouseDown={(e) => { e.preventDefault(); confirm(); }} className="p-1 rounded shrink-0" style={{ color: "#22C55E" }}><Check size={12} /></button>
      <button onMouseDown={(e) => { e.preventDefault(); onCancel(); }} className="p-1 rounded shrink-0" style={{ color: t.textMuted }}><X size={12} /></button>
    </div>
  );
}

// ─── Tree Row ─────────────────────────────────────────────────────────────────

interface RowProps {
  flat: FlatNode;
  onToggle: (id: string) => void;
  onAdd: (parentId: string, type: "folder" | "file") => void;
  onRename: (id: string, name: string) => void;
  onDelete: (id: string) => void;
  renaming: string | null;
  setRenaming: (id: string | null) => void;
  isDropTarget: boolean;
}

function TreeRow({ flat, onToggle, onAdd, onRename, onDelete, renaming, setRenaming, isDropTarget }: RowProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: flat.id });
  const [nameInput, setNameInput] = useState(flat.name);
  const inputRef = useRef<HTMLInputElement>(null);
  const [hovered, setHovered] = useState(false);
  const { theme: t } = useTheme();

  useEffect(() => {
    if (renaming === flat.id) { setNameInput(flat.name); setTimeout(() => inputRef.current?.select(), 20); }
  }, [renaming, flat.id, flat.name]);

  const confirmRename = () => {
    const n = nameInput.trim();
    if (n && n !== flat.name) onRename(flat.id, n);
    setRenaming(null);
  };

  const isFolder = flat.type === "folder";
  const isSpecial = flat.name.startsWith("(") || flat.name.startsWith("[");
  const indent = flat.depth * 16 + 8;

  return (
    <div ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.2 : 1,
        background: isDropTarget && !isDragging ? t.accent + "15" : hovered && !isDragging ? t.accent + "10" : "transparent",
        borderRadius: 8,
        display: "flex", alignItems: "center", gap: 4, padding: "2px 8px 2px 0",
        outline: isDropTarget ? `1px solid ${t.accent}40` : undefined,
      }}
      className="group select-none w-full"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: "contents" }}>
        <div {...attributes} {...listeners}
          className="flex items-center justify-center w-[18px] h-full shrink-0 cursor-grab active:cursor-grabbing pl-0.5 opacity-0 group-hover:opacity-40 hover:!opacity-80"
          onClick={(e) => e.stopPropagation()}>
          <GripVertical size={12} style={{ color: t.textMuted }} />
        </div>

        <div style={{ width: indent }} className="shrink-0" />

        <div className="w-4 shrink-0 flex items-center justify-center cursor-pointer"
          onClick={(e) => { e.stopPropagation(); isFolder && onToggle(flat.id); }}>
          {isFolder ? (flat.expanded ? <ChevronDown size={13} style={{ color: t.textMuted }} /> : <ChevronRight size={13} style={{ color: t.textMuted }} />) : null}
        </div>

        <div className="shrink-0 cursor-pointer" onClick={(e) => { e.stopPropagation(); isFolder && onToggle(flat.id); }}>
          {isFolder ? <FolderIco open={!!flat.expanded} special={isSpecial} /> : <FileIco name={flat.name} />}
        </div>

        {renaming === flat.id ? (
          <input ref={inputRef} value={nameInput} onChange={(e) => setNameInput(e.target.value)}
            onBlur={confirmRename}
            onKeyDown={(e) => { if (e.key === "Enter") confirmRename(); if (e.key === "Escape") setRenaming(null); }}
            className="flex-1 min-w-0 px-1 py-0 text-xs font-mono rounded outline-none"
            style={{ background: t.surface, color: t.text, border: `1px solid ${t.accent}` }}
            onClick={(e) => e.stopPropagation()} />
        ) : (
          <span
            className="flex-1 min-w-0 truncate text-xs font-mono cursor-pointer"
            style={{ color: isSpecial ? "#F97316" : isFolder ? t.text : t.textMuted }}
            onDoubleClick={() => setRenaming(flat.id)}
            onClick={(e) => { e.stopPropagation(); isFolder && onToggle(flat.id); }}>
            {flat.name}
          </span>
        )}

        {hovered && renaming !== flat.id && !isDragging && (
          <div className="flex items-center gap-0.5 shrink-0 ml-1">
            {isFolder && (
              <>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(flat.id, "folder"); }}
                  className="p-1 rounded transition-colors"
                  style={{ color: t.textMuted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#F59E0B")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = t.textMuted)}
                  title="New folder inside"><FolderPlus size={12} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onAdd(flat.id, "file"); }}
                  className="p-1 rounded transition-colors"
                  style={{ color: t.textMuted }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "#3178C6")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = t.textMuted)}
                  title="New file inside"><FilePlus size={12} /></button>
              </>
            )}
            <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setRenaming(flat.id); }}
              className="p-1 rounded transition-colors" style={{ color: t.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = t.text)}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.textMuted)}
              title="Rename"><Edit2 size={12} /></button>
            <button onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(flat.id); }}
              className="p-1 rounded transition-colors" style={{ color: t.textMuted }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
              onMouseLeave={(e) => (e.currentTarget.style.color = t.textMuted)}
              title="Delete"><Trash2 size={12} /></button>
          </div>
        )}

        {/* Active indicator */}
        {false && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-4 rounded-l-full"
            style={{ background: t.accent }} />
        )}
      </div>
    </div>
  );
}

// ─── Adding state ─────────────────────────────────────────────────────────────

interface AddingState {
  parentId: string | null;
  type: "folder" | "file";
  insertAfterFlatIdx: number;
  depth: number;
}

function buildAddingState(tree: TreeNode[], parentId: string | null, type: "folder" | "file"): AddingState {
  const currentFlat = flattenTree(tree);
  if (parentId === null) return { parentId: null, type, insertAfterFlatIdx: currentFlat.length - 1, depth: 0 };
  const parentIdx = currentFlat.findIndex((f) => f.id === parentId);
  if (parentIdx === -1) return { parentId, type, insertAfterFlatIdx: currentFlat.length - 1, depth: 0 };
  const parentDepth = currentFlat[parentIdx].depth;
  const childDepth = parentDepth + 1;
  let lastDescIdx = parentIdx;
  for (let i = parentIdx + 1; i < currentFlat.length; i++) {
    if (currentFlat[i].depth <= parentDepth) break;
    lastDescIdx = i;
  }
  return { parentId, type, insertAfterFlatIdx: lastDescIdx, depth: childDepth };
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function FolderTreeEditor() {
  const [tree, setTree] = useState<TreeNode[]>(cloneTree(defaultTree));
  const [renaming, setRenaming] = useState<string | null>(null);
  const [adding, setAdding] = useState<AddingState | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [view, setView] = useState<"editor" | "ascii">("editor");
  const [copied, setCopied] = useState(false);
  const { theme: t } = useTheme();

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const startAdd = useCallback((parentId: string, type: "folder" | "file") => {
    setTree((prev) => {
      const expanded = updateNode(cloneTree(prev), parentId, { expanded: true });
      const state = buildAddingState(expanded, parentId, type);
      setTimeout(() => setAdding(state), 0);
      return expanded;
    });
  }, []);

  const startAddRoot = useCallback((type: "folder" | "file") => {
    setTree((prev) => {
      const state = buildAddingState(prev, null, type);
      setTimeout(() => setAdding(state), 0);
      return prev;
    });
  }, []);

  const confirmAdd = useCallback((name: string) => {
    if (!adding) return;
    const node: TreeNode = {
      id: genId(), name, type: adding.type,
      ...(adding.type === "folder" ? { children: [], expanded: false } : {}),
    };
    setTree((prev) => insertNode(cloneTree(prev), adding.parentId, node));
    setAdding(null);
  }, [adding]);

  const toggle = useCallback((id: string) => {
    setTree((prev) => {
      const node = findNode(prev, id);
      return updateNode(cloneTree(prev), id, { expanded: !node?.expanded });
    });
  }, []);

  const handleRename = useCallback((id: string, name: string) => {
    setTree((prev) => updateNode(cloneTree(prev), id, { name }));
  }, []);

  const handleDelete = useCallback((id: string) => {
    setTree((prev) => removeNode(cloneTree(prev), id).tree);
  }, []);

  const handleDragStart = ({ active }: DragStartEvent) => { setActiveId(String(active.id)); setAdding(null); };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null); setDragOverId(null);
    if (!over || active.id === over.id) return;
    const freshFlat = flattenTree(tree);
    const activeFlat = freshFlat.find((f) => f.id === active.id);
    const overFlat = freshFlat.find((f) => f.id === over.id);
    if (!activeFlat || !overFlat) return;
    setTree((prev) => {
      const t2 = cloneTree(prev);
      const { tree: removed, removed: node } = removeNode(t2, String(active.id));
      if (!node) return prev;
      if (overFlat.type === "folder" && overFlat.id !== activeFlat.parentId) return insertNode(removed, overFlat.id, node, 0);
      return insertNode(removed, overFlat.parentId, node, overFlat.index);
    });
  };

  const handleUpload = () => {
    const input = document.createElement("input");
    input.type = "file";
    (input as any).webkitdirectory = true;
    input.multiple = true;
    input.onchange = () => {
      const files = Array.from(input.files || []);
      if (!files.length) return;
      const built: TreeNode[] = [];
      const map = new Map<string, TreeNode>();
      files.forEach((f) => {
        const parts = ((f as any).webkitRelativePath as string).split("/");
        let parent: TreeNode[] = built;
        parts.forEach((part, i) => {
          const isFile = i === parts.length - 1;
          const key = parts.slice(0, i + 1).join("/");
          if (!map.has(key)) {
            const n: TreeNode = { id: genId(), name: part, type: isFile ? "file" : "folder", ...(isFile ? {} : { children: [], expanded: i < 3 }) };
            map.set(key, n); parent.push(n);
          }
          if (!isFile) parent = map.get(key)!.children!;
        });
      });
      if (built.length) setTree(built);
    };
    input.click();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText("```\n" + generateASCII(tree) + "```");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const flat = flattenTree(tree);

  type DisplayRow = { kind: "node"; flat: FlatNode } | { kind: "input"; depth: number };
  const displayRows: DisplayRow[] = [];
  flat.forEach((f, idx) => {
    displayRows.push({ kind: "node", flat: f });
    if (adding && idx === adding.insertAfterFlatIdx) displayRows.push({ kind: "input", depth: adding.depth });
  });
  if (adding && adding.insertAfterFlatIdx >= flat.length) displayRows.push({ kind: "input", depth: adding.depth });

  const activeNode = activeId ? flat.find((f) => f.id === activeId) : null;

  const btnStyle = {
    background: t.bgSecondary,
    color: t.text,
    border: `1px solid ${t.surfaceBorder}`,
  };

  return (
    <div className="flex flex-col h-full" style={{ background: t.surface }}>
      {/* Toolbar */}
      <div className="flex items-center justify-between px-4 py-2 shrink-0"
        style={{ borderBottom: `1px solid ${t.surfaceBorder}`, background: t.bgSecondary + "80" }}>
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* View toggle */}
          <div className="flex rounded-xl p-0.5 mr-1" style={{ background: t.bgSecondary, border: `1px solid ${t.surfaceBorder}` }}>
            {(["editor", "ascii"] as const).map((v) => (
              <button key={v} onClick={() => setView(v)}
                className="px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5"
                style={{
                  background: view === v ? t.surface : "transparent",
                  color: view === v ? t.text : t.textMuted,
                  boxShadow: view === v ? `0 1px 4px ${t.accent}20` : undefined,
                }}>
                {v === "editor" ? <><Folder size={12} /> Visual</> : <><Terminal size={12} /> ASCII</>}
              </button>
            ))}
          </div>

          {view === "editor" && (
            <>
              <button onClick={() => startAddRoot("folder")} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors" style={btnStyle}>
                <FolderPlus size={13} /> New Folder
              </button>
              <button onClick={() => startAddRoot("file")} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors" style={btnStyle}>
                <FilePlus size={13} /> New File
              </button>
              <button onClick={handleUpload} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors" style={btnStyle}>
                <Upload size={13} /> Import
              </button>
            </>
          )}
        </div>

        <button onClick={handleCopy} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition-colors"
          style={{ background: t.accent, color: "#fff" }}>
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied!" : "Copy MD"}
        </button>
      </div>

      {/* Editor */}
      {view === "editor" ? (
        <div className="flex-1 overflow-y-auto p-2" data-lenis-prevent>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={flat.map((f) => f.id)} strategy={verticalListSortingStrategy}>
              {displayRows.map((row, i) =>
                row.kind === "input" ? (
                  <InlineInput key="__inline_input__" type={adding!.type} depth={row.depth} onConfirm={confirmAdd} onCancel={() => setAdding(null)} />
                ) : (
                  <TreeRow key={row.flat.id} flat={row.flat} onToggle={toggle} onAdd={startAdd}
                    onRename={handleRename} onDelete={handleDelete} renaming={renaming} setRenaming={setRenaming}
                    isDropTarget={dragOverId === row.flat.id} />
                )
              )}
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeNode && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono pointer-events-none shadow-2xl"
                  style={{ background: t.surface, color: t.text, border: `1px solid ${t.accent}60` }}>
                  {activeNode.type === "folder" ? <FolderIco open special={activeNode.name.startsWith("(")} /> : <FileIco name={activeNode.name} />}
                  <span>{activeNode.name}</span>
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {flat.length === 0 && !adding && (
            <div className="flex flex-col items-center justify-center py-16" style={{ color: t.textMuted }}>
              <FolderOpen size={32} className="mb-3 opacity-30" />
              <p className="text-xs">Empty — add a folder or import your project</p>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto" data-lenis-prevent>
          <pre className="p-4 text-xs font-mono leading-relaxed whitespace-pre min-h-full"
            style={{ color: t.textMuted, background: t.bgSecondary + "40" }}>
            {generateASCII(tree) || "// No structure yet"}
          </pre>
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-1.5 flex items-center shrink-0"
        style={{ borderTop: `1px solid ${t.surfaceBorder}`, background: t.bgSecondary + "40" }}>
        <span className="text-[11px]" style={{ color: t.textMuted }}>
          Double-click to rename · Drag to move · Hover for actions
        </span>
        <span className="text-[11px] ml-auto" style={{ color: t.textMuted }}>{flat.length} items</span>
      </div>
    </div>
  );
}
