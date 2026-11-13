/**
 * Material 3 Expressive — Normalized RoundedPolygon Shapes & Pre-Paired Cubic Morphs
 *
 * Upstream Source of Truth:
 * - AOSP `androidx.compose.material3.MaterialShapes` (`MaterialShapes.kt`)
 * - AOSP `androidx.compose.material3.LoadingIndicator` (`LoadingIndicator.kt`, `LoadingIndicatorTokens.kt`)
 * - AOSP `androidx.graphics.shapes` (`RoundedPolygon`, `CornerRounding`, `Morph`)
 *
 * Cross-Platform Guarantee:
 * Instead of requiring every target platform (Web, SwiftUI, Flutter) to reimplement
 * `androidx.graphics.shapes`, this module exports deterministic normalized `[0..1]`
 * cubic Bézier loops and pre-aligned 1:1 morph pairs (`startCubics.length === endCubics.length`).
 * Any platform renders the exact same morph with a single linear loop:
 * `c[i] = start[i] + (end[i] - start[i]) * progress`.
 */

export type CubicTuple = readonly [
  x0: number,
  y0: number,
  c1x: number,
  c1y: number,
  c2x: number,
  c2y: number,
  x1: number,
  y1: number,
];

export const M3E_ALL_SHAPE_NAMES = [
  "circle",
  "square",
  "slanted",
  "arch",
  "fan",
  "arrow",
  "semiCircle",
  "oval",
  "pill",
  "triangle",
  "diamond",
  "clamShell",
  "pentagon",
  "gem",
  "sunny",
  "verySunny",
  "cookie4Sided",
  "cookie6Sided",
  "cookie7Sided",
  "cookie9Sided",
  "cookie12Sided",
  "ghostish",
  "clover4Leaf",
  "clover8Leaf",
  "burst",
  "softBurst",
  "boom",
  "softBoom",
  "flower",
  "puffy",
  "puffyDiamond",
  "pixelCircle",
  "pixelTriangle",
  "bun",
  "heart",
] as const;

export type M3EShapeName = (typeof M3E_ALL_SHAPE_NAMES)[number];

export interface NormalizedShapeData {
  readonly name: M3EShapeName;
  /** Closed loop of cubic Béziers normalized inside `[0..1] × [0..1]` centered at `(0.5, 0.5)`, starting at 3 o'clock CW */
  readonly cubics: readonly CubicTuple[];
  /** Axis-aligned bounding box `[left, top, right, bottom]` */
  readonly bounds: readonly [number, number, number, number];
  /** Maximum radial distance from `(0.5, 0.5)` during 360° rotation */
  readonly maxRadialDistance: number;
  /** Ready-to-render 100×100 viewBox SVG `<path d="...">` */
  readonly previewSvgPath: string;
}

export interface MorphPair {
  readonly from: M3EShapeName;
  readonly to: M3EShapeName;
  /** Guaranteed `startCubics.length === endCubics.length` */
  readonly startCubics: readonly CubicTuple[];
  readonly endCubics: readonly CubicTuple[];
}

interface Point2D {
  readonly x: number;
  readonly y: number;
}

interface CornerRounding {
  readonly radius: number;
  readonly smoothing?: number;
}

interface RawVertex {
  readonly p: Point2D;
  readonly r: CornerRounding;
}

const UNROUNDED: CornerRounding = { radius: 0, smoothing: 0 };

function rotatePointDeg(p: Point2D, deg: number, center: Point2D = { x: 0, y: 0 }): Point2D {
  const rad = (deg * Math.PI) / 180;
  const dx = p.x - center.x;
  const dy = p.y - center.y;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);
  return {
    x: dx * cos - dy * sin + center.x,
    y: dx * sin + dy * cos + center.y,
  };
}

function scaleVertices(vertices: RawVertex[], sx: number, sy: number): RawVertex[] {
  return vertices.map((v) => ({
    p: { x: v.p.x * sx, y: v.p.y * sy },
    r: v.r,
  }));
}

function rotateVertices(
  vertices: RawVertex[],
  deg: number,
  center: Point2D = { x: 0, y: 0 },
): RawVertex[] {
  return vertices.map((v) => ({
    p: rotatePointDeg(v.p, deg, center),
    r: v.r,
  }));
}

/**
 * Exact port of `MaterialShapes.doRepeat` (`MaterialShapes.kt` lines 722-756).
 */
function doRepeat(
  points: RawVertex[],
  reps: number,
  center: Point2D = { x: 0.5, y: 0.5 },
  mirroring = false,
): RawVertex[] {
  if (!mirroring) {
    const np = points.length;
    const out: RawVertex[] = [];
    for (let it = 0; it < np * reps; it++) {
      const idx = it % np;
      const rep = Math.floor(it / np);
      const angle = (rep * 360) / reps;
      out.push({
        p: rotatePointDeg(points[idx].p, angle, center),
        r: points[idx].r,
      });
    }
    return out;
  }

  const angles = points.map(
    (pt) => (Math.atan2(pt.p.y - center.y, pt.p.x - center.x) * 180) / Math.PI,
  );
  const distances = points.map((pt) =>
    Math.hypot(pt.p.x - center.x, pt.p.y - center.y),
  );
  const actualReps = reps * 2;
  const sectionAngle = 360 / actualReps;
  const out: RawVertex[] = [];

  for (let it = 0; it < actualReps; it++) {
    for (let index = 0; index < points.length; index++) {
      const i = it % 2 === 0 ? index : points.length - 1 - index;
      if (i > 0 || it % 2 === 0) {
        const aDeg =
          sectionAngle * it +
          (it % 2 === 0 ? angles[i] : sectionAngle - angles[i] + 2 * angles[0]);
        const aRad = (aDeg * Math.PI) / 180;
        out.push({
          p: {
            x: Math.cos(aRad) * distances[i] + center.x,
            y: Math.sin(aRad) * distances[i] + center.y,
          },
          r: points[i].r,
        });
      }
    }
  }
  return out;
}

