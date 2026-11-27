"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  type ButtonSize,
  type CornerTuple,
  flipCornersHorizontal,
  resolveSplitButtonGeometry,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpringEffect,
  usePressHoldState,
} from "../../hooks/useM3ESpring.js";
import type { ButtonVariant } from "../Button/Button.js";
import { DropdownMenu, type M3EMenuItemSpec } from "../Menu/Menu.js";
import { ChevronDownIcon } from "../../internal/icons.js";
import { useM3ERipple } from "../../internal/ripple.js";

export type SplitButtonVariant = Exclude<ButtonVariant, "text">;

const SPLIT_BUTTON_TYPESCALE_MAP: Record<ButtonSize, string> = {
  xs: "label-large",
  sm: "label-large",
  md: "title-medium",
  lg: "headline-small",
  xl: "headline-large",
};

export interface M3ESplitButtonProps {
  readonly children: React.ReactNode;
  readonly menuItems: readonly M3EMenuItemSpec[];
  readonly variant?: SplitButtonVariant;
  readonly size?: ButtonSize;
  readonly disabled?: boolean;
  readonly leadingIcon?: React.ReactNode;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly menuTriggerLabel?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function formatTupleBadge(c: CornerTuple): string {
  return `${Math.round(c[0])}/${Math.round(c[1])}/${Math.round(c[2])}/${Math.round(c[3])}`;
}

export function SplitButton({
  children,
  menuItems = [],
  variant = "filled",
  size = "sm",
  disabled = false,
  leadingIcon,
  onClick,
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  menuTriggerLabel,
  className,
  style,
}: M3ESplitButtonProps): React.JSX.Element {
  const { debugGeometry, direction, t } = useM3ERuntime();
  const resolvedMenuTriggerLabel =
    menuTriggerLabel ?? t("splitButton.moreOptions");
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState<boolean>(defaultOpen);
  const isExpanded = controlledOpen ?? uncontrolledOpen;

  const [isLeadingHovered, setIsLeadingHovered] = React.useState(false);
  const [isTrailingHovered, setIsTrailingHovered] = React.useState(false);

  const { isPressed: isLeadingPressed, pressHandlers: leadingPressHandlers } =
    usePressHoldState(disabled);
  const { isPressed: isTrailingPressed, pressHandlers: trailingPressHandlers } =
    usePressHoldState(disabled);
  const { rippleRef: leadRippleRef, rippleHandlers: leadRippleHandlers } =
    useM3ERipple(disabled);
  const { rippleRef: trailRippleRef, rippleHandlers: trailRippleHandlers } =
    useM3ERipple(disabled);

  const leadProps = mergeProps<"button">(
    leadingPressHandlers as unknown as React.ComponentPropsWithRef<"button">,
    leadRippleHandlers as unknown as React.ComponentPropsWithRef<"button">,
    {
      onPointerEnter: (e) => {
        if (!disabled && e.pointerType !== "touch") setIsLeadingHovered(true);
      },
      onPointerLeave: () => {
        setIsLeadingHovered(false);
      },
    },
  );

  const trailProps = mergeProps<"button">(
    trailingPressHandlers as unknown as React.ComponentPropsWithRef<"button">,
    trailRippleHandlers as unknown as React.ComponentPropsWithRef<"button">,
    {
      onPointerEnter: (e) => {
        if (!disabled && e.pointerType !== "touch") setIsTrailingHovered(true);
      },
      onPointerLeave: () => {
        setIsTrailingHovered(false);
      },
    },
  );

  const geo = resolveSplitButtonGeometry({
    size,
    isLeadingPressed,
    isTrailingPressed,
    isLeadingHovered,
    isTrailingHovered,
    isExpanded,
  });

  const targetLeadCorners =
    direction === "rtl"
      ? flipCornersHorizontal(geo.leadingCorners)
      : geo.leadingCorners;
  const targetTrailCorners =
    direction === "rtl"
      ? flipCornersHorizontal(geo.trailingCorners)
      : geo.trailingCorners;
  const targetOpticalX =
    direction === "rtl"
      ? -geo.trailingOpticalOffsetPx
      : geo.trailingOpticalOffsetPx;

  const { ref: leadRef, borderRadiusCss: leadRadiusCss } =
    useM3ECornerSpringRef<HTMLElement>(targetLeadCorners, "fastSpatial");
  const { ref: trailRef, borderRadiusCss: trailRadiusCss } =
    useM3ECornerSpringRef<HTMLButtonElement>(
      targetTrailCorners,
      "fastSpatial",
    );

  const chevronRef = React.useRef<HTMLSpanElement | null>(null);
  const [initChevronDeg] = React.useState(geo.chevronRotationDeg);
  const [initOpticalX] = React.useState(targetOpticalX);
  useM3EScalarSpringEffect(geo.chevronRotationDeg, "fastSpatial", (deg) => {
    if (chevronRef.current) {
      chevronRef.current.style.rotate = `${deg.toFixed(1)}deg`;
    }
  });
  useM3EScalarSpringEffect(targetOpticalX, "defaultEffects", (x) => {
    if (chevronRef.current) {
      chevronRef.current.style.translate = `${x.toFixed(2)}px 0px`;
    }
  });

  const { spec } = geo;
  const scaleKey = SPLIT_BUTTON_TYPESCALE_MAP[size];
  const borderWidth =
    variant === "outlined" ? `${spec.outlineWidth}px` : undefined;

  return (
    <div
      className={
        className ? `m3e-split-button ${className}` : "m3e-split-button"
      }
      style={{ gap: `${geo.gap}px`, ...style }}
      data-size={size}
      data-variant={variant}
      data-expanded={isExpanded ? "" : undefined}
    >
      <BaseButton
        ref={leadRef}
        type="button"
        disabled={disabled}
        onClick={onClick}
        className="m3e-button m3e-split-button__leading"
        data-variant={variant}
        data-size={size}
        data-pressed={isLeadingPressed ? "" : undefined}
        style={{
          height: `${spec.height}px`,
          paddingInlineStart: `${spec.leadingPaddingStart}px`,
          paddingInlineEnd: `${spec.leadingPaddingEnd}px`,
          gap: `${spec.leadingIconGap}px`,
          fontFamily: `var(--m3e-typescale-${scaleKey}-font, inherit)`,
          fontSize: `var(--m3e-typescale-${scaleKey}-size, ${spec.fontSize}px)`,
          lineHeight: `var(--m3e-typescale-${scaleKey}-line-height, ${spec.lineHeight}px)`,
          fontWeight: `var(--m3e-typescale-${scaleKey}-weight, 500)` as React.CSSProperties["fontWeight"],
          letterSpacing: `var(--m3e-typescale-${scaleKey}-tracking, normal)`,
          borderWidth,
          borderRadius: leadRadiusCss,
        }}
        {...leadProps}
      >
        <span ref={leadRippleRef} className="m3e-ripple" aria-hidden="true" />
        {leadingIcon ? (
          <span
            className="m3e-button__icon"
            style={{
              width: spec.leadingIconSize,
              height: spec.leadingIconSize,
            }}
            aria-hidden="true"
          >
            {leadingIcon}
          </span>
        ) : null}
        <span className="m3e-button__label">{children}</span>
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            {formatTupleBadge(targetLeadCorners)}
          </span>
        ) : null}
      </BaseButton>

