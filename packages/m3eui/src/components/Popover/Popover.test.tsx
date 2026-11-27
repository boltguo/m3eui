import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Popover, PopoverClose } from "./Popover.js";

describe("Popover", () => {
  const dom = setupDomTest();

  it("opens on trigger click with title/description/body and closes via PopoverClose", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper>
          <Popover
            trigger={<button type="button">Open popover</button>}
            title="Details"
            description="Quick summary"
          >
            <p>Popover body content</p>
            <PopoverClose render={<button type="button">Close</button>} />
          </Popover>
        </PausedWrapper>,
      );
    });

    const trigger = dom.container.querySelector<HTMLButtonElement>("button");
    expect(trigger?.textContent).toBe("Open popover");
    expect(document.body.querySelector(".m3e-popover")).toBeNull();

    act(() => {
      trigger?.click();
    });

    const popup = document.body.querySelector<HTMLElement>(".m3e-popover");
    expect(popup).not.toBeNull();
    expect(popup?.hasAttribute("data-open")).toBe(true);
    expect(popup?.querySelector(".m3e-popover__title")?.textContent).toBe("Details");
    expect(popup?.querySelector(".m3e-popover__description")?.textContent).toBe(
      "Quick summary",
    );
    expect(popup?.querySelector(".m3e-popover__body")?.textContent).toContain(
      "Popover body content",
    );

    const closeBtn = Array.from(popup?.querySelectorAll("button") ?? []).find(
      (btn) => btn.textContent === "Close",
    );
    expect(closeBtn).toBeDefined();

    act(() => {
      closeBtn?.click();
    });

    expect(popup?.hasAttribute("data-closed")).toBe(true);
    expect(trigger?.getAttribute("aria-expanded")).toBe("false");
  });

  it("supports controlled open state and aria-label when title is omitted", () => {
    const onOpenChange = vi.fn();

    const renderControlled = (open: boolean) => {
      act(() => {
        dom.root.render(
          <PausedWrapper>
            <Popover
              open={open}
              onOpenChange={onOpenChange}
              aria-label="Theme preset picker"
              trigger={<button type="button">Anchor</button>}
            >
              <span>Controlled body</span>
            </Popover>
          </PausedWrapper>,
        );
      });
    };

    renderControlled(false);
    expect(document.body.querySelector(".m3e-popover")).toBeNull();

    act(() => {
      dom.container.querySelector<HTMLButtonElement>("button")?.click();
    });
    expect(onOpenChange).toHaveBeenCalledWith(true);

    renderControlled(true);
    const popup = document.body.querySelector<HTMLElement>(".m3e-popover");
    expect(popup?.getAttribute("aria-label")).toBe("Theme preset picker");
    expect(popup?.textContent).toContain("Controlled body");
  });
});
