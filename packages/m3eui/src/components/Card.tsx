import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { CARD_TOKENS } from "../tokens/index.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";

export type CardVariant = "elevated" | "filled" | "outlined";

export interface M3ECardProps {
  readonly children: React.ReactNode;
  readonly variant?: CardVariant;
  readonly title?: React.ReactNode;
  readonly subtitle?: React.ReactNode;
  readonly media?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly interactive?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export const Card = React.forwardRef<HTMLElement, M3ECardProps>(function Card(
  {
    children,
    variant = "filled",
    title,
    subtitle,
    media,
    actions,
    interactive = false,
    onClick,
    className,
    style,
  },
  ref,
) {
  const [hovered, setHovered] = React.useState(false);
  const { isPressed, pressHandlers } = usePressHoldState(!interactive);

  const targetRadius = interactive
    ? isPressed
      ? CARD_TOKENS.pressedRadius
      : hovered
        ? CARD_TOKENS.hoverRadius
        : CARD_TOKENS.restRadius
    : CARD_TOKENS.restRadius;

  const springRadius = useM3EScalarSpring(targetRadius, "fastSpatial");

  const inner = (
    <>
      {media ? <div className="m3e-card__media">{media}</div> : null}
      <div
        className="m3e-card__body"
        style={{ padding: `${CARD_TOKENS.padding}px` }}
      >
        {title || subtitle ? (
          <div className="m3e-card__header">
            {title ? <div className="m3e-card__title">{title}</div> : null}
            {subtitle ? (
              <div className="m3e-card__subtitle">{subtitle}</div>
            ) : null}
          </div>
        ) : null}
        <div className="m3e-card__content">{children}</div>
        {actions ? <div className="m3e-card__actions">{actions}</div> : null}
      </div>
    </>
  );

  if (interactive) {
    return (
      <BaseButton
        ref={ref}
        nativeButton={false}
        render={<div />}
        onClick={onClick}
        onPointerEnter={() => setHovered(true)}
        onPointerLeave={() => {
          setHovered(false);
          pressHandlers.onPointerLeave();
        }}
        onPointerDown={pressHandlers.onPointerDown}
        onPointerUp={pressHandlers.onPointerUp}
        onPointerCancel={pressHandlers.onPointerCancel}
        onKeyDown={pressHandlers.onKeyDown}
        onKeyUp={pressHandlers.onKeyUp}
        onBlur={pressHandlers.onBlur}
        className={
          className
            ? `m3e-card m3e-card--interactive ${className}`
            : "m3e-card m3e-card--interactive"
        }
        data-variant={variant}
        style={{
          borderRadius: `${Math.max(4, springRadius).toFixed(1)}px`,
          ...style,
        }}
      >
        {inner}
      </BaseButton>
    );
  }

  return (
    <article
      ref={ref as React.Ref<HTMLElement>}
      className={className ? `m3e-card ${className}` : "m3e-card"}
      data-variant={variant}
      style={{
        borderRadius: `${CARD_TOKENS.restRadius}px`,
        ...style,
      }}
    >
      {inner}
    </article>
  );
});
