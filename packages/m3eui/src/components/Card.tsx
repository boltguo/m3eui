"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { CARD_TOKENS } from "../tokens/index.js";
import { usePressHoldState } from "../hooks/useM3ESpring.js";

export type CardVariant = "elevated" | "filled" | "outlined";

export interface M3ECardProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  readonly children: React.ReactNode;
  readonly variant?: CardVariant;
  readonly title?: React.ReactNode;
  readonly subtitle?: React.ReactNode;
  readonly media?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly interactive?: boolean;
  readonly disabled?: boolean;
  readonly href?: string;
  readonly target?: string;
  readonly rel?: string;
  readonly render?: React.ReactElement<Record<string, unknown>>;
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
    interactive,
    disabled = false,
    href,
    target,
    rel,
    render,
    onClick,
    className,
    style,
    "aria-label": ariaLabel,
    ...restProps
  },
  ref,
) {
  const isInteractive = Boolean(interactive || onClick || href || render);
  const { isPressed, pressHandlers } = usePressHoldState(
    !isInteractive || disabled,
  );
  const restRadiusCss = `${CARD_TOKENS.restRadius}px`;

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

  if (isInteractive && actions) {
    const overlayRender =
      render ??
      (href && !disabled ? <a href={href} target={target} rel={rel} /> : undefined);
    const resolvedOverlayLabel =
      ariaLabel ?? (typeof title === "string" ? title : undefined);

    return (
      <article
        ref={ref}
        {...restProps}
        className={
          className
            ? `m3e-card m3e-card--interactive m3e-card--compound ${className}`
            : "m3e-card m3e-card--interactive m3e-card--compound"
        }
        data-variant={variant}
        data-pressed={isPressed ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        style={{
          borderRadius: restRadiusCss,
          ...style,
        }}
      >
        <BaseButton
          type={!overlayRender ? "button" : undefined}
          nativeButton={!overlayRender}
          render={overlayRender}
          disabled={disabled}
          aria-label={resolvedOverlayLabel}
          onClick={onClick}
          onPointerDown={pressHandlers.onPointerDown}
          onPointerUp={pressHandlers.onPointerUp}
          onPointerLeave={pressHandlers.onPointerLeave}
          onPointerCancel={pressHandlers.onPointerCancel}
          onKeyDown={pressHandlers.onKeyDown}
          onKeyUp={pressHandlers.onKeyUp}
          onBlur={pressHandlers.onBlur}
          className="m3e-card__overlay-action"
        />
        {inner}
      </article>
    );
  }

  if (isInteractive) {
    const cardRender =
      render ??
      (href && !disabled ? <a href={href} target={target} rel={rel} /> : <div />);

    return (
      <BaseButton
        ref={ref}
        nativeButton={false}
        render={cardRender}
        disabled={disabled}
        aria-label={ariaLabel}
        {...restProps}
        onClick={onClick}
        onPointerLeave={(e) => {
          pressHandlers.onPointerLeave();
          restProps.onPointerLeave?.(e);
        }}
        onPointerDown={(e) => {
          pressHandlers.onPointerDown(e);
          restProps.onPointerDown?.(e);
        }}
        onPointerUp={(e) => {
          pressHandlers.onPointerUp();
          restProps.onPointerUp?.(e);
        }}
        onPointerCancel={(e) => {
          pressHandlers.onPointerCancel();
          restProps.onPointerCancel?.(e);
        }}
        onKeyDown={(e) => {
          pressHandlers.onKeyDown(e);
          restProps.onKeyDown?.(e);
        }}
        onKeyUp={(e) => {
          pressHandlers.onKeyUp(e);
          restProps.onKeyUp?.(e);
        }}
        onBlur={(e) => {
          pressHandlers.onBlur();
          restProps.onBlur?.(e);
        }}
        className={
          className
            ? `m3e-card m3e-card--interactive ${className}`
            : "m3e-card m3e-card--interactive"
        }
        data-variant={variant}
        data-pressed={isPressed ? "" : undefined}
        data-disabled={disabled ? "" : undefined}
        style={{
          borderRadius: restRadiusCss,
          ...style,
        }}
      >
        {inner}
      </BaseButton>
    );
  }

  return (
    <article
      ref={ref}
      aria-label={ariaLabel}
      {...restProps}
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
