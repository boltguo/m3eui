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

  it("forwards refs to RadioGroup and Radio root elements", () => {
    let groupEl: HTMLDivElement | null = null;
    let labeledRadioEl: HTMLElement | null = null;
    let bareRadioEl: HTMLElement | null = null;

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <RadioGroup
            ref={(el) => {
              groupEl = el;
            }}
            defaultValue="a"
            aria-label="Choices"
          >
            <Radio
              ref={(el) => {
                labeledRadioEl = el;
              }}
              value="a"
              label="Option A"
            />
            <Radio
              ref={(el) => {
                bareRadioEl = el;
              }}
              value="b"
              aria-label="Option B"
            />
          </RadioGroup>
        </PausedWrapper>,
      );
    });

    expect(groupEl).toBeInstanceOf(HTMLDivElement);
    expect(labeledRadioEl).toBeInstanceOf(HTMLLabelElement);
    expect(bareRadioEl).toBeInstanceOf(HTMLElement);
    expect(bareRadioEl!.getAttribute("role")).toBe("radio");
  });
});
