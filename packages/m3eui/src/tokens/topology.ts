export const SHAPE_CORNER_TOKENS = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 12,
  large: 16,
  largeIncreased: 20,
  extraLarge: 28,
  extraLargeIncreased: 32,
  extraExtraLarge: 48,
  full: 9999,
} as const;

export type CornerTuple = readonly [
  topLeft: number,
  topRight: number,
  bottomRight: number,
  bottomLeft: number,
];

export type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";

export interface ButtonSizeSpec {
  readonly size: ButtonSize;
  readonly height: number;
  readonly paddingHorizontal: number;
  readonly iconSize: number;
  readonly iconGap: number;
  readonly fontSize: number;
  readonly lineHeight: number;
  readonly fontWeight: number;
  readonly restCornerRadius: number;
  readonly squareCornerRadius: number;
  readonly pressedCornerRadius: number;
  readonly selectedCornerRadius: number;
}

export const BUTTON_SIZE_SPECS: Record<ButtonSize, ButtonSizeSpec> = {
  xs: {
    size: "xs",
    height: 32,
    paddingHorizontal: 12,
    iconSize: 18,
    iconGap: 6,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: 500,
    restCornerRadius: 16,
    squareCornerRadius: 12,
    pressedCornerRadius: 8,
    selectedCornerRadius: 12,
  },
  sm: {
    size: "sm",
    height: 40,
    paddingHorizontal: 16,
    iconSize: 20,
    iconGap: 8,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    restCornerRadius: 20,
    squareCornerRadius: 12,
    pressedCornerRadius: 8,
    selectedCornerRadius: 12,
  },
  md: {
    size: "md",
    height: 56,
    paddingHorizontal: 24,
    iconSize: 24,
    iconGap: 8,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: 500,
    restCornerRadius: 28,
    squareCornerRadius: 16,
    pressedCornerRadius: 12,
    selectedCornerRadius: 16,
  },
  lg: {
    size: "lg",
    height: 96,
    paddingHorizontal: 48,
    iconSize: 32,
    iconGap: 12,
    fontSize: 24,
    lineHeight: 32,
    fontWeight: 500,
    restCornerRadius: 48,
    squareCornerRadius: 28,
    pressedCornerRadius: 16,
    selectedCornerRadius: 28,
  },
  xl: {
    size: "xl",
    height: 136,
    paddingHorizontal: 64,
    iconSize: 40,
    iconGap: 16,
    fontSize: 32,
    lineHeight: 40,
    fontWeight: 500,
    restCornerRadius: 68,
    squareCornerRadius: 28,
    pressedCornerRadius: 16,
    selectedCornerRadius: 28,
  },
};

export interface SegmentedListCornerInput {
  readonly index: number;
  readonly count: number;
  readonly isHovered?: boolean;
  readonly isPressed?: boolean;
  readonly isSelected?: boolean;
  readonly isExpanded?: boolean;
}

export const SEGMENTED_LIST_TOKENS = {
  gap: 2,
  outerRadius: SHAPE_CORNER_TOKENS.large,
  innerRadius: SHAPE_CORNER_TOKENS.extraSmall,
  hoveredInnerRadius: SHAPE_CORNER_TOKENS.medium,
  activeRadius: SHAPE_CORNER_TOKENS.large,
  oneLineMinHeight: 56,
  twoLineMinHeight: 72,
  threeLineMinHeight: 88,
  paddingHorizontal: 16,
  paddingVertical: 10,
  internalGap: 12,
} as const;

export function resolveSegmentedListCorners(
  input: SegmentedListCornerInput,
): CornerTuple {
  const {
    index,
    count,
    isPressed = false,
    isSelected = false,
    isExpanded = false,
  } = input;

  const { outerRadius, innerRadius, activeRadius } = SEGMENTED_LIST_TOKENS;

  if (count <= 1 || isPressed || isSelected || isExpanded) {
    return [activeRadius, activeRadius, activeRadius, activeRadius];
  }

  if (index <= 0) {
    return [outerRadius, outerRadius, innerRadius, innerRadius];
  }
  if (index >= count - 1) {
    return [innerRadius, innerRadius, outerRadius, outerRadius];
  }
  return [innerRadius, innerRadius, innerRadius, innerRadius];
}

export interface ConnectedGroupCornerInput {
  readonly index: number;
  readonly count: number;
  readonly height?: number;
  readonly isPressed?: boolean;
  readonly isChecked?: boolean;
}

export const BUTTON_GROUP_TOKENS = {
  standardGap: 12,
  connectedGap: 2,
  expandedRatio: 0.15,
  standardExpandedRatio: 0.15,
  connectedExpandedRatio: 0,
  connectedInnerRadius: SHAPE_CORNER_TOKENS.small,
  connectedPressedInnerRadius: SHAPE_CORNER_TOKENS.extraSmall,
} as const;

export function resolveConnectedGroupCorners(
  input: ConnectedGroupCornerInput,
): CornerTuple {
  const {
    index,
    count,
    height = 40,
    isPressed = false,
    isChecked = false,
  } = input;

  const pill = Math.round(height / 2);
  const inner = isPressed
    ? BUTTON_GROUP_TOKENS.connectedPressedInnerRadius
    : BUTTON_GROUP_TOKENS.connectedInnerRadius;

  if (!isPressed && isChecked) {
    return [pill, pill, pill, pill];
  }

  if (count <= 1) {
    return isPressed ? [inner * 2, inner * 2, inner * 2, inner * 2] : [pill, pill, pill, pill];
  }

  if (index <= 0) {
    return [pill, inner, inner, pill];
  }
  if (index >= count - 1) {
    return [inner, pill, pill, inner];
  }
  return [inner, inner, inner, inner];
}

