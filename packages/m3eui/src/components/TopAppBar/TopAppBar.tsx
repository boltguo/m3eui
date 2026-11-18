"use client";

import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import {
  TOP_APP_BAR_SPECS,
  type TopAppBarVariant,
  resolveTopAppBarGeometry,
} from "../../tokens/topology.js";
import { useM3EI18n } from "../../context/M3EContext.js";
import { useM3EScalarSpringEffect } from "../../hooks/useM3ESpring.js";
import { IconButton } from "../IconButton/IconButton.js";
import { DropdownMenu, type M3EMenuItemSpec } from "../Menu/Menu.js";
import { MoreVertIconSvg } from "../../internal/icons.js";
import { useIsoLayoutEffect } from "../../internal/useIsoLayoutEffect.js";

export type TopAppBarScrollBehavior =
  | "pinned"
  | "enterAlways"
  | "exitUntilCollapsed";

export interface AppBarActionItem {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly onClick?: () => void;
  readonly disabled?: boolean;
  readonly danger?: boolean;
  readonly separatorBefore?: boolean;
}

export interface M3EAppBarRowProps {
  readonly items: readonly AppBarActionItem[];
  readonly maxVisibleItems?: number;
  readonly "aria-label"?: string;
  readonly moreActionsLabel?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function AppBarRow({
  items,
  maxVisibleItems = 3,
  "aria-label": ariaLabel,
  moreActionsLabel,
  className,
  style,
}: M3EAppBarRowProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const [fitSlots, setFitSlots] = React.useState<number>(maxVisibleItems);

  useIsoLayoutEffect(() => {
    const el = rowRef.current;
    if (!el) return;
    const syncSlots = () => {
      const w = el.clientWidth;
      if (w > 0) {
        const computed = Math.max(1, Math.floor((w + 4) / 44));
        setFitSlots(Math.min(maxVisibleItems, computed));
      } else {
        setFitSlots(maxVisibleItems);
      }
    };
    syncSlots();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(syncSlots);
      ro.observe(el);
      return () => ro.disconnect();
    }
    return undefined;
  }, [maxVisibleItems]);

  const effectiveLimit = Math.max(1, Math.min(maxVisibleItems, fitSlots));
  const hasOverflow = items.length > effectiveLimit;
  const visibleCount = hasOverflow
    ? Math.max(0, effectiveLimit - 1)
    : items.length;
  const visibleItems = items.slice(0, visibleCount);
  const overflowItems: readonly M3EMenuItemSpec[] = items
    .slice(visibleCount)
    .map((item) => ({
      id: item.id,
      label: item.label,
      icon: item.icon,
      disabled: item.disabled,
      danger: item.danger,
      separatorBefore: item.separatorBefore,
      onSelect: item.onClick,
    }));

  const resolvedAriaLabel = ariaLabel ?? t("topAppBar.actionsLabel");
  const resolvedMoreLabel = moreActionsLabel ?? t("topAppBar.moreActions");

  return (
    <Toolbar.Root
      ref={rowRef}
      aria-label={resolvedAriaLabel}
      className={className ? `m3e-app-bar-row ${className}` : "m3e-app-bar-row"}
      style={style}
    >
      {visibleItems.map((item) => (
        <Toolbar.Button
          key={item.id}
          render={
            <IconButton
              icon={item.icon}
              aria-label={item.label}
              disabled={item.disabled}
              onClick={item.onClick}
            />
          }
        />
      ))}
      {hasOverflow ? (
        <DropdownMenu
          align="end"
          items={overflowItems}
          trigger={
            <Toolbar.Button
              render={
                <IconButton
                  icon={<MoreVertIconSvg />}
                  aria-label={resolvedMoreLabel}
                />
              }
            />
          }
        />
      ) : null}
    </Toolbar.Root>
  );
}

