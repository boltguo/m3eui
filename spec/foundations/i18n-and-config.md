# 国际化 (Key-Based i18n) 与声明式工程配置 (`m3e.json` + `m3eui`) 规范

本文档定义 `m3eui` 与 `m3eui` v1.0 的**零硬编码键值国际化架构**、**原生 `Intl` 无时区漂移格式化**、**自动 RTL 镜像**以及对标 `shadcn/ui` `components.json` 的 **`m3e.json` 声明式配置体系**。

---

## 一、零硬编码键值国际化架构 (`m3eui/i18n`)

### 1.1 核心铁律：组件源码零硬编码文案
- `packages/tokens/src` 与 `packages/react/src`（除 `src/i18n/locales/` 字典目录外）**严禁出现任何硬编码自然语言字符串**。
- 该铁律由双重自动化守卫强制执行：
  1. Vitest 源码静态扫描单测（`packages/react/src/react.test.tsx`）；
  2. CLI 健康检查命令 `m3e doctor`（`zero-hardcoded-cjk` 检查项）。

### 1.2 强类型消息键字典 (`M3EMessages`)
所有组件可访问标签（`aria-label`）、实时区域播报（`role="status"` / `aria-live`）、空状态提示与内置按钮文案均收敛于 71 个强类型点分键（`M3EMessageKey`）：

| 命名空间 | 代表性键名 | 参数插值示例 |
| :--- | :--- | :--- |
| `carousel.*` | `slideAnnouncement`, `prevSlide`, `nextSlide`, `goToSlide` | `{ index, total }` |
| `collapsible.*` | `expandAll`, `collapseAll` | — |
| `combobox.*` / `select.*` | `placeholder`, `empty`, `clear` | — |
| `dataTable.*` | `empty`, `sortedAscending`, `sortedDescending`, `selectRow` | `{ column }`, `{ row }` |
| `datePicker.*` | `title`, `rangeTitle`, `selectEndPrompt`, `prevMonth`, `nextMonth` | — |
| `timePicker.*` | `title`, `switchToKeyboard`, `switchToDial`, `am`, `pm` | — |
| `form.*` | `errorSummaryHeading` | `{ count }` |
| `navigation.*` | `barLabel`, `railLabel`, `wideRailLabel`, `siteMenuLabel` | — |
| `textField.*` / `searchBar.*` | `clear`, `showPassword`, `hidePassword`, `placeholder` | — |

### 1.3 内置语言包与自定义扩展
开箱内置 4 套 100% 键对齐语言包（导出自 `m3eui` 与 `m3eui/i18n`）：
- `zh-CN`（简体中文，`zhCNMessages`）
- `en-US`（美式英语，默认兜底基准语言，`enUSMessages`）
- `ja-JP`（日语，`jaJPMessages`）
- `ar-SA`（阿拉伯语，`arSAMessages`，配合 `direction: "auto"` 自动开启全局 RTL）

**项目级部分覆写或新增语言包**：
```tsx
import { M3EProvider } from "m3eui";

<M3EProvider
  locale="fr-FR"
  messages={{
    "searchBar.placeholder": "Rechercher…",
    "datePicker.title": "Sélectionner une date",
  }}
>
  {children}
</M3EProvider>
```
亦可使用 CLI 一键生成完整强类型语言包模板：
```bash
npx m3eui locale fr-FR --out src/i18n/fr-FR.ts
```

### 1.4 零时区漂移的 `Intl` 本地化日期/时间/排序
- 日历月份标题、星期表头（周一至周日）、完整日期回显与 12h/24h 时间显示均不硬编码任何星期数组或月份表，而是统一在 **UTC 正午锚点 (`Date.UTC(y, m - 1, d, 12, 0, 0)`) + `{ timeZone: "UTC" }`** 下调用 `Intl.DateTimeFormat(locale, ...)`，彻底杜绝跨时区 `±1` 天偏移。
- `DataTable` 文本列排序使用 `new Intl.Collator(locale, { numeric: true, sensitivity: "base" })`，兼顾多语言拼音/假名序与 `v1.2 < v1.10` 自然数值序。

### 1.5 自动 RTL 识别与 `<html lang>` / `<html dir>` 同步
- 当 `direction` 设为 `"auto"`（默认值）时，`isRtlLocale(locale)` 自动识别 `ar`、`he`、`fa`、`ur` 等从右向左书写语系，联动：
  1. `<html lang={locale} dir={resolvedDirection}>` 原生文档属性（保障浏览器翻译器、屏幕阅读器发音引擎与原生滚动条位置正确）；
  2. `@base-ui/react/direction-provider` 键盘方向键翻转；
  3. `m3eui/tokens` 水平非对称圆角翻转（`flipCornersHorizontal`）与 `Switch` / `Carousel` / `Collapsible` 几何符号翻转。

---

## 二、声明式工程配置 (`m3e.json` & `defineM3EConfig`)

对标 `shadcn/ui` 的 `components.json`，项目根目录通过一份声明式 `m3e.json` 即可统一规定视觉预设、种子色、HCT 变体、对比度、弹簧方案、默认语言、书写方向、CSP 安全策略与静态 CSS 输出路径：

```json
{
  "$schema": "https://unpkg.com/m3eui@1.1.0/m3e.schema.json",
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
  "csp": {
    "nonce": "",
    "disableStyleElements": false
  },
  "css": {
    "output": "src/styles/m3e-theme.css"
  },
  "aliases": {
    "components": "@/components/ui",
    "tokens": "m3eui/tokens",
    "i18n": "@/i18n"
  }
}
```

偏好纯 TypeScript 配置的团队也可使用 `m3eui/config` 提供的 `defineM3EConfig`：
```ts
import { defineM3EConfig } from "m3eui/config";

export default defineM3EConfig({
  style: "expressive",
  theme: { seed: "#0B6B58", schemeVariant: "vibrant", contrastLevel: 0.5 },
  i18n: { locale: "zh-CN", direction: "auto" },
});
```

---

## 三、`m3eui` 命令行工具链

| 命令 | 作用 |
| :--- | :--- |
| `m3e init [--seed #6750A4] [--variant expressive] [--locale zh-CN] [--output src/styles/m3e-theme.css]` | 在项目根目录初始化 `m3e.json` 并立即生成首屏零闪烁静态主题变量表 |
| `m3e sync [--config m3e.json]` | 读取 `m3e.json`，编译 HCT `light-dark()` 色彩角色与 `linear()` 弹簧时间曲线至 `css.output` |
| `m3e locale --list` / `m3e locale <tag> [--out path]` | 查看内置语言包列表，或按给定 BCP 47 语言标签生成完整强类型翻译模板 |
| `m3e doctor [--config m3e.json]` | 校验 `m3e.json` 合法性、种子色十六进制格式、`[-1, 1]` 对比度区间、静态 CSS 同步状态以及源码零硬编码 CJK 守卫 |
