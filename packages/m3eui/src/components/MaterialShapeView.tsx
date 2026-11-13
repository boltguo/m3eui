import * as React from "react";
import {
  type M3EShapeName,
  type MotionTokenKey,
  cubicsToSvgPath,
  getShapeMorphPair,
  interpolateMorphCubics,
  stepSpringSimulation,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import { subscribeSpringFrame } from "../hooks/useM3ESpring.js";

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
  const { motionScheme, playbackRate, prefersReducedMotion, paused } = useM3E();
  const pathRef = React.useRef<SVGPathElement | null>(null);
  const prevShapeRef = React.useRef<M3EShapeName>(shape);
  const animStateRef = React.useRef<{
    from: M3EShapeName;
    to: M3EShapeName;
    progress: number;
    velocity: number;
  }>({
    from: shape,
    to: shape,
    progress: 1,
    velocity: 0,
  });

  React.useEffect(() => {
    if (toShape !== undefined && manualProgress !== undefined) {
      prevShapeRef.current = shape;
      animStateRef.current = {
        from: shape,
        to: toShape,
        progress: manualProgress,
        velocity: 0,
      };
      return;
    }

    const prev = prevShapeRef.current;
    if (prev === shape) return;
    prevShapeRef.current = shape;

    if (paused || typeof requestAnimationFrame !== "function") {
      animStateRef.current = {
        from: shape,
        to: shape,
        progress: 1,
        velocity: 0,
      };
      if (pathRef.current) {
        const pair = getShapeMorphPair(shape, shape);
        const cubics = interpolateMorphCubics(pair, 1);
        pathRef.current.setAttribute("d", cubicsToSvgPath(cubics, size, scaleFactor));
      }
      return;
    }

    const pair = getShapeMorphPair(prev, shape);
    animStateRef.current = {
      from: prev,
      to: shape,
      progress: 0,
      velocity: 0,
    };
    if (pathRef.current) {
      const startCubics = interpolateMorphCubics(pair, 0);
      pathRef.current.setAttribute("d", cubicsToSvgPath(startCubics, size, scaleFactor));
    }

    const baseSpec = motionScheme[motionToken];
    const clampedRate = Math.max(0.05, Math.min(2, playbackRate));
    const dampingRatio = prefersReducedMotion ? 1.0 : baseSpec.dampingRatio;
    const rawStiffness = prefersReducedMotion
      ? Math.max(baseSpec.stiffness, 900)
      : baseSpec.stiffness;
    const stiffness = rawStiffness * clampedRate * clampedRate;

    return subscribeSpringFrame((dtSec) => {
      const st = animStateRef.current;
      const next = stepSpringSimulation(st.progress, st.velocity, 1, dtSec, {
        dampingRatio,
        stiffness,
        restDisplacementThreshold: 0.002,
        restVelocityThreshold: 0.01,
      });
      animStateRef.current = {
        from: prev,
        to: shape,
        progress: next.value,
        velocity: next.velocity,
      };
      if (pathRef.current) {
        const cubics = interpolateMorphCubics(pair, next.value);
        pathRef.current.setAttribute("d", cubicsToSvgPath(cubics, size, scaleFactor));
      }
      return !next.settled;
    });
  }, [
    shape,
    toShape,
    manualProgress,
    size,
    scaleFactor,
    motionScheme,
    motionToken,
    playbackRate,
    prefersReducedMotion,
    paused,
  ]);

  const isManual = toShape !== undefined && manualProgress !== undefined;
  const activeFrom = isManual ? shape : animStateRef.current.from;
  const activeTo = isManual ? toShape : shape;
  const activeProgress = isManual ? manualProgress : animStateRef.current.progress;

  const pair = getShapeMorphPair(activeFrom, activeTo);
  const cubics = interpolateMorphCubics(pair, activeProgress);
  const d = cubicsToSvgPath(cubics, size, scaleFactor);

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
