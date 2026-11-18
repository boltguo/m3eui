import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { FloatingToolbar } from "./FloatingToolbar.js";

describe("FloatingToolbar", () => {
  const dom = setupDomTest();

  it("applies inert when collapsed and supports scrollCollapse", () => {
    let collapsedState = false;
    const scrollBoxRef = { current: null as HTMLDivElement | null };

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <PausedWrapper locale="en-US">
            <FloatingToolbar
              collapsed
              items={[
                { id: "cut", label: "Cut", icon: <span>X</span> },
                { id: "copy", label: "Copy", icon: <span>C</span> },
              ]}
            />
          </PausedWrapper>
          <div
            ref={(node) => {
              scrollBoxRef.current = node;
            }}
            style={{ height: 120, overflowY: "auto" }}
          >
            <FloatingToolbar
              scrollCollapse
              scrollTarget={scrollBoxRef}
              onCollapsedChange={(c) => {
                collapsedState = c;
              }}
              items={[{ id: "edit", label: "Edit", icon: "✎" }]}
              companionFab={<button type="button">+</button>}
            />
          </div>
        </M3EProvider>,
      );
    });

    const collapsedToolbar = dom.container.querySelector<HTMLElement>(
      ".m3e-floating-toolbar[data-collapsed]",
    );
    expect(collapsedToolbar).not.toBeNull();
    expect(collapsedToolbar!.inert).toBe(true);

    act(() => {
      scrollBoxRef.current!.scrollTop = 60;
      scrollBoxRef.current!.dispatchEvent(new Event("scroll"));
    });
    expect(collapsedState).toBe(true);

    act(() => {
      scrollBoxRef.current!.scrollTop = 0;
      scrollBoxRef.current!.dispatchEvent(new Event("scroll"));
    });
    expect(collapsedState).toBe(false);
  });
});
