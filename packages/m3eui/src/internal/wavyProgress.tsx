"use client";

import * as React from "react";
import { Progress } from "@base-ui/react/progress";
import {
  CIRCULAR_WAVY_TOKENS,
  type CircularWavyGeometryOutput as CircularWavyGeometry,
  type LinearWavyGeometryOutput as LinearWavyGeometry,
  WAVY_PROGRESS_TOKENS,
  buildDeterminateCircularWavyGeometry,
  buildDeterminateLinearWavyGeometry,
  buildIndeterminateCircularWavyGeometry,
  buildIndeterminateLinearWavyGeometry,
  resolveDeterminateWaveAmplitude,
} from "../tokens/index.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useOffscreen } from "./useOffscreen.js";

const MAX_LINEAR_TRACK_SEGMENTS = 3;
const MAX_LINEAR_ACTIVE_SEGMENTS = 2;

export interface LinearWavyProgressIndicatorProps {
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

export function LinearWavyProgressIndicator({
  value = null,
  amplitude: amplitudeOverride,
  wavelength,
  strokeWidth = WAVY_PROGRESS_TOKENS.strokeWidth,
  trackGap = WAVY_PROGRESS_TOKENS.trackActiveGap,
  paused: pausedProp,
  "aria-label": ariaLabel,
  className,
  style,
}: LinearWavyProgressIndicatorProps): React.JSX.Element {
  const {
    motionRef,
    paused: contextPaused,
    prefersReducedMotion,
    direction,
    locale,
    t,
  } = useM3ERuntime();
  const resolvedAriaLabel = ariaLabel ?? t("progress.wavyLinearLabel");
  const isIndeterminate = value === null || value === undefined;

  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const offscreen = useOffscreen(containerRef);
  const isPaused = (pausedProp ?? contextPaused) || offscreen;
  const trackPathRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const activePathRefs = React.useRef<(SVGPathElement | null)[]>([]);
  const stopDotRef = React.useRef<SVGCircleElement | null>(null);

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

  const height = WAVY_PROGRESS_TOKENS.containerHeight;

  const stateRef = React.useRef({
    progress: targetProgress,
    amplitude: targetAmplitude,
    phasePx: 0,
    cycleFraction: 0,
  });

  const computeGeometry = React.useCallback(
    (s: {
      readonly progress: number;
      readonly amplitude: number;
      readonly phasePx: number;
      readonly cycleFraction: number;
    }): LinearWavyGeometry =>
      isIndeterminate
        ? buildIndeterminateLinearWavyGeometry({
            width,
            height,
            cycleFraction: s.cycleFraction,
            amplitude: s.amplitude,
            wavelength: effectiveWavelength,
            phasePx: s.phasePx,
            strokeWidth,
            trackGap,
          })
        : buildDeterminateLinearWavyGeometry({
            width,
            height,
            progress: s.progress,
            amplitude: s.amplitude,
            wavelength: effectiveWavelength,
            phasePx: s.phasePx,
            strokeWidth,
            trackGap,
          }),
    [
      isIndeterminate,
      width,
      height,
      effectiveWavelength,
      strokeWidth,
      trackGap,
    ],
  );

  const applyGeometryToDom = React.useCallback((geo: LinearWavyGeometry) => {
    for (let i = 0; i < MAX_LINEAR_TRACK_SEGMENTS; i++) {
      const el = trackPathRefs.current[i];
      if (!el) continue;
      const d = geo.trackPaths[i];
      if (d) {
        el.setAttribute("d", d);
        el.style.display = "";
      } else {
        el.removeAttribute("d");
        el.style.display = "none";
      }
    }
    for (let i = 0; i < MAX_LINEAR_ACTIVE_SEGMENTS; i++) {
      const el = activePathRefs.current[i];
      if (!el) continue;
      const d = geo.activePaths[i];
      if (d) {
        el.setAttribute("d", d);
        el.style.display = "";
      } else {
        el.removeAttribute("d");
        el.style.display = "none";
      }
    }
    const dotEl = stopDotRef.current;
    if (dotEl) {
      if (geo.stopDot) {
        dotEl.setAttribute("cx", String(geo.stopDot.cx));
        dotEl.setAttribute("cy", String(geo.stopDot.cy));
        dotEl.setAttribute("r", String(geo.stopDot.r));
        dotEl.style.display = "";
      } else {
        dotEl.style.display = "none";
      }
    }
  }, []);

  const targetRef = React.useRef({
    progress: targetProgress,
    amplitude: targetAmplitude,
  });
  targetRef.current = {
    progress: targetProgress,
    amplitude: targetAmplitude,
  };
  const wakeRafRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (isPaused) {
      stateRef.current = {
        ...stateRef.current,
        progress: targetProgress,
        amplitude: targetAmplitude,
      };
      applyGeometryToDom(computeGeometry(stateRef.current));
      return;
    }
    if (Math.abs(targetProgress - stateRef.current.progress) <= 0.2) {
      stateRef.current = {
        ...stateRef.current,
        progress: targetProgress,
      };
    }
    wakeRafRef.current?.();
  }, [
    targetProgress,
    targetAmplitude,
    isPaused,
    computeGeometry,
    applyGeometryToDom,
  ]);

  React.useEffect(() => {
    if (isPaused) {
      return;
    }

    let rafId = 0;
    let running = false;
    let lastNow = performance.now();

    const step = (now: number) => {
      const dtMs = Math.min(64, Math.max(0, now - lastNow));
      lastNow = now;
      const rate = prefersReducedMotion ? Math.min(0.4, motionRef.current.playbackRate) : motionRef.current.playbackRate;
      const dtScaledMs = dtMs * rate;

      const prev = stateRef.current;
      const { progress: tgtProgress, amplitude: tgtAmplitude } =
        targetRef.current;
      const alpha = Math.min(1, dtMs / (140 / Math.max(0.1, rate)));

      const nextProgress = isIndeterminate
        ? 0
        : prev.progress + (tgtProgress - prev.progress) * alpha;
      const nextAmplitude =
        prev.amplitude + (tgtAmplitude - prev.amplitude) * alpha;
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
      applyGeometryToDom(computeGeometry(next));

      const settledDeterminate =
        !isIndeterminate &&
        nextAmplitude < 0.005 &&
        Math.abs(nextProgress - tgtProgress) < 0.001 &&
        Math.abs(nextAmplitude - tgtAmplitude) < 0.002;

      if (!settledDeterminate) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
      }
    };

    wakeRafRef.current = () => {
      if (!running) {
        running = true;
        lastNow = performance.now();
        rafId = requestAnimationFrame(step);
      }
    };

    applyGeometryToDom(computeGeometry(stateRef.current));
    running = true;
    rafId = requestAnimationFrame(step);
    return () => {
      running = false;
      wakeRafRef.current = null;
      cancelAnimationFrame(rafId);
    };
  }, [
    isIndeterminate,
    effectiveWavelength,
    isPaused,
    prefersReducedMotion,
    computeGeometry,
    applyGeometryToDom,
  ]);

  const initialGeometryRef = React.useRef<LinearWavyGeometry | null>(null);
  if (initialGeometryRef.current === null) {
    initialGeometryRef.current = computeGeometry({
      progress: targetProgress,
      amplitude: targetAmplitude,
      phasePx: stateRef.current.phasePx,
      cycleFraction: stateRef.current.cycleFraction,
    });
  }
  const initialGeometry = initialGeometryRef.current;

  return (
    <Progress.Root
      ref={containerRef}
      value={isIndeterminate ? null : Math.round(targetProgress * 100)}
      locale={locale}
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
        style={direction === "rtl" ? { transform: "scaleX(-1)" } : undefined}
      >
        {Array.from({ length: MAX_LINEAR_TRACK_SEGMENTS }, (_, idx) => {
          const d = initialGeometry.trackPaths[idx];
          return (
            <path
              key={`track-${idx}`}
              ref={(el) => {
                trackPathRefs.current[idx] = el;
              }}
              d={d}
              fill="none"
              stroke="var(--m3e-color-secondary-container)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={d ? undefined : { display: "none" }}
            />
          );
        })}
        {Array.from({ length: MAX_LINEAR_ACTIVE_SEGMENTS }, (_, idx) => {
          const d = initialGeometry.activePaths[idx];
          return (
            <path
              key={`active-${idx}`}
              ref={(el) => {
                activePathRefs.current[idx] = el;
              }}
              d={d}
              fill="none"
              stroke="var(--m3e-color-primary)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={d ? undefined : { display: "none" }}
            />
          );
        })}
        <circle
          ref={stopDotRef}
          cx={initialGeometry.stopDot?.cx ?? 0}
          cy={initialGeometry.stopDot?.cy ?? height / 2}
          r={initialGeometry.stopDot?.r ?? WAVY_PROGRESS_TOKENS.stopIndicatorSize / 2}
          fill="var(--m3e-color-primary)"
          style={initialGeometry.stopDot ? undefined : { display: "none" }}
        />
      </svg>
    </Progress.Root>
  );
}


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
  const {
    motionRef,
    paused: contextPaused,
    prefersReducedMotion,
    locale,
    t,
  } = useM3ERuntime();
  const resolvedAriaLabel = ariaLabel ?? t("progress.wavyCircularLabel");
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const offscreen = useOffscreen(rootRef);
  const isPaused = (pausedProp ?? contextPaused) || offscreen;
  const isIndeterminate = value === null || value === undefined;

  const trackPathRef = React.useRef<SVGPathElement | null>(null);
  const activePathRef = React.useRef<SVGPathElement | null>(null);

  const targetProgress = isIndeterminate
    ? 0
    : Math.max(0, Math.min(1, value / 100));

  const targetAmplitude = prefersReducedMotion
    ? 0
    : (amplitudeOverride ??
      (isIndeterminate ? 1 : resolveDeterminateWaveAmplitude(targetProgress)));

  const stateRef = React.useRef({
    progress: targetProgress,
    amplitude: targetAmplitude,
    phaseRad: 0,
    cycleFraction: 0,
  });

  const computeGeometry = React.useCallback(
    (s: {
      readonly progress: number;
      readonly amplitude: number;
      readonly phaseRad: number;
      readonly cycleFraction: number;
    }): CircularWavyGeometry =>
      isIndeterminate
        ? buildIndeterminateCircularWavyGeometry({
            size,
            cycleFraction: s.cycleFraction,
            amplitude: s.amplitude,
            phaseRad: s.phaseRad,
            strokeWidth,
            maxAmplitudePx,
            targetWavelength,
            trackGap,
          })
        : buildDeterminateCircularWavyGeometry({
            size,
            progress: s.progress,
            amplitude: s.amplitude,
            phaseRad: s.phaseRad,
            strokeWidth,
            maxAmplitudePx,
            targetWavelength,
            trackGap,
          }),
    [
      isIndeterminate,
      size,
      strokeWidth,
      maxAmplitudePx,
      targetWavelength,
      trackGap,
    ],
  );

  const applyGeometryToDom = React.useCallback((geo: CircularWavyGeometry) => {
    const trackEl = trackPathRef.current;
    if (trackEl) {
      if (geo.trackPath) {
        trackEl.setAttribute("d", geo.trackPath);
        trackEl.style.display = "";
      } else {
        trackEl.removeAttribute("d");
        trackEl.style.display = "none";
      }
    }
    const activeEl = activePathRef.current;
    if (activeEl) {
      if (geo.activePath) {
        activeEl.setAttribute("d", geo.activePath);
        activeEl.style.display = "";
      } else {
        activeEl.removeAttribute("d");
        activeEl.style.display = "none";
      }
    }
  }, []);

  const targetRef = React.useRef({
    progress: targetProgress,
    amplitude: targetAmplitude,
  });
  targetRef.current = {
    progress: targetProgress,
    amplitude: targetAmplitude,
  };
  const wakeRafRef = React.useRef<(() => void) | null>(null);

  React.useEffect(() => {
    if (isPaused) {
      stateRef.current = {
        ...stateRef.current,
        progress: targetProgress,
        amplitude: targetAmplitude,
      };
      applyGeometryToDom(computeGeometry(stateRef.current));
      return;
    }
    if (Math.abs(targetProgress - stateRef.current.progress) <= 0.2) {
      stateRef.current = {
        ...stateRef.current,
        progress: targetProgress,
      };
    }
    wakeRafRef.current?.();
  }, [
    targetProgress,
    targetAmplitude,
    isPaused,
    computeGeometry,
    applyGeometryToDom,
  ]);

  React.useEffect(() => {
    if (isPaused) {
      return;
    }

    let rafId = 0;
    let running = false;
    let lastNow = performance.now();

    const step = (now: number) => {
      const dtMs = Math.min(64, Math.max(0, now - lastNow));
      lastNow = now;
      const rate = prefersReducedMotion
        ? Math.min(0.4, motionRef.current.playbackRate)
        : motionRef.current.playbackRate;
      const dtScaledMs = dtMs * rate;

      const prev = stateRef.current;
      const { progress: tgtProgress, amplitude: tgtAmplitude } =
        targetRef.current;
      const alpha = Math.min(1, dtMs / (140 / Math.max(0.1, rate)));

      const nextProgress = isIndeterminate
        ? 0
        : prev.progress + (tgtProgress - prev.progress) * alpha;
      const nextAmplitude =
        prev.amplitude + (tgtAmplitude - prev.amplitude) * alpha;
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
      applyGeometryToDom(computeGeometry(next));

      const settledDeterminate =
        !isIndeterminate &&
        nextAmplitude < 0.005 &&
        Math.abs(nextProgress - tgtProgress) < 0.001 &&
        Math.abs(nextAmplitude - tgtAmplitude) < 0.002;

      if (!settledDeterminate) {
        rafId = requestAnimationFrame(step);
      } else {
        running = false;
      }
    };

    wakeRafRef.current = () => {
      if (!running) {
        running = true;
        lastNow = performance.now();
        rafId = requestAnimationFrame(step);
      }
    };

    applyGeometryToDom(computeGeometry(stateRef.current));
    running = true;
    rafId = requestAnimationFrame(step);
    return () => {
      running = false;
      wakeRafRef.current = null;
      cancelAnimationFrame(rafId);
    };
  }, [
    isIndeterminate,
    isPaused,
    prefersReducedMotion,
    computeGeometry,
    applyGeometryToDom,
  ]);

  const initialGeometryRef = React.useRef<CircularWavyGeometry | null>(null);
  if (initialGeometryRef.current === null) {
    initialGeometryRef.current = computeGeometry({
      progress: targetProgress,
      amplitude: targetAmplitude,
      phaseRad: stateRef.current.phaseRad,
      cycleFraction: stateRef.current.cycleFraction,
    });
  }
  const initialGeometry = initialGeometryRef.current;

  return (
    <Progress.Root
      ref={rootRef}
      value={isIndeterminate ? null : Math.round(targetProgress * 100)}
      locale={locale}
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
        <path
          ref={trackPathRef}
          d={initialGeometry.trackPath || undefined}
          fill="none"
          stroke="var(--m3e-color-secondary-container)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={initialGeometry.trackPath ? undefined : { display: "none" }}
        />
        <path
          ref={activePathRef}
          d={initialGeometry.activePath || undefined}
          fill="none"
          stroke="var(--m3e-color-primary)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          style={initialGeometry.activePath ? undefined : { display: "none" }}
        />
      </svg>
    </Progress.Root>
  );
}