export interface ButtonGroupWidthInput {
  readonly baseWidths: readonly number[];
  readonly pressProgress: readonly number[];
  readonly expandedRatio?: number;
  readonly compressionLimits?: readonly number[];
}

export function computeButtonGroupWidths(
  input: ButtonGroupWidthInput,
): number[] {
  const {
    baseWidths,
    pressProgress,
    expandedRatio = BUTTON_GROUP_TOKENS.expandedRatio,
    compressionLimits,
  } = input;

  const count = baseWidths.length;
  const widths = [...baseWidths];
  if (count <= 1) {
    return widths;
  }

  const limitAt = (idx: number): number =>
    compressionLimits?.[idx] ?? Math.max(12, baseWidths[idx] * 0.35);

  for (let index = 0; index < count; index++) {
    const progress = pressProgress[index] ?? 0;
    if (progress === 0) continue;

    let actualGrowth = 0;

    if (index > 0 && index < count - 1) {
      const maxPerSide = Math.min(
        (expandedRatio * widths[index]) / 2,
        limitAt(index - 1),
        limitAt(index + 1),
      );
      const targetPerSide = progress * maxPerSide;
      const growthLeft = Math.min(targetPerSide, Math.max(0, widths[index - 1] - 24));
      const growthRight = Math.min(targetPerSide, Math.max(0, widths[index + 1] - 24));
      widths[index - 1] -= growthLeft;
      widths[index + 1] -= growthRight;
      actualGrowth = growthLeft + growthRight;
    } else if (index === 0) {
      const maxGrowth = Math.min(expandedRatio * widths[index], limitAt(1));
      const targetGrowth = progress * maxGrowth;
      const growthRight = Math.min(targetGrowth, Math.max(0, widths[1] - 24));
      widths[1] -= growthRight;
      actualGrowth = growthRight;
    } else {
      const prev = count - 2;
      const maxGrowth = Math.min(expandedRatio * widths[index], limitAt(prev));
      const targetGrowth = progress * maxGrowth;
      const growthLeft = Math.min(targetGrowth, Math.max(0, widths[prev] - 24));
      widths[prev] -= growthLeft;
      actualGrowth = growthLeft;
    }

    widths[index] += actualGrowth;
  }

  return widths;
}

export type IconButtonWidthVariant = "narrow" | "default" | "wide";
export type IconButtonVariant = "filled" | "tonal" | "outlined" | "standard";

export interface IconButtonSizeSpec {
  readonly size: ButtonSize;
  readonly height: number;
  readonly iconSize: number;
  readonly paddingByWidth: Record<IconButtonWidthVariant, number>;
  readonly widths: Record<IconButtonWidthVariant, number>;
  readonly roundCornerRadius: number;
  readonly squareCornerRadius: number;
  readonly pressedCornerRadius: number;
  readonly selectedRoundCornerRadius: number;
  readonly selectedSquareCornerRadius: number;
  readonly outlineWidth: number;
}

export const ICON_BUTTON_SIZE_SPECS: Record<ButtonSize, IconButtonSizeSpec> = {
  xs: {
    size: "xs",
    height: 32,
    iconSize: 20,
    paddingByWidth: { narrow: 4, default: 6, wide: 10 },
    widths: { narrow: 28, default: 32, wide: 40 },
    roundCornerRadius: 16,
    squareCornerRadius: 12,
    pressedCornerRadius: 8,
    selectedRoundCornerRadius: 12,
    selectedSquareCornerRadius: 16,
    outlineWidth: 1,
  },
  sm: {
    size: "sm",
    height: 40,
    iconSize: 24,
    paddingByWidth: { narrow: 4, default: 8, wide: 14 },
    widths: { narrow: 32, default: 40, wide: 52 },
    roundCornerRadius: 20,
    squareCornerRadius: 12,
    pressedCornerRadius: 8,
    selectedRoundCornerRadius: 12,
    selectedSquareCornerRadius: 20,
    outlineWidth: 1,
  },
  md: {
    size: "md",
    height: 56,
    iconSize: 24,
    paddingByWidth: { narrow: 12, default: 16, wide: 24 },
    widths: { narrow: 48, default: 56, wide: 72 },
    roundCornerRadius: 28,
    squareCornerRadius: 16,
    pressedCornerRadius: 12,
    selectedRoundCornerRadius: 16,
    selectedSquareCornerRadius: 28,
    outlineWidth: 1,
  },
  lg: {
    size: "lg",
    height: 96,
    iconSize: 32,
    paddingByWidth: { narrow: 16, default: 32, wide: 48 },
    widths: { narrow: 64, default: 96, wide: 128 },
    roundCornerRadius: 48,
    squareCornerRadius: 28,
    pressedCornerRadius: 16,
    selectedRoundCornerRadius: 28,
    selectedSquareCornerRadius: 48,
    outlineWidth: 2,
  },
  xl: {
    size: "xl",
    height: 136,
    iconSize: 40,
    paddingByWidth: { narrow: 32, default: 48, wide: 72 },
    widths: { narrow: 104, default: 136, wide: 184 },
    roundCornerRadius: 68,
    squareCornerRadius: 28,
    pressedCornerRadius: 16,
    selectedRoundCornerRadius: 28,
    selectedSquareCornerRadius: 68,
    outlineWidth: 3,
  },
};

export interface IconButtonGeometryInput {
  readonly size?: ButtonSize;
  readonly widthVariant?: IconButtonWidthVariant;
  readonly shape?: "round" | "square";
  readonly isPressed?: boolean;
  readonly isSelected?: boolean;
}

export interface IconButtonGeometryOutput {
  readonly width: number;
  readonly height: number;
  readonly iconSize: number;
  readonly paddingInline: number;
  readonly outlineWidth: number;
  readonly cornerRadius: number;
  readonly corners: CornerTuple;
}

