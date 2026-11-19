"use client";

import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import {
  SEGMENTED_MENU_TOKENS,
  parseShortcutKeys,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import { useM3ECornerSpringRef } from "../../hooks/useM3ESpring.js";
import { Kbd } from "../Kbd/Kbd.js";
import { useDropdownItemState } from "../../internal/dropdownItem.js";
import { CheckIcon } from "../../internal/icons.js";
import {
  type M3EPositionMethod,
  useAdaptivePositionMethod,
} from "../../internal/positionMethod.js";

export type M3EMenuTheme = "standard" | "vibrant";
export type M3EMenuVariant = "segmented" | "standard";

export interface M3EMenuItemSpec {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly shortcut?: string;
  readonly danger?: boolean;
  readonly disabled?: boolean;
  readonly separatorBefore?: boolean;
  readonly checked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly closeOnClick?: boolean;
  readonly submenu?: readonly M3EMenuItemSpec[];
  readonly href?: string;
  readonly render?: React.ReactElement;
  readonly onSelect?: (event?: React.MouseEvent<HTMLElement>) => void;
}

export interface M3EDropdownMenuProps {
  readonly trigger: React.ReactElement;
  readonly items: readonly M3EMenuItemSpec[];
  readonly theme?: M3EMenuTheme;
  readonly variant?: M3EMenuVariant;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly side?: "top" | "bottom" | "left" | "right";
  readonly align?: "start" | "center" | "end";
}

export interface M3EContextMenuProps {
  readonly children: React.ReactNode;
  readonly items: readonly M3EMenuItemSpec[];
  readonly theme?: M3EMenuTheme;
  readonly variant?: M3EMenuVariant;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function splitMenuGroups(
  items: readonly M3EMenuItemSpec[],
): readonly (readonly M3EMenuItemSpec[])[] {
  const groups: M3EMenuItemSpec[][] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i]!;
    if (i === 0 || item.separatorBefore) {
      groups.push([item]);
    } else {
      groups[groups.length - 1]!.push(item);
    }
  }
  return groups;
}

function SubmenuChevronSvg({ rtl }: { readonly rtl: boolean }) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={rtl ? { scale: "-1 1" } : undefined}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function MenuGroupSurface({
  index,
  count,
  inactive,
  onHoverStart,
  onHoverEnd,
  style,
  children,
}: {
  readonly index: number;
  readonly count: number;
  readonly inactive: boolean;
  readonly onHoverStart: () => void;
  readonly onHoverEnd: () => void;
  readonly style: React.CSSProperties;
  readonly children: React.ReactNode;
}) {
  const outer = SEGMENTED_MENU_TOKENS.containerRadius;
  const inner = SEGMENTED_MENU_TOKENS.groupInnerRadius;
  const top = inactive ? inner : index === 0 ? outer : inner;
  const bottom = inactive ? inner : index === count - 1 ? outer : inner;
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLDivElement>(
    [top, top, bottom, bottom],
    "fastSpatial",
  );
  return (
    <BaseMenu.Group
      ref={ref}
      onPointerEnter={(e) => {
        if (e.pointerType !== "touch") onHoverStart();
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "touch") onHoverEnd();
      }}
      className="m3e-segmented-menu__group"
      style={{ ...style, borderRadius: borderRadiusCss }}
    >
      {children}
    </BaseMenu.Group>
  );
}

