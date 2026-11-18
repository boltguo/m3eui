import * as React from "react";
import { useFormReset } from "../../internal/formField.js";
import { Field as BaseField } from "@base-ui/react/field";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import {
  NUMBER_FIELD_TOKENS,
  flipCornersHorizontal,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  usePressHoldState,
} from "../../hooks/useM3ESpring.js";
import {
  FieldErrorIconSvg,
  useFieldsetDisabled,
} from "../../internal/fieldOutline.js";
import { assignRef } from "../../internal/assignRef.js";

export interface M3ENumberFieldProps {
  readonly label?: React.ReactNode;
  readonly value?: number | null;
  readonly defaultValue?: number;
  readonly onValueChange?: (value: number | null) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly format?: Intl.NumberFormatOptions;
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
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

export const NumberField = React.forwardRef<
  HTMLInputElement,
  M3ENumberFieldProps
>(function NumberField(
  {
    label,
    value: controlledValue,
    defaultValue,
    onValueChange,
    min,
    max,
    step = 1,
    format,
    description,
    errorMessage,
    invalid,
    disabled,
    readOnly = false,
    required = false,
    name,
    id,
    "aria-label": ariaLabel,
    className,
    style,
  },
  forwardedRef,
): React.JSX.Element {
  const { locale, direction, t } = useM3ERuntime();
  const isDisabled = useFieldsetDisabled(disabled);
  const stepBlocked = isDisabled || readOnly;
  const generatedId = React.useId();
  const inputId = id ?? generatedId;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const defaultValRef = React.useRef<number | null>(defaultValue ?? null);
  defaultValRef.current = defaultValue ?? null;

  const [uncontrolledValue, setUncontrolledValue] = React.useState<
    number | null
  >(defaultValue ?? null);
  const currentValue =
    controlledValue !== undefined ? controlledValue : uncontrolledValue;

  useFormReset(
    inputRef,
    () => setUncontrolledValue(defaultValRef.current),
    controlledValue === undefined,
  );

  const { isPressed: decPressed, pressHandlers: decHandlers } =
    usePressHoldState(stepBlocked);
  const { isPressed: incPressed, pressHandlers: incHandlers } =
    usePressHoldState(stepBlocked);

  const pill = NUMBER_FIELD_TOKENS.outerRadius;
  const decInner =
    !stepBlocked && decPressed
      ? NUMBER_FIELD_TOKENS.innerPressedRadius
      : NUMBER_FIELD_TOKENS.innerRestRadius;
  const incInner =
    !stepBlocked && incPressed
      ? NUMBER_FIELD_TOKENS.innerPressedRadius
      : NUMBER_FIELD_TOKENS.innerRestRadius;

  const rawDecCorners = [pill, decInner, decInner, pill] as const;
  const rawIncCorners = [incInner, pill, pill, incInner] as const;

  const decSpring = useM3ECornerSpringRef<HTMLButtonElement>(
    direction === "rtl" ? flipCornersHorizontal(rawDecCorners) : rawDecCorners,
    "fastSpatial",
  );
  const incSpring = useM3ECornerSpringRef<HTMLButtonElement>(
    direction === "rtl" ? flipCornersHorizontal(rawIncCorners) : rawIncCorners,
    "fastSpatial",
  );

  const hasExplicitError = Boolean(invalid || errorMessage);

  return (
    <BaseField.Root
      name={name}
      disabled={isDisabled || undefined}
      invalid={errorMessage ? true : invalid}
      render={
        <BaseNumberField.Root
          id={inputId}
          name={name}
          inputRef={inputRef}
          value={currentValue}
          min={min}
          max={max}
          step={step}
          locale={locale}
          format={format}
          disabled={isDisabled}
          readOnly={readOnly}
          required={required}
          onValueChange={(next) => {
            if (readOnly) return;
            if (controlledValue === undefined) {
              setUncontrolledValue(next);
            }
            onValueChange?.(next);
          }}
          className={
            className ? `m3e-number-field ${className}` : "m3e-number-field"
          }
          data-readonly={readOnly ? "" : undefined}
          data-invalid={hasExplicitError ? "" : undefined}
          style={style}
        />
      }
    >
      {label ? (
        <BaseNumberField.ScrubArea className="m3e-number-field__scrub">
          <BaseField.Label htmlFor={inputId} className="m3e-field__label">
            {label}
            {required ? (
              <span className="m3e-field__required" aria-hidden="true">
                {" "}*
              </span>
            ) : null}
          </BaseField.Label>
        </BaseNumberField.ScrubArea>
      ) : null}

      {description ? (
        <BaseField.Description className="m3e-field__description">
          {description}
        </BaseField.Description>
      ) : null}

      <BaseNumberField.Group
        className="m3e-number-field__group m3e-number-field__shell"
        data-readonly={readOnly ? "" : undefined}
        data-invalid={hasExplicitError ? "" : undefined}
        style={{ gap: `${NUMBER_FIELD_TOKENS.seamGap}px` }}
      >
        <BaseNumberField.Decrement
          ref={decSpring.ref}
          aria-label={t("numberField.decrement")}
          className="m3e-number-field__step"
          style={{
            width: `${NUMBER_FIELD_TOKENS.stepperWidth}px`,
            height: `${NUMBER_FIELD_TOKENS.height}px`,
            borderRadius: decSpring.borderRadiusCss,
          }}
          {...(stepBlocked ? undefined : decHandlers)}
        >
          <MinusGlyph />
        </BaseNumberField.Decrement>

        <BaseNumberField.Input
          ref={(node) => {
            const inputNode =
              node instanceof HTMLInputElement ? node : null;
            inputRef.current = inputNode;
            assignRef(forwardedRef, inputNode);
          }}
          aria-label={!label ? ariaLabel : undefined}
          className="m3e-number-field__input"
          style={{
            height: `${NUMBER_FIELD_TOKENS.height}px`,
            borderRadius: `${NUMBER_FIELD_TOKENS.innerRestRadius}px`,
          }}
        />

        <BaseNumberField.Increment
          ref={incSpring.ref}
          aria-label={t("numberField.increment")}
          className="m3e-number-field__step"
          style={{
            width: `${NUMBER_FIELD_TOKENS.stepperWidth}px`,
            height: `${NUMBER_FIELD_TOKENS.height}px`,
            borderRadius: incSpring.borderRadiusCss,
          }}
          {...(stepBlocked ? undefined : incHandlers)}
        >
          <PlusGlyph />
        </BaseNumberField.Increment>
      </BaseNumberField.Group>

      {!isDisabled ? (
        <BaseField.Error
          match={hasExplicitError ? true : undefined}
          className="m3e-field__error"
          render={(errorProps) => {
            const resolvedMessage =
              errorMessage ??
              errorProps.children ??
              (invalid ? t("textField.defaultInvalid") : null);
            return (
              <div {...errorProps}>
                <FieldErrorIconSvg label={t("textField.errorIcon")} />
                <span>{resolvedMessage}</span>
              </div>
            );
          }}
        />
      ) : null}
    </BaseField.Root>
  );
});
