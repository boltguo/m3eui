"use client";

import * as React from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Popover as BasePopover } from "@base-ui/react/popover";
import {
  DATE_PICKER_TOKENS,
  SELECT_TOKENS,
} from "../tokens/topology.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { useM3EPortalContainer } from "../context/M3EPortal.js";
import { usePressHoldState } from "../hooks/useM3ESpring.js";
import {
  FieldErrorIconSvg,
  FieldNotchedOutline,
  useFieldsetDisabled,
} from "../internal/fieldOutline.js";
import {
  formatLocalizedDateRange,
  formatLocalizedFullDate,
  formatLocalizedInteger,
  formatLocalizedMonthYear,
  formatLocalizedNumber,
  getLocaleFirstDayOfWeek,
  getLocalizedWeekdays,
} from "../i18n/index.js";
import { Button } from "./Button.js";
import { TextField } from "./TextField.js";
import { FormHiddenValue } from "../internal/formField.js";
import { FieldRoot, FieldTrigger } from "../internal/pickerField.js";
import { useIsoLayoutEffect } from "../internal/useIsoLayoutEffect.js";

export type PlainDateString = `${number}-${string}-${string}` | string;

export interface PlainDateRange {
  readonly start: PlainDateString;
  readonly end: PlainDateString;
}

interface ParsedPlainDate {
  readonly year: number;
  readonly month: number;
  readonly day: number;
}

export function parsePlainDate(
  iso: string | undefined,
): ParsedPlainDate | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > getDaysInMonth(year, month)) {
    return null;
  }
  return { year, month, day };
}

export function formatPlainDate(d: ParsedPlainDate): string {
  const y = String(d.year).padStart(4, "0");
  const m = String(d.month).padStart(2, "0");
  const day = String(d.day).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function comparePlainDates(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

function getTodayPlainDate(): ParsedPlainDate {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0, 12, 0, 0)).getUTCDate();
}

function getLeadingBlanksForMonth(
  year: number,
  month: number,
  firstDayOfWeek: number,
): number {
  const jsDay = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0)).getUTCDay();
  const normalizedFirst = ((Math.trunc(firstDayOfWeek) % 7) + 7) % 7;
  return (jsDay - normalizedFirst + 7) % 7;
}

function addDaysPlainDate(
  base: ParsedPlainDate,
  deltaDays: number,
): ParsedPlainDate {
  const utc = new Date(
    Date.UTC(base.year, base.month - 1, base.day + deltaDays, 12, 0, 0),
  );
  return {
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  };
}

function stepMonthClamped(
  year: number,
  month: number,
  day: number,
  deltaMonths: number,
): ParsedPlainDate {
  let nextM = month + deltaMonths;
  let nextY = year;
  while (nextM < 1) {
    nextM += 12;
    nextY -= 1;
  }
  while (nextM > 12) {
    nextM -= 12;
    nextY += 1;
  }
  const maxDay = getDaysInMonth(nextY, nextM);
  return { year: nextY, month: nextM, day: Math.min(day, maxDay) };
}

