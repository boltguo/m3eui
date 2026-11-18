import { act } from "react";
import { describe, expect, it } from "vitest";
import { setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Tooltip } from "./Tooltip.js";

describe("Tooltip", () => {
  const dom = setupDomTest();

  it("keeps rich Tooltip trigger enabled when tooltip itself is disabled", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Tooltip
            subhead="Rich info"
            content="Details"
            action={<button type="button" id="rt-action">Learn more</button>}
          >
            <button type="button" id="rt-trigger">Inspect</button>
          </Tooltip>
          <Tooltip
            disabled
            subhead="Suppressed"
            content="Hidden"
            action={<button type="button">Action</button>}
          >
            <button type="button" id="rt-disabled-trigger">Still clickable</button>
          </Tooltip>
        </M3EProvider>,
      );
    });

    const rtDisabledTrigger = dom.container.querySelector<HTMLButtonElement>(
      "#rt-disabled-trigger",
    )!;
    expect(rtDisabledTrigger.disabled).toBe(false);
  });
});
