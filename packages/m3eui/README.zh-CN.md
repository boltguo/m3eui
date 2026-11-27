<div align="center">

<h1>m3eui</h1>

<p>基于 <code>@base-ui/react</code> 构建的 Material 3 Expressive React 组件库，内置 HCT 动态色板、物理弹簧动效与多语言/RTL 支持。</p>

<p>
<a href="https://www.npmjs.com/package/m3eui"><img alt="npm version" src="https://img.shields.io/npm/v/m3eui" /></a>
<a href="https://www.npmjs.com/package/m3eui"><img alt="npm downloads" src="https://img.shields.io/npm/dw/m3eui?label=downloads" /></a>
<a href="https://github.com/boltguo/m3eui/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/boltguo/m3eui/ci.yml?branch=main&logo=github&label=CI" /></a>
<a href="https://react.dev"><img alt="react peer dependency" src="https://img.shields.io/badge/react-%3E%3D18-087EA4" /></a>
<a href="https://github.com/boltguo/m3eui/blob/main/LICENSE"><img alt="license" src="https://img.shields.io/github/license/boltguo/m3eui" /></a>
</p>

<p><a href="https://github.com/boltguo/m3eui/blob/main/README.md">English</a> | 简体中文</p>

<p><a href="https://m3eui.vercel.app"><strong>在线文档与演示</strong></a></p>

</div>

## 特性

- **无障碍组件体系** — 53 个组件模块（75+ 导出项），基于 `@base-ui/react` 原语构建，完整支持 ARIA、键盘导航与 RTL。
- **2025 AOSP Monet HCT** — 61 个语义色阶角色（含 `success` 与 `warning` 调和）、9 种配色方案、对比度 `[-1, 1]` 与原生 CSS `light-dark()`。
- **物理弹簧与几何形态** — 空间/效果弹簧预设（`expressive` / `standard`）、圆角形变与 35 种 `MaterialShapes`。
- **静态 CSS 与运行时换色** — 默认通过 CLI（`m3eui init` / `sync`）生成零运行时开销的静态主题 CSS，也支持按需传入浏览器 HCT 引擎（`themeEngine={generateM3EThemeTokens}`）。
- **兼容 RSC 与 SSR** — `tokens`、`config`、`i18n` 保持纯函数服务端安全，内置 CSS `@layer m3e.tokens, m3e.base, m3e.components`、`getM3EInitScript()` 与 `CSPProvider`。
- **开箱即用国际化** — 内置 `en-US`、`zh-CN`、`ja-JP`、`ar-SA` 词典、BCP 47 自动 RTL 方向、CLDR 日期时间格式化与语言包脚手架。

## 安装

```bash
pnpm add m3eui
# 或
npm install m3eui
```

环境要求：`react >= 18.0.0`、`react-dom >= 18.0.0`，CLI 需 `node >= 20.0.0`。

## 快速上手

初始化 `m3e.json` 并生成静态主题 CSS：

```bash
npx m3eui init --seed "#6750A4" --variant expressive --locale zh-CN
```

挂载 `M3EProvider`：

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

颜色默认来自静态 `m3e-theme.css`。需要在浏览器动态切换种子色、配色方案或对比度时，显式传入 HCT 引擎 `themeEngine={generateM3EThemeTokens}`：

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

## CLI 命令

同时支持 `npx m3eui` 与 `npx m3e`。

| 命令 | 说明 |
| :--- | :--- |
| `npx m3eui init [--seed] [--variant] [--locale] [--output] [--force]` | 创建 `m3e.json` 并生成静态主题 CSS |
| `npx m3eui sync [--config]` | 根据 `m3e.json` 重新生成静态主题 CSS |
| `npx m3eui locale --list \| <bcp47-tag> [--out] [--force]` | 列出内置语言或生成自定义语言包模板 |
| `npx m3eui doctor [--config]` | 校验 `m3e.json`、静态主题同步与国际化规范 |

## 子路径导出

