import * as React from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import { Progress as BaseProgress } from "@base-ui/react/progress";
import {
  METER_TOKENS,
  PROGRESS_TOKENS,
  resolveCircularProgressArcs,
} from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";
import { formatLocalizedPercent } from "../i18n/index.js";

export interface M3ELinearProgressIndicatorProps {
  readonly value?: number | null;
  readonly indeterminate?: boolean;
  readonly thickness?: "standard" | "thick";
  readonly label?: React.ReactNode;
  readonly showValue?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function LinearProgressIndicator({
  value = 60,
  indeterminate = false,
  thickness = "standard",
  label,
  showValue = false,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ELinearProgressIndicatorProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const isIndet = indeterminate || value === null || value === undefined;
  const clampedPct = isIndet ? 0 : Math.max(0, Math.min(100, value));
  const smoothPct = useM3EScalarSpring(clampedPct, "defaultSpatial");
  const displayPct = Math.max(0, Math.min(100, smoothPct));

  const barHeight =
    thickness === "thick"
      ? PROGRESS_TOKENS.linearThickHeight
      : PROGRESS_TOKENS.linearHeight;
  const gapPx =
    displayPct <= 1 || displayPct >= 99 ? 0 : PROGRESS_TOKENS.trackGap;

  return (
    <BaseProgress.Root
      value={isIndet ? null : Math.round(clampedPct)}
      min={0}
      max={100}
      locale={locale}
      aria-label={!label ? (ariaLabel ?? t("progress.linearLabel")) : undefined}
      className={
        className
          ? `m3e-linear-progress ${className}`
          : "m3e-linear-progress"
      }
      style={style}
    >
      {label || showValue ? (
        <div className="m3e-linear-progress__header">
          {label ? (
            <BaseProgress.Label className="m3e-linear-progress__label">
              {label}
            </BaseProgress.Label>
          ) : null}
          {showValue && !isIndet ? (
            <BaseProgress.Value className="m3e-linear-progress__value" />
          ) : null}
        </div>
      ) : null}

      <BaseProgress.Track
        className="m3e-linear-progress__track-host"
        data-indeterminate={isIndet ? "" : undefined}
        style={{ height: `${barHeight}px` }}
      >
        {isIndet ? (
          <div className="m3e-linear-progress__indet-wrap" aria-hidden="true">
            <span className="m3e-linear-progress__indet-seg m3e-linear-progress__indet-seg--primary" />
            <span className="m3e-linear-progress__indet-seg m3e-linear-progress__indet-seg--secondary" />
          </div>
        ) : (
          <div
            className="m3e-linear-progress__split"
            style={{ gap: `${gapPx}px` }}
            aria-hidden="true"
          >
            {displayPct > 0.2 ? (
              <BaseProgress.Indicator
                className="m3e-linear-progress__active"
                style={{
                  flex: `0 0 calc(${displayPct.toFixed(2)}% - ${(gapPx / 2).toFixed(1)}px)`,
                }}
              />
            ) : null}
            {displayPct < 99.8 ? (
              <div className="m3e-linear-progress__rest">
                <span
                  className="m3e-linear-progress__stop-dot"
                  style={{
                    width: `${PROGRESS_TOKENS.stopDotSize}px`,
                    height: `${PROGRESS_TOKENS.stopDotSize}px`,
                  }}
                />
              </div>
            ) : null}
          </div>
        )}
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}

export interface M3ECircularProgressIndicatorProps {
  readonly value?: number | null;
  readonly indeterminate?: boolean;
  readonly size?: "sm" | "md" | "lg";
  readonly showValue?: boolean;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function CircularProgressIndicator({
  value = 68,
  indeterminate = false,
  size = "md",
  showValue = false,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ECircularProgressIndicatorProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const resolvedAriaLabel = ariaLabel ?? t("progress.circularLabel");
  const isIndet = indeterminate || value === null || value === undefined;
  const clamped = isIndet ? 0 : Math.max(0, Math.min(100, value));
  const localizedPctText = !isIndet
    ? formatLocalizedPercent(locale, clamped / 100)
    : undefined;
  const smooth = useM3EScalarSpring(clamped / 100, "defaultSpatial");
  const spec = PROGRESS_TOKENS.circularSizes[size];

  const arcs = resolveCircularProgressArcs({
    progress: isIndet ? 0.28 : smooth,
    size: spec.size,
    strokeWidth: spec.strokeWidth,
  });

  const center = spec.size / 2;

  return (
    <BaseProgress.Root
      value={isIndet ? null : Math.round(clamped)}
      min={0}
      max={100}
      locale={locale}
      aria-label={resolvedAriaLabel}
      aria-valuetext={localizedPctText}
      className={
        className
          ? `m3e-circular-progress ${className}`
          : "m3e-circular-progress"
      }
      data-indeterminate={isIndet ? "" : undefined}
      style={{
        width: `${spec.size}px`,
        height: `${spec.size}px`,
        ...style,
      }}
    >
      <svg
        width={spec.size}
        height={spec.size}
        viewBox={`0 0 ${spec.size} ${spec.size}`}
        className="m3e-circular-progress__svg"
        aria-hidden="true"
      >
        {arcs.trackDashLength > 0.5 ? (
          <circle
            cx={center}
            cy={center}
            r={arcs.radius}
            fill="none"
            stroke="var(--m3e-color-secondary-container)"
            strokeWidth={spec.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcs.trackDashLength.toFixed(2)} ${arcs.circumference.toFixed(2)}`}
            transform={`rotate(${arcs.trackRotationDeg.toFixed(2)} ${center} ${center})`}
          />
        ) : null}
        {arcs.activeDashLength > 0.5 ? (
          <circle
            cx={center}
            cy={center}
            r={arcs.radius}
            fill="none"
            stroke="var(--m3e-color-primary)"
            strokeWidth={spec.strokeWidth}
            strokeLinecap="round"
            strokeDasharray={`${arcs.activeDashLength.toFixed(2)} ${arcs.circumference.toFixed(2)}`}
            transform={`rotate(-90 ${center} ${center})`}
          />
        ) : null}
      </svg>

      {showValue && !isIndet && size !== "sm" ? (
        <span className="m3e-circular-progress__center" aria-hidden="true">
          {localizedPctText}
        </span>
      ) : null}
    </BaseProgress.Root>
  );
}

export interface M3EMeterProps {
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly label: React.ReactNode;
  readonly valueText?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Meter({
  value,
  min = 0,
  max = 100,
  label,
  valueText,
  className,
  style,
}: M3EMeterProps): React.JSX.Element {
  const { locale } = useM3EI18n();
  const ratio =
    max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const smoothPct = useM3EScalarSpring(ratio * 100, "defaultSpatial");
  const pct = Math.max(0, Math.min(100, smoothPct));

  const tone =
    ratio >= METER_TOKENS.criticalThreshold
      ? "critical"
      : ratio >= METER_TOKENS.warningThreshold
        ? "warning"
        : "normal";

  const gapPx = pct <= 1 || pct >= 99 ? 0 : METER_TOKENS.trackGap;

  return (
    <BaseMeter.Root
      value={value}
      min={min}
      max={max}
      locale={locale}
      className={className ? `m3e-meter ${className}` : "m3e-meter"}
      data-tone={tone}
      style={style}
    >
      <div className="m3e-meter__header">
        <BaseMeter.Label className="m3e-meter__label">{label}</BaseMeter.Label>
        {valueText ? (
          <span className="m3e-meter__value">{valueText}</span>
        ) : (
          <BaseMeter.Value className="m3e-meter__value" />
        )}
      </div>

      <BaseMeter.Track
        className="m3e-meter__track"
        style={{ height: `${METER_TOKENS.height}px`, gap: `${gapPx}px` }}
      >
        {pct > 0.2 ? (
          <BaseMeter.Indicator
            className="m3e-meter__indicator"
            data-tone={tone}
            style={{
              flex: `0 0 calc(${pct.toFixed(2)}% - ${(gapPx / 2).toFixed(1)}px)`,
            }}
          />
        ) : null}
        {pct < 99.8 ? (
          <div className="m3e-meter__rest" aria-hidden="true" />
        ) : null}
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
}
