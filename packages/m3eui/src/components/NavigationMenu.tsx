"use client";

import * as React from "react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";
import { useM3EI18n } from "../context/M3EContext.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";

export interface NavigationMenuCardLinkSpec {
  readonly id: string;
  readonly title: React.ReactNode;
  readonly description?: React.ReactNode;
  readonly href: string;
  readonly icon?: React.ReactNode;
  readonly badge?: React.ReactNode;
  readonly active?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface NavigationMenuFeaturedSpec {
  readonly title: React.ReactNode;
  readonly description: React.ReactNode;
  readonly href: string;
  readonly eyebrow?: React.ReactNode;
  readonly active?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export interface NavigationMenuItemSpec {
  readonly value: string;
  readonly label: React.ReactNode;
  readonly icon?: React.ReactNode;
  readonly href?: string;
  readonly active?: boolean;
  readonly onClick?: React.MouseEventHandler<HTMLAnchorElement>;
  readonly links?: readonly NavigationMenuCardLinkSpec[];
  readonly featured?: NavigationMenuFeaturedSpec;
}

export interface M3ENavigationMenuProps {
  readonly items: readonly NavigationMenuItemSpec[];
  readonly brand?: React.ReactNode;
  readonly trailing?: React.ReactNode;
  readonly value?: string | null;
  readonly defaultValue?: string | null;
  readonly onValueChange?: (value: string | null) => void;
  readonly closeOnClick?: boolean;
  readonly "aria-label"?: string;
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

export function NavigationMenu({
  items,
  brand,
  trailing,
  value,
  defaultValue = null,
  onValueChange,
  closeOnClick = true,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ENavigationMenuProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();

  return (
    <BaseNavigationMenu.Root
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.((next as string | null) ?? null)}
      aria-label={ariaLabel ?? t("navigation.siteMenuLabel")}
      className={className ? `m3e-nav-menu ${className}` : "m3e-nav-menu"}
      style={style}
    >
      <div className="m3e-nav-menu__bar">
        {brand ? <div className="m3e-nav-menu__brand">{brand}</div> : null}

        <BaseNavigationMenu.List className="m3e-nav-menu__list">
          {items.map((item) => {
            const hasSubmenu = Boolean(item.links && item.links.length > 0);
            if (!hasSubmenu) {
              return (
                <BaseNavigationMenu.Item
                  key={item.value}
                  value={item.value}
                  className="m3e-nav-menu__item"
                >
                  <BaseNavigationMenu.Link
                    href={item.href ?? "#"}
                    active={Boolean(item.active)}
                    closeOnClick={closeOnClick}
                    onClick={item.onClick}
                    className="m3e-nav-menu__link"
                  >
                    {item.icon ? (
                      <span className="m3e-nav-menu__item-icon" aria-hidden="true">
                        {item.icon}
                      </span>
                    ) : null}
                    <span>{item.label}</span>
                  </BaseNavigationMenu.Link>
                </BaseNavigationMenu.Item>
              );
            }

            return (
              <BaseNavigationMenu.Item
                key={item.value}
                value={item.value}
                className="m3e-nav-menu__item"
              >
                <BaseNavigationMenu.Trigger className="m3e-nav-menu__trigger">
                  {item.icon ? (
                    <span className="m3e-nav-menu__item-icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  ) : null}
                  <span>{item.label}</span>
                  <BaseNavigationMenu.Icon className="m3e-nav-menu__chevron">
                    <DisclosureChevronSvg />
                  </BaseNavigationMenu.Icon>
                </BaseNavigationMenu.Trigger>

                <BaseNavigationMenu.Content className="m3e-nav-menu__content">
                  <div
                    className="m3e-nav-menu__panel"
                    data-has-featured={item.featured ? "" : undefined}
                  >
                    {item.featured ? (
                      <BaseNavigationMenu.Link
                        href={item.featured.href}
                        active={Boolean(item.featured.active)}
                        closeOnClick={closeOnClick}
                        onClick={item.featured.onClick}
                        className="m3e-nav-menu__featured"
                      >
                        {item.featured.eyebrow ? (
                          <span className="m3e-nav-menu__featured-eyebrow">
                            {item.featured.eyebrow}
                          </span>
                        ) : null}
                        <span className="m3e-nav-menu__featured-title">
                          {item.featured.title}
                        </span>
                        <span className="m3e-nav-menu__featured-desc">
                          {item.featured.description}
                        </span>
                      </BaseNavigationMenu.Link>
                    ) : null}

                    <ul className="m3e-nav-menu__grid">
                      {item.links?.map((sub) => (
                        <li key={sub.id} className="m3e-nav-menu__grid-item">
                          <BaseNavigationMenu.Link
                            href={sub.href}
                            active={Boolean(sub.active)}
                            closeOnClick={closeOnClick}
                            onClick={sub.onClick}
                            className="m3e-nav-menu__card-link"
                          >
                            {sub.icon ? (
                              <span
                                className="m3e-nav-menu__card-icon"
                                aria-hidden="true"
                              >
                                {sub.icon}
                              </span>
                            ) : null}
                            <span className="m3e-nav-menu__card-body">
                              <span className="m3e-nav-menu__card-title-row">
                                <span className="m3e-nav-menu__card-title">
                                  {sub.title}
                                </span>
                                {sub.badge ? (
                                  <span className="m3e-nav-menu__card-badge">
                                    {sub.badge}
                                  </span>
                                ) : null}
                              </span>
                              {sub.description ? (
                                <span className="m3e-nav-menu__card-desc">
                                  {sub.description}
                                </span>
                              ) : null}
                            </span>
                          </BaseNavigationMenu.Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                </BaseNavigationMenu.Content>
              </BaseNavigationMenu.Item>
            );
          })}
        </BaseNavigationMenu.List>

        {trailing ? (
          <div className="m3e-nav-menu__trailing">{trailing}</div>
        ) : null}
      </div>

      <BaseNavigationMenu.Portal container={portalContainer}>
        <BaseNavigationMenu.Positioner
          sideOffset={10}
          collisionPadding={{ top: 12, bottom: 12, left: 16, right: 16 }}
          className="m3e-nav-menu__positioner"
        >
          <BaseNavigationMenu.Popup className="m3e-nav-menu__popup">
            <BaseNavigationMenu.Viewport className="m3e-nav-menu__viewport" />
          </BaseNavigationMenu.Popup>
        </BaseNavigationMenu.Positioner>
      </BaseNavigationMenu.Portal>
    </BaseNavigationMenu.Root>
  );
}
