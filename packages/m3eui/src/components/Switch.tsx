import * as React from "react";
import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { SWITCH_TOKENS, resolveSwitchGeometry } from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import { useM3EScalarSpring, usePressHoldState } from "../hooks/useM3ESpring.js";

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
      width={14}
      height={14}
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
      width={13}
      height={13}
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
      disabled = false,
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
    const { debugGeometry, direction } = useM3E();
    const [uncontrolledChecked, setUncontrolledChecked] =
      React.useState<boolean>(defaultChecked);
    const isChecked = controlledChecked ?? uncontrolledChecked;

    const { isPressed, pressHandlers } = usePressHoldState(disabled || readOnly);

    const resolvedCheckedIcon =
      checkedIcon !== undefined ? checkedIcon : showIcons ? <SwitchCheckSvg /> : null;
    const resolvedUncheckedIcon =
      uncheckedIcon !== undefined ? uncheckedIcon : showIcons ? <SwitchCloseSvg /> : null;

    const geo = resolveSwitchGeometry({
      checked: isChecked,
      isPressed,
      hasUncheckedIcon: Boolean(resolvedUncheckedIcon),
    });

    const springThumbSize = Math.max(
      10,
      useM3EScalarSpring(geo.thumbSize, "fastSpatial"),
    );
    const springOffsetPx = useM3EScalarSpring(geo.thumbOffsetPx, "fastSpatial");
    const signedThumbX = direction === "rtl" ? -springOffsetPx : springOffsetPx;

    const switchNode = (
      <BaseSwitch.Root
        ref={ref}
        id={id}
      name={name}
      checked={controlledChecked}
      defaultChecked={defaultChecked}
      disabled={disabled}
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
        className="m3e-switch__thumb"
        style={{
          width: `${springThumbSize.toFixed(2)}px`,
          height: `${springThumbSize.toFixed(2)}px`,
          translate: `${signedThumbX.toFixed(2)}px -50%`,
        }}
      >
        {isChecked && resolvedCheckedIcon ? (
          <span className="m3e-switch__icon" aria-hidden="true">
            {resolvedCheckedIcon}
          </span>
        ) : !isChecked && resolvedUncheckedIcon ? (
          <span className="m3e-switch__icon" aria-hidden="true">
            {resolvedUncheckedIcon}
          </span>
        ) : null}
      </BaseSwitch.Thumb>
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          ⌀{Math.round(springThumbSize)}@{Math.round(springOffsetPx)}
        </span>
      ) : null}
    </BaseSwitch.Root>
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
      data-disabled={disabled ? "" : undefined}
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
