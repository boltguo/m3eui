import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, extname, join, resolve } from "node:path";
import {
  type M3EConfig,
  generateM3EStaticThemeCss,
  resolveM3EConfig,
  serializeM3EConfig,
} from "../config.js";
import { M3E_BUILT_IN_LOCALES, enUSMessages } from "../i18n/index.js";
import {
  type ColorSchemeVariant,
  type ColorSpecVersion,
  M3E_COLOR_SCHEME_VARIANTS,
  M3E_COLOR_SPEC_VERSIONS,
  type MotionSchemeName,
} from "../tokens/index.js";

export const VALID_SCHEME_VARIANTS: readonly ColorSchemeVariant[] =
  M3E_COLOR_SCHEME_VARIANTS;

export const VALID_SPEC_VERSIONS: readonly ColorSpecVersion[] =
  M3E_COLOR_SPEC_VERSIONS;

export const VALID_MOTION_SCHEMES: readonly MotionSchemeName[] = [
  "expressive",
  "standard",
];

const HEX_SEED_RE = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const CJK_RE = /[\u3400-\u9FFF\uF900-\uFAFF]/;

export interface DoctorCheckResult {
  readonly ok: boolean;
  readonly checks: readonly {
    readonly name: string;
    readonly passed: boolean;
    readonly detail: string;
  }[];
}

export interface InitProjectOptions {
  readonly cwd: string;
  readonly seedHex?: string;
  readonly schemeVariant?: ColorSchemeVariant;
  readonly specVersion?: ColorSpecVersion;
  readonly locale?: string;
  readonly cssOutput?: string;
  readonly schemaUrl?: string;
  readonly force?: boolean;
}

export function loadM3EConfigFile(configFilePath: string): M3EConfig {
  const raw = readFileSync(configFilePath, "utf8");
  return JSON.parse(raw) as M3EConfig;
}

export function initM3EProject(options: InitProjectOptions): {
  readonly configPath: string;
  readonly cssPath: string;
} {
  const configPath = resolve(options.cwd, "m3e.json");
  if (existsSync(configPath) && !options.force) {
    throw new Error(
      `m3e.json already exists at ${configPath}. Pass --force to overwrite.`,
    );
  }

  const jsonContent = serializeM3EConfig({
    schemaUrl: options.schemaUrl,
    seedHex: options.seedHex ?? "#6750A4",
    schemeVariant: options.schemeVariant ?? "expressive",
    specVersion: options.specVersion ?? "2025",
    locale: options.locale ?? "zh-CN",
    cssOutput: options.cssOutput ?? "src/styles/m3e-theme.css",
  });

  writeFileSync(configPath, jsonContent, "utf8");
  const { cssPath } = syncM3EThemeCss(options.cwd, configPath);
  return { configPath, cssPath };
}

export function syncM3EThemeCss(
  cwd: string,
  customConfigPath?: string,
): {
  readonly configPath: string;
  readonly cssPath: string;
  readonly cssContent: string;
} {
  const configPath = customConfigPath
    ? resolve(cwd, customConfigPath)
    : resolve(cwd, "m3e.json");
  if (!existsSync(configPath)) {
    throw new Error(
      `Cannot find m3e.json at ${configPath}. Run "m3e init" first.`,
    );
  }

  const config = loadM3EConfigFile(configPath);
  const resolved = resolveM3EConfig(config);
  const cssContent = generateM3EStaticThemeCss(config);
  const cssPath = resolve(dirname(configPath), resolved.cssOutput);

  mkdirSync(dirname(cssPath), { recursive: true });
  writeFileSync(cssPath, cssContent, "utf8");

  return { configPath, cssPath, cssContent };
}

