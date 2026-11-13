"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import {
  SELECT_TOKENS,
  TIME_PICKER_TOKENS,
  resolveClockHandGeometry,
} from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import {
  useM3ECornerSpring,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { formatLocalizedWallTime } from "../i18n/index.js";

export type PlainTimeString = `${string}:${string}` | string;

export function parsePlainTime(raw: string | undefined): {
  readonly hour24: number;
  readonly minute: number;
} {
  if (!raw) return { hour24: 9, minute: 30 };
  const match = /^(\d{1,2}):(\d{2})$/.exec(raw.trim());
  if (!match) return { hour24: 9, minute: 30 };
  const hour24 = Math.max(0, Math.min(23, Number(match[1])));
  const minute = Math.max(0, Math.min(59, Number(match[2])));
  return { hour24, minute };
}

export function formatPlainTime(hour24: number, minute: number): string {
  const h = String(((Math.round(hour24) % 24) + 24) % 24).padStart(2, "0");
  const m = String(((Math.round(minute) % 60) + 60) % 60).padStart(2, "0");
  return `${h}:${m}`;
}

export interface M3ETimePickerProps {
  readonly value?: PlainTimeString;
  readonly defaultValue?: PlainTimeString;
  readonly onValueChange?: (value: string) => void;
  readonly use24Hour?: boolean;
  readonly defaultInputMode?: "dial" | "keyboard";
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function TimeSegmentChip({
  label,
  active,
  valueText,
  onClick,
}: {
  readonly label: string;
  readonly active: boolean;
  readonly valueText: string;
  readonly onClick: () => void;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(false);
  const radius = useM3EScalarSpring(
    isPressed
      ? TIME_PICKER_TOKENS.fieldPressedRadius
      : TIME_PICKER_TOKENS.fieldRadius,
    "fastSpatial",
  );

  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      className="m3e-time-picker__field-chip"
      data-active={active ? "" : undefined}
      style={{
        width: `${TIME_PICKER_TOKENS.fieldWidth}px`,
        height: `${TIME_PICKER_TOKENS.fieldHeight}px`,
        borderRadius: `${Math.max(4, radius).toFixed(1)}px`,
      }}
      {...pressHandlers}
    >
      {valueText}
    </button>
  );
}

function PeriodSegmentButton({
  label,
  selected,
  position,
  onClick,
}: {
  readonly label: string;
  readonly selected: boolean;
  readonly position: "top" | "bottom";
  readonly onClick: () => void;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(false);
  const outer = TIME_PICKER_TOKENS.periodOuterRadius;
  const inner = isPressed ? 2 : TIME_PICKER_TOKENS.periodInnerRadius;
  const targetCorners =
    position === "top"
      ? ([outer, outer, inner, inner] as const)
      : ([inner, inner, outer, outer] as const);
  const { borderRadiusCss } = useM3ECornerSpring(targetCorners, "fastSpatial");

  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="m3e-time-picker__period-btn"
      data-selected={selected ? "" : undefined}
      style={{
        borderRadius: borderRadiusCss,
      }}
      {...pressHandlers}
    >
      {label}
    </button>
  );
}

function ClockIconSvg() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15.5 14" />
    </svg>
  );
}

function KeyboardIconSvg() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="2" y="5" width="20" height="14" rx="2.5" />
      <line x1="6" y1="9" x2="6.01" y2="9" />
      <line x1="10" y1="9" x2="10.01" y2="9" />
      <line x1="14" y1="9" x2="14.01" y2="9" />
      <line x1="18" y1="9" x2="18.01" y2="9" />
      <line x1="7" y1="15" x2="17" y2="15" />
    </svg>
  );
}

