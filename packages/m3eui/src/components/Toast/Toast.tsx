"use client";

import * as React from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import { useM3ERuntime, useM3EI18n } from "../../context/M3EContext.js";
import { M3EToastManagerContext } from "../../internal/toastManager.js";
import { CloseIcon, SpinnerIcon, StatusSeverityGlyph } from "../../internal/icons.js";
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
  | "error"
  | "loading";

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

export type UpdateM3EToastOptions = Partial<Omit<ShowM3EToastOptions, "id">>;

export type M3EToastPromiseResult<T = never> =
  | string
  | UpdateM3EToastOptions
  | ((value: T) => string | UpdateM3EToastOptions);

export interface PromiseM3EToastOptions<Value> {
  readonly loading: string | UpdateM3EToastOptions;
  readonly success: M3EToastPromiseResult<Value>;
  readonly error: M3EToastPromiseResult<unknown>;
}

function toBaseToastUpdate(
  input: string | UpdateM3EToastOptions,
  defaults?: {
    readonly type?: M3EToastType;
    readonly timeout?: number;
    readonly showClose?: boolean;
    readonly priority?: "low" | "high";
  },
) {
  const opts: UpdateM3EToastOptions =
    typeof input === "string" ? { title: input } : input;
  const resolvedType = opts.type ?? defaults?.type;
  const resolvedShowClose = opts.showClose ?? defaults?.showClose;
  const resolvedTimeout =
    opts.timeout ?? (opts.actionLabel ? 10000 : defaults?.timeout);
  const resolvedPriority =
    resolvedType === "error" ? "high" : defaults?.priority;

  const hasData =
    opts.actionLabel !== undefined ||
    opts.onAction !== undefined ||
    resolvedShowClose !== undefined;

  return {
    ...(opts.title !== undefined ? { title: opts.title } : undefined),
    ...(opts.description !== undefined
      ? { description: opts.description }
      : undefined),
    ...(resolvedType !== undefined ? { type: resolvedType } : undefined),
    ...(resolvedTimeout !== undefined ? { timeout: resolvedTimeout } : undefined),
    ...(resolvedPriority !== undefined ? { priority: resolvedPriority } : undefined),
    ...(hasData
      ? {
          data: {
            ...(opts.actionLabel !== undefined
              ? { actionLabel: opts.actionLabel }
              : undefined),
            ...(opts.onAction !== undefined ? { onAction: opts.onAction } : undefined),
            ...(resolvedShowClose !== undefined
              ? { showClose: resolvedShowClose }
              : undefined),
          },
        }
      : undefined),
  };
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
            >
              <BaseToast.Content className="m3e-snackbar__content">
                {toast.type === "loading" ? (
                  <span className="m3e-snackbar__icon" aria-hidden="true">
                    <SpinnerIcon size={18} className="m3e-snackbar__spinner" />
                  </span>
                ) : toast.type === "info" ||
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
  readonly update: (id: string, options: UpdateM3EToastOptions) => void;
  readonly promise: <Value>(
    promiseValue: Promise<Value>,
    options: PromiseM3EToastOptions<Value>,
  ) => Promise<Value>;
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
      update: (id, options) => {
        if (!manager) return;
        manager.update(id, toBaseToastUpdate(options));
      },
      promise: <Value,>(
        promiseValue: Promise<Value>,
        options: PromiseM3EToastOptions<Value>,
      ): Promise<Value> => {
        if (!manager) return promiseValue;
        const mapResult = <T,>(
          resolver: M3EToastPromiseResult<T>,
          defaults: {
            readonly type: M3EToastType;
            readonly timeout: number;
            readonly showClose: boolean;
            readonly priority?: "low" | "high";
          },
        ) =>
          typeof resolver === "function"
            ? (val: T) => toBaseToastUpdate(resolver(val), defaults)
            : toBaseToastUpdate(resolver, defaults);

        return manager.promise(promiseValue, {
          loading: toBaseToastUpdate(options.loading, {
            type: "loading",
            timeout: 0,
            showClose: false,
            priority: "low",
          }),
          success: mapResult(options.success, {
            type: "success",
            timeout: 4000,
            showClose: true,
            priority: "low",
          }),
          error: mapResult(options.error, {
            type: "error",
            timeout: 5000,
            showClose: true,
            priority: "high",
          }),
        });
      },
      close: (id) => manager?.close(id),
    }),
    [manager],
  );
}