export function scaffoldM3ELocalePack(
  cwd: string,
  localeCode: string,
  outputRelPath?: string,
): string {
  const targetRel = outputRelPath ?? `src/i18n/${localeCode}.ts`;
  const targetAbs = resolve(cwd, targetRel);
  const safeIdent =
    localeCode.replace(/[^a-zA-Z0-9]+(.)/g, (_, c: string) => c.toUpperCase()) +
    "Messages";

  const entries = Object.entries(enUSMessages)
    .map(([k, v]) => `  ${JSON.stringify(k)}: ${JSON.stringify(v)},`)
    .join("\n");

  const source = [
    `import type { M3EMessages } from "m3eui/i18n";`,
    ``,
    `export const ${safeIdent}: M3EMessages = {`,
    entries,
    `};`,
    ``,
  ].join("\n");

  mkdirSync(dirname(targetAbs), { recursive: true });
  writeFileSync(targetAbs, source, "utf8");
  return targetAbs;
}

function extractPlaceholders(template: string): string[] {
  const out = new Set<string>();
  const re = /\{(\w+)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(template)) !== null) {
    if (m[1]) out.add(m[1]);
  }
  return [...out].sort();
}

function validateBuiltInLocaleParity(): {
  readonly passed: boolean;
  readonly detail: string;
} {
  const baseKeys = Object.keys(enUSMessages).sort();
  const issues: string[] = [];

  for (const [localeCode, dict] of Object.entries(M3E_BUILT_IN_LOCALES)) {
    const keys = Object.keys(dict).sort();
    if (keys.join("|") !== baseKeys.join("|")) {
      issues.push(`${localeCode}: key set mismatch`);
      continue;
    }
    for (const k of baseKeys) {
      const msgKey = k as keyof typeof enUSMessages;
      const val = dict[msgKey];
      if (typeof val !== "string" || val.trim().length === 0) {
        issues.push(`${localeCode}.${k}: empty translation`);
        continue;
      }
      const expectedParams = extractPlaceholders(enUSMessages[msgKey]);
      const actualParams = extractPlaceholders(val);
      if (expectedParams.join(",") !== actualParams.join(",")) {
        issues.push(
          `${localeCode}.${k}: placeholder mismatch (expected {${expectedParams.join(",")}}, got {${actualParams.join(",")}})`,
        );
      }
    }
  }

  return {
    passed: issues.length === 0,
    detail:
      issues.length === 0
        ? `All ${Object.keys(M3E_BUILT_IN_LOCALES).length} built-in locale packs share ${baseKeys.length} keys with matching {param} placeholders`
        : issues.join("; "),
  };
}

const HARDCODED_UI_ATTR_RE =
  /\b(?:aria-label|aria-roledescription|aria-valuetext|placeholder|alt)\s*=\s*"([^"]+)"/;

function scanHardcodedUiLiterals(componentsDir: string): string[] {
  const offenders: string[] = [];
  if (!existsSync(componentsDir)) return offenders;

  for (const entry of readdirSync(componentsDir).sort()) {
    if (!entry.endsWith(".tsx")) continue;
    if (entry.endsWith(".test.tsx")) continue;
    const full = join(componentsDir, entry);
    const lines = readFileSync(full, "utf8").split("\n");
    lines.forEach((line, idx) => {
      const m = HARDCODED_UI_ATTR_RE.exec(line);
      if (m && m[1] && m[1].trim().length > 0) {
        offenders.push(`${entry}:${idx + 1} (${m[0]})`);
      }
    });
  }
  return offenders;
}
function scanHardcodedCjkFiles(dir: string, excludedSegment: string): string[] {
  const offenders: string[] = [];
  if (!existsSync(dir)) return offenders;

  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (full.includes(excludedSegment)) continue;
    const st = statSync(full);
    if (st.isDirectory()) {
      offenders.push(...scanHardcodedCjkFiles(full, excludedSegment));
      continue;
    }
    const ext = extname(full);
    if (ext !== ".ts" && ext !== ".tsx") continue;
    if (full.endsWith(".test.ts") || full.endsWith(".test.tsx")) continue;
    const text = readFileSync(full, "utf8");
    if (CJK_RE.test(text)) {
      offenders.push(full);
    }
  }
  return offenders;
}

