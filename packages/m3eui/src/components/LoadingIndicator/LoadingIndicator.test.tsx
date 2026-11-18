import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { LoadingIndicator } from "./LoadingIndicator.js";

describe("LoadingIndicator", () => {
  const dom = setupDomTest();

  it("renders default and contained variants with progressbar semantics", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <LoadingIndicator />
          <LoadingIndicator contained />
        </PausedWrapper>,
      );
    });

    expect(dom.container.querySelectorAll('[role="progressbar"]').length).toBe(2);
  });
});
