"use client";

import * as React from "react";
import {
  type MotionTokenKey,
  type SpringPhysicsSpec,
  stepSpringSimulation,
} from "../tokens/motion.js";
import {
  type CornerTuple,
} from "../tokens/topology.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";
import { assignRef } from "../internal/assignRef.js";

type SpringFrameSubscriber = (dtSec: number) => boolean;

const activeSubscribers = new Set<SpringFrameSubscriber>();
let rafHandle: number | null = null;
let lastFrameTimeMs = 0;

function runFrame(nowMs: number): void {
  const rawDtSec = lastFrameTimeMs > 0 ? (nowMs - lastFrameTimeMs) / 1000 : 1 / 60;
  lastFrameTimeMs = nowMs;
  const dtSec = rawDtSec > 0 ? Math.min(rawDtSec, 0.064) : 1 / 60;

  for (const subscriber of Array.from(activeSubscribers)) {
    const keepRunning = subscriber(dtSec);
    if (!keepRunning) {
      activeSubscribers.delete(subscriber);
    }
  }

  if (activeSubscribers.size > 0 && typeof requestAnimationFrame === "function") {
    rafHandle = requestAnimationFrame(runFrame);
  } else {
    rafHandle = null;
    lastFrameTimeMs = 0;
  }
}

export function subscribeSpringFrame(subscriber: SpringFrameSubscriber): () => void {
  if (typeof requestAnimationFrame !== "function") {
    return () => {};
  }
  activeSubscribers.add(subscriber);
  if (rafHandle === null) {
    lastFrameTimeMs = typeof performance !== "undefined" ? performance.now() : 0;
    rafHandle = requestAnimationFrame(runFrame);
  }
  return () => {
    activeSubscribers.delete(subscriber);
    if (activeSubscribers.size === 0 && rafHandle !== null && typeof cancelAnimationFrame === "function") {
      cancelAnimationFrame(rafHandle);
      rafHandle = null;
      lastFrameTimeMs = 0;
    }
  };
}

function resolveEffectiveSpringParams(
  baseSpec: SpringPhysicsSpec,
  rate: number,
  prefersReducedMotion: boolean,
): { readonly dampingRatio: number; readonly stiffness: number } {
  const clampedRate = Math.max(0.05, Math.min(2, rate));
  const dampingRatio = prefersReducedMotion ? 1.0 : baseSpec.dampingRatio;
  const rawStiffness = prefersReducedMotion
    ? Math.max(baseSpec.stiffness, 900)
    : baseSpec.stiffness;
  return {
    dampingRatio,
    stiffness: rawStiffness * clampedRate * clampedRate,
  };
}

function formatCornersBorderRadius(c: CornerTuple): string {
  return `${c[0].toFixed(1)}px ${c[1].toFixed(1)}px ${c[2].toFixed(1)}px ${c[3].toFixed(1)}px`;
}

function formatCornersDebug(c: CornerTuple): string {
  return c.map((v) => Math.round(v)).join(" ");
}

export function useM3EScalarSpringEffect(
  target: number,
  tokenKey: MotionTokenKey,
  onUpdate: (value: number) => void,
): void {
  const { motionRef, prefersReducedMotion, paused } = useM3ERuntime();
  const stateRef = React.useRef<{ value: number; velocity: number }>({
    value: target,
    velocity: 0,
  });
  const callbackRef = React.useRef(onUpdate);
  callbackRef.current = onUpdate;

  React.useEffect(() => {
    if (paused || prefersReducedMotion || typeof requestAnimationFrame !== "function") {
      stateRef.current = { value: target, velocity: 0 };
      callbackRef.current(target);
      return;
    }

    if (
      Math.abs(stateRef.current.value - target) <= 0.002 &&
      Math.abs(stateRef.current.velocity) <= 0.01
    ) {
      stateRef.current = { value: target, velocity: 0 };
      callbackRef.current(target);
      return;
    }

    const params = resolveEffectiveSpringParams(
      motionRef.current.motionScheme[tokenKey],
      motionRef.current.playbackRate,
      prefersReducedMotion,
    );

    return subscribeSpringFrame((dtSec) => {
      const next = stepSpringSimulation(
        stateRef.current.value,
        stateRef.current.velocity,
        target,
        dtSec,
        {
          dampingRatio: params.dampingRatio,
          stiffness: params.stiffness,
          restDisplacementThreshold: 0.002,
          restVelocityThreshold: 0.01,
        },
      );
      stateRef.current = { value: next.value, velocity: next.velocity };
      callbackRef.current(next.value);
      return !next.settled;
    });
  }, [target, tokenKey, prefersReducedMotion, paused]);
}

export function useM3EScalarSpring(
  target: number,
  tokenKey: MotionTokenKey = "fastSpatial",
): number {
  const [current, setCurrent] = React.useState<number>(target);
  useM3EScalarSpringEffect(target, tokenKey, setCurrent);
  return current;
}


