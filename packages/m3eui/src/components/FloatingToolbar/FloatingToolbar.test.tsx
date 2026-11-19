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

  it("keeps action buttons as concentric 24px circles across unselected, selected, and pressed states", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <PausedWrapper locale="en-US">
            <FloatingToolbar
              items={[
                { id: "edit", label: "Edit", icon: <span>E</span>, selected: true },
                { id: "copy", label: "Copy", icon: <span>C</span> },
              ]}
            />
          </PausedWrapper>
        </M3EProvider>,
      );
    });

    const buttons = dom.container.querySelectorAll<HTMLButtonElement>(
      ".m3e-floating-toolbar__button",
    );
    expect(buttons.length).toBe(2);
    expect(buttons[0]!.style.borderRadius).toBe("24px");
    expect(buttons[1]!.style.borderRadius).toBe("24px");

    for (const btn of buttons) {
      act(() => {
        btn.dispatchEvent(
          new PointerEvent("pointerdown", { button: 0, bubbles: true }),
        );
      });
      expect(btn.style.borderRadius).toBe("24px");
      act(() => {
        window.dispatchEvent(new PointerEvent("pointerup", { bubbles: true }));
      });
    }
  });
});
