import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Tooltip } from "../Tooltip/Tooltip.js";
import { Chip } from "./Chip.js";

describe("Chip", () => {
  const dom = setupDomTest();

  it("renders removable, interactive, status, and elevated filter chips", () => {
    let chipRemoved = false;
    let chipClicked = false;
    let filterClicks = 0;

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Chip onRemove={() => {}}>m3eui</Chip>
          <Chip tone="success" dot>
            运行中
          </Chip>
          <Chip
            tone="primary"
            onRemove={() => {
              chipRemoved = true;
            }}
          >
            v0.1.0
          </Chip>
          <Chip
            tone="secondary"
            variant="outlined"
            onClick={() => {
              chipClicked = true;
            }}
          >
            筛选
          </Chip>
          <Chip
            selected
            elevated
            icon={<span>✨</span>}
            onSelectedChange={() => {
              filterClicks += 1;
            }}
          >
            总结本周变更
          </Chip>
        </PausedWrapper>,
      );
    });

    expect(dom.container.querySelector('button[aria-label="Remove chip"]')).not.toBeNull();
    const staticStatusChip = dom.container.querySelector(
      'span.m3e-chip-status[data-tone="success"]',
    );
    expect(staticStatusChip?.querySelector(".m3e-chip-status__dot")).not.toBeNull();

    const removeButtons = dom.container.querySelectorAll<HTMLButtonElement>(
      ".m3e-chip-status__remove",
    );
    act(() => {
      removeButtons[0]?.click();
    });
    expect(chipRemoved).toBe(true);

    const interactiveStatusChip = dom.container.querySelector<HTMLButtonElement>(
      "button.m3e-chip-status[data-interactive]",
    );
    expect(interactiveStatusChip).not.toBeNull();
    act(() => {
      interactiveStatusChip?.click();
    });
    expect(chipClicked).toBe(true);

    const filterChip = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-chip--filter",
    );
    expect(filterChip).not.toBeNull();
    expect(filterChip?.getAttribute("aria-pressed")).toBe("true");
    expect(filterChip?.hasAttribute("data-elevated")).toBe(true);
    act(() => {
      filterChip?.click();
    });
    expect(filterClicks).toBe(1);
  });

  it("forwards refs across Chip variants so Tooltip triggers attach cleanly", () => {
    let tooltipChipEl: HTMLElement | null = null;
    let staticLabelEl: HTMLElement | null = null;
    let filterEl: HTMLElement | null = null;

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Tooltip content="Status details">
            <Chip
              ref={(el) => {
                tooltipChipEl = el;
              }}
              tone="primary"
            >
              Stable
            </Chip>
          </Tooltip>
          <Chip
            ref={(el) => {
              staticLabelEl = el;
            }}
            tone="success"
          >
            Ready
          </Chip>
          <Chip
            ref={(el) => {
              filterEl = el;
            }}
            defaultSelected
            onSelectedChange={() => {}}
          >
            Active
          </Chip>
        </PausedWrapper>,
      );
    });

    expect(tooltipChipEl).toBeInstanceOf(HTMLElement);
    expect(staticLabelEl).toBeInstanceOf(HTMLSpanElement);
    expect(filterEl).toBeInstanceOf(HTMLButtonElement);
  });
});
