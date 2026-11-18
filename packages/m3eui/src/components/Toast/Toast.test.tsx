import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { useM3EToast } from "./Toast.js";

describe("Toast", () => {
  const dom = setupDomTest();

  it("renders toast notifications via useM3EToast", () => {
    let fireToast: (() => void) | undefined;
    function ToastTrigger() {
      const { toast } = useM3EToast();
      fireToast = () => toast({ title: "Saved!", description: "All synced" });
      return null;
    }

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <ToastTrigger />
        </PausedWrapper>,
      );
    });

    act(() => {
      fireToast?.();
    });
    expect(document.body.textContent).toContain("Saved!");
  });
});
