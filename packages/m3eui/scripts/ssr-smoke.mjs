import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import * as React from "react";
import { renderToString } from "react-dom/server";
import * as m3e from "m3eui";
import * as tokens from "m3eui/tokens";
import * as config from "m3eui/config";
import * as i18n from "m3eui/i18n";
import { enUSMessages } from "m3eui/i18n/en-US";
import { zhCNMessages } from "m3eui/i18n/zh-CN";
import * as primitives from "m3eui/primitives";
import { Button as DirectButton } from "m3eui/components/Button";

const req = createRequire(import.meta.url);
const stylesCssPath = req.resolve("m3eui/styles.css");
const baseStylesCssPath = req.resolve("m3eui/styles/base.css");
const buttonStylesCssPath = req.resolve("m3eui/components/Button/styles.css");
const tailwindCssPath = req.resolve("m3eui/tailwind.css");
if (
  !existsSync(stylesCssPath) ||
  !existsSync(baseStylesCssPath) ||
  !existsSync(buttonStylesCssPath) ||
  !existsSync(tailwindCssPath)
) {
  throw new Error(
    "Missing built stylesheet exports (styles.css / styles/base.css / components/Button/styles.css / tailwind.css)",
  );
}
if (
  typeof tokens.extractSeedHexFromImageBytes !== "function" ||
  typeof config.generateM3EStaticThemeCss !== "function" ||
  !i18n.enUSMessages ||
  !enUSMessages ||
  !zhCNMessages ||
  !primitives.CSPProvider ||
  !DirectButton
) {
  throw new Error("Missing expected m3eui subpath exports");
}

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
  Avatar: () => h(m3e.Avatar, { alt: "Ada Lovelace", fallback: "AL" }),
  Alert: () => h(m3e.Alert, null, "Alert"),
  Divider: () => h(m3e.Divider),
  List: () => h(m3e.List, null, h(m3e.ListItem, { headline: "Row" })),
  NavigationRail: () =>
    h(m3e.NavigationRail, { items: options, value: "a", onValueChange() {}, defaultExpanded: true }),
  CompactNavigationRail: () =>
    h(m3e.NavigationRail, { items: options, value: null, onValueChange() {}, expanded: true, modal: "auto", density: "compact" }),
  Accordion: () =>
    h(m3e.Accordion, { items: [{ value: "1", title: "One", content: "Content" }] }),
  Badge: () => h(m3e.Badge, { count: 3 }, h("span", null, "Mail")),
  Breadcrumb: () =>
    h(m3e.Breadcrumb, { items: [{ label: "Home", href: "/" }, { label: "Docs" }] }),
  DataTable: () =>
    h(m3e.DataTable, {
      caption: "Rows",
      columns: [{ id: "name", header: "Name", cell: (r) => r.name }],
      rows: [{ id: "1", name: "Alpha" }],
      getRowKey: (r) => r.id,
    }),
  DatePicker: () => h(m3e.DatePicker, { defaultValue: "2026-11-27" }),
  Dialog: () => h(m3e.Dialog, { trigger: h("button"), title: "Dialog" }, "Body"),
  Empty: () => h(m3e.Empty, { title: "Empty" }),
  Kbd: () => h(m3e.Kbd, { keys: ["mod", "K"] }),
  Pagination: () => h(m3e.Pagination, { totalPages: 4, defaultPage: 1 }),
  Popover: () => h(m3e.Popover, { trigger: h("button"), title: "Info" }, "Body"),
  ScrollArea: () => h(m3e.ScrollArea, null, "Scrollable"),
  Sheet: () => h(m3e.Sheet, { trigger: h("button"), title: "Sheet" }, "Body"),
  Snippet: () => h(m3e.Snippet, { code: "pnpm add m3eui" }),
  Tabs: () =>
    h(
      m3e.Tabs,
      { defaultValue: "one" },
      h(m3e.TabsList, null, h(m3e.Tab, { value: "one" }, "One")),
      h(m3e.TabsPanel, { value: "one" }, "Panel"),
    ),
  TimePicker: () => h(m3e.TimePicker, { defaultValue: "09:30" }),
  Tooltip: () => h(m3e.Tooltip, { content: "Tip" }, h("button", null, "Hover")),
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