      <DropdownMenu
        items={menuItems}
        open={controlledOpen}
        defaultOpen={defaultOpen}
        side="bottom"
        align="end"
        onOpenChange={(next) => {
          if (controlledOpen === undefined) {
            setUncontrolledOpen(next);
          }
          onOpenChange?.(next);
        }}
        trigger={
          <button
            type="button"
            ref={trailRef}
            disabled={disabled}
            data-disabled={disabled ? "" : undefined}
            aria-label={resolvedMenuTriggerLabel}
            className="m3e-button m3e-split-button__trailing"
            data-variant={variant}
            data-size={size}
            data-pressed={isTrailingPressed ? "" : undefined}
            data-expanded={isExpanded ? "" : undefined}
            style={{
              width: `${spec.trailingWidth}px`,
              height: `${spec.height}px`,
              paddingInline: `${spec.trailingPaddingInline}px`,
              borderWidth,
              borderRadius: trailRadiusCss,
            }}
            {...trailProps}
          >
            <span ref={trailRippleRef} className="m3e-ripple" aria-hidden="true" />
            <span
              ref={chevronRef}
              className="m3e-split-button__chevron"
              style={{
                width: spec.trailingIconSize,
                height: spec.trailingIconSize,
                translate: `${initOpticalX.toFixed(2)}px 0px`,
                rotate: `${initChevronDeg.toFixed(1)}deg`,
              }}
              aria-hidden="true"
            >
              <ChevronDownIcon size={spec.trailingIconSize} strokeWidth={2.25} />
            </span>
            {debugGeometry ? (
              <span className="m3e-debug-badge" aria-hidden="true">
                {formatTupleBadge(targetTrailCorners)}
              </span>
            ) : null}
          </button>
        }
      />
    </div>
  );
}
