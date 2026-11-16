"use client";

import * as React from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import {
  METER_TOKENS,
} from "../tokens/topology.js";
import { useM3EI18n } from "../context/M3EContext.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";

export interface M3EMeterProps {
  readonly id?: string;
  readonly value: number;
  readonly min?: number;
  readonly max?: number;
  readonly label: React.ReactNode;
  readonly valueText?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Meter({
  id,
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
      id={id}
      value={value}
      min={min}
      max={max}
      locale={locale}
      getAriaValueText={
        typeof valueText === "string" ? () => valueText : undefined
      }
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
