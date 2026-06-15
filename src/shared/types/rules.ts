"use client";

export type NamingCase = "camelCase" | "PascalCase" | "kebab-case" | "snake_case" | "SCREAMING_SNAKE";

export interface FolderStructure {
  useAppRouter: boolean;
  useSrcDir: boolean;
  customFolders: string[];
  componentOrganization: "flat" | "feature-based" | "atomic";
  separateTypes: boolean;
  separateHooks: boolean;
  separateUtils: boolean;
  separateConstants: boolean;
}

export interface NamingConventions {
  components: NamingCase;
  files: NamingCase;
  functions: NamingCase;
  variables: NamingCase;
  constants: NamingCase;
  cssClasses: NamingCase;
  apiRoutes: NamingCase;
  hooks: string; // prefix like "use"
  interfaces: string; // prefix like "I" or ""
  types: string; // prefix like "T" or ""
}

export interface CodeStyle {
  language: "typescript" | "javascript";
  strictMode: boolean;
  semicolons: boolean;
  quotes: "single" | "double";
  indentSize: 2 | 4;
  maxLineLength: number;
  trailingCommas: "none" | "es5" | "all";
  arrowFunctions: boolean;
  constOverLet: boolean;
  namedExports: boolean;
  defaultExports: boolean;
  asyncAwait: boolean;
  earlyReturn: boolean;
}

export interface ComponentRules {
  preferFunctional: boolean;
  propsInterface: boolean;
  propsDestructuring: boolean;
  memoization: "none" | "selective" | "always";
  stateManagement: ("useState" | "useReducer" | "zustand" | "jotai" | "redux")[];
  serverComponents: boolean;
  clientDirective: "top" | "minimal";
  styling: ("tailwind" | "css-modules" | "styled-components" | "emotion")[];
}

export interface ImportRules {
  absoluteImports: boolean;
  importAlias: string;
  grouping: boolean;
  orderGroups: string[];
  noDefaultFromIndex: boolean;
}

export interface TestingRules {
  enabled: boolean;
  framework: "jest" | "vitest" | "none";
  testingLibrary: boolean;
  coverageThreshold: number;
  testFilePattern: "co-located" | "__tests__";
  namingPattern: "*.test.ts" | "*.spec.ts";
}

export interface PerformanceRules {
  imagePriority: boolean;
  lazyLoading: boolean;
  dynamicImports: boolean;
  bundleAnalysis: boolean;
  cacheStrategies: boolean;
}

export interface ProjectMeta {
  name: string;
  description: string;
  targetAgent: "claude" | "cursor" | "copilot" | "generic";
  version: string;
}

export interface RulesConfig {
  meta: ProjectMeta;
  folderStructure: FolderStructure;
  naming: NamingConventions;
  codeStyle: CodeStyle;
  components: ComponentRules;
  imports: ImportRules;
  testing: TestingRules;
  performance: PerformanceRules;
  customRules: string[];
}

export const defaultConfig: RulesConfig = {
  meta: {
    name: "My Next.js Project",
    description: "Project coding standards and conventions",
    targetAgent: "claude",
    version: "1.0.0",
  },
  folderStructure: {
    useAppRouter: true,
    useSrcDir: false,
    customFolders: ["components", "lib", "hooks", "types", "utils", "constants"],
    componentOrganization: "feature-based",
    separateTypes: true,
    separateHooks: true,
    separateUtils: true,
    separateConstants: true,
  },
  naming: {
    components: "PascalCase",
    files: "kebab-case",
    functions: "camelCase",
    variables: "camelCase",
    constants: "SCREAMING_SNAKE",
    cssClasses: "kebab-case",
    apiRoutes: "kebab-case",
    hooks: "use",
    interfaces: "I",
    types: "",
  },
  codeStyle: {
    language: "typescript",
    strictMode: true,
    semicolons: true,
    quotes: "double",
    indentSize: 2,
    maxLineLength: 100,
    trailingCommas: "es5",
    arrowFunctions: true,
    constOverLet: true,
    namedExports: true,
    defaultExports: false,
    asyncAwait: true,
    earlyReturn: true,
  },
  components: {
    preferFunctional: true,
    propsInterface: true,
    propsDestructuring: true,
    memoization: "selective",
    stateManagement: ["useState", "zustand"],
    serverComponents: true,
    clientDirective: "minimal",
    styling: ["tailwind"],
  },
  imports: {
    absoluteImports: true,
    importAlias: "@",
    grouping: true,
    orderGroups: ["react", "next", "external", "internal", "relative", "types", "styles"],
    noDefaultFromIndex: true,
  },
  testing: {
    enabled: true,
    framework: "vitest",
    testingLibrary: true,
    coverageThreshold: 80,
    testFilePattern: "__tests__",
    namingPattern: "*.test.ts",
  },
  performance: {
    imagePriority: true,
    lazyLoading: true,
    dynamicImports: true,
    bundleAnalysis: false,
    cacheStrategies: true,
  },
  customRules: [],
};
