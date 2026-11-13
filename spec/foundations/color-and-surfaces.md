# HCT 动态色彩与五级容器表面层级 (`color-and-surfaces`)

> 代码事实源：`packages/tokens/src/color.ts` (`generateM3EThemeTokens`)

---

## 1. 感知均匀色彩空间 HCT (`SchemeExpressive`)

M3E 不使用手调 RGB 色阶，而是从单一 `seedHex`（如 `#6750A4`）经由 Google **HCT (Hue-Chroma-Tone)** 色彩空间派生完整的 Light / Dark 双模态语义角色：

- **`SchemeExpressive`**：M3E 标志性方案，相比传统 `SchemeTonalSpot` 对色相进行富表现力旋转并提升容器饱和度（Chroma），同时严格保证 `on*` 文本与对应背景满足 WCAG AA 对比度底线。
- **对比度档位 (`contrastLevel ∈ [-1, 1]`)**：`0` 为标准设计对比度，`0.5` 中高对比度，`1.0` 无障碍极高对比度。

---

## 2. 用五级 `surfaceContainer` 取代阴影滥用

M3E 废弃传统基于透明度叠加（`alpha overlay`）与重度投影（`drop-shadow`）的层次区分，改用 **5 级确定性色温表面容器**：

| 层级角色 | 用途约束 |
| :--- | :--- |
| `surface` | 页面根画布底色 |
| `surfaceContainerLowest` | 嵌入画布之下的凹陷输入区或纯白/纯深卡片底 |
| `surfaceContainerLow` | `SegmentedListItem` 默认静止态、`ElevatedButton` 静止底色 |
| `surfaceContainer` | 导航栏、卡片分组背景、次级面板 |
| `surfaceContainerHigh` | 列表项悬停态 (`hover`)、对话框与弹出菜单 |
| `surfaceContainerHighest` | 未选中 `ToggleButton` 底色、列表项按压态、输入框填充底 |

---

## 3. 多通道状态传达与跨平台暗色约束

1. **禁止仅靠颜色表达选中态**：
   任何可选组件（`ToggleButton`、`ConnectedButtonGroup`、`SegmentedListItem`）在进入 `selected` 时，**必须同时叠加至少两种非颜色信号**：
   - 圆角拓扑形变（例如胶囊 `20` ↔ 方角 `12`，或分段内角 `4` → 独立外角 `16`）；
   - 显式勾选图标（Checkmark SVG / SF Symbol `checkmark`）。
2. **跨平台原生暗色实现**：
   - **Web**：在 `<head>` 声明 `<meta name="color-scheme" content="light dark">`，`:root` 设置 `color-scheme: light dark`，通过原生 CSS `light-dark(lightHex, darkHex)` 输出所有 `--m3e-color-*` 变量，并用 `:root:has(> head > meta[name="color-scheme"][content="dark"])` 同步用户三态切换（跟随系统 / 浅色 / 深色）。
   - **SwiftUI**：使用 `Color(light:dark:)` Asset Catalog 或 `@Environment(\.colorScheme)` 读取同一份 `themeTokens.light` / `themeTokens.dark` 十六进制字典。
   - **Flutter**：由 `generateM3EThemeTokens` 直接映射至 `ColorScheme(brightness: Brightness.light / dark, ...)`。
