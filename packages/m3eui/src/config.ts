import type { TextDirection } from "@base-ui/react/direction-provider";
import {
  type ColorPlatform,
  type SemanticColorRoleKey,
  generateM3EThemeTokens,
  roleKeyToCssVarName,
} from "./tokens/color.js";
import {
  type ColorSchemeVariant,
} from "./tokens/color-variants.js";
import {
  generateM3ESystemCssVars,
} from "./tokens/elevation.js";
import {
  MOTION_SCHEMES,
  type MotionScheme,
  type MotionSchemeName,
  resolveCrossPlatformSpring,
} from "./tokens/motion.js";
import {
  generateM3ETypographyCssVars,
} from "./tokens/typography.js";
import { M3E_COLOR_SCHEME_VARIANTS } from "./tokens/color-variants.js";
import {
  type M3ELocale,
  type M3EMessageOverrides,
  isRtlLocale,
} from "./i18n/index.js";
import { M3E_PACKAGE_VERSION } from "./version.js";

export type M3EDirectionSetting = TextDirection | "auto";
export type M3EColorModeSetting = "system" | "light" | "dark";

export const M3E_COLOR_SCHEME_STORAGE_KEY = "m3e-color-scheme";

export function getM3EInitScript(
  storageKey: string = M3E_COLOR_SCHEME_STORAGE_KEY,
  defaultMode: M3EColorModeSetting = "system",
): string {
  const safeKey = JSON.stringify(storageKey);
  const safeDefault = JSON.stringify(defaultMode);
  return `try{var s=localStorage.getItem(${safeKey}),m=(s==="light"||s==="dark"||s==="system")?s:${safeDefault},c=m==="system"?"light dark":m,d=document.documentElement;d.dataset.colorMode=m;d.style.colorScheme=c;var el=document.querySelector('meta[name="color-scheme"]');if(el)el.content=c;}catch(e){}`;
}

export interface M3EConfig {
  readonly $schema?: string;
  readonly style?: "expressive" | "standard";
  readonly theme?: {
    readonly seed?: string;
    readonly schemeVariant?: ColorSchemeVariant;
    readonly platform?: ColorPlatform;
    readonly colorMode?: M3EColorModeSetting;
    readonly contrastLevel?: number;
    readonly motionScheme?: MotionSchemeName;
  };
  readonly i18n?: {
    readonly locale?: M3ELocale;
    readonly direction?: M3EDirectionSetting;
    readonly messages?: M3EMessageOverrides;
  };
  readonly csp?: {
    readonly nonce?: string;
    readonly disableStyleElements?: boolean;
  };
  readonly css?: {
    readonly output?: string;
  };
}

export interface ResolvedM3EConfig {
  readonly style: "expressive" | "standard";
  readonly seedHex: string;
  readonly schemeVariant: ColorSchemeVariant;
  readonly platform: ColorPlatform;
  readonly colorMode: M3EColorModeSetting;
  readonly contrastLevel: number;
  readonly motionScheme: MotionSchemeName;
  readonly locale: M3ELocale;
  readonly directionMode: M3EDirectionSetting;
  readonly resolvedDirection: TextDirection;
  readonly messages?: M3EMessageOverrides;
  readonly cspNonce?: string;
  readonly cspDisableStyleElements: boolean;
  readonly cssOutput: string;
}

export function defineM3EConfig<const T extends M3EConfig>(config: T): T {
  return config;
}

type JsonWiden<T> = T extends string
  ? string
  : T extends object
    ? { readonly [K in keyof T]?: JsonWiden<T[K]> }
    : T;

export type M3EConfigInput = JsonWiden<M3EConfig>;

function oneOf<T extends string>(
  value: string | undefined,
  allowed: readonly T[],
  fallback: T,
): T {
  return allowed.includes(value as T) ? (value as T) : fallback;
}

