import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import {
  type ButtonSize,
  type IconButtonVariant,
  type IconButtonWidthVariant,
  resolveIconButtonGeometry,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EContext.js";
import { useM3ECornerSpringRef, usePressHoldState } from "../hooks/useM3ESpring.js";
import type { ButtonIntent } from "./Button.js";

export interface M3EIconButtonProps
  extends Omit<
    React.HTMLAttributes<HTMLElement>,
    "children" | "className" | "style" | "onClick" | "aria-label"
  > {
  readonly icon: React.ReactNode;
  readonly "aria-label": string;
  readonly size?: ButtonSize;
  readonly widthVariant?: IconButtonWidthVariant;
  readonly variant?: IconButtonVariant;
  readonly intent?: ButtonIntent;
  readonly shape?: "round" | "square";
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly type?: "button" | "submit" | "reset";
  readonly href?: string;
  readonly target?: string;
  readonly rel?: string;
  readonly render?: React.ReactElement;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function IconSpinnerSvg({ size }: { readonly size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="m3e-button__spinner"
      aria-hidden="true"
    >
      <circle
        cx="12"
        cy="12"
        r="9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeOpacity="0.26"
      />
      <path
        d="M21 12a9 9 0 0 0-9-9"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const IconButton = React.forwardRef<HTMLElement, M3EIconButtonProps>(
  function IconButton(
    {
      icon,
      "aria-label": ariaLabel,
      size = "sm",
      widthVariant = "default",
      variant = "standard",
      intent = "default",
      shape = "round",
      disabled = false,
      loading = false,
      onClick,
      type = "button",
      href,
      target,
      rel,
      render,
      className,
      style,
      ...restProps
    },
    ref,
  ) {
    const { debugGeometry } = useM3E();
    const isDisabled = disabled || loading;
    const { isPressed, pressHandlers } = usePressHoldState(isDisabled);

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

    const resolvedRender =
      render ??
      (href ? <a href={href} target={target} rel={rel} /> : undefined);
    const isCustomElement = Boolean(resolvedRender);

    const mergedProps = mergeProps<"button">(
      pressHandlers as unknown as React.ComponentPropsWithRef<"button">,
      restProps as unknown as React.ComponentPropsWithRef<"button">,
    );

    return (
      <BaseButton
        {...mergedProps}
        ref={mergedRef}
        type={isCustomElement ? undefined : type}
        nativeButton={!isCustomElement}
        render={resolvedRender}
        disabled={isDisabled}
        focusableWhenDisabled={loading && !disabled}
        aria-busy={loading ? true : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
        className={
          className ? `m3e-icon-button ${className}` : "m3e-icon-button"
        }
        style={mergedStyle}
        data-variant={variant}
        data-intent={intent !== "default" ? intent : undefined}
        data-size={size}
        data-width={widthVariant}
        data-shape={shape}
        data-loading={loading ? "" : undefined}
        data-explicit-disabled={disabled ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
      >
        <span
          className="m3e-icon-button__glyph"
          style={{ width: geo.iconSize, height: geo.iconSize }}
          aria-hidden="true"
        >
          {loading ? <IconSpinnerSvg size={geo.iconSize} /> : icon}
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

export interface M3EIconToggleButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className" | "style" | "value" | "aria-label"
  > {
  readonly icon: React.ReactNode;
  readonly checkedIcon?: React.ReactNode;
  readonly "aria-label": string;
  readonly value?: string;
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
    value,
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
    ...restProps
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
    useM3ECornerSpringRef<HTMLButtonElement>(geo.corners, "defaultEffects", ref);

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

  const mergedProps = mergeProps<"button">(
    pressHandlers as unknown as React.ComponentPropsWithRef<"button">,
    restProps as unknown as React.ComponentPropsWithRef<"button">,
  );

  return (
    <BaseToggle
      {...mergedProps}
      ref={mergedRef}
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
