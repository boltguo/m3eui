import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { SearchBar } from "../SearchBar/SearchBar.js";
import { NavigationBar, NavigationRail } from "./Navigation.js";

describe("Navigation", () => {
  const dom = setupDomTest();

  it("renders compact NavigationRail anchor links with section titles, dividers, badgeLabel, and a SearchBar header", () => {
    let selected = "theme-setup";
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <div>
            <NavigationRail
              expanded
              modal="auto"
              density="compact"
              header={<SearchBar size="sm" placeholder="快速搜索组件" />}
              value={selected}
              onValueChange={(v) => {
                selected = v;
              }}
              items={[
                {
                  value: "theme-setup",
                  label: "主题与国际化",
                  href: "#theme-setup",
                  badgeLabel: "v1.0",
                  section: "入门",
                },
                {
                  value: "button",
                  label: "Button 按钮",
                  href: "#button",
                  section: "动作",
                },
              ]}
            />
          </div>
        </PausedWrapper>,
      );
    });

    const compactBar = dom.container.querySelector<HTMLElement>(
      '.m3e-search-bar[data-size="sm"]',
    );
    expect(compactBar).not.toBeNull();
    expect(compactBar!.style.minHeight).toBe("40px");

    const nav = dom.container.querySelector<HTMLElement>("nav.m3e-nav-rail--compact");
    expect(nav?.getAttribute("data-modal")).toBe("auto");
    expect(nav?.querySelector(".m3e-nav-rail__header .m3e-search-bar")).not.toBeNull();
    expect(
      nav?.querySelector<HTMLElement>(".m3e-nav-list__item")?.style.minHeight,
    ).toBe("40px");
    expect(
      [...nav!.querySelectorAll(".m3e-nav-list__section-title")].map((el) => el.textContent),
    ).toEqual(["入门", "动作"]);
    expect(
      dom.container.querySelector(".m3e-nav-rail .m3e-nav-list__divider"),
    ).not.toBeNull();

    const links = nav!.querySelectorAll<HTMLAnchorElement>("a.m3e-nav-list__item");
    expect(links.length).toBe(2);
    expect(links[0]!.getAttribute("href")).toBe("#theme-setup");
    expect(links[0]!.getAttribute("aria-current")).toBe("true");
    expect(links[0]!.querySelector(".m3e-nav-list__tag")?.textContent).toBe("v1.0");

    act(() => {
      links[1]!.click();
    });
    expect(selected).toBe("button");
  });

  it("supports horizontal NavigationBar links and preserves collapsible NavigationRail toggle focus", () => {
    function NavHarness({ railExpanded }: { readonly railExpanded: boolean }) {
      return (
        <M3EProvider syncDocumentRoot={false} initialDirection="rtl" locale="ar-SA">
          <NavigationBar
            itemLayout="horizontal"
            arrangement="centered"
            value="home"
            onValueChange={() => {}}
            items={[
              { value: "home", label: "Home", href: "/home" },
              { value: "files", label: "Files", href: "#files" },
            ]}
          />
          <NavigationRail
            collapsible
            expanded={railExpanded}
            onValueChange={() => {}}
            value="inbox"
            items={[{ value: "inbox", label: "Inbox", icon: <span>I</span> }]}
          />
        </M3EProvider>
      );
    }

    act(() => {
      dom.root.render(<NavHarness railExpanded={false} />);
    });

    const navBar = dom.container.querySelector(".m3e-nav-bar")!;
    expect(navBar.getAttribute("data-item-layout")).toBe("horizontal");
    expect(navBar.getAttribute("data-arrangement")).toBe("centered");
    const activeNavAnchor = navBar.querySelector<HTMLAnchorElement>(
      "a[href='/home']",
    )!;
    expect(activeNavAnchor.getAttribute("aria-current")).toBe("page");

    const railToggle = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-nav-rail__toggle",
    )!;
    expect(railToggle.getAttribute("aria-expanded")).toBe("false");
    expect(
      dom.container.querySelector(".m3e-nav-rail button[aria-current='page']"),
    ).not.toBeNull();
    railToggle.focus();

    act(() => {
      dom.root.render(<NavHarness railExpanded={true} />);
    });
    expect(dom.container.querySelector(".m3e-nav-rail__toggle")).toBe(railToggle);
    expect(document.activeElement).toBe(railToggle);
    expect(railToggle.getAttribute("aria-expanded")).toBe("true");
    expect(
      dom.container.querySelector(".m3e-nav-list__item[aria-current='page']"),
    ).not.toBeNull();
  });
});
