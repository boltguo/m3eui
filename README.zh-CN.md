# m3eui

[English](./README.md) | **简体中文**

**Material 3 Expressive (`1.5.0`) Web React 组件系统、声明式 `m3e.json` 配置工具链与跨平台数学令牌引擎。**

底层基于 `@base-ui/react` (`1.9.0`) 无头无障碍原语，结合纯 TypeScript 编写的 HCT 动态色彩与双轨弹簧物理引擎（`m3eui/tokens`）、对标 `shadcn/ui` 的 `m3e.json` 工程配置工具（`m3eui`）、100% Key 驱动国际化与自动 RTL 镜像，以及零 Tailwind 依赖的原生语义化 CSS（`light-dark()`），在 Web 端完整实现 Google AOSP Material 3 Expressive 设计规范。

---

## 仓库与单包架构 (`v0.1.0` — All-in-One `m3eui`)

| 模块 | 目录 | 职责说明 |
| :--- | :--- | :--- |
| **`m3eui`** | `packages/m3eui` | **唯一公开发布 npm 包**：一站式内置 60+ React 组件与 Hooks、零 React 依赖的跨端数学令牌（`m3eui/tokens`、`m3eui/tokens.json`）、78 键国际化（`m3eui/i18n`）、内置 CLI 命令（`npx m3eui`）与 JSON Schema（`m3eui/m3e.schema.json`）。 |
| **`m3eui-playground`** | `apps/playground` | 100% 使用 `m3eui` 自身组件构建的交互式文档站与实时主题/物理工作台。 |

---

## 安装

只需安装 **`m3eui` 这 1 个包**，组件、样式、数学令牌与 `m3eui` 命令行工具全部开箱即用：

```bash
# pnpm
pnpm add m3eui

# npm
npm install m3eui
```

宿主依赖要求：`react >= 18.0.0`、`react-dom >= 18.0.0`。

---

## 快速上手

### 1. 初始化 `m3e.json` 与首屏零闪烁静态主题 CSS

在项目根目录生成声明式 `m3e.json` 配置，并一次性编译包含 `light-dark()` 色阶与 `linear()` 弹簧曲线的静态 `:root` CSS 变量表：

```bash
npx m3eui init --seed "#6750A4" --variant expressive --locale zh-CN
```

生成的 `m3e.json` 示例：

```json
{
  "$schema": "https://unpkg.com/m3eui@0.1.0/m3e.schema.json",
  "style": "expressive",
  "theme": {
    "seed": "#6750A4",
    "schemeVariant": "expressive",
    "colorMode": "system",
    "contrastLevel": 0,
    "motionScheme": "expressive"
  },
  "i18n": {
    "locale": "zh-CN",
    "direction": "auto"
  },
  "css": {
    "output": "src/styles/m3e-theme.css"
  }
}
```

### 2. 在 React 应用中挂载 `M3EProvider`

```tsx
import "./styles/m3e-theme.css"; // 由 `m3eui sync` 生成的静态主题变量表
import "m3eui/styles.css";      // 组件核心语义样式表
import {
  M3EProvider,
  NavigationMenu,
  Collapsible,
  Button,
  Switch,
  TimePickerField,
} from "m3eui";
import m3eConfig from "../m3e.json";

export function App() {
  return (
    <M3EProvider
      config={m3eConfig}
      // 可选：在当前语言包基础上按需覆盖指定国际化 Key
      messages={{ "searchBar.placeholder": "搜索组件、令牌或规范…" }}
    >
      <NavigationMenu
        brand="m3eui"
        items={[
          { value: "home", label: "首页", href: "/", active: true },
          {
            value: "docs",
            label: "开发文档",
            links: [{ id: "i18n", title: "国际化与 m3e.json", href: "/docs/i18n" }],
          },
        ]}
      />

      <Collapsible title="架构说明（支持 Ctrl/Cmd+F 页内搜索自动唤醒展开）">
        所有组件内部均无硬编码自然语言文案；切换至 ar-SA 等语言时会自动开启全局 RTL 双向镜像。
      </Collapsible>

      <Button variant="filled">保存配置</Button>
      <Switch label="开启消息通知" defaultChecked />
      <TimePickerField label="发布时间" defaultValue="09:30" />
    </M3EProvider>
  );
}
```

