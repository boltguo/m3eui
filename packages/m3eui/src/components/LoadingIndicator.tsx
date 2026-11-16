"use client";

import * as React from "react";
import {
  LOADING_INDICATOR_DETERMINATE_MORPH_SEQUENCE,
  LOADING_INDICATOR_MORPH_SEQUENCE,
  LOADING_INDICATOR_TOKENS,
} from "../tokens/loading-shapes.js";
import { evaluateSpringDisplacement } from "../tokens/motion.js";
import {
  type MorphPair,
  cubicsToSvgPath,
  interpolateMorphCubics,
} from "../tokens/shapes.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useOffscreen } from "../internal/useOffscreen.js";
import { subscribeSpringFrame } from "../hooks/useM3ESpring.js";

export interface LoadingIndicatorProps {
  readonly size?: number;
  readonly progress?: number;
  readonly morphSequence?: readonly MorphPair[];
  readonly paused?: boolean;
  readonly contained?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function LoadingIndicator({
  size = LOADING_INDICATOR_TOKENS.containerSize,
  progress: determinateProgress,
  morphSequence,
  paused: pausedProp,
  contained = false,
  "aria-label": ariaLabel,
  className,
  style,
}: LoadingIndicatorProps): React.JSX.Element {
  const { motionRef, paused: contextPaused, prefersReducedMotion, t } = useM3ERuntime();
  const resolvedAriaLabel = ariaLabel ?? t("loading.label");
  const isDeterminate = typeof determinateProgress === "number";
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const offscreen = useOffscreen(rootRef, !isDeterminate);
  const isPaused = (pausedProp ?? contextPaused) || offscreen;
  const resolvedSequence =
    morphSequence ??
    (isDeterminate
      ? LOADING_INDICATOR_DETERMINATE_MORPH_SEQUENCE
      : LOADING_INDICATOR_MORPH_SEQUENCE);

  const pathRef = React.useRef<SVGPathElement | null>(null);
  const groupRef = React.useRef<SVGGElement | null>(null);
  const virtualElapsedMsRef = React.useRef<number>(0);

  const scaleFactor =
    isDeterminate && morphSequence === undefined
      ? LOADING_INDICATOR_TOKENS.determinateEffectiveScaleFactor
      : LOADING_INDICATOR_TOKENS.effectiveScaleFactor;

  const initialD = React.useMemo(() => {
    const pair = resolvedSequence[0];
    if (!pair) return "";
    const p = isDeterminate ? Math.max(0, Math.min(1, determinateProgress ?? 0)) : 0;
    const cubics = interpolateMorphCubics(pair, p);
    return cubicsToSvgPath(cubics, size, scaleFactor);
  }, [resolvedSequence, size, scaleFactor, isDeterminate, determinateProgress]);

  React.useEffect(() => {
    if (!isDeterminate || resolvedSequence.length === 0) return;
    const clamped = Math.max(0, Math.min(1, determinateProgress ?? 0));
    const seqLen = resolvedSequence.length;
    const activeIndex = Math.min(seqLen - 1, Math.floor(clamped * seqLen));
    const localProgress =
      clamped === 1 && activeIndex === seqLen - 1 ? 1 : (clamped * seqLen) % 1;

    const pair = resolvedSequence[activeIndex];
    if (!pair) return;
    const cubics = interpolateMorphCubics(pair, localProgress);
    const d = cubicsToSvgPath(cubics, size, scaleFactor);
    const rot = -clamped * 180;

    if (pathRef.current) pathRef.current.setAttribute("d", d);
    if (groupRef.current) {
      groupRef.current.setAttribute(
        "transform",
        `rotate(${rot.toFixed(2)} ${size / 2} ${size / 2})`,
      );
    }
  }, [isDeterminate, determinateProgress, resolvedSequence, size, scaleFactor]);

  React.useEffect(() => {
    if (isDeterminate || resolvedSequence.length === 0) return;

    const renderAt = (elapsedMs: number) => {
      const interval = LOADING_INDICATOR_TOKENS.morphIntervalMs;
      const totalSteps = Math.floor(elapsedMs / interval);
      const morphIndex = totalSteps % resolvedSequence.length;
      const withinStepSec = (elapsedMs % interval) / 1000;

      const springSpec = prefersReducedMotion
        ? { dampingRatio: 1.0, stiffness: 260 }
        : LOADING_INDICATOR_TOKENS.morphSpring;

      const morphProgress = evaluateSpringDisplacement(springSpec, withinStepSec);
      const pair = resolvedSequence[morphIndex];
      if (!pair) return;
      const cubics = interpolateMorphCubics(pair, morphProgress);
      const d = cubicsToSvgPath(cubics, size, scaleFactor);

      const quarterTurn = LOADING_INDICATOR_TOKENS.quarterRotationDeg;
      const stepAngle = ((totalSteps + 1) * quarterTurn) % 360;
      const globalAngle =
        ((elapsedMs % LOADING_INDICATOR_TOKENS.globalRotationDurationMs) /
          LOADING_INDICATOR_TOKENS.globalRotationDurationMs) *
        360;
      const rotationDeg = prefersReducedMotion
        ? (totalSteps * quarterTurn + morphProgress * quarterTurn) % 360
        : (morphProgress * quarterTurn + stepAngle + globalAngle) % 360;

      if (pathRef.current) {
        pathRef.current.setAttribute("d", d);
      }
      if (groupRef.current) {
        groupRef.current.setAttribute(
          "transform",
          `rotate(${rotationDeg.toFixed(2)} ${size / 2} ${size / 2})`,
        );
      }
    };

    renderAt(virtualElapsedMsRef.current);

    if (isPaused || typeof requestAnimationFrame !== "function") {
      return;
    }

    return subscribeSpringFrame((dtSec) => {
      const baseRate = motionRef.current.playbackRate;
      const rate = prefersReducedMotion ? Math.min(0.4, baseRate) : baseRate;
      virtualElapsedMsRef.current += dtSec * 1000 * rate;
      renderAt(virtualElapsedMsRef.current);
      return true;
    });
  }, [isDeterminate, isPaused, motionRef, prefersReducedMotion, resolvedSequence, size, scaleFactor]);

  const ariaValueNow = isDeterminate
    ? Math.round(Math.max(0, Math.min(1, determinateProgress ?? 0)) * 100)
    : undefined;

  return (
    <div
      ref={rootRef}
      role="progressbar"
      aria-label={resolvedAriaLabel}
      aria-valuemin={isDeterminate ? 0 : undefined}
      aria-valuemax={isDeterminate ? 100 : undefined}
      aria-valuenow={ariaValueNow}
      className={
        className ? `m3e-loading-indicator ${className}` : "m3e-loading-indicator"
      }
      data-contained={contained ? "" : undefined}
      style={{ width: size, height: size, ...style }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
      >
        <g ref={groupRef}>
          <path ref={pathRef} d={initialD} fill="currentColor" />
        </g>
      </svg>
    </div>
  );
}

export function ContainedLoadingIndicator(
  props: Omit<LoadingIndicatorProps, "contained">,
): React.JSX.Element {
  return <LoadingIndicator {...props} contained />;
}
