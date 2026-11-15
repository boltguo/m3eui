"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import {
  BUTTON_SIZE_SPECS,
  type ButtonSize,
  type CornerTuple,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EContext.js";
import { useM3ECornerSpringRef, usePressHoldState } from "../hooks/useM3ESpring.js";
import { ButtonGroupItemContext } from "../internal/buttonGroupContext.js";

export type ButtonVariant = "filled" | "tonal" | "elevated" | "outlined" | "text";
export type ButtonShape = "round" | "square";
export type ButtonIntent = "default" | "danger";

const BUTTON_TYPESCALE_MAP: Record<ButtonSize, string> = {
  xs: "label-large",
  sm: "label-large",
  md: "title-medium",
  lg: "headline-small",
  xl: "headline-large",
};

export interface M3EButtonProps
  extends Omit<
    React.HTMLAttributes<HTMLElement>,
    "children" | "className" | "style" | "onClick"
  > {
  readonly children: React.ReactNode;
  readonly variant?: ButtonVariant;
  readonly intent?: ButtonIntent;
  readonly size?: ButtonSize;
  readonly shape?: ButtonShape;
  readonly disabled?: boolean;
  readonly loading?: boolean;
  readonly fullWidth?: boolean;
  readonly leadingIcon?: React.ReactNode;
  readonly trailingIcon?: React.ReactNode;
  readonly href?: string;
  readonly target?: string;
  readonly rel?: string;
  readonly render?: React.ReactElement;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly type?: "button" | "submit" | "reset";
  readonly className?: string;
  readonly style?: React.CSSProperties;
  readonly "aria-label"?: string;
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

function ButtonSpinnerSvg({ size }: { readonly size: number }) {
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

export const Button = React.forwardRef<HTMLElement, M3EButtonProps>(function Button(
  {
    children,
    variant = "filled",
    intent = "default",
    size = "sm",
    shape = "round",
    disabled = false,
    loading = false,
    fullWidth = false,
    leadingIcon,
    trailingIcon,
    href,
    target,
    rel,
    render,
    onClick,
    type = "button",
    className,
    style,
    "aria-label": ariaLabel,
    ...restProps
  },
  ref,
) {
  const { debugGeometry } = useM3E();
  const groupItemCtx = React.useContext(ButtonGroupItemContext);
  const spec = BUTTON_SIZE_SPECS[size];
  const isDisabled = disabled || loading;
  const { isPressed, pressHandlers } = usePressHoldState(isDisabled);

  const onGroupPressChange = groupItemCtx?.onPressChange;
  React.useEffect(() => {
    onGroupPressChange?.(isPressed);
  }, [isPressed, onGroupPressChange]);

  const restRadius =
    shape === "square" ? spec.squareCornerRadius : spec.restCornerRadius;
  const scalarRadius = isPressed ? spec.pressedCornerRadius : restRadius;
  const targetCorners: CornerTuple =
    groupItemCtx?.cornerOverride ?? [
      scalarRadius,
      scalarRadius,
      scalarRadius,
      scalarRadius,
    ];

  const {
    ref: mergedRef,
    borderRadiusCss,
  } = useM3ECornerSpringRef<HTMLElement>(targetCorners, "defaultEffects", ref);

  const scaleKey = BUTTON_TYPESCALE_MAP[size];
  const mergedStyle: React.CSSProperties = {
    height: `${spec.height}px`,
    paddingInline: `${spec.paddingHorizontal}px`,
    gap: `${spec.iconGap}px`,
    fontFamily: `var(--m3e-typescale-${scaleKey}-font, inherit)`,
    fontSize: `var(--m3e-typescale-${scaleKey}-size, ${spec.fontSize}px)`,
    lineHeight: `var(--m3e-typescale-${scaleKey}-line-height, ${spec.lineHeight}px)`,
    fontWeight: `var(--m3e-typescale-${scaleKey}-weight, ${spec.fontWeight})` as React.CSSProperties["fontWeight"],
    letterSpacing: `var(--m3e-typescale-${scaleKey}-tracking, normal)`,
    borderWidth: variant === "outlined" ? `${spec.outlineWidth}px` : undefined,
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
      className={className ? `m3e-button ${className}` : "m3e-button"}
      style={mergedStyle}
      data-variant={variant}
      data-intent={intent !== "default" ? intent : undefined}
      data-size={size}
      data-shape={shape}
      data-loading={loading ? "" : undefined}
      data-explicit-disabled={disabled ? "" : undefined}
      data-full-width={fullWidth ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
    >
      {leadingIcon ? (
        <span
          className="m3e-button__icon"
          style={{
            width: spec.iconSize,
            height: spec.iconSize,
            visibility: loading ? "hidden" : undefined,
          }}
          aria-hidden="true"
        >
          {leadingIcon}
        </span>
      ) : null}
      <span
        className="m3e-button__label"
        style={loading ? { visibility: "hidden" } : undefined}
      >
        {children}
      </span>
      {trailingIcon ? (
        <span
          className="m3e-button__icon"
          style={{
            width: spec.iconSize,
            height: spec.iconSize,
            visibility: loading ? "hidden" : undefined,
          }}
          aria-hidden="true"
        >
          {trailingIcon}
        </span>
      ) : null}
      {loading ? (
        <span
          className="m3e-button__loader"
          style={{
            position: "absolute",
            inset: 0,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
          aria-hidden="true"
        >
          <ButtonSpinnerSvg size={spec.iconSize} />
        </span>
      ) : null}
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          {formatCornerBadge(targetCorners)}
        </span>
      ) : null}
    </BaseButton>
  );
});

export interface M3EToggleButtonProps
  extends Omit<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    "children" | "className" | "style" | "value"
  > {
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
      showCheckIcon = false,
      leadingIcon,
      className,
      style,
      "aria-label": ariaLabel,
      ...restProps
    },
    ref,
  ) {
    const { debugGeometry } = useM3E();
    const groupItemCtx = React.useContext(ButtonGroupItemContext);
    const [uncontrolledPressed, setUncontrolledPressed] =
      React.useState<boolean>(defaultPressed);
    const isSelected = controlledPressed ?? uncontrolledPressed;

    const spec = BUTTON_SIZE_SPECS[size];
    const { isPressed: isPointerPressed, pressHandlers } = usePressHoldState(disabled);

    const onGroupPressChange = groupItemCtx?.onPressChange;
    React.useEffect(() => {
      onGroupPressChange?.(isPointerPressed);
    }, [isPointerPressed, onGroupPressChange]);

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
      groupItemCtx?.cornerOverride ?? [
        scalarRadius,
        scalarRadius,
        scalarRadius,
        scalarRadius,
      ];

    const {
      ref: mergedRef,
      borderRadiusCss,
    } = useM3ECornerSpringRef<HTMLButtonElement>(
      targetCorners,
      "fastSpatial",
      ref,
    );

    const scaleKey = BUTTON_TYPESCALE_MAP[size];
    const mergedStyle: React.CSSProperties = {
      height: `${spec.height}px`,
      paddingInline: `${spec.paddingHorizontal}px`,
      gap: `${spec.iconGap}px`,
      fontFamily: `var(--m3e-typescale-${scaleKey}-font, inherit)`,
      fontSize: `var(--m3e-typescale-${scaleKey}-size, ${spec.fontSize}px)`,
      lineHeight: `var(--m3e-typescale-${scaleKey}-line-height, ${spec.lineHeight}px)`,
      fontWeight: `var(--m3e-typescale-${scaleKey}-weight, ${spec.fontWeight})` as React.CSSProperties["fontWeight"],
      letterSpacing: `var(--m3e-typescale-${scaleKey}-tracking, normal)`,
      borderWidth: variant === "outlined" ? `${spec.outlineWidth}px` : undefined,
      borderRadius: borderRadiusCss,
      ...style,
    };

    const resolvedIcon =
      isSelected && showCheckIcon ? (
        <CheckmarkSvg size={spec.iconSize} />
      ) : (
        leadingIcon
      );

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
        className={className ? `m3e-button ${className}` : "m3e-button"}
        style={mergedStyle}
        data-toggle=""
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-pressed={isPointerPressed ? "" : undefined}
        data-selected={isSelected ? "" : undefined}
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
            {formatCornerBadge(targetCorners)}
          </span>
        ) : null}
      </BaseToggle>
    );
  },
);
