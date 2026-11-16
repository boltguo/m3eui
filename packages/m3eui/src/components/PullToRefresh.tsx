"use client";

import * as React from "react";
import { PULL_TO_REFRESH_TOKENS } from "../tokens/index.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";
import { ContainedLoadingIndicator } from "./LoadingIndicator.js";

export type PullToRefreshIndicatorVariant = "contained" | "circular";

export interface M3EPullToRefreshProps {
  readonly refreshing: boolean;
  readonly onRefresh: () => void;
  readonly enabled?: boolean;
  readonly threshold?: number;
  readonly maxDragDistance?: number;
  readonly indicatorVariant?: PullToRefreshIndicatorVariant;
  readonly "aria-label"?: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function CircularPullSpinner({
  progress,
  refreshing,
}: {
  readonly progress: number;
  readonly refreshing: boolean;
}) {
  const size = PULL_TO_REFRESH_TOKENS.circularSize;
  const r = 10;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(1, progress));
  const dash = refreshing ? c * 0.72 : Math.max(2, clamped * c * 0.82);

  return (
    <div
      className="m3e-pull-to-refresh__circular"
      data-refreshing={refreshing ? "" : undefined}
      style={{ width: `${size}px`, height: `${size}px` }}
      aria-hidden="true"
    >
      <svg
        width={24}
        height={24}
        viewBox="0 0 24 24"
        fill="none"
        style={
          !refreshing
            ? { transform: `rotate(${(progress * 220 - 90).toFixed(1)}deg)` }
            : undefined
        }
      >
        <circle
          cx="12"
          cy="12"
          r={r}
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeDasharray={`${dash.toFixed(2)} ${c.toFixed(2)}`}
        />
      </svg>
    </div>
  );
}

