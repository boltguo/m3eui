"use client";

import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import {
  DOCKED_TOOLBAR_TOKENS,
  FAB_MENU_TOKENS,
  FLOATING_TOOLBAR_TOKENS,
  type FabColorVariant,
  type FloatingToolbarTheme,
  type ToggleFabSize,
  resolveToggleFabGeometry,
} from "../tokens/index.js";
import { useM3E, useM3EI18n } from "../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { INERT_TRUE } from "../internal/inert.js";
import { FAB, type M3EFABProps } from "./FAB.js";

export interface FloatingToolbarItemSpec {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly separatorBefore?: boolean;
  readonly onClick?: () => void;
}

export interface FloatingToolbarFabSpec {
  readonly icon: React.ReactNode;
  readonly label?: string;
  readonly "aria-label"?: string;
  readonly variant?: FabColorVariant;
  readonly disabled?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface M3EFloatingToolbarProps {
  readonly items: readonly FloatingToolbarItemSpec[];
  readonly "aria-label"?: string;
  readonly orientation?: "horizontal" | "vertical";
  readonly theme?: FloatingToolbarTheme;
  readonly expanded?: boolean;
  readonly defaultExpanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly collapsed?: boolean;
  readonly defaultCollapsed?: boolean;
  readonly onCollapsedChange?: (collapsed: boolean) => void;
  readonly scrollCollapse?: boolean;
  readonly scrollTarget?: React.RefObject<HTMLElement | null>;
  readonly fab?: FloatingToolbarFabSpec;
  readonly companionFab?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function FloatingToolbarActionButton({
  item,
}: {
  readonly item: FloatingToolbarItemSpec;
}) {
  const { debugGeometry } = useM3E();
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(item.disabled));
  const pill = FLOATING_TOOLBAR_TOKENS.itemSize / 2;
  const targetRadius = isPressed ? 10 : item.selected ? 14 : pill;
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLButtonElement>(
    [targetRadius, targetRadius, targetRadius, targetRadius],
    item.selected ? "fastSpatial" : "defaultEffects",
  );

  return (
    <Toolbar.Button
      ref={ref}
      disabled={item.disabled}
      aria-label={item.label}
      aria-pressed={item.selected}
      title={item.label}
      onClick={item.onClick}
      className="m3e-floating-toolbar__button"
      data-selected={item.selected ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        width: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        height: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        minInlineSize: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        minBlockSize: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        borderRadius: borderRadiusCss,
      }}
      {...pressHandlers}
    >
      <span className="m3e-floating-toolbar__icon" aria-hidden="true">
        {item.icon}
      </span>
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          r:{targetRadius.toFixed(0)}
        </span>
      ) : null}
    </Toolbar.Button>
  );
}

