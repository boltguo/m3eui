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

## 子路径导出与 CLI

- `m3eui` — 组件、Hooks、`M3EProvider`、`CSPProvider`、`getM3EInitScript`、配置与令牌
- `m3eui/styles.css` — 组件样式表（`--m3e-*` 变量 + `light-dark()`）
- `m3eui/tokens` & `m3eui/tokens.json` — HCT 色阶计算、弹簧求解、圆角拓扑与 35 种 `MaterialShapes`
- `m3eui/i18n` — `zh-CN`、`en-US`、`ja-JP`、`ar-SA` 词典与 `M3EMessageKey` 类型
- `m3eui/config` — `defineM3EConfig`、`resolveM3EConfig`、`serializeM3EConfig`、`generateM3EStaticThemeCss`
- `m3eui/primitives` — 透出的 `@base-ui/react` 无头原语
- `m3eui/m3e.schema.json` — `m3e.json` JSON Schema
- `m3eui/components/*` — 单组件模块入口
- **CLI（`npx m3eui` / `npx m3e`）**：`init`、`sync`、`locale`、`doctor`

## 开源协议

[Apache-2.0](./LICENSE)
