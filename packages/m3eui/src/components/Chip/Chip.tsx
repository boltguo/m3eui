"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import {
  CHIP_TOKENS,
} from "../../tokens/topology.js";
import { useM3EI18n } from "../../context/M3EContext.js";
import { useM3EScalarSpringEffect, usePressHoldState } from "../../hooks/useM3ESpring.js";
import { assignRef } from "../../internal/assignRef.js";
import { CheckIcon, CloseIcon } from "../../internal/icons.js";
import { mergeInteractionHandlers, useM3ERipple } from "../../internal/ripple.js";

function ChipRemoveButton({
  disabled,
  ariaLabel,
  className,
  onClick,
  onKeyDown,
  children,
}: {
  readonly disabled: boolean;
  readonly ariaLabel: string;
  readonly className: string;
  readonly onClick: React.MouseEventHandler<HTMLButtonElement>;
  readonly onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  readonly children: React.ReactNode;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  const mergedHandlers = mergeInteractionHandlers(
    rippleHandlers,
    onKeyDown ? { onKeyDown } : undefined,
  );
  return (
    <button
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      className={className}
      onClick={onClick}
      {...mergedHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {children}
    </button>
  );
}

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

export interface M3EChipLabelProps {
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

export interface M3EChipAssistProps {
  readonly children: React.ReactNode;
  readonly onClick: React.MouseEventHandler<HTMLElement>;
  readonly icon?: React.ReactNode;
  readonly elevated?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3EChipFilterProps {
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

export interface M3EChipInputProps {
  readonly children: React.ReactNode;
  readonly onRemove: () => void;
  readonly avatar?: React.ReactNode;
  readonly selected?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly removeLabel?: string;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export type M3EChipProps =
  | M3EChipLabelProps
  | M3EChipAssistProps
  | M3EChipFilterProps
  | M3EChipInputProps;

function LabelChip(
  {
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
  }: M3EChipLabelProps,
  forwardedRef: React.ForwardedRef<HTMLElement>,
): React.JSX.Element {
  const { t } = useM3EI18n();
  const hasAction = Boolean(onClick);
  const { isPressed, pressHandlers } = usePressHoldState(
    disabled || !hasAction,
  );
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled || !hasAction);
  const mergedActionHandlers = mergeInteractionHandlers(
    pressHandlers,
    rippleHandlers,
  );
  const restRadius = size === "sm" ? 11 : 13;
  const chipRef = React.useRef<HTMLElement | null>(null);
  const mergeChipRef = React.useCallback(
    (node: HTMLElement | null) => {
      chipRef.current = node;
      assignRef(forwardedRef, node);
    },
    [forwardedRef],
  );
  const [initRadius] = React.useState(restRadius);
  useM3EScalarSpringEffect(
    hasAction && isPressed ? 6 : restRadius,
    "fastSpatial",
    (next) => {
      if (hasAction && chipRef.current) {
        chipRef.current.style.borderRadius = `${Math.max(4, next).toFixed(1)}px`;
      }
    },
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
        ref={mergeChipRef as React.Ref<HTMLButtonElement>}
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
          borderRadius: `${Math.max(4, initRadius).toFixed(1)}px`,
          ...style,
        }}
        {...mergedActionHandlers}
      >
        <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
        {innerContent}
      </BaseButton>
    );
  }

  if (hasAction && onRemove) {
    return (
      <span
        ref={mergeChipRef}
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
          borderRadius: `${Math.max(4, initRadius).toFixed(1)}px`,
          ...style,
        }}
      >
        <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
        <BaseButton
          type="button"
          disabled={disabled}
          onClick={onClick}
          className="m3e-chip-status__action"
          {...mergedActionHandlers}
        >
          {innerContent}
        </BaseButton>
        <ChipRemoveButton
          disabled={disabled}
          ariaLabel={removeLabel ?? t("chip.remove")}
          className="m3e-chip-status__remove"
          onClick={onRemove}
        >
          <CloseIcon size={12} strokeWidth={2.5} />
        </ChipRemoveButton>
      </span>
    );
  }

  return (
    <span
      ref={forwardedRef}
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
        <ChipRemoveButton
          disabled={disabled}
          ariaLabel={removeLabel ?? t("chip.remove")}
          className="m3e-chip-status__remove"
          onClick={onRemove}
        >
          <CloseIcon size={12} strokeWidth={2.5} />
        </ChipRemoveButton>
      ) : null}
    </span>
  );
}

