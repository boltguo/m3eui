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
  type M3EColorModeSetting,
  type M3EConfig,
  type M3EDirectionSetting,
  generateM3EStaticThemeCss,
  resolveM3EConfig,
  serializeM3EConfig,
} from "../config.js";
import { M3E_BUILT_IN_LOCALES, enUSMessages } from "../i18n/index.js";
import {
  type ColorPlatform,
} from "../tokens/color.js";
import {
  type ColorSchemeVariant,
  M3E_COLOR_SCHEME_VARIANTS,
} from "../tokens/color-variants.js";
import {
  type MotionSchemeName,
} from "../tokens/motion.js";
import { M3E_PACKAGE_VERSION } from "../version.js";

export const VALID_SCHEME_VARIANTS: readonly ColorSchemeVariant[] =
  M3E_COLOR_SCHEME_VARIANTS;

export const VALID_MOTION_SCHEMES: readonly MotionSchemeName[] = [
  "expressive",
  "standard",
];

const VALID_STYLES: readonly NonNullable<M3EConfig["style"]>[] = [
  "expressive",
  "standard",
];
const VALID_PLATFORMS: readonly ColorPlatform[] = ["phone", "watch"];
const VALID_COLOR_MODES: readonly M3EColorModeSetting[] = [
  "light",
  "dark",
  "system",
];
const VALID_DIRECTIONS: readonly M3EDirectionSetting[] = [
  "auto",
  "ltr",
  "rtl",
];

const ALLOWED_ROOT_KEYS = new Set([
  "$schema",
  "style",
  "theme",
  "i18n",
  "csp",
  "css",
  "aliases",
]);
const ALLOWED_THEME_KEYS = new Set([
  "seed",
  "schemeVariant",
  "platform",
  "colorMode",
  "contrastLevel",
  "motionScheme",
]);
const ALLOWED_I18N_KEYS = new Set(["locale", "direction", "messages"]);
const ALLOWED_CSP_KEYS = new Set(["nonce", "disableStyleElements"]);
const ALLOWED_CSS_KEYS = new Set(["output"]);
const ALLOWED_ALIASES_KEYS = new Set(["components", "tokens", "i18n"]);

const HEX_SEED_RE = /^#(?:[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const BCP47_TAG_RE = /^[A-Za-z]{2,3}(?:-[A-Za-z0-9]{1,8})*$/;
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
  readonly locale?: string;
  readonly cssOutput?: string;
  readonly schemaUrl?: string;
  readonly force?: boolean;
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isValidBcp47Tag(locale: unknown): locale is string {
  if (typeof locale !== "string") return false;
  const cleaned = locale.trim().replace(/_/g, "-");
  if (!BCP47_TAG_RE.test(cleaned)) return false;
  try {
    return Intl.getCanonicalLocales(cleaned).length > 0;
  } catch {
    return false;
  }
}

