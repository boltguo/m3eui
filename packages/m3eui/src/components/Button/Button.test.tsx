import * as React from "react";
import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Button } from "./Button.js";

describe("Button", () => {
  const dom = setupDomTest();

  it("forwards ref to the underlying button element", () => {
    const btnRef = React.createRef<HTMLElement>();
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Button ref={btnRef}>Save</Button>
        </PausedWrapper>,
      );
    });
    expect(btnRef.current?.tagName.toLowerCase()).toBe("button");
  });

  it("preserves leadingIcon by default when toggle Button is selected and swaps for showCheckIcon", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Button
            defaultPressed
            leadingIcon={<span data-testid="star-glyph">*</span>}
          >
            Favorite
          </Button>
          <Button
            defaultPressed
            showCheckIcon
            leadingIcon={<span data-testid="pin-glyph">#</span>}
          >
            Pinned
          </Button>
        </PausedWrapper>,
      );
    });

    expect(dom.container.querySelector('[data-testid="star-glyph"]')).not.toBeNull();
    expect(dom.container.querySelector('[data-testid="pin-glyph"]')).toBeNull();
  });

  it("supports loading, danger intent, fullWidth, href anchor rendering, and focusable aria-disabled", () => {
    const onClick = vi.fn();
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Button id="loading-btn" loading intent="danger" fullWidth onClick={onClick}>
            正在删除
          </Button>
          <Button href="https://example.com/docs" variant="outlined">
            外链按钮
          </Button>
          <Button id="disabled-link-btn" href="https://example.com/disabled" disabled>
            禁用外链
          </Button>
        </PausedWrapper>,
      );
    });

    const loadingBtn = dom.container.querySelector<HTMLButtonElement>("#loading-btn")!;
    expect(loadingBtn.disabled).toBe(false);
    expect(loadingBtn.getAttribute("aria-disabled")).toBe("true");
    expect(loadingBtn.getAttribute("aria-busy")).toBe("true");
    expect(loadingBtn.getAttribute("data-intent")).toBe("danger");
    expect(loadingBtn.hasAttribute("data-full-width")).toBe(true);
    expect(loadingBtn.querySelector(".m3e-button__loader")).not.toBeNull();
    expect(loadingBtn.querySelector(".m3e-button__label")?.textContent).toBe("正在删除");
    act(() => {
      loadingBtn.click();
    });
    expect(onClick).not.toHaveBeenCalled();

    const linkBtn = dom.container.querySelector<HTMLAnchorElement>(
      'a.m3e-button[href="https://example.com/docs"]',
    );
    expect(linkBtn).not.toBeNull();
    expect(linkBtn?.getAttribute("role")).toBeNull();
    expect(linkBtn?.getAttribute("type")).toBeNull();

    const disabledLinkBtn = dom.container.querySelector<HTMLAnchorElement>("#disabled-link-btn");
    expect(disabledLinkBtn?.tagName.toLowerCase()).toBe("a");
    expect(disabledLinkBtn?.getAttribute("href")).toBeNull();
    expect(disabledLinkBtn?.getAttribute("aria-disabled")).toBe("true");
    expect(disabledLinkBtn?.getAttribute("role")).toBeNull();
  });

  it("holds touch tap press morph across synthetic touch pointerleave and cancels immediately on pointercancel", () => {
    vi.useFakeTimers();

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Button id="touch-btn">Tap me</Button>
        </M3EProvider>,
      );
    });

    const btn = dom.container.querySelector<HTMLButtonElement>("#touch-btn")!;

    act(() => {
      btn.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          pointerType: "touch",
        }),
      );
    });
    expect(btn.hasAttribute("data-pressed")).toBe(true);

    act(() => {
      btn.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
          pointerType: "touch",
        }),
      );
      btn.dispatchEvent(
        new PointerEvent("pointerleave", {
          bubbles: false,
          pointerType: "touch",
        }),
      );
    });
    expect(btn.hasAttribute("data-pressed")).toBe(true);

    act(() => {
      vi.advanceTimersByTime(110);
    });
    expect(btn.hasAttribute("data-pressed")).toBe(false);

    act(() => {
      btn.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          pointerType: "touch",
        }),
      );
    });
    expect(btn.hasAttribute("data-pressed")).toBe(true);

    act(() => {
      btn.dispatchEvent(
        new PointerEvent("pointercancel", {
          bubbles: true,
          pointerType: "touch",
        }),
      );
    });
    expect(btn.hasAttribute("data-pressed")).toBe(false);
  });
});
