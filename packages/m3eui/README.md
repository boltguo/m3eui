# m3eui

**English** | [简体中文](./README.zh-CN.md)

All-in-one **Material 3 Expressive (`1.5.0`)** React component library, HCT color & 5-platform spring physics engine, 100% key-driven internationalization with automatic RTL mirroring, and built-in `m3e.json` CLI — built on `@base-ui/react` (`1.9.0`) and native semantic CSS (`light-dark()`).

## Install

Everything ships in **one single package** (`m3eui` — components, styles, math tokens, and CLI):

```bash
pnpm add m3eui
# or
npm install m3eui
```

Peer dependencies: `react >= 18.0.0`, `react-dom >= 18.0.0`.

## Quick Start

```bash
# Optional: generate m3e.json + zero-JS-flash static theme CSS
npx m3eui init --seed "#6750A4" --variant expressive --locale en-US
```

```tsx
import "./styles/m3e-theme.css";
import "m3eui/styles.css";
import { M3EProvider, Button, Switch, DatePickerField } from "m3eui";
import m3eConfig from "../m3e.json";

export function App() {
  return (
    <M3EProvider config={m3eConfig}>
      <Button variant="filled">Continue</Button>
      <Switch label="Notifications" defaultChecked />
      <DatePickerField label="Launch Date" defaultValue="2026-11-18" />
    </M3EProvider>
  );
}
```

## Subpath Exports & Built-in CLI

- `m3eui` — All 60+ components, hooks, `M3EProvider`, `CSPProvider`, `getM3EInitScript`, config & design tokens
- `m3eui/styles.css` — Core semantic stylesheet (`--m3e-*` custom properties + `light-dark()`)
- `m3eui/tokens` & `m3eui/tokens.json` — Zero-React HCT color math, 5-platform spring solver, corner topology & 35 `MaterialShapes`
- `m3eui/i18n` — Built-in `en-US` / `zh-CN` / `ja-JP` / `ar-SA` dictionaries & 78 typed `M3EMessageKey`s
- `m3eui/config` — `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss`
- `m3eui/primitives` — Re-exported `@base-ui/react` headless primitives
- `m3eui/m3e.schema.json` — JSON Schema for `m3e.json` IDE autocompletion
- `m3eui/components/*` — Granular per-module imports (e.g. `m3eui/components/Button`)
- **Built-in CLI (`npx m3eui` / `npx m3e`)**: `init`, `sync`, `locale`, `doctor`

## License

Apache-2.0