export function runM3EDoctor(
  cwd: string,
  customConfigPath?: string,
): DoctorCheckResult {
  const checks: { name: string; passed: boolean; detail: string }[] = [];
  const configPath = customConfigPath
    ? resolve(cwd, customConfigPath)
    : resolve(cwd, "m3e.json");

  if (!existsSync(configPath)) {
    checks.push({
      name: "config-exists",
      passed: false,
      detail: `Missing m3e.json at ${configPath}`,
    });
    return { ok: false, checks };
  }

  let config: M3EConfig;
  try {
    config = loadM3EConfigFile(configPath);
    checks.push({
      name: "config-json-valid",
      passed: true,
      detail: `Parsed ${configPath}`,
    });
  } catch (err) {
    checks.push({
      name: "config-json-valid",
      passed: false,
      detail: `Invalid JSON in ${configPath}: ${String(err)}`,
    });
    return { ok: false, checks };
  }

  const seed = config.theme?.seed ?? "#6750A4";
  const seedValid = HEX_SEED_RE.test(seed);
  checks.push({
    name: "theme-seed-hex",
    passed: seedValid,
    detail: seedValid
      ? `Valid HCT seed ${seed}`
      : `Invalid hex seed "${seed}" (expected #RRGGBB or #RRGGBBAA)`,
  });

  const variant = config.theme?.schemeVariant ?? "expressive";
  const variantValid = VALID_SCHEME_VARIANTS.includes(variant);
  checks.push({
    name: "theme-scheme-variant",
    passed: variantValid,
    detail: variantValid
      ? `Scheme variant "${variant}" supported`
      : `Unsupported schemeVariant "${String(variant)}"`,
  });

  const specVersion = config.theme?.specVersion ?? "2025";
  const specValid = VALID_SPEC_VERSIONS.includes(specVersion);
  checks.push({
    name: "theme-spec-version",
    passed: specValid,
    detail: specValid
      ? `AOSP Monet spec version "${specVersion}" supported`
      : `Unsupported specVersion "${String(specVersion)}"`,
  });

  const rawContrast = config.theme?.contrastLevel ?? 0;
  const contrastValid =
    typeof rawContrast === "number" && rawContrast >= -1 && rawContrast <= 1;
  checks.push({
    name: "theme-contrast-range",
    passed: contrastValid,
    detail: contrastValid
      ? `Contrast level ${rawContrast} within [-1, 1]`
      : `Contrast level ${String(rawContrast)} outside [-1, 1]`,
  });

  const motion = config.theme?.motionScheme ?? "expressive";
  const motionValid = VALID_MOTION_SCHEMES.includes(motion);
  checks.push({
    name: "theme-motion-scheme",
    passed: motionValid,
    detail: motionValid
      ? `Motion scheme "${motion}" supported`
      : `Unsupported motionScheme "${String(motion)}"`,
  });

  const resolved = resolveM3EConfig(config);
  const builtInLocaleKeys = Object.keys(M3E_BUILT_IN_LOCALES);
  const isBuiltInLocale = builtInLocaleKeys.includes(resolved.locale);
  checks.push({
    name: "i18n-locale-resolution",
    passed: Boolean(resolved.locale && resolved.locale.trim().length >= 2),
    detail: `Locale "${resolved.locale}" (${isBuiltInLocale ? "built-in pack" : "custom/fallback pack"}) -> dir="${resolved.resolvedDirection}"`,
  });

  const parity = validateBuiltInLocaleParity();
  checks.push({
    name: "i18n-locale-pack-parity",
    passed: parity.passed,
    detail: parity.detail,
  });

  const cssPath = resolve(dirname(configPath), resolved.cssOutput);
  if (existsSync(cssPath)) {
    const existingCss = readFileSync(cssPath, "utf8");
    const expectedCss = generateM3EStaticThemeCss(config);
    const synced = existingCss === expectedCss;
    checks.push({
      name: "static-theme-css-sync",
      passed: synced,
      detail: synced
        ? `Static theme CSS up to date at ${resolved.cssOutput}`
        : `Static theme CSS at ${resolved.cssOutput} is stale; run "m3e sync"`,
    });
  } else {
    checks.push({
      name: "static-theme-css-sync",
      passed: false,
      detail: `Static theme CSS not found at ${resolved.cssOutput}; run "m3e sync"`,
    });
  }

  const reactSrcDir = resolve(cwd, "packages/m3eui/src");
  if (existsSync(reactSrcDir)) {
    const offenders = scanHardcodedCjkFiles(
      reactSrcDir,
      join("src", "i18n", "locales"),
    );
    checks.push({
      name: "zero-hardcoded-cjk",
      passed: offenders.length === 0,
      detail:
        offenders.length === 0
          ? "Zero hardcoded CJK strings outside packages/m3eui/src/i18n/locales"
          : `Found hardcoded CJK in: ${offenders.join(", ")}`,
    });

    const literalOffenders = scanHardcodedUiLiterals(
      join(reactSrcDir, "components"),
    );
    checks.push({
      name: "zero-hardcoded-ui-literals",
      passed: literalOffenders.length === 0,
      detail:
        literalOffenders.length === 0
          ? "Zero hardcoded ARIA/placeholder/alt string literals in packages/m3eui/src/components"
          : `Found hardcoded UI literals: ${literalOffenders.join(", ")}`,
    });
  }

  return {
    ok: checks.every((c) => c.passed),
    checks,
  };
}

