import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { zhCNMessages } from "../../i18n/index.js";
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
});
