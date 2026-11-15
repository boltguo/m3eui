import {
  Blend,
  Cam16,
  Contrast,
  ContrastCurve,
  DynamicColor,
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
  readonly success: string;
  readonly onSuccess: string;
  readonly successContainer: string;
  readonly onSuccessContainer: string;
  readonly warning: string;
  readonly onWarning: string;
  readonly warningContainer: string;
  readonly onWarningContainer: string;
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

const MDC = new MaterialDynamicColors();
const SUCCESS_ANCHOR_ARGB = 0xff1b6d3d;
const WARNING_ANCHOR_ARGB = 0xff7d5800;

function buildDynamicScheme(
  hct: Hct,
  variant: ColorSchemeVariant,
  isDark: boolean,
  contrastLevel: number,
  platform: ColorPlatform,
): DynamicScheme {
  switch (variant) {
    case "expressive":
      return new SchemeExpressive(hct, isDark, contrastLevel, "2025", platform);
    case "vibrant":
      return new SchemeVibrant(hct, isDark, contrastLevel, "2025", platform);
    case "neutral":
      return new SchemeNeutral(hct, isDark, contrastLevel, "2025", platform);
    case "fidelity":
      return new SchemeFidelity(hct, isDark, contrastLevel, "2025", platform);
    case "content":
      return new SchemeContent(hct, isDark, contrastLevel, "2025", platform);
    case "monochrome":
      return new SchemeMonochrome(hct, isDark, contrastLevel, "2025", platform);
    case "rainbow":
      return new SchemeRainbow(hct, isDark, contrastLevel, "2025", platform);
    case "fruitSalad":
      return new SchemeFruitSalad(hct, isDark, contrastLevel, "2025", platform);
    case "tonalSpot":
    default:
      return new SchemeTonalSpot(hct, isDark, contrastLevel, "2025", platform);
  }
}

function resolveDimArgb(
  scheme: DynamicScheme,
  palette: TonalPalette,
  baseArgb: number,
  rawDimArgb: number,
): number {
  if (scheme.specVersion !== "2021" || scheme.isDark) {
    return rawDimArgb;
  }
  const maxDimTone = Math.max(0, Hct.fromInt(baseArgb).tone - 5);
  const rawDimTone = Hct.fromInt(rawDimArgb).tone;
  if (rawDimTone <= maxDimTone + 0.05) {
    return rawDimArgb;
  }
  return palette.tone(maxDimTone);
}

interface SemanticExtensionRoles {
  readonly role: string;
  readonly onRole: string;
  readonly container: string;
  readonly onContainer: string;
}

function buildSemanticExtensionPalette(
  anchorArgb: number,
  seedArgb: number,
  seedChroma: number,
  variant: ColorSchemeVariant,
): TonalPalette {
  const harmonizedArgb =
    seedChroma >= 5 && variant !== "monochrome"
      ? Blend.harmonize(anchorArgb, seedArgb)
      : anchorArgb;
  const hct = Hct.fromInt(harmonizedArgb);
  return TonalPalette.fromHueAndChroma(hct.hue, Math.max(42, hct.chroma));
}

function evaluateSemanticExtensionRoles(
  name: string,
  palette: TonalPalette,
  scheme: DynamicScheme,
): SemanticExtensionRoles {
  const roleColor = DynamicColor.fromPalette({
    name,
    palette: () => palette,
    tone: (s) => (s.isDark ? 80 : 40),
    isBackground: true,
    background: (s) => MDC.highestSurface(s),
    contrastCurve: () => new ContrastCurve(3, 4.5, 7, 7),
  });
  const onRoleColor = DynamicColor.fromPalette({
    name: `on_${name}`,
    palette: () => palette,
    tone: (s) => (s.isDark ? 20 : 100),
    background: () => roleColor,
    contrastCurve: () => new ContrastCurve(4.5, 7, 11, 21),
  });
  const containerColor = DynamicColor.fromPalette({
    name: `${name}_container`,
    palette: () => palette,
    tone: (s) => (s.isDark ? 30 : 90),
    isBackground: true,
    background: (s) => MDC.highestSurface(s),
    contrastCurve: () => new ContrastCurve(1, 1, 3, 4.5),
  });
  const onContainerColor = DynamicColor.fromPalette({
    name: `on_${name}_container`,
    palette: () => palette,
    tone: (s) => (s.isDark ? 90 : 30),
    background: () => containerColor,
    contrastCurve: () => new ContrastCurve(3, 4.5, 7, 11),
  });

  return {
    role: hexFromArgb(roleColor.getArgb(scheme)),
    onRole: hexFromArgb(onRoleColor.getArgb(scheme)),
    container: hexFromArgb(containerColor.getArgb(scheme)),
    onContainer: hexFromArgb(onContainerColor.getArgb(scheme)),
  };
}

function extractRoles(
  scheme: DynamicScheme,
  fixedScheme: DynamicScheme,
  successExt: SemanticExtensionRoles,
  warningExt: SemanticExtensionRoles,
): M3ESemanticColorRoles {
  const primaryArgb = scheme.primary;
  const secondaryArgb = scheme.secondary;
  const tertiaryArgb = scheme.tertiary;
  const errorArgb = scheme.error;

  return {
    primary: hexFromArgb(primaryArgb),
    primaryDim: hexFromArgb(
      resolveDimArgb(scheme, scheme.primaryPalette, primaryArgb, scheme.primaryDim),
    ),
    onPrimary: hexFromArgb(scheme.onPrimary),
    primaryContainer: hexFromArgb(scheme.primaryContainer),
    onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),
    inversePrimary: hexFromArgb(scheme.inversePrimary),
    primaryFixed: hexFromArgb(fixedScheme.primaryFixed),
    primaryFixedDim: hexFromArgb(fixedScheme.primaryFixedDim),
    onPrimaryFixed: hexFromArgb(fixedScheme.onPrimaryFixed),
    onPrimaryFixedVariant: hexFromArgb(fixedScheme.onPrimaryFixedVariant),
    secondary: hexFromArgb(secondaryArgb),
    secondaryDim: hexFromArgb(
      resolveDimArgb(
        scheme,
        scheme.secondaryPalette,
        secondaryArgb,
        scheme.secondaryDim,
      ),
    ),
    onSecondary: hexFromArgb(scheme.onSecondary),
    secondaryContainer: hexFromArgb(scheme.secondaryContainer),
    onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),
    secondaryFixed: hexFromArgb(fixedScheme.secondaryFixed),
    secondaryFixedDim: hexFromArgb(fixedScheme.secondaryFixedDim),
    onSecondaryFixed: hexFromArgb(fixedScheme.onSecondaryFixed),
    onSecondaryFixedVariant: hexFromArgb(fixedScheme.onSecondaryFixedVariant),
    tertiary: hexFromArgb(tertiaryArgb),
    tertiaryDim: hexFromArgb(
      resolveDimArgb(scheme, scheme.tertiaryPalette, tertiaryArgb, scheme.tertiaryDim),
    ),
    onTertiary: hexFromArgb(scheme.onTertiary),
    tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
    onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),
    tertiaryFixed: hexFromArgb(fixedScheme.tertiaryFixed),
    tertiaryFixedDim: hexFromArgb(fixedScheme.tertiaryFixedDim),
    onTertiaryFixed: hexFromArgb(fixedScheme.onTertiaryFixed),
    onTertiaryFixedVariant: hexFromArgb(fixedScheme.onTertiaryFixedVariant),
    error: hexFromArgb(errorArgb),
    errorDim: hexFromArgb(
      resolveDimArgb(scheme, scheme.errorPalette, errorArgb, scheme.errorDim),
    ),
    onError: hexFromArgb(scheme.onError),
    errorContainer: hexFromArgb(scheme.errorContainer),
    onErrorContainer: hexFromArgb(scheme.onErrorContainer),
    success: successExt.role,
    onSuccess: successExt.onRole,
    successContainer: successExt.container,
    onSuccessContainer: successExt.onContainer,
    warning: warningExt.role,
    onWarning: warningExt.onRole,
    warningContainer: warningExt.container,
    onWarningContainer: warningExt.onContainer,
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
  platform?: ColorPlatform;
}): M3EThemeTokens {
  const seedHex = options?.seedHex ?? "#6750A4";
  const variant = options?.variant ?? "expressive";
  const contrastLevel = Math.max(-1, Math.min(1, options?.contrastLevel ?? 0));
  const platform: ColorPlatform = options?.platform ?? "phone";

  let argb: number;
  try {
    argb = argbFromHex(seedHex);
  } catch {
    argb = argbFromHex("#6750A4");
  }
  const hct = Hct.fromInt(argb);

  const lightScheme = buildDynamicScheme(hct, variant, false, contrastLevel, platform);
  const darkScheme = buildDynamicScheme(hct, variant, true, contrastLevel, platform);

  const successPalette = buildSemanticExtensionPalette(
    SUCCESS_ANCHOR_ARGB,
    argb,
    hct.chroma,
    variant,
  );
  const warningPalette = buildSemanticExtensionPalette(
    WARNING_ANCHOR_ARGB,
    argb,
    hct.chroma,
    variant,
  );

  const light = extractRoles(
    lightScheme,
    lightScheme,
    evaluateSemanticExtensionRoles("success", successPalette, lightScheme),
    evaluateSemanticExtensionRoles("warning", warningPalette, lightScheme),
  );
  const dark = extractRoles(
    darkScheme,
    lightScheme,
    evaluateSemanticExtensionRoles("success", successPalette, darkScheme),
    evaluateSemanticExtensionRoles("warning", warningPalette, darkScheme),
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
    platform,
    light,
    dark,
    cssLightDarkVars,
  };
}
