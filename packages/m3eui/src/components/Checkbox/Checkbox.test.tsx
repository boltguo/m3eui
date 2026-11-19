import * as React from "react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
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

  it("draws checkmark stroke, morphs to indeterminate bar, and centers unbounded 40px halo ripple", () => {
    vi.useFakeTimers();

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Checkbox aria-label="Unchecked" />
          <Checkbox checked aria-label="Checked" />
          <Checkbox indeterminate aria-label="Indeterminate" />
        </PausedWrapper>,
      );
    });

    const paths = dom.container.querySelectorAll<SVGPathElement>(
      ".m3e-checkbox__indicator path",
    );
    expect(paths.length).toBe(3);

    expect(paths[0]!.getAttribute("stroke-dashoffset")).toBe("1.000");
    expect(paths[0]!.style.opacity).toBe("0");
    expect(paths[1]!.getAttribute("stroke-dashoffset")).toBe("0.000");
    expect(paths[1]!.getAttribute("d")).toBe("M 4.50 12.50 L 9.50 17.50 L 19.50 6.50");
    expect(paths[2]!.getAttribute("stroke-dashoffset")).toBe("0.000");
    expect(paths[2]!.getAttribute("d")).toBe("M 5.00 12.00 L 12.00 12.00 L 19.00 12.00");

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Checkbox aria-label="Halo checkbox" />
        </M3EProvider>,
      );
    });

    const cb = dom.container.querySelector<HTMLElement>('[role="checkbox"]')!;
    const halo = cb.querySelector<HTMLSpanElement>(".m3e-checkbox__halo")!;
    vi.spyOn(halo, "getBoundingClientRect").mockReturnValue({
      width: 40,
      height: 40,
      left: 100,
      top: 200,
      right: 140,
      bottom: 240,
      x: 100,
      y: 200,
      toJSON: () => ({}),
    });

    act(() => {
      cb.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          clientX: 106,
          clientY: 204,
        }),
      );
    });

    const solidEndRadius = 20;
    const endRadius = solidEndRadius;
    const initScale = ((40 * 0.15) / solidEndRadius).toFixed(4);
    const wave = halo.querySelector<HTMLSpanElement>(".m3e-ripple__wave")!;
    expect(wave).not.toBeNull();
    expect(wave.style.transform).toBe(
      `translate3d(${(20 - endRadius).toFixed(2)}px, ${(20 - endRadius).toFixed(2)}px, 0) scale(${initScale})`,
    );

    act(() => {
      vi.advanceTimersByTime(460);
      cb.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      vi.advanceTimersByTime(250);
    });
    expect(halo.querySelector(".m3e-ripple__wave")).toBeNull();
  });
});
