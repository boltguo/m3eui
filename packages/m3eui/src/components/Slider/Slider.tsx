"use client";

import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import {
  SLIDER_SIZE_SPECS,
  SLIDER_TOKENS,
  type SliderSize,
  resolveSliderThumbGeometry,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useM3EScalarSpringEffect } from "../../hooks/useM3ESpring.js";
import { formatLocalizedNumber } from "../../i18n/index.js";
import { useFieldsetDisabled } from "../../internal/fieldOutline.js";
import { FormFieldScope } from "../../internal/formField.js";
import { useIsoLayoutEffect } from "../../internal/useIsoLayoutEffect.js";

export type SliderValue = number | readonly [number, number];

function isRangeTuple(v: SliderValue): v is readonly [number, number] {
  return Array.isArray(v);
}

export interface M3ESliderProps<Value extends SliderValue = number> {
  readonly id?: string;
  readonly value?: Value;
  readonly defaultValue?: Value;
  readonly onValueChange?: (value: Value) => void;
  readonly onValueCommitted?: (value: Value) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly minStepsBetweenValues?: number;
  readonly orientation?: "horizontal" | "vertical";
  readonly centered?: boolean;
  readonly startIcon?: React.ReactNode;
  readonly endIcon?: React.ReactNode;
  readonly disabled?: boolean;
  readonly size?: SliderSize;
  readonly label?: React.ReactNode;
  readonly showValue?: boolean;
  readonly showValueBubble?: boolean;
  readonly showTicks?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly name?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function normalizeValues(
  v: SliderValue | undefined,
  fallback: number,
): [number] | [number, number] {
  if (v === undefined) return [fallback];
  if (isRangeTuple(v)) return [v[0], v[1]];
  return [v];
}

const SLIDER_STEP_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

interface SliderThumbBarProps {
  readonly index: number;
  readonly rawValue: number;
  readonly locale: string;
  readonly isRtl: boolean;
  readonly orientation: "horizontal" | "vertical";
  readonly thumbHeight: number;
  readonly isPressed: boolean;
  readonly isBubbleShown: boolean;
  readonly showValueBubble: boolean;
  readonly formatValue?: (v: number) => string;
  readonly ariaLabel?: string;
  readonly ariaLabelledBy?: string;
  readonly onThumbPointerDown: (index: number) => void;
  readonly onThumbKeyStep: (index: number) => void;
  readonly onThumbFocus: (index: number, e: React.FocusEvent<HTMLElement>) => void;
  readonly onThumbBlur: (index: number) => void;
}

function SliderThumbBar({
  index,
  rawValue,
  locale,
  isRtl,
  orientation,
  thumbHeight,
  isPressed,
  isBubbleShown,
  showValueBubble,
  formatValue,
  ariaLabel,
  ariaLabelledBy,
  onThumbPointerDown,
  onThumbKeyStep,
  onThumbFocus,
  onThumbBlur,
}: SliderThumbBarProps) {
  const { paused, prefersReducedMotion } = useM3ERuntime();
  const isVertical = orientation === "vertical";
  const verticalDirSign = isRtl ? -1 : 1;
  const geo = resolveSliderThumbGeometry(isPressed);
  const handleBarRef = React.useRef<HTMLSpanElement | null>(null);
  const bubbleRef = React.useRef<HTMLSpanElement | null>(null);
  const thumbWidthRef = React.useRef<number>(geo.thumbWidth);
  const bubblePRef = React.useRef<number>(isBubbleShown ? 1 : 0);

  if (paused || prefersReducedMotion) {
    thumbWidthRef.current = geo.thumbWidth;
    bubblePRef.current = isBubbleShown ? 1 : 0;
  }

  useM3EScalarSpringEffect(geo.thumbWidth, "fastSpatial", (val) => {
    const next = Math.max(1.5, val);
    thumbWidthRef.current = next;
    const el = handleBarRef.current;
    if (!el) return;
    const clamped = `${next.toFixed(2)}px`;
    if (isVertical) {
      el.style.height = clamped;
    } else {
      el.style.width = clamped;
    }
  });

  useM3EScalarSpringEffect(isBubbleShown ? 1 : 0, "fastSpatial", (val) => {
    const p = Math.max(0, Math.min(1, val));
    bubblePRef.current = p;
    const el = bubbleRef.current;
    if (!el) return;
    el.style.opacity = String(p);
    el.style.scale = (0.72 + 0.28 * p).toFixed(3);
    el.style.translate = isVertical
      ? `${((1 - p) * 6 * verticalDirSign).toFixed(2)}px -50%`
      : `-50% ${((1 - p) * 6).toFixed(2)}px`;
  });

  const formatted = formatValue
    ? formatValue(rawValue)
    : formatLocalizedNumber(locale, Math.round(rawValue * 100) / 100);

  const renderBubbleP = bubblePRef.current;

  return (
    <BaseSlider.Thumb
      index={index}
      aria-label={ariaLabel}
      aria-labelledby={ariaLabelledBy}
      aria-valuetext={formatValue ? formatted : undefined}
      className="m3e-slider__thumb"
      data-orientation={orientation}
      data-active={isPressed ? "" : undefined}
      style={
        isVertical
          ? { width: `${thumbHeight}px` }
          : { height: `${thumbHeight}px` }
      }
      onPointerDown={(e) => {
        if (e.button === 0) {
          onThumbPointerDown(index);
        }
      }}
      onKeyDown={(e) => {
        if (SLIDER_STEP_KEYS.has(e.key)) {
          onThumbKeyStep(index);
        }
      }}
      onFocus={(e) => onThumbFocus(index, e)}
      onBlur={() => onThumbBlur(index)}
    >
      <span
        ref={handleBarRef}
        className="m3e-slider__handle-bar"
        style={
          isVertical
            ? {
                width: `${thumbHeight}px`,
                height: `${thumbWidthRef.current.toFixed(2)}px`,
                borderRadius: `${SLIDER_TOKENS.thumbRadius}px`,
              }
            : {
                width: `${thumbWidthRef.current.toFixed(2)}px`,
                height: `${thumbHeight}px`,
                borderRadius: `${SLIDER_TOKENS.thumbRadius}px`,
              }
        }
        aria-hidden="true"
      />
      {showValueBubble ? (
        <span
          ref={bubbleRef}
          className="m3e-slider__bubble"
          data-orientation={orientation}
          data-visible={isBubbleShown ? "" : undefined}
          style={{
            opacity: renderBubbleP,
            scale: `${(0.72 + 0.28 * renderBubbleP).toFixed(3)}`,
            translate: isVertical
              ? `${((1 - renderBubbleP) * 6 * verticalDirSign).toFixed(2)}px -50%`
              : `-50% ${((1 - renderBubbleP) * 6).toFixed(2)}px`,
          }}
          aria-hidden="true"
        >
          {formatted}
        </span>
      ) : null}
    </BaseSlider.Thumb>
  );
}

export function Slider<Value extends SliderValue = number>({
  id,
  value: controlledValue,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenValues = 0,
  orientation = "horizontal",
  centered = false,
  startIcon,
  endIcon,
  disabled = false,
  size = "sm",
  label,
  showValue = false,
  showValueBubble = true,
  showTicks = false,
  formatValue,
  name,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ESliderProps<Value>): React.JSX.Element {
  const { debugGeometry, direction, locale, t } = useM3ERuntime();
  const isVertical = orientation === "vertical";
  const isDisabled = useFieldsetDisabled(disabled);
  const labelId = React.useId();
  const defaultAnchorValue =
    centered && min < 0 && max > 0 ? 0 : centered ? (min + max) / 2 : min;
  const [uncontrolledValues, setUncontrolledValues] = React.useState<
    [number] | [number, number]
  >(() => normalizeValues(defaultValue, defaultAnchorValue));
  const [pressedThumbIdx, setPressedThumbIdx] = React.useState<number | null>(
    null,
  );
  const [focusedThumbIdx, setFocusedThumbIdx] = React.useState<number | null>(
    null,
  );
  const [keyBubbleIdx, setKeyBubbleIdx] = React.useState<number | null>(null);
  const keyBubbleTimerRef = React.useRef<number | null>(null);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const [trackLengthPx, setTrackLengthPx] = React.useState<number>(240);

  const values = (
    controlledValue !== undefined
      ? normalizeValues(controlledValue, defaultAnchorValue)
      : uncontrolledValues
  ).map((v) => Math.min(max, Math.max(min, v)));

  const isRange = values.length > 1;
  const isCentered = centered && !isRange;
  const spec = SLIDER_SIZE_SPECS[size];
  const span = Math.max(1e-6, max - min);
  const anchorFrac = min < 0 && max > 0 ? clamp01((0 - min) / span) : 0.5;

  const p0 = clamp01((values[0]! - min) / span);
  const p1 = isRange ? clamp01((values[1]! - min) / span) : p0;

  useIsoLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const readLength = (cr?: DOMRectReadOnly): number => {
      if (cr) {
        return isVertical
          ? cr.height || el.clientHeight
          : cr.width || el.clientWidth;
      }
      const rect = el.getBoundingClientRect();
      return isVertical
        ? rect.height || el.clientHeight
        : rect.width || el.clientWidth;
    };
    const initialLen = readLength();
    if (initialLen > 0) {
      setTrackLengthPx((prev) =>
        Math.abs(prev - initialLen) < 0.5 ? prev : initialLen,
      );
    }
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const nextLen = readLength(entries[0]?.contentRect);
      if (nextLen > 0) {
        setTrackLengthPx((prev) =>
          Math.abs(prev - nextLen) < 0.5 ? prev : nextLen,
        );
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [isVertical]);

  React.useEffect(() => {
    if (pressedThumbIdx === null) return;
    const clearPointer = () => {
      setPressedThumbIdx(null);
    };
    window.addEventListener("pointerup", clearPointer, { passive: true });
    window.addEventListener("pointercancel", clearPointer, { passive: true });
    window.addEventListener("blur", clearPointer);
    return () => {
      window.removeEventListener("pointerup", clearPointer);
      window.removeEventListener("pointercancel", clearPointer);
      window.removeEventListener("blur", clearPointer);
    };
  }, [pressedThumbIdx]);

  React.useEffect(() => {
    return () => {
      if (keyBubbleTimerRef.current !== null) {
        window.clearTimeout(keyBubbleTimerRef.current);
      }
    };
  }, []);

  const handleThumbPointerDown = React.useCallback((idx: number) => {
    if (keyBubbleTimerRef.current !== null) {
      window.clearTimeout(keyBubbleTimerRef.current);
      keyBubbleTimerRef.current = null;
    }
    setKeyBubbleIdx(null);
    setPressedThumbIdx(idx);
  }, []);

  const fractionsRef = React.useRef({ p0, p1 });
  fractionsRef.current = { p0, p1 };

  const handleControlPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (isDisabled || e.button !== 0) return;
      const thumbEl = (e.target as HTMLElement | null)?.closest?.("[data-index]");
      if (thumbEl) {
        const attr = Number(thumbEl.getAttribute("data-index"));
        if (!Number.isNaN(attr)) {
          handleThumbPointerDown(attr);
          return;
        }
      }
      if (!isRange) {
        handleThumbPointerDown(0);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      let frac = 0;
      if (isVertical) {
        frac =
          rect.height > 0 ? clamp01((rect.bottom - e.clientY) / rect.height) : 0;
      } else {
        const rawFrac =
          rect.width > 0 ? clamp01((e.clientX - rect.left) / rect.width) : 0;
        frac = direction === "rtl" ? 1 - rawFrac : rawFrac;
      }
      const { p0: curP0, p1: curP1 } = fractionsRef.current;
      const nearestIdx = Math.abs(curP0 - frac) <= Math.abs(curP1 - frac) ? 0 : 1;
      handleThumbPointerDown(nearestIdx);
    },
    [isDisabled, isVertical, direction, isRange, handleThumbPointerDown],
  );

  const handleThumbKeyStep = React.useCallback((idx: number) => {
    setKeyBubbleIdx(idx);
    if (keyBubbleTimerRef.current !== null) {
      window.clearTimeout(keyBubbleTimerRef.current);
    }
    keyBubbleTimerRef.current = window.setTimeout(() => {
      setKeyBubbleIdx(null);
      keyBubbleTimerRef.current = null;
    }, 900);
  }, []);

  const handleThumbFocus = React.useCallback(
    (idx: number, e: React.FocusEvent<HTMLElement>) => {
      if (e.currentTarget.matches?.(":focus-visible")) {
        setFocusedThumbIdx(idx);
      }
    },
    [],
  );

  const handleThumbBlur = React.useCallback((idx: number) => {
    setFocusedThumbIdx((prev) => (prev === idx ? null : prev));
    setKeyBubbleIdx((prev) => (prev === idx ? null : prev));
  }, []);

  const restGeo = resolveSliderThumbGeometry(false);
  const activeGeo = resolveSliderThumbGeometry(true);
  const restHalfCutPx = restGeo.thumbWidth / 2 + restGeo.trackGap;
  const activeHalfCutPx = activeGeo.thumbWidth / 2 + activeGeo.trackGap;

  const thumb0Active =
    pressedThumbIdx === 0 || focusedThumbIdx === 0 ? 1 : 0;
  const thumb1Active =
    pressedThumbIdx === 1 || focusedThumbIdx === 1 ? 1 : 0;

  const safeTrackLen = Math.max(1, trackLengthPx);
  const cut0Px = Math.max(
    2,
    restHalfCutPx + (activeHalfCutPx - restHalfCutPx) * thumb0Active,
  );
  const cut1Px = Math.max(
    2,
    restHalfCutPx + (activeHalfCutPx - restHalfCutPx) * thumb1Active,
  );
  const cut0Pct = (cut0Px / safeTrackLen) * 100;
  const cut1Pct = (cut1Px / safeTrackLen) * 100;

  const tickFractions = React.useMemo(() => {
    if (!showTicks || step <= 0) return [];
    const count = Math.floor((max - min) / step + 1e-9);
    if (count <= 1 || count > 24) return [];
    const out: number[] = [];
    for (let i = 0; i <= count; i++) {
      out.push(clamp01((i * step) / span));
    }
    return out;
  }, [showTicks, step, min, max, span]);

  const summaryLabel = React.useMemo(() => {
    if (!showValue) return null;
    if (isRange) {
      const a = formatValue
        ? formatValue(values[0]!)
        : formatLocalizedNumber(locale, values[0]!);
      const b = formatValue
        ? formatValue(values[1]!)
        : formatLocalizedNumber(locale, values[1]!);
      return `${a} – ${b}`;
    }
    return formatValue
      ? formatValue(values[0]!)
      : formatLocalizedNumber(locale, values[0]!);
  }, [showValue, isRange, values, formatValue, locale]);

  const outerR = spec.outerTrackRadius;
  const innerR = spec.innerTrackRadius;
  const startCapRadius = isVertical
    ? `${innerR}px ${innerR}px ${outerR}px ${outerR}px`
    : direction === "rtl"
      ? `${innerR}px ${outerR}px ${outerR}px ${innerR}px`
      : `${outerR}px ${innerR}px ${innerR}px ${outerR}px`;
  const endCapRadius = isVertical
    ? `${outerR}px ${outerR}px ${innerR}px ${innerR}px`
    : direction === "rtl"
      ? `${outerR}px ${innerR}px ${innerR}px ${outerR}px`
      : `${innerR}px ${outerR}px ${outerR}px ${innerR}px`;

  const insetIconsInsideTrack = spec.trackHeight >= 24;
  const stopDotSize = SLIDER_TOKENS.stopDotSize;
  const stopDotHalf = stopDotSize / 2;
  const edgeCenterPx = Math.max(6, outerR - stopDotHalf);
  const stopEdgeInsetPx = Math.max(4, edgeCenterPx - stopDotHalf);
  const anchorGapPct = (1 / safeTrackLen) * 100;

  const hasTickAtStart =
    tickFractions.length > 0 && tickFractions[0]! <= 0.001;
  const hasTickAtEnd =
    tickFractions.length > 0 &&
    tickFractions[tickFractions.length - 1]! >= 0.999;

  const showStartStopDot =
    (isRange || isCentered) &&
    !hasTickAtStart &&
    !(insetIconsInsideTrack && startIcon) &&
    p0 * safeTrackLen > edgeCenterPx + stopDotHalf + cut0Px + innerR;
  const endThumbFrac = isRange ? p1 : p0;
  const endCutPx = isRange ? cut1Px : cut0Px;
  const showEndStopDot =
    !hasTickAtEnd &&
    !(insetIconsInsideTrack && endIcon) &&
    (1 - endThumbFrac) * safeTrackLen >
      edgeCenterPx + stopDotHalf + endCutPx + innerR;

  const renderStopDots = (vertical: boolean) => (
    <>
      {showStartStopDot ? (
        <span
          className="m3e-slider__stop-dot"
          data-position="start"
          style={
            vertical
              ? {
                  width: `${stopDotSize}px`,
                  height: `${stopDotSize}px`,
                  bottom: `${stopEdgeInsetPx}px`,
                  top: "auto",
                  left: "50%",
                  translate: "-50% 0",
                }
              : {
                  width: `${stopDotSize}px`,
                  height: `${stopDotSize}px`,
                  insetInlineStart: `${stopEdgeInsetPx}px`,
                }
          }
          aria-hidden="true"
        />
      ) : null}
      {showEndStopDot ? (
        <span
          className="m3e-slider__stop-dot"
          data-position="end"
          style={
            vertical
              ? {
                  width: `${stopDotSize}px`,
                  height: `${stopDotSize}px`,
                  top: `${stopEdgeInsetPx}px`,
                  left: "50%",
                  translate: "-50% 0",
                }
              : {
                  width: `${stopDotSize}px`,
                  height: `${stopDotSize}px`,
                  insetInlineEnd: `${stopEdgeInsetPx}px`,
                }
          }
          aria-hidden="true"
        />
      ) : null}
    </>
  );

  const renderHorizontalSegments = () => {
    if (isRange) {
      const startWidthPct = Math.max(0, p0 * 100 - cut0Pct);
      const activeStartPct = Math.min(100, p0 * 100 + cut0Pct);
      const activeEndPct = Math.max(0, p1 * 100 - cut1Pct);
      const activeWidthPct = Math.max(0, activeEndPct - activeStartPct);
      const endStartPct = Math.min(100, p1 * 100 + cut1Pct);

      return (
        <>
          <span
            className="m3e-slider__segment m3e-slider__segment--inactive"
            style={{
              insetInlineStart: 0,
              width: `${startWidthPct.toFixed(3)}%`,
              borderRadius: startCapRadius,
            }}
            aria-hidden="true"
          />
          <span
            className="m3e-slider__segment m3e-slider__segment--active"
            style={{
              insetInlineStart: `${activeStartPct.toFixed(3)}%`,
              width: `${activeWidthPct.toFixed(3)}%`,
              borderRadius: `${innerR}px`,
            }}
            aria-hidden="true"
          />
          <span
            className="m3e-slider__segment m3e-slider__segment--inactive"
            style={{
              insetInlineStart: `${endStartPct.toFixed(3)}%`,
              insetInlineEnd: 0,
              borderRadius: endCapRadius,
            }}
            aria-hidden="true"
          />
          {renderStopDots(false)}
        </>
      );
    }

    if (isCentered) {
      const leftInactiveWidthPct =
        p0 < anchorFrac
          ? Math.max(0, p0 * 100 - cut0Pct)
          : Math.max(0, anchorFrac * 100 - anchorGapPct);
      const rightInactiveStartPct =
        p0 > anchorFrac
          ? Math.min(100, p0 * 100 + cut0Pct)
          : Math.min(100, anchorFrac * 100 + anchorGapPct);
      const activeStartPct =
        p0 >= anchorFrac
          ? anchorFrac * 100
          : Math.min(anchorFrac * 100, p0 * 100 + cut0Pct);
      const activeWidthPct = Math.max(
        0,
        Math.abs(p0 - anchorFrac) * 100 - cut0Pct,
      );

      return (
        <>
          <span
            className="m3e-slider__segment m3e-slider__segment--inactive"
            style={{
              insetInlineStart: 0,
              width: `${leftInactiveWidthPct.toFixed(3)}%`,
              borderRadius: startCapRadius,
            }}
            aria-hidden="true"
          />
          {activeWidthPct > 0.05 ? (
            <span
              className="m3e-slider__segment m3e-slider__segment--active"
              style={{
                insetInlineStart: `${activeStartPct.toFixed(3)}%`,
                width: `${activeWidthPct.toFixed(3)}%`,
                borderRadius: `${innerR}px`,
              }}
              aria-hidden="true"
            />
          ) : null}
          <span
            className="m3e-slider__segment m3e-slider__segment--inactive"
            style={{
              insetInlineStart: `${rightInactiveStartPct.toFixed(3)}%`,
              insetInlineEnd: 0,
              borderRadius: endCapRadius,
            }}
            aria-hidden="true"
          />
          {renderStopDots(false)}
        </>
      );
    }

    return (
      <>
        <span
          className="m3e-slider__segment m3e-slider__segment--active"
          style={{
            insetInlineStart: 0,
            width: `${Math.max(0, p0 * 100 - cut0Pct).toFixed(3)}%`,
            borderRadius: startCapRadius,
          }}
          aria-hidden="true"
        />
        <span
          className="m3e-slider__segment m3e-slider__segment--inactive"
          style={{
            insetInlineStart: `${Math.min(100, p0 * 100 + cut0Pct).toFixed(3)}%`,
            insetInlineEnd: 0,
            borderRadius: endCapRadius,
          }}
          aria-hidden="true"
        />
        {renderStopDots(false)}
      </>
    );
  };

  const renderVerticalSegments = () => {
    if (isRange) {
      const startHeightPct = Math.max(0, p0 * 100 - cut0Pct);
      const activeBottomPct = Math.min(100, p0 * 100 + cut0Pct);
      const activeTopPct = Math.max(0, p1 * 100 - cut1Pct);
      const activeHeightPct = Math.max(0, activeTopPct - activeBottomPct);
      const endBottomPct = Math.min(100, p1 * 100 + cut1Pct);

      return (
        <>
          <span
            className="m3e-slider__segment m3e-slider__segment--inactive"
            style={{
              insetInline: 0,
              bottom: 0,
              height: `${startHeightPct.toFixed(3)}%`,
              borderRadius: startCapRadius,
            }}
            aria-hidden="true"
          />
          <span
            className="m3e-slider__segment m3e-slider__segment--active"
            style={{
              insetInline: 0,
              bottom: `${activeBottomPct.toFixed(3)}%`,
              height: `${activeHeightPct.toFixed(3)}%`,
              borderRadius: `${innerR}px`,
            }}
            aria-hidden="true"
          />
          <span
            className="m3e-slider__segment m3e-slider__segment--inactive"
            style={{
              insetInline: 0,
              bottom: `${endBottomPct.toFixed(3)}%`,
              top: 0,
              borderRadius: endCapRadius,
            }}
            aria-hidden="true"
          />
          {renderStopDots(true)}
        </>
      );
    }

    if (isCentered) {
      const bottomInactiveHeightPct =
        p0 < anchorFrac
          ? Math.max(0, p0 * 100 - cut0Pct)
          : Math.max(0, anchorFrac * 100 - anchorGapPct);
      const topInactiveBottomPct =
        p0 > anchorFrac
          ? Math.min(100, p0 * 100 + cut0Pct)
          : Math.min(100, anchorFrac * 100 + anchorGapPct);
      const activeBottomPct =
        p0 >= anchorFrac
          ? anchorFrac * 100
          : Math.min(anchorFrac * 100, p0 * 100 + cut0Pct);
      const activeHeightPct = Math.max(
        0,
        Math.abs(p0 - anchorFrac) * 100 - cut0Pct,
      );

      return (
        <>
          <span
            className="m3e-slider__segment m3e-slider__segment--inactive"
            style={{
              insetInline: 0,
              bottom: 0,
              height: `${bottomInactiveHeightPct.toFixed(3)}%`,
              borderRadius: startCapRadius,
            }}
            aria-hidden="true"
          />
          {activeHeightPct > 0.05 ? (
            <span
              className="m3e-slider__segment m3e-slider__segment--active"
              style={{
                insetInline: 0,
                bottom: `${activeBottomPct.toFixed(3)}%`,
                height: `${activeHeightPct.toFixed(3)}%`,
                borderRadius: `${innerR}px`,
              }}
              aria-hidden="true"
            />
          ) : null}
          <span
            className="m3e-slider__segment m3e-slider__segment--inactive"
            style={{
              insetInline: 0,
              bottom: `${topInactiveBottomPct.toFixed(3)}%`,
              top: 0,
              borderRadius: endCapRadius,
            }}
            aria-hidden="true"
          />
          {renderStopDots(true)}
        </>
      );
    }

    return (
      <>
        <span
          className="m3e-slider__segment m3e-slider__segment--active"
          style={{
            insetInline: 0,
            bottom: 0,
            height: `${Math.max(0, p0 * 100 - cut0Pct).toFixed(3)}%`,
            borderRadius: startCapRadius,
          }}
          aria-hidden="true"
        />
        <span
          className="m3e-slider__segment m3e-slider__segment--inactive"
          style={{
            insetInline: 0,
            bottom: `${Math.min(100, p0 * 100 + cut0Pct).toFixed(3)}%`,
            top: 0,
            borderRadius: endCapRadius,
          }}
          aria-hidden="true"
        />
        {renderStopDots(true)}
      </>
    );
  };

  const controlNode = (
    <BaseSlider.Control
      className="m3e-slider__control"
      data-orientation={orientation}
      style={
        isVertical
          ? {
              minWidth: `${Math.max(SLIDER_TOKENS.minControlHeight, spec.thumbHeight)}px`,
            }
          : {
              minHeight: `${Math.max(SLIDER_TOKENS.minControlHeight, spec.thumbHeight)}px`,
            }
      }
      onPointerDown={handleControlPointerDown}
      onPointerUp={() => setPressedThumbIdx(null)}
      onPointerCancel={() => setPressedThumbIdx(null)}
    >
      <BaseSlider.Track
        ref={trackRef}
        className="m3e-slider__track"
        data-orientation={orientation}
        style={
          isVertical
            ? { width: `${spec.trackHeight}px` }
            : { height: `${spec.trackHeight}px` }
        }
      >
        <BaseSlider.Indicator className="m3e-slider__sr-indicator" />

        {isVertical ? renderVerticalSegments() : renderHorizontalSegments()}

        {insetIconsInsideTrack && startIcon ? (
          <span
            className="m3e-slider__track-icon m3e-slider__track-icon--start"
            data-active={!isRange && !isCentered && p0 > 0.14 ? "" : undefined}
            aria-hidden="true"
          >
            {startIcon}
          </span>
        ) : null}
        {insetIconsInsideTrack && endIcon ? (
          <span
            className="m3e-slider__track-icon m3e-slider__track-icon--end"
            data-active={!isRange && !isCentered && p0 > 0.88 ? "" : undefined}
            aria-hidden="true"
          >
            {endIcon}
          </span>
        ) : null}

        {tickFractions.map((tf, idx) => {
          const tickCenterPx =
            edgeCenterPx + Math.max(0, safeTrackLen - edgeCenterPx * 2) * tf;
          const occludedByThumb0 =
            Math.abs(tickCenterPx - p0 * safeTrackLen) <=
            cut0Px + stopDotHalf + innerR;
          const occludedByThumb1 =
            isRange &&
            Math.abs(tickCenterPx - p1 * safeTrackLen) <=
              cut1Px + stopDotHalf + innerR;
          if (occludedByThumb0 || occludedByThumb1) return null;

          const insideActive = isRange
            ? tf >= p0 && tf <= p1
            : isCentered
              ? tf >= Math.min(anchorFrac, p0) && tf <= Math.max(anchorFrac, p0)
              : tf <= p0;

          const tickPosCss = `calc(${edgeCenterPx}px + (100% - ${edgeCenterPx * 2}px) * ${tf.toFixed(4)})`;

          return (
            <span
              key={idx}
              className="m3e-slider__tick"
              data-active={insideActive ? "" : undefined}
              style={
                isVertical
                  ? {
                      bottom: tickPosCss,
                      top: "auto",
                      left: "50%",
                      translate: "-50% 50%",
                      width: `${stopDotSize}px`,
                      height: `${stopDotSize}px`,
                    }
                  : {
                      insetInlineStart: tickPosCss,
                      width: `${stopDotSize}px`,
                      height: `${stopDotSize}px`,
                    }
              }
              aria-hidden="true"
            />
          );
        })}
      </BaseSlider.Track>

      {values.map((v, idx) => {
        const baseTextLabel =
          ariaLabel ?? (typeof label === "string" ? label : undefined);
        const resolvedThumbAriaLabel = baseTextLabel
          ? isRange
            ? t(idx === 0 ? "slider.rangeStart" : "slider.rangeEnd", {
                label: baseTextLabel,
              })
            : baseTextLabel
          : !label
            ? isRange
              ? t(idx === 0 ? "slider.rangeStart" : "slider.rangeEnd", {
                  label: t("slider.ariaLabel"),
                })
              : t("slider.ariaLabel")
            : isRange
              ? t(idx === 0 ? "slider.rangeStart" : "slider.rangeEnd", {
                  label: t("slider.ariaLabel"),
                })
              : undefined;

        return (
          <SliderThumbBar
            key={idx}
            index={idx}
            rawValue={v}
            locale={locale}
            isRtl={direction === "rtl"}
            orientation={orientation}
            thumbHeight={spec.thumbHeight}
            isPressed={pressedThumbIdx === idx || focusedThumbIdx === idx}
            isBubbleShown={pressedThumbIdx === idx || keyBubbleIdx === idx}
            showValueBubble={showValueBubble}
            formatValue={formatValue}
            ariaLabel={resolvedThumbAriaLabel}
            ariaLabelledBy={
              !resolvedThumbAriaLabel && label ? labelId : undefined
            }
            onThumbPointerDown={handleThumbPointerDown}
            onThumbKeyStep={handleThumbKeyStep}
            onThumbFocus={handleThumbFocus}
            onThumbBlur={handleThumbBlur}
          />
        );
      })}

      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          H{spec.trackHeight}·gap{Math.round(cut0Px - 2)}
        </span>
      ) : null}
    </BaseSlider.Control>
  );

  const hasFlankingIcons =
    !insetIconsInsideTrack && Boolean(startIcon || endIcon);

  const resolvedBaseValue: number | number[] = isRange ? [...values] : values[0]!;

  const toSliderValue = (next: number | readonly number[]): Value =>
    (Array.isArray(next)
      ? ([next[0] ?? min, next[1] ?? max] as const)
      : next) as Value;

  return (
    <FormFieldScope name={name} disabled={isDisabled}>
    <BaseSlider.Root
      id={id}
      orientation={orientation}
      value={resolvedBaseValue}
      min={min}
      max={max}
      step={step}
      minStepsBetweenValues={minStepsBetweenValues}
      disabled={isDisabled}
      name={name}
      aria-label={!label ? (ariaLabel ?? t("slider.ariaLabel")) : undefined}
      aria-labelledby={label ? labelId : undefined}
      onValueChange={(next) => {
        if (controlledValue === undefined) {
          setUncontrolledValues(
            Array.isArray(next)
              ? [next[0] ?? min, next[1] ?? max]
              : [next],
          );
        }
        onValueChange?.(toSliderValue(next));
      }}
      onValueCommitted={(next) => {
        setPressedThumbIdx(null);
        onValueCommitted?.(toSliderValue(next));
      }}
      className={className ? `m3e-slider ${className}` : "m3e-slider"}
      data-size={size}
      data-orientation={orientation}
      data-centered={isCentered ? "" : undefined}
      style={style}
    >
      {label || summaryLabel ? (
        <div className="m3e-slider__header">
          {label ? (
            <span id={labelId} className="m3e-slider__label">
              {label}
            </span>
          ) : (
            <span />
          )}
          {summaryLabel ? (
            <span className="m3e-slider__value">{summaryLabel}</span>
          ) : null}
        </div>
      ) : null}

      {hasFlankingIcons ? (
        <div
          className="m3e-slider__icon-row"
          data-orientation={orientation}
        >
          {startIcon ? (
            <span className="m3e-slider__flank-icon" aria-hidden="true">
              {startIcon}
            </span>
          ) : null}
          {controlNode}
          {endIcon ? (
            <span className="m3e-slider__flank-icon" aria-hidden="true">
              {endIcon}
            </span>
          ) : null}
        </div>
      ) : (
        controlNode
      )}
    </BaseSlider.Root>
    </FormFieldScope>
  );
}
