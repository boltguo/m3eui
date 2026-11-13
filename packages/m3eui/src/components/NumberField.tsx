import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { NUMBER_FIELD_TOKENS, flipCornersHorizontal } from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import {
  useM3ECornerSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

export interface M3ENumberFieldProps {
  readonly label?: React.ReactNode;
  readonly value?: number | null;
  readonly defaultValue?: number;
  readonly onValueChange?: (value: number | null) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly format?: Intl.NumberFormatOptions;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly id?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function MinusGlyph() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function PlusGlyph() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function NumberField({
  label,
  value,
  defaultValue,
  onValueChange,
  min,
  max,
  step = 1,
  format,
  disabled = false,
  readOnly = false,
  required = false,
  name,
  id,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ENumberFieldProps): React.JSX.Element {
  const { locale, direction, t } = useM3E();
  const generatedId = React.useId();
  const inputId = id ?? generatedId;

  const { isPressed: decPressed, pressHandlers: decHandlers } =
    usePressHoldState(disabled || readOnly);
  const { isPressed: incPressed, pressHandlers: incHandlers } =
    usePressHoldState(disabled || readOnly);

  const pill = NUMBER_FIELD_TOKENS.outerRadius;
  const decInner = decPressed
    ? NUMBER_FIELD_TOKENS.innerPressedRadius
    : NUMBER_FIELD_TOKENS.innerRestRadius;
  const incInner = incPressed
    ? NUMBER_FIELD_TOKENS.innerPressedRadius
    : NUMBER_FIELD_TOKENS.innerRestRadius;

  const rawDecCorners = [pill, decInner, decInner, pill] as const;
  const rawIncCorners = [incInner, pill, pill, incInner] as const;

  const { borderRadiusCss: decRadiusCss } = useM3ECornerSpring(
    direction === "rtl" ? flipCornersHorizontal(rawDecCorners) : rawDecCorners,
    "fastSpatial",
  );
  const { borderRadiusCss: incRadiusCss } = useM3ECornerSpring(
    direction === "rtl" ? flipCornersHorizontal(rawIncCorners) : rawIncCorners,
    "fastSpatial",
  );

  return (
    <BaseNumberField.Root
      id={inputId}
      name={name}
      value={value}
      defaultValue={defaultValue}
      min={min}
      max={max}
      step={step}
      locale={locale}
      format={format}
      disabled={disabled}
      readOnly={readOnly}
      required={required}
      onValueChange={(next) => onValueChange?.(next)}
      className={
        className ? `m3e-number-field ${className}` : "m3e-number-field"
      }
      style={style}
    >
      {label ? (
        <BaseNumberField.ScrubArea className="m3e-number-field__scrub">
          <label htmlFor={inputId} className="m3e-field__label">
            {label}
          </label>
        </BaseNumberField.ScrubArea>
      ) : null}

      <BaseNumberField.Group
        className="m3e-number-field__group"
        style={{ gap: `${NUMBER_FIELD_TOKENS.seamGap}px` }}
      >
        <BaseNumberField.Decrement
          aria-label={t("numberField.decrement")}
          className="m3e-number-field__step"
          style={{
            width: `${NUMBER_FIELD_TOKENS.stepperWidth}px`,
            height: `${NUMBER_FIELD_TOKENS.height}px`,
            borderRadius: decRadiusCss,
          }}
          {...decHandlers}
        >
          <MinusGlyph />
        </BaseNumberField.Decrement>

        <BaseNumberField.Input
          aria-label={!label ? ariaLabel : undefined}
          className="m3e-number-field__input"
          style={{
            height: `${NUMBER_FIELD_TOKENS.height}px`,
            borderRadius: `${NUMBER_FIELD_TOKENS.innerRestRadius}px`,
          }}
        />

        <BaseNumberField.Increment
          aria-label={t("numberField.increment")}
          className="m3e-number-field__step"
          style={{
            width: `${NUMBER_FIELD_TOKENS.stepperWidth}px`,
            height: `${NUMBER_FIELD_TOKENS.height}px`,
            borderRadius: incRadiusCss,
          }}
          {...incHandlers}
        >
          <PlusGlyph />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>
    </BaseNumberField.Root>
  );
}
