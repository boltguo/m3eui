"use client";

import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import {
  DOCKED_TOOLBAR_TOKENS,
  FLOATING_TOOLBAR_TOKENS,
  type FabColorVariant,
  type FloatingToolbarTheme,
} from "../tokens/index.js";
import { useM3ERuntime, useM3EI18n } from "../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { INERT_TRUE, inertProp } from "../internal/inert.js";
import { FabElevationContext } from "../internal/fabElevation.js";
import { MoreVertIconSvg } from "../internal/icons.js";
import { DropdownMenu } from "./Menu.js";
import { FAB, type M3EFABProps } from "./FAB.js";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";

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
  const { debugGeometry } = useM3ERuntime();
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
  const { t } = useM3ERuntime();
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

  useIsoLayoutEffect(() => {
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

export type DockedToolbarLayout = "spaced" | "centered" | "leading-actions";

export type DockedToolbarScrollBehavior = "pinned" | "exit-always";

export interface M3EDockedToolbarProps {
  readonly items: readonly FloatingToolbarItemSpec[];
  readonly primaryAction?: React.ReactNode;
  readonly layout?: DockedToolbarLayout;
  readonly elevated?: boolean;
  readonly maxVisibleActions?: number;
  readonly scrollBehavior?: DockedToolbarScrollBehavior;
  readonly scrollTargetRef?: React.RefObject<HTMLElement | Window | null>;
  readonly hidden?: boolean;
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

function useExitOnScroll(
  enabled: boolean,
  targetRef: React.RefObject<HTMLElement | Window | null> | undefined,
): boolean {
  const [hidden, setHidden] = React.useState(false);
  React.useEffect(() => {
    if (!enabled || typeof window === "undefined") {
      setHidden(false);
      return undefined;
    }
    const target: HTMLElement | Window = targetRef?.current ?? window;
    const readY = () =>
      target === window ? window.scrollY : (target as HTMLElement).scrollTop;
    let lastY = Math.max(0, readY());
    const onScroll = () => {
      const y = Math.max(0, readY());
      const dy = y - lastY;
      if (y <= 8) {
        lastY = y;
        setHidden(false);
      } else if (Math.abs(dy) > 6) {
        lastY = y;
        setHidden(dy > 0);
      }
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [enabled, targetRef]);
  return hidden;
}

export function DockedToolbar({
  items,
  primaryAction,
  layout = primaryAction ? "leading-actions" : "spaced",
  elevated = true,
  maxVisibleActions,
  scrollBehavior = "pinned",
  scrollTargetRef,
  hidden: controlledHidden,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EDockedToolbarProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedLabel = ariaLabel ?? t("dockedToolbar.ariaLabel");
  const scrollHidden = useExitOnScroll(
    scrollBehavior === "exit-always",
    scrollTargetRef,
  );
  const isHidden = controlledHidden ?? scrollHidden;
  const hideProgress = useM3EScalarSpring(isHidden ? 1 : 0, "defaultSpatial");

  const hasOverflow =
    maxVisibleActions !== undefined && items.length > maxVisibleActions;
  const visibleItems = hasOverflow
    ? items.slice(0, Math.max(0, maxVisibleActions - 1))
    : items;
  const overflowItems = hasOverflow ? items.slice(visibleItems.length) : [];

  return (
    <Toolbar.Root
      aria-label={resolvedLabel}
      aria-hidden={isHidden ? true : undefined}
      inert={inertProp(isHidden)}
      className={
        className ? `m3e-docked-toolbar ${className}` : "m3e-docked-toolbar"
      }
      data-layout={layout}
      data-elevated={elevated ? "" : undefined}
      data-hidden={isHidden ? "" : undefined}
      style={{
        minHeight: `calc(${DOCKED_TOOLBAR_TOKENS.height}px + env(safe-area-inset-bottom, 0px))`,
        paddingInline: `${DOCKED_TOOLBAR_TOKENS.paddingInline}px`,
        paddingBlockEnd: "env(safe-area-inset-bottom, 0px)",
        ...(hideProgress > 0.002
          ? {
              translate: `0px ${(hideProgress * 100).toFixed(2)}%`,
              opacity: Math.max(0, 1 - hideProgress * 0.4),
              pointerEvents: isHidden ? "none" : undefined,
            }
          : null),
        ...style,
      }}
    >
      <div className="m3e-docked-toolbar__items">
        {visibleItems.map((item, idx) => (
          <React.Fragment key={item.id}>
            {item.separatorBefore && idx > 0 ? (
              <Toolbar.Separator className="m3e-docked-toolbar__separator" />
            ) : null}
            <DockedToolbarActionButton item={item} />
          </React.Fragment>
        ))}
        {hasOverflow ? (
          <DropdownMenu
            align="end"
            items={overflowItems.map((item) => ({
              id: item.id,
              label: item.label,
              icon: item.icon,
              disabled: item.disabled,
              separatorBefore: item.separatorBefore,
              onSelect: item.onClick,
            }))}
            trigger={
              <Toolbar.Button
                aria-label={t("topAppBar.moreActions")}
                className="m3e-docked-toolbar__button"
                style={{
                  width: `${DOCKED_TOOLBAR_TOKENS.itemSize}px`,
                  height: `${DOCKED_TOOLBAR_TOKENS.itemSize}px`,
                  borderRadius: `${DOCKED_TOOLBAR_TOKENS.itemRadius}px`,
                }}
              >
                <span className="m3e-floating-toolbar__icon" aria-hidden="true">
                  <MoreVertIconSvg />
                </span>
              </Toolbar.Button>
            }
          />
        ) : null}
      </div>
      {primaryAction ? (
        <div className="m3e-docked-toolbar__primary">
          <FabElevationContext.Provider value="none">
            {primaryAction}
          </FabElevationContext.Provider>
        </div>
      ) : null}
    </Toolbar.Root>
  );
}
