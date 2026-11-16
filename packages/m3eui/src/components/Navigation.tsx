"use client";

import * as React from "react";
import {
  NAVIGATION_RAIL_TOKENS,
  NAVIGATION_SUITE_TOKENS,
  NAVIGATION_TOKENS,
} from "../tokens/index.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { Badge } from "./Badge.js";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";
import {
  NavList,
  NavModal,
  useControllableOpen,
  type NavigationDestination,
} from "../internal/navList.js";

export type { NavigationDestination };

export interface M3ENavigationBarProps<Value extends string = string> {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value;
  readonly onValueChange: (value: Value) => void;
  readonly itemLayout?: "vertical" | "horizontal";
  readonly arrangement?: "equal-weight" | "centered";
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function NavItemButton<Value extends string>({
  item,
  active,
  itemLayout = "vertical",
  onSelect,
}: {
  readonly item: NavigationDestination<Value>;
  readonly active: boolean;
  readonly itemLayout?: "vertical" | "horizontal";
  readonly onSelect: (v: Value) => void;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(item.disabled));
  const pillScale = useM3EScalarSpring(active ? 1 : 0.35, "fastSpatial");
  const pillOpacity = active ? 1 : 0;
  const isHorizontal = itemLayout === "horizontal";

  const inner = isHorizontal ? (
    <span
      className="m3e-nav-item__pill-wrap m3e-nav-item__pill-wrap--horizontal"
      style={{
        minHeight: `${NAVIGATION_TOKENS.horizontalIndicatorHeight}px`,
        paddingInline: `${NAVIGATION_TOKENS.horizontalIndicatorPaddingInline}px`,
      }}
    >
      <span
        className="m3e-nav-item__pill"
        style={{
          borderRadius: `${NAVIGATION_TOKENS.horizontalIndicatorHeight / 2}px`,
          opacity: pillOpacity,
          scale: `${Math.max(0.2, pillScale).toFixed(3)} 1`,
        }}
        aria-hidden="true"
      />
      <span
        className="m3e-nav-item__state"
        style={{ borderRadius: `${NAVIGATION_TOKENS.horizontalIndicatorHeight / 2}px` }}
        aria-hidden="true"
      />
      <Badge count={item.badgeCount} dot={item.badgeDot}>
        <span className="m3e-nav-item__icon" aria-hidden="true">
          {active && item.activeIcon ? item.activeIcon : item.icon}
        </span>
      </Badge>
      <span className="m3e-nav-item__label">{item.label}</span>
    </span>
  ) : (
    <>
      <span
        className="m3e-nav-item__pill-wrap"
        style={{
          width: `${NAVIGATION_TOKENS.indicatorWidth}px`,
          height: `${NAVIGATION_TOKENS.indicatorHeight}px`,
        }}
      >
        <span
          className="m3e-nav-item__pill"
          style={{
            borderRadius: `${NAVIGATION_TOKENS.indicatorRadius}px`,
            opacity: pillOpacity,
            scale: `${Math.max(0.2, pillScale).toFixed(3)} 1`,
          }}
          aria-hidden="true"
        />
        <span
          className="m3e-nav-item__state"
          style={{ borderRadius: `${NAVIGATION_TOKENS.indicatorRadius}px` }}
          aria-hidden="true"
        />
        <Badge count={item.badgeCount} dot={item.badgeDot}>
          <span className="m3e-nav-item__icon" aria-hidden="true">
            {active && item.activeIcon ? item.activeIcon : item.icon}
          </span>
        </Badge>
      </span>
      <span className="m3e-nav-item__label">{item.label}</span>
    </>
  );

  if (item.href && !item.disabled) {
    const ariaCurrent = active
      ? item.href.startsWith("#")
        ? "true"
        : "page"
      : undefined;
    return (
      <a
        href={item.href}
        aria-current={ariaCurrent}
        className="m3e-nav-item"
        data-active={active ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        data-layout={itemLayout}
        onClick={() => onSelect(item.value)}
        {...pressHandlers}
      >
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={item.disabled}
      aria-current={active ? "page" : undefined}
      className="m3e-nav-item"
      data-active={active ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      data-layout={itemLayout}
      onClick={() => onSelect(item.value)}
      {...pressHandlers}
    >
      {inner}
    </button>
  );
}

export function NavigationBar<Value extends string = string>({
  items,
  value,
  onValueChange,
  itemLayout = "vertical",
  arrangement = "equal-weight",
  "aria-label": ariaLabel,
  className,
  style,
}: M3ENavigationBarProps<Value>): React.JSX.Element {
  const { t } = useM3ERuntime();
  return (
    <nav
      aria-label={ariaLabel ?? t("navigation.barLabel")}
      className={className ? `m3e-nav-bar ${className}` : "m3e-nav-bar"}
      data-item-layout={itemLayout}
      data-arrangement={arrangement}
      style={{
        minHeight: `calc(${NAVIGATION_TOKENS.barHeight}px + env(safe-area-inset-bottom, 0px))`,
        ...style,
      }}
    >
      {items.map((item) => (
        <NavItemButton
          key={item.value}
          item={item}
          active={item.value === value}
          itemLayout={itemLayout}
          onSelect={onValueChange}
        />
      ))}
    </nav>
  );
}

function MenuToggleSvg({
  expanded,
  rtl,
}: {
  readonly expanded: boolean;
  readonly rtl: boolean;
}) {
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={rtl ? { scale: "-1 1" } : undefined}
      aria-hidden="true"
    >
      {expanded ? (
        <>
          <line x1="18" y1="6" x2="6" y2="6" />
          <line x1="14" y1="12" x2="6" y2="12" />
          <line x1="18" y1="18" x2="6" y2="18" />
        </>
      ) : (
        <>
          <line x1="4" y1="6" x2="20" y2="6" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="18" x2="20" y2="18" />
        </>
      )}
    </svg>
  );
}

export interface M3ENavigationRailProps<Value extends string = string> {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value;
  readonly onValueChange: (value: Value) => void;
  readonly expanded?: boolean;
  readonly defaultExpanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly collapsible?: boolean;
  readonly modal?: boolean;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly trigger?: React.ReactElement;
  readonly header?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

const RAIL_LIST_METRICS = {
  itemHeight: NAVIGATION_RAIL_TOKENS.itemHeight,
  itemRadius: NAVIGATION_RAIL_TOKENS.itemRadius,
  itemPressedRadius: NAVIGATION_RAIL_TOKENS.itemPressedRadius,
} as const;

export function NavigationRail<Value extends string = string>({
  items,
  value,
  onValueChange,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  collapsible = false,
  modal = false,
  open,
  defaultOpen = false,
  onOpenChange,
  trigger,
  header,
  footer,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ENavigationRailProps<Value>): React.JSX.Element {
  const { direction, t } = useM3ERuntime();
  const resolvedLabel = ariaLabel ?? t("navigation.railLabel");
  const [isExpanded, setExpanded] = useControllableOpen(
    controlledExpanded,
    defaultExpanded,
    onExpandedChange,
  );
  const [isOpen, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange);
  const springWidth = useM3EScalarSpring(
    isExpanded
      ? NAVIGATION_RAIL_TOKENS.expandedMinWidth
      : NAVIGATION_RAIL_TOKENS.collapsedWidth,
    "defaultSpatial",
  );

  if (modal) {
    return (
      <NavModal
        open={isOpen}
        onOpenChange={setOpen}
        trigger={trigger}
        aria-label={resolvedLabel}
        cornerRadius={NAVIGATION_RAIL_TOKENS.modalCornerRadius}
        maxWidth={NAVIGATION_RAIL_TOKENS.expandedMaxWidth}
        className={
          className
            ? `m3e-nav-rail m3e-nav-rail--modal ${className}`
            : "m3e-nav-rail m3e-nav-rail--modal"
        }
        style={{
          minWidth: `${NAVIGATION_RAIL_TOKENS.expandedMinWidth}px`,
          padding: `${NAVIGATION_RAIL_TOKENS.padding}px`,
          ...style,
        }}
      >
        {header ? <div className="m3e-nav-rail__header">{header}</div> : null}
        <NavList
          items={items}
          value={value}
          metrics={RAIL_LIST_METRICS}
          onSelect={(v) => {
            onValueChange(v);
            setOpen(false);
          }}
        />
        {footer ? <div className="m3e-nav-rail__footer">{footer}</div> : null}
      </NavModal>
    );
  }

  return (
    <nav
      aria-label={resolvedLabel}
      className={className ? `m3e-nav-rail ${className}` : "m3e-nav-rail"}
      data-expanded={isExpanded ? "" : undefined}
      style={{
        width: `${Math.max(NAVIGATION_RAIL_TOKENS.collapsedWidth, springWidth).toFixed(1)}px`,
        padding: `${NAVIGATION_RAIL_TOKENS.padding}px`,
        ...style,
      }}
    >
      {collapsible || header ? (
        <div className="m3e-nav-rail__top">
          {collapsible ? (
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? t("navigation.collapseRail")
                  : t("navigation.expandRail")
              }
              className="m3e-nav-rail__toggle"
              onClick={() => setExpanded(!isExpanded)}
            >
              <MenuToggleSvg expanded={isExpanded} rtl={direction === "rtl"} />
            </button>
          ) : null}
          {header ? <div className="m3e-nav-rail__header">{header}</div> : null}
        </div>
      ) : null}

      {isExpanded ? (
        <NavList
          items={items}
          value={value}
          metrics={RAIL_LIST_METRICS}
          onSelect={onValueChange}
        />
      ) : (
        <div className="m3e-nav-rail__items">
          {items.map((item) => (
            <NavItemButton
              key={item.value}
              item={item}
              active={item.value === value}
              onSelect={onValueChange}
            />
          ))}
        </div>
      )}
      {isExpanded && footer ? (
        <div className="m3e-nav-rail__footer">{footer}</div>
      ) : null}
    </nav>
  );
}

export type NavigationSuiteLayout = "auto" | "bar" | "rail" | "expanded-rail";

export interface M3ENavigationSuiteProps<Value extends string = string> {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value;
  readonly onValueChange: (value: Value) => void;
  readonly layout?: NavigationSuiteLayout;
  readonly header?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function NavigationSuite<Value extends string = string>({
  items,
  value,
  onValueChange,
  layout = "auto",
  header,
  children,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ENavigationSuiteProps<Value>): React.JSX.Element {
  const { t } = useM3ERuntime();
  const resolvedLabel = ariaLabel ?? t("navigation.suiteLabel");
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [measuredWidth, setMeasuredWidth] = React.useState<number | null>(null);

  useIsoLayoutEffect(() => {
    const el = hostRef.current;
    if (!el || layout !== "auto") return undefined;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) {
        setMeasuredWidth(w);
      } else if (typeof window !== "undefined") {
        setMeasuredWidth(window.innerWidth > 0 ? window.innerWidth : 800);
      }
    };
    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout]);

  const resolvedMode: NavigationSuiteLayout =
    layout !== "auto"
      ? layout
      : measuredWidth === null
        ? "auto"
        : measuredWidth < NAVIGATION_SUITE_TOKENS.compactMaxWidth
          ? "bar"
          : measuredWidth < NAVIGATION_SUITE_TOKENS.mediumMaxWidth
            ? "rail"
            : "expanded-rail";
  const shows = (mode: NavigationSuiteLayout) =>
    resolvedMode === "auto" || resolvedMode === mode;

  return (
    <div
      ref={hostRef}
      className={className ? `m3e-nav-suite ${className}` : "m3e-nav-suite"}
      data-layout={resolvedMode}
      style={style}
    >
      <div className="m3e-nav-suite__auto-shell">
        {shows("rail") ? (
          <div className="m3e-nav-suite__slot m3e-nav-suite__slot--rail">
            <NavigationRail
              items={items}
              value={value}
              onValueChange={onValueChange}
              header={header}
              aria-label={resolvedLabel}
            />
          </div>
        ) : null}
        {shows("expanded-rail") ? (
          <div className="m3e-nav-suite__slot m3e-nav-suite__slot--expanded-rail">
            <NavigationRail
              items={items}
              defaultExpanded
              collapsible
              value={value}
              onValueChange={onValueChange}
              header={header}
              aria-label={resolvedLabel}
            />
          </div>
        ) : null}
        <div className="m3e-nav-suite__content">{children}</div>
        {shows("bar") ? (
          <div className="m3e-nav-suite__slot m3e-nav-suite__slot--bar">
            <NavigationBar
              items={items}
              value={value}
              onValueChange={onValueChange}
              aria-label={resolvedLabel}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}
