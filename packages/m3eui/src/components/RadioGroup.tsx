import * as React from "react";
import { Radio as BaseRadio } from "@base-ui/react/radio";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { RADIO_TOKENS } from "../tokens/index.js";
import { usePressHoldState } from "../hooks/useM3ESpring.js";

export interface M3ERadioGroupProps<Value extends string = string> {
  readonly children: React.ReactNode;
  readonly value?: Value;
  readonly defaultValue?: Value;
  readonly onValueChange?: (value: Value) => void;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly orientation?: "horizontal" | "vertical";
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ERadioProps<Value extends string = string> {
  readonly value: Value;
  readonly label?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly id?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function RadioGroup<Value extends string = string>({
  children,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  readOnly = false,
  required = false,
  name,
  orientation = "vertical",
  "aria-label": ariaLabel,
  className,
  style,
}: M3ERadioGroupProps<Value>): React.JSX.Element {
  return (
    <BaseRadioGroup
      value={value}
      defaultValue={defaultValue}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      name={name}
      aria-label={ariaLabel}
      onValueChange={(next) => onValueChange?.(next as Value)}
      className={
        className ? `m3e-radio-group ${className}` : "m3e-radio-group"
      }
      data-orientation={orientation}
      style={style}
    >
      {children}
    </BaseRadioGroup>
  );
}

export function Radio<Value extends string = string>({
  value,
  label,
  description,
  disabled = false,
  readOnly = false,
  required = false,
  id,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ERadioProps<Value>): React.JSX.Element {
  const { isPressed, pressHandlers } = usePressHoldState(disabled || readOnly);

  const radioNode = (
    <BaseRadio.Root
      id={id}
      value={value}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      aria-label={ariaLabel}
      className={!label && className ? `m3e-radio ${className}` : "m3e-radio"}
      data-pressed={isPressed ? "" : undefined}
      style={{
        width: `${RADIO_TOKENS.ringSize}px`,
        height: `${RADIO_TOKENS.ringSize}px`,
        ...(!label ? style : undefined),
      }}
      {...pressHandlers}
    >
      <BaseRadio.Indicator
        keepMounted
        className="m3e-radio__dot"
        style={{
          width: `${RADIO_TOKENS.dotSize}px`,
          height: `${RADIO_TOKENS.dotSize}px`,
        }}
      />
    </BaseRadio.Root>
  );

  if (!label) {
    return radioNode;
  }

  return (
    <label
      className={
        className
          ? `m3e-control-row m3e-radio-row ${className}`
          : "m3e-control-row m3e-radio-row"
      }
      data-disabled={disabled ? "" : undefined}
      style={{
        minBlockSize: `${RADIO_TOKENS.minTouchTarget}px`,
        ...style,
      }}
    >
      <span className="m3e-radio__halo">{radioNode}</span>
      <span className="m3e-control-row__text">
        <span className="m3e-control-row__label">{label}</span>
        {description ? (
          <span className="m3e-control-row__description">{description}</span>
        ) : null}
      </span>
    </label>
  );
}
