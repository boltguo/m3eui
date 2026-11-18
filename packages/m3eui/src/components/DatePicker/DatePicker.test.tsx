import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { getLocaleFirstDayOfWeek, getLocalizedWeekdays, zhCNMessages } from "../../i18n/index.js";
import { DatePicker, DatePickerField } from "./DatePicker.js";

describe("DatePicker & DatePickerField", () => {
  const dom = setupDomTest();

  it("localizes DatePicker titles and month headers across en-US and ja-JP", () => {
    act(() => {
      dom.root.render(
        <div>
          <div data-testid="en">
            <PausedWrapper locale="en-US">
              <DatePicker defaultValue="2026-11-18" />
            </PausedWrapper>
          </div>
          <div data-testid="ja">
            <PausedWrapper locale="ja-JP">
              <DatePicker defaultValue="2026-11-18" />
            </PausedWrapper>
          </div>
        </div>,
      );
    });

    expect(
      dom.container.querySelector('[data-testid="en"] .m3e-date-picker__eyebrow')?.textContent,
    ).toBe("Select date");
    expect(
      dom.container.querySelector('[data-testid="ja"] .m3e-date-picker__eyebrow')?.textContent,
    ).toBe("日付を選択");

    expect(
      dom.container.querySelector('[data-testid="en"] .m3e-date-picker__year-toggle span')?.textContent,
    ).toContain("November");
    expect(
      dom.container.querySelector('[data-testid="ja"] .m3e-date-picker__year-toggle span')?.textContent,
    ).toContain("2026");
  });

  it("disables navigation and out-of-range days based on minDate/maxDate", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper>
          <DatePicker defaultValue="2026-01-15" minDate="2026-04-01" />
          <DatePicker
            defaultValue="2026-05-15"
            minDate="2026-05-10"
            maxDate="2026-05-20"
          />
        </PausedWrapper>,
      );
    });

    const firstPicker = dom.container.querySelectorAll(".m3e-date-picker")[0]!;
    const navButtons = firstPicker.querySelectorAll<HTMLButtonElement>(".m3e-date-picker__nav-btn");
    expect(navButtons[0]!.disabled).toBe(true);
    expect(navButtons[1]!.disabled).toBe(false);

    const secondPicker = dom.container.querySelectorAll(".m3e-date-picker")[1]!;
    const dayButtons = Array.from(
      secondPicker.querySelectorAll<HTMLButtonElement>(".m3e-date-picker__day"),
    );
    const day5 = dayButtons.find((b) => b.textContent?.trim() === "5");
    const day15 = dayButtons.find((b) => b.textContent?.trim() === "15");
    expect(day5?.disabled).toBe(true);
    expect(day15?.disabled).toBe(false);
    expect(secondPicker.querySelectorAll(".m3e-date-picker__day:disabled").length).toBeGreaterThan(10);
  });

  it("picks a range in reverse click order and normalizes start <= end", () => {
    let pickedRange: { start: string; end: string } | null = null;
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <DatePicker
            mode="range"
            defaultValue={{ start: "2026-11-10", end: "2026-11-14" }}
            onValueChange={(r) => {
              pickedRange = r;
            }}
          />
        </PausedWrapper>,
      );
    });

    const dayButtons = dom.container.querySelectorAll<HTMLButtonElement>(
      ".m3e-date-range-picker .m3e-date-picker__day",
    );
    act(() => {
      dayButtons[19]!.click();
    });
    act(() => {
      dayButtons[11]!.click();
    });
    expect(pickedRange).toEqual({
      start: "2026-11-12",
      end: "2026-11-20",
    });
  });

  it("toggles DatePicker year grid view and adapts firstDayOfWeek + 2D arrow roving", () => {
    expect(getLocaleFirstDayOfWeek("en-US")).toBe(0);
    expect(getLocaleFirstDayOfWeek("ar-SA")).toBe(6);
    expect(getLocaleFirstDayOfWeek("zh-CN")).toBe(1);
    expect(getLocalizedWeekdays("en-US").length).toBe(7);

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <DatePicker defaultValue="2026-05-15" />
        </PausedWrapper>,
      );
    });

    const weekRows = dom.container.querySelectorAll('.m3e-date-picker__week-row[role="row"]');
    expect(weekRows.length).toBeGreaterThanOrEqual(5);
    const gridCells = dom.container.querySelectorAll('.m3e-date-picker__week-row [role="gridcell"]');
    expect(gridCells.length).toBe(weekRows.length * 7);

    const activeDay = dom.container.querySelector<HTMLButtonElement>(
      '.m3e-date-picker__day[tabindex="0"]',
    );
    expect(activeDay?.textContent).toBe("15");

    act(() => {
      activeDay!.focus();
      activeDay!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }),
      );
    });

    const nextActiveDay = dom.container.querySelector<HTMLButtonElement>(
      '.m3e-date-picker__day[tabindex="0"]',
    );
    expect(nextActiveDay?.textContent).toBe("22");

    const yearToggle = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-date-picker__year-toggle",
    );
    expect(yearToggle?.getAttribute("aria-expanded")).toBe("false");

    act(() => {
      yearToggle!.click();
    });
    expect(yearToggle?.getAttribute("aria-expanded")).toBe("true");
    expect(dom.container.querySelectorAll(".m3e-date-picker__year-pill").length).toBe(15);
  });

  it("opens outlined notch, confirms modal single DatePickerField, and suppresses popup when readOnly", () => {
    let modalConfirmedDate = "";

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false} locale="zh-CN">
          <DatePickerField
            id="modal-date"
            modal
            defaultValue="2026-06-15"
            onValueChange={(val) => {
              modalConfirmedDate = val;
            }}
          />
          <DatePickerField
            readOnly
            label="Launch Date"
            name="launchDate"
            defaultValue="2026-11-15"
          />
        </M3EProvider>,
      );
    });

    expect(
      dom.container.querySelectorAll(".m3e-select__shell > fieldset.m3e-field__outline").length,
    ).toBe(1);
    expect(
      dom.container.querySelector(".m3e-select__trigger fieldset.m3e-field__outline"),
    ).toBeNull();
    expect(
      dom.container.querySelector<HTMLInputElement>('input[name="launchDate"]')?.value,
    ).toBe("2026-11-15");

    // readOnly trigger suppresses popup
    const triggers = dom.container.querySelectorAll<HTMLElement>(".m3e-select__trigger");
    act(() => {
      triggers[1]!.click();
    });
    expect(dom.container.querySelector("[data-popup-open]")).toBeNull();

    // Confirm single modal
    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#modal-date")!.click();
    });
    const modalPopup = document.body.querySelector(".m3e-modal-date-picker")!;
    expect(modalPopup).not.toBeNull();
    const confirmBtn = Array.from(
      modalPopup.querySelectorAll<HTMLButtonElement>("button.m3e-button"),
    ).find((b) => b.textContent === zhCNMessages["datePicker.confirm"]);
    act(() => {
      confirmBtn?.click();
    });
    expect(modalConfirmedDate).toBe("2026-06-15");
  });

  it("switches modal range DatePickerField to text input and commits on confirm", () => {
    const onRangeCommit = vi.fn();

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <DatePickerField
            id="open-date-dlg"
            modal
            mode="range"
            defaultValue={{ start: "2026-11-10", end: "2026-11-16" }}
            onValueChange={onRangeCommit}
          />
        </M3EProvider>,
      );
    });

    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#open-date-dlg")!.click();
    });
    const dateModal = document.body.querySelector<HTMLElement>(".m3e-modal-date-picker")!;
    expect(dateModal).not.toBeNull();
    act(() => {
      dateModal.querySelector<HTMLButtonElement>(".m3e-date-picker__nav-btn")!.click();
    });
    expect(dateModal.querySelectorAll<HTMLInputElement>("input").length).toBe(2);
    const dateActionBtns = dateModal.querySelectorAll<HTMLButtonElement>(
      ".m3e-modal-date-picker__actions button",
    );
    act(() => {
      dateActionBtns[1]!.click();
    });
    expect(onRangeCommit).toHaveBeenCalledWith({
      start: "2026-11-10",
      end: "2026-11-16",
    });
  });
});
