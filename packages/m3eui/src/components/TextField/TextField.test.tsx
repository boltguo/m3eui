import * as React from "react";
import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { jaJPMessages } from "../../i18n/index.js";
import { TextField } from "./TextField.js";

describe("TextField", () => {
  const dom = setupDomTest();

  it("forwards ref, handles password toggle, clearable, affixes, localized multiline invalid message, and form reset", () => {
    const inputRef = React.createRef<HTMLInputElement>();
    let textVal = "secret123";

    act(() => {
      dom.root.render(
        <div>
          <PausedWrapper locale="en-US">
            <TextField ref={inputRef} label="Email" type="email" />
            <div data-testid="pwd-box">
              <TextField
                label="Password"
                type="password"
                defaultValue="secret123"
                clearable
                onValueChange={(v) => {
                  textVal = v;
                }}
              />
            </div>
            <div data-testid="affix-box">
              <TextField
                label="自定义域名"
                prefixText="https://"
                suffixText=".m3e.dev"
                defaultValue=""
              />
            </div>
            <form id="tf-reset-form">
              <TextField
                id="uncontrolled-tf"
                label="Query"
                defaultValue="hello"
                clearable
              />
            </form>
          </PausedWrapper>
          <PausedWrapper locale="ja-JP">
            <div data-testid="ja-tf">
              <TextField multiline label="説明" invalid />
            </div>
          </PausedWrapper>
        </div>,
      );
    });

    expect(inputRef.current?.tagName.toLowerCase()).toBe("input");

    const pwdInput = dom.container.querySelector<HTMLInputElement>(
      '[data-testid="pwd-box"] .m3e-text-field__input',
    );
    expect(pwdInput?.type).toBe("password");
    expect(pwdInput?.getAttribute("autocorrect")).toBe("off");

    const togglePwdBtn = dom.container.querySelector<HTMLButtonElement>(
      '[data-testid="pwd-box"] button[aria-label="Show password"]',
    );
    expect(togglePwdBtn).not.toBeNull();
    act(() => {
      togglePwdBtn!.click();
    });
    expect(pwdInput?.type).toBe("text");

    const clearBtn = dom.container.querySelector<HTMLButtonElement>(
      '[data-testid="pwd-box"] button[aria-label="Clear input"]',
    );
    act(() => {
      clearBtn!.click();
    });
    expect(textVal).toBe("");

    expect(
      dom.container.querySelector('[data-testid="ja-tf"]')?.textContent,
    ).toContain(jaJPMessages["textField.textareaDefaultInvalid"]);

    const textAffixes = dom.container.querySelectorAll(
      '[data-testid="affix-box"] .m3e-text-field__text-affix',
    );
    expect(textAffixes.length).toBe(2);
    expect(textAffixes[0]?.textContent).toBe("https://");
    expect(
      dom.container
        .querySelector('[data-testid="affix-box"] .m3e-text-field__shell')
        ?.hasAttribute("data-floating"),
    ).toBe(true);

    const form = dom.container.querySelector<HTMLFormElement>("#tf-reset-form")!;
    const tfInput = form.querySelector<HTMLInputElement>("#uncontrolled-tf")!;
    expect(tfInput.value).toBe("hello");
    act(() => {
      form.querySelector<HTMLButtonElement>(".m3e-text-field__icon-btn")!.click();
    });
    expect(tfInput.value).toBe("");
    act(() => {
      form.reset();
    });
    expect(tfInput.value).toBe("hello");
  });

  it("floats outlined <fieldset>/<legend> notch when populated or focused", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <TextField variant="outlined" label="Project name" />
          <TextField
            variant="outlined"
            label="Filled field"
            defaultValue="M3 Expressive"
          />
        </PausedWrapper>,
      );
    });

    const outlines = dom.container.querySelectorAll<HTMLFieldSetElement>(
      "fieldset.m3e-field__outline",
    );
    expect(outlines.length).toBe(2);
    expect(outlines[0]!.hasAttribute("data-floating")).toBe(false);
    expect(outlines[1]!.hasAttribute("data-floating")).toBe(true);

    const firstInput = dom.container.querySelector<HTMLInputElement>(
      ".m3e-text-field__input",
    )!;
    act(() => {
      firstInput.focus();
    });
    expect(outlines[0]!.hasAttribute("data-floating")).toBe(true);
  });
});