export function resolveIconButtonGeometry(
  input: IconButtonGeometryInput = {},
): IconButtonGeometryOutput {
  const {
    size = "sm",
    widthVariant = "default",
    shape = "round",
    isPressed = false,
    isSelected = false,
  } = input;

  const spec = ICON_BUTTON_SIZE_SPECS[size];
  const restRadius =
    shape === "square" ? spec.squareCornerRadius : spec.roundCornerRadius;
  const selectedRadius =
    shape === "square"
      ? spec.selectedSquareCornerRadius
      : spec.selectedRoundCornerRadius;

  const cornerRadius = isPressed
    ? spec.pressedCornerRadius
    : isSelected
      ? selectedRadius
      : restRadius;

  return {
    width: spec.widths[widthVariant],
    height: spec.height,
    iconSize: spec.iconSize,
    paddingInline: spec.paddingByWidth[widthVariant],
    outlineWidth: spec.outlineWidth,
    cornerRadius,
    corners: [cornerRadius, cornerRadius, cornerRadius, cornerRadius],
  };
}

export interface SplitButtonSizeSpec {
  readonly size: ButtonSize;
  readonly height: number;
  readonly innerRestRadius: number;
  readonly innerActiveRadius: number;
  readonly leadingPaddingStart: number;
  readonly leadingPaddingEnd: number;
  readonly leadingIconSize: number;
  readonly leadingIconGap: number;
  readonly trailingPaddingInline: number;
  readonly trailingIconSize: number;
  readonly trailingWidth: number;
  readonly fontSize: number;
  readonly lineHeight: number;
}

export const SPLIT_BUTTON_TOKENS = {
  gap: 2,
  opticalCenterCoefficient: 0.11,
} as const;

export const SPLIT_BUTTON_SPECS: Record<ButtonSize, SplitButtonSizeSpec> = {
  xs: {
    size: "xs",
    height: 32,
    innerRestRadius: 4,
    innerActiveRadius: 8,
    leadingPaddingStart: 12,
    leadingPaddingEnd: 10,
    leadingIconSize: 18,
    leadingIconGap: 6,
    trailingPaddingInline: 13,
    trailingIconSize: 22,
    trailingWidth: 48,
    fontSize: 13,
    lineHeight: 18,
  },
  sm: {
    size: "sm",
    height: 40,
    innerRestRadius: 4,
    innerActiveRadius: 12,
    leadingPaddingStart: 16,
    leadingPaddingEnd: 12,
    leadingIconSize: 20,
    leadingIconGap: 8,
    trailingPaddingInline: 13,
    trailingIconSize: 22,
    trailingWidth: 48,
    fontSize: 14,
    lineHeight: 20,
  },
  md: {
    size: "md",
    height: 56,
    innerRestRadius: 4,
    innerActiveRadius: 12,
    leadingPaddingStart: 24,
    leadingPaddingEnd: 24,
    leadingIconSize: 24,
    leadingIconGap: 8,
    trailingPaddingInline: 15,
    trailingIconSize: 26,
    trailingWidth: 56,
    fontSize: 16,
    lineHeight: 24,
  },
  lg: {
    size: "lg",
    height: 96,
    innerRestRadius: 8,
    innerActiveRadius: 20,
    leadingPaddingStart: 48,
    leadingPaddingEnd: 48,
    leadingIconSize: 32,
    leadingIconGap: 12,
    trailingPaddingInline: 29,
    trailingIconSize: 38,
    trailingWidth: 96,
    fontSize: 24,
    lineHeight: 32,
  },
  xl: {
    size: "xl",
    height: 136,
    innerRestRadius: 12,
    innerActiveRadius: 20,
    leadingPaddingStart: 64,
    leadingPaddingEnd: 64,
    leadingIconSize: 40,
    leadingIconGap: 16,
    trailingPaddingInline: 43,
    trailingIconSize: 50,
    trailingWidth: 136,
    fontSize: 32,
    lineHeight: 40,
  },
};

export interface SplitButtonGeometryInput {
  readonly size?: ButtonSize;
  readonly isLeadingPressed?: boolean;
  readonly isTrailingPressed?: boolean;
  readonly isExpanded?: boolean;
}

export interface SplitButtonGeometryOutput {
  readonly spec: SplitButtonSizeSpec;
  readonly gap: number;
  readonly leadingCorners: CornerTuple;
  readonly trailingCorners: CornerTuple;
  readonly trailingOpticalOffsetPx: number;
  readonly chevronRotationDeg: number;
}

export function resolveSplitButtonGeometry(
  input: SplitButtonGeometryInput = {},
): SplitButtonGeometryOutput {
  const {
    size = "sm",
    isLeadingPressed = false,
    isTrailingPressed = false,
    isExpanded = false,
  } = input;

  const spec = SPLIT_BUTTON_SPECS[size];
  const pill = Math.round(spec.height / 2);

  const leadInner = isLeadingPressed ? spec.innerActiveRadius : spec.innerRestRadius;
  const leadingCorners: CornerTuple = [pill, leadInner, leadInner, pill];

  let trailingCorners: CornerTuple;
  if (isTrailingPressed) {
    trailingCorners = [spec.innerActiveRadius, pill, pill, spec.innerActiveRadius];
  } else if (isExpanded) {
    trailingCorners = [pill, pill, pill, pill];
  } else {
    trailingCorners = [spec.innerRestRadius, pill, pill, spec.innerRestRadius];
  }

  const trailingOpticalOffsetPx = Number(
    (
      -SPLIT_BUTTON_TOKENS.opticalCenterCoefficient *
      (trailingCorners[1] - trailingCorners[0])
    ).toFixed(2),
  );

  return {
    spec,
    gap: SPLIT_BUTTON_TOKENS.gap,
    leadingCorners,
    trailingCorners,
    trailingOpticalOffsetPx,
    chevronRotationDeg: isExpanded ? 180 : 0,
  };
}

