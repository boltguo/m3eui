import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { ButtonGroup } from "./ButtonGroup.js";

describe("ButtonGroup", () => {
  const dom = setupDomTest();

  it("mirrors ConnectedButtonGroup corner tuples horizontally in RTL", () => {
    const items = [
      { value: "day", label: "D" },
      { value: "week", label: "W" },
      { value: "month", label: "M" },
    ];

    act(() => {
      dom.root.render(
        <div>
          <PausedWrapper direction="ltr">
            <div data-testid="ltr">
              <ButtonGroup variant="connected" items={items} defaultValue={["week"]} />
            </div>
          </PausedWrapper>
          <PausedWrapper direction="rtl">
            <div data-testid="rtl">
              <ButtonGroup variant="connected" items={items} defaultValue={["week"]} />
            </div>
          </PausedWrapper>
        </div>,
      );
    });

    const ltrButtons = dom.container.querySelectorAll<HTMLElement>(
      '[data-testid="ltr"] .m3e-button-group__item',
    );
    const rtlButtons = dom.container.querySelectorAll<HTMLElement>(
      '[data-testid="rtl"] .m3e-button-group__item',
    );

    expect(ltrButtons[0]!.style.borderRadius).toBe("20px 8px 8px 20px");
    expect(rtlButtons[0]!.style.borderRadius).toBe("8px 20px 20px 8px");
    expect(ltrButtons[1]!.style.borderRadius).toBe("20px");
    expect(rtlButtons[1]!.style.borderRadius).toBe("20px");
  });

  it("renders standard ButtonGroup items and overflow trigger cleanly", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <ButtonGroup
            variant="standard"
            items={[
              { value: "a", label: "Reply" },
              { value: "b", label: "Forward" },
              { value: "c", label: "Archive" },
            ]}
          />
          <ButtonGroup
            maxVisibleItems={2}
            items={[
              { value: "one", label: "One" },
              { value: "two", label: "Two" },
              { value: "three", label: "Three" },
              { value: "four", label: "Four" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const groups = dom.container.querySelectorAll(".m3e-button-group");
    expect(groups[0]!.querySelectorAll(".m3e-button-group__item").length).toBe(3);

    const visibleItems = groups[1]!.querySelectorAll(
      ".m3e-button-group__item:not(.m3e-button-group__overflow-trigger)",
    );
    expect(visibleItems.length).toBe(2);
    const overflowBtn = groups[1]!.querySelector<HTMLButtonElement>(
      'button.m3e-button-group__overflow-trigger[aria-label="More actions"]',
    );
    expect(overflowBtn).not.toBeNull();
  });

  it("supports roving keyboard focus in single selection toggle group", async () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <ButtonGroup
            selectionMode="single"
            defaultValue={["day"]}
            items={[
              { value: "day", label: "Day" },
              { value: "week", label: "Week" },
              { value: "month", label: "Month" },
            ]}
          />
        </M3EProvider>,
      );
    });

    const toggleGroup = dom.container.querySelector('.m3e-button-group[role="group"]')!;
    const toggles = toggleGroup.querySelectorAll<HTMLButtonElement>("button");
    expect(toggles[0]?.getAttribute("aria-pressed")).toBe("true");
    expect(toggles[0]?.tabIndex).toBe(0);
    expect(toggles[1]?.tabIndex).toBe(-1);

    await act(async () => {
      toggles[0]!.focus();
    });
    await act(async () => {
      toggles[0]!.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }),
      );
    });
    expect(toggles[0]?.tabIndex).toBe(-1);
    expect(toggles[1]?.tabIndex).toBe(0);
  });
});
