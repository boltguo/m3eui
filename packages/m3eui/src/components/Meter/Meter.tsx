"use client";

import * as React from "react";
import { Meter as BaseMeter } from "@base-ui/react/meter";
import {
  METER_TOKENS,
} from "../../tokens/topology.js";
import { useM3EI18n } from "../../context/M3EContext.js";
import { useM3EScalarSpringEffect } from "../../hooks/useM3ESpring.js";

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

function resolveMeterMetrics(pctValue: number) {
  const pct = Math.max(0, Math.min(100, pctValue));
  const gapPx = pct <= 1 || pct >= 99 ? 0 : METER_TOKENS.trackGap;
  return {
    pct,
    gapPx,
    showIndicator: pct > 0.2,
    showRest: pct < 99.8,
    flex: `0 0 calc(${pct.toFixed(2)}% - ${(gapPx / 2).toFixed(1)}px)`,
  };
}

export const Meter = React.forwardRef<HTMLDivElement, M3EMeterProps>(function Meter(
  {
    id,
    value,
    min = 0,
    max = 100,
    label,
    valueText,
    className,
    style,
  },
  ref,
): React.JSX.Element {
  const { locale } = useM3EI18n();
  const ratio =
    max > min ? Math.max(0, Math.min(1, (value - min) / (max - min))) : 0;
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const indicatorRef = React.useRef<HTMLDivElement | null>(null);
  const restRef = React.useRef<HTMLDivElement | null>(null);
  const [initPct] = React.useState(ratio * 100);
  const initMetrics = resolveMeterMetrics(initPct);

  useM3EScalarSpringEffect(ratio * 100, "defaultSpatial", (smoothPct) => {
    const m = resolveMeterMetrics(smoothPct);
    if (trackRef.current) {
      trackRef.current.style.gap = `${m.gapPx}px`;
    }
    if (indicatorRef.current) {
      indicatorRef.current.style.display = m.showIndicator ? "" : "none";
      indicatorRef.current.style.flex = m.flex;
    }
    if (restRef.current) {
      restRef.current.style.display = m.showRest ? "" : "none";
    }
  });

  const tone =
    ratio >= METER_TOKENS.criticalThreshold
      ? "critical"
      : ratio >= METER_TOKENS.warningThreshold
        ? "warning"
        : "normal";

  return (
    <BaseMeter.Root
      ref={ref}
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
        ref={trackRef}
        className="m3e-meter__track"
        style={{ height: `${METER_TOKENS.height}px`, gap: `${initMetrics.gapPx}px` }}
      >
        <BaseMeter.Indicator
          ref={indicatorRef}
          className="m3e-meter__indicator"
          data-tone={tone}
          style={{
            display: initMetrics.showIndicator ? undefined : "none",
            flex: initMetrics.flex,
          }}
        />
        <div
          ref={restRef}
          className="m3e-meter__rest"
          aria-hidden="true"
          style={initMetrics.showRest ? undefined : { display: "none" }}
        />
      </BaseMeter.Track>
    </BaseMeter.Root>
  );
});