function regularPolygonVertices(
  numVertices: number,
  perVertexRounding: CornerRounding | CornerRounding[],
): RawVertex[] {
  const out: RawVertex[] = [];
  for (let i = 0; i < numVertices; i++) {
    const rad = (2 * Math.PI * i) / numVertices;
    const r = Array.isArray(perVertexRounding)
      ? (perVertexRounding[i] ?? UNROUNDED)
      : perVertexRounding;
    out.push({ p: { x: Math.cos(rad), y: Math.sin(rad) }, r });
  }
  return out;
}

function starPolygonVertices(
  numVerticesPerRadius: number,
  innerRadius: number,
  rounding: CornerRounding,
): RawVertex[] {
  const out: RawVertex[] = [];
  const total = numVerticesPerRadius * 2;
  for (let i = 0; i < total; i++) {
    const rad = (Math.PI * i) / numVerticesPerRadius;
    const radius = i % 2 === 0 ? 1 : innerRadius;
    out.push({
      p: { x: Math.cos(rad) * radius, y: Math.sin(rad) * radius },
      r: rounding,
    });
  }
  return out;
}

function rectangleVertices(
  width: number,
  height: number,
  perVertexRounding: CornerRounding | CornerRounding[],
): RawVertex[] {
  const hw = width / 2;
  const hh = height / 2;
  const pts: Point2D[] = [
    { x: hw, y: hh },
    { x: -hw, y: hh },
    { x: -hw, y: -hh },
    { x: hw, y: -hh },
  ];
  return pts.map((p, idx) => ({
    p,
    r: Array.isArray(perVertexRounding) ? (perVertexRounding[idx] ?? UNROUNDED) : perVertexRounding,
  }));
}

function lineCubic(a: Point2D, b: Point2D): CubicTuple {
  return [
    a.x,
    a.y,
    a.x + (b.x - a.x) / 3,
    a.y + (b.y - a.y) / 3,
    a.x + ((b.x - a.x) * 2) / 3,
    a.y + ((b.y - a.y) * 2) / 3,
    b.x,
    b.y,
  ];
}

function splitCubic(c: CubicTuple, t: number): [CubicTuple, CubicTuple] {
  const [x0, y0, x1, y1, x2, y2, x3, y3] = c;
  const u = 1 - t;

  const p01x = u * x0 + t * x1;
  const p01y = u * y0 + t * y1;
  const p12x = u * x1 + t * x2;
  const p12y = u * y1 + t * y2;
  const p23x = u * x2 + t * x3;
  const p23y = u * y2 + t * y3;

  const p012x = u * p01x + t * p12x;
  const p012y = u * p01y + t * p12y;
  const p123x = u * p12x + t * p23x;
  const p123y = u * p12y + t * p23y;

  const p0123x = u * p012x + t * p123x;
  const p0123y = u * p012y + t * p123y;

  return [
    [x0, y0, p01x, p01y, p012x, p012y, p0123x, p0123y],
    [p0123x, p0123y, p123x, p123y, p23x, p23y, x3, y3],
  ];
}

function sliceCubic(c: CubicTuple, t0: number, t1: number): CubicTuple {
  if (t0 <= 1e-7 && t1 >= 1 - 1e-7) return c;
  if (t0 <= 1e-7) {
    return splitCubic(c, Math.max(0, Math.min(1, t1)))[0];
  }
  const [, tail] = splitCubic(c, Math.max(0, Math.min(1, t0)));
  if (t1 >= 1 - 1e-7) return tail;
  const localT = (t1 - t0) / Math.max(1e-7, 1 - t0);
  return splitCubic(tail, Math.max(0, Math.min(1, localT)))[0];
}

function evalCubic(c: CubicTuple, t: number): Point2D {
  const u = 1 - t;
  const b0 = u * u * u;
  const b1 = 3 * u * u * t;
  const b2 = 3 * u * t * t;
  const b3 = t * t * t;
  return {
    x: b0 * c[0] + b1 * c[2] + b2 * c[4] + b3 * c[6],
    y: b0 * c[1] + b1 * c[3] + b2 * c[5] + b3 * c[7],
  };
}

function reverseCubic(c: CubicTuple): CubicTuple {
  return [c[6], c[7], c[4], c[5], c[2], c[3], c[0], c[1]];
}

/**
 * Converts rounded polygon vertices into a closed piecewise-cubic loop
 * matching `androidx.graphics.shapes.RoundedPolygon`.
 */
