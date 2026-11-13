export type MotionSchemeName = "expressive" | "standard";
export type MotionSpeed = "fast" | "default" | "slow";
export type MotionDomain = "spatial" | "effects";
export type MotionTokenKey =
  | "fastSpatial"
  | "defaultSpatial"
  | "slowSpatial"
  | "fastEffects"
  | "defaultEffects"
  | "slowEffects";

export interface SpringPhysicsSpec {
  readonly key: MotionTokenKey;
  readonly domain: MotionDomain;
  readonly speed: MotionSpeed;
  readonly dampingRatio: number;
  readonly stiffness: number;
  readonly mass: 1;
}

export type MotionScheme = Record<MotionTokenKey, SpringPhysicsSpec>;

export const EXPRESSIVE_MOTION_SCHEME: MotionScheme = {
  fastSpatial: {
    key: "fastSpatial",
    domain: "spatial",
    speed: "fast",
    dampingRatio: 0.6,
    stiffness: 800,
    mass: 1,
  },
  defaultSpatial: {
    key: "defaultSpatial",
    domain: "spatial",
    speed: "default",
    dampingRatio: 0.8,
    stiffness: 380,
    mass: 1,
  },
  slowSpatial: {
    key: "slowSpatial",
    domain: "spatial",
    speed: "slow",
    dampingRatio: 0.8,
    stiffness: 200,
    mass: 1,
  },
  fastEffects: {
    key: "fastEffects",
    domain: "effects",
    speed: "fast",
    dampingRatio: 1.0,
    stiffness: 3800,
    mass: 1,
  },
  defaultEffects: {
    key: "defaultEffects",
    domain: "effects",
    speed: "default",
    dampingRatio: 1.0,
    stiffness: 1600,
    mass: 1,
  },
  slowEffects: {
    key: "slowEffects",
    domain: "effects",
    speed: "slow",
    dampingRatio: 1.0,
    stiffness: 800,
    mass: 1,
  },
};

export const STANDARD_MOTION_SCHEME: MotionScheme = {
  fastSpatial: {
    key: "fastSpatial",
    domain: "spatial",
    speed: "fast",
    dampingRatio: 0.9,
    stiffness: 1400,
    mass: 1,
  },
  defaultSpatial: {
    key: "defaultSpatial",
    domain: "spatial",
    speed: "default",
    dampingRatio: 0.9,
    stiffness: 700,
    mass: 1,
  },
  slowSpatial: {
    key: "slowSpatial",
    domain: "spatial",
    speed: "slow",
    dampingRatio: 0.9,
    stiffness: 300,
    mass: 1,
  },
  fastEffects: {
    key: "fastEffects",
    domain: "effects",
    speed: "fast",
    dampingRatio: 1.0,
    stiffness: 3800,
    mass: 1,
  },
  defaultEffects: {
    key: "defaultEffects",
    domain: "effects",
    speed: "default",
    dampingRatio: 1.0,
    stiffness: 1600,
    mass: 1,
  },
  slowEffects: {
    key: "slowEffects",
    domain: "effects",
    speed: "slow",
    dampingRatio: 1.0,
    stiffness: 800,
    mass: 1,
  },
};

export const MOTION_SCHEMES: Record<MotionSchemeName, MotionScheme> = {
  expressive: EXPRESSIVE_MOTION_SCHEME,
  standard: STANDARD_MOTION_SCHEME,
};

export interface CrossPlatformSpringTarget {
  readonly dampingRatio: number;
  readonly stiffness: number;
  readonly mass: number;
  readonly dampingCoefficient: number;
  readonly angularFrequency: number;
  readonly swiftResponseSec: number;
  readonly peakOvershoot: number;
  readonly settleDurationMs: number;
  readonly webMotion: {
    readonly type: "spring";
    readonly mass: number;
    readonly stiffness: number;
    readonly damping: number;
  };
  readonly cssLinear: {
    readonly durationMs: number;
    readonly easing: string;
    readonly declaration: string;
  };
  readonly code: {
    readonly compose: string;
    readonly swiftUI: string;
    readonly flutter: string;
    readonly webMotion: string;
    readonly webCss: string;
  };
}

export interface SpringSimulationState {
  readonly value: number;
  readonly velocity: number;
  readonly settled: boolean;
}

