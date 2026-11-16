"use client";

import * as React from "react";
import { ScrollArea as BaseScrollArea } from "@base-ui/react/scroll-area";
import {
  SCROLL_AREA_TOKENS,
} from "../tokens/topology.js";

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
