import {
  DynamicScheme,
  Hct,
  SchemeExpressive,
  SchemeNeutral,
  SchemeTonalSpot,
  SchemeVibrant,
  argbFromHex,
  hexFromArgb,
} from "@material/material-color-utilities";

export type ColorSchemeVariant = "expressive" | "tonalSpot" | "vibrant" | "neutral";

export interface M3ESemanticColorRoles {
  readonly primary: string;
  readonly onPrimary: string;
  readonly primaryContainer: string;
  readonly onPrimaryContainer: string;
  readonly inversePrimary: string;
  readonly secondary: string;
  readonly onSecondary: string;
  readonly secondaryContainer: string;
  readonly onSecondaryContainer: string;
  readonly tertiary: string;
  readonly onTertiary: string;
  readonly tertiaryContainer: string;
  readonly onTertiaryContainer: string;
  readonly error: string;
  readonly onError: string;
  readonly errorContainer: string;
  readonly onErrorContainer: string;
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
): DynamicScheme {
  switch (variant) {
    case "expressive":
      return new SchemeExpressive(hct, isDark, contrastLevel);
    case "vibrant":
      return new SchemeVibrant(hct, isDark, contrastLevel);
    case "neutral":
      return new SchemeNeutral(hct, isDark, contrastLevel);
    case "tonalSpot":
    default:
      return new SchemeTonalSpot(hct, isDark, contrastLevel);
  }
}

function extractRoles(scheme: DynamicScheme): M3ESemanticColorRoles {
  return {
    primary: hexFromArgb(scheme.primary),
    onPrimary: hexFromArgb(scheme.onPrimary),
    primaryContainer: hexFromArgb(scheme.primaryContainer),
    onPrimaryContainer: hexFromArgb(scheme.onPrimaryContainer),
    inversePrimary: hexFromArgb(scheme.inversePrimary),
    secondary: hexFromArgb(scheme.secondary),
    onSecondary: hexFromArgb(scheme.secondaryContainer ? scheme.onSecondary : scheme.onSecondary),
    secondaryContainer: hexFromArgb(scheme.secondaryContainer),
    onSecondaryContainer: hexFromArgb(scheme.onSecondaryContainer),
    tertiary: hexFromArgb(scheme.tertiary),
    onTertiary: hexFromArgb(scheme.onTertiary),
    tertiaryContainer: hexFromArgb(scheme.tertiaryContainer),
    onTertiaryContainer: hexFromArgb(scheme.onTertiaryContainer),
    error: hexFromArgb(scheme.error),
    onError: hexFromArgb(scheme.onError),
    errorContainer: hexFromArgb(scheme.errorContainer),
    onErrorContainer: hexFromArgb(scheme.onErrorContainer),
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
}): M3EThemeTokens {
  const seedHex = options?.seedHex ?? "#6750A4";
  const variant = options?.variant ?? "expressive";
  const contrastLevel = Math.max(-1, Math.min(1, options?.contrastLevel ?? 0));

  let argb: number;
  try {
    argb = argbFromHex(seedHex);
  } catch {
    argb = argbFromHex("#6750A4");
  }
  const hct = Hct.fromInt(argb);

  const light = extractRoles(buildDynamicScheme(hct, variant, false, contrastLevel));
  const dark = extractRoles(buildDynamicScheme(hct, variant, true, contrastLevel));

  const cssLightDarkVars: Record<string, string> = {};
  for (const key of Object.keys(light) as SemanticColorRoleKey[]) {
    const cssVar = roleKeyToCssVarName(key);
    cssLightDarkVars[cssVar] = `light-dark(${light[key]}, ${dark[key]})`;
  }

  return {
    seedHex,
    variant,
    contrastLevel,
    light,
    dark,
    cssLightDarkVars,
  };
}
