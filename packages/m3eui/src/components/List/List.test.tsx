import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Switch } from "../Switch/Switch.js";
import { List, ListItem } from "./List.js";

describe("List", () => {
  const dom = setupDomTest();

  it("renders segmented and standard inset-divider lists with valid non-nested interactive DOM", () => {
    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <PausedWrapper locale="zh-CN">
            <List variant="segmented">
              <ListItem headline="Static row" />
              <ListItem
                headline="Interactive row"
                onClick={() => {}}
                trailing={<button type="button">More</button>}
              />
            </List>
            <List dividers="inset" aria-label="标准设置列表">
              <ListItem headline="通知偏好" supportingText="管理推送渠道" selected />
              <ListItem headline="安全与密钥" />
            </List>
          </PausedWrapper>
        </M3EProvider>,
      );
    });

    const lists = dom.container.querySelectorAll(".m3e-segmented-list");
    const segItems = lists[0]!.querySelectorAll(".m3e-segmented-list__item");
    expect(segItems.length).toBe(2);
    expect(segItems[0]?.tagName).toBe("DIV");
    expect(segItems[0]?.hasAttribute("data-static")).toBe(true);
    expect(segItems[1]?.querySelector(".m3e-segmented-list__primary")?.tagName).toBe("BUTTON");
    expect(dom.container.querySelectorAll("button button").length).toBe(0);

    const stdList = dom.container.querySelector<HTMLElement>(
      '.m3e-segmented-list[data-variant="standard"]',
    )!;
    expect(stdList.getAttribute("data-dividers")).toBe("inset");
    const stdItems = stdList.querySelectorAll<HTMLElement>(".m3e-segmented-list__item");
    expect(stdItems.length).toBe(2);
    expect(stdItems[1]?.style.borderRadius).toBe("0px");
  });

  it("links List label via aria-labelledby and isolates two-target chevron/Switch actions", () => {
    const onDetail = vi.fn();
    const onToggle = vi.fn();

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <PausedWrapper locale="zh-CN">
            <List variant="segmented" label="亮度">
              <ListItem
                headline="自动调节亮度"
                onClick={onDetail}
                chevron
                trailing={
                  <Switch
                    showIcons
                    checked={true}
                    onCheckedChange={onToggle}
                    aria-label="自动调节亮度"
                  />
                }
              />
            </List>
          </PausedWrapper>
        </M3EProvider>,
      );
    });

    const labelEl = dom.container.querySelector<HTMLElement>(".m3e-list-group__label")!;
    const listEl = dom.container.querySelector<HTMLElement>('ul[role="list"]')!;
    expect(labelEl.textContent).toBe("亮度");
    expect(labelEl.id).toBeTruthy();
    expect(listEl.getAttribute("aria-labelledby")).toBe(labelEl.id);

    const primaryBtn = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-segmented-list__primary",
    )!;
    const chevronEl = primaryBtn.querySelector<HTMLElement>(
      ".m3e-segmented-list__chevron",
    )!;
    const dividerEl = dom.container.querySelector<HTMLElement>(
      ".m3e-segmented-list__divider",
    )!;
    const trailingEl = dom.container.querySelector<HTMLElement>(
      ".m3e-segmented-list__trailing",
    )!;
    expect(primaryBtn.tagName).toBe("BUTTON");
    expect(chevronEl).toBeTruthy();
    expect(dividerEl.nextElementSibling).toBe(trailingEl);

    act(() => {
      chevronEl.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });
    expect(onDetail).toHaveBeenCalledTimes(1);
    expect(onToggle).not.toHaveBeenCalled();

    const switchBtn = trailingEl.querySelector<HTMLElement>('[role="switch"]')!;
    act(() => {
      switchBtn.click();
    });
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onToggle).toHaveBeenCalledWith(false);
    expect(onDetail).toHaveBeenCalledTimes(1);
  });

  it("mirrors ListItem chevron in RTL and preserves native link semantics", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="ar-SA" direction="auto">
          <List variant="segmented" aria-label="روابط العرض">
            <ListItem headline="الشاشة" href="/settings/display" chevron />
            <ListItem
              headline="السمة الداكنة"
              href="/settings/theme"
              disabled
              chevron
            />
          </List>
        </PausedWrapper>,
      );
    });

    const links = dom.container.querySelectorAll<HTMLAnchorElement>("a.m3e-segmented-list__item");
    expect(links.length).toBe(2);
    expect(links[0]!.getAttribute("href")).toBe("/settings/display");
    expect(links[0]!.hasAttribute("role")).toBe(false);
    expect(
      links[0]!.querySelector(".m3e-segmented-list__chevron polyline")?.getAttribute("points"),
    ).toBe("15 18 9 12 15 6");

    expect(links[1]!.hasAttribute("href")).toBe(false);
    expect(links[1]!.getAttribute("aria-disabled")).toBe("true");
  });

  it("expands AOSP 360-degree bounded ripple from cursor seed radius to center and fades out after release", () => {
    vi.useFakeTimers();

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <List variant="segmented" aria-label="Ripple list">
            <ListItem headline="Item" onClick={() => {}} />
          </List>
        </M3EProvider>,
      );
    });

    const btn = dom.container.querySelector<HTMLButtonElement>(".m3e-segmented-list__item")!;
    const rippleHost = btn.querySelector<HTMLSpanElement>(".m3e-ripple")!;
    vi.spyOn(rippleHost, "getBoundingClientRect").mockReturnValue({
      width: 200,
      height: 56,
      left: 10,
      top: 20,
      right: 210,
      bottom: 76,
      x: 10,
      y: 20,
      toJSON: () => ({}),
    });

    act(() => {
      btn.dispatchEvent(
        new PointerEvent("pointerdown", {
          bubbles: true,
          button: 0,
          clientX: 50,
          clientY: 48,
        }),
      );
    });

    const startRadius = Math.min(56 * 0.2, 12);
    expect(startRadius * 2).toBeLessThan(56);
    const solidEndRadius = Math.hypot(200, 56) / 2 + 10;
    const endRadius = solidEndRadius / 0.6;
    const initScale = (startRadius / solidEndRadius).toFixed(4);
    const wave = rippleHost.querySelector<HTMLSpanElement>(".m3e-ripple__wave")!;
    expect(wave).not.toBeNull();
    expect(parseFloat(wave.style.width)).toBeCloseTo(endRadius * 2, 2);
    expect(parseFloat(wave.style.height)).toBeCloseTo(endRadius * 2, 2);
    expect(wave.style.transform).toBe(
      `translate3d(${(40 - endRadius).toFixed(2)}px, ${(28 - endRadius).toFixed(2)}px, 0) scale(${initScale})`,
    );

    const anims = wave.getAnimations();
    expect(anims.length).toBeGreaterThanOrEqual(2);
    const expandKeyframes = (anims[0]!.effect as KeyframeEffect).getKeyframes();
    const fadeKeyframes = (anims[1]!.effect as KeyframeEffect).getKeyframes();
    expect(expandKeyframes[1]?.transform).toBe(
      `translate3d(${(100 - endRadius).toFixed(2)}px, ${(28 - endRadius).toFixed(2)}px, 0) scale(1.0000)`,
    );
    expect(Number(fadeKeyframes[1]?.opacity)).toBeCloseTo(0.1, 3);

    act(() => {
      vi.advanceTimersByTime(460);
      btn.dispatchEvent(
        new PointerEvent("pointerup", {
          bubbles: true,
        }),
      );
      vi.advanceTimersByTime(250);
    });
    expect(rippleHost.querySelector(".m3e-ripple__wave")).toBeNull();
  });
});
