import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import {
  EXTENDED_FAB_SPECS,
  type ExtendedFabSize,
  type FabColorVariant,
  type FabSize,
  resolveFabGeometry,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

export interface M3EFABProps {
  readonly icon: React.ReactNode;
  readonly "aria-label": string;
  readonly size?: FabSize;
  readonly variant?: FabColorVariant;
  readonly disabled?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function FAB({
  icon,
  "aria-label": ariaLabel,
  size = "md",
  variant = "primary",
  disabled = false,
  onClick,
  className,
  style,
}: M3EFABProps): React.JSX.Element {
  const { debugGeometry } = useM3E();
  const { isPressed, pressHandlers } = usePressHoldState(disabled);
  const geo = resolveFabGeometry({ size, isPressed });
  const radius = useM3EScalarSpring(geo.cornerRadius, "fastSpatial");

  return (
    <BaseButton
      type="button"
      disabled={disabled}
      aria-label={ariaLabel}
      onClick={onClick}
      className={className ? `m3e-fab ${className}` : "m3e-fab"}
      data-size={size}
      data-variant={variant}
      data-pressed={isPressed ? "" : undefined}
      style={{
        width: `${geo.containerSize}px`,
        height: `${geo.containerSize}px`,
        borderRadius: `${Math.max(4, radius).toFixed(1)}px`,
        ...style,
      }}
      {...pressHandlers}
    >
      <span
        className="m3e-fab__icon"
        style={{ width: `${geo.iconSize}px`, height: `${geo.iconSize}px` }}
        aria-hidden="true"
      >
        {icon}
      </span>
      {debugGeometry ? (
        <span className="m3e-debug-badge" aria-hidden="true">
          {geo.containerSize} r:{radius.toFixed(0)}
        </span>
      ) : null}
    </BaseButton>
  );
}

export interface M3EExtendedFABProps {
  readonly icon: React.ReactNode;
  readonly children: React.ReactNode;
  readonly expanded?: boolean;
  readonly size?: ExtendedFabSize;
  readonly variant?: FabColorVariant;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function ExtendedFAB({
  icon,
  children,
  expanded = true,
  size = "sm",
  variant = "primary",
  disabled = false,
  "aria-label": ariaLabel,
  onClick,
  className,
  style,
}: M3EExtendedFABProps): React.JSX.Element {
  const { debugGeometry } = useM3E();
  const { isPressed, pressHandlers } = usePressHoldState(disabled);
  const spec = EXTENDED_FAB_SPECS[size];

  const labelRef = React.useRef<HTMLSpanElement | null>(null);
  const [labelWidth, setLabelWidth] = React.useState<number>(72);

  React.useLayoutEffect(() => {
    const el = labelRef.current;
    if (!el) return;
    const measure = () => {
      const w = el.scrollWidth;
      if (w > 0) setLabelWidth(w);
    };
    measure();
    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(measure);
      ro.observe(el);
      return () => ro.disconnect();
    }
    return undefined;
  }, [children]);

  const collapsedWidth = spec.height;
  const expandedWidth =
    spec.paddingInline * 2 + spec.iconSize + spec.iconGap + labelWidth;

  const targetWidth = expanded ? expandedWidth : collapsedWidth;
  const animatedWidth = useM3EScalarSpring(targetWidth, "defaultSpatial");
  const labelOpacity = useM3EScalarSpring(expanded ? 1 : 0, "fastEffects");

  const targetRadius = isPressed ? spec.pressedRadius : spec.restRadius;
  const animatedRadius = useM3EScalarSpring(targetRadius, "fastSpatial");

  const accessibleName =
    ariaLabel ?? (typeof children === "string" ? children : undefined);

  return (
    <BaseButton
      type="button"
      disabled={disabled}
      aria-label={!expanded ? accessibleName : ariaLabel}
      onClick={onClick}
      className={
        className ? `m3e-extended-fab ${className}` : "m3e-extended-fab"
      }
      data-size={size}
      data-variant={variant}
      data-expanded={expanded ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      style={{
        width: `${Math.max(collapsedWidth, animatedWidth).toFixed(1)}px`,
        height: `${spec.height}px`,
        borderRadius: `${Math.max(6, animatedRadius).toFixed(1)}px`,
        paddingInlineStart: expanded
          ? `${spec.paddingInline}px`
          : `${(spec.height - spec.iconSize) / 2}px`,
        fontSize: `${spec.fontSize}px`,
        ...style,
      }}
      {...pressHandlers}
    >
      <span
        className="m3e-extended-fab__icon"
        style={{ width: `${spec.iconSize}px`, height: `${spec.iconSize}px` }}
        aria-hidden="true"
      >
        {icon}
      </span>
      <span
        ref={labelRef}
        className="m3e-extended-fab__label"
        aria-hidden={!expanded ? true : undefined}
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
}
