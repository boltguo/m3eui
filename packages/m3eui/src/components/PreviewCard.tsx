"use client";

import * as React from "react";
import { PreviewCard as BasePreviewCard } from "@base-ui/react/preview-card";
import { PREVIEW_CARD_TOKENS } from "../tokens/index.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";

export interface M3EPreviewCardProps {
  readonly trigger: React.ReactElement;
  readonly children: React.ReactNode;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
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
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  delay = 280,
  closeDelay = 200,
  className,
  style,
}: M3EPreviewCardProps): React.JSX.Element {
  const portalContainer = useM3EPortalContainer();
  return (
    <BasePreviewCard.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={
        onOpenChange
          ? (nextOpen) => {
              onOpenChange(nextOpen);
            }
          : undefined
      }
    >
      <BasePreviewCard.Trigger
        delay={delay}
        closeDelay={closeDelay}
        render={trigger}
      />
      <BasePreviewCard.Portal container={portalContainer}>
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
