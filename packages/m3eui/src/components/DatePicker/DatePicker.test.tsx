import { useState } from "react";
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

  it("restores DatePicker & DatePickerField on form.reset(), syncs controlled month transitions without breaking browsing, renders empty/partial range safely, supports year listbox keyboard nav, and names non-modal dialog", async () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false} locale="en-US">
          <form id="dp-reset-form">
            <DatePicker defaultValue="2026-11-10" />
            <DatePickerField name="releaseDate" label="Release Date" defaultValue="2026-11-10" />
          </form>
        </M3EProvider>,
      );
    });

    const form = dom.container.querySelector<HTMLFormElement>("#dp-reset-form")!;
    const dayButtons = form.querySelectorAll<HTMLButtonElement>(".m3e-date-picker__day");
    act(() => {
      dayButtons[19]!.click(); // Nov 20
    });
    expect(form.querySelector(".m3e-date-picker__headline")?.textContent).toContain("Nov 20");
    await act(async () => {
      form.reset();
    });
    expect(form.querySelector(".m3e-date-picker__headline")?.textContent).toContain("Nov 10");
    expect(form.querySelector<HTMLInputElement>('input[name="releaseDate"]')?.value).toBe("2026-11-10");

    // Controlled value sync vs manual month browsing
    function ControlledMonthHarness() {
      const [val, setVal] = useState("2026-11-10");
      const [tick, setTick] = useState(0);
      return (
        <M3EProvider syncDocumentRoot={false} locale="en-US">
          <span data-testid="tick">{tick}</span>
          <button type="button" id="rerender-same" onClick={() => setTick((t) => t + 1)}>
            Rerender
          </button>
          <button type="button" id="jump-april" onClick={() => setVal("2027-04-15")}>
            Jump
          </button>
          <DatePicker value={val} onValueChange={setVal} />
        </M3EProvider>
      );
    }

    act(() => {
      dom.root.render(<ControlledMonthHarness />);
    });
    const nextMonthBtn = dom.container.querySelector<HTMLButtonElement>(
      'button[aria-label="Next month"]',
    )!;
    act(() => {
      nextMonthBtn.click();
    });
    expect(dom.container.querySelector(".m3e-date-picker__year-toggle")?.textContent).toContain(
      "December",
    );
    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#rerender-same")!.click();
    });
    expect(dom.container.querySelector(".m3e-date-picker__year-toggle")?.textContent).toContain(
      "December",
    );
    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#jump-april")!.click();
    });
    expect(dom.container.querySelector(".m3e-date-picker__year-toggle")?.textContent).toContain(
      "April 2027",
    );

    // Year listbox roving tabindex, ArrowRight / ArrowDown (+3), Escape focus return
    const yearToggle = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-date-picker__year-toggle",
    )!;
    act(() => {
      yearToggle.click();
    });
    const listbox = dom.container.querySelector<HTMLElement>('[role="listbox"]')!;
    expect(listbox.querySelectorAll('[role="option"][tabindex="0"]').length).toBe(1);
    const initialYrBtn = listbox.querySelector<HTMLButtonElement>(
      '[role="option"][tabindex="0"]',
    )!;
    const initialYr = Number(initialYrBtn.textContent);
    act(() => {
      initialYrBtn.focus();
      listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    });
    expect(document.activeElement?.textContent).toBe(String(initialYr + 1));
    act(() => {
      listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
    });
    expect(document.activeElement?.textContent).toBe(String(initialYr + 4));
    await act(async () => {
      listbox.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    });
    expect(dom.container.querySelector('[role="listbox"]')).toBeNull();
    expect(document.activeElement).toBe(yearToggle);

    // Empty range & partial range + non-modal dialog accessible name
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false} locale="en-US">
          <DatePicker mode="range" defaultValue={{ start: "", end: "" }} />
          <DatePicker mode="range" defaultValue={{ start: "2026-11-10", end: "" }} />
          <DatePickerField
            id="empty-range-field"
            mode="range"
            name="emptyRange"
            label="Trip Dates"
            defaultValue={{ start: "", end: "" }}
          />
        </M3EProvider>,
      );
    });

    const headlines = dom.container.querySelectorAll(".m3e-date-range-picker__headline");
    expect(headlines[0]?.textContent).toBe("—");
    expect(headlines[1]?.textContent).toContain("…");
    expect(dom.container.querySelector<HTMLInputElement>('input[name="emptyRange"]')?.value).toBe("");
    const rangeTrigger = dom.container.querySelector<HTMLButtonElement>("#empty-range-field")!;
    expect(rangeTrigger.querySelector(".m3e-select__value")?.textContent).toBe("");

    act(() => {
      rangeTrigger.click();
    });
    const nonModalDialog = document.body.querySelector<HTMLElement>('.m3e-date-picker-field__popup[role="dialog"]');
    expect(nonModalDialog?.getAttribute("aria-label")).toBe("Trip Dates");
  });
});
