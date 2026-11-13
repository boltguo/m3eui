"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { DATE_PICKER_TOKENS, SELECT_TOKENS } from "../tokens/index.js";
import { useM3E } from "../context/M3EProvider.js";
import { usePressHoldState } from "../hooks/useM3ESpring.js";
import {
  formatLocalizedDateRange,
  formatLocalizedFullDate,
  formatLocalizedInteger,
  formatLocalizedMonthYear,
  formatLocalizedNumber,
  getLocaleFirstDayOfWeek,
  getLocalizedWeekdays,
} from "../i18n/index.js";

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

export function parsePlainDate(iso: string | undefined): ParsedPlainDate | null {
  if (!iso) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
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

function addDaysPlainDate(base: ParsedPlainDate, deltaDays: number): ParsedPlainDate {
  const utc = new Date(Date.UTC(base.year, base.month - 1, base.day + deltaDays, 12, 0, 0));
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

function buildWeekRows(leadingBlanks: number, daysInMonth: number): Array<Array<number | null>> {
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

function CalendarDayButton({
  day,
  dayText,
  isSelected,
  isInRange = false,
  isRangeStart = false,
  isRangeEnd = false,
  isToday,
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
  readonly isFocusable: boolean;
  readonly onSelect: () => void;
  readonly onFocusDay: () => void;
  readonly onHover?: () => void;
  readonly buttonRef: (el: HTMLButtonElement | null) => void;
  readonly fullDateLabel: string;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(false);
  const radius = isPressed
    ? DATE_PICKER_TOKENS.dayPressedRadius
    : DATE_PICKER_TOKENS.daySelectedRadius;

  return (
    <div
      role="gridcell"
      aria-selected={isSelected}
      className="m3e-date-picker__cell"
      data-in-range={isInRange ? "" : undefined}
      data-range-start={isRangeStart ? "" : undefined}
      data-range-end={isRangeEnd ? "" : undefined}
    >
      <button
        ref={buttonRef}
        type="button"
        tabIndex={isFocusable ? 0 : -1}
        aria-label={fullDateLabel}
        aria-pressed={isSelected}
        aria-current={isToday ? "date" : undefined}
        onClick={onSelect}
        onFocus={onFocusDay}
        onMouseEnter={onHover}
        className="m3e-date-picker__day"
        data-selected={isSelected ? "" : undefined}
        data-pressed={isPressed ? "" : undefined}
        data-in-range={isInRange && !isSelected ? "" : undefined}
        data-today={isToday ? "" : undefined}
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

export interface M3EDockedDatePickerProps {
  readonly value?: PlainDateString;
  readonly defaultValue?: PlainDateString;
  readonly onValueChange?: (value: string) => void;
  readonly firstDayOfWeek?: number;
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function DockedDatePicker({
  value: controlledValue,
  defaultValue,
  onValueChange,
  firstDayOfWeek,
  title,
  className,
  style,
}: M3EDockedDatePickerProps): React.JSX.Element {
  const { locale, direction, t } = useM3E();
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

  const dayButtonRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});
  const pendingFocusDayRef = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    if (pendingFocusDayRef.current !== null) {
      const d = pendingFocusDayRef.current;
      pendingFocusDayRef.current = null;
      dayButtonRefs.current[d]?.focus();
    }
  });

  const stepMonth = (delta: number) => {
    const stepped = stepMonthClamped(viewYear, viewMonth, focusedDay, delta);
    setViewYear(stepped.year);
    setViewMonth(stepped.month);
    setFocusedDay(stepped.day);
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

  const activeFocusDay = Math.max(1, Math.min(daysInMonth, focusedDay));

  const moveGridFocusTo = (target: ParsedPlainDate) => {
    setViewYear(target.year);
    setViewMonth(target.month);
    setFocusedDay(target.day);
    pendingFocusDayRef.current = target.day;
  };

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const rtlSign = direction === "rtl" ? -1 : 1;
    const current: ParsedPlainDate = {
      year: viewYear,
      month: viewMonth,
      day: activeFocusDay,
    };
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, -1 * rtlSign));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, 1 * rtlSign));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, -7));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, 7));
    } else if (e.key === "Home") {
      e.preventDefault();
      const col = (leadingBlanks + activeFocusDay - 1) % 7;
      moveGridFocusTo(addDaysPlainDate(current, -col));
    } else if (e.key === "End") {
      e.preventDefault();
      const col = (leadingBlanks + activeFocusDay - 1) % 7;
      moveGridFocusTo(addDaysPlainDate(current, 6 - col));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      moveGridFocusTo(stepMonthClamped(viewYear, viewMonth, activeFocusDay, -1));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      moveGridFocusTo(stepMonthClamped(viewYear, viewMonth, activeFocusDay, 1));
    }
  };

  const years = React.useMemo(() => {
    const start = today.year - 6;
    return Array.from({ length: 15 }, (_, i) => start + i);
  }, [today.year]);

  return (
    <div
      className={
        className ? `m3e-date-picker ${className}` : "m3e-date-picker"
      }
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
          onClick={() => setYearMode((v) => !v)}
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

        {!yearMode ? (
          <div className="m3e-date-picker__month-nav">
            <button
              type="button"
              aria-label={t("datePicker.prevMonth")}
              className="m3e-date-picker__nav-btn"
              onClick={() => stepMonth(-1)}
            >
              <span
                aria-hidden="true"
                style={direction === "rtl" ? { display: "inline-block", scale: "-1 1" } : undefined}
              >
                ‹
              </span>
            </button>
            <button
              type="button"
              aria-label={t("datePicker.nextMonth")}
              className="m3e-date-picker__nav-btn"
              onClick={() => stepMonth(1)}
            >
              <span
                aria-hidden="true"
                style={direction === "rtl" ? { display: "inline-block", scale: "-1 1" } : undefined}
              >
                ›
              </span>
            </button>
          </div>
        ) : null}
      </div>

      {yearMode ? (
        <div
          role="listbox"
          aria-label={t("datePicker.selectYear")}
          className="m3e-date-picker__year-grid"
        >
          {years.map((yr) => (
            <button
              key={yr}
              type="button"
              role="option"
              aria-selected={yr === viewYear}
              className="m3e-date-picker__year-pill"
              data-selected={yr === viewYear ? "" : undefined}
              onClick={() => {
                setViewYear(yr);
                setYearMode(false);
              }}
            >
              {formatLocalizedNumber(locale, yr, {
                useGrouping: false,
                maximumFractionDigits: 0,
              })}
            </button>
          ))}
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

                return (
                  <CalendarDayButton
                    key={iso}
                    day={d}
                    dayText={formatLocalizedInteger(locale, d)}
                    isSelected={isSelected}
                    isToday={isToday}
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

export interface M3EDateRangePickerProps {
  readonly value?: PlainDateRange;
  readonly defaultValue?: PlainDateRange;
  readonly onValueChange?: (range: PlainDateRange) => void;
  readonly firstDayOfWeek?: number;
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function DateRangePicker({
  value: controlledRange,
  defaultValue,
  onValueChange,
  firstDayOfWeek,
  title,
  className,
  style,
}: M3EDateRangePickerProps): React.JSX.Element {
  const { locale, direction, t } = useM3E();
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

  const dayButtonRefs = React.useRef<Record<number, HTMLButtonElement | null>>({});
  const pendingFocusDayRef = React.useRef<number | null>(null);

  React.useLayoutEffect(() => {
    if (pendingFocusDayRef.current !== null) {
      const d = pendingFocusDayRef.current;
      pendingFocusDayRef.current = null;
      dayButtonRefs.current[d]?.focus();
    }
  });

  const stepMonth = (delta: number) => {
    const stepped = stepMonthClamped(viewYear, viewMonth, focusedDay, delta);
    setViewYear(stepped.year);
    setViewMonth(stepped.month);
    setFocusedDay(stepped.day);
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

  const activeFocusDay = Math.max(1, Math.min(daysInMonth, focusedDay));

  const moveGridFocusTo = (target: ParsedPlainDate) => {
    setViewYear(target.year);
    setViewMonth(target.month);
    setFocusedDay(target.day);
    pendingFocusDayRef.current = target.day;
    if (draftAnchor) {
      setHoverIso(formatPlainDate(target));
    }
  };

  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const rtlSign = direction === "rtl" ? -1 : 1;
    const current: ParsedPlainDate = {
      year: viewYear,
      month: viewMonth,
      day: activeFocusDay,
    };
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, -1 * rtlSign));
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, 1 * rtlSign));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, -7));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      moveGridFocusTo(addDaysPlainDate(current, 7));
    } else if (e.key === "Home") {
      e.preventDefault();
      const col = (leadingBlanks + activeFocusDay - 1) % 7;
      moveGridFocusTo(addDaysPlainDate(current, -col));
    } else if (e.key === "End") {
      e.preventDefault();
      const col = (leadingBlanks + activeFocusDay - 1) % 7;
      moveGridFocusTo(addDaysPlainDate(current, 6 - col));
    } else if (e.key === "PageUp") {
      e.preventDefault();
      moveGridFocusTo(stepMonthClamped(viewYear, viewMonth, activeFocusDay, -1));
    } else if (e.key === "PageDown") {
      e.preventDefault();
      moveGridFocusTo(stepMonthClamped(viewYear, viewMonth, activeFocusDay, 1));
    }
  };

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
        <span>{formatLocalizedDateRange(locale, displayStart, displayEnd)}</span>
      </div>

      <div className="m3e-date-picker__toolbar">
        <span className="m3e-date-picker__month-title">
          {formatLocalizedMonthYear(locale, viewYear, viewMonth)}
        </span>
        <div className="m3e-date-picker__month-nav">
          <button
            type="button"
            aria-label={t("datePicker.prevMonth")}
            className="m3e-date-picker__nav-btn"
            onClick={() => stepMonth(-1)}
          >
            <span
              aria-hidden="true"
              style={direction === "rtl" ? { display: "inline-block", scale: "-1 1" } : undefined}
            >
              ‹
            </span>
          </button>
          <button
            type="button"
            aria-label={t("datePicker.nextMonth")}
            className="m3e-date-picker__nav-btn"
            onClick={() => stepMonth(1)}
          >
            <span
              aria-hidden="true"
              style={direction === "rtl" ? { display: "inline-block", scale: "-1 1" } : undefined}
            >
              ›
            </span>
          </button>
        </div>
      </div>

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
                  onSelect={() => handleDayPick(iso, d)}
                  onHover={draftAnchor ? () => setHoverIso(iso) : undefined}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export interface M3EDatePickerFieldProps {
  readonly label?: React.ReactNode;
  readonly labelPosition?: "floating" | "outside";
  readonly value?: PlainDateString;
  readonly defaultValue?: PlainDateString;
  readonly onValueChange?: (value: string) => void;
  readonly disabled?: boolean;
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

export function DatePickerField({
  label,
  labelPosition = "floating",
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  style,
}: M3EDatePickerFieldProps): React.JSX.Element {
  const { locale } = useM3E();
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const [uncontrolledIso, setUncontrolledIso] = React.useState<string>(
    () => defaultValue ?? formatPlainDate(today),
  );
  const [open, setOpen] = React.useState(false);
  const currentIso = controlledValue ?? uncontrolledIso;
  const parsed = parsePlainDate(currentIso);
  const isFloatingLabel = labelPosition === "floating" && Boolean(label);

  const height = isFloatingLabel ? SELECT_TOKENS.outlinedHeight : 48;
  const radius = isFloatingLabel
    ? SELECT_TOKENS.outlinedRadius
    : SELECT_TOKENS.outsideLabelRadius;

  return (
    <div
      className={
        className
          ? `m3e-date-picker-field ${className}`
          : "m3e-date-picker-field"
      }
      data-label-position={labelPosition}
      style={style}
    >
      {label && !isFloatingLabel ? (
        <span className="m3e-field__label">{label}</span>
      ) : null}
      <BasePopover.Root open={open} onOpenChange={setOpen}>
        <div
          className="m3e-select__shell"
          data-variant="outlined"
          data-label-position={labelPosition}
          data-floating=""
          data-popup-open={open ? "" : undefined}
        >
          {isFloatingLabel ? (
            <span
              className="m3e-field__floating-label m3e-select__floating-label"
              data-floating=""
            >
              {label}
            </span>
          ) : null}
          <BasePopover.Trigger
            disabled={disabled}
            className="m3e-select__trigger m3e-date-picker-field__trigger"
            data-variant="outlined"
            data-label-position={labelPosition}
            data-floating=""
            style={{
              minHeight: `${height}px`,
              borderRadius: `${radius}px`,
              paddingInline: `${SELECT_TOKENS.paddingInline}px`,
            }}
          >
            {isFloatingLabel ? (
              <fieldset
                aria-hidden="true"
                className="m3e-field__outline"
                data-floating=""
              >
                <legend className="m3e-field__outline-legend">
                  <span>{label}</span>
                </legend>
              </fieldset>
            ) : null}
            <span className="m3e-select__value">
              {parsed ? formatLocalizedFullDate(locale, parsed) : currentIso}
            </span>
            <span className="m3e-select__chevron" aria-hidden="true">
              <CalendarIconSvg />
            </span>
          </BasePopover.Trigger>
        </div>

        <BasePopover.Portal>
          <BasePopover.Positioner
            side="bottom"
            align="start"
            sideOffset={6}
            className="m3e-popover__positioner"
          >
            <BasePopover.Popup className="m3e-date-picker-field__popup">
              <DockedDatePicker
                value={currentIso}
                onValueChange={(next) => {
                  if (controlledValue === undefined) {
                    setUncontrolledIso(next);
                  }
                  onValueChange?.(next);
                  setOpen(false);
                }}
              />
            </BasePopover.Popup>
          </BasePopover.Positioner>
        </BasePopover.Portal>
      </BasePopover.Root>
    </div>
  );
}