function buildRoundedPolygonCubics(vertices: RawVertex[]): CubicTuple[] {
  const n = vertices.length;
  interface CornerGeo {
    v: Point2D;
    u1: Point2D;
    u2: Point2D;
    len1: number;
    len2: number;
    tanHalf: number;
    sweepAngle: number;
    expectedRoundCut: number;
    expectedTotalCut: number;
    smoothing: number;
  }

  const corners: CornerGeo[] = [];
  for (let i = 0; i < n; i++) {
    const prev = vertices[(i - 1 + n) % n].p;
    const curr = vertices[i].p;
    const next = vertices[(i + 1) % n].p;
    const r = vertices[i].r.radius;
    const smoothing = vertices[i].r.smoothing ?? 0;

    const dx1 = prev.x - curr.x;
    const dy1 = prev.y - curr.y;
    const dx2 = next.x - curr.x;
    const dy2 = next.y - curr.y;
    const len1 = Math.hypot(dx1, dy1);
    const len2 = Math.hypot(dx2, dy2);

    if (len1 < 1e-6 || len2 < 1e-6 || r <= 1e-5) {
      corners.push({
        v: curr,
        u1: { x: 0, y: 0 },
        u2: { x: 0, y: 0 },
        len1,
        len2,
        tanHalf: 1,
        sweepAngle: 0,
        expectedRoundCut: 0,
        expectedTotalCut: 0,
        smoothing: 0,
      });
      continue;
    }

    const u1 = { x: dx1 / len1, y: dy1 / len1 };
    const u2 = { x: dx2 / len2, y: dy2 / len2 };
    const dot = Math.max(-0.999999, Math.min(0.999999, u1.x * u2.x + u1.y * u2.y));
    const interiorAngle = Math.acos(dot);
    const halfAngle = interiorAngle / 2;
    const sinHalf = Math.sin(halfAngle);
    const cosHalf = Math.cos(halfAngle);

    if (sinHalf < 1e-4 || Math.abs(Math.PI - interiorAngle) < 1e-4) {
      corners.push({
        v: curr,
        u1,
        u2,
        len1,
        len2,
        tanHalf: 1,
        sweepAngle: 0,
        expectedRoundCut: 0,
        expectedTotalCut: 0,
        smoothing: 0,
      });
      continue;
    }

    const cotHalf = cosHalf / sinHalf;
    const tanHalf = sinHalf / cosHalf;
    const expectedRoundCut = r * cotHalf;
    const expectedTotalCut = expectedRoundCut * (1 + smoothing);

    corners.push({
      v: curr,
      u1,
      u2,
      len1,
      len2,
      tanHalf,
      sweepAngle: Math.PI - interiorAngle,
      expectedRoundCut,
      expectedTotalCut,
      smoothing,
    });
  }

  // Compute edge budget scaling so adjacent cuts on edge (i -> i+1) never overlap
  const edgeScale: number[] = [];
  for (let i = 0; i < n; i++) {
    const cA = corners[i];
    const cB = corners[(i + 1) % n];
    const edgeLen = cA.len2;
    const needed = cA.expectedTotalCut + cB.expectedTotalCut;
    edgeScale.push(needed > edgeLen && needed > 1e-6 ? edgeLen / needed : 1);
  }

  interface BuiltCorner {
    start: Point2D;
    end: Point2D;
    arcs: CubicTuple[];
  }

  const builtCorners: BuiltCorner[] = corners.map((c, i) => {
    if (c.expectedTotalCut <= 1e-5 || c.sweepAngle <= 1e-4) {
      return { start: c.v, end: c.v, arcs: [] };
    }
    const prevEdgeRatio = edgeScale[(i - 1 + n) % n];
    const nextEdgeRatio = edgeScale[i];
    const ratio = Math.min(1, prevEdgeRatio, nextEdgeRatio);
    const actualCut = c.expectedTotalCut * ratio;

    const start: Point2D = {
      x: c.v.x + c.u1.x * actualCut,
      y: c.v.y + c.u1.y * actualCut,
    };
    const end: Point2D = {
      x: c.v.x + c.u2.x * actualCut,
      y: c.v.y + c.u2.y * actualCut,
    };

    const roundCut = c.expectedRoundCut * ratio;
    const effRadius = roundCut * c.tanHalf;
    // Circular arc handle length blended smoothly when smoothing > 0
    const arcHandle = (4 / 3) * Math.tan(c.sweepAngle / 4) * effRadius;
    const smoothExtra = ((actualCut - roundCut) * 2) / 3;
    const handleDist = Math.min(actualCut * 0.95, arcHandle + smoothExtra);

    const fullCubic: CubicTuple = [
      start.x,
      start.y,
      start.x - c.u1.x * handleDist,
      start.y - c.u1.y * handleDist,
      end.x - c.u2.x * handleDist,
      end.y - c.u2.y * handleDist,
      end.x,
      end.y,
    ];

    // Split wide corners (> 90°) into two cubics for sub-pixel circular fidelity
    if (c.sweepAngle > Math.PI / 2 && c.smoothing === 0) {
      // Exact two-half circular arc around the corner bisector
      const halfSweep = c.sweepAngle / 2;
      const halfHandle = (4 / 3) * Math.tan(halfSweep / 4) * effRadius;
      const bisX = c.u1.x + c.u2.x;
      const bisY = c.u1.y + c.u2.y;
      const bisLen = Math.hypot(bisX, bisY);
      if (bisLen > 1e-5) {
        const bux = bisX / bisLen;
        const buy = bisY / bisLen;
        const centerDist = Math.hypot(roundCut, effRadius);
        const cx = c.v.x + bux * centerDist;
        const cy = c.v.y + buy * centerDist;
        const midX = cx - bux * effRadius;
        const midY = cy - buy * effRadius;
        // Unit tangent at midpoint (perpendicular to bisector, pointing from start -> end)
        const dirSign =
          (end.x - start.x) * -buy + (end.y - start.y) * bux >= 0 ? 1 : -1;
        const tx = -buy * dirSign;
        const ty = bux * dirSign;

        const startArc: Point2D = {
          x: c.v.x + c.u1.x * roundCut,
          y: c.v.y + c.u1.y * roundCut,
        };
        const endArc: Point2D = {
          x: c.v.x + c.u2.x * roundCut,
          y: c.v.y + c.u2.y * roundCut,
        };

        return {
          start: startArc,
          end: endArc,
          arcs: [
            [
              startArc.x,
              startArc.y,
              startArc.x - c.u1.x * halfHandle,
              startArc.y - c.u1.y * halfHandle,
              midX - tx * halfHandle,
              midY - ty * halfHandle,
              midX,
              midY,
            ],
            [
              midX,
              midY,
              midX + tx * halfHandle,
              midY + ty * halfHandle,
              endArc.x - c.u2.x * halfHandle,
              endArc.y - c.u2.y * halfHandle,
              endArc.x,
              endArc.y,
            ],
          ],
        };
      }
    }

    return { start, end, arcs: [fullCubic] };
  });

  const cubics: CubicTuple[] = [];
  for (let i = 0; i < n; i++) {
    const curr = builtCorners[i];
    const next = builtCorners[(i + 1) % n];
    for (const arc of curr.arcs) {
      cubics.push(arc);
    }
    const edgeGap = Math.hypot(next.start.x - curr.end.x, next.start.y - curr.end.y);
    if (edgeGap > 1e-5) {
      cubics.push(lineCubic(curr.end, next.start));
    }
  }

  return cubics;
}

