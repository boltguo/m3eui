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

### Runtime theming

Colors come from the generated theme CSS. To change seed, scheme variant, or contrast at runtime, pass the HCT engine:

```tsx
import { generateM3EThemeTokens } from "m3eui/tokens";

<M3EProvider config={m3eConfig} themeEngine={generateM3EThemeTokens}>
```

## Subpath Exports

| Path | Description |
| :--- | :--- |
| `m3eui` | RSC-safe barrel for components, hooks, `M3EProvider`, `M3EPortal`, config, i18n, and tokens |
| `m3eui/styles.css` | Component stylesheet (`--m3e-*` custom properties + `light-dark()`) |
| `m3eui/tokens` | Pure RSC-safe 61-role HCT color synthesis (`primary`/`secondary`/`tertiary`/`error`/`success`/`warning`), spring solver, corner topology, `parseShortcutKeys`, and 35 `MaterialShapes` (`getMaterialShape`) |
| `m3eui/tokens.json` | Precomputed token and polygon JSON |
| `m3eui/i18n` | RSC-safe `en-US`, `zh-CN`, `ja-JP`, `ar-SA` dictionaries and `M3EMessageKey` types |
| `m3eui/config` | RSC-safe `defineM3EConfig`, `resolveM3EConfig` (`colorMode: "system"` default), `serializeM3EConfig`, `generateM3EStaticThemeCss` |
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
| **Core & Config** | `M3EProvider`, `M3EPortal`, `CSPProvider`, `useM3E`, `useM3EI18n`, `useM3EPortalContainer`, `getM3EInitScript`, `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss`, `useM3EScalarSpring`, `useM3ECornerSpring`, `useM3ECornerSpringRef`, `usePressHoldState` |
| **Actions** | `Button`, `ToggleButton`, `IconButton`, `IconToggleButton`, `SplitButton`, `ButtonGroup`, `FloatingToolbar`, `DockedToolbar`, `FABMenu`, `FAB` (`xs`/`sm`/`md`/`lg`, default `sm`), `ExtendedFAB`, `CopyButton` |
| **Inputs & Selection** | `Form`, `Fieldset`, `TextField`, `TextareaField`, `NumberField`, `OTPField`, `Select`, `MultiSelect`, `Combobox`, `MultiCombobox`, `FileUpload`, `FileUploadDropzone`, `ColorPicker`, `ColorPickerField`, `ColorSwatch`, `DockedDatePicker`, `DatePickerField`, `DateRangePicker`, `DateRangePickerField`, `DatePickerDialog`, `DateTimePickerField`, `TimePicker`, `TimePickerField`, `TimePickerDialog` (full `disabled`/`readOnly`/`invalid` parity), `Switch`, `Slider`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` |
| **Display & Surfaces** | `Card`, `DataTable`, `Skeleton`, `SegmentedList`, `ListItem`, `List`, `ListItem`, `Chip`, `AssistChip`, `FilterChip`, `InputChip`, `SuggestionChip`, `Avatar`, `AvatarGroup`, `Badge`, `Carousel`, `Empty`, `Kbd`, `Snippet`, `Collapsible`, `Accordion`, `PreviewCard`, `ScrollArea`, `Divider`, `DragHandle`, `VerticalDragHandle`, `MaterialShapeView` |
| **Navigation** | `NavigationSuite`, `NavigationBar`, `NavigationRail`, `WideNavigationRail`, `NavigationDrawer`, `NavigationMenu`, `TopAppBar`, `BottomAppBar`, `AppBarRow`, `SearchBar`, `SearchView`, `CommandPalette`, `Breadcrumb`, `Pagination`, `Menubar`, `Tabs`, `TabsList`, `Tab`, `TabsPanel` |
| **Overlays & Feedback** | `Alert` (controlled/uncontrolled `open`), `Dialog`, `DialogClose`, `AlertDialog`, `AlertDialogClose`, `Sheet`, `BottomSheet`, `SideSheet`, `SheetClose`, `Popover`, `PopoverClose`, `DropdownMenu`, `ContextMenu`, `Tooltip`, `RichTooltip` (keyboard-gated `action` focus), `useM3EToast`, `PullToRefreshBox`, `LinearProgressIndicator`, `CircularProgressIndicator`, `Meter`, `LoadingIndicator`, `ContainedLoadingIndicator`, `LinearWavyProgressIndicator`, `CircularWavyProgressIndicator` |

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
