"use client";

import * as React from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import {
  METER_TOKENS,
  PROGRESS_TOKENS,
  resolveCircularProgressArcs,
} from "../tokens/index.js";
import { useM3E, useM3EI18n } from "../context/M3EContext.js";
import {
  subscribeSpringFrame,
  useM3EScalarSpring,
} from "../hooks/useM3ESpring.js";
import { formatLocalizedPercent } from "../i18n/index.js";

const LINEAR_INDETERMINATE_DURATION_MS = 1800;
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

export interface M3ELinearProgressIndicatorProps {
  readonly id?: string;
  readonly value?: number | null;
  readonly indeterminate?: boolean;
  readonly paused?: boolean;
  readonly thickness?: "standard" | "thick";
  readonly label?: React.ReactNode;
  readonly showValue?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function LinearProgressIndicator({
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
}: M3ELinearProgressIndicatorProps): React.JSX.Element {
  const {
    direction,
    locale,
    paused: contextPaused,
    playbackRate,
    prefersReducedMotion,
    t,
  } = useM3E();
  const isPaused = pausedProp ?? contextPaused;
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
  const trackWidthRef = React.useRef<number>(240);
  const activeSeg1Ref = React.useRef<HTMLSpanElement | null>(null);
  const activeSeg2Ref = React.useRef<HTMLSpanElement | null>(null);
  const trackSeg0Ref = React.useRef<HTMLSpanElement | null>(null);
  const trackSeg1Ref = React.useRef<HTMLSpanElement | null>(null);
  const trackSeg2Ref = React.useRef<HTMLSpanElement | null>(null);
  const elapsedMsRef = React.useRef<number>(0);

  React.useLayoutEffect(() => {
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
      const tMs =
        ((rawElapsedMs % LINEAR_INDETERMINATE_DURATION_MS) +
          LINEAR_INDETERMINATE_DURATION_MS) %
        LINEAR_INDETERMINATE_DURATION_MS;

      const l1Head = solveCubicBezier(0.2, 0, 0.8, 1, clamp01(tMs / 1000));
      const l1Tail = solveCubicBezier(
        0.4,
        0,
        1,
        1,
        clamp01((tMs - 333) / 850),
      );
      const l2Head = solveCubicBezier(
        0,
        0,
        0.65,
        1,
        clamp01((tMs - 1000) / 567),
      );
      const l2Tail = solveCubicBezier(
        0.1,
        0,
        0.45,
        1,
        clamp01((tMs - 1267) / 533),
      );

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

    const rate = Math.max(0.05, playbackRate);
    return subscribeSpringFrame((dtSec) => {
      elapsedMsRef.current += dtSec * 1000 * rate;
      renderLinearAt(elapsedMsRef.current);
      return true;
    });
  }, [isIndet, direction, isPaused, playbackRate, prefersReducedMotion]);

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

export interface M3ECircularProgressIndicatorProps {
  readonly id?: string;
  readonly value?: number | null;
  readonly indeterminate?: boolean;
  readonly paused?: boolean;
  readonly size?: "sm" | "md" | "lg" | number;
  readonly strokeWidth?: number;
  readonly showValue?: boolean;
  readonly showValueLabel?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function CircularProgressIndicator({
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
}: M3ECircularProgressIndicatorProps): React.JSX.Element {
  const {
    locale,
    paused: contextPaused,
    playbackRate,
    prefersReducedMotion,
    t,
  } = useM3E();
  const isPaused = pausedProp ?? contextPaused;
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

    const rate = Math.max(0.05, playbackRate);
    return subscribeSpringFrame((dtSec) => {
      elapsedMsRef.current += dtSec * 1000 * rate;
      renderCircularAt(elapsedMsRef.current);
      return true;
    });
  }, [isIndet, isPaused, playbackRate, prefersReducedMotion, spec.size, spec.strokeWidth, center]);

  return (
    <BaseProgress.Root
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

export interface M3EMeterProps {
  readonly id?: string;
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly label: React.ReactNode;
  readonly valueText?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Meter({
  id,
  value,
  min = 0,
  max = 100,
  label,
  valueText,
  className,
  style,
}: M3EMeterProps): React.JSX.Element {
  const { locale } = useM3EI18n();
  const ratio =
    max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const smoothPct = useM3EScalarSpring(ratio * 100, "defaultSpatial");
  const pct = Math.max(0, Math.min(100, smoothPct));

  const tone =
    ratio >= METER_TOKENS.criticalThreshold
      ? "critical"
      : ratio >= METER_TOKENS.warningThreshold
        ? "warning"
        : "normal";

  const gapPx = pct <= 1 || pct >= 99 ? 0 : METER_TOKENS.trackGap;

  return (
    <BaseMeter.Root
      id={id}
      value={value}
      min={min}
      max={max}
      locale={locale}
      className={className ? `m3e-meter ${className}` : "m3e-meter"}
      data-tone={tone}
      style={style}
    >
      <div className="m3e-meter__header">
        <BaseMeter.Label className="m3e-meter__label">{label}</BaseMeter.Label>
        {valueText ? (
          <span className="m3e-meter__value">{valueText}</span>
        ) : (
          <BaseMeter.Value className="m3e-meter__value" />
        )}
      </div>

      <BaseMeter.Track
        className="m3e-meter__track"
        style={{ height: `${METER_TOKENS.height}px`, gap: `${gapPx}px` }}
      >
        {pct > 0.2 ? (
          <BaseMeter.Indicator
            className="m3e-meter__indicator"
            data-tone={tone}
            style={{
              flex: `0 0 calc(${pct.toFixed(2)}% - ${(gapPx / 2).toFixed(1)}px)`,
            }}
          />
        ) : null}
        {pct < 99.8 ? (
          <div className="m3e-meter__rest" aria-hidden="true" />
        ) : null}
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
