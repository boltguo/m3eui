"use client";

import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import { Popover as BasePopover } from "@base-ui/react/popover";
import {
  MENUBAR_TOKENS,
  POPOVER_TOKENS,
  SEGMENTED_MENU_TOKENS,
  resolveSegmentedMenuItemCorners,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import {
  useM3ECornerSpring,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

/* =========================================================================
   1. M3E Popover
   ========================================================================= */

export interface M3EPopoverProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly trigger: React.ReactElement;
  readonly title?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly side?: "top" | "bottom" | "left" | "right";
  readonly align?: "start" | "center" | "end";
  readonly sideOffset?: number;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function PopoverClose({
  render,
  children,
  className,
}: {
  readonly render?: React.ReactElement;
  readonly children?: React.ReactNode;
  readonly className?: string;
}): React.JSX.Element {
  return (
    <BasePopover.Close render={render} className={className}>
      {children}
    </BasePopover.Close>
  );
}

export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  title,
  description,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  children,
  className,
  style,
}: M3EPopoverProps): React.JSX.Element {
  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <BasePopover.Trigger render={trigger} />
      <BasePopover.Portal>
        <BasePopover.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="m3e-popover__positioner"
        >
          <BasePopover.Popup
            className={className ? `m3e-popover ${className}` : "m3e-popover"}
            style={{
              borderRadius: `${POPOVER_TOKENS.containerRadius}px`,
              padding: `${POPOVER_TOKENS.padding}px`,
              maxWidth: `${POPOVER_TOKENS.maxWidth}px`,
              ...style,
            }}
          >
            {title ? (
              <BasePopover.Title className="m3e-popover__title">
                {title}
              </BasePopover.Title>
            ) : null}
            {description ? (
              <BasePopover.Description className="m3e-popover__description">
                {description}
              </BasePopover.Description>
            ) : null}
            <div className="m3e-popover__body">{children}</div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}

/* =========================================================================
   2. M3E DropdownMenu, Nested Submenu, ContextMenu & Application Menubar
   ========================================================================= */

export interface M3EMenuItemSpec {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly shortcut?: string;
  readonly danger?: boolean;
  readonly disabled?: boolean;
  readonly separatorBefore?: boolean;
  /** Optional checkable menu item state (`role="menuitemcheckbox"`) */
  readonly checked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  /**
   * Optional nested child submenu (`BaseMenu.SubmenuRoot` + `SubmenuTrigger`).
   * Per `modern-web-guidance` (`menu`), submenu triggers open their nested menu ONLY and never invoke `onSelect`.
   */
  readonly submenu?: readonly M3EMenuItemSpec[];
  readonly onSelect?: () => void;
}

export interface M3EDropdownMenuProps {
  readonly trigger: React.ReactElement;
  readonly items: readonly M3EMenuItemSpec[];
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly side?: "top" | "bottom" | "left" | "right";
  readonly align?: "start" | "center" | "end";
}

export interface M3EContextMenuProps {
  readonly children: React.ReactNode;
  readonly items: readonly M3EMenuItemSpec[];
  readonly className?: string;
  readonly style?: React.CSSProperties;
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

function MenuCheckSvg() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function DropdownSegmentedItemList({
  items,
}: {
  readonly items: readonly M3EMenuItemSpec[];
}) {
  const hasAnyLeadingSlot = items.some(
    (it) => Boolean(it.icon) || it.checked !== undefined,
  );

  return (
    <>
      {items.map((item, idx) => (
        <DropdownSegmentedItem
          key={item.id}
          item={item}
          index={idx}
          count={items.length}
          hasAnyLeadingSlot={hasAnyLeadingSlot}
          isFirstInGroup={idx === 0 || Boolean(item.separatorBefore)}
          isLastInGroup={
            idx === items.length - 1 || Boolean(items[idx + 1]?.separatorBefore)
          }
        />
      ))}
    </>
  );
}

function DropdownSegmentedItem({
  item,
  index,
  count,
  hasAnyLeadingSlot,
  isFirstInGroup,
  isLastInGroup,
}: {
  readonly item: M3EMenuItemSpec;
  readonly index: number;
  readonly count: number;
  readonly hasAnyLeadingSlot: boolean;
  readonly isFirstInGroup: boolean;
  readonly isLastInGroup: boolean;
}) {
  const { direction } = useM3E();
  const [highlighted, setHighlighted] = React.useState(false);
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(item.disabled));
  const corners = resolveSegmentedMenuItemCorners({
    index,
    count,
    isFirstInGroup,
    isLastInGroup,
    isHighlighted: highlighted,
    isSelected: Boolean(item.checked),
    isPressed,
  });
  const { borderRadiusCss } = useM3ECornerSpring(corners, "fastSpatial");

