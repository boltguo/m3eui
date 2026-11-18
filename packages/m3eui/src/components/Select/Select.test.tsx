import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { zhCNMessages } from "../../i18n/index.js";
import { Select } from "./Select.js";

describe("Select", () => {
  const dom = setupDomTest();

  it("renders canonical M3 4px floating corners by default and 12px corners when labelPosition is outside", () => {
    const options = [
      { value: "expressive", label: "Expressive" },
      { value: "vibrant", label: "Vibrant" },
    ];

    act(() => {
      dom.root.render(
        <PausedWrapper>
          <Select
            variant="filled"
            label="色彩方案"
            options={options}
            defaultValue="expressive"
          />
          <Select
            variant="outlined"
            label="边框方案"
            options={options}
            defaultValue="vibrant"
          />
          <Select
            variant="filled"
            labelPosition="outside"
            label="外部填充"
            options={options}
            defaultValue="expressive"
          />
          <Select
            variant="outlined"
            labelPosition="outside"
            label="外部边框"
            options={options}
            defaultValue="vibrant"
          />
        </PausedWrapper>,
      );
    });

    const triggers = dom.container.querySelectorAll<HTMLElement>(
      ".m3e-select__trigger",
    );
    expect(triggers.length).toBe(4);
    expect(triggers[0]!.style.borderRadius).toBe("4px 4px 0px 0px");
    expect(triggers[1]!.style.borderRadius).toBe("4px");
    expect(triggers[2]!.style.borderRadius).toBe("12px 12px 0px 0px");
    expect(triggers[3]!.style.borderRadius).toBe("12px");
  });

  it("places <fieldset>/<legend> outline notch directly inside .m3e-select__shell and never inside trigger", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Select
            variant="outlined"
            label="Model (Outlined)"
            defaultValue="pro"
            options={[
              { value: "pro", label: "Gemini 2.5 Pro" },
              { value: "flash", label: "Gemini 2.5 Flash" },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const outline = dom.container.querySelector<HTMLFieldSetElement>(
      "fieldset.m3e-field__outline",
    );
    expect(outline?.hasAttribute("data-floating")).toBe(true);

    const selectShellOutlines = dom.container.querySelectorAll<HTMLFieldSetElement>(
      ".m3e-select__shell > fieldset.m3e-field__outline",
    );
    expect(selectShellOutlines.length).toBe(1);
    expect(
      dom.container.querySelector(".m3e-select__trigger fieldset.m3e-field__outline"),
    ).toBeNull();
    const selectShell = dom.container.querySelector<HTMLElement>(".m3e-select__shell");
    expect(selectShell?.style.borderRadius).toBe("4px");
  });

  it("supports single clearable with groups, multiple clearable with maxVisibleTags, controlled null reset, and flush scrollport", () => {
    let selectedVal: string | null = "pro";
    let multiValues: string[] = ["design", "eng"];

    function ControlledNullDemo() {
      const [sel, setSel] = React.useState<string | null>("apple");
      return (
        <div>
          <button
            type="button"
            id="clear-sel"
            onClick={() => {
              setSel(null);
            }}
          >
            Clear
          </button>
          <Select
            label="Fruit"
            value={sel}
            onValueChange={setSel}
            options={[{ value: "apple", label: "Apple" }]}
          />
        </div>
      );
    }

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <PausedWrapper locale="zh-CN">
            <Select
              label="部署实例"
              clearable
              value={selectedVal}
              onValueChange={(v) => {
                selectedVal = v;
              }}
              groups={[
                {
                  label: "亚太区",
                  options: [
                    { value: "pro", label: "Tokyo Pro" },
                    { value: "std", label: "Singapore Standard" },
                  ],
                },
              ]}
            />
            <Select
              multiple
              label="负责团队"
              maxVisibleTags={1}
              value={multiValues}
              onValueChange={(next) => {
                multiValues = next;
              }}
              options={[
                { value: "design", label: "设计系统" },
                { value: "eng", label: "前端架构" },
                { value: "qa", label: "质量保障" },
              ]}
            />
            <ControlledNullDemo />
            <Select
              readOnly
              clearable
              label="Role"
              name="role"
              defaultValue="admin"
              options={[
                { value: "admin", label: "Admin" },
                { value: "viewer", label: "Viewer" },
              ]}
            />
          </PausedWrapper>
        </M3EProvider>,
      );
    });

    const singleClearBtns = dom.container.querySelectorAll<HTMLButtonElement>(
      ".m3e-select__clear-btn",
    );
    expect(singleClearBtns.length).toBe(2);
    expect(singleClearBtns[0]?.getAttribute("aria-label")).toBe(
      zhCNMessages["select.clear"],
    );
    act(() => {
      singleClearBtns[0]?.click();
    });
    expect(selectedVal).toBeNull();

    const multiClear = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-multi-select .m3e-select__clear-btn",
    );
    expect(multiClear).not.toBeNull();
    act(() => {
      multiClear?.click();
    });
    expect(multiValues).toEqual([]);

    // Controlled null reset
    act(() => {
      dom.container.querySelector<HTMLButtonElement>("#clear-sel")!.click();
    });

    // Open flush scrollport check on first non-readOnly trigger
    const triggers = dom.container.querySelectorAll<HTMLButtonElement>(
      ".m3e-select__trigger",
    );
    const readOnlyTrigger = triggers[3]!;
    act(() => {
      readOnlyTrigger.click();
    });
    expect(dom.container.querySelector("[data-popup-open]")).toBeNull();

    act(() => {
      triggers[0]?.click();
    });
    const selectPopup = document.body.querySelector<HTMLElement>(".m3e-select__popup");
    const selectList = document.body.querySelector<HTMLElement>(".m3e-select__list");
    expect(selectPopup).not.toBeNull();
    expect(selectPopup?.style.padding).toBe("");
    expect(selectList?.style.padding).not.toBe("");
  });
});
