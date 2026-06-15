"use client";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";
export type DepType = "dependencies" | "devDependencies";

export interface PackageEntry {
  id: string;
  name: string;
  version: string;
  type: DepType;
  description?: string;
}

export interface PackagesConfig {
  manager: PackageManager;
  packages: PackageEntry[];
}

export const defaultPackagesConfig: PackagesConfig = {
  manager: "npm",
  packages: [
    { id: "p1", name: "next", version: "latest", type: "dependencies", description: "The React Framework" },
    { id: "p2", name: "react", version: "latest", type: "dependencies", description: "React is a JavaScript library for building user interfaces" },
    { id: "p3", name: "react-dom", version: "latest", type: "dependencies", description: "React package for working with the DOM" },
    { id: "p4", name: "typescript", version: "latest", type: "devDependencies", description: "TypeScript is a language for application-scale JavaScript" },
    { id: "p5", name: "tailwindcss", version: "latest", type: "devDependencies", description: "A utility-first CSS framework" },
  ],
};

export const PM_LABELS: Record<PackageManager, { label: string; icon: string; color: string; installCmd: string; devFlag: string }> = {
  npm:  { label: "npm",  icon: "⬡", color: "#CB3837", installCmd: "npm install",  devFlag: "--save-dev" },
  yarn: { label: "yarn", icon: "🧶", color: "#2C8EBB", installCmd: "yarn add",     devFlag: "--dev" },
  pnpm: { label: "pnpm", icon: "⚡", color: "#F69220", installCmd: "pnpm add",     devFlag: "--save-dev" },
  bun:  { label: "bun",  icon: "🍞", color: "#FBF0DF", installCmd: "bun add",      devFlag: "--dev" },
};

export function generateInstallCommands(config: PackagesConfig): string {
  const pm = PM_LABELS[config.manager];
  const deps    = config.packages.filter((p) => p.type === "dependencies");
  const devDeps = config.packages.filter((p) => p.type === "devDependencies");

  const lines: string[] = [];

  if (deps.length > 0) {
    const pkgStr = deps.map((p) => p.version === "latest" ? p.name : `${p.name}@${p.version}`).join(" ");
    lines.push(`${pm.installCmd} ${pkgStr}`);
  }
  if (devDeps.length > 0) {
    const pkgStr = devDeps.map((p) => p.version === "latest" ? p.name : `${p.name}@${p.version}`).join(" ");
    lines.push(`${pm.installCmd} ${pm.devFlag} ${pkgStr}`);
  }

  return lines.join("\n");
}

export function generatePackageMarkdown(config: PackagesConfig): string {
  const pm = PM_LABELS[config.manager];
  const deps    = config.packages.filter((p) => p.type === "dependencies");
  const devDeps = config.packages.filter((p) => p.type === "devDependencies");
  const lines: string[] = [];

  lines.push("## 📦 Package Manager & Dependencies");
  lines.push("");
  lines.push(`**Package Manager:** \`${config.manager}\``);
  lines.push("");

  if (deps.length > 0) {
    lines.push("### Dependencies");
    lines.push("");
    deps.forEach((p) => {
      lines.push(`- \`${p.name}@${p.version}\`${p.description ? ` — ${p.description}` : ""}`);
    });
    lines.push("");
  }

  if (devDeps.length > 0) {
    lines.push("### Dev Dependencies");
    lines.push("");
    devDeps.forEach((p) => {
      lines.push(`- \`${p.name}@${p.version}\`${p.description ? ` — ${p.description}` : ""}`);
    });
    lines.push("");
  }

  lines.push("### Install Commands");
  lines.push("");
  lines.push("```bash");
  lines.push(generateInstallCommands(config));
  lines.push("```");

  return lines.join("\n");
}

export function genPkgId(): string {
  return `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}
