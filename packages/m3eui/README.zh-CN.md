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

颜色默认来自 CLI 生成的静态 `m3e-theme.css`。需要在浏览器运行时切换种子色、配色方案或对比度时，显式传入 HCT 引擎：

```tsx
import { M3EProvider } from "m3eui";
import { generateM3EThemeTokens } from "m3eui/tokens";
import m3eConfig from "../m3e.json";

<M3EProvider config={m3eConfig} themeEngine={generateM3EThemeTokens}>
  <App />
</M3EProvider>
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

| 范围 | 导出项 |
| :--- | :--- |
| **组件** | `Accordion`（`variant`）, `Alert`（受控/非受控 `open`）, `AlertDialog`, `AlertDialogClose`, `AppBarRow`, `Avatar`, `AvatarGroup`, `Badge`, `Breadcrumb`, `Button`（`pressed` 即切换按钮）, `ButtonGroup`, `Card`, `Carousel`, `Checkbox`, `CheckboxGroup`, `Chip`（`onClick` → assist，`selected` → filter，`onRemove` → input）, `CircularProgressIndicator`（`wavy`）, `ColorPicker`, `ColorPickerField`, `ColorSwatch`, `Combobox`（`multiple`）, `CommandPalette`, `ContextMenu`, `CopyButton`, `DataTable`, `DatePicker`, `DatePickerField`（`mode: "single" \| "range"`，`modal`）, `Dialog`, `DialogClose`, `Divider`, `DragHandle`, `DropdownMenu`, `Empty`, `FAB`（`xs`/`sm`/`md`/`lg`，默认 `sm`；传 `children` 为带文字）, `FABMenu`, `Fieldset`, `FileUpload`, `FileUploadDropzone`, `FloatingToolbar`, `Form`, `IconButton`（`pressed` 即切换按钮）, `Kbd`, `LinearProgressIndicator`, `List`（`variant="segmented"`）, `ListItem`, `LoadingIndicator`（`contained`）, `MaterialShapeView`, `Meter`, `NavigationBar`, `NavigationRail`（`expanded` / `collapsible` / `modal` 含 `"auto"` / `density="compact"`）, `NumberField`, `OTPField`, `Pagination`, `Popover`（`openOnHover`）, `PopoverClose`, `Radio`, `RadioGroup`, `ScrollArea`, `SearchBar`, `SearchView`, `Select`（`multiple`）, `Sheet`（`side`）, `SheetClose`, `Skeleton`, `Slider`, `Snippet`, `SplitButton`, `Switch`, `Tab`, `Tabs`, `TabsList`, `TabsPanel`, `TextField`（`multiline`）, `TimePicker`, `TimePickerField`（`modal`）, `Tooltip`（`subhead` / `action` 即 rich，键盘触发自动聚焦 `action`）, `TopAppBar`, `useM3EToast` |

## 开源协议

[Apache-2.0](./LICENSE)
