import * as React from "react";
import { animate, useMotionValue } from "motion/react";
import {
  type M3EShapeName,
  type MotionTokenKey,
  cubicsToSvgPath,
  getShapeMorphPair,
  interpolateMorphCubics,
  resolveCrossPlatformSpring,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";

export interface M3EMaterialShapeViewProps {
  /** Current shape (changing this prop smoothly spring-morphs from the previous shape!) */
  readonly shape: M3EShapeName;
  /** Optional explicit target shape when driving morph manually via `morphProgress` */
  readonly toShape?: M3EShapeName;
  /** Optional manual scrubber `[0..1]` when `toShape` is provided */
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
  const [transitionPair, setTransitionPair] = React.useState<{
    from: M3EShapeName;
    to: M3EShapeName;
  }>({ from: shape, to: shape });

  const mv = useMotionValue(1);
  const [animProgress, setAnimProgress] = React.useState(1);

  React.useEffect(() => {
    const unsub = mv.on("change", (v) => setAnimProgress(v));
    return unsub;
  }, [mv]);

  const prevShapeRef = React.useRef<M3EShapeName>(shape);

  React.useEffect(() => {
    if (toShape !== undefined && manualProgress !== undefined) {
      prevShapeRef.current = shape;
      return;
    }
    const prev = prevShapeRef.current;
    if (prev === shape) return;
    prevShapeRef.current = shape;
    setTransitionPair({ from: prev, to: shape });

    if (paused) {
      mv.jump(1);
      setAnimProgress(1);
      return;
    }

    mv.jump(0);
    setAnimProgress(0);
    const baseSpec = motionScheme[motionToken];
    const effectiveSpec = prefersReducedMotion
      ? {
          ...baseSpec,
          dampingRatio: 1.0,
          stiffness: Math.max(baseSpec.stiffness, 900),
        }
      : baseSpec;
    const resolved = resolveCrossPlatformSpring(effectiveSpec, playbackRate);

    const controls = animate(mv, 1, {
      type: "spring",
      mass: resolved.webMotion.mass,
      stiffness: resolved.webMotion.stiffness,
      damping: resolved.webMotion.damping,
      restDelta: 0.002,
      restSpeed: 0.01,
    });

    return () => controls.stop();
  }, [
    shape,
    toShape,
    manualProgress,
    motionScheme,
    motionToken,
    playbackRate,
    prefersReducedMotion,
    paused,
    mv,
  ]);

  const activeFrom =
    toShape !== undefined && manualProgress !== undefined
      ? shape
      : transitionPair.from;
  const activeTo =
    toShape !== undefined && manualProgress !== undefined
      ? toShape
      : transitionPair.to;
  const activeProgress =
    toShape !== undefined && manualProgress !== undefined
      ? manualProgress
      : animProgress;

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
      <path d={d} fill={fill} />
    </svg>
  );
}
