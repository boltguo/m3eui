import * as React from "react";
import { Toolbar } from "@base-ui/react/toolbar";
import {
  TOP_APP_BAR_SPECS,
  type TopAppBarVariant,
  resolveTopAppBarGeometry,
} from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";

export interface M3ETopAppBarProps {
  readonly title: React.ReactNode;
  readonly subtitle?: React.ReactNode;
  readonly variant?: TopAppBarVariant;
  readonly navigationIcon?: React.ReactNode;
  readonly actions?: React.ReactNode;
  readonly collapsedFraction?: number;
  readonly scrolled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function TopAppBar({
  title,
  subtitle,
  variant = "small",
  navigationIcon,
  actions,
  collapsedFraction = 0,
  scrolled,
  className,
  style,
}: M3ETopAppBarProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const smoothFraction = useM3EScalarSpring(
    Math.max(0, Math.min(1, collapsedFraction)),
    "fastSpatial",
  );
  const geo = resolveTopAppBarGeometry({
    variant,
    collapsedFraction: smoothFraction,
    scrolled,
  });

  const isCentered = variant === "center-aligned";
  const isFlexible =
    variant === "medium-flexible" || variant === "large-flexible";

  return (
    <header
      className={className ? `m3e-top-app-bar ${className}` : "m3e-top-app-bar"}
      data-variant={variant}
      data-elevated={geo.isElevated ? "" : undefined}
      style={{
        minHeight: `${geo.height.toFixed(1)}px`,
        paddingInline: `${TOP_APP_BAR_SPECS.horizontalPadding}px`,
        ...style,
      }}
    >
      <div className="m3e-top-app-bar__top-row">
        <div className="m3e-top-app-bar__nav">
          {navigationIcon ?? null}
        </div>

        {!isFlexible || !geo.isTwoRow ? (
          <div
            className="m3e-top-app-bar__inline-titles"
            data-centered={isCentered ? "" : undefined}
          >
            <div
              className="m3e-top-app-bar__title"
              style={{ fontSize: `${geo.titleFontSize.toFixed(1)}px` }}
            >
              {title}
            </div>
            {subtitle && !isFlexible ? (
              <div className="m3e-top-app-bar__subtitle">{subtitle}</div>
            ) : null}
          </div>
        ) : (
          <div className="m3e-top-app-bar__spacer" />
        )}

        {actions ? (
          <Toolbar.Root
            aria-label={t("topAppBar.actionsLabel")}
            className="m3e-top-app-bar__actions"
          >
            {actions}
          </Toolbar.Root>
        ) : (
          <div className="m3e-top-app-bar__actions-placeholder" />
        )}
      </div>

      {isFlexible && geo.isTwoRow ? (
        <div className="m3e-top-app-bar__expanded-row">
          <div
            className="m3e-top-app-bar__title"
            style={{ fontSize: `${geo.titleFontSize.toFixed(1)}px` }}
          >
            {title}
          </div>
          {subtitle ? (
            <div
              className="m3e-top-app-bar__subtitle"
              style={{ opacity: geo.subtitleOpacity }}
            >
              {subtitle}
            </div>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
