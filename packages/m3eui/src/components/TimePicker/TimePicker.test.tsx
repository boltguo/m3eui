import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { enUSMessages } from "../../i18n/index.js";
import { TimePicker, TimePickerField } from "./TimePicker.js";

describe("TimePicker & TimePickerField", () => {
  const dom = setupDomTest();

  it("localizes 12h AM/PM periods, switches dial vs keyboard mode, and applies CLDR hourCycle", () => {
    act(() => {
      dom.root.render(
        <div>
          <div data-testid="ja">
            <PausedWrapper locale="ja-JP">
              <TimePicker defaultValue="09:15" use24Hour={false} />
            </PausedWrapper>
          </div>
          <div data-testid="en">
            <PausedWrapper locale="en-US">
              <TimePicker defaultValue="08:45" use24Hour />
            </PausedWrapper>
          </div>
          <div data-testid="ar-scope">
            <M3EProvider locale="ar_sa" initialDirection="auto" syncDocumentRoot={false}>
              <TimePicker defaultValue="14:30" />
            </M3EProvider>
          </div>
          <div data-testid="zh-scope">
            <M3EProvider locale="zh_cn" initialDirection="auto" syncDocumentRoot={false}>
              <TimePicker defaultValue="14:30" />
            </M3EProvider>
          </div>
        </div>,
      );
    });

    const jaAmBtn = dom.container.querySelector(
      '[data-testid="ja"] .m3e-time-picker__period button',
    )?.textContent;
    expect(jaAmBtn).toBe("午前");

    const enBox = dom.container.querySelector('[data-testid="en"]')!;
    const modeBtn = enBox.querySelector<HTMLButtonElement>(".m3e-time-picker__mode-btn");
    expect(modeBtn?.getAttribute("aria-label")).toBe(
      enUSMessages["timePicker.switchToKeyboard"],
    );
    const dialTexts = enBox.querySelector(".m3e-time-picker")?.textContent ?? "";
    expect(dialTexts).toContain("00");
    expect(dialTexts).toContain("23");

    act(() => {
      modeBtn!.click();
    });
    expect(modeBtn?.getAttribute("aria-label")).toBe(
      enUSMessages["timePicker.switchToDial"],
    );
    expect(enBox.querySelector('input[aria-label="Hour"]')).not.toBeNull();

    const arScope = dom.container.querySelector('[data-testid="ar-scope"] .m3e-scope');
    const zhScope = dom.container.querySelector('[data-testid="zh-scope"] .m3e-scope');
    expect(
      arScope?.querySelectorAll('.m3e-time-picker__dial button.m3e-time-picker__dial-num').length,
    ).toBe(12);
    expect(
      arScope?.querySelector(".m3e-time-picker__digits-ltr")?.getAttribute("dir"),
    ).toBe("ltr");
    expect(
      zhScope?.querySelectorAll('.m3e-time-picker__dial button.m3e-time-picker__dial-num').length,
    ).toBe(24);
  });

  it("supports keyboard dial navigation, TimePickerField empty/readOnly state, and modal draft cancellation", () => {
    let currentTime = "09:30";
    const onTimeCommit = vi.fn();

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <TimePicker
            defaultValue="09:30"
            use24Hour
            onValueChange={(v) => {
              currentTime = v;
            }}
          />
          <TimePickerField name="t" label="Time" defaultValue="" />
          <TimePickerField
            id="ro-time"
            readOnly
            label="Launch Time"
            name="launchTime"
            defaultValue="09:30"
          />
          <TimePickerField
            id="open-time-dlg"
            modal
            defaultValue="09:30"
            onValueChange={onTimeCommit}
          />
        </M3EProvider>,
      );
    });

    expect(dom.container.querySelector<HTMLInputElement>('input[name="t"]')!.value).toBe("");
    expect(
      dom.container.querySelector<HTMLInputElement>('input[name="launchTime"]')?.value,
    ).toBe("09:30");

    expect(
      dom.container.querySelectorAll<HTMLFieldSetElement>(
        ".m3e-select__shell > fieldset.m3e-field__outline[data-floating]",
      ).length,
    ).toBeGreaterThanOrEqual(1);

    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#ro-time")?.click();
    });
    expect(dom.container.querySelector("[data-popup-open]")).toBeNull();

    const dial = dom.container.querySelector<HTMLElement>(".m3e-time-picker__dial")!;
    expect(dial.getAttribute("tabindex")).toBe("0");

    act(() => {
      dial.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }));
    });
    expect(currentTime).toBe("10:30");

    act(() => {
      dial.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    act(() => {
      dial.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", shiftKey: true, bubbles: true }),
      );
    });
    expect(currentTime).toBe("10:35");

    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#open-time-dlg")!.click();
    });
    const timeModal = document.body.querySelector<HTMLElement>(
      ".m3e-time-picker-dialog",
    )!;
    expect(timeModal).not.toBeNull();
    const modeToggleBtn = timeModal.querySelector<HTMLButtonElement>(
      ".m3e-time-picker__mode-btn",
    )!;
    expect(modeToggleBtn.getAttribute("aria-label")).toBe(
      "Switch to keyboard time input",
    );
    act(() => {
      modeToggleBtn.click();
    });
    expect(modeToggleBtn.getAttribute("aria-label")).toBe(
      "Switch to clock dial picker",
    );
    const timeActionBtns = timeModal.querySelectorAll<HTMLButtonElement>(
      ".m3e-time-picker-dialog__actions button",
    );
    act(() => {
      timeActionBtns[0]!.click();
    });
    expect(onTimeCommit).not.toHaveBeenCalled();
  });
});
