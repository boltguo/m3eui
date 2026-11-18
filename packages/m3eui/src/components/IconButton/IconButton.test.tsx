import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { IconButton } from "./IconButton.js";

describe("IconButton", () => {
  const dom = setupDomTest();

  it("forwards ref, supports loading/danger, and renders as a semantic anchor when href is provided", () => {
    const iconBtnRef = React.createRef<HTMLElement>();

    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <IconButton ref={iconBtnRef} aria-label="Star" icon="★" />
          <IconButton
            icon={<span>✕</span>}
            aria-label="删除条目"
            intent="danger"
            loading
          />
          <IconButton
            href="https://github.com/boltguo/m3eui"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="GitHub"
            icon={<span data-testid="gh-glyph">GH</span>}
          />
        </PausedWrapper>,
      );
    });

    expect(iconBtnRef.current?.tagName.toLowerCase()).toBe("button");
    expect(
      dom.container.querySelector('button.m3e-icon-button[data-loading][data-intent="danger"]'),
    ).not.toBeNull();

    const link = dom.container.querySelector<HTMLAnchorElement>("a.m3e-icon-button");
    expect(link).not.toBeNull();
    expect(link?.getAttribute("href")).toBe("https://github.com/boltguo/m3eui");
    expect(link?.getAttribute("target")).toBe("_blank");
    expect(link?.getAttribute("rel")).toBe("noopener noreferrer");
    expect(link?.getAttribute("aria-label")).toBe("GitHub");
    expect(link?.getAttribute("role")).toBeNull();
    expect(link?.getAttribute("type")).toBeNull();
  });
});