/**
 * Normalizes a closed cubic loop into `[0..1] × [0..1]` centered at `(0.5, 0.5)`,
 * enforces clockwise screen winding, and aligns cubic `[0]` at `0 rad` (`3 o'clock`).
 */
function normalizeAndOrientShape(
  name: M3EShapeName,
  rawCubics: CubicTuple[],
): NormalizedShapeData {
  // 1. Sample bounds densely for normalization
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const c of rawCubics) {
    for (let s = 0; s <= 16; s++) {
      const p = evalCubic(c, s / 16);
      if (p.x < minX) minX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.x > maxX) maxX = p.x;
      if (p.y > maxY) maxY = p.y;
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const maxSide = Math.max(width, height, 1e-6);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const tx = (x: number) => (x - cx) / maxSide + 0.5;
  const ty = (y: number) => (y - cy) / maxSide + 0.5;

  let cubics: CubicTuple[] = rawCubics.map((c) => [
    tx(c[0]),
    ty(c[1]),
    tx(c[2]),
    ty(c[3]),
    tx(c[4]),
    ty(c[5]),
    tx(c[6]),
    ty(c[7]),
  ]);

  // 2. Enforce clockwise winding in screen coordinates (+x right, +y down => signedArea > 0)
  let signedArea2 = 0;
  for (const c of cubics) {
    let prev = { x: c[0], y: c[1] };
    for (let s = 1; s <= 8; s++) {
      const curr = evalCubic(c, s / 8);
      signedArea2 += prev.x * curr.y - curr.x * prev.y;
      prev = curr;
    }
  }
  if (signedArea2 < 0) {
    cubics = cubics.slice().reverse().map(reverseCubic);
  }

  // 3. Find the point on the loop at angle 0 rad (ray from (0.5, 0.5) toward +x)
  let bestIdx = 0;
  let bestT = 0;
  let bestScore = Infinity;

  for (let i = 0; i < cubics.length; i++) {
    const c = cubics[i];
    for (let s = 0; s < 32; s++) {
      const t = s / 32;
      const p = evalCubic(c, t);
      const angle = Math.atan2(p.y - 0.5, p.x - 0.5);
      const absAngle = Math.abs(angle);
      if (absAngle < bestScore) {
        bestScore = absAngle;
        bestIdx = i;
        bestT = t;
      }
    }
  }

  if (bestT > 1e-3 && bestT < 1 - 1e-3) {
    const [firstHalf, secondHalf] = splitCubic(cubics[bestIdx], bestT);
    cubics = [
      secondHalf,
      ...cubics.slice(bestIdx + 1),
      ...cubics.slice(0, bestIdx),
      firstHalf,
    ];
  } else if (bestIdx > 0) {
    cubics = [...cubics.slice(bestIdx), ...cubics.slice(0, bestIdx)];
  }

  // Ensure exact endpoint closure
  if (cubics.length > 0) {
    const first = cubics[0];
    const last = cubics[cubics.length - 1];
    cubics[cubics.length - 1] = [
      last[0],
      last[1],
      last[2],
      last[3],
      last[4],
      last[5],
      first[0],
      first[1],
    ];
  }

  // 4. Compute normalized bounds & maxRadialDistance for rotational scaleFactor
  let bLeft = Infinity;
  let bTop = Infinity;
  let bRight = -Infinity;
  let bBottom = -Infinity;
  let maxRadialDistance = 0;

  for (const c of cubics) {
    for (let s = 0; s <= 16; s++) {
      const p = evalCubic(c, s / 16);
      if (p.x < bLeft) bLeft = p.x;
      if (p.y < bTop) bTop = p.y;
      if (p.x > bRight) bRight = p.x;
      if (p.y > bBottom) bBottom = p.y;
      const dist = Math.hypot(p.x - 0.5, p.y - 0.5);
      if (dist > maxRadialDistance) maxRadialDistance = dist;
    }
  }

  return {
    name,
    cubics,
    bounds: [bLeft, bTop, bRight, bBottom],
    maxRadialDistance,
    previewSvgPath: cubicsToSvgPath(cubics, 100, 1),
  };
}

function cubicArcLength(c: CubicTuple, steps = 16): number {
  let len = 0;
  let prev = { x: c[0], y: c[1] };
  for (let i = 1; i <= steps; i++) {
    const curr = evalCubic(c, i / steps);
    len += Math.hypot(curr.x - prev.x, curr.y - prev.y);
    prev = curr;
  }
  return Math.max(len, 1e-6);
}

