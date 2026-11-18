export type PlainDateString = `${number}-${string}-${string}` | string;

export interface PlainDateRange {
  readonly start: PlainDateString;
  readonly end: PlainDateString;
}

export interface ParsedPlainDate {
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

export function getTodayPlainDate(): ParsedPlainDate {
  const now = new Date();
  return {
    year: now.getFullYear(),
    month: now.getMonth() + 1,
    day: now.getDate(),
  };
}

export function getDaysInMonth(year: number, month: number): number {
  return new Date(Date.UTC(year, month, 0, 12, 0, 0)).getUTCDate();
}

export function getLeadingBlanksForMonth(
  year: number,
  month: number,
  firstDayOfWeek: number,
): number {
  const jsDay = new Date(Date.UTC(year, month - 1, 1, 12, 0, 0)).getUTCDay();
  const normalizedFirst = ((Math.trunc(firstDayOfWeek) % 7) + 7) % 7;
  return (jsDay - normalizedFirst + 7) % 7;
}

export function addDaysPlainDate(
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

export function stepMonthClamped(
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

export function buildWeekRows(
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

export function isIsoOutOfBounds(
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

export function clampPlainDateToBounds(
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

export function resolveGridTarget(
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

export function resolveFocusableDayInMonth(
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

export function isMonthSteppable(
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
