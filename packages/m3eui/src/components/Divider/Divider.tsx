"use client";

import * as React from "react";
import { Separator as BaseSeparator } from "@base-ui/react/separator";

export interface M3EDividerProps {
  readonly orientation?: "horizontal" | "vertical";
  readonly inset?: boolean;
  readonly label?: React.ReactNode;
  readonly children?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const Divider = React.forwardRef<HTMLDivElement, M3EDividerProps>(
  function Divider(
    {
      orientation = "horizontal",
      inset = false,
      label,
      children,
      className,
      style,
    },
    ref,
  ): React.JSX.Element {
    const content = label ?? children;
    if (content && orientation === "horizontal") {
      return (
        <div
          ref={ref}
          role="separator"
          aria-orientation="horizontal"
          className={
            className
              ? `m3e-divider m3e-divider--labeled ${className}`
              : "m3e-divider m3e-divider--labeled"
          }
          data-orientation="horizontal"
          data-inset={inset ? "" : undefined}
          style={style}
        >
          <span className="m3e-divider__line" aria-hidden="true" />
          <span className="m3e-divider__label">{content}</span>
          <span className="m3e-divider__line" aria-hidden="true" />
        </div>
      );
    }

    return (
      <BaseSeparator
        ref={ref}
        orientation={orientation}
        className={className ? `m3e-divider ${className}` : "m3e-divider"}
        data-orientation={orientation}
        data-inset={inset ? "" : undefined}
        style={style}
      />
    );
  },
);
