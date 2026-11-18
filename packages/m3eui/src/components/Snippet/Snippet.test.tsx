import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { CopyButton, Snippet } from "./Snippet.js";

describe("Snippet & CopyButton", () => {
  const dom = setupDomTest();

  it("copies Snippet code and surfaces data-error + onCopyError on clipboard failure", async () => {
    let copiedSnippet = "";
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Snippet
            code="npx m3eui init"
            onCopy={(val) => {
              copiedSnippet = val;
            }}
          />
        </PausedWrapper>,
      );
    });

    const snippetCopyBtn = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-snippet .m3e-copy-button",
    );
    await act(async () => {
      snippetCopyBtn?.click();
    });
    expect(copiedSnippet).toBe("npx m3eui init");

    const originalClipboard = navigator.clipboard;
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: vi.fn().mockRejectedValue(new Error("Clipboard denied")),
      },
      configurable: true,
    });
    const onCopyError = vi.fn();

    try {
      act(() => {
        dom.root.render(
          <PausedWrapper locale="en-US">
            <CopyButton value="secret" onCopyError={onCopyError} />
          </PausedWrapper>,
        );
      });

      const copyBtn = dom.container.querySelector<HTMLButtonElement>(
        ".m3e-copy-button",
      )!;
      await act(async () => {
        copyBtn.click();
      });
      expect(copyBtn.hasAttribute("data-error")).toBe(true);
      expect(onCopyError).toHaveBeenCalledTimes(1);
    } finally {
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
      });
    }
  });
});
