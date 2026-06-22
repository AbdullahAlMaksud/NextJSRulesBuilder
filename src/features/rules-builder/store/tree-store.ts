"use client";

export type NodeType = "folder" | "file";

export interface TreeNode {
  id: string;
  name: string;
  type: NodeType;
  children?: TreeNode[];
  expanded?: boolean;
}

let idCounter = 1;
export function genId(): string {
  return `node_${Date.now()}_${idCounter++}`;
}

// ─── Default tree ─────────────────────────────────────────────────────────────
export const defaultTree: TreeNode[] = [
  {
    id: "root1", name: "my-project", type: "folder", expanded: true, children: [
      {
        id: "src1", name: "src", type: "folder", expanded: true, children: [
          {
            id: "app1", name: "app", type: "folder", expanded: true, children: [
              {
                id: "auth1", name: "(auth)", type: "folder", expanded: true, children: [
                  { id: "signin1", name: "signin", type: "folder", expanded: false, children: [] },
                  { id: "signup1", name: "signup", type: "folder", expanded: false, children: [] },
                ],
              },
              {
                id: "dash1", name: "(dashboard)", type: "folder", expanded: true, children: [
                  { id: "admin1", name: "admin", type: "folder", expanded: false, children: [] },
                  { id: "user1", name: "user", type: "folder", expanded: false, children: [] },
                ],
              },
              { id: "main1", name: "(main)", type: "folder", expanded: false, children: [] },
              { id: "layout1", name: "layout.tsx", type: "file" },
              { id: "page1", name: "page.tsx", type: "file" },
            ],
          },
          {
            id: "comp1", name: "components", type: "folder", expanded: true, children: [
              { id: "ui1", name: "ui", type: "folder", expanded: false, children: [] },
              {
                id: "common1", name: "common", type: "folder", expanded: true, children: [
                  { id: "nav1", name: "navbar.tsx", type: "file" },
                  { id: "foot1", name: "footer.tsx", type: "file" },
                ],
              },
            ],
          },
          {
            id: "feat1", name: "features", type: "folder", expanded: true, children: [
              {
                id: "feat1_1", name: "feature-1", type: "folder", expanded: true, children: [
                  { id: "feat1_1_hooks", name: "hooks", type: "folder", expanded: false, children: [] },
                  { id: "feat1_1_comps", name: "components", type: "folder", expanded: false, children: [] },
                  { id: "feat1_1_srvs", name: "services", type: "folder", expanded: false, children: [] },
                  { id: "feat1_1_types", name: "types", type: "folder", expanded: false, children: [] },
                  { id: "feat1_1_utils", name: "utils", type: "folder", expanded: false, children: [] },
                  { id: "feat1_1_scr", name: "feature-1-screen.tsx", type: "file" },
                  { id: "feat1_1_idx", name: "index.ts", type: "file" },
                ],
              },
              {
                id: "feat1_2", name: "feature-2", type: "folder", expanded: true, children: [
                  { id: "feat1_2_idx", name: "index.ts", type: "file" },
                  { id: "feat1_2_comps", name: "components", type: "folder", expanded: false, children: [] },
                  { id: "feat1_2_scr", name: "feature-2-screen.tsx", type: "file" },
                ],
              },
            ],
          },
          {
            id: "shared1", name: "shared", type: "folder", expanded: true, children: [
              { id: "shared1_lib", name: "lib", type: "folder", expanded: false, children: [] },
              { id: "shared1_hooks", name: "hooks", type: "folder", expanded: false, children: [] },
              { id: "shared1_types", name: "types", type: "folder", expanded: false, children: [] },
            ],
          },
        ],
      },
    ],
  },
];

// ─── Tree utilities ────────────────────────────────────────────────────────────

export function cloneTree(nodes: TreeNode[]): TreeNode[] {
  return JSON.parse(JSON.stringify(nodes));
}

export function findNode(nodes: TreeNode[], id: string): TreeNode | null {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return null;
}

export function removeNode(nodes: TreeNode[], id: string): { tree: TreeNode[]; removed: TreeNode | null } {
  let removed: TreeNode | null = null;
  const filter = (arr: TreeNode[]): TreeNode[] =>
    arr.filter((n) => {
      if (n.id === id) { removed = n; return false; }
      if (n.children) n.children = filter(n.children);
      return true;
    });
  return { tree: filter(nodes), removed };
}

export function insertNode(nodes: TreeNode[], parentId: string | null, node: TreeNode, index?: number): TreeNode[] {
  if (!parentId) {
    const arr = [...nodes];
    arr.splice(index ?? arr.length, 0, node);
    return arr;
  }
  return nodes.map((n) => {
    if (n.id === parentId) {
      const children = [...(n.children || [])];
      children.splice(index ?? children.length, 0, node);
      return { ...n, children, expanded: true };
    }
    if (n.children) return { ...n, children: insertNode(n.children, parentId, node, index) };
    return n;
  });
}

export function updateNode(nodes: TreeNode[], id: string, patch: Partial<TreeNode>): TreeNode[] {
  return nodes.map((n) => {
    if (n.id === id) return { ...n, ...patch };
    if (n.children) return { ...n, children: updateNode(n.children, id, patch) };
    return n;
  });
}

// ─── ASCII Generator ──────────────────────────────────────────────────────────

export function generateASCII(nodes: TreeNode[], prefix = "", isLast = false, isRoot = true): string {
  let result = "";
  nodes.forEach((node, i) => {
    const last = i === nodes.length - 1;
    const connector = isRoot ? "" : last ? "└── " : "├── ";
    const icon = node.type === "folder" ? "📁 " : "📄 ";
    result += `${prefix}${connector}${node.name}\n`;
    if (node.type === "folder" && node.children && node.children.length > 0) {
      const childPrefix = isRoot ? "" : prefix + (last ? "    " : "│   ");
      result += generateASCII(node.children, childPrefix, last, false);
    }
  });
  return result;
}

export function generateMarkdownTree(nodes: TreeNode[], prefix = "", isRoot = true): string {
  let result = "";
  nodes.forEach((node, i) => {
    const last = i === nodes.length - 1;
    const connector = isRoot ? "" : last ? "└── " : "├── ";
    result += `${prefix}${connector}${node.name}${node.type === "folder" ? "/" : ""}\n`;
    if (node.type === "folder" && node.children && node.children.length > 0) {
      const childPrefix = isRoot ? "" : prefix + (last ? "    " : "│   ");
      result += generateMarkdownTree(node.children, childPrefix, false);
    }
  });
  return result;
}

// ─── Flatten for DnD ─────────────────────────────────────────────────────────

export interface FlatNode {
  id: string;
  name: string;
  type: NodeType;
  parentId: string | null;
  depth: number;
  index: number;
  hasChildren: boolean;
  expanded: boolean;
}

export function flattenTree(nodes: TreeNode[], parentId: string | null = null, depth = 0): FlatNode[] {
  const result: FlatNode[] = [];
  nodes.forEach((node, index) => {
    result.push({
      id: node.id,
      name: node.name,
      type: node.type,
      parentId,
      depth,
      index,
      hasChildren: !!(node.children && node.children.length > 0),
      expanded: !!node.expanded,
    });
    if (node.type === "folder" && node.expanded && node.children) {
      result.push(...flattenTree(node.children, node.id, depth + 1));
    }
  });
  return result;
}
