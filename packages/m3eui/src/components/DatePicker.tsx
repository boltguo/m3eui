"use client";

import * as React from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { DATE_PICKER_TOKENS, SELECT_TOKENS } from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import {
  useM3EScalarSpring,
  usePressHoldState,
} from "../hooks/useM3ESpring.js";
import {
  formatLocalizedFullDate,
  formatLocalizedMonthYear,
  formatLocalizedShortMonthDay,
  getLocalizedMondayWeekdays,
} from "../i18n/index.js";

/**
 * Location-agnostic ISO plain calendar date (`YYYY-MM-DD`) — avoids `Date` UTC/timezone off-by-one bugs!
 */
export type PlainDateString = `${number}-${string}-${string}` | string;

export interface PlainDateRange {
  readonly start: PlainDateString;
  readonly end: PlainDateString;
}

interface ParsedPlainDate {
  readonly year: number;
  readonly month: number; // 1..12
  readonly day: number; // 1..31
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
  return new Date(year, month, 0).getDate();
}

function getFirstWeekdayOfMonth(year: number, month: number): number {
  // 0 = Sunday .. 6 = Saturday; convert to Monday-first (0 = Mon .. 6 = Sun)
  const jsDay = new Date(year, month - 1, 1).getDay();
  return (jsDay + 6) % 7;
}

function CalendarDayButton({
  day,
  isSelected,
  isInRange = false,
  isRangeStart = false,
  isRangeEnd = false,
  isToday,
  onSelect,
  onHover,
  fullDateLabel,
}: {
  readonly day: number;
  readonly isSelected: boolean;
  readonly isInRange?: boolean;
  readonly isRangeStart?: boolean;
  readonly isRangeEnd?: boolean;
  readonly isToday: boolean;
  readonly onSelect: () => void;
  readonly onHover?: () => void;
  readonly fullDateLabel: string;
}) {
  const { isPressed, pressHandlers } = usePressHoldState(false);
  const radius = useM3EScalarSpring(
    isPressed
      ? DATE_PICKER_TOKENS.dayPressedRadius
      : DATE_PICKER_TOKENS.daySelectedRadius,
    "fastSpatial",
  );

  return (
    <div
      className="m3e-date-picker__cell"
      data-in-range={isInRange ? "" : undefined}
      data-range-start={isRangeStart ? "" : undefined}
      data-range-end={isRangeEnd ? "" : undefined}
    >
      <button
        type="button"
        aria-label={fullDateLabel}
        aria-pressed={isSelected}
        aria-current={isToday ? "date" : undefined}
        onClick={onSelect}
        onMouseEnter={onHover}
        className="m3e-date-picker__day"
        data-selected={isSelected ? "" : undefined}
        data-in-range={isInRange && !isSelected ? "" : undefined}
        data-today={isToday ? "" : undefined}
        style={{
          width: `${DATE_PICKER_TOKENS.dayCellSize}px`,
          height: `${DATE_PICKER_TOKENS.dayCellSize}px`,
          borderRadius: `${Math.max(6, radius).toFixed(1)}px`,
        }}
        {...pressHandlers}
      >
        {day}
      </button>
    </div>
  );
}

