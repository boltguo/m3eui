"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  EXTENDED_FAB_SPECS,
  type ExtendedFabSize,
  type FabColorVariant,
  type FabSize,
  resolveFabGeometry,
} from "../tokens/index.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";
import { FabElevationContext, type FabElevation } from "../internal/fabElevation.js";

export type { FabElevation };

const EXTENDED_FAB_TYPESCALE_MAP: Record<ExtendedFabSize, string> = {
  sm: "title-medium",
  md: "title-large",
  lg: "headline-small",
};

export interface M3EFABProps
  extends Omit<
    React.HTMLAttributes<HTMLElement>,
    "children" | "className" | "style" | "onClick" | "aria-label"
  > {
  readonly icon: React.ReactNode;
  readonly "aria-label": string;
  readonly size?: FabSize;
  readonly variant?: FabColorVariant;
  readonly elevation?: FabElevation;
  readonly visible?: boolean;
  readonly morphOnPress?: boolean;
  readonly disabled?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly type?: "button" | "submit" | "reset";
  readonly href?: string;
  readonly target?: string;
  readonly rel?: string;
  readonly render?: React.ReactElement;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const FAB = React.forwardRef<HTMLElement, M3EFABProps>(function FAB(
  {
    icon,
    "aria-label": ariaLabel,
    size = "sm",
    variant = "primary",
    elevation,
    visible = true,
    morphOnPress = false,
    disabled = false,
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
  const { debugGeometry } = useM3ERuntime();
  const contextElevation = React.useContext(FabElevationContext);
  const resolvedElevation = elevation ?? contextElevation ?? "default";
  const { isPressed, pressHandlers } = usePressHoldState(disabled || !visible);
  const geo = resolveFabGeometry({
    size,
    isPressed: morphOnPress ? isPressed : false,
  });
  const r = Math.max(4, geo.cornerRadius);
  const { ref: mergedRef, borderRadiusCss } = useM3ECornerSpringRef<HTMLElement>(
    [r, r, r, r],
    "defaultEffects",
    ref,
  );
  const visibilityScale = useM3EScalarSpring(visible ? 1 : 0.2, "fastSpatial");
  const visibilityOpacity = useM3EScalarSpring(visible ? 1 : 0, "fastEffects");

  const resolvedRender =
    render ??
    (href ? <a href={href} target={target} rel={rel} /> : undefined);
  const isCustomElement = Boolean(resolvedRender);

  const mergedProps = mergeProps<"button">(
    pressHandlers as unknown as React.ComponentPropsWithRef<"button">,
    restProps as unknown as React.ComponentPropsWithRef<"button">,
  );

  const isAnimatingVisibility =
    !visible ||
    Math.abs(visibilityScale - 1) > 0.005 ||
    Math.abs(visibilityOpacity - 1) > 0.005;

  return (
    <BaseButton
      {...mergedProps}
      ref={mergedRef}
      type={isCustomElement ? undefined : type}
      nativeButton={!isCustomElement}
      render={resolvedRender}
      disabled={disabled}
      tabIndex={!visible ? -1 : restProps.tabIndex}
      aria-hidden={!visible ? true : restProps["aria-hidden"]}
      aria-label={ariaLabel}
      onClick={!visible ? undefined : onClick}
      className={className ? `m3e-fab ${className}` : "m3e-fab"}
      data-size={size}
      data-variant={variant}
      data-elevation={
        resolvedElevation !== "default" ? resolvedElevation : undefined
      }
      data-hidden={!visible ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        width: `${geo.containerSize}px`,
        height: `${geo.containerSize}px`,
        borderRadius: borderRadiusCss,
        ...(isAnimatingVisibility
          ? {
              scale: `${Math.max(0, visibilityScale).toFixed(3)}`,
              opacity: Math.max(0, Math.min(1, visibilityOpacity)),
              pointerEvents: !visible ? "none" : undefined,
            }
          : null),
        ...style,
      }}
    >
      <span
        className="m3e-fab__icon"
        style={{
          width: `var(--m3e-fab-icon-size, ${geo.iconSize}px)`,
          height: `var(--m3e-fab-icon-size, ${geo.iconSize}px)`,
        }}
        aria-hidden="true"
      >
        {icon}
      </span>
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          {geo.containerSize} r:{geo.cornerRadius.toFixed(0)}
        </span>
      ) : null}
    </BaseButton>
  );
});

