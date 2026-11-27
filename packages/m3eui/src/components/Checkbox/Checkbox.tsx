"use client";

import * as React from "react";
import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { CheckboxGroup as BaseCheckboxGroup } from "@base-ui/react/checkbox-group";
import {
  CHECKBOX_TOKENS,
} from "../../tokens/topology.js";
import { useM3EScalarSpringEffect, usePressHoldState } from "../../hooks/useM3ESpring.js";
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

function computeCheckPath(draw: number, grav: number): {
  readonly d: string;
  readonly dashOffset: string;
  readonly opacity: string;
} {
  const clampedDraw = Math.max(0, Math.min(1, draw));
  const g = Math.max(0, Math.min(1, grav));
  const x1 = 4.5 + 0.5 * g;
  const y1 = 12.5 - 0.5 * g;
  const x2 = 9.5 + 2.5 * g;
  const y2 = 17.5 - 5.5 * g;
  const x3 = 19.5 - 0.5 * g;
  const y3 = 6.5 + 5.5 * g;
  return {
    d: `M ${x1.toFixed(2)} ${y1.toFixed(2)} L ${x2.toFixed(2)} ${y2.toFixed(2)} L ${x3.toFixed(2)} ${y3.toFixed(2)}`,
    dashOffset: (1 - clampedDraw).toFixed(3),
    opacity: clampedDraw <= 0.01 ? "0" : "1",
  };
}

function CheckGlyph({
  checked,
  indeterminate,
}: {
  readonly checked: boolean;
  readonly indeterminate: boolean;
}) {
  const active = checked || indeterminate;
  const pathRef = React.useRef<SVGPathElement | null>(null);
  const drawRef = React.useRef(active ? 1 : 0);
  const gravRef = React.useRef(indeterminate ? 1 : 0);

  const applyGlyph = React.useCallback(() => {
    const path = pathRef.current;
    if (!path) return;
    const next = computeCheckPath(drawRef.current, gravRef.current);
    path.setAttribute("d", next.d);
    path.setAttribute("stroke-dashoffset", next.dashOffset);
    path.style.opacity = next.opacity;
  }, []);

  useM3EScalarSpringEffect(active ? 1 : 0, "defaultSpatial", (val) => {
    drawRef.current = val;
    applyGlyph();
  });
  useM3EScalarSpringEffect(indeterminate ? 1 : 0, "fastSpatial", (val) => {
    gravRef.current = val;
    applyGlyph();
  });

  const initial = computeCheckPath(drawRef.current, gravRef.current);

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
        ref={pathRef}
        d={initial.d}
        pathLength={1}
        strokeDasharray={1}
        strokeDashoffset={initial.dashOffset}
        style={{ opacity: Number(initial.opacity) }}
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
    const boxRef = React.useRef<HTMLElement | null>(null);
    const setBoxRef = React.useCallback(
      (node: HTMLElement | null) => {
        boxRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );
    useFormReset(inputRef, () => setResetKey((k) => k + 1), checked === undefined);
    const { isPressed, pressHandlers } = usePressHoldState(isDisabled || readOnly);
    const { rippleRef, rippleHandlers } = useM3ERipple(isDisabled || readOnly, {
      unbounded: true,
    });
    const mergedInteractionHandlers = mergeInteractionHandlers(
      pressHandlers,
      rippleHandlers,
    );
    const targetCornerRadius = isPressed
      ? CHECKBOX_TOKENS.pressedCornerRadius
      : CHECKBOX_TOKENS.cornerRadius;
    const cornerRadiusRef = React.useRef<number>(targetCornerRadius);
    useM3EScalarSpringEffect(targetCornerRadius, "fastSpatial", (val) => {
      cornerRadiusRef.current = val;
      if (boxRef.current) {
        boxRef.current.style.borderRadius = `${Math.max(2, val).toFixed(1)}px`;
      }
    });

    const boxNode = (
      <FormFieldScope name={parent ? undefined : name} disabled={isDisabled}>
      <BaseCheckbox.Root
        ref={setBoxRef}
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
          borderRadius: `${Math.max(2, cornerRadiusRef.current).toFixed(1)}px`,
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
