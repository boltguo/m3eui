"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import {
  CHECKBOX_TOKENS,
} from "../../tokens/topology.js";
import { useM3EScalarSpring, usePressHoldState } from "../../hooks/useM3ESpring.js";
import { FieldsetDisabledContext, useFieldsetDisabled } from "../../internal/fieldOutline.js";
import { FormFieldScope, useFormReset } from "../../internal/formField.js";
import { mergeInteractionHandlers, useM3ERipple } from "../../internal/ripple.js";

export interface M3ECheckboxProps {
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly indeterminate?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly value?: string;
  readonly name?: string;
  readonly id?: string;
  readonly parent?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly label?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export interface M3ECheckboxGroupProps {
  readonly children: React.ReactNode;
  readonly value?: string[];
  readonly defaultValue?: string[];
  readonly allValues?: string[];
  readonly onValueChange?: (value: string[]) => void;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function CheckGlyph({
  checked,
  indeterminate,
}: {
  readonly checked: boolean;
  readonly indeterminate: boolean;
}) {
  const active = checked || indeterminate;
  const draw = useM3EScalarSpring(active ? 1 : 0, "defaultSpatial");
  const grav = useM3EScalarSpring(indeterminate ? 1 : 0, "fastSpatial");
  const clampedDraw = Math.max(0, Math.min(1, draw));
  const g = Math.max(0, Math.min(1, grav));
  const x1 = 4.5 + 0.5 * g;
  const y1 = 12.5 - 0.5 * g;
  const x2 = 9.5 + 2.5 * g;
  const y2 = 17.5 - 5.5 * g;
  const x3 = 19.5 - 0.5 * g;
  const y3 = 6.5 + 5.5 * g;
  const d = `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)}`;

  return (
    <svg
      width={13}
      height={13}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path
        d={d}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={(1 - clampedDraw).toFixed(3)}
        style={{ opacity: clampedDraw <= 0.01 ? 0 : 1 }}
      />
    </svg>
  );
}

export const Checkbox = React.forwardRef<HTMLElement, M3ECheckboxProps>(
  function Checkbox(
    {
      checked,
      defaultChecked,
      indeterminate = false,
      onCheckedChange,
      value,
      name,
      id,
      parent = false,
      disabled,
      readOnly = false,
      required = false,
      label,
      description,
      "aria-label": ariaLabel,
      className,
      style,
    },
    ref,
  ) {
    const isDisabled = useFieldsetDisabled(disabled);
    const [resetKey, setResetKey] = React.useState(0);
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    useFormReset(inputRef, () => setResetKey((k) => k + 1), checked === undefined);
    const { isPressed, pressHandlers } = usePressHoldState(isDisabled || readOnly);
    const { rippleRef, rippleHandlers } = useM3ERipple(isDisabled || readOnly, {
      unbounded: true,
    });
    const mergedInteractionHandlers = mergeInteractionHandlers(
      pressHandlers,
      rippleHandlers,
    );
    const cornerRadius = useM3EScalarSpring(
      isPressed
        ? CHECKBOX_TOKENS.pressedCornerRadius
        : CHECKBOX_TOKENS.cornerRadius,
      "fastSpatial",
    );

    const boxNode = (
      <FormFieldScope name={parent ? undefined : name} disabled={isDisabled}>
      <BaseCheckbox.Root
        ref={ref}
        id={id}
        name={name}
        value={value}
        key={resetKey}
        parent={parent}
        inputRef={inputRef}
        checked={checked}
        defaultChecked={defaultChecked}
        indeterminate={indeterminate}
        disabled={isDisabled}
        readOnly={readOnly}
        required={required}
        aria-label={ariaLabel}
        onCheckedChange={(next) => onCheckedChange?.(next)}
        className={
          !label && className
            ? `m3e-checkbox m3e-checkbox__control ${className}`
            : "m3e-checkbox m3e-checkbox__control"
        }
        data-pressed={isPressed ? "" : undefined}
        style={{
          width: `${CHECKBOX_TOKENS.boxSize}px`,
          height: `${CHECKBOX_TOKENS.boxSize}px`,
          borderRadius: `${Math.max(2, cornerRadius).toFixed(1)}px`,
          ...(!label ? style : undefined),
        }}
        {...(!label ? mergedInteractionHandlers : undefined)}
      >
        <span ref={rippleRef} className="m3e-checkbox__halo m3e-ripple" aria-hidden="true" />
        <BaseCheckbox.Indicator
          keepMounted
          className="m3e-checkbox__indicator"
          render={(props, state) => (
            <span {...props}>
              <CheckGlyph checked={state.checked} indeterminate={state.indeterminate} />
            </span>
          )}
        />
      </BaseCheckbox.Root>
      </FormFieldScope>
    );

    if (!label) {
      return boxNode;
    }

    return (
      <label
        className={
          className
            ? `m3e-control-row m3e-checkbox-row ${className}`
            : "m3e-control-row m3e-checkbox-row"
        }
        data-disabled={isDisabled ? "" : undefined}
        style={{
          minBlockSize: `${CHECKBOX_TOKENS.minTouchTarget}px`,
          ...style,
        }}
        {...(mergedInteractionHandlers as unknown as React.LabelHTMLAttributes<HTMLLabelElement>)}
      >
        {boxNode}
        <span className="m3e-control-row__text">
          <span className="m3e-control-row__label">{label}</span>
          {description ? (
            <span className="m3e-control-row__description">{description}</span>
          ) : null}
        </span>
      </label>
    );
},
);

export function CheckboxGroup({
  children,
  value,
  defaultValue,
  allValues,
  onValueChange,
  disabled,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ECheckboxGroupProps): React.JSX.Element {
  const isDisabled = useFieldsetDisabled(disabled);
  return (
    <FieldsetDisabledContext.Provider value={isDisabled}>
      <BaseCheckboxGroup
        value={value}
        defaultValue={defaultValue}
        allValues={allValues}
        disabled={isDisabled}
        aria-label={ariaLabel}
        onValueChange={(next) => onValueChange?.(next)}
        className={
          className ? `m3e-checkbox-group ${className}` : "m3e-checkbox-group"
        }
        style={style}
      >
        {children}
      </BaseCheckboxGroup>
    </FieldsetDisabledContext.Provider>
  );
}