export function TimePicker({
  value: controlledValue,
  defaultValue = "09:30",
  onValueChange,
  use24Hour = false,
  defaultInputMode = "dial",
  title,
  className,
  style,
}: M3ETimePickerProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const resolvedTitle = title ?? t("timePicker.title");
  const [uncontrolledTime, setUncontrolledTime] =
    React.useState<string>(defaultValue);
  const currentStr = controlledValue ?? uncontrolledTime;
  const { hour24, minute } = parsePlainTime(currentStr);

  const [selectionMode, setSelectionMode] = React.useState<"hour" | "minute">(
    "hour",
  );
  const [inputMode, setInputMode] = React.useState<"dial" | "keyboard">(
    defaultInputMode,
  );

  const commitTime = React.useCallback(
    (nextHour24: number, nextMinute: number) => {
      const formatted = formatPlainTime(nextHour24, nextMinute);
      if (controlledValue === undefined) {
        setUncontrolledTime(formatted);
      }
      onValueChange?.(formatted);
    },
    [controlledValue, onValueChange],
  );

  const isPm = hour24 >= 12;
  const displayHour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const hourDisplayStr = use24Hour
    ? String(hour24).padStart(2, "0")
    : String(displayHour12).padStart(2, "0");
  const minuteDisplayStr = String(minute).padStart(2, "0");

  const handTarget = resolveClockHandGeometry({
    mode: selectionMode,
    value: selectionMode === "hour" ? hour24 : minute,
    use24Hour,
  });

  const cumulativeAngleRef = React.useRef<number>(handTarget.angleDeg);
  const targetUnwrappedDeg = React.useMemo(() => {
    const prev = cumulativeAngleRef.current;
    const prevMod = ((prev % 360) + 360) % 360;
    let delta = handTarget.angleDeg - prevMod;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    const next = prev + delta;
    cumulativeAngleRef.current = next;
    return next;
  }, [handTarget.angleDeg]);

  const springAngleDeg = useM3EScalarSpring(targetUnwrappedDeg, "fastSpatial");
  const springRadius = useM3EScalarSpring(handTarget.radius, "fastSpatial");

  const rad = ((springAngleDeg - 90) * Math.PI) / 180;
  const bobX = Math.cos(rad) * springRadius;
  const bobY = Math.sin(rad) * springRadius;

  const dialRef = React.useRef<HTMLDivElement | null>(null);
  const scrubbingRef = React.useRef<boolean>(false);

  const pickFromDialPointer = (
    clientX: number,
    clientY: number,
    advanceToMinute: boolean,
  ) => {
    const el = dialRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist < 14) return;

    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;

    if (selectionMode === "minute") {
      const pickedMin = Math.round(deg / 6) % 60;
      commitTime(hour24, pickedMin);
    } else {
      const step12 = Math.round(deg / 30) % 12;
      if (use24Hour) {
        const innerThreshold =
          (TIME_PICKER_TOKENS.outerRingRadius +
            TIME_PICKER_TOKENS.innerRingRadius) /
          2;
        const pickedInner = dist < innerThreshold;
        const nextH = pickedInner ? step12 + 12 : step12;
        commitTime(nextH, minute);
      } else {
        const nextH = isPm ? step12 + 12 : step12;
        commitTime(nextH, minute);
      }
      if (advanceToMinute) {
        setSelectionMode("minute");
      }
    }
  };

  const outerHours = use24Hour
    ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    : [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const innerHours = [12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23];
  const dialMinutes = [0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55];

  return (
    <div
      className={
        className ? `m3e-time-picker ${className}` : "m3e-time-picker"
      }
      style={{
        borderRadius: `${TIME_PICKER_TOKENS.containerRadius}px`,
        padding: `${TIME_PICKER_TOKENS.padding}px`,
        ...style,
      }}
    >
      <div className="m3e-time-picker__header">
        <span className="m3e-date-picker__eyebrow">{resolvedTitle}</span>
        <button
          type="button"
          className="m3e-time-picker__mode-btn"
          aria-label={
            inputMode === "dial"
              ? t("timePicker.switchToKeyboard")
              : t("timePicker.switchToDial")
          }
          onClick={() =>
            setInputMode((m) => (m === "dial" ? "keyboard" : "dial"))
          }
        >
          {inputMode === "dial" ? <KeyboardIconSvg /> : <ClockIconSvg />}
        </button>
      </div>

      {inputMode === "keyboard" ? (
        <div className="m3e-time-picker__keyboard-row">
          <label className="m3e-time-picker__kb-field">
            <input
              type="number"
              min={use24Hour ? 0 : 1}
              max={use24Hour ? 23 : 12}
              value={use24Hour ? hour24 : displayHour12}
              aria-label={t("timePicker.hour")}
              className="m3e-time-picker__kb-input"
              onChange={(e) => {
                const raw = Number(e.target.value);
                if (Number.isNaN(raw)) return;
                if (use24Hour) {
                  commitTime(Math.max(0, Math.min(23, raw)), minute);
                } else {
                  const clamped12 = Math.max(1, Math.min(12, raw)) % 12;
                  commitTime(isPm ? clamped12 + 12 : clamped12, minute);
                }
              }}
            />
            <span className="m3e-time-picker__kb-caption">
              {t("timePicker.hourShort")}
            </span>
          </label>
          <span className="m3e-time-picker__colon" aria-hidden="true">
            :
          </span>
          <label className="m3e-time-picker__kb-field">
            <input
              type="number"
              min={0}
              max={59}
              value={minute}
              aria-label={t("timePicker.minute")}
              className="m3e-time-picker__kb-input"
              onChange={(e) => {
                const raw = Number(e.target.value);
                if (Number.isNaN(raw)) return;
                commitTime(hour24, Math.max(0, Math.min(59, raw)));
              }}
            />
            <span className="m3e-time-picker__kb-caption">
              {t("timePicker.minuteShort")}
            </span>
          </label>
          {!use24Hour ? (
            <div
              className="m3e-time-picker__period"
              role="group"
              aria-label={t("timePicker.periodLabel")}
              style={{
                width: `${TIME_PICKER_TOKENS.periodWidth}px`,
                height: `${TIME_PICKER_TOKENS.periodHeight}px`,
              }}
            >
              <PeriodSegmentButton
                label={t("timePicker.am")}
                position="top"
                selected={!isPm}
                onClick={() => {
                  if (isPm) commitTime(hour24 - 12, minute);
                }}
              />
              <PeriodSegmentButton
                label={t("timePicker.pm")}
                position="bottom"
                selected={isPm}
                onClick={() => {
                  if (!isPm) commitTime(hour24 + 12, minute);
                }}
              />
            </div>
          ) : null}
        </div>
      ) : (
        <>
          <div className="m3e-time-picker__selector-row">
            <TimeSegmentChip
              label={t("timePicker.selectHour")}
              active={selectionMode === "hour"}
              valueText={hourDisplayStr}
              onClick={() => setSelectionMode("hour")}
            />
            <span className="m3e-time-picker__colon" aria-hidden="true">
              :
            </span>
            <TimeSegmentChip
              label={t("timePicker.selectMinute")}
              active={selectionMode === "minute"}
              valueText={minuteDisplayStr}
              onClick={() => setSelectionMode("minute")}
            />

            {!use24Hour ? (
              <div
                className="m3e-time-picker__period"
                role="group"
                aria-label={t("timePicker.periodLabel")}
                style={{
                  width: `${TIME_PICKER_TOKENS.periodWidth}px`,
                  height: `${TIME_PICKER_TOKENS.periodHeight}px`,
                }}
              >
                <PeriodSegmentButton
                  label={t("timePicker.am")}
                  position="top"
                  selected={!isPm}
                  onClick={() => {
                    if (isPm) commitTime(hour24 - 12, minute);
                  }}
                />
                <PeriodSegmentButton
                  label={t("timePicker.pm")}
                  position="bottom"
                  selected={isPm}
                  onClick={() => {
                    if (!isPm) commitTime(hour24 + 12, minute);
                  }}
                />
              </div>
            ) : null}
          </div>

          <div
            ref={dialRef}
            role="listbox"
            aria-label={
              selectionMode === "hour"
                ? t("timePicker.hourDial")
                : t("timePicker.minuteDial")
            }
            className="m3e-time-picker__dial"
            style={{
              width: `${TIME_PICKER_TOKENS.dialSize}px`,
              height: `${TIME_PICKER_TOKENS.dialSize}px`,
            }}
            onPointerDown={(e) => {
              if ((e.target as HTMLElement).closest("button")) return;
              scrubbingRef.current = true;
              e.currentTarget.setPointerCapture?.(e.pointerId);
              pickFromDialPointer(e.clientX, e.clientY, false);
            }}
            onPointerMove={(e) => {
              if (!scrubbingRef.current) return;
              pickFromDialPointer(e.clientX, e.clientY, false);
            }}
            onPointerUp={(e) => {
              if (!scrubbingRef.current) return;
              scrubbingRef.current = false;
              pickFromDialPointer(e.clientX, e.clientY, true);
            }}
          >
            <svg
              width={TIME_PICKER_TOKENS.dialSize}
              height={TIME_PICKER_TOKENS.dialSize}
              viewBox={`0 0 ${TIME_PICKER_TOKENS.dialSize} ${TIME_PICKER_TOKENS.dialSize}`}
              className="m3e-time-picker__hand-svg"
              aria-hidden="true"
            >
              <line
                x1={TIME_PICKER_TOKENS.dialSize / 2}
                y1={TIME_PICKER_TOKENS.dialSize / 2}
                x2={TIME_PICKER_TOKENS.dialSize / 2 + bobX}
                y2={TIME_PICKER_TOKENS.dialSize / 2 + bobY}
                stroke="var(--m3e-color-primary)"
                strokeWidth={TIME_PICKER_TOKENS.selectorTrackWidth}
              />
              <circle
                cx={TIME_PICKER_TOKENS.dialSize / 2}
                cy={TIME_PICKER_TOKENS.dialSize / 2}
                r={TIME_PICKER_TOKENS.centerPinSize / 2}
                fill="var(--m3e-color-primary)"
              />
              <circle
                cx={TIME_PICKER_TOKENS.dialSize / 2 + bobX}
                cy={TIME_PICKER_TOKENS.dialSize / 2 + bobY}
                r={TIME_PICKER_TOKENS.selectorHandleSize / 2}
                fill="var(--m3e-color-primary)"
              />
            </svg>

            {selectionMode === "hour" ? (
              <>
                {outerHours.map((h, idx) => {
                  const angle = ((idx * 30 - 90) * Math.PI) / 180;
                  const x = Math.cos(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                  const y = Math.sin(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                  const selected = use24Hour
                    ? hour24 === h
                    : displayHour12 === h;
                  return (
                    <button
                      key={`outer-${h}`}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      className="m3e-time-picker__dial-num"
                      data-selected={selected ? "" : undefined}
                      style={{
                        translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`,
                      }}
                      onClick={() => {
                        if (use24Hour) {
                          commitTime(h, minute);
                        } else {
                          const hMod = h % 12;
                          commitTime(isPm ? hMod + 12 : hMod, minute);
                        }
                        setSelectionMode("minute");
                      }}
                    >
                      {use24Hour ? String(h).padStart(2, "0") : h}
                    </button>
                  );
                })}

                {use24Hour
                  ? innerHours.map((h, idx) => {
                      const angle = ((idx * 30 - 90) * Math.PI) / 180;
                      const x =
                        Math.cos(angle) * TIME_PICKER_TOKENS.innerRingRadius;
                      const y =
                        Math.sin(angle) * TIME_PICKER_TOKENS.innerRingRadius;
                      const selected = hour24 === h;
                      return (
                        <button
                          key={`inner-${h}`}
                          type="button"
                          role="option"
                          aria-selected={selected}
                          className="m3e-time-picker__dial-num m3e-time-picker__dial-num--inner"
                          data-selected={selected ? "" : undefined}
                          style={{
                            translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`,
                          }}
                          onClick={() => {
                            commitTime(h, minute);
                            setSelectionMode("minute");
                          }}
                        >
                          {h}
                        </button>
                      );
                    })
                  : null}
              </>
            ) : (
              dialMinutes.map((m, idx) => {
                const angle = ((idx * 30 - 90) * Math.PI) / 180;
                const x = Math.cos(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                const y = Math.sin(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                const selected = minute === m;
                return (
                  <button
                    key={`min-${m}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className="m3e-time-picker__dial-num"
                    data-selected={selected ? "" : undefined}
                    style={{
                      translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`,
                    }}
                    onClick={() => commitTime(hour24, m)}
                  >
                    {String(m).padStart(2, "0")}
                  </button>
                );
              })
            )}
          </div>
        </>
      )}
    </div>
  );
}

export interface M3ETimePickerFieldProps {
  readonly label?: React.ReactNode;
  readonly value?: PlainTimeString;
  readonly defaultValue?: PlainTimeString;
  readonly onValueChange?: (value: string) => void;
  readonly use24Hour?: boolean;
  readonly disabled?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function TimePickerField({
  label,
  value: controlledValue,
  defaultValue = "09:30",
  onValueChange,
  use24Hour = false,
  disabled = false,
  className,
  style,
}: M3ETimePickerFieldProps): React.JSX.Element {
  const { locale } = useM3EI18n();
  const [uncontrolledTime, setUncontrolledTime] =
    React.useState<string>(defaultValue);
  const [open, setOpen] = React.useState(false);
  const current = controlledValue ?? uncontrolledTime;
  const { hour24, minute } = parsePlainTime(current);
  const formattedLabel = formatLocalizedWallTime(
    locale,
    { hour: hour24, minute },
    use24Hour,
  );

  return (
    <div
      className={
        className
          ? `m3e-date-picker-field m3e-time-picker-field ${className}`
          : "m3e-date-picker-field m3e-time-picker-field"
      }
      style={style}
    >
      {label ? <span className="m3e-select__label">{label}</span> : null}
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <BasePopover.Trigger
          disabled={disabled}
          className="m3e-select__trigger m3e-date-picker-field__trigger"
          data-variant="outlined"
          style={{
            minHeight: `${SELECT_TOKENS.outlinedHeight}px`,
            borderRadius: `${SELECT_TOKENS.outlinedRadius}px`,
            paddingInline: `${SELECT_TOKENS.paddingInline}px`,
          }}
        >
          <span>{formattedLabel}</span>
          <span className="m3e-select__chevron" aria-hidden="true">
            <ClockIconSvg />
          </span>
        </BasePopover.Trigger>

        <BasePopover.Portal>
          <BasePopover.Positioner
            side="bottom"
            align="start"
            sideOffset={6}
            className="m3e-popover__positioner"
          >
            <BasePopover.Popup className="m3e-date-picker-field__popup">
              <TimePicker
                value={current}
                use24Hour={use24Hour}
                onValueChange={(next) => {
                  if (controlledValue === undefined) {
                    setUncontrolledTime(next);
                  }
                  onValueChange?.(next);
                }}
              />
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
    </div>
  );
}
