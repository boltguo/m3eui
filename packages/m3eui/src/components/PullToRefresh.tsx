"use client";

import * as React from "react";
import { PULL_TO_REFRESH_TOKENS } from "../tokens/index.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";
import { LoadingIndicator } from "./LoadingIndicator.js";

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

  const gestureRef = React.useRef({
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

  const computeDampedPull = (rawDeltaY: number): number => {
    if (rawDeltaY <= 0) return 0;
    const scaled = rawDeltaY * PULL_TO_REFRESH_TOKENS.dragMultiplier;
    if (scaled <= threshold) return scaled;
    const excess = scaled - threshold;
    const maxExcess = Math.max(16, maxDragDistance - threshold);
    const dampedExcess = maxExcess * (1 - Math.exp(-excess / maxExcess));
    return Math.min(maxDragDistance, threshold + dampedExcess);
  };

  const beginGesture = (
    id: number,
    x: number,
    y: number,
    target: EventTarget | null,
  ): boolean => {
    if (!enabled || refreshing || !isScrollAtTop(target)) return false;
    gestureRef.current = {
      tracking: true,
      engaged: false,
      pointerId: id,
      startX: x,
      startY: y,
      currentPull: 0,
    };
    return true;
  };

  /** Returns true while the gesture owns the drag (caller should block native scroll). */
  const moveGesture = (x: number, y: number, target: EventTarget | null): boolean => {
    const g = gestureRef.current;
    if (!g.tracking) return false;
    const dx = x - g.startX;
    const dy = y - g.startY;
    if (!g.engaged) {
      if (dy < -4 || (Math.abs(dx) > Math.abs(dy) * 1.1 && Math.abs(dx) > 8)) {
        g.tracking = false;
        return false;
      }
      if (dy <= 6) return false;
      if (!isScrollAtTop(target)) {
        g.tracking = false;
        return false;
      }
      g.engaged = true;
      setIsPulling(true);
    }
    const nextPull = computeDampedPull(Math.max(0, dy - 6));
    g.currentPull = nextPull;
    setPullDistance(nextPull);
    return true;
  };

  const finishGesture = (cancelled: boolean) => {
    const g = gestureRef.current;
    if (!g.tracking) return;
    const reachedThreshold = !cancelled && g.engaged && g.currentPull >= threshold;
    g.tracking = false;
    g.engaged = false;
    g.pointerId = -1;
    g.currentPull = 0;
    setIsPulling(false);
    setPullDistance(0);
    if (reachedThreshold && enabled && !refreshing) onRefresh();
  };

  // Touch runs through native listeners: React attaches touchmove as passive,
  // so it cannot stop the browser from scrolling (and cancelling pointers).
  const touchHandlersRef = React.useRef({ beginGesture, moveGesture, finishGesture });
  touchHandlersRef.current = { beginGesture, moveGesture, finishGesture };

  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onStart = (e: TouchEvent) => {
      const touch = e.touches[0];
      if (e.touches.length !== 1 || !touch) return;
      touchHandlersRef.current.beginGesture(
        touch.identifier,
        touch.clientX,
        touch.clientY,
        e.target,
      );
    };
    const onMove = (e: TouchEvent) => {
      const g = gestureRef.current;
      const touch = Array.from(e.touches).find((t) => t.identifier === g.pointerId);
      if (!touch) return;
      if (touchHandlersRef.current.moveGesture(touch.clientX, touch.clientY, e.target)) {
        e.preventDefault();
      }
    };
    const onEnd = (e: TouchEvent) => {
      const g = gestureRef.current;
      if (!g.tracking) return;
      if (Array.from(e.changedTouches).some((t) => t.identifier === g.pointerId)) {
        touchHandlersRef.current.finishGesture(e.type === "touchcancel");
      }
    };
    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd);
    el.addEventListener("touchcancel", onEnd);
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
      el.removeEventListener("touchcancel", onEnd);
    };
  }, []);

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
        if (e.pointerType === "touch" || e.button !== 0) return;
        beginGesture(e.pointerId, e.clientX, e.clientY, e.target);
      }}
      onPointerMove={(e) => {
        const g = gestureRef.current;
        if (e.pointerType === "touch" || g.pointerId !== e.pointerId) return;
        const wasEngaged = g.engaged;
        if (moveGesture(e.clientX, e.clientY, e.target) && !wasEngaged) {
          e.currentTarget.setPointerCapture?.(e.pointerId);
        }
      }}
      onPointerUp={(e) => {
        if (e.pointerType !== "touch" && gestureRef.current.pointerId === e.pointerId) {
          finishGesture(false);
        }
      }}
      onPointerCancel={(e) => {
        if (e.pointerType !== "touch" && gestureRef.current.pointerId === e.pointerId) {
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
            <LoadingIndicator
              contained
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

