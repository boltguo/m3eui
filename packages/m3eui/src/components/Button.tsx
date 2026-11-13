import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import {
  BUTTON_SIZE_SPECS,
  type ButtonSize,
  type CornerTuple,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import { useM3ECornerSpring, usePressHoldState } from "../hooks/useM3ESpring.js";

export type ButtonVariant = "filled" | "tonal" | "elevated" | "outlined" | "text";
export type ButtonShape = "round" | "square";

export interface M3EButtonProps {
  readonly children: React.ReactNode;
  readonly variant?: ButtonVariant;
  readonly size?: ButtonSize;
  readonly shape?: ButtonShape;
  readonly disabled?: boolean;
  readonly leadingIcon?: React.ReactNode;
  readonly trailingIcon?: React.ReactNode;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly type?: "button" | "submit" | "reset";
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly "aria-label"?: string;
  readonly cornerOverride?: CornerTuple;
  readonly onPressStateChange?: (pressed: boolean) => void;
}

function formatCornerBadge(c: CornerTuple): string {
  const r0 = Math.round(c[0]);
  const r1 = Math.round(c[1]);
  const r2 = Math.round(c[2]);
  const r3 = Math.round(c[3]);
  if (r0 === r1 && r1 === r2 && r2 === r3) {
    return `r:${c[0].toFixed(1)}`;
  }
  return `r:${r0}/${r1}/${r2}/${r3}`;
}

export const Button = React.forwardRef<HTMLElement, M3EButtonProps>(function Button(
  {
    children,
    variant = "filled",
    size = "sm",
    shape = "round",
    disabled = false,
    leadingIcon,
    trailingIcon,
    onClick,
    type = "button",
    className,
    style,
    "aria-label": ariaLabel,
    cornerOverride,
    onPressStateChange,
  },
  ref,
) {
  const { debugGeometry } = useM3E();
  const spec = BUTTON_SIZE_SPECS[size];
  const { isPressed, pressHandlers } = usePressHoldState(disabled);

  React.useEffect(() => {
    onPressStateChange?.(isPressed);
  }, [isPressed, onPressStateChange]);

  const restRadius =
    shape === "square" ? spec.squareCornerRadius : spec.restCornerRadius;
  const scalarRadius = isPressed ? spec.pressedCornerRadius : restRadius;
  const targetCorners: CornerTuple =
    cornerOverride ?? [scalarRadius, scalarRadius, scalarRadius, scalarRadius];

  const { corners, borderRadiusCss } = useM3ECornerSpring(targetCorners, "fastSpatial");

  const mergedStyle: React.CSSProperties = {
    height: `${spec.height}px`,
    paddingInline: `${spec.paddingHorizontal}px`,
    gap: `${spec.iconGap}px`,
    fontSize: `${spec.fontSize}px`,
    lineHeight: `${spec.lineHeight}px`,
    fontWeight: spec.fontWeight,
    borderRadius: borderRadiusCss,
    ...style,
  };

  return (
    <BaseButton
      ref={ref}
      type={type}
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={className ? `m3e-button ${className}` : "m3e-button"}
      style={mergedStyle}
      data-variant={variant}
      data-size={size}
      data-shape={shape}
      data-pressed={isPressed ? "" : undefined}
      {...pressHandlers}
    >
      {leadingIcon ? (
        <span
          className="m3e-button__icon"
          style={{ width: spec.iconSize, height: spec.iconSize }}
          aria-hidden="true"
        >
          {leadingIcon}
        </span>
      ) : null}
      <span className="m3e-button__label">{children}</span>
      {trailingIcon ? (
        <span
          className="m3e-button__icon"
          style={{ width: spec.iconSize, height: spec.iconSize }}
          aria-hidden="true"
        >
          {trailingIcon}
        </span>
      ) : null}
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          {formatCornerBadge(corners)}
        </span>
      ) : null}
    </BaseButton>
  );
});

