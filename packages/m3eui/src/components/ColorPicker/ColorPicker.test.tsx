import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Button } from "../Button/Button.js";
import { Popover } from "../Popover/Popover.js";
import { ColorPicker, ColorPickerField, ColorSwatch } from "./ColorPicker.js";

describe("ColorPicker", () => {
  const dom = setupDomTest();

  it("renders HCT swatches, tonal ramp, ColorPickerField, and ColorSwatch", () => {
    let pickedHex = "#6750A4";
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <ColorPicker
            defaultValue="#6750A4"
            onValueChange={(hex) => {
              pickedHex = hex;
            }}
          />
          <ColorPickerField label="主题种子色" defaultValue="#0B6B58" />
          <ColorSwatch value="#6750A4" />
        </PausedWrapper>,
      );
    });

    const swatchBtns = dom.container.querySelectorAll<HTMLButtonElement>(
      ".m3e-color-swatch__item",
    );
    expect(swatchBtns.length).toBeGreaterThanOrEqual(8);
    expect(
      dom.container.querySelectorAll(".m3e-color-picker__ramp-stop").length,
    ).toBe(10);
    act(() => {
      swatchBtns[1]?.click();
    });
    expect(pickedHex).toBe("#0B6B58");
  });

  it("opens ColorPicker inside Popover via Button trigger", () => {
    let pickedHex = "#6750A4";
    act(() => {
      dom.root.render(
        <PausedWrapper>
          <Popover
            trigger={
              <Button size="xs" variant="outlined">
                Custom
              </Button>
            }
          >
            <ColorPicker
              value={pickedHex}
              onValueChange={(next) => {
                pickedHex = next;
              }}
            />
          </Popover>
        </PausedWrapper>,
      );
    });

    const customBtn = Array.from(
      document.body.querySelectorAll<HTMLButtonElement>(".m3e-button"),
    ).find((b) => b.textContent?.includes("Custom"));
    expect(customBtn).not.toBeUndefined();
    expect(customBtn?.getAttribute("aria-expanded")).toBe("false");

    act(() => {
      customBtn?.click();
    });

    expect(customBtn?.getAttribute("aria-expanded")).toBe("true");
    const picker = document.body.querySelector<HTMLElement>(
      ".m3e-popover .m3e-color-picker",
    );
    expect(picker).not.toBeNull();
  });
});
