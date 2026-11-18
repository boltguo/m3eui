"use client";

import * as React from "react";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";

export interface M3EPortalScope {
  readonly lang: string;
  readonly dir: "ltr" | "rtl";
  readonly colorMode: "light" | "dark" | "system";
  readonly resolvedColorMode: "light" | "dark";
  readonly motionSchemeName: string;
  readonly debugGeometry: boolean;
  readonly cssVars: Readonly<Record<string, string>>;
}

export const M3EPortalContext = React.createContext<
  HTMLElement | null | undefined
>(undefined);

export const M3EPortalScopeContext = React.createContext<M3EPortalScope | null>(
  null,
);

function syncScopedPortalHost(
  host: HTMLElement,
  scope: M3EPortalScope,
  prevCssVarKeys: readonly string[],
): readonly string[] {
  host.lang = scope.lang;
  host.dir = scope.dir;
  host.dataset.colorMode = scope.colorMode;
  host.dataset.theme = scope.resolvedColorMode;
  host.dataset.motionScheme = scope.motionSchemeName;
  if (scope.debugGeometry) {
    host.dataset.debugGeometry = "";
  } else {
    delete host.dataset.debugGeometry;
  }
  host.style.colorScheme =
    scope.colorMode === "system" ? "light dark" : scope.colorMode;

  const nextKeys = Object.keys(scope.cssVars);
  for (const prevKey of prevCssVarKeys) {
    if (!(prevKey in scope.cssVars)) {
      host.style.removeProperty(prevKey);
    }
  }
  for (const key of nextKeys) {
    host.style.setProperty(key, scope.cssVars[key]!);
  }
  return nextKeys;
}

export function useScopedPortalHost(
  targetParent: HTMLElement | null | undefined,
  scope: M3EPortalScope | null,
): HTMLElement | null | undefined {
  const [host, setHost] = React.useState<HTMLDivElement | null>(null);
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const prevVarKeysRef = React.useRef<readonly string[]>([]);

  useIsoLayoutEffect(() => {
    if (!targetParent || !scope || typeof document === "undefined") {
      hostRef.current = null;
      prevVarKeysRef.current = [];
      setHost(null);
      return;
    }
    const el = document.createElement("div");
    el.className = "m3e-scope";
    el.dataset.m3ePortal = "";
    prevVarKeysRef.current = syncScopedPortalHost(el, scope, []);
    targetParent.appendChild(el);
    hostRef.current = el;
    setHost(el);
    return () => {
      el.remove();
      hostRef.current = null;
      prevVarKeysRef.current = [];
      setHost(null);
    };
  }, [targetParent, Boolean(scope)]);

  useIsoLayoutEffect(() => {
    const el = hostRef.current;
    if (!el || !scope) return;
    prevVarKeysRef.current = syncScopedPortalHost(
      el,
      scope,
      prevVarKeysRef.current,
    );
  }, [scope]);

  if (targetParent === undefined) return undefined;
  if (targetParent === null) return null;
  return scope ? host : targetParent;
}

export interface M3EPortalProps {
  readonly container: HTMLElement | null | undefined;
  readonly children: React.ReactNode;
}

export function M3EPortal({
  container,
  children,
}: M3EPortalProps): React.JSX.Element {
  const scope = React.useContext(M3EPortalScopeContext);
  const scopedContainer = useScopedPortalHost(container, scope);
  return (
    <M3EPortalContext.Provider value={scopedContainer}>
      {children}
    </M3EPortalContext.Provider>
  );
}

export function useM3EPortalContainer(): HTMLElement | null | undefined {
  return React.useContext(M3EPortalContext);
}
