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
    expect(
      document.body.querySelector('.m3e-snackbar[data-type="default"] .m3e-snackbar__icon'),
    ).toBeNull();
  });

  it("renders status severity glyph on semantic toast types such as success", () => {
    let fireSuccessToast: (() => void) | undefined;
    function SuccessToastTrigger() {
      const { toast } = useM3EToast();
      fireSuccessToast = () =>
        toast({
          type: "success",
          title: "Palette synced",
          description: "Ready",
        });
      return null;
    }

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <SuccessToastTrigger />
        </PausedWrapper>,
      );
    });

    act(() => {
      fireSuccessToast?.();
    });

    const successToast = document.body.querySelector<HTMLElement>(
      '.m3e-snackbar[data-type="success"]',
    )!;
    expect(successToast).not.toBeNull();
    expect(successToast.querySelector(".m3e-snackbar__icon svg")).not.toBeNull();
  });
});