export function resolveM3EConfig(config?: M3EConfigInput): ResolvedM3EConfig {
  const style = config?.style === "standard" ? "standard" : "expressive";
  const seedHex = config?.theme?.seed ?? "#6750A4";
  const schemeVariant = oneOf<ColorSchemeVariant>(
    config?.theme?.schemeVariant,
    M3E_COLOR_SCHEME_VARIANTS,
    style === "standard" ? "tonalSpot" : "expressive",
  );
  const platform = oneOf<ColorPlatform>(
    config?.theme?.platform,
    ["phone", "watch"],
    "phone",
  );
  const colorMode = oneOf<M3EColorModeSetting>(
    config?.theme?.colorMode,
    ["system", "light", "dark"],
    "system",
  );
  const contrastLevel = Math.max(
    -1,
    Math.min(1, config?.theme?.contrastLevel ?? 0),
  );
  const motionScheme = oneOf<MotionSchemeName>(
    config?.theme?.motionScheme,
    ["expressive", "standard"],
    style === "standard" ? "standard" : "expressive",
  );

  const locale: M3ELocale = config?.i18n?.locale ?? "en-US";
  const directionMode = oneOf<M3EDirectionSetting>(
    config?.i18n?.direction,
    ["auto", "ltr", "rtl"],
    "auto",
  );
  const resolvedDirection: TextDirection =
    directionMode === "auto"
      ? isRtlLocale(locale)
        ? "rtl"
        : "ltr"
      : directionMode;

  return {
    style,
    seedHex,
    schemeVariant,
    platform,
    colorMode,
    contrastLevel,
    motionScheme,
    locale,
    directionMode,
    resolvedDirection,
    messages: config?.i18n?.messages as M3EMessageOverrides | undefined,
    cspNonce: config?.csp?.nonce || undefined,
    cspDisableStyleElements: Boolean(config?.csp?.disableStyleElements),
    cssOutput: config?.css?.output ?? "src/styles/m3e-theme.css",
  };
}

export function serializeM3EConfig(
  input: Partial<{
    schemaUrl: string;
    seedHex: string;
    schemeVariant: ColorSchemeVariant;
    platform: ColorPlatform;
    colorMode: M3EColorModeSetting;
    contrastLevel: number;
    motionScheme: MotionSchemeName;
    locale: M3ELocale;
    directionMode: M3EDirectionSetting;
    cssOutput: string;
  }>,
): string {
  const doc: M3EConfig = {
    $schema:
      input.schemaUrl ??
      `https://unpkg.com/m3eui@${M3E_PACKAGE_VERSION}/m3e.schema.json`,
    style: input.motionScheme === "standard" ? "standard" : "expressive",
    theme: {
      seed: input.seedHex ?? "#6750A4",
      schemeVariant: input.schemeVariant ?? "expressive",
      platform: input.platform ?? "phone",
      colorMode: input.colorMode ?? "system",
      contrastLevel: input.contrastLevel ?? 0,
      motionScheme: input.motionScheme ?? "expressive",
    },
    i18n: {
      locale: input.locale ?? "en-US",
      direction: input.directionMode ?? "auto",
    },
    css: {
      output: input.cssOutput ?? "src/styles/m3e-theme.css",
    },
  };
  return `${JSON.stringify(doc, null, 2)}\n`;
}

export function generateM3EMotionCssVars(
  scheme: MotionScheme,
  playbackRate = 1,
): Record<string, string> {
  const fastEffects = resolveCrossPlatformSpring(scheme.fastEffects, playbackRate);
  const defaultEffects = resolveCrossPlatformSpring(scheme.defaultEffects, playbackRate);
  const slowEffects = resolveCrossPlatformSpring(scheme.slowEffects, playbackRate);
  const fastSpatial = resolveCrossPlatformSpring(scheme.fastSpatial, playbackRate);
  const defaultSpatial = resolveCrossPlatformSpring(scheme.defaultSpatial, playbackRate);
  const slowSpatial = resolveCrossPlatformSpring(scheme.slowSpatial, playbackRate);

  return {
    "--m3e-effects-fast-duration": `${fastEffects.cssLinear.durationMs}ms`,
    "--m3e-effects-fast-easing": fastEffects.cssLinear.easing,
    "--m3e-effects-default-duration": `${defaultEffects.cssLinear.durationMs}ms`,
    "--m3e-effects-default-easing": defaultEffects.cssLinear.easing,
    "--m3e-effects-slow-duration": `${slowEffects.cssLinear.durationMs}ms`,
    "--m3e-effects-slow-easing": slowEffects.cssLinear.easing,
    "--m3e-spatial-fast-duration": `${fastSpatial.cssLinear.durationMs}ms`,
    "--m3e-spatial-fast-easing": fastSpatial.cssLinear.easing,
    "--m3e-spatial-default-duration": `${defaultSpatial.cssLinear.durationMs}ms`,
    "--m3e-spatial-default-easing": defaultSpatial.cssLinear.easing,
    "--m3e-spatial-slow-duration": `${slowSpatial.cssLinear.durationMs}ms`,
    "--m3e-spatial-slow-easing": slowSpatial.cssLinear.easing,
  };
}

