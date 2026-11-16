"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { POPOVER_TOKENS } from "../tokens/index.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";

export interface M3EPopoverProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly trigger: React.ReactElement;
  readonly openOnHover?: boolean;
  readonly delay?: number;
  readonly closeDelay?: number;
  readonly title?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly "aria-label"?: string;
  readonly side?: "top" | "bottom" | "left" | "right";
  readonly align?: "start" | "center" | "end";
  readonly sideOffset?: number;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function PopoverClose({
  render,
  children,
  className,
}: {
  readonly render?: React.ReactElement;
  readonly children?: React.ReactNode;
  readonly className?: string;
}): React.JSX.Element {
  return (
    <BasePopover.Close render={render} className={className}>
      {children}
    </BasePopover.Close>
  );
}

export function Popover({
  open,
  defaultOpen,
  onOpenChange,
  trigger,
  openOnHover = false,
  delay = 280,
  closeDelay = 200,
  title,
  description,
  "aria-label": ariaLabel,
  side = "bottom",
  align = "center",
  sideOffset = 8,
  children,
  className,
  style,
}: M3EPopoverProps): React.JSX.Element {
  const portalContainer = useM3EPortalContainer();
  return (
    <BasePopover.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={(next) => onOpenChange?.(next)}
    >
      <BasePopover.Trigger
        openOnHover={openOnHover}
        delay={delay}
        closeDelay={closeDelay}
        render={trigger}
      />
      <BasePopover.Portal container={portalContainer}>
        <BasePopover.Positioner
          side={side}
          align={align}
          sideOffset={sideOffset}
          className="m3e-popover__positioner"
        >
          <BasePopover.Popup
            aria-label={title ? undefined : ariaLabel}
            className={className ? `m3e-popover ${className}` : "m3e-popover"}
            style={{
              borderRadius: `${POPOVER_TOKENS.containerRadius}px`,
              padding: `${POPOVER_TOKENS.padding}px`,
              maxWidth: `${POPOVER_TOKENS.maxWidth}px`,
              ...style,
            }}
          >
            {title ? (
              <BasePopover.Title className="m3e-popover__title">
                {title}
              </BasePopover.Title>
            ) : null}
            {description ? (
              <BasePopover.Description className="m3e-popover__description">
                {description}
              </BasePopover.Description>
            ) : null}
            <div className="m3e-popover__body">{children}</div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
