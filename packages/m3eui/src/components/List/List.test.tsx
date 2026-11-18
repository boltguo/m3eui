import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
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
});
