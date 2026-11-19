"use client";

import * as React from "react";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect.js";

export type M3EPositionMethod = "absolute" | "fixed";

export function resolveElementPositionMethod(
  anchor: Element | null | undefined,
  portalRoot?: Element | null,
): M3EPositionMethod {
  if (!anchor || typeof window === "undefined") return "absolute";
  const stopAt = portalRoot ?? anchor.ownerDocument.documentElement;
  let cur: Element | null = anchor;
  while (cur && cur !== stopAt) {
    const pos = window.getComputedStyle(cur).position;
    if (pos === "fixed" || pos === "sticky") {
      return "fixed";
    }
    cur = cur.parentElement;
  }
  return "absolute";
}

export function useAdaptivePositionMethod(
  anchorRef: React.RefObject<Element | null>,
  active?: boolean,
): M3EPositionMethod {
  const portalContainer = useM3EPortalContainer();
  const [method, setMethod] = React.useState<M3EPositionMethod>("absolute");

  useIsoLayoutEffect(() => {
    const next = resolveElementPositionMethod(
      anchorRef.current,
      portalContainer,
    );
    setMethod((prev) => (prev === next ? prev : next));
  }, [anchorRef, portalContainer, active]);

  return method;
}