export const SEGMENTED_MENU_TOKENS = {
  containerRadius: SHAPE_CORNER_TOKENS.large,
  containerPadding: 4,
  itemGap: 2,
  itemOuterRadius: SHAPE_CORNER_TOKENS.medium,
  itemInnerRadius: SHAPE_CORNER_TOKENS.extraSmall,
  itemPressedRadius: SHAPE_CORNER_TOKENS.small,
  itemHeight: 44,
  itemPaddingInline: 14,
} as const;

export function resolveSegmentedMenuItemCorners(input: {
  readonly index: number;
  readonly count: number;
  readonly isFirstInGroup?: boolean;
  readonly isLastInGroup?: boolean;
  readonly isHighlighted?: boolean;
  readonly isSelected?: boolean;
  readonly isPressed?: boolean;
}): CornerTuple {
  const {
    index,
    count,
    isFirstInGroup = index <= 0,
    isLastInGroup = index >= count - 1,
    isHighlighted = false,
    isSelected = false,
    isPressed = false,
  } = input;
  const {
    itemOuterRadius: outer,
    itemInnerRadius: inner,
    itemPressedRadius: pressed,
  } = SEGMENTED_MENU_TOKENS;

  if (isPressed) {
    return [pressed, pressed, pressed, pressed];
  }
  if (count <= 1 || (isFirstInGroup && isLastInGroup) || isHighlighted || isSelected) {
    return [outer, outer, outer, outer];
  }
  const topR = isFirstInGroup ? outer : inner;
  const bottomR = isLastInGroup ? outer : inner;
  return [topR, topR, bottomR, bottomR];
}

export type FloatingToolbarTheme = "standard" | "vibrant";

export const FLOATING_TOOLBAR_TOKENS = {
  containerCrossSize: 64,
  containerRadius: 32,
  containerPadding: 8,
  itemSize: 48,
  itemGap: 4,
  companionFabGap: 8,
  externalMargin: 16,
} as const;

export type ToggleFabSize = "sm" | "md" | "lg";

export interface ToggleFabSizeSpec {
  readonly size: ToggleFabSize;
  readonly collapsedSize: number;
  readonly collapsedRadius: number;
  readonly collapsedIconSize: number;
  readonly expandedSize: number;
  readonly expandedRadius: number;
  readonly expandedIconSize: number;
}

export const TOGGLE_FAB_SPECS: Record<ToggleFabSize, ToggleFabSizeSpec> = {
  sm: {
    size: "sm",
    collapsedSize: 56,
    collapsedRadius: 16,
    collapsedIconSize: 24,
    expandedSize: 56,
    expandedRadius: 28,
    expandedIconSize: 20,
  },
  md: {
    size: "md",
    collapsedSize: 80,
    collapsedRadius: 20,
    collapsedIconSize: 28,
    expandedSize: 56,
    expandedRadius: 28,
    expandedIconSize: 20,
  },
  lg: {
    size: "lg",
    collapsedSize: 96,
    collapsedRadius: 28,
    collapsedIconSize: 36,
    expandedSize: 56,
    expandedRadius: 28,
    expandedIconSize: 20,
  },
};

export const FAB_MENU_TOKENS = {
  itemHeight: 56,
  itemRadius: 28,
  itemPaddingInline: 24,
  itemIconSize: 24,
  itemIconGap: 8,
  listGap: 4,
  closeButtonGap: 8,
  staggerStepMs: 35,
} as const;

export interface ToggleFabGeometryOutput {
  readonly containerSize: number;
  readonly cornerRadius: number;
  readonly iconSize: number;
  readonly iconRotationDeg: number;
}

export function resolveToggleFabGeometry(
  size: ToggleFabSize = "md",
  progress = 0,
): ToggleFabGeometryOutput {
  const spec = TOGGLE_FAB_SPECS[size];
  const lerp = (a: number, b: number) => a + (b - a) * progress;

  return {
    containerSize: Math.max(40, lerp(spec.collapsedSize, spec.expandedSize)),
    cornerRadius: Math.max(4, lerp(spec.collapsedRadius, spec.expandedRadius)),
    iconSize: Math.max(14, lerp(spec.collapsedIconSize, spec.expandedIconSize)),
    iconRotationDeg: 45 * progress,
  };
}

export const SWITCH_TOKENS = {
  trackWidth: 52,
  trackHeight: 32,
  trackRadius: 16,
  trackOutlineWidth: 2,
  uncheckedThumbSize: 16,
  uncheckedIconThumbSize: 24,
  checkedThumbSize: 24,
  pressedThumbSize: 28,
  thumbIconSize: 16,
  minTouchTarget: 44,
} as const;

export interface SwitchGeometryInput {
  readonly checked?: boolean;
  readonly isPressed?: boolean;
  readonly hasUncheckedIcon?: boolean;
}

export interface SwitchGeometryOutput {
  readonly thumbSize: number;
  readonly thumbOffsetPx: number;
}

export function resolveSwitchGeometry(
  input: SwitchGeometryInput = {},
): SwitchGeometryOutput {
  const {
    checked = false,
    isPressed = false,
    hasUncheckedIcon = false,
  } = input;

  const {
    trackWidth,
    trackHeight,
    uncheckedThumbSize,
    uncheckedIconThumbSize,
    checkedThumbSize,
    pressedThumbSize,
  } = SWITCH_TOKENS;

  if (isPressed) {
    const pad = (trackHeight - pressedThumbSize) / 2;
    return {
      thumbSize: pressedThumbSize,
      thumbOffsetPx: checked ? trackWidth - pressedThumbSize - pad : pad,
    };
  }

  if (checked) {
    const pad = (trackHeight - checkedThumbSize) / 2;
    return {
      thumbSize: checkedThumbSize,
      thumbOffsetPx: trackWidth - checkedThumbSize - pad,
    };
  }

  const size = hasUncheckedIcon ? uncheckedIconThumbSize : uncheckedThumbSize;
  const pad = (trackHeight - size) / 2;
  return {
    thumbSize: size,
    thumbOffsetPx: pad,
  };
}