function MenuPopup({
  items,
  theme,
  variant,
  positionMethod = "absolute",
  className,
}: {
  readonly items: readonly M3EMenuItemSpec[];
  readonly theme: M3EMenuTheme;
  readonly variant: M3EMenuVariant;
  readonly positionMethod?: M3EPositionMethod;
  readonly className?: string;
}) {
  const hasAnyLeadingSlot = items.some(
    (it) => Boolean(it.icon) || it.checked !== undefined,
  );
  const groups = splitMenuGroups(items);
  const isDetachedGroups = variant === "segmented" && groups.length > 1;
  const [hoveredGroupIdx, setHoveredGroupIdx] = React.useState<number | null>(null);
  const surfaceStyle: React.CSSProperties = {
    padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
    gap: `${SEGMENTED_MENU_TOKENS.itemGap}px`,
  };

  return (
    <BaseMenu.Popup
      onPointerLeave={isDetachedGroups ? () => setHoveredGroupIdx(null) : undefined}
      className={
        className
          ? `m3e-dropdown-popup m3e-segmented-menu ${className}`
          : "m3e-dropdown-popup m3e-segmented-menu"
      }
      data-theme={theme !== "standard" ? theme : undefined}
      data-variant={variant}
      data-grouped={isDetachedGroups ? "" : undefined}
      style={
        isDetachedGroups
          ? { gap: `${SEGMENTED_MENU_TOKENS.groupGap}px` }
          : {
              ...surfaceStyle,
              borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
            }
      }
    >
      {isDetachedGroups
        ? groups.map((groupItems, groupIdx) => (
            <MenuGroupSurface
              key={groupItems[0]!.id}
              index={groupIdx}
              count={groups.length}
              inactive={hoveredGroupIdx !== null && hoveredGroupIdx !== groupIdx}
              onHoverStart={() => setHoveredGroupIdx(groupIdx)}
              onHoverEnd={() =>
                setHoveredGroupIdx((prev) => (prev === groupIdx ? null : prev))
              }
              style={surfaceStyle}
            >
              {groupItems.map((item, idx) => (
                <MenuItem
                  key={item.id}
                  item={item}
                  index={idx}
                  count={groupItems.length}
                  hasAnyLeadingSlot={hasAnyLeadingSlot}
                  isFirstInGroup={idx === 0}
                  isLastInGroup={idx === groupItems.length - 1}
                  showSeparator={false}
                  theme={theme}
                  variant={variant}
                  positionMethod={positionMethod}
                />
              ))}
            </MenuGroupSurface>
          ))
        : items.map((item, idx) => (
            <MenuItem
              key={item.id}
              item={item}
              index={idx}
              count={items.length}
              hasAnyLeadingSlot={hasAnyLeadingSlot}
              isFirstInGroup={idx === 0 || Boolean(item.separatorBefore)}
              isLastInGroup={
                idx === items.length - 1 || Boolean(items[idx + 1]?.separatorBefore)
              }
              showSeparator={idx > 0 && Boolean(item.separatorBefore)}
              theme={theme}
              variant={variant}
              positionMethod={positionMethod}
            />
          ))}
    </BaseMenu.Popup>
  );
}

function MenuItem({
  item,
  index,
  count,
  hasAnyLeadingSlot,
  isFirstInGroup,
  isLastInGroup,
  showSeparator,
  theme,
  variant,
  positionMethod = "absolute",
}: {
  readonly item: M3EMenuItemSpec;
  readonly index: number;
  readonly count: number;
  readonly hasAnyLeadingSlot: boolean;
  readonly isFirstInGroup: boolean;
  readonly isLastInGroup: boolean;
  readonly showSeparator: boolean;
  readonly theme: M3EMenuTheme;
  readonly variant: M3EMenuVariant;
  readonly positionMethod?: M3EPositionMethod;
}) {
  const { direction } = useM3ERuntime();
  const portalContainer = useM3EPortalContainer();
  const {
    ref: cornerRef,
    rippleRef,
    isPressed,
    interactionHandlers: mergedHandlers,
    itemStyle,
  } = useDropdownItemState<HTMLElement>({
    index,
    count,
    disabled: Boolean(item.disabled),
    isSelected: Boolean(item.checked),
    isFirstInGroup,
    isLastInGroup,
    fixedRadius: variant === "standard" ? 8 : undefined,
  });

  const itemProps = {
    ref: cornerRef as React.Ref<HTMLDivElement>,
    disabled: item.disabled,
    "data-pressed": isPressed ? "" : undefined,
    style: itemStyle,
    ...mergedHandlers,
  };
  const separator = showSeparator ? (
    <BaseMenu.Separator className="m3e-menu__separator" />
  ) : null;
  const label = (
    <span
      className="m3e-dropdown-item__label m3e-segmented-menu__label"
      data-text={typeof item.label === "string" ? item.label : undefined}
    >
      {item.label}
    </span>
  );
  const leading = item.icon ? (
    <span className="m3e-dropdown-item__icon m3e-segmented-menu__icon" aria-hidden="true">
      {item.icon}
    </span>
  ) : hasAnyLeadingSlot ? (
    <span className="m3e-dropdown-item__icon m3e-segmented-menu__icon" aria-hidden="true" />
  ) : null;
  const shortcut = item.shortcut ? (
    <Kbd
      size="sm"
      className="m3e-segmented-menu__shortcut"
      keys={parseShortcutKeys(item.shortcut)}
    >
      {item.shortcut}
    </Kbd>
  ) : null;

  const rippleEl = (
    <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
  );

  if (item.submenu && item.submenu.length > 0) {
    return (
      <>
        {separator}
        <BaseMenu.SubmenuRoot>
          <BaseMenu.SubmenuTrigger
            {...itemProps}
            className="m3e-dropdown-item m3e-segmented-menu__item m3e-segmented-menu__submenu-trigger"
          >
            {rippleEl}
            {leading}
            {label}
            <span
              className="m3e-segmented-menu__submenu-caret"
              aria-hidden="true"
            >
              <SubmenuChevronSvg rtl={direction === "rtl"} />
            </span>
          </BaseMenu.SubmenuTrigger>
          <BaseMenu.Portal container={portalContainer}>
            <BaseMenu.Positioner
              positionMethod={positionMethod}
              sideOffset={4}
              alignOffset={-4}
              className="m3e-segmented-menu__positioner"
            >
              <MenuPopup
                items={item.submenu}
                theme={theme}
                variant={variant}
                positionMethod={positionMethod}
              />
            </BaseMenu.Positioner>
          </BaseMenu.Portal>
        </BaseMenu.SubmenuRoot>
      </>
    );
  }

  if (item.checked !== undefined) {
    return (
      <>
        {separator}
        <BaseMenu.CheckboxItem
          {...itemProps}
          checked={item.checked}
          closeOnClick={item.closeOnClick ?? true}
          onCheckedChange={(next) => {
            item.onCheckedChange?.(next);
            item.onSelect?.();
          }}
          className="m3e-dropdown-item m3e-segmented-menu__item"
          data-selected={item.checked ? "" : undefined}
        >
          {rippleEl}
          <span className="m3e-dropdown-item__icon m3e-segmented-menu__icon" aria-hidden="true">
            <BaseMenu.CheckboxItemIndicator>
              <CheckIcon size={15} strokeWidth={2.6} />
            </BaseMenu.CheckboxItemIndicator>
          </span>
          {label}
          {shortcut}
        </BaseMenu.CheckboxItem>
      </>
    );
  }

  if ((item.href || item.render) && !item.disabled) {
    const { disabled: _disabled, ...linkProps } = itemProps;
    return (
      <>
        {separator}
        <BaseMenu.LinkItem
          {...linkProps}
          ref={cornerRef as React.Ref<HTMLAnchorElement>}
          href={item.href}
          render={item.render}
          closeOnClick={item.closeOnClick ?? true}
          onClick={(e) => item.onSelect?.(e)}
          className="m3e-dropdown-item m3e-segmented-menu__item"
          data-danger={item.danger ? "" : undefined}
        >
          {rippleEl}
          {leading}
          {label}
          {shortcut}
        </BaseMenu.LinkItem>
      </>
    );
  }

  return (
    <>
      {separator}
      <BaseMenu.Item
        {...itemProps}
        closeOnClick={item.closeOnClick}
        onClick={(e) => item.onSelect?.(e)}
        className="m3e-dropdown-item m3e-segmented-menu__item"
        data-danger={item.danger ? "" : undefined}
      >
        {rippleEl}
        {leading}
        {label}
        {shortcut}
      </BaseMenu.Item>
    </>
  );
}

