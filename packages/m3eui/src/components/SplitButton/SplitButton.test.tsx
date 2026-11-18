import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { SplitButton } from "./SplitButton.js";

describe("SplitButton", () => {
  const dom = setupDomTest();

  it("renders localized menu trigger label, Kbd shortcut in open menu, and xl sizing", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <SplitButton
            menuItems={[{ id: "1", label: "Schedule" }]}
            onClick={() => {}}
          >
            Send
          </SplitButton>
          <SplitButton
            size="xl"
            open
            onClick={() => {}}
            menuItems={[
              { id: "deploy", label: "Deploy Now", shortcut: "⌘↵" },
            ]}
          >
            Publish
          </SplitButton>
        </PausedWrapper>,
      );
    });

    expect(
      dom.container.querySelector('button[aria-label="More options"]'),
    ).not.toBeNull();
    expect(
      document.body.querySelectorAll(".m3e-segmented-menu .m3e-kbd").length,
    ).toBe(1);

    const xlSplitButtons = dom.container.querySelectorAll<HTMLButtonElement>(
      ".m3e-split-button",
    )[1]!.querySelectorAll<HTMLButtonElement>("button");
    expect(xlSplitButtons[0]?.style.height).toBe("136px");
    expect(xlSplitButtons[1]?.getAttribute("aria-expanded")).toBe("true");
  });
});
