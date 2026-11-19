"use client";

import * as React from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";
import {
  ACCORDION_TOKENS,
  resolveAccordionItemCorners,
} from "../../tokens/topology.js";
import { useM3EI18n, useM3ERuntime } from "../../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpringEffect,
} from "../../hooks/useM3ESpring.js";
import { ChevronDownIcon } from "../../internal/icons.js";
import { useM3ERipple } from "../../internal/ripple.js";

export interface AccordionItemSpec {
  readonly value: string;
  readonly title: React.ReactNode;
  readonly subtitle?: React.ReactNode;
  readonly leading?: React.ReactNode;
  readonly trailingBadge?: React.ReactNode;
  readonly content: React.ReactNode;
  readonly disabled?: boolean;
}

export type AccordionVariant = "tonal" | "outlined" | "plain";

export interface M3EAccordionProps {
  readonly items: readonly AccordionItemSpec[];
  readonly value?: string[];
  readonly defaultValue?: string[];
  readonly onValueChange?: (value: string[]) => void;
  readonly multiple?: boolean;
  readonly variant?: AccordionVariant;
  readonly showExpandAll?: boolean;
  readonly hiddenUntilFound?: boolean;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

interface SegmentedAccordionCardProps {
  readonly item: AccordionItemSpec;
  readonly index: number;
  readonly count: number;
  readonly isOpen: boolean;
  readonly prevOpen: boolean;
  readonly nextOpen: boolean;
}

function SegmentedAccordionCard({
  item,
  index,
  count,
  isOpen,
  prevOpen,
  nextOpen,
  disabled: rootDisabled = false,
}: SegmentedAccordionCardProps & { readonly disabled?: boolean }) {
  const { paused, prefersReducedMotion } = useM3ERuntime();
  const itemDisabled = rootDisabled || Boolean(item.disabled);
  const itemRef = React.useRef<HTMLDivElement | null>(null);
  const { rippleRef, rippleHandlers } = useM3ERipple(itemDisabled);
  const corners = resolveAccordionItemCorners({
    index,
    count,
    isOpen,
    prevOpen,
    nextOpen,
  });
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLDivElement>(
    corners,
    "fastSpatial",
    itemRef,
  );
  const targetMargin = isOpen ? ACCORDION_TOKENS.expandedMarginBlock : 0;
  const marginRef = React.useRef<number>(targetMargin);
  if (paused || prefersReducedMotion) {
    marginRef.current = targetMargin;
  }

  useM3EScalarSpringEffect(targetMargin, "fastSpatial", (val) => {
    const next = Math.max(0, val);
    marginRef.current = next;
    if (itemRef.current) {
      itemRef.current.style.marginBlock = `${next.toFixed(1)}px`;
    }
  });

  return (
    <BaseAccordion.Item
      ref={ref}
      value={item.value}
      disabled={item.disabled}
      className="m3e-accordion__item"
      style={{
        borderRadius: borderRadiusCss,
        marginBlock: `${marginRef.current.toFixed(1)}px`,
      }}
    >
      <BaseAccordion.Header className="m3e-accordion__header">
        <BaseAccordion.Trigger
          className="m3e-accordion__trigger"
          style={{
            minHeight: `${ACCORDION_TOKENS.headerMinHeight}px`,
            paddingInline: `${ACCORDION_TOKENS.paddingInline}px`,
          }}
          {...rippleHandlers}
        >
          <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
          {item.leading ? (
            <span className="m3e-accordion__leading" aria-hidden="true">
              {item.leading}
            </span>
          ) : null}
          <span className="m3e-accordion__heading-group">
            <span className="m3e-accordion__title">{item.title}</span>
            {item.subtitle ? (
              <span className="m3e-accordion__subtitle">{item.subtitle}</span>
            ) : null}
          </span>
          {item.trailingBadge ? (
            <span
              className="m3e-accordion__badge"
              data-text={
                typeof item.trailingBadge === "string" ||
                typeof item.trailingBadge === "number"
                  ? ""
                  : undefined
              }
            >
              {item.trailingBadge}
            </span>
          ) : null}
          <span
            className="m3e-accordion__chevron"
            data-open={isOpen ? "" : undefined}
            aria-hidden="true"
          >
            <ChevronDownIcon strokeWidth={2.2} />
          </span>
        </BaseAccordion.Trigger>
      </BaseAccordion.Header>

      <BaseAccordion.Panel className="m3e-accordion__panel">
        <div
          className="m3e-accordion__content"
          style={{ paddingInline: `${ACCORDION_TOKENS.paddingInline}px` }}
        >
          {item.content}
        </div>
      </BaseAccordion.Panel>
    </BaseAccordion.Item>
  );
}

function AccordionExpandAllButton({
  disabled,
  allOpen,
  label,
  onClick,
}: {
  readonly disabled: boolean;
  readonly allOpen: boolean;
  readonly label: string;
  readonly onClick: () => void;
}): React.JSX.Element {
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  return (
    <button
      type="button"
      className="m3e-accordion__expand-all"
      disabled={disabled}
      aria-expanded={allOpen}
      onClick={onClick}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {label}
    </button>
  );
}

export function Accordion({
  items,
  value: controlledValue,
  defaultValue = [],
  onValueChange,
  multiple = true,
  variant = "tonal",
  showExpandAll = false,
  hiddenUntilFound = true,
  disabled = false,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EAccordionProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const [uncontrolledValue, setUncontrolledValue] =
    React.useState<string[]>(defaultValue);
  const openValues = controlledValue ?? uncontrolledValue;
  const openSet = new Set(openValues);
  const hasToolbar = showExpandAll && multiple;

  const enabledValues = items
    .filter((item) => !item.disabled)
    .map((item) => item.value);
  const allOpen =
    enabledValues.length > 0 &&
    enabledValues.every((val) => openSet.has(val));

  const commitValue = (next: string[]) => {
    if (controlledValue === undefined) {
      setUncontrolledValue(next);
    }
    onValueChange?.(next);
  };

  const handleToggleAll = () => {
    if (disabled || !multiple) return;
    if (allOpen) {
      const disabledOpen = openValues.filter(
        (val) => !enabledValues.includes(val),
      );
      commitValue(disabledOpen);
    } else {
      const merged = Array.from(new Set([...openValues, ...enabledValues]));
      commitValue(merged);
    }
  };

  const accordionNode = (
    <BaseAccordion.Root
      value={openValues}
      multiple={multiple}
      hiddenUntilFound={hiddenUntilFound}
      disabled={disabled}
      aria-label={ariaLabel}
      data-variant={variant}
      onValueChange={(next) => {
        commitValue([...next]);
      }}
      className={
        !hasToolbar && className ? `m3e-accordion ${className}` : "m3e-accordion"
      }
      style={{
        gap: `${ACCORDION_TOKENS.collapsedGap}px`,
        ...(!hasToolbar ? style : undefined),
      }}
    >
      {items.map((item, idx) => (
        <SegmentedAccordionCard
          key={item.value}
          item={item}
          index={idx}
          count={items.length}
          isOpen={openSet.has(item.value)}
          prevOpen={idx > 0 && openSet.has(items[idx - 1].value)}
          nextOpen={idx < items.length - 1 && openSet.has(items[idx + 1].value)}
          disabled={disabled}
        />
      ))}
    </BaseAccordion.Root>
  );

  if (!hasToolbar) {
    return accordionNode;
  }

  return (
    <div
      className={
        className ? `m3e-accordion-group ${className}` : "m3e-accordion-group"
      }
      style={style}
    >
      <div className="m3e-accordion__toolbar">
        <AccordionExpandAllButton
          disabled={disabled || enabledValues.length === 0}
          allOpen={allOpen}
          label={allOpen ? t("accordion.collapseAll") : t("accordion.expandAll")}
          onClick={handleToggleAll}
        />
      </div>
      {accordionNode}
    </div>
  );
}
