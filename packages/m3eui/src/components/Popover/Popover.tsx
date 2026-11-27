"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import { useAdaptivePositionMethod } from "../../internal/positionMethod.js";

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

export const PopoverClose = React.forwardRef<
  HTMLButtonElement,
  {
    readonly render?: React.ReactElement;
    readonly children?: React.ReactNode;
    readonly className?: string;
  }
>(function PopoverClose({ render, children, className }, ref): React.JSX.Element {
  return (
    <BasePopover.Close ref={ref} render={render} className={className}>
      {children}
    </BasePopover.Close>
  );
});

export const Popover = React.forwardRef<HTMLDivElement, M3EPopoverProps>(
  function Popover(
    {
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
    },
    ref,
  ): React.JSX.Element {
    const portalContainer = useM3EPortalContainer();
    const [uncontrolledOpen, setUncontrolledOpen] = React.useState(
      Boolean(defaultOpen),
    );
    const isOpen = open ?? uncontrolledOpen;
    const triggerRef = React.useRef<HTMLElement | null>(null);
    const assignTriggerRef = React.useCallback((node: HTMLElement | null) => {
      triggerRef.current = node;
    }, []);
    const positionMethod = useAdaptivePositionMethod(triggerRef, isOpen);

    return (
      <BasePopover.Root
        open={open}
        defaultOpen={defaultOpen}
        onOpenChange={(next) => {
          if (open === undefined) {
            setUncontrolledOpen(next);
          }
          onOpenChange?.(next);
        }}
      >
        <BasePopover.Trigger
          ref={assignTriggerRef}
          openOnHover={openOnHover}
          delay={delay}
          closeDelay={closeDelay}
          render={trigger}
        />
        <BasePopover.Portal container={portalContainer}>
          <BasePopover.Positioner
            positionMethod={positionMethod}
            side={side}
            align={align}
            sideOffset={sideOffset}
            className="m3e-popover__positioner"
          >
            <BasePopover.Popup
              ref={ref}
              aria-label={title ? undefined : ariaLabel}
              className={className ? `m3e-popover ${className}` : "m3e-popover"}
              style={style}
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
  },
);
