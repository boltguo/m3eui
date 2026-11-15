"use client";

import * as React from "react";
import {
  type M3EShapeName,
  cubicsToSvgPath,
  getMaterialShape,
} from "../tokens/shapes.js";
import {
  AVATAR_SIZE_SPECS,
  type AvatarSize,
  BADGE_TOKENS,
} from "../tokens/topology.js";
import { useM3EI18n } from "../context/M3EContext.js";
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

const DEFAULT_AVATAR_ALT = "";

export function Avatar({
  src,
  alt = DEFAULT_AVATAR_ALT,
  fallback,
  size = "md",
  shape = "circle",
  className,
  style,
}: M3EAvatarProps): React.JSX.Element {
  const px = AVATAR_SIZE_SPECS[size];
  const rawClipId = React.useId();
  const clipId = `m3e-avatar-clip-${rawClipId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null);

  const isCustomPolygon = shape !== "circle" && shape !== "square";
  const polygonSvgPath = React.useMemo(() => {
    if (!isCustomPolygon) return null;
    const def = getMaterialShape(shape as M3EShapeName);
    return cubicsToSvgPath(def.cubics, px, 0.98);
  }, [isCustomPolygon, shape, px]);

  const borderRadius =
    shape === "circle"
      ? "9999px"
      : shape === "square"
        ? `${Math.round(px * 0.28)}px`
        : undefined;

  const showImage = Boolean(src && failedSrc !== src);

  return (
    <span
      className={className ? `m3e-avatar-wrap ${className}` : "m3e-avatar-wrap"}
      data-shape={shape}
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

      <span
        className="m3e-avatar"
        data-size={size}
        data-shape={shape}
        style={{
          width: `${px}px`,
          height: `${px}px`,
          borderRadius,
          clipPath: polygonSvgPath ? `url(#${clipId})` : undefined,
        }}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            className="m3e-avatar__img"
            onError={() => {
              if (src) {
                setFailedSrc(src);
              }
            }}
          />
        ) : (
          <span className="m3e-avatar__fallback">{fallback}</span>
        )}
      </span>
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
  readonly "aria-label"?: string;
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
  "aria-label": ariaLabel,
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

  const resolvedAriaLabel =
    ariaLabel ??
    (!dot && text ? t("badge.unreadCount", { count: text }) : undefined);
  const standalone = !children;
  const baseBadgeClass = dot
    ? "m3e-badge m3e-badge--dot"
    : "m3e-badge m3e-badge--pill";

  const indicator = show ? (
    <span
      role={resolvedAriaLabel ? "status" : undefined}
      aria-label={resolvedAriaLabel}
      className={
        standalone && className
          ? `${baseBadgeClass} ${className}`
          : baseBadgeClass
      }
      data-color={color}
      data-anchored={children ? "" : undefined}
      style={
        dot
          ? {
              width: `${BADGE_TOKENS.dotSize}px`,
              height: `${BADGE_TOKENS.dotSize}px`,
              ...(standalone ? style : undefined),
            }
          : {
              minWidth: `${BADGE_TOKENS.pillMinWidth}px`,
              height: `${BADGE_TOKENS.pillHeight}px`,
              paddingInline: `${BADGE_TOKENS.pillPaddingInline}px`,
              ...(standalone ? style : undefined),
            }
      }
    >
      {text}
    </span>
  ) : null;

  if (standalone) {
    return indicator ?? <></>;
  }

  return (
    <span
      className={
        className ? `m3e-badge-anchor ${className}` : "m3e-badge-anchor"
      }
      style={style}
    >
      {children}
      {indicator}
    </span>
  );
}

export interface M3EAvatarGroupItem {
  readonly id?: string;
  readonly src?: string;
  readonly alt?: string;
  readonly fallback: React.ReactNode;
}

