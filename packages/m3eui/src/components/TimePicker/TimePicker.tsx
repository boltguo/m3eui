"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Popover as BasePopover } from "@base-ui/react/popover";
import {
  SELECT_TOKENS,
  TIME_PICKER_TOKENS,
  resolveClockHandGeometry,
} from "../../tokens/topology.js";
import { useM3EI18n } from "../../context/M3EContext.js";
import { useM3EPortalContainer } from "../../context/M3EPortal.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../../hooks/useM3ESpring.js";
import { Button } from "../Button/Button.js";
import { useFieldsetDisabled } from "../../internal/fieldOutline.js";
import { formatLocalizedWallTime, getLocaleUses24Hour } from "../../i18n/index.js";
import {
  FieldRoot,
  FieldTrigger,
  PickerFieldFrame,
} from "../../internal/pickerField.js";
import { useFormReset } from "../../internal/formField.js";
import { ClockIcon } from "../../internal/icons.js";

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
  readonly inputMode?: "dial" | "keyboard";
  readonly defaultInputMode?: "dial" | "keyboard";
  readonly onInputModeChange?: (mode: "dial" | "keyboard") => void;
  readonly hideModeToggle?: boolean;
  readonly variant?: "standard" | "vibrant";
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
  onClick,
}: {
  readonly label: string;
  readonly selected: boolean;
  readonly onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className="m3e-time-picker__period-btn"
      data-selected={selected ? "" : undefined}
    >
      {label}
    </button>
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
  use24Hour: use24HourProp,
  inputMode: controlledInputMode,
  defaultInputMode = "dial",
  onInputModeChange,
  hideModeToggle = false,
  variant = "standard",
  title,
  className,
  style,
}: M3ETimePickerProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const use24Hour = use24HourProp ?? getLocaleUses24Hour(locale);
  const resolvedTitle = title ?? t("timePicker.title");
  const [uncontrolledTime, setUncontrolledTime] =
    React.useState<string>(defaultValue);
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  useFormReset(
    rootRef,
    () => setUncontrolledTime(defaultValue),
    controlledValue === undefined,
  );
  const currentStr = controlledValue ?? uncontrolledTime;
  const { hour24, minute } = parsePlainTime(currentStr);

  const [selectionMode, setSelectionMode] = React.useState<"hour" | "minute">(
    "hour",
  );
  const [uncontrolledInputMode, setUncontrolledInputMode] = React.useState<
    "dial" | "keyboard"
  >(defaultInputMode);
  const inputMode = controlledInputMode ?? uncontrolledInputMode;

  const setInputMode = React.useCallback(
    (next: "dial" | "keyboard") => {
      if (controlledInputMode === undefined) {
        setUncontrolledInputMode(next);
      }
      onInputModeChange?.(next);
    },
    [controlledInputMode, onInputModeChange],
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

  const [hourDraft, setHourDraft] = React.useState<string>(hourDisplayStr);
  const [minuteDraft, setMinuteDraft] =
    React.useState<string>(minuteDisplayStr);
  const hourFocusedRef = React.useRef<boolean>(false);
  const minuteFocusedRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    if (!hourFocusedRef.current) {
      setHourDraft(hourDisplayStr);
    }
  }, [hourDisplayStr]);

  React.useEffect(() => {
    if (!minuteFocusedRef.current) {
      setMinuteDraft(minuteDisplayStr);
    }
  }, [minuteDisplayStr]);

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
  const pointerHandledRef = React.useRef<boolean>(false);

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
      ref={rootRef}
      className={className ? `m3e-time-picker ${className}` : "m3e-time-picker"}
      data-variant={variant !== "standard" ? variant : undefined}
      style={{
        borderRadius: `${TIME_PICKER_TOKENS.containerRadius}px`,
        padding: `${TIME_PICKER_TOKENS.padding}px`,
        ...style,
      }}
    >
      <div className="m3e-time-picker__header">
        <span className="m3e-date-picker__eyebrow">{resolvedTitle}</span>
        {!hideModeToggle ? (
          <button
            type="button"
            className="m3e-time-picker__mode-btn"
            aria-label={
              inputMode === "dial"
                ? t("timePicker.switchToKeyboard")
                : t("timePicker.switchToDial")
            }
            onClick={() =>
              setInputMode(inputMode === "dial" ? "keyboard" : "dial")
            }
          >
            {inputMode === "dial" ? <KeyboardIconSvg /> : <ClockIcon size={18} strokeWidth={2} />}
          </button>
        ) : null}
      </div>

      {inputMode === "keyboard" ? (
        <div className="m3e-time-picker__keyboard-row">
          <div className="m3e-time-picker__digits-ltr" dir="ltr">
            <label className="m3e-time-picker__kb-field">
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={hourDraft}
                aria-label={t("timePicker.hour")}
                className="m3e-time-picker__kb-input"
                onFocus={(e) => {
                  hourFocusedRef.current = true;
                  e.currentTarget.select();
                }}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setHourDraft(cleaned);
                  if (cleaned === "") return;
                  const raw = Number(cleaned);
                  if (Number.isNaN(raw)) return;
                  if (use24Hour) {
                    if (raw <= 23) commitTime(raw, minute);
                  } else if (raw >= 1 && raw <= 12) {
                    const mod12 = raw % 12;
                    commitTime(isPm ? mod12 + 12 : mod12, minute);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const nextH = use24Hour
                      ? (hour24 + 1) % 24
                      : isPm
                        ? (((hour24 % 12) + 1) % 12) + 12
                        : ((hour24 % 12) + 1) % 12;
                    commitTime(nextH, minute);
                    setHourDraft(
                      use24Hour
                        ? String(nextH).padStart(2, "0")
                        : String(nextH % 12 === 0 ? 12 : nextH % 12).padStart(
                            2,
                            "0",
                          ),
                    );
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const prevH = use24Hour
                      ? (hour24 + 23) % 24
                      : isPm
                        ? (((hour24 % 12) + 11) % 12) + 12
                        : ((hour24 % 12) + 11) % 12;
                    commitTime(prevH, minute);
                    setHourDraft(
                      use24Hour
                        ? String(prevH).padStart(2, "0")
                        : String(prevH % 12 === 0 ? 12 : prevH % 12).padStart(
                            2,
                            "0",
                          ),
                    );
                  }
                }}
                onBlur={() => {
                  hourFocusedRef.current = false;
                  if (hourDraft !== "") {
                    const raw = Number(hourDraft);
                    if (!Number.isNaN(raw)) {
                      if (use24Hour) {
                        const clamped = Math.max(0, Math.min(23, raw));
                        commitTime(clamped, minute);
                        setHourDraft(String(clamped).padStart(2, "0"));
                        return;
                      }
                      const clamped12 = Math.max(1, Math.min(12, raw));
                      const mod12 = clamped12 % 12;
                      commitTime(isPm ? mod12 + 12 : mod12, minute);
                      setHourDraft(String(clamped12).padStart(2, "0"));
                      return;
                    }
                  }
                  setHourDraft(hourDisplayStr);
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
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={2}
                value={minuteDraft}
                aria-label={t("timePicker.minute")}
                className="m3e-time-picker__kb-input"
                onFocus={(e) => {
                  minuteFocusedRef.current = true;
                  e.currentTarget.select();
                }}
                onChange={(e) => {
                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 2);
                  setMinuteDraft(cleaned);
                  if (cleaned === "") return;
                  const raw = Number(cleaned);
                  if (!Number.isNaN(raw) && raw <= 59) {
                    commitTime(hour24, raw);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp") {
                    e.preventDefault();
                    const nextM = (minute + 1) % 60;
                    commitTime(hour24, nextM);
                    setMinuteDraft(String(nextM).padStart(2, "0"));
                  } else if (e.key === "ArrowDown") {
                    e.preventDefault();
                    const prevM = (minute + 59) % 60;
                    commitTime(hour24, prevM);
                    setMinuteDraft(String(prevM).padStart(2, "0"));
                  }
                }}
                onBlur={() => {
                  minuteFocusedRef.current = false;
                  if (minuteDraft !== "") {
                    const raw = Number(minuteDraft);
                    if (!Number.isNaN(raw)) {
                      const clamped = Math.max(0, Math.min(59, raw));
                      commitTime(hour24, clamped);
                      setMinuteDraft(String(clamped).padStart(2, "0"));
                      return;
                    }
                  }
                  setMinuteDraft(minuteDisplayStr);
                }}
              />
              <span className="m3e-time-picker__kb-caption">
                {t("timePicker.minuteShort")}
              </span>
            </label>
          </div>
          {!use24Hour ? (
            <div
              className="m3e-time-picker__period"
              role="group"
              aria-label={t("timePicker.periodLabel")}
              style={{
                width: `${TIME_PICKER_TOKENS.periodWidth}px`,
                height: `${TIME_PICKER_TOKENS.periodHeight}px`,
                borderRadius: `${TIME_PICKER_TOKENS.periodRadius}px`,
              }}
            >
              <PeriodSegmentButton
                label={t("timePicker.am")}
                selected={!isPm}
                onClick={() => {
                  if (isPm) commitTime(hour24 - 12, minute);
                }}
              />
              <PeriodSegmentButton
                label={t("timePicker.pm")}
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
            <div className="m3e-time-picker__digits-ltr" dir="ltr">
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
            </div>

            {!use24Hour ? (
              <div
                className="m3e-time-picker__period"
                role="group"
                aria-label={t("timePicker.periodLabel")}
                style={{
                  width: `${TIME_PICKER_TOKENS.periodWidth}px`,
                  height: `${TIME_PICKER_TOKENS.periodHeight}px`,
                  borderRadius: `${TIME_PICKER_TOKENS.periodRadius}px`,
                }}
              >
                <PeriodSegmentButton
                  label={t("timePicker.am")}
                  selected={!isPm}
                  onClick={() => {
                    if (isPm) commitTime(hour24 - 12, minute);
                  }}
                />
                <PeriodSegmentButton
                  label={t("timePicker.pm")}
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
            role="slider"
            tabIndex={0}
            aria-valuemin={selectionMode === "hour" ? (use24Hour ? 0 : 1) : 0}
            aria-valuemax={
              selectionMode === "hour" ? (use24Hour ? 23 : 12) : 59
            }
            aria-valuenow={
              selectionMode === "hour"
                ? use24Hour
                  ? hour24
                  : hour24 % 12 || 12
                : minute
            }
            aria-valuetext={formatLocalizedWallTime(
              locale,
              { hour: hour24, minute },
              use24Hour,
            )}
            aria-label={
              selectionMode === "hour"
                ? t("timePicker.hourDial")
                : t("timePicker.minuteDial")
            }
            aria-keyshortcuts="ArrowUp ArrowDown ArrowLeft ArrowRight Home End"
            className="m3e-time-picker__dial"
            style={{
              width: `${TIME_PICKER_TOKENS.dialSize}px`,
              height: `${TIME_PICKER_TOKENS.dialSize}px`,
            }}
            onKeyDown={(e) => {
              const step = e.shiftKey && selectionMode === "minute" ? 5 : 1;
              if (e.key === "ArrowUp" || e.key === "ArrowRight") {
                e.preventDefault();
                if (selectionMode === "hour") {
                  if (use24Hour) {
                    commitTime((hour24 + 1) % 24, minute);
                  } else {
                    const nextMod12 = ((hour24 % 12) + 1) % 12;
                    commitTime(isPm ? nextMod12 + 12 : nextMod12, minute);
                  }
                } else {
                  commitTime(hour24, (minute + step) % 60);
                }
              } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
                e.preventDefault();
                if (selectionMode === "hour") {
                  if (use24Hour) {
                    commitTime((hour24 + 23) % 24, minute);
                  } else {
                    const prevMod12 = ((hour24 % 12) + 11) % 12;
                    commitTime(isPm ? prevMod12 + 12 : prevMod12, minute);
                  }
                } else {
                  commitTime(hour24, (minute + 60 - (step % 60)) % 60);
                }
              } else if (e.key === "Home") {
                e.preventDefault();
                if (selectionMode === "hour") {
                  commitTime(use24Hour ? 0 : isPm ? 12 : 0, minute);
                } else {
                  commitTime(hour24, 0);
                }
              } else if (e.key === "End") {
                e.preventDefault();
                if (selectionMode === "hour") {
                  commitTime(use24Hour ? 23 : isPm ? 23 : 11, minute);
                } else {
                  commitTime(hour24, 59);
                }
              } else if (
                (e.key === "Enter" || e.key === " ") &&
                e.target === e.currentTarget &&
                selectionMode === "hour"
              ) {
                e.preventDefault();
                setSelectionMode("minute");
              }
            }}
            onPointerDown={(e) => {
              if (e.button !== 0) return;
              pointerHandledRef.current = false;
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
              pointerHandledRef.current = true;
              if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
              }
              pickFromDialPointer(e.clientX, e.clientY, true);
              queueMicrotask(() => {
                pointerHandledRef.current = false;
              });
            }}
            onPointerCancel={(e) => {
              scrubbingRef.current = false;
              pointerHandledRef.current = false;
              if (e.currentTarget.hasPointerCapture?.(e.pointerId)) {
                e.currentTarget.releasePointerCapture(e.pointerId);
              }
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
              {selectionMode === "minute" && minute % 5 !== 0 ? (
                <circle
                  cx={TIME_PICKER_TOKENS.dialSize / 2 + bobX}
                  cy={TIME_PICKER_TOKENS.dialSize / 2 + bobY}
                  r={2}
                  fill="var(--m3e-color-on-primary)"
                />
              ) : null}
            </svg>

            {selectionMode === "hour" ? (
              <>
                {outerHours.map((h, idx) => {
                  const angle = ((idx * 30 - 90) * Math.PI) / 180;
                  const x =
                    Math.cos(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                  const y =
                    Math.sin(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                  const selected = use24Hour
                    ? hour24 === h
                    : displayHour12 === h;
                  return (
                    <button
                      key={`outer-${h}`}
                      type="button"
                      tabIndex={-1}
                      aria-hidden="true"
                      className="m3e-time-picker__dial-num"
                      data-selected={selected ? "" : undefined}
                      style={{
                        translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`,
                      }}
                      onClick={() => {
                        if (pointerHandledRef.current) return;
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
                          tabIndex={-1}
                          aria-hidden="true"
                          className="m3e-time-picker__dial-num m3e-time-picker__dial-num--inner"
                          data-selected={selected ? "" : undefined}
                          style={{
                            translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`,
                          }}
                          onClick={() => {
                            if (pointerHandledRef.current) return;
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
                    tabIndex={-1}
                    aria-hidden="true"
                    className="m3e-time-picker__dial-num"
                    data-selected={selected ? "" : undefined}
                    style={{
                      translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`,
                    }}
                    onClick={() => {
                      if (pointerHandledRef.current) return;
                      commitTime(hour24, m);
                    }}
                  >
                    {String(m).padStart(2, "0")}
                  </button>
                );
              })
            )}

            <div
              aria-hidden="true"
              className="m3e-time-picker__dial-overlay"
              style={{
                clipPath: `circle(${TIME_PICKER_TOKENS.selectorHandleSize / 2}px at ${(TIME_PICKER_TOKENS.dialSize / 2 + bobX).toFixed(1)}px ${(TIME_PICKER_TOKENS.dialSize / 2 + bobY).toFixed(1)}px)`,
              }}
            >
              {selectionMode === "hour" ? (
                <>
                  {outerHours.map((h, idx) => {
                    const angle = ((idx * 30 - 90) * Math.PI) / 180;
                    const x =
                      Math.cos(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                    const y =
                      Math.sin(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                    return (
                      <span
                        key={`ov-outer-${h}`}
                        className="m3e-time-picker__dial-num m3e-time-picker__dial-num--overlay"
                        style={{
                          translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`,
                        }}
                      >
                        {use24Hour ? String(h).padStart(2, "0") : h}
                      </span>
                    );
                  })}
                  {use24Hour
                    ? innerHours.map((h, idx) => {
                        const angle = ((idx * 30 - 90) * Math.PI) / 180;
                        const x =
                          Math.cos(angle) * TIME_PICKER_TOKENS.innerRingRadius;
                        const y =
                          Math.sin(angle) * TIME_PICKER_TOKENS.innerRingRadius;
                        return (
                          <span
                            key={`ov-inner-${h}`}
                            className="m3e-time-picker__dial-num m3e-time-picker__dial-num--inner m3e-time-picker__dial-num--overlay"
                            style={{
                              translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`,
                            }}
                          >
                            {h}
                          </span>
                        );
                      })
                    : null}
                </>
              ) : (
                dialMinutes.map((m, idx) => {
                  const angle = ((idx * 30 - 90) * Math.PI) / 180;
                  const x =
                    Math.cos(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                  const y =
                    Math.sin(angle) * TIME_PICKER_TOKENS.outerRingRadius;
                  return (
                    <span
                      key={`ov-min-${m}`}
                      className="m3e-time-picker__dial-num m3e-time-picker__dial-num--overlay"
                      style={{
                        translate: `${x.toFixed(1)}px ${y.toFixed(1)}px`,
                      }}
                    >
                      {String(m).padStart(2, "0")}
                    </span>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export interface M3ETimePickerFieldProps {
  readonly id?: string;
  readonly name?: string;
  readonly label?: React.ReactNode;
  readonly labelPosition?: "floating" | "outside";
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly required?: boolean;
  readonly value?: PlainTimeString;
  readonly defaultValue?: PlainTimeString;
  readonly onValueChange?: (value: string) => void;
  readonly use24Hour?: boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly modal?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function TimePickerField({
  id,
  name,
  label,
  labelPosition = "floating",
  description,
  errorMessage,
  invalid = false,
  required = false,
  value: controlledValue,
  defaultValue = "09:30",
  onValueChange,
  use24Hour: use24HourProp,
  disabled = false,
  readOnly = false,
  modal = false,
  className,
  style,
}: M3ETimePickerFieldProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const triggerRef = React.useRef<HTMLButtonElement | null>(null);
  const use24Hour = use24HourProp ?? getLocaleUses24Hour(locale);
  const [uncontrolledTime, setUncontrolledTime] =
    React.useState<string>(defaultValue);
  useFormReset(
    triggerRef,
    () => setUncontrolledTime(defaultValue),
    controlledValue === undefined,
  );
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if ((isDisabled || readOnly) && open) setOpen(false);
  }, [isDisabled, readOnly, open]);
  const current = controlledValue ?? uncontrolledTime;
  const commit = (next: string) => {
    if (controlledValue === undefined) setUncontrolledTime(next);
    onValueChange?.(next);
  };
  const isEmpty = !/^\d{1,2}:\d{2}$/.test(current.trim());
  const { hour24, minute } = parsePlainTime(current);
  const formattedLabel = isEmpty
    ? ""
    : formatLocalizedWallTime(locale, { hour: hour24, minute }, use24Hour);
  const isLabelFloated = !isEmpty || open;
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const height = isFloatingLabel ? SELECT_TOKENS.outlinedHeight : 48;
  const radius = isFloatingLabel
    ? SELECT_TOKENS.outlinedRadius
    : SELECT_TOKENS.outsideLabelRadius;
  const popupAriaLabel =
    typeof label === "string" && label.trim().length > 0
      ? label
      : t("timePicker.title");

  return (
    <FieldRoot
      modal={modal}
      open={readOnly ? false : open}
      onOpenChange={(next) => {
        if (!readOnly && !isDisabled) setOpen(next);
      }}
    >
      <PickerFieldFrame
        id={id}
        name={name}
        label={label}
        labelPosition={labelPosition}
        description={description}
        errorMessage={errorMessage}
        invalid={invalid}
        required={required}
        disabled={isDisabled}
        readOnly={readOnly}
        floating={isLabelFloated}
        popupOpen={!readOnly && open}
        hiddenValue={isEmpty ? "" : formatPlainTime(hour24, minute)}
        triggerRef={triggerRef}
        className={
          className
            ? `m3e-date-picker-field m3e-time-picker-field ${className}`
            : "m3e-date-picker-field m3e-time-picker-field"
        }
        style={style}
      >
        {({ triggerAriaProps }) => (
          <FieldTrigger
            modal={modal}
            ref={triggerRef}
            {...triggerAriaProps}
            disabled={isDisabled}
            className="m3e-select__trigger m3e-date-picker-field__trigger"
            data-variant="outlined"
            data-label-position={labelPosition}
            data-floating={isLabelFloated ? "" : undefined}
            data-readonly={readOnly ? "" : undefined}
            style={{
              minHeight: `${height}px`,
              borderRadius: `${radius}px`,
              paddingInline: `${SELECT_TOKENS.paddingInline}px`,
            }}
          >
            <span className="m3e-select__value">{formattedLabel}</span>
            <span className="m3e-select__chevron" aria-hidden="true">
              <ClockIcon size={18} strokeWidth={2} />
            </span>
          </FieldTrigger>
        )}
      </PickerFieldFrame>

      {modal ? (
        <ModalTimePickerPopup
          open={open}
          onClose={() => setOpen(false)}
          value={current}
          onValueCommit={commit}
          use24Hour={use24Hour}
        />
      ) : (
        <BasePopover.Portal container={portalContainer}>
          <BasePopover.Positioner
            side="bottom"
            align="start"
            sideOffset={6}
            className="m3e-popover__positioner"
          >
            <BasePopover.Popup
              aria-label={popupAriaLabel}
              initialFocus={(openType) => openType === "keyboard"}
              className="m3e-date-picker-field__popup"
            >
              <TimePicker
                value={current}
                use24Hour={use24Hour}
                onValueChange={commit}
              />
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      )}
    </FieldRoot>
  );
}

function ModalTimePickerPopup({
  open,
  onClose,
  value,
  onValueCommit,
  use24Hour,
}: {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly value: PlainTimeString;
  readonly onValueCommit: (value: string) => void;
  readonly use24Hour: boolean;
}): React.JSX.Element {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const [draftTime, setDraftTime] = React.useState<string>(value);
  const [inputMode, setInputMode] = React.useState<"dial" | "keyboard">("dial");

  React.useEffect(() => {
    if (open) setDraftTime(value);
  }, [open, value]);

  return (
    <BaseDialog.Portal container={portalContainer}>
      <BaseDialog.Backdrop className="m3e-dialog__backdrop" />
      <BaseDialog.Viewport className="m3e-dialog__viewport">
        <BaseDialog.Popup
          className="m3e-dialog__popup m3e-time-picker-dialog"
          style={{
            borderRadius: `${TIME_PICKER_TOKENS.containerRadius}px`,
            padding: 0,
            width: "auto",
          }}
        >
          <BaseDialog.Title className="m3e-visually-hidden">
            {t("timePicker.title")}
          </BaseDialog.Title>

          <TimePicker
            value={draftTime}
            onValueChange={setDraftTime}
            use24Hour={use24Hour}
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            hideModeToggle
            className="m3e-time-picker-dialog__picker"
          />

          <div className="m3e-time-picker-dialog__footer">
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
              {inputMode === "dial" ? <KeyboardIconSvg /> : <ClockIcon size={18} strokeWidth={2} />}
            </button>

            <div className="m3e-time-picker-dialog__actions">
              <Button variant="text" size="sm" onClick={onClose}>
                {t("timePicker.cancel")}
              </Button>
              <Button
                variant="filled"
                size="sm"
                onClick={() => {
                  onValueCommit(draftTime);
                  onClose();
                }}
              >
                {t("timePicker.confirm")}
              </Button>
            </div>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}
