import type { TextDirection } from "@base-ui/react/direction-provider";
import {
  type ColorSchemeVariant,
  MOTION_SCHEMES,
  type MotionSchemeName,
  generateM3EThemeTokens,
  resolveCrossPlatformSpring,
} from "./tokens/index.js";
import {
  type M3ELocale,
  type M3EMessageOverrides,
  isRtlLocale,
} from "./i18n/index.js";

export type M3EDirectionSetting = TextDirection | "auto";
export type M3EColorModeSetting = "system" | "light" | "dark";

/**
 * Declarative `m3e.json` / `m3e.config.ts` schema (inspired by `shadcn/ui` `components.json`),
 * defining project-wide theme seed, palette variant, contrast level, physics motion,
 * locale/i18n, directionality, CSP, and static CSS emission paths.
 */
export interface M3EConfig {
  readonly $schema?: string;
  readonly style?: "expressive" | "standard";
  readonly theme?: {
    readonly seed?: string;
    readonly schemeVariant?: ColorSchemeVariant;
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
  readonly aliases?: {
    readonly components?: string;
    readonly tokens?: string;
    readonly i18n?: string;
  };
}

export interface ResolvedM3EConfig {
  readonly style: "expressive" | "standard";
  readonly seedHex: string;
  readonly schemeVariant: ColorSchemeVariant;
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
  readonly aliases: {
    readonly components: string;
    readonly tokens: string;
    readonly i18n: string;
  };
}

/**
 * Type-safe identity helper for authoring `m3e.config.ts`.
 */
export function defineM3EConfig<const T extends M3EConfig>(config: T): T {
  return config;
}

/**
 * Resolves a partial `m3e.json` / `M3EConfig` object into complete runtime settings
 * with sensible defaults and automatic RTL detection when `direction: "auto"`.
 */
export function resolveM3EConfig(config?: M3EConfig): ResolvedM3EConfig {
  const style = config?.style ?? "expressive";
  const seedHex = config?.theme?.seed ?? "#6750A4";
  const schemeVariant =
    config?.theme?.schemeVariant ??
    (style === "standard" ? "tonalSpot" : "expressive");
  const colorMode = config?.theme?.colorMode ?? "system";
  const contrastLevel = Math.max(
    -1,
    Math.min(1, config?.theme?.contrastLevel ?? 0),
  );
  const motionScheme =
    config?.theme?.motionScheme ??
    (style === "standard" ? "standard" : "expressive");

  const locale: M3ELocale = config?.i18n?.locale ?? "en-US";
  const directionMode: M3EDirectionSetting = config?.i18n?.direction ?? "auto";
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
    colorMode,
    contrastLevel,
    motionScheme,
    locale,
    directionMode,
    resolvedDirection,
    messages: config?.i18n?.messages,
    cspNonce: config?.csp?.nonce || undefined,
    cspDisableStyleElements: Boolean(config?.csp?.disableStyleElements),
    cssOutput: config?.css?.output ?? "src/styles/m3e-theme.css",
    aliases: {
      components: config?.aliases?.components ?? "@/components/ui",
      tokens: config?.aliases?.tokens ?? "m3eui/tokens",
      i18n: config?.aliases?.i18n ?? "@/i18n",
    },
  };
}

/**
 * Serializes current live runtime settings into a formatted `m3e.json` string.
 */
export function serializeM3EConfig(
  input: Partial<{
    schemaUrl: string;
    seedHex: string;
    schemeVariant: ColorSchemeVariant;
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
      "https://unpkg.com/m3eui@0.1.0/m3e.schema.json",
    style: input.motionScheme === "standard" ? "standard" : "expressive",
    theme: {
      seed: input.seedHex ?? "#6750A4",
      schemeVariant: input.schemeVariant ?? "expressive",
      colorMode: input.colorMode ?? "system",
      contrastLevel: input.contrastLevel ?? 0,
      motionScheme: input.motionScheme ?? "expressive",
    },
    i18n: {
      locale: input.locale ?? "zh-CN",
      direction: input.directionMode ?? "auto",
    },
    css: {
      output: input.cssOutput ?? "src/styles/m3e-theme.css",
    },
    aliases: {
      components: "@/components/ui",
      tokens: "m3eui/tokens",
      i18n: "@/i18n",
    },
  };
  return `${JSON.stringify(doc, null, 2)}\n`;
}

/**
 * Generates a static zero-JS-flash `:root` CSS stylesheet from an `M3EConfig`
 * containing HCT `light-dark()` variables and `linear()` spring timing curves.
 */
export function generateM3EStaticThemeCss(config?: M3EConfig): string {
  const resolved = resolveM3EConfig(config);
  const tokens = generateM3EThemeTokens({
    seedHex: resolved.seedHex,
    variant: resolved.schemeVariant,
    contrastLevel: resolved.contrastLevel,
  });
  const scheme = MOTION_SCHEMES[resolved.motionScheme];
  const fastEffects = resolveCrossPlatformSpring(scheme.fastEffects);
  const defaultEffects = resolveCrossPlatformSpring(scheme.defaultEffects);
  const fastSpatial = resolveCrossPlatformSpring(scheme.fastSpatial);

  const lines: string[] = [
    "/* Generated by m3eui from m3e.json — DO NOT EDIT MANUALLY */",
    `:root {`,
    `  color-scheme: ${resolved.colorMode === "system" ? "light dark" : resolved.colorMode};`,
  ];

  for (const [key, val] of Object.entries(tokens.cssLightDarkVars)) {
    lines.push(`  ${key}: ${val};`);
  }

  lines.push(
    `  --m3e-effects-fast-duration: ${fastEffects.cssLinear.durationMs}ms;`,
    `  --m3e-effects-fast-easing: ${fastEffects.cssLinear.easing};`,
    `  --m3e-effects-default-duration: ${defaultEffects.cssLinear.durationMs}ms;`,
    `  --m3e-effects-default-easing: ${defaultEffects.cssLinear.easing};`,
    `  --m3e-spatial-fast-duration: ${fastSpatial.cssLinear.durationMs}ms;`,
    `  --m3e-spatial-fast-easing: ${fastSpatial.cssLinear.easing};`,
    `}`,
    "",
  );

  return lines.join("\n");
}
