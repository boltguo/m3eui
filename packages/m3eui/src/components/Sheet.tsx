import * as React from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { SHEET_TOKENS } from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";

export type SheetSide = "bottom" | "start" | "end" | "right" | "left";

export interface M3ESheetProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly side?: SheetSide;
  readonly trigger?: React.ReactElement;
  readonly title: React.ReactNode;
  readonly description?: React.ReactNode;
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

function CloseIconSvg() {
  return (
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
  );
}

export function SheetClose({
  render,
  children,
  className,
}: M3ESheetCloseProps): React.JSX.Element {
  return (
    <BaseDrawer.Close render={render} className={className}>
      {children}
    </BaseDrawer.Close>
  );
}

export function Sheet({
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  trigger,
  title,
  description,
  children,
  footer,
  className,
  style,
}: M3ESheetProps): React.JSX.Element {
  const { direction, t } = useM3E();
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

  const radius = SHEET_TOKENS.cornerRadius;
  const borderRadius =
    physicalSide === "bottom"
      ? `${radius}px ${radius}px 0px 0px`
      : physicalSide === "right"
        ? `${radius}px 0px 0px ${radius}px`
        : `0px ${radius}px ${radius}px 0px`;

  return (
    <BaseDrawer.Root
      open={open}
      defaultOpen={defaultOpen}
      swipeDirection={swipeDirection}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      {trigger ? <BaseDrawer.Trigger render={trigger} /> : null}
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="m3e-sheet__backdrop" />
        <BaseDrawer.Viewport
          className="m3e-sheet__viewport"
          data-side={physicalSide}
        >
          <BaseDrawer.Popup
            className={
              className ? `m3e-sheet__popup ${className}` : "m3e-sheet__popup"
            }
            data-side={physicalSide}
            style={{
              borderRadius,
              padding: `${SHEET_TOKENS.padding}px`,
              ...(physicalSide === "bottom"
                ? { maxWidth: `${SHEET_TOKENS.bottomMaxWidth}px` }
                : { maxWidth: `${SHEET_TOKENS.sideWidth}px` }),
              ...style,
            }}
          >
            {physicalSide === "bottom" ? (
              <div className="m3e-sheet__handle-wrap" aria-hidden="true">
                <span
                  className="m3e-sheet__drag-handle"
                  style={{
                    width: `${SHEET_TOKENS.dragHandleWidth}px`,
                    height: `${SHEET_TOKENS.dragHandleHeight}px`,
                  }}
                />
              </div>
            ) : null}

            <div className="m3e-sheet__header">
              <div className="m3e-sheet__titles">
                <BaseDrawer.Title className="m3e-sheet__title">
                  {title}
                </BaseDrawer.Title>
                {description ? (
                  <BaseDrawer.Description className="m3e-sheet__description">
                    {description}
                  </BaseDrawer.Description>
                ) : null}
              </div>
              <BaseDrawer.Close
                aria-label={t("sheet.close")}
                className="m3e-sheet__close-btn"
              >
                <CloseIconSvg />
              </BaseDrawer.Close>
            </div>

            <BaseDrawer.Content className="m3e-sheet__content">
              {children}
            </BaseDrawer.Content>

            {footer ? <div className="m3e-sheet__footer">{footer}</div> : null}
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}

export function BottomSheet(
  props: Omit<M3ESheetProps, "side">,
): React.JSX.Element {
  return <Sheet {...props} side="bottom" />;
}

export function SideSheet(
  props: Omit<M3ESheetProps, "side"> & {
    readonly side?: "start" | "end" | "right" | "left";
  },
): React.JSX.Element {
  return <Sheet {...props} side={props.side ?? "end"} />;
}
