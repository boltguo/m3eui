"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import {
  type CornerTuple,
  resolveSegmentedListCorners,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useM3ECornerSpringRef, usePressHoldState } from "../../hooks/useM3ESpring.js";
import { CheckIcon, ChevronLeftIcon, ChevronRightIcon } from "../../internal/icons.js";
import { LinkActionElement, isLinkRenderTarget } from "../../internal/link.js";
import { useM3ERipple } from "../../internal/ripple.js";

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
  readonly label?: React.ReactNode;
  readonly variant?: ListVariant;
  readonly dividers?: ListDividerMode;
  readonly "aria-label"?: string;
  readonly "aria-labelledby"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function List({
  children,
  label,
  variant = "standard",
  dividers = variant === "standard" ? "full" : "none",
  "aria-label": ariaLabel,
  "aria-labelledby": ariaLabelledBy,
  className,
  style,
}: ListProps): React.JSX.Element {
  const autoLabelId = React.useId();
  const hasLabel = label !== undefined && label !== null && label !== false;
  const validChildren = React.Children.toArray(children).filter(React.isValidElement);
  const count = validChildren.length;

  const ulNode = (
    <ul
      role="list"
      aria-label={ariaLabel}
      aria-labelledby={
        ariaLabel ? undefined : (ariaLabelledBy ?? (hasLabel ? autoLabelId : undefined))
      }
      data-variant={variant}
      data-dividers={dividers}
      className={
        hasLabel || !className ? "m3e-segmented-list" : `m3e-segmented-list ${className}`
      }
      style={hasLabel ? undefined : style}
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

  if (!hasLabel) {
    return ulNode;
  }

  return (
    <div
      className={className ? `m3e-list-group ${className}` : "m3e-list-group"}
      style={style}
    >
      <div id={autoLabelId} className="m3e-list-group__label">
        {label}
      </div>
      {ulNode}
    </div>
  );
}

export interface ListItemProps {
  readonly headline: React.ReactNode;
  readonly supportingText?: React.ReactNode;
  readonly leading?: React.ReactNode;
  readonly trailing?: React.ReactNode;
  readonly chevron?: boolean;
  readonly trailingDivider?: boolean;
  readonly lines?: 1 | 2 | 3;
  readonly selected?: boolean;
  readonly interactive?: boolean;
  readonly disabled?: boolean;
  readonly href?: string;
  readonly target?: string;
  readonly rel?: string;
  readonly render?: React.ReactElement;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly className?: string;
  readonly style?: React.CSSProperties;
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
  chevron = false,
  trailingDivider,
  lines = supportingText ? 2 : 1,
  selected: selectedProp,
  interactive: interactiveProp,
  disabled = false,
  href,
  target,
  rel,
  render,
  onClick,
  className,
  style,
}: ListItemProps): React.JSX.Element {
  const { index, count, variant } = React.useContext(ListItemContext);
  const { debugGeometry, direction } = useM3ERuntime();
  const selected = Boolean(selectedProp);
  const isLink = isLinkRenderTarget(href, render);
  const isInteractive = interactiveProp ?? (isLink || Boolean(onClick));
  const showTrailingDivider =
    trailingDivider ?? Boolean(chevron && isInteractive && Boolean(trailing));
  const { isPressed, pressHandlers } = usePressHoldState(!isInteractive || disabled);
  const { rippleRef, rippleHandlers } = useM3ERipple(!isInteractive || disabled);

  const targetCorners: CornerTuple =
    variant === "standard"
      ? selected
        ? [12, 12, 12, 12]
        : [0, 0, 0, 0]
      : resolveSegmentedListCorners({
          index,
          count,
          isHovered: false,
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
          {selected ? <CheckIcon strokeWidth={2.5} /> : leading}
        </span>
      ) : null}
      <span className="m3e-segmented-list__content">
        <span className="m3e-segmented-list__headline">{headline}</span>
        {supportingText ? (
          <span className="m3e-segmented-list__supporting">{supportingText}</span>
        ) : null}
      </span>
      {chevron ? (
        <span className="m3e-segmented-list__chevron" aria-hidden="true">
          {direction === "rtl" ? (
            <ChevronLeftIcon size={18} />
          ) : (
            <ChevronRightIcon size={18} />
          )}
        </span>
      ) : null}
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

  const pointerAndPressHandlers = {
    onPointerLeave: (e: React.PointerEvent<HTMLElement>) => {
      pressHandlers.onPointerLeave(e);
      rippleHandlers.onPointerLeave(e);
    },
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
      pressHandlers.onPointerDown(e);
      rippleHandlers.onPointerDown(e);
    },
    onPointerUp: () => {
      pressHandlers.onPointerUp();
      rippleHandlers.onPointerUp();
    },
    onPointerCancel: () => {
      pressHandlers.onPointerCancel();
      rippleHandlers.onPointerCancel();
    },
    onLostPointerCapture: () => {
      pressHandlers.onLostPointerCapture();
      rippleHandlers.onLostPointerCapture();
    },
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => {
      pressHandlers.onKeyDown(e);
      rippleHandlers.onKeyDown(e);
    },
    onKeyUp: (e: React.KeyboardEvent<HTMLElement>) => {
      pressHandlers.onKeyUp(e);
      rippleHandlers.onKeyUp(e);
    },
    onBlur: () => {
      pressHandlers.onBlur();
      rippleHandlers.onBlur();
    },
  };

  if (trailing) {
    const primaryAction = isLink ? (
      <LinkActionElement
        href={href}
        target={target}
        rel={rel}
        render={render}
        disabled={disabled}
        aria-pressed={selectedProp !== undefined ? selected : undefined}
        onClick={onClick}
        className="m3e-segmented-list__primary"
        {...pointerAndPressHandlers}
      >
        {mainBody}
      </LinkActionElement>
    ) : (
      <BaseButton
        type="button"
        disabled={disabled}
        aria-pressed={selectedProp !== undefined ? selected : undefined}
        onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
        className="m3e-segmented-list__primary"
        {...pointerAndPressHandlers}
      >
        {mainBody}
      </BaseButton>
    );

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
        data-disabled={disabled ? "" : undefined}
        data-position={position}
      >
        <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
        {primaryAction}
        {showTrailingDivider ? (
          <span className="m3e-segmented-list__divider" aria-hidden="true" />
        ) : null}
        <span className="m3e-segmented-list__trailing">{trailing}</span>
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            #{index + 1}/{count} {formatTupleBadge(targetCorners)}
          </span>
        ) : null}
      </div>
    );
  }

  const singleClassName = className
    ? `m3e-segmented-list__item ${className}`
    : "m3e-segmented-list__item";
  const singleStyle = { borderRadius: borderRadiusCss, ...style };
  const singleBody = (
    <>
      {mainBody}
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          #{index + 1}/{count} {formatTupleBadge(targetCorners)}
        </span>
      ) : null}
    </>
  );

  if (isLink) {
    return (
      <LinkActionElement
        ref={cornerRef}
        href={href}
        target={target}
        rel={rel}
        render={render}
        disabled={disabled}
        aria-pressed={selectedProp !== undefined ? selected : undefined}
        onClick={onClick}
        className={singleClassName}
        style={singleStyle}
        data-lines={String(lines)}
        data-selected={selected ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        data-position={position}
        {...pointerAndPressHandlers}
      >
        {singleBody}
      </LinkActionElement>
    );
  }

  return (
    <BaseButton
      ref={cornerRef as React.Ref<HTMLButtonElement>}
      type="button"
      disabled={disabled}
      aria-pressed={selectedProp !== undefined ? selected : undefined}
      onClick={onClick as React.MouseEventHandler<HTMLButtonElement> | undefined}
      className={singleClassName}
      style={singleStyle}
      data-lines={lines}
      data-selected={selected ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-position={position}
      {...pointerAndPressHandlers}
    >
      {singleBody}
    </BaseButton>
  );
}

