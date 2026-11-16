import * as React from "react";
import { renderToString } from "react-dom/server";
import * as m3e from "m3eui";

const h = React.createElement;
const items = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
];
const options = [
  { value: "a", label: "A" },
  { value: "b", label: "B" },
];

const cases = {
  Button: () => h(m3e.Button, null, "Button"),
  IconButton: () => h(m3e.IconButton, { "aria-label": "Icon", icon: "+" }),
  SplitButton: () => h(m3e.SplitButton, { menuItems: items }, "Split"),
  FAB: () => h(m3e.FAB, { "aria-label": "Add", icon: "+" }),
  TextField: () => h(m3e.TextField, { label: "Name" }),
  Select: () => h(m3e.Select, { label: "Pick", options }),
  Combobox: () => h(m3e.Combobox, { label: "Find", options }),
  Switch: () => h(m3e.Switch, { "aria-label": "Switch" }),
  Checkbox: () => h(m3e.Checkbox, { label: "Check" }),
  Slider: () => h(m3e.Slider, { "aria-label": "Slider", defaultValue: 40 }),
  Chip: () => h(m3e.Chip, null, "Chip"),
  Card: () => h(m3e.Card, null, "Card"),
  DropdownMenu: () => h(m3e.DropdownMenu, { trigger: h("button"), items }),
  LoadingIndicator: () => h(m3e.LoadingIndicator),
  Avatar: () => h(m3e.Avatar, { name: "Ada Lovelace" }),
  Alert: () => h(m3e.Alert, null, "Alert"),
  Divider: () => h(m3e.Divider),
  SegmentedList: () =>
    h(m3e.SegmentedList, null, h(m3e.ListItem, { headline: "Row" })),
};

const errors = [];
const originalError = console.error;
console.error = (...args) => errors.push(args.map(String).join(" "));

let failed = 0;
for (const [name, render] of Object.entries(cases)) {
  try {
    const html = renderToString(h(m3e.M3EProvider, null, render()));
    if (!html.includes("m3e")) throw new Error("empty markup");
  } catch (error) {
    failed++;
    originalError(`✗ ${name}: ${error instanceof Error ? error.message : error}`);
  }
}
console.error = originalError;

for (const message of errors) console.error(`console.error: ${message.slice(0, 300)}`);
console.log(
  `React ${React.version}: ${Object.keys(cases).length - failed}/${Object.keys(cases).length} rendered, ${errors.length} console errors`,
);
if (failed || errors.length) process.exit(1);
