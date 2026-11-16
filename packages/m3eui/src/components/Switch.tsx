"use client";

import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { SWITCH_TOKENS, resolveSwitchGeometry } from "../tokens/index.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useM3EScalarSpringEffect, usePressHoldState } from "../hooks/useM3ESpring.js";
import { useFieldsetDisabled } from "../internal/fieldOutline.js";
import { FormFieldScope, useFormReset } from "../internal/formField.js";

export interface M3ESwitchProps {
  readonly checked?: boolean;
  readonly defaultChecked?: boolean;
  readonly onCheckedChange?: (checked: boolean) => void;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly required?: boolean;
  readonly name?: string;
  readonly id?: string;
  readonly label?: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly showIcons?: boolean;
  readonly checkedIcon?: React.ReactNode;
  readonly uncheckedIcon?: React.ReactNode;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function SwitchCheckSvg() {
  return (
    <svg
      width={SWITCH_TOKENS.thumbIconSize}
      height={SWITCH_TOKENS.thumbIconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function SwitchCloseSvg() {
  return (
    <svg
      width={SWITCH_TOKENS.thumbIconSize}
      height={SWITCH_TOKENS.thumbIconSize}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export const Switch = React.forwardRef<HTMLElement, M3ESwitchProps>(
  function Switch(
    {
      checked: controlledChecked,
      defaultChecked = false,
      onCheckedChange,
      disabled,
      readOnly = false,
      required = false,
      name,
      id,
      label,
      description,
      showIcons = false,
      checkedIcon,
      uncheckedIcon,
      "aria-label": ariaLabel,
      className,
      style,
    },
    ref,
  ) {
    const { debugGeometry, direction } = useM3ERuntime();
    const isDisabled = useFieldsetDisabled(disabled);
    const [uncontrolledChecked, setUncontrolledChecked] =
      React.useState<boolean>(defaultChecked);
    const isChecked = controlledChecked ?? uncontrolledChecked;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    useFormReset(inputRef, () => setUncontrolledChecked(defaultChecked), controlledChecked === undefined);

    const { isPressed, pressHandlers } = usePressHoldState(isDisabled || readOnly);

    const resolvedCheckedIcon =
      checkedIcon !== undefined ? checkedIcon : showIcons ? <SwitchCheckSvg /> : null;
    const resolvedUncheckedIcon =
      uncheckedIcon !== undefined ? uncheckedIcon : showIcons ? <SwitchCloseSvg /> : null;

    const geo = resolveSwitchGeometry({
      checked: isChecked,
      isPressed,
      hasUncheckedIcon: Boolean(resolvedUncheckedIcon),
    });

    const thumbRef = React.useRef<HTMLSpanElement | null>(null);
    const thumbStateRef = React.useRef({
      size: geo.thumbSize,
      offsetPx: geo.thumbOffsetPx,
    });
    const rtlSign = direction === "rtl" ? -1 : 1;
    const applyThumb = () => {
      const el = thumbRef.current;
      if (!el) return;
      const { size, offsetPx } = thumbStateRef.current;
      el.style.width = `${size.toFixed(2)}px`;
      el.style.height = `${size.toFixed(2)}px`;
      el.style.translate = `${(rtlSign * offsetPx).toFixed(2)}px -50%`;
    };
    useM3EScalarSpringEffect(geo.thumbSize, "fastSpatial", (val) => {
      thumbStateRef.current.size = Math.max(10, val);
      applyThumb();
    });
    useM3EScalarSpringEffect(geo.thumbOffsetPx, "fastSpatial", (val) => {
      thumbStateRef.current.offsetPx = val;
      applyThumb();
    });
    const switchNode = (
      <FormFieldScope name={name} disabled={isDisabled}>
      <BaseSwitch.Root
        ref={ref}
        id={id}
      name={name}
      inputRef={inputRef}
      checked={isChecked}
      disabled={isDisabled}
      readOnly={readOnly}
      required={required}
      aria-label={ariaLabel}
      onCheckedChange={(next) => {
        if (controlledChecked === undefined) {
          setUncontrolledChecked(next);
        }
        onCheckedChange?.(next);
      }}
      className={
        !label && className ? `m3e-switch ${className}` : "m3e-switch"
      }
      style={!label ? style : undefined}
      data-pressed={isPressed ? "" : undefined}
      {...pressHandlers}
    >
      <BaseSwitch.Thumb
        ref={thumbRef}
        className="m3e-switch__thumb"
        style={{
          width: `${thumbStateRef.current.size.toFixed(2)}px`,
          height: `${thumbStateRef.current.size.toFixed(2)}px`,
          translate: `${(rtlSign * thumbStateRef.current.offsetPx).toFixed(2)}px -50%`,
        }}
      >
        {isChecked && resolvedCheckedIcon ? (
          <span
            className="m3e-switch__icon"
            style={{
              width: `${SWITCH_TOKENS.thumbIconSize}px`,
              height: `${SWITCH_TOKENS.thumbIconSize}px`,
            }}
            aria-hidden="true"
          >
            {resolvedCheckedIcon}
          </span>
        ) : !isChecked && resolvedUncheckedIcon ? (
          <span
            className="m3e-switch__icon"
            style={{
              width: `${SWITCH_TOKENS.thumbIconSize}px`,
              height: `${SWITCH_TOKENS.thumbIconSize}px`,
            }}
            aria-hidden="true"
          >
            {resolvedUncheckedIcon}
          </span>
        ) : null}
      </BaseSwitch.Thumb>
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          ⌀{Math.round(geo.thumbSize)}@{Math.round(geo.thumbOffsetPx)}
        </span>
      ) : null}
    </BaseSwitch.Root>
      </FormFieldScope>
  );

  if (!label) {
    return switchNode;
  }

  return (
    <label
      className={
        className
          ? `m3e-control-row m3e-switch-row ${className}`
          : "m3e-control-row m3e-switch-row"
      }
      data-disabled={isDisabled ? "" : undefined}
      style={{
        minBlockSize: `${SWITCH_TOKENS.minTouchTarget}px`,
        ...style,
      }}
    >
      <span className="m3e-control-row__text">
        <span className="m3e-control-row__label">{label}</span>
        {description ? (
          <span className="m3e-control-row__description">{description}</span>
        ) : null}
      </span>
      {switchNode}
    </label>
  );
},
);
