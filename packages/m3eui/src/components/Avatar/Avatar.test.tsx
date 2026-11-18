import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Avatar, AvatarGroup } from "./Avatar.js";

describe("Avatar & AvatarGroup", () => {
  const dom = setupDomTest();

  it("renders MaterialShapes clipPath, AvatarGroup overflow badge, and polygon ring SVG", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Avatar shape="clover4Leaf" fallback="M3" />
          <AvatarGroup
            max={3}
            shape="cookie9Sided"
            items={[
              { id: "1", fallback: "A" },
              { id: "2", fallback: "B" },
              { id: "3", fallback: "C" },
              { id: "4", fallback: "D" },
              { id: "5", fallback: "E" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    expect(dom.container.querySelector(".m3e-avatar-group__overflow")?.textContent).toContain("+2");
    expect(dom.container.querySelector(".m3e-avatar-group__ring-svg")).not.toBeNull();
  });
});
