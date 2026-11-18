import { SHAPE_CORNER_TOKENS } from "./topology.js";

export const CAROUSEL_TOKENS = {
  gap: 8,
  focalRadius: SHAPE_CORNER_TOKENS.extraLarge,
  mediumRadius: SHAPE_CORNER_TOKENS.largeIncreased,
  peekRadius: SHAPE_CORNER_TOKENS.large,
  minPeekWidth: 48,
  minSmallItemSize: 40,
  maxSmallItemSize: 56,
  defaultPreferredWidth: 220,
  anchorSize: 10,
} as const;

export type CarouselVariant =
  | "multi-browse"
  | "hero"
  | "centered-hero"
  | "uncontained";

export interface CarouselKeyline {
  readonly size: number;
  readonly offset: number;
  readonly unadjustedOffset: number;
  readonly isFocal: boolean;
  readonly isAnchor: boolean;
  readonly isPivot: boolean;
  readonly cutoff: number;
}

export interface CarouselKeylineList {
  readonly keylines: readonly CarouselKeyline[];
  readonly pivotIndex: number;
  readonly firstFocalIndex: number;
  readonly lastFocalIndex: number;
  readonly firstNonAnchorIndex: number;
  readonly lastNonAnchorIndex: number;
  readonly minSize: number;
  readonly maxSize: number;
}

export interface CarouselKeylineStrategy {
  readonly isValid: boolean;
  readonly variant: CarouselVariant;
  readonly availableSpace: number;
  readonly itemSpacing: number;
  readonly itemMainAxisSize: number;
  readonly minItemSize: number;
  readonly maxItemSize: number;
  readonly defaultKeylines: CarouselKeylineList;
  readonly startKeylineSteps: readonly CarouselKeylineList[];
  readonly endKeylineSteps: readonly CarouselKeylineList[];
  readonly startShiftDistance: number;
  readonly endShiftDistance: number;
  readonly startShiftPoints: readonly number[];
  readonly endShiftPoints: readonly number[];
}

export interface CarouselItemFrame {
  readonly index: number;
  readonly slotWidth: number;
  readonly maskWidth: number;
  readonly offsetDelta: number;
  readonly cornerRadius: number;
  readonly prominence: number;
  readonly zIndex: number;
  readonly isFocal: boolean;
}

