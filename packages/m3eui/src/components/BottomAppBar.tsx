"use client";

import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import { BOTTOM_APP_BAR_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EContext.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";
import { inertProp } from "../internal/inert.js";
import { FabElevationContext } from "./FAB.js";
import { AppBarRow, type AppBarActionItem } from "./TopAppBar.js";

export type BottomAppBarScrollBehavior = "pinned" | "exit-always";

export interface M3EBottomAppBarProps {
  readonly actions?: React.ReactNode;
  readonly actionItems?: readonly AppBarActionItem[];
  readonly maxVisibleActions?: number;
  readonly fab?: React.ReactNode;
  readonly scrollBehavior?: BottomAppBarScrollBehavior;
  readonly scrollTargetRef?: React.RefObject<HTMLElement | Window | null>;
  readonly hidden?: boolean;
  readonly elevated?: boolean;
  readonly "aria-label"?: string;
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const BottomAppBar = React.forwardRef<
  HTMLDivElement,
  M3EBottomAppBarProps
>(function BottomAppBar(
  {
    actions,
    actionItems,
    maxVisibleActions = 4,
    fab,
    scrollBehavior = "pinned",
    scrollTargetRef,
    hidden: controlledHidden,
    elevated = false,
    "aria-label": ariaLabel,
    children,
    className,
    style,
  },
  ref,
): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedAriaLabel = ariaLabel ?? t("bottomAppBar.ariaLabel");
  const [scrollHidden, setScrollHidden] = React.useState(false);

  React.useEffect(() => {
    if (scrollBehavior !== "exit-always" || typeof window === "undefined") {
      setScrollHidden(false);
      return undefined;
    }
    const target: HTMLElement | Window = scrollTargetRef?.current ?? window;
    const readY = () =>
      target === window ? window.scrollY : (target as HTMLElement).scrollTop;

    let lastY = Math.max(0, readY());
    const onScroll = () => {
      const y = Math.max(0, readY());
      const dy = y - lastY;
      lastY = y;
      if (y <= 8) {
        setScrollHidden(false);
      } else if (dy > 6) {
        setScrollHidden(true);
      } else if (dy < -6) {
        setScrollHidden(false);
      }
    };
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => target.removeEventListener("scroll", onScroll);
  }, [scrollBehavior, scrollTargetRef]);

  const isHidden = controlledHidden ?? scrollHidden;
  const hideProgress = useM3EScalarSpring(isHidden ? 1 : 0, "defaultSpatial");

  const leadingContent =
    actionItems && actionItems.length > 0 ? (
      <AppBarRow
        items={actionItems}
        maxVisibleItems={maxVisibleActions}
        aria-label={t("topAppBar.actionsLabel")}
        className="m3e-bottom-app-bar__actions"
      />
    ) : actions ? (
      <Toolbar.Root
        aria-label={t("topAppBar.actionsLabel")}
        className="m3e-bottom-app-bar__actions"
      >
        {actions}
      </Toolbar.Root>
    ) : children ? (
      <div className="m3e-bottom-app-bar__content">{children}</div>
    ) : (
      <div className="m3e-bottom-app-bar__spacer" />
    );

  return (
    <div
      ref={ref}
      role="region"
      aria-label={resolvedAriaLabel}
      aria-hidden={isHidden ? true : undefined}
      inert={inertProp(isHidden)}
      data-elevated={elevated ? "" : undefined}
      data-hidden={isHidden ? "" : undefined}
      className={
        className ? `m3e-bottom-app-bar ${className}` : "m3e-bottom-app-bar"
      }
      style={{
        minHeight: `${BOTTOM_APP_BAR_TOKENS.height}px`,
        paddingInline: `${BOTTOM_APP_BAR_TOKENS.paddingInline}px`,
        paddingBlock: `${BOTTOM_APP_BAR_TOKENS.paddingBlock}px`,
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
      {leadingContent}
      {fab ? (
        <div className="m3e-bottom-app-bar__fab">
          <FabElevationContext.Provider value="none">
            {fab}
          </FabElevationContext.Provider>
        </div>
      ) : null}
    </div>
  );
});