export interface M3EDockedDatePickerProps {
  readonly value?: PlainDateString;
  readonly defaultValue?: PlainDateString;
  readonly onValueChange?: (value: string) => void;
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function DockedDatePicker({
  value: controlledValue,
  defaultValue,
  onValueChange,
  title,
  className,
  style,
}: M3EDockedDatePickerProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const resolvedTitle = title ?? t("datePicker.title");
  const weekdayLabels = React.useMemo(
    () => getLocalizedMondayWeekdays(locale),
    [locale],
  );
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const [uncontrolledIso, setUncontrolledIso] = React.useState<string>(
    () => defaultValue ?? formatPlainDate(today),
  );
  const selectedIso = controlledValue ?? uncontrolledIso;
  const selected = parsePlainDate(selectedIso) ?? today;

  const [viewYear, setViewYear] = React.useState<number>(selected.year);
  const [viewMonth, setViewMonth] = React.useState<number>(selected.month);
  const [yearMode, setYearMode] = React.useState<boolean>(false);

  const stepMonth = (delta: number) => {
    let nextM = viewMonth + delta;
    let nextY = viewYear;
    while (nextM < 1) {
      nextM += 12;
      nextY -= 1;
    }
    while (nextM > 12) {
      nextM -= 12;
      nextY += 1;
    }
    setViewMonth(nextM);
    setViewYear(nextY);
  };

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const leadingBlanks = getFirstWeekdayOfMonth(viewYear, viewMonth);

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
              ‹
            </button>
            <button
              type="button"
              aria-label={t("datePicker.nextMonth")}
              className="m3e-date-picker__nav-btn"
              onClick={() => stepMonth(1)}
            >
              ›
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
              {yr}
            </button>
          ))}
        </div>
      ) : (
        <>
          <div className="m3e-date-picker__weekdays" aria-hidden="true">
            {weekdayLabels.map((w, idx) => (
              <span key={`wd-${idx}`} className="m3e-date-picker__weekday">
                {w}
              </span>
            ))}
          </div>

          <div
            role="grid"
            aria-label={t("datePicker.calendarLabel", {
              monthYear: formatLocalizedMonthYear(locale, viewYear, viewMonth),
            })}
            className="m3e-date-picker__grid"
          >
            {Array.from({ length: leadingBlanks }, (_, idx) => (
              <span key={`blank-${idx}`} aria-hidden="true" />
            ))}
            {Array.from({ length: daysInMonth }, (_, idx) => {
              const d = idx + 1;
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
                  isSelected={isSelected}
                  isToday={isToday}
                  fullDateLabel={formatLocalizedFullDate(locale, {
                    year: viewYear,
                    month: viewMonth,
                    day: d,
                  })}
                  onSelect={() => {
                    if (controlledValue === undefined) {
                      setUncontrolledIso(iso);
                    }
                    onValueChange?.(iso);
                  }}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export interface M3EDateRangePickerProps {
  readonly value?: PlainDateRange;
  readonly defaultValue?: PlainDateRange;
  readonly onValueChange?: (range: PlainDateRange) => void;
  readonly title?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

/**
 * M3E DateRangePicker — Continuous `secondary-container` range highlight strip
 * connecting `primary` capsule start & end dates, with live hover range preview.
 */
export function DateRangePicker({
  value: controlledRange,
  defaultValue,
  onValueChange,
  title,
  className,
  style,
}: M3EDateRangePickerProps): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const resolvedTitle = title ?? t("datePicker.rangeTitle");
  const weekdayLabels = React.useMemo(
    () => getLocalizedMondayWeekdays(locale),
    [locale],
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

  // When non-null, user clicked the first anchor and is picking the second endpoint
  const [draftAnchor, setDraftAnchor] = React.useState<string | null>(null);
  const [hoverIso, setHoverIso] = React.useState<string | null>(null);

  const startParsed = parsePlainDate(activeRange.start) ?? today;
  const endParsed = parsePlainDate(activeRange.end) ?? startParsed;

  const [viewYear, setViewYear] = React.useState<number>(startParsed.year);
  const [viewMonth, setViewMonth] = React.useState<number>(startParsed.month);

  const stepMonth = (delta: number) => {
    let nextM = viewMonth + delta;
    let nextY = viewYear;
    while (nextM < 1) {
      nextM += 12;
      nextY -= 1;
    }
    while (nextM > 12) {
      nextM -= 12;
      nextY += 1;
    }
    setViewMonth(nextM);
    setViewYear(nextY);
  };

  // Effective displayed range (uses draftAnchor..hoverIso while mid-selection)
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

  const handleDayPick = (iso: string) => {
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
  const leadingBlanks = getFirstWeekdayOfMonth(viewYear, viewMonth);

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
        <span>{formatLocalizedShortMonthDay(locale, displayStart)}</span>
        <span className="m3e-date-range-picker__dash" aria-hidden="true">
          –
        </span>
        <span>{formatLocalizedShortMonthDay(locale, displayEnd)}</span>
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
            ‹
          </button>
          <button
            type="button"
            aria-label={t("datePicker.nextMonth")}
            className="m3e-date-picker__nav-btn"
            onClick={() => stepMonth(1)}
          >
            ›
          </button>
        </div>
      </div>

      <div className="m3e-date-picker__weekdays" aria-hidden="true">
        {weekdayLabels.map((w, idx) => (
          <span key={`rwd-${idx}`} className="m3e-date-picker__weekday">
            {w}
          </span>
        ))}
      </div>

      <div
        role="grid"
        aria-label={t("datePicker.rangeCalendarLabel", {
          monthYear: formatLocalizedMonthYear(locale, viewYear, viewMonth),
        })}
        className="m3e-date-picker__grid m3e-date-range-picker__grid"
      >
        {Array.from({ length: leadingBlanks }, (_, idx) => (
          <span key={`blank-${idx}`} aria-hidden="true" />
        ))}
        {Array.from({ length: daysInMonth }, (_, idx) => {
          const d = idx + 1;
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
              isSelected={isSelected}
              isInRange={isInRange}
              isRangeStart={isStart && isInRange}
              isRangeEnd={isEnd && isInRange}
              isToday={isToday}
              fullDateLabel={formatLocalizedFullDate(locale, {
                year: viewYear,
                month: viewMonth,
                day: d,
              })}
              onSelect={() => handleDayPick(iso)}
              onHover={draftAnchor ? () => setHoverIso(iso) : undefined}
            />
          );
        })}
      </div>
    </div>
  );
}

export interface M3EDatePickerFieldProps {
  readonly label?: React.ReactNode;
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
  value: controlledValue,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  style,
}: M3EDatePickerFieldProps): React.JSX.Element {
  const { locale } = useM3EI18n();
  const today = React.useMemo(() => getTodayPlainDate(), []);
  const [uncontrolledIso, setUncontrolledIso] = React.useState<string>(
    () => defaultValue ?? formatPlainDate(today),
  );
  const [open, setOpen] = React.useState(false);
  const currentIso = controlledValue ?? uncontrolledIso;
  const parsed = parsePlainDate(currentIso);

  return (
    <div
      className={
        className
          ? `m3e-date-picker-field ${className}`
          : "m3e-date-picker-field"
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
          <span>
            {parsed ? formatLocalizedFullDate(locale, parsed) : currentIso}
          </span>
          <span className="m3e-select__chevron" aria-hidden="true">
            <CalendarIconSvg />
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
