"use client";

import * as React from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";
import { useM3ECornerSpringRef, usePressHoldState } from "../hooks/useM3ESpring.js";

export type CollapsibleVariant = "tonal" | "outlined" | "plain";

export interface M3ECollapsibleProps {
  readonly title: React.ReactNode;
  readonly subtitle?: React.ReactNode;
  readonly leading?: React.ReactNode;
  readonly trailingBadge?: React.ReactNode;
  readonly children: React.ReactNode;
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly hiddenUntilFound?: boolean;
  readonly disabled?: boolean;
  readonly variant?: CollapsibleVariant;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function DisclosureChevronSvg() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export const Collapsible = React.forwardRef<HTMLDivElement, M3ECollapsibleProps>(
  function Collapsible(
    {
      title,
      subtitle,
      leading,
      trailingBadge,
      children,
      open: controlledOpen,
      defaultOpen = false,
      onOpenChange,
      hiddenUntilFound = true,
      disabled = false,
      variant = "tonal",
      className,
      style,
    },
    ref,
  ) {
    const { isPressed, pressHandlers } = usePressHoldState(disabled);
    const [uncontrolledOpen, setUncontrolledOpen] =
      React.useState<boolean>(defaultOpen);
    const isOpen = controlledOpen ?? uncontrolledOpen;

    const targetRadius = isOpen ? 24 : 18;
    const cornerSpring = useM3ECornerSpringRef<HTMLDivElement>(
      [targetRadius, targetRadius, targetRadius, targetRadius],
      "fastSpatial",
      ref,
    );

    return (
      <BaseCollapsible.Root
        ref={cornerSpring.ref}
        open={controlledOpen}
        defaultOpen={defaultOpen}
        disabled={disabled}
        onOpenChange={(next) => {
          if (controlledOpen === undefined) {
            setUncontrolledOpen(next);
          }
          onOpenChange?.(next);
        }}
        className={
          className ? `m3e-collapsible ${className}` : "m3e-collapsible"
        }
        data-variant={variant}
        data-open={isOpen ? "" : undefined}
        style={{
          borderRadius: cornerSpring.borderRadiusCss,
          ...style,
        }}
      >
        <BaseCollapsible.Trigger
          className="m3e-collapsible__trigger"
          data-pressed={isPressed ? "" : undefined}
          {...pressHandlers}
        >
          <span
            className="m3e-collapsible__chevron"
            data-open={isOpen ? "" : undefined}
            aria-hidden="true"
          >
            <DisclosureChevronSvg />
          </span>
          {leading ? (
            <span className="m3e-collapsible__leading" aria-hidden="true">
              {leading}
            </span>
          ) : null}
          <span className="m3e-collapsible__heading">
            <span className="m3e-collapsible__title">{title}</span>
            {subtitle ? (
              <span className="m3e-collapsible__subtitle">{subtitle}</span>
            ) : null}
          </span>
          {trailingBadge ? (
            <span className="m3e-collapsible__badge">{trailingBadge}</span>
          ) : null}
        </BaseCollapsible.Trigger>

        <BaseCollapsible.Panel
          hiddenUntilFound={hiddenUntilFound}
          className="m3e-collapsible__panel"
        >
          <div className="m3e-collapsible__content">{children}</div>
        </BaseCollapsible.Panel>
      </BaseCollapsible.Root>
    );
  },
);
