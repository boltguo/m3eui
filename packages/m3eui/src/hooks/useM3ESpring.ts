import * as React from "react";
import { animate, useMotionValue } from "motion/react";
import {
  type CornerTuple,
  type MotionTokenKey,
  resolveCrossPlatformSpring,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";

/**
 * Animates a single scalar with exact M3E harmonic spring physics & mid-flight velocity preservation.
 */
export function useM3EScalarSpring(
  target: number,
  tokenKey: MotionTokenKey = "fastSpatial",
): number {
  const { motionScheme, playbackRate, prefersReducedMotion, paused } = useM3E();
  const mv = useMotionValue(target);
  const [current, setCurrent] = React.useState<number>(target);

  React.useEffect(() => {
    const unsubscribe = mv.on("change", (v) => {
      setCurrent(v);
    });
    return unsubscribe;
  }, [mv]);

  React.useEffect(() => {
    if (paused) {
      mv.jump(target);
      setCurrent(target);
      return;
    }
    const baseSpec = motionScheme[tokenKey];
    // Under prefers-reduced-motion, dampen bounce to critical damping (1.0) rather than zeroing all motion
    const effectiveSpec = prefersReducedMotion
      ? { ...baseSpec, dampingRatio: 1.0, stiffness: Math.max(baseSpec.stiffness, 900) }
      : baseSpec;
    const resolved = resolveCrossPlatformSpring(effectiveSpec, playbackRate);

    const controls = animate(mv, target, {
      type: "spring",
      mass: resolved.webMotion.mass,
      stiffness: resolved.webMotion.stiffness,
      damping: resolved.webMotion.damping,
      restDelta: 0.002,
      restSpeed: 0.01,
    });

    return () => controls.stop();
  }, [target, tokenKey, motionScheme, playbackRate, prefersReducedMotion, paused, mv]);

  return current;
}

/**
 * Animates `[topLeft, topRight, bottomRight, bottomLeft]` corner radii simultaneously
 * with velocity-preserving M3E spatial spring physics.
 */
export function useM3ECornerSpring(
  target: CornerTuple,
  tokenKey: MotionTokenKey = "fastSpatial",
): {
  readonly corners: CornerTuple;
  readonly borderRadiusCss: string;
} {
  const { motionScheme, playbackRate, prefersReducedMotion, paused } = useM3E();
  const mv0 = useMotionValue(target[0]);
  const mv1 = useMotionValue(target[1]);
  const mv2 = useMotionValue(target[2]);
  const mv3 = useMotionValue(target[3]);

  const [corners, setCorners] = React.useState<CornerTuple>(target);

  React.useEffect(() => {
    const sync = () => {
      setCorners([
        Math.max(0, mv0.get()),
        Math.max(0, mv1.get()),
        Math.max(0, mv2.get()),
        Math.max(0, mv3.get()),
      ]);
    };
    const u0 = mv0.on("change", sync);
    const u1 = mv1.on("change", sync);
    const u2 = mv2.on("change", sync);
    const u3 = mv3.on("change", sync);
    return () => {
      u0();
      u1();
      u2();
      u3();
    };
  }, [mv0, mv1, mv2, mv3]);

  const [t0, t1, t2, t3] = target;

  React.useEffect(() => {
    if (paused) {
      mv0.jump(t0);
      mv1.jump(t1);
      mv2.jump(t2);
      mv3.jump(t3);
      setCorners([t0, t1, t2, t3]);
      return;
    }

    const baseSpec = motionScheme[tokenKey];
    const effectiveSpec = prefersReducedMotion
      ? { ...baseSpec, dampingRatio: 1.0, stiffness: Math.max(baseSpec.stiffness, 900) }
      : baseSpec;
    const resolved = resolveCrossPlatformSpring(effectiveSpec, playbackRate);
    const springOpts = {
      type: "spring" as const,
      mass: resolved.webMotion.mass,
      stiffness: resolved.webMotion.stiffness,
      damping: resolved.webMotion.damping,
      restDelta: 0.05,
      restSpeed: 0.1,
    };

    const c0 = animate(mv0, t0, springOpts);
    const c1 = animate(mv1, t1, springOpts);
    const c2 = animate(mv2, t2, springOpts);
    const c3 = animate(mv3, t3, springOpts);

    return () => {
      c0.stop();
      c1.stop();
      c2.stop();
      c3.stop();
    };
  }, [t0, t1, t2, t3, tokenKey, motionScheme, playbackRate, prefersReducedMotion, paused, mv0, mv1, mv2, mv3]);

  const borderRadiusCss = `${corners[0].toFixed(1)}px ${corners[1].toFixed(1)}px ${corners[2].toFixed(1)}px ${corners[3].toFixed(1)}px`;

  return { corners, borderRadiusCss };
}

/**
 * Tracks interactive press state with AOSP's minimum quick-tap hold visibility (~90ms)
 * so fast clicks still visibly exhibit M3E corner morphing and neighbor width squish.
 */
export function usePressHoldState(disabled = false, baseMinHoldMs = 95) {
  const { playbackRate } = useM3E();
  const [isPressed, setIsPressed] = React.useState(false);
  const downTimeRef = React.useRef<number>(0);
  const releaseTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  React.useEffect(() => {
    return () => {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
    };
  }, []);

  const beginPress = React.useCallback(() => {
    if (disabled) return;
    if (releaseTimerRef.current) {
      clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = null;
    }
    downTimeRef.current = performance.now();
    setIsPressed(true);
  }, [disabled]);

  const endPress = React.useCallback(() => {
    if (!downTimeRef.current) {
      setIsPressed(false);
      return;
    }
    const minHold = baseMinHoldMs / Math.max(0.1, playbackRate);
    const elapsed = performance.now() - downTimeRef.current;
    downTimeRef.current = 0;

    if (elapsed >= minHold) {
      setIsPressed(false);
    } else {
      if (releaseTimerRef.current) clearTimeout(releaseTimerRef.current);
      releaseTimerRef.current = setTimeout(() => {
        setIsPressed(false);
        releaseTimerRef.current = null;
      }, minHold - elapsed);
    }
  }, [baseMinHoldMs, playbackRate]);

  const pressHandlers = React.useMemo(
    () => ({
      onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
        if (e.button === 0) beginPress();
      },
      onPointerUp: () => endPress(),
      onPointerLeave: () => endPress(),
      onPointerCancel: () => endPress(),
      onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === " " || e.key === "Enter") beginPress();
      },
      onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
        if (e.key === " " || e.key === "Enter") endPress();
      },
      onBlur: () => endPress(),
    }),
    [beginPress, endPress],
  );

  return { isPressed, pressHandlers };
}