export interface M3EAvatarGroupProps {
  readonly items?: readonly M3EAvatarGroupItem[];
  readonly children?: React.ReactNode;
  readonly max?: number;
  readonly size?: AvatarSize;
  readonly shape?: AvatarShape;
  readonly spacing?: number;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function AvatarGroupRingSvg({ shape }: { readonly shape: AvatarShape }) {
  if (shape === "circle" || shape === "square") {
    return null;
  }
  const shapeDef = getMaterialShape(shape as M3EShapeName);
  return (
    <svg
      className="m3e-avatar-group__ring-svg"
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
      }}
    >
      <path
        d={shapeDef.previewSvgPath}
        fill="var(--m3e-avatar-group-ring, var(--m3e-color-surface))"
        stroke="var(--m3e-avatar-group-ring, var(--m3e-color-surface))"
        strokeWidth={10}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AvatarGroup({
  items,
  children,
  max = 4,
  size = "md",
  shape = "circle",
  spacing,
  className,
  style,
}: M3EAvatarGroupProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const px = AVATAR_SIZE_SPECS[size];
  const overlap = spacing ?? -Math.round(px * 0.24);

  const childNodes = React.useMemo(() => {
    if (items) {
      return items.map((item, idx) => (
        <Avatar
          key={item.id ?? idx}
          src={item.src}
          alt={item.alt}
          fallback={item.fallback}
          size={size}
          shape={shape}
        />
      ));
    }
    return React.Children.toArray(children)
      .filter(React.isValidElement)
      .map((child) => {
        if (child.type === Avatar) {
          const avatarProps = child.props as Partial<M3EAvatarProps>;
          return React.cloneElement(child as React.ReactElement<M3EAvatarProps>, {
            size: avatarProps.size ?? size,
            shape: avatarProps.shape ?? shape,
          });
        }
        return child;
      });
  }, [items, children, size, shape]);

  const limit = Math.max(1, max);
  const visible = childNodes.slice(0, limit);
  const overflowCount = Math.max(0, childNodes.length - visible.length);

  const getSlotShapeStyle = (
    itemShape: AvatarShape,
    idx: number,
  ): React.CSSProperties => {
    const isCustom = itemShape !== "circle" && itemShape !== "square";
    return {
      position: "relative",
      ...(idx > 0 ? { marginInlineStart: `${overlap}px` } : undefined),
      ...(itemShape === "square"
        ? { borderRadius: `${Math.round(px * 0.28)}px` }
        : isCustom
          ? { borderRadius: 0, boxShadow: "none" }
          : undefined),
    };
  };

  return (
    <div
      role="group"
      className={
        className ? `m3e-avatar-group ${className}` : "m3e-avatar-group"
      }
      data-shape={shape}
      style={
        {
          "--m3e-avatar-group-overlap": `${overlap}px`,
          ...style,
        } as React.CSSProperties
      }
    >
      {visible.map((node, idx) => {
        const itemShape =
          (React.isValidElement<Partial<M3EAvatarProps>>(node) &&
            node.props.shape) ||
          shape;
        return (
          <span
            key={(React.isValidElement(node) && node.key) || idx}
            className="m3e-avatar-group__slot m3e-avatar-group__item"
            data-shape={itemShape}
            style={getSlotShapeStyle(itemShape, idx)}
          >
            <AvatarGroupRingSvg shape={itemShape} />
            {node}
          </span>
        );
      })}
      {overflowCount > 0 ? (
        <span
          className="m3e-avatar-group__slot m3e-avatar-group__item m3e-avatar-group__overflow"
          data-shape={shape}
          style={getSlotShapeStyle(shape, 1)}
          aria-label={t("avatarGroup.overflowLabel", {
            count: formatLocalizedInteger(locale, overflowCount),
          })}
        >
          <AvatarGroupRingSvg shape={shape} />
          <Avatar
            size={size}
            shape={shape}
            fallback={`+${formatLocalizedInteger(locale, overflowCount)}`}
          />
        </span>
      ) : null}
    </div>
  );
}
