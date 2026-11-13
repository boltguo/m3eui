# m3eui

[English](./README.md) | **简体中文**

一站式 **Material 3 Expressive (`1.5.0`)** React 组件库：单包完整内置 60+ 无障碍组件（基于 `@base-ui/react` `1.9.0`）、HCT 动态色彩与双轨物理弹簧引擎、100% Key 驱动国际化与自动 RTL 镜像、声明式 `m3e.json` 命令行工具以及零 Tailwind 原生语义化 CSS（`light-dark()`）。

## 安装

只需安装 **`m3eui` 一个包**（组件、样式、数学令牌与 `npx m3eui` CLI 全部内置）：

```bash
pnpm add m3eui
# 或
npm install m3eui
```

宿主依赖：`react >= 18.0.0`、`react-dom >= 18.0.0`。

## 快速上手

```bash
# 可选：生成 m3e.json 并编译首屏零闪烁静态主题 CSS
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
      <Button variant="filled">立即继续</Button>
      <Switch label="开启通知" defaultChecked />
      <DatePickerField label="发布日期" defaultValue="2026-11-18" />
    </M3EProvider>
  );
}
```

## 子路径导出与内置 CLI

- `m3eui` — 全部 60+ 组件、Hooks、`M3EProvider`、`CSPProvider`、`getM3EInitScript`、配置与设计令牌
- `m3eui/styles.css` — 核心语义样式表（`--m3e-*` 自定义属性 + `light-dark()`）
- `m3eui/tokens` & `m3eui/tokens.json` — 零 React 依赖的纯数学 HCT 色阶合成、五端弹簧求解器、圆角拓扑与 35 种 `MaterialShapes`
- `m3eui/i18n` — 内置 `zh-CN` / `en-US` / `ja-JP` / `ar-SA` 语言包与 78 个强类型 `M3EMessageKey`
- `m3eui/config` — `defineM3EConfig`、`resolveM3EConfig`、`serializeM3EConfig`、`generateM3EStaticThemeCss`
- `m3eui/primitives` — 透出的 `@base-ui/react` 复合无头原语
- `m3eui/m3e.schema.json` — `m3e.json` 的编辑器自动补全与校验 Schema
- `m3eui/components/*` — 单模块按需引入入口（如 `m3eui/components/Button`）
- **内置命令行（`npx m3eui` / `npx m3e`）**：支持 `init`、`sync`、`locale`、`doctor`

## 开源协议

Apache-2.0
