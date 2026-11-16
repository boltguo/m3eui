# m3eui

[English](./README.md) | **简体中文**

基于 `@base-ui/react` 构建的 Material 3 Expressive React 组件库，内置 HCT 动态色板、物理弹簧动效、`m3e.json` 配置工具与多语言/RTL 支持。

## 安装

```bash
pnpm add m3eui
# 或
npm install m3eui
```

宿主依赖：`react >= 18.0.0`、`react-dom >= 18.0.0`。

## 快速上手

```bash
npx m3eui init --seed "#6750A4" --variant expressive --locale zh-CN
```

```tsx
import "./styles/m3e-theme.css";
import "m3eui/styles.css";
import { M3EProvider, Button, Switch, DatePickerField } from "m3eui";
import m3eConfig from "../m3e.json";

export function App() {
  return (
    <M3EProvider config={m3eConfig}>
      <Button variant="filled">继续</Button>
      <Switch label="消息通知" defaultChecked />
      <DatePickerField label="发布日期" defaultValue="2026-11-18" />
    </M3EProvider>
  );
}
```

### 运行时换色

颜色默认来自生成的主题 CSS。需要在运行时切换种子色、配色方案或对比度时，传入 HCT 引擎：

```tsx
import { generateM3EThemeTokens } from "m3eui/tokens";

<M3EProvider config={m3eConfig} themeEngine={generateM3EThemeTokens}>
```

## 子路径导出与 CLI

- `m3eui` — 兼容 RSC 的组件、Hooks、`M3EProvider`、`M3EPortal`、`CSPProvider`、`getM3EInitScript`、配置与令牌入口
- `m3eui/styles.css` — 组件样式表（`--m3e-*` 变量 + `light-dark()`）
- `m3eui/tokens` & `m3eui/tokens.json` — 纯函数兼容 RSC 的 61 语义角色 HCT 色阶计算（含 `success`/`warning` 调和）、弹簧求解、圆角拓扑、`parseShortcutKeys` 与 35 种 `MaterialShapes`（`getMaterialShape`）
- `m3eui/i18n` — 兼容 RSC 的 `zh-CN`、`en-US`、`ja-JP`、`ar-SA` 词典与 `M3EMessageKey` 类型
- `m3eui/config` — 兼容 RSC 的 `defineM3EConfig`、`resolveM3EConfig`（默认 `colorMode: "system"`）、`serializeM3EConfig`、`generateM3EStaticThemeCss`
- `m3eui/primitives` — 透出的 `@base-ui/react` 无头原语
- `m3eui/m3e.schema.json` — `m3e.json` JSON Schema
- `m3eui/components/*` — 单组件模块入口
- **CLI（`npx m3eui` / `npx m3e`）**：`init`、`sync`、`locale`、`doctor`

## 组件清单

| 分类 | 导出项 |
| :--- | :--- |
| **动作与工具栏** | `Button`, `ToggleButton`, `IconButton`, `IconToggleButton`, `SplitButton`, `ButtonGroup`, `FloatingToolbar`, `DockedToolbar`, `FABMenu`, `FAB`（`xs`/`sm`/`md`/`lg`，默认 `sm`）, `ExtendedFAB`, `CopyButton` |
| **表单与选择** | `Form`, `Fieldset`, `TextField`, `TextareaField`, `NumberField`, `OTPField`, `Select`, `MultiSelect`, `Combobox`, `MultiCombobox`, `FileUpload`, `FileUploadDropzone`, `ColorPicker`, `ColorPickerField`, `ColorSwatch`, `DockedDatePicker`, `DatePickerField`, `DateRangePicker`, `DateRangePickerField`, `DatePickerDialog`, `DateTimePickerField`, `TimePicker`, `TimePickerField`, `TimePickerDialog`（完整支持 `disabled`/`readOnly`/`invalid`）, `Switch`, `Slider`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` |
| **数据展示与表面** | `Card`, `DataTable`, `Skeleton`, `SegmentedList`, `ListItem`, `List`, `ListItem`, `Chip`, `AssistChip`, `FilterChip`, `InputChip`, `SuggestionChip`, `Avatar`, `AvatarGroup`, `Badge`, `Carousel`, `Empty`, `Kbd`, `Snippet`, `Collapsible`, `Accordion`, `PreviewCard`, `ScrollArea`, `Divider`, `DragHandle`, `VerticalDragHandle`, `MaterialShapeView` |
| **导航** | `NavigationSuite`, `NavigationBar`, `NavigationRail`, `WideNavigationRail`, `NavigationDrawer`, `NavigationMenu`, `TopAppBar`, `BottomAppBar`, `AppBarRow`, `SearchBar`, `SearchView`, `CommandPalette`, `Breadcrumb`, `Pagination`, `Menubar`, `Tabs`, `TabsList`, `Tab`, `TabsPanel` |
| **浮层与反馈** | `Alert`（受控/非受控 `open`）, `Dialog`, `DialogClose`, `AlertDialog`, `AlertDialogClose`, `Sheet`, `BottomSheet`, `SideSheet`, `SheetClose`, `Popover`, `PopoverClose`, `DropdownMenu`, `ContextMenu`, `Tooltip`, `RichTooltip`（键盘触发自动聚焦 `action`）, `useM3EToast`, `PullToRefreshBox`, `LinearProgressIndicator`, `CircularProgressIndicator`, `Meter`, `LoadingIndicator`, `ContainedLoadingIndicator`, `LinearWavyProgressIndicator`, `CircularWavyProgressIndicator` |

## 开源协议

[Apache-2.0](./LICENSE)
