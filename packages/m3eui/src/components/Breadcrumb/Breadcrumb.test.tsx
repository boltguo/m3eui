import * as React from "react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Breadcrumb } from "./Breadcrumb.js";

describe("Breadcrumb", () => {
  const dom = setupDomTest();

  it("marks the current item with aria-current='page'", () => {
    const navRef = React.createRef<HTMLElement>();
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Breadcrumb
            ref={navRef}
            items={[
              { key: "home", label: "首页", href: "/" },
              { key: "comp", label: "组件", href: "/components" },
              { key: "btn", label: "Button", href: "/components/button" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    expect(navRef.current).toBe(dom.container.querySelector("nav.m3e-breadcrumb"));
    const breadcrumbOl = dom.container.querySelector("nav.m3e-breadcrumb > ol");
    expect(breadcrumbOl).not.toBeNull();
    const lastCrumbLink = breadcrumbOl?.querySelector(
      'li:last-child > a[aria-current="page"]',
    );
    expect(lastCrumbLink?.textContent).toBe("Button");
  });

  it("collapses items beyond maxItems into an overflow menu preserving MouseEvent", () => {
    const onCrumbClick = vi.fn((e: React.MouseEvent<HTMLElement>) => {
      e.preventDefault();
    });

    act(() => {
      dom.root.render(
        <M3EProvider>
          <Breadcrumb
            maxItems={3}
            items={[
              { label: "Home", href: "#home" },
              { label: "Engineering", href: "#eng", onClick: onCrumbClick },
              { label: "Design System", href: "#ds" },
              { label: "Tokens" },
            ]}
          />
        </M3EProvider>,
      );
    });

    const ellipsisBtn = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-breadcrumb__ellipsis",
    )!;
    act(() => {
      ellipsisBtn.click();
    });
    const menuItems = Array.from(
      document.body.querySelectorAll<HTMLElement>('[role="menuitem"]'),
    );
    const engItem = menuItems.find((el) =>
      el.textContent?.includes("Engineering"),
    );
    expect(engItem).toBeDefined();
    act(() => {
      engItem!.click();
    });
    expect(onCrumbClick).toHaveBeenCalledTimes(1);
    expect(typeof onCrumbClick.mock.calls[0]?.[0]?.preventDefault).toBe("function");
  });
});
