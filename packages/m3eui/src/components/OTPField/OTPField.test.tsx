import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
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
});
