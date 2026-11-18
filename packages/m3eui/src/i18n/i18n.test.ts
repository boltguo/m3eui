import { describe, expect, it } from "vitest";
import {
  arSAMessages,
  canonicalizeBcp47Locale,
  formatLocalizedDateRange,
  formatLocalizedFullDate,
  formatLocalizedInteger,
  formatLocalizedMonthYear,
  formatLocalizedPercent,
  formatLocalizedWallTime,
  formatM3EMessage,
  getLocaleUses24Hour,
  getLocalizedMondayWeekdays,
  isRtlLocale,
  jaJPMessages,
  zhCNMessages,
} from "./index.js";

describe("m3eui/i18n — Locale Packs, BCP 47 & CLDR Formatting", () => {
  it("provides localized picker titles and parameter formatting across built-in locales", () => {
    expect(zhCNMessages["datePicker.title"]).toBe("选择日期");
    expect(jaJPMessages["datePicker.title"]).toBe("日付を選択");
    expect(arSAMessages["datePicker.title"]).toBe("اختر التاريخ");
    expect(
      formatM3EMessage("第 {index} 项，共 {total} 项", { index: 2, total: 5 }),
    ).toBe("第 2 项，共 5 项");
  });

  it("canonicalizes BCP 47 tags, resolves script-aware RTL, and formats CLDR dates, ranges, 12h/24h cycles, and numbers", () => {
    expect(canonicalizeBcp47Locale("zh_cn")).toBe("zh-CN");
    expect(canonicalizeBcp47Locale("EN_us")).toBe("en-US");

    expect(isRtlLocale("ar-SA")).toBe(true);
    expect(isRtlLocale("he-IL")).toBe(true);
    expect(isRtlLocale("fa-IR")).toBe(true);
    expect(isRtlLocale("pa-Arab")).toBe(true);
    expect(isRtlLocale("az-Arab")).toBe(true);
    expect(isRtlLocale("ku-Latn")).toBe(false);
    expect(isRtlLocale("zh-CN")).toBe(false);
    expect(isRtlLocale("en-US")).toBe(false);

    expect(getLocaleUses24Hour("en-US")).toBe(false);
    expect(getLocaleUses24Hour("ar-SA")).toBe(false);
    expect(getLocaleUses24Hour("zh-CN")).toBe(true);
    expect(getLocaleUses24Hour("ja-JP")).toBe(true);
    expect(getLocaleUses24Hour("en-US-u-hc-h23")).toBe(true);
    expect(getLocaleUses24Hour("zh-CN-u-hc-h12")).toBe(false);

    const weekdaysZh = getLocalizedMondayWeekdays("zh-CN");
    const weekdaysEn = getLocalizedMondayWeekdays("en-US");
    expect(weekdaysZh.length).toBe(7);
    expect(weekdaysEn.length).toBe(7);

    expect(formatLocalizedMonthYear("en-US", 2026, 11)).toContain("November");
    expect(
      formatLocalizedFullDate("en-US", { year: 2026, month: 1, day: 1 }),
    ).toContain("Jan");
    expect(
      formatLocalizedDateRange(
        "en-US",
        { year: 2026, month: 11, day: 10 },
        { year: 2027, month: 1, day: 4 },
      ),
    ).toContain("2027");
    expect(
      formatLocalizedWallTime("en-US", { hour: 14, minute: 30 }, true),
    ).toContain("14:30");
    expect(formatLocalizedInteger("ar-SA", 99)).toBe(
      new Intl.NumberFormat("ar-SA", { maximumFractionDigits: 0 }).format(99),
    );
    expect(formatLocalizedPercent("ar-SA", 0.45)).toBe(
      new Intl.NumberFormat("ar-SA", {
        style: "percent",
        maximumFractionDigits: 0,
      }).format(0.45),
    );
  });
});
