"use client";

import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import {
  SHEET_TOKENS,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import { CloseIcon } from "../../internal/icons.js";
import { useM3ERipple } from "../../internal/ripple.js";

function SheetHeaderCloseButton({
  ariaLabel,
}: {
  readonly ariaLabel: string;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple();
  return (
    <BaseDrawer.Close
      aria-label={ariaLabel}
      className="m3e-sheet__close-btn"
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <CloseIcon strokeWidth={2.2} />
    </BaseDrawer.Close>
  );
}

export type SheetSide = "bottom" | "start" | "end" | "right" | "left";
export type SheetSnapPoint = number | string;

export interface M3ESheetProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly modal?: boolean | "trap-focus";
  readonly disablePointerDismissal?: boolean;
  readonly snapPoints?: readonly SheetSnapPoint[];
  readonly snapPoint?: SheetSnapPoint | null;
  readonly defaultSnapPoint?: SheetSnapPoint | null;
  readonly onSnapPointChange?: (snapPoint: SheetSnapPoint | null) => void;
  readonly snapToSequentialPoints?: boolean;
  readonly side?: SheetSide;
  readonly trigger?: React.ReactElement;
  readonly title?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly "aria-label"?: string;
  readonly children: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ESheetCloseProps {
  readonly render?: React.ReactElement;
  readonly children?: React.ReactNode;
  readonly className?: string;
}

export const SheetClose = React.forwardRef<HTMLButtonElement, M3ESheetCloseProps>(
  function SheetClose({ render, children, className }, ref): React.JSX.Element {
    return (
      <BaseDrawer.Close ref={ref} render={render} className={className}>
        {children}
      </BaseDrawer.Close>
    );
  },
);

export const Sheet = React.forwardRef<HTMLDivElement, M3ESheetProps>(function Sheet(
  {
    open,
    defaultOpen,
    onOpenChange,
    modal = true,
    disablePointerDismissal,
    snapPoints,
    snapPoint,
    defaultSnapPoint,
    onSnapPointChange,
    snapToSequentialPoints,
    side = "bottom",
    trigger,
    title,
    description,
    "aria-label": ariaLabel,
    children,
    footer,
    className,
    style,
  },
  ref,
): React.JSX.Element {
  const { direction, t } = useM3ERuntime();
  const portalContainer = useM3EPortalContainer();
  const physicalSide: "bottom" | "right" | "left" =
    side === "bottom"
      ? "bottom"
      : side === "start"
        ? direction === "rtl"
          ? "right"
          : "left"
        : side === "end"
          ? direction === "rtl"
            ? "left"
            : "right"
          : side;
  const swipeDirection =
    physicalSide === "bottom"
      ? "down"
      : physicalSide === "right"
        ? "right"
        : "left";

  const isNonModal = modal === false;

  const resolvedSnapPoints = React.useMemo(
    () => (snapPoints ? [...snapPoints] : undefined),
    [snapPoints],
  );

  return (
    <BaseDrawer.Root
      open={open}
      defaultOpen={defaultOpen}
      modal={modal}
      disablePointerDismissal={
        disablePointerDismissal ?? (isNonModal ? true : undefined)
      }
      snapPoints={resolvedSnapPoints}
      snapPoint={snapPoint}
      defaultSnapPoint={defaultSnapPoint}
      onSnapPointChange={
        onSnapPointChange ? (next) => onSnapPointChange(next) : undefined
      }
      snapToSequentialPoints={snapToSequentialPoints}
      swipeDirection={swipeDirection}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {trigger ? <BaseDrawer.Trigger render={trigger} /> : null}
      <BaseDrawer.Portal container={portalContainer}>
        {!isNonModal ? (
          <BaseDrawer.Backdrop className="m3e-sheet__backdrop" />
        ) : null}
        <BaseDrawer.Viewport
          className="m3e-sheet__viewport"
          data-side={physicalSide}
          data-non-modal={isNonModal ? "" : undefined}
        >
          <BaseDrawer.Popup
            ref={ref}
            aria-label={ariaLabel ?? (!title ? t("sheet.ariaLabel") : undefined)}
            className={
              className ? `m3e-sheet__popup ${className}` : "m3e-sheet__popup"
            }
            data-side={physicalSide}
            data-non-modal={isNonModal ? "" : undefined}
            style={
              {
                "--m3e-sheet-pad": `${SHEET_TOKENS.padding}px`,
                ...style,
              } as React.CSSProperties
            }
          >
            {physicalSide === "bottom" ? (
              <div className="m3e-sheet__handle-wrap" aria-hidden="true">
                <span className="m3e-sheet__drag-handle" />
              </div>
            ) : null}

            {physicalSide !== "bottom" || Boolean(title) || Boolean(description) ? (
              <div className="m3e-sheet__header">
                <div className="m3e-sheet__titles">
                  {title ? (
                    <BaseDrawer.Title className="m3e-sheet__title">
                      {title}
                    </BaseDrawer.Title>
                  ) : null}
                  {description ? (
                    <BaseDrawer.Description className="m3e-sheet__description">
                      {description}
                    </BaseDrawer.Description>
                  ) : null}
                </div>
                <SheetHeaderCloseButton ariaLabel={t("sheet.close")} />
              </div>
            ) : null}

            <BaseDrawer.Content className="m3e-sheet__content">
              {children}
            </BaseDrawer.Content>

            {footer ? <div className="m3e-sheet__footer">{footer}</div> : null}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
});
