"use client";

import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { DIALOG_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EContext.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";

export interface M3EDialogProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly trigger?: React.ReactElement;
  readonly icon?: React.ReactNode;
  readonly title: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly showCloseButton?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3EDialogCloseProps {
  readonly render?: React.ReactElement;
  readonly children?: React.ReactNode;
  readonly className?: string;
}

export function DialogClose({
  render,
  children,
  className,
}: M3EDialogCloseProps): React.JSX.Element {
  return (
    <BaseDialog.Close render={render} className={className}>
      {children}
    </BaseDialog.Close>
  );
}

export function AlertDialogClose({
  render,
  children,
  className,
}: M3EDialogCloseProps): React.JSX.Element {
  return (
    <BaseAlertDialog.Close render={render} className={className}>
      {children}
    </BaseAlertDialog.Close>
  );
}

export function Dialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  icon,
  title,
  description,
  children,
  actions,
  showCloseButton = false,
  className,
  style,
}: M3EDialogProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {trigger ? <BaseDialog.Trigger render={trigger} /> : null}
      <BaseDialog.Portal container={portalContainer}>
        <BaseDialog.Backdrop className="m3e-dialog__backdrop" />
        <BaseDialog.Viewport className="m3e-dialog__viewport">
          <BaseDialog.Popup
            className={
              className ? `m3e-dialog__popup ${className}` : "m3e-dialog__popup"
            }
            data-has-icon={icon ? "" : undefined}
            style={{
              borderRadius: `${DIALOG_TOKENS.containerRadius}px`,
              padding: `${DIALOG_TOKENS.padding}px`,
              minWidth: `${DIALOG_TOKENS.minWidth}px`,
              maxWidth: `${DIALOG_TOKENS.maxWidth}px`,
              ...style,
            }}
          >
            {showCloseButton ? (
              <BaseDialog.Close
                aria-label={t("dialog.close")}
                className="m3e-dialog__close-btn"
              >
                <svg
                  width={18}
                  height={18}
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
              </BaseDialog.Close>
            ) : null}
            <div
              className="m3e-dialog__header"
              data-has-close={showCloseButton ? "" : undefined}
            >
              {icon ? (
                <div className="m3e-dialog__icon" aria-hidden="true">
                  {icon}
                </div>
              ) : null}
              <BaseDialog.Title
                className="m3e-dialog__title"
                data-has-close={showCloseButton ? "" : undefined}
              >
                {title}
              </BaseDialog.Title>
            </div>
            {description ? (
              <BaseDialog.Description className="m3e-dialog__description">
                {description}
              </BaseDialog.Description>
            ) : null}
            {children ? (
              <div className="m3e-dialog__body">{children}</div>
            ) : null}
            {actions ? (
              <div
                className="m3e-dialog__actions"
                style={{ gap: `${DIALOG_TOKENS.actionGap}px` }}
              >
                {actions}
              </div>
            ) : null}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export function AlertDialog({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  icon,
  title,
  description,
  children,
  actions,
  showCloseButton = false,
  className,
  style,
}: M3EDialogProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  return (
    <BaseAlertDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {trigger ? <BaseAlertDialog.Trigger render={trigger} /> : null}
      <BaseAlertDialog.Portal container={portalContainer}>
        <BaseAlertDialog.Backdrop className="m3e-dialog__backdrop" />
        <BaseAlertDialog.Viewport className="m3e-dialog__viewport">
          <BaseAlertDialog.Popup
            className={
              className
                ? `m3e-dialog__popup m3e-alert-dialog__popup ${className}`
                : "m3e-dialog__popup m3e-alert-dialog__popup"
            }
            data-has-icon={icon ? "" : undefined}
            style={{
              borderRadius: `${DIALOG_TOKENS.containerRadius}px`,
              padding: `${DIALOG_TOKENS.padding}px`,
              minWidth: `${DIALOG_TOKENS.minWidth}px`,
              maxWidth: `${DIALOG_TOKENS.maxWidth}px`,
              ...style,
            }}
          >
            {showCloseButton ? (
              <BaseAlertDialog.Close
                aria-label={t("dialog.close")}
                className="m3e-dialog__close-btn"
              >
                <svg
                  width={18}
                  height={18}
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
              </BaseAlertDialog.Close>
            ) : null}
            <div
              className="m3e-dialog__header"
              data-has-close={showCloseButton ? "" : undefined}
            >
              {icon ? (
                <div className="m3e-dialog__icon m3e-dialog__icon--alert" aria-hidden="true">
                  {icon}
                </div>
              ) : null}
              <BaseAlertDialog.Title
                className="m3e-dialog__title"
                data-has-close={showCloseButton ? "" : undefined}
              >
                {title}
              </BaseAlertDialog.Title>
            </div>
            {description ? (
              <BaseAlertDialog.Description className="m3e-dialog__description">
                {description}
              </BaseAlertDialog.Description>
            ) : null}
            {children ? (
              <div className="m3e-dialog__body">{children}</div>
            ) : null}
            {actions ? (
              <div
                className="m3e-dialog__actions"
                style={{ gap: `${DIALOG_TOKENS.actionGap}px` }}
              >
                {actions}
              </div>
            ) : null}
          </BaseAlertDialog.Popup>
        </BaseAlertDialog.Viewport>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  );
}
