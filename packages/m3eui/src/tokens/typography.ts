export type TypefaceRole = "brand" | "plain";

export const M3E_TYPEFACE_TOKENS = {
  brand:
    '"Google Sans Flex", "Google Sans", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  plain:
    '"Google Sans Text", "Roboto Flex", Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans", "Noto Sans CJK SC", sans-serif',
  weightRegular: 400,
  weightMedium: 500,
  weightBold: 700,
} as const;

export interface TypeScaleSpec {
  readonly fontRole: TypefaceRole;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: 400 | 500 | 700;
  readonly letterSpacing: number;
  readonly emphasized: boolean;
}

export type M3ETypeScaleKey =
  | "displayLarge"
  | "displayMedium"
  | "displaySmall"
  | "headlineLarge"
  | "headlineMedium"
  | "headlineSmall"
  | "titleLarge"
  | "titleMedium"
  | "titleSmall"
  | "bodyLarge"
  | "bodyMedium"
  | "bodySmall"
  | "labelLarge"
  | "labelMedium"
  | "labelSmall"
  | "displayLargeEmphasized"
  | "displayMediumEmphasized"
  | "displaySmallEmphasized"
  | "headlineLargeEmphasized"
  | "headlineMediumEmphasized"
  | "headlineSmallEmphasized"
  | "titleLargeEmphasized"
  | "titleMediumEmphasized"
  | "titleSmallEmphasized"
  | "bodyLargeEmphasized"
  | "bodyMediumEmphasized"
  | "bodySmallEmphasized"
  | "labelLargeEmphasized"
  | "labelMediumEmphasized"
  | "labelSmallEmphasized";

export const M3E_TYPOGRAPHY_TOKENS: Record<M3ETypeScaleKey, TypeScaleSpec> = {
  displayLarge: {
    fontRole: "brand",
    fontSize: 57,
    lineHeight: 64,
    fontWeight: 400,
    letterSpacing: -0.2,
    emphasized: false,
  },
  displayMedium: {
    fontRole: "brand",
    fontSize: 45,
    lineHeight: 52,
    fontWeight: 400,
    letterSpacing: 0,
    emphasized: false,
  },
  displaySmall: {
    fontRole: "brand",
    fontSize: 36,
    lineHeight: 44,
    fontWeight: 400,
    letterSpacing: 0,
    emphasized: false,
  },
  headlineLarge: {
    fontRole: "brand",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 400,
    letterSpacing: 0,
    emphasized: false,
  },
  headlineMedium: {
    fontRole: "brand",
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 400,
    letterSpacing: 0,
    emphasized: false,
  },
  headlineSmall: {
    fontRole: "brand",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 400,
    letterSpacing: 0,
    emphasized: false,
  },
  titleLarge: {
    fontRole: "brand",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 400,
    letterSpacing: 0,
    emphasized: false,
  },
  titleMedium: {
    fontRole: "plain",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
    letterSpacing: 0.2,
    emphasized: false,
  },
  titleSmall: {
    fontRole: "plain",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    letterSpacing: 0.1,
    emphasized: false,
  },
  bodyLarge: {
    fontRole: "plain",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 400,
    letterSpacing: 0.5,
    emphasized: false,
  },
  bodyMedium: {
    fontRole: "plain",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 400,
    letterSpacing: 0.2,
    emphasized: false,
  },
  bodySmall: {
    fontRole: "plain",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 400,
    letterSpacing: 0.4,
    emphasized: false,
  },
  labelLarge: {
    fontRole: "plain",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    letterSpacing: 0.1,
    emphasized: false,
  },
  labelMedium: {
    fontRole: "plain",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500,
    letterSpacing: 0.5,
    emphasized: false,
  },
  labelSmall: {
    fontRole: "plain",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: 500,
    letterSpacing: 0.5,
    emphasized: false,
  },
  displayLargeEmphasized: {
    fontRole: "brand",
    fontSize: 57,
    lineHeight: 64,
    fontWeight: 500,
    letterSpacing: 0,
    emphasized: true,
  },
  displayMediumEmphasized: {
    fontRole: "brand",
    fontSize: 45,
    lineHeight: 52,
    fontWeight: 500,
    letterSpacing: 0,
    emphasized: true,
  },
  displaySmallEmphasized: {
    fontRole: "brand",
    fontSize: 36,
    lineHeight: 44,
    fontWeight: 500,
    letterSpacing: 0,
    emphasized: true,
  },
  headlineLargeEmphasized: {
    fontRole: "brand",
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 500,
    letterSpacing: 0,
    emphasized: true,
  },
  headlineMediumEmphasized: {
    fontRole: "brand",
    fontSize: 28,
    lineHeight: 36,
    fontWeight: 500,
    letterSpacing: 0,
    emphasized: true,
  },
  headlineSmallEmphasized: {
    fontRole: "brand",
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 500,
    letterSpacing: 0,
    emphasized: true,
  },
  titleLargeEmphasized: {
    fontRole: "brand",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 500,
    letterSpacing: 0,
    emphasized: true,
  },
  titleMediumEmphasized: {
    fontRole: "plain",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 700,
    letterSpacing: 0.15,
    emphasized: true,
  },
  titleSmallEmphasized: {
    fontRole: "plain",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
    letterSpacing: 0.1,
    emphasized: true,
  },
  bodyLargeEmphasized: {
    fontRole: "plain",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
    letterSpacing: 0.15,
    emphasized: true,
  },
  bodyMediumEmphasized: {
    fontRole: "plain",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    letterSpacing: 0.25,
    emphasized: true,
  },
  bodySmallEmphasized: {
    fontRole: "plain",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 500,
    letterSpacing: 0.4,
    emphasized: true,
  },
  labelLargeEmphasized: {
    fontRole: "plain",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 700,
    letterSpacing: 0.1,
    emphasized: true,
  },
  labelMediumEmphasized: {
    fontRole: "plain",
    fontSize: 12,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 0.5,
    emphasized: true,
  },
  labelSmallEmphasized: {
    fontRole: "plain",
    fontSize: 11,
    lineHeight: 16,
    fontWeight: 700,
    letterSpacing: 0.5,
    emphasized: true,
  },
} as const;

export function typeScaleKeyToKebab(key: M3ETypeScaleKey): string {
  return key.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
}

export function generateM3ETypographyCssVars(): Record<string, string> {
  const vars: Record<string, string> = {
    "--m3e-font-brand": M3E_TYPEFACE_TOKENS.brand,
    "--m3e-font-plain": M3E_TYPEFACE_TOKENS.plain,
  };

  for (const [key, spec] of Object.entries(M3E_TYPOGRAPHY_TOKENS) as [
    M3ETypeScaleKey,
    TypeScaleSpec,
  ][]) {
    const kebab = typeScaleKeyToKebab(key);
    const sizeRem = `${Number((spec.fontSize / 16).toFixed(4))}rem`;
    const lineRem = `${Number((spec.lineHeight / 16).toFixed(4))}rem`;
    vars[`--m3e-typescale-${kebab}-font`] =
      spec.fontRole === "brand" ? "var(--m3e-font-brand)" : "var(--m3e-font-plain)";
    vars[`--m3e-typescale-${kebab}-size`] = sizeRem;
    vars[`--m3e-typescale-${kebab}-line-height`] = lineRem;
    vars[`--m3e-typescale-${kebab}-weight`] = String(spec.fontWeight);
    vars[`--m3e-typescale-${kebab}-tracking`] = `${spec.letterSpacing}px`;
  }

  return vars;
}
