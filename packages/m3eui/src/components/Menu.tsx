"use client";

import * as React from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { Menubar as BaseMenubar } from "@base-ui/react/menubar";
import {
  MENUBAR_TOKENS,
  SEGMENTED_MENU_TOKENS,
  parseShortcutKeys,
  resolveSegmentedMenuItemCorners,
} from "../tokens/index.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import { useM3ECornerSpringRef, usePressHoldState } from "../hooks/useM3ESpring.js";
import { Kbd } from "./Kbd.js";

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

function resolveMenuGroupRadius(index: number, count: number): string {
  const outer = SEGMENTED_MENU_TOKENS.containerRadius;
  const inner = SEGMENTED_MENU_TOKENS.groupInnerRadius;
  const top = index === 0 ? outer : inner;
  const bottom = index === count - 1 ? outer : inner;
  return `${top}px ${top}px ${bottom}px ${bottom}px`;
}

function MenuPopup({
  items,
  theme,
  variant,
  className,
}: {
  readonly items: readonly M3EMenuItemSpec[];
  readonly theme: M3EMenuTheme;
  readonly variant: M3EMenuVariant;
  readonly className?: string;
}) {
  const hasAnyLeadingSlot = items.some(
    (it) => Boolean(it.icon) || it.checked !== undefined,
  );
  const groups = splitMenuGroups(items);
  const isDetachedGroups = variant === "segmented" && groups.length > 1;
  const surfaceStyle: React.CSSProperties = {
    padding: `${SEGMENTED_MENU_TOKENS.containerPadding}px`,
    gap: `${SEGMENTED_MENU_TOKENS.itemGap}px`,
  };

  return (
    <BaseMenu.Popup
      className={className ? `m3e-segmented-menu ${className}` : "m3e-segmented-menu"}
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
            <BaseMenu.Group
              key={groupItems[0]!.id}
              className="m3e-segmented-menu__group"
              style={{
                ...surfaceStyle,
                borderRadius: resolveMenuGroupRadius(groupIdx, groups.length),
              }}
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
                />
              ))}
            </BaseMenu.Group>
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
}) {
  const { direction } = useM3ERuntime();
  const portalContainer = useM3EPortalContainer();
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(item.disabled));
  const corners =
    variant === "standard"
      ? ([8, 8, 8, 8] as const)
      : resolveSegmentedMenuItemCorners({
          index,
          count,
          isFirstInGroup,
          isLastInGroup,
          isSelected: Boolean(item.checked),
        });
  const { ref: cornerRef, borderRadiusCss } = useM3ECornerSpringRef<HTMLElement>(
    corners,
    "fastSpatial",
  );

  const itemProps = {
    ref: cornerRef as React.Ref<HTMLDivElement>,
    disabled: item.disabled,
    "data-pressed": isPressed ? "" : undefined,
    style: {
      minHeight: `${SEGMENTED_MENU_TOKENS.itemHeight}px`,
      paddingInline: `${SEGMENTED_MENU_TOKENS.itemPaddingInline}px`,
      borderRadius: borderRadiusCss,
    },
    ...pressHandlers,
  };
  const separator = showSeparator ? (
    <BaseMenu.Separator className="m3e-menu__separator" />
  ) : null;
  const label = (
    <span
      className="m3e-segmented-menu__label"
      data-text={typeof item.label === "string" ? item.label : undefined}
    >
      {item.label}
    </span>
  );
  const leading = item.icon ? (
    <span className="m3e-segmented-menu__icon" aria-hidden="true">
      {item.icon}
    </span>
  ) : hasAnyLeadingSlot ? (
    <span className="m3e-segmented-menu__icon" aria-hidden="true" />
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

  if (item.submenu && item.submenu.length > 0) {
    return (
      <>
        {separator}
        <BaseMenu.SubmenuRoot>
          <BaseMenu.SubmenuTrigger
            {...itemProps}
            className="m3e-segmented-menu__item m3e-segmented-menu__submenu-trigger"
          >
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
              sideOffset={4}
              alignOffset={-4}
              className="m3e-segmented-menu__positioner"
            >
              <MenuPopup items={item.submenu} theme={theme} variant={variant} />
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
          className="m3e-segmented-menu__item"
          data-selected={item.checked ? "" : undefined}
        >
          <span className="m3e-segmented-menu__icon" aria-hidden="true">
            <BaseMenu.CheckboxItemIndicator>
              <MenuCheckSvg />
            </BaseMenu.CheckboxItemIndicator>
          </span>
          {label}
          {shortcut}
        </BaseMenu.CheckboxItem>
      </>
    );
  }

  if (item.href || item.render) {
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
          className="m3e-segmented-menu__item"
          data-danger={item.danger ? "" : undefined}
        >
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
        className="m3e-segmented-menu__item"
        data-danger={item.danger ? "" : undefined}
      >
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

  return (
    <BaseMenu.Root
      modal={false}
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal container={portalContainer}>
        <BaseMenu.Positioner
          side={side}
          align={align}
          sideOffset={6}
          className="m3e-segmented-menu__positioner"
        >
          <MenuPopup items={items} theme={theme} variant={variant} />
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
          <MenuPopup items={items} theme={theme} variant={variant} />
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}

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
  const portalContainer = useM3EPortalContainer();
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(menu.disabled));
  const targetRadius = isPressed
    ? MENUBAR_TOKENS.triggerPressedRadius
    : MENUBAR_TOKENS.triggerRadius;
  const { ref: cornerRef, borderRadiusCss } = useM3ECornerSpringRef<HTMLButtonElement>(
    [targetRadius, targetRadius, targetRadius, targetRadius],
    "fastSpatial",
  );

  return (
    <BaseMenu.Root disabled={menu.disabled}>
      <BaseMenu.Trigger
        ref={cornerRef}
        disabled={menu.disabled}
        className="m3e-menubar__trigger"
        data-pressed={isPressed ? "" : undefined}
        style={{
          height: `${MENUBAR_TOKENS.triggerHeight}px`,
          paddingInline: `${MENUBAR_TOKENS.triggerPaddingInline}px`,
          borderRadius: borderRadiusCss,
        }}
        {...pressHandlers}
      >
        <span
          className="m3e-menubar__label"
          data-text={typeof menu.label === "string" ? menu.label : undefined}
        >
          {menu.label}
        </span>
      </BaseMenu.Trigger>
      <BaseMenu.Portal container={portalContainer}>
        <BaseMenu.Positioner
          side="bottom"
          align="start"
          sideOffset={6}
          className="m3e-segmented-menu__positioner"
        >
          <MenuPopup
            items={menu.items}
            theme="standard"
            variant="segmented"
            className="m3e-menubar__popup"
          />
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}

export function Menubar({
  menus,
  disabled = false,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EMenubarProps): React.JSX.Element {
  const { t } = useM3ERuntime();
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
