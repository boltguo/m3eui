"use client";

import * as React from "react";
import { BADGE_TOKENS } from "../../tokens/topology.js";
import { useM3EI18n } from "../../context/M3EContext.js";
import { formatLocalizedInteger } from "../../i18n/index.js";

export interface M3EBadgeProps {
  readonly children?: React.ReactNode;
  readonly count?: number;
  readonly max?: number;
  readonly dot?: boolean;
  readonly hidden?: boolean;
  readonly color?: "error" | "primary" | "secondary";
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Badge({
  children,
  count,
  max = 99,
  dot = false,
  hidden = false,
  color = "error",
  "aria-label": ariaLabel,
  className,
  style,
}: M3EBadgeProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const show = !hidden && (dot || (count !== undefined && count > 0));
  const text =
    !dot && count !== undefined
      ? count > max
        ? t("badge.overflow", { max: formatLocalizedInteger(locale, max) })
        : formatLocalizedInteger(locale, count)
      : null;

  const resolvedAriaLabel =
    ariaLabel ??
    (!dot && text ? t("badge.unreadCount", { count: text }) : undefined);
  const standalone = !children;
  const baseBadgeClass = dot
    ? "m3e-badge m3e-badge--dot"
    : "m3e-badge m3e-badge--pill";

  const indicator = show ? (
    <span
      role={resolvedAriaLabel ? "status" : undefined}
      aria-live={resolvedAriaLabel ? "off" : undefined}
      aria-label={resolvedAriaLabel}
      className={
        standalone && className
          ? `${baseBadgeClass} ${className}`
          : baseBadgeClass
      }
      data-color={color}
      data-anchored={children ? "" : undefined}
      style={
        dot
          ? {
              width: `${BADGE_TOKENS.dotSize}px`,
              height: `${BADGE_TOKENS.dotSize}px`,
              ...(standalone ? style : undefined),
            }
          : {
              minWidth: `${BADGE_TOKENS.pillMinWidth}px`,
              height: `${BADGE_TOKENS.pillHeight}px`,
              paddingInline: `${BADGE_TOKENS.pillPaddingInline}px`,
              ...(standalone ? style : undefined),
            }
      }
    >
      {text}
    </span>
  ) : null;

  if (standalone) {
    return indicator ?? <></>;
  }

  return (
    <span
      className={
        className ? `m3e-badge-anchor ${className}` : "m3e-badge-anchor"
      }
      style={style}
    >
      {children}
      {indicator}
    </span>
  );
}