export function FloatingToolbar({
  items,
  "aria-label": ariaLabel,
  orientation = "horizontal",
  theme = "vibrant",
  expanded: controlledExpanded,
  defaultExpanded,
  onExpandedChange,
  collapsed: controlledCollapsed,
  defaultCollapsed,
  onCollapsedChange,
  scrollCollapse = false,
  scrollTarget,
  fab,
  companionFab,
  className,
  style,
}: M3EFloatingToolbarProps): React.JSX.Element {
  const { t } = useM3E();
  const resolvedAriaLabel = ariaLabel ?? t("floatingToolbar.ariaLabel");
  const isVertical = orientation === "vertical";
  const toolbarRef = React.useRef<HTMLDivElement | null>(null);
  const companionRef = React.useRef<HTMLDivElement | null>(null);
  const companionFabBtnRef = React.useRef<HTMLElement | null>(null);

  const initialCollapsed =
    defaultCollapsed !== undefined
      ? defaultCollapsed
      : defaultExpanded !== undefined
        ? !defaultExpanded
        : false;
  const [uncontrolledCollapsed, setUncontrolledCollapsed] =
    React.useState<boolean>(initialCollapsed);

  const controlledIsCollapsed =
    controlledCollapsed !== undefined
      ? controlledCollapsed
      : controlledExpanded !== undefined
        ? !controlledExpanded
        : undefined;
  const collapsed = controlledIsCollapsed ?? uncontrolledCollapsed;
  const expanded = !collapsed;

  const [inertCommitted, setInertCommitted] = React.useState<boolean>(collapsed);

  const evacuateFocusFromToolbar = React.useCallback(() => {
    if (typeof document === "undefined") return;
    const active = document.activeElement as HTMLElement | null;
    if (!active || !toolbarRef.current?.contains(active)) return;
    const fabTarget =
      companionFabBtnRef.current &&
      !companionFabBtnRef.current.hasAttribute("disabled") &&
      companionFabBtnRef.current.getAttribute("aria-disabled") !== "true"
        ? companionFabBtnRef.current
        : companionRef.current?.querySelector<HTMLElement>(
            'button:not([disabled]):not([aria-disabled="true"]), a[href], [tabindex]:not([tabindex="-1"])',
          );
    if (fabTarget) {
      fabTarget.focus();
    } else {
      active.blur?.();
    }
  }, []);

  React.useLayoutEffect(() => {
    if (collapsed) {
      evacuateFocusFromToolbar();
      if (toolbarRef.current) {
        toolbarRef.current.inert = true;
      }
      setInertCommitted(true);
    } else {
      if (toolbarRef.current) {
        toolbarRef.current.inert = false;
      }
      setInertCommitted(false);
    }
  }, [collapsed, evacuateFocusFromToolbar]);

  const updateCollapsed = React.useCallback(
    (next: boolean) => {
      if (next) {
        evacuateFocusFromToolbar();
      }
      if (controlledIsCollapsed === undefined) {
        setUncontrolledCollapsed((prev) => {
          if (prev !== next) {
            onCollapsedChange?.(next);
            onExpandedChange?.(!next);
          }
          return next;
        });
      } else if (next !== controlledIsCollapsed) {
        onCollapsedChange?.(next);
        onExpandedChange?.(!next);
      }
    },
    [
      controlledIsCollapsed,
      evacuateFocusFromToolbar,
      onCollapsedChange,
      onExpandedChange,
    ],
  );

  React.useEffect(() => {
    if (!scrollCollapse || typeof window === "undefined") return;
    const targetEl = scrollTarget?.current;
    const eventSource: HTMLElement | Window = targetEl ?? window;
    const readScrollOffset = () =>
      targetEl ? targetEl.scrollTop : window.scrollY;

    let lastOffset = readScrollOffset();
    const onScroll = () => {
      const current = readScrollOffset();
      const delta = current - lastOffset;
      if (current <= 8 || delta < -8) {
        updateCollapsed(false);
        lastOffset = current;
      } else if (delta > 10 && current > 24) {
        updateCollapsed(true);
        lastOffset = current;
      }
    };

    eventSource.addEventListener("scroll", onScroll, { passive: true });
    return () => eventSource.removeEventListener("scroll", onScroll);
  }, [scrollCollapse, scrollTarget, updateCollapsed]);

  const collapseMorph = useM3EScalarSpring(collapsed ? 1 : 0, "fastSpatial");
  const clampedCollapse = Math.max(0, Math.min(1, collapseMorph));

  const fabSizePx = Math.max(
    40,
    FLOATING_TOOLBAR_TOKENS.companionFabExpandedSize +
      (FLOATING_TOOLBAR_TOKENS.companionFabCollapsedSize -
        FLOATING_TOOLBAR_TOKENS.companionFabExpandedSize) *
        collapseMorph,
  );
  const fabRadiusPx = Math.max(8, 16 + (20 - 16) * collapseMorph);
  const fabIconSizePx = Math.max(18, 24 + (28 - 24) * collapseMorph);
  const defaultFabVariant: FabColorVariant =
    theme === "vibrant" ? "tertiary" : "primary";

  const hasCompanion = Boolean(fab || companionFab);
  const layoutGapPx = hasCompanion
    ? FLOATING_TOOLBAR_TOKENS.companionFabGap * (1 - clampedCollapse)
    : 0;
  const barPaddingPx =
    FLOATING_TOOLBAR_TOKENS.containerPadding * (1 - clampedCollapse);

  let renderedCompanion: React.ReactNode = null;
  if (fab) {
    renderedCompanion = (
      <FAB
        ref={companionFabBtnRef}
        size={expanded ? "sm" : "md"}
        variant={fab.variant ?? defaultFabVariant}
        icon={fab.icon}
        aria-label={fab["aria-label"] ?? fab.label ?? resolvedAriaLabel}
        disabled={fab.disabled}
        onClick={fab.onClick}
        style={
          {
            width: `${fabSizePx.toFixed(1)}px`,
            height: `${fabSizePx.toFixed(1)}px`,
            borderRadius: `${fabRadiusPx.toFixed(1)}px`,
            "--m3e-fab-icon-size": `${fabIconSizePx.toFixed(1)}px`,
          } as React.CSSProperties
        }
      />
    );
  } else if (companionFab) {
    if (React.isValidElement(companionFab) && companionFab.type === FAB) {
      const fabProps = companionFab.props as M3EFABProps;
      renderedCompanion = React.cloneElement(
        companionFab as React.ReactElement<
          M3EFABProps & React.RefAttributes<HTMLElement>
        >,
        {
          ref: companionFabBtnRef,
          size: expanded ? "sm" : "md",
          variant: fabProps.variant ?? defaultFabVariant,
          style: {
            width: `${fabSizePx.toFixed(1)}px`,
            height: `${fabSizePx.toFixed(1)}px`,
            borderRadius: `${fabRadiusPx.toFixed(1)}px`,
            "--m3e-fab-icon-size": `${fabIconSizePx.toFixed(1)}px`,
            ...fabProps.style,
          } as React.CSSProperties,
        },
      );
    } else {
      renderedCompanion = companionFab;
    }
  }

  return (
    <div
      className={
        className
          ? `m3e-floating-toolbar-layout ${className}`
          : "m3e-floating-toolbar-layout"
      }
      data-orientation={orientation}
      data-collapsed={collapsed ? "" : undefined}
      data-expanded={expanded ? "" : undefined}
      style={{
        gap: `${layoutGapPx.toFixed(2)}px`,
        ...style,
      }}
    >
      <Toolbar.Root
        ref={toolbarRef}
        orientation={orientation}
        aria-label={resolvedAriaLabel}
        inert={collapsed && inertCommitted ? INERT_TRUE : undefined}
        className="m3e-floating-toolbar"
        data-theme={theme}
        data-orientation={orientation}
        data-collapsed={collapsed ? "" : undefined}
        style={{
          borderRadius: `${FLOATING_TOOLBAR_TOKENS.containerRadius}px`,
          padding: `${barPaddingPx.toFixed(2)}px`,
          gap: `${FLOATING_TOOLBAR_TOKENS.itemGap}px`,
          opacity: Math.max(0, 1 - clampedCollapse),
          minHeight: isVertical
            ? undefined
            : `${(FLOATING_TOOLBAR_TOKENS.containerCrossSize * (1 - clampedCollapse)).toFixed(1)}px`,
          minWidth: isVertical
            ? `${(FLOATING_TOOLBAR_TOKENS.containerCrossSize * (1 - clampedCollapse)).toFixed(1)}px`
            : undefined,
        }}
      >
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {item.separatorBefore ? (
              <Toolbar.Separator
                className="m3e-floating-toolbar__separator"
                data-orientation={orientation}
              />
            ) : null}
            <FloatingToolbarActionButton item={item} />
          </React.Fragment>
        ))}
      </Toolbar.Root>
      {renderedCompanion ? (
        <div
          ref={companionRef}
          className="m3e-floating-toolbar__companion"
          data-collapsed={collapsed ? "" : undefined}
        >
          {renderedCompanion}
        </div>
      ) : null}
    </div>
  );
}

