import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import { useM3EScalarSpring, usePressHoldState } from "../hooks/useM3ESpring.js";
import { formatLocalizedInteger } from "../i18n/index.js";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect.js";

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

export interface NavListMetrics {
  readonly itemHeight: number;
  readonly itemRadius: number;
  readonly itemPressedRadius: number;
}

function NavListItem<Value extends string>({
  item,
  active,
  metrics,
  onSelect,
}: {
  readonly item: NavigationDestination<Value>;
  readonly active: boolean;
  readonly metrics: NavListMetrics;
  readonly onSelect: (v: Value) => void;
}) {
  const { locale, t } = useM3ERuntime();
  const { isPressed, pressHandlers } = usePressHoldState(Boolean(item.disabled));
  const radius = useM3EScalarSpring(
    isPressed ? metrics.itemPressedRadius : metrics.itemRadius,
    "fastSpatial",
  );
  const icon = active && item.activeIcon ? item.activeIcon : item.icon;

  const content = (
    <>
      {icon ? (
        <span className="m3e-nav-list__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span
        className="m3e-nav-list__label"
        data-text={typeof item.label === "string" ? item.label : undefined}
      >
        {item.label}
      </span>
      {item.badgeCount !== undefined && item.badgeCount > 0 ? (
        <span className="m3e-nav-list__badge">
          {item.badgeCount > 99
            ? t("badge.overflow", { max: formatLocalizedInteger(locale, 99) })
            : formatLocalizedInteger(locale, item.badgeCount)}
        </span>
      ) : item.badgeLabel !== undefined ? (
        <span className="m3e-nav-list__tag">{item.badgeLabel}</span>
      ) : item.badgeDot ? (
        <span className="m3e-nav-list__dot" aria-hidden="true" />
      ) : null}
    </>
  );

  const shared = {
    className: "m3e-nav-list__item",
    "data-nav-value": item.value,
    "data-active": active ? "" : undefined,
    "data-pressed": isPressed ? "" : undefined,
    style: {
      minHeight: `${metrics.itemHeight}px`,
      borderRadius: `${Math.max(4, radius).toFixed(1)}px`,
    },
    onClick: () => onSelect(item.value),
    ...pressHandlers,
  };

  if (item.href && !item.disabled) {
    const ariaCurrent = active
      ? item.href.startsWith("#")
        ? "true"
        : "page"
      : undefined;
    return (
      <a href={item.href} aria-current={ariaCurrent} {...shared}>
        {content}
      </a>
    );
  }

  return (
    <button
      type="button"
      disabled={item.disabled}
      aria-current={active ? "page" : undefined}
      {...shared}
    >
      {content}
    </button>
  );
}

export function NavList<Value extends string>({
  items,
  value,
  metrics,
  onSelect,
  scrollRef,
  className,
}: {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value | null;
  readonly metrics: NavListMetrics;
  readonly onSelect: (v: Value) => void;
  readonly scrollRef?: React.Ref<HTMLDivElement>;
  readonly className?: string;
}): React.JSX.Element {
  const listRef = React.useRef<HTMLDivElement | null>(null);

  useIsoLayoutEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>(
      ".m3e-nav-list__item[data-active]",
    );
    if (!list || !active) return;
    const listRect = list.getBoundingClientRect();
    const itemRect = active.getBoundingClientRect();
    if (itemRect.top < listRect.top) {
      list.scrollTop += itemRect.top - listRect.top - 24;
    } else if (itemRect.bottom > listRect.bottom) {
      list.scrollTop += itemRect.bottom - listRect.bottom + 24;
    }
  }, [value]);

  return (
    <div
      ref={(node) => {
        listRef.current = node;
        if (typeof scrollRef === "function") scrollRef(node);
        else if (scrollRef) {
          (scrollRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }
      }}
      className={className ? `m3e-nav-list ${className}` : "m3e-nav-list"}
    >
      {items.map((item, idx) => {
        const prevSection = idx > 0 ? items[idx - 1]?.section : undefined;
        const startsSection =
          item.section !== undefined && item.section !== prevSection;
        return (
          <React.Fragment key={item.value}>
            {startsSection && idx > 0 ? (
              <hr className="m3e-nav-list__divider" />
            ) : null}
            {startsSection ? (
              <div className="m3e-nav-list__section-title">{item.section}</div>
            ) : null}
            <NavListItem
              item={item}
              active={item.value === value}
              metrics={metrics}
              onSelect={onSelect}
            />
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function NavModal({
  open,
  onOpenChange,
  trigger,
  "aria-label": ariaLabel,
  cornerRadius,
  maxWidth,
  className,
  style,
  children,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
  readonly trigger?: React.ReactElement;
  readonly "aria-label": string;
  readonly cornerRadius: number;
  readonly maxWidth: number;
  readonly className: string;
  readonly style?: React.CSSProperties;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const { direction } = useM3ERuntime();
  const portalContainer = useM3EPortalContainer();
  const side = direction === "rtl" ? "right" : "left";
  const r = cornerRadius;
  return (
    <BaseDrawer.Root open={open} swipeDirection={side} onOpenChange={onOpenChange}>
      {trigger ? <BaseDrawer.Trigger render={trigger} /> : null}
      <BaseDrawer.Portal container={portalContainer}>
        <BaseDrawer.Backdrop className="m3e-sheet__backdrop" />
        <BaseDrawer.Viewport className="m3e-sheet__viewport" data-side={side}>
          <BaseDrawer.Popup
            aria-label={ariaLabel}
            className={`m3e-sheet__popup ${className}`}
            data-side={side}
            style={{
              maxWidth: `${maxWidth}px`,
              borderRadius:
                side === "right" ? `${r}px 0 0 ${r}px` : `0 ${r}px ${r}px 0`,
              ...style,
            }}
          >
            {children}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

export function useControllableOpen(
  open: boolean | undefined,
  defaultOpen: boolean,
  onOpenChange: ((open: boolean) => void) | undefined,
): readonly [boolean, (next: boolean) => void] {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen);
  const value = open ?? uncontrolled;
  const set = (next: boolean) => {
    if (open === undefined) setUncontrolled(next);
    onOpenChange?.(next);
  };
  return [value, set] as const;
}
