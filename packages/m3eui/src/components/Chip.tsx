"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { CHIP_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EContext.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

export type ChipTone =
  | "neutral"
  | "primary"
  | "secondary"
  | "tertiary"
  | "success"
  | "warning"
  | "error";
export type ChipVariant = "tonal" | "outlined" | "solid";
export type ChipSize = "sm" | "md";

export interface M3EChipProps {
  readonly children: React.ReactNode;
  readonly tone?: ChipTone;
  readonly variant?: ChipVariant;
  readonly size?: ChipSize;
  readonly elevated?: boolean;
  readonly dot?: boolean;
  readonly icon?: React.ReactNode;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly onRemove?: () => void;
  readonly removeLabel?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3EAssistChipProps {
  readonly children: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly elevated?: boolean;
  readonly disabled?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3EFilterChipProps {
  readonly children: React.ReactNode;
  readonly selected?: boolean;
  readonly defaultSelected?: boolean;
  readonly onSelectedChange?: (selected: boolean) => void;
  readonly icon?: React.ReactNode;
  readonly elevated?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3EInputChipProps {
  readonly children: React.ReactNode;
  readonly avatar?: React.ReactNode;
  readonly selected?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly onRemove?: () => void;
  readonly removeLabel?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ESuggestionChipProps {
  readonly children: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly elevated?: boolean;
  readonly selected?: boolean;
  readonly disabled?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function ChipCheckSvg() {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChipCloseSvg() {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function ChipStatusRemoveSvg() {
  return (
    <svg
      width={12}
      height={12}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function Chip({
  children,
  tone = "neutral",
  variant = "tonal",
  size = "md",
  elevated = false,
  dot = false,
  icon,
  onClick,
  onRemove,
  removeLabel,
  disabled = false,
  className,
  style,
}: M3EChipProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const hasAction = Boolean(onClick);
  const { isPressed, pressHandlers } = usePressHoldState(
    disabled || !hasAction,
  );
  const restRadius = size === "sm" ? 11 : 13;
  const r = useM3EScalarSpring(
    hasAction && isPressed ? 6 : restRadius,
    "fastSpatial",
  );
  const mergedClassName = className
    ? `m3e-chip-status ${className}`
    : "m3e-chip-status";

  const innerContent = (
    <>
      {dot ? (
        <span className="m3e-chip-status__dot" aria-hidden="true" />
      ) : null}
      {icon ? (
        <span className="m3e-chip-status__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="m3e-chip-status__label">{children}</span>
    </>
  );

  if (hasAction && !onRemove) {
    return (
      <BaseButton
        type="button"
        disabled={disabled}
        onClick={onClick}
        className={mergedClassName}
        data-interactive=""
        data-tone={tone}
        data-variant={variant}
        data-size={size}
        data-elevated={elevated ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        style={{
          borderRadius: `${Math.max(4, r).toFixed(1)}px`,
          ...style,
        }}
        {...pressHandlers}
      >
        {innerContent}
      </BaseButton>
    );
  }

  if (hasAction && onRemove) {
    return (
      <span
        className={mergedClassName}
        data-interactive=""
        data-compound=""
        data-tone={tone}
        data-variant={variant}
        data-size={size}
        data-elevated={elevated ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        style={{
          borderRadius: `${Math.max(4, r).toFixed(1)}px`,
          ...style,
        }}
      >
        <BaseButton
          type="button"
          disabled={disabled}
          onClick={onClick}
          className="m3e-chip-status__action"
          {...pressHandlers}
        >
          {innerContent}
        </BaseButton>
        <button
          type="button"
          disabled={disabled}
          aria-label={removeLabel ?? t("chip.remove")}
          className="m3e-chip-status__remove"
          onClick={onRemove}
        >
          <ChipStatusRemoveSvg />
        </button>
      </span>
    );
  }

  return (
    <span
      className={mergedClassName}
      data-tone={tone}
      data-variant={variant}
      data-size={size}
      data-elevated={elevated ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      style={style}
    >
      {innerContent}
      {onRemove ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={removeLabel ?? t("chip.remove")}
          className="m3e-chip-status__remove"
          onClick={onRemove}
        >
          <ChipStatusRemoveSvg />
        </button>
      ) : null}
    </span>
  );
}

export function AssistChip({
  children,
  icon,
  elevated = false,
  disabled = false,
  onClick,
  className,
  style,
}: M3EAssistChipProps): React.JSX.Element {
  const { isPressed, pressHandlers } = usePressHoldState(disabled);
  const r = useM3EScalarSpring(
    isPressed ? CHIP_TOKENS.pressedRadius : CHIP_TOKENS.restRadius,
    "fastSpatial",
  );
  const hasLeading = Boolean(icon);

  return (
    <BaseButton
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        className
          ? `m3e-chip m3e-chip--assist ${className}`
          : "m3e-chip m3e-chip--assist"
      }
      data-elevated={elevated ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        height: `${CHIP_TOKENS.height}px`,
        paddingInlineStart: `${hasLeading ? CHIP_TOKENS.iconPaddingInline : CHIP_TOKENS.paddingInline}px`,
        paddingInlineEnd: `${CHIP_TOKENS.paddingInline}px`,
        gap: `${CHIP_TOKENS.gap}px`,
        borderRadius: `${Math.max(2, r).toFixed(1)}px`,
        ...style,
      }}
      {...pressHandlers}
    >
      {icon ? (
        <span className="m3e-chip__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </BaseButton>
  );
}

export function FilterChip({
  children,
  selected: controlledSelected,
  defaultSelected = false,
  onSelectedChange,
  icon,
  elevated = false,
  disabled = false,
  className,
  style,
}: M3EFilterChipProps): React.JSX.Element {
  const [uncontrolledSelected, setUncontrolledSelected] =
    React.useState<boolean>(defaultSelected);
  const isSelected = controlledSelected ?? uncontrolledSelected;
  const { isPressed, pressHandlers } = usePressHoldState(disabled);

  const targetRadius = isPressed
    ? CHIP_TOKENS.pressedRadius
    : isSelected
      ? CHIP_TOKENS.selectedRadius
      : CHIP_TOKENS.restRadius;

  const r = useM3EScalarSpring(targetRadius, "fastSpatial");
  const hasLeading = isSelected || Boolean(icon);

  return (
    <BaseToggle
      pressed={controlledSelected}
      defaultPressed={defaultSelected}
      disabled={disabled}
      onPressedChange={(next) => {
        if (controlledSelected === undefined) {
          setUncontrolledSelected(next);
        }
        onSelectedChange?.(next);
      }}
      className={
        className
          ? `m3e-chip m3e-chip--filter ${className}`
          : "m3e-chip m3e-chip--filter"
      }
      data-selected={isSelected ? "" : undefined}
      data-elevated={elevated ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        height: `${CHIP_TOKENS.height}px`,
        paddingInlineStart: `${hasLeading ? CHIP_TOKENS.iconPaddingInline : CHIP_TOKENS.paddingInline}px`,
        paddingInlineEnd: `${CHIP_TOKENS.paddingInline}px`,
        gap: `${CHIP_TOKENS.gap}px`,
        borderRadius: `${Math.max(2, r).toFixed(1)}px`,
        ...style,
      }}
      {...pressHandlers}
    >
      {isSelected ? (
        <span className="m3e-chip__icon" aria-hidden="true">
          <ChipCheckSvg />
        </span>
      ) : icon ? (
        <span className="m3e-chip__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </BaseToggle>
  );
}

export function InputChip({
  children,
  avatar,
  selected = false,
  onClick,
  onRemove,
  removeLabel,
  disabled = false,
  className,
  style,
}: M3EInputChipProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedRemoveLabel = removeLabel ?? t("chip.remove");
  const hasAction = Boolean(onClick);
  const { isPressed, pressHandlers } = usePressHoldState(
    disabled || !hasAction,
  );
  const targetRadius = isPressed
    ? CHIP_TOKENS.pressedRadius
    : selected
      ? CHIP_TOKENS.selectedRadius
      : CHIP_TOKENS.restRadius;
  const r = useM3EScalarSpring(targetRadius, "fastSpatial");

  const hasLeading = Boolean(avatar);
  const hasTrailing = Boolean(onRemove);

  const handleRemoveKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!disabled && onRemove && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      onRemove();
    }
  };

  return (
    <span
      className={
        className
          ? `m3e-chip m3e-chip--input ${className}`
          : "m3e-chip m3e-chip--input"
      }
      data-selected={selected ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      data-compound={hasAction ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      style={{
        height: `${CHIP_TOKENS.height}px`,
        paddingInlineStart: hasAction
          ? "0px"
          : `${hasLeading ? CHIP_TOKENS.iconPaddingInline : CHIP_TOKENS.paddingInline}px`,
        paddingInlineEnd: hasAction
          ? hasTrailing
            ? `${CHIP_TOKENS.iconPaddingInline}px`
            : "0px"
          : `${hasTrailing ? CHIP_TOKENS.iconPaddingInline : CHIP_TOKENS.paddingInline}px`,
        gap: hasAction ? "0px" : `${CHIP_TOKENS.gap}px`,
        borderRadius: `${Math.max(2, r).toFixed(1)}px`,
        ...style,
      }}
    >
      {hasAction ? (
        <BaseButton
          type="button"
          disabled={disabled}
          aria-pressed={selected ? true : undefined}
          onClick={onClick}
          className="m3e-chip__action"
          style={{
            paddingInlineStart: `${hasLeading ? CHIP_TOKENS.iconPaddingInline : CHIP_TOKENS.paddingInline}px`,
            paddingInlineEnd: `${hasTrailing ? CHIP_TOKENS.gap : CHIP_TOKENS.paddingInline}px`,
            gap: `${CHIP_TOKENS.gap}px`,
          }}
          {...pressHandlers}
          onKeyDown={(e) => {
            pressHandlers.onKeyDown(e);
            handleRemoveKey(e);
          }}
        >
          {avatar ? <span className="m3e-chip__avatar">{avatar}</span> : null}
          <span className="m3e-chip__label">{children}</span>
        </BaseButton>
      ) : (
        <>
          {avatar ? <span className="m3e-chip__avatar">{avatar}</span> : null}
          <span className="m3e-chip__label">{children}</span>
        </>
      )}
      {onRemove ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={resolvedRemoveLabel}
          className="m3e-chip__remove"
          onClick={onRemove}
          onKeyDown={handleRemoveKey}
        >
          <ChipCloseSvg />
        </button>
      ) : null}
    </span>
  );
}

export function SuggestionChip({
  children,
  icon,
  elevated = false,
  selected = false,
  disabled = false,
  onClick,
  className,
  style,
}: M3ESuggestionChipProps): React.JSX.Element {
  const { isPressed, pressHandlers } = usePressHoldState(disabled);
  const targetRadius = isPressed
    ? CHIP_TOKENS.pressedRadius
    : selected
      ? CHIP_TOKENS.selectedRadius
      : CHIP_TOKENS.restRadius;
  const r = useM3EScalarSpring(targetRadius, "fastSpatial");
  const hasLeading = Boolean(icon);

  return (
    <BaseButton
      type="button"
      disabled={disabled}
      aria-pressed={selected ? true : undefined}
      onClick={onClick}
      className={
        className
          ? `m3e-chip m3e-chip--suggestion ${className}`
          : "m3e-chip m3e-chip--suggestion"
      }
      data-elevated={elevated ? "" : undefined}
      data-selected={selected ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        height: `${CHIP_TOKENS.height}px`,
        paddingInlineStart: `${hasLeading ? CHIP_TOKENS.iconPaddingInline : CHIP_TOKENS.paddingInline}px`,
        paddingInlineEnd: `${CHIP_TOKENS.paddingInline}px`,
        gap: `${CHIP_TOKENS.gap}px`,
        borderRadius: `${Math.max(2, r).toFixed(1)}px`,
        ...style,
      }}
      {...pressHandlers}
    >
      {icon ? (
        <span className="m3e-chip__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span className="m3e-chip__label">{children}</span>
    </BaseButton>
  );
}
