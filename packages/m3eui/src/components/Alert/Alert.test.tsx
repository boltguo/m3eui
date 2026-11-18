import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Alert } from "./Alert.js";

describe("Alert", () => {
  const dom = setupDomTest();

  it("renders error alert semantics, uses IconButton close trigger, and dismisses when uncontrolled", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Alert severity="error" title="同步失败" closable>
            请检查上游令牌权限
          </Alert>
        </PausedWrapper>,
      );
    });

    const errorAlert = dom.container.querySelector('.m3e-alert[data-severity="error"]');
    expect(errorAlert?.getAttribute("role")).toBe("alert");
    const closeAlertBtn = errorAlert?.querySelector<HTMLButtonElement>(
      ".m3e-icon-button.m3e-alert__close",
    );
    expect(closeAlertBtn).not.toBeNull();
    act(() => {
      closeAlertBtn?.click();
    });
    expect(dom.container.querySelector(".m3e-alert")).toBeNull();
  });

  it("does not hide internally when controlled open={true} and remounts cleanly", () => {
    const onAlertClose = vi.fn();
    function Harness({ alertOpen }: { readonly alertOpen: boolean }) {
      return (
        <M3EProvider>
          <Alert
            open={alertOpen}
            closable
            title="Controlled Alert"
            onClose={onAlertClose}
          />
        </M3EProvider>
      );
    }

    act(() => {
      dom.root.render(<Harness alertOpen={true} />);
    });

    const closeBtn = dom.container.querySelector<HTMLButtonElement>(".m3e-alert__close")!;
    expect(closeBtn).not.toBeNull();
    act(() => {
      closeBtn.click();
    });
    expect(onAlertClose).toHaveBeenCalledTimes(1);
    expect(dom.container.querySelector(".m3e-alert")).not.toBeNull();

    act(() => {
      dom.root.render(<Harness alertOpen={false} />);
    });
    expect(dom.container.querySelector(".m3e-alert")).toBeNull();

    act(() => {
      dom.root.render(<Harness alertOpen={true} />);
    });
    expect(dom.container.querySelector(".m3e-alert")).not.toBeNull();
  });
});