export function generateM3EStaticThemeCss(config?: M3EConfigInput): string {
  const resolved = resolveM3EConfig(config);
  const tokens = generateM3EThemeTokens({
    seedHex: resolved.seedHex,
    variant: resolved.schemeVariant,
    contrastLevel: resolved.contrastLevel,
    platform: resolved.platform,
  });
  const scheme = MOTION_SCHEMES[resolved.motionScheme];
  const motionVars = generateM3EMotionCssVars(scheme, 1);
  const systemVars = generateM3ESystemCssVars();
  const typographyVars = generateM3ETypographyCssVars();

  const lines: string[] = [
    `:root {`,
    `  color-scheme: ${resolved.colorMode === "system" ? "light dark" : resolved.colorMode};`,
  ];

  for (const [key, val] of Object.entries(tokens.cssLightDarkVars)) {
    lines.push(`  ${key}: ${val};`);
  }

  for (const [key, val] of Object.entries(motionVars)) {
    lines.push(`  ${key}: ${val};`);
  }

  for (const [key, val] of Object.entries(systemVars)) {
    lines.push(`  ${key}: ${val};`);
  }

  for (const [key, val] of Object.entries(typographyVars)) {
    lines.push(`  ${key}: ${val};`);
  }

  lines.push(
    `}`,
    "",
    `:root[data-color-mode="dark"],`,
    `:root:has(> head > meta[name="color-scheme"][content="dark"]),`,
    `.m3e-scope[data-color-mode="dark"] {`,
    `  color-scheme: dark;`,
    `}`,
    "",
    `:root[data-color-mode="light"],`,
    `:root:has(> head > meta[name="color-scheme"][content="light"]),`,
    `.m3e-scope[data-color-mode="light"] {`,
    `  color-scheme: light;`,
    `}`,
    "",
    `:root[data-color-mode="system"],`,
    `.m3e-scope[data-color-mode="system"] {`,
    `  color-scheme: light dark;`,
    `}`,
    "",
  );

  const roleKeys = Object.keys(tokens.light) as SemanticColorRoleKey[];
  lines.push(`@supports not (color: light-dark(white, black)) {`);
  lines.push(`  :root {`);
  for (const key of roleKeys) {
    const cssVar = roleKeyToCssVarName(key);
    lines.push(`    ${cssVar}: var(${cssVar}-light, ${tokens.light[key]});`);
  }
  lines.push(`  }`);
  lines.push(`  @media (prefers-color-scheme: dark) {`);
  lines.push(`    :root:not([data-color-mode="light"]),`);
  lines.push(`    .m3e-scope[data-color-mode="system"] {`);
  for (const key of roleKeys) {
    const cssVar = roleKeyToCssVarName(key);
    lines.push(`      ${cssVar}: var(${cssVar}-dark, ${tokens.dark[key]});`);
  }
  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(`  :root[data-color-mode="dark"],`);
  lines.push(`  .m3e-scope[data-color-mode="dark"] {`);
  for (const key of roleKeys) {
    const cssVar = roleKeyToCssVarName(key);
    lines.push(`    ${cssVar}: var(${cssVar}-dark, ${tokens.dark[key]});`);
  }
  lines.push(`  }`);
  lines.push(`}`, "");

  return lines.join("\n");
}