function parseFlagValue(argv: readonly string[], flag: string): string | undefined {
  const idx = argv.indexOf(flag);
  if (idx >= 0 && idx + 1 < argv.length) {
    return argv[idx + 1];
  }
  return undefined;
}

export function runM3ECli(
  argv: readonly string[],
  io: {
    readonly cwd?: string;
    readonly log?: (line: string) => void;
    readonly error?: (line: string) => void;
  } = {},
): number {
  const cwd = io.cwd ?? process.cwd();
  const log = io.log ?? ((line: string) => console.log(line));
  const error = io.error ?? ((line: string) => console.error(line));

  const cmd = argv[0] ?? "help";

  try {
    if (cmd === "init") {
      const seedHex = parseFlagValue(argv, "--seed");
      const schemeVariant = parseFlagValue(
        argv,
        "--variant",
      ) as ColorSchemeVariant | undefined;
      const locale = parseFlagValue(argv, "--locale");
      const cssOutput = parseFlagValue(argv, "--output");
      const force = argv.includes("--force");

      const result = initM3EProject({
        cwd,
        seedHex,
        schemeVariant,
        locale,
        cssOutput,
        force,
      });
      log(`[m3e] Wrote configuration: ${result.configPath}`);
      log(`[m3e] Synced static theme CSS: ${result.cssPath}`);
      return 0;
    }

    if (cmd === "sync") {
      const configArg = parseFlagValue(argv, "--config");
      const result = syncM3EThemeCss(cwd, configArg);
      log(`[m3e] Synced static theme CSS -> ${result.cssPath}`);
      return 0;
    }

    if (cmd === "locale") {
      if (argv.includes("--list") || !argv[1] || argv[1].startsWith("--")) {
        log(
          `[m3e] Built-in locales: ${Object.keys(M3E_BUILT_IN_LOCALES).join(", ")} (${Object.keys(enUSMessages).length} keys each)`,
        );
        return 0;
      }
      const code = argv[1];
      const out = parseFlagValue(argv, "--out");
      const filePath = scaffoldM3ELocalePack(cwd, code, out);
      log(`[m3e] Scaffolded locale pack "${code}" -> ${filePath}`);
      return 0;
    }

    if (cmd === "doctor") {
      const configArg = parseFlagValue(argv, "--config");
      const report = runM3EDoctor(cwd, configArg);
      for (const c of report.checks) {
        log(`${c.passed ? "✓" : "✗"} [${c.name}] ${c.detail}`);
      }
      return report.ok ? 0 : 1;
    }

    log(
      [
        "m3eui v0.1.0",
        "",
        "Usage:",
        "  npx m3eui init [--seed #6750A4] [--variant expressive] [--locale zh-CN] [--output src/styles/m3e-theme.css] [--force]",
        "  npx m3eui sync [--config m3e.json]",
        "  npx m3eui locale --list | npx m3eui locale <bcp47-tag> [--out src/i18n/<tag>.ts]",
        "  npx m3eui doctor [--config m3e.json]",
      ].join("\n"),
    );
    return cmd === "help" || cmd === "--help" || cmd === "-h" ? 0 : 1;
  } catch (err) {
    error(`[m3e] Error: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}
