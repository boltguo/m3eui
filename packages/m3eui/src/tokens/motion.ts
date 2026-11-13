/**
 * Material 3 Expressive — Motion Physics Tokens & Cross-Platform Converters
 *
 * Upstream Source of Truth:
 * - AOSP `androidx.compose.material3.tokens.ExpressiveMotionTokens` (v0_14_0)
 * - AOSP `androidx.compose.material3.tokens.StandardMotionTokens` (v0_14_0)
 *
 * Core Rule:
 * - `spatial` springs govern geometry (position, width/height, scale, corner radius, shape morphs).
 *   In the Expressive scheme, dampingRatio < 1 allows subtle physical overshoot.
 * - `effects` springs govern non-spatial visuals (color, opacity, elevation tint).
 *   dampingRatio MUST be 1.0 (critical damping) — zero overshoot is permitted.
 */

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
  /** Dimensionless damping ratio ζ (zeta). < 1 underdamped (bouncy), = 1 critically damped. */
  readonly dampingRatio: number;
  /** Spring stiffness k (N/m or s^-2 with unit mass). */
  readonly stiffness: number;
  /** Unit mass m = 1.0 across Compose, SwiftUI, Flutter, and Web. */
  readonly mass: 1;
}

export type MotionScheme = Record<MotionTokenKey, SpringPhysicsSpec>;

/**
 * Exact values from `ExpressiveMotionTokens.kt` (v0_14_0)
 */
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

/**
 * Exact values from `StandardMotionTokens.kt` (v0_14_0)
 */
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
  /** Viscous damping coefficient c = 2 * ζ * sqrt(k * m) */
  readonly dampingCoefficient: number;
  /** Undamped angular frequency ω0 = sqrt(k / m) (rad/s) */
  readonly angularFrequency: number;
  /** SwiftUI response = 2π / ω0 (seconds) */
  readonly swiftResponseSec: number;
  /** Peak overshoot ratio above 1.0 (0 for critically damped) */
  readonly peakOvershoot: number;
  /** Analytical settling duration (ms) to within 0.001 tolerance */
  readonly settleDurationMs: number;
  /** Web Motion (`motion/react`) transition object */
  readonly webMotion: {
    readonly type: "spring";
    readonly mass: number;
    readonly stiffness: number;
    readonly damping: number;
  };
  /** Pre-sampled CSS `linear(...)` timing function & duration for pure CSS consumers */
  readonly cssLinear: {
    readonly durationMs: number;
    readonly easing: string;
    readonly declaration: string;
  };
  /** Copy-pasteable native code snippets for all 4 target ecosystems */
  readonly code: {
    readonly compose: string;
    readonly swiftUI: string;
    readonly flutter: string;
    readonly webMotion: string;
    readonly webCss: string;
  };
}

/**
 * Evaluates normalized unit-step displacement x(t) ∈ [0 -> 1] of a damped harmonic oscillator
 * starting at x(0) = 0, v(0) = 0 moving toward target = 1.
 */
export function evaluateSpringDisplacement(
  spec: Pick<SpringPhysicsSpec, "dampingRatio" | "stiffness">,
  timeSec: number,
): number {
  if (timeSec <= 0) return 0;
  const zeta = spec.dampingRatio;
  const omega0 = Math.sqrt(spec.stiffness);

  if (zeta < 1 - 1e-6) {
    // Underdamped
    const omegaD = omega0 * Math.sqrt(1 - zeta * zeta);
    const envelope = Math.exp(-zeta * omega0 * timeSec);
    const cosTerm = Math.cos(omegaD * timeSec);
    const sinTerm = (zeta / Math.sqrt(1 - zeta * zeta)) * Math.sin(omegaD * timeSec);
    return 1 - envelope * (cosTerm + sinTerm);
  }

  if (Math.abs(zeta - 1) <= 1e-6) {
    // Critically damped (exact zero overshoot)
    return 1 - (1 + omega0 * timeSec) * Math.exp(-omega0 * timeSec);
  }

  // Overdamped
  const root = Math.sqrt(zeta * zeta - 1);
  const r1 = -omega0 * (zeta - root);
  const r2 = -omega0 * (zeta + root);
  return 1 - (r2 * Math.exp(r1 * timeSec) - r1 * Math.exp(r2 * timeSec)) / (r2 - r1);
}

/**
 * Estimates the settling time (ms) until the oscillator stays within `epsilon` of 1.0.
 */
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

/**
 * Converts an M3E `SpringPhysicsSpec` into exact parameters and code for
 * Jetpack Compose, SwiftUI, Flutter, Web `motion`, and native CSS `linear()`.
 *
 * @param spec Upstream M3E spring token
 * @param playbackRate Playback speed multiplier (`1` = real-time, `0.2` = 5x slow-motion audit).
 *   Scaling time by `1/playbackRate` scales stiffness by `playbackRate^2` while preserving
 *   the exact dampingRatio and overshoot geometry!
 */
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
    // Clamp effects strictly to [0, 1] to guarantee zero opacity/color overshoot
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
