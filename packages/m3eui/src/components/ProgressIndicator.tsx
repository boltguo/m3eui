"use client";

import * as React from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import {
  PROGRESS_TOKENS,
  resolveCircularProgressArcs,
} from "../tokens/topology.js";
import {
  resolveLinearIndeterminateFractions,
} from "../tokens/wavy.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useOffscreen } from "../internal/useOffscreen.js";
import { subscribeSpringFrame, useM3EScalarSpring } from "../hooks/useM3ESpring.js";
import { formatLocalizedPercent } from "../i18n/index.js";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";
import {
  CircularWavyProgressIndicator,
  LinearWavyProgressIndicator,
} from "../internal/wavyProgress.js";

const CIRCULAR_INDETERMINATE_DURATION_MS = 6000;
const CIRCULAR_STEP_DURATION_MS = 1500;
const CIRCULAR_STEP_ACTIVE_MS = 300;
const CIRCULAR_MIN_PROGRESS = 0.1;
const CIRCULAR_MAX_PROGRESS = 0.87;

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function solveCubicBezier(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const sampleX = (t: number) =>
    ((3 * x1 - 3 * x2 + 1) * t * t * t) +
    ((3 * x2 - 6 * x1) * t * t) +
    (3 * x1 * t);
  const sampleSlopeX = (t: number) =>
    (3 * (3 * x1 - 3 * x2 + 1) * t * t) +
    (2 * (3 * x2 - 6 * x1) * t) +
    (3 * x1);
  const sampleY = (t: number) =>
    ((3 * y1 - 3 * y2 + 1) * t * t * t) +
    ((3 * y2 - 6 * y1) * t * t) +
    (3 * y1 * t);

  let t = x;
  for (let i = 0; i < 6; i++) {
    const err = sampleX(t) - x;
    if (Math.abs(err) < 1e-6) break;
    const slope = sampleSlopeX(t);
    if (Math.abs(slope) < 1e-6) break;
    t = clamp01(t - err / slope);
  }

  if (Math.abs(sampleX(t) - x) > 1e-4) {
    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 12; i++) {
      const cur = sampleX(t);
      if (Math.abs(cur - x) < 1e-6) break;
      if (x > cur) lo = t;
      else hi = t;
      t = (lo + hi) * 0.5;
    }
  }

  return clamp01(sampleY(t));
}

function resolveCircularSizeSpec(
  size: "sm" | "md" | "lg" | number,
  strokeWidthOverride?: number,
): { readonly size: number; readonly strokeWidth: number } {
  if (typeof size === "number") {
    const defaultStroke =
      size <= 32 ? 3.5 : size >= 52 ? 5 : PROGRESS_TOKENS.circularSizes.md.strokeWidth;
    return { size, strokeWidth: strokeWidthOverride ?? defaultStroke };
  }
  const preset = PROGRESS_TOKENS.circularSizes[size];
  return {
    size: preset.size,
    strokeWidth: strokeWidthOverride ?? preset.strokeWidth,
  };
}

