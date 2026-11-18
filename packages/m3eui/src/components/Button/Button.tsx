"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import {
  BUTTON_SIZE_SPECS,
  type ButtonSize,
  type CornerTuple,
} from "../../tokens/topology.js";
import { isToggleProps } from "../../internal/toggleProps.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useM3ECornerSpringRef, usePressHoldState } from "../../hooks/useM3ESpring.js";
import { ButtonGroupItemContext } from "../../internal/buttonGroupContext.js";
import { CheckIcon, SpinnerIcon } from "../../internal/icons.js";

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

export interface M3EButtonActionProps
  extends Omit<
    React.HTMLAttributes<HTMLElement>,
    "children" | "className" | "style" | "onClick"
  > {
  readonly children: React.ReactNode;
  readonly pressed?: never;
  readonly defaultPressed?: never;
  readonly onPressedChange?: never;
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

function CornerDebugBadge({ corners: c }: { readonly corners: CornerTuple }) {
  const { debugGeometry } = useM3ERuntime();
  if (!debugGeometry) return null;
  const r0 = Math.round(c[0]);
  const r1 = Math.round(c[1]);
  const r2 = Math.round(c[2]);
  const r3 = Math.round(c[3]);
  return (
    <span className="m3e-debug-badge" aria-hidden="true">
      {r0 === r1 && r1 === r2 && r2 === r3
        ? `r:${c[0].toFixed(1)}`
        : `r:${r0}/${r1}/${r2}/${r3}`}
    </span>
  );
}

function useGroupItemCorners(isPressed: boolean, radius: number): CornerTuple {
  const groupItemCtx = React.useContext(ButtonGroupItemContext);
  const onGroupPressChange = groupItemCtx?.onPressChange;
  React.useEffect(() => {
    onGroupPressChange?.(isPressed);
  }, [isPressed, onGroupPressChange]);
  return groupItemCtx?.cornerOverride ?? [radius, radius, radius, radius];
}

function buttonStyle(
  size: ButtonSize,
  variant: ButtonVariant,
  borderRadius: string,
  style: React.CSSProperties | undefined,
): React.CSSProperties {
  const spec = BUTTON_SIZE_SPECS[size];
  const scaleKey = BUTTON_TYPESCALE_MAP[size];
  return {
    height: `${spec.height}px`,
    paddingInline: `${spec.paddingHorizontal}px`,
    gap: `${spec.iconGap}px`,
    fontFamily: `var(--m3e-typescale-${scaleKey}-font, inherit)`,
    fontSize: `var(--m3e-typescale-${scaleKey}-size, ${spec.fontSize}px)`,
    lineHeight: `var(--m3e-typescale-${scaleKey}-line-height, ${spec.lineHeight}px)`,
    fontWeight: `var(--m3e-typescale-${scaleKey}-weight, ${spec.fontWeight})` as React.CSSProperties["fontWeight"],
    letterSpacing: `var(--m3e-typescale-${scaleKey}-tracking, normal)`,
    borderWidth: variant === "outlined" ? `${spec.outlineWidth}px` : undefined,
    borderRadius,
    ...style,
  };
}

function ButtonIcon({
  size,
  hidden,
  children,
}: {
  readonly size: number;
  readonly hidden?: boolean;
  readonly children: React.ReactNode;
}) {
  return (
    <span
      className="m3e-button__icon"
      style={{ width: size, height: size, opacity: hidden ? 0 : undefined }}
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

const ActionButton = React.forwardRef<HTMLElement, M3EButtonActionProps>(function ActionButton(
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
  const spec = BUTTON_SIZE_SPECS[size];
  const isDisabled = disabled || loading;
  const { isPressed, pressHandlers } = usePressHoldState(isDisabled);

  const restRadius =
    shape === "square" ? spec.squareCornerRadius : spec.restCornerRadius;
  const targetCorners = useGroupItemCorners(
    isPressed,
    isPressed ? spec.pressedCornerRadius : restRadius,
  );

  const {
    ref: mergedRef,
    borderRadiusCss,
  } = useM3ECornerSpringRef<HTMLElement>(targetCorners, "defaultEffects", ref);

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
      style={buttonStyle(size, variant, borderRadiusCss, style)}
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
        <ButtonIcon size={spec.iconSize} hidden={loading}>
          {leadingIcon}
        </ButtonIcon>
      ) : null}
      <span
        className="m3e-button__label"
        style={loading ? { opacity: 0 } : undefined}
      >
        {children}
      </span>
      {trailingIcon ? (
        <ButtonIcon size={spec.iconSize} hidden={loading}>
          {trailingIcon}
        </ButtonIcon>
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
          <SpinnerIcon size={spec.iconSize} className="m3e-button__spinner" />
        </span>
      ) : null}
      <CornerDebugBadge corners={targetCorners} />
    </BaseButton>
  );
});

export interface M3EButtonToggleProps
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

const ToggleButton = React.forwardRef<HTMLButtonElement, M3EButtonToggleProps>(
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
    const [uncontrolledPressed, setUncontrolledPressed] =
      React.useState<boolean>(defaultPressed);
    const isSelected = controlledPressed ?? uncontrolledPressed;

    const spec = BUTTON_SIZE_SPECS[size];
    const { isPressed: isPointerPressed, pressHandlers } = usePressHoldState(disabled);

    const unselectedRadius =
      shape === "square" ? spec.squareCornerRadius : spec.restCornerRadius;
    const selectedRadius =
      shape === "square" ? spec.restCornerRadius : spec.selectedCornerRadius;
    const targetCorners = useGroupItemCorners(
      isPointerPressed,
      isPointerPressed
        ? spec.pressedCornerRadius
        : isSelected
          ? selectedRadius
          : unselectedRadius,
    );

    const {
      ref: mergedRef,
      borderRadiusCss,
    } = useM3ECornerSpringRef<HTMLButtonElement>(
      targetCorners,
      "fastSpatial",
      ref,
    );

    const resolvedIcon =
      isSelected && showCheckIcon ? (
        <CheckIcon size={spec.iconSize} strokeWidth={2.5} />
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
        style={buttonStyle(size, variant, borderRadiusCss, style)}
        data-toggle=""
        data-variant={variant}
        data-size={size}
        data-shape={shape}
        data-pressed={isPointerPressed ? "" : undefined}
        data-selected={isSelected ? "" : undefined}
      >
        {resolvedIcon ? (
          <ButtonIcon size={spec.iconSize}>{resolvedIcon}</ButtonIcon>
        ) : null}
        <span className="m3e-button__label">{children}</span>
        <CornerDebugBadge corners={targetCorners} />
      </BaseToggle>
    );
  },
);

export type M3EButtonProps = M3EButtonActionProps | M3EButtonToggleProps;

export const Button = React.forwardRef<HTMLElement, M3EButtonProps>(
  function Button(props, ref) {
    return isToggleProps(props) ? (
      <ToggleButton
        {...(props as M3EButtonToggleProps)}
        ref={ref as React.Ref<HTMLButtonElement>}
      />
    ) : (
      <ActionButton {...(props as M3EButtonActionProps)} ref={ref} />
    );
  },
);
