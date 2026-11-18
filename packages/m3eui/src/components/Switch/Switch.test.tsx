import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Switch } from "./Switch.js";

describe("Switch", () => {
  const dom = setupDomTest();

  it("forwards ref, restores defaultChecked on form reset, and mirrors thumb offset in RTL", async () => {
    const switchRef = React.createRef<HTMLElement>();

    act(() => {
      dom.root.render(
        <div>
          <PausedWrapper direction="ltr">
            <div data-testid="ltr">
              <form id="sw-reset-form">
                <Switch ref={switchRef} name="sw" defaultChecked aria-label="Switch" />
              </form>
              <Switch aria-label="LTR Switch" defaultChecked={false} />
            </div>
          </PausedWrapper>
          <PausedWrapper direction="rtl">
            <div data-testid="rtl">
              <Switch aria-label="RTL Switch" defaultChecked={false} />
            </div>
          </PausedWrapper>
        </div>,
      );
    });

    expect(switchRef.current).toBeInstanceOf(HTMLElement);

    const form = dom.container.querySelector<HTMLFormElement>("#sw-reset-form")!;
    const sw = form.querySelector<HTMLElement>('[role="switch"]')!;
    act(() => {
      sw.click();
    });
    expect(sw.getAttribute("aria-checked")).toBe("false");
    await act(async () => {
      form.reset();
    });
    expect(form.querySelector('[role="switch"]')!.getAttribute("aria-checked")).toBe("true");

    const ltrThumb = dom.container.querySelectorAll<HTMLElement>(
      '[data-testid="ltr"] .m3e-switch__thumb',
    )[1]!;
    const rtlThumb = dom.container.querySelector<HTMLElement>(
      '[data-testid="rtl"] .m3e-switch__thumb',
    )!;
    expect(ltrThumb.style.translate).toBe("8.00px -50%");
    expect(rtlThumb.style.translate).toBe("-8.00px -50%");
  });
});