  const commonStyle: React.CSSProperties = {
    minHeight: `${SEGMENTED_MENU_TOKENS.itemHeight}px`,
    paddingInline: `${SEGMENTED_MENU_TOKENS.itemPaddingInline}px`,
    borderRadius: borderRadiusCss,
  };

  const interactionHandlers = {
    onPointerEnter: () => setHighlighted(true),
    onPointerLeave: () => {
      setHighlighted(false);
      pressHandlers.onPointerLeave();
    },
    onPointerDown: pressHandlers.onPointerDown,
    onPointerUp: pressHandlers.onPointerUp,
    onPointerCancel: pressHandlers.onPointerCancel,
    onFocus: () => setHighlighted(true),
    onBlur: () => {
      setHighlighted(false);
      pressHandlers.onBlur();
    },
  };

  // 1. Nested Submenu item (never invokes onSelect; opens child popup)
  if (item.submenu && item.submenu.length > 0) {
    return (
      <>
        {item.separatorBefore ? (
          <BaseMenu.Separator className="m3e-menu__separator" />
        ) : null}
        <BaseMenu.SubmenuRoot>
          <BaseMenu.SubmenuTrigger
            disabled={item.disabled}
            className="m3e-segmented-menu__item m3e-segmented-menu__submenu-trigger"
            style={commonStyle}
            {...interactionHandlers}
          >
            {item.icon ? (
              <span className="m3e-segmented-menu__icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : hasAnyLeadingSlot ? (
              <span className="m3e-segmented-menu__icon" aria-hidden="true" />
            ) : null}
            <span className="m3e-segmented-menu__label">{item.label}</span>
            <span
              className="m3e-segmented-menu__submenu-caret"
              aria-hidden="true"
            >
              <SubmenuChevronSvg rtl={direction === "rtl"} />
            </span>
          </BaseMenu.SubmenuTrigger>
          <BaseMenu.Portal>
            <BaseMenu.Positioner
              sideOffset={4}
              alignOffset={-4}
              className="m3e-segmented-menu__positioner"
            >
              <BaseMenu.Popup
                className="m3e-segmented-menu"
                style={{
                  borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
                  padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
                  gap: `${SEGMENTED_MENU_TOKENS.itemGap}px`,
                }}
              >
                <DropdownSegmentedItemList items={item.submenu} />
              </BaseMenu.Popup>
            </BaseMenu.Positioner>
          </BaseMenu.Portal>
        </BaseMenu.SubmenuRoot>
      </>
    );
  }

  // 2. Checkable menu item (`menuitemcheckbox`)
  if (item.checked !== undefined) {
    return (
      <>
        {item.separatorBefore ? (
          <BaseMenu.Separator className="m3e-menu__separator" />
        ) : null}
        <BaseMenu.CheckboxItem
          checked={item.checked}
          disabled={item.disabled}
          onCheckedChange={(next) => {
            item.onCheckedChange?.(next);
            item.onSelect?.();
          }}
          className="m3e-segmented-menu__item"
          data-selected={item.checked ? "" : undefined}
          style={commonStyle}
          {...interactionHandlers}
        >
          <span className="m3e-segmented-menu__icon" aria-hidden="true">
            <BaseMenu.CheckboxItemIndicator>
              <MenuCheckSvg />
            </BaseMenu.CheckboxItemIndicator>
          </span>
          <span className="m3e-segmented-menu__label">{item.label}</span>
          {item.shortcut ? (
            <span className="m3e-segmented-menu__shortcut">
              {item.shortcut}
            </span>
          ) : null}
        </BaseMenu.CheckboxItem>
      </>
    );
  }

  // 3. Standard command menu item (`menuitem`)
  return (
    <>
      {item.separatorBefore ? (
        <BaseMenu.Separator className="m3e-menu__separator" />
      ) : null}
      <BaseMenu.Item
        disabled={item.disabled}
        onClick={() => item.onSelect?.()}
        className="m3e-segmented-menu__item"
        data-danger={item.danger ? "" : undefined}
        style={commonStyle}
        {...interactionHandlers}
      >
        {item.icon ? (
          <span className="m3e-segmented-menu__icon" aria-hidden="true">
            {item.icon}
          </span>
        ) : hasAnyLeadingSlot ? (
          <span className="m3e-segmented-menu__icon" aria-hidden="true" />
        ) : null}
        <span className="m3e-segmented-menu__label">{item.label}</span>
        {item.shortcut ? (
          <span className="m3e-segmented-menu__shortcut">{item.shortcut}</span>
        ) : null}
      </BaseMenu.Item>
    </>
  );
}

