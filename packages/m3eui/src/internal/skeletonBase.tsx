import * as React from "react";
import { SKELETON_TOKENS } from "../tokens/topology.js";

export type SkeletonBaseVariant =
  | "text"
  | "circular"
  | "rectangular"
  | "rounded";

export interface SkeletonBaseProps {
  readonly variant?: SkeletonBaseVariant;
  readonly width?: number | string;
  readonly height?: number | string;
  readonly animated?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function SkeletonBase({
  variant = "rounded",
  width,
  height,
  animated = true,
  className,
  style,
}: SkeletonBaseProps): React.JSX.Element {
  const resolvedRadius =
    variant === "circular"
      ? 9999
      : variant === "text"
        ? SKELETON_TOKENS.textRadius
        : variant === "rectangular"
          ? SKELETON_TOKENS.rectangularRadius
          : SKELETON_TOKENS.roundedRadius;

  const defaultHeight =
    variant === "text" ? 14 : variant === "circular" ? 44 : 36;
  const defaultWidth = variant === "circular" ? (height ?? 44) : "100%";

  return (
    <span
      aria-hidden="true"
      className={className ? `m3e-skeleton ${className}` : "m3e-skeleton"}
      data-variant={variant}
      data-animated={animated ? "" : undefined}
      style={{
        width: width ?? defaultWidth,
        height: height ?? defaultHeight,
        borderRadius: `${resolvedRadius}px`,
        ...style,
      }}
    />
  );
}
