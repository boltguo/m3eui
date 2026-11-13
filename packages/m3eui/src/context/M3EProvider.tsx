"use client";

import * as React from "react";
import { CSPProvider } from "@base-ui/react/csp-provider";
import {
  DirectionProvider,
  type TextDirection,
} from "@base-ui/react/direction-provider";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import {
  type ColorPlatform,
  type ColorSchemeVariant,
  type ColorSpecVersion,
  EXPRESSIVE_MOTION_SCHEME,
  type M3EThemeTokens,
  MOTION_SCHEMES,
  type MotionScheme,
  type MotionSchemeName,
  generateM3ESystemCssVars,
  generateM3EThemeTokens,
  generateM3ETypographyCssVars,
} from "../tokens/index.js";
import { M3EToastViewportHost } from "../components/Toast.js";
import {
  type M3EConfig,
  type M3EDirectionSetting,
  generateM3EMotionCssVars,
  resolveM3EConfig,
  serializeM3EConfig,
} from "../config.js";
import {
  type M3ELocale,
  type M3EMessageOverrides,
  type M3EMessages,
  type M3ETranslateFn,
  canonicalizeBcp47Locale,
  createM3ETranslator,
  enUSMessages,
  isRtlLocale,
  resolveM3EMessages,
} from "../i18n/index.js";

export type ColorMode = "system" | "light" | "dark";
export type { TextDirection };
export { CSPProvider };

export const M3E_COLOR_SCHEME_STORAGE_KEY = "m3e-color-scheme";

export function getM3EInitScript(
  storageKey: string = M3E_COLOR_SCHEME_STORAGE_KEY,
): string {
  const safeKey = JSON.stringify(storageKey);
  return `try{var s=localStorage.getItem(${safeKey});var m=document.querySelector('meta[name="color-scheme"]');if(m)m.content=(s==="light"||s==="dark")?s:"light dark";}catch(e){}`;
}

