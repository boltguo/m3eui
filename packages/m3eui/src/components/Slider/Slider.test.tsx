import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Slider } from "./Slider.js";

describe("Slider", () => {
  const dom = setupDomTest();

  it("clamps out-of-range defaultValue and restores active handle width on global window pointerup", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper>
          <Slider name="s" aria-label="Level" defaultValue={80} max={50} />
          <Slider defaultValue={50} aria-label="音量滑块" />
        </PausedWrapper>,
      );
    });

    expect(dom.container.querySelector<HTMLInputElement>('input[name="s"]')!.value).toBe("50");
    expect(
      dom.container.querySelector<HTMLInputElement>('.m3e-slider input[type="range"]')?.value,
    ).toBe("50");

    const thumbs = dom.container.querySelectorAll<HTMLElement>(".m3e-slider__thumb");
    const handleBars = dom.container.querySelectorAll<HTMLElement>(
      ".m3e-slider__handle-bar",
    );
    const thumb = thumbs[1]!;
    const handleBar = handleBars[1]!;
    expect(thumb.hasAttribute("data-active")).toBe(false);
    expect(handleBar.style.width).toBe("4px");

    act(() => {
      thumb.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true, button: 0 }),
      );
    });
    expect(thumb.hasAttribute("data-active")).toBe(true);
    expect(handleBar.style.width).toBe("2px");

    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    });
    expect(thumb.hasAttribute("data-active")).toBe(false);
    expect(handleBar.style.width).toBe("4px");
  });

  it("renders RTL cap geometry, logical ticks, vertical icons, and centered stop dots", () => {
    act(() => {
      dom.root.render(
        <div>
          <M3EProvider locale="ar_sa" initialDirection="auto" syncDocumentRoot={false}>
            <div data-testid="ar-slider">
              <Slider defaultValue={40} step={20} showTicks aria-label="مستوى الصوت" />
            </div>
          </M3EProvider>
          <M3EProvider syncDocumentRoot={false}>
            <Slider
              id="slider-vert"
              orientation="vertical"
              defaultValue={40}
              aria-label="Gain"
              startIcon={<span id="s-icon">-</span>}
              endIcon={<span id="e-icon">+</span>}
            />
            <Slider
              id="slider-centered"
              centered
              min={-50}
              max={50}
              defaultValue={20}
              aria-label="Pan"
            />
          </M3EProvider>
        </div>,
      );
    });

    const arScope = dom.container.querySelector('[data-testid="ar-slider"]')!;
    const activeSeg = arScope.querySelector<HTMLElement>(".m3e-slider__segment--active");
    expect(activeSeg?.style.borderRadius).toBe("2px 8px 8px 2px");
    const firstTick = arScope.querySelector<HTMLElement>(".m3e-slider__tick");
    expect(firstTick?.style.insetInlineStart).toContain("calc(6px +");
    expect(firstTick?.style.left).toBe("");

    const vertSlider = dom.container.querySelector<HTMLElement>(
      '.m3e-slider[data-orientation="vertical"]',
    )!;
    expect(vertSlider).not.toBeNull();
    expect(vertSlider.querySelector("#s-icon")).not.toBeNull();
    expect(vertSlider.querySelector("#e-icon")).not.toBeNull();
    const vertHandleBar = vertSlider.querySelector<HTMLElement>(
      ".m3e-slider__handle-bar",
    )!;
    expect(vertHandleBar.style.width).toBe("44px");
    expect(vertHandleBar.style.height).toBe("4px");

    const centeredSlider = dom.container.querySelector<HTMLElement>(
      ".m3e-slider[data-centered]",
    )!;
    expect(centeredSlider).not.toBeNull();
    expect(
      centeredSlider.querySelectorAll(".m3e-slider__stop-dot").length,
    ).toBe(2);
  });
});
