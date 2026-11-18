import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Accordion } from "./Accordion.js";

describe("Accordion", () => {
  const dom = setupDomTest();

  it("renders a single-item Accordion with variant, trailingBadge, and hidden='until-found' panel", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Accordion
            variant="outlined"
            items={[
              {
                value: "notes",
                title: "Architecture Notes",
                trailingBadge: <span>New</span>,
                content: "Searchable hidden paragraph",
              },
            ]}
          />
        </PausedWrapper>,
      );
    });

    expect(
      dom.container.querySelector(".m3e-accordion")?.getAttribute("data-variant"),
    ).toBe("outlined");
    expect(dom.container.querySelector(".m3e-accordion__badge")?.textContent).toBe("New");
    const panel = dom.container.querySelector<HTMLElement>(".m3e-accordion__panel");
    expect(panel?.getAttribute("hidden")).toBe("until-found");
    expect(panel?.querySelector(".m3e-accordion__content")?.textContent).toBe(
      "Searchable hidden paragraph",
    );
    act(() => {
      dom.container.querySelector<HTMLButtonElement>(".m3e-accordion__trigger")!.click();
    });
    expect(panel?.hasAttribute("hidden")).toBe(false);
  });

  it("synchronizes Accordion showExpandAll aria-expanded strictly when all items are open", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Accordion
            showExpandAll
            defaultValue={["one"]}
            items={[
              { value: "one", title: "Item 1", content: "Body 1" },
              { value: "two", title: "Item 2", content: "Body 2" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const expandBtn = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-accordion__expand-all",
    );
    expect(expandBtn).not.toBeNull();
    expect(expandBtn!.getAttribute("aria-expanded")).toBe("false");
    expect(expandBtn!.textContent).toBe("Expand all");

    act(() => {
      expandBtn!.click();
    });
    expect(expandBtn!.getAttribute("aria-expanded")).toBe("true");
    expect(expandBtn!.textContent).toBe("Collapse all");

    act(() => {
      expandBtn!.click();
    });
    expect(expandBtn!.getAttribute("aria-expanded")).toBe("false");
    expect(expandBtn!.textContent).toBe("Expand all");
  });
});