export function DropdownMenu({
  trigger,
  items,
  theme = "standard",
  variant = "segmented",
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
}: M3EDropdownMenuProps): React.JSX.Element {
  const portalContainer = useM3EPortalContainer();
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
    Boolean(defaultOpen),
  );
  const isOpen = open ?? uncontrolledOpen;
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const assignTriggerRef = React.useCallback((node: HTMLElement | null) => {
    triggerRef.current = node;
  }, []);
  const positionMethod = useAdaptivePositionMethod(triggerRef, isOpen);

  return (
    <BaseMenu.Root
      modal={false}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => {
        if (open === undefined) {
          setUncontrolledOpen(next);
        }
        onOpenChange?.(next);
      }}
    >
      <BaseMenu.Trigger ref={assignTriggerRef} render={trigger} />
      <BaseMenu.Portal container={portalContainer}>
        <BaseMenu.Positioner
          positionMethod={positionMethod}
          side={side}
          align={align}
          sideOffset={6}
          className="m3e-segmented-menu__positioner"
        >
          <MenuPopup
            items={items}
            theme={theme}
            variant={variant}
            positionMethod={positionMethod}
          />
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export function ContextMenu({
  children,
  items,
  theme = "standard",
  variant = "segmented",
  className,
  style,
}: M3EContextMenuProps): React.JSX.Element {
  const portalContainer = useM3EPortalContainer();

  return (
    <BaseContextMenu.Root>
      <BaseContextMenu.Trigger
        className={
          className
            ? `m3e-context-menu__trigger ${className}`
            : "m3e-context-menu__trigger"
        }
        style={style}
      >
        {children}
      </BaseContextMenu.Trigger>
      <BaseContextMenu.Portal container={portalContainer}>
        <BaseContextMenu.Positioner className="m3e-segmented-menu__positioner">
          <MenuPopup
            items={items}
            theme={theme}
            variant={variant}
            positionMethod="fixed"
          />
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}
