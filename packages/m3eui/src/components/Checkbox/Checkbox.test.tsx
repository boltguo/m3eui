import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Checkbox, CheckboxGroup } from "./Checkbox.js";

describe("Checkbox & CheckboxGroup", () => {
  const dom = setupDomTest();

  it("forwards ref, renders CheckboxGroup, and restores defaultChecked on form reset", async () => {
    const checkRef = React.createRef<HTMLElement>();

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <CheckboxGroup defaultValue={["x"]} aria-label="Permissions">
            <Checkbox ref={checkRef} value="x" label="Read" />
          </CheckboxGroup>
          <form id="reset-form">
            <Checkbox name="cb" defaultChecked aria-label="Check" />
          </form>
        </PausedWrapper>,
      );
    });

    expect(checkRef.current).toBeInstanceOf(HTMLElement);

    const form = dom.container.querySelector<HTMLFormElement>("#reset-form")!;
    const cb = form.querySelector<HTMLElement>('[role="checkbox"]')!;
    act(() => {
      cb.click();
    });
    expect(cb.getAttribute("aria-checked")).toBe("false");
    await act(async () => {
      form.reset();
    });
    expect(form.querySelector('[role="checkbox"]')!.getAttribute("aria-checked")).toBe("true");
  });
});
