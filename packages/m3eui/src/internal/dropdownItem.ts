"use client";

import type * as React from "react";
import {
  SEGMENTED_MENU_TOKENS,
  resolveSegmentedMenuItemCorners,
} from "../tokens/topology.js";
import {
  useM3ECornerSpringRef,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import {
  type M3EInteractionHandlers,
  mergeInteractionHandlers,
  useM3ERipple,
} from "./ripple.js";

export interface DropdownItemStateOptions<T extends HTMLElement = HTMLDivElement> {
  readonly index: number;
  readonly count: number;
  readonly disabled?: boolean;
  readonly isSelected?: boolean;
  readonly isFirstInGroup?: boolean;
  readonly isLastInGroup?: boolean;
  readonly hasDescription?: boolean;
  readonly fixedRadius?: number;
  readonly forwardedRef?: React.Ref<T>;
}

export interface DropdownItemStateResult<T extends HTMLElement = HTMLDivElement> {
  readonly ref: (node: T | null) => void;
  readonly rippleRef: React.RefObject<HTMLSpanElement | null>;
  readonly isPressed: boolean;
  readonly interactionHandlers: M3EInteractionHandlers;
  readonly itemStyle: React.CSSProperties;
}

export function useDropdownItemState<T extends HTMLElement = HTMLDivElement>({
  index,
  count,
  disabled = false,
  isSelected = false,
  isFirstInGroup,
  isLastInGroup,
  hasDescription = false,
  fixedRadius,
  forwardedRef,
}: DropdownItemStateOptions<T>): DropdownItemStateResult<T> {
  const { isPressed, pressHandlers } = usePressHoldState(disabled);
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  const interactionHandlers = mergeInteractionHandlers(
    pressHandlers,
    rippleHandlers,
  );

  const corners =
    fixedRadius !== undefined
      ? ([fixedRadius, fixedRadius, fixedRadius, fixedRadius] as const)
      : resolveSegmentedMenuItemCorners({
          index,
          count,
          isFirstInGroup,
          isLastInGroup,
          isSelected,
          isPressed: !disabled && isPressed,
        });

  const { ref, borderRadiusCss } = useM3ECornerSpringRef<T>(
    corners,
    "fastSpatial",
    forwardedRef,
  );

  const itemStyle: React.CSSProperties = {
    minHeight: hasDescription
      ? `${SEGMENTED_MENU_TOKENS.itemTwoLineMinHeight}px`
      : `${SEGMENTED_MENU_TOKENS.itemHeight}px`,
    paddingBlock: hasDescription ? "10px" : "6px",
    paddingInline: `${SEGMENTED_MENU_TOKENS.itemPaddingInline}px`,
    borderRadius: borderRadiusCss,
  };

  return {
    ref,
    rippleRef,
    isPressed,
    interactionHandlers,
    itemStyle,
  };
}
