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

  it("supports updating an existing toast and wrapping async promises with loading/success/error states", async () => {
    let api: ReturnType<typeof useM3EToast> | undefined;
    function Probe() {
      api = useM3EToast();
      return null;
    }

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Probe />
        </PausedWrapper>,
      );
    });

    let id = "";
    act(() => {
      id = api!.toast({ title: "Uploading…", type: "loading" });
    });
    expect(document.body.querySelector('.m3e-snackbar[data-type="loading"] .m3e-snackbar__spinner')).not.toBeNull();

    act(() => {
      api!.update(id, { title: "Upload complete", type: "success" });
    });
    expect(document.body.textContent).toContain("Upload complete");
    expect(document.body.querySelector('.m3e-snackbar[data-type="success"]')).not.toBeNull();

    let resolveTask!: (v: string) => void;
    const okPromise = new Promise<string>((r) => {
      resolveTask = r;
    });
    let pending: Promise<string> | undefined;
    act(() => {
      pending = api!.promise(okPromise, {
        loading: "Saving changes…",
        success: (name) => ({ title: `Saved ${name}` }),
        error: "Save failed",
      });
    });
    expect(document.body.textContent).toContain("Saving changes…");
    expect(document.body.querySelector('.m3e-snackbar[data-type="loading"]')).not.toBeNull();

    await act(async () => {
      resolveTask("theme.css");
      await pending;
    });
    expect(document.body.textContent).toContain("Saved theme.css");
    expect(document.body.querySelector('.m3e-snackbar[data-type="success"]')).not.toBeNull();

    await act(async () => {
      await api!
        .promise(Promise.reject(new Error("boom")), {
          loading: "Deleting…",
          success: "Deleted",
          error: (err) => ({ title: `Failed: ${(err as Error).message}` }),
        })
        .catch(() => {});
    });
    expect(document.body.textContent).toContain("Failed: boom");
    expect(document.body.querySelector('.m3e-snackbar[data-type="error"]')).not.toBeNull();
  });
});