function cumulativeArcCutPoints(cubics: readonly CubicTuple[]): number[] {
  const lengths = cubics.map((c) => cubicArcLength(c));
  const total = lengths.reduce((acc, v) => acc + v, 0);
  const cuts = [0];
  let acc = 0;
  for (let i = 0; i < lengths.length - 1; i++) {
    acc += lengths[i] / total;
    cuts.push(acc);
  }
  cuts.push(1);
  return cuts;
}

function subdivideAtArcMilestones(
  cubics: readonly CubicTuple[],
  ownCuts: readonly number[],
  unionCuts: readonly number[],
): CubicTuple[] {
  const out: CubicTuple[] = [];
  let segIdx = 0;

  for (let k = 0; k < unionCuts.length - 1; k++) {
    const u0 = unionCuts[k];
    const u1 = unionCuts[k + 1];
    const mid = (u0 + u1) / 2;

    while (segIdx < cubics.length - 1 && ownCuts[segIdx + 1] < mid) {
      segIdx++;
    }

    const segStart = ownCuts[segIdx];
    const segEnd = ownCuts[segIdx + 1];
    const span = Math.max(1e-7, segEnd - segStart);
    const t0 = Math.max(0, Math.min(1, (u0 - segStart) / span));
    const t1 = Math.max(t0, Math.min(1, (u1 - segStart) / span));

    out.push(sliceCubic(cubics[segIdx], t0, t1));
  }

  return out;
}

/**
 * Pairs any two normalized shapes into identical-length cubic Bézier arrays
 * using exact arc-length union De Casteljau subdivision (`Morph`).
 */
export function createMorphPair(
  startShape: NormalizedShapeData,
  endShape: NormalizedShapeData,
): MorphPair {
  const cutsA = cumulativeArcCutPoints(startShape.cubics);
  const cutsB = cumulativeArcCutPoints(endShape.cubics);

  const rawUnion = [...cutsA, ...cutsB].sort((a, b) => a - b);
  const union: number[] = [];
  for (const val of rawUnion) {
    if (union.length === 0 || val - union[union.length - 1] > 1e-4) {
      union.push(val);
    }
  }
  union[0] = 0;
  union[union.length - 1] = 1;

  const startCubics = subdivideAtArcMilestones(startShape.cubics, cutsA, union);
  const endCubics = subdivideAtArcMilestones(endShape.cubics, cutsB, union);

  return {
    from: startShape.name,
    to: endShape.name,
    startCubics,
    endCubics,
  };
}

/**
 * Linearly interpolates a `MorphPair` at `progress` (supports overshoot > 1 or < 0).
 */
export function interpolateMorphCubics(
  pair: MorphPair,
  progress: number,
): CubicTuple[] {
  const { startCubics, endCubics } = pair;
  const count = startCubics.length;
  const out: CubicTuple[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const a = startCubics[i];
    const b = endCubics[i];
    out[i] = [
      a[0] + (b[0] - a[0]) * progress,
      a[1] + (b[1] - a[1]) * progress,
      a[2] + (b[2] - a[2]) * progress,
      a[3] + (b[3] - a[3]) * progress,
      a[4] + (b[4] - a[4]) * progress,
      a[5] + (b[5] - a[5]) * progress,
      a[6] + (b[6] - a[6]) * progress,
      a[7] + (b[7] - a[7]) * progress,
    ];
  }
  return out;
}

/**
 * Converts normalized `[0..1]` cubics into a centered SVG path `d` string
 * matching AOSP `LoadingIndicator.processPath(path, size, scaleFactor)`.
 */
export function cubicsToSvgPath(
  cubics: readonly CubicTuple[],
  viewportSize = 48,
  scaleFactor = 1,
): string {
  if (cubics.length === 0) return "";

  const scaled = viewportSize * scaleFactor;
  // Compute current cubic endpoint bounds so dynamic morph centers cleanly like AOSP `processPath`
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const c of cubics) {
    if (c[0] < minX) minX = c[0];
    if (c[1] < minY) minY = c[1];
    if (c[0] > maxX) maxX = c[0];
    if (c[1] > maxY) maxY = c[1];
    if (c[2] < minX) minX = c[2];
    if (c[3] < minY) minY = c[3];
    if (c[2] > maxX) maxX = c[2];
    if (c[3] > maxY) maxY = c[3];
  }
  const pathCenterX = ((minX + maxX) / 2) * scaled;
  const pathCenterY = ((minY + maxY) / 2) * scaled;
  const offsetX = viewportSize / 2 - pathCenterX;
  const offsetY = viewportSize / 2 - pathCenterY;

  const fmt = (v: number, off: number) => Number((v * scaled + off).toFixed(2));

  const first = cubics[0];
  const parts = [`M ${fmt(first[0], offsetX)} ${fmt(first[1], offsetY)}`];
  for (const c of cubics) {
    parts.push(
      `C ${fmt(c[2], offsetX)} ${fmt(c[3], offsetY)}, ${fmt(c[4], offsetX)} ${fmt(c[5], offsetY)}, ${fmt(c[6], offsetX)} ${fmt(c[7], offsetY)}`,
    );
  }
  parts.push("Z");
  return parts.join(" ");
}

// ---------------------------------------------------------------------------
// Exact AOSP `MaterialShapes.kt` Definitions
// ---------------------------------------------------------------------------

