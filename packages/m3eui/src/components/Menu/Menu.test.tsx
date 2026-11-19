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

  it("keeps single-group menu container radius concentric after pointer hover and leave", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <PausedWrapper locale="en-US">
            <DropdownMenu
              open
              variant="segmented"
              trigger={<Button id="single-menu-btn">Actions</Button>}
              items={[
                { id: "s1", label: "Send immediately" },
                { id: "s2", label: "Schedule" },
              ]}
            />
          </PausedWrapper>
        </M3EProvider>,
      );
    });

    const menu = document.body.querySelector<HTMLElement>(".m3e-segmented-menu")!;
    expect(menu.style.borderRadius).toBe("16px");

    act(() => {
      menu.dispatchEvent(
        new PointerEvent("pointerenter", { bubbles: false, pointerType: "mouse" }),
      );
      menu.dispatchEvent(
        new PointerEvent("pointerleave", { bubbles: false, pointerType: "mouse" }),
      );
    });
    expect(menu.style.borderRadius).toBe("16px");
  });

  it("uses fixed positionMethod inside sticky/fixed ancestors and absolute in normal flow", async () => {
    await act(async () => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <PausedWrapper locale="en-US">
            <div style={{ position: "sticky", top: 0 }}>
              <DropdownMenu
                open
                trigger={<Button id="sticky-menu-btn">Sticky</Button>}
                items={[{ id: "st-1", label: "English" }]}
              />
            </div>
            <div>
              <DropdownMenu
                open
                trigger={<Button id="flow-menu-btn">Flow</Button>}
                items={[{ id: "fl-1", label: "Arabic" }]}
              />
            </div>
          </PausedWrapper>
        </M3EProvider>,
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    const positioners = document.body.querySelectorAll<HTMLElement>(
      ".m3e-segmented-menu__positioner",
    );
    expect(positioners.length).toBe(2);
    expect(positioners[0]!.style.position).toBe("fixed");
    expect(positioners[1]!.style.position).toBe("absolute");
  });

  it("marks disabled href items as aria-disabled and blocks onSelect", () => {
    let selected = false;
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <PausedWrapper locale="en-US">
            <DropdownMenu
              open
              trigger={<Button id="disabled-link-menu-btn">Links</Button>}
              items={[
                {
                  id: "dl-1",
                  label: "Blocked Doc",
                  href: "#blocked",
                  disabled: true,
                  onSelect: () => {
                    selected = true;
                  },
                },
              ]}
            />
          </PausedWrapper>
        </M3EProvider>,
      );
    });

    const item = document.body.querySelector<HTMLElement>(
      ".m3e-segmented-menu__item",
    )!;
    expect(item).not.toBeNull();
    expect(item.getAttribute("aria-disabled")).toBe("true");
    expect(item.hasAttribute("data-disabled")).toBe(true);
    act(() => {
      item.click();
    });
    expect(selected).toBe(false);
  });
});