export interface M3EContextValue {
  readonly seedHex: string;
  readonly setSeedHex: (hex: string) => void;
  readonly schemeVariant: ColorSchemeVariant;
  readonly setSchemeVariant: (variant: ColorSchemeVariant) => void;
  readonly specVersion: ColorSpecVersion;
  readonly setSpecVersion: (specVersion: ColorSpecVersion) => void;
  readonly platform: ColorPlatform;
  readonly setPlatform: (platform: ColorPlatform) => void;
  readonly contrastLevel: number;
  readonly setContrastLevel: (level: number) => void;
  readonly colorMode: ColorMode;
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

const DEFAULT_THEME = generateM3EThemeTokens({
  seedHex: "#6750A4",
  variant: "expressive",
  contrastLevel: 0,
  specVersion: "2025",
  platform: "phone",
});

const DEFAULT_TRANSLATOR = createM3ETranslator("en-US");

const M3EContext = React.createContext<M3EContextValue>({
  seedHex: "#6750A4",
  setSeedHex: () => {},
  schemeVariant: "expressive",
  setSchemeVariant: () => {},
  specVersion: "2025",
  setSpecVersion: () => {},
  platform: "phone",
  setPlatform: () => {},
  contrastLevel: 0,
  setContrastLevel: () => {},
  colorMode: "system",
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
  exportConfigJson: () => serializeM3EConfig({}),
});

export interface M3EProviderProps {
  readonly children: React.ReactNode;
  readonly config?: M3EConfig;
  readonly initialSeedHex?: string;
  readonly initialSchemeVariant?: ColorSchemeVariant;
  readonly initialSpecVersion?: ColorSpecVersion;
  readonly initialPlatform?: ColorPlatform;
  readonly initialContrastLevel?: number;
  readonly initialColorMode?: ColorMode;
  readonly initialLocale?: M3ELocale;
  readonly locale?: M3ELocale;
  readonly messages?: M3EMessageOverrides;
  readonly initialDirection?: M3EDirectionSetting;
  readonly initialMotionScheme?: MotionSchemeName;
  readonly initialPlaybackRate?: number;
  readonly cspNonce?: string;
  readonly cspDisableStyleElements?: boolean;
  readonly syncDocumentRoot?: boolean;
}

export function M3EProvider({
  children,
  config,
  initialSeedHex,
  initialSchemeVariant,
  initialSpecVersion,
  initialPlatform,
  initialContrastLevel,
  initialColorMode,
  initialLocale,
  locale: controlledLocale,
  messages: propMessageOverrides,
  initialDirection,
  initialMotionScheme,
  initialPlaybackRate = 1,
  cspNonce,
  cspDisableStyleElements,
  syncDocumentRoot = true,
}: M3EProviderProps): React.JSX.Element {
  const resolvedCfg = React.useMemo(() => resolveM3EConfig(config), [config]);

  const [seedHex, setSeedHex] = React.useState<string>(
    initialSeedHex ?? resolvedCfg.seedHex,
  );
  const [schemeVariant, setSchemeVariant] = React.useState<ColorSchemeVariant>(
    initialSchemeVariant ?? resolvedCfg.schemeVariant,
  );
  const [specVersion, setSpecVersion] = React.useState<ColorSpecVersion>(
    initialSpecVersion ?? resolvedCfg.specVersion,
  );
  const [platform, setPlatform] = React.useState<ColorPlatform>(
    initialPlatform ?? resolvedCfg.platform,
  );
  const [contrastLevel, setContrastLevelState] = React.useState<number>(
    initialContrastLevel ?? resolvedCfg.contrastLevel,
  );
  const setContrastLevel = React.useCallback((level: number) => {
    setContrastLevelState(Math.max(-1, Math.min(1, level)));
  }, []);

  const fallbackColorMode = initialColorMode ?? resolvedCfg.colorMode;
  const [colorMode, setColorMode] = React.useState<ColorMode>(() => {
    if (typeof window === "undefined") return fallbackColorMode;
    try {
      const saved = window.localStorage.getItem(M3E_COLOR_SCHEME_STORAGE_KEY);
      if (saved === "light" || saved === "dark") {
        return saved;
      }
    } catch {
    }
    return fallbackColorMode;
  });

  const [uncontrolledLocale, setUncontrolledLocale] = React.useState<M3ELocale>(
    initialLocale ?? resolvedCfg.locale,
  );
  const activeLocale = controlledLocale ?? uncontrolledLocale;

  const [directionMode, setDirectionMode] =
    React.useState<M3EDirectionSetting>(
      initialDirection ?? resolvedCfg.directionMode,
    );

  const direction: TextDirection =
    directionMode === "auto"
      ? isRtlLocale(activeLocale)
        ? "rtl"
        : "ltr"
      : directionMode;

  const setDirection = React.useCallback((dir: TextDirection) => {
    setDirectionMode(dir);
  }, []);

  const [motionSchemeName, setMotionSchemeName] =
    React.useState<MotionSchemeName>(
      initialMotionScheme ?? resolvedCfg.motionScheme,
    );
  const [playbackRate, setPlaybackRate] =
    React.useState<number>(initialPlaybackRate);
  const [paused, setPaused] = React.useState<boolean>(false);
  const [debugGeometry, setDebugGeometry] = React.useState<boolean>(false);
  const [prefersReducedMotion, setPrefersReducedMotion] =
    React.useState<boolean>(false);

  const mergedOverrides = React.useMemo<M3EMessageOverrides | undefined>(() => {
    if (!resolvedCfg.messages && !propMessageOverrides) return undefined;
    return { ...resolvedCfg.messages, ...propMessageOverrides };
  }, [resolvedCfg.messages, propMessageOverrides]);

  const messages = React.useMemo(
    () => resolveM3EMessages(activeLocale, mergedOverrides),
    [activeLocale, mergedOverrides],
  );

  const t = React.useMemo(
    () => createM3ETranslator(activeLocale, mergedOverrides),
    [activeLocale, mergedOverrides],
  );

  React.useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  React.useEffect(() => {
    if (!syncDocumentRoot || typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== M3E_COLOR_SCHEME_STORAGE_KEY) return;
      if (e.newValue === "light" || e.newValue === "dark") {
        setColorMode(e.newValue);
      } else {
        setColorMode("system");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [syncDocumentRoot]);

  const themeTokens = React.useMemo(
    () =>
      generateM3EThemeTokens({
        seedHex,
        variant: schemeVariant,
        contrastLevel,
        specVersion,
        platform,
      }),
    [seedHex, schemeVariant, contrastLevel, specVersion, platform],
  );

  const motionScheme = MOTION_SCHEMES[motionSchemeName];

  const staticFoundationVars = React.useMemo(
    () => ({
      ...generateM3ESystemCssVars(),
      ...generateM3ETypographyCssVars(),
    }),
    [],
  );

  const cssVars = React.useMemo(() => {
    return {
      ...staticFoundationVars,
      ...themeTokens.cssLightDarkVars,
      ...generateM3EMotionCssVars(motionScheme, playbackRate),
    } as Record<string, string>;
  }, [staticFoundationVars, themeTokens, motionScheme, playbackRate]);

  React.useEffect(() => {
    if (!syncDocumentRoot || typeof document === "undefined") return;
    const metaContent = colorMode === "system" ? "light dark" : colorMode;
    let meta = document.querySelector<HTMLMetaElement>(
      'meta[name="color-scheme"]',
    );
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "color-scheme";
      document.head.appendChild(meta);
    }
    meta.setAttribute("content", metaContent);
    document.documentElement.dataset.colorMode = colorMode;
    try {
      if (colorMode === "system") {
        window.localStorage.removeItem(M3E_COLOR_SCHEME_STORAGE_KEY);
      } else {
        window.localStorage.setItem(M3E_COLOR_SCHEME_STORAGE_KEY, colorMode);
      }
    } catch {
    }
  }, [colorMode, syncDocumentRoot]);

  const canonicalLocale = React.useMemo(
    () => canonicalizeBcp47Locale(activeLocale),
    [activeLocale],
  );

  React.useEffect(() => {
    if (!syncDocumentRoot || typeof document === "undefined") return;
    document.documentElement.dir = direction;
    document.documentElement.lang = canonicalLocale;
  }, [direction, canonicalLocale, syncDocumentRoot]);

  React.useEffect(() => {
    if (!syncDocumentRoot || typeof document === "undefined") return;
    const rootStyle = document.documentElement.style;
    for (const [k, v] of Object.entries(cssVars)) {
      rootStyle.setProperty(k, v);
    }
  }, [cssVars, syncDocumentRoot]);

  const exportConfigJson = React.useCallback(
    () =>
      serializeM3EConfig({
        seedHex,
        schemeVariant,
        specVersion,
        platform,
        colorMode,
        contrastLevel,
        motionScheme: motionSchemeName,
        locale: canonicalLocale,
        directionMode,
        cssOutput: resolvedCfg.cssOutput,
      }),
    [
      seedHex,
      schemeVariant,
      specVersion,
      platform,
      colorMode,
      contrastLevel,
      motionSchemeName,
      canonicalLocale,
      directionMode,
      resolvedCfg.cssOutput,
    ],
  );

  const value = React.useMemo<M3EContextValue>(
    () => ({
      seedHex,
      setSeedHex,
      schemeVariant,
      setSchemeVariant,
      specVersion,
      setSpecVersion,
      platform,
      setPlatform,
      contrastLevel,
      setContrastLevel,
      colorMode,
      setColorMode,
      locale: canonicalLocale,
      setLocale: setUncontrolledLocale,
      messages,
      t,
      directionMode,
      setDirectionMode,
      direction,
      setDirection,
      motionSchemeName,
      setMotionSchemeName,
      motionScheme,
      playbackRate,
      setPlaybackRate,
      paused,
      setPaused,
      debugGeometry,
      setDebugGeometry,
      prefersReducedMotion,
      themeTokens,
      exportConfigJson,
    }),
    [
      seedHex,
      schemeVariant,
      specVersion,
      platform,
      contrastLevel,
      setContrastLevel,
      colorMode,
      canonicalLocale,
      messages,
      t,
      directionMode,
      direction,
      setDirection,
      motionSchemeName,
      motionScheme,
      playbackRate,
      paused,
      debugGeometry,
      prefersReducedMotion,
      themeTokens,
      exportConfigJson,
    ],
  );

  const effectiveNonce = cspNonce ?? resolvedCfg.cspNonce;
  const effectiveDisableStyles =
    cspDisableStyleElements ?? resolvedCfg.cspDisableStyleElements;

  const content = (
    <DirectionProvider direction={direction}>
      <BaseTooltip.Provider delay={280} timeout={400}>
        <BaseToast.Provider limit={4} timeout={4200}>
          <div
            lang={canonicalLocale}
            dir={direction}
            className="m3e-scope"
            data-motion-scheme={motionSchemeName}
            data-debug-geometry={debugGeometry ? "" : undefined}
            style={
              syncDocumentRoot ? undefined : (cssVars as React.CSSProperties)
            }
          >
            {children}
          </div>
          <M3EToastViewportHost />
        </BaseToast.Provider>
      </BaseTooltip.Provider>
    </DirectionProvider>
  );

  return (
    <M3EContext.Provider value={value}>
      {effectiveNonce || effectiveDisableStyles ? (
        <CSPProvider
          nonce={effectiveNonce}
          disableStyleElements={effectiveDisableStyles}
        >
          {content}
        </CSPProvider>
      ) : (
        content
      )}
    </M3EContext.Provider>
  );
}

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
  const { locale, setLocale, direction, messages, t } = React.useContext(M3EContext);
  return { locale, setLocale, direction, messages, t };
}
