"use client";

import * as React from "react";
import { type MotionTokenKey, stepSpringSimulation } from "../../tokens/motion.js";
import {
  type CubicTuple,
  type M3EShapeName,
  type MorphPair,
  createMorphPair,
  cubicsToSvgPath,
  getMaterialShape,
  getShapeMorphPair,
  interpolateMorphCubics,
} from "../../tokens/shapes.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { subscribeSpringFrame } from "../../hooks/useM3ESpring.js";

export interface M3EMaterialShapeViewProps {
  readonly shape: M3EShapeName;
  readonly toShape?: M3EShapeName;
  readonly morphProgress?: number;
  readonly size?: number;
  readonly scaleFactor?: number;
  readonly motionToken?: MotionTokenKey;
  readonly fill?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function MaterialShapeView({
  shape,
  toShape,
  morphProgress: manualProgress,
  size = 64,
  scaleFactor = 0.88,
  motionToken = "defaultSpatial",
  fill = "currentColor",
  "aria-label": ariaLabel,
  className,
  style,
}: M3EMaterialShapeViewProps): React.JSX.Element {
  const { motionRef, prefersReducedMotion, paused } = useM3ERuntime();
  const pathRef = React.useRef<SVGPathElement | null>(null);
  const currentCubicsRef = React.useRef<readonly CubicTuple[]>(
    getMaterialShape(shape).cubics,
  );
  const animStateRef = React.useRef<{
    pair: MorphPair;
    target: M3EShapeName;
    progress: number;
    velocity: number;
  }>({
    pair: getShapeMorphPair(shape, shape),
    target: shape,
    progress: 1,
    velocity: 0,
  });

  React.useEffect(() => {
    const drawCubics = (cubics: readonly CubicTuple[]) => {
      currentCubicsRef.current = cubics;
      if (pathRef.current) {
        pathRef.current.setAttribute(
          "d",
          cubicsToSvgPath(cubics, size, scaleFactor),
        );
      }
    };

    if (toShape !== undefined && manualProgress !== undefined) {
      const pair = getShapeMorphPair(shape, toShape);
      const cubics = interpolateMorphCubics(pair, manualProgress);
      animStateRef.current = {
        pair,
        target: toShape,
        progress: manualProgress,
        velocity: 0,
      };
      drawCubics(cubics);
      return;
    }

    const st = animStateRef.current;
    if (st.target !== shape) {
      const wasSettled =
        Math.abs(st.progress - 1) <= 0.02 && Math.abs(st.velocity) <= 0.08;

      if (
        !wasSettled &&
        shape === st.pair.from &&
        st.pair.from !== st.pair.to
      ) {
        animStateRef.current = {
          pair: {
            from: st.pair.to,
            to: st.pair.from,
            startCubics: st.pair.endCubics,
            endCubics: st.pair.startCubics,
          },
          target: shape,
          progress: Math.max(0, Math.min(1, 1 - st.progress)),
          velocity: -st.velocity,
        };
      } else {
        const current = currentCubicsRef.current;
        const pair = wasSettled
          ? getShapeMorphPair(st.target, shape)
          : createMorphPair(
              {
                ...getMaterialShape(st.target),
                cubics: current,
                features: current.map((c) => ({ type: "edge", cubics: [c] })),
              },
              getMaterialShape(shape),
            );
        animStateRef.current = {
          pair,
          target: shape,
          progress: 0,
          velocity: 0,
        };
      }
    }

    const active = animStateRef.current;
    if (paused || typeof requestAnimationFrame !== "function") {
      const settledPair = getShapeMorphPair(shape, shape);
      animStateRef.current = {
        pair: settledPair,
        target: shape,
        progress: 1,
        velocity: 0,
      };
      drawCubics(getMaterialShape(shape).cubics);
      return;
    }

    if (
      Math.abs(active.progress - 1) <= 0.002 &&
      Math.abs(active.velocity) <= 0.01
    ) {
      animStateRef.current = {
        ...active,
        progress: 1,
        velocity: 0,
      };
      drawCubics(getMaterialShape(shape).cubics);
      return;
    }

    drawCubics(interpolateMorphCubics(active.pair, active.progress));

    const baseSpec = motionRef.current.motionScheme[motionToken];
    const clampedRate = Math.max(0.05, Math.min(2, motionRef.current.playbackRate));
    const dampingRatio = prefersReducedMotion ? 1.0 : baseSpec.dampingRatio;
    const rawStiffness = prefersReducedMotion
      ? Math.max(baseSpec.stiffness, 900)
      : baseSpec.stiffness;
    const stiffness = rawStiffness * clampedRate * clampedRate;

    return subscribeSpringFrame((dtSec) => {
      const cur = animStateRef.current;
      const next = stepSpringSimulation(cur.progress, cur.velocity, 1, dtSec, {
        dampingRatio,
        stiffness,
        restDisplacementThreshold: 0.002,
        restVelocityThreshold: 0.01,
      });
      animStateRef.current = {
        ...cur,
        progress: next.value,
        velocity: next.velocity,
      };
      drawCubics(
        next.settled
          ? getMaterialShape(cur.target).cubics
          : interpolateMorphCubics(cur.pair, next.value),
      );
      return !next.settled;
    });
  }, [
    shape,
    toShape,
    manualProgress,
    size,
    scaleFactor,
    motionToken,
    prefersReducedMotion,
    paused,
  ]);

  const isManual = toShape !== undefined && manualProgress !== undefined;
  const initialCubics = isManual
    ? interpolateMorphCubics(getShapeMorphPair(shape, toShape), manualProgress)
    : currentCubicsRef.current;
  const d = cubicsToSvgPath(initialCubics, size, scaleFactor);

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
      className={
        className ? `m3e-material-shape ${className}` : "m3e-material-shape"
      }
      style={style}
    >
      <path ref={pathRef} d={d} fill={fill} />
    </svg>
  );
}
