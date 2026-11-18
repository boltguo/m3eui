import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Skeleton } from "./Skeleton.js";

describe("Skeleton", () => {
  const dom = setupDomTest();

  it("renders expressive MaterialShapes SVG Skeleton paths", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Skeleton shape="cookie9Sided" width={48} />
        </PausedWrapper>,
      );
    });

    const shapeSkeleton = dom.container.querySelector("svg.m3e-skeleton--shape path");
    expect(shapeSkeleton?.getAttribute("d")?.startsWith("M ")).toBe(true);
  });
});