export interface FABMenuItemSpec {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly disabled?: boolean;
  readonly onSelect?: () => void;
}

export interface M3EFABMenuProps {
  readonly items: readonly FABMenuItemSpec[];
  readonly size?: ToggleFabSize;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly icon?: React.ReactNode;
  readonly triggerLabel?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function DefaultPlusSvg() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CloseCrossSvg() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function StaggeredFabMenuItem({
  item,
  index,
  count,
  isOpen,
  isRovingActive,
  onFocusItem,
  onDismissAndSelect,
  buttonRef,
}: {
  readonly item: FABMenuItemSpec;
  readonly index: number;
  readonly count: number;
  readonly isOpen: boolean;
  readonly isRovingActive: boolean;
  readonly onFocusItem: () => void;
  readonly onDismissAndSelect: () => void;
  readonly buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const { playbackRate } = useM3E();
  const [itemActive, setItemActive] = React.useState<boolean>(isOpen);

  React.useEffect(() => {
    const rate = Math.max(0.1, playbackRate);
    const rawDelayMs = isOpen
      ? (count - 1 - index) * FAB_MENU_TOKENS.staggerStepMs
      : index * 25;
    const delayMs = rawDelayMs / rate;

    if (delayMs <= 1) {
      setItemActive(isOpen);
      return;
    }
    const timer = setTimeout(() => {
      setItemActive(isOpen);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [isOpen, index, count, playbackRate]);

  const spatialProgress = useM3EScalarSpring(
    itemActive ? 1 : 0,
    "defaultSpatial",
  );
  const opacityProgress = useM3EScalarSpring(itemActive ? 1 : 0, "fastEffects");

  const { isPressed, pressHandlers } = usePressHoldState(
    !isOpen || Boolean(item.disabled),
  );
  const itemCornerTarget = isPressed ? 16 : FAB_MENU_TOKENS.itemRadius;
  const { ref: mergedRef, borderRadiusCss } =
    useM3ECornerSpringRef<HTMLButtonElement>(
      [itemCornerTarget, itemCornerTarget, itemCornerTarget, itemCornerTarget],
      "defaultEffects",
      buttonRef,
    );

  const translateY = (1 - spatialProgress) * 18;
  const scale = 0.88 + 0.12 * spatialProgress;
  const clampedOpacity = Math.max(0, Math.min(1, opacityProgress));

  return (
    <button
      ref={mergedRef}
      type="button"
      role="menuitem"
      disabled={item.disabled}
      tabIndex={isOpen && isRovingActive && !item.disabled ? 0 : -1}
      onFocus={onFocusItem}
      onClick={() => {
        if (item.disabled) return;
        onDismissAndSelect();
      }}
      className="m3e-fab-menu__item"
      data-open={isOpen ? "" : undefined}
      data-disabled={item.disabled ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        height: `${FAB_MENU_TOKENS.itemHeight}px`,
        paddingInline: `${FAB_MENU_TOKENS.itemPaddingInline}px`,
        gap: `${FAB_MENU_TOKENS.itemIconGap}px`,
        borderRadius: borderRadiusCss,
        opacity: clampedOpacity,
        translate: `0px ${translateY.toFixed(2)}px`,
        scale: `${scale.toFixed(3)}`,
        pointerEvents: isOpen ? "auto" : "none",
      }}
      {...pressHandlers}
    >
      <span
        className="m3e-fab-menu__item-icon"
        style={{
          width: FAB_MENU_TOKENS.itemIconSize,
          height: FAB_MENU_TOKENS.itemIconSize,
        }}
        aria-hidden="true"
      >
        {item.icon}
      </span>
      <span className="m3e-fab-menu__item-label">{item.label}</span>
    </button>
  );
}

export function FABMenu({
  items,
  size = "md",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  icon,
  triggerLabel,
  className,
  style,
}: M3EFABMenuProps): React.JSX.Element {
  const { debugGeometry, t } = useM3E();
  const resolvedTriggerLabel = triggerLabel ?? t("fabMenu.triggerOpen");
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState<boolean>(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const findFirstEnabledIndex = React.useCallback(() => {
    for (let i = 0; i < items.length; i++) {
      if (!items[i]?.disabled) return i;
    }
    return 0;
  }, [items]);

  const [activeIndex, setActiveIndex] = React.useState<number>(
    findFirstEnabledIndex,
  );
  const menuListId = React.useId();

  React.useEffect(() => {
    if (!isOpen) {
      setActiveIndex(findFirstEnabledIndex());
    }
  }, [isOpen, findFirstEnabledIndex]);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next) {
        setActiveIndex(findFirstEnabledIndex());
      }
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, findFirstEnabledIndex, onOpenChange],
  );

  React.useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, setOpen]);

