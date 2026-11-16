"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { TOOLTIP_TOKENS } from "../tokens/index.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";

export interface M3ETooltipProps {
  readonly children: React.ReactElement;
  readonly content: React.ReactNode;
  readonly side?: "top" | "bottom" | "left" | "right";
  readonly sideOffset?: number;
  readonly delay?: number;
  readonly disabled?: boolean;
}

export interface M3ERichTooltipProps {
  readonly children: React.ReactElement;
  readonly subhead?: React.ReactNode;
  readonly content: React.ReactNode;
  readonly action?: React.ReactNode;
  readonly side?: "top" | "bottom" | "left" | "right";
  readonly sideOffset?: number;
  readonly delay?: number;
  readonly disabled?: boolean;
}

export function Tooltip({
  children,
  content,
  side = "top",
  sideOffset = 8,
  delay = 280,
  disabled = false,
}: M3ETooltipProps): React.JSX.Element {
  const portalContainer = useM3EPortalContainer();
  return (
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger delay={delay} render={children} />
      <BaseTooltip.Portal container={portalContainer}>
        <BaseTooltip.Positioner
          side={side}
          sideOffset={sideOffset}
          className="m3e-tooltip__positioner"
        >
          <BaseTooltip.Popup
            className="m3e-tooltip m3e-tooltip--plain"
            style={{
              borderRadius: `${TOOLTIP_TOKENS.plainRadius}px`,
              paddingBlock: `${TOOLTIP_TOKENS.plainPaddingBlock}px`,
              paddingInline: `${TOOLTIP_TOKENS.plainPaddingInline}px`,
            }}
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}

export function RichTooltip({
  children,
  subhead,
  content,
  action,
  side = "top",
  sideOffset = 10,
  delay = 250,
  disabled = false,
}: M3ERichTooltipProps): React.JSX.Element {
  const portalContainer = useM3EPortalContainer();
  const [open, setOpen] = React.useState(false);
  const pointerTypeRef = React.useRef("");
  const popupStyle: React.CSSProperties = {
    borderRadius: `${TOOLTIP_TOKENS.richRadius}px`,
    paddingBlock: `${TOOLTIP_TOKENS.richPaddingBlock}px`,
    paddingInline: `${TOOLTIP_TOKENS.richPaddingInline}px`,
    maxWidth: `${TOOLTIP_TOKENS.richMaxWidth}px`,
  };

  if (action) {
    return (
      <BasePopover.Root
        modal={false}
        open={!disabled && open}
        onOpenChange={setOpen}
      >
        <BasePopover.Trigger
          onPointerDown={(e) => {
            pointerTypeRef.current = e.pointerType;
          }}
          onClickCapture={(e) => {
            if (disabled || open || pointerTypeRef.current !== "touch") return;
            e.preventDefault();
            e.stopPropagation();
            setOpen(true);
          }}
          openOnHover={!disabled}
          delay={delay}
          closeDelay={180}
          nativeButton={
            typeof children.type === "string"
              ? children.type === "button"
              : undefined
          }
          render={children}
        />
        <BasePopover.Portal container={portalContainer}>
          <BasePopover.Positioner
            side={side}
            sideOffset={sideOffset}
            className="m3e-tooltip__positioner"
          >
            <BasePopover.Popup
              initialFocus={(openType) => openType === "keyboard"}
              className="m3e-tooltip m3e-tooltip--rich"
              style={popupStyle}
            >
              {subhead ? (
                <BasePopover.Title className="m3e-tooltip__subhead">
                  {subhead}
                </BasePopover.Title>
              ) : null}
              <BasePopover.Description className="m3e-tooltip__supporting">
                {content}
              </BasePopover.Description>
              <div className="m3e-tooltip__action">{action}</div>
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
    );
  }

  return (
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger delay={delay} closeDelay={140} render={children} />
      <BaseTooltip.Portal container={portalContainer}>
        <BaseTooltip.Positioner
          side={side}
          sideOffset={sideOffset}
          className="m3e-tooltip__positioner"
        >
          <BaseTooltip.Popup
            className="m3e-tooltip m3e-tooltip--rich"
            style={popupStyle}
          >
            {subhead ? (
              <div className="m3e-tooltip__subhead">{subhead}</div>
            ) : null}
            <div className="m3e-tooltip__supporting">{content}</div>
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
