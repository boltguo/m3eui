# 悬浮胶囊工具栏与弹出式 FAB 菜单 (`floating-toolbar-and-fab-menu`)

> 源码对齐：AOSP `FloatingToolbar.kt`、`FloatingToolbarTokens.kt`、`FloatingActionButtonMenu.kt`、`FabMenuBaselineTokens.kt`
> 代码事实源：`packages/tokens/src/topology.ts`

---

## Part A：`FloatingToolbar`（取代传统固定 BottomAppBar）

Material 3 Expressive 废弃了贴底通栏的笨重 `BottomAppBar`，改用脱离屏幕边缘悬浮的胶囊形 **`FloatingToolbar`**（支持水平 `horizontal` 与垂直 `vertical` 两种轴向，以及 `standard` 与 `vibrant` 两套色彩主题）。

### 1. 严格同心胶囊几何 (`FLOATING_TOOLBAR_TOKENS`)

| 参数 | 数值（逻辑像素） | 几何约束关系 |
| :--- | :---: | :--- |
| `containerCrossSize` | `64` | 水平模式为容器高度 `64`，垂直模式为容器宽度 `64` |
| `containerRadius` | `32` | 完整半圆胶囊 $64 / 2 = 32$ |
| `containerPadding` | `8` | 四周等距内边距 |
| `itemSize` | `48` | 内部图标动作项高度/宽度 $64 - 2 \times 8 = 48$，其圆角半径 $24 = 32 - 8$（**严格同心圆！**） |
| `itemGap` | `4` | 内部动作项间距 |
| `companionFabGap` | `8` | 右侧（或下方）伴随独立 FAB 时的间距 |
| `externalMargin` | `16` | 距离视口安全区边缘的最小悬浮留白 |

### 2. 双主题色彩契约 (`standard` vs `vibrant`)

| 角色 | `standard`（低干扰内容阅读态） | `vibrant`（高表现力主工具态） |
| :--- | :--- | :--- |
| **工具栏容器底色** | `surfaceContainerHigh` | `primaryContainer` |
| **未选中按钮文字/图标** | `onSurfaceVariant` | `onPrimaryContainer` |
| **选中态 (`aria-pressed="true"`) 容器** | `secondaryContainer` | `surfaceContainerLowest`（高反差衬底浮出） |
| **选中态文字/图标** | `onSecondaryContainer` | `onSurface` |

---

## Part B：`ToggleFAB` + `FABMenu`（连续形变悬浮动作菜单）

传统 Speed-Dial FAB 点击时往往只是生硬弹出小圆钮。M3E 的 `FloatingActionButtonMenu` 定义了 **主按钮连续尺寸/圆角/色彩形变** 与 **自下而上弹簧错峰展开（Bottom-up Staggered Spring）** 的完整编排。

### 1. `ToggleFAB` 展开形变方程 (`resolveToggleFabGeometry`)

令弹簧进度 $p \in [0, 1]$（由 `fastSpatial` 驱动，允许欠阻尼过冲 $p > 1$）：

| 初始尺寸档位 | 收起态 ($p = 0$) `[size, radius, icon]` | 展开为关闭按钮 ($p = 1$) `[size, radius, icon]` | 颜色过渡 (`fastEffects` 零过冲) |
| :---: | :---: | :---: | :--- |
| **`sm` (Baseline)** | `56 × 56`, `r = 16`, `icon = 24` | `56 × 56`, `r = 28` (正圆), `icon = 20` | `primaryContainer` → `primary` |
| **`md` (Medium)** | `80 × 80`, `r = 20`, `icon = 28` | `56 × 56`, `r = 28` (正圆), `icon = 20` | `primaryContainer` → `primary` |
| **`lg` (Large)** | `96 × 96`, `r = 28`, `icon = 36` | `56 × 56`, `r = 28` (正圆), `icon = 20` | `primaryContainer` → `primary` |

对任意瞬时弹簧位移 $p$：

$$
\begin{aligned}
S(p) &= S_0 + (56 - S_0)\cdot p \\
R(p) &= R_0 + (28 - R_0)\cdot p \\
\theta_{\text{icon}}(p) &= 45^\circ \cdot p \quad (\text{将 } + \text{ 旋转为 } \times)
\end{aligned}
$$

### 2. `FABMenu` 菜单项几何与错峰时序 (`FAB_MENU_TOKENS`)

- **菜单项胶囊规格**：高度 `56`、圆角 `28`（满胶囊）、水平内距 `24`、图标 `24`、图文间距 `8`、项间垂直间距 `4`、与底部关闭按钮间距 `8`。
- **自下而上错峰物理规则**：
  - 设共有 $N$ 个菜单项（索引 $i = 0 \dots N-1$，其中 $i = N - 1$ 最靠近底部 `ToggleFAB`）：
  - **展开时（Open）**：最靠近 `ToggleFAB` 的底部项最先弹出，延迟 $\Delta t_{\text{open}}(i) = (N - 1 - i) \times 35\text{ms}$；
  - **收起时（Close）**：最顶部的远端项最先收回，延迟 $\Delta t_{\text{close}}(i) = i \times 25\text{ms}$；
  - 位移与缩放使用 `defaultSpatial`（`translate: 0 18px -> 0 0`、`scale: 0.88 -> 1`），不透明度严格使用 `fastEffects`（临界阻尼 `ζ = 1.0`，防止透明度闪烁）。

---

## 四端无障碍与高对比度规范

1. **工具栏键盘导航**：Web 使用 `@base-ui/react/toolbar`（内置方向键 Roving Tabindex 循环聚焦与 `role="toolbar"`、`aria-orientation`）；iOS / Android 确保 VoiceOver / TalkBack 将工具栏识别为单一容器分组。
2. **高对比度分隔线**：工具栏内部分隔线必须使用 `border`（而非纯 `background-color`）绘制，确保 Windows / Web `forced-colors: active` 高对比度模式下分隔线不会消失。
3. **键盘关闭与焦点归还**：`FABMenu` 展开时支持 `Escape` 键一键收起并将焦点归还至 `ToggleFAB`。
