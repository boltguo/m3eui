"use client";

import * as React from "react";
import { useRender } from "@base-ui/react/use-render";

export function isModifiedLinkClick(e: React.MouseEvent): boolean {
  return e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0;
}

export function isLinkRenderTarget(
  href: string | undefined,
  render: React.ReactElement | undefined,
): boolean {
  if (href !== undefined) return true;
  if (!React.isValidElement(render)) return false;
  if (render.type === "a") return true;
  const props = render.props as Record<string, unknown> | null;
  return Boolean(props && ("href" in props || "to" in props));
}

export interface LinkActionElementProps
  extends Omit<
    React.AnchorHTMLAttributes<HTMLElement>,
    "children" | "onClick" | "onPointerDown"
  > {
  readonly render?: React.ReactElement;
  readonly disabled?: boolean;
  readonly focusableWhenDisabled?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
  readonly onPointerDown?: React.PointerEventHandler<HTMLElement>;
  readonly children?: React.ReactNode;
  readonly [attr: `data-${string}`]: string | undefined;
}

export const LinkActionElement = React.forwardRef<HTMLElement, LinkActionElementProps>(
  function LinkActionElement(
    {
      href,
      target,
      rel,
      render,
      disabled = false,
      focusableWhenDisabled = false,
      onClick,
      onPointerDown,
      tabIndex,
      children,
      ...rest
    },
    ref,
  ) {
    return useRender<Record<string, unknown>, HTMLElement>({
      defaultTagName: "a",
      render,
      ref,
      props: {
        ...rest,
        ...(!render
          ? {
              href: disabled ? undefined : href,
              target,
              rel,
            }
          : undefined),
        "aria-disabled": disabled ? true : rest["aria-disabled"],
        "data-disabled": disabled ? "" : undefined,
        tabIndex: disabled
          ? focusableWhenDisabled
            ? (tabIndex ?? 0)
            : -1
          : tabIndex,
        onPointerDown: (e: React.PointerEvent<HTMLElement>) => {
          if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onPointerDown?.(e);
        },
        onClick: (e: React.MouseEvent<HTMLElement>) => {
          if (disabled) {
            e.preventDefault();
            e.stopPropagation();
            return;
          }
          onClick?.(e);
        },
        children,
      },
    });
  },
);