### 3. Next.js App Router（SSR 首屏零明暗闪烁）

在 `<head>` 中放置 `<meta name="color-scheme" content="light dark" />` 并注入同步初始化脚本 `getM3EInitScript()`，即可在水合前读取用户持久化的明暗偏好，彻底消除首屏闪烁（FOUC）：

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

---

## 子路径导出与按需加载

| 引入路径 | 包含内容 |
| :--- | :--- |
| `m3eui` | 全量组件、Provider、物理弹簧 Hooks、配置、国际化与设计令牌（带 `"use client"` 边界）。 |
| `m3eui/styles.css` | 基于 `--m3e-*` CSS 自定义属性与原生 `light-dark()` 的组件样式表。 |
| `m3eui/tokens` | 零 React 依赖的纯数学令牌模块：HCT 色阶合成、五端弹簧求解器、圆角拓扑与 35 种 `MaterialShapes`。 |
| `m3eui/tokens.json` | 面向 Swift / Kotlin / Figma 等跨语言流水线的静态令牌与多边形 JSON。 |
| `m3eui/i18n` | `zhCNMessages`、`enUSMessages`、`jaJPMessages`、`arSAMessages`、`createM3ETranslator`、`isRtlLocale` 及 78 个强类型 `M3EMessageKey`。 |
| `m3eui/config` | `defineM3EConfig`、`resolveM3EConfig`、`serializeM3EConfig`、`generateM3EStaticThemeCss`。 |
| `m3eui/primitives` | 透出的 `@base-ui/react` 复合无头原语，便于业务层深度定制结构。 |
| `m3eui/cli` | Node 命令行工具编程接口（`initM3EProject`、`syncM3EThemeCss`、`scaffoldM3ELocalePack`、`runM3EDoctor`）。 |
| `m3eui/m3e.schema.json` | `m3e.json` 的编辑器自动补全与校验 Schema。 |
| `m3eui/components/*` | 单模块细粒度入口（如 `m3eui/components/Button`、`m3eui/components/DataTableAndSkeleton`）。 |

---

## CLI 命令行工具 (`m3eui`)

安装后可直接使用 `m3eui` 或 `m3e` 命令：

```bash
# 1. 初始化 m3e.json 并同步生成静态主题 CSS
npx m3eui init --seed "#0B6B58" --variant vibrant --locale zh-CN

# 2. 修改 m3e.json 后重新同步静态 CSS 变量表
npx m3eui sync

# 3. 查看内置语言列表，或生成 78 键强类型自定义语言包模板（如法语 fr-FR）
npx m3eui locale --list
npx m3eui locale fr-FR --out src/i18n/fr-FR.ts

# 4. 校验 m3e.json 合法性、静态 CSS 同步状态与源码零硬编码 CJK 守卫
npx m3eui doctor
```

---

## 国际化与自动 RTL 双向排版

- **组件源码零硬编码文案**：所有无障碍标签、弹窗按钮、日历/表盘提示、表格排序状态播报及空状态文案全部通过 78 个强类型 `M3EMessageKey` 驱动。
- **内置四国语言包**：开箱自带 `zh-CN`（简体中文）、`en-US`（英语）、`ja-JP`（日语）、`ar-SA`（阿拉伯语）。
- **自动 RTL 镜像**：当 `i18n.direction` 设为 `"auto"`（默认）时，切换到 `ar-*` / `he-*` / `fa-*` / `ur-*` 语言会自动联动 Base UI `DirectionProvider`、CSS 逻辑属性、非对称圆角翻转（如 `SplitButton`、`SideSheet`）以及手势与方向键轴向。
- **原生 `Intl` 本地化格式**：`DockedDatePicker`、`DateRangePicker`、`TimePicker` 与 `DataTable` 统一使用标准 `Intl.DateTimeFormat` 和 `Intl.Collator(locale, { numeric: true, sensitivity: "base" })` 处理星期、时段与自然排序。

