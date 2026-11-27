import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { zhCNMessages } from "../../i18n/index.js";
import { Pagination } from "./Pagination.js";

describe("Pagination", () => {
  const dom = setupDomTest();

  it("advances pages via localized next button", () => {
    const navRef = React.createRef<HTMLElement>();
    let currentPage = 2;
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Pagination
            ref={navRef}
            page={currentPage}
            totalItems={95}
            pageSize={10}
            showSummary
            onPageChange={(next) => {
              currentPage = next;
            }}
          />
        </PausedWrapper>,
      );
    });

    expect(navRef.current).toBe(dom.container.querySelector("nav.m3e-pagination"));
    const nextBtn = dom.container.querySelector<HTMLButtonElement>(
      `button[aria-label="${zhCNMessages["pagination.next"]}"]`,
    );
    act(() => {
      nextBtn?.click();
    });
    expect(currentPage).toBe(3);
  });
});
