"use client";

import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import {
  NAVIGATION_DRAWER_TOKENS,
  NAVIGATION_SUITE_TOKENS,
  NAVIGATION_TOKENS,
  WIDE_NAVIGATION_RAIL_TOKENS,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { formatLocalizedInteger } from "../i18n/index.js";
import { Badge } from "./AvatarAndBadge.js";

export interface NavigationDestination<Value extends string = string> {
  readonly value: Value;
  readonly label: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly activeIcon?: React.ReactNode;
  readonly badgeCount?: number;
  readonly badgeDot?: boolean;
  readonly badgeLabel?: React.ReactNode;
  readonly href?: string;
  readonly disabled?: boolean;
  readonly section?: string;
}

export interface M3ENavigationBarProps<Value extends string = string> {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value;
  readonly onValueChange: (value: Value) => void;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ENavigationRailProps<Value extends string = string> {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value;
  readonly onValueChange: (value: Value) => void;
  readonly header?: React.ReactNode;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function NavItemButton<Value extends string>({
  item,
  active,
  onSelect,
}: {
  readonly item: NavigationDestination<Value>;
  readonly active: boolean;
  readonly onSelect: (v: Value) => void;
}) {
  const pillScale = useM3EScalarSpring(active ? 1 : 0.35, "fastSpatial");
  const pillOpacity = active ? 1 : 0;

  return (
    <button
      type="button"
      disabled={item.disabled}
      aria-current={active ? "page" : undefined}
      className="m3e-nav-item"
      data-active={active ? "" : undefined}
      onClick={() => onSelect(item.value)}
    >
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
        <Badge count={item.badgeCount} dot={item.badgeDot}>
          <span className="m3e-nav-item__icon" aria-hidden="true">
            {active && item.activeIcon ? item.activeIcon : item.icon}
          </span>
        </Badge>
      </span>
      <span className="m3e-nav-item__label">{item.label}</span>
    </button>
  );
}

export function NavigationBar<Value extends string = string>({
  items,
  value,
  onValueChange,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ENavigationBarProps<Value>): React.JSX.Element {
  const { t } = useM3E();
  return (
    <nav
      aria-label={ariaLabel ?? t("navigation.barLabel")}
      className={className ? `m3e-nav-bar ${className}` : "m3e-nav-bar"}
      style={{
        minHeight: `${NAVIGATION_TOKENS.barHeight}px`,
        ...style,
      }}
    >
      {items.map((item) => (
        <NavItemButton
          key={item.value}
          item={item}
          active={item.value === value}
          onSelect={onValueChange}
        />
      ))}
    </nav>
  );
}

export function NavigationRail<Value extends string = string>({
  items,
  value,
  onValueChange,
  header,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ENavigationRailProps<Value>): React.JSX.Element {
  const { t } = useM3E();
  return (
    <nav
      aria-label={ariaLabel ?? t("navigation.railLabel")}
      className={className ? `m3e-nav-rail ${className}` : "m3e-nav-rail"}
      style={{
        width: `${NAVIGATION_TOKENS.railWidth}px`,
        ...style,
      }}
    >
      {header ? <div className="m3e-nav-rail__header">{header}</div> : null}
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
    </nav>
  );
}

export interface M3EWideNavigationRailProps<Value extends string = string> {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value;
  readonly onValueChange: (value: Value) => void;
  readonly expanded?: boolean;
  readonly defaultExpanded?: boolean;
  readonly onExpandedChange?: (expanded: boolean) => void;
  readonly header?: React.ReactNode;
  readonly collapsible?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function WideRailItemButton<Value extends string>({
  item,
  active,
  expanded,
  suppressDataActive = false,
  onSelect,
}: {
  readonly item: NavigationDestination<Value>;
  readonly active: boolean;
  readonly expanded: boolean;
  readonly suppressDataActive?: boolean;
  readonly onSelect: (v: Value) => void;
}) {
  const { locale, t } = useM3E();
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(item.disabled));
  const radius = useM3EScalarSpring(
    isPressed
      ? WIDE_NAVIGATION_RAIL_TOKENS.itemPressedRadius
      : WIDE_NAVIGATION_RAIL_TOKENS.itemRadius,
    "fastSpatial",
  );

  if (!expanded) {
    return <NavItemButton item={item} active={active} onSelect={onSelect} />;
  }

  const resolvedIcon = active && item.activeIcon ? item.activeIcon : item.icon;
  const content = (
    <>
      {resolvedIcon ? (
        <span className="m3e-wide-rail__icon" aria-hidden="true">
          {resolvedIcon}
        </span>
      ) : null}
      <span className="m3e-wide-rail__label">{item.label}</span>
      {item.badgeCount !== undefined && item.badgeCount > 0 ? (
        <span className="m3e-wide-rail__badge">
          {item.badgeCount > 99
            ? t("badge.overflow", { max: formatLocalizedInteger(locale, 99) })
            : formatLocalizedInteger(locale, item.badgeCount)}
        </span>
      ) : item.badgeLabel !== undefined ? (
        <span className="m3e-wide-rail__tag">{item.badgeLabel}</span>
      ) : item.badgeDot ? (
        <span className="m3e-wide-rail__dot" aria-hidden="true" />
      ) : null}
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
        data-nav-value={item.value}
        aria-current={ariaCurrent}
        className={
          active && !suppressDataActive
            ? "m3e-wide-rail__item target-current"
            : "m3e-wide-rail__item"
        }
        data-active={active && !suppressDataActive ? "" : undefined}
        style={{
          minHeight: `${WIDE_NAVIGATION_RAIL_TOKENS.itemHeight}px`,
          borderRadius: `${Math.max(8, radius).toFixed(1)}px`,
        }}
        onClick={() => onSelect(item.value)}
        {...pressHandlers}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={item.disabled}
      aria-current={active ? "page" : undefined}
      className="m3e-wide-rail__item"
      data-active={active ? "" : undefined}
      style={{
        minHeight: `${WIDE_NAVIGATION_RAIL_TOKENS.itemHeight}px`,
        borderRadius: `${Math.max(8, radius).toFixed(1)}px`,
      }}
      onClick={() => onSelect(item.value)}
      {...pressHandlers}
    >
      {content}
    </button>
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

export function WideNavigationRail<Value extends string = string>({
  items,
  value,
  onValueChange,
  expanded: controlledExpanded,
  defaultExpanded = true,
  onExpandedChange,
  header,
  collapsible = true,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EWideNavigationRailProps<Value>): React.JSX.Element {
  const { direction, t } = useM3E();
  const [uncontrolledExpanded, setUncontrolledExpanded] =
    React.useState<boolean>(defaultExpanded);
  const isExpanded = controlledExpanded ?? uncontrolledExpanded;

  const targetWidth = isExpanded
    ? WIDE_NAVIGATION_RAIL_TOKENS.expandedWidth
    : WIDE_NAVIGATION_RAIL_TOKENS.collapsedWidth;
  const springWidth = useM3EScalarSpring(targetWidth, "defaultSpatial");

  const toggleExpanded = () => {
    const next = !isExpanded;
    if (controlledExpanded === undefined) {
      setUncontrolledExpanded(next);
    }
    onExpandedChange?.(next);
  };

  return (
    <nav
      aria-label={ariaLabel ?? t("navigation.wideRailLabel")}
      className={className ? `m3e-wide-rail ${className}` : "m3e-wide-rail"}
      data-expanded={isExpanded ? "" : undefined}
      style={{
        width: `${Math.max(72, springWidth).toFixed(1)}px`,
        padding: `${WIDE_NAVIGATION_RAIL_TOKENS.padding}px`,
        ...style,
      }}
    >
      {(collapsible || header) ? (
        <div className="m3e-wide-rail__top">
          {collapsible ? (
            <button
              type="button"
              aria-expanded={isExpanded}
              aria-label={
                isExpanded
                  ? t("navigation.collapseRail")
                  : t("navigation.expandRail")
              }
              className="m3e-wide-rail__toggle"
              onClick={toggleExpanded}
            >
              <MenuToggleSvg expanded={isExpanded} rtl={direction === "rtl"} />
            </button>
          ) : null}
          {header ? <div className="m3e-wide-rail__header">{header}</div> : null}
        </div>
      ) : null}

      <div className="m3e-wide-rail__items">
        {items.map((item) => (
          <WideRailItemButton
            key={item.value}
            item={item}
            active={item.value === value}
            expanded={isExpanded}
            onSelect={onValueChange}
          />
        ))}
      </div>
    </nav>
  );
}

export interface M3ENavigationDrawerProps<Value extends string = string> {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value;
  readonly onValueChange: (value: Value) => void;
  readonly variant?: "permanent" | "modal";
  readonly scrollSpy?: boolean;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly trigger?: React.ReactElement;
  readonly headline?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function DrawerBody<Value extends string>({
  items,
  value,
  suppressDataActive = false,
  onSelect,
  headline,
  footer,
}: {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value;
  readonly suppressDataActive?: boolean;
  readonly onSelect: (v: Value) => void;
  readonly headline?: React.ReactNode;
  readonly footer?: React.ReactNode;
}) {
  return (
    <>
      {headline ? (
        <div className="m3e-nav-drawer__headline">{headline}</div>
      ) : null}
      <div className="m3e-nav-drawer__items">
        {items.map((item, idx) => {
          const prevSection = idx > 0 ? items[idx - 1]?.section : undefined;
          const showSectionHeader =
            item.section !== undefined && item.section !== prevSection;
          const showDivider = idx > 0 && showSectionHeader;

          return (
            <React.Fragment key={item.value}>
              {showDivider ? (
                <hr className="m3e-nav-drawer__divider" />
              ) : null}
              {showSectionHeader ? (
                <div className="m3e-nav-drawer__section-title">
                  {item.section}
                </div>
              ) : null}
              <WideRailItemButton
                item={item}
                active={item.value === value}
                suppressDataActive={suppressDataActive}
                expanded
                onSelect={onSelect}
              />
            </React.Fragment>
          );
        })}
      </div>
      {footer ? <div className="m3e-nav-drawer__footer">{footer}</div> : null}
    </>
  );
}

export function NavigationDrawer<Value extends string = string>({
  items,
  value,
  onValueChange,
  variant = "permanent",
  scrollSpy = false,
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  headline,
  footer,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ENavigationDrawerProps<Value>): React.JSX.Element {
  const { direction, t } = useM3E();
  const resolvedLabel = ariaLabel ?? t("navigation.drawerLabel");
  const navRef = React.useRef<HTMLElement | null>(null);
  const [nativeScrollSpy, setNativeScrollSpy] = React.useState(false);

  const onValueChangeRef = React.useRef(onValueChange);
  onValueChangeRef.current = onValueChange;

  React.useEffect(() => {
    if (!scrollSpy || variant !== "permanent" || typeof window === "undefined") {
      setNativeScrollSpy(false);
      return;
    }

    let supportsNative = false;
    try {
      supportsNative =
        typeof CSS !== "undefined" &&
        typeof CSS.supports === "function" &&
        CSS.supports("scroll-target-group: auto") &&
        CSS.supports("selector(:target-current)");
    } catch {
      supportsNative = false;
    }

    if (supportsNative) {
      const syncNativeCurrent = () => {
        const navEl = navRef.current;
        if (!navEl) return;
        let currentLink: HTMLAnchorElement | null = null;
        try {
          currentLink = navEl.querySelector<HTMLAnchorElement>(
            "a.m3e-wide-rail__item:target-current",
          );
        } catch {
          return;
        }
        if (!currentLink) {
          setNativeScrollSpy(false);
          return;
        }
        setNativeScrollSpy(true);
        navEl
          .querySelectorAll<HTMLAnchorElement>("a.m3e-wide-rail__item")
          .forEach((link) => {
            if (link === currentLink) {
              link.setAttribute("aria-current", "true");
            } else {
              link.removeAttribute("aria-current");
            }
          });
        const matchedVal = currentLink.getAttribute("data-nav-value");
        if (matchedVal) {
          onValueChangeRef.current(matchedVal as Value);
        }
      };

      syncNativeCurrent();
      document.addEventListener("scrollend", syncNativeCurrent, {
        passive: true,
      });
      return () => {
        document.removeEventListener("scrollend", syncNativeCurrent);
      };
    }

    setNativeScrollSpy(false);
    if (typeof IntersectionObserver === "undefined") return;

    const targetMap = new Map<Element, Value>();
    for (const item of items) {
      if (item.href?.startsWith("#") && item.href.length > 1) {
        const el = document.getElementById(item.href.slice(1));
        if (el) {
          targetMap.set(el, item.value);
        }
      }
    }
    if (targetMap.size === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const matched = targetMap.get(entry.target);
            if (matched !== undefined) {
              onValueChangeRef.current(matched);
            }
          }
        }
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: 0 },
    );

    targetMap.forEach((_, el) => observer.observe(el));
    return () => observer.disconnect();
  }, [items, scrollSpy, variant]);

  if (variant === "permanent") {
    return (
      <nav
        ref={navRef}
        aria-label={resolvedLabel}
        data-scrollspy={scrollSpy ? "" : undefined}
        className={className ? `m3e-nav-drawer ${className}` : "m3e-nav-drawer"}
        style={{
          width: `${NAVIGATION_DRAWER_TOKENS.width}px`,
          borderRadius: `${NAVIGATION_DRAWER_TOKENS.cornerRadius}px`,
          padding: `${NAVIGATION_DRAWER_TOKENS.padding}px`,
          ...style,
        }}
      >
        <DrawerBody
          items={items}
          value={value}
          suppressDataActive={scrollSpy && nativeScrollSpy}
          onSelect={onValueChange}
          headline={headline}
          footer={footer}
        />
      </nav>
    );
  }

  const side = direction === "rtl" ? "right" : "left";
  const swipeDirection = direction === "rtl" ? "right" : "left";
  const r = NAVIGATION_DRAWER_TOKENS.cornerRadius;
  const endRadius =
    direction === "rtl"
      ? `${r}px 0px 0px ${r}px`
      : `0px ${r}px ${r}px 0px`;

  return (
    <BaseDrawer.Root
      open={open}
      defaultOpen={defaultOpen}
      swipeDirection={swipeDirection}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {trigger ? <BaseDrawer.Trigger render={trigger} /> : null}
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="m3e-sheet__backdrop" />
        <BaseDrawer.Viewport className="m3e-sheet__viewport" data-side={side}>
          <BaseDrawer.Popup
            aria-label={resolvedLabel}
            className={
              className
                ? `m3e-sheet__popup m3e-nav-drawer m3e-nav-drawer--modal ${className}`
                : "m3e-sheet__popup m3e-nav-drawer m3e-nav-drawer--modal"
            }
            data-side={side}
            style={{
              maxWidth: `${NAVIGATION_DRAWER_TOKENS.width}px`,
              borderRadius: endRadius,
              padding: `${NAVIGATION_DRAWER_TOKENS.padding}px`,
              ...style,
            }}
          >
            {headline ? (
              <BaseDrawer.Title className="m3e-nav-drawer__headline">
                {headline}
              </BaseDrawer.Title>
            ) : null}
            <DrawerBody
              items={items}
              value={value}
              onSelect={(v) => {
                onValueChange(v);
                onOpenChange?.(false);
              }}
              footer={footer}
            />
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

export type NavigationSuiteLayout = "auto" | "bar" | "rail" | "wide-rail";

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
  const { t } = useM3E();
  const resolvedLabel = ariaLabel ?? t("navigation.suiteLabel");
  const hostRef = React.useRef<HTMLDivElement | null>(null);
  const [measuredWidth, setMeasuredWidth] = React.useState<number>(800);

  React.useLayoutEffect(() => {
    const el = hostRef.current;
    if (!el || layout !== "auto") return undefined;
    const update = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setMeasuredWidth(w);
    };
    update();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(() => update());
    ro.observe(el);
    return () => ro.disconnect();
  }, [layout]);

  const resolvedMode: Exclude<NavigationSuiteLayout, "auto"> =
    layout !== "auto"
      ? layout
      : measuredWidth < NAVIGATION_SUITE_TOKENS.compactMaxWidth
        ? "bar"
        : measuredWidth < NAVIGATION_SUITE_TOKENS.mediumMaxWidth
          ? "rail"
          : "wide-rail";

  return (
    <div
      ref={hostRef}
      className={className ? `m3e-nav-suite ${className}` : "m3e-nav-suite"}
      data-layout={resolvedMode}
      style={style}
    >
      {resolvedMode === "rail" ? (
        <NavigationRail
          items={items}
          value={value}
          onValueChange={onValueChange}
          header={header}
          aria-label={resolvedLabel}
        />
      ) : resolvedMode === "wide-rail" ? (
        <WideNavigationRail
          items={items}
          value={value}
          onValueChange={onValueChange}
          header={header}
          aria-label={resolvedLabel}
        />
      ) : null}

      <div className="m3e-nav-suite__content">{children}</div>

      {resolvedMode === "bar" ? (
        <NavigationBar
          items={items}
          value={value}
          onValueChange={onValueChange}
          aria-label={resolvedLabel}
        />
      ) : null}
    </div>
  );
}
