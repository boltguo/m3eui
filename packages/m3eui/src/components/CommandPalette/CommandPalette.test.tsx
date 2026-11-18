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
});
