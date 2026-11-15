import {
  type M3EShapeName,
  type MorphPair,
  createMorphPair,
  getMaterialShape,
  rotateNormalizedShape,
} from "./shapes.js";

export const LOADING_INDICATOR_SHAPE_SEQUENCE: readonly M3EShapeName[] = [
  "softBurst",
  "cookie9Sided",
  "pentagon",
  "pill",
  "sunny",
  "cookie4Sided",
  "oval",
] as const;

export const LOADING_INDICATOR_DETERMINATE_SHAPE_SEQUENCE: readonly M3EShapeName[] = [
  "circle",
  "softBurst",
] as const;

export function calculateIndicatorScaleFactor(
  shapeNames: readonly M3EShapeName[] = LOADING_INDICATOR_SHAPE_SEQUENCE,
): number {
  let scaleFactor = 1;
  for (const name of shapeNames) {
    const shape = getMaterialShape(name);
    const boundsWidth = shape.bounds[2] - shape.bounds[0];
    const boundsHeight = shape.bounds[3] - shape.bounds[1];
    const maxDiameter = Math.max(1e-6, shape.maxRadialDistance * 2);
    const scaleX = boundsWidth / maxDiameter;
    const scaleY = boundsHeight / maxDiameter;
    scaleFactor = Math.min(scaleFactor, Math.max(scaleX, scaleY));
  }
  return scaleFactor;
}

export const LOADING_INDICATOR_MORPH_SEQUENCE: readonly MorphPair[] =
  /* @__PURE__ */ (() =>
    LOADING_INDICATOR_SHAPE_SEQUENCE.map((fromName, idx, arr) => {
      const toName = arr[(idx + 1) % arr.length]!;
      return createMorphPair(getMaterialShape(fromName), getMaterialShape(toName));
    }))();

export const LOADING_INDICATOR_DETERMINATE_MORPH_SEQUENCE: readonly MorphPair[] =
  /* @__PURE__ */ (() => [
    createMorphPair(
      rotateNormalizedShape(getMaterialShape("circle"), 360 / 20),
      getMaterialShape("softBurst"),
    ),
  ])();

export const LOADING_INDICATOR_TOKENS = /* @__PURE__ */ (() => ({
  containerSize: 48,
  activeIndicatorSize: 38,
  activeIndicatorScale: 38 / 48,
  effectiveScaleFactor:
    calculateIndicatorScaleFactor(LOADING_INDICATOR_SHAPE_SEQUENCE) * (38 / 48),
  determinateEffectiveScaleFactor:
    calculateIndicatorScaleFactor(LOADING_INDICATOR_DETERMINATE_SHAPE_SEQUENCE) *
    (38 / 48),
  morphIntervalMs: 650,
  globalRotationDurationMs: 4666,
  quarterRotationDeg: 90,
  morphSpring: {
    dampingRatio: 0.6,
    stiffness: 200,
    visibilityThreshold: 0.1,
  },
}))();
