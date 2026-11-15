"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import { CHECKBOX_TOKENS } from "../tokens/index.js";
import { useM3EScalarSpring, usePressHoldState } from "../hooks/useM3ESpring.js";
import { FieldsetDisabledContext, useFieldsetDisabled } from "../internal/fieldOutline.js";

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

function CheckGlyph({ indeterminate }: { readonly indeterminate: boolean }) {
  if (indeterminate) {
    return (
      <svg
        width={13}
        height={13}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.4"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <line x1="5" y1="12" x2="19" y2="12" />
      </svg>
    );
  }
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
      <polyline points="20 6 9 17 4 12" />
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
    const { isPressed, pressHandlers } = usePressHoldState(isDisabled || readOnly);
    const cornerRadius = useM3EScalarSpring(
      isPressed
        ? CHECKBOX_TOKENS.pressedCornerRadius
        : CHECKBOX_TOKENS.cornerRadius,
      "fastSpatial",
    );

    const boxNode = (
      <BaseCheckbox.Root
        ref={ref}
        id={id}
        name={name}
        value={value}
        parent={parent}
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
        {...pressHandlers}
      >
        <span className="m3e-checkbox__halo" aria-hidden="true" />
        <BaseCheckbox.Indicator
          keepMounted
          className="m3e-checkbox__indicator"
          render={(props, state) => (
            <span {...props}>
              <CheckGlyph indeterminate={state.indeterminate} />
            </span>
          )}
        />
      </BaseCheckbox.Root>
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
