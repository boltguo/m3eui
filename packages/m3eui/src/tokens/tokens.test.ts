import { describe, expect, it } from "vitest";
import { M3E_DEFAULT_THEME } from "../context/M3EContext.js";
import {
  generateM3EThemeTokens,
} from "./color.js";
import {
  M3E_COLOR_SCHEME_VARIANTS,
} from "./color-variants.js";
import {
  M3E_ELEVATION_TOKENS,
  M3E_STATE_LAYER_TOKENS,
  generateM3ESystemCssVars,
} from "./elevation.js";
import {
  LOADING_INDICATOR_DETERMINATE_MORPH_SEQUENCE,
  LOADING_INDICATOR_MORPH_SEQUENCE,
  LOADING_INDICATOR_SHAPE_SEQUENCE,
  LOADING_INDICATOR_TOKENS,
} from "./loading-shapes.js";
import {
  Hct,
  argbFromHex,
} from "./monet/index.js";
import {
  EXPRESSIVE_MOTION_SCHEME,
  STANDARD_MOTION_SCHEME,
  evaluateSpringDisplacement,
  resolveCrossPlatformSpring,
  stepSpringSimulation,
} from "./motion.js";
import {
  M3E_ALL_SHAPE_NAMES,
  MATERIAL_SHAPES,
  cubicsToSvgPath,
  getShapeMorphPair,
  interpolateMorphCubics,
  createMorphPair,
  getMaterialShape,
} from "./shapes.js";
import {
  resolveCarouselItemFrame,
  resolveCarouselKeylineStrategy,
  resolveCarouselSnapOffset,
} from "./carousel.js";
import {
  BUTTON_GROUP_TOKENS,
  BUTTON_SIZE_SPECS,
  FLOATING_TOOLBAR_TOKENS,
  ICON_BUTTON_SIZE_SPECS,
  computeButtonGroupWidths,
  flipCornersHorizontal,
  resolveAccordionItemCorners,
  resolveCircularProgressArcs,
  resolveClockHandGeometry,
  resolveConnectedGroupCorners,
  resolveDragHandleGeometry,
  resolveFabGeometry,
  resolveIconButtonGeometry,
  resolveOtpSlotCorners,
  resolveSegmentedListCorners,
  resolveSegmentedMenuItemCorners,
  resolveSliderThumbGeometry,
  resolveSplitButtonGeometry,
  resolveSwitchGeometry,
  resolveToggleFabGeometry,
  resolveTopAppBarGeometry,
  CHECKBOX_TOKENS,
  CHIP_TOKENS,
  DRAG_HANDLE_TOKENS,
  EXTENDED_FAB_SPECS,
  FAB_SIZE_SPECS,
  SLIDER_SIZE_SPECS,
  SNACKBAR_TOKENS,
  TOOLTIP_TOKENS,
  parseShortcutKeys,
  SWITCH_TOKENS,
} from "./topology.js";
import {
  M3E_TYPOGRAPHY_TOKENS,
  generateM3ETypographyCssVars,
} from "./typography.js";
import {
  buildDeterminateCircularWavyGeometry,
  buildDeterminateLinearWavyGeometry,
  buildIndeterminateCircularWavyGeometry,
  buildIndeterminateLinearWavyGeometry,
  resolveDeterminateWaveAmplitude,
} from "./wavy.js";

