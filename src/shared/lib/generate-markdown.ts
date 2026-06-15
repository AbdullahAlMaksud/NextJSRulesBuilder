import type { RulesConfig } from "../store/rulesStore";
import type { PackagesConfig } from "../store/packagesStore";
import { generatePackageMarkdown } from "../store/packagesStore";

export function generateMarkdown(config: RulesConfig, packagesConfig?: PackagesConfig): string {
  const { meta, folderStructure, naming, codeStyle, components, imports, testing, performance, customRules } = config;

  const agentHeader: Record<string, string> = {
    claude: "# CLAUDE.md",
    cursor: "# .cursorrules",
    copilot: "# GitHub Copilot Instructions",
    generic: "# PROJECT_RULES.md",
  };

  const agentNote: Record<string, string> = {
    claude: `<!-- This file is read by Claude as project-level instructions -->\n<!-- Place this file at the root of your project -->\n`,
    cursor: `<!-- This file configures Cursor AI behavior for this project -->\n<!-- Place as .cursorrules at project root -->\n`,
    copilot: `<!-- Place at .github/copilot-instructions.md -->\n`,
    generic: `<!-- AI Agent Rules File - compatible with Claude, Cursor, and most AI coding agents -->\n`,
  };

  const lines: string[] = [];

  lines.push(agentHeader[meta.targetAgent]);
  lines.push("");
  lines.push(agentNote[meta.targetAgent]);
  lines.push(`# ${meta.name}`);
  lines.push("");
  lines.push(`> ${meta.description}`);
  lines.push(`> Version: ${meta.version}`);
  lines.push("");
  lines.push("---");
  lines.push("");

  // Project Overview
  lines.push("## 🗂️ Project Overview");
  lines.push("");
  lines.push(`This is a **Next.js** project using the **${folderStructure.useAppRouter ? "App Router" : "Pages Router"}**.`);
  lines.push(`Language: **${codeStyle.language === "typescript" ? "TypeScript" : "JavaScript"}**${codeStyle.strictMode ? " (strict mode)" : ""}`);
  lines.push(`Styling: **${components.styling.join(", ")}**`);
  lines.push("");

  // Folder Structure
  lines.push("## 📁 Folder Structure");
  lines.push("");
  lines.push("```");
  lines.push(`${folderStructure.useSrcDir ? "src/" : ""}${folderStructure.useAppRouter ? "app/" : "pages/"}`);
  if (folderStructure.componentOrganization === "feature-based") {
    lines.push("  ├── (auth)/           # Route groups");
    lines.push("  ├── (dashboard)/");
    lines.push("  ├── layout.tsx");
    lines.push("  └── page.tsx");
  } else if (folderStructure.componentOrganization === "atomic") {
    lines.push("  └── ...");
    lines.push("components/");
    lines.push("  ├── atoms/");
    lines.push("  ├── molecules/");
    lines.push("  └── organisms/");
  } else {
    lines.push("  └── ...");
    lines.push("components/");
    lines.push("  ├── Button.tsx");
    lines.push("  └── Card.tsx");
  }

  const rootFolders = folderStructure.customFolders;
  rootFolders.forEach((folder) => {
    const icons: Record<string, string> = {
      components: "# Shared UI components",
      lib: "# Third-party library configs",
      hooks: "# Custom React hooks",
      types: "# TypeScript type definitions",
      utils: "# Pure utility functions",
      constants: "# App-wide constants",
      services: "# API service layers",
      store: "# State management",
      styles: "# Global styles",
    };
    if (!["app", "pages"].includes(folder)) {
      lines.push(`${folder}/           ${icons[folder] || ""}`);
    }
  });
  lines.push("```");
  lines.push("");

  lines.push(`**Component organization:** ${folderStructure.componentOrganization}`);
  if (folderStructure.separateTypes) lines.push("- Keep type definitions in dedicated `types/` files");
  if (folderStructure.separateHooks) lines.push("- Custom hooks live in `hooks/` directory, prefixed with `use`");
  if (folderStructure.separateUtils) lines.push("- Utility functions in `utils/` — pure functions only, no side effects");
  if (folderStructure.separateConstants) lines.push("- Constants in `constants/` — never inline magic strings or numbers");
  lines.push("");

  // Naming Conventions
  lines.push("## ✏️ Naming Conventions");
  lines.push("");
  lines.push("| Entity | Convention | Example |");
  lines.push("|--------|-----------|---------|");

  const examples: Record<string, Record<string, string>> = {
    "PascalCase": { components: "UserProfile", files: "UserProfile", functions: "GetUserData", variables: "UserData", constants: "UserData", cssClasses: "UserProfile", apiRoutes: "UserProfile" },
    "camelCase": { components: "userProfile", files: "userProfile", functions: "getUserData", variables: "userData", constants: "userData", cssClasses: "userProfile", apiRoutes: "userProfile" },
    "kebab-case": { components: "user-profile", files: "user-profile", functions: "get-user-data", variables: "user-data", constants: "user-data", cssClasses: "user-profile", apiRoutes: "user-profile" },
    "snake_case": { components: "user_profile", files: "user_profile", functions: "get_user_data", variables: "user_data", constants: "user_data", cssClasses: "user_profile", apiRoutes: "user_profile" },
    "SCREAMING_SNAKE": { components: "USER_PROFILE", files: "USER_PROFILE", functions: "GET_USER_DATA", variables: "USER_DATA", constants: "USER_DATA", cssClasses: "USER_PROFILE", apiRoutes: "USER_PROFILE" },
  };

  lines.push(`| Components | \`${naming.components}\` | \`${examples[naming.components]?.components ?? "UserCard"}\` |`);
  lines.push(`| Files | \`${naming.files}\` | \`${examples[naming.files]?.files ?? "user-card"}.tsx\` |`);
  lines.push(`| Functions | \`${naming.functions}\` | \`${examples[naming.functions]?.functions ?? "getUserData"}()\` |`);
  lines.push(`| Variables | \`${naming.variables}\` | \`${examples[naming.variables]?.variables ?? "userData"}\` |`);
  lines.push(`| Constants | \`${naming.constants}\` | \`${examples[naming.constants]?.constants ?? "MAX_RETRIES"}\` |`);
  lines.push(`| CSS Classes | \`${naming.cssClasses}\` | \`.${examples[naming.cssClasses]?.cssClasses ?? "btn-primary"}\` |`);
  lines.push(`| API Routes | \`${naming.apiRoutes}\` | \`/api/${examples[naming.apiRoutes]?.apiRoutes ?? "user-profile"}\` |`);
  lines.push(`| React Hooks | prefix \`${naming.hooks}\` | \`${naming.hooks}UserProfile()\` |`);
  if (naming.interfaces) lines.push(`| Interfaces | prefix \`${naming.interfaces}\` | \`${naming.interfaces}UserProps\` |`);
  if (naming.types) lines.push(`| Types | prefix \`${naming.types}\` | \`${naming.types}UserData\` |`);
  lines.push("");

  // Code Style
  lines.push("## 🎨 Code Style");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify({
    semi: codeStyle.semicolons,
    singleQuote: codeStyle.quotes === "single",
    tabWidth: codeStyle.indentSize,
    printWidth: codeStyle.maxLineLength,
    trailingComma: codeStyle.trailingCommas,
    arrowParens: "always",
  }, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("**Rules:**");
  if (codeStyle.arrowFunctions) lines.push("- Prefer arrow functions over `function` declarations for callbacks");
  if (codeStyle.constOverLet) lines.push("- Use `const` by default, `let` only when reassignment is necessary, never `var`");
  if (codeStyle.namedExports) lines.push("- Prefer named exports over default exports for better refactoring support");
  if (codeStyle.defaultExports) lines.push("- Use default exports for page components and layouts");
  if (codeStyle.asyncAwait) lines.push("- Use `async/await` over `.then()/.catch()` chains");
  if (codeStyle.earlyReturn) lines.push("- Use early returns to reduce nesting depth — avoid deeply nested conditionals");
  lines.push(`- Max line length: **${codeStyle.maxLineLength}** characters`);
  lines.push(`- Indent size: **${codeStyle.indentSize}** spaces`);
  lines.push("");

  // Component Rules
  lines.push("## ⚛️ Component Guidelines");
  lines.push("");
  if (components.preferFunctional) lines.push("- **Always use functional components** — class components are not permitted");
  if (components.propsInterface) {
    lines.push(`- Define a props interface for every component: \`${naming.interfaces}${naming.interfaces ? "ComponentName" : "ComponentName"}Props\``);
  }
  if (components.propsDestructuring) lines.push("- Destructure props in the function signature");
  if (components.serverComponents) {
    lines.push(`- Default to **Server Components** — add \`'use client'\` directive ${components.clientDirective === "minimal" ? "only when necessary (event handlers, hooks, browser APIs)" : "at the top of the file"}`);
  }
  lines.push(`- **Memoization strategy:** ${components.memoization}`);
  if (components.memoization === "selective") {
    lines.push("  - Use `React.memo` for components that re-render frequently with same props");
    lines.push("  - Use `useMemo` for expensive computations");
    lines.push("  - Use `useCallback` for callbacks passed as props");
  }
  lines.push("");
  lines.push("**State Management:**");
  components.stateManagement.forEach((sm) => {
    const notes: Record<string, string> = {
      useState: "Local component state",
      useReducer: "Complex local state with multiple sub-values",
      zustand: "Global client state — keep stores small and focused",
      jotai: "Atomic global state",
      redux: "Large-scale state with Redux Toolkit only",
    };
    lines.push(`- \`${sm}\` — ${notes[sm] || ""}`);
  });
  lines.push("");

  // Imports
  lines.push("## 📦 Import Rules");
  lines.push("");
  if (imports.absoluteImports) {
    lines.push(`- Use absolute imports with alias \`${imports.importAlias}\` for all internal modules`);
    lines.push(`  - ✅ \`import { Button } from '${imports.importAlias}/components/Button'\``);
    lines.push(`  - ❌ \`import { Button } from '../../../components/Button'\``);
  }
  if (imports.noDefaultFromIndex) lines.push("- Do not use barrel `index.ts` files that re-export everything — import directly from the file");
  if (imports.grouping) {
    lines.push("");
    lines.push("**Import order (with blank line between groups):**");
    imports.orderGroups.forEach((group, i) => {
      lines.push(`${i + 1}. ${group}`);
    });
  }
  lines.push("");

  // Testing
  if (testing.enabled) {
    lines.push("## 🧪 Testing");
    lines.push("");
    lines.push(`- **Framework:** ${testing.framework}`);
    if (testing.testingLibrary) lines.push("- **Testing Library:** @testing-library/react");
    lines.push(`- **Coverage threshold:** ${testing.coverageThreshold}%`);
    lines.push(`- **Test files:** ${testing.testFilePattern === "co-located" ? "Co-located next to source files" : "In `__tests__/` directory"}`);
    lines.push(`- **Naming:** \`${testing.namingPattern}\``);
    lines.push("");
    lines.push("**Guidelines:**");
    lines.push("- Test behavior, not implementation details");
    lines.push("- One describe block per component/function");
    lines.push("- Use descriptive test names: `it('should show error when email is invalid')`");
    lines.push("");
  }

  // Performance
  lines.push("## ⚡ Performance");
  lines.push("");
  if (performance.imagePriority) lines.push("- Add `priority` prop to above-the-fold `<Image>` components");
  if (performance.lazyLoading) lines.push("- Lazy load images and components below the fold");
  if (performance.dynamicImports) lines.push("- Use `next/dynamic` for large client-side components to reduce initial bundle");
  if (performance.cacheStrategies) lines.push("- Leverage Next.js caching: `fetch` with `cache` and `revalidate` options in Server Components");
  if (performance.bundleAnalysis) lines.push("- Run `@next/bundle-analyzer` before merging PRs that add large dependencies");
  lines.push("");

  // Custom Rules
  if (customRules.length > 0) {
    lines.push("## 📋 Custom Rules");
    lines.push("");
    customRules.forEach((rule) => {
      if (rule.trim()) lines.push(`- ${rule.trim()}`);
    });
    lines.push("");
  }

  // Packages section
  if (packagesConfig && packagesConfig.packages.length > 0) {
    lines.push(generatePackageMarkdown(packagesConfig));
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push(`*Generated by [Next.js Rules Builder](https://github.com) — ${new Date().toISOString().split("T")[0]}*`);

  return lines.join("\n");
}
