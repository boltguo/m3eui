import * as React from "react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import {
  SLIDER_SIZE_SPECS,
  SLIDER_TOKENS,
  type SliderSize,
  resolveSliderThumbGeometry,
} from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import { useM3EScalarSpring } from "../hooks/useM3ESpring.js";

export type SliderValue = number | readonly number[];

export interface M3ESliderProps<Value extends SliderValue = number> {
  readonly value?: Value;
  readonly defaultValue?: Value;
  readonly onValueChange?: (value: Value) => void;
  readonly onValueCommitted?: (value: Value) => void;
  readonly min?: number;
  readonly max?: number;
  readonly step?: number;
  readonly minStepsBetweenValues?: number;
  readonly disabled?: boolean;
  readonly size?: SliderSize;
  readonly label?: React.ReactNode;
  readonly showValue?: boolean;
  readonly showValueBubble?: boolean;
  readonly showTicks?: boolean;
  readonly formatValue?: (value: number) => string;
  readonly name?: string;
  readonly "aria-label"?: string;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

function normalizeValues(v: SliderValue | undefined, fallback: number): number[] {
  if (v === undefined) return [fallback];
  if (typeof v === "number") return [v];
  return v.length > 0 ? [...v] : [fallback];
}

const SLIDER_STEP_KEYS = new Set([
  "ArrowLeft",
  "ArrowRight",
  "ArrowUp",
  "ArrowDown",
  "Home",
  "End",
  "PageUp",
  "PageDown",
]);

interface SliderThumbBarProps {
  readonly index: number;
  readonly rawValue: number;
  readonly thumbHeight: number;
  readonly isPressed: boolean;
  readonly isBubbleShown: boolean;
  readonly showValueBubble: boolean;
  readonly formatValue?: (v: number) => string;
  readonly ariaLabel?: string;
  readonly onThumbPointerDown: (index: number) => void;
  readonly onThumbKeyStep: (index: number) => void;
  readonly onThumbBlur: (index: number) => void;
}

function SliderThumbBar({
  index,
  rawValue,
  thumbHeight,
  isPressed,
  isBubbleShown,
  showValueBubble,
  formatValue,
  ariaLabel,
  onThumbPointerDown,
  onThumbKeyStep,
  onThumbBlur,
}: SliderThumbBarProps) {
  const geo = resolveSliderThumbGeometry(isPressed);
  const springWidth = Math.max(
    1.5,
    useM3EScalarSpring(geo.thumbWidth, "fastSpatial"),
  );
  const bubbleProgress = useM3EScalarSpring(isBubbleShown ? 1 : 0, "fastSpatial");

  const formatted = formatValue
    ? formatValue(rawValue)
    : `${Math.round(rawValue * 100) / 100}`;

  return (
    <BaseSlider.Thumb
      index={index}
      aria-label={ariaLabel}
      className="m3e-slider__thumb"
      data-active={isPressed ? "" : undefined}
      style={{
        height: `${thumbHeight}px`,
      }}
      onPointerDown={(e) => {
        if (e.button === 0) {
          onThumbPointerDown(index);
        }
      }}
      onKeyDown={(e) => {
        if (SLIDER_STEP_KEYS.has(e.key)) {
          onThumbKeyStep(index);
        }
      }}
      onBlur={() => onThumbBlur(index)}
    >
      <span
        className="m3e-slider__handle-bar"
        style={{
          width: `${springWidth.toFixed(2)}px`,
          height: `${thumbHeight}px`,
          borderRadius: `${SLIDER_TOKENS.thumbRadius}px`,
        }}
        aria-hidden="true"
      />
      {showValueBubble ? (
        <span
          className="m3e-slider__bubble"
          data-visible={isBubbleShown ? "" : undefined}
          style={{
            opacity: Math.max(0, Math.min(1, bubbleProgress)),
            scale: `${(0.72 + 0.28 * bubbleProgress).toFixed(3)}`,
            translate: `-50% ${((1 - bubbleProgress) * 6).toFixed(2)}px`,
          }}
          aria-hidden="true"
        >
          {formatted}
        </span>
      ) : null}
    </BaseSlider.Thumb>
  );
}

export function Slider<Value extends SliderValue = number>({
  value: controlledValue,
  defaultValue,
  onValueChange,
  onValueCommitted,
  min = 0,
  max = 100,
  step = 1,
  minStepsBetweenValues = 0,
  disabled = false,
  size = "sm",
  label,
  showValue = false,
  showValueBubble = true,
  showTicks = false,
  formatValue,
  name,
  "aria-label": ariaLabel,
  className,
  style,
}: M3ESliderProps<Value>): React.JSX.Element {
  const { debugGeometry, t } = useM3E();
  const [uncontrolledValues, setUncontrolledValues] = React.useState<number[]>(
    () => normalizeValues(defaultValue, min),
  );
  // Active pointer press/drag index — cleared immediately on global window pointerup/pointercancel
  const [pressedThumbIdx, setPressedThumbIdx] = React.useState<number | null>(null);
  // Transient bubble index when stepping via keyboard arrow keys
  const [keyBubbleIdx, setKeyBubbleIdx] = React.useState<number | null>(null);
  const keyBubbleTimerRef = React.useRef<number | null>(null);

  const values =
    controlledValue !== undefined
      ? normalizeValues(controlledValue, min)
      : uncontrolledValues;

  const isRange = values.length > 1;
  const spec = SLIDER_SIZE_SPECS[size];
  const span = Math.max(1e-6, max - min);

  const p0 = clamp01((values[0] - min) / span);
  const p1 = isRange ? clamp01((values[1] - min) / span) : p0;

  // Guarantee immediate release even when pointerup occurs outside the thumb/track
  React.useEffect(() => {
    if (pressedThumbIdx === null) return;
    const clearPointer = () => {
      setPressedThumbIdx(null);
    };
    window.addEventListener("pointerup", clearPointer, { passive: true });
    window.addEventListener("pointercancel", clearPointer, { passive: true });
    window.addEventListener("blur", clearPointer);
    return () => {
      window.removeEventListener("pointerup", clearPointer);
      window.removeEventListener("pointercancel", clearPointer);
      window.removeEventListener("blur", clearPointer);
    };
  }, [pressedThumbIdx]);

  React.useEffect(() => {
    return () => {
      if (keyBubbleTimerRef.current !== null) {
        window.clearTimeout(keyBubbleTimerRef.current);
      }
    };
  }, []);

  const handleThumbPointerDown = React.useCallback((idx: number) => {
    if (keyBubbleTimerRef.current !== null) {
      window.clearTimeout(keyBubbleTimerRef.current);
      keyBubbleTimerRef.current = null;
    }
    setKeyBubbleIdx(null);
    setPressedThumbIdx(idx);
  }, []);

  const handleControlPointerDown = React.useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (disabled || e.button !== 0) return;
      // If pointer landed directly on a thumb, let thumb's handler pick exact index
      const thumbEl = (e.target as HTMLElement | null)?.closest?.("[data-index]");
      if (thumbEl) {
        const attr = Number(thumbEl.getAttribute("data-index"));
        if (!Number.isNaN(attr)) {
          handleThumbPointerDown(attr);
          return;
        }
      }
      if (!isRange) {
        handleThumbPointerDown(0);
        return;
      }
      const rect = e.currentTarget.getBoundingClientRect();
      const frac = rect.width > 0 ? clamp01((e.clientX - rect.left) / rect.width) : 0;
      const nearestIdx = Math.abs(p0 - frac) <= Math.abs(p1 - frac) ? 0 : 1;
      handleThumbPointerDown(nearestIdx);
    },
    [disabled, isRange, p0, p1, handleThumbPointerDown],
  );

  const handleThumbKeyStep = React.useCallback((idx: number) => {
    setKeyBubbleIdx(idx);
    if (keyBubbleTimerRef.current !== null) {
      window.clearTimeout(keyBubbleTimerRef.current);
    }
    keyBubbleTimerRef.current = window.setTimeout(() => {
      setKeyBubbleIdx(null);
      keyBubbleTimerRef.current = null;
    }, 900);
  }, []);

  const handleThumbBlur = React.useCallback((idx: number) => {
    setKeyBubbleIdx((prev) => (prev === idx ? null : prev));
  }, []);

  const anyPressed = pressedThumbIdx !== null;
  const activeGeo = resolveSliderThumbGeometry(anyPressed);
  const springHalfCutout = useM3EScalarSpring(
    activeGeo.thumbWidth / 2 + activeGeo.trackGap,
    "fastSpatial",
  );
  const cut = Math.max(3, springHalfCutout);

  const tickFractions = React.useMemo(() => {
    if (!showTicks || step <= 0) return [];
    const count = Math.floor((max - min) / step);
    if (count <= 1 || count > 24) return [];
    const out: number[] = [];
    for (let i = 0; i <= count; i++) {
      out.push(clamp01((i * step) / span));
    }
    return out;
  }, [showTicks, step, min, max, span]);

  const summaryLabel = React.useMemo(() => {
    if (!showValue) return null;
    if (isRange) {
      const a = formatValue ? formatValue(values[0]) : `${values[0]}`;
      const b = formatValue ? formatValue(values[1]) : `${values[1]}`;
      return `${a} – ${b}`;
    }
    return formatValue ? formatValue(values[0]) : `${values[0]}`;
  }, [showValue, isRange, values, formatValue]);

  const outerR = spec.outerTrackRadius;
  const innerR = spec.innerTrackRadius;

  return (
    <BaseSlider.Root
      value={controlledValue as number | readonly number[] | undefined}
      defaultValue={
        (defaultValue ?? (min as unknown as Value)) as
          | number
          | readonly number[]
          | undefined
      }
      min={min}
      max={max}
      step={step}
      minStepsBetweenValues={minStepsBetweenValues}
      disabled={disabled}
      name={name}
      aria-label={!label ? ariaLabel : undefined}
      onValueChange={(next) => {
        if (controlledValue === undefined) {
          setUncontrolledValues(
            typeof next === "number" ? [next] : [...next],
          );
        }
        onValueChange?.(next as Value);
      }}
      onValueCommitted={(next) => {
        setPressedThumbIdx(null);
        onValueCommitted?.(next as Value);
      }}
      className={className ? `m3e-slider ${className}` : "m3e-slider"}
      data-size={size}
      style={style}
    >
      {label || summaryLabel ? (
        <div className="m3e-slider__header">
          {label ? (
            <span className="m3e-slider__label">{label}</span>
          ) : (
            <span />
          )}
          {summaryLabel ? (
            <span className="m3e-slider__value">{summaryLabel}</span>
          ) : null}
        </div>
      ) : null}

      <BaseSlider.Control
        className="m3e-slider__control"
        style={{
          minHeight: `${Math.max(SLIDER_TOKENS.minControlHeight, spec.thumbHeight)}px`,
        }}
        onPointerDown={handleControlPointerDown}
        onPointerUp={() => setPressedThumbIdx(null)}
        onPointerCancel={() => setPressedThumbIdx(null)}
      >
        <BaseSlider.Track
          className="m3e-slider__track"
          style={{ height: `${spec.trackHeight}px` }}
        >
          {/* Hidden native BaseSlider.Indicator for ARIA/form sync while rendering M3E gapped track segments */}
          <BaseSlider.Indicator className="m3e-slider__sr-indicator" />

          {!isRange ? (
            <>
              <span
                className="m3e-slider__segment m3e-slider__segment--active"
                style={{
                  insetInlineStart: 0,
                  width: `max(0px, calc(${(p0 * 100).toFixed(3)}% - ${cut.toFixed(2)}px))`,
                  borderRadius: `${outerR}px ${innerR}px ${innerR}px ${outerR}px`,
                }}
                aria-hidden="true"
              />
              <span
                className="m3e-slider__segment m3e-slider__segment--inactive"
                style={{
                  insetInlineStart: `min(100%, calc(${(p0 * 100).toFixed(3)}% + ${cut.toFixed(2)}px))`,
                  insetInlineEnd: 0,
                  borderRadius: `${innerR}px ${outerR}px ${outerR}px ${innerR}px`,
                }}
                aria-hidden="true"
              />
              {!showTicks && p0 < 0.96 ? (
                <span
                  className="m3e-slider__stop-dot"
                  style={{
                    width: `${SLIDER_TOKENS.stopDotSize}px`,
                    height: `${SLIDER_TOKENS.stopDotSize}px`,
                    insetInlineEnd: `${SLIDER_TOKENS.stopDotInset}px`,
                  }}
                  aria-hidden="true"
                />
              ) : null}
            </>
          ) : (
            <>
              <span
                className="m3e-slider__segment m3e-slider__segment--inactive"
                style={{
                  insetInlineStart: 0,
                  width: `max(0px, calc(${(p0 * 100).toFixed(3)}% - ${cut.toFixed(2)}px))`,
                  borderRadius: `${outerR}px ${innerR}px ${innerR}px ${outerR}px`,
                }}
                aria-hidden="true"
              />
              <span
                className="m3e-slider__segment m3e-slider__segment--active"
                style={{
                  insetInlineStart: `calc(${(p0 * 100).toFixed(3)}% + ${cut.toFixed(2)}px)`,
                  width: `max(0px, calc(${((p1 - p0) * 100).toFixed(3)}% - ${(cut * 2).toFixed(2)}px))`,
                  borderRadius: `${innerR}px`,
                }}
                aria-hidden="true"
              />
              <span
                className="m3e-slider__segment m3e-slider__segment--inactive"
                style={{
                  insetInlineStart: `min(100%, calc(${(p1 * 100).toFixed(3)}% + ${cut.toFixed(2)}px))`,
                  insetInlineEnd: 0,
                  borderRadius: `${innerR}px ${outerR}px ${outerR}px ${innerR}px`,
                }}
                aria-hidden="true"
              />
            </>
          )}

          {tickFractions.map((tf, idx) => {
            const insideActive = isRange
              ? tf >= p0 && tf <= p1
              : tf <= p0;
            const nearThumb =
              Math.abs(tf - p0) < 0.03 || (isRange && Math.abs(tf - p1) < 0.03);
            if (nearThumb) return null;
            return (
              <span
                key={idx}
                className="m3e-slider__tick"
                data-active={insideActive ? "" : undefined}
                style={{
                  left: `calc(6px + (100% - 12px) * ${tf.toFixed(4)})`,
                  width: `${SLIDER_TOKENS.stopDotSize}px`,
                  height: `${SLIDER_TOKENS.stopDotSize}px`,
                }}
                aria-hidden="true"
              />
            );
          })}
        </BaseSlider.Track>

        {values.map((v, idx) => (
          <SliderThumbBar
            key={idx}
            index={idx}
            rawValue={v}
            thumbHeight={spec.thumbHeight}
            isPressed={pressedThumbIdx === idx}
            isBubbleShown={pressedThumbIdx === idx || keyBubbleIdx === idx}
            showValueBubble={showValueBubble}
            formatValue={formatValue}
            ariaLabel={
              ariaLabel
                ? isRange
                  ? t(idx === 0 ? "slider.rangeStart" : "slider.rangeEnd", {
                      label: ariaLabel,
                    })
                  : ariaLabel
                : typeof label === "string"
                  ? isRange
                    ? t(idx === 0 ? "slider.rangeStart" : "slider.rangeEnd", {
                        label,
                      })
                    : label
                  : undefined
            }
            onThumbPointerDown={handleThumbPointerDown}
            onThumbKeyStep={handleThumbKeyStep}
            onThumbBlur={handleThumbBlur}
          />
        ))}

        {debugGeometry ? (
          <span className="m3e-debug-badge" aria-hidden="true">
            H{spec.trackHeight}·gap{Math.round(cut - 2)}
          </span>
        ) : null}
      </BaseSlider.Control>
    </BaseSlider.Root>
  );
}
