import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Button } from "../Button/Button.js";
import { DropdownMenu } from "./Menu.js";

describe("Menu", () => {
  const dom = setupDomTest();

  it("renders vibrant segmented groups vs standard single surface and Kbd shortcut", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <PausedWrapper locale="en-US">
            <DropdownMenu
              open
              theme="vibrant"
              variant="segmented"
              trigger={<Button id="menu-seg-btn">Menu</Button>}
              items={[
                { id: "a1", label: "Cut", shortcut: "⌘X" },
                { id: "a2", label: "Copy" },
                { id: "a3", label: "Delete", danger: true, separatorBefore: true },
              ]}
            />
            <DropdownMenu
              open
              variant="standard"
              trigger={<Button id="menu-std-btn">Standard Menu</Button>}
              items={[
                { id: "b1", label: "One" },
                { id: "b2", label: "Two", separatorBefore: true },
              ]}
            />
          </PausedWrapper>
        </M3EProvider>,
      );
    });

    const vibrantMenu = document.body.querySelector<HTMLElement>(
      '.m3e-segmented-menu[data-theme="vibrant"]',
    )!;
    expect(vibrantMenu).not.toBeNull();
    expect(
      vibrantMenu.querySelectorAll(".m3e-segmented-menu__group").length,
    ).toBe(2);
    expect(vibrantMenu.querySelectorAll(".m3e-kbd").length).toBe(1);

    const stdMenu = document.body.querySelector<HTMLElement>(
      '.m3e-segmented-menu[data-variant="standard"]',
    )!;
    expect(stdMenu).not.toBeNull();
    expect(stdMenu.querySelectorAll(".m3e-segmented-menu__group").length).toBe(0);
    expect(stdMenu.querySelectorAll(".m3e-menu__separator").length).toBe(1);
  });
});
