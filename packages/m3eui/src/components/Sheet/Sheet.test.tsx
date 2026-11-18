import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { jaJPMessages } from "../../i18n/index.js";
import { Sheet } from "./Sheet.js";

describe("Sheet", () => {
  const dom = setupDomTest();

  it("localizes close button label, maps side='end' to left in RTL, and keeps popup flush via --m3e-sheet-pad", () => {
    act(() => {
      dom.root.render(
        <div>
          <PausedWrapper locale="ja-JP">
            <Sheet open title="設定シート">
              Sheet content
            </Sheet>
          </PausedWrapper>
          <M3EProvider locale="ar_sa" initialDirection="auto" syncDocumentRoot={false}>
            <Sheet side="end" open title="لوحة جانبية">
              <span>محتوى</span>
            </Sheet>
          </M3EProvider>
        </div>,
      );
    });

    expect(
      document.body.querySelector(
        `button[aria-label="${jaJPMessages["sheet.close"]}"]`,
      ),
    ).not.toBeNull();

    const popups = document.body.querySelectorAll<HTMLElement>(".m3e-sheet__popup");
    const rtlEndSheet = popups[1];
    expect(rtlEndSheet?.getAttribute("data-side")).toBe("left");
    expect(rtlEndSheet?.style.padding).toBe("");
    expect(rtlEndSheet?.style.getPropertyValue("--m3e-sheet-pad")).not.toBe("");
  });

  it("renders non-modal snap Sheet without backdrop and sets data-non-modal", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Sheet
            open
            modal={false}
            snapPoints={[0.4, 1]}
            defaultSnapPoint={0.4}
            title="Inspector"
          >
            <div id="sheet-content">Live Properties</div>
          </Sheet>
        </M3EProvider>,
      );
    });

    const nonModalSheet = document.body.querySelector<HTMLElement>(
      ".m3e-sheet__popup[data-non-modal]",
    )!;
    expect(nonModalSheet).not.toBeNull();
    expect(document.body.querySelector(".m3e-sheet__backdrop")).toBeNull();
  });
});
