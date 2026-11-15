"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Popover as BasePopover } from "@base-ui/react/popover";
import {
  SELECT_TOKENS,
  TIME_PICKER_TOKENS,
  resolveClockHandGeometry,
} from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EContext.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import {
  useM3ECornerSpringRef,
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import { Button } from "./Button.js";
import {
  FieldErrorIconSvg,
  FieldNotchedOutline,
  useFieldsetDisabled,
} from "../internal/fieldOutline.js";
import {
  formatLocalizedWallTime,
  getLocaleUses24Hour,
} from "../i18n/index.js";

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
  const { ref: periodBtnRef, borderRadiusCss } =
    useM3ECornerSpringRef<HTMLButtonElement>(targetCorners, "fastSpatial");

  return (
    <button
      ref={periodBtnRef}
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
  const [minuteDraft, setMinuteDraft] = React.useState<string>(minuteDisplayStr);
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
      className={
        className ? `m3e-time-picker ${className}` : "m3e-time-picker"
      }
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
            {inputMode === "dial" ? <KeyboardIconSvg /> : <ClockIconSvg />}
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
            tabIndex={0}
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
                      tabIndex={-1}
                      aria-selected={selected}
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
                          role="option"
                          tabIndex={-1}
                          aria-selected={selected}
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
                    role="option"
                    tabIndex={-1}
                    aria-selected={selected}
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
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function TimePickerField({
  id: idProp,
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
  className,
  style,
}: M3ETimePickerFieldProps): React.JSX.Element {
  const { locale } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const generatedId = React.useId();
  const triggerId = idProp ?? generatedId;
  const descId = React.useId();
  const errId = React.useId();
  const use24Hour = use24HourProp ?? getLocaleUses24Hour(locale);
  const [uncontrolledTime, setUncontrolledTime] =
    React.useState<string>(defaultValue);
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if ((isDisabled || readOnly) && open) setOpen(false);
  }, [isDisabled, readOnly, open]);
  const current = controlledValue ?? uncontrolledTime;
  const { hour24, minute } = parsePlainTime(current);
  const formattedLabel = formatLocalizedWallTime(
    locale,
    { hour: hour24, minute },
    use24Hour,
  );
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);
  const height = isFloatingLabel ? SELECT_TOKENS.outlinedHeight : 48;
  const radius = isFloatingLabel
    ? SELECT_TOKENS.outlinedRadius
    : SELECT_TOKENS.outsideLabelRadius;
  const labelNode = label ? (
    <>
      {label}
      {required ? (
        <span className="m3e-field__required" aria-hidden="true">
          {" *"}
        </span>
      ) : null}
    </>
  ) : null;

  return (
    <div
      className={
        className
          ? `m3e-date-picker-field m3e-time-picker-field ${className}`
          : "m3e-date-picker-field m3e-time-picker-field"
      }
      data-label-position={labelPosition}
      data-disabled={isDisabled ? "" : undefined}
      data-readonly={readOnly ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      style={style}
    >
      {labelNode && !isFloatingLabel ? (
        <label htmlFor={triggerId} className="m3e-field__label">
          {labelNode}
        </label>
      ) : null}
      {name ? (
        <input
          type="hidden"
          name={name}
          value={formatPlainTime(hour24, minute)}
          disabled={isDisabled}
        />
      ) : null}
      <BasePopover.Root
        open={readOnly ? false : open}
        onOpenChange={(next) => {
          if (!readOnly && !isDisabled) setOpen(next);
        }}
      >
        <div
          className="m3e-select__shell"
          data-variant="outlined"
          data-label-position={labelPosition}
          data-floating=""
          data-popup-open={!readOnly && open ? "" : undefined}
          data-disabled={isDisabled ? "" : undefined}
          data-readonly={readOnly ? "" : undefined}
          data-invalid={invalid ? "" : undefined}
          style={{ borderRadius: `${radius}px` }}
        >
          {isFloatingLabel ? (
            <FieldNotchedOutline label={labelNode} floating />
          ) : null}
          {isFloatingLabel ? (
            <label
              htmlFor={triggerId}
              className="m3e-field__floating-label m3e-select__floating-label"
              data-floating=""
            >
              {labelNode}
            </label>
          ) : null}
          <BasePopover.Trigger
            id={triggerId}
            disabled={isDisabled}
            aria-invalid={invalid ? true : undefined}
            aria-describedby={
              invalid && errorMessage ? errId : description ? descId : undefined
            }
            className="m3e-select__trigger m3e-date-picker-field__trigger"
            data-variant="outlined"
            data-label-position={labelPosition}
            data-floating=""
            data-readonly={readOnly ? "" : undefined}
            style={{
              minHeight: `${height}px`,
              borderRadius: `${radius}px`,
              paddingInline: `${SELECT_TOKENS.paddingInline}px`,
            }}
          >
            <span className="m3e-select__value">{formattedLabel}</span>
            <span className="m3e-select__chevron" aria-hidden="true">
              <ClockIconSvg />
            </span>
          </BasePopover.Trigger>
        </div>

        <BasePopover.Portal container={portalContainer}>
          <BasePopover.Positioner
            side="bottom"
            align="start"
            sideOffset={6}
            className="m3e-popover__positioner"
          >
            <BasePopover.Popup
              initialFocus={(openType) => openType === "keyboard"}
              className="m3e-date-picker-field__popup"
            >
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

      {description && !(invalid && errorMessage) ? (
        <p id={descId} className="m3e-field__description">
          {description}
        </p>
      ) : null}
      {invalid && errorMessage ? (
        <div id={errId} role="alert" className="m3e-field__error">
          <FieldErrorIconSvg />
          <span>{errorMessage}</span>
        </div>
      ) : null}
    </div>
  );
}

