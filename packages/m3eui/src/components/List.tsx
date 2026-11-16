"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import {
  type CornerTuple,
  resolveSegmentedListCorners,
} from "../tokens/index.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useM3ECornerSpringRef, usePressHoldState } from "../hooks/useM3ESpring.js";

export type ListVariant = "segmented" | "standard";
export type ListDividerMode = "none" | "full" | "inset";

interface ListItemContextValue {
  readonly index: number;
  readonly count: number;
  readonly variant: ListVariant;
}

const ListItemContext = React.createContext<ListItemContextValue>({
  index: 0,
  count: 1,
  variant: "standard",
});

export interface ListProps {
  readonly children: React.ReactNode;
  readonly variant?: ListVariant;
  readonly dividers?: ListDividerMode;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function List({
  children,
  variant = "standard",
  dividers = variant === "standard" ? "full" : "none",
  "aria-label": ariaLabel,
  className,
  style,
}: ListProps): React.JSX.Element {
  const validChildren = React.Children.toArray(children).filter(React.isValidElement);
  const count = validChildren.length;

  return (
    <ul
      role="list"
      aria-label={ariaLabel}
      data-variant={variant}
      data-dividers={dividers}
      className={className ? `m3e-segmented-list ${className}` : "m3e-segmented-list"}
      style={style}
    >
      {validChildren.map((child, index) => (
        <ListItemContext.Provider
          key={child.key ?? index}
          value={{ index, count, variant }}
        >
          <li className="m3e-segmented-list__li">{child}</li>
        </ListItemContext.Provider>
      ))}
    </ul>
  );
}

export interface ListItemProps {
  readonly headline: React.ReactNode;
  readonly supportingText?: React.ReactNode;
  readonly leading?: React.ReactNode;
  readonly trailing?: React.ReactNode;
  readonly lines?: 1 | 2 | 3;
  readonly selected?: boolean;
  readonly interactive?: boolean;
  readonly disabled?: boolean;
  readonly onClick?: () => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function CheckBadgeSvg() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function formatTupleBadge(c: CornerTuple): string {
  const [a, b, d, e] = c.map((v) => Math.round(v));
  if (a === b && b === d && d === e) return `r:${c[0].toFixed(1)}`;
  return `r:${a}/${b}/${d}/${e}`;
}

export function ListItem({
  headline,
  supportingText,
  leading,
  trailing,
  lines = supportingText ? 2 : 1,
  selected: selectedProp,
  interactive: interactiveProp,
  disabled = false,
  onClick,
  className,
  style,
}: ListItemProps): React.JSX.Element {
  const { index, count, variant } = React.useContext(ListItemContext);
  const { debugGeometry } = useM3ERuntime();
  const selected = Boolean(selectedProp);
  const isInteractive = interactiveProp ?? Boolean(onClick);
  const trackHoverCorners = variant === "segmented" && isInteractive && !disabled;
  const [isHovered, setIsHovered] = React.useState(false);
  const { isPressed, pressHandlers } = usePressHoldState(!isInteractive || disabled);

  const targetCorners: CornerTuple =
    variant === "standard"
      ? selected
        ? [12, 12, 12, 12]
        : [0, 0, 0, 0]
      : resolveSegmentedListCorners({
          index,
          count,
          isHovered: trackHoverCorners ? isHovered : false,
          isPressed: isInteractive && !disabled ? isPressed : false,
          isSelected: selected,
        });

  const { ref: cornerRef, borderRadiusCss } = useM3ECornerSpringRef<HTMLElement>(
    targetCorners,
    "fastSpatial",
  );

  const position =
    count === 1
      ? "single"
      : index === 0
        ? "first"
        : index === count - 1
          ? "last"
          : "middle";

  const hasLeading = selected || Boolean(leading);
  const mainBody = (
    <>
      {hasLeading ? (
        <span className="m3e-segmented-list__leading" aria-hidden="true">
          {selected ? <CheckBadgeSvg /> : leading}
        </span>
      ) : null}
      <span className="m3e-segmented-list__content">
        <span className="m3e-segmented-list__headline">{headline}</span>
        {supportingText ? (
          <span className="m3e-segmented-list__supporting">{supportingText}</span>
        ) : null}
      </span>
    </>
  );

  if (!isInteractive) {
    return (
      <div
        ref={cornerRef as React.Ref<HTMLDivElement>}
        className={
          className
            ? `m3e-segmented-list__item ${className}`
            : "m3e-segmented-list__item"
        }
        style={{ borderRadius: borderRadiusCss, ...style }}
        data-lines={lines}
        data-static=""
        data-selected={selected ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-position={position}
      >
        {mainBody}
        {trailing ? (
          <span className="m3e-segmented-list__trailing">{trailing}</span>
        ) : null}
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            #{index + 1}/{count} {formatTupleBadge(targetCorners)}
          </span>
        ) : null}
      </div>
    );
  }

