import * as React from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import { Separator as BaseSeparator } from "@base-ui/react/separator";
import {
  DIVIDER_TOKENS,
  PREVIEW_CARD_TOKENS,
  SCROLL_AREA_TOKENS,
} from "../tokens/index.js";

export interface M3EPreviewCardProps {
  readonly trigger: React.ReactElement;
  readonly children: React.ReactNode;
  readonly side?: "top" | "bottom" | "left" | "right";
  readonly align?: "start" | "center" | "end";
  readonly delay?: number;
  readonly closeDelay?: number;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function PreviewCard({
  trigger,
  children,
  side = "bottom",
  align = "start",
  delay = 280,
  closeDelay = 200,
  className,
  style,
}: M3EPreviewCardProps): React.JSX.Element {
  return (
    <BasePreviewCard.Root>
      <BasePreviewCard.Trigger
        delay={delay}
        closeDelay={closeDelay}
        render={trigger}
      />
      <BasePreviewCard.Portal>
        <BasePreviewCard.Positioner
          side={side}
          align={align}
          sideOffset={8}
          className="m3e-preview-card__positioner"
        >
          <BasePreviewCard.Popup
            className={
              className
                ? `m3e-preview-card ${className}`
                : "m3e-preview-card"
            }
            style={{
              borderRadius: `${PREVIEW_CARD_TOKENS.containerRadius}px`,
              padding: `${PREVIEW_CARD_TOKENS.padding}px`,
              maxWidth: `${PREVIEW_CARD_TOKENS.maxWidth}px`,
              ...style,
            }}
          >
            {children}
          </BasePreviewCard.Popup>
        </BasePreviewCard.Positioner>
      </BasePreviewCard.Portal>
    </BasePreviewCard.Root>
  );
}

export interface M3EDividerProps {
  readonly orientation?: "horizontal" | "vertical";
  readonly inset?: boolean;
  readonly label?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Divider({
  orientation = "horizontal",
  inset = false,
  label,
  className,
  style,
}: M3EDividerProps): React.JSX.Element {
  if (label && orientation === "horizontal") {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={
          className
            ? `m3e-divider m3e-divider--labeled ${className}`
            : "m3e-divider m3e-divider--labeled"
        }
        style={style}
      >
        <span className="m3e-divider__line" aria-hidden="true" />
        <span className="m3e-divider__label">{label}</span>
        <span className="m3e-divider__line" aria-hidden="true" />
      </div>
    );
  }

  return (
    <BaseSeparator
      orientation={orientation}
      className={className ? `m3e-divider ${className}` : "m3e-divider"}
      data-orientation={orientation}
      data-inset={inset ? "" : undefined}
      style={{
        ...(inset && orientation === "horizontal"
          ? { marginInlineStart: `${DIVIDER_TOKENS.insetStart}px` }
          : undefined),
        ...style,
      }}
    />
  );
}

export interface M3EScrollAreaProps {
  readonly children: React.ReactNode;
  readonly maxHeight?: number | string;
  readonly orientation?: "vertical" | "horizontal" | "both";
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ScrollArea({
  children,
  maxHeight = 220,
  orientation = "vertical",
  className,
  style,
}: M3EScrollAreaProps): React.JSX.Element {
  const showVertical = orientation === "vertical" || orientation === "both";
  const showHorizontal = orientation === "horizontal" || orientation === "both";

  return (
    <BaseScrollArea.Root
      className={
        className ? `m3e-scroll-area ${className}` : "m3e-scroll-area"
      }
      data-orientation={orientation}
      style={style}
    >
      <BaseScrollArea.Viewport
        className="m3e-scroll-area__viewport"
        style={{
          maxHeight,
          ...(orientation === "vertical"
            ? { overflowX: "hidden" }
            : orientation === "horizontal"
              ? { overflowY: "hidden" }
              : undefined),
        }}
      >
        <BaseScrollArea.Content
          className="m3e-scroll-area__content"
          style={
            orientation === "vertical"
              ? { minWidth: 0 }
              : orientation === "horizontal"
                ? { minHeight: 0 }
                : undefined
          }
        >
          {children}
        </BaseScrollArea.Content>
      </BaseScrollArea.Viewport>

      {showVertical ? (
        <BaseScrollArea.Scrollbar
          orientation="vertical"
          className="m3e-scroll-area__scrollbar"
          data-orientation="vertical"
          style={{ width: `${SCROLL_AREA_TOKENS.scrollbarSize}px` }}
        >
          <BaseScrollArea.Thumb
            className="m3e-scroll-area__thumb"
            style={{ borderRadius: `${SCROLL_AREA_TOKENS.thumbRadius}px` }}
          />
        </BaseScrollArea.Scrollbar>
      ) : null}

      {showHorizontal ? (
        <BaseScrollArea.Scrollbar
          orientation="horizontal"
          className="m3e-scroll-area__scrollbar"
          data-orientation="horizontal"
          style={{ height: `${SCROLL_AREA_TOKENS.scrollbarSize}px` }}
        >
          <BaseScrollArea.Thumb
            className="m3e-scroll-area__thumb"
            style={{ borderRadius: `${SCROLL_AREA_TOKENS.thumbRadius}px` }}
          />
        </BaseScrollArea.Scrollbar>
      ) : null}

      {showVertical && showHorizontal ? <BaseScrollArea.Corner /> : null}
    </BaseScrollArea.Root>
  );
}