export interface M3ETopAppBarProps {
  readonly title: React.ReactNode;
  readonly subtitle?: React.ReactNode;
  readonly variant?: TopAppBarVariant;
  readonly navigationIcon?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly actionItems?: readonly AppBarActionItem[];
  readonly maxVisibleActions?: number;
  readonly collapsedFraction?: number;
  readonly scrolled?: boolean;
  readonly scrollBehavior?: TopAppBarScrollBehavior;
  readonly scrollTargetRef?: React.RefObject<HTMLElement | Window | null>;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function TopAppBar({
  title,
  subtitle,
  variant = "small",
  navigationIcon,
  actions,
  actionItems,
  maxVisibleActions = 3,
  collapsedFraction: controlledFraction,
  scrolled: controlledScrolled,
  scrollBehavior,
  scrollTargetRef,
  className,
  style,
}: M3ETopAppBarProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const hasSubtitle = Boolean(subtitle);
  const headerRef = React.useRef<HTMLElement | null>(null);
  const [autoState, setAutoState] = React.useState({
    elevated: false,
    twoRow: true,
  });
  const writeFraction = React.useCallback((t: number) => {
    headerRef.current?.style.setProperty("--m3e-top-app-bar-t", t.toFixed(4));
  }, []);

  const maxCollapsePx = React.useMemo(() => {
    const exp = resolveTopAppBarGeometry({
      variant,
      collapsedFraction: 0,
      hasSubtitle,
    }).height;
    return Math.max(48, exp - TOP_APP_BAR_SPECS.collapsedHeight);
  }, [variant, hasSubtitle]);

  React.useEffect(() => {
    if (!scrollBehavior || typeof window === "undefined") return undefined;
    const target: HTMLElement | Window = scrollTargetRef?.current ?? window;
    const readScrollTop = () =>
      target === window
        ? window.scrollY
        : (target as HTMLElement).scrollTop;

    let lastY = Math.max(0, readScrollTop());
    let collapseOffset =
      scrollBehavior === "pinned"
        ? 0
        : Math.min(maxCollapsePx, lastY);

    const sync = () => {
      const y = Math.max(0, readScrollTop());
      const dy = y - lastY;
      lastY = y;

      if (scrollBehavior === "pinned") {
        collapseOffset = 0;
      } else if (scrollBehavior === "exitUntilCollapsed") {
        collapseOffset = Math.max(0, Math.min(maxCollapsePx, y));
      } else {
        collapseOffset = Math.max(
          0,
          Math.min(maxCollapsePx, collapseOffset + dy),
        );
        if (y === 0) collapseOffset = 0;
      }

      const nextFraction =
        scrollBehavior === "pinned"
          ? 0
          : Math.max(0, Math.min(1, collapseOffset / maxCollapsePx));
      const elevated = y > 4 || nextFraction > 0.08;
      const twoRow = nextFraction < 0.72;

      writeFraction(nextFraction);
      setAutoState((prev) =>
        prev.elevated === elevated && prev.twoRow === twoRow
          ? prev
          : { elevated, twoRow },
      );
    };

    sync();
    target.addEventListener("scroll", sync, { passive: true });
    return () => target.removeEventListener("scroll", sync);
  }, [scrollBehavior, scrollTargetRef, maxCollapsePx, writeFraction]);

  const isControlled = controlledFraction !== undefined || !scrollBehavior;
  const controlledT = Math.max(0, Math.min(1, controlledFraction ?? 0));
  useM3EScalarSpringEffect(controlledT, "fastSpatial", (t) => {
    if (isControlled) writeFraction(t);
  });

  const expandedGeo = resolveTopAppBarGeometry({ variant, collapsedFraction: 0, hasSubtitle });
  const collapsedH = TOP_APP_BAR_SPECS.collapsedHeight;
  const isElevated = isControlled
    ? Boolean(controlledScrolled) || controlledT > 0.08
    : controlledScrolled ?? autoState.elevated;
  const isTwoRow = isControlled ? controlledT < 0.72 : autoState.twoRow;
  const T = "var(--m3e-top-app-bar-t, 0)";
  const [initialT] = React.useState(isControlled ? controlledT : 0);

  const isCentered = variant === "center-aligned";
  const isFlexible =
    variant === "medium-flexible" || variant === "large-flexible";

  const hasActionItems = Boolean(actionItems && actionItems.length > 0);
  const hasActions = hasActionItems || Boolean(actions);

  const navInnerRef = React.useRef<HTMLSpanElement | null>(null);
  const actionsInnerRef = React.useRef<HTMLDivElement | null>(null);
  const [balancedSidePx, setBalancedSidePx] = React.useState<number>(0);

  useIsoLayoutEffect(() => {
    if (!isCentered) {
      setBalancedSidePx((prev) => (prev === 0 ? prev : 0));
      return undefined;
    }

    const syncWidths = () => {
      const leadW = navInnerRef.current?.offsetWidth ?? 0;
      const trailW = actionsInnerRef.current?.offsetWidth ?? 0;
      const next = Math.ceil(Math.max(leadW, trailW));
      setBalancedSidePx((prev) => (prev === next ? prev : next));
    };

    syncWidths();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(syncWidths);
      if (navInnerRef.current) ro.observe(navInnerRef.current);
      if (actionsInnerRef.current) ro.observe(actionsInnerRef.current);
      return () => ro.disconnect();
    }
    return undefined;
  }, [isCentered, navigationIcon, hasActionItems, actionItems, maxVisibleActions, actions]);

