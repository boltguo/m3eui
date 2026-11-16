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
