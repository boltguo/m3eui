export const WAVY_PROGRESS_TOKENS = {
  defaultWidth: 240,
  containerHeight: 10,
  strokeWidth: 4,
  maxAmplitudePx: 3,
  determinateWavelength: 40,
  indeterminateWavelength: 20,
  defaultWaveSpeedPerSec: 1,
  trackActiveGap: 4,
  stopIndicatorSize: 4,
  amplitudeTransitionMs: 500,
  indeterminateCycleMs: 1800,
  firstLineHeadDelayMs: 0,
  firstLineHeadDurationMs: 750,
  firstLineTailDelayMs: 333,
  firstLineTailDurationMs: 850,
  secondLineHeadDelayMs: 1000,
  secondLineHeadDurationMs: 567,
  secondLineTailDelayMs: 1267,
  secondLineTailDurationMs: 533,
} as const;

export function resolveDeterminateWaveAmplitude(progress: number): number {
  if (!Number.isFinite(progress)) return 1;
  if (progress <= 0.1 || progress >= 0.95) {
    return 0;
  }
  return 1;
}

function evalCubicBezierEasing(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x: number,
): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  const sampleX = (t: number) => {
    const u = 1 - t;
    return 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t;
  };
  const sampleDX = (t: number) => {
    const u = 1 - t;
    return 3 * u * u * x1 + 6 * u * t * (x2 - x1) + 3 * t * t * (1 - x2);
  };
  const sampleY = (t: number) => {
    const u = 1 - t;
    return 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t;
  };

  let t = x;
  for (let i = 0; i < 6; i++) {
    const err = sampleX(t) - x;
    if (Math.abs(err) < 1e-6) break;
    const dx = sampleDX(t);
    if (Math.abs(dx) < 1e-6) break;
    t = Math.max(0, Math.min(1, t - err / dx));
  }
  return sampleY(t);
}

function segmentFractionAtPlayTime(
  playMs: number,
  delayMs: number,
  durationMs: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  if (playMs <= delayMs) return 0;
  if (playMs >= delayMs + durationMs) return 1;
  return evalCubicBezierEasing(x1, y1, x2, y2, (playMs - delayMs) / durationMs);
}

export function buildSinusoidSvgPath(params: {
  readonly xStart: number;
  readonly xEnd: number;
  readonly centerY: number;
  readonly amplitudePx: number;
  readonly wavelength: number;
  readonly phasePx: number;
}): string {
  const { xStart, xEnd, centerY, amplitudePx, wavelength, phasePx } = params;
  if (xEnd <= xStart + 0.1) {
    return "";
  }

  const fmt = (v: number) => Number(v.toFixed(2));

  if (Math.abs(amplitudePx) < 0.02 || wavelength <= 1) {
    return `M ${fmt(xStart)} ${fmt(centerY)} L ${fmt(xEnd)} ${fmt(centerY)}`;
  }

  const omega = (2 * Math.PI) / wavelength;
  const maxStep = wavelength / 4;
  const span = xEnd - xStart;
  const segments = Math.max(1, Math.ceil(span / maxStep));
  const dx = span / segments;

  const yAt = (x: number) => centerY + amplitudePx * Math.sin(omega * (x - phasePx));
  const dyAt = (x: number) => amplitudePx * omega * Math.cos(omega * (x - phasePx));

  const parts: string[] = [`M ${fmt(xStart)} ${fmt(yAt(xStart))}`];
  for (let i = 0; i < segments; i++) {
    const xa = xStart + i * dx;
    const xb = i === segments - 1 ? xEnd : xa + dx;
    const segDx = xb - xa;
    const ya = yAt(xa);
    const yb = yAt(xb);
    const dya = dyAt(xa);
    const dyb = dyAt(xb);

    const c1x = xa + segDx / 3;
    const c1y = ya + (segDx / 3) * dya;
    const c2x = xb - segDx / 3;
    const c2y = yb - (segDx / 3) * dyb;

    parts.push(
      `C ${fmt(c1x)} ${fmt(c1y)}, ${fmt(c2x)} ${fmt(c2y)}, ${fmt(xb)} ${fmt(yb)}`,
    );
  }

  return parts.join(" ");
}

