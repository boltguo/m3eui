<div align="center">

<h1>m3eui</h1>

<p>Material 3 Expressive React component library built on <code>@base-ui/react</code> with HCT dynamic color, spring physics, and built-in i18n/RTL.</p>

<p>
<a href="https://www.npmjs.com/package/m3eui"><img alt="npm version" src="https://img.shields.io/npm/v/m3eui" /></a>
<a href="https://www.npmjs.com/package/m3eui"><img alt="npm downloads" src="https://img.shields.io/npm/dw/m3eui?label=downloads" /></a>
<a href="https://github.com/boltguo/m3eui/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/boltguo/m3eui/ci.yml?branch=main&logo=github&label=CI" /></a>
<a href="https://react.dev"><img alt="react peer dependency" src="https://img.shields.io/badge/react-%3E%3D18-087EA4" /></a>
<a href="./LICENSE"><img alt="license" src="https://img.shields.io/github/license/boltguo/m3eui" /></a>
</p>

<p>English | <a href="./README.zh-CN.md">简体中文</a></p>

<p><a href="https://m3eui.vercel.app"><strong>Docs &amp; Playground</strong></a></p>

</div>

## Features

- **Accessible Components** — 53 component modules (75+ exports) built on `@base-ui/react` with full ARIA, keyboard navigation, and RTL support.
- **2025 AOSP Monet HCT** — 61 semantic color roles (including `success` and `warning`), 9 scheme variants, contrast `[-1, 1]`, and native CSS `light-dark()`.
- **Spring Physics & Shapes** — Spatial and effects spring presets (`expressive` / `standard`), corner morphing, and 35 `MaterialShapes`.
- **Static CSS or Runtime Engine** — Zero-runtime-cost CSS generated via CLI (`m3eui init` / `sync`), with optional browser HCT switching (`themeEngine={generateM3EThemeTokens}`).
- **RSC & SSR Ready** — Pure server-safe `tokens`, `config`, and `i18n` entrypoints, `@layer m3e.tokens, m3e.base, m3e.components`, `getM3EInitScript()`, and `CSPProvider`.
- **Built-in i18n & RTL** — `en-US`, `zh-CN`, `ja-JP`, and `ar-SA` dictionaries, automatic BCP 47 RTL direction, CLDR date/time formatting, and CLI locale scaffolding.

## Installation

```bash
pnpm add m3eui
# or
npm install m3eui
```

Requirements: `react >= 18.0.0`, `react-dom >= 18.0.0`, and `node >= 20.0.0` for the CLI.

## Quick Start

Initialize `m3e.json` and generate static theme CSS:

```bash
npx m3eui init --seed "#6750A4" --variant expressive --locale en-US
```

Mount `M3EProvider`:

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

### Next.js App Router

```tsx
import "./styles/m3e-theme.css";
import "m3eui/styles.css";
import { M3EProvider, getM3EInitScript } from "m3eui";
import m3eConfig from "../m3e.json";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: getM3EInitScript() }} />
      </head>
      <body>
        <M3EProvider config={m3eConfig}>{children}</M3EProvider>
      </body>
    </html>
  );
}
```

### Runtime Theming

Colors come from static `m3e-theme.css` by default. To recompute HCT palettes dynamically in the browser, pass `themeEngine={generateM3EThemeTokens}`:

```tsx
import { M3EProvider } from "m3eui";
import { generateM3EThemeTokens } from "m3eui/tokens";
import m3eConfig from "../m3e.json";

export function DynamicApp({ children }: { children: React.ReactNode }) {
  return (
    <M3EProvider config={m3eConfig} themeEngine={generateM3EThemeTokens}>
      {children}
    </M3EProvider>
  );
}
```

## Configuration (`m3e.json`)

```json
{
  "$schema": "https://unpkg.com/m3eui/m3e.schema.json",
  "style": "expressive",
  "theme": {
    "seed": "#6750A4",
    "schemeVariant": "expressive",
    "platform": "phone",
    "colorMode": "system",
    "contrastLevel": 0,
    "motionScheme": "expressive"
  },
  "i18n": {
    "locale": "en-US",
    "direction": "auto"
  },
  "css": {
    "output": "src/styles/m3e-theme.css"
  }
}
```

## CLI

Both `npx m3eui` and `npx m3e` are supported.