export function DropdownMenu({
  trigger,
  items,
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
}: M3EDropdownMenuProps): React.JSX.Element {
  return (
    <BaseMenu.Root
      modal={false}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner
          side={side}
          align={align}
          sideOffset={6}
          className="m3e-segmented-menu__positioner"
        >
          <BaseMenu.Popup
            className="m3e-segmented-menu"
            style={{
              borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
              padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
              gap: `${SEGMENTED_MENU_TOKENS.itemGap}px`,
            }}
          >
            <DropdownSegmentedItemList items={items} />
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

function ContextSegmentedItemList({
  items,
}: {
  readonly items: readonly M3EMenuItemSpec[];
}) {
  const hasAnyLeadingSlot = items.some(
    (it) => Boolean(it.icon) || it.checked !== undefined,
  );
  return (
    <>
      {items.map((item, idx) => (
        <ContextSegmentedItem
          key={item.id}
          item={item}
          index={idx}
          count={items.length}
          hasAnyLeadingSlot={hasAnyLeadingSlot}
          isFirstInGroup={idx === 0 || Boolean(item.separatorBefore)}
          isLastInGroup={
            idx === items.length - 1 || Boolean(items[idx + 1]?.separatorBefore)
          }
        />
      ))}
    </>
  );
}

function ContextSegmentedItem({
  item,
  index,
  count,
  hasAnyLeadingSlot,
  isFirstInGroup,
  isLastInGroup,
}: {
  readonly item: M3EMenuItemSpec;
  readonly index: number;
  readonly count: number;
  readonly hasAnyLeadingSlot: boolean;
  readonly isFirstInGroup: boolean;
  readonly isLastInGroup: boolean;
}) {
  const { direction } = useM3E();
  const [highlighted, setHighlighted] = React.useState(false);
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(item.disabled));
  const corners = resolveSegmentedMenuItemCorners({
    index,
    count,
    isFirstInGroup,
    isLastInGroup,
    isHighlighted: highlighted,
    isSelected: Boolean(item.checked),
    isPressed,
  });
  const { borderRadiusCss } = useM3ECornerSpring(corners, "fastSpatial");

  const commonStyle: React.CSSProperties = {
    minHeight: `${SEGMENTED_MENU_TOKENS.itemHeight}px`,
    paddingInline: `${SEGMENTED_MENU_TOKENS.itemPaddingInline}px`,
    borderRadius: borderRadiusCss,
  };

  const interactionHandlers = {
    onPointerEnter: () => setHighlighted(true),
    onPointerLeave: () => {
      setHighlighted(false);
      pressHandlers.onPointerLeave();
    },
    onPointerDown: pressHandlers.onPointerDown,
    onPointerUp: pressHandlers.onPointerUp,
    onPointerCancel: pressHandlers.onPointerCancel,
    onFocus: () => setHighlighted(true),
    onBlur: () => {
      setHighlighted(false);
      pressHandlers.onBlur();
    },
  };

  if (item.submenu && item.submenu.length > 0) {
    return (
      <>
        {item.separatorBefore ? (
          <BaseContextMenu.Separator className="m3e-menu__separator" />
        ) : null}
        <BaseContextMenu.SubmenuRoot>
          <BaseContextMenu.SubmenuTrigger
            disabled={item.disabled}
            className="m3e-segmented-menu__item m3e-segmented-menu__submenu-trigger"
            style={commonStyle}
            {...interactionHandlers}
          >
            {item.icon ? (
              <span className="m3e-segmented-menu__icon" aria-hidden="true">
                {item.icon}
              </span>
            ) : hasAnyLeadingSlot ? (
              <span className="m3e-segmented-menu__icon" aria-hidden="true" />
            ) : null}
            <span className="m3e-segmented-menu__label">{item.label}</span>
            <span
              className="m3e-segmented-menu__submenu-caret"
              aria-hidden="true"
            >
              <SubmenuChevronSvg rtl={direction === "rtl"} />
            </span>
          </BaseContextMenu.SubmenuTrigger>
          <BaseContextMenu.Portal>
            <BaseContextMenu.Positioner
              sideOffset={4}
              alignOffset={-4}
              className="m3e-segmented-menu__positioner"
            >
              <BaseContextMenu.Popup
                className="m3e-segmented-menu"
                style={{
                  borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
                  padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
                  gap: `${SEGMENTED_MENU_TOKENS.itemGap}px`,
                }}
              >
                <ContextSegmentedItemList items={item.submenu} />
              </BaseContextMenu.Popup>
            </BaseContextMenu.Positioner>
          </BaseContextMenu.Portal>
        </BaseContextMenu.SubmenuRoot>
      </>
    );
  }

  return (
    <>
      {item.separatorBefore ? (
        <BaseContextMenu.Separator className="m3e-menu__separator" />
      ) : null}
      <BaseContextMenu.Item
        disabled={item.disabled}
        onClick={() => item.onSelect?.()}
        className="m3e-segmented-menu__item"
        data-danger={item.danger ? "" : undefined}
        style={commonStyle}
        {...interactionHandlers}
      >
        {item.icon ? (
          <span className="m3e-segmented-menu__icon" aria-hidden="true">
            {item.icon}
          </span>
        ) : hasAnyLeadingSlot ? (
          <span className="m3e-segmented-menu__icon" aria-hidden="true" />
        ) : null}
        <span className="m3e-segmented-menu__label">{item.label}</span>
        {item.shortcut ? (
          <span className="m3e-segmented-menu__shortcut">{item.shortcut}</span>
        ) : null}
      </BaseContextMenu.Item>
    </>
  );
}

export function ContextMenu({
  children,
  items,
  className,
  style,
}: M3EContextMenuProps): React.JSX.Element {
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
      <BaseContextMenu.Portal>
        <BaseContextMenu.Positioner className="m3e-segmented-menu__positioner">
          <BaseContextMenu.Popup
            className="m3e-segmented-menu"
            style={{
              borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
              padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
              gap: `${SEGMENTED_MENU_TOKENS.itemGap}px`,
            }}
          >
            <ContextSegmentedItemList items={items} />
          </BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}

/* =========================================================================
   3. M3E Application Menubar (`@base-ui/react/menubar`)
   ========================================================================= */

export interface M3EMenubarMenuSpec {
  readonly id: string;
  readonly label: React.ReactNode;
  readonly disabled?: boolean;
  readonly items: readonly M3EMenuItemSpec[];
}

export interface M3EMenubarProps {
  readonly menus: readonly M3EMenubarMenuSpec[];
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function MenubarTopTrigger({
  menu,
}: {
  readonly menu: M3EMenubarMenuSpec;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(menu.disabled));
  const radius = useM3EScalarSpring(
    isPressed
      ? MENUBAR_TOKENS.triggerPressedRadius
      : MENUBAR_TOKENS.triggerRadius,
    "fastSpatial",
  );

  return (
    <BaseMenu.Root disabled={menu.disabled}>
      <BaseMenu.Trigger
        disabled={menu.disabled}
        className="m3e-menubar__trigger"
        style={{
          height: `${MENUBAR_TOKENS.triggerHeight}px`,
          paddingInline: `${MENUBAR_TOKENS.triggerPaddingInline}px`,
          borderRadius: `${Math.max(4, radius).toFixed(1)}px`,
        }}
        {...pressHandlers}
      >
        {menu.label}
      </BaseMenu.Trigger>
      <BaseMenu.Portal>
        <BaseMenu.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="m3e-segmented-menu__positioner"
        >
          <BaseMenu.Popup
            className="m3e-segmented-menu m3e-menubar__popup"
            style={{
              borderRadius: `${SEGMENTED_MENU_TOKENS.containerRadius}px`,
              padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
              gap: `${SEGMENTED_MENU_TOKENS.itemGap}px`,
            }}
          >
            <DropdownSegmentedItemList items={menu.items} />
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

/**
 * M3E Application Menubar (`@base-ui/react/menubar`)
 *
 * Styled as one continuous tonal capsule bar (`role="menubar"`, single `Tab` stop,
 * `ArrowLeft`/`ArrowRight` & pointer-hover instant switching across menus, nested submenus).
 */
export function Menubar({
  menus,
  disabled = false,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EMenubarProps): React.JSX.Element {
  const { t } = useM3E();
  return (
    <BaseMenubar
      modal={false}
      disabled={disabled}
      aria-label={ariaLabel ?? t("menubar.ariaLabel")}
      className={className ? `m3e-menubar ${className}` : "m3e-menubar"}
      style={{
        minHeight: `${MENUBAR_TOKENS.height}px`,
        borderRadius: `${MENUBAR_TOKENS.containerRadius}px`,
        padding: `${MENUBAR_TOKENS.padding}px`,
        ...style,
      }}
    >
      {menus.map((menu) => (
        <MenubarTopTrigger key={menu.id} menu={menu} />
      ))}
    </BaseMenubar>
  );
}
