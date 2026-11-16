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
  readonly outlineWidth: number;
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
    iconSize: 20,
    iconGap: 4,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: 500,
    outlineWidth: 1,
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
    outlineWidth: 1,
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
    outlineWidth: 1,
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
    outlineWidth: 2,
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
    outlineWidth: 3,
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
  readonly outlineWidth: number;
  readonly innerRestRadius: number;
  readonly innerHoverRadius: number;
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
  minTouchTarget: 48,
} as const;

export const SPLIT_BUTTON_SPECS: Record<ButtonSize, SplitButtonSizeSpec> = {
  xs: {
    size: "xs",
    height: 32,
    outlineWidth: 1,
    innerRestRadius: 4,
    innerHoverRadius: 8,
    innerActiveRadius: 8,
    leadingPaddingStart: 12,
    leadingPaddingEnd: 10,
    leadingIconSize: 20,
    leadingIconGap: 4,
    trailingPaddingInline: 13,
    trailingIconSize: 22,
    trailingWidth: 48,
    fontSize: 14,
    lineHeight: 20,
  },
  sm: {
    size: "sm",
    height: 40,
    outlineWidth: 1,
    innerRestRadius: 4,
    innerHoverRadius: 12,
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
    outlineWidth: 1,
    innerRestRadius: 4,
    innerHoverRadius: 12,
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
    outlineWidth: 2,
    innerRestRadius: 8,
    innerHoverRadius: 20,
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
    outlineWidth: 3,
    innerRestRadius: 12,
    innerHoverRadius: 20,
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
  readonly isLeadingHovered?: boolean;
  readonly isTrailingHovered?: boolean;
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
    isLeadingHovered = false,
    isTrailingHovered = false,
    isLeadingPressed = false,
    isTrailingPressed = false,
    isExpanded = false,
  } = input;

  const spec = SPLIT_BUTTON_SPECS[size];
  const pill = Math.round(spec.height / 2);

  const leadInner = isLeadingPressed
    ? spec.innerActiveRadius
    : isLeadingHovered
      ? spec.innerHoverRadius
      : spec.innerRestRadius;
  const leadingCorners: CornerTuple = [pill, leadInner, leadInner, pill];

  let trailingCorners: CornerTuple;
  if (isTrailingPressed) {
    trailingCorners = [spec.innerActiveRadius, pill, pill, spec.innerActiveRadius];
  } else if (isExpanded) {
    trailingCorners = [pill, pill, pill, pill];
  } else if (isTrailingHovered) {
    trailingCorners = [spec.innerHoverRadius, pill, pill, spec.innerHoverRadius];
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
  groupGap: 2,
  groupInnerRadius: SHAPE_CORNER_TOKENS.small,
  itemGap: 0,
  itemOuterRadius: SHAPE_CORNER_TOKENS.medium,
  itemInnerRadius: SHAPE_CORNER_TOKENS.extraSmall,
  itemHeight: 44,
  itemPaddingInline: 12,
} as const;

export function resolveSegmentedMenuItemCorners(input: {
  readonly index: number;
  readonly count: number;
  readonly isFirstInGroup?: boolean;
  readonly isLastInGroup?: boolean;
  readonly isSelected?: boolean;
}): CornerTuple {
  const {
    index,
    count,
    isFirstInGroup = index <= 0,
    isLastInGroup = index >= count - 1,
    isSelected = false,
  } = input;
  const { itemOuterRadius: outer, itemInnerRadius: inner } = SEGMENTED_MENU_TOKENS;

  if (count <= 1 || (isFirstInGroup && isLastInGroup) || isSelected) {
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
  companionFabExpandedSize: 56,
  companionFabCollapsedSize: 80,
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
  minTouchTarget: 48,
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
  thumbActiveTrackGap: 6,
  stopDotSize: 4,
  stopDotInset: 6,
  minControlHeight: 48,
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
  cornerRadius: 2,
  pressedCornerRadius: 4,
  strokeWidth: 2,
  stateLayerSize: 40,
  minTouchTarget: 48,
} as const;

export const RADIO_TOKENS = {
  ringSize: 20,
  dotSize: 10,
  strokeWidth: 2,
  stateLayerSize: 40,
  minTouchTarget: 48,
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
  maxWidth: 560,
  iconSize: 24,
  actionGap: 8,
} as const;

export const SELECT_TOKENS = {
  filledHeight: 56,
  outlinedHeight: 56,
  compactFilledHeight: 52,
  compactOutlinedHeight: 48,
  outlinedRadius: SHAPE_CORNER_TOKENS.extraSmall,
  filledTopRadius: SHAPE_CORNER_TOKENS.extraSmall,
  filledBottomRadius: SHAPE_CORNER_TOKENS.none,
  outsideLabelRadius: SHAPE_CORNER_TOKENS.medium,
  paddingInline: 16,
} as const;

export const TOOLTIP_TOKENS = {
  plainRadius: SHAPE_CORNER_TOKENS.extraSmall,
  richRadius: SHAPE_CORNER_TOKENS.medium,
  plainPaddingBlock: 6,
  plainPaddingInline: 10,
  richPaddingBlock: 12,
  richPaddingInline: 16,
  richMaxWidth: 312,
} as const;

export const SNACKBAR_TOKENS = {
  containerRadius: SHAPE_CORNER_TOKENS.extraSmall,
  minHeight: 48,
  maxWidth: 600,
  paddingBlock: 12,
  paddingInline: 16,
  viewportGap: 10,
} as const;

export const TEXT_FIELD_TOKENS = {
  outlinedHeight: 56,
  filledHeight: 56,
  compactOutlinedHeight: 48,
  compactFilledHeight: 52,
  outlinedRadius: SHAPE_CORNER_TOKENS.extraSmall,
  filledTopRadius: SHAPE_CORNER_TOKENS.extraSmall,
  filledBottomRadius: SHAPE_CORNER_TOKENS.none,
  outsideLabelRadius: SHAPE_CORNER_TOKENS.medium,
  paddingInline: 16,
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
  selectedRadius: SHAPE_CORNER_TOKENS.small,
  pressedRadius: SHAPE_CORNER_TOKENS.small,
  paddingInline: 16,
  iconPaddingInline: 8,
  gap: 8,
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
  dotSize: 6,
  pillHeight: 16,
  pillMinWidth: 16,
  pillPaddingInline: 4,
} as const;

export const CARD_TOKENS = {
  restRadius: SHAPE_CORNER_TOKENS.medium,
  hoverRadius: SHAPE_CORNER_TOKENS.largeIncreased,
  pressedRadius: SHAPE_CORNER_TOKENS.medium,
  padding: 20,
} as const;

export const NAVIGATION_TOKENS = {
  barHeight: 64,
  tallBarHeight: 80,
  indicatorWidth: 56,
  indicatorHeight: 32,
  horizontalIndicatorHeight: 40,
  horizontalIndicatorPaddingInline: 16,
  indicatorRadius: 16,
} as const;

export type FabSize = "xs" | "sm" | "md" | "lg";
export type FabColorVariant = "primary" | "secondary" | "tertiary" | "surface";

export interface FabSizeSpec {
  readonly size: FabSize;
  readonly containerSize: number;
  readonly restRadius: number;
  readonly pressedRadius: number;
  readonly iconSize: number;
}

export const FAB_SIZE_SPECS: Record<FabSize, FabSizeSpec> = {
  xs: {
    size: "xs",
    containerSize: 40,
    restRadius: 12,
    pressedRadius: 8,
    iconSize: 24,
  },
  sm: {
    size: "sm",
    containerSize: 56,
    restRadius: 16,
    pressedRadius: 12,
    iconSize: 24,
  },
  md: {
    size: "md",
    containerSize: 80,
    restRadius: 20,
    pressedRadius: 14,
    iconSize: 28,
  },
  lg: {
    size: "lg",
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
  const { size = "sm", isPressed = false } = input;
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
    iconGap: 8,
    fontSize: 16,
  },
  md: {
    size: "md",
    height: 80,
    restRadius: 20,
    pressedRadius: 14,
    iconSize: 28,
    paddingInline: 26,
    iconGap: 12,
    fontSize: 22,
  },
  lg: {
    size: "lg",
    height: 96,
    restRadius: 28,
    pressedRadius: 18,
    iconSize: 32,
    paddingInline: 28,
    iconGap: 20,
    fontSize: 24,
  },
};

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

export function getKeylineListForScrollOffset(
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
  mediumSubtitleExpandedHeight: 136,
  largeExpandedHeight: 120,
  largeSubtitleExpandedHeight: 152,
  collapsedTitleSize: 22,
  mediumExpandedTitleSize: 28,
  largeExpandedTitleSize: 36,
  horizontalPadding: 16,
} as const;

export function resolveTopAppBarGeometry(input: {
  readonly variant?: TopAppBarVariant;
  readonly collapsedFraction?: number;
  readonly scrolled?: boolean;
  readonly hasSubtitle?: boolean;
} = {}): TopAppBarGeometryOutput {
  const {
    variant = "small",
    collapsedFraction = 0,
    scrolled = collapsedFraction > 0.04,
    hasSubtitle = false,
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
      ? hasSubtitle
        ? TOP_APP_BAR_SPECS.largeSubtitleExpandedHeight
        : TOP_APP_BAR_SPECS.largeExpandedHeight
      : hasSubtitle
        ? TOP_APP_BAR_SPECS.mediumSubtitleExpandedHeight
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
    sm: { size: 32, strokeWidth: 3.5 },
    md: { size: 40, strokeWidth: 4 },
    lg: { size: 56, strokeWidth: 5 },
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

export const SCROLL_AREA_TOKENS = {
  scrollbarSize: 8,
  thumbRadius: 9999,
} as const;

export function flipCornersHorizontal(corners: CornerTuple): CornerTuple {
  return [corners[1], corners[0], corners[3], corners[2]];
}

export const TIME_PICKER_TOKENS = {
  containerRadius: SHAPE_CORNER_TOKENS.extraLarge,
  padding: 24,
  dialSize: 256,
  outerRingRadius: 101,
  innerRingRadius: 69,
  centerPinSize: 8,
  selectorHandleSize: 48,
  selectorTrackWidth: 2,
  fieldWidth: 96,
  fieldHeight: 80,
  fieldRadius: SHAPE_CORNER_TOKENS.small,
  fieldPressedRadius: SHAPE_CORNER_TOKENS.extraSmall,
  periodWidth: 52,
  periodHeight: 80,
  periodRadius: SHAPE_CORNER_TOKENS.small,
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

export const NAVIGATION_RAIL_TOKENS = {
  collapsedWidth: 96,
  expandedMinWidth: 220,
  expandedMaxWidth: 360,
  itemHeight: 56,
  itemRadius: 28,
  itemPressedRadius: 12,
  padding: 20,
  modalCornerRadius: SHAPE_CORNER_TOKENS.large,
  compactWidth: 280,
  compactItemHeight: 40,
  compactItemRadius: 20,
  compactItemPressedRadius: 8,
  compactPadding: 12,
  autoModalBreakpoint: 840,
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

export const SEARCH_VIEW_TOKENS = {
  headerHeight: 56,
  itemRadius: 14,
} as const;

export const FILE_UPLOAD_TOKENS = {
  dropzoneRadius: 24,
  dropzoneActiveRadius: SHAPE_CORNER_TOKENS.large,
  dropzonePadding: 28,
  itemRadius: 14,
  itemPadding: 12,
} as const;

export const KBD_SNIPPET_TOKENS = {
  kbdRadius: 6,
  kbdHeight: 22,
  snippetRadius: 14,
  snippetMinHeight: 44,
  copyButtonSize: 32,
} as const;

const SHORTCUT_MODIFIER_SYMBOLS = new Set(["⌘", "⇧", "⌥", "⌃"]);

export function parseShortcutKeys(shortcut: string): readonly string[] {
  const trimmed = shortcut.trim();
  if (!trimmed) return [];

  const tokens = trimmed
    .split(/\s+|(?<=.)\+(?=.)/g)
    .map((part) => part.trim())
    .filter(Boolean);

  const expanded: string[] = [];
  for (const token of tokens) {
    let idx = 0;
    const chars = Array.from(token);
    while (
      idx < chars.length - 1 &&
      SHORTCUT_MODIFIER_SYMBOLS.has(chars[idx]!)
    ) {
      expanded.push(chars[idx]!);
      idx += 1;
    }
    const rest = chars.slice(idx).join("");
    if (rest) {
      expanded.push(rest);
    }
  }
  return expanded;
}

export const COLOR_PICKER_TOKENS = {
  panelWidth: 288,
  containerRadius: 24,
  swatchSize: 28,
  swatchRadius: 14,
  swatchSelectedRadius: 8,
  areaHeight: 144,
} as const;

export const DRAG_HANDLE_TOKENS = {
  width: 4,
  height: 48,
  pressedWidth: 12,
  pressedHeight: 52,
  containerSize: 24,
  hitTargetSize: 48,
  restRadius: 9999,
  pressedRadius: SHAPE_CORNER_TOKENS.medium,
} as const;

export function resolveDragHandleGeometry(input: {
  readonly isActive?: boolean;
  readonly orientation?: "vertical" | "horizontal";
} = {}): {
  readonly inlineSize: number;
  readonly blockSize: number;
  readonly cornerRadius: number;
} {
  const { isActive = false, orientation = "vertical" } = input;
  const thickness = isActive
    ? DRAG_HANDLE_TOKENS.pressedWidth
    : DRAG_HANDLE_TOKENS.width;
  const length = isActive
    ? DRAG_HANDLE_TOKENS.pressedHeight
    : DRAG_HANDLE_TOKENS.height;
  const cornerRadius = isActive
    ? DRAG_HANDLE_TOKENS.pressedRadius
    : DRAG_HANDLE_TOKENS.restRadius;

  return orientation === "horizontal"
    ? { inlineSize: length, blockSize: thickness, cornerRadius }
    : { inlineSize: thickness, blockSize: length, cornerRadius };
}