function buildWeekRows(
  leadingBlanks: number,
  daysInMonth: number,
): Array<Array<number | null>> {
  const cells: Array<number | null> = [];
  for (let i = 0; i < leadingBlanks; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: Array<Array<number | null>> = [];
  for (let i = 0; i < cells.length; i += 7) {
    rows.push(cells.slice(i, i + 7));
  }
  return rows;
}

function isIsoOutOfBounds(
  iso: string,
  minDate?: PlainDateString,
  maxDate?: PlainDateString,
  isDateDisabled?: (iso: PlainDateString) => boolean,
): boolean {
  if (minDate && comparePlainDates(iso, minDate) < 0) return true;
  if (maxDate && comparePlainDates(iso, maxDate) > 0) return true;
  if (isDateDisabled && isDateDisabled(iso)) return true;
  return false;
}

function clampPlainDateToBounds(
  target: ParsedPlainDate,
  minDate?: PlainDateString,
  maxDate?: PlainDateString,
): ParsedPlainDate {
  const iso = formatPlainDate(target);
  const minParsed = parsePlainDate(minDate);
  if (minParsed && minDate && comparePlainDates(iso, minDate) < 0) {
    return minParsed;
  }
  const maxParsed = parsePlainDate(maxDate);
  if (maxParsed && maxDate && comparePlainDates(iso, maxDate) > 0) {
    return maxParsed;
  }
  return target;
}

function resolveGridTarget(
  current: ParsedPlainDate,
  rawTarget: ParsedPlainDate,
  directionSign: 1 | -1,
  minDate?: PlainDateString,
  maxDate?: PlainDateString,
  isDateDisabled?: (iso: PlainDateString) => boolean,
): ParsedPlainDate {
  let candidate = clampPlainDateToBounds(rawTarget, minDate, maxDate);
  let iso = formatPlainDate(candidate);
  if (!isIsoOutOfBounds(iso, minDate, maxDate, isDateDisabled)) {
    return candidate;
  }
  for (let i = 0; i < 366; i++) {
    candidate = addDaysPlainDate(candidate, directionSign);
    iso = formatPlainDate(candidate);
    if (minDate && comparePlainDates(iso, minDate) < 0) break;
    if (maxDate && comparePlainDates(iso, maxDate) > 0) break;
    if (!isIsoOutOfBounds(iso, minDate, maxDate, isDateDisabled)) {
      return candidate;
    }
  }
  return current;
}

function resolveFocusableDayInMonth(
  year: number,
  month: number,
  daysInMonth: number,
  preferredDay: number,
  minDate?: PlainDateString,
  maxDate?: PlainDateString,
  isDateDisabled?: (iso: PlainDateString) => boolean,
): number {
  const base = Math.max(1, Math.min(daysInMonth, preferredDay));
  const baseIso = formatPlainDate({ year, month, day: base });
  if (!isIsoOutOfBounds(baseIso, minDate, maxDate, isDateDisabled)) {
    return base;
  }
  for (let offset = 1; offset < daysInMonth; offset++) {
    for (const candidate of [base + offset, base - offset]) {
      if (candidate >= 1 && candidate <= daysInMonth) {
        const iso = formatPlainDate({ year, month, day: candidate });
        if (!isIsoOutOfBounds(iso, minDate, maxDate, isDateDisabled)) {
          return candidate;
        }
      }
    }
  }
  return base;
}

function isMonthSteppable(
  year: number,
  month: number,
  deltaMonths: number,
  minDate?: PlainDateString,
  maxDate?: PlainDateString,
): boolean {
  const stepped = stepMonthClamped(year, month, 1, deltaMonths);
  const firstOfMonth = formatPlainDate({
    year: stepped.year,
    month: stepped.month,
    day: 1,
  });
  const lastOfMonth = formatPlainDate({
    year: stepped.year,
    month: stepped.month,
    day: getDaysInMonth(stepped.year, stepped.month),
  });
  if (
    deltaMonths < 0 &&
    minDate &&
    comparePlainDates(lastOfMonth, minDate) < 0
  ) {
    return false;
  }
  if (
    deltaMonths > 0 &&
    maxDate &&
    comparePlainDates(firstOfMonth, maxDate) > 0
  ) {
    return false;
  }
  return true;
}

function CalendarDayButton({
  day,
  dayText,
  isSelected,
  isInRange = false,
  isRangeStart = false,
  isRangeEnd = false,
  isToday,
  isDisabled = false,
  isFocusable,
  onSelect,
  onFocusDay,
  onHover,
  buttonRef,
  fullDateLabel,
}: {
  readonly day: number;
  readonly dayText?: string;
  readonly isSelected: boolean;
  readonly isInRange?: boolean;
  readonly isRangeStart?: boolean;
  readonly isRangeEnd?: boolean;
  readonly isToday: boolean;
  readonly isDisabled?: boolean;
  readonly isFocusable: boolean;
  readonly onSelect: () => void;
  readonly onFocusDay: () => void;
  readonly onHover?: () => void;
  readonly buttonRef: (el: HTMLButtonElement | null) => void;
  readonly fullDateLabel: string;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(isDisabled);
  const radius = isPressed
    ? DATE_PICKER_TOKENS.dayPressedRadius
    : DATE_PICKER_TOKENS.daySelectedRadius;

  return (
    <div
      role="gridcell"
      aria-selected={isSelected}
      aria-disabled={isDisabled ? true : undefined}
      className="m3e-date-picker__cell"
      data-in-range={isInRange ? "" : undefined}
      data-range-start={isRangeStart ? "" : undefined}
      data-range-end={isRangeEnd ? "" : undefined}
    >
      <button
        ref={buttonRef}
        type="button"
        disabled={isDisabled}
        tabIndex={isFocusable && !isDisabled ? 0 : -1}
        aria-label={fullDateLabel}
        aria-pressed={isSelected}
        aria-current={isToday ? "date" : undefined}
        onClick={isDisabled ? undefined : onSelect}
        onFocus={onFocusDay}
        onMouseEnter={isDisabled ? undefined : onHover}
        className="m3e-date-picker__day"
        data-selected={isSelected ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        data-in-range={isInRange && !isSelected ? "" : undefined}
        data-today={isToday ? "" : undefined}
        data-disabled={isDisabled ? "" : undefined}
        style={{
          width: `${DATE_PICKER_TOKENS.dayCellSize}px`,
          height: `${DATE_PICKER_TOKENS.dayCellSize}px`,
          borderRadius: `${radius}px`,
        }}
        {...pressHandlers}
      >
        {dayText ?? day}
      </button>
    </div>
  );
}

export interface M3EDatePickerSingleProps {
  readonly mode?: "single";
  readonly value?: PlainDateString;
  readonly defaultValue?: PlainDateString;
  readonly onValueChange?: (value: string) => void;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
  readonly firstDayOfWeek?: number;
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function SingleDatePicker({
  value: controlledValue,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  isDateDisabled,
  firstDayOfWeek,
  title,
  className,
  style,
}: M3EDatePickerSingleProps): React.JSX.Element {
  const { locale, direction, t } = useM3ERuntime();
  const resolvedTitle = title ?? t("datePicker.title");
  const resolvedFirstDay = firstDayOfWeek ?? getLocaleFirstDayOfWeek(locale);
  const weekdayLabels = React.useMemo(
    () => getLocalizedWeekdays(locale, resolvedFirstDay),
    [locale, resolvedFirstDay],
  );
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const [uncontrolledIso, setUncontrolledIso] = React.useState<string>(
    () => defaultValue ?? formatPlainDate(today),
  );
  const selectedIso = controlledValue ?? uncontrolledIso;
  const selected = parsePlainDate(selectedIso) ?? today;

  const [viewYear, setViewYear] = React.useState<number>(selected.year);
  const [viewMonth, setViewMonth] = React.useState<number>(selected.month);
  const [focusedDay, setFocusedDay] = React.useState<number>(selected.day);
  const [yearMode, setYearMode] = React.useState<boolean>(false);
  const [yearPageStart, setYearPageStart] = React.useState<number>(
    () => selected.year - 6,
  );

  const minParsed = React.useMemo(() => parsePlainDate(minDate), [minDate]);
  const maxParsed = React.useMemo(() => parsePlainDate(maxDate), [maxDate]);

  const dayButtonRefs = React.useRef<Record<number, HTMLButtonElement | null>>(
    {},
  );
  const pendingFocusDayRef = React.useRef<number | null>(null);

  useIsoLayoutEffect(() => {
    if (pendingFocusDayRef.current !== null) {
      const d = pendingFocusDayRef.current;
      pendingFocusDayRef.current = null;
      dayButtonRefs.current[d]?.focus();
    }
  });

  const stepMonth = (delta: number) => {
    if (!isMonthSteppable(viewYear, viewMonth, delta, minDate, maxDate)) return;
    const stepped = stepMonthClamped(viewYear, viewMonth, focusedDay, delta);
    const clamped = clampPlainDateToBounds(stepped, minDate, maxDate);
    setViewYear(clamped.year);
    setViewMonth(clamped.month);
    setFocusedDay(clamped.day);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const leadingBlanks = getLeadingBlanksForMonth(
    viewYear,
    viewMonth,
    resolvedFirstDay,
  );
  const weekRows = React.useMemo(
    () => buildWeekRows(leadingBlanks, daysInMonth),
    [leadingBlanks, daysInMonth],
  );

  const activeFocusDay = React.useMemo(
    () =>
      resolveFocusableDayInMonth(
        viewYear,
        viewMonth,
        daysInMonth,
        focusedDay,
        minDate,
        maxDate,
        isDateDisabled,
      ),
    [
      viewYear,
      viewMonth,
      daysInMonth,
      focusedDay,
      minDate,
      maxDate,
      isDateDisabled,
    ],
  );

  const moveGridFocusTo = (rawTarget: ParsedPlainDate, dirSign: 1 | -1) => {
    const current: ParsedPlainDate = {
      year: viewYear,
      month: viewMonth,
      day: activeFocusDay,
    };
    const target = resolveGridTarget(
      current,
      rawTarget,
      dirSign,
      minDate,
      maxDate,
      isDateDisabled,
    );
    setViewYear(target.year);
    setViewMonth(target.month);
    setFocusedDay(target.day);
    pendingFocusDayRef.current = target.day;
  };

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const rtlSign: 1 | -1 = direction === "rtl" ? -1 : 1;
    const current: ParsedPlainDate = {
      year: viewYear,
      month: viewMonth,
      day: activeFocusDay,
    };
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const step: 1 | -1 = rtlSign === 1 ? -1 : 1;
      moveGridFocusTo(addDaysPlainDate(current, step), step);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, rtlSign), rtlSign);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, -7), -1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, 7), 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      const col = (leadingBlanks + activeFocusDay - 1) % 7;
      moveGridFocusTo(addDaysPlainDate(current, -col), 1);
    } else if (e.key === "End") {
      e.preventDefault();
      const col = (leadingBlanks + activeFocusDay - 1) % 7;
      moveGridFocusTo(addDaysPlainDate(current, 6 - col), -1);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      moveGridFocusTo(
        stepMonthClamped(viewYear, viewMonth, activeFocusDay, -1),
        -1,
      );
    } else if (e.key === "PageDown") {
      e.preventDefault();
      moveGridFocusTo(
        stepMonthClamped(viewYear, viewMonth, activeFocusDay, 1),
        1,
      );
    }
  };

  const years = React.useMemo(
    () => Array.from({ length: 15 }, (_, i) => yearPageStart + i),
    [yearPageStart],
  );
  const canStepPrevMonth = isMonthSteppable(
    viewYear,
    viewMonth,
    -1,
    minDate,
    maxDate,
  );
  const canStepNextMonth = isMonthSteppable(
    viewYear,
    viewMonth,
    1,
    minDate,
    maxDate,
  );
  const canStepPrevYears = minParsed ? yearPageStart > minParsed.year : true;
  const canStepNextYears = maxParsed
    ? yearPageStart + 14 < maxParsed.year
    : true;

  return (
    <div
      className={className ? `m3e-date-picker ${className}` : "m3e-date-picker"}
      style={{
        borderRadius: `${DATE_PICKER_TOKENS.containerRadius}px`,
        padding: `${DATE_PICKER_TOKENS.padding}px`,
        ...style,
      }}
    >
      <div className="m3e-date-picker__eyebrow">{resolvedTitle}</div>
      <div className="m3e-date-picker__headline">
        {formatLocalizedFullDate(locale, selected)}
      </div>

      <div className="m3e-date-picker__toolbar">
        <button
          type="button"
          className="m3e-date-picker__year-toggle"
          aria-expanded={yearMode}
          onClick={() => {
            setYearMode((prev) => {
              const next = !prev;
              if (next) setYearPageStart(viewYear - 6);
              return next;
            });
          }}
        >
          <span>{formatLocalizedMonthYear(locale, viewYear, viewMonth)}</span>
          <span
            className="m3e-date-picker__year-caret"
            data-open={yearMode ? "" : undefined}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>

        <div className="m3e-date-picker__month-nav">
          <button
            type="button"
            disabled={yearMode ? !canStepPrevYears : !canStepPrevMonth}
            aria-label={
              yearMode ? t("datePicker.prevYears") : t("datePicker.prevMonth")
            }
            className="m3e-date-picker__nav-btn"
            onClick={() => {
              if (yearMode) {
                setYearPageStart((s) => s - 15);
              } else {
                stepMonth(-1);
              }
            }}
          >
            <span
              aria-hidden="true"
              style={
                direction === "rtl"
                  ? { display: "inline-block", scale: "-1 1" }
                  : undefined
              }
            >
              ‹
            </span>
          </button>
          <button
            type="button"
            disabled={yearMode ? !canStepNextYears : !canStepNextMonth}
            aria-label={
              yearMode ? t("datePicker.nextYears") : t("datePicker.nextMonth")
            }
            className="m3e-date-picker__nav-btn"
            onClick={() => {
              if (yearMode) {
                setYearPageStart((s) => s + 15);
              } else {
                stepMonth(1);
              }
            }}
          >
            <span
              aria-hidden="true"
              style={
                direction === "rtl"
                  ? { display: "inline-block", scale: "-1 1" }
                  : undefined
              }
            >
              ›
            </span>
          </button>
        </div>
      </div>

      {yearMode ? (
        <div
          role="listbox"
          aria-label={t("datePicker.selectYear")}
          className="m3e-date-picker__year-grid"
        >
          {years.map((yr) => {
            const yrDisabled =
              (minParsed !== null && yr < minParsed.year) ||
              (maxParsed !== null && yr > maxParsed.year);
            return (
              <button
                key={yr}
                type="button"
                role="option"
                disabled={yrDisabled}
                aria-selected={yr === viewYear}
                className="m3e-date-picker__year-pill"
                data-selected={yr === viewYear ? "" : undefined}
                onClick={() => {
                  if (yrDisabled) return;
                  let nextM = viewMonth;
                  if (
                    minParsed &&
                    yr === minParsed.year &&
                    nextM < minParsed.month
                  ) {
                    nextM = minParsed.month;
                  }
                  if (
                    maxParsed &&
                    yr === maxParsed.year &&
                    nextM > maxParsed.month
                  ) {
                    nextM = maxParsed.month;
                  }
                  setViewYear(yr);
                  setViewMonth(nextM);
                  setYearMode(false);
                }}
              >
                {formatLocalizedNumber(locale, yr, {
                  useGrouping: false,
                  maximumFractionDigits: 0,
                })}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          role="grid"
          aria-label={t("datePicker.calendarLabel", {
            monthYear: formatLocalizedMonthYear(locale, viewYear, viewMonth),
          })}
          className="m3e-date-picker__grid"
          onKeyDown={handleGridKeyDown}
        >
          <div role="row" className="m3e-date-picker__weekdays">
            {weekdayLabels.map((w, idx) => (
              <span
                key={`wd-${idx}`}
                role="columnheader"
                className="m3e-date-picker__weekday"
              >
                {w}
              </span>
            ))}
          </div>

          {weekRows.map((row, rIdx) => (
            <div
              key={`row-${rIdx}`}
              role="row"
              className="m3e-date-picker__week-row"
            >
              {row.map((d, cIdx) => {
                if (d === null) {
                  return (
                    <div
                      key={`blank-${rIdx}-${cIdx}`}
                      role="gridcell"
                      aria-hidden="true"
                      className="m3e-date-picker__day-empty"
                    />
                  );
                }
                const iso = formatPlainDate({
                  year: viewYear,
                  month: viewMonth,
                  day: d,
                });
                const isSelected = iso === selectedIso;
                const isToday =
                  viewYear === today.year &&
                  viewMonth === today.month &&
                  d === today.day;
                const disabledDay = isIsoOutOfBounds(
                  iso,
                  minDate,
                  maxDate,
                  isDateDisabled,
                );

                return (
                  <CalendarDayButton
                    key={iso}
                    day={d}
                    dayText={formatLocalizedInteger(locale, d)}
                    isSelected={isSelected}
                    isToday={isToday}
                    isDisabled={disabledDay}
                    isFocusable={d === activeFocusDay}
                    buttonRef={(el) => {
                      dayButtonRefs.current[d] = el;
                    }}
                    onFocusDay={() => setFocusedDay(d)}
                    fullDateLabel={formatLocalizedFullDate(locale, {
                      year: viewYear,
                      month: viewMonth,
                      day: d,
                    })}
                    onSelect={() => {
                      if (disabledDay) return;
                      setFocusedDay(d);
                      if (controlledValue === undefined) {
                        setUncontrolledIso(iso);
                      }
                      onValueChange?.(iso);
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface M3EDatePickerRangeProps {
  readonly mode: "range";
  readonly value?: PlainDateRange;
  readonly defaultValue?: PlainDateRange;
  readonly onValueChange?: (range: PlainDateRange) => void;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
  readonly firstDayOfWeek?: number;
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function RangeDatePicker({
  value: controlledRange,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  isDateDisabled,
  firstDayOfWeek,
  title,
  className,
  style,
}: Omit<M3EDatePickerRangeProps, "mode">): React.JSX.Element {
  const { locale, direction, t } = useM3ERuntime();
  const resolvedTitle = title ?? t("datePicker.rangeTitle");
  const resolvedFirstDay = firstDayOfWeek ?? getLocaleFirstDayOfWeek(locale);
  const weekdayLabels = React.useMemo(
    () => getLocalizedWeekdays(locale, resolvedFirstDay),
    [locale, resolvedFirstDay],
  );
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const defaultStart = formatPlainDate(today);
  const defaultEnd = formatPlainDate({
    year: today.year,
    month: today.month,
    day: Math.min(getDaysInMonth(today.year, today.month), today.day + 4),
  });

  const [uncontrolledRange, setUncontrolledRange] =
    React.useState<PlainDateRange>(
      () => defaultValue ?? { start: defaultStart, end: defaultEnd },
    );
  const activeRange = controlledRange ?? uncontrolledRange;

  const [draftAnchor, setDraftAnchor] = React.useState<string | null>(null);
  const [hoverIso, setHoverIso] = React.useState<string | null>(null);

  const startParsed = parsePlainDate(activeRange.start) ?? today;
  const endParsed = parsePlainDate(activeRange.end) ?? startParsed;

  const [viewYear, setViewYear] = React.useState<number>(startParsed.year);
  const [viewMonth, setViewMonth] = React.useState<number>(startParsed.month);
  const [focusedDay, setFocusedDay] = React.useState<number>(startParsed.day);
  const [yearMode, setYearMode] = React.useState<boolean>(false);
  const [yearPageStart, setYearPageStart] = React.useState<number>(
    () => startParsed.year - 6,
  );

  const minParsed = React.useMemo(() => parsePlainDate(minDate), [minDate]);
  const maxParsed = React.useMemo(() => parsePlainDate(maxDate), [maxDate]);

  const dayButtonRefs = React.useRef<Record<number, HTMLButtonElement | null>>(
    {},
  );
  const pendingFocusDayRef = React.useRef<number | null>(null);

  useIsoLayoutEffect(() => {
    if (pendingFocusDayRef.current !== null) {
      const d = pendingFocusDayRef.current;
      pendingFocusDayRef.current = null;
      dayButtonRefs.current[d]?.focus();
    }
  });

  const stepMonth = (delta: number) => {
    if (!isMonthSteppable(viewYear, viewMonth, delta, minDate, maxDate)) return;
    const stepped = stepMonthClamped(viewYear, viewMonth, focusedDay, delta);
    const clamped = clampPlainDateToBounds(stepped, minDate, maxDate);
    setViewYear(clamped.year);
    setViewMonth(clamped.month);
    setFocusedDay(clamped.day);
  };

  const effectiveRange = React.useMemo<PlainDateRange>(() => {
    if (draftAnchor) {
      const target = hoverIso ?? draftAnchor;
      return comparePlainDates(draftAnchor, target) <= 0
        ? { start: draftAnchor, end: target }
        : { start: target, end: draftAnchor };
    }
    return comparePlainDates(activeRange.start, activeRange.end) <= 0
      ? activeRange
      : { start: activeRange.end, end: activeRange.start };
  }, [draftAnchor, hoverIso, activeRange]);

  const handleDayPick = (iso: string, dayNum: number) => {
    setFocusedDay(dayNum);
    if (!draftAnchor) {
      setDraftAnchor(iso);
      setHoverIso(iso);
      return;
    }
    const nextRange: PlainDateRange =
      comparePlainDates(draftAnchor, iso) <= 0
        ? { start: draftAnchor, end: iso }
        : { start: iso, end: draftAnchor };
    setDraftAnchor(null);
    setHoverIso(null);
    if (controlledRange === undefined) {
      setUncontrolledRange(nextRange);
    }
    onValueChange?.(nextRange);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const leadingBlanks = getLeadingBlanksForMonth(
    viewYear,
    viewMonth,
    resolvedFirstDay,
  );
  const weekRows = React.useMemo(
    () => buildWeekRows(leadingBlanks, daysInMonth),
    [leadingBlanks, daysInMonth],
  );

  const activeFocusDay = React.useMemo(
    () =>
      resolveFocusableDayInMonth(
        viewYear,
        viewMonth,
        daysInMonth,
        focusedDay,
        minDate,
        maxDate,
        isDateDisabled,
      ),
    [
      viewYear,
      viewMonth,
      daysInMonth,
      focusedDay,
      minDate,
      maxDate,
      isDateDisabled,
    ],
  );

  const moveGridFocusTo = (rawTarget: ParsedPlainDate, dirSign: 1 | -1) => {
    const current: ParsedPlainDate = {
      year: viewYear,
      month: viewMonth,
      day: activeFocusDay,
    };
    const target = resolveGridTarget(
      current,
      rawTarget,
      dirSign,
      minDate,
      maxDate,
      isDateDisabled,
    );
    setViewYear(target.year);
    setViewMonth(target.month);
    setFocusedDay(target.day);
    pendingFocusDayRef.current = target.day;
    if (draftAnchor) {
      setHoverIso(formatPlainDate(target));
    }
  };

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const rtlSign: 1 | -1 = direction === "rtl" ? -1 : 1;
    const current: ParsedPlainDate = {
      year: viewYear,
      month: viewMonth,
      day: activeFocusDay,
    };
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      const step: 1 | -1 = rtlSign === 1 ? -1 : 1;
      moveGridFocusTo(addDaysPlainDate(current, step), step);
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, rtlSign), rtlSign);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, -7), -1);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, 7), 1);
    } else if (e.key === "Home") {
      e.preventDefault();
      const col = (leadingBlanks + activeFocusDay - 1) % 7;
      moveGridFocusTo(addDaysPlainDate(current, -col), 1);
    } else if (e.key === "End") {
      e.preventDefault();
      const col = (leadingBlanks + activeFocusDay - 1) % 7;
      moveGridFocusTo(addDaysPlainDate(current, 6 - col), -1);
    } else if (e.key === "PageUp") {
      e.preventDefault();
      moveGridFocusTo(
        stepMonthClamped(viewYear, viewMonth, activeFocusDay, -1),
        -1,
      );
    } else if (e.key === "PageDown") {
      e.preventDefault();
      moveGridFocusTo(
        stepMonthClamped(viewYear, viewMonth, activeFocusDay, 1),
        1,
      );
    }
  };

  const years = React.useMemo(
    () => Array.from({ length: 15 }, (_, i) => yearPageStart + i),
    [yearPageStart],
  );
  const canStepPrevMonth = isMonthSteppable(
    viewYear,
    viewMonth,
    -1,
    minDate,
    maxDate,
  );
  const canStepNextMonth = isMonthSteppable(
    viewYear,
    viewMonth,
    1,
    minDate,
    maxDate,
  );
  const canStepPrevYears = minParsed ? yearPageStart > minParsed.year : true;
  const canStepNextYears = maxParsed
    ? yearPageStart + 14 < maxParsed.year
    : true;

  const displayStart = parsePlainDate(effectiveRange.start) ?? startParsed;
  const displayEnd = parsePlainDate(effectiveRange.end) ?? endParsed;

  return (
    <div
      className={
        className
          ? `m3e-date-picker m3e-date-range-picker ${className}`
          : "m3e-date-picker m3e-date-range-picker"
      }
      style={{
        borderRadius: `${DATE_PICKER_TOKENS.containerRadius}px`,
        padding: `${DATE_PICKER_TOKENS.padding}px`,
        ...style,
      }}
      onMouseLeave={() => {
        if (draftAnchor) setHoverIso(draftAnchor);
      }}
    >
      <div className="m3e-date-picker__eyebrow">
        {resolvedTitle}
        {draftAnchor ? t("datePicker.selectEndPrompt") : ""}
      </div>
      <div className="m3e-date-picker__headline m3e-date-range-picker__headline">
        <span>
          {formatLocalizedDateRange(locale, displayStart, displayEnd)}
        </span>
      </div>

      <div className="m3e-date-picker__toolbar">
        <button
          type="button"
          className="m3e-date-picker__year-toggle"
          aria-expanded={yearMode}
          onClick={() => {
            setYearMode((prev) => {
              const next = !prev;
              if (next) setYearPageStart(viewYear - 6);
              return next;
            });
          }}
        >
          <span>{formatLocalizedMonthYear(locale, viewYear, viewMonth)}</span>
          <span
            className="m3e-date-picker__year-caret"
            data-open={yearMode ? "" : undefined}
            aria-hidden="true"
          >
            ▾
          </span>
        </button>
        <div className="m3e-date-picker__month-nav">
          <button
            type="button"
            disabled={yearMode ? !canStepPrevYears : !canStepPrevMonth}
            aria-label={
              yearMode ? t("datePicker.prevYears") : t("datePicker.prevMonth")
            }
            className="m3e-date-picker__nav-btn"
            onClick={() => {
              if (yearMode) {
                setYearPageStart((s) => s - 15);
              } else {
                stepMonth(-1);
              }
            }}
          >
            <span
              aria-hidden="true"
              style={
                direction === "rtl"
                  ? { display: "inline-block", scale: "-1 1" }
                  : undefined
              }
            >
              ‹
            </span>
          </button>
          <button
            type="button"
            disabled={yearMode ? !canStepNextYears : !canStepNextMonth}
            aria-label={
              yearMode ? t("datePicker.nextYears") : t("datePicker.nextMonth")
            }
            className="m3e-date-picker__nav-btn"
            onClick={() => {
              if (yearMode) {
                setYearPageStart((s) => s + 15);
              } else {
                stepMonth(1);
              }
            }}
          >
            <span
              aria-hidden="true"
              style={
                direction === "rtl"
                  ? { display: "inline-block", scale: "-1 1" }
                  : undefined
              }
            >
              ›
            </span>
          </button>
        </div>
      </div>

      {yearMode ? (
        <div
          role="listbox"
          aria-label={t("datePicker.selectYear")}
          className="m3e-date-picker__year-grid"
        >
          {years.map((yr) => {
            const yrDisabled =
              (minParsed !== null && yr < minParsed.year) ||
              (maxParsed !== null && yr > maxParsed.year);
            return (
              <button
                key={yr}
                type="button"
                role="option"
                disabled={yrDisabled}
                aria-selected={yr === viewYear}
                className="m3e-date-picker__year-pill"
                data-selected={yr === viewYear ? "" : undefined}
                onClick={() => {
                  if (yrDisabled) return;
                  let nextM = viewMonth;
                  if (
                    minParsed &&
                    yr === minParsed.year &&
                    nextM < minParsed.month
                  ) {
                    nextM = minParsed.month;
                  }
                  if (
                    maxParsed &&
                    yr === maxParsed.year &&
                    nextM > maxParsed.month
                  ) {
                    nextM = maxParsed.month;
                  }
                  setViewYear(yr);
                  setViewMonth(nextM);
                  setYearMode(false);
                }}
              >
                {formatLocalizedNumber(locale, yr, {
                  useGrouping: false,
                  maximumFractionDigits: 0,
                })}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          role="grid"
          aria-label={t("datePicker.rangeCalendarLabel", {
            monthYear: formatLocalizedMonthYear(locale, viewYear, viewMonth),
          })}
          className="m3e-date-picker__grid m3e-date-range-picker__grid"
          onKeyDown={handleGridKeyDown}
        >
          <div role="row" className="m3e-date-picker__weekdays">
            {weekdayLabels.map((w, idx) => (
              <span
                key={`rwd-${idx}`}
                role="columnheader"
                className="m3e-date-picker__weekday"
              >
                {w}
              </span>
            ))}
          </div>

          {weekRows.map((row, rIdx) => (
            <div
              key={`rrow-${rIdx}`}
              role="row"
              className="m3e-date-picker__week-row"
            >
              {row.map((d, cIdx) => {
                if (d === null) {
                  return (
                    <div
                      key={`rblank-${rIdx}-${cIdx}`}
                      role="gridcell"
                      aria-hidden="true"
                      className="m3e-date-picker__day-empty"
                    />
                  );
                }
                const iso = formatPlainDate({
                  year: viewYear,
                  month: viewMonth,
                  day: d,
                });
                const isStart = iso === effectiveRange.start;
                const isEnd = iso === effectiveRange.end;
                const isSelected = isStart || isEnd;
                const isInRange =
                  comparePlainDates(iso, effectiveRange.start) >= 0 &&
                  comparePlainDates(iso, effectiveRange.end) <= 0 &&
                  effectiveRange.start !== effectiveRange.end;
                const isToday =
                  viewYear === today.year &&
                  viewMonth === today.month &&
                  d === today.day;
                const disabledDay = isIsoOutOfBounds(
                  iso,
                  minDate,
                  maxDate,
                  isDateDisabled,
                );

                return (
                  <CalendarDayButton
                    key={iso}
                    day={d}
                    dayText={formatLocalizedInteger(locale, d)}
                    isSelected={isSelected}
                    isInRange={isInRange}
                    isRangeStart={isStart && isInRange}
                    isRangeEnd={isEnd && isInRange}
                    isToday={isToday}
                    isDisabled={disabledDay}
                    isFocusable={d === activeFocusDay}
                    buttonRef={(el) => {
                      dayButtonRefs.current[d] = el;
                    }}
                    onFocusDay={() => setFocusedDay(d)}
                    fullDateLabel={formatLocalizedFullDate(locale, {
                      year: viewYear,
                      month: viewMonth,
                      day: d,
                    })}
                    onSelect={() => {
                      if (!disabledDay) handleDayPick(iso, d);
                    }}
                    onHover={draftAnchor ? () => setHoverIso(iso) : undefined}
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export interface M3EDatePickerFieldSingleProps {
  readonly mode?: "single";
  readonly id?: string;
  readonly name?: string;
  readonly label?: React.ReactNode;
  readonly labelPosition?: "floating" | "outside";
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly required?: boolean;
  readonly value?: PlainDateString;
  readonly defaultValue?: PlainDateString;
  readonly onValueChange?: (value: string) => void;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly modal?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function CalendarIconSvg() {
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
      <rect x="3" y="4" width="18" height="18" rx="3" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

function SingleDatePickerField({
  id: idProp,
  name,
  label,
  labelPosition = "floating",
  description,
  errorMessage,
  invalid = false,
  required = false,
  value: controlledValue,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  isDateDisabled,
  disabled = false,
  readOnly = false,
  modal = false,
  className,
  style,
}: M3EDatePickerFieldSingleProps): React.JSX.Element {
  const { locale } = useM3ERuntime();
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const generatedId = React.useId();
  const triggerId = idProp ?? generatedId;
  const descId = React.useId();
  const errId = React.useId();
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const [uncontrolledIso, setUncontrolledIso] = React.useState<string>(
    () => defaultValue ?? formatPlainDate(today),
  );
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if ((isDisabled || readOnly) && open) setOpen(false);
  }, [isDisabled, readOnly, open]);
  const currentIso = controlledValue ?? uncontrolledIso;
  const commit = (next: string) => {
    if (controlledValue === undefined) setUncontrolledIso(next);
    onValueChange?.(next);
  };
  const parsed = parsePlainDate(currentIso);
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
          ? `m3e-date-picker-field ${className}`
          : "m3e-date-picker-field"
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
      <FormHiddenValue
        name={name}
        value={currentIso}
        disabled={isDisabled}
        required={required}
      />
      <FieldRoot
        modal={modal}
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
          <FieldTrigger
            modal={modal}
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
            <span className="m3e-select__value">
              {parsed ? formatLocalizedFullDate(locale, parsed) : currentIso}
            </span>
            <span className="m3e-select__chevron" aria-hidden="true">
              <CalendarIconSvg />
            </span>
          </FieldTrigger>
        </div>

        {modal ? (
          <ModalDatePickerPopup
            open={open}
            onClose={() => setOpen(false)}
            value={currentIso}
            onValueCommit={commit}
            minDate={minDate}
            maxDate={maxDate}
            isDateDisabled={isDateDisabled}
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
                initialFocus={(openType) => openType === "keyboard"}
                className="m3e-date-picker-field__popup"
              >
                <SingleDatePicker
                  value={currentIso}
                  minDate={minDate}
                  maxDate={maxDate}
                  isDateDisabled={isDateDisabled}
                  onValueChange={(next) => {
                    commit(next);
                    setOpen(false);
                  }}
                />
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        )}
      </FieldRoot>

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

export interface M3EDatePickerFieldRangeProps {
  readonly mode: "range";
  readonly id?: string;
  readonly name?: string;
  readonly label?: React.ReactNode;
  readonly labelPosition?: "floating" | "outside";
  readonly description?: React.ReactNode;
  readonly errorMessage?: React.ReactNode;
  readonly invalid?: boolean;
  readonly required?: boolean;
  readonly value?: PlainDateRange;
  readonly defaultValue?: PlainDateRange;
  readonly onValueChange?: (range: PlainDateRange) => void;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
  readonly disabled?: boolean;
  readonly readOnly?: boolean;
  readonly modal?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function RangeDatePickerField({
  id: idProp,
  name,
  label,
  labelPosition = "floating",
  description,
  errorMessage,
  invalid = false,
  required = false,
  value: controlledRange,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  isDateDisabled,
  disabled = false,
  readOnly = false,
  modal = false,
  className,
  style,
}: Omit<M3EDatePickerFieldRangeProps, "mode">): React.JSX.Element {
  const { locale } = useM3ERuntime();
  const portalContainer = useM3EPortalContainer();
  const isDisabled = useFieldsetDisabled(disabled);
  const generatedId = React.useId();
  const triggerId = idProp ?? generatedId;
  const descId = React.useId();
  const errId = React.useId();
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const fallbackEnd = formatPlainDate({
    year: today.year,
    month: today.month,
    day: Math.min(getDaysInMonth(today.year, today.month), today.day + 4),
  });
  const [uncontrolledRange, setUncontrolledRange] =
    React.useState<PlainDateRange>(
      () => defaultValue ?? { start: formatPlainDate(today), end: fallbackEnd },
    );
  const [open, setOpen] = React.useState(false);
  React.useEffect(() => {
    if ((isDisabled || readOnly) && open) setOpen(false);
  }, [isDisabled, readOnly, open]);
  const activeRange = controlledRange ?? uncontrolledRange;
  const commit = (next: PlainDateRange) => {
    if (controlledRange === undefined) setUncontrolledRange(next);
    onValueChange?.(next);
  };
  const startParsed = parsePlainDate(activeRange.start) ?? today;
  const endParsed = parsePlainDate(activeRange.end) ?? startParsed;
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
          ? `m3e-date-picker-field ${className}`
          : "m3e-date-picker-field"
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
      <FormHiddenValue
        name={name}
        value={`${activeRange.start}/${activeRange.end}`}
        disabled={isDisabled}
        required={required}
      />
      <FieldRoot
        modal={modal}
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
          <FieldTrigger
            modal={modal}
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
            <span className="m3e-select__value">
              {formatLocalizedDateRange(locale, startParsed, endParsed)}
            </span>
            <span className="m3e-select__chevron" aria-hidden="true">
              <CalendarIconSvg />
            </span>
          </FieldTrigger>
        </div>

        {modal ? (
          <ModalDatePickerPopup
            open={open}
            onClose={() => setOpen(false)}
            range={activeRange}
            onRangeCommit={commit}
            minDate={minDate}
            maxDate={maxDate}
            isDateDisabled={isDateDisabled}
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
                initialFocus={(openType) => openType === "keyboard"}
                className="m3e-date-picker-field__popup"
              >
                <RangeDatePicker
                  value={activeRange}
                  minDate={minDate}
                  maxDate={maxDate}
                  isDateDisabled={isDateDisabled}
                  onValueChange={(next) => {
                    commit(next);
                    setOpen(false);
                  }}
                />
              </BasePopover.Popup>
            </BasePopover.Positioner>
          </BasePopover.Portal>
        )}
      </FieldRoot>

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

interface ModalDatePickerPopupProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly value?: PlainDateString;
  readonly onValueCommit?: (value: string) => void;
  readonly range?: PlainDateRange;
  readonly onRangeCommit?: (range: PlainDateRange) => void;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
}

function EditModePencilSvg() {
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
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    </svg>
  );
}

function ModalDatePickerPopup({
  open,
  onClose,
  value: committedIso = "",
  onValueCommit,
  range,
  onRangeCommit,
  minDate,
  maxDate,
  isDateDisabled,
}: ModalDatePickerPopupProps): React.JSX.Element {
  const { locale, t } = useM3ERuntime();
  const portalContainer = useM3EPortalContainer();
  const committedRange = range ?? EMPTY_RANGE;
  const [draftIso, setDraftIso] = React.useState<string>(committedIso);
  const [draftRange, setDraftRange] =
    React.useState<PlainDateRange>(committedRange);
  const [inputMode, setInputMode] = React.useState<"calendar" | "input">(
    "calendar",
  );

  React.useEffect(() => {
    if (open) {
      setDraftIso(committedIso);
      setDraftRange(committedRange);
    }
  }, [open, committedIso, committedRange]);

  const isRangeMode = range !== undefined;
  const parsedDraft = parsePlainDate(draftIso);
  const parsedRangeStart = parsePlainDate(draftRange.start);
  const parsedRangeEnd = parsePlainDate(draftRange.end);

  const isDraftValid = isRangeMode
    ? parsedRangeStart !== null &&
      parsedRangeEnd !== null &&
      comparePlainDates(draftRange.start, draftRange.end) <= 0 &&
      !isIsoOutOfBounds(draftRange.start, minDate, maxDate, isDateDisabled) &&
      !isIsoOutOfBounds(draftRange.end, minDate, maxDate, isDateDisabled)
    : parsedDraft !== null &&
      !isIsoOutOfBounds(draftIso, minDate, maxDate, isDateDisabled);

  const headlineText = isRangeMode
    ? parsedRangeStart && parsedRangeEnd
      ? formatLocalizedDateRange(locale, parsedRangeStart, parsedRangeEnd)
      : `${draftRange.start} – ${draftRange.end}`
    : parsedDraft
      ? formatLocalizedFullDate(locale, parsedDraft)
      : draftIso;

  return (
    <BaseDialog.Portal container={portalContainer}>
      <BaseDialog.Backdrop className="m3e-dialog__backdrop" />
      <BaseDialog.Viewport className="m3e-dialog__viewport">
        <BaseDialog.Popup
          className="m3e-dialog__popup m3e-modal-date-picker"
          style={{
            borderRadius: `${DATE_PICKER_TOKENS.containerRadius}px`,
            padding: 0,
            width: "auto",
            maxWidth: isRangeMode ? "380px" : "360px",
          }}
        >
          <div className="m3e-modal-date-picker__header">
            <div className="m3e-modal-date-picker__header-copy">
              <BaseDialog.Title className="m3e-date-picker__overline">
                {isRangeMode
                  ? t("datePicker.rangeTitle")
                  : t("datePicker.title")}
              </BaseDialog.Title>
              <div className="m3e-modal-date-picker__headline">
                {headlineText}
              </div>
            </div>
            <button
              type="button"
              aria-label={
                inputMode === "calendar"
                  ? t("datePicker.switchToInput")
                  : t("datePicker.switchToCalendar")
              }
              className="m3e-date-picker__nav-btn"
              onClick={() =>
                setInputMode((m) => (m === "calendar" ? "input" : "calendar"))
              }
            >
              {inputMode === "calendar" ? (
                <EditModePencilSvg />
              ) : (
                <CalendarIconSvg />
              )}
            </button>
          </div>

          <div className="m3e-modal-date-picker__body">
            {inputMode === "calendar" ? (
              isRangeMode ? (
                <RangeDatePicker
                  value={
                    parsedRangeStart && parsedRangeEnd
                      ? draftRange
                      : committedRange
                  }
                  minDate={minDate}
                  maxDate={maxDate}
                  isDateDisabled={isDateDisabled}
                  onValueChange={(next) => setDraftRange(next)}
                  className="m3e-modal-date-picker__calendar"
                />
              ) : (
                <SingleDatePicker
                  value={parsedDraft ? draftIso : committedIso}
                  minDate={minDate}
                  maxDate={maxDate}
                  isDateDisabled={isDateDisabled}
                  onValueChange={(next) => setDraftIso(next)}
                  className="m3e-modal-date-picker__calendar"
                />
              )
            ) : isRangeMode ? (
              <div className="m3e-modal-date-picker__input-pane m3e-modal-date-picker__input-pane--range">
                <TextField
                  label={t("datePicker.dateInputLabel")}
                  value={draftRange.start}
                  invalid={
                    draftRange.start.length > 0 && parsedRangeStart === null
                  }
                  onValueChange={(v) =>
                    setDraftRange((prev) => ({ ...prev, start: v }))
                  }
                  placeholder={t("datePicker.dateInputPlaceholder")}
                />
                <TextField
                  label={t("datePicker.dateInputLabel")}
                  value={draftRange.end}
                  invalid={draftRange.end.length > 0 && !isDraftValid}
                  onValueChange={(v) =>
                    setDraftRange((prev) => ({ ...prev, end: v }))
                  }
                  placeholder={t("datePicker.dateInputPlaceholder")}
                />
              </div>
            ) : (
              <div className="m3e-modal-date-picker__input-pane">
                <TextField
                  label={t("datePicker.dateInputLabel")}
                  value={draftIso}
                  invalid={draftIso.length > 0 && !isDraftValid}
                  onValueChange={(v) => setDraftIso(v)}
                  placeholder={t("datePicker.dateInputPlaceholder")}
                />
              </div>
            )}
          </div>

          <div className="m3e-modal-date-picker__actions">
            <Button variant="text" size="sm" onClick={onClose}>
              {t("datePicker.cancel")}
            </Button>
            <Button
              variant="filled"
              size="sm"
              disabled={!isDraftValid}
              onClick={() => {
                if (!isDraftValid) return;
                if (isRangeMode) onRangeCommit?.(draftRange);
                else onValueCommit?.(draftIso);
                onClose();
              }}
            >
              {t("datePicker.confirm")}
            </Button>
          </div>
        </BaseDialog.Popup>
      </BaseDialog.Viewport>
    </BaseDialog.Portal>
  );
}

const EMPTY_RANGE: PlainDateRange = { start: "", end: "" };

export type M3EDatePickerProps =
  M3EDatePickerSingleProps | M3EDatePickerRangeProps;

export function DatePicker(props: M3EDatePickerProps): React.JSX.Element {
  return props.mode === "range" ? (
    <RangeDatePicker {...props} />
  ) : (
    <SingleDatePicker {...props} />
  );
}

export type M3EDatePickerFieldProps =
  M3EDatePickerFieldSingleProps | M3EDatePickerFieldRangeProps;

export function DatePickerField(
  props: M3EDatePickerFieldProps,
): React.JSX.Element {
  return props.mode === "range" ? (
    <RangeDatePickerField {...props} />
  ) : (
    <SingleDatePickerField {...props} />
  );
}
