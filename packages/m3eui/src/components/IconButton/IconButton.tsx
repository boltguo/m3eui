import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import { Toggle as BaseToggle } from "@base-ui/react/toggle";
import {
  type ButtonSize,
  type IconButtonVariant,
  type IconButtonWidthVariant,
  resolveIconButtonGeometry,
} from "../../tokens/topology.js";
import { isToggleProps } from "../../internal/toggleProps.js";
import { SpinnerIcon } from "../../internal/icons.js";
import { LinkActionElement, isLinkRenderTarget } from "../../internal/link.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import { useM3ECornerSpringRef, usePressHoldState } from "../../hooks/useM3ESpring.js";
import type { ButtonIntent } from "../Button/Button.js";

type IconButtonGeometry = ReturnType<typeof resolveIconButtonGeometry>;

export interface M3EIconButtonActionProps
  extends Omit<
    React.HTMLAttributes<HTMLElement>,
    "children" | "className" | "style" | "onClick" | "aria-label"
  > {
  readonly icon: React.ReactNode;
  readonly pressed?: never;
  readonly defaultPressed?: never;
  readonly onPressedChange?: never;
  readonly checkedIcon?: never;
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

function iconButtonStyle(
  geo: IconButtonGeometry,
  borderRadius: string,
  style: React.CSSProperties | undefined,
): React.CSSProperties {
  return {
    width: `${geo.width}px`,
    height: `${geo.height}px`,
    minInlineSize: `${Math.max(24, geo.width)}px`,
    minBlockSize: `${Math.max(24, geo.height)}px`,
    paddingInline: `${geo.paddingInline}px`,
    borderWidth: `${geo.outlineWidth}px`,
    borderRadius,
    ...style,
  };
}

function IconButtonContent({
  geo,
  glyph,
}: {
  readonly geo: IconButtonGeometry;
  readonly glyph: React.ReactNode;
}) {
  const { debugGeometry } = useM3ERuntime();
  return (
    <>
      <span
        className="m3e-icon-button__glyph"
        style={{ width: geo.iconSize, height: geo.iconSize }}
        aria-hidden="true"
      >
        {glyph}
      </span>
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          {geo.width}×{geo.height} r:{geo.corners[0].toFixed(0)}
        </span>
      ) : null}
    </>
  );
}

const ActionIconButton = React.forwardRef<HTMLElement, M3EIconButtonActionProps>(
  function ActionIconButton(
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

    const isLink = isLinkRenderTarget(href, render);

    const mergedProps = mergeProps<"button">(
      pressHandlers as unknown as React.ComponentPropsWithRef<"button">,
      restProps as unknown as React.ComponentPropsWithRef<"button">,
    );

    const content = (
      <IconButtonContent
        geo={geo}
        glyph={
          loading ? (
            <SpinnerIcon size={geo.iconSize} className="m3e-button__spinner" />
          ) : (
            icon
          )
        }
      />
    );

    if (isLink) {
      return (
        <LinkActionElement
          {...(mergedProps as Record<string, unknown>)}
          ref={mergedRef}
          href={href}
          target={target}
          rel={rel}
          render={render}
          disabled={isDisabled}
          focusableWhenDisabled={loading && !disabled}
          aria-busy={loading ? true : undefined}
          aria-label={ariaLabel}
          onClick={onClick as React.MouseEventHandler<HTMLElement> | undefined}
          className={
            className ? `m3e-icon-button ${className}` : "m3e-icon-button"
          }
          style={iconButtonStyle(geo, borderRadiusCss, style)}
          data-variant={variant}
          data-intent={intent !== "default" ? intent : undefined}
          data-size={size}
          data-width={widthVariant}
          data-shape={shape}
          data-loading={loading ? "" : undefined}
          data-explicit-disabled={disabled ? "" : undefined}
          data-pressed={isPressed ? "" : undefined}
        >
          {content}
        </LinkActionElement>
      );
    }

    const isCustomElement = Boolean(render);

    return (
      <BaseButton
        {...mergedProps}
        ref={mergedRef}
        type={isCustomElement ? undefined : type}
        nativeButton={!isCustomElement}
        render={render}
        disabled={isDisabled}
        focusableWhenDisabled={loading && !disabled}
        aria-busy={loading ? true : undefined}
        aria-label={ariaLabel}
        onClick={onClick}
        className={
          className ? `m3e-icon-button ${className}` : "m3e-icon-button"
        }
        style={iconButtonStyle(geo, borderRadiusCss, style)}
        data-variant={variant}
        data-intent={intent !== "default" ? intent : undefined}
        data-size={size}
        data-width={widthVariant}
        data-shape={shape}
        data-loading={loading ? "" : undefined}
        data-explicit-disabled={disabled ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
      >
        {content}
      </BaseButton>
    );
  },
);

export interface M3EIconButtonToggleProps
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

const ToggleIconButton = React.forwardRef<
  HTMLButtonElement,
  M3EIconButtonToggleProps
>(function ToggleIconButton(
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
      style={iconButtonStyle(geo, borderRadiusCss, style)}
      data-toggle=""
      data-variant={variant}
      data-size={size}
      data-width={widthVariant}
      data-shape={shape}
      data-pressed={isPointerPressed ? "" : undefined}
      data-selected={isSelected ? "" : undefined}
    >
      <IconButtonContent
        geo={geo}
        glyph={isSelected && checkedIcon ? checkedIcon : icon}
      />
    </BaseToggle>
  );
});

export type M3EIconButtonProps =
  | M3EIconButtonActionProps
  | M3EIconButtonToggleProps;

export const IconButton = React.forwardRef<HTMLElement, M3EIconButtonProps>(
  function IconButton(props, ref) {
    return isToggleProps(props) ? (
      <ToggleIconButton
        {...(props as M3EIconButtonToggleProps)}
        ref={ref as React.Ref<HTMLButtonElement>}
      />
    ) : (
      <ActionIconButton {...(props as M3EIconButtonActionProps)} ref={ref} />
    );
  },
);