---

## 核心设计与物理架构

1. **HCT 感知均匀色彩与五级表面容器**：基于 Material Color Utilities 从任意 Hex 种子色实时合成亮暗双态调色板（支持 `expressive`、`tonalSpot`、`vibrant`、`neutral` 四种变体与 `[-1, 1]` 连续对比度），直接输出原生 `light-dark()` 变量。
2. **双轨物理弹簧系统（Spatial vs Effects）**：
   - **空间弹簧（`Spatial`）**：欠阻尼（$\zeta = 0.6 \sim 0.8$），用于位移、尺寸伸缩、圆角形变与抽屉/侧栏展开，允许自然的弹性回弹。
   - **效果弹簧（`Effects`）**：严格临界阻尼（$\zeta = 1.0$），用于颜色、不透明度与阴影过渡，绝不越过 `[0, 1]` 边界产生色彩闪烁。
   - `m3eui/tokens` 内置五端精确换算：CSS `linear()`、Motion JS、Android `SpringForce`、Jetpack Compose `spring()` 与 Apple `CASpringAnimation` / SwiftUI。
3. **动态圆角拓扑与零和宽度守恒**：
   - 按压与选中态实时触发圆角形变（`Button`、`IconButton` 5×3 宽高矩阵、`SplitButton` 光学居中偏移、`ButtonGroup` 连接态接缝、`Accordion` 展开态 `[16,16,16,16]` 独立脱出与邻项圆角联动、`OTPField` 聚焦槽独立圆角脱出）。
   - `ButtonGroup`（`standard` 15% 邻项挤压）与 `Carousel` 严格保持父容器总宽度恒定（`sum(widths) === constant`），交互过程中绝不引起外层页面重排抖动。
4. **35 种官方 `MaterialShapes` 与极坐标波浪进度**：完整内置 AOSP 35 个 `[0..1]` 归一化闭合三次贝塞尔多边形与 1:1 实时插值（用于 `MaterialShapeView`、`Avatar`、`LoadingIndicator`、`Skeleton`），以及整波瓣闭合极坐标波浪进度条（`WavyProgressIndicator`）。

---

## 全量组件清单 (60+)

| 分类 | 导出组件与工具 |
| :--- | :--- |
| **容器、配置与物理引擎** | `M3EProvider`, `CSPProvider`, `useM3E`, `useM3EI18n`, `getM3EInitScript`, `defineM3EConfig`, `resolveM3EConfig`, `serializeM3EConfig`, `generateM3EStaticThemeCss`, `useM3EScalarSpring`, `useM3ECornerSpring`, `usePressHoldState` |
| **动作与悬浮工具栏** | `Button`, `ToggleButton`, `IconButton`, `IconToggleButton`, `SplitButton`, `ButtonGroup`, `FloatingToolbar`, `FABMenu`, `FAB`, `ExtendedFAB` |
| **表单、输入与日期时间** | `Form`, `Fieldset`, `SearchBar`, `OTPField`, `DockedDatePicker`, `DatePickerField`, `DateRangePicker`, `TimePicker`, `TimePickerField`, `TextField`, `TextareaField`, `NumberField`, `Combobox`, `Select`, `Switch`, `Slider`, `Checkbox`, `CheckboxGroup`, `Radio`, `RadioGroup` |
| **数据展示、折叠披露与表面** | `Collapsible` (`hidden="until-found"`), `Accordion`, `Carousel`, `DataTable`, `Skeleton`, `AssistChip`, `FilterChip`, `InputChip`, `Avatar`, `Badge`, `Card`, `SegmentedList`, `SegmentedListItem`, `PreviewCard`, `ScrollArea`, `Divider` |
| **站点大菜单与自适应导航** | `NavigationMenu`, `TopAppBar`, `NavigationBar`, `NavigationRail`, `WideNavigationRail`, `NavigationDrawer`, `NavigationSuite`, `Menubar`, `Tabs`, `TabsList`, `Tab`, `TabsPanel` |
| **浮层、反馈与参数图形** | `Sheet`, `BottomSheet`, `SideSheet`, `SheetClose`, `Popover`, `PopoverClose`, `DropdownMenu`（递归多级 `submenu`）, `ContextMenu`, `Dialog`, `DialogClose`, `AlertDialog`, `AlertDialogClose`, `Tooltip`, `RichTooltip`, `useM3EToast`, `LinearProgressIndicator`, `CircularProgressIndicator`, `Meter`, `LoadingIndicator`, `ContainedLoadingIndicator`, `WavyProgressIndicator`, `LinearWavyProgressIndicator`, `CircularWavyProgressIndicator`, `MaterialShapeView` |

