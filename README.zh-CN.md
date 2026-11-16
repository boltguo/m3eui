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

初始化 `m3e.json` 与静态主题 CSS：

```bash
npx m3eui init --seed "#6750A4" --variant expressive --locale zh-CN
```

挂载 `M3EProvider`：

```tsx
import "./styles/m3e-theme.css";
import "m3eui/styles.css";
import { M3EProvider, Button, Switch, TimePickerField } from "m3eui";
import m3eConfig from "../m3e.json";

export function App() {
  return (
    <M3EProvider config={m3eConfig}>
      <Button variant="filled">保存</Button>
      <Switch label="消息通知" defaultChecked />
      <TimePickerField label="发布时间" defaultValue="09:30" />
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
    <html lang="zh-CN" suppressHydrationWarning>
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

### 运行时换色

颜色默认来自生成的主题 CSS。需要在运行时切换种子色、配色方案或对比度时，传入 HCT 引擎：

```tsx
import { generateM3EThemeTokens } from "m3eui/tokens";

<M3EProvider config={m3eConfig} themeEngine={generateM3EThemeTokens}>
```

## 子路径导出

| 路径 | 说明 |
| :--- | :--- |
| `m3eui` | 兼容 RSC 的组件、Hooks、`M3EProvider`、`M3EPortal`、配置、国际化与令牌入口 |
| `m3eui/styles.css` | 组件样式表（`--m3e-*` 变量 + `light-dark()`） |
| `m3eui/tokens` | 纯函数兼容 RSC 的 61 语义角色 HCT 色阶计算（含 `success`/`warning` 调和）、弹簧求解、圆角拓扑、`parseShortcutKeys` 与 35 种 `MaterialShapes`（`getMaterialShape`） |
| `m3eui/tokens.json` | 预计算的静态令牌与多边形 JSON |
| `m3eui/i18n` | 兼容 RSC 的 `zh-CN`、`en-US`、`ja-JP`、`ar-SA` 词典与 `M3EMessageKey` 类型 |
| `m3eui/config` | 兼容 RSC 的 `defineM3EConfig`、`resolveM3EConfig`（默认 `colorMode: "system"`）、`serializeM3EConfig`、`generateM3EStaticThemeCss` |
| `m3eui/primitives` | 透出的 `@base-ui/react` 无头原语 |
| `m3eui/cli` | CLI 编程接口 |
| `m3eui/m3e.schema.json` | `m3e.json` JSON Schema |
| `m3eui/components/*` | 单组件模块入口 |

## CLI 命令

```bash
npx m3eui init --seed "#0B6B58" --variant vibrant --locale zh-CN
npx m3eui sync
npx m3eui locale --list
npx m3eui locale fr-FR --out src/i18n/fr-FR.ts
npx m3eui doctor
```

## 组件清单

| 范围 | 导出项 |
| :--- | :--- |
| **容器与配置** | `M3EProvider`, `M3EPortal`, `CSPProvider`, `useM3E`, `useM3EI18n`, `useM3EPortalContainer`, `getM3EInitScript`, `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss`, `useM3EScalarSpring`, `useM3ECornerSpring`, `useM3ECornerSpringRef`, `usePressHoldState` |
| **组件** | `Accordion`（`variant`）, `Alert`（受控/非受控 `open`）, `AlertDialog`, `AlertDialogClose`, `AppBarRow`, `Avatar`, `AvatarGroup`, `Badge`, `Breadcrumb`, `Button`（`pressed` 即切换按钮）, `ButtonGroup`, `Card`, `Carousel`, `Checkbox`, `CheckboxGroup`, `Chip`（`onClick` → assist，`selected` → filter，`onRemove` → input）, `CircularProgressIndicator`（`wavy`）, `ColorPicker`, `ColorPickerField`, `ColorSwatch`, `Combobox`（`multiple`）, `CommandPalette`, `ContextMenu`, `CopyButton`, `DataTable`, `DatePicker`, `DatePickerField`（`mode: "single" \| "range"`，`modal`）, `Dialog`, `DialogClose`, `Divider`, `DockedToolbar`, `DragHandle`, `DropdownMenu`, `Empty`, `FAB`（`xs`/`sm`/`md`/`lg`，默认 `sm`；传 `children` 为带文字）, `FABMenu`, `Fieldset`, `FileUpload`, `FileUploadDropzone`, `FloatingToolbar`, `Form`, `IconButton`（`pressed` 即切换按钮）, `Kbd`, `LinearProgressIndicator`, `List`（`variant="segmented"`）, `ListItem`, `LoadingIndicator`（`contained`）, `MaterialShapeView`, `Menubar`, `Meter`, `NavigationBar`, `NavigationMenu`, `NavigationRail`（`expanded` / `collapsible` / `modal`）, `NavigationSuite`, `NumberField`, `OTPField`, `Pagination`, `Popover`（`openOnHover`）, `PopoverClose`, `PullToRefreshBox`, `Radio`, `RadioGroup`, `ScrollArea`, `SearchBar`, `SearchView`, `Select`（`multiple`）, `Sheet`（`side`）, `SheetClose`, `Sidebar`, `Skeleton`, `Slider`, `Snippet`, `SplitButton`, `Switch`, `Tab`, `Tabs`, `TabsList`, `TabsPanel`, `TextField`（`multiline`）, `TimePicker`, `TimePickerField`（`modal`）, `Tooltip`（`subhead` / `action` 即 rich，键盘触发自动聚焦 `action`）, `TopAppBar`, `useM3EToast` |

## 本地开发

| 目录 | 说明 |
| :--- | :--- |
| `packages/m3eui` | `m3eui` 组件包源码 |
| `apps/playground` | 组件演示站点 |

```bash
pnpm install
pnpm dev
pnpm build
pnpm typecheck
pnpm test
pnpm m3e:doctor
```

## 开源协议

[Apache-2.0](./LICENSE)
