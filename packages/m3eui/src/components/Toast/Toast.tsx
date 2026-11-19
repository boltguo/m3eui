import * as React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import {
  SNACKBAR_TOKENS,
} from "../../tokens/topology.js";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import { useM3ERuntime, useM3EI18n } from "../../context/M3EContext.js";
import { M3EToastManagerContext } from "../../internal/toastManager.js";
import { CloseIcon, StatusSeverityGlyph } from "../../internal/icons.js";
import { useM3ERipple } from "../../internal/ripple.js";

function SnackbarActionButton({
  label,
  onClick,
}: {
  readonly label: string;
  readonly onClick: () => void;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple();
  return (
    <BaseToast.Action
      className="m3e-snackbar__action"
      onClick={onClick}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {label}
    </BaseToast.Action>
  );
}

function SnackbarCloseButton({
  ariaLabel,
}: {
  readonly ariaLabel: string;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple();
  return (
    <BaseToast.Close
      aria-label={ariaLabel}
      className="m3e-snackbar__close"
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <CloseIcon size={16} strokeWidth={2.2} />
    </BaseToast.Close>
  );
}

export type M3EToastType =
  | "default"
  | "info"
  | "success"
  | "warning"
  | "error";

export interface M3EToastData {
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly showClose?: boolean;
}

export interface ShowM3EToastOptions {
  readonly id?: string;
  readonly title: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly showClose?: boolean;
  readonly timeout?: number;
  readonly type?: M3EToastType;
}

export function M3EToastViewportHost(): React.JSX.Element {
  const { direction } = useM3ERuntime();
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const { toasts, close } = BaseToast.useToastManager<M3EToastData>();
  const swipeDirection: ("down" | "left" | "right")[] =
    direction === "rtl" ? ["down", "left"] : ["down", "right"];

  return (
    <BaseToast.Portal container={portalContainer}>
      <BaseToast.Viewport
        aria-label={t("toast.viewportLabel")}
        className="m3e-toast__viewport"
        style={{ gap: `${SNACKBAR_TOKENS.viewportGap}px` }}
      >
        {toasts.map((toast) => {
          const data = toast.data;
          return (
            <BaseToast.Root
              key={toast.id}
              toast={toast}
              swipeDirection={swipeDirection}
              className="m3e-snackbar"
              data-type={toast.type ?? "default"}
              style={{
                borderRadius: `${SNACKBAR_TOKENS.containerRadius}px`,
                minHeight: `${SNACKBAR_TOKENS.minHeight}px`,
                maxWidth: `${SNACKBAR_TOKENS.maxWidth}px`,
                paddingBlock: `${SNACKBAR_TOKENS.paddingBlock}px`,
                paddingInline: `${SNACKBAR_TOKENS.paddingInline}px`,
              }}
            >
              <BaseToast.Content className="m3e-snackbar__content">
                {toast.type === "info" ||
                toast.type === "success" ||
                toast.type === "warning" ||
                toast.type === "error" ? (
                  <span className="m3e-snackbar__icon" aria-hidden="true">
                    <StatusSeverityGlyph severity={toast.type} size={18} />
                  </span>
                ) : null}
                <div className="m3e-snackbar__text">
                  {toast.title ? (
                    <BaseToast.Title className="m3e-snackbar__title">
                      {toast.title}
                    </BaseToast.Title>
                  ) : null}
                  {toast.description ? (
                    <BaseToast.Description className="m3e-snackbar__description">
                      {toast.description}
                    </BaseToast.Description>
                  ) : null}
                </div>
                <div className="m3e-snackbar__actions">
                  {data?.actionLabel ? (
                    <SnackbarActionButton
                      label={data.actionLabel}
                      onClick={() => {
                        data.onAction?.();
                        close(toast.id);
                      }}
                    />
                  ) : null}
                  {data?.showClose !== false ? (
                    <SnackbarCloseButton ariaLabel={t("toast.close")} />
                  ) : null}
                </div>
              </BaseToast.Content>
            </BaseToast.Root>
          );
        })}
      </BaseToast.Viewport>
    </BaseToast.Portal>
  );
}

export function useM3EToast(): {
  readonly toast: (options: ShowM3EToastOptions) => string;
  readonly close: (id?: string) => void;
} {
  const manager = React.useContext(M3EToastManagerContext);

  return React.useMemo(
    () => ({
      toast: (options) => {
        if (!manager) return "";
        const type: M3EToastType = options.type ?? "default";
        return manager.add({
          id: options.id,
          title: options.title,
          description: options.description,
          priority: type === "error" ? "high" : "low",
          timeout: options.timeout ?? (options.actionLabel ? 10000 : 4000),
          type,
          data: {
            actionLabel: options.actionLabel,
            onAction: options.onAction,
            showClose: options.showClose ?? true,
          },
        });
      },
      close: (id) => manager?.close(id),
    }),
    [manager],
  );
}
