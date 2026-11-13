import * as React from "react";
import { Avatar as BaseAvatar } from "@base-ui/react/avatar";
import {
  AVATAR_SIZE_SPECS,
  type AvatarSize,
  BADGE_TOKENS,
  type M3EShapeName,
  MATERIAL_SHAPES,
  cubicsToSvgPath,
} from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import { formatLocalizedInteger } from "../i18n/index.js";

export type AvatarShape = "circle" | "square" | M3EShapeName;

export interface M3EAvatarProps {
  readonly src?: string;
  readonly alt?: string;
  readonly fallback: React.ReactNode;
  readonly size?: AvatarSize;
  readonly shape?: AvatarShape;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Avatar({
  src,
  alt = "",
  fallback,
  size = "md",
  shape = "circle",
  className,
  style,
}: M3EAvatarProps): React.JSX.Element {
  const px = AVATAR_SIZE_SPECS[size];
  const rawClipId = React.useId();
  const clipId = `m3e-avatar-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const isCustomPolygon = shape !== "circle" && shape !== "square";
  const polygonSvgPath = React.useMemo(() => {
    if (!isCustomPolygon) return null;
    const def = MATERIAL_SHAPES[shape as M3EShapeName];
    return cubicsToSvgPath(def.cubics, px, 0.98);
  }, [isCustomPolygon, shape, px]);

  const borderRadius =
    shape === "circle"
      ? "9999px"
      : shape === "square"
        ? `${Math.round(px * 0.28)}px`
        : undefined;

  return (
    <span
      className={className ? `m3e-avatar-wrap ${className}` : "m3e-avatar-wrap"}
      style={{ width: `${px}px`, height: `${px}px`, ...style }}
    >
      {polygonSvgPath ? (
        <svg
          width={0}
          height={0}
          style={{ position: "absolute", pointerEvents: "none" }}
          aria-hidden="true"
        >
          <defs>
            <clipPath id={clipId}>
              <path d={polygonSvgPath} />
            </clipPath>
          </defs>
        </svg>
      ) : null}

      <BaseAvatar.Root
        className="m3e-avatar"
        data-size={size}
        style={{
          width: `${px}px`,
          height: `${px}px`,
          borderRadius,
          clipPath: polygonSvgPath ? `url(#${clipId})` : undefined,
        }}
      >
        {src ? (
          <BaseAvatar.Image src={src} alt={alt} className="m3e-avatar__img" />
        ) : null}
        <BaseAvatar.Fallback className="m3e-avatar__fallback">
          {fallback}
        </BaseAvatar.Fallback>
      </BaseAvatar.Root>
    </span>
  );
}

export interface M3EBadgeProps {
  readonly children?: React.ReactNode;
  readonly count?: number;
  readonly max?: number;
  readonly dot?: boolean;
  readonly hidden?: boolean;
  readonly color?: "error" | "primary" | "secondary";
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Badge({
  children,
  count,
  max = 99,
  dot = false,
  hidden = false,
  color = "error",
  className,
  style,
}: M3EBadgeProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const show = !hidden && (dot || (count !== undefined && count > 0));
  const text =
    !dot && count !== undefined
      ? count > max
        ? t("badge.overflow", { max: formatLocalizedInteger(locale, max) })
        : formatLocalizedInteger(locale, count)
      : null;

  const indicator = show ? (
    <span
      className={dot ? "m3e-badge m3e-badge--dot" : "m3e-badge m3e-badge--pill"}
      data-color={color}
      data-anchored={children ? "" : undefined}
      style={
        dot
          ? {
              width: `${BADGE_TOKENS.dotSize}px`,
              height: `${BADGE_TOKENS.dotSize}px`,
            }
          : {
              minWidth: `${BADGE_TOKENS.pillMinWidth}px`,
              height: `${BADGE_TOKENS.pillHeight}px`,
              paddingInline: `${BADGE_TOKENS.pillPaddingInline}px`,
            }
      }
    >
      {text}
    </span>
  ) : null;

  if (!children) {
    return indicator ?? <></>;
  }

  return (
    <span
      className={className ? `m3e-badge-anchor ${className}` : "m3e-badge-anchor"}
      style={style}
    >
      {children}
      {indicator}
    </span>
  );
}
