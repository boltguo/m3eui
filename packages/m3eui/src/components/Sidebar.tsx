import * as React from "react";
import { useM3ERuntime } from "../context/M3EContext.js";
import { SIDEBAR_TOKENS } from "../tokens/topology.js";
import {
  type NavigationDestination,
  NavList,
  NavModal,
} from "../internal/navList.js";

export interface M3ESidebarProps<Value extends string = string> {
  readonly items: readonly NavigationDestination<Value>[];
  readonly value: Value | null;
  readonly onValueChange: (value: Value) => void;
  readonly header?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly open?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

const SIDEBAR_LIST_METRICS = {
  itemHeight: SIDEBAR_TOKENS.itemHeight,
  itemRadius: SIDEBAR_TOKENS.itemRadius,
  itemPressedRadius: SIDEBAR_TOKENS.itemPressedRadius,
} as const;

const WIDE_QUERY = `(min-width: ${SIDEBAR_TOKENS.wideMinWidth}px)`;

function subscribeWide(onChange: () => void): () => void {
  if (typeof window.matchMedia !== "function") return () => {};
  const mq = window.matchMedia(WIDE_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function getWide(): boolean {
  return typeof window.matchMedia !== "function" || window.matchMedia(WIDE_QUERY).matches;
}

export function Sidebar<Value extends string = string>({
  items,
  value,
  onValueChange,
  header,
  footer,
  open = false,
  onOpenChange,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ESidebarProps<Value>): React.JSX.Element {
  const { t } = useM3ERuntime();
  const label = ariaLabel ?? t("navigation.sidebarLabel");
  const wide = React.useSyncExternalStore(subscribeWide, getWide, () => true);

  const body = (onSelect: (v: Value) => void) => (
    <>
      {header ? <div className="m3e-sidebar__header">{header}</div> : null}
      <NavList
        items={items}
        value={value}
        metrics={SIDEBAR_LIST_METRICS}
        onSelect={onSelect}
      />
      {footer ? <div className="m3e-sidebar__footer">{footer}</div> : null}
    </>
  );

  const vars = {
    "--m3e-sidebar-width": `${SIDEBAR_TOKENS.width}px`,
    "--m3e-sidebar-pad": `${SIDEBAR_TOKENS.padding}px`,
  } as React.CSSProperties;

  return (
    <>
      <nav
        aria-label={label}
        className={className ? `m3e-sidebar ${className}` : "m3e-sidebar"}
        style={{ ...vars, ...style }}
      >
        {body(onValueChange)}
      </nav>
      {wide ? null : (
        <NavModal
          open={open}
          onOpenChange={(next) => onOpenChange?.(next)}
          aria-label={label}
          cornerRadius={SIDEBAR_TOKENS.modalCornerRadius}
          maxWidth={SIDEBAR_TOKENS.modalMaxWidth}
          className="m3e-sidebar m3e-sidebar--modal"
          style={vars}
        >
          {body((v) => {
            onValueChange(v);
            onOpenChange?.(false);
          })}
        </NavModal>
      )}
    </>
  );
}
