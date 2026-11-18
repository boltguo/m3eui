import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Tab, Tabs, TabsList, TabsPanel } from "./Tabs.js";

describe("Tabs", () => {
  const dom = setupDomTest();

  it("renders Tabs panels and marks scrollable TabsList", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Tabs defaultValue="a">
            <TabsList aria-label="Demo tabs" scrollable>
              <Tab value="a">Tab A</Tab>
              <Tab value="b">Tab B</Tab>
            </TabsList>
            <TabsPanel value="a">Panel A</TabsPanel>
            <TabsPanel value="b">Panel B</TabsPanel>
          </Tabs>
        </PausedWrapper>,
      );
    });

    expect(
      dom.container.querySelector(".m3e-tabs__list")?.hasAttribute("data-scrollable"),
    ).toBe(true);
    expect(dom.container.textContent).toContain("Panel A");
  });
});
