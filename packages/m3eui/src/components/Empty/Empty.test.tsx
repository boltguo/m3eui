import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { zhCNMessages } from "../../i18n/index.js";
import { Button } from "../Button/Button.js";
import { Empty } from "./Empty.js";

describe("Empty", () => {
  const dom = setupDomTest();

  it("renders localized default title and omits description element when absent", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Empty shape="clover8Leaf" actions={<Button size="xs">新建</Button>} />
          <Empty title="No matching artifacts" />
        </PausedWrapper>,
      );
    });

    const titles = dom.container.querySelectorAll(".m3e-empty__title");
    expect(titles[0]?.textContent).toBe(zhCNMessages["empty.title"]);
    expect(titles[1]?.textContent).toBe("No matching artifacts");
    expect(dom.container.querySelector(".m3e-empty__description")).toBeNull();
  });
});
