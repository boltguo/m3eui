import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { Form } from "../Form/Form.js";
import { OTPField } from "./OTPField.js";

describe("OTPField", () => {
  const dom = setupDomTest();

  it("renders OTP slots for the configured length inside and outside forms", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <form id="otp-form">
            <OTPField length={4} defaultValue="12" aria-label="Verification code" />
            <OTPField length={6} defaultValue="123456" label="One-time code" />
          </form>
        </PausedWrapper>,
      );
    });

    const forms = dom.container.querySelectorAll(".m3e-otp-field");
    expect(forms.length).toBe(2);
    expect(forms[0]!.querySelectorAll(".m3e-otp-field__slot").length).toBe(4);
    expect(forms[1]!.querySelectorAll(".m3e-otp-field__slot").length).toBe(6);
  });

  it("sets data-invalid and renders .m3e-field__error for both invalid and errorMessage", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <div id="otp-msg">
            <OTPField length={4} errorMessage="Code expired" aria-label="Code A" />
          </div>
          <div id="otp-inv">
            <OTPField length={4} invalid aria-label="Code B" />
          </div>
        </PausedWrapper>,
      );
    });

    const msgGroup = dom.container.querySelector("#otp-msg .m3e-otp-field")!;
    expect(msgGroup.hasAttribute("data-invalid")).toBe(true);
    expect(dom.container.querySelector("#otp-msg .m3e-field__error")?.textContent).toContain(
      "Code expired",
    );

    const invGroup = dom.container.querySelector("#otp-inv .m3e-otp-field")!;
    expect(invGroup.hasAttribute("data-invalid")).toBe(true);
    expect(dom.container.querySelector("#otp-inv .m3e-field__error")).not.toBeNull();
  });

  it("propagates Base UI Form errors into OTPField wrap and .m3e-field__error", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="en-US">
          <Form errors={{ code: "Invalid verification code" }}>
            <OTPField name="code" length={4} label="Code" />
          </Form>
        </PausedWrapper>,
      );
    });

    const wrap = dom.container.querySelector(".m3e-otp-field-wrap")!;
    expect(wrap.hasAttribute("data-invalid")).toBe(true);
    expect(dom.container.querySelector(".m3e-field__error")?.textContent).toContain(
      "Invalid verification code",
    );
  });
});