function lerpScalar(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpRange(
  outputMin: number,
  outputMax: number,
  inputMin: number,
  inputMax: number,
  value: number,
): number {
  if (inputMax <= inputMin) return outputMax;
  if (value <= inputMin) return outputMin;
  if (value >= inputMax) return outputMax;
  return lerpScalar(
    outputMin,
    outputMax,
    (value - inputMin) / (inputMax - inputMin),
  );
}

function buildKeylineList(
  carouselMainAxisSize: number,
  itemSpacing: number,
  pivotIndex: number,
  pivotOffset: number,
  specs: readonly { readonly size: number; readonly isAnchor: boolean }[],
): CarouselKeylineList {
  if (specs.length === 0 || carouselMainAxisSize <= 0) {
    return {
      keylines: [],
      pivotIndex: -1,
      firstFocalIndex: -1,
      lastFocalIndex: -1,
      firstNonAnchorIndex: -1,
      lastNonAnchorIndex: -1,
      minSize: 0,
      maxSize: 0,
    };
  }

  let maxSize = 0;
  let minSize = Number.POSITIVE_INFINITY;
  let firstNonAnchorIndex = -1;
  let lastNonAnchorIndex = -1;

  for (let i = 0; i < specs.length; i++) {
    const s = specs[i]!;
    if (!s.isAnchor) {
      if (firstNonAnchorIndex === -1) firstNonAnchorIndex = i;
      lastNonAnchorIndex = i;
      if (s.size > maxSize) maxSize = s.size;
      if (s.size < minSize) minSize = s.size;
    }
  }
  if (!Number.isFinite(minSize)) minSize = maxSize;

  let firstFocalIndex = -1;
  let lastFocalIndex = -1;
  for (let i = 0; i < specs.length; i++) {
    const s = specs[i]!;
    if (!s.isAnchor && Math.abs(s.size - maxSize) < 0.5) {
      if (firstFocalIndex === -1) firstFocalIndex = i;
      lastFocalIndex = i;
    } else if (firstFocalIndex !== -1) {
      break;
    }
  }
  if (firstFocalIndex === -1) {
    firstFocalIndex = Math.max(0, firstNonAnchorIndex);
    lastFocalIndex = firstFocalIndex;
  }

  const safePivot = Math.max(0, Math.min(specs.length - 1, pivotIndex));
  const stepSpan = maxSize + itemSpacing;
  const rawOffsets = new Array<number>(specs.length).fill(0);
  const unadjustedOffsets = new Array<number>(specs.length).fill(0);
  const cutoffs = new Array<number>(specs.length).fill(0);

  rawOffsets[safePivot] = pivotOffset;
  unadjustedOffsets[safePivot] = pivotOffset;

  for (let i = safePivot - 1; i >= 0; i--) {
    const nextSpec = specs[i + 1]!;
    const currSpec = specs[i]!;
    rawOffsets[i] =
      rawOffsets[i + 1]! - nextSpec.size / 2 - itemSpacing - currSpec.size / 2;
    unadjustedOffsets[i] = unadjustedOffsets[i + 1]! - stepSpan;
  }

  for (let i = safePivot + 1; i < specs.length; i++) {
    const prevSpec = specs[i - 1]!;
    const currSpec = specs[i]!;
    rawOffsets[i] =
      rawOffsets[i - 1]! + prevSpec.size / 2 + itemSpacing + currSpec.size / 2;
    unadjustedOffsets[i] = unadjustedOffsets[i - 1]! + stepSpan;
  }

  for (let i = 0; i < specs.length; i++) {
    const s = specs[i]!;
    if (s.isAnchor) {
      cutoffs[i] = 0;
      continue;
    }
    const left = rawOffsets[i]! - s.size / 2;
    const right = rawOffsets[i]! + s.size / 2;
    const leftCut = Math.max(0, -left);
    const rightCut = Math.max(0, right - carouselMainAxisSize);
    cutoffs[i] = leftCut + rightCut;
  }

  const keylines: CarouselKeyline[] = specs.map((s, i) => ({
    size: s.size,
    offset: rawOffsets[i]!,
    unadjustedOffset: unadjustedOffsets[i]!,
    isFocal: i >= firstFocalIndex && i <= lastFocalIndex,
    isAnchor: s.isAnchor,
    isPivot: i === safePivot,
    cutoff: cutoffs[i]!,
  }));

  return {
    keylines,
    pivotIndex: safePivot,
    firstFocalIndex,
    lastFocalIndex,
    firstNonAnchorIndex,
    lastNonAnchorIndex,
    minSize,
    maxSize,
  };
}

function moveSpecItem<T>(arr: readonly T[], src: number, dst: number): T[] {
  const next = arr.slice();
  const [moved] = next.splice(src, 1);
  if (moved !== undefined) {
    next.splice(dst, 0, moved);
  }
  return next;
}

function moveKeylineAndShift(
  from: CarouselKeylineList,
  srcIndex: number,
  dstIndex: number,
  carouselMainAxisSize: number,
  itemSpacing: number,
): CarouselKeylineList {
  const pivotDir = srcIndex > dstIndex ? 1 : -1;
  const srcKeyline = from.keylines[srcIndex]!;
  const pivotDelta =
    (srcKeyline.size - srcKeyline.cutoff + itemSpacing) * pivotDir;
  const newPivotIndex = from.pivotIndex + pivotDir;
  const newPivotOffset = from.keylines[from.pivotIndex]!.offset + pivotDelta;
  const movedSpecs = moveSpecItem(from.keylines, srcIndex, dstIndex).map(
    (k) => ({ size: k.size, isAnchor: k.isAnchor }),
  );
  return buildKeylineList(
    carouselMainAxisSize,
    itemSpacing,
    newPivotIndex,
    newPivotOffset,
    movedSpecs,
  );
}

function buildStartSteps(
  defaultKeylines: CarouselKeylineList,
  carouselMainAxisSize: number,
  itemSpacing: number,
): CarouselKeylineList[] {
  if (defaultKeylines.keylines.length === 0) return [];
  const steps: CarouselKeylineList[] = [defaultKeylines];
  const firstFocal = defaultKeylines.keylines[defaultKeylines.firstFocalIndex]!;
  const isAtStart =
    Math.abs(firstFocal.offset - firstFocal.size / 2) < 0.5 &&
    defaultKeylines.firstFocalIndex === defaultKeylines.firstNonAnchorIndex;
  if (isAtStart) return steps;

  const startIndex = defaultKeylines.firstNonAnchorIndex;
  const endIndex = defaultKeylines.firstFocalIndex;
  const numberOfSteps = endIndex - startIndex;

  for (let i = 0; i < numberOfSteps; i++) {
    const prevStep = steps[steps.length - 1]!;
    const originalItemIndex = startIndex + i;
    let dstIndex = defaultKeylines.lastNonAnchorIndex;
    if (originalItemIndex > startIndex) {
      const neighborSize = defaultKeylines.keylines[originalItemIndex - 1]!.size;
      let matchIdx = prevStep.lastNonAnchorIndex + 1;
      for (
        let j = prevStep.lastFocalIndex + 1;
        j <= prevStep.lastNonAnchorIndex;
        j++
      ) {
        if (Math.abs(prevStep.keylines[j]!.size - neighborSize) < 0.5) {
          matchIdx = j;
          break;
        }
      }
      dstIndex = Math.max(
        prevStep.lastFocalIndex,
        Math.min(prevStep.lastNonAnchorIndex, matchIdx - 1),
      );
    }
    steps.push(
      moveKeylineAndShift(
        prevStep,
        defaultKeylines.firstNonAnchorIndex,
        dstIndex,
        carouselMainAxisSize,
        itemSpacing,
      ),
    );
  }
  return steps;
}

function buildEndSteps(
  defaultKeylines: CarouselKeylineList,
  carouselMainAxisSize: number,
  itemSpacing: number,
): CarouselKeylineList[] {
  if (defaultKeylines.keylines.length === 0) return [];
  const steps: CarouselKeylineList[] = [defaultKeylines];
  const lastFocal = defaultKeylines.keylines[defaultKeylines.lastFocalIndex]!;
  const isAtEnd =
    Math.abs(lastFocal.offset + lastFocal.size / 2 - carouselMainAxisSize) <
      0.5 &&
    defaultKeylines.lastFocalIndex === defaultKeylines.lastNonAnchorIndex;
  if (isAtEnd) return steps;

  const startIndex = defaultKeylines.lastFocalIndex;
  const endIndex = defaultKeylines.lastNonAnchorIndex;
  const numberOfSteps = endIndex - startIndex;

  if (numberOfSteps <= 0 && lastFocal.cutoff > 0) {
    const shiftedPivotOffset =
      defaultKeylines.keylines[defaultKeylines.pivotIndex]!.offset -
      lastFocal.cutoff;
    steps.push(
      buildKeylineList(
        carouselMainAxisSize,
        itemSpacing,
        defaultKeylines.pivotIndex,
        shiftedPivotOffset,
        defaultKeylines.keylines.map((k) => ({
          size: k.size,
          isAnchor: k.isAnchor,
        })),
      ),
    );
    return steps;
  }

  for (let i = 0; i < numberOfSteps; i++) {
    const prevStep = steps[steps.length - 1]!;
    const originalItemIndex = endIndex - i;
    let dstIndex = defaultKeylines.firstNonAnchorIndex;
    if (originalItemIndex < defaultKeylines.lastNonAnchorIndex) {
      const neighborSize = defaultKeylines.keylines[originalItemIndex + 1]!.size;
      let matchIdx = prevStep.firstNonAnchorIndex - 1;
      for (
        let j = prevStep.firstFocalIndex - 1;
        j >= prevStep.firstNonAnchorIndex;
        j--
      ) {
        if (Math.abs(prevStep.keylines[j]!.size - neighborSize) < 0.5) {
          matchIdx = j;
          break;
        }
      }
      dstIndex = Math.max(
        prevStep.firstNonAnchorIndex,
        Math.min(prevStep.firstFocalIndex, matchIdx + 1),
      );
    }
    steps.push(
      moveKeylineAndShift(
        prevStep,
        defaultKeylines.lastNonAnchorIndex,
        dstIndex,
        carouselMainAxisSize,
        itemSpacing,
      ),
    );
  }
  return steps;
}

function buildShiftPoints(
  totalShiftDistance: number,
  steps: readonly CarouselKeylineList[],
  isShiftingLeft: boolean,
): number[] {
  if (totalShiftDistance <= 0 || steps.length === 0) return [0];
  const points = [0];
  for (let i = 1; i < steps.length; i++) {
    const prev = steps[i - 1]!.keylines;
    const curr = steps[i]!.keylines;
    const dist = isShiftingLeft
      ? curr[0]!.unadjustedOffset - prev[0]!.unadjustedOffset
      : prev[prev.length - 1]!.unadjustedOffset -
        curr[curr.length - 1]!.unadjustedOffset;
    const pct = dist / totalShiftDistance;
    points.push(i === steps.length - 1 ? 1 : (points[i - 1] ?? 0) + pct);
  }
  return points;
}

function lerpKeyline(
  a: CarouselKeyline,
  b: CarouselKeyline,
  t: number,
): CarouselKeyline {
  return {
    size: lerpScalar(a.size, b.size, t),
    offset: lerpScalar(a.offset, b.offset, t),
    unadjustedOffset: lerpScalar(a.unadjustedOffset, b.unadjustedOffset, t),
    isFocal: t < 0.5 ? a.isFocal : b.isFocal,
    isAnchor: t < 0.5 ? a.isAnchor : b.isAnchor,
    isPivot: t < 0.5 ? a.isPivot : b.isPivot,
    cutoff: lerpScalar(a.cutoff, b.cutoff, t),
  };
}

function lerpKeylineList(
  from: CarouselKeylineList,
  to: CarouselKeylineList,
  t: number,
): CarouselKeylineList {
  const keylines = from.keylines.map((k, idx) =>
    lerpKeyline(k, to.keylines[idx] ?? k, t),
  );
  return {
    keylines,
    pivotIndex: t < 0.5 ? from.pivotIndex : to.pivotIndex,
    firstFocalIndex: t < 0.5 ? from.firstFocalIndex : to.firstFocalIndex,
    lastFocalIndex: t < 0.5 ? from.lastFocalIndex : to.lastFocalIndex,
    firstNonAnchorIndex:
      t < 0.5 ? from.firstNonAnchorIndex : to.firstNonAnchorIndex,
    lastNonAnchorIndex:
      t < 0.5 ? from.lastNonAnchorIndex : to.lastNonAnchorIndex,
    minSize: lerpScalar(from.minSize, to.minSize, t),
    maxSize: lerpScalar(from.maxSize, to.maxSize, t),
  };
}

interface CarouselArrangement {
  readonly priority: number;
  readonly smallSize: number;
  readonly smallCount: number;
  readonly mediumSize: number;
  readonly mediumCount: number;
  readonly largeSize: number;
  readonly largeCount: number;
}

// Port of AOSP carousel/Arrangement.kt.
function arrangementCost(a: CarouselArrangement, targetLargeSize: number): number {
  const valid =
    a.largeCount > 0 && a.smallCount > 0 && a.mediumCount > 0
      ? a.largeSize > a.mediumSize && a.mediumSize > a.smallSize
      : a.largeCount > 0 && a.smallCount > 0
        ? a.largeSize > a.smallSize
        : true;
  return valid ? Math.abs(targetLargeSize - a.largeSize) * a.priority : Number.MAX_VALUE;
}

function fitArrangement(
  priority: number,
  availableSpace: number,
  itemSpacing: number,
  smallCount: number,
  smallSize: number,
  minSmallSize: number,
  maxSmallSize: number,
  mediumCount: number,
  mediumSize: number,
  largeCount: number,
  largeSize: number,
): CarouselArrangement {
  const totalItemCount = largeCount + mediumCount + smallCount;
  const space = availableSpace - (totalItemCount - 1) * itemSpacing;
  let small = Math.min(maxSmallSize, Math.max(minSmallSize, smallSize));
  const delta = space - (largeSize * largeCount + mediumSize * mediumCount + small * smallCount);
  if (smallCount > 0 && delta > 0) {
    small += Math.min(delta / smallCount, maxSmallSize - small);
  } else if (smallCount > 0 && delta < 0) {
    small += Math.max(delta / smallCount, minSmallSize - small);
  }
  if (smallCount === 0) small = 0;
  let large =
    (space - (smallCount + mediumCount / 2) * small) / (largeCount + mediumCount / 2);
  let medium = (large + small) / 2;
  if (mediumCount > 0 && large !== largeSize) {
    const targetAdjustment = (largeSize - large) * largeCount;
    const distribute = Math.min(Math.abs(targetAdjustment), medium * 0.1 * mediumCount);
    if (targetAdjustment > 0) {
      medium -= distribute / mediumCount;
      large += distribute / largeCount;
    } else {
      medium += distribute / mediumCount;
      large -= distribute / largeCount;
    }
  }
  return {
    priority,
    smallSize: small,
    smallCount,
    mediumSize: medium,
    mediumCount,
    largeSize: large,
    largeCount,
  };
}

function findLowestCostArrangement(
  availableSpace: number,
  itemSpacing: number,
  targetSmallSize: number,
  minSmallSize: number,
  maxSmallSize: number,
  smallCounts: readonly number[],
  targetMediumSize: number,
  mediumCounts: readonly number[],
  targetLargeSize: number,
  largeCounts: readonly number[],
): CarouselArrangement | null {
  let best: CarouselArrangement | null = null;
  let priority = 1;
  for (const largeCount of largeCounts) {
    for (const mediumCount of mediumCounts) {
      for (const smallCount of smallCounts) {
        const a = fitArrangement(
          priority,
          availableSpace,
          itemSpacing,
          smallCount,
          targetSmallSize,
          minSmallSize,
          maxSmallSize,
          mediumCount,
          targetMediumSize,
          largeCount,
          targetLargeSize,
        );
        if (!best || arrangementCost(a, targetLargeSize) < arrangementCost(best, targetLargeSize)) {
          best = a;
          if (arrangementCost(best, targetLargeSize) === 0) return best;
        }
        priority++;
      }
    }
  }
  return best;
}

function descendingCounts(min: number, max: number): number[] {
  const out: number[] = [];
  for (let n = max; n >= min; n--) out.push(n);
  return out;
}

// AOSP Keylines.kt: multiBrowseKeylineList.
function multiBrowseArrangement(
  size: number,
  preferredItemSize: number,
  itemSpacing: number,
  itemCount: number,
  minSmall: number,
  maxSmall: number,
): CarouselArrangement | null {
  let smallCounts = [1];
  const mediumCounts = [1, 0];
  const targetLarge = Math.min(preferredItemSize, size);
  const targetSmall = Math.min(maxSmall, Math.max(minSmall, targetLarge / 3));
  const targetMedium = (targetLarge + targetSmall) / 2;
  if (size < minSmall * 2) smallCounts = [0];
  const minAvailableLargeSpace =
    size - targetMedium * Math.max(...mediumCounts) - maxSmall * Math.max(...smallCounts);
  const largeCounts = descendingCounts(
    Math.max(1, Math.floor(minAvailableLargeSpace / targetLarge)),
    Math.ceil(size / targetLarge),
  );
  const find = (sc: readonly number[], mc: readonly number[]) =>
    findLowestCostArrangement(
      size, itemSpacing, targetSmall, minSmall, maxSmall, sc, targetMedium, mc, targetLarge, largeCounts,
    );
  let arrangement = find(smallCounts, mediumCounts);
  if (arrangement) {
    const total = arrangement.largeCount + arrangement.mediumCount + arrangement.smallCount;
    if (total > itemCount) {
      let surplus = total - itemCount;
      let smallCount = arrangement.smallCount;
      let mediumCount = arrangement.mediumCount;
      while (surplus > 0) {
        if (smallCount > 0) smallCount -= 1;
        else if (mediumCount > 1) mediumCount -= 1;
        surplus -= 1;
      }
      arrangement = find([smallCount], [mediumCount]);
    }
  }
  return arrangement;
}

// AOSP Keylines.kt: heroKeylineList.
function heroArrangement(
  size: number,
  preferredItemSize: number,
  itemSpacing: number,
  itemCount: number,
  centered: boolean,
  minSmall: number,
  maxSmall: number,
): CarouselArrangement | null {
  let smallCounts = itemCount <= 1 ? [0] : centered ? [2] : [1];
  const targetLarge = Math.min(preferredItemSize, size);
  const targetSmall = Math.min(maxSmall, Math.max(minSmall, targetLarge / 3));
  if (size < minSmall * Math.max(...smallCounts) + minSmall * 1.25) smallCounts = [0];
  const minAvailableLargeSpace = size - minSmall * Math.max(...smallCounts);
  const largeCounts = descendingCounts(
    Math.max(1, Math.floor(minAvailableLargeSpace / targetLarge)),
    Math.ceil(size / targetLarge),
  );
  return findLowestCostArrangement(
    size, itemSpacing, targetSmall, minSmall, maxSmall, smallCounts, 0, [0], targetLarge, largeCounts,
  );
}

function arrangementKeylines(
  size: number,
  itemSpacing: number,
  a: CarouselArrangement,
  centered: boolean,
): CarouselKeylineList {
  const anchor = { size: CAROUSEL_TOKENS.anchorSize, isAnchor: true };
  const rep = (n: number, s: number) =>
    Array.from({ length: n }, () => ({ size: s, isAnchor: false }));
  if (!centered) {
    return buildKeylineList(size, itemSpacing, 1, a.largeSize / 2, [
      anchor,
      ...rep(a.largeCount, a.largeSize),
      ...rep(a.mediumCount, a.mediumSize),
      ...rep(a.smallCount, a.smallSize),
      anchor,
    ]);
  }
  const sideSmall = rep(Math.floor(a.smallCount / 2), a.smallSize);
  const sideMedium = rep(Math.floor(a.mediumCount / 2), a.mediumSize);
  const focalCount = a.largeCount;
  const pivotIndex = 1 + sideSmall.length + sideMedium.length;
  const pivotOffset =
    size / 2 -
    (a.largeSize / 2) * (focalCount - 1) -
    (focalCount - 1 > 0 && (focalCount - 1) % 2 !== 0 ? itemSpacing / 2 : 0) -
    Math.floor((focalCount - 1) / 2) * itemSpacing;
  return buildKeylineList(size, itemSpacing, pivotIndex, pivotOffset, [
    anchor,
    ...sideSmall,
    ...sideMedium,
    ...rep(a.largeCount, a.largeSize),
    ...sideMedium,
    ...sideSmall,
    anchor,
  ]);
}

export function resolveCarouselKeylineStrategy(input: {
  readonly count: number;
  readonly containerWidth: number;
  readonly variant?: CarouselVariant;
  readonly preferredItemWidth?: number;
  readonly gap?: number;
  readonly minSmallItemSize?: number;
  readonly maxSmallItemSize?: number;
}): CarouselKeylineStrategy {
  const {
    count,
    containerWidth,
    variant = "multi-browse",
    preferredItemWidth = CAROUSEL_TOKENS.defaultPreferredWidth,
    gap = CAROUSEL_TOKENS.gap,
    minSmallItemSize = CAROUSEL_TOKENS.minSmallItemSize,
    maxSmallItemSize = CAROUSEL_TOKENS.maxSmallItemSize,
  } = input;

  if (count <= 0 || containerWidth <= 0) {
    const empty = buildKeylineList(0, gap, 0, 0, []);
    return {
      isValid: false,
      variant,
      availableSpace: 0,
      itemSpacing: gap,
      itemMainAxisSize: 0,
      minItemSize: 0,
      maxItemSize: 0,
      defaultKeylines: empty,
      startKeylineSteps: [],
      endKeylineSteps: [],
      startShiftDistance: 0,
      endShiftDistance: 0,
      startShiftPoints: [0],
      endShiftPoints: [0],
    };
  }

  const anchorSize = CAROUSEL_TOKENS.anchorSize;
  let defaultKeylines: CarouselKeylineList;

  if (count === 1 || containerWidth <= maxSmallItemSize * 2 + gap) {
    const specs = [
      { size: anchorSize, isAnchor: true },
      { size: containerWidth, isAnchor: false },
      { size: anchorSize, isAnchor: true },
    ];
    defaultKeylines = buildKeylineList(
      containerWidth,
      gap,
      1,
      containerWidth / 2,
      specs,
    );
  } else if (variant === "uncontained") {
    // Port of AOSP Keylines.kt uncontainedKeylineList + calculateMediumChildSize.
    const largeSize = Math.min(preferredItemWidth + gap, containerWidth);
    const largeCount = Math.max(1, Math.floor(containerWidth / largeSize));
    const remainingSpace = containerWidth - largeCount * largeSize;
    let mediumSize = Math.max(remainingSpace * 1.5, anchorSize);
    const largeThreshold = largeSize * 0.85;
    if (mediumSize > largeThreshold) {
      mediumSize = Math.min(Math.max(largeThreshold, remainingSpace * 1.2), largeSize);
    }
    const leftAnchor = Math.max(Math.min(anchorSize, preferredItemWidth), mediumSize * 0.5);
    defaultKeylines = buildKeylineList(containerWidth, gap, 1, largeSize / 2, [
      { size: leftAnchor, isAnchor: true },
      ...Array.from({ length: largeCount }, () => ({ size: largeSize, isAnchor: false })),
      ...(remainingSpace > 0 ? [{ size: mediumSize, isAnchor: false }] : []),
      { size: anchorSize, isAnchor: true },
    ]);
  } else {
    const centered = variant === "centered-hero" && count >= 3;
    const arrangement =
      variant === "multi-browse"
        ? multiBrowseArrangement(containerWidth, preferredItemWidth, gap, count, minSmallItemSize, maxSmallItemSize)
        : heroArrangement(
            containerWidth,
            input.preferredItemWidth ?? containerWidth,
            gap,
            count,
            centered,
            minSmallItemSize,
            maxSmallItemSize,
          );
    defaultKeylines = arrangement
      ? arrangementKeylines(containerWidth, gap, arrangement, centered)
      : buildKeylineList(containerWidth, gap, 1, containerWidth / 2, [
          { size: anchorSize, isAnchor: true },
          { size: containerWidth, isAnchor: false },
          { size: anchorSize, isAnchor: true },
        ]);
  }

  const startKeylineSteps = buildStartSteps(
    defaultKeylines,
    containerWidth,
    gap,
  );
  const endKeylineSteps = buildEndSteps(defaultKeylines, containerWidth, gap);

  const startShiftDistance =
    startKeylineSteps.length > 1
      ? Math.max(
          0,
          startKeylineSteps[startKeylineSteps.length - 1]!.keylines[0]!
            .unadjustedOffset -
            startKeylineSteps[0]!.keylines[0]!.unadjustedOffset,
        )
      : 0;
  const endShiftDistance =
    endKeylineSteps.length > 1
      ? Math.max(
          0,
          endKeylineSteps[0]!.keylines[
            endKeylineSteps[0]!.keylines.length - 1
          ]!.unadjustedOffset -
            endKeylineSteps[endKeylineSteps.length - 1]!.keylines[
              endKeylineSteps[endKeylineSteps.length - 1]!.keylines.length - 1
            ]!.unadjustedOffset,
        )
      : 0;

  const startShiftPoints = buildShiftPoints(
    startShiftDistance,
    startKeylineSteps,
    true,
  );
  const endShiftPoints = buildShiftPoints(
    endShiftDistance,
    endKeylineSteps,
    false,
  );

  let minItemSize = defaultKeylines.minSize;
  let maxItemSize = defaultKeylines.maxSize;
  for (const step of startKeylineSteps) {
    if (step.minSize < minItemSize) minItemSize = step.minSize;
    if (step.maxSize > maxItemSize) maxItemSize = step.maxSize;
  }
  for (const step of endKeylineSteps) {
    if (step.minSize < minItemSize) minItemSize = step.minSize;
    if (step.maxSize > maxItemSize) maxItemSize = step.maxSize;
  }

  const itemMainAxisSize =
    defaultKeylines.keylines[defaultKeylines.firstFocalIndex]?.size ?? 0;

  return {
    isValid: itemMainAxisSize > 0 && containerWidth > 0,
    variant,
    availableSpace: containerWidth,
    itemSpacing: gap,
    itemMainAxisSize,
    minItemSize,
    maxItemSize,
    defaultKeylines,
    startKeylineSteps,
    endKeylineSteps,
    startShiftDistance,
    endShiftDistance,
    startShiftPoints,
    endShiftPoints,
  };
}

function getKeylineListForScrollOffset(
  strategy: CarouselKeylineStrategy,
  scrollOffset: number,
  maxScrollOffset: number,
): CarouselKeylineList {
  if (!strategy.isValid) return strategy.defaultKeylines;

  const positiveScroll = Math.max(0, scrollOffset);
  const startShiftOffset = strategy.startShiftDistance;
  const endShiftOffset = Math.max(0, maxScrollOffset - strategy.endShiftDistance);

  if (
    positiveScroll >= startShiftOffset &&
    positiveScroll <= endShiftOffset
  ) {
    return strategy.defaultKeylines;
  }

  let interpolation = lerpRange(
    1,
    0,
    0,
    startShiftOffset,
    positiveScroll,
  );
  let shiftPoints = strategy.startShiftPoints;
  let steps = strategy.startKeylineSteps;

  if (positiveScroll > endShiftOffset) {
    interpolation = lerpRange(
      0,
      1,
      endShiftOffset,
      maxScrollOffset,
      positiveScroll,
    );
    shiftPoints = strategy.endShiftPoints;
    steps = strategy.endKeylineSteps;

    if (
      endShiftOffset < 0.01 &&
      strategy.startKeylineSteps.length === 2 &&
      strategy.endKeylineSteps.length === 2
    ) {
      steps = [
        strategy.startKeylineSteps[strategy.startKeylineSteps.length - 1]!,
        strategy.endKeylineSteps[strategy.endKeylineSteps.length - 1]!,
      ];
    }
  }

  if (steps.length <= 1) {
    return steps[0] ?? strategy.defaultKeylines;
  }

  let fromIdx = 0;
  let toIdx = 0;
  let steppedT = 0;
  let lower = shiftPoints[0] ?? 0;
  for (let i = 1; i < steps.length; i++) {
    const upper = shiftPoints[i] ?? 1;
    if (interpolation <= upper + 1e-5) {
      fromIdx = i - 1;
      toIdx = i;
      steppedT = lerpRange(0, 1, lower, upper, interpolation);
      break;
    }
    lower = upper;
  }

  return lerpKeylineList(steps[fromIdx]!, steps[toIdx]!, steppedT);
}

export function resolveCarouselSnapOffset(input: {
  readonly strategy: CarouselKeylineStrategy;
  readonly index: number;
  readonly count: number;
}): number {
  const { strategy, index, count } = input;
  if (!strategy.isValid || count <= 1) return 0;

  const L = strategy.itemMainAxisSize;
  const gap = strategy.itemSpacing;
  const maxScrollOffset = Math.max(
    0,
    count * L + (count - 1) * gap - strategy.availableSpace,
  );
  if (maxScrollOffset <= 0) return 0;

  const clampedIdx = Math.max(0, Math.min(count - 1, index));
  if (clampedIdx === 0) return 0;
  if (clampedIdx === count - 1) return maxScrollOffset;

  const def = strategy.defaultKeylines;
  const focalCount = Math.max(1, def.lastFocalIndex - def.firstFocalIndex + 1);
  const startStepsCount = Math.max(0, strategy.startKeylineSteps.length - 1);
  const endShiftSteps = Math.max(0, strategy.endKeylineSteps.length - 1);
  const totalEndPositions = endShiftSteps + (focalCount - 1);

  let targetFocalOffset =
    def.keylines[def.firstFocalIndex]!.unadjustedOffset;

  if (clampedIdx < startStepsCount) {
    const step = strategy.startKeylineSteps[startStepsCount - clampedIdx];
    if (step) {
      targetFocalOffset =
        step.keylines[step.firstFocalIndex]!.unadjustedOffset;
    }
  } else if (clampedIdx >= count - totalEndPositions) {
    const fromEnd = count - 1 - clampedIdx;
    if (fromEnd < endShiftSteps) {
      const step = strategy.endKeylineSteps[endShiftSteps - fromEnd];
      if (step) {
        targetFocalOffset =
          step.keylines[step.lastFocalIndex]!.unadjustedOffset;
      }
    } else {
      const focalSlot = def.lastFocalIndex - (fromEnd - endShiftSteps);
      const kl = def.keylines[Math.max(def.firstFocalIndex, focalSlot)];
      if (kl) targetFocalOffset = kl.unadjustedOffset;
    }
  }

  const raw = clampedIdx * (L + gap) + L / 2 - targetFocalOffset;
  return Math.max(0, Math.min(maxScrollOffset, raw));
}

export function resolveCarouselItemFrame(input: {
  readonly strategy: CarouselKeylineStrategy;
  readonly index: number;
  readonly count: number;
  readonly scrollOffset: number;
}): CarouselItemFrame {
  const { strategy, index, count, scrollOffset } = input;
  if (!strategy.isValid || count <= 0) {
    return {
      index,
      slotWidth: 0,
      maskWidth: 0,
      offsetDelta: 0,
      cornerRadius: CAROUSEL_TOKENS.focalRadius,
      prominence: 0,
      zIndex: 1,
      isFocal: false,
    };
  }

  const L = strategy.itemMainAxisSize;
  const gap = strategy.itemSpacing;
  const maxScrollOffset = Math.max(
    0,
    count * L + (count - 1) * gap - strategy.availableSpace,
  );
  const clampedScroll = Math.max(0, Math.min(maxScrollOffset, scrollOffset));
  const keylines = getKeylineListForScrollOffset(
    strategy,
    clampedScroll,
    maxScrollOffset,
  ).keylines;

  const unadjustedCenter = index * (L + gap) + L / 2 - clampedScroll;
  let before = keylines[0]!;
  let after = keylines[keylines.length - 1]!;

  for (let i = 0; i < keylines.length; i++) {
    const kl = keylines[i]!;
    if (kl.unadjustedOffset <= unadjustedCenter) {
      before = kl;
    }
    if (kl.unadjustedOffset >= unadjustedCenter) {
      after = kl;
      break;
    }
  }

  const isOutOfBounds = before === after;
  const progress = isOutOfBounds
    ? 1
    : (unadjustedCenter - before.unadjustedOffset) /
      Math.max(1e-5, after.unadjustedOffset - before.unadjustedOffset);
  const interp = lerpKeyline(before, after, progress);

  let offsetDelta = interp.offset - unadjustedCenter;
  if (isOutOfBounds && interp.size > 0) {
    offsetDelta += (unadjustedCenter - interp.unadjustedOffset) / interp.size;
  }

  const sizeSpan = Math.max(1, strategy.maxItemSize - strategy.minItemSize);
  const prominence =
    strategy.maxItemSize <= strategy.minItemSize + 0.5
      ? 1
      : Math.max(
          0,
          Math.min(1, (interp.size - strategy.minItemSize) / sizeSpan),
        );
  const cornerRadius =
    CAROUSEL_TOKENS.peekRadius +
    prominence * (CAROUSEL_TOKENS.focalRadius - CAROUSEL_TOKENS.peekRadius);

  return {
    index,
    slotWidth: L,
    maskWidth: Math.max(0, interp.size),
    offsetDelta,
    cornerRadius,
    prominence,
    zIndex: Math.round(10 + prominence * 20),
    isFocal: prominence >= 0.92,
  };
}