export type SliderSize = "sm" | "md" | "lg";

export interface SliderSizeSpec {
  readonly size: SliderSize;
  readonly trackHeight: number;
  readonly outerTrackRadius: number;
  readonly innerTrackRadius: number;
  readonly thumbHeight: number;
}

export const SLIDER_TOKENS = {
  thumbRestWidth: 4,
  thumbActiveWidth: 2,
  thumbRadius: 2,
  thumbTrackGap: 6,
  thumbActiveTrackGap: 5,
  stopDotSize: 4,
  stopDotInset: 6,
  minControlHeight: 44,
} as const;

export const SLIDER_SIZE_SPECS: Record<SliderSize, SliderSizeSpec> = {
  sm: {
    size: "sm",
    trackHeight: 16,
    outerTrackRadius: 8,
    innerTrackRadius: 2,
    thumbHeight: 44,
  },
  md: {
    size: "md",
    trackHeight: 24,
    outerTrackRadius: 12,
    innerTrackRadius: 3,
    thumbHeight: 48,
  },
  lg: {
    size: "lg",
    trackHeight: 40,
    outerTrackRadius: 16,
    innerTrackRadius: 4,
    thumbHeight: 56,
  },
};

export function resolveSliderThumbGeometry(isActive = false): {
  readonly thumbWidth: number;
  readonly trackGap: number;
} {
  return {
    thumbWidth: isActive
      ? SLIDER_TOKENS.thumbActiveWidth
      : SLIDER_TOKENS.thumbRestWidth,
    trackGap: isActive
      ? SLIDER_TOKENS.thumbActiveTrackGap
      : SLIDER_TOKENS.thumbTrackGap,
  };
}

export const CHECKBOX_TOKENS = {
  boxSize: 18,
  cornerRadius: 4,
  pressedCornerRadius: 6,
  strokeWidth: 2,
  stateLayerSize: 40,
  minTouchTarget: 44,
} as const;

export const RADIO_TOKENS = {
  ringSize: 20,
  dotSize: 10,
  strokeWidth: 2,
  stateLayerSize: 40,
  minTouchTarget: 44,
} as const;

export const TABS_TOKENS = {
  primaryHeight: 48,
  primaryWithIconHeight: 64,
  secondaryHeight: 48,
  primaryIndicatorHeight: 3,
  secondaryIndicatorHeight: 2,
  primaryIndicatorMinWidth: 24,
  horizontalPadding: 20,
} as const;

export const DIALOG_TOKENS = {
  containerRadius: SHAPE_CORNER_TOKENS.extraLarge,
  padding: 24,
  minWidth: 280,
  maxWidth: 520,
  iconSize: 24,
  actionGap: 8,
} as const;

export const SELECT_TOKENS = {
  filledHeight: 52,
  outlinedHeight: 48,
  outlinedRadius: SHAPE_CORNER_TOKENS.medium,
  filledTopRadius: SHAPE_CORNER_TOKENS.medium,
  filledBottomRadius: SHAPE_CORNER_TOKENS.none,
  paddingInline: 16,
  popupRadius: SHAPE_CORNER_TOKENS.large,
  popupPadding: 6,
  itemRadius: 10,
  itemSelectedRadius: SHAPE_CORNER_TOKENS.medium,
  itemPressedRadius: 6,
  itemGap: 2,
} as const;

export const TOOLTIP_TOKENS = {
  plainRadius: SHAPE_CORNER_TOKENS.small,
  richRadius: SHAPE_CORNER_TOKENS.large,
  plainPaddingBlock: 6,
  plainPaddingInline: 10,
  richPaddingBlock: 12,
  richPaddingInline: 16,
  richMaxWidth: 312,
} as const;

export const SNACKBAR_TOKENS = {
  containerRadius: SHAPE_CORNER_TOKENS.medium,
  minHeight: 48,
  maxWidth: 420,
  paddingBlock: 12,
  paddingInline: 16,
  viewportGap: 10,
} as const;

export const TEXT_FIELD_TOKENS = {
  outlinedHeight: 48,
  filledHeight: 52,
  outlinedRadius: SHAPE_CORNER_TOKENS.medium,
  filledTopRadius: SHAPE_CORNER_TOKENS.medium,
  filledBottomRadius: SHAPE_CORNER_TOKENS.none,
  paddingInline: 14,
  minFontSize: 16,
} as const;

export const NUMBER_FIELD_TOKENS = {
  height: 44,
  outerRadius: 22,
  innerRestRadius: 4,
  innerPressedRadius: 10,
  seamGap: 2,
  stepperWidth: 42,
} as const;

export const ACCORDION_TOKENS = {
  collapsedGap: 2,
  expandedMarginBlock: 6,
  outerRadius: SHAPE_CORNER_TOKENS.large,
  innerRadius: SHAPE_CORNER_TOKENS.extraSmall,
  headerMinHeight: 56,
  paddingInline: 18,
} as const;

export function resolveAccordionItemCorners(input: {
  readonly index: number;
  readonly count: number;
  readonly isOpen: boolean;
  readonly prevOpen?: boolean;
  readonly nextOpen?: boolean;
}): CornerTuple {
  const { index, count, isOpen, prevOpen = false, nextOpen = false } = input;
  const { outerRadius: outer, innerRadius: inner } = ACCORDION_TOKENS;

  if (count <= 1 || isOpen) {
    return [outer, outer, outer, outer];
  }

  const topR = index <= 0 || prevOpen ? outer : inner;
  const bottomR = index >= count - 1 || nextOpen ? outer : inner;
  return [topR, topR, bottomR, bottomR];
}