| 路径 | 说明 |
| :--- | :--- |
| `m3eui` | 兼容 RSC 的组件、Hooks、`M3EProvider`、`M3EPortal`、配置、国际化与令牌入口 |
| `m3eui/styles.css` | 组件样式表（`--m3e-*` 变量 + `light-dark()`） |
| `m3eui/tailwind.css` | Tailwind CSS v4 `@theme inline` 令牌映射 |
| `m3eui/tokens` | 纯函数兼容 RSC 的 61 语义角色 HCT 色阶计算、图片取色、自定义协调扩展色、弹簧求解、圆角拓扑、`parseShortcutKeys` 与 35 种 `MaterialShapes`（`getMaterialShape`） |
| `m3eui/tokens.json` | 预计算的静态令牌与多边形 JSON |
| `m3eui/i18n` | 兼容 RSC 的 `en-US`、`zh-CN`、`ja-JP`、`ar-SA` 词典与 `M3EMessageKey` 类型 |
| `m3eui/config` | 兼容 RSC 的 `defineM3EConfig`、`resolveM3EConfig`、`serializeM3EConfig`、`generateM3EStaticThemeCss` |
| `m3eui/primitives` | 透出的 `@base-ui/react` 无头原语 |
| `m3eui/cli` | CLI 编程接口 |
| `m3eui/m3e.schema.json` | `m3e.json` JSON Schema |
| `m3eui/components/*` | 单组件模块入口 |

## 组件清单

| 分类 | 导出项 |
| :--- | :--- |
| **容器与 Hooks** | `M3EProvider`, `M3EPortal`, `CSPProvider`, `useM3E`, `useM3EI18n`, `useM3EPortalContainer`, `getM3EInitScript`, `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss`, `useM3EScalarSpring`, `useM3EScalarSpringEffect`, `useM3ECornerSpring`, `useM3ECornerSpringRef`, `usePressHoldState` |
| **操作** | `Button`, `ButtonGroup`, `IconButton`, `SplitButton`, `FAB`, `FABMenu`, `FloatingToolbar`, `CopyButton` |
| **输入与表单** | `TextField`, `NumberField`, `OTPField`, `Select`, `Combobox`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup`, `Switch`, `Slider`, `DatePicker`, `DatePickerField`, `TimePicker`, `TimePickerField`, `ColorPicker`, `ColorPickerField`, `ColorSwatch`, `FileUpload`, `FileUploadDropzone`, `Form`, `Fieldset` |
| **导航** | `TopAppBar`, `AppBarRow`, `NavigationBar`, `NavigationRail`, `Tabs`, `TabsList`, `Tab`, `TabsPanel`, `Breadcrumb`, `Pagination`, `SearchBar`, `SearchView`, `CommandPalette` |
| **数据展示** | `Accordion`, `Avatar`, `AvatarGroup`, `Badge`, `Card`, `Carousel`, `Chip`, `DataTable`, `Divider`, `Empty`, `Kbd`, `List`, `ListItem`, `MaterialShapeView`, `Meter`, `Snippet` |
| **反馈与进度** | `Alert`, `CircularProgressIndicator`, `LinearProgressIndicator`, `LoadingIndicator`, `Skeleton`, `useM3EToast` |
| **浮层与工具** | `Dialog`, `DialogClose`, `AlertDialog`, `AlertDialogClose`, `Sheet`, `SheetClose`, `Popover`, `PopoverClose`, `Tooltip`, `DropdownMenu`, `ContextMenu`, `ScrollArea`, `DragHandle` |

## 仓库地址

交互式演示站点：[m3eui.vercel.app](https://m3eui.vercel.app)。源码与问题反馈：[github.com/boltguo/m3eui](https://github.com/boltguo/m3eui)。

## 致谢

基于 [@base-ui/react](https://base-ui.com) 构建，色彩与几何形态算法衍生自 [material-color-utilities](https://github.com/material-foundation/material-color-utilities) 与 [AndroidX Compose Material 3](https://android.googlesource.com/platform/frameworks/support)（详见 [NOTICE](https://github.com/boltguo/m3eui/blob/main/NOTICE)）。

## 开源协议

[Apache-2.0](https://github.com/boltguo/m3eui/blob/main/LICENSE)
