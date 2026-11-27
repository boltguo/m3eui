"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  EXTENDED_FAB_SPECS,
  FAB_MENU_TOKENS,
  type ExtendedFabSize,
  type FabColorVariant,
  type FabSize,
  type ToggleFabSize,
  resolveFabGeometry,
  resolveToggleFabGeometry,
} from "../../tokens/topology.js";
import { useM3ERuntime } from "../../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpringEffect,
  usePressHoldState,
} from "../../hooks/useM3ESpring.js";
import { assignRef } from "../../internal/assignRef.js";
import { useIsoLayoutEffect } from "../../internal/useIsoLayoutEffect.js";
import { INERT_TRUE } from "../../internal/inert.js";
import { LinkActionElement, isLinkRenderTarget } from "../../internal/link.js";
import { useM3ERipple } from "../../internal/ripple.js";
export type FabElevation = "default" | "lowered" | "none";

const EXTENDED_FAB_TYPESCALE_MAP: Record<ExtendedFabSize, string> = {
  sm: "title-medium",
  md: "title-large",
  lg: "headline-small",
};

export interface M3EIconFABProps
  extends Omit<
    React.HTMLAttributes<HTMLElement>,
    "children" | "className" | "style" | "onClick" | "aria-label"
  > {
  readonly icon: React.ReactNode;
  readonly children?: never;
  readonly expanded?: never;
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

function applyVisibilityToEl(
  el: HTMLElement | null,
  scale: number,
  opacity: number,
  visible: boolean,
): void {
  if (!el) return;
  const active =
    !visible || Math.abs(scale - 1) > 0.005 || Math.abs(opacity - 1) > 0.005;
  if (active) {
    el.style.scale = `${Math.max(0, scale).toFixed(3)}`;
    el.style.opacity = String(Math.max(0, Math.min(1, opacity)));
    el.style.pointerEvents = !visible ? "none" : "";
  } else {
    el.style.scale = "";
    el.style.opacity = "";
    el.style.pointerEvents = "";
  }
}

const IconFAB = React.forwardRef<HTMLElement, M3EIconFABProps>(function IconFAB(
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
  const resolvedElevation = elevation ?? "default";
  const { isPressed, pressHandlers } = usePressHoldState(disabled || !visible);
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled || !visible);
  const geo = resolveFabGeometry({
    size,
    isPressed: morphOnPress ? isPressed : false,
  });
  const r = Math.max(4, geo.cornerRadius);
  const fabElRef = React.useRef<HTMLElement | null>(null);
  const { ref: cornerMergedRef, borderRadiusCss } = useM3ECornerSpringRef<HTMLElement>(
    [r, r, r, r],
    "defaultEffects",
    ref,
  );
  const mergedRef = React.useCallback(
    (node: HTMLElement | null) => {
      fabElRef.current = node;
      cornerMergedRef(node);
    },
    [cornerMergedRef],
  );
  const visRef = React.useRef({ scale: visible ? 1 : 0.2, opacity: visible ? 1 : 0 });
  const visibleRef = React.useRef(visible);
  visibleRef.current = visible;
  useM3EScalarSpringEffect(visible ? 1 : 0.2, "fastSpatial", (val) => {
    visRef.current.scale = val;
    applyVisibilityToEl(fabElRef.current, val, visRef.current.opacity, visibleRef.current);
  });
  useM3EScalarSpringEffect(visible ? 1 : 0, "fastEffects", (val) => {
    visRef.current.opacity = val;
    applyVisibilityToEl(fabElRef.current, visRef.current.scale, val, visibleRef.current);
  });

  const isLink = isLinkRenderTarget(href, render);
  const isCustomElement = Boolean(render);

  const mergedProps = mergeProps<"button">(
    pressHandlers as unknown as React.ComponentPropsWithRef<"button">,
    rippleHandlers as unknown as React.ComponentPropsWithRef<"button">,
    restProps as unknown as React.ComponentPropsWithRef<"button">,
  );

  const isInitiallyAnimating =
    !visible ||
    Math.abs(visRef.current.scale - 1) > 0.005 ||
    Math.abs(visRef.current.opacity - 1) > 0.005;

  const fabStyle: React.CSSProperties = {
    width: `${geo.containerSize}px`,
    height: `${geo.containerSize}px`,
    borderRadius: borderRadiusCss,
    ...(isInitiallyAnimating
      ? {
          scale: `${Math.max(0, visRef.current.scale).toFixed(3)}`,
          opacity: Math.max(0, Math.min(1, visRef.current.opacity)),
          pointerEvents: !visible ? "none" : undefined,
        }
      : null),
    ...style,
  };

  const fabContent = (
    <>
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
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
    </>
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
        disabled={disabled}
        tabIndex={!visible ? -1 : restProps.tabIndex}
        aria-hidden={!visible ? true : restProps["aria-hidden"]}
        aria-label={ariaLabel}
        onClick={!visible ? undefined : (onClick as React.MouseEventHandler<HTMLElement> | undefined)}
        className={className ? `m3e-fab ${className}` : "m3e-fab"}
        data-size={size}
        data-variant={variant}
        data-elevation={
          resolvedElevation !== "default" ? resolvedElevation : undefined
        }
        data-hidden={!visible ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        style={fabStyle}
      >
        {fabContent}
      </LinkActionElement>
    );
  }

  return (
    <BaseButton
      {...mergedProps}
      ref={mergedRef}
      type={isCustomElement ? undefined : type}
      nativeButton={!isCustomElement}
      render={render}
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
      style={fabStyle}
    >
      {fabContent}
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

const ExtendedFAB = React.forwardRef<HTMLElement, M3EExtendedFABProps>(
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
    const resolvedElevation = elevation ?? "default";
    const { isPressed, pressHandlers } = usePressHoldState(
      disabled || !visible,
    );
    const { rippleRef, rippleHandlers } = useM3ERipple(disabled || !visible);
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
    const collapsedInlinePadding = (spec.height - spec.iconSize) / 2;

    const efabElRef = React.useRef<HTMLElement | null>(null);
    const efabDebugRef = React.useRef<HTMLSpanElement | null>(null);
    const assignEfabRef = React.useCallback(
      (node: HTMLElement | null) => {
        efabElRef.current = node;
        assignRef(ref, node);
      },
      [ref],
    );

    const targetWidth = expanded ? expandedWidth : collapsedWidth;
    const targetRadius =
      morphOnPress && isPressed ? spec.pressedRadius : spec.restRadius;

    const efabSpringRef = React.useRef({
      width: targetWidth,
      expand: expanded ? 1 : 0,
      labelOpacity: expanded ? 1 : 0,
      radius: targetRadius,
      visScale: visible ? 1 : 0.2,
      visOpacity: visible ? 1 : 0,
    });
    const visibleRef = React.useRef(visible);
    visibleRef.current = visible;
    const efabSpecRef = React.useRef({
      collapsedWidth,
      collapsedInlinePadding,
      paddingInline: spec.paddingInline,
    });
    efabSpecRef.current = {
      collapsedWidth,
      collapsedInlinePadding,
      paddingInline: spec.paddingInline,
    };

    const syncEfabDebug = () => {
      if (efabDebugRef.current) {
        efabDebugRef.current.textContent = `w:${Math.round(efabSpringRef.current.width)} r:${efabSpringRef.current.radius.toFixed(0)}`;
      }
    };

    useM3EScalarSpringEffect(targetWidth, "defaultSpatial", (val) => {
      efabSpringRef.current.width = val;
      if (efabElRef.current) {
        efabElRef.current.style.width = `${Math.max(efabSpecRef.current.collapsedWidth, val).toFixed(1)}px`;
      }
      syncEfabDebug();
    });
    useM3EScalarSpringEffect(expanded ? 1 : 0, "defaultSpatial", (val) => {
      efabSpringRef.current.expand = val;
      const clamped = Math.max(0, Math.min(1, val));
      const pad =
        efabSpecRef.current.collapsedInlinePadding +
        (efabSpecRef.current.paddingInline - efabSpecRef.current.collapsedInlinePadding) *
          clamped;
      if (efabElRef.current) {
        efabElRef.current.style.paddingInlineStart = `${pad.toFixed(2)}px`;
      }
    });
    useM3EScalarSpringEffect(expanded ? 1 : 0, "fastEffects", (val) => {
      efabSpringRef.current.labelOpacity = val;
      if (labelRef.current) {
        labelRef.current.style.opacity = String(Math.max(0, Math.min(1, val)));
      }
    });
    useM3EScalarSpringEffect(targetRadius, "defaultEffects", (val) => {
      efabSpringRef.current.radius = val;
      if (efabElRef.current) {
        efabElRef.current.style.borderRadius = `${Math.max(6, val).toFixed(1)}px`;
      }
      syncEfabDebug();
    });
    useM3EScalarSpringEffect(visible ? 1 : 0.2, "fastSpatial", (val) => {
      efabSpringRef.current.visScale = val;
      applyVisibilityToEl(
        efabElRef.current,
        val,
        efabSpringRef.current.visOpacity,
        visibleRef.current,
      );
    });
    useM3EScalarSpringEffect(visible ? 1 : 0, "fastEffects", (val) => {
      efabSpringRef.current.visOpacity = val;
      applyVisibilityToEl(
        efabElRef.current,
        efabSpringRef.current.visScale,
        val,
        visibleRef.current,
      );
    });

    const stringLabel =
      typeof children === "string" || typeof children === "number"
        ? String(children)
        : undefined;
    const resolvedAriaLabel = !expanded
      ? (ariaLabel ?? stringLabel)
      : ariaLabel;
    const needsFallbackLabelledBy =
      !expanded && !resolvedAriaLabel && !ariaLabelledBy;

    const isLink = isLinkRenderTarget(href, render);
    const isCustomElement = Boolean(render);

    const scaleKey = EXTENDED_FAB_TYPESCALE_MAP[size];
    const fallbackLineHeight = size === "lg" ? 32 : size === "md" ? 28 : 24;
    const mergedProps = mergeProps<"button">(
      pressHandlers as unknown as React.ComponentPropsWithRef<"button">,
      rippleHandlers as unknown as React.ComponentPropsWithRef<"button">,
      restProps as unknown as React.ComponentPropsWithRef<"button">,
    );

    const isInitiallyAnimating =
      !visible ||
      Math.abs(efabSpringRef.current.visScale - 1) > 0.005 ||
      Math.abs(efabSpringRef.current.visOpacity - 1) > 0.005;
    const initialClampedExpand = Math.max(
      0,
      Math.min(1, efabSpringRef.current.expand),
    );
    const initialInlinePadding =
      collapsedInlinePadding +
      (spec.paddingInline - collapsedInlinePadding) * initialClampedExpand;

    const efabStyle: React.CSSProperties = {
      width: `${Math.max(collapsedWidth, efabSpringRef.current.width).toFixed(1)}px`,
      height: `${spec.height}px`,
      borderRadius: `${Math.max(6, efabSpringRef.current.radius).toFixed(1)}px`,
      paddingInlineStart: `${initialInlinePadding.toFixed(2)}px`,
      fontFamily: `var(--m3e-typescale-${scaleKey}-font, inherit)`,
      fontSize: `var(--m3e-typescale-${scaleKey}-size, ${spec.fontSize}px)`,
      lineHeight: `var(--m3e-typescale-${scaleKey}-line-height, ${fallbackLineHeight}px)`,
      fontWeight: `var(--m3e-typescale-${scaleKey}-weight, 500)` as React.CSSProperties["fontWeight"],
      letterSpacing: `var(--m3e-typescale-${scaleKey}-tracking, normal)`,
      ...(isInitiallyAnimating
        ? {
            scale: `${Math.max(0, efabSpringRef.current.visScale).toFixed(3)}`,
            opacity: Math.max(0, Math.min(1, efabSpringRef.current.visOpacity)),
            pointerEvents: !visible ? "none" : undefined,
          }
        : null),
      ...style,
    };

    const efabContent = (
      <>
        <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
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
            opacity: Math.max(0, Math.min(1, efabSpringRef.current.labelOpacity)),
          }}
        >
          {children}
        </span>
        {debugGeometry ? (
          <span ref={efabDebugRef} className="m3e-debug-badge" aria-hidden="true">
            w:{Math.round(efabSpringRef.current.width)} r:{efabSpringRef.current.radius.toFixed(0)}
          </span>
        ) : null}
      </>
    );

    if (isLink) {
      return (
        <LinkActionElement
          {...(mergedProps as Record<string, unknown>)}
          ref={assignEfabRef}
          href={href}
          target={target}
          rel={rel}
          render={render}
          disabled={disabled}
          tabIndex={!visible ? -1 : restProps.tabIndex}
          aria-hidden={!visible ? true : restProps["aria-hidden"]}
          aria-label={resolvedAriaLabel}
          aria-labelledby={
            ariaLabelledBy ?? (needsFallbackLabelledBy ? labelId : undefined)
          }
          onClick={!visible ? undefined : (onClick as React.MouseEventHandler<HTMLElement> | undefined)}
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
          style={efabStyle}
        >
          {efabContent}
        </LinkActionElement>
      );
    }

    return (
      <BaseButton
        {...mergedProps}
        ref={assignEfabRef}
        type={isCustomElement ? undefined : type}
        nativeButton={!isCustomElement}
        render={render}
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
        style={efabStyle}
      >
        {efabContent}
      </BaseButton>
    );
  },
);

