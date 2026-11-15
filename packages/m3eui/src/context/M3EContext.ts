"use client";

import * as React from "react";
import type { TextDirection } from "@base-ui/react/direction-provider";
import type {
  M3EColorModeSetting,
  M3EDirectionSetting,
} from "../config.js";
import { formatM3EMessage } from "../i18n/format.js";
import { enUSMessages } from "../i18n/locales/en-US.js";
import type {
  M3ELocale,
  M3EMessages,
  M3ETranslateFn,
} from "../i18n/types.js";
import type {
  ColorPlatform,
  ColorSchemeVariant,
  M3ESemanticColorRoles,
  M3EThemeTokens,
  SemanticColorRoleKey,
} from "../tokens/color.js";
import {
  EXPRESSIVE_MOTION_SCHEME,
  type MotionScheme,
  type MotionSchemeName,
} from "../tokens/motion.js";
import { M3E_PACKAGE_VERSION } from "../version.js";

export type ColorMode = M3EColorModeSetting;

export interface M3EContextValue {
  readonly seedHex: string;
  readonly setSeedHex: (hex: string) => void;
  readonly schemeVariant: ColorSchemeVariant;
  readonly setSchemeVariant: (variant: ColorSchemeVariant) => void;
  readonly platform: ColorPlatform;
  readonly setPlatform: (platform: ColorPlatform) => void;
  readonly contrastLevel: number;
  readonly setContrastLevel: (level: number) => void;
  readonly colorMode: ColorMode;
  readonly resolvedColorMode: "light" | "dark";
  readonly setColorMode: (mode: ColorMode) => void;
  readonly locale: M3ELocale;
  readonly setLocale: (locale: M3ELocale) => void;
  readonly messages: M3EMessages;
  readonly t: M3ETranslateFn;
  readonly directionMode: M3EDirectionSetting;
  readonly setDirectionMode: (mode: M3EDirectionSetting) => void;
  readonly direction: TextDirection;
  readonly setDirection: (dir: TextDirection) => void;
  readonly motionSchemeName: MotionSchemeName;
  readonly setMotionSchemeName: (name: MotionSchemeName) => void;
  readonly motionScheme: MotionScheme;
  readonly playbackRate: number;
  readonly setPlaybackRate: (rate: number) => void;
  readonly paused: boolean;
  readonly setPaused: (paused: boolean) => void;
  readonly debugGeometry: boolean;
  readonly setDebugGeometry: (debug: boolean) => void;
  readonly prefersReducedMotion: boolean;
  readonly themeTokens: M3EThemeTokens;
  readonly exportConfigJson: () => string;
}

const DEFAULT_LIGHT: M3ESemanticColorRoles = {
  primary: "#6850a5",
  primaryDim: "#5b4498",
  onPrimary: "#fdf7ff",
  primaryContainer: "#cab6ff",
  onPrimaryContainer: "#442c7f",
  inversePrimary: "#bba2fe",
  primaryFixed: "#cab6ff",
  primaryFixedDim: "#bea5ff",
  onPrimaryFixed: "#2f1369",
  onPrimaryFixedVariant: "#4d3689",
  secondary: "#4d6645",
  secondaryDim: "#41593a",
  onSecondary: "#ebffe0",
  secondaryContainer: "#d3f1c7",
  onSecondaryContainer: "#435b3c",
  secondaryFixed: "#d3f1c7",
  secondaryFixedDim: "#c5e2ba",
  onSecondaryFixed: "#31492b",
  onSecondaryFixedVariant: "#4d6645",
  tertiary: "#376b21",
  tertiaryDim: "#2b5e15",
  onTertiary: "#ecffdc",
  tertiaryContainer: "#c2ffa2",
  onTertiaryContainer: "#31641b",
  tertiaryFixed: "#c2ffa2",
  tertiaryFixedDim: "#b4f095",
  onTertiaryFixed: "#1e5107",
  onTertiaryFixedVariant: "#3b6f24",
  error: "#ac3149",
  errorDim: "#770326",
  onError: "#fff7f7",
  errorContainer: "#f76a80",
  onErrorContainer: "#68001f",
  success: "#006c50",
  onSuccess: "#ffffff",
  successContainer: "#96f5cf",
  onSuccessContainer: "#00513c",
  warning: "#895100",
  onWarning: "#ffffff",
  warningContainer: "#ffdcbc",
  onWarningContainer: "#683d00",
  background: "#fff7ff",
  onBackground: "#3d2a51",
  surface: "#fff7ff",
  surfaceDim: "#e9d1ff",
  surfaceBright: "#fff7ff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#fbf0ff",
  surfaceContainer: "#f7e9ff",
  surfaceContainerHigh: "#f3e2ff",
  surfaceContainerHighest: "#efdbff",
  onSurface: "#3d2a51",
  surfaceVariant: "#efdbff",
  onSurfaceVariant: "#6b5681",
  surfaceTint: "#6850a5",
  outline: "#88729e",
  outlineVariant: "#c1a8d8",
  inverseSurface: "#130a1e",
  inverseOnSurface: "#a697b2",
  shadow: "#000000",
  scrim: "#000000",
};

