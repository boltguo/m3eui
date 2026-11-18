import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { formatLocalizedPercent } from "../../i18n/index.js";
import {
  CircularProgressIndicator,
  LinearProgressIndicator,
} from "./ProgressIndicator.js";

describe("ProgressIndicator", () => {
  const dom = setupDomTest();

  it("renders flat and wavy progress indicators with accessible roles and localized percent labels", () => {
    act(() => {
      dom.root.render(
        <div>
          <div data-testid="en">
            <PausedWrapper locale="en-US">
              <LinearProgressIndicator value={64} />
              <LinearProgressIndicator wavy value={0.5} />
              <CircularProgressIndicator value={45} />
              <CircularProgressIndicator wavy value={0.7} />
            </PausedWrapper>
          </div>
          <div data-testid="ar">
            <M3EProvider locale="ar_sa" initialDirection="auto" syncDocumentRoot={false}>
              <CircularProgressIndicator value={45} showValueLabel />
              <LinearProgressIndicator id="indet-linear" />
              <CircularProgressIndicator id="indet-circular" />
            </M3EProvider>
          </div>
        </div>,
      );
    });

    expect(
      dom.container.querySelectorAll('[data-testid="en"] [role="progressbar"]').length,
    ).toBeGreaterThanOrEqual(4);

    const expectedPct = formatLocalizedPercent("ar-SA", 0.45);
    expect(
      dom.container
        .querySelector('[data-testid="ar"] .m3e-circular-progress')
        ?.getAttribute("aria-valuetext"),
    ).toBe(expectedPct);

    const indetLinear = dom.container.querySelector(
      '[data-testid="ar"] .m3e-linear-progress',
    )!;
    const indetCircular = dom.container.querySelectorAll(
      '[data-testid="ar"] .m3e-circular-progress',
    )[1]!;
    expect(indetLinear.hasAttribute("aria-valuenow")).toBe(false);
    expect(indetCircular.hasAttribute("aria-valuenow")).toBe(false);
  });
});
