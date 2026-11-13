import * as React from "react";
import {
  LOADING_INDICATOR_MORPH_SEQUENCE,
  LOADING_INDICATOR_TOKENS,
  type MorphPair,
  cubicsToSvgPath,
  evaluateSpringDisplacement,
  interpolateMorphCubics,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";

export interface LoadingIndicatorProps {
  /** Logical pixel size (default `48` matching `LoadingIndicatorTokens.ContainerWidth`) */
  readonly size?: number;
  /** Optional determinate progress `[0..1]`. Omit for indeterminate 7-shape morph loop. */
  readonly progress?: number;
  /** Optional custom morph sequence */
  readonly morphSequence?: readonly MorphPair[];
  /** Override pause state */
  readonly paused?: boolean;
  readonly contained?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  /** Optional live frame callback for Playground inspector */
  readonly onFrameInfo?: (info: {
    readonly morphIndex: number;
    readonly fromShape: string;
    readonly toShape: string;
    readonly morphProgress: number;
    readonly rotationDeg: number;
  }) => void;
}

export function LoadingIndicator({
  size = LOADING_INDICATOR_TOKENS.containerSize,
  progress: determinateProgress,
  morphSequence = LOADING_INDICATOR_MORPH_SEQUENCE,
  paused: pausedProp,
  contained = false,
  "aria-label": ariaLabel,
  className,
  style,
  onFrameInfo,
}: LoadingIndicatorProps): React.JSX.Element {
  const { playbackRate, paused: contextPaused, prefersReducedMotion, t } = useM3E();
  const resolvedAriaLabel = ariaLabel ?? t("loading.label");
  const isPaused = pausedProp ?? contextPaused;
  const isDeterminate = typeof determinateProgress === "number";

  const pathRef = React.useRef<SVGPathElement | null>(null);
  const groupRef = React.useRef<SVGGElement | null>(null);
  const virtualElapsedMsRef = React.useRef<number>(0);
  const onFrameRef = React.useRef(onFrameInfo);
  onFrameRef.current = onFrameInfo;

  const scaleFactor = LOADING_INDICATOR_TOKENS.effectiveScaleFactor;

  // Compute initial path synchronously so SSR / first paint is never empty
  const initialD = React.useMemo(() => {
    const pair = morphSequence[0];
    if (!pair) return "";
    const p = isDeterminate ? Math.max(0, Math.min(1, determinateProgress ?? 0)) : 0;
    const cubics = interpolateMorphCubics(pair, p);
    return cubicsToSvgPath(cubics, size, scaleFactor);
  }, [morphSequence, size, scaleFactor, isDeterminate, determinateProgress]);

  // Determinate mode update
  React.useEffect(() => {
    if (!isDeterminate || morphSequence.length === 0) return;
    const clamped = Math.max(0, Math.min(1, determinateProgress ?? 0));
    const seqLen = morphSequence.length;
    const activeIndex = Math.min(seqLen - 1, Math.floor(clamped * seqLen));
    const localProgress =
      clamped === 1 && activeIndex === seqLen - 1 ? 1 : (clamped * seqLen) % 1;

    const pair = morphSequence[activeIndex];
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
    onFrameRef.current?.({
      morphIndex: activeIndex,
      fromShape: pair.from,
      toShape: pair.to,
      morphProgress: localProgress,
      rotationDeg: rot,
    });
  }, [isDeterminate, determinateProgress, morphSequence, size, scaleFactor]);

  // Indeterminate rAF physics loop matching AOSP LoadingIndicator.kt lines 407-498
  React.useEffect(() => {
    if (isDeterminate || morphSequence.length === 0) return;

    let rafId = 0;
    let lastNow = performance.now();

    const renderAt = (elapsedMs: number) => {
      const interval = LOADING_INDICATOR_TOKENS.morphIntervalMs;
      const totalSteps = Math.floor(elapsedMs / interval);
      const morphIndex = totalSteps % morphSequence.length;
      const withinStepSec = (elapsedMs % interval) / 1000;

      const springSpec = prefersReducedMotion
        ? { dampingRatio: 1.0, stiffness: 260 }
        : LOADING_INDICATOR_TOKENS.morphSpring;

      const morphProgress = evaluateSpringDisplacement(springSpec, withinStepSec);
      const pair = morphSequence[morphIndex];
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
      onFrameRef.current?.({
        morphIndex,
        fromShape: pair.from,
        toShape: pair.to,
        morphProgress,
        rotationDeg,
      });
    };

    renderAt(virtualElapsedMsRef.current);

    if (isPaused) {
      return;
    }

    const tick = (now: number) => {
      const dt = Math.min(64, Math.max(0, now - lastNow));
      lastNow = now;
      const rate = prefersReducedMotion ? Math.min(0.4, playbackRate) : playbackRate;
      virtualElapsedMsRef.current += dt * rate;
      renderAt(virtualElapsedMsRef.current);
      rafId = requestAnimationFrame(tick);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [isDeterminate, isPaused, playbackRate, prefersReducedMotion, morphSequence, size, scaleFactor]);

  const ariaValueNow = isDeterminate
    ? Math.round(Math.max(0, Math.min(1, determinateProgress ?? 0)) * 100)
    : undefined;

  return (
    <div
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
