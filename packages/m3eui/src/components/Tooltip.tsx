import * as React from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { TOOLTIP_TOKENS } from "../tokens/index.js";

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
  return (
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger delay={delay} render={children} />
      <BaseTooltip.Portal>
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
  return (
    <BaseTooltip.Root disabled={disabled}>
      <BaseTooltip.Trigger delay={delay} closeDelay={140} render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={side}
          sideOffset={sideOffset}
          className="m3e-tooltip__positioner"
        >
          <BaseTooltip.Popup
            className="m3e-tooltip m3e-tooltip--rich"
            style={{
              borderRadius: `${TOOLTIP_TOKENS.richRadius}px`,
              paddingBlock: `${TOOLTIP_TOKENS.richPaddingBlock}px`,
              paddingInline: `${TOOLTIP_TOKENS.richPaddingInline}px`,
              maxWidth: `${TOOLTIP_TOKENS.richMaxWidth}px`,
            }}
          >
            {subhead ? (
              <div className="m3e-tooltip__subhead">{subhead}</div>
            ) : null}
            <div className="m3e-tooltip__supporting">{content}</div>
            {action ? (
              <div className="m3e-tooltip__action">{action}</div>
            ) : null}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
