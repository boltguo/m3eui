import * as React from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { TABS_TOKENS } from "../tokens/index.js";

export type TabsVariant = "primary" | "secondary";

const TabsVariantContext = React.createContext<TabsVariant>("primary");

export interface M3ETabsProps<Value extends string | number = string> {
  readonly children: React.ReactNode;
  readonly value?: Value;
  readonly defaultValue?: Value;
  readonly onValueChange?: (value: Value) => void;
  readonly variant?: TabsVariant;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ETabsListProps {
  readonly children: React.ReactNode;
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

export function Tabs<Value extends string | number = string>({
  children,
  value,
  defaultValue,
  onValueChange,
  variant = "primary",
  className,
  style,
}: M3ETabsProps<Value>): React.JSX.Element {
  return (
    <TabsVariantContext.Provider value={variant}>
      <BaseTabs.Root
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
    </TabsVariantContext.Provider>
  );
}

export function TabsList({
  children,
  activateOnFocus = true,
  loopFocus = true,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ETabsListProps): React.JSX.Element {
  const variant = React.useContext(TabsVariantContext);
  return (
    <BaseTabs.List
      activateOnFocus={activateOnFocus}
      loopFocus={loopFocus}
      aria-label={ariaLabel}
      className={className ? `m3e-tabs__list ${className}` : "m3e-tabs__list"}
      data-variant={variant}
      style={style}
    >
      {children}
      <BaseTabs.Indicator
        className="m3e-tabs__indicator"
        data-variant={variant}
      />
    </BaseTabs.List>
  );
}

export function Tab<Value extends string | number = string>({
  value,
  children,
  icon,
  badge,
  disabled = false,
  className,
  style,
}: M3ETabProps<Value>): React.JSX.Element {
  const variant = React.useContext(TabsVariantContext);
  const minHeight =
    variant === "primary" && icon
      ? TABS_TOKENS.primaryWithIconHeight
      : variant === "primary"
        ? TABS_TOKENS.primaryHeight
        : TABS_TOKENS.secondaryHeight;

  return (
    <BaseTabs.Tab
      value={value}
      disabled={disabled}
      className={className ? `m3e-tabs__tab ${className}` : "m3e-tabs__tab"}
      data-variant={variant}
      data-has-icon={icon ? "" : undefined}
      style={{
        minHeight: `${minHeight}px`,
        paddingInline: `${TABS_TOKENS.horizontalPadding}px`,
        ...style,
      }}
    >
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
    </BaseTabs.Tab>
  );
}

export function TabsPanel<Value extends string | number = string>({
  value,
  children,
  keepMounted = false,
  className,
  style,
}: M3ETabsPanelProps<Value>): React.JSX.Element {
  return (
    <BaseTabs.Panel
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
