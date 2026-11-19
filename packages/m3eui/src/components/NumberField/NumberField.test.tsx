import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { zhCNMessages } from "../../i18n/index.js";
import { Form } from "../Form/Form.js";
import { NumberField } from "./NumberField.js";

describe("NumberField", () => {
  const dom = setupDomTest();

  it("handles NumberField increment/decrement steppers with localized accessible names", () => {
    let currentNum: number | null = 10;
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <form id="num-form">
            <NumberField
              label="数量"
              defaultValue={10}
              min={0}
              max={20}
              onValueChange={(v) => {
                currentNum = v;
              }}
            />
          </form>
        </PausedWrapper>,
      );
    });

    const incBtn = dom.container.querySelector<HTMLButtonElement>(
      `button[aria-label="${zhCNMessages["numberField.increment"]}"]`,
    );
    const decBtn = dom.container.querySelector<HTMLButtonElement>(
      `button[aria-label="${zhCNMessages["numberField.decrement"]}"]`,
    );
    expect(incBtn).not.toBeNull();
    expect(decBtn).not.toBeNull();
    expect(currentNum).toBe(10);
  });

  it("mounts ripple on steppers, sets data-pressed on pointerdown, and sets data-invalid when invalid", () => {
    vi.useFakeTimers();
    try {
      act(() => {
        dom.root.render(
          <PausedWrapper locale="en-US">
            <NumberField label="Qty" defaultValue={5} invalid />
          </PausedWrapper>,
        );
      });

      const group = dom.container.querySelector(".m3e-number-field__group")!;
      expect(group.hasAttribute("data-invalid")).toBe(true);

      const stepBtns = dom.container.querySelectorAll<HTMLButtonElement>(
        ".m3e-number-field__step",
      );
      expect(stepBtns.length).toBe(2);
      expect(stepBtns[0]!.querySelector(".m3e-ripple")).not.toBeNull();
      expect(stepBtns[1]!.querySelector(".m3e-ripple")).not.toBeNull();

      act(() => {
        stepBtns[1]!.dispatchEvent(
          new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
        );
      });
      expect(stepBtns[1]!.hasAttribute("data-pressed")).toBe(true);

      act(() => {
        stepBtns[1]!.dispatchEvent(
          new PointerEvent("pointerup", { bubbles: true, button: 0 }),
        );
        vi.advanceTimersByTime(150);
      });
      expect(stepBtns[1]!.hasAttribute("data-pressed")).toBe(false);
    } finally {
      vi.useRealTimers();
    }
  });

  it("propagates Base UI Form errors into data-invalid and .m3e-field__error", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Form errors={{ qty: "Server limit exceeded" }}>
            <NumberField name="qty" label="Qty" defaultValue={5} />
          </Form>
        </PausedWrapper>,
      );
    });

    const group = dom.container.querySelector(".m3e-number-field__group")!;
    expect(group.hasAttribute("data-invalid")).toBe(true);
    expect(dom.container.querySelector(".m3e-field__error")?.textContent).toContain(
      "Server limit exceeded",
    );
  });
});
