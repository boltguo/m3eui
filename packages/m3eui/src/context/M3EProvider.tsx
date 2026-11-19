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
  type M3EThemeTokens,
} from "../tokens/color.js";
import {
  type ColorSchemeVariant,
} from "../tokens/color-variants.js";
import {
  generateM3ESystemCssVars,
} from "../tokens/elevation.js";
import {
  MOTION_SCHEMES,
  type MotionSchemeName,
} from "../tokens/motion.js";
import {
  generateM3ETypographyCssVars,
} from "../tokens/typography.js";
import { M3EToastViewportHost } from "../components/Toast/Toast.js";
import {
  M3EToastManagerContext,
  createM3EToastManager,
} from "../internal/toastManager.js";
import {
  type ColorMode,
  M3EContext,
  type M3EContextValue,
  M3E_DEFAULT_THEME,
  type M3EMotionRuntime,
  M3ERuntimeContext,
  type M3ERuntimeValue,
  useM3E,
  useM3EI18n,
} from "./M3EContext.js";
import {
  M3EPortalContext,
  type M3EPortalScope,
  M3EPortalScopeContext,
  useScopedPortalHost,
} from "./M3EPortal.js";
import {
  M3E_COLOR_SCHEME_STORAGE_KEY,
  type M3EConfigInput,
  type M3EDirectionSetting,
  generateM3EMotionCssVars,
  resolveM3EConfig,
  serializeM3EConfig,
} from "../config.js";
import {
  type M3ELocale,
  type M3EMessageOverrides,
  canonicalizeBcp47Locale,
  createM3ETranslator,
  isRtlLocale,
  resolveM3EMessages,
} from "../i18n/index.js";

const STATIC_SCOPE_CSS_VARS: Record<string, string> = {
  ...generateM3ESystemCssVars(),
  ...generateM3ETypographyCssVars(),
};
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";

export type { ColorMode, M3EContextValue, TextDirection };
export { useM3E, useM3EI18n };


export interface M3EProviderProps {
  readonly children: React.ReactNode;
  readonly config?: M3EConfigInput;
  readonly themeEngine?: (options: {
    readonly seedHex: string;
    readonly variant: ColorSchemeVariant;
    readonly contrastLevel: number;
    readonly platform: ColorPlatform;
  }) => M3EThemeTokens;
  readonly initialSeedHex?: string;
  readonly initialSchemeVariant?: ColorSchemeVariant;
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
  readonly portalContainer?: HTMLElement | null;
}