export function PullToRefreshBox({
  refreshing,
  onRefresh,
  enabled = true,
  threshold = PULL_TO_REFRESH_TOKENS.positionalThreshold,
  maxDragDistance = PULL_TO_REFRESH_TOKENS.maxDragDistance,
  indicatorVariant = "contained",
  "aria-label": ariaLabel,
  children,
  className,
  style,
}: M3EPullToRefreshProps): React.JSX.Element {
  const { t } = useM3ERuntime();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [pullDistance, setPullDistance] = React.useState<number>(0);
  const [isPulling, setIsPulling] = React.useState<boolean>(false);

  const gestureRef = React.useRef<{
    tracking: boolean;
    engaged: boolean;
    pointerId: number;
    startX: number;
    startY: number;
    currentPull: number;
  }>({
    tracking: false,
    engaged: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    currentPull: 0,
  });

  const isScrollAtTop = (target: EventTarget | null): boolean => {
    const root = containerRef.current;
    if (!root) return false;
    if (root.scrollTop > 1) return false;
    let node = target instanceof HTMLElement ? target : null;
    while (node && node !== root) {
      if (node.scrollTop > 1) return false;
      node = node.parentElement;
    }
    return true;
  };

  const computeDampedPull = React.useCallback(
    (rawDeltaY: number): number => {
      if (rawDeltaY <= 0) return 0;
      const scaled = rawDeltaY * PULL_TO_REFRESH_TOKENS.dragMultiplier;
      if (scaled <= threshold) return scaled;
      const excess = scaled - threshold;
      const maxExcess = Math.max(16, maxDragDistance - threshold);
      const dampedExcess = maxExcess * (1 - Math.exp(-excess / maxExcess));
      return Math.min(maxDragDistance, threshold + dampedExcess);
    },
    [threshold, maxDragDistance],
  );

  const finishGesture = React.useCallback(
    (cancelled: boolean) => {
      const g = gestureRef.current;
      if (!g.tracking) return;
      const reachedThreshold = !cancelled && g.engaged && g.currentPull >= threshold;
      g.tracking = false;
      g.engaged = false;
      g.pointerId = -1;
      g.currentPull = 0;
      setIsPulling(false);
      setPullDistance(0);
      if (reachedThreshold && enabled && !refreshing) {
        onRefresh();
      }
    },
    [threshold, enabled, refreshing, onRefresh],
  );

  const restingRefreshY = threshold * 0.72;
  const targetOffset = refreshing ? restingRefreshY : pullDistance;
  const animatedOffset = useM3EScalarSpring(
    targetOffset,
    isPulling ? "fastSpatial" : "defaultSpatial",
  );

  const rawProgress = targetOffset / Math.max(1, threshold);
  const indicatorSize =
    indicatorVariant === "contained"
      ? PULL_TO_REFRESH_TOKENS.indicatorSize
      : PULL_TO_REFRESH_TOKENS.circularSize;
  const visibleFraction = Math.max(0, Math.min(1, animatedOffset / Math.max(1, threshold * 0.65)));
  const indicatorScale = refreshing
    ? 1
    : 0.45 + 0.55 * Math.max(0, Math.min(1, rawProgress));
  const indicatorTranslateY = animatedOffset - indicatorSize - 4;
  const overshootDeg =
    !refreshing && rawProgress > 1 ? (rawProgress - 1) * 90 : 0;

  const statusText = refreshing
    ? (ariaLabel ?? t("pullToRefresh.refreshing"))
    : rawProgress >= 1
      ? t("pullToRefresh.release")
      : t("pullToRefresh.pulling");

  const showIndicator = refreshing || animatedOffset > 2;

  return (
    <div
      ref={containerRef}
      className={
        className ? `m3e-pull-to-refresh ${className}` : "m3e-pull-to-refresh"
      }
      data-refreshing={refreshing ? "" : undefined}
      data-pulling={isPulling ? "" : undefined}
      data-ready={!refreshing && rawProgress >= 1 ? "" : undefined}
      style={style}
      onPointerDown={(e) => {
        if (!enabled || refreshing || e.button !== 0) return;
        if (!isScrollAtTop(e.target)) return;
        gestureRef.current = {
          tracking: true,
          engaged: false,
          pointerId: e.pointerId,
          startX: e.clientX,
          startY: e.clientY,
          currentPull: 0,
        };
      }}
      onPointerMove={(e) => {
        const g = gestureRef.current;
        if (!g.tracking || g.pointerId !== e.pointerId) return;
        const dx = e.clientX - g.startX;
        const dy = e.clientY - g.startY;

        if (!g.engaged) {
          if (dy < -4 || Math.abs(dx) > Math.abs(dy) * 1.1 && Math.abs(dx) > 8) {
            g.tracking = false;
            return;
          }
          if (dy <= 6) return;
          if (!isScrollAtTop(e.target)) {
            g.tracking = false;
            return;
          }
          g.engaged = true;
          setIsPulling(true);
          try {
            e.currentTarget.setPointerCapture?.(e.pointerId);
          } catch {
            // Ignore synthetic pointer capture errors
          }
        }

        const nextPull = computeDampedPull(Math.max(0, dy - 6));
        g.currentPull = nextPull;
        setPullDistance(nextPull);
      }}
      onPointerUp={(e) => {
        if (gestureRef.current.pointerId === e.pointerId) {
          try {
            if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
              e.currentTarget.releasePointerCapture(e.pointerId);
            }
          } catch {
            // Ignore synthetic pointer capture errors
          }
          finishGesture(false);
        }
      }}
      onPointerCancel={(e) => {
        if (gestureRef.current.pointerId === e.pointerId) {
          finishGesture(true);
        }
      }}
    >
      <div
        className="m3e-pull-to-refresh__indicator-slot"
        aria-hidden={!showIndicator ? true : undefined}
        style={{
          opacity: showIndicator ? visibleFraction : 0,
          transform: `translate3d(-50%, ${indicatorTranslateY.toFixed(1)}px, 0) scale(${indicatorScale.toFixed(3)}) rotate(${overshootDeg.toFixed(1)}deg)`,
        }}
      >
        {showIndicator ? (
          indicatorVariant === "contained" ? (
            <ContainedLoadingIndicator
              size={PULL_TO_REFRESH_TOKENS.indicatorSize}
              progress={refreshing ? undefined : Math.max(0.02, Math.min(1, rawProgress))}
              aria-label={statusText}
            />
          ) : (
            <CircularPullSpinner progress={rawProgress} refreshing={refreshing} />
          )
        ) : null}
      </div>

      <div className="m3e-pull-to-refresh__content">{children}</div>

      <span className="m3e-visually-hidden" role="status" aria-live="polite">
        {refreshing ? statusText : ""}
      </span>
    </div>
  );
}