export interface M3ETimePickerDialogProps {
  readonly open?: boolean;
  readonly defaultOpen?: boolean;
  readonly onOpenChange?: (open: boolean) => void;
  readonly trigger?: React.ReactElement;
  readonly value?: PlainTimeString;
  readonly defaultValue?: PlainTimeString;
  readonly onValueChange?: (value: string) => void;
  readonly use24Hour?: boolean;
  readonly defaultInputMode?: "dial" | "keyboard";
  readonly variant?: "standard" | "vibrant";
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export type M3EModalTimePickerProps = M3ETimePickerDialogProps;

export function TimePickerDialog({
  open: controlledOpen,
  defaultOpen = false,
  onOpenChange,
  trigger,
  value: controlledValue,
  defaultValue = "09:30",
  onValueChange,
  use24Hour,
  defaultInputMode = "dial",
  variant = "standard",
  title,
  className,
  style,
}: M3ETimePickerDialogProps): React.JSX.Element {
  const { t } = useM3EI18n();
  const portalContainer = useM3EPortalContainer();
  const [uncontrolledOpen, setUncontrolledOpen] =
    React.useState<boolean>(defaultOpen);
  const [uncontrolledTime, setUncontrolledTime] =
    React.useState<string>(defaultValue);
  const isOpen = controlledOpen ?? uncontrolledOpen;
  const committedTime = controlledValue ?? uncontrolledTime;

  const [draftTime, setDraftTime] = React.useState<string>(committedTime);
  const [inputMode, setInputMode] = React.useState<"dial" | "keyboard">(
    defaultInputMode,
  );

  React.useEffect(() => {
    if (isOpen) {
      setDraftTime(committedTime);
    }
  }, [isOpen, committedTime]);

  const setOpen = (next: boolean) => {
    if (controlledOpen === undefined) {
      setUncontrolledOpen(next);
    }
    onOpenChange?.(next);
  };

  return (
    <BaseDialog.Root open={isOpen} onOpenChange={setOpen}>
      {trigger ? <BaseDialog.Trigger render={trigger} /> : null}
      <BaseDialog.Portal container={portalContainer}>
        <BaseDialog.Backdrop className="m3e-dialog__backdrop" />
        <BaseDialog.Popup
          className={
            className
              ? `m3e-dialog m3e-time-picker-dialog ${className}`
              : "m3e-dialog m3e-time-picker-dialog"
          }
          data-variant={variant !== "standard" ? variant : undefined}
          style={{
            borderRadius: `${TIME_PICKER_TOKENS.containerRadius}px`,
            padding: 0,
            width: "auto",
            ...style,
          }}
        >
          <BaseDialog.Title className="m3e-visually-hidden">
            {title ?? t("timePicker.title")}
          </BaseDialog.Title>

          <TimePicker
            value={draftTime}
            onValueChange={setDraftTime}
            use24Hour={use24Hour}
            inputMode={inputMode}
            onInputModeChange={setInputMode}
            hideModeToggle
            variant={variant}
            title={title}
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
              {inputMode === "dial" ? <KeyboardIconSvg /> : <ClockIconSvg />}
            </button>

            <div className="m3e-time-picker-dialog__actions">
              <Button
                variant="text"
                size="sm"
                onClick={() => setOpen(false)}
              >
                {t("timePicker.cancel")}
              </Button>
              <Button
                variant="filled"
                size="sm"
                onClick={() => {
                  if (controlledValue === undefined) {
                    setUncontrolledTime(draftTime);
                  }
                  onValueChange?.(draftTime);
                  setOpen(false);
                }}
              >
                {t("timePicker.confirm")}
              </Button>
            </div>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}

export const ModalTimePicker = TimePickerDialog;