export const SHEET_TOKENS = {
  cornerRadius: SHAPE_CORNER_TOKENS.extraLarge,
  dragHandleWidth: 32,
  dragHandleHeight: 4,
  bottomMaxWidth: 640,
  sideWidth: 400,
  padding: 24,
} as const;

export const POPOVER_TOKENS = {
  containerRadius: SHAPE_CORNER_TOKENS.largeIncreased,
  padding: 16,
  maxWidth: 340,
} as const;

export const CHIP_TOKENS = {
  height: 32,
  restRadius: SHAPE_CORNER_TOKENS.small,
  selectedRadius: 16,
  pressedRadius: SHAPE_CORNER_TOKENS.extraSmall,
  paddingInline: 12,
  iconSize: 18,
} as const;

export const AVATAR_SIZE_SPECS = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
} as const;

export type AvatarSize = keyof typeof AVATAR_SIZE_SPECS;

export const BADGE_TOKENS = {
  dotSize: 8,
  pillHeight: 18,
  pillMinWidth: 18,
  pillPaddingInline: 5,
} as const;

export const CARD_TOKENS = {
  restRadius: SHAPE_CORNER_TOKENS.large,
  hoverRadius: SHAPE_CORNER_TOKENS.largeIncreased,
  pressedRadius: SHAPE_CORNER_TOKENS.medium,
  padding: 20,
} as const;

export const NAVIGATION_TOKENS = {
  barHeight: 72,
  railWidth: 84,
  indicatorWidth: 56,
  indicatorHeight: 32,
  indicatorRadius: 16,
} as const;

export type FabSize = "sm" | "md" | "lg" | "xl";
export type FabColorVariant = "primary" | "secondary" | "tertiary" | "surface";

export interface FabSizeSpec {
  readonly size: FabSize;
  readonly containerSize: number;
  readonly restRadius: number;
  readonly pressedRadius: number;
  readonly iconSize: number;
}

export const FAB_SIZE_SPECS: Record<FabSize, FabSizeSpec> = {
  sm: {
    size: "sm",
    containerSize: 40,
    restRadius: 12,
    pressedRadius: 8,
    iconSize: 24,
  },
  md: {
    size: "md",
    containerSize: 56,
    restRadius: 16,
    pressedRadius: 12,
    iconSize: 24,
  },
  lg: {
    size: "lg",
    containerSize: 80,
    restRadius: 20,
    pressedRadius: 14,
    iconSize: 28,
  },
  xl: {
    size: "xl",
    containerSize: 96,
    restRadius: 28,
    pressedRadius: 18,
    iconSize: 36,
  },
};

export function resolveFabGeometry(input: {
  readonly size?: FabSize;
  readonly isPressed?: boolean;
} = {}): {
  readonly containerSize: number;
  readonly cornerRadius: number;
  readonly iconSize: number;
} {
  const { size = "md", isPressed = false } = input;
  const spec = FAB_SIZE_SPECS[size];
  return {
    containerSize: spec.containerSize,
    cornerRadius: isPressed ? spec.pressedRadius : spec.restRadius,
    iconSize: spec.iconSize,
  };
}

export type ExtendedFabSize = "sm" | "md" | "lg";

export interface ExtendedFabSpec {
  readonly size: ExtendedFabSize;
  readonly height: number;
  readonly restRadius: number;
  readonly pressedRadius: number;
  readonly iconSize: number;
  readonly paddingInline: number;
  readonly iconGap: number;
  readonly fontSize: number;
}

export const EXTENDED_FAB_SPECS: Record<ExtendedFabSize, ExtendedFabSpec> = {
  sm: {
    size: "sm",
    height: 56,
    restRadius: 16,
    pressedRadius: 12,
    iconSize: 24,
    paddingInline: 16,
    iconGap: 12,
    fontSize: 15,
  },
  md: {
    size: "md",
    height: 80,
    restRadius: 20,
    pressedRadius: 14,
    iconSize: 28,
    paddingInline: 26,
    iconGap: 14,
    fontSize: 18,
  },
  lg: {
    size: "lg",
    height: 96,
    restRadius: 28,
    pressedRadius: 18,
    iconSize: 36,
    paddingInline: 28,
    iconGap: 16,
    fontSize: 22,
  },
};

export const CAROUSEL_TOKENS = {
  gap: 8,
  focalRadius: SHAPE_CORNER_TOKENS.extraLarge,
  mediumRadius: SHAPE_CORNER_TOKENS.largeIncreased,
  peekRadius: SHAPE_CORNER_TOKENS.large,
  minPeekWidth: 48,
} as const;

export interface CarouselItemMetric {
  readonly index: number;
  readonly width: number;
  readonly cornerRadius: number;
  readonly prominence: number;
}