export interface SpringSimulationOptions {
  readonly dampingRatio: number;
  readonly stiffness: number;
  readonly restDisplacementThreshold?: number;
  readonly restVelocityThreshold?: number;
}

/**
 * Exact analytical solution to the second-order damped harmonic oscillator
 * matching AOSP `androidx.compose.animation.core.SpringSimulation` (`SpringForce.kt`),
 * preserving arbitrary initial displacement and velocity across mid-flight retargeting.
 */
export function stepSpringSimulation(
  currentValue: number,
  currentVelocity: number,
  targetValue: number,
  dtSec: number,
  options: SpringSimulationOptions,
): SpringSimulationState {
  const valueThreshold = options.restDisplacementThreshold ?? 0.002;
  const velocityThreshold = options.restVelocityThreshold ?? 0.01;

  if (dtSec <= 0 || !Number.isFinite(dtSec)) {
    const settled =
      Math.abs(currentValue - targetValue) <= valueThreshold &&
      Math.abs(currentVelocity) <= velocityThreshold;
    return settled
      ? { value: targetValue, velocity: 0, settled: true }
      : { value: currentValue, velocity: currentVelocity, settled: false };
  }

  // Clamp frame delta to 64ms so backgrounded tabs never cause numerical jumps
  const dt = Math.min(dtSec, 0.064);
  const zeta = Math.max(0, options.dampingRatio);
  const omega0 = Math.sqrt(Math.max(1e-4, options.stiffness));
  const dx = currentValue - targetValue;
  const v0 = currentVelocity;

  let nextDisplacement: number;
  let nextVelocity: number;

  if (zeta > 1 + 1e-6) {
    // Over-damped (zeta > 1)
    const gamma = Math.sqrt(zeta * zeta - 1);
    const r1 = -omega0 * (zeta - gamma);
    const r2 = -omega0 * (zeta + gamma);
    const c1 = (v0 - r2 * dx) / (r1 - r2);
    const c2 = dx - c1;
    const e1 = Math.exp(r1 * dt);
    const e2 = Math.exp(r2 * dt);
    nextDisplacement = c1 * e1 + c2 * e2;
    nextVelocity = c1 * r1 * e1 + c2 * r2 * e2;
  } else if (Math.abs(zeta - 1) <= 1e-6) {
    // Critically damped (zeta == 1)
    const c1 = dx;
    const c2 = v0 + omega0 * dx;
    const expTerm = Math.exp(-omega0 * dt);
    nextDisplacement = (c1 + c2 * dt) * expTerm;
    nextVelocity = (c2 - omega0 * (c1 + c2 * dt)) * expTerm;
  } else {
    // Under-damped (0 <= zeta < 1)
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const c1 = dx;
    const c2 = (v0 + zeta * omega0 * dx) / omegaD;
    const expTerm = Math.exp(-zeta * omega0 * dt);
    const cosTerm = Math.cos(omegaD * dt);
    const sinTerm = Math.sin(omegaD * dt);
    nextDisplacement = expTerm * (c1 * cosTerm + c2 * sinTerm);
    nextVelocity =
      -zeta * omega0 * nextDisplacement +
      expTerm * omegaD * (-c1 * sinTerm + c2 * cosTerm);
  }

  const nextValue = targetValue + nextDisplacement;
  if (
    Math.abs(nextDisplacement) <= valueThreshold &&
    Math.abs(nextVelocity) <= velocityThreshold
  ) {
    return { value: targetValue, velocity: 0, settled: true };
  }

  return {
    value: nextValue,
    velocity: nextVelocity,
    settled: false,
  };
}

export function evaluateSpringDisplacement(
  spec: Pick<SpringPhysicsSpec, "dampingRatio" | "stiffness">,
  timeSec: number,
): number {
  if (timeSec <= 0) return 0;
  const zeta = spec.dampingRatio;
  const omega0 = Math.sqrt(spec.stiffness);

  if (zeta < 1 - 1e-6) {
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * omega0 * timeSec);
    const cosTerm = Math.cos(omegaD * timeSec);
    const sinTerm = (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * timeSec);
    return 1 - envelope * (cosTerm + sinTerm);
  }

  if (Math.abs(zeta - 1) <= 1e-6) {
    return 1 - (1 + omega0 * timeSec) * Math.exp(-omega0 * timeSec);
  }

  const root = Math.sqrt(zeta * zeta - 1);
  const r1 = -omega0 * (zeta - root);
  const r2 = -omega0 * (zeta + root);
  return 1 - (r2 * Math.exp(r1 * timeSec) - r1 * Math.exp(r2 * timeSec)) / (r2 - r1);
}

