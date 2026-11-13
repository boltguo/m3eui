import { describe, expect, it } from "vitest";
import {
  BUTTON_GROUP_TOKENS,
  BUTTON_SIZE_SPECS,
  EXPRESSIVE_MOTION_SCHEME,
  FLOATING_TOOLBAR_TOKENS,
  ICON_BUTTON_SIZE_SPECS,
  LOADING_INDICATOR_MORPH_SEQUENCE,
  LOADING_INDICATOR_SHAPE_SEQUENCE,
  LOADING_INDICATOR_TOKENS,
  M3E_ALL_SHAPE_NAMES,
  MATERIAL_SHAPES,
  STANDARD_MOTION_SCHEME,
  buildDeterminateCircularWavyGeometry,
  buildDeterminateLinearWavyGeometry,
  buildIndeterminateCircularWavyGeometry,
  buildIndeterminateLinearWavyGeometry,
  computeButtonGroupWidths,
  cubicsToSvgPath,
  evaluateSpringDisplacement,
  flipCornersHorizontal,
  generateM3EThemeTokens,
  getShapeMorphPair,
  interpolateMorphCubics,
  resolveAccordionItemCorners,
  resolveCarouselLayout,
  resolveCircularProgressArcs,
  resolveClockHandGeometry,
  resolveConnectedGroupCorners,
  resolveCrossPlatformSpring,
  resolveDeterminateWaveAmplitude,
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
  SLIDER_SIZE_SPECS,
  SWITCH_TOKENS,
} from "./index.js";

