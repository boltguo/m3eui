"use client";

import * as React from "react";
import { Button as BaseButton } from "@base-ui/react/button";
import { mergeProps } from "@base-ui/react/merge-props";
import {
  CARD_TOKENS,
} from "../../tokens/topology.js";
import { LinkActionElement, isLinkRenderTarget } from "../../internal/link.js";
import { useM3ERipple } from "../../internal/ripple.js";

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
  const { rippleRef, rippleHandlers } = useM3ERipple(
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
    const isLink = isLinkRenderTarget(href, render);
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
        data-disabled={disabled ? "" : undefined}
        style={{
          borderRadius: restRadiusCss,
          ...style,
        }}
      >
        {isLink ? (
          <LinkActionElement
            href={href}
            target={target}
            rel={rel}
            render={render}
            disabled={disabled}
            aria-label={resolvedOverlayLabel}
            onClick={onClick}
            {...(rippleHandlers as Record<string, unknown>)}
            className="m3e-card__overlay-action"
          >
            <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
          </LinkActionElement>
        ) : (
          <BaseButton
            {...(rippleHandlers as unknown as React.ComponentPropsWithRef<"button">)}
            type={!render ? "button" : undefined}
            nativeButton={!render}
            render={render}
            disabled={disabled}
            aria-label={resolvedOverlayLabel}
            onClick={onClick}
            className="m3e-card__overlay-action"
          >
            <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
          </BaseButton>
        )}
        {inner}
      </article>
    );
  }

  if (isInteractive) {
    const isLink = isLinkRenderTarget(href, render);
    const mergedCardProps = mergeProps<"button">(
      rippleHandlers as unknown as React.ComponentPropsWithRef<"button">,
      restProps as unknown as React.ComponentPropsWithRef<"button">,
    );
    const cardClassName = className
      ? `m3e-card m3e-card--interactive ${className}`
      : "m3e-card m3e-card--interactive";
    const cardStyle = {
      borderRadius: restRadiusCss,
      ...style,
    };

    if (isLink) {
      return (
        <LinkActionElement
          {...(mergedCardProps as Record<string, unknown>)}
          ref={ref}
          href={href}
          target={target}
          rel={rel}
          render={render}
          disabled={disabled}
          aria-label={ariaLabel}
          onClick={onClick}
          className={cardClassName}
          data-variant={variant}
          style={cardStyle}
        >
          {inner}
          <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
        </LinkActionElement>
      );
    }

    return (
      <BaseButton
        {...(mergedCardProps as Record<string, unknown>)}
        ref={ref}
        nativeButton={false}
        render={render ?? <div />}
        disabled={disabled}
        aria-label={ariaLabel}
        onClick={onClick}
        className={cardClassName}
        data-variant={variant}
        data-disabled={disabled ? "" : undefined}
        style={cardStyle}
      >
        {inner}
        <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
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
