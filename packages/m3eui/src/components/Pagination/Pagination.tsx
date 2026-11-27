"use client";

import * as React from "react";
import { useM3EI18n } from "../../context/M3EContext.js";
import {
  useM3ECornerSpringRef,
  usePressHoldState,
} from "../../hooks/useM3ESpring.js";
import { formatLocalizedInteger } from "../../i18n/index.js";
import { ChevronLeftIcon, ChevronRightIcon } from "../../internal/icons.js";
import { isModifiedLinkClick } from "../../internal/link.js";
import { mergeInteractionHandlers, useM3ERipple } from "../../internal/ripple.js";

export type PaginationSize = "sm" | "md";

export interface M3EPaginationProps {
  readonly page?: number;
  readonly defaultPage?: number;
  readonly totalPages?: number;
  readonly totalItems?: number;
  readonly pageSize?: number;
  readonly onPageChange?: (page: number) => void;
  readonly getItemHref?: (page: number) => string | undefined;
  readonly siblingCount?: number;
  readonly size?: PaginationSize;
  readonly showSummary?: boolean;
  readonly disabled?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

type PageToken = number | "start-ellipsis" | "end-ellipsis";

function buildPageTokens(
  current: number,
  total: number,
  siblings: number,
): readonly PageToken[] {
  const totalNumbers = siblings * 2 + 5;
  if (total <= totalNumbers) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(current - siblings, 1);
  const rightSibling = Math.min(current + siblings, total);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 1;

  if (!showLeftDots && showRightDots) {
    const leftCount = 3 + 2 * siblings;
    const leftRange = Array.from({ length: leftCount }, (_, i) => i + 1);
    return [...leftRange, "end-ellipsis", total];
  }

  if (showLeftDots && !showRightDots) {
    const rightCount = 3 + 2 * siblings;
    const start = total - rightCount + 1;
    const rightRange = Array.from({ length: rightCount }, (_, i) => start + i);
    return [1, "start-ellipsis", ...rightRange];
  }

  const middleRange = Array.from(
    { length: rightSibling - leftSibling + 1 },
    (_, i) => leftSibling + i,
  );
  return [1, "start-ellipsis", ...middleRange, "end-ellipsis", total];
}

function PageNumberButton({
  pageNumber,
  active,
  size,
  disabled,
  label,
  displayText,
  href,
  onSelect,
}: {
  readonly pageNumber: number;
  readonly active: boolean;
  readonly size: PaginationSize;
  readonly disabled: boolean;
  readonly label: string;
  readonly displayText: string;
  readonly href?: string;
  readonly onSelect: (p: number) => void;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(disabled);
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  const mergedHandlers = mergeInteractionHandlers(
    pressHandlers,
    rippleHandlers,
  );
  const boxSize = size === "sm" ? 34 : 40;
  const restRadius = active ? 12 : boxSize / 2;
  const radius = isPressed ? 8 : restRadius;

  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLElement>(
    [radius, radius, radius, radius],
    "fastSpatial",
  );

  if (href && !disabled) {
    return (
      <a
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className="m3e-pagination__btn"
        data-active={active ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        data-size={size}
        style={{
          minInlineSize: `${boxSize}px`,
          blockSize: `${boxSize}px`,
          borderRadius: borderRadiusCss,
        }}
        onClick={(e) => {
          if (isModifiedLinkClick(e)) {
            return;
          }
          onSelect(pageNumber);
        }}
        {...mergedHandlers}
      >
        <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
        <span className="m3e-pagination__label" data-text={displayText}>
          {displayText}
        </span>
      </a>
    );
  }

  return (
    <button
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      disabled={disabled}
      aria-label={label}
      aria-current={active ? "page" : undefined}
      className="m3e-pagination__btn"
      data-active={active ? "" : undefined}
      data-pressed={isPressed ? "" : undefined}
      data-size={size}
      style={{
        minInlineSize: `${boxSize}px`,
        blockSize: `${boxSize}px`,
        borderRadius: borderRadiusCss,
      }}
      onClick={() => onSelect(pageNumber)}
      {...mergedHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <span className="m3e-pagination__label" data-text={displayText}>
        {displayText}
      </span>
    </button>
  );
}

function PaginationStepButton({
  dir,
  size,
  disabled,
  ariaLabel,
  href,
  onSelect,
}: {
  readonly dir: "prev" | "next";
  readonly size: PaginationSize;
  readonly disabled: boolean;
  readonly ariaLabel: string;
  readonly href?: string;
  readonly onSelect: () => void;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(disabled);
  const { rippleRef, rippleHandlers } = useM3ERipple(disabled);
  const mergedHandlers = mergeInteractionHandlers(
    pressHandlers,
    rippleHandlers,
  );
  const boxSize = size === "sm" ? 34 : 40;
  const targetRadius = isPressed && !disabled ? 8 : boxSize / 2;
  const { ref, borderRadiusCss } = useM3ECornerSpringRef<HTMLElement>(
    [targetRadius, targetRadius, targetRadius, targetRadius],
    "fastSpatial",
  );
  const Chevron = dir === "prev" ? ChevronLeftIcon : ChevronRightIcon;
  const body = (
    <>
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      <Chevron size={16} strokeWidth={2.3} className="m3e-pagination__chevron" />
    </>
  );
  const shared = {
    "aria-label": ariaLabel,
    className: "m3e-pagination__btn m3e-pagination__btn--step",
    "data-pressed": isPressed ? "" : undefined,
    style: {
      minInlineSize: `${boxSize}px`,
      blockSize: `${boxSize}px`,
      borderRadius: borderRadiusCss,
    },
    ...mergedHandlers,
  };

  if (href) {
    return (
      <a
        {...shared}
        ref={ref as React.Ref<HTMLAnchorElement>}
        href={href}
        onClick={(e) => {
          if (isModifiedLinkClick(e)) {
            return;
          }
          onSelect();
        }}
      >
        {body}
      </a>
    );
  }

  return (
    <button
      {...shared}
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      disabled={disabled}
      onClick={onSelect}
    >
      {body}
    </button>
  );
}

export const Pagination = React.forwardRef<HTMLElement, M3EPaginationProps>(
  function Pagination(
    {
      page: controlledPage,
      defaultPage = 1,
      totalPages: explicitTotalPages,
      totalItems,
      pageSize = 10,
      onPageChange,
      getItemHref,
      siblingCount = 1,
      size = "md",
      showSummary = false,
      disabled = false,
      "aria-label": ariaLabel,
      className,
      style,
    },
    ref,
  ): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const computedTotalPages = Math.max(
    1,
    explicitTotalPages ??
      (typeof totalItems === "number"
        ? Math.ceil(totalItems / Math.max(1, pageSize))
        : 1),
  );

  const [uncontrolledPage, setUncontrolledPage] =
    React.useState<number>(defaultPage);

  React.useEffect(() => {
    if (controlledPage === undefined && uncontrolledPage > computedTotalPages) {
      setUncontrolledPage(computedTotalPages);
    }
  }, [controlledPage, uncontrolledPage, computedTotalPages]);

  const currentPage = Math.min(
    computedTotalPages,
    Math.max(1, controlledPage ?? uncontrolledPage),
  );

  const prevStepDisabled = disabled || currentPage <= 1;
  const nextStepDisabled = disabled || currentPage >= computedTotalPages;

  const commitPage = (next: number) => {
    const clamped = Math.min(computedTotalPages, Math.max(1, next));
    if (clamped === currentPage) return;
    if (controlledPage === undefined) {
      setUncontrolledPage(clamped);
    }
    onPageChange?.(clamped);
  };

  const tokens = React.useMemo(
    () => buildPageTokens(currentPage, computedTotalPages, siblingCount),
    [currentPage, computedTotalPages, siblingCount],
  );

  const summaryText = React.useMemo(() => {
    if (!showSummary || typeof totalItems !== "number") return null;
    if (totalItems === 0) {
      return t("pagination.summary", {
        start: formatLocalizedInteger(locale, 0),
        end: formatLocalizedInteger(locale, 0),
        total: formatLocalizedInteger(locale, 0),
      });
    }
    const start = (currentPage - 1) * pageSize + 1;
    const end = Math.min(totalItems, currentPage * pageSize);
    return t("pagination.summary", {
      start: formatLocalizedInteger(locale, start),
      end: formatLocalizedInteger(locale, end),
      total: formatLocalizedInteger(locale, totalItems),
    });
  }, [showSummary, totalItems, currentPage, pageSize, locale, t]);

  const renderStep = (dir: "prev" | "next") => {
    const isPrev = dir === "prev";
    const stepDisabled = isPrev ? prevStepDisabled : nextStepDisabled;
    const targetPage = currentPage + (isPrev ? -1 : 1);
    return (
      <PaginationStepButton
        dir={dir}
        size={size}
        disabled={stepDisabled}
        ariaLabel={t(isPrev ? "pagination.previous" : "pagination.next")}
        href={stepDisabled ? undefined : getItemHref?.(targetPage)}
        onSelect={() => commitPage(targetPage)}
      />
    );
  };

  return (
    <nav
      ref={ref}
      aria-label={ariaLabel ?? t("pagination.ariaLabel")}
      className={className ? `m3e-pagination ${className}` : "m3e-pagination"}
      data-size={size}
      style={style}
    >
      {summaryText ? (
        <span className="m3e-pagination__summary">{summaryText}</span>
      ) : null}

      <ul className="m3e-pagination__list">
        <li className="m3e-pagination__li">
          {renderStep("prev")}
        </li>

        {tokens.map((tok) => {
          if (tok === "start-ellipsis" || tok === "end-ellipsis") {
            return (
              <li key={tok} className="m3e-pagination__li" aria-hidden="true">
                <span className="m3e-pagination__ellipsis">…</span>
              </li>
            );
          }
          const localizedNum = formatLocalizedInteger(locale, tok);
          return (
            <li key={tok} className="m3e-pagination__li">
              <PageNumberButton
                pageNumber={tok}
                active={tok === currentPage}
                size={size}
                disabled={disabled}
                label={t("pagination.page", { page: localizedNum })}
                displayText={localizedNum}
                href={getItemHref?.(tok)}
                onSelect={commitPage}
              />
            </li>
          );
        })}

        <li className="m3e-pagination__li">
          {renderStep("next")}
        </li>
      </ul>
    </nav>
  );
});