  if (trailing) {
    return (
      <div
        ref={cornerRef as React.Ref<HTMLDivElement>}
        className={
          className
            ? `m3e-segmented-list__item m3e-segmented-list__item--compound ${className}`
            : "m3e-segmented-list__item m3e-segmented-list__item--compound"
        }
        style={{ borderRadius: borderRadiusCss, ...style }}
        data-lines={lines}
        data-selected={selected ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        data-hovered={trackHoverCorners && isHovered ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-position={position}
      >
        <BaseButton
          type="button"
          disabled={disabled}
          aria-pressed={selectedProp !== undefined ? selected : undefined}
          onClick={onClick}
          className="m3e-segmented-list__primary"
          onPointerEnter={(e) => {
            if (trackHoverCorners && e.pointerType === "mouse") setIsHovered(true);
          }}
          onPointerLeave={() => {
            if (trackHoverCorners) setIsHovered(false);
            pressHandlers.onPointerLeave();
          }}
          onPointerDown={pressHandlers.onPointerDown}
          onPointerUp={pressHandlers.onPointerUp}
          onPointerCancel={pressHandlers.onPointerCancel}
          onKeyDown={pressHandlers.onKeyDown}
          onKeyUp={pressHandlers.onKeyUp}
          onBlur={pressHandlers.onBlur}
        >
          {mainBody}
        </BaseButton>
        <span className="m3e-segmented-list__trailing">{trailing}</span>
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            #{index + 1}/{count} {formatTupleBadge(targetCorners)}
          </span>
        ) : null}
      </div>
    );
  }

  return (
    <BaseButton
      ref={cornerRef as React.Ref<HTMLButtonElement>}
      type="button"
      disabled={disabled}
      aria-pressed={selectedProp !== undefined ? selected : undefined}
      onClick={onClick}
      className={
        className
          ? `m3e-segmented-list__item ${className}`
          : "m3e-segmented-list__item"
      }
      style={{ borderRadius: borderRadiusCss, ...style }}
      data-lines={lines}
      data-selected={selected ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      data-hovered={trackHoverCorners && isHovered ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-position={position}
      onPointerEnter={(e) => {
        if (trackHoverCorners && e.pointerType === "mouse") setIsHovered(true);
      }}
      onPointerLeave={() => {
        if (trackHoverCorners) setIsHovered(false);
        pressHandlers.onPointerLeave();
      }}
      onPointerDown={pressHandlers.onPointerDown}
      onPointerUp={pressHandlers.onPointerUp}
      onPointerCancel={pressHandlers.onPointerCancel}
      onKeyDown={pressHandlers.onKeyDown}
      onKeyUp={pressHandlers.onKeyUp}
      onBlur={pressHandlers.onBlur}
    >
      {mainBody}
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          #{index + 1}/{count} {formatTupleBadge(targetCorners)}
        </span>
      ) : null}
    </BaseButton>
  );
}

