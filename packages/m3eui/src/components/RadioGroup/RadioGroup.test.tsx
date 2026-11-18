import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Radio, RadioGroup } from "./RadioGroup.js";

describe("RadioGroup", () => {
  const dom = setupDomTest();

  it("renders RadioGroup options with accessible name and default selection", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="ja-JP">
          <RadioGroup defaultValue="a" aria-label="モード">
            <Radio value="a" label="A" />
            <Radio value="b" label="B" />
          </RadioGroup>
        </PausedWrapper>,
      );
    });

    const radios = dom.container.querySelectorAll('[role="radio"]');
    expect(radios.length).toBe(2);
    expect(radios[0]?.getAttribute("aria-checked")).toBe("true");
    expect(radios[1]?.getAttribute("aria-checked")).toBe("false");
  });
});
