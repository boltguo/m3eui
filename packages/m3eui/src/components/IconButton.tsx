import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import {
  type ButtonSize,
  type IconButtonVariant,
  type IconButtonWidthVariant,
  resolveIconButtonGeometry,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import { useM3ECornerSpringRef, usePressHoldState } from "../hooks/useM3ESpring.js";

export interface M3EIconButtonProps {
  readonly icon: React.ReactNode;
  readonly "aria-label": string;
  readonly size?: ButtonSize;
  readonly widthVariant?: IconButtonWidthVariant;
  readonly variant?: IconButtonVariant;
  readonly shape?: "round" | "square";
  readonly disabled?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly type?: "button" | "submit" | "reset";
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const IconButton = React.forwardRef<HTMLElement, M3EIconButtonProps>(
  function IconButton(
    {
      icon,
      "aria-label": ariaLabel,
      size = "sm",
      widthVariant = "default",
      variant = "standard",
      shape = "round",
      disabled = false,
      onClick,
      type = "button",
      className,
      style,
    },
    ref,
  ) {
    const { debugGeometry } = useM3E();
    const { isPressed, pressHandlers } = usePressHoldState(disabled);

    const geo = resolveIconButtonGeometry({
      size,
      widthVariant,
      shape,
      isPressed,
      isSelected: false,
    });

    const { ref: mergedRef, borderRadiusCss } =
      useM3ECornerSpringRef<HTMLElement>(geo.corners, "defaultEffects", ref);

    const mergedStyle: React.CSSProperties = {
      width: `${geo.width}px`,
      height: `${geo.height}px`,
      minInlineSize: `${Math.max(24, geo.width)}px`,
      minBlockSize: `${Math.max(24, geo.height)}px`,
      paddingInline: `${geo.paddingInline}px`,
      borderWidth: `${geo.outlineWidth}px`,
      borderRadius: borderRadiusCss,
      ...style,
    };

    return (
      <BaseButton
        ref={mergedRef}
        type={type}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onClick}
        className={
          className ? `m3e-icon-button ${className}` : "m3e-icon-button"
        }
        style={mergedStyle}
        data-variant={variant}
        data-size={size}
        data-width={widthVariant}
        data-shape={shape}
        data-pressed={isPressed ? "" : undefined}
        {...pressHandlers}
      >
        <span
          className="m3e-icon-button__glyph"
          style={{ width: geo.iconSize, height: geo.iconSize }}
          aria-hidden="true"
        >
          {icon}
        </span>
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            {geo.width}×{geo.height} r:{geo.corners[0].toFixed(0)}
          </span>
        ) : null}
      </BaseButton>
    );
  },
);

export interface M3EIconToggleButtonProps {
  readonly icon: React.ReactNode;
  readonly checkedIcon?: React.ReactNode;
  readonly "aria-label": string;
  readonly pressed?: boolean;
  readonly defaultPressed?: boolean;
  readonly onPressedChange?: (pressed: boolean) => void;
  readonly size?: ButtonSize;
  readonly widthVariant?: IconButtonWidthVariant;
  readonly variant?: IconButtonVariant;
  readonly shape?: "round" | "square";
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const IconToggleButton = React.forwardRef<
  HTMLButtonElement,
  M3EIconToggleButtonProps
>(function IconToggleButton(
  {
    icon,
    checkedIcon,
    "aria-label": ariaLabel,
    pressed: controlledPressed,
    defaultPressed = false,
    onPressedChange,
    size = "sm",
    widthVariant = "default",
    variant = "tonal",
    shape = "round",
    disabled = false,
    className,
    style,
  },
  ref,
) {
  const { debugGeometry } = useM3E();
  const [uncontrolledPressed, setUncontrolledPressed] =
    React.useState<boolean>(defaultPressed);
  const isSelected = controlledPressed ?? uncontrolledPressed;
  const { isPressed: isPointerPressed, pressHandlers } =
    usePressHoldState(disabled);

  const geo = resolveIconButtonGeometry({
    size,
    widthVariant,
    shape,
    isPressed: isPointerPressed,
    isSelected,
  });

  const { ref: mergedRef, borderRadiusCss } =
    useM3ECornerSpringRef<HTMLButtonElement>(geo.corners, "fastSpatial", ref);

  const mergedStyle: React.CSSProperties = {
    width: `${geo.width}px`,
    height: `${geo.height}px`,
    minInlineSize: `${Math.max(24, geo.width)}px`,
    minBlockSize: `${Math.max(24, geo.height)}px`,
    paddingInline: `${geo.paddingInline}px`,
    borderWidth: `${geo.outlineWidth}px`,
    borderRadius: borderRadiusCss,
    ...style,
  };

  return (
    <BaseToggle
      ref={mergedRef}
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
      className={
        className ? `m3e-icon-button ${className}` : "m3e-icon-button"
      }
      style={mergedStyle}
      data-toggle=""
      data-variant={variant}
      data-size={size}
      data-width={widthVariant}
      data-shape={shape}
      data-pressed={isPointerPressed ? "" : undefined}
      data-selected={isSelected ? "" : undefined}
      {...pressHandlers}
    >
      <span
        className="m3e-icon-button__glyph"
        style={{ width: geo.iconSize, height: geo.iconSize }}
        aria-hidden="true"
      >
        {isSelected && checkedIcon ? checkedIcon : icon}
      </span>
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          {geo.width}×{geo.height} r:{geo.corners[0].toFixed(0)}
        </span>
      ) : null}
    </BaseToggle>
  );
});