function collectSchemaStructuralErrors(raw: Record<string, unknown>): string[] {
  const errors: string[] = [];

  for (const key of Object.keys(raw)) {
    if (!ALLOWED_ROOT_KEYS.has(key)) {
      errors.push(`Unknown top-level key "${key}"`);
    }
  }

  if (raw.$schema !== undefined && typeof raw.$schema !== "string") {
    errors.push(`"$schema" must be a string`);
  }
  if (
    raw.style !== undefined &&
    (typeof raw.style !== "string" ||
      !VALID_STYLES.includes(raw.style as NonNullable<M3EConfig["style"]>))
  ) {
    errors.push(
      `Invalid "style": "${String(raw.style)}" (expected "expressive" or "standard")`,
    );
  }

  if (raw.theme !== undefined) {
    if (!isPlainRecord(raw.theme)) {
      errors.push(`"theme" must be an object`);
    } else {
      for (const k of Object.keys(raw.theme)) {
        if (!ALLOWED_THEME_KEYS.has(k)) {
          errors.push(`Unknown key "theme.${k}"`);
        }
      }
      if (
        raw.theme.platform !== undefined &&
        (typeof raw.theme.platform !== "string" ||
          !VALID_PLATFORMS.includes(raw.theme.platform as ColorPlatform))
      ) {
        errors.push(
          `Invalid "theme.platform": "${String(raw.theme.platform)}" (expected "phone" or "watch")`,
        );
      }
      if (
        raw.theme.colorMode !== undefined &&
        (typeof raw.theme.colorMode !== "string" ||
          !VALID_COLOR_MODES.includes(
            raw.theme.colorMode as M3EColorModeSetting,
          ))
      ) {
        errors.push(
          `Invalid "theme.colorMode": "${String(raw.theme.colorMode)}" (expected "light", "dark", or "system")`,
        );
      }
    }
  }

  if (raw.i18n !== undefined) {
    if (!isPlainRecord(raw.i18n)) {
      errors.push(`"i18n" must be an object`);
    } else {
      for (const k of Object.keys(raw.i18n)) {
        if (!ALLOWED_I18N_KEYS.has(k)) {
          errors.push(`Unknown key "i18n.${k}"`);
        }
      }
      if (
        raw.i18n.direction !== undefined &&
        (typeof raw.i18n.direction !== "string" ||
          !VALID_DIRECTIONS.includes(
            raw.i18n.direction as M3EDirectionSetting,
          ))
      ) {
        errors.push(
          `Invalid "i18n.direction": "${String(raw.i18n.direction)}" (expected "auto", "ltr", or "rtl")`,
        );
      }
      if (raw.i18n.messages !== undefined) {
        if (!isPlainRecord(raw.i18n.messages)) {
          errors.push(`"i18n.messages" must be a string map`);
        } else {
          for (const [mk, mv] of Object.entries(raw.i18n.messages)) {
            if (typeof mv !== "string") {
              errors.push(`"i18n.messages.${mk}" must be a string`);
            }
          }
        }
      }
    }
  }

  if (raw.csp !== undefined) {
    if (!isPlainRecord(raw.csp)) {
      errors.push(`"csp" must be an object`);
    } else {
      for (const k of Object.keys(raw.csp)) {
        if (!ALLOWED_CSP_KEYS.has(k)) {
          errors.push(`Unknown key "csp.${k}"`);
        }
      }
      if (raw.csp.nonce !== undefined && typeof raw.csp.nonce !== "string") {
        errors.push(`"csp.nonce" must be a string`);
      }
      if (
        raw.csp.disableStyleElements !== undefined &&
        typeof raw.csp.disableStyleElements !== "boolean"
      ) {
        errors.push(`"csp.disableStyleElements" must be a boolean`);
      }
    }
  }

  if (raw.css !== undefined) {
    if (!isPlainRecord(raw.css)) {
      errors.push(`"css" must be an object`);
    } else {
      for (const k of Object.keys(raw.css)) {
        if (!ALLOWED_CSS_KEYS.has(k)) {
          errors.push(`Unknown key "css.${k}"`);
        }
      }
      if (
        raw.css.output !== undefined &&
        (typeof raw.css.output !== "string" || raw.css.output.trim().length === 0)
      ) {
        errors.push(`"css.output" must be a non-empty string`);
      }
    }
  }

  if (raw.aliases !== undefined) {
    if (!isPlainRecord(raw.aliases)) {
      errors.push(`"aliases" must be an object`);
    } else {
      for (const k of Object.keys(raw.aliases)) {
        if (!ALLOWED_ALIASES_KEYS.has(k)) {
          errors.push(`Unknown key "aliases.${k}"`);
        }
        if (
          raw.aliases[k] !== undefined &&
          typeof raw.aliases[k] !== "string"
        ) {
          errors.push(`"aliases.${k}" must be a string`);
        }
      }
    }
  }

  return errors;
}

function assertValidM3EConfig(config: M3EConfig, sourceLabel: string): void {
  const raw = config as unknown as Record<string, unknown>;
  const issues = collectSchemaStructuralErrors(raw);

  const seed = isPlainRecord(raw.theme) ? raw.theme.seed : undefined;
  if (seed !== undefined && (typeof seed !== "string" || !HEX_SEED_RE.test(seed))) {
    issues.push(
      `Invalid "theme.seed": "${String(seed)}" (expected #RRGGBB or #RRGGBBAA)`,
    );
  }

  const variant = isPlainRecord(raw.theme) ? raw.theme.schemeVariant : undefined;
  if (
    variant !== undefined &&
    (typeof variant !== "string" ||
      !VALID_SCHEME_VARIANTS.includes(variant as ColorSchemeVariant))
  ) {
    issues.push(
      `Invalid "theme.schemeVariant": "${String(variant)}" (expected one of ${VALID_SCHEME_VARIANTS.join(", ")})`,
    );
  }

  const contrast = isPlainRecord(raw.theme) ? raw.theme.contrastLevel : undefined;
  if (
    contrast !== undefined &&
    (typeof contrast !== "number" ||
      !Number.isFinite(contrast) ||
      contrast < -1 ||
      contrast > 1)
  ) {
    issues.push(
      `Invalid "theme.contrastLevel": ${String(contrast)} (expected number in [-1, 1])`,
    );
  }

  const motion = isPlainRecord(raw.theme) ? raw.theme.motionScheme : undefined;
  if (
    motion !== undefined &&
    (typeof motion !== "string" ||
      !VALID_MOTION_SCHEMES.includes(motion as MotionSchemeName))
  ) {
    issues.push(
      `Invalid "theme.motionScheme": "${String(motion)}" (expected "expressive" or "standard")`,
    );
  }

  const locale = isPlainRecord(raw.i18n) ? raw.i18n.locale : undefined;
  if (locale !== undefined && !isValidBcp47Tag(locale)) {
    issues.push(
      `Invalid "i18n.locale": "${String(locale)}" (expected valid BCP 47 tag)`,
    );
  }

  if (issues.length > 0) {
    throw new Error(`Invalid configuration in ${sourceLabel}: ${issues.join("; ")}`);
  }
}