export function resolveCarouselLayout(input: {
  readonly count: number;
  readonly containerWidth: number;
  readonly focalPosition: number;
  readonly variant?: "multi-browse" | "hero";
  readonly gap?: number;
}): readonly CarouselItemMetric[] {
  const {
    count,
    containerWidth,
    focalPosition,
    variant = "multi-browse",
    gap = CAROUSEL_TOKENS.gap,
  } = input;

  if (count <= 0) return [];
  const totalGaps = Math.max(0, count - 1) * gap;
  const available = Math.max(count * 36, containerWidth - totalGaps);

  if (count === 1) {
    return [
      {
        index: 0,
        width: available,
        cornerRadius: CAROUSEL_TOKENS.focalRadius,
        prominence: 1,
      },
    ];
  }

  const falloff = variant === "hero" ? 1.85 : 1.05;
  const baseWeight = variant === "hero" ? 0.14 : 0.2;

  const rawWeights: number[] = [];
  const prominences: number[] = [];
  let weightSum = 0;

  for (let i = 0; i < count; i++) {
    const dist = Math.abs(i - focalPosition);
    const prom = Math.exp(-dist * dist * falloff);
    prominences.push(prom);
    const w = baseWeight + prom * (1 - baseWeight);
    rawWeights.push(w);
    weightSum += w;
  }

  return rawWeights.map((w, idx) => {
    const width = (w / weightSum) * available;
    const prom = prominences[idx] ?? 0;
    const cornerRadius =
      CAROUSEL_TOKENS.peekRadius +
      prom * (CAROUSEL_TOKENS.focalRadius - CAROUSEL_TOKENS.peekRadius);
    return {
      index: idx,
      width,
      cornerRadius,
      prominence: prom,
    };
  });
}

export const SEARCH_BAR_TOKENS = {
  height: 56,
  radius: 28,
  popupRadius: 28,
  popupPadding: 8,
  itemRadius: 20,
  itemPressedRadius: 10,
  horizontalPadding: 16,
  iconSize: 22,
} as const;

export type TopAppBarVariant =
  | "small"
  | "center-aligned"
  | "medium-flexible"
  | "large-flexible";

export interface TopAppBarGeometryOutput {
  readonly height: number;
  readonly titleFontSize: number;
  readonly subtitleOpacity: number;
  readonly isElevated: boolean;
  readonly isTwoRow: boolean;
}

export const TOP_APP_BAR_SPECS = {
  collapsedHeight: 64,
  mediumExpandedHeight: 112,
  largeExpandedHeight: 148,
  collapsedTitleSize: 20,
  mediumExpandedTitleSize: 24,
  largeExpandedTitleSize: 28,
  horizontalPadding: 16,
} as const;

export function resolveTopAppBarGeometry(input: {
  readonly variant?: TopAppBarVariant;
  readonly collapsedFraction?: number;
  readonly scrolled?: boolean;
} = {}): TopAppBarGeometryOutput {
  const {
    variant = "small",
    collapsedFraction = 0,
    scrolled = collapsedFraction > 0.04,
  } = input;

  const t = Math.max(0, Math.min(1, collapsedFraction));

  if (variant === "small" || variant === "center-aligned") {
    return {
      height: TOP_APP_BAR_SPECS.collapsedHeight,
      titleFontSize: TOP_APP_BAR_SPECS.collapsedTitleSize,
      subtitleOpacity: 1,
      isElevated: scrolled,
      isTwoRow: false,
    };
  }

  const expandedH =
    variant === "large-flexible"
      ? TOP_APP_BAR_SPECS.largeExpandedHeight
      : TOP_APP_BAR_SPECS.mediumExpandedHeight;
  const expandedFont =
    variant === "large-flexible"
      ? TOP_APP_BAR_SPECS.largeExpandedTitleSize
      : TOP_APP_BAR_SPECS.mediumExpandedTitleSize;

  return {
    height: expandedH + (TOP_APP_BAR_SPECS.collapsedHeight - expandedH) * t,
    titleFontSize:
      expandedFont + (TOP_APP_BAR_SPECS.collapsedTitleSize - expandedFont) * t,
    subtitleOpacity: Math.max(0, 1 - t * 1.4),
    isElevated: scrolled || t > 0.08,
    isTwoRow: t < 0.72,
  };
}

export const PROGRESS_TOKENS = {
  linearHeight: 4,
  linearThickHeight: 8,
  trackGap: 4,
  stopDotSize: 4,
  circularSizes: {
    sm: { size: 36, strokeWidth: 4 },
    md: { size: 48, strokeWidth: 4.5 },
    lg: { size: 64, strokeWidth: 6 },
  },
} as const;

export const METER_TOKENS = {
  height: 8,
  trackGap: 4,
  warningThreshold: 0.7,
  criticalThreshold: 0.9,
} as const;