function AssistChip(
  {
    children,
    icon,
    elevated = false,
    disabled = false,
    onClick,
    className,
    style,
  }: M3EChipAssistProps,
  forwardedRef: React.ForwardedRef<HTMLElement>,
): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  const hasLeading = Boolean(icon);

  return (
    <BaseButton
      ref={forwardedRef as React.Ref<HTMLButtonElement>}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={
        className
          ? `m3e-chip m3e-chip--assist ${className}`
          : "m3e-chip m3e-chip--assist"
      }
      data-elevated={elevated ? "" : undefined}
      style={{
        height: `${CHIP_TOKENS.height}px`,
        paddingInlineStart: `${hasLeading ? CHIP_TOKENS.iconPaddingInline : CHIP_TOKENS.paddingInline}px`,
        paddingInlineEnd: `${CHIP_TOKENS.paddingInline}px`,
        gap: `${CHIP_TOKENS.gap}px`,
        borderRadius: `${CHIP_TOKENS.restRadius}px`,
        ...style,
      }}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {icon ? (
        <span className="m3e-chip__icon" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span>{children}</span>
    </BaseButton>
  );
}

function FilterChip(
  {
    children,
    selected: controlledSelected,
    defaultSelected = false,
    onSelectedChange,
    icon,
    elevated = false,
    disabled = false,
    className,
    style,
  }: M3EChipFilterProps,
  forwardedRef: React.ForwardedRef<HTMLElement>,
): React.JSX.Element {
  const [uncontrolledSelected, setUncontrolledSelected] =
    React.useState<boolean>(defaultSelected);
  const isSelected = controlledSelected ?? uncontrolledSelected;
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);

  const hasLeading = isSelected || Boolean(icon);

  return (
    <BaseToggle
      ref={forwardedRef as React.Ref<HTMLButtonElement>}
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
      style={{
        height: `${CHIP_TOKENS.height}px`,
        paddingInlineStart: `${hasLeading ? CHIP_TOKENS.iconPaddingInline : CHIP_TOKENS.paddingInline}px`,
        paddingInlineEnd: `${CHIP_TOKENS.paddingInline}px`,
        gap: `${CHIP_TOKENS.gap}px`,
        borderRadius: `${CHIP_TOKENS.restRadius}px`,
        ...style,
      }}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {isSelected ? (
        <span className="m3e-chip__icon" aria-hidden="true">
          <CheckIcon size={15} strokeWidth={2.6} />
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

function InputChip(
  {
    children,
    avatar,
    selected = false,
    onClick,
    onRemove,
    removeLabel,
    disabled = false,
    className,
    style,
  }: M3EChipInputProps,
  forwardedRef: React.ForwardedRef<HTMLElement>,
): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedRemoveLabel = removeLabel ?? t("chip.remove");
  const hasAction = Boolean(onClick);
  const { isPressed, pressHandlers } = usePressHoldState(
    disabled || !hasAction,
  );
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled || !hasAction);

  const hasLeading = Boolean(avatar);
  const hasTrailing = Boolean(onRemove);

  const handleRemoveKey = (e: React.KeyboardEvent<HTMLElement>) => {
    if (!disabled && onRemove && (e.key === "Backspace" || e.key === "Delete")) {
      e.preventDefault();
      onRemove();
    }
  };

  const mergedActionHandlers = mergeInteractionHandlers(
    pressHandlers,
    rippleHandlers,
    { onKeyDown: handleRemoveKey },
  );

  return (
    <span
      ref={forwardedRef}
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
        borderRadius: `${CHIP_TOKENS.restRadius}px`,
        ...style,
      }}
    >
      {hasAction ? <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" /> : null}
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
          {...mergedActionHandlers}
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
        <ChipRemoveButton
          disabled={disabled}
          ariaLabel={resolvedRemoveLabel}
          className="m3e-chip__remove"
          onClick={onRemove}
          onKeyDown={handleRemoveKey}
        >
          <CloseIcon size={14} strokeWidth={2.4} />
        </ChipRemoveButton>
      ) : null}
    </span>
  );
}

export const Chip = React.forwardRef<HTMLElement, M3EChipProps>(function Chip(
  props,
  ref,
): React.JSX.Element {
  const p = props as Partial<M3EChipLabelProps & M3EChipFilterProps & M3EChipInputProps>;
  if (
    p.tone !== undefined ||
    p.variant !== undefined ||
    p.size !== undefined ||
    p.dot !== undefined
  ) {
    return LabelChip(props as M3EChipLabelProps, ref);
  }
  if (
    (p.selected !== undefined && p.onRemove === undefined) ||
    p.defaultSelected !== undefined ||
    p.onSelectedChange !== undefined
  ) {
    return FilterChip(props as M3EChipFilterProps, ref);
  }
  if (p.onRemove !== undefined) {
    return InputChip(props as M3EChipInputProps, ref);
  }
  if (p.onClick !== undefined) {
    return AssistChip(props as M3EChipAssistProps, ref);
  }
  return LabelChip(props as M3EChipLabelProps, ref);
});