describe("m3eui/tokens — Motion Physics & Cross-Platform Springs", () => {
  it("enforces critical damping (dampingRatio === 1.0, zero overshoot) on all effects springs", () => {
    for (const scheme of [EXPRESSIVE_MOTION_SCHEME, STANDARD_MOTION_SCHEME]) {
      for (const key of ["fastEffects", "defaultEffects", "slowEffects"] as const) {
        const spec = scheme[key];
        expect(spec.dampingRatio).toBe(1.0);
        const resolved = resolveCrossPlatformSpring(spec);
        expect(resolved.peakOvershoot).toBe(0);

        for (let ms = 0; ms <= 500; ms += 5) {
          const x = evaluateSpringDisplacement(spec, ms / 1000);
          expect(x).toBeLessThanOrEqual(1.0);
          expect(x).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });

  it("exhibits underdamped physical overshoot on Expressive spatial springs and exact SwiftUI damping conversion", () => {
    const fastSpatial = EXPRESSIVE_MOTION_SCHEME.fastSpatial;
    expect(fastSpatial.dampingRatio).toBe(0.6);
    expect(fastSpatial.stiffness).toBe(800);

    const resolved = resolveCrossPlatformSpring(fastSpatial, 1);
    expect(resolved.dampingCoefficient).toBeCloseTo(2 * 0.6 * Math.sqrt(800), 4);
    expect(resolved.peakOvershoot).toBeGreaterThan(0.08);
    expect(resolved.cssLinear.easing.startsWith("linear(")).toBe(true);

    const slowMo = resolveCrossPlatformSpring(fastSpatial, 0.2);
    expect(slowMo.stiffness).toBeCloseTo(800 * 0.04, 4);
    expect(slowMo.peakOvershoot).toBeCloseTo(resolved.peakOvershoot, 4);
  });
});

describe("m3eui/tokens — Group Topology & Zero-Sum Width Squish", () => {
  it("resolves SegmentedList corners accurately for single vs multi-item & interactive states", () => {
    expect(resolveSegmentedListCorners({ index: 0, count: 1 })).toEqual([16, 16, 16, 16]);

    expect(resolveSegmentedListCorners({ index: 0, count: 3 })).toEqual([16, 16, 4, 4]);
    expect(resolveSegmentedListCorners({ index: 1, count: 3 })).toEqual([4, 4, 4, 4]);
    expect(resolveSegmentedListCorners({ index: 2, count: 3 })).toEqual([4, 4, 16, 16]);

    expect(resolveSegmentedListCorners({ index: 0, count: 3, isHovered: true })).toEqual([
      16, 16, 4, 4,
    ]);
    expect(resolveSegmentedListCorners({ index: 1, count: 3, isHovered: true })).toEqual([
      4, 4, 4, 4,
    ]);

    expect(resolveSegmentedListCorners({ index: 1, count: 3, isSelected: true })).toEqual([
      16, 16, 16, 16,
    ]);
    expect(resolveSegmentedListCorners({ index: 1, count: 3, isPressed: true })).toEqual([
      16, 16, 16, 16,
    ]);
  });

  it("resolves ConnectedButtonGroup corners accurately for leading/middle/trailing/checked", () => {
    expect(resolveConnectedGroupCorners({ index: 0, count: 3, height: 40 })).toEqual([
      20, 8, 8, 20,
    ]);
    expect(resolveConnectedGroupCorners({ index: 1, count: 3, height: 40 })).toEqual([
      8, 8, 8, 8,
    ]);
    expect(
      resolveConnectedGroupCorners({ index: 1, count: 3, height: 40, isPressed: true }),
    ).toEqual([4, 4, 4, 4]);
    expect(
      resolveConnectedGroupCorners({ index: 1, count: 3, height: 40, isChecked: true }),
    ).toEqual([20, 20, 20, 20]);
    expect(
      resolveConnectedGroupCorners({
        index: 1,
        count: 3,
        height: 40,
        isChecked: true,
        isPressed: true,
      }),
    ).toEqual([4, 4, 4, 4]);
    expect(
      resolveConnectedGroupCorners({
        index: 0,
        count: 3,
        height: 40,
        isChecked: true,
        isPressed: true,
      }),
    ).toEqual([20, 4, 4, 20]);
    expect(BUTTON_SIZE_SPECS.xl.height).toBe(136);
    expect(BUTTON_GROUP_TOKENS.standardExpandedRatio).toBe(0.15);
    expect(BUTTON_GROUP_TOKENS.connectedExpandedRatio).toBe(0);
  });

  it("preserves exact zero-sum total width across all press & spring overshoot states", () => {
    const baseWidths = [100, 120, 110, 96];
    const baseSum = baseWidths.reduce((a, b) => a + b, 0);

    const testVectors = [
      [1, 0, 0, 0],
      [0, 1, 0, 0],
      [0, 0, 1.12, 0],
      [0, 0, 0, 1],
      [0.4, 0.8, 0, 0],
    ];

    for (const pressProgress of testVectors) {
      const out = computeButtonGroupWidths({ baseWidths, pressProgress });
      const sum = out.reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - baseSum)).toBeLessThan(1e-6);
    }

    const midPressed = computeButtonGroupWidths({
      baseWidths,
      pressProgress: [0, 1, 0, 0],
    });
    expect(midPressed[1]).toBeCloseTo(138, 4);
    expect(midPressed[0]).toBeCloseTo(91, 4);
    expect(midPressed[2]).toBeCloseTo(101, 4);
    expect(midPressed[3]).toBeCloseTo(96, 4);
  });
});

describe("m3eui/tokens — Normalized Polygon Morphs & Wavy Progress", () => {
  it("exports 7 pre-paired closed [0..1] cubic morph sequences for LoadingIndicator", () => {
    expect(LOADING_INDICATOR_MORPH_SEQUENCE.length).toBe(7);
    expect(LOADING_INDICATOR_SHAPE_SEQUENCE.length).toBe(7);
    expect(LOADING_INDICATOR_TOKENS.effectiveScaleFactor).toBeGreaterThan(0.5);
    expect(LOADING_INDICATOR_TOKENS.effectiveScaleFactor).toBeLessThan(0.85);

    for (const pair of LOADING_INDICATOR_MORPH_SEQUENCE) {
      expect(pair.startCubics.length).toBeGreaterThan(8);
      expect(pair.startCubics.length).toBe(pair.endCubics.length);

      const mid = interpolateMorphCubics(pair, 0.5);
      const path = cubicsToSvgPath(mid, 48, LOADING_INDICATOR_TOKENS.effectiveScaleFactor);
      expect(path.startsWith("M ")).toBe(true);
      expect(path.endsWith("Z")).toBe(true);
      expect(path.includes("NaN")).toBe(false);

      const shape = MATERIAL_SHAPES[pair.from];
      const first = shape.cubics[0];
      const last = shape.cubics[shape.cubics.length - 1];
      expect(first[0]).toBeCloseTo(last[6], 5);
      expect(first[1]).toBeCloseTo(last[7], 5);
    }
  });

  it("flattens determinate wavy amplitude at <=10% and >=95% and generates valid SVG paths", () => {
    expect(resolveDeterminateWaveAmplitude(0)).toBe(0);
    expect(resolveDeterminateWaveAmplitude(0.1)).toBe(0);
    expect(resolveDeterminateWaveAmplitude(0.5)).toBe(1);
    expect(resolveDeterminateWaveAmplitude(0.95)).toBe(0);
    expect(resolveDeterminateWaveAmplitude(1)).toBe(0);

    const det = buildDeterminateLinearWavyGeometry({
      width: 240,
      progress: 0.5,
      amplitude: 1,
      phasePx: 12,
    });
    expect(det.activePaths.length).toBe(1);
    expect(det.activePaths[0].includes("C ")).toBe(true);
    expect(det.trackPaths.length).toBe(1);
    expect(det.stopDot).not.toBeNull();

    const indet = buildIndeterminateLinearWavyGeometry({
      width: 240,
      cycleFraction: 0.3,
      phasePx: 8,
    });
    expect(indet.activePaths.length).toBe(1);
    expect(indet.stopDot).toBeNull();
  });

  it("generates HCT Expressive light/dark semantic color roles and CSS light-dark() vars", () => {
    const theme = generateM3EThemeTokens({ seedHex: "#6750A4", variant: "expressive" });
    expect(theme.light.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(theme.dark.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(theme.cssLightDarkVars["--m3e-color-surface-container-high"]).toContain(
      "light-dark(",
    );
  });

  it("retargets a mid-flight morph from the current outline", () => {
    const current = interpolateMorphCubics(getShapeMorphPair("circle", "cookie9Sided"), 0.5);
    const pair = createMorphPair(
      {
        ...getMaterialShape("circle"),
        cubics: current,
        features: current.map((c) => ({ type: "edge" as const, cubics: [c] })),
      },
      getMaterialShape("heart"),
    );
    expect(pair.startCubics.length).toBe(pair.endCubics.length);
    expect(pair.startCubics[0]!.slice(0, 2)).toEqual(current[0]!.slice(0, 2));
  });

  it("normalizes all 35 official MaterialShapes cleanly inside [0..1] and morphs arbitrary pairs", () => {
    expect(M3E_ALL_SHAPE_NAMES.length).toBe(35);
    expect(Object.keys(MATERIAL_SHAPES).length).toBe(35);

    for (const name of M3E_ALL_SHAPE_NAMES) {
      const shape = MATERIAL_SHAPES[name];
      expect(shape.cubics.length).toBeGreaterThanOrEqual(4);
      expect(shape.previewSvgPath.startsWith("M ")).toBe(true);
      expect(shape.previewSvgPath.includes("NaN")).toBe(false);
      expect(shape.bounds[0]).toBeGreaterThanOrEqual(-0.02);
      expect(shape.bounds[1]).toBeGreaterThanOrEqual(-0.02);
      expect(shape.bounds[2]).toBeLessThanOrEqual(1.02);
      expect(shape.bounds[3]).toBeLessThanOrEqual(1.02);
      const first = shape.cubics[0];
      const last = shape.cubics[shape.cubics.length - 1];
      expect(first[0]).toBeCloseTo(last[6], 5);
      expect(first[1]).toBeCloseTo(last[7], 5);
    }

    const pairsToCheck: Array<[typeof M3E_ALL_SHAPE_NAMES[number], typeof M3E_ALL_SHAPE_NAMES[number]]> = [
      ["heart", "pixelCircle"],
      ["puffy", "softBoom"],
      ["ghostish", "clover8Leaf"],
      ["slanted", "verySunny"],
    ];
    for (const [from, to] of pairsToCheck) {
      const pair = getShapeMorphPair(from, to);
      expect(pair.startCubics.length).toBe(pair.endCubics.length);
      const mid = cubicsToSvgPath(interpolateMorphCubics(pair, 0.5), 64, 0.85);
      expect(mid.includes("NaN")).toBe(false);
    }
  });

  it("resolves Polar Circular Wavy geometry with quantized integer lobes and C1 seam closure", () => {
    const det = buildDeterminateCircularWavyGeometry({
      size: 48,
      progress: 0.65,
      amplitude: 1,
      phaseRad: 0.8,
    });
    expect(det.lobes).toBe(9);
    expect(det.activePath.startsWith("M ")).toBe(true);
    expect(det.activePath.includes("C ")).toBe(true);
    expect(det.trackPath.startsWith("M ")).toBe(true);

    const full = buildDeterminateCircularWavyGeometry({
      size: 48,
      progress: 1,
      amplitude: 1,
      phaseRad: 1.25,
    });
    const nums = full.activePath.match(/-?\d+(\.\d+)?/g)?.map(Number) ?? [];
    expect(nums.length).toBeGreaterThan(8);
    expect(nums[0]).toBeCloseTo(nums[nums.length - 2], 1);
    expect(nums[1]).toBeCloseTo(nums[nums.length - 1], 1);

    const indet = buildIndeterminateCircularWavyGeometry({
      size: 48,
      cycleFraction: 0.35,
      phaseRad: 0.5,
    });
    expect(indet.activePath.startsWith("M ")).toBe(true);
    expect(indet.trackPath.startsWith("M ")).toBe(true);
  });
});

describe("m3eui/tokens — IconButton, SplitButton & FloatingToolbar", () => {
  it("resolves exact 5×3 IconButton aspect widths and pressed > selected > rest corner priority", () => {
    expect(ICON_BUTTON_SIZE_SPECS.xs.widths).toEqual({ narrow: 28, default: 32, wide: 40 });
    expect(ICON_BUTTON_SIZE_SPECS.sm.widths).toEqual({ narrow: 32, default: 40, wide: 52 });
    expect(ICON_BUTTON_SIZE_SPECS.md.widths).toEqual({ narrow: 48, default: 56, wide: 72 });
    expect(ICON_BUTTON_SIZE_SPECS.lg.widths).toEqual({ narrow: 64, default: 96, wide: 128 });
    expect(ICON_BUTTON_SIZE_SPECS.xl.widths).toEqual({ narrow: 104, default: 136, wide: 184 });

    expect(resolveIconButtonGeometry({ size: "sm", widthVariant: "wide" })).toMatchObject({
      width: 52,
      height: 40,
      cornerRadius: 20,
    });
    expect(resolveIconButtonGeometry({ size: "sm", isSelected: true }).cornerRadius).toBe(12);
    expect(
      resolveIconButtonGeometry({ size: "sm", isSelected: true, isPressed: true }).cornerRadius,
    ).toBe(8);
  });

  it("resolves SplitButton asymmetric corners, optical chevron offset, and SegmentedMenu concentric corners", () => {
    const rest = resolveSplitButtonGeometry({ size: "sm" });
    expect(rest.gap).toBe(2);
    expect(rest.leadingCorners).toEqual([20, 4, 4, 20]);
    expect(rest.trailingCorners).toEqual([4, 20, 20, 4]);
    expect(rest.trailingOpticalOffsetPx).toBeCloseTo(-1.76, 2);
    expect(rest.chevronRotationDeg).toBe(0);

    const leadPress = resolveSplitButtonGeometry({ size: "sm", isLeadingPressed: true });
    expect(leadPress.leadingCorners).toEqual([20, 12, 12, 20]);

    const expanded = resolveSplitButtonGeometry({ size: "sm", isExpanded: true });
    expect(expanded.trailingCorners).toEqual([20, 20, 20, 20]);
    expect(expanded.trailingOpticalOffsetPx).toBe(0);
    expect(expanded.chevronRotationDeg).toBe(180);

    expect(resolveSegmentedMenuItemCorners({ index: 0, count: 3 })).toEqual([12, 12, 4, 4]);
    expect(resolveSegmentedMenuItemCorners({ index: 1, count: 3 })).toEqual([4, 4, 4, 4]);
    expect(resolveSegmentedMenuItemCorners({ index: 2, count: 3 })).toEqual([4, 4, 12, 12]);
    expect(resolveSegmentedMenuItemCorners({ index: 1, count: 3, isSelected: true })).toEqual([
      12, 12, 12, 12,
    ]);
  });

  it("enforces FloatingToolbar concentric geometry and ToggleFAB 0 -> 1 spring morph", () => {
    expect(
      FLOATING_TOOLBAR_TOKENS.containerRadius - FLOATING_TOOLBAR_TOKENS.containerPadding,
    ).toBe(FLOATING_TOOLBAR_TOKENS.itemSize / 2);

    const collapsed = resolveToggleFabGeometry("md", 0);
    expect(collapsed).toEqual({
      containerSize: 80,
      cornerRadius: 20,
      iconSize: 28,
      iconRotationDeg: 0,
    });

    const expanded = resolveToggleFabGeometry("md", 1);
    expect(expanded).toEqual({
      containerSize: 56,
      cornerRadius: 28,
      iconSize: 20,
      iconRotationDeg: 45,
    });
  });
});

describe("m3eui/tokens — Switch, Slider & Accordion Geometry", () => {
  it("resolves exact M3E Switch handle diameters (16 -> 24 -> 28px) and outer track offsets", () => {
    expect(SWITCH_TOKENS.trackWidth).toBe(52);
    expect(SWITCH_TOKENS.trackHeight).toBe(32);

    expect(resolveSwitchGeometry({ checked: false, isPressed: false })).toEqual({
      thumbSize: 16,
      thumbOffsetPx: 8,
    });

    expect(
      resolveSwitchGeometry({ checked: false, isPressed: false, hasUncheckedIcon: true }),
    ).toEqual({
      thumbSize: 24,
      thumbOffsetPx: 4,
    });

    expect(resolveSwitchGeometry({ checked: true, isPressed: false })).toEqual({
      thumbSize: 24,
      thumbOffsetPx: 24,
    });

    expect(resolveSwitchGeometry({ checked: false, isPressed: true })).toEqual({
      thumbSize: 28,
      thumbOffsetPx: 2,
    });
    expect(resolveSwitchGeometry({ checked: true, isPressed: true })).toEqual({
      thumbSize: 28,
      thumbOffsetPx: 22,
    });
  });

  it("resolves M3E Slider tall track specs and active handle narrowing (4px -> 2px)", () => {
    expect(SLIDER_SIZE_SPECS.sm.trackHeight).toBe(16);
    expect(SLIDER_SIZE_SPECS.md.trackHeight).toBe(24);
    expect(SLIDER_SIZE_SPECS.lg.trackHeight).toBe(40);

    expect(resolveSliderThumbGeometry(false)).toEqual({
      thumbWidth: 4,
      trackGap: 6,
    });
    expect(resolveSliderThumbGeometry(true)).toEqual({
      thumbWidth: 2,
      trackGap: 6,
    });
  });

  it("resolves M3E Segmented Accordion corner detachment including neighbor rounding", () => {
    expect(resolveAccordionItemCorners({ index: 0, count: 3, isOpen: false })).toEqual([
      16, 16, 4, 4,
    ]);
    expect(resolveAccordionItemCorners({ index: 1, count: 3, isOpen: false })).toEqual([
      4, 4, 4, 4,
    ]);
    expect(resolveAccordionItemCorners({ index: 1, count: 3, isOpen: true })).toEqual([
      16, 16, 16, 16,
    ]);
    expect(
      resolveAccordionItemCorners({ index: 0, count: 3, isOpen: false, nextOpen: true }),
    ).toEqual([16, 16, 16, 16]);
    expect(
      resolveAccordionItemCorners({ index: 2, count: 3, isOpen: false, prevOpen: true }),
    ).toEqual([16, 16, 16, 16]);
  });
});

describe("m3eui/tokens — Carousel, FAB, OTPField, TopAppBar & Progress", () => {
  it("resolves multi-segment SegmentedMenu & OTPField slot corners cleanly", () => {
    expect(
      resolveSegmentedMenuItemCorners({
        index: 2,
        count: 4,
        isFirstInGroup: false,
        isLastInGroup: true,
      }),
    ).toEqual([4, 4, 12, 12]);
    expect(
      resolveSegmentedMenuItemCorners({
        index: 3,
        count: 4,
        isFirstInGroup: true,
        isLastInGroup: true,
      }),
    ).toEqual([12, 12, 12, 12]);

    expect(resolveOtpSlotCorners({ index: 0, count: 6 })).toEqual([16, 6, 6, 16]);
    expect(resolveOtpSlotCorners({ index: 2, count: 6 })).toEqual([6, 6, 6, 6]);
    expect(resolveOtpSlotCorners({ index: 2, count: 6, isFocused: true })).toEqual([
      16, 16, 16, 16,
    ]);
  });

  it("interpolates Flexible TopAppBar height, FAB press corners, and CircularProgress 4px arc gap", () => {
    const expanded = resolveTopAppBarGeometry({
      variant: "large-flexible",
      collapsedFraction: 0,
    });
    const expandedWithSubtitle = resolveTopAppBarGeometry({
      variant: "large-flexible",
      collapsedFraction: 0,
      hasSubtitle: true,
    });
    const mediumWithSubtitle = resolveTopAppBarGeometry({
      variant: "medium-flexible",
      collapsedFraction: 0,
      hasSubtitle: true,
    });
    const collapsed = resolveTopAppBarGeometry({
      variant: "large-flexible",
      collapsedFraction: 1,
    });
    expect(expanded.height).toBe(120);
    expect(expandedWithSubtitle.height).toBe(152);
    expect(mediumWithSubtitle.height).toBe(136);
    expect(collapsed.height).toBe(64);
    expect(collapsed.isElevated).toBe(true);

    expect(resolveFabGeometry({ size: "xs", isPressed: false }).cornerRadius).toBe(12);
    expect(resolveFabGeometry({ size: "xs", isPressed: true }).cornerRadius).toBe(8);
    expect(resolveFabGeometry({ size: "sm", isPressed: false }).cornerRadius).toBe(16);
    expect(resolveFabGeometry({ size: "sm", isPressed: true }).cornerRadius).toBe(12);
    expect(resolveFabGeometry({ size: "md", isPressed: false }).cornerRadius).toBe(20);
    expect(resolveFabGeometry({ size: "md", isPressed: true }).cornerRadius).toBe(14);
    expect(resolveFabGeometry({ size: "lg", isPressed: false }).cornerRadius).toBe(28);
    expect(resolveFabGeometry({ size: "lg", isPressed: true }).cornerRadius).toBe(18);
    expect(FAB_SIZE_SPECS.lg.iconSize).toBe(36);
    expect(EXTENDED_FAB_SPECS.lg.iconSize).toBe(32);

    const arc50 = resolveCircularProgressArcs({ progress: 0.5, size: 48, strokeWidth: 4.5 });
    expect(arc50.activeDashLength).toBeGreaterThan(0);
    expect(arc50.trackDashLength).toBeGreaterThan(0);
    expect(arc50.activeDashLength + arc50.trackDashLength).toBeLessThan(arc50.circumference);
  });
});

describe("m3eui/tokens — RTL Corner Mirroring & Clock Geometry", () => {
  it("mirrors physical [TL, TR, BR, BL] corner tuples horizontally for RTL layouts", () => {
    expect(flipCornersHorizontal([20, 8, 8, 20])).toEqual([8, 20, 20, 8]);
    expect(flipCornersHorizontal([4, 20, 20, 4])).toEqual([20, 4, 4, 20]);
    expect(flipCornersHorizontal([16, 16, 4, 4])).toEqual([16, 16, 4, 4]);
    expect(flipCornersHorizontal([24, 6, 12, 18])).toEqual([6, 24, 18, 12]);
  });

  it("computes polar & Cartesian clock hand geometry across 12h, 24h inner ring, and minute modes", () => {
    const h12 = resolveClockHandGeometry({ mode: "hour", value: 12, use24Hour: false });
    expect(h12.angleDeg).toBe(0);
    expect(h12.isInnerRing).toBe(false);
    expect(h12.offsetX).toBeCloseTo(0, 2);
    expect(h12.offsetY).toBeCloseTo(-101, 2);

    const h15 = resolveClockHandGeometry({ mode: "hour", value: 15, use24Hour: true });
    expect(h15.angleDeg).toBe(90);
    expect(h15.isInnerRing).toBe(true);
    expect(h15.radius).toBe(69);
    expect(h15.offsetX).toBeCloseTo(69, 2);
    expect(h15.offsetY).toBeCloseTo(0, 2);

    const m45 = resolveClockHandGeometry({ mode: "minute", value: 45 });
    expect(m45.angleDeg).toBe(270);
    expect(m45.offsetX).toBeCloseTo(-101, 2);
    expect(m45.offsetY).toBeCloseTo(0, 1);
  });
});

describe("m3eui/tokens — AOSP Compose Material 3 Expressive 1.5.0 Parity", () => {
  it("defines all 30 M3E typography scales (15 baseline + 15 Emphasized) plus elevation & state-layer tokens", () => {
    const scaleNames = Object.keys(M3E_TYPOGRAPHY_TOKENS);
    expect(scaleNames.length).toBe(30);
    const emphasizedNames = scaleNames.filter((name) => name.endsWith("Emphasized"));
    expect(emphasizedNames.length).toBe(15);
    expect(M3E_TYPOGRAPHY_TOKENS.displayLargeEmphasized.fontWeight).toBeGreaterThan(
      M3E_TYPOGRAPHY_TOKENS.displayLarge.fontWeight,
    );
    expect(M3E_TYPOGRAPHY_TOKENS.labelLargeEmphasized.fontWeight).toBe(700);

    expect(Object.keys(M3E_ELEVATION_TOKENS)).toEqual([
      "level0",
      "level1",
      "level2",
      "level3",
      "level4",
      "level5",
    ]);
    expect(M3E_STATE_LAYER_TOKENS).toMatchObject({
      hoverOpacity: 0.08,
      focusOpacity: 0.1,
      pressOpacity: 0.1,
      draggedOpacity: 0.16,
      disabledContainerOpacity: 0.12,
      disabledContentOpacity: 0.38,
    });
  });

  it("supports all 9 AOSP Monet dynamic color scheme variants on SPEC_2025 and outputs all 61 semantic color roles", () => {
    expect(M3E_COLOR_SCHEME_VARIANTS.length).toBe(9);
    const fixedRoleKeys = [
      "primaryFixed",
      "primaryFixedDim",
      "onPrimaryFixed",
      "onPrimaryFixedVariant",
      "secondaryFixed",
      "secondaryFixedDim",
      "onSecondaryFixed",
      "onSecondaryFixedVariant",
      "tertiaryFixed",
      "tertiaryFixedDim",
      "onTertiaryFixed",
      "onTertiaryFixedVariant",
    ] as const;

    for (const variant of M3E_COLOR_SCHEME_VARIANTS) {
      const theme = generateM3EThemeTokens({ seedHex: "#6750A4", variant });
      expect(Object.keys(theme.light).length).toBe(61);
      expect(Object.keys(theme.dark).length).toBe(61);
      expect(theme.light.primaryDim).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.secondaryDim).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.tertiaryDim).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.errorDim).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.success).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.onSuccess).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.successContainer).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.onSuccessContainer).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.warning).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.onWarning).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.warningContainer).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.onWarningContainer).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.surfaceTint).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.background).toMatch(/^#[0-9a-f]{6}$/i);
      expect(theme.light.onBackground).toMatch(/^#[0-9a-f]{6}$/i);
      for (const fixedKey of fixedRoleKeys) {
        expect(theme.light[fixedKey]).toBe(theme.dark[fixedKey]);
      }
    }

    const legacy2021 = generateM3EThemeTokens({
      seedHex: "#6750A4",
      variant: "tonalSpot",
    });
    for (const [baseKey, dimKey] of [
      ["primary", "primaryDim"],
      ["secondary", "secondaryDim"],
      ["tertiary", "tertiaryDim"],
      ["error", "errorDim"],
    ] as const) {
      const baseTone = Hct.fromInt(argbFromHex(legacy2021.light[baseKey])).tone;
      const dimTone = Hct.fromInt(argbFromHex(legacy2021.light[dimKey])).tone;
      expect(dimTone).toBeLessThanOrEqual(Math.max(0, baseTone - 4.5));
    }

    const exp2025 = generateM3EThemeTokens({
      seedHex: "#6750A4",
      variant: "expressive",
    });
    const surf2025Chroma = Hct.fromInt(argbFromHex(exp2025.light.surfaceContainerHigh)).chroma;
    expect(surf2025Chroma).toBeGreaterThan(10);

    const watchTheme = generateM3EThemeTokens({
      seedHex: "#6750A4",
      variant: "expressive",
      platform: "watch",
    });
    expect(watchTheme.light.surfaceContainer).not.toBe(exp2025.light.surfaceContainer);
  });

  it("preserves exact analytical displacement and mid-flight velocity in stepSpringSimulation", () => {
    const spec = EXPRESSIVE_MOTION_SCHEME.fastSpatial;
    // Step from 0 -> 1 in two 16ms halves and verify exact semi-group identity with single 32ms step
    const half1 = stepSpringSimulation(0, 0, 1, 0.016, spec);
    const half2 = stepSpringSimulation(half1.value, half1.velocity, 1, 0.016, spec);
    const full = stepSpringSimulation(0, 0, 1, 0.032, spec);
    expect(half2.value).toBeCloseTo(full.value, 6);
    expect(half2.velocity).toBeCloseTo(full.velocity, 5);
    expect(full.value).toBeCloseTo(evaluateSpringDisplacement(spec, 0.032), 6);

    // Mid-flight retargeting back to 0 carries forward positive momentum before reversing
    const retargeted = stepSpringSimulation(half1.value, half1.velocity, 0, 0.004, spec);
    expect(retargeted.value).toBeGreaterThan(half1.value);
    expect(retargeted.settled).toBe(false);

    // Overdamped semi-group consistency
    const overSpec = { dampingRatio: 1.4, stiffness: 500 };
    const o1 = stepSpringSimulation(0, 0, 10, 0.02, overSpec);
    const o2 = stepSpringSimulation(o1.value, o1.velocity, 10, 0.02, overSpec);
    const oFull = stepSpringSimulation(0, 0, 10, 0.04, overSpec);
    expect(o2.value).toBeCloseTo(oFull.value, 6);
    expect(o2.velocity).toBeCloseTo(oFull.velocity, 5);
  });

  it("tracks convex/concave corner features for AOSP FeatureMapping, determinate LoadingIndicator morph, dual-segment wavy, and SplitButton hover inner corners", () => {
    expect(MATERIAL_SHAPES.softBurst.features.some((f) => f.type === "corner" && f.convex)).toBe(true);
    expect(MATERIAL_SHAPES.softBurst.features.some((f) => f.type === "corner" && !f.convex)).toBe(true);

    expect(LOADING_INDICATOR_DETERMINATE_MORPH_SEQUENCE.length).toBe(1);
    expect(LOADING_INDICATOR_DETERMINATE_MORPH_SEQUENCE[0].from).toBe("circle");
    expect(LOADING_INDICATOR_DETERMINATE_MORPH_SEQUENCE[0].to).toBe("softBurst");

    const dualWave = buildIndeterminateLinearWavyGeometry({
      width: 240,
      cycleFraction: 0.6,
      phasePx: 6,
    });
    expect(dualWave.activePaths.length).toBe(2);
    expect(dualWave.trackPaths.length).toBeGreaterThanOrEqual(1);

    const leadHover = resolveSplitButtonGeometry({ size: "sm", isLeadingHovered: true });
    expect(leadHover.leadingCorners).toEqual([20, 12, 12, 20]);
    const trailHover = resolveSplitButtonGeometry({ size: "sm", isTrailingHovered: true });
    expect(trailHover.trailingCorners).toEqual([12, 20, 20, 12]);

    expect(BUTTON_SIZE_SPECS.xs).toMatchObject({
      height: 32,
      fontSize: 14,
      lineHeight: 20,
      iconSize: 20,
      iconGap: 4,
      outlineWidth: 1,
    });
    expect(BUTTON_SIZE_SPECS.lg.outlineWidth).toBe(2);
    expect(BUTTON_SIZE_SPECS.xl.outlineWidth).toBe(3);
  });

  it("verifies dynamic shadow color-mix, em typescale tracking, lazy getMaterialShape, parseShortcutKeys, and AOSP micro-tokens", () => {
    const elevVars = generateM3ESystemCssVars();
    expect(elevVars["--m3e-elevation-level1"]).toContain("var(--m3e-color-shadow)");
    for (const level of ["level1", "level2", "level3", "level4", "level5"] as const) {
      const shadow = elevVars[`--m3e-elevation-${level}`]!;
      expect(shadow).toContain("0 color-mix(");
      expect(shadow).not.toMatch(/\b[1-9]\d*px\s+color-mix\(/);
    }
    expect(elevVars["--m3e-state-pressed-opacity"]).toBe("10%");
    expect(elevVars["--m3e-state-press-opacity"]).toBe("var(--m3e-state-pressed-opacity)");

    const typoVars = generateM3ETypographyCssVars();
    expect(typoVars["--m3e-typescale-label-large-tracking"]).toMatch(/em$/);
    expect(typoVars["--m3e-typescale-display-large-tracking"]).toMatch(/^-?[0-9.]+em$/);

    expect(CHECKBOX_TOKENS.cornerRadius).toBe(2);
    expect(CHIP_TOKENS.restRadius).toBe(8);
    expect(CHIP_TOKENS.selectedRadius).toBe(8);
    expect(CHIP_TOKENS.pressedRadius).toBe(8);
    expect(TOOLTIP_TOKENS.plainRadius).toBe(4);
    expect(TOOLTIP_TOKENS.richRadius).toBe(12);
    expect(SNACKBAR_TOKENS.containerRadius).toBe(4);

    expect(getMaterialShape("cookie9Sided")).toBe(MATERIAL_SHAPES.cookie9Sided);
    expect(parseShortcutKeys("⌘K")).toEqual(["⌘", "K"]);
    expect(parseShortcutKeys("Ctrl+Shift+P")).toEqual(["Ctrl", "Shift", "P"]);
  });


  it("matches AOSP multiBrowseKeylineList arrangements", () => {
    const sizes = (count: number, containerWidth: number) =>
      resolveCarouselKeylineStrategy({ count, containerWidth, variant: "multi-browse" })
        .defaultKeylines.keylines.filter((k) => !k.isAnchor)
        .map((k) => Math.round(k.size));
    expect(sizes(10, 700)).toEqual([212, 212, 212, 40]);
    expect(sizes(10, 1260)).toEqual([212, 212, 212, 212, 212, 112, 40]);
    expect(sizes(10, 360)).toEqual([201, 103, 40]);
  });
  it("resolves AOSP Keyline & Clip-Mask Carousel strategy across all 4 variants without squashing 50+ items", () => {
    const count = 50;
    const containerWidth = 720;
    const variants = ["multi-browse", "hero", "centered-hero", "uncontained"] as const;

    for (const variant of variants) {
      const strategy = resolveCarouselKeylineStrategy({
        count,
        containerWidth,
        variant,
        preferredItemWidth: 220,
        gap: 8,
      });
      expect(strategy.isValid).toBe(true);
      expect(strategy.itemMainAxisSize).toBeGreaterThanOrEqual(180);

      const startSnap = resolveCarouselSnapOffset({ strategy, index: 0, count });
      expect(startSnap).toBe(0);
      const firstAtStart = resolveCarouselItemFrame({
        strategy,
        index: 0,
        count,
        scrollOffset: startSnap,
      });
      expect(firstAtStart.slotWidth).toBeCloseTo(strategy.itemMainAxisSize, 2);
      expect(firstAtStart.maskWidth).toBeCloseTo(strategy.itemMainAxisSize, 1);
      expect(firstAtStart.isFocal).toBe(true);

      const endSnap = resolveCarouselSnapOffset({ strategy, index: count - 1, count });
      expect(endSnap).toBeGreaterThan(containerWidth * 4);
      const lastAtEnd = resolveCarouselItemFrame({
        strategy,
        index: count - 1,
        count,
        scrollOffset: endSnap,
      });
      expect(lastAtEnd.maskWidth).toBeCloseTo(strategy.itemMainAxisSize, 1);
      expect(lastAtEnd.isFocal).toBe(true);
    }

    const centered = resolveCarouselKeylineStrategy({
      count,
      containerWidth,
      variant: "centered-hero",
      gap: 8,
    });
    const midSnap = resolveCarouselSnapOffset({ strategy: centered, index: 25, count });
    const midFocal = resolveCarouselItemFrame({
      strategy: centered,
      index: 25,
      count,
      scrollOffset: midSnap,
    });
    const leftPeek = resolveCarouselItemFrame({
      strategy: centered,
      index: 24,
      count,
      scrollOffset: midSnap,
    });
    const rightPeek = resolveCarouselItemFrame({
      strategy: centered,
      index: 26,
      count,
      scrollOffset: midSnap,
    });
    expect(midFocal.maskWidth).toBeCloseTo(centered.itemMainAxisSize, 1);
    expect(leftPeek.maskWidth).toBeLessThan(midFocal.maskWidth * 0.4);
    expect(leftPeek.maskWidth).toBeCloseTo(rightPeek.maskWidth, 1);
  });

  it("resolves DragHandle token contracts", () => {
    expect(DRAG_HANDLE_TOKENS).toMatchObject({
      width: 4,
      height: 48,
      pressedWidth: 12,
      pressedHeight: 52,
      containerSize: 24,
      hitTargetSize: 48,
    });
    expect(resolveDragHandleGeometry()).toEqual({
      inlineSize: 4,
      blockSize: 48,
      cornerRadius: 9999,
    });
    expect(resolveDragHandleGeometry({ isActive: true })).toEqual({
      inlineSize: 12,
      blockSize: 52,
      cornerRadius: 12,
    });
    expect(
      resolveDragHandleGeometry({ isActive: true, orientation: "horizontal" }),
    ).toEqual({
      inlineSize: 52,
      blockSize: 12,
      cornerRadius: 12,
    });
  });

  it("keeps M3E_DEFAULT_THEME synchronized with generateM3EThemeTokens", () => {
    const expected = generateM3EThemeTokens({
      seedHex: "#6750A4",
      variant: "expressive",
    });
    expect(M3E_DEFAULT_THEME.light).toEqual(expected.light);
    expect(M3E_DEFAULT_THEME.dark).toEqual(expected.dark);
    expect(M3E_DEFAULT_THEME.cssLightDarkVars).toEqual(expected.cssLightDarkVars);
  });
});
