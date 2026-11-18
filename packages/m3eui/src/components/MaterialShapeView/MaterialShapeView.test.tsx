import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { MaterialShapeView } from "./MaterialShapeView.js";

describe("MaterialShapeView", () => {
  const dom = setupDomTest();

  it("renders morphed SVG paths and preserves valid path geometry on mid-morph retargeting", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <MaterialShapeView
            shape="cookie9Sided"
            toShape="heart"
            morphProgress={0.5}
            size={64}
          />
        </PausedWrapper>,
      );
    });

    expect(
      dom.container.querySelector(".m3e-material-shape path")?.getAttribute("d")?.startsWith("M"),
    ).toBe(true);

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <MaterialShapeView shape="cookie9Sided" size={48} />
        </M3EProvider>,
      );
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <MaterialShapeView shape="clover8Leaf" size={48} />
        </M3EProvider>,
      );
    });

    expect(
      dom.container.querySelector(".m3e-material-shape path")?.getAttribute("d")?.startsWith("M"),
    ).toBe(true);
  });
});