export type M3EFABProps = M3EIconFABProps | M3EExtendedFABProps;

export const FAB = React.forwardRef<HTMLElement, M3EFABProps>(function FAB(
  props,
  ref,
) {
  return props.children != null ? (
    <ExtendedFAB {...(props as M3EExtendedFABProps)} ref={ref} />
  ) : (
    <IconFAB {...(props as M3EIconFABProps)} ref={ref} />
  );
});

export interface FABMenuItemSpec {
  readonly id: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly disabled?: boolean;
  readonly onSelect?: () => void;
}

export interface M3EFABMenuProps {
  readonly items: readonly FABMenuItemSpec[];
  readonly size?: ToggleFabSize;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly icon?: React.ReactNode;
  readonly triggerLabel?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function DefaultPlusSvg() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function CloseCrossSvg() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="6" y1="6" x2="18" y2="18" />
      <line x1="18" y1="6" x2="6" y2="18" />
    </svg>
  );
}

function StaggeredFabMenuItem({
  item,
  index,
  count,
  isOpen,
  isRovingActive,
  onFocusItem,
  onDismissAndSelect,
  buttonRef,
}: {
  readonly item: FABMenuItemSpec;
  readonly index: number;
  readonly count: number;
  readonly isOpen: boolean;
  readonly isRovingActive: boolean;
  readonly onFocusItem: () => void;
  readonly onDismissAndSelect: () => void;
  readonly buttonRef: (el: HTMLButtonElement | null) => void;
}) {
  const { motionRef } = useM3ERuntime();
  const [itemActive, setItemActive] = React.useState<boolean>(isOpen);

  React.useEffect(() => {
    const rate = Math.max(0.1, motionRef.current.playbackRate);
    const rawDelayMs = isOpen
      ? (count - 1 - index) * FAB_MENU_TOKENS.staggerStepMs
      : index * 25;
    const delayMs = rawDelayMs / rate;

    if (delayMs <= 1) {
      setItemActive(isOpen);
      return;
    }
    const timer = setTimeout(() => {
      setItemActive(isOpen);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [isOpen, index, count]);

  const localBtnRef = React.useRef<HTMLButtonElement | null>(null);
  const assignItemRef = React.useCallback(
    (el: HTMLButtonElement | null) => {
      localBtnRef.current = el;
      buttonRef(el);
    },
    [buttonRef],
  );
  const itemSpringRef = React.useRef({
    spatial: itemActive ? 1 : 0,
    opacity: itemActive ? 1 : 0,
  });

  useM3EScalarSpringEffect(itemActive ? 1 : 0, "defaultSpatial", (val) => {
    itemSpringRef.current.spatial = val;
    if (localBtnRef.current) {
      const ty = (1 - val) * 18;
      const sc = 0.88 + 0.12 * val;
      localBtnRef.current.style.translate = `0px ${ty.toFixed(2)}px`;
      localBtnRef.current.style.scale = `${sc.toFixed(3)}`;
    }
  });
  useM3EScalarSpringEffect(itemActive ? 1 : 0, "fastEffects", (val) => {
    itemSpringRef.current.opacity = val;
    if (localBtnRef.current) {
      localBtnRef.current.style.opacity = String(Math.max(0, Math.min(1, val)));
    }
  });

  const { rippleRef, rippleHandlers } = useM3ERipple(
    !isOpen || Boolean(item.disabled),
  );

  const translateY = (1 - itemSpringRef.current.spatial) * 18;
  const scale = 0.88 + 0.12 * itemSpringRef.current.spatial;
  const clampedOpacity = Math.max(0, Math.min(1, itemSpringRef.current.opacity));

  return (
    <button
      ref={assignItemRef}
      type="button"
      role="menuitem"
      disabled={item.disabled}
      tabIndex={isOpen && isRovingActive && !item.disabled ? 0 : -1}
      onFocus={onFocusItem}
      onClick={() => {
        if (item.disabled) return;
        onDismissAndSelect();
      }}
      className="m3e-fab-menu__item"
      data-open={isOpen ? "" : undefined}
      data-disabled={item.disabled ? "" : undefined}
      style={{
        height: `${FAB_MENU_TOKENS.itemHeight}px`,
        paddingInline: `${FAB_MENU_TOKENS.itemPaddingInline}px`,
        gap: `${FAB_MENU_TOKENS.itemIconGap}px`,
        borderRadius: `${FAB_MENU_TOKENS.itemRadius}px`,
        opacity: clampedOpacity,
        translate: `0px ${translateY.toFixed(2)}px`,
        scale: `${scale.toFixed(3)}`,
        pointerEvents: isOpen ? "auto" : "none",
      }}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <span
        className="m3e-fab-menu__item-icon"
        style={{
          width: FAB_MENU_TOKENS.itemIconSize,
          height: FAB_MENU_TOKENS.itemIconSize,
        }}
        aria-hidden="true"
      >
        {item.icon}
      </span>
      <span className="m3e-fab-menu__item-label">{item.label}</span>
    </button>
  );
}

export function FABMenu({
  items,
  size = "md",
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  icon,
  triggerLabel,
  className,
  style,
}: M3EFABMenuProps): React.JSX.Element {
  const { debugGeometry, t } = useM3ERuntime();
  const resolvedTriggerLabel = triggerLabel ?? t("fabMenu.triggerOpen");
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState<boolean>(defaultOpen);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const findFirstEnabledIndex = React.useCallback(() => {
    for (let i = 0; i < items.length; i++) {
      if (!items[i]?.disabled) return i;
    }
    return 0;
  }, [items]);

  const [activeIndex, setActiveIndex] = React.useState<number>(
    findFirstEnabledIndex,
  );
  const menuListId = React.useId();

  React.useEffect(() => {
    if (!isOpen) {
      setActiveIndex(findFirstEnabledIndex());
    }
  }, [isOpen, findFirstEnabledIndex]);

  const setOpen = React.useCallback(
    (next: boolean) => {
      if (next) {
        setActiveIndex(findFirstEnabledIndex());
      }
      if (controlledOpen === undefined) {
        setUncontrolledOpen(next);
      }
      onOpenChange?.(next);
    },
    [controlledOpen, findFirstEnabledIndex, onOpenChange],
  );

  React.useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (e: PointerEvent) => {
      const target = e.target as Node | null;
      if (target && rootRef.current && !rootRef.current.contains(target)) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [isOpen, setOpen]);

  const focusEnabledItemFrom = React.useCallback(
    (startIdx: number, step: 1 | -1) => {
      const len = items.length;
      if (len === 0) return;
      for (let offset = 0; offset < len; offset++) {
        const candidate = (((startIdx + offset * step) % len) + len) % len;
        if (!items[candidate]?.disabled) {
          setActiveIndex(candidate);
          itemRefs.current[candidate]?.focus();
          return;
        }
      }
    },
    [items],
  );

  const { rippleRef: triggerRippleRef, rippleHandlers: triggerRippleHandlers } =
    useM3ERipple(false);
  const iconWrapRef = React.useRef<HTMLSpanElement | null>(null);
  const customIconRef = React.useRef<HTMLSpanElement | null>(null);
  const closeIconRef = React.useRef<HTMLSpanElement | null>(null);
  const menuDebugRef = React.useRef<HTMLSpanElement | null>(null);
  const hasCustomIcon = icon !== undefined;
  const morphRef = React.useRef(isOpen ? 1 : 0);

  useM3EScalarSpringEffect(isOpen ? 1 : 0, "fastSpatial", (val) => {
    morphRef.current = val;
    const clamped = Math.max(0, Math.min(1, val));
    const geo = resolveToggleFabGeometry(size, val);
    if (triggerRef.current) {
      triggerRef.current.style.width = `${geo.containerSize.toFixed(1)}px`;
      triggerRef.current.style.height = `${geo.containerSize.toFixed(1)}px`;
      triggerRef.current.style.borderRadius = `${Number(geo.cornerRadius.toFixed(1))}px`;
    }
    if (iconWrapRef.current) {
      iconWrapRef.current.style.width = `${geo.iconSize.toFixed(1)}px`;
      iconWrapRef.current.style.height = `${geo.iconSize.toFixed(1)}px`;
      iconWrapRef.current.style.rotate = hasCustomIcon
        ? "0deg"
        : `${geo.iconRotationDeg.toFixed(1)}deg`;
    }
    if (customIconRef.current) {
      customIconRef.current.style.opacity = String(
        Math.max(0, Math.min(1, 1 - clamped * 1.4)),
      );
      customIconRef.current.style.scale = `${(1 - 0.25 * clamped).toFixed(3)}`;
      customIconRef.current.style.rotate = `${(45 * clamped).toFixed(1)}deg`;
    }
    if (closeIconRef.current) {
      closeIconRef.current.style.opacity = String(
        Math.max(0, Math.min(1, (clamped - 0.2) / 0.8)),
      );
      closeIconRef.current.style.scale = `${(0.75 + 0.25 * clamped).toFixed(3)}`;
      closeIconRef.current.style.rotate = `${(-45 * (1 - clamped)).toFixed(1)}deg`;
    }
    if (menuDebugRef.current) {
      menuDebugRef.current.textContent = `${Math.round(geo.containerSize)}px r:${geo.cornerRadius.toFixed(0)}`;
    }
  });

  const clampedMorph = Math.max(0, Math.min(1, morphRef.current));
  const fabGeo = resolveToggleFabGeometry(size, morphRef.current);
  const customIconOpacity = Math.max(0, Math.min(1, 1 - clampedMorph * 1.4));
  const closeIconOpacity = Math.max(0, Math.min(1, (clampedMorph - 0.2) / 0.8));

  return (
    <div
      ref={rootRef}
      className={className ? `m3e-fab-menu ${className}` : "m3e-fab-menu"}
      data-open={isOpen ? "" : undefined}
      style={{ flexDirection: "column-reverse", ...style }}
      onBlur={(e) => {
        if (!isOpen) return;
        const nextFocused = e.relatedTarget as Node | null;
        if (nextFocused) {
          if (!e.currentTarget.contains(nextFocused)) {
            setOpen(false);
          }
          return;
        }
        const root = e.currentTarget;
        queueMicrotask(() => {
          if (
            typeof document !== "undefined" &&
            document.activeElement &&
            !root.contains(document.activeElement)
          ) {
            setOpen(false);
          }
        });
      }}
      onKeyDown={(e) => {
        if (e.key === "Escape" && isOpen) {
          e.stopPropagation();
          setOpen(false);
          triggerRef.current?.focus();
          return;
        }
        if (items.length === 0) return;
        if (e.target === triggerRef.current) {
          if (e.key === "ArrowUp") {
            e.preventDefault();
            if (!isOpen) {
              setOpen(true);
              queueMicrotask(() => focusEnabledItemFrom(items.length - 1, -1));
            } else {
              focusEnabledItemFrom(items.length - 1, -1);
            }
          } else if (e.key === "ArrowDown") {
            e.preventDefault();
            if (!isOpen) {
              setOpen(true);
              queueMicrotask(() => focusEnabledItemFrom(0, 1));
            } else {
              focusEnabledItemFrom(0, 1);
            }
          }
          return;
        }
        if (!isOpen) return;
        const domFocusedIdx =
          typeof document !== "undefined"
            ? itemRefs.current.indexOf(
                document.activeElement as HTMLButtonElement,
              )
            : -1;
        const currentIdx = domFocusedIdx >= 0 ? domFocusedIdx : activeIndex;
        if (e.key === "ArrowUp") {
          e.preventDefault();
          focusEnabledItemFrom(currentIdx - 1, -1);
        } else if (e.key === "ArrowDown") {
          e.preventDefault();
          focusEnabledItemFrom(currentIdx + 1, 1);
        } else if (e.key === "Home") {
          e.preventDefault();
          focusEnabledItemFrom(0, 1);
        } else if (e.key === "End") {
          e.preventDefault();
          focusEnabledItemFrom(items.length - 1, -1);
        }
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-label={isOpen ? t("fabMenu.triggerClose") : resolvedTriggerLabel}
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-controls={menuListId}
        onClick={() => setOpen(!isOpen)}
        className="m3e-toggle-fab"
        data-open={isOpen ? "" : undefined}
        data-size={size}
        style={{
          width: `${fabGeo.containerSize.toFixed(1)}px`,
          height: `${fabGeo.containerSize.toFixed(1)}px`,
          borderRadius: `${Number(fabGeo.cornerRadius.toFixed(1))}px`,
        }}
        {...triggerRippleHandlers}
      >
        <span ref={triggerRippleRef} className="m3e-ripple" aria-hidden="true" />
        <span
          ref={iconWrapRef}
          className="m3e-toggle-fab__icon"
          style={{
            position: "relative",
            width: `${fabGeo.iconSize.toFixed(1)}px`,
            height: `${fabGeo.iconSize.toFixed(1)}px`,
            rotate: hasCustomIcon
              ? "0deg"
              : `${fabGeo.iconRotationDeg.toFixed(1)}deg`,
          }}
          aria-hidden="true"
        >
          {hasCustomIcon ? (
            <>
              <span
                ref={customIconRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: customIconOpacity,
                  scale: `${(1 - 0.25 * clampedMorph).toFixed(3)}`,
                  rotate: `${(45 * clampedMorph).toFixed(1)}deg`,
                }}
              >
                {icon}
              </span>
              <span
                ref={closeIconRef}
                style={{
                  position: "absolute",
                  inset: 0,
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: closeIconOpacity,
                  scale: `${(0.75 + 0.25 * clampedMorph).toFixed(3)}`,
                  rotate: `${(-45 * (1 - clampedMorph)).toFixed(1)}deg`,
                }}
              >
                <CloseCrossSvg />
              </span>
            </>
          ) : (
            <DefaultPlusSvg />
          )}
        </span>
        {debugGeometry ? (
          <span ref={menuDebugRef} className="m3e-debug-badge" aria-hidden="true">
            {Math.round(fabGeo.containerSize)}px r:{fabGeo.cornerRadius.toFixed(0)}
          </span>
        ) : null}
      </button>

      <div
        id={menuListId}
        role="menu"
        aria-label={resolvedTriggerLabel}
        inert={!isOpen ? INERT_TRUE : undefined}
        className="m3e-fab-menu__list"
        style={{
          gap: `${FAB_MENU_TOKENS.listGap}px`,
          marginBottom: `${FAB_MENU_TOKENS.closeButtonGap}px`,
        }}
      >
        {items.map((item, idx) => (
          <StaggeredFabMenuItem
            key={item.id}
            item={item}
            index={idx}
            count={items.length}
            isOpen={isOpen}
            isRovingActive={idx === activeIndex}
            onFocusItem={() => setActiveIndex(idx)}
            buttonRef={(el) => {
              itemRefs.current[idx] = el;
            }}
            onDismissAndSelect={() => {
              item.onSelect?.();
              setOpen(false);
              triggerRef.current?.focus();
            }}
          />
        ))}
      </div>
    </div>
  );
}
