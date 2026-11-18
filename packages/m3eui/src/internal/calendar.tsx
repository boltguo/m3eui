import * as React from "react";
import { DATE_PICKER_TOKENS } from "../tokens/topology.js";
import { useM3ERuntime } from "../context/M3EContext.js";
import { usePressHoldState } from "../hooks/useM3ESpring.js";
import {
  formatLocalizedFullDate,
  formatLocalizedInteger,
  formatLocalizedMonthYear,
  formatLocalizedNumber,
  getLocaleFirstDayOfWeek,
  getLocalizedWeekdays,
} from "../i18n/index.js";
import { useIsoLayoutEffect } from "./useIsoLayoutEffect.js";
import {
  addDaysPlainDate,
  buildWeekRows,
  clampPlainDateToBounds,
  comparePlainDates,
  formatPlainDate,
  getDaysInMonth,
  getLeadingBlanksForMonth,
  getTodayPlainDate,
  isIsoOutOfBounds,
  isMonthSteppable,
  parsePlainDate,
  resolveFocusableDayInMonth,
  resolveGridTarget,
  stepMonthClamped,
  type ParsedPlainDate,
  type PlainDateRange,
  type PlainDateString,
} from "./plainDate.js";

function CalendarDayButton({
  day,
  dayText,
  isSelected,
  isInRange,
  isRangeStart,
  isRangeEnd,
  isToday,
  isDisabled,
  isFocusable,
  onSelect,
  onFocusDay,
  onHover,
  buttonRef,
  fullDateLabel,
}: {
  readonly day: number;
  readonly dayText: string;
  readonly isSelected: boolean;
  readonly isInRange: boolean;
  readonly isRangeStart: boolean;
  readonly isRangeEnd: boolean;
  readonly isToday: boolean;
  readonly isDisabled: boolean;
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

const RTL_GLYPH_STYLE: React.CSSProperties = {
  display: "inline-block",
  scale: "-1 1",
};

export function DateCalendar({
  range = false,
  header,
  initialDate,
  selection,
  minDate,
  maxDate,
  isDateDisabled,
  firstDayOfWeek,
  onDayPick,
  onPreview,
  onMouseLeave,
  className,
  style,
}: {
  readonly range?: boolean;
  readonly header: React.ReactNode;
  readonly initialDate: ParsedPlainDate;
  readonly selection: PlainDateRange;
  readonly minDate?: PlainDateString;
  readonly maxDate?: PlainDateString;
  readonly isDateDisabled?: (iso: PlainDateString) => boolean;
  readonly firstDayOfWeek?: number;
  readonly onDayPick: (iso: string) => void;
  readonly onPreview?: (iso: string) => void;
  readonly onMouseLeave?: () => void;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}): React.JSX.Element {
  const { locale, direction, t } = useM3ERuntime();
  const resolvedFirstDay = firstDayOfWeek ?? getLocaleFirstDayOfWeek(locale);
  const weekdayLabels = React.useMemo(
    () => getLocalizedWeekdays(locale, resolvedFirstDay),
    [locale, resolvedFirstDay],
  );
  const today = React.useMemo(() => getTodayPlainDate(), []);

  const [viewYear, setViewYear] = React.useState<number>(initialDate.year);
  const [viewMonth, setViewMonth] = React.useState<number>(initialDate.month);
  const [focusedDay, setFocusedDay] = React.useState<number>(initialDate.day);
  const [yearMode, setYearMode] = React.useState<boolean>(false);
  const [yearPageStart, setYearPageStart] = React.useState<number>(
    () => initialDate.year - 6,
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
    onPreview?.(formatPlainDate(target));
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
  const canStepPrev = yearMode
    ? minParsed
      ? yearPageStart > minParsed.year
      : true
    : isMonthSteppable(viewYear, viewMonth, -1, minDate, maxDate);
  const canStepNext = yearMode
    ? maxParsed
      ? yearPageStart + 14 < maxParsed.year
      : true
    : isMonthSteppable(viewYear, viewMonth, 1, minDate, maxDate);
  const glyphStyle = direction === "rtl" ? RTL_GLYPH_STYLE : undefined;
  const monthYearText = formatLocalizedMonthYear(locale, viewYear, viewMonth);
  const rootClassName = range
    ? "m3e-date-picker m3e-date-range-picker"
    : "m3e-date-picker";

  return (
    <div
      className={className ? `${rootClassName} ${className}` : rootClassName}
      style={{
        borderRadius: `${DATE_PICKER_TOKENS.containerRadius}px`,
        padding: `${DATE_PICKER_TOKENS.padding}px`,
        ...style,
      }}
      onMouseLeave={onMouseLeave}
    >
      {header}

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
          <span>{monthYearText}</span>
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
            disabled={!canStepPrev}
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
            <span aria-hidden="true" style={glyphStyle}>
              ‹
            </span>
          </button>
          <button
            type="button"
            disabled={!canStepNext}
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
            <span aria-hidden="true" style={glyphStyle}>
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
          aria-label={t(
            range ? "datePicker.rangeCalendarLabel" : "datePicker.calendarLabel",
            { monthYear: monthYearText },
          )}
          className={
            range
              ? "m3e-date-picker__grid m3e-date-range-picker__grid"
              : "m3e-date-picker__grid"
          }
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
                const date = { year: viewYear, month: viewMonth, day: d };
                const iso = formatPlainDate(date);
                const isStart = iso === selection.start;
                const isEnd = iso === selection.end;
                const isSelected = isStart || isEnd;
                const isInRange =
                  comparePlainDates(iso, selection.start) >= 0 &&
                  comparePlainDates(iso, selection.end) <= 0 &&
                  selection.start !== selection.end;
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
                    isToday={
                      viewYear === today.year &&
                      viewMonth === today.month &&
                      d === today.day
                    }
                    isDisabled={disabledDay}
                    isFocusable={d === activeFocusDay}
                    buttonRef={(el) => {
                      dayButtonRefs.current[d] = el;
                    }}
                    onFocusDay={() => setFocusedDay(d)}
                    fullDateLabel={formatLocalizedFullDate(locale, date)}
                    onSelect={() => {
                      if (disabledDay) return;
                      setFocusedDay(d);
                      onDayPick(iso);
                    }}
                    onHover={onPreview ? () => onPreview(iso) : undefined}
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