  const inlineTitleStyle: React.CSSProperties = {
    fontFamily: "var(--m3e-typescale-title-large-font, var(--m3e-font-brand))",
    fontSize: "var(--m3e-typescale-title-large-size, 1.375rem)",
    lineHeight: "var(--m3e-typescale-title-large-line-height, 1.75rem)",
    fontWeight: "var(--m3e-typescale-title-large-weight, 400)",
    letterSpacing: "var(--m3e-typescale-title-large-tracking, 0em)",
  };

  const inlineSubtitleStyle: React.CSSProperties = {
    fontFamily: "var(--m3e-typescale-label-medium-font, var(--m3e-font-plain))",
    fontSize: "var(--m3e-typescale-label-medium-size, 0.75rem)",
    lineHeight: "var(--m3e-typescale-label-medium-line-height, 1rem)",
    fontWeight: "var(--m3e-typescale-label-medium-weight, 500)",
    letterSpacing: "var(--m3e-typescale-label-medium-tracking, 0.0417em)",
  };

  const expTitleScale =
    variant === "large-flexible" ? "display-small" : "headline-medium";
  const expTitleRem = variant === "large-flexible" ? 2.25 : 1.75;
  const expLineRem = variant === "large-flexible" ? 2.75 : 2.25;

  const expandedTitleStyle: React.CSSProperties = {
    fontFamily: `var(--m3e-typescale-${expTitleScale}-font, var(--m3e-font-brand))`,
    fontSize: `calc(var(--m3e-typescale-${expTitleScale}-size, ${expTitleRem}rem) * (1 - ${T}) + var(--m3e-typescale-title-large-size, 1.375rem) * ${T})`,
    lineHeight: `calc(var(--m3e-typescale-${expTitleScale}-line-height, ${expLineRem}rem) * (1 - ${T}) + var(--m3e-typescale-title-large-line-height, 1.75rem) * ${T})`,
    fontWeight: `var(--m3e-typescale-${expTitleScale}-weight, 400)`,
    letterSpacing: `var(--m3e-typescale-${expTitleScale}-tracking, 0em)`,
  };

  const expSubScale =
    variant === "large-flexible" ? "title-medium" : "title-small";
  const expSubRem = variant === "large-flexible" ? 1 : 0.875;
  const expSubLineRem = variant === "large-flexible" ? 1.5 : 1.25;
  const expSubTracking = variant === "large-flexible" ? "0.0125em" : "0.0071em";

  const expandedSubtitleStyle: React.CSSProperties = {
    fontFamily: `var(--m3e-typescale-${expSubScale}-font, var(--m3e-font-plain))`,
    fontSize: `var(--m3e-typescale-${expSubScale}-size, ${expSubRem}rem)`,
    lineHeight: `var(--m3e-typescale-${expSubScale}-line-height, ${expSubLineRem}rem)`,
    fontWeight: `var(--m3e-typescale-${expSubScale}-weight, 500)`,
    letterSpacing: `var(--m3e-typescale-${expSubScale}-tracking, ${expSubTracking})`,
    opacity: `max(0, 1 - ${T} * 1.4)`,
  };

