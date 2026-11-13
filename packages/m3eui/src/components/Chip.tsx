import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import { CHIP_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

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
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3EInputChipProps {
  readonly children: React.ReactNode;
  readonly avatar?: React.ReactNode;
  readonly onRemove?: () => void;
  readonly removeLabel?: string;
  readonly disabled?: boolean;
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
      style={{
        height: `${CHIP_TOKENS.height}px`,
        paddingInline: `${CHIP_TOKENS.paddingInline}px`,
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
      style={{
        height: `${CHIP_TOKENS.height}px`,
        paddingInline: `${CHIP_TOKENS.paddingInline}px`,
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
  onRemove,
  removeLabel,
  disabled = false,
  className,
  style,
}: M3EInputChipProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedRemoveLabel = removeLabel ?? t("chip.remove");
  return (
    <span
      className={
        className
          ? `m3e-chip m3e-chip--input ${className}`
          : "m3e-chip m3e-chip--input"
      }
      data-disabled={disabled ? "" : undefined}
      style={{
        height: `${CHIP_TOKENS.height}px`,
        borderRadius: `${CHIP_TOKENS.restRadius}px`,
        ...style,
      }}
    >
      {avatar ? <span className="m3e-chip__avatar">{avatar}</span> : null}
      <span className="m3e-chip__label">{children}</span>
      {onRemove ? (
        <button
          type="button"
          disabled={disabled}
          aria-label={resolvedRemoveLabel}
          className="m3e-chip__remove"
          onClick={onRemove}
        >
          <ChipCloseSvg />
        </button>
      ) : null}
    </span>
  );
}
