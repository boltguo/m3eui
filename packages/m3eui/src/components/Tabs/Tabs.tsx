"use client";

import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { mergeProps } from "@base-ui/react/merge-props";
import { usePressHoldState } from "../../hooks/useM3ESpring.js";
import { assignRef } from "../../internal/assignRef.js";
import { useIsoLayoutEffect } from "../../internal/useIsoLayoutEffect.js";
import { useM3ERipple } from "../../internal/ripple.js";

export type TabsVariant = "primary" | "secondary";

interface TabsContextValue {
  readonly variant: TabsVariant;
  readonly scrollable: boolean;
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: "primary",
  scrollable: false,
});

export interface M3ETabsProps<Value extends string | number = string> {
  readonly children: React.ReactNode;
  readonly value?: Value;
  readonly defaultValue?: Value;
  readonly onValueChange?: (value: Value) => void;
  readonly variant?: TabsVariant;
  readonly scrollable?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ETabsListProps {
  readonly children: React.ReactNode;
  readonly scrollable?: boolean;
  readonly activateOnFocus?: boolean;
  readonly loopFocus?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ETabProps<Value extends string | number = string> {
  readonly value: Value;
  readonly children: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly badge?: React.ReactNode;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ETabsPanelProps<Value extends string | number = string> {
  readonly value: Value;
  readonly children: React.ReactNode;
  readonly keepMounted?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function TabsInner<Value extends string | number = string>(
  {
    children,
    value,
    defaultValue,
    onValueChange,
    variant = "primary",
    scrollable = false,
    className,
    style,
  }: M3ETabsProps<Value>,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.JSX.Element {
  const ctxValue = React.useMemo(
    () => ({ variant, scrollable }),
    [variant, scrollable],
  );

  return (
    <TabsContext.Provider value={ctxValue}>
      <BaseTabs.Root
        ref={ref}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => {
          if (next !== null) {
            onValueChange?.(next as Value);
          }
        }}
        className={className ? `m3e-tabs ${className}` : "m3e-tabs"}
        data-variant={variant}
        style={style}
      >
        {children}
      </BaseTabs.Root>
    </TabsContext.Provider>
  );
}

export const Tabs = React.forwardRef(TabsInner) as <
  Value extends string | number = string,
>(
  props: M3ETabsProps<Value> & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element;

export const TabsList = React.forwardRef<HTMLDivElement, M3ETabsListProps>(
  function TabsList(
    {
      children,
      scrollable,
      activateOnFocus = true,
      loopFocus = true,
      "aria-label": ariaLabel,
      className,
      style,
    },
    ref,
  ): React.JSX.Element {
  const { variant, scrollable: contextScrollable } =
    React.useContext(TabsContext);
  const resolvedScrollable = scrollable ?? contextScrollable;
  const listRef = React.useRef<HTMLDivElement | null>(null);

  useIsoLayoutEffect(() => {
    const listEl = listRef.current;
    if (!listEl) return;
    let cancelled = false;

    const syncActiveTab = () => {
      if (cancelled) return;
      const activeTab = listEl.querySelector<HTMLElement>(
        '[role="tab"][aria-selected="true"]',
      );
      if (!activeTab) return;

      const contentEl =
        activeTab.querySelector<HTMLElement>(".m3e-tabs__content");
      const contentWidth = contentEl?.offsetWidth ?? 0;
      if (contentWidth > 0) {
        listEl.style.setProperty(
          "--m3e-tab-content-width",
          `${contentWidth}px`,
        );
      } else {
        listEl.style.removeProperty("--m3e-tab-content-width");
      }

      if (
        (resolvedScrollable || listEl.scrollWidth > listEl.clientWidth) &&
        listEl.scrollWidth > listEl.clientWidth &&
        listEl.clientWidth > 0
      ) {
        const listRect = listEl.getBoundingClientRect();
        const tabRect = activeTab.getBoundingClientRect();
        const pad = 16;
        if (tabRect.left < listRect.left + pad) {
          listEl.scrollLeft += tabRect.left - listRect.left - pad;
        } else if (tabRect.right > listRect.right - pad) {
          listEl.scrollLeft += tabRect.right - listRect.right + pad;
        }
      }
    };

    syncActiveTab();
    if (typeof document !== "undefined" && document.fonts?.ready) {
      void document.fonts.ready.then(() => {
        if (cancelled) return;
        syncActiveTab();
        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("resize"));
        }
      });
    }
    const mo =
      typeof MutationObserver !== "undefined"
        ? new MutationObserver(syncActiveTab)
        : null;
    mo?.observe(listEl, {
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-selected"],
    });
    const ro =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(syncActiveTab)
        : null;
    ro?.observe(listEl);

    return () => {
      cancelled = true;
      mo?.disconnect();
      ro?.disconnect();
    };
  }, [children, resolvedScrollable]);

  return (
    <BaseTabs.List
      ref={(node) => {
        listRef.current = node;
        assignRef(ref, node);
      }}
      activateOnFocus={activateOnFocus}
      loopFocus={loopFocus}
      aria-label={ariaLabel}
      className={className ? `m3e-tabs__list ${className}` : "m3e-tabs__list"}
      data-variant={variant}
      data-scrollable={resolvedScrollable ? "" : undefined}
      style={style}
    >
      {children}
      <BaseTabs.Indicator
        className="m3e-tabs__indicator"
        data-variant={variant}
      />
    </BaseTabs.List>
  );
});

function TabInner<Value extends string | number = string>(
  {
    value,
    children,
    icon,
    badge,
    disabled = false,
    className,
    style,
  }: M3ETabProps<Value>,
  ref: React.ForwardedRef<HTMLButtonElement>,
): React.JSX.Element {
  const { variant } = React.useContext(TabsContext);
  const { isPressed, pressHandlers } = usePressHoldState(disabled);
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  const mergedHandlers = mergeProps<"button">(
    pressHandlers as unknown as React.ComponentPropsWithRef<"button">,
    rippleHandlers as unknown as React.ComponentPropsWithRef<"button">,
  );

  return (
    <BaseTabs.Tab
      ref={ref}
      value={value}
      disabled={disabled}
      className={className ? `m3e-tabs__tab ${className}` : "m3e-tabs__tab"}
      data-variant={variant}
      data-has-icon={icon ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={style}
      {...mergedHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <span className="m3e-tabs__content">
        {icon ? (
          <span className="m3e-tabs__icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        <span className="m3e-tabs__label">
          <span>{children}</span>
          {badge !== undefined ? (
            <span className="m3e-tabs__badge">{badge}</span>
          ) : null}
        </span>
      </span>
    </BaseTabs.Tab>
  );
}

export const Tab = React.forwardRef(TabInner) as <
  Value extends string | number = string,
>(
  props: M3ETabProps<Value> & React.RefAttributes<HTMLButtonElement>,
) => React.JSX.Element;

function TabsPanelInner<Value extends string | number = string>(
  {
    value,
    children,
    keepMounted = false,
    className,
    style,
  }: M3ETabsPanelProps<Value>,
  ref: React.ForwardedRef<HTMLDivElement>,
): React.JSX.Element {
  return (
    <BaseTabs.Panel
      ref={ref}
      value={value}
      keepMounted={keepMounted}
      className="m3e-tabs__panel"
    >
      <div
        className={
          className
            ? `m3e-tabs__panel-content ${className}`
            : "m3e-tabs__panel-content"
        }
        style={style}
      >
        {children}
      </div>
    </BaseTabs.Panel>
  );
}

export const TabsPanel = React.forwardRef(TabsPanelInner) as <
  Value extends string | number = string,
>(
  props: M3ETabsPanelProps<Value> & React.RefAttributes<HTMLDivElement>,
) => React.JSX.Element;
