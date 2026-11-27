import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { CommandPalette } from "./CommandPalette.js";

describe("CommandPalette", () => {
  const dom = setupDomTest();

  it("renders groups, Kbd shortcuts, and triggers onSelect on item click", () => {
    let ranCommand = "";
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <CommandPalette
            open
            groups={[
              {
                id: "nav",
                heading: "快捷跳转",
                items: [
                  {
                    id: "go-blocks",
                    label: "打开 Blocks 模板库",
                    shortcut: "⇧⌘B",
                    onSelect: () => {
                      ranCommand = "go-blocks";
                    },
                  },
                ],
              },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const cmdKbdKeys = document.body.querySelectorAll(
      ".m3e-command-palette .m3e-kbd .m3e-kbd__key",
    );
    expect(Array.from(cmdKbdKeys).map((el) => el.textContent)).toEqual([
      "⇧",
      "⌘",
      "B",
    ]);

    const cmdOption = document.body.querySelector<HTMLElement>(
      '.m3e-command-palette__item[role="option"]',
    );
    expect(cmdOption?.textContent).toContain("打开 Blocks 模板库");
    act(() => {
      cmdOption?.click();
    });
    expect(ranCommand).toBe("go-blocks");
  });

  it("filters CommandPalette items by keywords and runs the highlighted one on Enter", async () => {
    const ran: string[] = [];
    act(() => {
      dom.root.render(
        <PausedWrapper>
          <CommandPalette
            open
            items={[
              { id: "a", label: "Alpha", onSelect: () => ran.push("a") },
              { id: "b", label: "Beta", keywords: ["spring"], onSelect: () => ran.push("b") },
            ]}
          />
        </PausedWrapper>,
      );
    });
    const input = document.body.querySelector<HTMLInputElement>(
      ".m3e-command-palette__input",
    )!;
    await act(async () => {
      input.focus();
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        input,
        "spring",
      );
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    const options = document.body.querySelectorAll(".m3e-command-palette__item");
    expect([...options].map((o) => o.textContent)).toEqual(["Beta"]);
    await act(async () => {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    });
    expect(ran).toEqual(["b"]);
  });

  it("supports controlled query, async loading state, and server-side filtering via filterItems={false}", async () => {
    let latestQuery = "";
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <CommandPalette
            open
            query="rem"
            onQueryChange={(q) => {
              latestQuery = q;
            }}
            filterItems={false}
            loading
            items={[]}
          />
        </PausedWrapper>,
      );
    });

    const input = document.body.querySelector<HTMLInputElement>(
      ".m3e-command-palette__input",
    )!;
    expect(input.value).toBe("rem");
    expect(
      document.body.querySelector(".m3e-command-palette__spinner"),
    ).not.toBeNull();
    expect(
      document.body.querySelector(".m3e-command-palette__list")?.getAttribute("aria-busy"),
    ).toBe("true");
    expect(
      document.body.querySelector(".m3e-command-palette__loading")?.textContent,
    ).toBe("Loading");
    expect(
      document.body.querySelector(".m3e-command-palette__empty"),
    ).toBeNull();

    await act(async () => {
      Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(
        input,
        "remote-token",
      );
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    expect(latestQuery).toBe("remote-token");

    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <CommandPalette
            open
            query="remote-token"
            filterItems={false}
            items={[
              {
                id: "server-1",
                label: "Unmatched local text",
                onSelect: () => {},
              },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const renderedItems = document.body.querySelectorAll(".m3e-command-palette__item");
    expect(renderedItems.length).toBe(1);
    expect(renderedItems[0]!.textContent).toContain("Unmatched local text");
  });
});
