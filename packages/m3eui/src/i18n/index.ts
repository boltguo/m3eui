import { arSAMessages } from "./locales/ar-SA.js";
import { enUSMessages } from "./locales/en-US.js";
import { jaJPMessages } from "./locales/ja-JP.js";
import { zhCNMessages } from "./locales/zh-CN.js";
import { formatM3EMessage } from "./format.js";
import type {
  M3EBuiltInLocale,
  M3ELocale,
  M3EMessageOverrides,
  M3EMessages,
  M3ETranslateFn,
} from "./types.js";

export * from "./types.js";
export { arSAMessages, enUSMessages, formatM3EMessage, jaJPMessages, zhCNMessages };

export const M3E_BUILT_IN_LOCALES: Readonly<Record<M3EBuiltInLocale, M3EMessages>> = {
  "en-US": enUSMessages,
  "zh-CN": zhCNMessages,
  "ja-JP": jaJPMessages,
  "ar-SA": arSAMessages,
};

const RTL_LANG_PREFIXES = new Set([
  "ar",
  "dv",
  "fa",
  "he",
  "iw",
  "ku",
  "nqo",
  "ps",
  "sd",
  "ug",
  "ur",
  "yi",
]);

const RTL_SCRIPTS = new Set([
  "Adlm",
  "Arab",
  "Hebr",
  "Mand",
  "Nkoo",
  "Orkh",
  "Rohg",
  "Samr",
  "Syrc",
  "Thaa",
  "Yezi",
]);

const LTR_SCRIPTS = new Set([
  "Armn",
  "Beng",
  "Cyrl",
  "Deva",
  "Ethi",
  "Geor",
  "Grek",
  "Gujr",
  "Guru",
  "Hang",
  "Hani",
  "Hans",
  "Hant",
  "Jpan",
  "Khmr",
  "Knda",
  "Kore",
  "Laoo",
  "Latn",
  "Mlym",
  "Mymr",
  "Orya",
  "Sinh",
  "Taml",
  "Telu",
  "Thai",
  "Tibt",
]);

export function canonicalizeBcp47Locale(locale: string): string {
  const cleaned = locale.trim().replace(/_/g, "-");
  if (!cleaned) return "en-US";
  try {
    const canonical = Intl.getCanonicalLocales(cleaned)[0];
    if (canonical) return canonical;
  } catch {
    // Fall back to cleaned tag when custom/private subtags cannot be canonicalized
  }
  return cleaned;
}

export function isRtlLocale(locale: string): boolean {
  const cleaned = locale.trim().replace(/_/g, "-");
  if (!cleaned) return false;
  const subtags = cleaned.split("-");
  const primary = (subtags[0] ?? "").toLowerCase();

  for (let i = 1; i < subtags.length; i++) {
    const sub = subtags[i] ?? "";
    if (sub.length === 1) break; // Stop before singleton extension (-u-, -x-)
    if (/^[A-Za-z]{4}$/.test(sub)) {
      const titleScript =
        sub.charAt(0).toUpperCase() + sub.slice(1).toLowerCase();
      if (RTL_SCRIPTS.has(titleScript)) return true;
      if (LTR_SCRIPTS.has(titleScript)) return false;
    }
  }

  try {
    const intlLocale = new Intl.Locale(cleaned) as Intl.Locale & {
      getTextInfo?: () => { direction?: string };
      textInfo?: { direction?: string };
    };
    const info =
      typeof intlLocale.getTextInfo === "function"
        ? intlLocale.getTextInfo()
        : intlLocale.textInfo;
    if (info?.direction === "rtl") return true;
    if (info?.direction === "ltr") return false;
  } catch {
    // Fall through to CLDR primary-language set
  }

  return RTL_LANG_PREFIXES.has(primary);
}

