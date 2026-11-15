"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Menu } from "@base-ui/react/menu";
import {
  type ButtonSize,
  type CornerTuple,
  SEGMENTED_MENU_TOKENS,
  flipCornersHorizontal,
  parseShortcutKeys,
  resolveSegmentedMenuItemCorners,
  resolveSplitButtonGeometry,
} from "../tokens/index.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import { useM3E } from "../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import type { ButtonVariant } from "./Button.js";
import { Kbd } from "./KbdAndSnippet.js";

export type SplitButtonVariant = Exclude<ButtonVariant, "text">;

const SPLIT_BUTTON_TYPESCALE_MAP: Record<ButtonSize, string> = {
  xs: "label-large",
  sm: "label-large",
  md: "title-medium",
  lg: "headline-small",
  xl: "headline-large",
};

export interface SplitButtonMenuItemSpec {
  readonly id: string;
  readonly label: string;
  readonly icon?: React.ReactNode;
  readonly shortcut?: string;
  readonly disabled?: boolean;
  readonly selected?: boolean;
  readonly onSelect?: () => void;
}

export interface M3ESplitButtonProps {
  readonly children: React.ReactNode;
  readonly menuItems: readonly SplitButtonMenuItemSpec[];
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

function ChevronDownSvg({ size }: { readonly size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function formatTupleBadge(c: CornerTuple): string {
  return `${Math.round(c[0])}/${Math.round(c[1])}/${Math.round(c[2])}/${Math.round(c[3])}`;
}

interface SegmentedMenuItemSurfaceProps {
  readonly itemProps: React.HTMLAttributes<HTMLDivElement> & {
    readonly ref?: React.Ref<HTMLDivElement>;
  };
  readonly item: SplitButtonMenuItemSpec;
  readonly index: number;
  readonly count: number;
  readonly highlighted: boolean;
}

function SegmentedMenuItemSurface({
  itemProps,
  item,
  index,
  count,
  highlighted,
}: SegmentedMenuItemSurfaceProps) {
  const { ref: incomingRef, style: incomingStyle, ...restItemProps } = itemProps;
  const corners = resolveSegmentedMenuItemCorners({
    index,
    count,
    isHighlighted: highlighted,
    isSelected: item.selected,
  });
  const { ref: itemRef, borderRadiusCss } =
    useM3ECornerSpringRef<HTMLDivElement>(corners, "fastSpatial", incomingRef);

  return (
    <div
      {...restItemProps}
      ref={itemRef}
      data-selected={item.selected ? "" : undefined}
      style={{
        ...incomingStyle,
        minHeight: `${SEGMENTED_MENU_TOKENS.itemHeight}px`,
        paddingInline: `${SEGMENTED_MENU_TOKENS.itemPaddingInline}px`,
        borderRadius: borderRadiusCss,
      }}
    >
      {item.icon ? (
        <span className="m3e-segmented-menu__icon" aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      <span
        className="m3e-segmented-menu__label"
        data-text={typeof item.label === "string" ? item.label : undefined}
      >
        {item.label}
      </span>
      {item.shortcut ? (
        <Kbd
          size="sm"
          className="m3e-segmented-menu__shortcut"
          keys={parseShortcutKeys(item.shortcut)}
        >
          {item.shortcut}
        </Kbd>
      ) : null}
    </div>
  );
}

interface SegmentedMenuItemRowProps {
  readonly item: SplitButtonMenuItemSpec;
  readonly index: number;
  readonly count: number;
}

function SegmentedMenuItemRow({
  item,
  index,
  count,
}: SegmentedMenuItemRowProps) {
  if (item.selected !== undefined) {
    return (
      <Menu.CheckboxItem
        checked={item.selected}
        disabled={item.disabled}
        closeOnClick
        onClick={() => item.onSelect?.()}
        className="m3e-segmented-menu__item"
        render={(props, state) => (
          <SegmentedMenuItemSurface
            itemProps={props as SegmentedMenuItemSurfaceProps["itemProps"]}
            item={item}
            index={index}
            count={count}
            highlighted={state.highlighted}
          />
        )}
      />
    );
  }

  return (
    <Menu.Item
      disabled={item.disabled}
      onClick={() => item.onSelect?.()}
      className="m3e-segmented-menu__item"
      render={(props, state) => (
        <SegmentedMenuItemSurface
          itemProps={props as SegmentedMenuItemSurfaceProps["itemProps"]}
          item={item}
          index={index}
          count={count}
          highlighted={state.highlighted}
        />
      )}
    />
  );
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
  const { debugGeometry, direction, t } = useM3E();
  const portalContainer = useM3EPortalContainer();
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
    useM3ECornerSpringRef<HTMLElement>(targetLeadCorners, "defaultEffects");
  const { ref: trailRef, borderRadiusCss: trailRadiusCss } =
    useM3ECornerSpringRef<HTMLButtonElement>(
      targetTrailCorners,
      "defaultEffects",
    );

  const chevronDeg = useM3EScalarSpring(geo.chevronRotationDeg, "fastSpatial");
  const opticalX = useM3EScalarSpring(targetOpticalX, "defaultEffects");

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
        {...leadingPressHandlers}
        onPointerEnter={(e) => {
          if (!disabled && e.pointerType !== "touch") setIsLeadingHovered(true);
        }}
        onPointerLeave={() => {
          setIsLeadingHovered(false);
          leadingPressHandlers.onPointerLeave();
        }}
      >
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

      <Menu.Root
        modal={false}
        open={controlledOpen}
        defaultOpen={defaultOpen}
        disabled={disabled}
        onOpenChange={(next) => {
          if (controlledOpen === undefined) {
            setUncontrolledOpen(next);
          }
          onOpenChange?.(next);
        }}
      >
        <Menu.Trigger
          ref={trailRef}
          disabled={disabled}
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
          {...trailingPressHandlers}
          onPointerEnter={(e) => {
            if (!disabled && e.pointerType !== "touch") setIsTrailingHovered(true);
          }}
          onPointerLeave={() => {
            setIsTrailingHovered(false);
            trailingPressHandlers.onPointerLeave();
          }}
        >
          <span
            className="m3e-split-button__chevron"
            style={{
              width: spec.trailingIconSize,
              height: spec.trailingIconSize,
              translate: `${opticalX.toFixed(2)}px 0px`,
              rotate: `${chevronDeg.toFixed(1)}deg`,
            }}
            aria-hidden="true"
          >
            <ChevronDownSvg size={spec.trailingIconSize} />
          </span>
          {debugGeometry ? (
            <span className="m3e-debug-badge" aria-hidden="true">
              {formatTupleBadge(targetTrailCorners)}
            </span>
          ) : null}
        </Menu.Trigger>

        <Menu.Portal container={portalContainer}>
          <Menu.Positioner side="bottom" align="end" sideOffset={6} className="m3e-segmented-menu__positioner">
            <Menu.Popup
              className="m3e-segmented-menu"
              style={{
                borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
                padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
                gap: `${SEGMENTED_MENU_TOKENS.itemGap}px`,
              }}
            >
              {menuItems.map((item, idx) => (
                <SegmentedMenuItemRow
                  key={item.id}
                  item={item}
                  index={idx}
                  count={menuItems.length}
                />
              ))}
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>
    </div>
  );
}
