import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { DragHandle } from "./DragHandle.js";

describe("DragHandle", () => {
  const dom = setupDomTest();

  it("handles RTL keyboard inversion and cleans up active/dragging on pointercancel", () => {
    const onSplitChange = vi.fn();

    act(() => {
      dom.root.render(
        <M3EProvider initialDirection="rtl">
          <DragHandle
            defaultValue={50}
            min={20}
            max={80}
            step={5}
            onValueChange={onSplitChange}
          />
          <DragHandle orientation="horizontal" defaultValue={40} />
        </M3EProvider>,
      );
    });

    const separators = dom.container.querySelectorAll<HTMLElement>('[role="separator"]');
    const vHandle = separators[0]!;
    expect(vHandle.getAttribute("aria-orientation")).toBe("vertical");
    expect(vHandle.getAttribute("aria-valuenow")).toBe("50");
    act(() => {
      vHandle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }),
      );
    });
    expect(onSplitChange).toHaveBeenLastCalledWith(55);
    act(() => {
      vHandle.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Home", bubbles: true }),
      );
    });
    expect(onSplitChange).toHaveBeenLastCalledWith(20);

    act(() => {
      vHandle.dispatchEvent(
        new PointerEvent("pointerdown", {
          button: 0,
          pointerId: 7,
          clientX: 200,
          clientY: 100,
          bubbles: true,
        }),
      );
      vHandle.dispatchEvent(
        new PointerEvent("pointermove", {
          pointerId: 7,
          clientX: 160,
          clientY: 100,
          bubbles: true,
        }),
      );
    });
    expect(vHandle.hasAttribute("data-active")).toBe(true);
    expect(vHandle.hasAttribute("data-dragging")).toBe(true);
    act(() => {
      vHandle.dispatchEvent(
        new PointerEvent("pointercancel", { pointerId: 7, bubbles: true }),
      );
    });
    expect(vHandle.hasAttribute("data-active")).toBe(false);
    expect(vHandle.hasAttribute("data-dragging")).toBe(false);
  });
});
