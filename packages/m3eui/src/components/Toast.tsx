import * as React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { SNACKBAR_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";

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
  readonly type?: "default" | "success" | "error";
}

function CloseGlyph() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function M3EToastViewportHost(): React.JSX.Element {
  const { t } = useM3EI18n();
  const { toasts, close } = BaseToast.useToastManager<M3EToastData>();

  return (
    <BaseToast.Portal>
      <BaseToast.Viewport
        className="m3e-toast__viewport"
        style={{ gap: `${SNACKBAR_TOKENS.viewportGap}px` }}
      >
        {toasts.map((toast) => {
          const data = toast.data;
          return (
            <BaseToast.Root
              key={toast.id}
              toast={toast}
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
                    <BaseToast.Action
                      className="m3e-snackbar__action"
                      onClick={() => {
                        data.onAction?.();
                        close(toast.id);
                      }}
                    >
                      {data.actionLabel}
                    </BaseToast.Action>
                  ) : null}
                  {data?.showClose !== false ? (
                    <BaseToast.Close
                      aria-label={t("toast.close")}
                      className="m3e-snackbar__close"
                    >
                      <CloseGlyph />
                    </BaseToast.Close>
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

export function useM3EToast() {
  const manager = BaseToast.useToastManager<M3EToastData>();

  const toast = React.useCallback(
    (options: ShowM3EToastOptions): string => {
      return manager.add({
        id: options.id,
        title: options.title,
        description: options.description,
        timeout: options.timeout ?? 4200,
        type: options.type ?? "default",
        data: {
          actionLabel: options.actionLabel,
          onAction: options.onAction,
          showClose: options.showClose ?? true,
        },
      });
    },
    [manager],
  );

  return {
    toast,
    close: manager.close,
    toasts: manager.toasts,
  };
}