const cornerRound15: CornerRounding = { radius: 0.15 };
const cornerRound20: CornerRounding = { radius: 0.2 };
const cornerRound30: CornerRounding = { radius: 0.3 };
const cornerRound50: CornerRounding = { radius: 0.5 };
const cornerRound100: CornerRounding = { radius: 1.0 };

function dedupeVertices(vertices: RawVertex[]): RawVertex[] {
  const out: RawVertex[] = [];
  for (const v of vertices) {
    const prev = out[out.length - 1];
    if (!prev || Math.hypot(v.p.x - prev.p.x, v.p.y - prev.p.y) > 1e-5) {
      out.push(v);
    }
  }
  if (
    out.length > 2 &&
    Math.hypot(
      out[0].p.x - out[out.length - 1].p.x,
      out[0].p.y - out[out.length - 1].p.y,
    ) <= 1e-5
  ) {
    out.pop();
  }
  return out;
}

function scaleCubics(cubics: CubicTuple[], sx: number, sy: number): CubicTuple[] {
  return cubics.map((c) => [
    c[0] * sx,
    c[1] * sy,
    c[2] * sx,
    c[3] * sy,
    c[4] * sx,
    c[5] * sy,
    c[6] * sx,
    c[7] * sy,
  ]);
}

function createAllMaterialShapes(): Record<M3EShapeName, NormalizedShapeData> {
  const build = (name: M3EShapeName, vertices: RawVertex[]) =>
    normalizeAndOrientShape(name, buildRoundedPolygonCubics(dedupeVertices(vertices)));

  return {
    circle: build("circle", regularPolygonVertices(10, cornerRound100)),
    square: build("square", rectangleVertices(1, 1, cornerRound30)),
    slanted: build(
      "slanted",
      doRepeat(
        [
          { p: { x: 0.926, y: 0.97 }, r: { radius: 0.189, smoothing: 0.811 } },
          { p: { x: -0.021, y: 0.967 }, r: { radius: 0.187, smoothing: 0.057 } },
        ],
        2,
      ),
    ),
    arch: build(
      "arch",
      rotateVertices(
        regularPolygonVertices(4, [
          cornerRound100,
          cornerRound100,
          cornerRound20,
          cornerRound20,
        ]),
        -135,
      ),
    ),
    fan: build(
      "fan",
      doRepeat(
        [
          { p: { x: 1.004, y: 1.0 }, r: { radius: 0.148, smoothing: 0.417 } },
          { p: { x: 0.0, y: 1.0 }, r: { radius: 0.151 } },
          { p: { x: 0.0, y: -0.003 }, r: { radius: 0.148 } },
          { p: { x: 0.978, y: 0.02 }, r: { radius: 0.803 } },
        ],
        1,
      ),
    ),
    arrow: build(
      "arrow",
      doRepeat(
        [
          { p: { x: 0.5, y: 0.892 }, r: { radius: 0.313 } },
          { p: { x: -0.216, y: 1.05 }, r: { radius: 0.207 } },
          { p: { x: 0.499, y: -0.16 }, r: { radius: 0.215, smoothing: 1.0 } },
          { p: { x: 1.225, y: 1.06 }, r: { radius: 0.211 } },
        ],
        1,
      ),
    ),
    semiCircle: build(
      "semiCircle",
      rectangleVertices(1.6, 1.0, [
        cornerRound20,
        cornerRound20,
        cornerRound100,
        cornerRound100,
      ]),
    ),
    oval: build(
      "oval",
      rotateVertices(
        scaleVertices(regularPolygonVertices(10, cornerRound100), 1, 0.64),
        -45,
      ),
    ),
    pill: build(
      "pill",
      doRepeat(
        [
          { p: { x: 0.961, y: 0.039 }, r: { radius: 0.426 } },
          { p: { x: 1.001, y: 0.428 }, r: UNROUNDED },
          { p: { x: 1.0, y: 0.609 }, r: cornerRound100 },
        ],
        2,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    triangle: build(
      "triangle",
      rotateVertices(regularPolygonVertices(3, cornerRound20), -90),
    ),
    diamond: build(
      "diamond",
      doRepeat(
        [
          { p: { x: 0.5, y: 1.096 }, r: { radius: 0.151, smoothing: 0.524 } },
          { p: { x: 0.04, y: 0.5 }, r: { radius: 0.159 } },
        ],
        2,
      ),
    ),
    clamShell: build(
      "clamShell",
      doRepeat(
        [
          { p: { x: 0.171, y: 0.841 }, r: { radius: 0.159 } },
          { p: { x: -0.02, y: 0.5 }, r: { radius: 0.14 } },
          { p: { x: 0.17, y: 0.159 }, r: { radius: 0.159 } },
        ],
        2,
      ),
    ),
    pentagon: build(
      "pentagon",
      doRepeat(
        [
          { p: { x: 0.5, y: -0.009 }, r: { radius: 0.172 } },
          { p: { x: 1.03, y: 0.365 }, r: { radius: 0.164 } },
          { p: { x: 0.828, y: 0.97 }, r: { radius: 0.169 } },
        ],
        1,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    gem: build(
      "gem",
      doRepeat(
        [
          { p: { x: 0.499, y: 1.023 }, r: { radius: 0.241, smoothing: 0.778 } },
          { p: { x: -0.005, y: 0.792 }, r: { radius: 0.208 } },
          { p: { x: 0.073, y: 0.258 }, r: { radius: 0.228 } },
          { p: { x: 0.433, y: 0.0 }, r: { radius: 0.491 } },
        ],
        1,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    sunny: build("sunny", starPolygonVertices(8, 0.8, cornerRound15)),
    verySunny: build(
      "verySunny",
      doRepeat(
        [
          { p: { x: 0.5, y: 1.08 }, r: { radius: 0.085 } },
          { p: { x: 0.358, y: 0.843 }, r: { radius: 0.085 } },
        ],
        8,
      ),
    ),
    cookie4Sided: build(
      "cookie4Sided",
      doRepeat(
        [
          { p: { x: 1.237, y: 1.236 }, r: { radius: 0.258 } },
          { p: { x: 0.5, y: 0.918 }, r: { radius: 0.233 } },
        ],
        4,
      ),
    ),
    cookie6Sided: build(
      "cookie6Sided",
      doRepeat(
        [
          { p: { x: 0.723, y: 0.884 }, r: { radius: 0.394 } },
          { p: { x: 0.5, y: 1.099 }, r: { radius: 0.398 } },
        ],
        6,
      ),
    ),
    cookie7Sided: build(
      "cookie7Sided",
      rotateVertices(starPolygonVertices(7, 0.75, cornerRound50), -90),
    ),
    cookie9Sided: build(
      "cookie9Sided",
      rotateVertices(starPolygonVertices(9, 0.8, cornerRound50), -90),
    ),
    cookie12Sided: build(
      "cookie12Sided",
      rotateVertices(starPolygonVertices(12, 0.8, cornerRound50), -90),
    ),
    ghostish: build(
      "ghostish",
      doRepeat(
        [
          { p: { x: 0.5, y: 0.0 }, r: cornerRound100 },
          { p: { x: 1.0, y: 0.0 }, r: cornerRound100 },
          { p: { x: 1.0, y: 1.14 }, r: { radius: 0.254, smoothing: 0.106 } },
          { p: { x: 0.575, y: 0.906 }, r: { radius: 0.253 } },
        ],
        1,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    clover4Leaf: build(
      "clover4Leaf",
      doRepeat(
        [
          { p: { x: 0.5, y: 0.074 }, r: UNROUNDED },
          { p: { x: 0.725, y: -0.099 }, r: { radius: 0.476 } },
        ],
        4,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    clover8Leaf: build(
      "clover8Leaf",
      doRepeat(
        [
          { p: { x: 0.5, y: 0.036 }, r: UNROUNDED },
          { p: { x: 0.758, y: -0.101 }, r: { radius: 0.209 } },
        ],
        8,
      ),
    ),
    burst: build(
      "burst",
      doRepeat(
        [
          { p: { x: 0.5, y: -0.006 }, r: { radius: 0.006 } },
          { p: { x: 0.592, y: 0.158 }, r: { radius: 0.006 } },
        ],
        12,
      ),
    ),
    softBurst: build(
      "softBurst",
      doRepeat(
        [
          { p: { x: 0.193, y: 0.277 }, r: { radius: 0.053 } },
          { p: { x: 0.176, y: 0.055 }, r: { radius: 0.053 } },
        ],
        10,
      ),
    ),
    boom: build(
      "boom",
      doRepeat(
        [
          { p: { x: 0.457, y: 0.296 }, r: { radius: 0.007 } },
          { p: { x: 0.5, y: -0.051 }, r: { radius: 0.007 } },
        ],
        15,
      ),
    ),
    softBoom: build(
      "softBoom",
      doRepeat(
        [
          { p: { x: 0.733, y: 0.454 }, r: UNROUNDED },
          { p: { x: 0.839, y: 0.437 }, r: { radius: 0.532 } },
          { p: { x: 0.949, y: 0.449 }, r: { radius: 0.439, smoothing: 1.0 } },
          { p: { x: 0.998, y: 0.478 }, r: { radius: 0.174 } },
        ],
        16,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    flower: build(
      "flower",
      doRepeat(
        [
          { p: { x: 0.37, y: 0.187 }, r: UNROUNDED },
          { p: { x: 0.416, y: 0.049 }, r: { radius: 0.381 } },
          { p: { x: 0.479, y: 0.001 }, r: { radius: 0.095 } },
        ],
        8,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    puffy: normalizeAndOrientShape(
      "puffy",
      scaleCubics(
        buildRoundedPolygonCubics(
          dedupeVertices(
            doRepeat(
              [
                { p: { x: 0.5, y: 0.053 }, r: UNROUNDED },
                { p: { x: 0.545, y: -0.04 }, r: { radius: 0.405 } },
                { p: { x: 0.67, y: -0.035 }, r: { radius: 0.426 } },
                { p: { x: 0.717, y: 0.066 }, r: { radius: 0.574 } },
                { p: { x: 0.722, y: 0.128 }, r: UNROUNDED },
                { p: { x: 0.777, y: 0.002 }, r: { radius: 0.36 } },
                { p: { x: 0.914, y: 0.149 }, r: { radius: 0.66 } },
                { p: { x: 0.926, y: 0.289 }, r: { radius: 0.66 } },
                { p: { x: 0.881, y: 0.346 }, r: UNROUNDED },
                { p: { x: 0.94, y: 0.344 }, r: { radius: 0.126 } },
                { p: { x: 1.003, y: 0.437 }, r: { radius: 0.255 } },
              ],
              2,
              { x: 0.5, y: 0.5 },
              true,
            ),
          ),
        ),
        1,
        0.742,
      ),
    ),
    puffyDiamond: build(
      "puffyDiamond",
      doRepeat(
        [
          { p: { x: 0.87, y: 0.13 }, r: { radius: 0.146 } },
          { p: { x: 0.818, y: 0.357 }, r: UNROUNDED },
          { p: { x: 1.0, y: 0.332 }, r: { radius: 0.853 } },
        ],
        4,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    pixelCircle: build(
      "pixelCircle",
      doRepeat(
        [
          { p: { x: 0.5, y: 0.0 }, r: UNROUNDED },
          { p: { x: 0.704, y: 0.0 }, r: UNROUNDED },
          { p: { x: 0.704, y: 0.065 }, r: UNROUNDED },
          { p: { x: 0.843, y: 0.065 }, r: UNROUNDED },
          { p: { x: 0.843, y: 0.148 }, r: UNROUNDED },
          { p: { x: 0.926, y: 0.148 }, r: UNROUNDED },
          { p: { x: 0.926, y: 0.296 }, r: UNROUNDED },
          { p: { x: 1.0, y: 0.296 }, r: UNROUNDED },
        ],
        2,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    pixelTriangle: build(
      "pixelTriangle",
      doRepeat(
        [
          { p: { x: 0.11, y: 0.5 }, r: UNROUNDED },
          { p: { x: 0.113, y: 0.0 }, r: UNROUNDED },
          { p: { x: 0.287, y: 0.0 }, r: UNROUNDED },
          { p: { x: 0.287, y: 0.087 }, r: UNROUNDED },
          { p: { x: 0.421, y: 0.087 }, r: UNROUNDED },
          { p: { x: 0.421, y: 0.17 }, r: UNROUNDED },
          { p: { x: 0.56, y: 0.17 }, r: UNROUNDED },
          { p: { x: 0.56, y: 0.265 }, r: UNROUNDED },
          { p: { x: 0.674, y: 0.265 }, r: UNROUNDED },
          { p: { x: 0.675, y: 0.344 }, r: UNROUNDED },
          { p: { x: 0.789, y: 0.344 }, r: UNROUNDED },
          { p: { x: 0.789, y: 0.439 }, r: UNROUNDED },
          { p: { x: 0.888, y: 0.439 }, r: UNROUNDED },
        ],
        1,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    bun: build(
      "bun",
      doRepeat(
        [
          { p: { x: 0.796, y: 0.5 }, r: UNROUNDED },
          { p: { x: 0.853, y: 0.518 }, r: cornerRound100 },
          { p: { x: 0.992, y: 0.631 }, r: cornerRound100 },
          { p: { x: 0.968, y: 1.0 }, r: cornerRound100 },
        ],
        2,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
    heart: build(
      "heart",
      doRepeat(
        [
          { p: { x: 0.5, y: 0.268 }, r: { radius: 0.016 } },
          { p: { x: 0.792, y: -0.066 }, r: { radius: 0.958 } },
          { p: { x: 1.064, y: 0.276 }, r: cornerRound100 },
          { p: { x: 0.501, y: 0.946 }, r: { radius: 0.129 } },
        ],
        1,
        { x: 0.5, y: 0.5 },
        true,
      ),
    ),
  };
}

export const MATERIAL_SHAPES: Record<M3EShapeName, NormalizedShapeData> =
  createAllMaterialShapes();

const MORPH_PAIR_CACHE = new Map<string, MorphPair>();

/**
 * Memoized `MorphPair` lookup between ANY two of the 35 official `MaterialShapes`.
 */
export function getShapeMorphPair(
  from: M3EShapeName,
  to: M3EShapeName,
): MorphPair {
  const key = `${from}->${to}`;
  const cached = MORPH_PAIR_CACHE.get(key);
  if (cached) return cached;
  const pair = createMorphPair(MATERIAL_SHAPES[from], MATERIAL_SHAPES[to]);
  MORPH_PAIR_CACHE.set(key, pair);
  return pair;
}

/**
 * Exact 7-shape loop from AOSP `LoadingIndicatorDefaults.IndeterminateIndicatorPolygons`.
 */
export const LOADING_INDICATOR_SHAPE_SEQUENCE: readonly M3EShapeName[] = [
  "softBurst",
  "cookie9Sided",
  "pentagon",
  "pill",
  "sunny",
  "cookie4Sided",
  "oval",
] as const;

/**
 * Exact port of AOSP `LoadingIndicator.calculateScaleFactor(indicatorPolygons)`
 * so rotated shapes never clip inside the container.
 */
export function calculateIndicatorScaleFactor(
  shapeNames: readonly M3EShapeName[] = LOADING_INDICATOR_SHAPE_SEQUENCE,
): number {
  let scaleFactor = 1;
  for (const name of shapeNames) {
    const shape = MATERIAL_SHAPES[name];
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
  LOADING_INDICATOR_SHAPE_SEQUENCE.map((fromName, idx, arr) => {
    const toName = arr[(idx + 1) % arr.length];
    return createMorphPair(MATERIAL_SHAPES[fromName], MATERIAL_SHAPES[toName]);
  });

export const LOADING_INDICATOR_TOKENS = {
  containerSize: 48,
  activeIndicatorSize: 38,
  activeIndicatorScale: 38 / 48,
  /** Combined `calculateScaleFactor * ActiveIndicatorScale` (`LoadingIndicator.kt` line 396) */
  effectiveScaleFactor:
    calculateIndicatorScaleFactor(LOADING_INDICATOR_SHAPE_SEQUENCE) * (38 / 48),
  morphIntervalMs: 650,
  globalRotationDurationMs: 4666,
  quarterRotationDeg: 90,
  /** Exact spring from `LoadingIndicator.kt` line 408 */
  morphSpring: {
    dampingRatio: 0.6,
    stiffness: 200,
    visibilityThreshold: 0.1,
  },
} as const;