describe("m3eui/tokens — Motion Physics & Cross-Platform Springs", () => {
  it("enforces critical damping (dampingRatio === 1.0, zero overshoot) on all effects springs", () => {
    for (const scheme of [EXPRESSIVE_MOTION_SCHEME, STANDARD_MOTION_SCHEME]) {
      for (const key of ["fastEffects", "defaultEffects", "slowEffects"] as const) {
        const spec = scheme[key];
        expect(spec.dampingRatio).toBe(1.0);
        const resolved = resolveCrossPlatformSpring(spec);
        expect(resolved.peakOvershoot).toBe(0);

        // Verify analytical displacement never exceeds 1.0
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
    // c = 2 * 0.6 * sqrt(800) ≈ 33.9411
    expect(resolved.dampingCoefficient).toBeCloseTo(2 * 0.6 * Math.sqrt(800), 4);
    expect(resolved.peakOvershoot).toBeGreaterThan(0.08);
    expect(resolved.cssLinear.easing.startsWith("linear(")).toBe(true);

    // Slow-motion 0.2x scales stiffness by 0.04 while keeping peakOvershoot identical
    const slowMo = resolveCrossPlatformSpring(fastSpatial, 0.2);
    expect(slowMo.stiffness).toBeCloseTo(800 * 0.04, 4);
    expect(slowMo.peakOvershoot).toBeCloseTo(resolved.peakOvershoot, 4);
  });
});

describe("m3eui/tokens — Group Topology & Zero-Sum Width Squish", () => {
  it("resolves SegmentedList corners accurately for single vs multi-item & interactive states", () => {
    // Single item: all 16
    expect(resolveSegmentedListCorners({ index: 0, count: 1 })).toEqual([16, 16, 16, 16]);

    // Multi-item (count = 3)
    expect(resolveSegmentedListCorners({ index: 0, count: 3 })).toEqual([16, 16, 4, 4]);
    expect(resolveSegmentedListCorners({ index: 1, count: 3 })).toEqual([4, 4, 4, 4]);
    expect(resolveSegmentedListCorners({ index: 2, count: 3 })).toEqual([4, 4, 16, 16]);

    // Hover preserves 4px inner seam geometry (only surface color changes on hover)
    expect(resolveSegmentedListCorners({ index: 0, count: 3, isHovered: true })).toEqual([
      16, 16, 4, 4,
    ]);
    expect(resolveSegmentedListCorners({ index: 1, count: 3, isHovered: true })).toEqual([
      4, 4, 4, 4,
    ]);

    // Selected or pressed detaches to full [16, 16, 16, 16]
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
    // Per AOSP ToggleButton.kt L1714, `pressed` overrides `checked` during active press
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
    // StandardButtonGroup defaults to 0.15 squish; ConnectedButtonGroup defaults to 0 (stationary tab widths)
    expect(BUTTON_GROUP_TOKENS.standardExpandedRatio).toBe(0.15);
    expect(BUTTON_GROUP_TOKENS.connectedExpandedRatio).toBe(0);
  });

  it("preserves exact zero-sum total width across all press & spring overshoot states", () => {
    const baseWidths = [100, 120, 110, 96];
    const baseSum = baseWidths.reduce((a, b) => a + b, 0);

    const testVectors = [
      [1, 0, 0, 0], // First item pressed
      [0, 1, 0, 0], // Middle item pressed
      [0, 0, 1.12, 0], // Middle item with spring overshoot
      [0, 0, 0, 1], // Last item pressed
      [0.4, 0.8, 0, 0], // Overlapping transition
    ];

    for (const pressProgress of testVectors) {
      const out = computeButtonGroupWidths({ baseWidths, pressProgress });
      const sum = out.reduce((a, b) => a + b, 0);
      expect(Math.abs(sum - baseSum)).toBeLessThan(1e-6);
    }

    // Pressing middle item expands it by ~15% (120 * 0.15 = 18 => 138) and shrinks neighbors by 9 each
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

      // Verify closure of normalized shapes
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
      cycleFraction: 0.45,
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

  it("normalizes all 35 official MaterialShapes cleanly inside [0..1] and morphs arbitrary pairs 1:1", () => {
    expect(M3E_ALL_SHAPE_NAMES.length).toBe(35);
    expect(Object.keys(MATERIAL_SHAPES).length).toBe(35);

    for (const name of M3E_ALL_SHAPE_NAMES) {
      const shape = MATERIAL_SHAPES[name];
      expect(shape.cubics.length).toBeGreaterThanOrEqual(4);
      expect(shape.previewSvgPath.startsWith("M ")).toBe(true);
      expect(shape.previewSvgPath.includes("NaN")).toBe(false);
      // Normalized inside [0..1] × [0..1] with small tolerance
      expect(shape.bounds[0]).toBeGreaterThanOrEqual(-0.02);
      expect(shape.bounds[1]).toBeGreaterThanOrEqual(-0.02);
      expect(shape.bounds[2]).toBeLessThanOrEqual(1.02);
      expect(shape.bounds[3]).toBeLessThanOrEqual(1.02);
      // Endpoint loop closure
      const first = shape.cubics[0];
      const last = shape.cubics[shape.cubics.length - 1];
      expect(first[0]).toBeCloseTo(last[6], 5);
      expect(first[1]).toBeCloseTo(last[7], 5);
    }

    // Arbitrary shape morph pairs (including pixel & organic shapes)
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

    // At 100% progress with wave amplitude 1, start point === end point (seamless C1 closure!)
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

describe("m3eui/tokens — Phase 2 IconButton (5×3), SplitButton & FloatingToolbar/FABMenu", () => {
  it("resolves exact 5×3 IconButton aspect widths and pressed > selected > rest corner priority", () => {
    expect(ICON_BUTTON_SIZE_SPECS.xs.widths).toEqual({ narrow: 28, default: 32, wide: 40 });
    expect(ICON_BUTTON_SIZE_SPECS.sm.widths).toEqual({ narrow: 32, default: 40, wide: 52 });
    expect(ICON_BUTTON_SIZE_SPECS.md.widths).toEqual({ narrow: 48, default: 56, wide: 72 });
    expect(ICON_BUTTON_SIZE_SPECS.lg.widths).toEqual({ narrow: 64, default: 96, wide: 128 });
    expect(ICON_BUTTON_SIZE_SPECS.xl.widths).toEqual({ narrow: 104, default: 136, wide: 184 });

    // Round SM: rest=20, selected=12, pressed=8 (even when selected!)
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
    expect(resolveSegmentedMenuItemCorners({ index: 1, count: 3, isHighlighted: true })).toEqual([
      12, 12, 12, 12,
    ]);
  });

  it("enforces FloatingToolbar concentric geometry and ToggleFAB 0 -> 1 spring morph", () => {
    // 32px outer radius - 8px padding === 24px inner item pill radius (48px height / 2)
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

describe("m3eui/tokens — Phase 3 Switch & Slider Geometry", () => {
  it("resolves exact M3E Switch handle diameters (16 -> 24 -> 28px) and outer track offsets", () => {
    expect(SWITCH_TOKENS.trackWidth).toBe(52);
    expect(SWITCH_TOKENS.trackHeight).toBe(32);

    // Unchecked rest (no icon): 16px diameter, 8px inset
    expect(resolveSwitchGeometry({ checked: false, isPressed: false })).toEqual({
      thumbSize: 16,
      thumbOffsetPx: 8,
    });

    // Unchecked rest with icon: 24px diameter, 4px inset
    expect(
      resolveSwitchGeometry({ checked: false, isPressed: false, hasUncheckedIcon: true }),
    ).toEqual({
      thumbSize: 24,
      thumbOffsetPx: 4,
    });

    // Checked rest: 24px diameter, 52 - 24 - 4 = 24px offset
    expect(resolveSwitchGeometry({ checked: true, isPressed: false })).toEqual({
      thumbSize: 24,
      thumbOffsetPx: 24,
    });

    // Pressed swells handle to 28px on both unchecked (2px) and checked (22px)
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
      trackGap: 5,
    });
  });

  it("resolves M3E Segmented Accordion corner detachment including neighbor rounding", () => {
    // Closed 3-item stack: [16,16,4,4], [4,4,4,4], [4,4,16,16]
    expect(resolveAccordionItemCorners({ index: 0, count: 3, isOpen: false })).toEqual([
      16, 16, 4, 4,
    ]);
    expect(resolveAccordionItemCorners({ index: 1, count: 3, isOpen: false })).toEqual([
      4, 4, 4, 4,
    ]);
    // When middle item (index 1) opens: it becomes [16,16,16,16], AND index 0's bottom & index 2's top also round to 16!
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

describe("m3eui/tokens — Phase 5 Carousel, FAB, OTPField, TopAppBar & Track-Gap Progress", () => {
  it("preserves exact zero-sum container width in Carousel across fractional spring focal positions", () => {
    const containerWidth = 720;
    const gap = 8;
    const count = 5;
    for (const focal of [0, 0.37, 1.85, 2.0, 4.12]) {
      const items = resolveCarouselLayout({
        count,
        containerWidth,
        focalPosition: focal,
        variant: "multi-browse",
        gap,
      });
      const totalWidth = items.reduce((acc, item) => acc + item.width, 0) + (count - 1) * gap;
      expect(Math.abs(totalWidth - containerWidth)).toBeLessThan(1e-6);
    }
    // Focal card at index 2 gets 28px corner radius
    const settled = resolveCarouselLayout({
      count,
      containerWidth,
      focalPosition: 2,
      variant: "hero",
      gap,
    });
    expect(settled[2]?.cornerRadius).toBeCloseTo(28, 3);
    expect(settled[2]!.width).toBeGreaterThan(settled[1]!.width);
    expect(settled[1]!.width).toBeGreaterThan(settled[0]!.width);
  });

  it("resolves multi-segment SegmentedMenu & OTPField slot corners cleanly", () => {
    // Segmented menu item right before a separator (`isLastInGroup: true` even at index 2 of 4)
    expect(
      resolveSegmentedMenuItemCorners({
        index: 2,
        count: 4,
        isFirstInGroup: false,
        isLastInGroup: true,
      }),
    ).toEqual([4, 4, 12, 12]);
    // Single-item isolated segment after separator (`isFirstInGroup && isLastInGroup`)
    expect(
      resolveSegmentedMenuItemCorners({
        index: 3,
        count: 4,
        isFirstInGroup: true,
        isLastInGroup: true,
      }),
    ).toEqual([12, 12, 12, 12]);

    // OTP connected group: leading [16,6,6,16], middle [6,6,6,6], focused middle detaches to [16,16,16,16]
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
    const collapsed = resolveTopAppBarGeometry({
      variant: "large-flexible",
      collapsedFraction: 1,
    });
    expect(expanded.height).toBe(148);
    expect(collapsed.height).toBe(64);
    expect(collapsed.isElevated).toBe(true);

    expect(resolveFabGeometry({ size: "lg", isPressed: false }).cornerRadius).toBe(20);
    expect(resolveFabGeometry({ size: "lg", isPressed: true }).cornerRadius).toBe(14);

    const arc50 = resolveCircularProgressArcs({ progress: 0.5, size: 48, strokeWidth: 4.5 });
    expect(arc50.activeDashLength).toBeGreaterThan(0);
    expect(arc50.trackDashLength).toBeGreaterThan(0);
    expect(arc50.activeDashLength + arc50.trackDashLength).toBeLessThan(arc50.circumference);
  });
});

describe("m3eui/tokens — Phase 6 RTL Corner Mirroring & TimePicker Clock Geometry", () => {
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
    expect(h12.offsetY).toBeCloseTo(-92, 2);

    const h15 = resolveClockHandGeometry({ mode: "hour", value: 15, use24Hour: true });
    expect(h15.angleDeg).toBe(90);
    expect(h15.isInnerRing).toBe(true);
    expect(h15.radius).toBe(58);
    expect(h15.offsetX).toBeCloseTo(58, 2);
    expect(h15.offsetY).toBeCloseTo(0, 2);

    const m45 = resolveClockHandGeometry({ mode: "minute", value: 45 });
    expect(m45.angleDeg).toBe(270);
    expect(m45.offsetX).toBeCloseTo(-92, 2);
    expect(m45.offsetY).toBeCloseTo(0, 1);
  });
});
