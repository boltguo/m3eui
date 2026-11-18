import { act } from "react";
import { describe, expect, it, vi } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { ColorPickerField } from "../ColorPicker/ColorPicker.js";
import { DatePickerField } from "../DatePicker/DatePicker.js";
import { Radio, RadioGroup } from "../RadioGroup/RadioGroup.js";
import { Slider } from "../Slider/Slider.js";
import { Switch } from "../Switch/Switch.js";
import { TextField } from "../TextField/TextField.js";
import { TimePickerField } from "../TimePicker/TimePicker.js";
import { Fieldset, Form } from "./Form.js";

describe("Form & Fieldset", () => {
  const dom = setupDomTest();

  it("passes every named m3eui control to onFormSubmit", async () => {
    const onFormSubmit = vi.fn();
    await act(async () => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Form onFormSubmit={onFormSubmit}>
            <TextField label="Title" name="title" defaultValue="Launch" />
            <Switch label="Notify" name="notify" defaultChecked />
            <Checkbox label="Terms" name="terms" defaultChecked />
            <RadioGroup name="plan" defaultValue="pro" aria-label="Plan">
              <Radio value="free" label="Free" />
              <Radio value="pro" label="Pro" />
            </RadioGroup>
            <Slider name="volume" defaultValue={40} aria-label="Volume" />
            <DatePickerField label="Date" name="date" defaultValue="2026-11-16" />
            <DatePickerField
              mode="range"
              label="Range"
              name="range"
              defaultValue={{ start: "2026-11-16", end: "2026-11-20" }}
            />
            <TimePickerField label="Time" name="time" defaultValue="14:30" />
            <ColorPickerField label="Color" name="color" defaultValue="#6750A4" />
            <button type="submit">Save</button>
          </Form>
        </M3EProvider>,
      );
    });

    await act(async () => {
      dom.container.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    });

    expect(onFormSubmit).toHaveBeenCalledTimes(1);
    expect(onFormSubmit.mock.calls[0]?.[0]).toEqual({
      title: "Launch",
      notify: true,
      terms: true,
      plan: "pro",
      volume: 40,
      date: "2026-11-16",
      range: "2026-11-16/2026-11-20",
      time: "14:30",
      color: "#6750A4",
    });
  });

  it("blocks submit when a required checkbox is unchecked", async () => {
    const onFormSubmit = vi.fn();
    await act(async () => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Form onFormSubmit={onFormSubmit}>
            <Checkbox label="Terms" name="terms" required />
            <button type="submit">Save</button>
          </Form>
        </M3EProvider>,
      );
    });
    await act(async () => {
      dom.container.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    });
    expect(onFormSubmit).not.toHaveBeenCalled();
  });

  it("renders error summary, Fieldset legend, and propagates disabled state to controls", () => {
    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <Form errors={{ username: "该用户名已被注册" }} showErrorSummary>
            <Fieldset legend="账号安全配置" description="管理登录凭据" disabled>
              <TextField id="fs-input" label="Name" />
              <Switch label="Alerts" />
              <Slider label="Volume" defaultValue={40} />
              <input name="username" defaultValue="m3e" />
            </Fieldset>
          </Form>
        </PausedWrapper>,
      );
    });

    const fieldset = dom.container.querySelector("fieldset.m3e-fieldset")!;
    expect(fieldset.firstElementChild?.tagName.toLowerCase()).toBe("legend");
    expect(dom.container.querySelector('[role="alert"]')?.textContent).toContain("该用户名已被注册");
    expect(dom.container.querySelector<HTMLInputElement>("#fs-input")?.disabled).toBe(true);
    expect(
      dom.container.querySelector(".m3e-fieldset .m3e-switch")?.hasAttribute("data-disabled"),
    ).toBe(true);
  });
});