const BUILT_IN_LOWER_MAP: Readonly<Record<string, M3EMessages>> = {
  "en-us": enUSMessages,
  "zh-cn": zhCNMessages,
  "ja-jp": jaJPMessages,
  "ar-sa": arSAMessages,
};

export function resolveM3EMessages(
  locale: M3ELocale = "en-US",
  overrides?: M3EMessageOverrides,
): M3EMessages {
  const normalized = canonicalizeBcp47Locale(locale);
  const exact =
    (M3E_BUILT_IN_LOCALES as Record<string, M3EMessages | undefined>)[
      normalized
    ] ?? BUILT_IN_LOWER_MAP[normalized.toLowerCase()];
  let base: M3EMessages | undefined = exact;

  if (!base) {
    const lang = normalized.split("-")[0]?.toLowerCase();
    if (lang === "zh") base = zhCNMessages;
    else if (lang === "ja") base = jaJPMessages;
    else if (lang === "ar") base = arSAMessages;
    else base = enUSMessages;
  }

  if (!overrides) return base;
  return { ...base, ...overrides };
}

export function createM3ETranslator(
  locale: M3ELocale = "en-US",
  overrides?: M3EMessageOverrides,
): M3ETranslateFn {
  const dict = resolveM3EMessages(locale, overrides);
  return (key, params) => formatM3EMessage(dict[key], params);
}

const SATURDAY_FIRST_REGIONS = new Set([
  "AE",
  "AF",
  "BH",
  "DJ",
  "DZ",
  "EG",
  "IQ",
  "IR",
  "JO",
  "KW",
  "LY",
  "MA",
  "OM",
  "QA",
  "SA",
  "SD",
  "SY",
]);

const SUNDAY_FIRST_REGIONS = new Set([
  "AG",
  "AS",
  "BD",
  "BR",
  "BS",
  "BT",
  "BW",
  "BZ",
  "CA",
  "CO",
  "DM",
  "DO",
  "ET",
  "GT",
  "GU",
  "HK",
  "HN",
  "ID",
  "IL",
  "IN",
  "JM",
  "JP",
  "KE",
  "KH",
  "KR",
  "LA",
  "MH",
  "MM",
  "MO",
  "MT",
  "MX",
  "MZ",
  "NI",
  "NP",
  "PA",
  "PE",
  "PH",
  "PK",
  "PR",
  "PT",
  "PY",
  "SG",
  "SV",
  "TH",
  "TT",
  "TW",
  "UM",
  "US",
  "VE",
  "VI",
  "WS",
  "YE",
  "ZA",
  "ZW",
]);

const MONDAY_FIRST_REGIONS = new Set([
  "AU",
  "AT",
  "BE",
  "CH",
  "CN",
  "CZ",
  "DE",
  "DK",
  "ES",
  "FI",
  "FR",
  "GB",
  "GR",
  "HU",
  "IE",
  "IT",
  "NL",
  "NO",
  "NZ",
  "PL",
  "RO",
  "RU",
  "SE",
  "TR",
  "UA",
  "VN",
]);

const FIRST_DAY_OF_WEEK_MAP: Readonly<Record<string, number>> = {
  sun: 0,
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
};

/**
 * Resolves the canonical CLDR first day of the week (`0 = Sunday .. 6 = Saturday`)
 * for a given BCP 47 locale tag, matching AOSP `CalendarModel.firstDayOfWeek`.
 */