| Command | Description |
| :--- | :--- |
| `npx m3eui init [--seed] [--variant] [--locale] [--output] [--force]` | Create `m3e.json` and generate static theme CSS |
| `npx m3eui sync [--config]` | Regenerate static theme CSS from `m3e.json` |
| `npx m3eui locale --list \| <bcp47-tag> [--out] [--force]` | List built-in locales or scaffold a custom locale pack |
| `npx m3eui doctor [--config]` | Validate `m3e.json`, theme CSS sync, and i18n checks |

## Subpath Exports

| Path | Description |
| :--- | :--- |
| `m3eui` | RSC-safe barrel for components, hooks, `M3EProvider`, `M3EPortal`, config, i18n, and tokens |
| `m3eui/styles.css` | Component stylesheet (`--m3e-*` custom properties + `light-dark()`) |
| `m3eui/tokens` | Pure RSC-safe 61-role HCT color synthesis, spring solver, corner topology, `parseShortcutKeys`, and 35 `MaterialShapes` (`getMaterialShape`) |
| `m3eui/tokens.json` | Precomputed token and polygon JSON |
| `m3eui/i18n` | RSC-safe `en-US`, `zh-CN`, `ja-JP`, `ar-SA` dictionaries and `M3EMessageKey` types |
| `m3eui/config` | RSC-safe `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss` |
| `m3eui/primitives` | Re-exported `@base-ui/react` primitives |
| `m3eui/cli` | Programmatic CLI API |
| `m3eui/m3e.schema.json` | JSON Schema for `m3e.json` |
| `m3eui/components/*` | Individual component modules |

## Components

| Category | Exports |
| :--- | :--- |
| **Core & Hooks** | `M3EProvider`, `M3EPortal`, `CSPProvider`, `useM3E`, `useM3EI18n`, `useM3EPortalContainer`, `getM3EInitScript`, `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss`, `useM3EScalarSpring`, `useM3EScalarSpringEffect`, `useM3ECornerSpring`, `useM3ECornerSpringRef`, `usePressHoldState` |
| **Actions** | `Button`, `ButtonGroup`, `IconButton`, `SplitButton`, `FAB`, `FABMenu`, `FloatingToolbar`, `CopyButton` |
| **Inputs & Forms** | `TextField`, `NumberField`, `OTPField`, `Select`, `Combobox`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Slider`, `DatePicker`, `DatePickerField`, `TimePicker`, `TimePickerField`, `ColorPicker`, `ColorPickerField`, `ColorSwatch`, `FileUpload`, `FileUploadDropzone`, `Form`, `Fieldset` |
| **Navigation** | `TopAppBar`, `AppBarRow`, `NavigationBar`, `NavigationRail`, `Tabs`, `TabsList`, `Tab`, `TabsPanel`, `Breadcrumb`, `Pagination`, `SearchBar`, `SearchView`, `CommandPalette` |
| **Data Display** | `Accordion`, `Avatar`, `AvatarGroup`, `Badge`, `Card`, `Carousel`, `Chip`, `DataTable`, `Divider`, `Empty`, `Kbd`, `List`, `ListItem`, `MaterialShapeView`, `Meter`, `Snippet` |
| **Feedback & Progress** | `Alert`, `CircularProgressIndicator`, `LinearProgressIndicator`, `LoadingIndicator`, `Skeleton`, `useM3EToast` |
| **Overlays & Utility** | `Dialog`, `DialogClose`, `AlertDialog`, `AlertDialogClose`, `Sheet`, `SheetClose`, `Popover`, `PopoverClose`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `ScrollArea`, `DragHandle` |

## Development

| Directory | Description |
| :--- | :--- |
| `packages/m3eui` | `m3eui` npm package |
| `apps/playground` | Interactive component showcase |

```bash
pnpm install
pnpm dev
pnpm verify
```

Individual scripts: `pnpm build`, `pnpm build:lib`, `pnpm typecheck`, `pnpm test`, `pnpm m3e:sync`, `pnpm m3e:doctor`.

## Acknowledgments

Built on [@base-ui/react](https://base-ui.com), with color and shape math derived from [material-color-utilities](https://github.com/material-foundation/material-color-utilities) and [AndroidX Compose Material 3](https://android.googlesource.com/platform/frameworks/support) (see [NOTICE](./NOTICE)).

## License

[Apache-2.0](./LICENSE)