export function loadM3EConfigFile(configFilePath: string): M3EConfig {
  const raw = readFileSync(configFilePath, "utf8");
  const parsed: unknown = JSON.parse(raw);
  if (!isPlainRecord(parsed)) {
    throw new Error(
      `Invalid m3e.json at ${configFilePath}: root value must be a JSON object.`,
    );
  }
  return parsed as M3EConfig;
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

  const seedHex = options.seedHex ?? "#6750A4";
  if (!HEX_SEED_RE.test(seedHex)) {
    throw new Error(
      `Invalid --seed "${seedHex}" (expected #RRGGBB or #RRGGBBAA).`,
    );
  }

  const schemeVariant = options.schemeVariant ?? "expressive";
  if (!VALID_SCHEME_VARIANTS.includes(schemeVariant)) {
    throw new Error(
      `Invalid --variant "${String(schemeVariant)}" (expected one of ${VALID_SCHEME_VARIANTS.join(", ")}).`,
    );
  }

  const locale = options.locale ?? "en-US";
  if (!isValidBcp47Tag(locale)) {
    throw new Error(
      `Invalid --locale "${locale}" (expected valid BCP 47 tag such as en-US or zh-CN).`,
    );
  }

  const cssOutput = options.cssOutput ?? "src/styles/m3e-theme.css";
  if (typeof cssOutput !== "string" || cssOutput.trim().length === 0) {
    throw new Error(`Invalid --output (expected non-empty file path).`);
  }

  const jsonContent = serializeM3EConfig({
    schemaUrl: options.schemaUrl,
    seedHex,
    schemeVariant,
    locale,
    cssOutput,
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
  assertValidM3EConfig(config, configPath);
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
  if (!isValidBcp47Tag(localeCode)) {
    throw new Error(
      `Invalid BCP 47 locale tag "${localeCode}" (expected e.g. fr-FR, de-DE, zh-Hant-TW).`,
    );
  }
  if (outputRelPath !== undefined && outputRelPath.trim().length === 0) {
    throw new Error(`Invalid --out path: expected a non-empty file path.`);
  }
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

  for (const entry of readdirSync(componentsDir, {
    recursive: true,
    encoding: "utf8",
  }).sort()) {
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

  const rawRecord = config as unknown as Record<string, unknown>;
  const structuralIssues = collectSchemaStructuralErrors(rawRecord);
  checks.push({
    name: "config-schema",
    passed: structuralIssues.length === 0,
    detail:
      structuralIssues.length === 0
        ? "Configuration structure matches m3e.schema.json"
        : structuralIssues.join("; "),
  });

  const themeRecord = isPlainRecord(rawRecord.theme)
    ? rawRecord.theme
    : undefined;
  const i18nRecord = isPlainRecord(rawRecord.i18n) ? rawRecord.i18n : undefined;

  const seed = themeRecord?.seed ?? "#6750A4";
  const seedValid = typeof seed === "string" && HEX_SEED_RE.test(seed);
  checks.push({
    name: "theme-seed-hex",
    passed: seedValid,
    detail: seedValid
      ? `Valid HCT seed ${seed}`
      : `Invalid hex seed "${String(seed)}" (expected #RRGGBB or #RRGGBBAA)`,
  });

  const variant = themeRecord?.schemeVariant ?? "expressive";
  const variantValid =
    typeof variant === "string" &&
    VALID_SCHEME_VARIANTS.includes(variant as ColorSchemeVariant);
  checks.push({
    name: "theme-scheme-variant",
    passed: variantValid,
    detail: variantValid
      ? `Scheme variant "${variant}" supported`
      : `Unsupported schemeVariant "${String(variant)}"`,
  });

  const rawContrast = themeRecord?.contrastLevel ?? 0;
  const contrastValid =
    typeof rawContrast === "number" &&
    Number.isFinite(rawContrast) &&
    rawContrast >= -1 &&
    rawContrast <= 1;
  checks.push({
    name: "theme-contrast-range",
    passed: contrastValid,
    detail: contrastValid
      ? `Contrast level ${rawContrast} within [-1, 1]`
      : `Contrast level ${String(rawContrast)} outside [-1, 1]`,
  });

  const motion = themeRecord?.motionScheme ?? "expressive";
  const motionValid =
    typeof motion === "string" &&
    VALID_MOTION_SCHEMES.includes(motion as MotionSchemeName);
  checks.push({
    name: "theme-motion-scheme",
    passed: motionValid,
    detail: motionValid
      ? `Motion scheme "${motion}" supported`
      : `Unsupported motionScheme "${String(motion)}"`,
  });

  const rawLocale = i18nRecord?.locale ?? "en-US";
  const localeTagValid = isValidBcp47Tag(rawLocale);
  const safeConfig: M3EConfig = {
    style:
      rawRecord.style === "standard" || rawRecord.style === "expressive"
        ? rawRecord.style
        : undefined,
    theme: {
      seed: seedValid ? seed : "#6750A4",
      schemeVariant: variantValid ? (variant as ColorSchemeVariant) : "expressive",
      platform:
        themeRecord?.platform === "watch" || themeRecord?.platform === "phone"
          ? themeRecord.platform
          : "phone",
      colorMode:
        themeRecord?.colorMode === "light" ||
        themeRecord?.colorMode === "dark" ||
        themeRecord?.colorMode === "system"
          ? themeRecord.colorMode
          : "system",
      contrastLevel: contrastValid ? rawContrast : 0,
      motionScheme: motionValid ? (motion as MotionSchemeName) : "expressive",
    },
    i18n: {
      locale: localeTagValid ? rawLocale : "en-US",
      direction:
        i18nRecord?.direction === "ltr" ||
        i18nRecord?.direction === "rtl" ||
        i18nRecord?.direction === "auto"
          ? i18nRecord.direction
          : "auto",
    },
    css: {
      output:
        isPlainRecord(rawRecord.css) &&
        typeof rawRecord.css.output === "string" &&
        rawRecord.css.output.trim().length > 0
          ? rawRecord.css.output
          : "src/styles/m3e-theme.css",
    },
  };

  const resolved = resolveM3EConfig(safeConfig);
  const builtInLocaleKeys = Object.keys(M3E_BUILT_IN_LOCALES);
  const isBuiltInLocale = builtInLocaleKeys.includes(resolved.locale);
  checks.push({
    name: "i18n-locale-resolution",
    passed: localeTagValid,
    detail: localeTagValid
      ? `Locale "${resolved.locale}" (${isBuiltInLocale ? "built-in pack" : "custom/fallback pack"}) -> dir="${resolved.resolvedDirection}"`
      : `Invalid BCP 47 locale "${String(rawLocale)}"`,
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
    const expectedCss = generateM3EStaticThemeCss(safeConfig);
    const synced =
      structuralIssues.length === 0 &&
      seedValid &&
      variantValid &&
      contrastValid &&
      motionValid &&
      localeTagValid &&
      existingCss === expectedCss;
    checks.push({
      name: "static-theme-css-sync",
      passed: synced,
      detail: synced
        ? `Static theme CSS up to date at ${resolved.cssOutput}`
        : `Static theme CSS at ${resolved.cssOutput} is stale or configuration is invalid; run "m3e sync"`,
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

interface ParsedCliArgs {
  readonly values: Readonly<Record<string, string>>;
  readonly booleans: ReadonlySet<string>;
  readonly positionals: readonly string[];
}

function parseCliArgs(
  args: readonly string[],
  spec: {
    readonly valueFlags?: readonly string[];
    readonly booleanFlags?: readonly string[];
    readonly maxPositionals?: number;
  },
): ParsedCliArgs {
  const valueSet = new Set(spec.valueFlags ?? []);
  const boolSet = new Set(spec.booleanFlags ?? []);
  const maxPos = spec.maxPositionals ?? 0;

  const values: Record<string, string> = {};
  const booleans = new Set<string>();
  const positionals: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const token = args[i]!;
    if (token.startsWith("-")) {
      const eqIdx = token.indexOf("=");
      if (eqIdx > 0) {
        const flagName = token.slice(0, eqIdx);
        const flagVal = token.slice(eqIdx + 1);
        if (!valueSet.has(flagName)) {
          throw new Error(`Unknown or unsupported flag "${flagName}".`);
        }
        if (!flagVal) {
          throw new Error(`Flag "${flagName}" requires a non-empty value.`);
        }
        values[flagName] = flagVal;
        continue;
      }

      if (boolSet.has(token)) {
        booleans.add(token);
        continue;
      }

      if (valueSet.has(token)) {
        const next = args[i + 1];
        if (next === undefined || next.startsWith("-")) {
          throw new Error(
            `Flag "${token}" requires a value${next ? `, got "${next}"` : ""}.`,
          );
        }
        values[token] = next;
        i += 1;
        continue;
      }

      throw new Error(`Unknown flag "${token}".`);
    }

    if (positionals.length >= maxPos) {
      throw new Error(`Unexpected argument "${token}".`);
    }
    positionals.push(token);
  }

  return { values, booleans, positionals };
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
  const rest = argv.slice(1);

  try {
    if (cmd === "--version" || cmd === "-v" || cmd === "version") {
      log(M3E_PACKAGE_VERSION);
      return 0;
    }

    if (cmd === "init") {
      const parsed = parseCliArgs(rest, {
        valueFlags: ["--seed", "--variant", "--locale", "--output"],
        booleanFlags: ["--force"],
        maxPositionals: 0,
      });

      const result = initM3EProject({
        cwd,
        seedHex: parsed.values["--seed"],
        schemeVariant: parsed.values["--variant"] as
          | ColorSchemeVariant
          | undefined,
        locale: parsed.values["--locale"],
        cssOutput: parsed.values["--output"],
        force: parsed.booleans.has("--force"),
      });
      log(`[m3e] Wrote configuration: ${result.configPath}`);
      log(`[m3e] Synced static theme CSS: ${result.cssPath}`);
      return 0;
    }

    if (cmd === "sync") {
      const parsed = parseCliArgs(rest, {
        valueFlags: ["--config"],
        maxPositionals: 0,
      });
      const result = syncM3EThemeCss(cwd, parsed.values["--config"]);
      log(`[m3e] Synced static theme CSS -> ${result.cssPath}`);
      return 0;
    }

    if (cmd === "locale") {
      const parsed = parseCliArgs(rest, {
        valueFlags: ["--out"],
        booleanFlags: ["--list"],
        maxPositionals: 1,
      });
      if (parsed.booleans.has("--list")) {
        if (parsed.positionals.length > 0 || parsed.values["--out"] !== undefined) {
          throw new Error(`"--list" cannot be combined with a locale tag or "--out".`);
        }
        log(
          `[m3e] Built-in locales: ${Object.keys(M3E_BUILT_IN_LOCALES).join(", ")} (${Object.keys(enUSMessages).length} keys each)`,
        );
        return 0;
      }
      const code = parsed.positionals[0];
      if (!code) {
        if (parsed.values["--out"] !== undefined) {
          throw new Error(`Missing locale tag for "--out".`);
        }
        log(
          `[m3e] Built-in locales: ${Object.keys(M3E_BUILT_IN_LOCALES).join(", ")} (${Object.keys(enUSMessages).length} keys each)`,
        );
        return 0;
      }
      const filePath = scaffoldM3ELocalePack(cwd, code, parsed.values["--out"]);
      log(`[m3e] Scaffolded locale pack "${code}" -> ${filePath}`);
      return 0;
    }

    if (cmd === "doctor") {
      const parsed = parseCliArgs(rest, {
        valueFlags: ["--config"],
        maxPositionals: 0,
      });
      const report = runM3EDoctor(cwd, parsed.values["--config"]);
      for (const c of report.checks) {
        log(`${c.passed ? "✓" : "✗"} [${c.name}] ${c.detail}`);
      }
      return report.ok ? 0 : 1;
    }

    if (cmd === "help" || cmd === "--help" || cmd === "-h") {
      log(
        [
          `m3eui v${M3E_PACKAGE_VERSION}`,
          "",
          "Usage:",
          "  npx m3eui init [--seed #6750A4] [--variant expressive] [--locale zh-CN] [--output src/styles/m3e-theme.css] [--force]",
          "  npx m3eui sync [--config m3e.json]",
          "  npx m3eui locale --list | npx m3eui locale <bcp47-tag> [--out src/i18n/<tag>.ts]",
          "  npx m3eui doctor [--config m3e.json]",
        ].join("\n"),
      );
      return 0;
    }

    error(
      `[m3e] Error: Unknown command "${cmd}". Run "m3eui --help" for usage.`,
    );
    return 1;
  } catch (err) {
    error(`[m3e] Error: ${err instanceof Error ? err.message : String(err)}`);
    return 1;
  }
}