export function getLocaleFirstDayOfWeek(locale: string): number {
  const cleaned = locale.trim().replace(/_/g, "-");
  const fwMatch = /-u-(?:[a-z0-9]+-)*fw-(sun|mon|tue|wed|thu|fri|sat)\b/i.exec(
    cleaned,
  );
  if (fwMatch) {
    return FIRST_DAY_OF_WEEK_MAP[(fwMatch[1] ?? "").toLowerCase()] ?? 0;
  }

  const parts = cleaned.split("-");
  const lang = (parts[0] ?? "").toLowerCase();
  let region = "";
  for (let i = 1; i < parts.length; i++) {
    const subtag = parts[i] ?? "";
    if (subtag.length === 1) break;
    if (/^[A-Za-z]{2}$/.test(subtag) || /^\d{3}$/.test(subtag)) {
      region = subtag.toUpperCase();
      break;
    }
  }

  if (region) {
    if (SATURDAY_FIRST_REGIONS.has(region)) return 6;
    if (SUNDAY_FIRST_REGIONS.has(region)) return 0;
    if (MONDAY_FIRST_REGIONS.has(region)) return 1;
  }

  try {
    const intlLocale = new Intl.Locale(locale) as Intl.Locale & {
      getWeekInfo?: () => { firstDay?: number };
      weekInfo?: { firstDay?: number };
    };
    const info =
      typeof intlLocale.getWeekInfo === "function"
        ? intlLocale.getWeekInfo()
        : intlLocale.weekInfo;
    if (info && typeof info.firstDay === "number") {
      return info.firstDay % 7;
    }
  } catch {
    // Fall through to primary-language CLDR defaults
  }

  if (lang === "ar" || lang === "fa" || lang === "ps") return 6;
  if (
    lang === "ja" ||
    lang === "ko" ||
    lang === "he" ||
    lang === "iw" ||
    lang === "th" ||
    lang === "hi"
  ) {
    return 0;
  }
  if (lang === "en" && !region) return 0;
  return 1;
}

export function getLocalizedWeekdays(
  locale: string,
  firstDayOfWeek: number = getLocaleFirstDayOfWeek(locale),
): readonly string[] {
  const normalizedStart = ((Math.trunc(firstDayOfWeek) % 7) + 7) % 7;
  const fallbackSunFirst = ["S", "M", "T", "W", "T", "F", "S"];
  try {
    const fmt = new Intl.DateTimeFormat(locale, {
      weekday: "narrow",
      timeZone: "UTC",
    });
    // 2024-01-07T12:00:00Z is Sunday (UTC day 0)
    return Array.from({ length: 7 }, (_, i) => {
      const jsDay = (normalizedStart + i) % 7;
      return fmt.format(new Date(Date.UTC(2024, 0, 7 + jsDay, 12, 0, 0)));
    });
  } catch {
    return Array.from(
      { length: 7 },
      (_, i) => fallbackSunFirst[(normalizedStart + i) % 7] ?? "M",
    );
  }
}

export function getLocalizedMondayWeekdays(locale: string): readonly string[] {
  return getLocalizedWeekdays(locale, 1);
}

export function formatLocalizedMonthYear(
  locale: string,
  year: number,
  month: number,
): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(year, month - 1, 15, 12, 0, 0)));
  } catch {
    return `${year}-${String(month).padStart(2, "0")}`;
  }
}

