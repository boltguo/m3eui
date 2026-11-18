"use client";

import * as React from "react";
import { type M3EShapeName, getMaterialShape } from "../../tokens/shapes.js";
import { SkeletonBase } from "../../internal/skeletonBase.js";

export interface M3ESkeletonProps {
  readonly variant?: "text" | "rectangular" | "rounded" | "circular";
  readonly shape?: M3EShapeName;
  readonly width?: number | string;
  readonly height?: number | string;
  readonly animated?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function toCssSize(value: number | string): string {
  return typeof value === "number" ? `${value}px` : value;
}

export function Skeleton({
  variant = "rounded",
  shape,
  width,
  height,
  animated = true,
  className,
  style,
}: M3ESkeletonProps): React.JSX.Element {
  if (shape) {
    const resolvedWidth =
      width !== undefined
        ? toCssSize(width)
        : typeof height === "number"
          ? `${height}px`
          : "56px";
    const resolvedHeight =
      height !== undefined
        ? toCssSize(height)
        : typeof width === "number"
          ? `${width}px`
          : "56px";
    const preserveAspectRatio =
      width !== undefined && height !== undefined && width !== height
        ? "none"
        : "xMidYMid meet";
    const shapeDef = getMaterialShape(shape);

    return (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio={preserveAspectRatio}
        aria-hidden="true"
        className={
          className
            ? `m3e-skeleton m3e-skeleton--shape ${className}`
            : "m3e-skeleton m3e-skeleton--shape"
        }
        data-animated={animated ? "" : undefined}
        style={{
          width: resolvedWidth,
          height: resolvedHeight,
          ...style,
        }}
      >
        <path d={shapeDef.previewSvgPath} fill="currentColor" />
      </svg>
    );
  }

  return (
    <SkeletonBase
      variant={variant}
      width={width}
      height={height}
      animated={animated}
      className={className}
      style={style}
    />
  );
}