export function resolveCircularProgressArcs(input: {
  readonly progress: number;
  readonly size: number;
  readonly strokeWidth: number;
  readonly trackGap?: number;
}): {
  readonly radius: number;
  readonly circumference: number;
  readonly activeDashLength: number;
  readonly trackDashLength: number;
  readonly trackRotationDeg: number;
} {
  const {
    progress,
    size,
    strokeWidth,
    trackGap = PROGRESS_TOKENS.trackGap,
  } = input;

  const clamped = Math.max(0, Math.min(1, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  if (clamped <= 0.005) {
    return {
      radius,
      circumference,
      activeDashLength: 0,
      trackDashLength: circumference,
      trackRotationDeg: -90,
    };
  }
  if (clamped >= 0.995) {
    return {
      radius,
      circumference,
      activeDashLength: circumference,
      trackDashLength: 0,
      trackRotationDeg: -90,
    };
  }

  const seamClearance = trackGap + strokeWidth;
  const activeDashLength = Math.max(
    1,
    clamped * circumference - seamClearance,
  );
  const trackDashLength = Math.max(
    0,
    (1 - clamped) * circumference - seamClearance,
  );
  const activeEndFraction = (activeDashLength + seamClearance) / circumference;
  const trackRotationDeg = -90 + activeEndFraction * 360;

  return {
    radius,
    circumference,
    activeDashLength,
    trackDashLength,
    trackRotationDeg,
  };
}

export const OTP_FIELD_TOKENS = {
  slotWidth: 46,
  slotHeight: 54,
  slotGap: 4,
  outerRadius: SHAPE_CORNER_TOKENS.large,
  innerRadius: 6,
  activeRadius: SHAPE_CORNER_TOKENS.large,
  pressedRadius: 10,
  minFontSize: 18,
} as const;

export function resolveOtpSlotCorners(input: {
  readonly index: number;
  readonly count: number;
  readonly isFirstInGroup?: boolean;
  readonly isLastInGroup?: boolean;
  readonly isFocused?: boolean;
  readonly isPressed?: boolean;
}): CornerTuple {
  const {
    index,
    count,
    isFirstInGroup = index <= 0,
    isLastInGroup = index >= count - 1,
    isFocused = false,
    isPressed = false,
  } = input;

  const {
    outerRadius: outer,
    innerRadius: inner,
    activeRadius: active,
    pressedRadius: pressed,
  } = OTP_FIELD_TOKENS;

  if (isPressed) {
    return [pressed, pressed, pressed, pressed];
  }
  if (count <= 1 || (isFirstInGroup && isLastInGroup) || isFocused) {
    return [active, active, active, active];
  }
  if (isFirstInGroup) {
    return [outer, inner, inner, outer];
  }
  if (isLastInGroup) {
    return [inner, outer, outer, inner];
  }
  return [inner, inner, inner, inner];
}

export const DATE_PICKER_TOKENS = {
  containerRadius: SHAPE_CORNER_TOKENS.extraLarge,
  dayCellSize: 40,
  daySelectedRadius: 20,
  dayPressedRadius: 10,
  dayHoverRadius: 20,
  padding: 20,
} as const;

export const PREVIEW_CARD_TOKENS = {
  containerRadius: 24,
  padding: 16,
  maxWidth: 320,
} as const;

export const DIVIDER_TOKENS = {
  thickness: 1,
  insetStart: 16,
} as const;

export const SCROLL_AREA_TOKENS = {
  scrollbarSize: 8,
  thumbRadius: 9999,
} as const;

export function flipCornersHorizontal(corners: CornerTuple): CornerTuple {
  return [corners[1], corners[0], corners[3], corners[2]];
}

export const TIME_PICKER_TOKENS = {
  containerRadius: SHAPE_CORNER_TOKENS.extraLarge,
  padding: 22,
  dialSize: 248,
  outerRingRadius: 92,
  innerRingRadius: 58,
  centerPinSize: 8,
  selectorHandleSize: 42,
  selectorTrackWidth: 2,
  fieldWidth: 88,
  fieldHeight: 68,
  fieldRadius: SHAPE_CORNER_TOKENS.medium,
  fieldPressedRadius: SHAPE_CORNER_TOKENS.small,
  periodWidth: 52,
  periodHeight: 68,
  periodOuterRadius: SHAPE_CORNER_TOKENS.medium,
  periodInnerRadius: SHAPE_CORNER_TOKENS.extraSmall,
} as const;

export interface ClockHandGeometry {
  readonly angleDeg: number;
  readonly radius: number;
  readonly isInnerRing: boolean;
  readonly offsetX: number;
  readonly offsetY: number;
}

export function resolveClockHandGeometry(input: {
  readonly mode: "hour" | "minute";
  readonly value: number;
  readonly use24Hour?: boolean;
}): ClockHandGeometry {
  const { mode, value, use24Hour = false } = input;

  if (mode === "minute") {
    const normalizedMin = ((Math.round(value) % 60) + 60) % 60;
    const angleDeg = normalizedMin * 6;
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const radius = TIME_PICKER_TOKENS.outerRingRadius;
    return {
      angleDeg,
      radius,
      isInnerRing: false,
      offsetX: Number((Math.cos(rad) * radius).toFixed(2)),
      offsetY: Number((Math.sin(rad) * radius).toFixed(2)),
    };
  }

  const normalizedHour = use24Hour
    ? ((Math.round(value) % 24) + 24) % 24
    : ((Math.round(value) % 12) + 12) % 12;
  const isInnerRing = use24Hour && normalizedHour >= 12;
  const step12 = normalizedHour % 12;
  const angleDeg = step12 * 30;
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  const radius = isInnerRing
    ? TIME_PICKER_TOKENS.innerRingRadius
    : TIME_PICKER_TOKENS.outerRingRadius;

  return {
    angleDeg,
    radius,
    isInnerRing,
    offsetX: Number((Math.cos(rad) * radius).toFixed(2)),
    offsetY: Number((Math.sin(rad) * radius).toFixed(2)),
  };
}

export const WIDE_NAVIGATION_RAIL_TOKENS = {
  collapsedWidth: 84,
  expandedWidth: 228,
  itemHeight: 48,
  itemRadius: 24,
  itemPressedRadius: 12,
  padding: 12,
} as const;

export const NAVIGATION_DRAWER_TOKENS = {
  width: 280,
  cornerRadius: SHAPE_CORNER_TOKENS.extraLarge,
  itemHeight: 48,
  itemRadius: 24,
  itemPressedRadius: 12,
  padding: 12,
} as const;

export const NAVIGATION_SUITE_TOKENS = {
  compactMaxWidth: 640,
  mediumMaxWidth: 1024,
} as const;

export const MENUBAR_TOKENS = {
  height: 40,
  containerRadius: 20,
  padding: 4,
  triggerHeight: 32,
  triggerRadius: 16,
  triggerPressedRadius: 8,
  triggerPaddingInline: 14,
} as const;

export const DATA_TABLE_TOKENS = {
  containerRadius: SHAPE_CORNER_TOKENS.large,
  headerHeight: 48,
  rowHeight: 52,
  compactRowHeight: 40,
  cellPaddingInline: 16,
} as const;

export const SKELETON_TOKENS = {
  textRadius: 6,
  roundedRadius: SHAPE_CORNER_TOKENS.medium,
  rectangularRadius: SHAPE_CORNER_TOKENS.extraSmall,
} as const;
