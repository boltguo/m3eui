"use client";

import * as React from "react";
import { useM3EI18n } from "../context/M3EContext.js";
import { IconButton } from "./IconButton.js";

export type AlertSeverity = "info" | "success" | "warning" | "error";
export type AlertVariant = "tonal" | "outlined" | "filled";

export interface M3EAlertProps {
  readonly severity?: AlertSeverity;
  readonly variant?: AlertVariant;
  readonly title?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly icon?: React.ReactNode | false;
  readonly action?: React.ReactNode;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly closable?: boolean;
  readonly onClose?: () => void;
  readonly role?: "alert" | "status" | "region";
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function DefaultAlertGlyph({ severity }: { readonly severity: AlertSeverity }) {
  if (severity === "success") {
    return (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="8.5 12.5 11 15 16 9.5" />
      </svg>
    );
  }
  if (severity === "warning") {
    return (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  if (severity === "error") {
    return (
      <svg
        width={20}
        height={20}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  return (
    <svg
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function CloseAlertSvg() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export const Alert = React.forwardRef<HTMLDivElement, M3EAlertProps>(
  function Alert(
    {
      severity = "info",
      variant = "tonal",
      title,
      children,
      icon,
      action,
      open: controlledOpen,
      defaultOpen = true,
      onOpenChange,
      closable = false,
      onClose,
      role,
      className,
      style,
    },
    ref,
  ) {
    const { t } = useM3EI18n();
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(defaultOpen);
    const isOpen =
      controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;

    if (!isOpen) {
      return null;
    }

    const resolvedRole =
      role ??
      (severity === "error" || severity === "warning" ? "alert" : "status");

    return (
      <div
        ref={ref}
        role={resolvedRole}
        className={className ? `m3e-alert ${className}` : "m3e-alert"}
        data-severity={severity}
        data-variant={variant}
        style={style}
      >
        {icon !== false ? (
          <span className="m3e-alert__icon" aria-hidden="true">
            {icon ?? <DefaultAlertGlyph severity={severity} />}
          </span>
        ) : null}

        <div className="m3e-alert__body">
          {title ? <div className="m3e-alert__title">{title}</div> : null}
          {children ? (
            <div className="m3e-alert__description">{children}</div>
          ) : null}
        </div>

        {action ? <div className="m3e-alert__action">{action}</div> : null}

        {closable ? (
          <IconButton
            size="xs"
            variant="standard"
            aria-label={t("alert.close")}
            className="m3e-alert__close"
            icon={<CloseAlertSvg />}
            onClick={() => {
              if (controlledOpen === undefined) {
                setUncontrolledOpen(false);
              }
              onOpenChange?.(false);
              onClose?.();
            }}
          />
        ) : null}
      </div>
    );
  },
);
