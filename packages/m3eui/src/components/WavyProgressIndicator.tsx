import * as React from "react";
import { Progress } from "@base-ui/react/progress";
import {
  CIRCULAR_WAVY_TOKENS,
  WAVY_PROGRESS_TOKENS,
  buildDeterminateCircularWavyGeometry,
  buildDeterminateLinearWavyGeometry,
  buildIndeterminateCircularWavyGeometry,
  buildIndeterminateLinearWavyGeometry,
  resolveDeterminateWaveAmplitude,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";

export interface WavyProgressIndicatorProps {
  readonly value?: number | null;
  readonly amplitude?: number;
  readonly wavelength?: number;
  readonly strokeWidth?: number;
  readonly trackGap?: number;
  readonly paused?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function WavyProgressIndicator({
  value = null,
  amplitude: amplitudeOverride,
  wavelength,
  strokeWidth = WAVY_PROGRESS_TOKENS.strokeWidth,
  trackGap = WAVY_PROGRESS_TOKENS.trackActiveGap,
  paused: pausedProp,
  "aria-label": ariaLabel,
  className,
  style,
}: WavyProgressIndicatorProps): React.JSX.Element {
  const { playbackRate, paused: contextPaused, prefersReducedMotion, t } = useM3E();
  const resolvedAriaLabel = ariaLabel ?? t("progress.wavyLinearLabel");
  const isPaused = pausedProp ?? contextPaused;
  const isIndeterminate = value === null || value === undefined;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [width, setWidth] = React.useState<number>(WAVY_PROGRESS_TOKENS.defaultWidth);

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const measure = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 16) setWidth(w);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const targetProgress = isIndeterminate
    ? 0
    : Math.max(0, Math.min(1, value / 100));

  const targetAmplitude = prefersReducedMotion
    ? 0
    : (amplitudeOverride ??
      (isIndeterminate ? 1 : resolveDeterminateWaveAmplitude(targetProgress)));

  const effectiveWavelength =
    wavelength ??
    (isIndeterminate
      ? WAVY_PROGRESS_TOKENS.indeterminateWavelength
      : WAVY_PROGRESS_TOKENS.determinateWavelength);

  const [frameState, setFrameState] = React.useState(() => ({
    progress: targetProgress,
    amplitude: targetAmplitude,
    phasePx: 0,
    cycleFraction: 0,
  }));

  const stateRef = React.useRef(frameState);
  stateRef.current = frameState;

  React.useEffect(() => {
    let rafId = 0;
    let lastNow = performance.now();

    const step = (now: number) => {
      const dtMs = Math.min(64, Math.max(0, now - lastNow));
      lastNow = now;
      const rate = prefersReducedMotion ? Math.min(0.4, playbackRate) : playbackRate;
      const dtScaledMs = isPaused ? 0 : dtMs * rate;

      const prev = stateRef.current;

      const alpha = isPaused
        ? 0.35
        : Math.min(1, dtMs / (140 / Math.max(0.1, rate)));

      const nextProgress = isIndeterminate
        ? 0
        : prev.progress + (targetProgress - prev.progress) * alpha;
      const nextAmplitude =
        prev.amplitude + (targetAmplitude - prev.amplitude) * alpha;

      const nextPhase =
        (prev.phasePx + (dtScaledMs / 1000) * effectiveWavelength) %
        Math.max(1, effectiveWavelength);

      const nextCycle = isIndeterminate
        ? (prev.cycleFraction + dtScaledMs / WAVY_PROGRESS_TOKENS.indeterminateCycleMs) % 1
        : 0;

      const next = {
        progress: nextProgress,
        amplitude: nextAmplitude,
        phasePx: nextPhase,
        cycleFraction: nextCycle,
      };
      stateRef.current = next;
      setFrameState(next);

      const settledDeterminate =
        !isIndeterminate &&
        (isPaused || nextAmplitude < 0.005) &&
        Math.abs(nextProgress - targetProgress) < 0.001 &&
        Math.abs(nextAmplitude - targetAmplitude) < 0.002;

      if (!settledDeterminate && (!isPaused || Math.abs(nextProgress - targetProgress) >= 0.001 || Math.abs(nextAmplitude - targetAmplitude) >= 0.002)) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [
    isIndeterminate,
    targetProgress,
    targetAmplitude,
    effectiveWavelength,
    isPaused,
    playbackRate,
    prefersReducedMotion,
  ]);

  const height = WAVY_PROGRESS_TOKENS.containerHeight;
  const geometry = isIndeterminate
    ? buildIndeterminateLinearWavyGeometry({
        width,
        height,
        cycleFraction: frameState.cycleFraction,
        amplitude: frameState.amplitude,
        wavelength: effectiveWavelength,
        phasePx: frameState.phasePx,
        strokeWidth,
        trackGap,
      })
    : buildDeterminateLinearWavyGeometry({
        width,
        height,
        progress: frameState.progress,
        amplitude: frameState.amplitude,
        wavelength: effectiveWavelength,
        phasePx: frameState.phasePx,
        strokeWidth,
        trackGap,
      });

  return (
    <Progress.Root
      ref={containerRef}
      value={isIndeterminate ? null : Math.round(targetProgress * 100)}
      aria-label={resolvedAriaLabel}
      className={
        className ? `m3e-wavy-progress ${className}` : "m3e-wavy-progress"
      }
      style={style}
    >
      <svg
        className="m3e-wavy-progress__svg"
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        aria-hidden="true"
      >
        {geometry.trackPaths.map((d, idx) => (
          <path
            key={`track-${idx}`}
            d={d}
            fill="none"
            stroke="var(--m3e-color-secondary-container)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}
        {geometry.activePaths.map((d, idx) => (
          <path
            key={`active-${idx}`}
            d={d}
            fill="none"
            stroke="var(--m3e-color-primary)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ))}
        {geometry.stopDot ? (
          <circle
            cx={geometry.stopDot.cx}
            cy={geometry.stopDot.cy}
            r={geometry.stopDot.r}
            fill="var(--m3e-color-primary)"
          />
        ) : null}
      </svg>
    </Progress.Root>
  );
}

export const LinearWavyProgressIndicator = WavyProgressIndicator;

export interface CircularWavyProgressIndicatorProps {
  readonly value?: number | null;
  readonly size?: number;
  readonly strokeWidth?: number;
  readonly maxAmplitudePx?: number;
  readonly targetWavelength?: number;
  readonly trackGap?: number;
  readonly amplitude?: number;
  readonly paused?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function CircularWavyProgressIndicator({
  value = null,
  size = CIRCULAR_WAVY_TOKENS.size,
  strokeWidth = CIRCULAR_WAVY_TOKENS.strokeWidth,
  maxAmplitudePx = CIRCULAR_WAVY_TOKENS.maxAmplitudePx,
  targetWavelength = CIRCULAR_WAVY_TOKENS.targetWavelength,
  trackGap = CIRCULAR_WAVY_TOKENS.trackActiveGap,
  amplitude: amplitudeOverride,
  paused: pausedProp,
  "aria-label": ariaLabel,
  className,
  style,
}: CircularWavyProgressIndicatorProps): React.JSX.Element {
  const { playbackRate, paused: contextPaused, prefersReducedMotion, t } = useM3E();
  const resolvedAriaLabel = ariaLabel ?? t("progress.wavyCircularLabel");
  const isPaused = pausedProp ?? contextPaused;
  const isIndeterminate = value === null || value === undefined;

  const targetProgress = isIndeterminate
    ? 0
    : Math.max(0, Math.min(1, value / 100));

  const targetAmplitude = prefersReducedMotion
    ? 0
    : (amplitudeOverride ??
      (isIndeterminate ? 1 : resolveDeterminateWaveAmplitude(targetProgress)));

  const [frameState, setFrameState] = React.useState(() => ({
    progress: targetProgress,
    amplitude: targetAmplitude,
    phaseRad: 0,
    cycleFraction: 0,
  }));

  const stateRef = React.useRef(frameState);
  stateRef.current = frameState;

  React.useEffect(() => {
    let rafId = 0;
    let lastNow = performance.now();

    const step = (now: number) => {
      const dtMs = Math.min(64, Math.max(0, now - lastNow));
      lastNow = now;
      const rate = prefersReducedMotion
        ? Math.min(0.4, playbackRate)
        : playbackRate;
      const dtScaledMs = isPaused ? 0 : dtMs * rate;

      const prev = stateRef.current;
      const alpha = isPaused
        ? 0.35
        : Math.min(1, dtMs / (140 / Math.max(0.1, rate)));

      const nextProgress = isIndeterminate
        ? 0
        : prev.progress + (targetProgress - prev.progress) * alpha;
      const nextAmplitude =
        prev.amplitude + (targetAmplitude - prev.amplitude) * alpha;

      const nextPhase =
        (prev.phaseRad +
          (dtScaledMs / 1000) * CIRCULAR_WAVY_TOKENS.defaultAngularWaveSpeedRad) %
        (2 * Math.PI);

      const nextCycle = isIndeterminate
        ? (prev.cycleFraction +
            dtScaledMs / CIRCULAR_WAVY_TOKENS.indeterminateCycleMs) %
          1
        : 0;

      const next = {
        progress: nextProgress,
        amplitude: nextAmplitude,
        phaseRad: nextPhase,
        cycleFraction: nextCycle,
      };
      stateRef.current = next;
      setFrameState(next);

      const settledDeterminate =
        !isIndeterminate &&
        (isPaused || nextAmplitude < 0.005) &&
        Math.abs(nextProgress - targetProgress) < 0.001 &&
        Math.abs(nextAmplitude - targetAmplitude) < 0.002;

      if (
        !settledDeterminate &&
        (!isPaused ||
          Math.abs(nextProgress - targetProgress) >= 0.001 ||
          Math.abs(nextAmplitude - targetAmplitude) >= 0.002)
      ) {
        rafId = requestAnimationFrame(step);
      }
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [
    isIndeterminate,
    targetProgress,
    targetAmplitude,
    isPaused,
    playbackRate,
    prefersReducedMotion,
  ]);

  const geometry = isIndeterminate
    ? buildIndeterminateCircularWavyGeometry({
        size,
        cycleFraction: frameState.cycleFraction,
        amplitude: frameState.amplitude,
        phaseRad: frameState.phaseRad,
        strokeWidth,
        maxAmplitudePx,
        targetWavelength,
        trackGap,
      })
    : buildDeterminateCircularWavyGeometry({
        size,
        progress: frameState.progress,
        amplitude: frameState.amplitude,
        phaseRad: frameState.phaseRad,
        strokeWidth,
        maxAmplitudePx,
        targetWavelength,
        trackGap,
      });

  return (
    <Progress.Root
      value={isIndeterminate ? null : Math.round(targetProgress * 100)}
      aria-label={resolvedAriaLabel}
      className={
        className ? `m3e-circular-wavy ${className}` : "m3e-circular-wavy"
      }
      style={{ width: size, height: size, ...style }}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden="true"
        style={{ display: "block", overflow: "visible" }}
      >
        {geometry.trackPath ? (
          <path
            d={geometry.trackPath}
            fill="none"
            stroke="var(--m3e-color-secondary-container)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ) : null}
        {geometry.activePath ? (
          <path
            d={geometry.activePath}
            fill="none"
            stroke="var(--m3e-color-primary)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />
        ) : null}
      </svg>
    </Progress.Root>
  );
}