interface ProgressBaseProps {
  readonly value?: number | null;
  readonly indeterminate?: boolean;
  readonly paused?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ELinearProgressIndicatorFlatProps extends ProgressBaseProps {
  readonly wavy?: false;
  readonly id?: string;
  readonly thickness?: "standard" | "thick";
  readonly label?: React.ReactNode;
  readonly showValue?: boolean;
}

export interface M3ELinearProgressIndicatorWavyProps extends ProgressBaseProps {
  readonly wavy: true;
  readonly amplitude?: number;
  readonly wavelength?: number;
  readonly strokeWidth?: number;
  readonly trackGap?: number;
}

export type M3ELinearProgressIndicatorProps =
  | M3ELinearProgressIndicatorFlatProps
  | M3ELinearProgressIndicatorWavyProps;

export function LinearProgressIndicator(
  props: M3ELinearProgressIndicatorProps,
): React.JSX.Element {
  if (!props.wavy) return <FlatLinearProgressIndicator {...props} />;
  const { wavy: _wavy, indeterminate, value, ...rest } = props;
  return (
    <LinearWavyProgressIndicator
      {...rest}
      value={indeterminate ? null : value}
    />
  );
}

function FlatLinearProgressIndicator({
  id,
  value,
  indeterminate = false,
  paused: pausedProp,
  thickness = "standard",
  label,
  showValue = false,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ELinearProgressIndicatorFlatProps): React.JSX.Element {
  const {
    direction,
    locale,
    paused: contextPaused,
    motionRef,
    prefersReducedMotion,
    t,
  } = useM3ERuntime();
  const pausedByOwner = pausedProp ?? contextPaused;
  const isIndet = indeterminate || value === null || value === undefined;
  const clampedPct = isIndet ? 0 : Math.max(0, Math.min(100, value));
  const smoothPct = useM3EScalarSpring(clampedPct, "defaultSpatial");
  const displayPct = Math.max(0, Math.min(100, smoothPct));

  const barHeight =
    thickness === "thick"
      ? PROGRESS_TOKENS.linearThickHeight
      : PROGRESS_TOKENS.linearHeight;
  const gapPx =
    displayPct <= 1 || displayPct >= 99 ? 0 : PROGRESS_TOKENS.trackGap;

  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const offscreen = useOffscreen(trackRef, isIndet);
  const isPaused = pausedByOwner || offscreen;
  const trackWidthRef = React.useRef<number>(240);
  const activeSeg1Ref = React.useRef<HTMLSpanElement | null>(null);
  const activeSeg2Ref = React.useRef<HTMLSpanElement | null>(null);
  const trackSeg0Ref = React.useRef<HTMLSpanElement | null>(null);
  const trackSeg1Ref = React.useRef<HTMLSpanElement | null>(null);
  const trackSeg2Ref = React.useRef<HTMLSpanElement | null>(null);
  const elapsedMsRef = React.useRef<number>(0);

  useIsoLayoutEffect(() => {
    const el = trackRef.current;
    if (!el) return undefined;
    const syncWidth = () => {
      const w = el.clientWidth;
      if (w > 0) {
        trackWidthRef.current = w;
      }
    };
    syncWidth();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver((entries) => {
        const w = entries[0]?.contentRect.width ?? el.clientWidth;
        if (w > 0) {
          trackWidthRef.current = w;
        }
      });
      ro.observe(el);
      return () => ro.disconnect();
    }
    return undefined;
  }, [isIndet]);

  React.useEffect(() => {
    if (!isIndet) return undefined;

    const isRtl = direction === "rtl";
    const applySegment = (
      el: HTMLSpanElement | null,
      startFrac: number,
      endFrac: number,
    ) => {
      if (!el) return;
      const s = clamp01(startFrac);
      const e = clamp01(endFrac);
      const span = e - s;
      if (span <= 0.002) {
        el.style.display = "none";
        return;
      }
      const leftFrac = isRtl ? 1 - e : s;
      el.style.display = "block";
      el.style.left = `${(leftFrac * 100).toFixed(3)}%`;
      el.style.width = `${(span * 100).toFixed(3)}%`;
    };

    const renderLinearAt = (rawElapsedMs: number) => {
      const {
        line1Head: l1Head,
        line1Tail: l1Tail,
        line2Head: l2Head,
        line2Tail: l2Tail,
      } = resolveLinearIndeterminateFractions(rawElapsedMs);

      const safeW = Math.max(48, trackWidthRef.current);
      const gapFrac = PROGRESS_TOKENS.trackGap / safeW;

      const t0Start = l1Head > 0.001 ? l1Head + gapFrac : 0;
      const t0End = l1Head < 1 - gapFrac ? 1 : 0;
      applySegment(trackSeg0Ref.current, t0Start, t0End);

      applySegment(activeSeg1Ref.current, l1Tail, l1Head);

      if (l1Tail > gapFrac) {
        const t1Start = l2Head > 0.001 ? l2Head + gapFrac : 0;
        const t1End = l1Tail < 0.999 ? l1Tail - gapFrac : 1;
        applySegment(trackSeg1Ref.current, t1Start, t1End);
      } else {
        applySegment(trackSeg1Ref.current, 0, 0);
      }

      applySegment(activeSeg2Ref.current, l2Tail, l2Head);

      if (l2Tail > gapFrac) {
        const t2End = l2Tail < 0.999 ? l2Tail - gapFrac : 1;
        applySegment(trackSeg2Ref.current, 0, t2End);
      } else {
        applySegment(trackSeg2Ref.current, 0, 0);
      }
    };

    if (prefersReducedMotion) {
      renderLinearAt(560);
      return undefined;
    }

    renderLinearAt(elapsedMsRef.current);

    if (isPaused || typeof requestAnimationFrame !== "function") {
      return undefined;
    }

    return subscribeSpringFrame((dtSec) => {
      const rate = Math.max(0.05, motionRef.current.playbackRate);
      elapsedMsRef.current += dtSec * 1000 * rate;
      renderLinearAt(elapsedMsRef.current);
      return true;
    });
  }, [isIndet, direction, isPaused, prefersReducedMotion]);

  const indetSegBaseStyle: React.CSSProperties = {
    position: "absolute",
    insetBlock: 0,
    borderRadius: "9999px",
    animation: "none",
    translate: "0 0",
  };

  return (
    <BaseProgress.Root
      id={id}
      value={isIndet ? null : Math.round(clampedPct)}
      min={0}
      max={100}
      locale={locale}
      aria-label={!label ? (ariaLabel ?? t("progress.linearLabel")) : undefined}
      className={
        className
          ? `m3e-linear-progress ${className}`
          : "m3e-linear-progress"
      }
      style={style}
    >
      {label || showValue ? (
        <div className="m3e-linear-progress__header">
          {label ? (
            <BaseProgress.Label className="m3e-linear-progress__label">
              {label}
            </BaseProgress.Label>
          ) : null}
          {showValue && !isIndet ? (
            <BaseProgress.Value className="m3e-linear-progress__value" />
          ) : null}
        </div>
      ) : null}

      <BaseProgress.Track
        ref={trackRef}
        className="m3e-linear-progress__track-host"
        data-thickness={thickness}
        data-indeterminate={isIndet ? "" : undefined}
        style={{ height: `${barHeight}px` }}
      >
        {isIndet ? (
          <div
            className="m3e-linear-progress__indet-wrap"
            style={{ backgroundColor: "transparent", scale: "1 1" }}
            aria-hidden="true"
          >
            <span
              ref={trackSeg0Ref}
              className="m3e-linear-progress__indet-track"
              style={{
                ...indetSegBaseStyle,
                backgroundColor: "var(--m3e-color-secondary-container)",
              }}
            />
            <span
              ref={trackSeg1Ref}
              className="m3e-linear-progress__indet-track"
              style={{
                ...indetSegBaseStyle,
                backgroundColor: "var(--m3e-color-secondary-container)",
                display: "none",
              }}
            />
            <span
              ref={trackSeg2Ref}
              className="m3e-linear-progress__indet-track"
              style={{
                ...indetSegBaseStyle,
                backgroundColor: "var(--m3e-color-secondary-container)",
                display: "none",
              }}
            />
            <span
              ref={activeSeg1Ref}
              className="m3e-linear-progress__indet-seg m3e-linear-progress__indet-seg--primary"
              style={{
                ...indetSegBaseStyle,
                backgroundColor: "var(--m3e-color-primary)",
              }}
            />
            <span
              ref={activeSeg2Ref}
              className="m3e-linear-progress__indet-seg m3e-linear-progress__indet-seg--secondary"
              style={{
                ...indetSegBaseStyle,
                backgroundColor: "var(--m3e-color-primary)",
                display: "none",
              }}
            />
          </div>
        ) : (
          <div
            className="m3e-linear-progress__split"
            style={{ gap: `${gapPx}px` }}
            aria-hidden="true"
          >
            {displayPct > 0.2 ? (
              <BaseProgress.Indicator
                className="m3e-linear-progress__active"
                style={{
                  flex: `0 0 calc(${displayPct.toFixed(2)}% - ${(gapPx / 2).toFixed(1)}px)`,
                }}
              />
            ) : null}
            {displayPct < 99.8 ? (
              <div className="m3e-linear-progress__rest">
                <span
                  className="m3e-linear-progress__stop-dot"
                  style={{
                    width: `${PROGRESS_TOKENS.stopDotSize}px`,
                    height: `${PROGRESS_TOKENS.stopDotSize}px`,
                  }}
                />
              </div>
            ) : null}
          </div>
        )}
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

export interface M3ECircularProgressIndicatorFlatProps extends ProgressBaseProps {
  readonly wavy?: false;
  readonly id?: string;
  readonly size?: "sm" | "md" | "lg" | number;
  readonly strokeWidth?: number;
  readonly showValue?: boolean;
  readonly showValueLabel?: boolean;
}

export interface M3ECircularProgressIndicatorWavyProps extends ProgressBaseProps {
  readonly wavy: true;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly maxAmplitudePx?: number;
  readonly targetWavelength?: number;
  readonly trackGap?: number;
  readonly amplitude?: number;
}

export type M3ECircularProgressIndicatorProps =
  | M3ECircularProgressIndicatorFlatProps
  | M3ECircularProgressIndicatorWavyProps;

export function CircularProgressIndicator(
  props: M3ECircularProgressIndicatorProps,
): React.JSX.Element {
  if (!props.wavy) return <FlatCircularProgressIndicator {...props} />;
  const { wavy: _wavy, indeterminate, value, ...rest } = props;
  return (
    <CircularWavyProgressIndicator
      {...rest}
      value={indeterminate ? null : value}
    />
  );
}

function FlatCircularProgressIndicator({
  id,
  value,
  indeterminate = false,
  paused: pausedProp,
  size = 40,
  strokeWidth: strokeWidthProp,
  showValue = false,
  showValueLabel = false,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ECircularProgressIndicatorFlatProps): React.JSX.Element {
  const {
    locale,
    paused: contextPaused,
    motionRef,
    prefersReducedMotion,
    t,
  } = useM3ERuntime();
  const pausedByOwner = pausedProp ?? contextPaused;
  const resolvedAriaLabel = ariaLabel ?? t("progress.circularLabel");
  const resolvedShowValue = showValue || showValueLabel;
  const isIndet = indeterminate || value === null || value === undefined;
  const clamped = isIndet ? 0 : Math.max(0, Math.min(100, value));
  const localizedPctText = !isIndet
    ? formatLocalizedPercent(locale, clamped / 100)
    : undefined;
  const smooth = useM3EScalarSpring(clamped / 100, "defaultSpatial");
  const spec = resolveCircularSizeSpec(size, strokeWidthProp);

  const arcs = resolveCircularProgressArcs({
    progress: isIndet ? 0.28 : smooth,
    size: spec.size,
    strokeWidth: spec.strokeWidth,
  });

  const center = spec.size / 2;
  const indetGroupRef = React.useRef<SVGGElement | null>(null);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const offscreen = useOffscreen(rootRef, isIndet);
  const isPaused = pausedByOwner || offscreen;
  const indetTrackRef = React.useRef<SVGCircleElement | null>(null);
  const indetActiveRef = React.useRef<SVGCircleElement | null>(null);
  const elapsedMsRef = React.useRef<number>(0);

  React.useEffect(() => {
    if (!isIndet) return undefined;

    const applyCircularAt = (progressFrac: number, totalRotDeg: number) => {
      const frameArcs = resolveCircularProgressArcs({
        progress: progressFrac,
        size: spec.size,
        strokeWidth: spec.strokeWidth,
      });

      if (indetGroupRef.current) {
        indetGroupRef.current.setAttribute(
          "transform",
          `rotate(${totalRotDeg.toFixed(2)} ${center} ${center})`,
        );
      }

      if (indetTrackRef.current) {
        if (frameArcs.trackDashLength > 0.5) {
          indetTrackRef.current.style.display = "";
          indetTrackRef.current.setAttribute(
            "stroke-dasharray",
            `${frameArcs.trackDashLength.toFixed(2)} ${frameArcs.circumference.toFixed(2)}`,
          );
          indetTrackRef.current.setAttribute(
            "transform",
            `rotate(${frameArcs.trackRotationDeg.toFixed(2)} ${center} ${center})`,
          );
        } else {
          indetTrackRef.current.style.display = "none";
        }
      }

      if (indetActiveRef.current) {
        indetActiveRef.current.setAttribute(
          "stroke-dasharray",
          `${Math.max(1, frameArcs.activeDashLength).toFixed(2)} ${frameArcs.circumference.toFixed(2)}`,
        );
      }
    };

    const renderCircularAt = (rawElapsedMs: number) => {
      const tMs =
        ((rawElapsedMs % CIRCULAR_INDETERMINATE_DURATION_MS) +
          CIRCULAR_INDETERMINATE_DURATION_MS) %
        CIRCULAR_INDETERMINATE_DURATION_MS;

      const globalRotation =
        (tMs / CIRCULAR_INDETERMINATE_DURATION_MS) * 1080;

      const stepIdx = Math.min(3, Math.floor(tMs / CIRCULAR_STEP_DURATION_MS));
      const stepLocalMs = tMs - stepIdx * CIRCULAR_STEP_DURATION_MS;
      const stepIncrement =
        stepLocalMs < CIRCULAR_STEP_ACTIVE_MS
          ? solveCubicBezier(
              0.05,
              0.7,
              0.1,
              1,
              stepLocalMs / CIRCULAR_STEP_ACTIVE_MS,
            ) * 90
          : 90;
      const additionalRotation = stepIdx * 90 + stepIncrement;

      const halfDuration = CIRCULAR_INDETERMINATE_DURATION_MS / 2;
      const sweepSpan = CIRCULAR_MAX_PROGRESS - CIRCULAR_MIN_PROGRESS;
      const sweepProgress =
        tMs <= halfDuration
          ? CIRCULAR_MIN_PROGRESS +
            solveCubicBezier(0.2, 0, 0, 1, tMs / halfDuration) * sweepSpan
          : CIRCULAR_MAX_PROGRESS -
            solveCubicBezier(
              0.2,
              0,
              0,
              1,
              (tMs - halfDuration) / halfDuration,
            ) *
              sweepSpan;

      const totalRotDeg = (globalRotation + additionalRotation) % 360;

      applyCircularAt(sweepProgress, totalRotDeg);
    };

    if (prefersReducedMotion) {
      applyCircularAt(0.28, 0);
      return undefined;
    }

    renderCircularAt(elapsedMsRef.current);

    if (isPaused || typeof requestAnimationFrame !== "function") {
      return undefined;
    }

    return subscribeSpringFrame((dtSec) => {
      const rate = Math.max(0.05, motionRef.current.playbackRate);
      elapsedMsRef.current += dtSec * 1000 * rate;
      renderCircularAt(elapsedMsRef.current);
      return true;
    });
  }, [isIndet, isPaused, prefersReducedMotion, spec.size, spec.strokeWidth, center]);

  return (
    <BaseProgress.Root
      ref={rootRef}
      id={id}
      value={isIndet ? null : Math.round(clamped)}
      min={0}
      max={100}
      locale={locale}
      aria-label={resolvedAriaLabel}
      aria-valuetext={localizedPctText}
      className={
        className
          ? `m3e-circular-progress ${className}`
          : "m3e-circular-progress"
      }
      data-indeterminate={isIndet ? "" : undefined}
      style={{
        width: `${spec.size}px`,
        height: `${spec.size}px`,
        ...style,
      }}
    >
      <svg
        width={spec.size}
        height={spec.size}
        viewBox={`0 0 ${spec.size} ${spec.size}`}
        className="m3e-circular-progress__svg"
        style={isIndet ? { animation: "none" } : undefined}
        aria-hidden="true"
      >
        {isIndet ? (
          <g ref={indetGroupRef}>
            <circle
              ref={indetTrackRef}
              cx={center}
              cy={center}
              r={arcs.radius}
              fill="none"
              stroke="var(--m3e-color-secondary-container)"
              strokeWidth={spec.strokeWidth}
              strokeLinecap="round"
              strokeDasharray={`${arcs.trackDashLength.toFixed(2)} ${arcs.circumference.toFixed(2)}`}
              transform={`rotate(${arcs.trackRotationDeg.toFixed(2)} ${center} ${center})`}
            />
            <circle
              ref={indetActiveRef}
              cx={center}
              cy={center}
              r={arcs.radius}
              fill="none"
              stroke="var(--m3e-color-primary)"
              strokeWidth={spec.strokeWidth}
              strokeLinecap="round"
              className="m3e-circular-progress__indet-arc"
              style={{ animation: "none" }}
              strokeDasharray={`${arcs.activeDashLength.toFixed(2)} ${arcs.circumference.toFixed(2)}`}
              transform={`rotate(-90 ${center} ${center})`}
            />
          </g>
        ) : (
          <>
            {arcs.trackDashLength > 0.5 ? (
              <circle
                cx={center}
                cy={center}
                r={arcs.radius}
                fill="none"
                stroke="var(--m3e-color-secondary-container)"
                strokeWidth={spec.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${arcs.trackDashLength.toFixed(2)} ${arcs.circumference.toFixed(2)}`}
                transform={`rotate(${arcs.trackRotationDeg.toFixed(2)} ${center} ${center})`}
              />
            ) : null}
            {arcs.activeDashLength > 0.5 ? (
              <circle
                cx={center}
                cy={center}
                r={arcs.radius}
                fill="none"
                stroke="var(--m3e-color-primary)"
                strokeWidth={spec.strokeWidth}
                strokeLinecap="round"
                strokeDasharray={`${arcs.activeDashLength.toFixed(2)} ${arcs.circumference.toFixed(2)}`}
                transform={`rotate(-90 ${center} ${center})`}
              />
            ) : null}
          </>
        )}
      </svg>

      {resolvedShowValue && !isIndet && spec.size > 32 ? (
        <span className="m3e-circular-progress__center" aria-hidden="true">
          {localizedPctText}
        </span>
      ) : null}
    </BaseProgress.Root>
  );
}
