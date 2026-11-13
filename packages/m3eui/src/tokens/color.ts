import {
  Blend,
  Cam16,
  Contrast,
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  type Platform,
  SchemeCmf,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  type SpecVersion,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
  sourceColorFromImage,
  sourceColorFromImageBytes,
} from "./monet/index.js";

export {
  Blend,
  Cam16,
  Contrast,
  DynamicScheme,
  Hct,
  MaterialDynamicColors,
  SchemeCmf,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeFruitSalad,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeRainbow,
  SchemeTonalSpot,
  SchemeVibrant,
  TonalPalette,
  argbFromHex,
  hexFromArgb,
  sourceColorFromImage,
  sourceColorFromImageBytes,
};

export const M3E_COLOR_SCHEME_VARIANTS = [
  "expressive",
  "tonalSpot",
  "vibrant",
  "neutral",
  "fidelity",
  "content",
  "monochrome",
  "rainbow",
  "fruitSalad",
] as const;

export type ColorSchemeVariant = (typeof M3E_COLOR_SCHEME_VARIANTS)[number];

export const M3E_COLOR_SPEC_VERSIONS = ["2025", "2021", "2026"] as const;
export type ColorSpecVersion = SpecVersion;
export type ColorPlatform = Platform;

export interface M3ESemanticColorRoles {
  readonly primary: string;
  readonly primaryDim: string;
  readonly onPrimary: string;
  readonly primaryContainer: string;
  readonly onPrimaryContainer: string;
  readonly inversePrimary: string;
  readonly primaryFixed: string;
  readonly primaryFixedDim: string;
  readonly onPrimaryFixed: string;
  readonly onPrimaryFixedVariant: string;
  readonly secondary: string;
  readonly secondaryDim: string;
  readonly onSecondary: string;
  readonly secondaryContainer: string;
  readonly onSecondaryContainer: string;
  readonly secondaryFixed: string;
  readonly secondaryFixedDim: string;
  readonly onSecondaryFixed: string;
  readonly onSecondaryFixedVariant: string;
  readonly tertiary: string;
  readonly tertiaryDim: string;
  readonly onTertiary: string;
  readonly tertiaryContainer: string;
  readonly onTertiaryContainer: string;
  readonly tertiaryFixed: string;
  readonly tertiaryFixedDim: string;
  readonly onTertiaryFixed: string;
  readonly onTertiaryFixedVariant: string;
  readonly error: string;
  readonly errorDim: string;
  readonly onError: string;
  readonly errorContainer: string;
  readonly onErrorContainer: string;
  readonly background: string;
  readonly onBackground: string;
  readonly surface: string;
  readonly surfaceDim: string;
  readonly surfaceBright: string;
  readonly surfaceContainerLowest: string;
  readonly surfaceContainerLow: string;
  readonly surfaceContainer: string;
  readonly surfaceContainerHigh: string;
  readonly surfaceContainerHighest: string;
  readonly onSurface: string;
  readonly surfaceVariant: string;
  readonly onSurfaceVariant: string;
  readonly surfaceTint: string;
  readonly outline: string;
  readonly outlineVariant: string;
  readonly inverseSurface: string;
  readonly inverseOnSurface: string;
  readonly shadow: string;
  readonly scrim: string;
}

export type SemanticColorRoleKey = keyof M3ESemanticColorRoles;

export interface M3EThemeTokens {
  readonly seedHex: string;
  readonly variant: ColorSchemeVariant;
  readonly contrastLevel: number;
  readonly specVersion: ColorSpecVersion;
  readonly platform: ColorPlatform;
  readonly light: M3ESemanticColorRoles;
  readonly dark: M3ESemanticColorRoles;
  readonly cssLightDarkVars: Record<string, string>;
}

export const M3E_SEED_PRESETS = [
  { name: "Expressive Violet", hex: "#6750A4" },
  { name: "Cobalt Pulse", hex: "#2563EB" },
  { name: "Emerald Mint", hex: "#0F766E" },
  { name: "Coral Bloom", hex: "#E11D48" },
  { name: "Amber Spark", hex: "#D97706" },
] as const;

function buildDynamicScheme(
  hct: Hct,
  variant: ColorSchemeVariant,
  isDark: boolean,
  contrastLevel: number,
  specVersion: ColorSpecVersion,
  platform: ColorPlatform,
): DynamicScheme {
  switch (variant) {
    case "expressive":
      return new SchemeExpressive(hct, isDark, contrastLevel, specVersion, platform);
    case "vibrant":
      return new SchemeVibrant(hct, isDark, contrastLevel, specVersion, platform);
    case "neutral":
      return new SchemeNeutral(hct, isDark, contrastLevel, specVersion, platform);
    case "fidelity":
      return new SchemeFidelity(hct, isDark, contrastLevel, specVersion, platform);
    case "content":
      return new SchemeContent(hct, isDark, contrastLevel, specVersion, platform);
    case "monochrome":
      return new SchemeMonochrome(hct, isDark, contrastLevel, specVersion, platform);
    case "rainbow":
      return new SchemeRainbow(hct, isDark, contrastLevel, specVersion, platform);
    case "fruitSalad":
      return new SchemeFruitSalad(hct, isDark, contrastLevel, specVersion, platform);
    case "tonalSpot":
    default:
      return new SchemeTonalSpot(hct, isDark, contrastLevel, specVersion, platform);
  }
}

