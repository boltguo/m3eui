import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Meter } from "./Meter.js";

describe("Meter", () => {
  const dom = setupDomTest();

  it("renders a labeled Meter with its current value", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Meter value={85} label="CPU" />
        </PausedWrapper>,
      );
    });

    const meter = dom.container.querySelector(".m3e-meter");
    expect(meter).not.toBeNull();
    expect(dom.container.textContent).toContain("CPU");
  });
});