export interface M3EExtendedFABProps
  extends Omit<
    React.HTMLAttributes<HTMLElement>,
    "children" | "className" | "style" | "onClick"
  > {
  readonly icon: React.ReactNode;
  readonly children: React.ReactNode;
  readonly expanded?: boolean;
  readonly size?: ExtendedFabSize;
  readonly variant?: FabColorVariant;
  readonly elevation?: FabElevation;
  readonly visible?: boolean;
  readonly morphOnPress?: boolean;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly type?: "button" | "submit" | "reset";
  readonly href?: string;
  readonly target?: string;
  readonly rel?: string;
  readonly render?: React.ReactElement;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const ExtendedFAB = React.forwardRef<HTMLElement, M3EExtendedFABProps>(
  function ExtendedFAB(
    {
      icon,
      children,
      expanded = true,
      size = "sm",
      variant = "primary",
      elevation,
      visible = true,
      morphOnPress = false,
      disabled = false,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
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
    const { debugGeometry } = useM3ERuntime();
    const contextElevation = React.useContext(FabElevationContext);
    const resolvedElevation = elevation ?? contextElevation ?? "default";
    const { isPressed, pressHandlers } = usePressHoldState(
      disabled || !visible,
    );
    const spec = EXTENDED_FAB_SPECS[size];
    const labelId = React.useId();

    const labelRef = React.useRef<HTMLSpanElement | null>(null);
    const [labelWidth, setLabelWidth] = React.useState<number>(72);

    useIsoLayoutEffect(() => {
      const el = labelRef.current;
      if (!el) return;
      let cancelled = false;
      const measure = () => {
        if (cancelled) return;
        const w = el.scrollWidth;
        if (w > 0) {
          setLabelWidth((prev) => (prev === w ? prev : w));
        }
      };
      measure();
      if (typeof document !== "undefined" && document.fonts?.ready) {
        void document.fonts.ready.then(() => {
          measure();
        });
      }
      if (typeof ResizeObserver !== "undefined") {
        const ro = new ResizeObserver(measure);
        ro.observe(el);
        return () => {
          cancelled = true;
          ro.disconnect();
        };
      }
      return () => {
        cancelled = true;
      };
    }, [children, size]);

    const collapsedWidth = spec.height;
    const expandedWidth =
      spec.paddingInline * 2 + spec.iconSize + spec.iconGap + labelWidth;

    const targetWidth = expanded ? expandedWidth : collapsedWidth;
    const animatedWidth = useM3EScalarSpring(targetWidth, "defaultSpatial");
    const expandProgress = useM3EScalarSpring(expanded ? 1 : 0, "defaultSpatial");
    const labelOpacity = useM3EScalarSpring(expanded ? 1 : 0, "fastEffects");

    const collapsedInlinePadding = (spec.height - spec.iconSize) / 2;
    const clampedExpandProgress = Math.max(0, Math.min(1, expandProgress));
    const animatedInlinePadding =
      collapsedInlinePadding +
      (spec.paddingInline - collapsedInlinePadding) * clampedExpandProgress;

    const targetRadius =
      morphOnPress && isPressed ? spec.pressedRadius : spec.restRadius;
    const animatedRadius = useM3EScalarSpring(targetRadius, "defaultEffects");
    const visibilityScale = useM3EScalarSpring(
      visible ? 1 : 0.2,
      "fastSpatial",
    );
    const visibilityOpacity = useM3EScalarSpring(
      visible ? 1 : 0,
      "fastEffects",
    );

    const stringLabel =
      typeof children === "string" || typeof children === "number"
        ? String(children)
        : undefined;
    const resolvedAriaLabel = !expanded
      ? (ariaLabel ?? stringLabel)
      : ariaLabel;
    const needsFallbackLabelledBy =
      !expanded && !resolvedAriaLabel && !ariaLabelledBy;

    const resolvedRender =
      render ??
      (href ? <a href={href} target={target} rel={rel} /> : undefined);
    const isCustomElement = Boolean(resolvedRender);

    const scaleKey = EXTENDED_FAB_TYPESCALE_MAP[size];
    const fallbackLineHeight = size === "lg" ? 32 : size === "md" ? 28 : 24;
    const mergedProps = mergeProps<"button">(
      pressHandlers as unknown as React.ComponentPropsWithRef<"button">,
      restProps as unknown as React.ComponentPropsWithRef<"button">,
    );

    const isAnimatingVisibility =
      !visible ||
      Math.abs(visibilityScale - 1) > 0.005 ||
      Math.abs(visibilityOpacity - 1) > 0.005;

    return (
      <BaseButton
        {...mergedProps}
        ref={ref}
        type={isCustomElement ? undefined : type}
        nativeButton={!isCustomElement}
        render={resolvedRender}
        disabled={disabled}
        tabIndex={!visible ? -1 : restProps.tabIndex}
        aria-hidden={!visible ? true : restProps["aria-hidden"]}
        aria-label={resolvedAriaLabel}
        aria-labelledby={
          ariaLabelledBy ?? (needsFallbackLabelledBy ? labelId : undefined)
        }
        onClick={!visible ? undefined : onClick}
        className={
          className ? `m3e-extended-fab ${className}` : "m3e-extended-fab"
        }
        data-size={size}
        data-variant={variant}
        data-elevation={
          resolvedElevation !== "default" ? resolvedElevation : undefined
        }
        data-hidden={!visible ? "" : undefined}
        data-expanded={expanded ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        style={{
          width: `${Math.max(collapsedWidth, animatedWidth).toFixed(1)}px`,
          height: `${spec.height}px`,
          borderRadius: `${Math.max(6, animatedRadius).toFixed(1)}px`,
          paddingInlineStart: `${animatedInlinePadding.toFixed(2)}px`,
          fontFamily: `var(--m3e-typescale-${scaleKey}-font, inherit)`,
          fontSize: `var(--m3e-typescale-${scaleKey}-size, ${spec.fontSize}px)`,
          lineHeight: `var(--m3e-typescale-${scaleKey}-line-height, ${fallbackLineHeight}px)`,
          fontWeight: `var(--m3e-typescale-${scaleKey}-weight, 500)` as React.CSSProperties["fontWeight"],
          letterSpacing: `var(--m3e-typescale-${scaleKey}-tracking, normal)`,
          ...(isAnimatingVisibility
            ? {
                scale: `${Math.max(0, visibilityScale).toFixed(3)}`,
                opacity: Math.max(0, Math.min(1, visibilityOpacity)),
                pointerEvents: !visible ? "none" : undefined,
              }
            : null),
          ...style,
        }}
      >
        <span
          className="m3e-extended-fab__icon"
          style={{ width: `${spec.iconSize}px`, height: `${spec.iconSize}px` }}
          aria-hidden="true"
        >
          {icon}
        </span>
        <span
          id={labelId}
          ref={labelRef}
          className="m3e-extended-fab__label"
          aria-hidden={!expanded && !needsFallbackLabelledBy ? true : undefined}
          style={{
            marginInlineStart: `${spec.iconGap}px`,
            opacity: Math.max(0, Math.min(1, labelOpacity)),
          }}
        >
          {children}
        </span>
        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            w:{Math.round(animatedWidth)} r:{animatedRadius.toFixed(0)}
          </span>
        ) : null}
      </BaseButton>
    );
  },
);