function extractRoles(scheme: DynamicScheme): M3ESemanticColorRoles {
  return {
    primary: hexFromArgb(scheme.primary),
    primaryDim: hexFromArgb(scheme.primaryDim),
    onPrimary: hexFromArgb(scheme.onPrimary),
    primaryContainer: hexFromArgb(scheme.primaryContainer),
    onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),
    inversePrimary: hexFromArgb(scheme.inversePrimary),
    primaryFixed: hexFromArgb(scheme.primaryFixed),
    primaryFixedDim: hexFromArgb(scheme.primaryFixedDim),
    onPrimaryFixed: hexFromArgb(scheme.onPrimaryFixed),
    onPrimaryFixedVariant: hexFromArgb(scheme.onPrimaryFixedVariant),
    secondary: hexFromArgb(scheme.secondary),
    secondaryDim: hexFromArgb(scheme.secondaryDim),
    onSecondary: hexFromArgb(scheme.onSecondary),
    secondaryContainer: hexFromArgb(scheme.secondaryContainer),
    onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),
    secondaryFixed: hexFromArgb(scheme.secondaryFixed),
    secondaryFixedDim: hexFromArgb(scheme.secondaryFixedDim),
    onSecondaryFixed: hexFromArgb(scheme.onSecondaryFixed),
    onSecondaryFixedVariant: hexFromArgb(scheme.onSecondaryFixedVariant),
    tertiary: hexFromArgb(scheme.tertiary),
    tertiaryDim: hexFromArgb(scheme.tertiaryDim),
    onTertiary: hexFromArgb(scheme.onTertiary),
    tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
    onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),
    tertiaryFixed: hexFromArgb(scheme.tertiaryFixed),
    tertiaryFixedDim: hexFromArgb(scheme.tertiaryFixedDim),
    onTertiaryFixed: hexFromArgb(scheme.onTertiaryFixed),
    onTertiaryFixedVariant: hexFromArgb(scheme.onTertiaryFixedVariant),
    error: hexFromArgb(scheme.error),
    errorDim: hexFromArgb(scheme.errorDim),
    onError: hexFromArgb(scheme.onError),
    errorContainer: hexFromArgb(scheme.errorContainer),
    onErrorContainer: hexFromArgb(scheme.onErrorContainer),
    background: hexFromArgb(scheme.background),
    onBackground: hexFromArgb(scheme.onBackground),
    surface: hexFromArgb(scheme.surface),
    surfaceDim: hexFromArgb(scheme.surfaceDim),
    surfaceBright: hexFromArgb(scheme.surfaceBright),
    surfaceContainerLowest: hexFromArgb(scheme.surfaceContainerLowest),
    surfaceContainerLow: hexFromArgb(scheme.surfaceContainerLow),
    surfaceContainer: hexFromArgb(scheme.surfaceContainer),
    surfaceContainerHigh: hexFromArgb(scheme.surfaceContainerHigh),
    surfaceContainerHighest: hexFromArgb(scheme.surfaceContainerHighest),
    onSurface: hexFromArgb(scheme.onSurface),
    surfaceVariant: hexFromArgb(scheme.surfaceVariant),
    onSurfaceVariant: hexFromArgb(scheme.onSurfaceVariant),
    surfaceTint: hexFromArgb(scheme.surfaceTint),
    outline: hexFromArgb(scheme.outline),
    outlineVariant: hexFromArgb(scheme.outlineVariant),
    inverseSurface: hexFromArgb(scheme.inverseSurface),
    inverseOnSurface: hexFromArgb(scheme.inverseOnSurface),
    shadow: hexFromArgb(scheme.shadow),
    scrim: hexFromArgb(scheme.scrim),
  };
}

export function roleKeyToCssVarName(role: SemanticColorRoleKey): string {
  const kebab = role.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
  return `--m3e-color-${kebab}`;
}

export function generateM3EThemeTokens(options?: {
  seedHex?: string;
  variant?: ColorSchemeVariant;
  contrastLevel?: number;
  specVersion?: ColorSpecVersion;
  platform?: ColorPlatform;
}): M3EThemeTokens {
  const seedHex = options?.seedHex ?? "#6750A4";
  const variant = options?.variant ?? "expressive";
  const contrastLevel = Math.max(-1, Math.min(1, options?.contrastLevel ?? 0));
  const specVersion: ColorSpecVersion = options?.specVersion ?? "2025";
  const platform: ColorPlatform = options?.platform ?? "phone";

  let argb: number;
  try {
    argb = argbFromHex(seedHex);
  } catch {
    argb = argbFromHex("#6750A4");
  }
  const hct = Hct.fromInt(argb);

  const light = extractRoles(
    buildDynamicScheme(hct, variant, false, contrastLevel, specVersion, platform),
  );
  const dark = extractRoles(
    buildDynamicScheme(hct, variant, true, contrastLevel, specVersion, platform),
  );

  const cssLightDarkVars: Record<string, string> = {};
  for (const key of Object.keys(light) as SemanticColorRoleKey[]) {
    const cssVar = roleKeyToCssVarName(key);
    cssLightDarkVars[`${cssVar}-light`] = light[key];
    cssLightDarkVars[`${cssVar}-dark`] = dark[key];
    cssLightDarkVars[cssVar] = `light-dark(var(${cssVar}-light, ${light[key]}), var(${cssVar}-dark, ${dark[key]}))`;
  }

  return {
    seedHex,
    variant,
    contrastLevel,
    specVersion,
    platform,
    light,
    dark,
    cssLightDarkVars,
  };
}
