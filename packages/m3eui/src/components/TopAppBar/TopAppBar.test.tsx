import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { TopAppBar } from "./TopAppBar.js";

describe("TopAppBar", () => {
  const dom = setupDomTest();

  it("renders large-flexible TopAppBar with localized actions region and overflows excess actionItems into More actions menu", () => {
    const onOverflowClick = vi.fn();
    act(() => {
      dom.root.render(
        <div>
          <PausedWrapper locale="en-US">
            <TopAppBar
              variant="large-flexible"
              title="Expressive Header"
              subtitle="Collapsed 40%"
              collapsedFraction={0.4}
              actions={<button type="button">Act</button>}
            />
          </PausedWrapper>
          <M3EProvider syncDocumentRoot={false}>
            <TopAppBar
              title="Inbox"
              maxVisibleActions={3}
              actionItems={[
                { id: "search", label: "Search", icon: <span>S</span> },
                { id: "archive", label: "Archive", icon: <span>A</span> },
                { id: "pin", label: "Pin", icon: <span>P</span> },
                {
                  id: "settings",
                  label: "Settings",
                  icon: <span>G</span>,
                  onClick: onOverflowClick,
                },
              ]}
            />
          </M3EProvider>
        </div>,
      );
    });

    expect(dom.container.querySelector(".m3e-top-app-bar")?.textContent).toContain(
      "Expressive Header",
    );
    expect(
      dom.container.querySelector('[aria-label="App bar actions"]'),
    ).not.toBeNull();

    const appBarRow = dom.container.querySelector<HTMLElement>(".m3e-app-bar-row")!;
    expect(appBarRow).not.toBeNull();
    const appBarButtons = appBarRow.querySelectorAll<HTMLButtonElement>(
      "button.m3e-icon-button",
    );
    expect(appBarButtons.length).toBe(3);
    expect(appBarButtons[2]?.getAttribute("aria-label")).toBe("More actions");
  });
});