export function useM3ECornerSpringRef<T extends HTMLElement = HTMLElement>(
  target: CornerTuple,
  tokenKey: MotionTokenKey = "defaultEffects",
  forwardedRef?: React.Ref<T>,
): {
  readonly ref: React.RefCallback<T>;
  readonly borderRadiusCss: string;
  readonly debugCornersAttr: string | undefined;
} {
  const {
    motionRef,
    prefersReducedMotion,
    paused,
    debugGeometry,
  } = useM3ERuntime();
  const nodeRef = React.useRef<T | null>(null);
  const currentRef = React.useRef<CornerTuple>(target);
  const velocityRef = React.useRef<[number, number, number, number]>([0, 0, 0, 0]);

  if (paused || prefersReducedMotion) {
    currentRef.current = target;
    velocityRef.current = [0, 0, 0, 0];
  }

  const debugRef = React.useRef(debugGeometry);
  debugRef.current = debugGeometry;

  const flushToDom = React.useCallback((next: CornerTuple) => {
    currentRef.current = next;
    const el = nodeRef.current;
    if (!el) return;
    el.style.borderRadius = formatCornersBorderRadius(next);
    if (debugRef.current) {
      el.dataset.corners = formatCornersDebug(next);
    } else if (el.dataset.corners !== undefined) {
      delete el.dataset.corners;
    }
  }, []);

  const [t0, t1, t2, t3] = target;

  React.useEffect(() => {
    if (paused || prefersReducedMotion || typeof requestAnimationFrame !== "function") {
      velocityRef.current = [0, 0, 0, 0];
      flushToDom([t0, t1, t2, t3]);
      return;
    }

    const cur = currentRef.current;
    const vel = velocityRef.current;
    const alreadySettled =
      Math.abs(cur[0] - t0) <= 0.05 &&
      Math.abs(cur[1] - t1) <= 0.05 &&
      Math.abs(cur[2] - t2) <= 0.05 &&
      Math.abs(cur[3] - t3) <= 0.05 &&
      Math.abs(vel[0]) <= 0.1 &&
      Math.abs(vel[1]) <= 0.1 &&
      Math.abs(vel[2]) <= 0.1 &&
      Math.abs(vel[3]) <= 0.1;

    if (alreadySettled) {
      velocityRef.current = [0, 0, 0, 0];
      flushToDom([t0, t1, t2, t3]);
      return;
    }

    const params = resolveEffectiveSpringParams(
      motionRef.current.motionScheme[tokenKey],
      motionRef.current.playbackRate,
      prefersReducedMotion,
    );
    const stepOpts = {
      dampingRatio: params.dampingRatio,
      stiffness: params.stiffness,
      restDisplacementThreshold: 0.05,
      restVelocityThreshold: 0.1,
    };

    return subscribeSpringFrame((dtSec) => {
      const c = currentRef.current;
      const v = velocityRef.current;
      const s0 = stepSpringSimulation(c[0], v[0], t0, dtSec, stepOpts);
      const s1 = stepSpringSimulation(c[1], v[1], t1, dtSec, stepOpts);
      const s2 = stepSpringSimulation(c[2], v[2], t2, dtSec, stepOpts);
      const s3 = stepSpringSimulation(c[3], v[3], t3, dtSec, stepOpts);

      velocityRef.current = [s0.velocity, s1.velocity, s2.velocity, s3.velocity];
      flushToDom([
        Math.max(0, s0.value),
        Math.max(0, s1.value),
        Math.max(0, s2.value),
        Math.max(0, s3.value),
      ]);

      return !(s0.settled && s1.settled && s2.settled && s3.settled);
    });
  }, [
    t0,
    t1,
    t2,
    t3,
    tokenKey,
    prefersReducedMotion,
    paused,
    flushToDom,
  ]);

  useIsoLayoutEffect(() => {
    if (nodeRef.current) {
      nodeRef.current.style.borderRadius = formatCornersBorderRadius(
        currentRef.current,
      );
    }
  });

  const mergedRef = React.useCallback(
    (node: T | null) => {
      nodeRef.current = node;
      if (node) {
        node.style.borderRadius = formatCornersBorderRadius(currentRef.current);
      }
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );

  return {
    ref: mergedRef,
    borderRadiusCss: formatCornersBorderRadius(currentRef.current),
    debugCornersAttr: debugGeometry
      ? formatCornersDebug(currentRef.current)
      : undefined,
  };
}

export function useM3ECornerSpring(
  target: CornerTuple,
  tokenKey: MotionTokenKey = "fastSpatial",
): {
  readonly corners: CornerTuple;
  readonly borderRadiusCss: string;
} {
  const { motionRef, prefersReducedMotion, paused } = useM3ERuntime();
  const [corners, setCorners] = React.useState<CornerTuple>(target);
  const currentRef = React.useRef<CornerTuple>(target);
  const velocityRef = React.useRef<[number, number, number, number]>([0, 0, 0, 0]);

  const [t0, t1, t2, t3] = target;

  React.useEffect(() => {
    if (paused || prefersReducedMotion || typeof requestAnimationFrame !== "function") {
      currentRef.current = [t0, t1, t2, t3];
      velocityRef.current = [0, 0, 0, 0];
      setCorners([t0, t1, t2, t3]);
      return;
    }

    const cur = currentRef.current;
    const vel = velocityRef.current;
    const alreadySettled =
      Math.abs(cur[0] - t0) <= 0.05 &&
      Math.abs(cur[1] - t1) <= 0.05 &&
      Math.abs(cur[2] - t2) <= 0.05 &&
      Math.abs(cur[3] - t3) <= 0.05 &&
      Math.abs(vel[0]) <= 0.1 &&
      Math.abs(vel[1]) <= 0.1 &&
      Math.abs(vel[2]) <= 0.1 &&
      Math.abs(vel[3]) <= 0.1;

    if (alreadySettled) {
      currentRef.current = [t0, t1, t2, t3];
      velocityRef.current = [0, 0, 0, 0];
      setCorners([t0, t1, t2, t3]);
      return;
    }

    const params = resolveEffectiveSpringParams(
      motionRef.current.motionScheme[tokenKey],
      motionRef.current.playbackRate,
      prefersReducedMotion,
    );
    const stepOpts = {
      dampingRatio: params.dampingRatio,
      stiffness: params.stiffness,
      restDisplacementThreshold: 0.05,
      restVelocityThreshold: 0.1,
    };

    return subscribeSpringFrame((dtSec) => {
      const c = currentRef.current;
      const v = velocityRef.current;
      const s0 = stepSpringSimulation(c[0], v[0], t0, dtSec, stepOpts);
      const s1 = stepSpringSimulation(c[1], v[1], t1, dtSec, stepOpts);
      const s2 = stepSpringSimulation(c[2], v[2], t2, dtSec, stepOpts);
      const s3 = stepSpringSimulation(c[3], v[3], t3, dtSec, stepOpts);

      const next: CornerTuple = [
        Math.max(0, s0.value),
        Math.max(0, s1.value),
        Math.max(0, s2.value),
        Math.max(0, s3.value),
      ];
      currentRef.current = next;
      velocityRef.current = [s0.velocity, s1.velocity, s2.velocity, s3.velocity];
      setCorners(next);

      return !(s0.settled && s1.settled && s2.settled && s3.settled);
    });
  }, [t0, t1, t2, t3, tokenKey, prefersReducedMotion, paused]);

  return {
    corners,
    borderRadiusCss: formatCornersBorderRadius(corners),
  };
}

export function usePressHoldState(disabled = false, baseMinHoldMs = 95) {
  const { motionRef } = useM3ERuntime();
  const [isPressed, setIsPressed] = React.useState(false);
  const downTimeRef = React.useRef<number | null>(null);
  const releaseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelPress = React.useCallback(() => {
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    downTimeRef.current = null;
    setIsPressed(false);
  }, []);

  React.useEffect(() => {
    if (disabled) {
      cancelPress();
    }
  }, [disabled, cancelPress]);

  React.useEffect(() => {
    return () => {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (!isPressed || typeof window === "undefined") return;
    const onWindowBlur = () => cancelPress();
    window.addEventListener("blur", onWindowBlur);
    return () => window.removeEventListener("blur", onWindowBlur);
  }, [isPressed, cancelPress]);

  const beginPress = React.useCallback(() => {
    if (disabled) return;
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    downTimeRef.current =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    setIsPressed(true);
  }, [disabled]);

  const endPress = React.useCallback(() => {
    if (downTimeRef.current === null) {
      return;
    }
    const now =
      typeof performance !== "undefined" ? performance.now() : Date.now();
    const minHold = baseMinHoldMs / Math.max(0.1, motionRef.current.playbackRate);
    const elapsed = now - downTimeRef.current;
    downTimeRef.current = null;

    if (elapsed >= minHold) {
      setIsPressed(false);
    } else {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = setTimeout(() => {
        setIsPressed(false);
        releaseTimerRef.current = null;
      }, minHold - elapsed);
    }
  }, [baseMinHoldMs]);

  const pressHandlers = React.useMemo(
    () => ({
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (e.button === 0 && !(e.ctrlKey && e.pointerType === "mouse")) {
          beginPress();
        }
      },
      onPointerUp: () => endPress(),
      onPointerLeave: (e?: React.PointerEvent<HTMLElement>) => {
        if (e?.pointerType === "touch") return;
        if (downTimeRef.current !== null) {
          cancelPress();
        }
      },
      onPointerCancel: () => cancelPress(),
      onLostPointerCapture: () => {
        if (downTimeRef.current !== null) {
          cancelPress();
        }
      },
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.repeat) return;
        if (e.key === " " || e.key === "Enter") beginPress();
      },
      onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === " " || e.key === "Enter") endPress();
      },
      onBlur: () => cancelPress(),
    }),
    [beginPress, endPress, cancelPress],
  );

  return { isPressed, pressHandlers };
}
