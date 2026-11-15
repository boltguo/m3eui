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

export type ShapeFeature =
  | {
      readonly type: "corner";
      readonly convex: boolean;
      readonly cubics: readonly CubicTuple[];
    }
  | {
      readonly type: "edge";
      readonly cubics: readonly CubicTuple[];
    };

export interface NormalizedShapeData {
  readonly name: M3EShapeName;
  readonly cubics: readonly CubicTuple[];
  readonly features: readonly ShapeFeature[];
  readonly bounds: readonly [number, number, number, number];
  readonly maxRadialDistance: number;
  readonly previewSvgPath: string;
}

export interface MorphPair {
  readonly from: M3EShapeName;
  readonly to: M3EShapeName;
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

const DISTANCE_EPSILON = 1e-4;
const ANGLE_EPSILON = 1e-4;
const UNROUNDED: CornerRounding = { radius: 0, smoothing: 0 };

function positiveModulo(num: number, mod: number): number {
  return ((num % mod) + mod) % mod;
}

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

function rotate90(p: Point2D): Point2D {
  return { x: -p.y, y: p.x };
}

function dotProduct(a: Point2D, b: Point2D): number {
  return a.x * b.x + a.y * b.y;
}

function directionVector(dx: number, dy: number): Point2D {
  const d = Math.hypot(dx, dy);
  if (d <= 1e-7) return { x: 0, y: 0 };
  return { x: dx / d, y: dy / d };
}

function lerpPoint(a: Point2D, b: Point2D, t: number): Point2D {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
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

function circularArcCubic(
  centerX: number,
  centerY: number,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
): CubicTuple {
  const p0 = directionVector(x0 - centerX, y0 - centerY);
  const p1 = directionVector(x1 - centerX, y1 - centerY);
  const rotatedP0 = rotate90(p0);
  const rotatedP1 = rotate90(p1);
  const clockwise = rotatedP0.x * (x1 - centerX) + rotatedP0.y * (y1 - centerY) >= 0;
  const cosa = Math.max(-1, Math.min(1, dotProduct(p0, p1)));
  if (cosa > 0.999) {
    return lineCubic({ x: x0, y: y0 }, { x: x1, y: y1 });
  }
  const radius = Math.hypot(x0 - centerX, y0 - centerY);
  const k =
    ((radius * 4) / 3) *
    ((Math.sqrt(2 * (1 - cosa)) - Math.sqrt(Math.max(0, 1 - cosa * cosa))) / (1 - cosa)) *
    (clockwise ? 1 : -1);
  return [
    x0,
    y0,
    x0 + rotatedP0.x * k,
    y0 + rotatedP0.y * k,
    x1 - rotatedP1.x * k,
    y1 - rotatedP1.y * k,
    x1,
    y1,
  ];
}

function isZeroLengthCubic(c: CubicTuple): boolean {
  return (
    Math.hypot(c[6] - c[0], c[7] - c[1]) < 1e-5 &&
    Math.hypot(c[2] - c[0], c[3] - c[1]) < 1e-5 &&
    Math.hypot(c[4] - c[6], c[5] - c[7]) < 1e-5
  );
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

function lineIntersection(
  p0: Point2D,
  d0: Point2D,
  p1: Point2D,
  d1: Point2D,
): Point2D | null {
  const rotatedD1 = rotate90(d1);
  const den = dotProduct(d0, rotatedD1);
  if (Math.abs(den) < DISTANCE_EPSILON) return null;
  const num = dotProduct({ x: p1.x - p0.x, y: p1.y - p0.y }, rotatedD1);
  if (Math.abs(den) < DISTANCE_EPSILON * Math.abs(num)) return null;
  const k = num / den;
  return {
    x: p0.x + d0.x * k,
    y: p0.y + d0.y * k,
  };
}

class RoundedCornerBuilder {
  readonly d1: Point2D;
  readonly d2: Point2D;
  readonly cornerRadius: number;
  readonly smoothing: number;
  readonly cosAngle: number;
  readonly sinAngle: number;
  readonly expectedRoundCut: number;
  readonly expectedCut: number;

  constructor(
    readonly p0: Point2D,
    readonly p1: Point2D,
    readonly p2: Point2D,
    rounding?: CornerRounding,
  ) {
    const v01x = p0.x - p1.x;
    const v01y = p0.y - p1.y;
    const v21x = p2.x - p1.x;
    const v21y = p2.y - p1.y;
    const d01 = Math.hypot(v01x, v01y);
    const d21 = Math.hypot(v21x, v21y);

    if (d01 > 0 && d21 > 0) {
      this.d1 = { x: v01x / d01, y: v01y / d01 };
      this.d2 = { x: v21x / d21, y: v21y / d21 };
      this.cornerRadius = rounding?.radius ?? 0;
      this.smoothing = rounding?.smoothing ?? 0;
      this.cosAngle = Math.max(-1, Math.min(1, dotProduct(this.d1, this.d2)));
      this.sinAngle = Math.sqrt(Math.max(0, 1 - this.cosAngle * this.cosAngle));
      this.expectedRoundCut =
        this.sinAngle > 1e-3
          ? (this.cornerRadius * (this.cosAngle + 1)) / this.sinAngle
          : 0;
      this.expectedCut = (1 + this.smoothing) * this.expectedRoundCut;
    } else {
      this.d1 = { x: 0, y: 0 };
      this.d2 = { x: 0, y: 0 };
      this.cornerRadius = 0;
      this.smoothing = 0;
      this.cosAngle = 0;
      this.sinAngle = 0;
      this.expectedRoundCut = 0;
      this.expectedCut = 0;
    }
  }

  getCubics(allowedCut0: number, allowedCut1: number = allowedCut0): CubicTuple[] {
    const allowedCut = Math.min(allowedCut0, allowedCut1);
    if (
      this.expectedRoundCut < DISTANCE_EPSILON ||
      allowedCut < DISTANCE_EPSILON ||
      this.cornerRadius < DISTANCE_EPSILON
    ) {
      return [lineCubic(this.p1, this.p1)];
    }

    const actualRoundCut = Math.min(allowedCut, this.expectedRoundCut);
    const actualSmoothing0 = this.calculateActualSmoothingValue(allowedCut0);
    const actualSmoothing1 = this.calculateActualSmoothingValue(allowedCut1);
    const actualR = (this.cornerRadius * actualRoundCut) / this.expectedRoundCut;
    const centerDistance = Math.hypot(actualR, actualRoundCut);
    const bisector = directionVector(
      (this.d1.x + this.d2.x) / 2,
      (this.d1.y + this.d2.y) / 2,
    );
    const center: Point2D = {
      x: this.p1.x + bisector.x * centerDistance,
      y: this.p1.y + bisector.y * centerDistance,
    };
    const circleIntersection0: Point2D = {
      x: this.p1.x + this.d1.x * actualRoundCut,
      y: this.p1.y + this.d1.y * actualRoundCut,
    };
    const circleIntersection2: Point2D = {
      x: this.p1.x + this.d2.x * actualRoundCut,
      y: this.p1.y + this.d2.y * actualRoundCut,
    };

    const flanking0 = this.computeFlankingCurve(
      actualRoundCut,
      actualSmoothing0,
      this.p1,
      this.p0,
      circleIntersection0,
      circleIntersection2,
      center,
      actualR,
    );
    const flanking2 = reverseCubic(
      this.computeFlankingCurve(
        actualRoundCut,
        actualSmoothing1,
        this.p1,
        this.p2,
        circleIntersection2,
        circleIntersection0,
        center,
        actualR,
      ),
    );

    return [
      flanking0,
      circularArcCubic(
        center.x,
        center.y,
        flanking0[6],
        flanking0[7],
        flanking2[0],
        flanking2[1],
      ),
      flanking2,
    ];
  }

  private calculateActualSmoothingValue(allowedCut: number): number {
    if (allowedCut > this.expectedCut) {
      return this.smoothing;
    }
    if (allowedCut > this.expectedRoundCut) {
      return (
        (this.smoothing * (allowedCut - this.expectedRoundCut)) /
        (this.expectedCut - this.expectedRoundCut)
      );
    }
    return 0;
  }

  private computeFlankingCurve(
    actualRoundCut: number,
    actualSmoothingValues: number,
    corner: Point2D,
    sideStart: Point2D,
    circleSegmentIntersection: Point2D,
    otherCircleSegmentIntersection: Point2D,
    circleCenter: Point2D,
    actualR: number,
  ): CubicTuple {
    const sideDirection = directionVector(
      sideStart.x - corner.x,
      sideStart.y - corner.y,
    );
    const cutDist = actualRoundCut * (1 + actualSmoothingValues);
    const curveStart: Point2D = {
      x: corner.x + sideDirection.x * cutDist,
      y: corner.y + sideDirection.y * cutDist,
    };
    const midIntersection: Point2D = {
      x: (circleSegmentIntersection.x + otherCircleSegmentIntersection.x) / 2,
      y: (circleSegmentIntersection.y + otherCircleSegmentIntersection.y) / 2,
    };
    const p = lerpPoint(
      circleSegmentIntersection,
      midIntersection,
      actualSmoothingValues,
    );
    const radialDir = directionVector(p.x - circleCenter.x, p.y - circleCenter.y);
    const curveEnd: Point2D = {
      x: circleCenter.x + radialDir.x * actualR,
      y: circleCenter.y + radialDir.y * actualR,
    };
    const circleTangent = rotate90({
      x: curveEnd.x - circleCenter.x,
      y: curveEnd.y - circleCenter.y,
    });
    const anchorEnd =
      lineIntersection(sideStart, sideDirection, curveEnd, circleTangent) ??
      circleSegmentIntersection;
    const anchorStart: Point2D = {
      x: (curveStart.x + anchorEnd.x * 2) / 3,
      y: (curveStart.y + anchorEnd.y * 2) / 3,
    };

    return [
      curveStart.x,
      curveStart.y,
      anchorStart.x,
      anchorStart.y,
      anchorEnd.x,
      anchorEnd.y,
      curveEnd.x,
      curveEnd.y,
    ];
  }
}

function ensureClockwiseVertices(vertices: RawVertex[]): RawVertex[] {
  let signedArea2 = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const curr = vertices[i].p;
    const next = vertices[(i + 1) % n].p;
    signedArea2 += curr.x * next.y - next.x * curr.y;
  }
  return signedArea2 < 0 ? vertices.slice().reverse() : vertices;
}

function isConvexVertex(prev: Point2D, curr: Point2D, next: Point2D): boolean {
  const v1x = curr.x - prev.x;
  const v1y = curr.y - prev.y;
  const v2x = next.x - curr.x;
  const v2y = next.y - curr.y;
  return v1x * v2y - v1y * v2x >= 0;
}

function buildRoundedPolygonFeatures(rawVertices: RawVertex[]): ShapeFeature[] {
  const vertices = ensureClockwiseVertices(dedupeVertices(rawVertices));
  const n = vertices.length;
  if (n < 3) return [];

  const roundedCorners: RoundedCornerBuilder[] = [];
  for (let i = 0; i < n; i++) {
    const prev = vertices[(i + n - 1) % n].p;
    const curr = vertices[i].p;
    const next = vertices[(i + 1) % n].p;
    roundedCorners.push(new RoundedCornerBuilder(prev, curr, next, vertices[i].r));
  }

  const cutAdjusts: Array<[number, number]> = [];
  for (let ix = 0; ix < n; ix++) {
    const nextIx = (ix + 1) % n;
    const expectedRoundCut =
      roundedCorners[ix].expectedRoundCut + roundedCorners[nextIx].expectedRoundCut;
    const expectedCut =
      roundedCorners[ix].expectedCut + roundedCorners[nextIx].expectedCut;
    const sideSize = Math.hypot(
      vertices[ix].p.x - vertices[nextIx].p.x,
      vertices[ix].p.y - vertices[nextIx].p.y,
    );

    if (expectedRoundCut > sideSize && expectedRoundCut > 1e-6) {
      cutAdjusts.push([sideSize / expectedRoundCut, 0]);
    } else if (expectedCut > sideSize && expectedCut - expectedRoundCut > 1e-6) {
      cutAdjusts.push([
        1,
        (sideSize - expectedRoundCut) / (expectedCut - expectedRoundCut),
      ]);
    } else {
      cutAdjusts.push([1, 1]);
    }
  }

  const corners: CubicTuple[][] = [];
  for (let i = 0; i < n; i++) {
    const [r0, c0] = cutAdjusts[(i + n - 1) % n];
    const [r1, c1] = cutAdjusts[i];
    const rc = roundedCorners[i];
    const allowedCut0 =
      rc.expectedRoundCut * r0 + (rc.expectedCut - rc.expectedRoundCut) * c0;
    const allowedCut1 =
      rc.expectedRoundCut * r1 + (rc.expectedCut - rc.expectedRoundCut) * c1;
    corners.push(rc.getCubics(allowedCut0, allowedCut1));
  }

  const features: ShapeFeature[] = [];
  for (let i = 0; i < n; i++) {
    const prev = vertices[(i + n - 1) % n].p;
    const curr = vertices[i].p;
    const next = vertices[(i + 1) % n].p;
    const convex = isConvexVertex(prev, curr, next);
    const cornerCubics = corners[i];
    const nextCornerCubics = corners[(i + 1) % n];

    features.push({
      type: "corner",
      convex,
      cubics: cornerCubics,
    });

    const edgeStart = cornerCubics[cornerCubics.length - 1];
    const edgeEnd = nextCornerCubics[0];
    features.push({
      type: "edge",
      cubics: [
        lineCubic(
          { x: edgeStart[6], y: edgeStart[7] },
          { x: edgeEnd[0], y: edgeEnd[1] },
        ),
      ],
    });
  }

  return features;
}

function transformFeatures(
  features: readonly ShapeFeature[],
  mapPoint: (x: number, y: number) => Point2D,
): ShapeFeature[] {
  return features.map((f) => {
    const mappedCubics: CubicTuple[] = f.cubics.map((c) => {
      const p0 = mapPoint(c[0], c[1]);
      const p1 = mapPoint(c[2], c[3]);
      const p2 = mapPoint(c[4], c[5]);
      const p3 = mapPoint(c[6], c[7]);
      return [p0.x, p0.y, p1.x, p1.y, p2.x, p2.y, p3.x, p3.y];
    });
    return f.type === "corner"
      ? { type: "corner", convex: f.convex, cubics: mappedCubics }
      : { type: "edge", cubics: mappedCubics };
  });
}

function normalizeAndOrientShapeFromFeatures(
  name: M3EShapeName,
  rawFeatures: readonly ShapeFeature[],
): NormalizedShapeData {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const f of rawFeatures) {
    for (const c of f.cubics) {
      for (let s = 0; s <= 16; s++) {
        const p = evalCubic(c, s / 16);
        if (p.x < minX) minX = p.x;
        if (p.y < minY) minY = p.y;
        if (p.x > maxX) maxX = p.x;
        if (p.y > maxY) maxY = p.y;
      }
    }
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const maxSide = Math.max(width, height, 1e-6);
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  const normalizedFeatures = transformFeatures(rawFeatures, (x, y) => ({
    x: (x - cx) / maxSide + 0.5,
    y: (y - cy) / maxSide + 0.5,
  }));

  const rawCubics: CubicTuple[] = [];
  for (let i = 0; i < normalizedFeatures.length; i++) {
    const f = normalizedFeatures[i];
    if (i === 0 && f.cubics.length === 3) {
      const [, secondSplit] = splitCubic(f.cubics[1], 0.5);
      for (const candidate of [secondSplit, f.cubics[2]]) {
        if (!isZeroLengthCubic(candidate)) rawCubics.push(candidate);
      }
    } else {
      for (const candidate of f.cubics) {
        if (!isZeroLengthCubic(candidate)) rawCubics.push(candidate);
      }
    }
  }
  if (normalizedFeatures.length > 0 && normalizedFeatures[0].cubics.length === 3) {
    const [firstSplit] = splitCubic(normalizedFeatures[0].cubics[1], 0.5);
    for (const candidate of [normalizedFeatures[0].cubics[0], firstSplit]) {
      if (!isZeroLengthCubic(candidate)) rawCubics.push(candidate);
    }
  }

  let cubics = rawCubics;
  if (cubics.length > 0) {
    const first = cubics[0];
    const last = cubics[cubics.length - 1];
    cubics = [
      ...cubics.slice(0, -1),
      [last[0], last[1], last[2], last[3], last[4], last[5], first[0], first[1]],
    ];
  }

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
    features: normalizedFeatures,
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
  return len;
}

interface ProgressableCornerFeature {
  readonly progress: number;
  readonly convex: boolean;
  readonly representativePoint: Point2D;
}

interface MeasuredCubic {
  readonly cubic: CubicTuple;
  readonly startOutlineProgress: number;
  readonly endOutlineProgress: number;
}

interface MeasuredPolygonData {
  readonly cubics: readonly MeasuredCubic[];
  readonly corners: readonly ProgressableCornerFeature[];
}

function measureShapePolygon(shape: NormalizedShapeData): MeasuredPolygonData {
  const seqCubics: CubicTuple[] = [];
  const featureToCubicIndices: Array<{
    feature: ShapeFeature;
    startIdx: number;
    endIdx: number;
  }> = [];

  const features = shape.features;
  if (features.length > 0 && features[0].cubics.length === 3) {
    const f0 = features[0];
    const [firstHalf, secondHalf] = splitCubic(f0.cubics[1], 0.5);
    const startIdx = seqCubics.length;
    seqCubics.push(secondHalf, f0.cubics[2]);
    for (let i = 1; i < features.length; i++) {
      const fi = features[i];
      const sIdx = seqCubics.length;
      for (const c of fi.cubics) seqCubics.push(c);
      featureToCubicIndices.push({
        feature: fi,
        startIdx: sIdx,
        endIdx: seqCubics.length - 1,
      });
    }
    seqCubics.push(f0.cubics[0], firstHalf);
    featureToCubicIndices.unshift({
      feature: f0,
      startIdx: seqCubics.length - 2,
      endIdx: startIdx + 1,
    });
  } else {
    for (const fi of features) {
      const sIdx = seqCubics.length;
      for (const c of fi.cubics) seqCubics.push(c);
      featureToCubicIndices.push({
        feature: fi,
        startIdx: sIdx,
        endIdx: seqCubics.length - 1,
      });
    }
  }

  const lengths = seqCubics.map((c) => cubicArcLength(c));
  const total = Math.max(
    1e-6,
    lengths.reduce((acc, v) => acc + v, 0),
  );
  const cumulative: number[] = [0];
  let acc = 0;
  for (let i = 0; i < lengths.length; i++) {
    acc += lengths[i] / total;
    cumulative.push(i === lengths.length - 1 ? 1 : acc);
  }

  const corners: ProgressableCornerFeature[] = [];
  for (const entry of featureToCubicIndices) {
    if (entry.feature.type !== "corner") continue;
    const fCubics = entry.feature.cubics;
    const first = fCubics[0];
    const last = fCubics[fCubics.length - 1];
    const rep: Point2D = {
      x: (first[0] + last[6]) / 2,
      y: (first[1] + last[7]) / 2,
    };
    let progress: number;
    if (entry.startIdx > entry.endIdx) {
      progress = 0;
    } else {
      progress = positiveModulo(
        (cumulative[entry.startIdx] + cumulative[entry.endIdx + 1]) / 2,
        1,
      );
    }
    corners.push({
      progress,
      convex: entry.feature.convex,
      representativePoint: rep,
    });
  }

  const measuredCubics: MeasuredCubic[] = [];
  let prevEnd = 0;
  for (let i = 0; i < seqCubics.length; i++) {
    const startP = cumulative[i];
    const endP = cumulative[i + 1];
    if (endP - startP > DISTANCE_EPSILON) {
      measuredCubics.push({
        cubic: seqCubics[i],
        startOutlineProgress: prevEnd,
        endOutlineProgress: endP,
      });
      prevEnd = endP;
    }
  }

  if (measuredCubics.length > 0) {
    const lastIdx = measuredCubics.length - 1;
    measuredCubics[lastIdx] = {
      ...measuredCubics[lastIdx],
      endOutlineProgress: 1,
    };
  }

  return { cubics: measuredCubics, corners };
}

function progressDistance(p1: number, p2: number): number {
  const diff = Math.abs(p1 - p2);
  return Math.min(diff, 1 - diff);
}

function progressInRange(
  progress: number,
  progressFrom: number,
  progressTo: number,
): boolean {
  if (progressTo >= progressFrom) {
    return progress >= progressFrom && progress <= progressTo;
  }
  return progress >= progressFrom || progress <= progressTo;
}

class CyclicDoubleMapper {
  private readonly source: number[];
  private readonly target: number[];

  constructor(mappings: ReadonlyArray<readonly [number, number]>) {
    this.source = mappings.map((m) => m[0]);
    this.target = mappings.map((m) => m[1]);
  }

  map(x: number): number {
    return this.linearMap(this.source, this.target, positiveModulo(x, 1));
  }

  mapBack(y: number): number {
    return this.linearMap(this.target, this.source, positiveModulo(y, 1));
  }

  private linearMap(xValues: number[], yValues: number[], x: number): number {
    const n = xValues.length;
    if (n === 0) return x;
    let segIdx = 0;
    for (let i = 0; i < n; i++) {
      if (progressInRange(x, xValues[i], xValues[(i + 1) % n])) {
        segIdx = i;
        break;
      }
    }
    const nextIdx = (segIdx + 1) % n;
    const segSizeX = positiveModulo(xValues[nextIdx] - xValues[segIdx], 1);
    const segSizeY = positiveModulo(yValues[nextIdx] - yValues[segIdx], 1);
    const posInSeg =
      segSizeX < 1e-5
        ? 0.5
        : positiveModulo(x - xValues[segIdx], 1) / segSizeX;
    return positiveModulo(yValues[segIdx] + segSizeY * posInSeg, 1);
  }
}

function buildFeatureMapper(
  corners1: readonly ProgressableCornerFeature[],
  corners2: readonly ProgressableCornerFeature[],
): CyclicDoubleMapper {
  const candidates: Array<{
    distSq: number;
    f1: ProgressableCornerFeature;
    f2: ProgressableCornerFeature;
  }> = [];

  for (const f1 of corners1) {
    for (const f2 of corners2) {
      if (f1.convex !== f2.convex) continue;
      const dx = f1.representativePoint.x - f2.representativePoint.x;
      const dy = f1.representativePoint.y - f2.representativePoint.y;
      candidates.push({ distSq: dx * dx + dy * dy, f1, f2 });
    }
  }
  candidates.sort((a, b) => a.distSq - b.distSq);

  if (candidates.length === 0) {
    return new CyclicDoubleMapper([
      [0, 0],
      [0.5, 0.5],
    ]);
  }
  if (candidates.length === 1) {
    const { f1, f2 } = candidates[0];
    return new CyclicDoubleMapper([
      [f1.progress, f2.progress],
      [positiveModulo(f1.progress + 0.5, 1), positiveModulo(f2.progress + 0.5, 1)],
    ]);
  }

  const mapping: Array<[number, number]> = [];
  const used1 = new Set<ProgressableCornerFeature>();
  const used2 = new Set<ProgressableCornerFeature>();

  for (const { f1, f2 } of candidates) {
    if (used1.has(f1) || used2.has(f2)) continue;

    let insertionIndex = 0;
    while (insertionIndex < mapping.length && mapping[insertionIndex][0] < f1.progress) {
      insertionIndex++;
    }
    if (
      insertionIndex < mapping.length &&
      Math.abs(mapping[insertionIndex][0] - f1.progress) < 1e-7
    ) {
      continue;
    }

    const n = mapping.length;
    if (n >= 1) {
      const [before1, before2] = mapping[(insertionIndex + n - 1) % n];
      const [after1, after2] = mapping[insertionIndex % n];

      if (
        progressDistance(f1.progress, before1) < DISTANCE_EPSILON ||
        progressDistance(f1.progress, after1) < DISTANCE_EPSILON ||
        progressDistance(f2.progress, before2) < DISTANCE_EPSILON ||
        progressDistance(f2.progress, after2) < DISTANCE_EPSILON
      ) {
        continue;
      }

      if (n > 1 && !progressInRange(f2.progress, before2, after2)) {
        continue;
      }
    }

    mapping.splice(insertionIndex, 0, [f1.progress, f2.progress]);
    used1.add(f1);
    used2.add(f2);
  }

  if (mapping.length < 2) {
    if (mapping.length === 1) {
      const [p1, p2] = mapping[0];
      return new CyclicDoubleMapper([
        [p1, p2],
        [positiveModulo(p1 + 0.5, 1), positiveModulo(p2 + 0.5, 1)],
      ]);
    }
    return new CyclicDoubleMapper([
      [0, 0],
      [0.5, 0.5],
    ]);
  }

  return new CyclicDoubleMapper(mapping);
}

function cutMeasuredCubicAtProgress(
  mc: MeasuredCubic,
  cutOutlineProgress: number,
): [MeasuredCubic, MeasuredCubic] {
  const clamped = Math.max(
    mc.startOutlineProgress,
    Math.min(mc.endOutlineProgress, cutOutlineProgress),
  );
  const span = Math.max(1e-7, mc.endOutlineProgress - mc.startOutlineProgress);
  const localT = Math.max(0, Math.min(1, (clamped - mc.startOutlineProgress) / span));
  const [c1, c2] = splitCubic(mc.cubic, localT);
  return [
    {
      cubic: c1,
      startOutlineProgress: mc.startOutlineProgress,
      endOutlineProgress: clamped,
    },
    {
      cubic: c2,
      startOutlineProgress: clamped,
      endOutlineProgress: mc.endOutlineProgress,
    },
  ];
}

function cutAndShiftMeasuredCubics(
  cubics: readonly MeasuredCubic[],
  cutPoint: number,
): MeasuredCubic[] {
  if (cutPoint < 1e-6 || cutPoint > 1 - 1e-6 || cubics.length === 0) {
    return cubics.slice();
  }

  let targetIndex = cubics.findIndex(
    (c) => cutPoint >= c.startOutlineProgress && cutPoint <= c.endOutlineProgress,
  );
  if (targetIndex < 0) targetIndex = 0;

  const target = cubics[targetIndex];
  const [b1, b2] = cutMeasuredCubicAtProgress(target, cutPoint);

  const orderedCubics: CubicTuple[] = [b2.cubic];
  for (let i = 1; i < cubics.length; i++) {
    orderedCubics.push(cubics[(targetIndex + i) % cubics.length].cubic);
  }
  orderedCubics.push(b1.cubic);

  const orderedProgress: number[] = [];
  const totalCount = cubics.length + 2;
  for (let index = 0; index < totalCount; index++) {
    if (index === 0) {
      orderedProgress.push(0);
    } else if (index === totalCount - 1) {
      orderedProgress.push(1);
    } else {
      const cubicIndex = (targetIndex + index - 1) % cubics.length;
      orderedProgress.push(
        positiveModulo(cubics[cubicIndex].endOutlineProgress - cutPoint, 1),
      );
    }
  }

  const out: MeasuredCubic[] = [];
  for (let i = 0; i < orderedCubics.length; i++) {
    const s = orderedProgress[i];
    const e = orderedProgress[i + 1];
    if (e - s > 1e-6) {
      out.push({
        cubic: orderedCubics[i],
        startOutlineProgress: s,
        endOutlineProgress: e,
      });
    }
  }
  if (out.length > 0) {
    out[0] = { ...out[0], startOutlineProgress: 0 };
    out[out.length - 1] = { ...out[out.length - 1], endOutlineProgress: 1 };
  }
  return out;
}

export function createMorphPair(
  startShape: NormalizedShapeData,
  endShape: NormalizedShapeData,
): MorphPair {
  const mp1 = measureShapePolygon(startShape);
  const mp2 = measureShapePolygon(endShape);
  const doubleMapper = buildFeatureMapper(mp1.corners, mp2.corners);
  const polygon2CutPoint = doubleMapper.map(0);

  const bs1 = mp1.cubics;
  const bs2 = cutAndShiftMeasuredCubics(mp2.cubics, polygon2CutPoint);

  const startCubics: CubicTuple[] = [];
  const endCubics: CubicTuple[] = [];

  let i1 = 0;
  let i2 = 0;
  let b1: MeasuredCubic | undefined = bs1[i1++];
  let b2: MeasuredCubic | undefined = bs2[i2++];

  let guard = 0;
  while (b1 && b2 && guard < 1024) {
    guard++;
    const b1a = i1 === bs1.length ? 1 : b1.endOutlineProgress;
    const b2a =
      i2 === bs2.length
        ? 1
        : doubleMapper.mapBack(
            positiveModulo(b2.endOutlineProgress + polygon2CutPoint, 1),
          );
    const minb = Math.min(b1a, b2a);

    let seg1: MeasuredCubic;
    let newb1: MeasuredCubic | undefined;
    if (b1a > minb + ANGLE_EPSILON) {
      [seg1, newb1] = cutMeasuredCubicAtProgress(b1, minb);
    } else {
      seg1 = b1;
      newb1 = bs1[i1++];
    }

    let seg2: MeasuredCubic;
    let newb2: MeasuredCubic | undefined;
    if (b2a > minb + ANGLE_EPSILON) {
      const mappedCut = positiveModulo(
        doubleMapper.map(minb) - polygon2CutPoint,
        1,
      );
      [seg2, newb2] = cutMeasuredCubicAtProgress(b2, mappedCut);
    } else {
      seg2 = b2;
      newb2 = bs2[i2++];
    }

    startCubics.push(seg1.cubic);
    endCubics.push(seg2.cubic);
    b1 = newb1;
    b2 = newb2;
  }

  if (startCubics.length > 0 && endCubics.length > 0) {
    const sFirst = startCubics[0];
    const sLast = startCubics[startCubics.length - 1];
    startCubics[startCubics.length - 1] = [
      sLast[0],
      sLast[1],
      sLast[2],
      sLast[3],
      sLast[4],
      sLast[5],
      sFirst[0],
      sFirst[1],
    ];
    const eFirst = endCubics[0];
    const eLast = endCubics[endCubics.length - 1];
    endCubics[endCubics.length - 1] = [
      eLast[0],
      eLast[1],
      eLast[2],
      eLast[3],
      eLast[4],
      eLast[5],
      eFirst[0],
      eFirst[1],
    ];
  }

  return {
    from: startShape.name,
    to: endShape.name,
    startCubics,
    endCubics,
  };
}

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

export function cubicsToSvgPath(
  cubics: readonly CubicTuple[],
  viewportSize = 48,
  scaleFactor = 1,
): string {
  if (cubics.length === 0) return "";

  const scaled = viewportSize * scaleFactor;
  const halfViewport = viewportSize / 2;
  const fmt = (v: number) =>
    Number(((v - 0.5) * scaled + halfViewport).toFixed(2));

  const first = cubics[0];
  const parts = [`M ${fmt(first[0])} ${fmt(first[1])}`];
  for (const c of cubics) {
    parts.push(
      `C ${fmt(c[2])} ${fmt(c[3])}, ${fmt(c[4])} ${fmt(c[5])}, ${fmt(c[6])} ${fmt(c[7])}`,
    );
  }
  parts.push("Z");
  return parts.join(" ");
}

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

export function rotateNormalizedShape(
  shape: NormalizedShapeData,
  deg: number,
): NormalizedShapeData {
  const rotatedFeatures = transformFeatures(shape.features, (x, y) =>
    rotatePointDeg({ x, y }, deg, { x: 0.5, y: 0.5 }),
  );
  return normalizeAndOrientShapeFromFeatures(shape.name, rotatedFeatures);
}

function buildNamedPolygon(name: M3EShapeName, vertices: RawVertex[]): NormalizedShapeData {
  return normalizeAndOrientShapeFromFeatures(name, buildRoundedPolygonFeatures(vertices));
}

const SHAPE_BUILDERS: Record<M3EShapeName, () => NormalizedShapeData> = {
  circle: () => buildNamedPolygon("circle", regularPolygonVertices(10, cornerRound100)),
  square: () => buildNamedPolygon("square", rectangleVertices(1, 1, cornerRound30)),
  slanted: () =>
    buildNamedPolygon(
      "slanted",
      doRepeat(
        [
          { p: { x: 0.926, y: 0.97 }, r: { radius: 0.189, smoothing: 0.811 } },
          { p: { x: -0.021, y: 0.967 }, r: { radius: 0.187, smoothing: 0.057 } },
        ],
        2,
      ),
    ),
  arch: () =>
    buildNamedPolygon(
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
  fan: () =>
    buildNamedPolygon(
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
  arrow: () =>
    buildNamedPolygon(
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
  semiCircle: () =>
    buildNamedPolygon(
      "semiCircle",
      rectangleVertices(1.6, 1.0, [
        cornerRound20,
        cornerRound20,
        cornerRound100,
        cornerRound100,
      ]),
    ),
  oval: () =>
    normalizeAndOrientShapeFromFeatures(
      "oval",
      transformFeatures(
        buildRoundedPolygonFeatures(regularPolygonVertices(10, cornerRound100)),
        (x, y) => rotatePointDeg({ x, y: y * 0.64 }, -45, { x: 0, y: 0 }),
      ),
    ),
  pill: () =>
    buildNamedPolygon(
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
  triangle: () =>
    buildNamedPolygon(
      "triangle",
      rotateVertices(regularPolygonVertices(3, cornerRound20), -90),
    ),
  diamond: () =>
    buildNamedPolygon(
      "diamond",
      doRepeat(
        [
          { p: { x: 0.5, y: 1.096 }, r: { radius: 0.151, smoothing: 0.524 } },
          { p: { x: 0.04, y: 0.5 }, r: { radius: 0.159 } },
        ],
        2,
      ),
    ),
  clamShell: () =>
    buildNamedPolygon(
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
  pentagon: () =>
    buildNamedPolygon(
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
  gem: () =>
    buildNamedPolygon(
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
  sunny: () => buildNamedPolygon("sunny", starPolygonVertices(8, 0.8, cornerRound15)),
  verySunny: () =>
    buildNamedPolygon(
      "verySunny",
      doRepeat(
        [
          { p: { x: 0.5, y: 1.08 }, r: { radius: 0.085 } },
          { p: { x: 0.358, y: 0.843 }, r: { radius: 0.085 } },
        ],
        8,
      ),
    ),
  cookie4Sided: () =>
    buildNamedPolygon(
      "cookie4Sided",
      doRepeat(
        [
          { p: { x: 1.237, y: 1.236 }, r: { radius: 0.258 } },
          { p: { x: 0.5, y: 0.918 }, r: { radius: 0.233 } },
        ],
        4,
      ),
    ),
  cookie6Sided: () =>
    buildNamedPolygon(
      "cookie6Sided",
      doRepeat(
        [
          { p: { x: 0.723, y: 0.884 }, r: { radius: 0.394 } },
          { p: { x: 0.5, y: 1.099 }, r: { radius: 0.398 } },
        ],
        6,
      ),
    ),
  cookie7Sided: () =>
    buildNamedPolygon(
      "cookie7Sided",
      rotateVertices(starPolygonVertices(7, 0.75, cornerRound50), -90),
    ),
  cookie9Sided: () =>
    buildNamedPolygon(
      "cookie9Sided",
      rotateVertices(starPolygonVertices(9, 0.8, cornerRound50), -90),
    ),
  cookie12Sided: () =>
    buildNamedPolygon(
      "cookie12Sided",
      rotateVertices(starPolygonVertices(12, 0.8, cornerRound50), -90),
    ),
  ghostish: () =>
    buildNamedPolygon(
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
  clover4Leaf: () =>
    buildNamedPolygon(
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
  clover8Leaf: () =>
    buildNamedPolygon(
      "clover8Leaf",
      doRepeat(
        [
          { p: { x: 0.5, y: 0.036 }, r: UNROUNDED },
          { p: { x: 0.758, y: -0.101 }, r: { radius: 0.209 } },
        ],
        8,
      ),
    ),
  burst: () =>
    buildNamedPolygon(
      "burst",
      doRepeat(
        [
          { p: { x: 0.5, y: -0.006 }, r: { radius: 0.006 } },
          { p: { x: 0.592, y: 0.158 }, r: { radius: 0.006 } },
        ],
        12,
      ),
    ),
  softBurst: () =>
    buildNamedPolygon(
      "softBurst",
      doRepeat(
        [
          { p: { x: 0.193, y: 0.277 }, r: { radius: 0.053 } },
          { p: { x: 0.176, y: 0.055 }, r: { radius: 0.053 } },
        ],
        10,
      ),
    ),
  boom: () =>
    buildNamedPolygon(
      "boom",
      doRepeat(
        [
          { p: { x: 0.457, y: 0.296 }, r: { radius: 0.007 } },
          { p: { x: 0.5, y: -0.051 }, r: { radius: 0.007 } },
        ],
        15,
      ),
    ),
  softBoom: () =>
    buildNamedPolygon(
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
  flower: () =>
    buildNamedPolygon(
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
  puffy: () =>
    normalizeAndOrientShapeFromFeatures(
      "puffy",
      transformFeatures(
        buildRoundedPolygonFeatures(
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
        (x, y) => ({ x, y: y * 0.742 }),
      ),
    ),
  puffyDiamond: () =>
    buildNamedPolygon(
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
  pixelCircle: () =>
    buildNamedPolygon(
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
  pixelTriangle: () =>
    buildNamedPolygon(
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
  bun: () =>
    buildNamedPolygon(
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
  heart: () =>
    buildNamedPolygon(
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

const SHAPE_CACHE = new Map<M3EShapeName, NormalizedShapeData>();

export function getMaterialShape(name: M3EShapeName): NormalizedShapeData {
  const cached = SHAPE_CACHE.get(name);
  if (cached) return cached;
  const builder = SHAPE_BUILDERS[name] ?? SHAPE_BUILDERS.circle;
  const built = builder();
  SHAPE_CACHE.set(built.name, built);
  return built;
}

function createAllMaterialShapes(): Record<M3EShapeName, NormalizedShapeData> {
  const out = {} as Record<M3EShapeName, NormalizedShapeData>;
  for (const name of M3E_ALL_SHAPE_NAMES) {
    out[name] = getMaterialShape(name);
  }
  return out;
}

export const MATERIAL_SHAPES: Record<M3EShapeName, NormalizedShapeData> =
  /* @__PURE__ */ createAllMaterialShapes();

const MORPH_PAIR_CACHE = new Map<string, MorphPair>();

export function getShapeMorphPair(
  from: M3EShapeName,
  to: M3EShapeName,
): MorphPair {
  const key = `${from}->${to}`;
  const cached = MORPH_PAIR_CACHE.get(key);
  if (cached) return cached;
  const pair = createMorphPair(getMaterialShape(from), getMaterialShape(to));
  MORPH_PAIR_CACHE.set(key, pair);
  return pair;
}