---

## 规范文档与 AI 协作索引 (`spec/`)

- **设计基石与工程体系**：
  - [`spec/foundations/i18n-and-config.md`](./spec/foundations/i18n-and-config.md) — Key 驱动国际化、自动 RTL、`m3e.json` Schema 与 `m3eui` 规范
  - [`spec/foundations/motion-and-springs.md`](./spec/foundations/motion-and-springs.md) — 双轨物理弹簧与五端参数数学换算
  - [`spec/foundations/color-and-surfaces.md`](./spec/foundations/color-and-surfaces.md) — HCT 动态色彩与五级 `SurfaceContainer` 表面层级
- **组件详细契约**：
  - [`spec/components/web-catalog-and-base-ui.md`](./spec/components/web-catalog-and-base-ui.md) — 全量组件与 `@base-ui/react` 1.9 映射总表
  - [`spec/components/button-and-group.md`](./spec/components/button-and-group.md) — 按钮族、零和宽度挤压与分段圆角拓扑
  - [`spec/components/icon-button-and-split-button.md`](./spec/components/icon-button-and-split-button.md) — `IconButton` 5×3 宽高比矩阵与 `SplitButton` 光学居中补偿
  - [`spec/components/floating-toolbar-and-fab-menu.md`](./spec/components/floating-toolbar-and-fab-menu.md) — `FloatingToolbar` 与 `FABMenu` 弹性展开编排
  - [`spec/components/inputs-and-pickers.md`](./spec/components/inputs-and-pickers.md) — 表单编排、输入控件、无时区漂移日历与双环 `TimePicker`
  - [`spec/components/navigation-and-surfaces.md`](./spec/components/navigation-and-surfaces.md) — `NavigationMenu`、自适应 `NavigationSuite`、`Collapsible` 与 `DataTable`
  - [`spec/components/segmented-list.md`](./spec/components/segmented-list.md) — `SegmentedList` 邻项联动圆角列表
  - [`spec/components/overlays-and-feedback.md`](./spec/components/overlays-and-feedback.md) — 抽屉、对话框、多级菜单、4px 轨道裂隙进度条与计量器
  - [`spec/components/loading-and-wavy-progress.md`](./spec/components/loading-and-wavy-progress.md) — 多边形形变加载指示器与极坐标波浪进度条
- **AI 助手上下文**：[`spec/AI_SKILL.md`](./spec/AI_SKILL.md) 与 [`llms.txt`](./llms.txt)

---

## 本地开发与发包命令

```bash
pnpm install
pnpm dev          # 启动交互式文档站 (http://localhost:5173)
pnpm build        # 构建统一单包 m3eui，同步静态主题 CSS 并打包 Playground
pnpm test         # 运行 Vitest 数学、CLI、国际化与 DOM 交互回归测试
pnpm m3e:doctor   # 校验 m3e.json、静态 CSS 同步一致性与组件源码 0 硬编码 CJK 守卫
pnpm typecheck    # 全仓 TypeScript 严格类型检查
pnpm release      # 一键构建并发布单包 m3eui 至 npm
```

---

## 开源协议

[Apache-2.0](./LICENSE)
