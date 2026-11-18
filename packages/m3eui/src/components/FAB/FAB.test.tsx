import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { FAB, FABMenu } from "./FAB.js";

describe("FAB & FABMenu", () => {
  const dom = setupDomTest();

  it("applies inert to closed FABMenu, supports roving ArrowUp focus, Escape focus return, and outside pointerdown dismiss", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <FABMenu
            triggerLabel="Create"
            items={[
              { id: "doc", label: "Document", icon: <span>D</span> },
              { id: "sheet", label: "Spreadsheet", icon: <span>S</span> },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const fabMenuRoot = dom.container.querySelector(".m3e-fab-menu")!;
    const fabMenuList = dom.container.querySelector<HTMLElement>(".m3e-fab-menu__list")!;
    const toggleFab = dom.container.querySelector<HTMLButtonElement>(".m3e-toggle-fab")!;
    expect(fabMenuList.inert).toBe(true);
    expect(
      dom.container.querySelector(".m3e-fab-menu__item")?.getAttribute("aria-hidden"),
    ).toBeNull();

    act(() => {
      toggleFab.click();
    });
    expect(fabMenuList.inert).toBe(false);

    const menuItems = dom.container.querySelectorAll<HTMLButtonElement>(
      ".m3e-fab-menu__item",
    );
    expect(menuItems.length).toBe(2);
    act(() => {
      menuItems[1]!.focus();
      fabMenuList.dispatchEvent(
        new KeyboardEvent("keydown", { key: "ArrowUp", bubbles: true }),
      );
    });
    expect(document.activeElement).toBe(menuItems[0]);

    act(() => {
      fabMenuRoot.dispatchEvent(
        new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
      );
    });
    expect(toggleFab.getAttribute("aria-expanded")).toBe("false");
    expect(document.activeElement).toBe(toggleFab);

    act(() => {
      toggleFab.click();
    });
    expect(fabMenuList.inert).toBe(false);
    act(() => {
      document.body.dispatchEvent(
        new PointerEvent("pointerdown", { bubbles: true }),
      );
    });
    expect(fabMenuList.inert).toBe(true);
  });

  it("covers FAB visibility, sizes, elevation, steady corners by default, and ExtendedFAB", () => {
    const onFabClick = vi.fn();

    act(() => {
      dom.root.render(
        <M3EProvider>
          <FAB
            id="fab-hidden"
            visible={false}
            icon={<span>+</span>}
            aria-label="Create"
            onClick={onFabClick}
          />
          <FAB id="fab-default" icon={<span>+</span>} aria-label="Default FAB" />
          <FAB id="fab-xs" size="xs" icon={<span>+</span>} aria-label="Small FAB" />
          <FAB
            id="fab-steady"
            size="md"
            elevation="lowered"
            icon={<span>+</span>}
            aria-label="Edit"
          />
          <FAB id="fab-lg" size="lg" icon={<span>+</span>} aria-label="Large FAB" />
          <FAB
            id="efab-morph"
            size="lg"
            morphOnPress
            elevation="none"
            icon={<span>+</span>}
          >
            Compose
          </FAB>
        </M3EProvider>,
      );
    });

    const fabHidden = dom.container.querySelector<HTMLButtonElement>("#fab-hidden")!;
    expect(fabHidden.hasAttribute("data-hidden")).toBe(true);
    expect(fabHidden.getAttribute("aria-hidden")).toBe("true");
    expect(fabHidden.tabIndex).toBe(-1);
    act(() => {
      fabHidden.click();
    });
    expect(onFabClick).not.toHaveBeenCalled();

    const fabDefault = dom.container.querySelector<HTMLButtonElement>("#fab-default")!;
    expect(fabDefault.style.width).toBe("56px");
    expect(fabDefault.style.borderRadius).toBe("16px");

    const fabXs = dom.container.querySelector<HTMLButtonElement>("#fab-xs")!;
    expect(fabXs.style.width).toBe("40px");
    expect(fabXs.style.borderRadius).toBe("12px");

    const fabSteady = dom.container.querySelector<HTMLButtonElement>("#fab-steady")!;
    expect(fabSteady.getAttribute("data-elevation")).toBe("lowered");
    expect(fabSteady.style.width).toBe("80px");
    expect(fabSteady.style.borderRadius).toBe("20px");
    act(() => {
      fabSteady.dispatchEvent(
        new PointerEvent("pointerdown", { button: 0, bubbles: true }),
      );
    });
    expect(fabSteady.style.borderRadius).toBe("20px");
    act(() => {
      window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
    });

    const fabLg = dom.container.querySelector<HTMLButtonElement>("#fab-lg")!;
    expect(fabLg.style.width).toBe("96px");
    expect(fabLg.style.borderRadius).toBe("28px");
    expect(fabLg.querySelector<HTMLElement>(".m3e-fab__icon")?.style.width).toContain("36px");

    const efabMorph = dom.container.querySelector<HTMLButtonElement>("#efab-morph")!;
    expect(efabMorph.getAttribute("data-elevation")).toBe("none");
    expect(
      efabMorph.querySelector<HTMLElement>(".m3e-extended-fab__icon")?.style.width,
    ).toBe("32px");
  });

  it("renders native anchor links without button role when href is passed to FAB", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <FAB id="fab-link" href="/create" aria-label="New" icon="+" />
          <FAB id="efab-link" href="/compose" icon="✎">
            Compose
          </FAB>
        </M3EProvider>,
      );
    });

    const fabLink = dom.container.querySelector<HTMLAnchorElement>("a#fab-link");
    const efabLink = dom.container.querySelector<HTMLAnchorElement>("a#efab-link");
    expect(fabLink?.getAttribute("href")).toBe("/create");
    expect(fabLink?.getAttribute("role")).toBeNull();
    expect(fabLink?.getAttribute("type")).toBeNull();
    expect(efabLink?.getAttribute("href")).toBe("/compose");
    expect(efabLink?.getAttribute("role")).toBeNull();
    expect(efabLink?.getAttribute("type")).toBeNull();
  });
});