export interface M3EToggleButtonProps {
  readonly children: React.ReactNode;
  readonly value?: string;
  readonly pressed?: boolean;
  readonly defaultPressed?: boolean;
  readonly onPressedChange?: (pressed: boolean) => void;
  readonly variant?: Exclude<ButtonVariant, "text">;
  readonly size?: ButtonSize;
  readonly shape?: ButtonShape;
  readonly disabled?: boolean;
  readonly showCheckIcon?: boolean;
  readonly leadingIcon?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly "aria-label"?: string;
  readonly cornerOverride?: CornerTuple;
  readonly onPointerPressChange?: (isPointerPressed: boolean) => void;
}

function CheckmarkSvg({ size }: { readonly size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export const ToggleButton = React.forwardRef<HTMLButtonElement, M3EToggleButtonProps>(
  function ToggleButton(
    {
      children,
      value,
      pressed: controlledPressed,
      defaultPressed = false,
      onPressedChange,
      variant = "tonal",
      size = "sm",
      shape = "round",
      disabled = false,
      showCheckIcon = true,
      leadingIcon,
      className,
      style,
      "aria-label": ariaLabel,
      cornerOverride,
      onPointerPressChange,
    },
    ref,
  ) {
    const { debugGeometry } = useM3E();
    const [uncontrolledPressed, setUncontrolledPressed] =
      React.useState<boolean>(defaultPressed);
    const isSelected = controlledPressed ?? uncontrolledPressed;

    const spec = BUTTON_SIZE_SPECS[size];
    const { isPressed: isPointerPressed, pressHandlers } = usePressHoldState(disabled);

    React.useEffect(() => {
      onPointerPressChange?.(isPointerPressed);
    }, [isPointerPressed, onPointerPressChange]);

    const unselectedRadius =
      shape === "square" ? spec.squareCornerRadius : spec.restCornerRadius;
    const selectedRadius =
      shape === "square" ? spec.restCornerRadius : spec.selectedCornerRadius;
    const scalarRadius = isPointerPressed
      ? spec.pressedCornerRadius
      : isSelected
        ? selectedRadius
        : unselectedRadius;

    const targetCorners: CornerTuple =
      cornerOverride ?? [scalarRadius, scalarRadius, scalarRadius, scalarRadius];

    const { corners, borderRadiusCss } = useM3ECornerSpring(
      targetCorners,
      "fastSpatial",
    );

    const mergedStyle: React.CSSProperties = {
      height: `${spec.height}px`,
      paddingInline: `${spec.paddingHorizontal}px`,
      gap: `${spec.iconGap}px`,
      fontSize: `${spec.fontSize}px`,
      lineHeight: `${spec.lineHeight}px`,
      fontWeight: spec.fontWeight,
      borderRadius: borderRadiusCss,
      ...style,
    };

    const resolvedIcon =
      isSelected && showCheckIcon ? (
        <CheckmarkSvg size={spec.iconSize * 0.85} />
      ) : (
        leadingIcon
      );

    return (
      <BaseToggle
        ref={ref}
        value={value}
        pressed={controlledPressed}
        defaultPressed={defaultPressed}
        disabled={disabled}
        aria-label={ariaLabel}
        onPressedChange={(next) => {
          if (controlledPressed === undefined) {
            setUncontrolledPressed(next);
          }
          onPressedChange?.(next);
        }}
        className={className ? `m3e-button ${className}` : "m3e-button"}
        style={mergedStyle}
        data-toggle=""
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-pressed={isPointerPressed ? "" : undefined}
        data-selected={isSelected ? "" : undefined}
        {...pressHandlers}
      >
        {resolvedIcon ? (
          <span
            className="m3e-button__icon"
            style={{ width: spec.iconSize, height: spec.iconSize }}
            aria-hidden="true"
          >
            {resolvedIcon}
          </span>
        ) : null}
        <span className="m3e-button__label">{children}</span>
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            {formatCornerBadge(corners)}
          </span>
        ) : null}
      </BaseToggle>
    );
  },
);
