import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Divider } from "./Divider.js";

describe("Divider", () => {
  const dom = setupDomTest();

  it("renders horizontal, vertical, inset, labeled variants and forwards ref", () => {
    const plainRef = React.createRef<HTMLDivElement>();
    const labeledRef = React.createRef<HTMLDivElement>();

    act(() => {
      dom.root.render(
        <PausedWrapper>
          <Divider ref={plainRef} />
          <Divider orientation="vertical" inset />
          <Divider ref={labeledRef} inset label="OR" />
        </PausedWrapper>,
      );
    });

    const separators = dom.container.querySelectorAll<HTMLElement>(
      '[role="separator"].m3e-divider',
    );
    expect(separators.length).toBe(3);

    expect(separators[0]?.getAttribute("data-orientation")).toBe("horizontal");
    expect(separators[0]?.hasAttribute("data-inset")).toBe(false);
    expect(plainRef.current).toBe(separators[0]);

    expect(separators[1]?.getAttribute("data-orientation")).toBe("vertical");
    expect(separators[1]?.hasAttribute("data-inset")).toBe(true);

    expect(separators[2]?.classList.contains("m3e-divider--labeled")).toBe(true);
    expect(separators[2]?.hasAttribute("data-inset")).toBe(true);
    expect(separators[2]?.querySelector(".m3e-divider__label")?.textContent).toBe("OR");
    expect(labeledRef.current).toBe(separators[2]);
  });
});