export function formatLocalizedFullDate(
  locale: string,
  date: { readonly year: number; readonly month: number; readonly day: number },
): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(date.year, date.month - 1, date.day, 12, 0, 0)));
  } catch {
    return `${date.year}-${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
  }
}

export function formatLocalizedShortMonthDay(
  locale: string,
  date: { readonly year: number; readonly month: number; readonly day: number },
): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(date.year, date.month - 1, date.day, 12, 0, 0)));
  } catch {
    return `${String(date.month).padStart(2, "0")}-${String(date.day).padStart(2, "0")}`;
  }
}

export function formatLocalizedWallTime(
  locale: string,
  time: { readonly hour: number; readonly minute: number },
  use24Hour?: boolean,
): string {
  const resolved24h = use24Hour ?? getLocaleUses24Hour(locale);
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !resolved24h,
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2024, 0, 1, time.hour, time.minute, 0)));
  } catch {
    return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
  }
}

const TWELVE_HOUR_REGIONS = new Set([
  "AU",
  "BD",
  "CA",
  "CO",
  "DO",
  "EG",
  "HN",
  "IN",
  "JO",
  "KW",
  "MY",
  "MX",
  "NI",
  "NZ",
  "OM",
  "PH",
  "PK",
  "PR",
  "QA",
  "SA",
  "SV",
  "SY",
  "US",
  "VE",
]);

/**
 * Resolves whether a BCP 47 locale defaults to 24-hour clock format (`h23`/`h24`)
 * vs 12-hour (`h11`/`h12`), honoring Unicode `-u-hc-*` extensions and CLDR `Intl.DateTimeFormat`.
 */
export function getLocaleUses24Hour(locale: string): boolean {
  const cleaned = locale.trim().replace(/_/g, "-");
  const hcMatch = /-u-(?:[a-z0-9]+-)*hc-(h11|h12|h23|h24)\b/i.exec(cleaned);
  if (hcMatch) {
    const hc = (hcMatch[1] ?? "").toLowerCase();
    return hc === "h23" || hc === "h24";
  }

  try {
    const resolved = new Intl.DateTimeFormat(cleaned, {
      hour: "numeric",
    }).resolvedOptions();
    if (resolved.hourCycle) {
      return resolved.hourCycle === "h23" || resolved.hourCycle === "h24";
    }
    if (typeof resolved.hour12 === "boolean") {
      return !resolved.hour12;
    }
  } catch {
    // Fall through to deterministic region/language fallback
  }

  const parts = cleaned.split("-");
  const lang = (parts[0] ?? "").toLowerCase();
  for (let i = 1; i < parts.length; i++) {
    const sub = parts[i] ?? "";
    if (sub.length === 1) break;
    if (/^[A-Za-z]{2}$/.test(sub)) {
      return !TWELVE_HOUR_REGIONS.has(sub.toUpperCase());
    }
  }
  return lang !== "ar" && lang !== "ko";
}

export function formatLocalizedDateRange(
  locale: string,
  start: { readonly year: number; readonly month: number; readonly day: number },
  end: { readonly year: number; readonly month: number; readonly day: number },
): string {
  const startUtc = new Date(
    Date.UTC(start.year, start.month - 1, start.day, 12, 0, 0),
  );
  const endUtc = new Date(
    Date.UTC(end.year, end.month - 1, end.day, 12, 0, 0),
  );
  const sameDay =
    start.year === end.year &&
    start.month === end.month &&
    start.day === end.day;
  const crossYear = start.year !== end.year;

  try {
    const fmt = new Intl.DateTimeFormat(locale, {
      ...(crossYear ? { year: "numeric" } : {}),
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    }) as Intl.DateTimeFormat & {
      formatRange?: (startDate: Date, endDate: Date) => string;
    };
    if (sameDay) {
      return fmt.format(startUtc);
    }
    if (typeof fmt.formatRange === "function") {
      return fmt.formatRange(startUtc, endUtc);
    }
  } catch {
    // Fall back to individual date formatting
  }

  const a = crossYear
    ? formatLocalizedFullDate(locale, start)
    : formatLocalizedShortMonthDay(locale, start);
  const b = crossYear
    ? formatLocalizedFullDate(locale, end)
    : formatLocalizedShortMonthDay(locale, end);
  return sameDay ? a : `${a} – ${b}`;
}

export function formatLocalizedNumber(
  locale: string,
  value: number,
  options?: Intl.NumberFormatOptions,
): string {
  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    return String(value);
  }
}

export function formatLocalizedInteger(locale: string, value: number): string {
  return formatLocalizedNumber(locale, Math.trunc(value), {
    maximumFractionDigits: 0,
  });
}

export function formatLocalizedPercent(
  locale: string,
  ratio0To1: number,
): string {
  const clamped = Math.max(0, Math.min(1, ratio0To1));
  try {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 0,
    }).format(clamped);
  } catch {
    return `${Math.round(clamped * 100)}%`;
  }
}
