import { arSAMessages } from "./locales/ar-SA.js";
import { enUSMessages } from "./locales/en-US.js";
import { jaJPMessages } from "./locales/ja-JP.js";
import { zhCNMessages } from "./locales/zh-CN.js";
import type {
  M3EBuiltInLocale,
  M3ELocale,
  M3EMessageKey,
  M3EMessageOverrides,
  M3EMessages,
} from "./types.js";

export * from "./types.js";
export { arSAMessages, enUSMessages, jaJPMessages, zhCNMessages };

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

/**
 * Determines whether a BCP 47 locale tag uses a right-to-left script by default.
 */
export function isRtlLocale(locale: string): boolean {
  const normalized = locale.trim().toLowerCase();
  const primary = normalized.split(/[-_]/)[0] ?? "";
  return RTL_LANG_PREFIXES.has(primary);
}

/**
 * Resolves the complete M3EMessages dictionary for a given BCP 47 locale,
 * matching exact tags first (`zh-CN`), then primary language subtags (`zh` -> `zh-CN`),
 * falling back to `en-US`, and merging any user-supplied `overrides`.
 */
export function resolveM3EMessages(
  locale: M3ELocale = "en-US",
  overrides?: M3EMessageOverrides,
): M3EMessages {
  const exact = (M3E_BUILT_IN_LOCALES as Record<string, M3EMessages | undefined>)[
    locale
  ];
  let base: M3EMessages | undefined = exact;

  if (!base) {
    const lang = locale.split(/[-_]/)[0]?.toLowerCase();
    if (lang === "zh") base = zhCNMessages;
    else if (lang === "ja") base = jaJPMessages;
    else if (lang === "ar") base = arSAMessages;
    else base = enUSMessages;
  }

  if (!overrides) return base;
  return { ...base, ...overrides };
}

export type M3ETranslateFn = (
  key: M3EMessageKey,
  params?: Readonly<Record<string, string | number>>,
) => string;

/**
 * Formats a message template by replacing `{token}` placeholders with `params`.
 */
export function formatM3EMessage(
  template: string,
  params?: Readonly<Record<string, string | number>>,
): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, token: string) => {
    const val = params[token];
    return val === undefined ? `{${token}}` : String(val);
  });
}

/**
 * Creates a bound translator function `t(key, params)` for a locale + overrides.
 */
export function createM3ETranslator(
  locale: M3ELocale = "en-US",
  overrides?: M3EMessageOverrides,
): M3ETranslateFn {
  const dict = resolveM3EMessages(locale, overrides);
  return (key, params) => formatM3EMessage(dict[key], params);
}

/**
 * Returns 7 narrow weekday labels starting on Monday (`Mon..Sun`) formatted
 * via `Intl.DateTimeFormat` in UTC so there is zero host-timezone drift.
 */
export function getLocalizedMondayWeekdays(locale: string): readonly string[] {
  try {
    const fmt = new Intl.DateTimeFormat(locale, {
      weekday: "narrow",
      timeZone: "UTC",
    });
    // 2024-01-01 is Monday in UTC
    return Array.from({ length: 7 }, (_, i) =>
      fmt.format(new Date(Date.UTC(2024, 0, 1 + i, 12, 0, 0))),
    );
  } catch {
    return ["M", "T", "W", "T", "F", "S", "S"];
  }
}

/**
 * Formats `{ year, month }` (1-based month) into a localized Month + Year header.
 */
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

/**
 * Formats `{ year, month, day }` into a localized full date label.
 */
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

/**
 * Formats `{ year, month, day }` into a compact localized Month + Day label (for range headers).
 */
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

/**
 * Formats `{ hour, minute }` into a localized time string respecting 12h/24h mode.
 */
export function formatLocalizedWallTime(
  locale: string,
  time: { readonly hour: number; readonly minute: number },
  use24Hour: boolean,
): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !use24Hour,
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2024, 0, 1, time.hour, time.minute, 0)));
  } catch {
    return `${String(time.hour).padStart(2, "0")}:${String(time.minute).padStart(2, "0")}`;
  }
}
