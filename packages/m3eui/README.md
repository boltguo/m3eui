# m3eui

**English** | [简体中文](./README.zh-CN.md)

Material 3 Expressive React component library built on `@base-ui/react`, with HCT color generation, spring motion tokens, `m3e.json` CLI, and built-in i18n/RTL support.

## Install

```bash
pnpm add m3eui
# or
npm install m3eui
```

Peer dependencies: `react >= 18.0.0`, `react-dom >= 18.0.0`.

## Quick Start

```bash
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

## Subpath Exports & CLI

- `m3eui` — Components, hooks, `M3EProvider`, `CSPProvider`, `getM3EInitScript`, config, and tokens
- `m3eui/styles.css` — Component stylesheet (`--m3e-*` custom properties + `light-dark()`)
- `m3eui/tokens` & `m3eui/tokens.json` — HCT color synthesis, spring solver, corner topology, and 35 `MaterialShapes`
- `m3eui/i18n` — `en-US`, `zh-CN`, `ja-JP`, `ar-SA` dictionaries and `M3EMessageKey` types
- `m3eui/config` — `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss`
- `m3eui/primitives` — Re-exported `@base-ui/react` primitives
- `m3eui/m3e.schema.json` — JSON Schema for `m3e.json`
- `m3eui/components/*` — Individual component modules
- **CLI (`npx m3eui` / `npx m3e`)**: `init`, `sync`, `locale`, `doctor`

## License

[Apache-2.0](./LICENSE)
