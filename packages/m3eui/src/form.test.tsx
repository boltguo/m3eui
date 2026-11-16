// @vitest-environment happy-dom
import * as React from "react";
import { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Checkbox,
  ColorPickerField,
  DatePickerField,
  DateRangePickerField,
  DateTimePickerField,
  Form,
  M3EProvider,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  TextField,
  TimePickerField,
} from "./index.js";

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

describe("Form field integration", () => {
  let container: HTMLDivElement;
  let root: Root;

  beforeEach(() => {
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
  });

  it("passes every named m3eui control to onFormSubmit", async () => {
    const onFormSubmit = vi.fn();
    await act(async () => {
      root.render(
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
            <DateRangePickerField
              label="Range"
              name="range"
              defaultValue={{ start: "2026-11-16", end: "2026-11-20" }}
            />
            <DateTimePickerField
              label="When"
              name="when"
              defaultValue={{ date: "2026-11-16", time: "09:30" }}
            />
            <TimePickerField label="Time" name="time" defaultValue="14:30" />
            <ColorPickerField label="Color" name="color" defaultValue="#6750A4" />
            <button type="submit">Save</button>
          </Form>
        </M3EProvider>,
      );
    });

    await act(async () => {
      container.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
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
      when: "2026-11-16T09:30",
      time: "14:30",
      color: "#6750A4",
    });
  });

  it("blocks submit when a required checkbox is unchecked", async () => {
    const onFormSubmit = vi.fn();
    await act(async () => {
      root.render(
        <M3EProvider syncDocumentRoot={false}>
          <Form onFormSubmit={onFormSubmit}>
            <Checkbox label="Terms" name="terms" required />
            <button type="submit">Save</button>
          </Form>
        </M3EProvider>,
      );
    });
    await act(async () => {
      container.querySelector<HTMLButtonElement>('button[type="submit"]')?.click();
    });
    expect(onFormSubmit).not.toHaveBeenCalled();
  });
});
