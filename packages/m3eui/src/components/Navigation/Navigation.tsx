"use client";

import * as React from "react";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  NAVIGATION_RAIL_TOKENS,
  NAVIGATION_TOKENS,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import {
  useM3EScalarSpringEffect,
  usePressHoldState,
} from "../../hooks/useM3ESpring.js";
import { assignRef } from "../../internal/assignRef.js";
import { Badge } from "../Badge/Badge.js";
import {
  NavList,
  NavModal,
  useControllableOpen,
  type NavigationDestination,
} from "../../internal/navList.js";
import {
  LinkActionElement,
  isLinkRenderTarget,
  isModifiedLinkClick,
} from "../../internal/link.js";
import { useM3ERipple } from "../../internal/ripple.js";

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
  const { rippleRef, rippleHandlers } = useM3ERipple(Boolean(item.disabled));
  const mergedHandlers = mergeProps<"button">(
    pressHandlers as unknown as React.ComponentPropsWithRef<"button">,
    rippleHandlers as unknown as React.ComponentPropsWithRef<"button">,
  );
  const pillRef = React.useRef<HTMLSpanElement | null>(null);
  const [initPillScale] = React.useState(active ? 1 : 0.35);
  useM3EScalarSpringEffect(active ? 1 : 0.35, "fastSpatial", (s) => {
    if (pillRef.current) {
      pillRef.current.style.scale = `${Math.max(0.2, s).toFixed(3)} 1`;
    }
  });
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
        ref={pillRef}
        className="m3e-nav-item__pill"
        style={{
          borderRadius: `${NAVIGATION_TOKENS.horizontalIndicatorHeight / 2}px`,
          opacity: pillOpacity,
          scale: `${Math.max(0.2, initPillScale).toFixed(3)} 1`,
        }}
        aria-hidden="true"
      />
      <span
        ref={rippleRef}
        className="m3e-nav-item__state m3e-ripple"
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
          ref={pillRef}
          className="m3e-nav-item__pill"
          style={{
            borderRadius: `${NAVIGATION_TOKENS.indicatorRadius}px`,
            opacity: pillOpacity,
            scale: `${Math.max(0.2, initPillScale).toFixed(3)} 1`,
          }}
          aria-hidden="true"
        />
        <span
          ref={rippleRef}
          className="m3e-nav-item__state m3e-ripple"
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

  const isLink = isLinkRenderTarget(item.href, item.render) || Boolean(item.render);

  if (isLink) {
    const ariaCurrent = active
      ? item.href?.startsWith("#")
        ? "true"
        : "page"
      : undefined;
    return (
      <LinkActionElement
        href={item.href}
        target={item.target}
        rel={item.rel}
        render={item.render}
        disabled={item.disabled}
        aria-current={ariaCurrent}
        className="m3e-nav-item"
        data-active={active ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        data-layout={itemLayout}
        {...(mergedHandlers as Record<string, unknown>)}
        onClick={(e) => {
          if (isModifiedLinkClick(e)) return;
          onSelect(item.value);
        }}
      >
        {inner}
      </LinkActionElement>
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
      {...mergedHandlers}
      onClick={() => onSelect(item.value)}
    >
      {inner}
    </button>
  );
}

function NavigationBarInner<Value extends string = string>(
  {
    items,
    value,
    onValueChange,
    itemLayout = "vertical",
    arrangement = "equal-weight",
    "aria-label": ariaLabel,
    className,
    style,
  }: M3ENavigationBarProps<Value>,
  ref: React.ForwardedRef<HTMLElement>,
): React.JSX.Element {
  const { t } = useM3ERuntime();
  return (
    <nav
      ref={ref}
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

export const NavigationBar = React.forwardRef(NavigationBarInner) as <
  Value extends string = string,
>(
  props: M3ENavigationBarProps<Value> & React.RefAttributes<HTMLElement>,
) => React.JSX.Element;

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
  readonly value: Value | null;
  readonly onValueChange: (value: Value) => void;
  readonly expanded?: boolean;
  readonly defaultExpanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly collapsible?: boolean;
  /** `"auto"`: inline at ≥ 840px, modal below. */
  readonly modal?: boolean | "auto";
  /** `"compact"`: 40px items, 280px wide, sticky — long in-section lists. */
  readonly density?: "standard" | "compact";
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

const RAIL_METRICS = {
  standard: {
    itemHeight: NAVIGATION_RAIL_TOKENS.itemHeight,
    itemRadius: NAVIGATION_RAIL_TOKENS.itemRadius,
    itemPressedRadius: NAVIGATION_RAIL_TOKENS.itemPressedRadius,
  },
  compact: {
    itemHeight: NAVIGATION_RAIL_TOKENS.compactItemHeight,
    itemRadius: NAVIGATION_RAIL_TOKENS.compactItemRadius,
    itemPressedRadius: NAVIGATION_RAIL_TOKENS.compactItemPressedRadius,
  },
} as const;

const WIDE_QUERY = `(min-width: ${NAVIGATION_RAIL_TOKENS.autoModalBreakpoint}px)`;

function subscribeWide(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getWide(): boolean {
  return typeof window.matchMedia !== "function" || window.matchMedia(WIDE_QUERY).matches;
}

const noopSubscribe = () => () => {};

function NavigationRailInner<Value extends string = string>(
  {
    items,
    value,
    onValueChange,
    expanded: controlledExpanded,
    defaultExpanded = false,
    onExpandedChange,
    collapsible = false,
    modal = false,
    density = "standard",
    open,
    defaultOpen = false,
    onOpenChange,
    trigger,
    header,
    footer,
    "aria-label": ariaLabel,
    className,
    style,
  }: M3ENavigationRailProps<Value>,
  ref: React.ForwardedRef<HTMLElement>,
): React.JSX.Element {
  const { direction, t } = useM3ERuntime();
  const resolvedLabel = ariaLabel ?? t("navigation.railLabel");
  const compact = density === "compact";
  const metrics = RAIL_METRICS[density];
  const padding = compact
    ? NAVIGATION_RAIL_TOKENS.compactPadding
    : NAVIGATION_RAIL_TOKENS.padding;
  const expandedWidth = compact
    ? NAVIGATION_RAIL_TOKENS.compactWidth
    : NAVIGATION_RAIL_TOKENS.expandedMinWidth;
  const [isExpanded, setExpanded] = useControllableOpen(
    controlledExpanded,
    defaultExpanded,
    onExpandedChange,
  );
  const [isOpen, setOpen] = useControllableOpen(open, defaultOpen, onOpenChange);
  const wide = React.useSyncExternalStore(
    modal === "auto" ? subscribeWide : noopSubscribe,
    modal === "auto" ? getWide : () => true,
    () => true,
  );
  const railElRef = React.useRef<HTMLElement | null>(null);
  const mergeRailRef = React.useCallback(
    (node: HTMLElement | null) => {
      railElRef.current = node;
      assignRef(ref, node);
    },
    [ref],
  );
  const [initWidth] = React.useState(
    isExpanded ? expandedWidth : NAVIGATION_RAIL_TOKENS.collapsedWidth,
  );
  useM3EScalarSpringEffect(
    isExpanded ? expandedWidth : NAVIGATION_RAIL_TOKENS.collapsedWidth,
    "defaultSpatial",
    (w) => {
      if (railElRef.current) {
        railElRef.current.style.width = `${Math.max(NAVIGATION_RAIL_TOKENS.collapsedWidth, w).toFixed(1)}px`;
      }
    },
  );
  const { rippleRef: toggleRippleRef, rippleHandlers: toggleRippleHandlers } =
    useM3ERipple(false);
  const paddingVar = { "--m3e-nav-rail-padding": `${padding}px` } as React.CSSProperties;
  const cx = (base: string) =>
    [base, compact ? "m3e-nav-rail--compact" : "", className ?? ""].filter(Boolean).join(" ");

  const modalSurface =
    modal === true || (modal === "auto" && !wide) ? (
      <NavModal
        open={isOpen}
        onOpenChange={setOpen}
        trigger={trigger}
        aria-label={resolvedLabel}
        cornerRadius={NAVIGATION_RAIL_TOKENS.modalCornerRadius}
        maxWidth={NAVIGATION_RAIL_TOKENS.expandedMaxWidth}
        className={cx("m3e-nav-rail m3e-nav-rail--modal")}
        style={{
          minWidth: `${expandedWidth}px`,
          ...paddingVar,
          ...style,
        }}
      >
        {header ? <div className="m3e-nav-rail__header">{header}</div> : null}
        <NavList
          items={items}
          value={value}
          metrics={metrics}
          onSelect={(v) => {
            onValueChange(v);
            setOpen(false);
          }}
        />
        {footer ? <div className="m3e-nav-rail__footer">{footer}</div> : null}
      </NavModal>
    ) : null;

  if (modal === true) return modalSurface!;

  return (
    <>
      <nav
        ref={mergeRailRef}
        aria-label={resolvedLabel}
        className={cx("m3e-nav-rail")}
        data-expanded={isExpanded ? "" : undefined}
        data-modal={modal === "auto" ? "auto" : undefined}
        style={{
          width: `${Math.max(NAVIGATION_RAIL_TOKENS.collapsedWidth, initWidth).toFixed(1)}px`,
          ...paddingVar,
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
                {...toggleRippleHandlers}
              >
                <span ref={toggleRippleRef} className="m3e-ripple" aria-hidden="true" />
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
            metrics={metrics}
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
      {modalSurface}
    </>
  );
}

export const NavigationRail = React.forwardRef(NavigationRailInner) as <
  Value extends string = string,
>(
  props: M3ENavigationRailProps<Value> & React.RefAttributes<HTMLElement>,
) => React.JSX.Element;