export function M3EProvider({
  children,
  config,
  themeEngine,
  initialSeedHex,
  initialSchemeVariant,
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
  portalContainer: explicitPortalContainer,
}: M3EProviderProps): React.JSX.Element {
  const resolvedCfg = React.useMemo(() => resolveM3EConfig(config), [config]);

  const [seedHex, setSeedHex] = React.useState<string>(
    initialSeedHex ?? resolvedCfg.seedHex,
  );
  const [schemeVariant, setSchemeVariant] = React.useState<ColorSchemeVariant>(
    initialSchemeVariant ?? resolvedCfg.schemeVariant,
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
  const [colorMode, setColorMode] = React.useState<ColorMode>(fallbackColorMode);
  const storageHydratedRef = React.useRef(false);
  const [toastManager] = React.useState(createM3EToastManager);

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
  const [prefersDarkColorScheme, setPrefersDarkColorScheme] =
    React.useState<boolean>(false);

  const resolvedColorMode: "light" | "dark" =
    colorMode === "system"
      ? prefersDarkColorScheme
        ? "dark"
        : "light"
      : colorMode;

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
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setPrefersDarkColorScheme(mq.matches);
    const onChange = (e: MediaQueryListEvent) =>
      setPrefersDarkColorScheme(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  React.useEffect(() => {
    if (!syncDocumentRoot || typeof window === "undefined") return;
    const onStorage = (e: StorageEvent) => {
      if (e.key !== M3E_COLOR_SCHEME_STORAGE_KEY) return;
      if (
        e.newValue === "light" ||
        e.newValue === "dark" ||
        e.newValue === "system"
      ) {
        setColorMode(e.newValue);
      } else {
        setColorMode(fallbackColorMode);
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [fallbackColorMode, syncDocumentRoot]);

  const themeTokens = React.useMemo(
    () =>
      themeEngine
        ? themeEngine({
            seedHex,
            variant: schemeVariant,
            contrastLevel,
            platform,
          })
        : M3E_DEFAULT_THEME,
    [themeEngine, seedHex, schemeVariant, contrastLevel, platform],
  );

  const motionScheme = MOTION_SCHEMES[motionSchemeName];

  const cssVars = React.useMemo(() => {
    return {
      ...STATIC_SCOPE_CSS_VARS,
      ...(themeEngine ? themeTokens.cssLightDarkVars : undefined),
      ...generateM3EMotionCssVars(motionScheme, playbackRate),
    } as Record<string, string>;
  }, [themeEngine, themeTokens, motionScheme, playbackRate]);

  useIsoLayoutEffect(() => {
    if (!syncDocumentRoot || typeof document === "undefined") return;
    if (!storageHydratedRef.current) {
      storageHydratedRef.current = true;
      if (!initialColorMode) {
        try {
          const saved = window.localStorage.getItem(
            M3E_COLOR_SCHEME_STORAGE_KEY,
          );
          if (
            (saved === "light" || saved === "dark" || saved === "system") &&
            saved !== colorMode
          ) {
            setColorMode(saved);
            return;
          }
        } catch {
        }
      }
    }
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
    document.documentElement.style.colorScheme = metaContent;
    try {
      if (colorMode === fallbackColorMode) {
        window.localStorage.removeItem(M3E_COLOR_SCHEME_STORAGE_KEY);
      } else {
        window.localStorage.setItem(M3E_COLOR_SCHEME_STORAGE_KEY, colorMode);
      }
    } catch {
    }
  }, [colorMode, fallbackColorMode, initialColorMode, syncDocumentRoot]);

  const canonicalLocale = React.useMemo(
    () => canonicalizeBcp47Locale(activeLocale),
    [activeLocale],
  );

  useIsoLayoutEffect(() => {
    if (!syncDocumentRoot || typeof document === "undefined") return;
    document.documentElement.dir = direction;
    document.documentElement.lang = canonicalLocale;
  }, [direction, canonicalLocale, syncDocumentRoot]);

  const appliedCssVarsRef = React.useRef<Record<string, string>>({});

  useIsoLayoutEffect(() => {
    if (!syncDocumentRoot || typeof document === "undefined") return;
    const rootStyle = document.documentElement.style;
    const prev = appliedCssVarsRef.current;
    const nextKeys = Object.keys(cssVars);
    for (const k of nextKeys) {
      const nextVal = cssVars[k]!;
      if (prev[k] !== nextVal) {
        rootStyle.setProperty(k, nextVal);
      }
    }
    appliedCssVarsRef.current = cssVars;
  }, [cssVars, syncDocumentRoot]);

  useIsoLayoutEffect(() => {
    if (!syncDocumentRoot || typeof document === "undefined") return;
    return () => {
      const rootStyle = document.documentElement.style;
      for (const k of Object.keys(appliedCssVarsRef.current)) {
        rootStyle.removeProperty(k);
      }
      appliedCssVarsRef.current = {};
    };
  }, [syncDocumentRoot]);

  const portalScope = React.useMemo<M3EPortalScope>(
    () => ({
      lang: canonicalLocale,
      dir: direction,
      colorMode,
      resolvedColorMode,
      motionSchemeName,
      debugGeometry,
      cssVars,
    }),
    [
      canonicalLocale,
      direction,
      colorMode,
      resolvedColorMode,
      motionSchemeName,
      debugGeometry,
      cssVars,
    ],
  );

  const portalParent =
    explicitPortalContainer !== undefined
      ? explicitPortalContainer
      : !syncDocumentRoot && typeof document !== "undefined"
        ? document.body
        : undefined;

  const effectivePortalContainer = useScopedPortalHost(
    portalParent,
    portalScope,
  );

  const exportConfigJson = React.useCallback(
    () =>
      serializeM3EConfig({
        seedHex,
        schemeVariant,
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
      platform,
      setPlatform,
      contrastLevel,
      setContrastLevel,
      colorMode,
      resolvedColorMode,
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
      platform,
      contrastLevel,
      setContrastLevel,
      colorMode,
      resolvedColorMode,
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

  const motionRef = React.useRef<M3EMotionRuntime>({
    motionScheme,
    playbackRate,
  });
  motionRef.current = { motionScheme, playbackRate };

  const runtimeValue = React.useMemo<M3ERuntimeValue>(
    () => ({
      locale: canonicalLocale,
      setLocale: setUncontrolledLocale,
      direction,
      messages,
      t,
      paused,
      debugGeometry,
      prefersReducedMotion,
      motionRef,
    }),
    [
      canonicalLocale,
      direction,
      messages,
      t,
      paused,
      debugGeometry,
      prefersReducedMotion,
    ],
  );

  const effectiveNonce = cspNonce ?? resolvedCfg.cspNonce;
  const effectiveDisableStyles =
    cspDisableStyleElements ?? resolvedCfg.cspDisableStyleElements;

  const content = (
    <M3EPortalScopeContext.Provider value={portalScope}>
      <M3EPortalContext.Provider value={effectivePortalContainer}>
      <DirectionProvider direction={direction}>
        <BaseTooltip.Provider delay={280} timeout={400}>
          <BaseToast.Provider
            toastManager={toastManager}
            limit={4}
            timeout={4000}
          >
            <div
              lang={canonicalLocale}
              dir={direction}
              className="m3e-scope"
              data-color-mode={colorMode}
              data-theme={resolvedColorMode}
              data-motion-scheme={motionSchemeName}
              data-debug-geometry={debugGeometry ? "" : undefined}
              style={
                syncDocumentRoot
                  ? undefined
                  : ({
                      ...cssVars,
                      colorScheme:
                        colorMode === "system" ? "light dark" : colorMode,
                    } as React.CSSProperties)
              }
            >
              {children}
            </div>
            <M3EToastViewportHost />
          </BaseToast.Provider>
        </BaseTooltip.Provider>
      </DirectionProvider>
    </M3EPortalContext.Provider>
    </M3EPortalScopeContext.Provider>
  );

  return (
    <M3EContext.Provider value={value}>
      <M3ERuntimeContext.Provider value={runtimeValue}>
      <M3EToastManagerContext.Provider value={toastManager}>
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
      </M3EToastManagerContext.Provider>
      </M3ERuntimeContext.Provider>
    </M3EContext.Provider>
  );
}