  const expandedExtraPx = Math.max(0, expandedGeo.height - collapsedH);

  const actionsNode =
    actionItems && actionItems.length > 0 ? (
      <AppBarRow
        items={actionItems}
        maxVisibleItems={maxVisibleActions}
        aria-label={t("topAppBar.actionsLabel")}
        className="m3e-top-app-bar__actions"
      />
    ) : actions ? (
      <Toolbar.Root
        aria-label={t("topAppBar.actionsLabel")}
        className="m3e-top-app-bar__actions"
      >
        {actions}
      </Toolbar.Root>
    ) : null;

  return (
    <header
      className={className ? `m3e-top-app-bar ${className}` : "m3e-top-app-bar"}
      data-variant={variant}
      ref={headerRef}
      data-elevated={isElevated ? "" : undefined}
      style={{
        ["--m3e-top-app-bar-t" as string]: initialT,
        minHeight: `calc(${expandedGeo.height}px - ${expandedGeo.height - collapsedH}px * ${T})`,
        paddingInline: `${TOP_APP_BAR_SPECS.horizontalPadding}px`,
        ...style,
      }}
    >
      <div className="m3e-top-app-bar__top-row">
        <div
          className="m3e-top-app-bar__nav"
          style={
            isCentered && balancedSidePx > 0
              ? { minInlineSize: `${balancedSidePx}px` }
              : undefined
          }
        >
          {navigationIcon ? (
            <span
              ref={navInnerRef}
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              {navigationIcon}
            </span>
          ) : null}
        </div>

        <div
          className="m3e-top-app-bar__inline-titles"
          data-centered={isCentered ? "" : undefined}
          aria-hidden={isFlexible && isTwoRow ? true : undefined}
          style={
            isFlexible
              ? {
                  opacity: `clamp(0, (${T} - 0.6) / 0.24, 1)`,
                  pointerEvents: isTwoRow ? "none" : undefined,
                }
              : undefined
          }
        >
          <div className="m3e-top-app-bar__title" style={inlineTitleStyle}>
            {title}
          </div>
          {subtitle ? (
            <div
              className="m3e-top-app-bar__subtitle"
              style={inlineSubtitleStyle}
            >
              {subtitle}
            </div>
          ) : null}
        </div>

        {hasActions ? (
          isCentered ? (
            <div
              className="m3e-top-app-bar__actions-slot"
              style={{
                display: "inline-flex",
                justifyContent: "flex-end",
                justifySelf: "end",
                minInlineSize:
                  balancedSidePx > 0 ? `${balancedSidePx}px` : undefined,
              }}
            >
              <div
                ref={actionsInnerRef}
                style={{ display: "inline-flex", alignItems: "center" }}
              >
                {actionsNode}
              </div>
            </div>
          ) : (
            actionsNode
          )
        ) : isCentered ? (
          <div
            className="m3e-top-app-bar__trailing-spacer"
            aria-hidden="true"
            style={{
              justifySelf: "end",
              minInlineSize:
                balancedSidePx > 0 ? `${balancedSidePx}px` : undefined,
            }}
          />
        ) : null}
      </div>

      {isFlexible ? (
        <div
          className="m3e-top-app-bar__expanded-row"
          aria-hidden={!isTwoRow ? true : undefined}
          style={{
            maxHeight: `calc(${expandedExtraPx}px * (1 - ${T}))`,
            overflow: "hidden",
            opacity: `clamp(0, (0.76 - ${T}) / 0.24, 1)`,
            paddingBottom: `calc(8px * (1 - ${T}))`,
            pointerEvents: !isTwoRow ? "none" : undefined,
          }}
        >
          <div className="m3e-top-app-bar__title" style={expandedTitleStyle}>
            {title}
          </div>
          {subtitle ? (
            <div
              className="m3e-top-app-bar__subtitle"
              style={expandedSubtitleStyle}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