  const focusEnabledItemFrom = React.useCallback(
    (startIdx: number, step: 1 | -1) => {
      const len = items.length;
      if (len === 0) return;
      for (let offset = 0; offset < len; offset++) {
        const candidate = (((startIdx + offset * step) % len) + len) % len;
        if (!items[candidate]?.disabled) {
          setActiveIndex(candidate);
          itemRefs.current[candidate]?.focus();
          return;
        }
      }
    },
    [items],
  );

  const { isPressed, pressHandlers } = usePressHoldState(false);
  const morphProgress = useM3EScalarSpring(isOpen ? 1 : 0, "fastSpatial");
  const clampedMorph = Math.max(0, Math.min(1, morphProgress));
  const fabGeo = resolveToggleFabGeometry(size, morphProgress);

  const effectiveRadius = isPressed
    ? Math.max(10, fabGeo.cornerRadius - 6)
    : fabGeo.cornerRadius;

  const hasCustomIcon = icon !== undefined;
  const customIconOpacity = Math.max(0, Math.min(1, 1 - clampedMorph * 1.4));
  const closeIconOpacity = Math.max(0, Math.min(1, (clampedMorph - 0.2) / 0.8));

  return (
    <div
      ref={rootRef}
      className={className ? `m3e-fab-menu ${className}` : "m3e-fab-menu"}
      data-open={isOpen ? "" : undefined}
      style={{ flexDirection: "column-reverse", ...style }}
      onBlur={(e) => {
        if (!isOpen) return;
        const nextFocused = e.relatedTarget as Node | null;
        if (nextFocused) {
          if (!e.currentTarget.contains(nextFocused)) {
            setOpen(false);
          }
          return;
        }
        const root = e.currentTarget;
        queueMicrotask(() => {
          if (
            typeof document !== "undefined" &&
            document.activeElement &&
            !root.contains(document.activeElement)
          ) {
            setOpen(false);
          }
        });
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
          return;
        }
        if (items.length === 0) return;
        if (e.target === triggerRef.current) {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!isOpen) {
              setOpen(true);
              queueMicrotask(() => focusEnabledItemFrom(items.length - 1, -1));
            } else {
              focusEnabledItemFrom(items.length - 1, -1);
            }
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen) {
              setOpen(true);
              queueMicrotask(() => focusEnabledItemFrom(0, 1));
            } else {
              focusEnabledItemFrom(0, 1);
            }
          }
          return;
        }
        if (!isOpen) return;
        const domFocusedIdx =
          typeof document !== "undefined"
            ? itemRefs.current.indexOf(
                document.activeElement as HTMLButtonElement,
              )
            : -1;
        const currentIdx = domFocusedIdx >= 0 ? domFocusedIdx : activeIndex;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          focusEnabledItemFrom(currentIdx - 1, -1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          focusEnabledItemFrom(currentIdx + 1, 1);
        } else if (e.key === "Home") {
          e.preventDefault();
          focusEnabledItemFrom(0, 1);
        } else if (e.key === "End") {
          e.preventDefault();
          focusEnabledItemFrom(items.length - 1, -1);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? t("fabMenu.triggerClose") : resolvedTriggerLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuListId}
        onClick={() => setOpen(!isOpen)}
        className="m3e-toggle-fab"
        data-open={isOpen ? "" : undefined}
        data-size={size}
        data-pressed={isPressed ? "" : undefined}
        style={{
          width: `${fabGeo.containerSize.toFixed(1)}px`,
          height: `${fabGeo.containerSize.toFixed(1)}px`,
          borderRadius: `${effectiveRadius.toFixed(1)}px`,
        }}
        {...pressHandlers}
      >
        <span
          className="m3e-toggle-fab__icon"
          style={{
            position: "relative",
            width: `${fabGeo.iconSize.toFixed(1)}px`,
            height: `${fabGeo.iconSize.toFixed(1)}px`,
            rotate: hasCustomIcon
              ? "0deg"
              : `${fabGeo.iconRotationDeg.toFixed(1)}deg`,
          }}
          aria-hidden="true"
        >
          {hasCustomIcon ? (
            <>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: customIconOpacity,
                  scale: `${(1 - 0.25 * clampedMorph).toFixed(3)}`,
                  rotate: `${(45 * clampedMorph).toFixed(1)}deg`,
                }}
              >
                {icon}
              </span>
              <span
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: closeIconOpacity,
                  scale: `${(0.75 + 0.25 * clampedMorph).toFixed(3)}`,
                  rotate: `${(-45 * (1 - clampedMorph)).toFixed(1)}deg`,
                }}
              >
                <CloseCrossSvg />
              </span>
            </>
          ) : (
            <DefaultPlusSvg />
          )}
        </span>
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            {Math.round(fabGeo.containerSize)}px r:{effectiveRadius.toFixed(0)}
          </span>
        ) : null}
      </button>

      <div
        id={menuListId}
        role="menu"
        aria-label={resolvedTriggerLabel}
        inert={!isOpen ? INERT_TRUE : undefined}
        className="m3e-fab-menu__list"
        style={{
          gap: `${FAB_MENU_TOKENS.listGap}px`,
          marginBottom: `${FAB_MENU_TOKENS.closeButtonGap}px`,
        }}
      >
        {items.map((item, idx) => (
          <StaggeredFabMenuItem
            key={item.id}
            item={item}
            index={idx}
            count={items.length}
            isOpen={isOpen}
            isRovingActive={idx === activeIndex}
            onFocusItem={() => setActiveIndex(idx)}
            buttonRef={(el) => {
              itemRefs.current[idx] = el;
            }}
            onDismissAndSelect={() => {
              item.onSelect?.();
              setOpen(false);
              triggerRef.current?.focus();
            }}
          />
        ))}
      </div>
    </div>
  );
}