export function estimateSpringSettleMs(
  spec: Pick<SpringPhysicsSpec, "dampingRatio" | "stiffness">,
  epsilon = 0.001,
): number {
  const maxMs = 4000;
  const stepMs = 2;
  let lastOutsideMs = 0;
  for (let ms = 0; ms <= maxMs; ms += stepMs) {
    const x = evaluateSpringDisplacement(spec, ms / 1000);
    if (Math.abs(1 - x) > epsilon) {
      lastOutsideMs = ms;
    }
  }
  return Math.max(80, Math.ceil((lastOutsideMs + stepMs) / 10) * 10);
}

export function resolveCrossPlatformSpring(
  spec: SpringPhysicsSpec,
  playbackRate = 1,
): CrossPlatformSpringTarget {
  const clampedRate = Math.max(0.05, Math.min(2, playbackRate));
  const effectiveStiffness = spec.stiffness * clampedRate * clampedRate;
  const mass = 1;
  const dampingCoefficient = 2 * spec.dampingRatio * Math.sqrt(effectiveStiffness * mass);
  const angularFrequency = Math.sqrt(effectiveStiffness / mass);
  const swiftResponseSec = (2 * Math.PI) / angularFrequency;

  const peakOvershoot =
    spec.dampingRatio < 1
      ? Math.exp((-Math.PI * spec.dampingRatio) / Math.sqrt(1 - spec.dampingRatio ** 2))
      : 0;

  const settleDurationMs = Math.round(estimateSpringSettleMs(spec) / clampedRate);

  const stopsCount = 32;
  const stops: string[] = [];
  for (let i = 0; i <= stopsCount; i++) {
    const ratio = i / stopsCount;
    const tSec = (ratio * settleDurationMs) / 1000;
    const rawValue =
      i === 0
        ? 0
        : i === stopsCount
          ? 1
          : evaluateSpringDisplacement(
              { dampingRatio: spec.dampingRatio, stiffness: effectiveStiffness },
              tSec,
            );
    const value =
      spec.domain === "effects" ? Math.min(1, Math.max(0, rawValue)) : rawValue;
    const rounded = Number(value.toFixed(4));
    if (i === 0 || i === stopsCount) {
      stops.push(`${rounded}`);
    } else {
      stops.push(`${rounded} ${Number((ratio * 100).toFixed(1))}%`);
    }
  }

  const easing = `linear(${stops.join(", ")})`;
  const cRounded = Number((2 * spec.dampingRatio * Math.sqrt(spec.stiffness)).toFixed(2));

  return {
    dampingRatio: spec.dampingRatio,
    stiffness: effectiveStiffness,
    mass,
    dampingCoefficient,
    angularFrequency,
    swiftResponseSec: Number(swiftResponseSec.toFixed(4)),
    peakOvershoot: Number(peakOvershoot.toFixed(4)),
    settleDurationMs,
    webMotion: {
      type: "spring",
      mass,
      stiffness: Number(effectiveStiffness.toFixed(2)),
      damping: Number(dampingCoefficient.toFixed(2)),
    },
    cssLinear: {
      durationMs: settleDurationMs,
      easing,
      declaration: `${settleDurationMs}ms ${easing}`,
    },
    code: {
      compose: `spring(dampingRatio = ${spec.dampingRatio}f, stiffness = ${spec.stiffness}.0f)`,
      swiftUI: `Spring(mass: 1.0, stiffness: ${spec.stiffness}, damping: ${cRounded})`,
      flutter: `SpringDescription.withDampingRatio(mass: 1.0, stiffness: ${spec.stiffness}, ratio: ${spec.dampingRatio})`,
      webMotion: `{ type: "spring", mass: 1, stiffness: ${spec.stiffness}, damping: ${cRounded} }`,
      webCss: `transition-duration: ${estimateSpringSettleMs(spec)}ms;\ntransition-timing-function: ${easing};`,
    },
  };
}
