import { SHAPE_CORNER_TOKENS } from "./topology.js";

export type ElevationLevelKey =
  | "level0"
  | "level1"
  | "level2"
  | "level3"
  | "level4"
  | "level5";

export interface ElevationLevelSpec {
  readonly dp: number;
  readonly shadowCss: string;
}

export const M3E_ELEVATION_TOKENS: Record<ElevationLevelKey, ElevationLevelSpec> = {
  level0: {
    dp: 0,
    shadowCss: "none",
  },
  level1: {
    dp: 1,
    shadowCss:
      "0 1px 2px 0 color-mix(in srgb, var(--m3e-color-shadow) 30%, transparent), 0 1px 3px 1px color-mix(in srgb, var(--m3e-color-shadow) 15%, transparent)",
  },
  level2: {
    dp: 3,
    shadowCss:
      "0 1px 2px 0 color-mix(in srgb, var(--m3e-color-shadow) 30%, transparent), 0 2px 6px 2px color-mix(in srgb, var(--m3e-color-shadow) 15%, transparent)",
  },
  level3: {
    dp: 6,
    shadowCss:
      "0 1px 3px 0 color-mix(in srgb, var(--m3e-color-shadow) 30%, transparent), 0 4px 8px 3px color-mix(in srgb, var(--m3e-color-shadow) 15%, transparent)",
  },
  level4: {
    dp: 8,
    shadowCss:
      "0 2px 3px 0 color-mix(in srgb, var(--m3e-color-shadow) 30%, transparent), 0 6px 10px 4px color-mix(in srgb, var(--m3e-color-shadow) 15%, transparent)",
  },
  level5: {
    dp: 12,
    shadowCss:
      "0 4px 4px 0 color-mix(in srgb, var(--m3e-color-shadow) 30%, transparent), 0 8px 12px 6px color-mix(in srgb, var(--m3e-color-shadow) 15%, transparent)",
  },
} as const;

export const M3E_STATE_LAYER_TOKENS = {
  hoverOpacity: 0.08,
  focusOpacity: 0.1,
  pressOpacity: 0.1,
  draggedOpacity: 0.16,
  disabledContainerOpacity: 0.12,
  disabledContentOpacity: 0.38,
  disabledOutlineOpacity: 0.12,
} as const;

export function generateM3ESystemCssVars(): Record<string, string> {
  const vars: Record<string, string> = {};

  for (const [key, px] of Object.entries(SHAPE_CORNER_TOKENS)) {
    const kebab = key.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`);
    vars[`--m3e-shape-corner-${kebab}`] = `${px}px`;
  }

  for (const [level, spec] of Object.entries(M3E_ELEVATION_TOKENS) as [
    ElevationLevelKey,
    ElevationLevelSpec,
  ][]) {
    vars[`--m3e-elevation-${level}`] = spec.shadowCss;
  }

  vars["--m3e-state-hover-opacity"] = `${Math.round(M3E_STATE_LAYER_TOKENS.hoverOpacity * 100)}%`;
  vars["--m3e-state-focus-opacity"] = `${Math.round(M3E_STATE_LAYER_TOKENS.focusOpacity * 100)}%`;
  vars["--m3e-state-press-opacity"] = `${Math.round(M3E_STATE_LAYER_TOKENS.pressOpacity * 100)}%`;
  vars["--m3e-state-dragged-opacity"] = `${Math.round(M3E_STATE_LAYER_TOKENS.draggedOpacity * 100)}%`;
  vars["--m3e-state-disabled-container-opacity"] = `${Math.round(M3E_STATE_LAYER_TOKENS.disabledContainerOpacity * 100)}%`;
  vars["--m3e-state-disabled-content-opacity"] = `${Math.round(M3E_STATE_LAYER_TOKENS.disabledContentOpacity * 100)}%`;
  vars["--m3e-state-disabled-outline-opacity"] = `${Math.round(M3E_STATE_LAYER_TOKENS.disabledOutlineOpacity * 100)}%`;

  return vars;
}
