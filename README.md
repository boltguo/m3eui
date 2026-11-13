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

Initialize `m3e.json` and generate static theme CSS:

```bash
npx m3eui init --seed "#6750A4" --variant expressive --locale en-US
```

Mount `M3EProvider`:

```tsx
import "./styles/m3e-theme.css";
import "m3eui/styles.css";
import { M3EProvider, Button, Switch, TimePickerField } from "m3eui";
import m3eConfig from "../m3e.json";

export function App() {
  return (
    <M3EProvider config={m3eConfig}>
      <Button variant="filled">Save</Button>
      <Switch label="Notifications" defaultChecked />
      <TimePickerField label="Release time" defaultValue="09:30" />
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

## Subpath Exports

| Path | Description |
| :--- | :--- |
| `m3eui` | Components, hooks, `M3EProvider`, config, i18n, and tokens |
| `m3eui/styles.css` | Component stylesheet (`--m3e-*` custom properties + `light-dark()`) |
| `m3eui/tokens` | HCT color synthesis, spring solver, corner topology, and 35 `MaterialShapes` |
| `m3eui/tokens.json` | Precomputed token and polygon JSON |
| `m3eui/i18n` | `en-US`, `zh-CN`, `ja-JP`, `ar-SA` dictionaries and `M3EMessageKey` types |
| `m3eui/config` | `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss` |
| `m3eui/primitives` | Re-exported `@base-ui/react` primitives |
| `m3eui/cli` | Programmatic CLI API |
| `m3eui/m3e.schema.json` | JSON Schema for `m3e.json` |
| `m3eui/components/*` | Individual component modules |

## CLI

```bash
npx m3eui init --seed "#0B6B58" --variant vibrant --locale zh-CN
npx m3eui sync
npx m3eui locale --list
npx m3eui locale fr-FR --out src/i18n/fr-FR.ts
npx m3eui doctor
```

## Components

| Category | Exports |
| :--- | :--- |
| **Core & Config** | `M3EProvider`, `CSPProvider`, `useM3E`, `useM3EI18n`, `getM3EInitScript`, `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss`, `useM3EScalarSpring`, `useM3ECornerSpring`, `usePressHoldState` |
| **Actions** | `Button`, `ToggleButton`, `IconButton`, `IconToggleButton`, `SplitButton`, `ButtonGroup`, `FloatingToolbar`, `FABMenu`, `FAB`, `ExtendedFAB` |
| **Inputs & Pickers** | `Form`, `Fieldset`, `SearchBar`, `OTPField`, `DockedDatePicker`, `DatePickerField`, `DateRangePicker`, `TimePicker`, `TimePickerField`, `TextField`, `TextareaField`, `NumberField`, `Combobox`, `Select`, `Switch`, `Slider`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` |
| **Display & Surfaces** | `Collapsible`, `Accordion`, `Carousel`, `DataTable`, `Skeleton`, `AssistChip`, `FilterChip`, `InputChip`, `Avatar`, `Badge`, `Card`, `SegmentedList`, `SegmentedListItem`, `PreviewCard`, `ScrollArea`, `Divider` |
| **Navigation** | `NavigationMenu`, `TopAppBar`, `NavigationBar`, `NavigationRail`, `WideNavigationRail`, `NavigationDrawer`, `NavigationSuite`, `Menubar`, `Tabs`, `TabsList`, `Tab`, `TabsPanel` |
| **Overlays & Feedback** | `Sheet`, `BottomSheet`, `SideSheet`, `SheetClose`, `Popover`, `PopoverClose`, `DropdownMenu`, `ContextMenu`, `Dialog`, `DialogClose`, `AlertDialog`, `AlertDialogClose`, `Tooltip`, `RichTooltip`, `useM3EToast`, `LinearProgressIndicator`, `CircularProgressIndicator`, `Meter`, `LoadingIndicator`, `ContainedLoadingIndicator`, `WavyProgressIndicator`, `LinearWavyProgressIndicator`, `CircularWavyProgressIndicator`, `MaterialShapeView` |

## Development

| Directory | Description |
| :--- | :--- |
| `packages/m3eui` | `m3eui` npm package |
| `apps/playground` | Interactive component showcase |

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm test
pnpm m3e:doctor
```

## License

[Apache-2.0](./LICENSE)
