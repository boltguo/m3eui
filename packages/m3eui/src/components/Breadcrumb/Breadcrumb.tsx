"use client";

import * as React from "react";
import { useM3EI18n } from "../../context/M3EContext.js";
import { DropdownMenu } from "../Menu/Menu.js";
import { useM3ERipple } from "../../internal/ripple.js";

export type BreadcrumbSeparator = "slash" | "chevron";

export interface M3EBreadcrumbItem {
  readonly key?: string;
  readonly label: React.ReactNode;
  readonly textLabel?: string;
  readonly href?: string;
  readonly icon?: React.ReactNode;
  readonly render?: React.ReactElement<Record<string, unknown>>;
  readonly onClick?: React.MouseEventHandler<HTMLElement>;
}

export interface M3EBreadcrumbProps {
  readonly items: readonly M3EBreadcrumbItem[];
  readonly separator?: BreadcrumbSeparator;
  readonly maxItems?: number;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function BreadcrumbAnchor({
  item,
  isCurrent,
}: {
  readonly item: M3EBreadcrumbItem;
  readonly isCurrent: boolean;
}) {
  const { rippleRef, rippleHandlers } = useM3ERipple(isCurrent);
  const linkClass = "m3e-breadcrumb__link";
  const content = (
    <>
      {item.icon ? (
        <span className="m3e-breadcrumb__icon" aria-hidden="true">
          {item.icon}
        </span>
      ) : null}
      <span
        className="m3e-breadcrumb__label"
        data-text={typeof item.label === "string" ? item.label : undefined}
      >
        {item.label}
      </span>
    </>
  );

  if (item.render) {
    return React.cloneElement(
      item.render,
      {
        className: item.render.props.className
          ? `${linkClass} ${String(item.render.props.className)}`
          : linkClass,
        "aria-current": isCurrent ? "page" : undefined,
        onClick: item.onClick ?? item.render.props.onClick,
        ...rippleHandlers,
      },
      <>
        {content}
        <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      </>,
    );
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        aria-current={isCurrent ? "page" : undefined}
        className={linkClass}
        onClick={item.onClick}
        {...rippleHandlers}
      >
        {content}
        <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      </a>
    );
  }

  if (item.onClick) {
    return (
      <button
        type="button"
        aria-current={isCurrent ? "page" : undefined}
        className={`${linkClass} m3e-breadcrumb__btn`}
        onClick={item.onClick}
        {...rippleHandlers}
      >
        {content}
        <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      </button>
    );
  }

  return (
    <span
      aria-current={isCurrent ? "page" : undefined}
      className="m3e-breadcrumb__current"
    >
      {content}
    </span>
  );
}

const BreadcrumbEllipsisButton = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function BreadcrumbEllipsisButton({ className, children, ...props }, ref) {
  const { rippleRef, rippleHandlers } = useM3ERipple();
  return (
    <button
      ref={ref}
      type="button"
      className={
        className ? `m3e-breadcrumb__ellipsis ${className}` : "m3e-breadcrumb__ellipsis"
      }
      {...props}
      {...rippleHandlers}
    >
      <span ref={rippleRef} className="m3e-ripple" aria-hidden="true" />
      {children}
    </button>
  );
});

export function Breadcrumb({
  items,
  separator = "slash",
  maxItems,
  "aria-label": ariaLabel,
  className,
  style,
}: M3EBreadcrumbProps): React.JSX.Element | null {
  const { t } = useM3EI18n();
  const [menuOpen, setMenuOpen] = React.useState(false);

  if (items.length === 0) {
    return null;
  }

  const shouldCollapse =
    typeof maxItems === "number" && maxItems >= 3 && items.length > maxItems;

  const firstItem = items[0]!;
  const trailingCount = shouldCollapse ? Math.max(1, maxItems - 2) : items.length;
  const collapsedItems = shouldCollapse
    ? items.slice(1, items.length - trailingCount)
    : [];
  const trailingItems = shouldCollapse
    ? items.slice(items.length - trailingCount)
    : items;

  return (
    <nav
      aria-label={ariaLabel ?? t("breadcrumb.ariaLabel")}
      className={className ? `m3e-breadcrumb ${className}` : "m3e-breadcrumb"}
      data-separator={separator}
      style={style}
    >
      <ol className="m3e-breadcrumb__list">
        {shouldCollapse ? (
          <>
            <li
              key={firstItem.key ?? "crumb-first"}
              className="m3e-breadcrumb__item"
            >
              <BreadcrumbAnchor item={firstItem} isCurrent={false} />
            </li>
            <li className="m3e-breadcrumb__item">
              <DropdownMenu
                open={menuOpen}
                onOpenChange={setMenuOpen}
                items={collapsedItems.map((ci, idx) => ({
                  id: ci.key ?? `collapsed-${idx}`,
                  label:
                    ci.textLabel ??
                    (typeof ci.label === "string" ? ci.label : `#${idx + 2}`),
                  icon: ci.icon,
                  href: ci.href,
                  render: ci.render,
                  onSelect: (event) => {
                    setMenuOpen(false);
                    if (event) ci.onClick?.(event);
                  },
                }))}
                trigger={
                  <BreadcrumbEllipsisButton aria-label={t("breadcrumb.more")}>
                    …
                  </BreadcrumbEllipsisButton>
                }
              />
            </li>
            {trailingItems.map((item, idx) => {
              const isLast = idx === trailingItems.length - 1;
              return (
                <li
                  key={item.key ?? `crumb-tail-${idx}`}
                  className="m3e-breadcrumb__item"
                >
                  <BreadcrumbAnchor item={item} isCurrent={isLast} />
                </li>
              );
            })}
          </>
        ) : (
          items.map((item, idx) => {
            const isLast = idx === items.length - 1;
            return (
              <li
                key={item.key ?? `crumb-${idx}`}
                className="m3e-breadcrumb__item"
              >
                <BreadcrumbAnchor item={item} isCurrent={isLast} />
              </li>
            );
          })
        )}
      </ol>
    </nav>
  );
}
