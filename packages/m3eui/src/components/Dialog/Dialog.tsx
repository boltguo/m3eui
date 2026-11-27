"use client";

import * as React from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useM3EI18n } from "../../context/M3EContext.js";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import { CloseIcon } from "../../internal/icons.js";
import { useM3ERipple } from "../../internal/ripple.js";

function DialogCloseIconButton({
  CloseComponent,
  ariaLabel,
}: {
  readonly CloseComponent: React.ElementType;
  readonly ariaLabel: string;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple();
  return (
    <CloseComponent
      aria-label={ariaLabel}
      className="m3e-dialog__close-btn"
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <CloseIcon strokeWidth={2.2} />
    </CloseComponent>
  );
}

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
  readonly fullScreen?: boolean | "mobile";
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3EDialogCloseProps {
  readonly render?: React.ReactElement;
  readonly children?: React.ReactNode;
  readonly className?: string;
}

export const DialogClose = React.forwardRef<HTMLButtonElement, M3EDialogCloseProps>(
  function DialogClose({ render, children, className }, ref): React.JSX.Element {
    return (
      <BaseDialog.Close ref={ref} render={render} className={className}>
        {children}
      </BaseDialog.Close>
    );
  },
);

export const AlertDialogClose = React.forwardRef<HTMLButtonElement, M3EDialogCloseProps>(
  function AlertDialogClose({ render, children, className }, ref): React.JSX.Element {
    return (
      <BaseAlertDialog.Close ref={ref} render={render} className={className}>
        {children}
      </BaseAlertDialog.Close>
    );
  },
);

export const Dialog = React.forwardRef<HTMLDivElement, M3EDialogProps>(function Dialog(
  {
    open,
    defaultOpen,
    onOpenChange,
    trigger,
    icon,
    title,
    description,
    children,
    actions,
    showCloseButton,
    fullScreen = false,
    className,
    style,
  },
  ref,
): React.JSX.Element {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const effectiveShowClose = showCloseButton ?? fullScreen === true;
  const fullScreenAttr =
    fullScreen === true
      ? "always"
      : fullScreen === "mobile"
        ? "mobile"
        : undefined;
  return (
    <BaseDialog.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {trigger ? <BaseDialog.Trigger render={trigger} /> : null}
      <BaseDialog.Portal container={portalContainer}>
        <BaseDialog.Backdrop className="m3e-dialog__backdrop" />
        <BaseDialog.Viewport
          className="m3e-dialog__viewport"
          data-fullscreen={fullScreenAttr}
        >
          <BaseDialog.Popup
            ref={ref}
            className={
              className ? `m3e-dialog__popup ${className}` : "m3e-dialog__popup"
            }
            data-fullscreen={fullScreenAttr}
            data-has-icon={icon ? "" : undefined}
            style={style}
          >
            {effectiveShowClose ? (
              <DialogCloseIconButton
                CloseComponent={BaseDialog.Close}
                ariaLabel={t("dialog.close")}
              />
            ) : null}
            <div
              className="m3e-dialog__header"
              data-has-close={effectiveShowClose ? "" : undefined}
            >
              {icon ? (
                <div className="m3e-dialog__icon" aria-hidden="true">
                  {icon}
                </div>
              ) : null}
              <BaseDialog.Title className="m3e-dialog__title">
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
              <div className="m3e-dialog__actions">{actions}</div>
            ) : null}
          </BaseDialog.Popup>
        </BaseDialog.Viewport>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
});

export const AlertDialog = React.forwardRef<HTMLDivElement, M3EDialogProps>(
  function AlertDialog(
    {
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
    },
    ref,
  ): React.JSX.Element {
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
              ref={ref}
              className={
                className
                  ? `m3e-dialog__popup m3e-alert-dialog__popup ${className}`
                  : "m3e-dialog__popup m3e-alert-dialog__popup"
              }
              data-has-icon={icon ? "" : undefined}
              style={style}
            >
              {showCloseButton ? (
                <DialogCloseIconButton
                  CloseComponent={BaseAlertDialog.Close}
                  ariaLabel={t("dialog.close")}
                />
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
                <BaseAlertDialog.Title className="m3e-dialog__title">
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
                <div className="m3e-dialog__actions">{actions}</div>
              ) : null}
            </BaseAlertDialog.Popup>
          </BaseAlertDialog.Viewport>
        </BaseAlertDialog.Portal>
      </BaseAlertDialog.Root>
    );
  },
);