const DEFAULT_DARK: M3ESemanticColorRoles = {
  primary: "#c7b4f5",
  primaryDim: "#b9a7e7",
  onPrimary: "#403168",
  primaryContainer: "#4d3d75",
  onPrimaryContainer: "#d8c8ff",
  inversePrimary: "#65568f",
  primaryFixed: "#cab6ff",
  primaryFixedDim: "#bea5ff",
  onPrimaryFixed: "#2f1369",
  onPrimaryFixedVariant: "#4d3689",
  secondary: "#bbcbb2",
  secondaryDim: "#adbea5",
  onSecondary: "#364431",
  secondaryContainer: "#1c2918",
  onSecondaryContainer: "#98a990",
  secondaryFixed: "#d3f1c7",
  secondaryFixedDim: "#c5e2ba",
  onSecondaryFixed: "#31492b",
  onSecondaryFixedVariant: "#4d6645",
  tertiary: "#edffdf",
  tertiaryDim: "#bffca0",
  onTertiary: "#376b21",
  tertiaryContainer: "#bffca0",
  onTertiaryContainer: "#2f6219",
  tertiaryFixed: "#c2ffa2",
  tertiaryFixedDim: "#b4f095",
  onTertiaryFixed: "#1e5107",
  onTertiaryFixedVariant: "#3b6f24",
  error: "#fd6f85",
  errorDim: "#c8475d",
  onError: "#490013",
  errorContainer: "#8a1632",
  onErrorContainer: "#ff97a3",
  success: "#7ad8b4",
  onSuccess: "#003828",
  successContainer: "#00513c",
  onSuccessContainer: "#96f5cf",
  warning: "#ffb86b",
  onWarning: "#492900",
  warningContainer: "#683d00",
  onWarningContainer: "#ffdcbc",
  background: "#120b1a",
  onBackground: "#f1dfff",
  surface: "#120b1a",
  surfaceDim: "#120b1a",
  surfaceBright: "#342545",
  surfaceContainerLowest: "#000000",
  surfaceContainerLow: "#181021",
  surfaceContainer: "#1f152a",
  surfaceContainerHigh: "#261a33",
  surfaceContainerHighest: "#2d203c",
  onSurface: "#f1dfff",
  surfaceVariant: "#2d203c",
  onSurfaceVariant: "#b7a4c7",
  surfaceTint: "#c7b4f5",
  outline: "#7f6f90",
  outlineVariant: "#504260",
  inverseSurface: "#fff7ff",
  inverseOnSurface: "#5b5163",
  shadow: "#000000",
  scrim: "#000000",
};

const DEFAULT_THEME: M3EThemeTokens = /* @__PURE__ */ (() => {
  const cssLightDarkVars: Record<string, string> = {};
  for (const key of Object.keys(DEFAULT_LIGHT) as SemanticColorRoleKey[]) {
    const cssVar = `--m3e-color-${key.replace(/[A-Z]/g, (ch) => `-${ch.toLowerCase()}`)}`;
    cssLightDarkVars[`${cssVar}-light`] = DEFAULT_LIGHT[key];
    cssLightDarkVars[`${cssVar}-dark`] = DEFAULT_DARK[key];
    cssLightDarkVars[cssVar] = `light-dark(var(${cssVar}-light, ${DEFAULT_LIGHT[key]}), var(${cssVar}-dark, ${DEFAULT_DARK[key]}))`;
  }
  return {
    seedHex: "#6750A4",
    variant: "expressive",
    contrastLevel: 0,
    platform: "phone",
    light: DEFAULT_LIGHT,
    dark: DEFAULT_DARK,
    cssLightDarkVars,
  };
})();

const DEFAULT_TRANSLATOR: M3ETranslateFn = (key, params) =>
  formatM3EMessage(enUSMessages[key], params);

function buildDefaultConfigJson(): string {
  return `${JSON.stringify(
    {
      $schema: `https://unpkg.com/m3eui@${M3E_PACKAGE_VERSION}/m3e.schema.json`,
      style: "expressive",
      theme: {
        seed: "#6750A4",
        schemeVariant: "expressive",
        platform: "phone",
        colorMode: "system",
        contrastLevel: 0,
        motionScheme: "expressive",
      },
      i18n: {
        locale: "en-US",
        direction: "auto",
      },
      css: {
        output: "src/styles/m3e-theme.css",
      },
      aliases: {
        components: "@/components/ui",
        tokens: "m3eui/tokens",
        i18n: "@/i18n",
      },
    },
    null,
    2,
  )}\n`;
}

export const M3EContext = React.createContext<M3EContextValue>({
  seedHex: "#6750A4",
  setSeedHex: () => {},
  schemeVariant: "expressive",
  setSchemeVariant: () => {},
  platform: "phone",
  setPlatform: () => {},
  contrastLevel: 0,
  setContrastLevel: () => {},
  colorMode: "system",
  resolvedColorMode: "light",
  setColorMode: () => {},
  locale: "en-US",
  setLocale: () => {},
  messages: enUSMessages,
  t: DEFAULT_TRANSLATOR,
  directionMode: "auto",
  setDirectionMode: () => {},
  direction: "ltr",
  setDirection: () => {},
  motionSchemeName: "expressive",
  setMotionSchemeName: () => {},
  motionScheme: EXPRESSIVE_MOTION_SCHEME,
  playbackRate: 1,
  setPlaybackRate: () => {},
  paused: false,
  setPaused: () => {},
  debugGeometry: false,
  setDebugGeometry: () => {},
  prefersReducedMotion: false,
  themeTokens: DEFAULT_THEME,
  exportConfigJson: buildDefaultConfigJson,
});

export function useM3E(): M3EContextValue {
  return React.useContext(M3EContext);
}

export function useM3EI18n(): {
  readonly locale: M3ELocale;
  readonly setLocale: (locale: M3ELocale) => void;
  readonly direction: TextDirection;
  readonly messages: M3EMessages;
  readonly t: M3ETranslateFn;
} {
  const { locale, setLocale, direction, messages, t } =
    React.useContext(M3EContext);
  return { locale, setLocale, direction, messages, t };
}