export type DockedToolbarLayout = "spaced" | "centered" | "leading-actions";

export interface M3EDockedToolbarProps {
  readonly items: readonly FloatingToolbarItemSpec[];
  readonly primaryAction?: React.ReactNode;
  readonly layout?: DockedToolbarLayout;
  readonly elevated?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function DockedToolbarActionButton({
  item,
}: {
  readonly item: FloatingToolbarItemSpec;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(item.disabled));
  const targetRadius = isPressed
    ? DOCKED_TOOLBAR_TOKENS.itemPressedRadius
    : item.selected
      ? DOCKED_TOOLBAR_TOKENS.itemSelectedRadius
      : DOCKED_TOOLBAR_TOKENS.itemRadius;
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLButtonElement>(
    [targetRadius, targetRadius, targetRadius, targetRadius],
    item.selected ? "fastSpatial" : "defaultEffects",
  );

  return (
    <Toolbar.Button
      ref={ref}
      disabled={item.disabled}
      aria-label={item.label}
      aria-pressed={item.selected}
      onClick={item.onClick}
      className="m3e-docked-toolbar__button"
      data-selected={item.selected ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        width: `${DOCKED_TOOLBAR_TOKENS.itemSize}px`,
        height: `${DOCKED_TOOLBAR_TOKENS.itemSize}px`,
        borderRadius: borderRadiusCss,
      }}
      {...pressHandlers}
    >
      <span className="m3e-floating-toolbar__icon" aria-hidden="true">
        {item.icon}
      </span>
    </Toolbar.Button>
  );
}

export function DockedToolbar({
  items,
  primaryAction,
  layout = primaryAction ? "leading-actions" : "spaced",
  elevated = true,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EDockedToolbarProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedLabel = ariaLabel ?? t("dockedToolbar.ariaLabel");

  return (
    <Toolbar.Root
      aria-label={resolvedLabel}
      className={
        className ? `m3e-docked-toolbar ${className}` : "m3e-docked-toolbar"
      }
      data-layout={layout}
      data-elevated={elevated ? "" : undefined}
      style={{
        minHeight: `${DOCKED_TOOLBAR_TOKENS.height}px`,
        paddingInline: `${DOCKED_TOOLBAR_TOKENS.paddingInline}px`,
        ...style,
      }}
    >
      <div className="m3e-docked-toolbar__items">
        {items.map((item, idx) => (
          <React.Fragment key={item.id}>
            {item.separatorBefore && idx > 0 ? (
              <Toolbar.Separator className="m3e-docked-toolbar__separator" />
            ) : null}
            <DockedToolbarActionButton item={item} />
          </React.Fragment>
        ))}
      </div>
      {primaryAction ? (
        <div className="m3e-docked-toolbar__primary">{primaryAction}</div>
      ) : null}
    </Toolbar.Root>
  );
}
