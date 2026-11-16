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

### Runtime theming

Colors come from the generated theme CSS. To change seed, scheme variant, or contrast at runtime, pass the HCT engine:

```tsx
import { generateM3EThemeTokens } from "m3eui/tokens";

<M3EProvider config={m3eConfig} themeEngine={generateM3EThemeTokens}>
```

## Subpath Exports & CLI

- `m3eui` — RSC-safe barrel for components, hooks, `M3EProvider`, `M3EPortal`, `CSPProvider`, `getM3EInitScript`, config, and tokens
- `m3eui/styles.css` — Component stylesheet (`--m3e-*` custom properties + `light-dark()`)
- `m3eui/tokens` & `m3eui/tokens.json` — Pure RSC-safe 61-role HCT color synthesis (`primary`/`secondary`/`tertiary`/`error`/`success`/`warning`), spring solver, corner topology, `parseShortcutKeys`, and 35 `MaterialShapes` (`getMaterialShape`)
- `m3eui/i18n` — RSC-safe `en-US`, `zh-CN`, `ja-JP`, `ar-SA` dictionaries and `M3EMessageKey` types
- `m3eui/config` — RSC-safe `defineM3EConfig`, `resolveM3EConfig` (`colorMode: "system"` default), `serializeM3EConfig`, `generateM3EStaticThemeCss`
- `m3eui/primitives` — Re-exported `@base-ui/react` primitives
- `m3eui/m3e.schema.json` — JSON Schema for `m3e.json`
- `m3eui/components/*` — Individual component modules
- **CLI (`npx m3eui` / `npx m3e`)**: `init`, `sync`, `locale`, `doctor`

## Components

| Category | Exports |
| :--- | :--- |
| **Actions** | `Button`, `ToggleButton`, `IconButton`, `IconToggleButton`, `SplitButton`, `ButtonGroup`, `FloatingToolbar`, `DockedToolbar`, `FABMenu`, `FAB` (`xs`/`sm`/`md`/`lg`, default `sm`), `ExtendedFAB`, `CopyButton` |
| **Inputs & Selection** | `Form`, `Fieldset`, `TextField`, `TextareaField`, `NumberField`, `OTPField`, `Select`, `MultiSelect`, `Combobox`, `MultiCombobox`, `FileUpload`, `FileUploadDropzone`, `ColorPicker`, `ColorPickerField`, `ColorSwatch`, `DockedDatePicker`, `DatePickerField`, `DateRangePicker`, `DateRangePickerField`, `DatePickerDialog`, `DateTimePickerField`, `TimePicker`, `TimePickerField`, `TimePickerDialog` (full `disabled`/`readOnly`/`invalid` parity), `Switch`, `Slider`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` |
| **Display & Surfaces** | `Card`, `DataTable`, `Skeleton`, `SegmentedList`, `ListItem`, `List`, `ListItem`, `Chip`, `AssistChip`, `FilterChip`, `InputChip`, `SuggestionChip`, `Avatar`, `AvatarGroup`, `Badge`, `Carousel`, `Empty`, `Kbd`, `Snippet`, `Collapsible`, `Accordion`, `PreviewCard`, `ScrollArea`, `Divider`, `DragHandle`, `VerticalDragHandle`, `MaterialShapeView` |
| **Navigation** | `NavigationSuite`, `NavigationBar`, `NavigationRail`, `WideNavigationRail`, `NavigationDrawer`, `NavigationMenu`, `TopAppBar`, `BottomAppBar`, `AppBarRow`, `SearchBar`, `SearchView`, `CommandPalette`, `Breadcrumb`, `Pagination`, `Menubar`, `Tabs`, `TabsList`, `Tab`, `TabsPanel` |
| **Overlays & Feedback** | `Alert` (controlled/uncontrolled `open`), `Dialog`, `DialogClose`, `AlertDialog`, `AlertDialogClose`, `Sheet`, `BottomSheet`, `SideSheet`, `SheetClose`, `Popover`, `PopoverClose`, `DropdownMenu`, `ContextMenu`, `Tooltip`, `RichTooltip` (keyboard-gated `action` focus), `useM3EToast`, `PullToRefreshBox`, `LinearProgressIndicator`, `CircularProgressIndicator`, `Meter`, `LoadingIndicator`, `ContainedLoadingIndicator`, `LinearWavyProgressIndicator`, `CircularWavyProgressIndicator` |

## License

[Apache-2.0](./LICENSE)
