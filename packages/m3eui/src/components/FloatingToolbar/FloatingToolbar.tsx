"use client";

import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import {
  FLOATING_TOOLBAR_TOKENS,
  type FabColorVariant,
  type FloatingToolbarTheme,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useM3EScalarSpring } from "../../hooks/useM3ESpring.js";
import { INERT_TRUE } from "../../internal/inert.js";
import { FAB, type M3EFABProps } from "../FAB/FAB.js";
import { useIsoLayoutEffect } from "../../internal/useIsoLayoutEffect.js";
import { useM3ERipple } from "../../internal/ripple.js";

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
  const { rippleRef, rippleHandlers } = useM3ERipple(Boolean(item.disabled));
  const pill = FLOATING_TOOLBAR_TOKENS.itemSize / 2;

  return (
    <Toolbar.Button
      disabled={item.disabled}
      aria-label={item.label}
      aria-pressed={item.selected}
      onClick={item.onClick}
      className="m3e-floating-toolbar__button"
      data-selected={item.selected ? "" : undefined}
      style={{
        width: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        height: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        minInlineSize: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        minBlockSize: `${FLOATING_TOOLBAR_TOKENS.itemSize}px`,
        borderRadius: `${pill}px`,
      }}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <span className="m3e-floating-toolbar__icon" aria-hidden="true">
        {item.icon}
      </span>
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          r:{pill}
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
      data-theme={theme}
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
            : `${(hasCompanion ? FLOATING_TOOLBAR_TOKENS.containerCrossSize : FLOATING_TOOLBAR_TOKENS.containerCrossSize * (1 - clampedCollapse)).toFixed(1)}px`,
          minWidth: isVertical
            ? `${(hasCompanion ? FLOATING_TOOLBAR_TOKENS.containerCrossSize : FLOATING_TOOLBAR_TOKENS.containerCrossSize * (1 - clampedCollapse)).toFixed(1)}px`
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
          data-default-fab={
            fab
              ? fab.variant === undefined
                ? ""
                : undefined
              : React.isValidElement(companionFab) &&
                  companionFab.type === FAB &&
                  (companionFab.props as M3EFABProps).variant === undefined
                ? ""
                : undefined
          }
          data-collapsed={collapsed ? "" : undefined}
        >
          {renderedCompanion}
        </div>
      ) : null}
    </div>
  );
}
