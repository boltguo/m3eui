import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { jaJPMessages } from "../../i18n/index.js";
import { Combobox } from "./Combobox.js";

describe("Combobox", () => {
  const dom = setupDomTest();

  it("localizes placeholder, opens outlined notch, and renders multiple chips", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="ja-JP">
          <Combobox
            label="コンポーネント検索"
            options={[{ value: "btn", label: "Button" }]}
          />
          <Combobox
            multiple
            label="技術スタック"
            defaultValue={[{ value: "react", label: "React 19" }]}
            options={[
              { value: "react", label: "React 19" },
              { value: "ts", label: "TypeScript 5" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const comboInput = dom.container.querySelector<HTMLInputElement>(
      ".m3e-combobox__input",
    );
    expect(comboInput?.placeholder).toBe(jaJPMessages["combobox.placeholder"]);
    expect(dom.container.querySelectorAll("fieldset.m3e-field__outline").length).toBe(2);
    expect(
      dom.container.querySelector(".m3e-multi-combobox__chip-text")?.textContent,
    ).toBe("React 19");
  });

  it("clears on controlled null reset and suppresses clear/popup when readOnly", () => {
    function ControlledNullDemo() {
      const [combo, setCombo] = React.useState<string | null>("apple");
      return (
        <div>
          <button type="button" id="clear-combo" onClick={() => setCombo(null)}>
            Clear
          </button>
          <Combobox
            label="Search fruit"
            value={combo}
            onValueChange={(opt) => setCombo(opt?.value ?? null)}
            options={[{ value: "apple", label: "Apple" }]}
          />
          <Combobox
            readOnly
            clearable
            label="Owner"
            name="owner"
            defaultValue="ada"
            options={[
              { value: "ada", label: "Ada Lovelace" },
              { value: "lin", label: "Linus Torvalds" },
            ]}
          />
        </div>
      );
    }

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <ControlledNullDemo />
        </M3EProvider>,
      );
    });

    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#clear-combo")!.click();
    });
    const comboInput = dom.container.querySelector<HTMLInputElement>(
      ".m3e-combobox__input",
    )!;
    expect(comboInput.value).toBe("");
    expect(dom.container.querySelectorAll(".m3e-combobox__clear").length).toBe(1);
  });
});