export interface LinearWavyGeometryOutput {
  readonly activePaths: readonly string[];
  readonly trackPaths: readonly string[];
  readonly stopDot: { readonly cx: number; readonly cy: number; readonly r: number } | null;
}

export function buildDeterminateLinearWavyGeometry(params: {
  readonly width: number;
  readonly height?: number;
  readonly progress: number;
  readonly amplitude: number;
  readonly wavelength?: number;
  readonly phasePx?: number;
  readonly strokeWidth?: number;
  readonly trackGap?: number;
  readonly stopSize?: number;
}): LinearWavyGeometryOutput {
  const {
    width,
    height = WAVY_PROGRESS_TOKENS.containerHeight,
    progress,
    amplitude,
    wavelength = WAVY_PROGRESS_TOKENS.determinateWavelength,
    phasePx = 0,
    strokeWidth = WAVY_PROGRESS_TOKENS.strokeWidth,
    trackGap = WAVY_PROGRESS_TOKENS.trackActiveGap,
    stopSize = WAVY_PROGRESS_TOKENS.stopIndicatorSize,
  } = params;

  const clamped = Math.max(0, Math.min(1, progress));
  const halfStroke = strokeWidth / 2;
  const centerY = height / 2;
  const usableStart = halfStroke;
  const usableEnd = Math.max(usableStart, width - halfStroke);
  const usableSpan = usableEnd - usableStart;
  const maxAmp = Math.max(0, (height - strokeWidth) / 2);
  const ampPx = Math.max(0, Math.min(1, amplitude)) * maxAmp;

  const activeEnd = usableStart + usableSpan * clamped;
  const activePaths: string[] = [];

  if (clamped > 0.002) {
    const d = buildSinusoidSvgPath({
      xStart: usableStart,
      xEnd: Math.max(usableStart + 0.5, activeEnd),
      centerY,
      amplitudePx: ampPx,
      wavelength,
      phasePx,
    });
    if (d) activePaths.push(d);
  }

  const trackStart =
    clamped <= 0.002
      ? usableStart
      : activeEnd + strokeWidth + trackGap;

  const trackPaths: string[] = [];
  if (trackStart < usableEnd - 0.5) {
    trackPaths.push(
      `M ${Number(trackStart.toFixed(2))} ${Number(centerY.toFixed(2))} L ${Number(usableEnd.toFixed(2))} ${Number(centerY.toFixed(2))}`,
    );
  }

  const stopRadius = stopSize / 2;
  const showStopDot = clamped < 0.98 && stopSize > 0 && width >= 32;
  const stopDot = showStopDot
    ? {
        cx: Number((width - stopRadius).toFixed(2)),
        cy: Number(centerY.toFixed(2)),
        r: Number(stopRadius.toFixed(2)),
      }
    : null;

  return { activePaths, trackPaths, stopDot };
}

