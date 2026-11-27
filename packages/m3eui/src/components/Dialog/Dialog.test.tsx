import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Sheet } from "../Sheet/Sheet.js";
import { Dialog } from "./Dialog.js";

describe("Dialog", () => {
  const dom = setupDomTest();

  it("renders close button and header data-has-close attribute", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Dialog open showCloseButton title="Confirm Sync">
            Dialog body
          </Dialog>
        </PausedWrapper>,
      );
    });

    expect(
      document.body.querySelector('button[aria-label="Close dialog"]'),
    ).not.toBeNull();
    expect(
      document.body.querySelector(".m3e-dialog__header")?.hasAttribute("data-has-close"),
    ).toBe(true);
  });

  it("stacks a Dialog opened inside a Sheet above the Sheet", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Sheet open title="Sheet">
            <Dialog open title="Confirm">
              Body
            </Dialog>
          </Sheet>
        </M3EProvider>,
      );
    });

    const sheet = document.body.querySelector(".m3e-sheet__viewport");
    const dialog = document.body.querySelector(".m3e-dialog__viewport");
    expect(sheet).not.toBeNull();
    expect(dialog).not.toBeNull();
    expect(
      sheet!.compareDocumentPosition(dialog!) & Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(sheet!.contains(dialog)).toBe(false);
  });

  it("forwards ref to the Dialog popup element", () => {
    let popupEl: HTMLDivElement | null = null;
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Dialog
            ref={(el) => {
              popupEl = el;
            }}
            open
            title="Ref Dialog"
          >
            Body
          </Dialog>
        </PausedWrapper>,
      );
    });

    expect(popupEl).toBeInstanceOf(HTMLDivElement);
    expect(popupEl!.classList.contains("m3e-dialog__popup")).toBe(true);
  });
});
