import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Divider } from "../Divider/Divider.js";
import { ScrollArea } from "./ScrollArea.js";

describe("ScrollArea", () => {
  const dom = setupDomTest();

  it("renders ScrollArea with constrained height and Divider", async () => {
    const areaRef = React.createRef<HTMLDivElement>();
    await act(async () => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <ScrollArea ref={areaRef} maxHeight={120}>
            <div>Scrollable content</div>
          </ScrollArea>
          <Divider />
        </PausedWrapper>,
      );
      await Promise.resolve();
    });

    expect(areaRef.current).toBe(dom.container.querySelector(".m3e-scroll-area"));
    expect(dom.container.querySelector(".m3e-scroll-area")?.textContent).toContain(
      "Scrollable content",
    );
    expect(dom.container.querySelector(".m3e-divider")).not.toBeNull();
  });
});