function easeInOutCubic(t: number): number {
  const x = Math.max(0, Math.min(1, t));
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

export function buildIndeterminateLinearWavyGeometry(params: {
  readonly width: number;
  readonly height?: number;
  readonly cycleFraction: number;
  readonly amplitude?: number;
  readonly wavelength?: number;
  readonly phasePx?: number;
  readonly strokeWidth?: number;
  readonly trackGap?: number;
}): LinearWavyGeometryOutput {
  const {
    width,
    height = WAVY_PROGRESS_TOKENS.containerHeight,
    cycleFraction,
    amplitude = 1,
    wavelength = WAVY_PROGRESS_TOKENS.indeterminateWavelength,
    phasePx = 0,
    strokeWidth = WAVY_PROGRESS_TOKENS.strokeWidth,
    trackGap = WAVY_PROGRESS_TOKENS.trackActiveGap,
  } = params;

  const t = ((cycleFraction % 1) + 1) % 1;
  const playMs = t * WAVY_PROGRESS_TOKENS.indeterminateCycleMs;
  const halfStroke = strokeWidth / 2;
  const centerY = height / 2;
  const usableStart = halfStroke;
  const usableEnd = Math.max(usableStart, width - halfStroke);
  const usableSpan = usableEnd - usableStart;
  const maxAmp = Math.max(0, (height - strokeWidth) / 2);
  const ampPx = Math.max(0, Math.min(1, amplitude)) * maxAmp;

  const line1Head = segmentFractionAtPlayTime(
    playMs,
    WAVY_PROGRESS_TOKENS.firstLineHeadDelayMs,
    WAVY_PROGRESS_TOKENS.firstLineHeadDurationMs,
    0.2,
    0,
    0.8,
    1,
  );
  const line1Tail = segmentFractionAtPlayTime(
    playMs,
    WAVY_PROGRESS_TOKENS.firstLineTailDelayMs,
    WAVY_PROGRESS_TOKENS.firstLineTailDurationMs,
    0.4,
    0,
    1,
    1,
  );
  const line2Head = segmentFractionAtPlayTime(
    playMs,
    WAVY_PROGRESS_TOKENS.secondLineHeadDelayMs,
    WAVY_PROGRESS_TOKENS.secondLineHeadDurationMs,
    0,
    0,
    0.65,
    1,
  );
  const line2Tail = segmentFractionAtPlayTime(
    playMs,
    WAVY_PROGRESS_TOKENS.secondLineTailDelayMs,
    WAVY_PROGRESS_TOKENS.secondLineTailDurationMs,
    0.1,
    0,
    0.45,
    1,
  );

  const rawBars: Array<[number, number]> = [
    [usableStart + usableSpan * line2Tail, usableStart + usableSpan * line2Head],
    [usableStart + usableSpan * line1Tail, usableStart + usableSpan * line1Head],
  ];

  const activeIntervals: Array<[number, number]> = [];
  const activePaths: string[] = [];

  for (const [barStart, barEnd] of rawBars) {
    if (barEnd - barStart > 1) {
      const d = buildSinusoidSvgPath({
        xStart: barStart,
        xEnd: barEnd,
        centerY,
        amplitudePx: ampPx,
        wavelength,
        phasePx,
      });
      if (d) {
        activePaths.push(d);
        activeIntervals.push([barStart, barEnd]);
      }
    }
  }

  activeIntervals.sort((a, b) => a[0] - b[0]);

  const capClearance = strokeWidth + trackGap;
  const trackPaths: string[] = [];
  const fmt = (v: number) => Number(v.toFixed(2));
  let cursor = usableStart;

  for (const [segStart, segEnd] of activeIntervals) {
    const gapEnd = segStart - capClearance;
    if (gapEnd > cursor + 1) {
      trackPaths.push(
        `M ${fmt(cursor)} ${fmt(centerY)} L ${fmt(gapEnd)} ${fmt(centerY)}`,
      );
    }
    cursor = Math.max(cursor, segEnd + capClearance);
  }

  if (usableEnd > cursor + 1) {
    trackPaths.push(
      `M ${fmt(cursor)} ${fmt(centerY)} L ${fmt(usableEnd)} ${fmt(centerY)}`,
    );
  }

  return { activePaths, trackPaths, stopDot: null };
}

export const CIRCULAR_WAVY_TOKENS = {
  size: 48,
  strokeWidth: 4,
  maxAmplitudePx: 1.6,
  targetWavelength: 15,
  defaultAngularWaveSpeedRad: 2 * Math.PI,
  trackActiveGap: 4,
  indeterminateCycleMs: 2400,
} as const;

export function resolveCircularWaveLobes(
  baseRadius: number,
  targetWavelength: number = CIRCULAR_WAVY_TOKENS.targetWavelength,
): number {
  const circumference = 2 * Math.PI * Math.max(4, baseRadius);
  return Math.max(4, Math.round(circumference / Math.max(4, targetWavelength)));
}

export function buildPolarWavyArcSvgPath(params: {
  readonly cx: number;
  readonly cy: number;
  readonly baseRadius: number;
  readonly startAngle: number;
  readonly endAngle: number;
  readonly amplitudePx: number;
  readonly lobes: number;
  readonly phaseRad?: number;
  readonly originAngle?: number;
}): string {
  const {
    cx,
    cy,
    baseRadius,
    startAngle,
    endAngle,
    amplitudePx,
    lobes,
    phaseRad = 0,
    originAngle = -Math.PI / 2,
  } = params;

  const span = endAngle - startAngle;
  if (span <= 0.015 || baseRadius <= 1) {
    return "";
  }

  const fmt = (v: number) => Number(v.toFixed(2));
  const effAmp = Math.abs(amplitudePx) < 0.015 ? 0 : amplitudePx;
  const maxStep =
    effAmp === 0
      ? Math.PI / 8
      : Math.min(Math.PI / 8, Math.PI / (2 * Math.max(4, lobes)));
  const segments = Math.max(1, Math.ceil(span / maxStep));
  const dTheta = span / segments;

  const rAt = (theta: number) =>
    effAmp === 0
      ? baseRadius
      : baseRadius + effAmp * Math.sin(lobes * (theta - originAngle) - phaseRad);
  const drAt = (theta: number) =>
    effAmp === 0
      ? 0
      : effAmp * lobes * Math.cos(lobes * (theta - originAngle) - phaseRad);

  const ptAt = (theta: number) => {
    const r = rAt(theta);
    return {
      x: cx + r * Math.cos(theta),
      y: cy + r * Math.sin(theta),
    };
  };

  const tanAt = (theta: number) => {
    const r = rAt(theta);
    const dr = drAt(theta);
    const cos = Math.cos(theta);
    const sin = Math.sin(theta);
    return {
      dx: dr * cos - r * sin,
      dy: dr * sin + r * cos,
    };
  };

  const p0 = ptAt(startAngle);
  const parts: string[] = [`M ${fmt(p0.x)} ${fmt(p0.y)}`];

  for (let i = 0; i < segments; i++) {
    const ta = startAngle + i * dTheta;
    const tb = i === segments - 1 ? endAngle : ta + dTheta;
    const h = tb - ta;
    const pa = ptAt(ta);
    const pb = ptAt(tb);
    const da = tanAt(ta);
    const db = tanAt(tb);

    const c1x = pa.x + (h / 3) * da.dx;
    const c1y = pa.y + (h / 3) * da.dy;
    const c2x = pb.x - (h / 3) * db.dx;
    const c2y = pb.y - (h / 3) * db.dy;

    parts.push(
      `C ${fmt(c1x)} ${fmt(c1y)}, ${fmt(c2x)} ${fmt(c2y)}, ${fmt(pb.x)} ${fmt(pb.y)}`,
    );
  }

  return parts.join(" ");
}

export interface CircularWavyGeometryOutput {
  readonly activePath: string;
  readonly trackPath: string;
  readonly baseRadius: number;
  readonly lobes: number;
}

export function buildDeterminateCircularWavyGeometry(params: {
  readonly size?: number;
  readonly progress: number;
  readonly amplitude: number;
  readonly phaseRad?: number;
  readonly strokeWidth?: number;
  readonly maxAmplitudePx?: number;
  readonly targetWavelength?: number;
  readonly trackGap?: number;
}): CircularWavyGeometryOutput {
  const {
    size = CIRCULAR_WAVY_TOKENS.size,
    progress,
    amplitude,
    phaseRad = 0,
    strokeWidth = CIRCULAR_WAVY_TOKENS.strokeWidth,
    maxAmplitudePx = CIRCULAR_WAVY_TOKENS.maxAmplitudePx,
    targetWavelength = CIRCULAR_WAVY_TOKENS.targetWavelength,
    trackGap = CIRCULAR_WAVY_TOKENS.trackActiveGap,
  } = params;

  const clamped = Math.max(0, Math.min(1, progress));
  const cx = size / 2;
  const cy = size / 2;
  const baseRadius = Math.max(6, (size - strokeWidth) / 2 - maxAmplitudePx);
  const lobes = resolveCircularWaveLobes(baseRadius, targetWavelength);
  const ampPx = Math.max(0, Math.min(1, amplitude)) * maxAmplitudePx;
  const origin = -Math.PI / 2;
  const activeSweep = 2 * Math.PI * clamped;

  const activePath =
    clamped <= 0.002
      ? ""
      : buildPolarWavyArcSvgPath({
          cx,
          cy,
          baseRadius,
          startAngle: origin,
          endAngle: origin + activeSweep,
          amplitudePx: ampPx,
          lobes,
          phaseRad,
          originAngle: origin,
        });

  const gapAngle = (strokeWidth + trackGap) / baseRadius;
  let trackPath = "";
  if (clamped <= 0.002) {
    trackPath = buildPolarWavyArcSvgPath({
      cx,
      cy,
      baseRadius,
      startAngle: origin,
      endAngle: origin + 2 * Math.PI,
      amplitudePx: 0,
      lobes,
    });
  } else if (clamped < 0.995) {
    const trackStart = origin + activeSweep + gapAngle;
    const trackEnd = origin + 2 * Math.PI - gapAngle;
    if (trackEnd > trackStart + 0.03) {
      trackPath = buildPolarWavyArcSvgPath({
        cx,
        cy,
        baseRadius,
        startAngle: trackStart,
        endAngle: trackEnd,
        amplitudePx: 0,
        lobes,
      });
    }
  }

  return { activePath, trackPath, baseRadius, lobes };
}

export function buildIndeterminateCircularWavyGeometry(params: {
  readonly size?: number;
  readonly cycleFraction: number;
  readonly amplitude?: number;
  readonly phaseRad?: number;
  readonly strokeWidth?: number;
  readonly maxAmplitudePx?: number;
  readonly targetWavelength?: number;
  readonly trackGap?: number;
}): CircularWavyGeometryOutput {
  const {
    size = CIRCULAR_WAVY_TOKENS.size,
    cycleFraction,
    amplitude = 1,
    phaseRad = 0,
    strokeWidth = CIRCULAR_WAVY_TOKENS.strokeWidth,
    maxAmplitudePx = CIRCULAR_WAVY_TOKENS.maxAmplitudePx,
    targetWavelength = CIRCULAR_WAVY_TOKENS.targetWavelength,
    trackGap = CIRCULAR_WAVY_TOKENS.trackActiveGap,
  } = params;

  const t = ((cycleFraction % 1) + 1) % 1;
  const cx = size / 2;
  const cy = size / 2;
  const baseRadius = Math.max(6, (size - strokeWidth) / 2 - maxAmplitudePx);
  const lobes = resolveCircularWaveLobes(baseRadius, targetWavelength);
  const ampPx = Math.max(0, Math.min(1, amplitude)) * maxAmplitudePx;

  const pulse = t < 0.5 ? easeInOutCubic(t * 2) : easeInOutCubic((1 - t) * 2);
  const sweepFraction = 0.12 + 0.66 * pulse;
  const sweepRad = 2 * Math.PI * sweepFraction;
  const tailCatchup = t < 0.5 ? 0 : easeInOutCubic((t - 0.5) * 2) * 0.66 * 2 * Math.PI;
  const startAngle = -Math.PI / 2 + t * 2 * Math.PI + tailCatchup;
  const endAngle = startAngle + sweepRad;

  const activePath = buildPolarWavyArcSvgPath({
    cx,
    cy,
    baseRadius,
    startAngle,
    endAngle,
    amplitudePx: ampPx,
    lobes,
    phaseRad,
    originAngle: startAngle,
  });

  const gapAngle = (strokeWidth + trackGap) / baseRadius;
  const trackStart = endAngle + gapAngle;
  const trackEnd = startAngle + 2 * Math.PI - gapAngle;
  const trackPath =
    trackEnd > trackStart + 0.04
      ? buildPolarWavyArcSvgPath({
          cx,
          cy,
          baseRadius,
          startAngle: trackStart,
          endAngle: trackEnd,
          amplitudePx: 0,
          lobes,
        })
      : "";

  return { activePath, trackPath, baseRadius, lobes };
}
