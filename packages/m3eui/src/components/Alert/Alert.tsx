"use client";

import * as React from "react";
import { useM3EI18n } from "../../context/M3EContext.js";
import { IconButton } from "../IconButton/IconButton.js";
import { CloseIcon, StatusSeverityGlyph } from "../../internal/icons.js";

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
            {icon ?? <StatusSeverityGlyph severity={severity} />}
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
            icon={<CloseIcon size={16} strokeWidth={2.2} />}
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
