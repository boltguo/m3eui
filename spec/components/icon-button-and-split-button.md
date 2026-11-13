# 五档三宽图标按钮与非对称分裂按钮 (`icon-button-and-split-button`)

> 源码对齐：AOSP `IconButton.kt`、`{XSmall..XLarge}IconButtonTokens.kt`、`SplitButton.kt`、`SplitButton{XSmall..XLarge}Tokens.kt`、`MenuDefaults.kt`
> 代码事实源：`packages/tokens/src/topology.ts`

---

## Part A：`IconButton` & `IconToggleButton`（5 档高度 × 3 种长宽比矩阵）

在传统 M3 中，图标按钮只有单一正方形/正圆形态（`40 × 40`）。Material 3 Expressive 引入了 **5 档高度（XS–XL）× 3 档水平胖瘦比例（`narrow` / `default` / `wide`）= 15 种标准几何规格**，用于在紧凑工具栏与核心主操作（如相机快门、媒体播放控制）之间建立视觉权重阶梯。

### 1. 精确尺寸与圆角矩阵 (`ICON_BUTTON_SIZE_SPECS`)

总宽度严格由公式 $W = S_{\text{icon}} + 2 \times P_{\text{inline}}$ 决定（单位：逻辑像素 `px / pt / dp / lp`）：

| 档位 | 高度 $H$ | 图标 $S_{\text{icon}}$ | `narrow` 宽 (内距) | `default` 宽 (内距) | `wide` 宽 (内距) | 静止圆角 `round` / `square` | 按压圆角 `pressed` | 选中翻转圆角 (`round`→方 / `square`→圆) | 描边宽 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`xs`** | `32` | `20` | `28` (`4`) | `32` (`6`) | `40` (`10`) | `16` / `12` | `8` | `12` / `16` | `1` |
| **`sm`** | `40` | `24` | `32` (`4`) | `40` (`8`) | `52` (`14`) | `20` / `12` | `8` | `12` / `20` | `1` |
| **`md`** | `56` | `24` | `48` (`12`) | `56` (`16`) | `72` (`24`) | `28` / `16` | `12` | `16` / `28` | `1` |
| **`lg`** | `96` | `32` | `64` (`16`) | `96` (`32`) | `128` (`48`) | `48` / `28` | `16` | `28` / `48` | `2` |
| **`xl`** | `136` | `40` | `104` (`32`) | `136` (`48`) | `184` (`72`) | `68` / `28` | `16` | `28` / `68` | `3` |

### 2. 状态优先级不变量 (`shapeByInteraction`)

与 `ConnectedButtonGroup` 一致，圆角形变严格遵循 **`pressed > selected > rest`** 优先级（由 `fastSpatial` 弹簧 `ζ = 0.6, k = 800` 驱动）：
- 未选中静止态（`shape = "round"`）：四角为胶囊半高 `roundCornerRadius`；
- 按下瞬间（无论当前是否已选中）：四角向内收紧至 `pressedCornerRadius`（例如 `SM` 从 `20 -> 8` 或从已选中的 `12 -> 8`），并在快速点击时保持至少 `95ms` 最小物理可见驻留；
- 松手进入选中态（`IconToggleButton`）：默认 `round` 形态反转为柔和方角 `selectedRoundCornerRadius`（`SM: 12`），默认 `square` 形态反转为满圆胶囊 `selectedSquareCornerRadius`（`SM: 20`），确保即使在色盲或高对比模式下也具备明确的**非色彩几何状态反馈**。

---

## Part B：`SplitButton`（非对称分裂按钮）与分段下拉菜单

`SplitButton` 将高频主动作（左侧 Leading Button）与次级菜单触发器（右侧 Trailing Menu Button）通过 **`2px` 接缝** 组合为一个视觉胶囊整体。

### 1. 五档分裂按钮规格 (`SPLIT_BUTTON_SPECS`)

| 档位 | 高度 $H$ | 接缝 `gap` | 内缝静止圆角 $r_{\text{rest}}$ | 内缝激活圆角 $r_{\text{active}}$ | 主按钮内距 `[start, end]` | 右触发器内距 `inline` | 右箭头尺寸 | 右触发器总宽 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`xs`** | `32` | `2` | `4` | `8` | `[12, 10]` | `13` | `22` | `48` |
| **`sm`** | `40` | `2` | `4` | `12` | `[16, 12]` | `13` | `22` | `48` |
| **`md`** | `56` | `2` | `4` | `12` | `[24, 24]` | `15` | `26` | `56` |
| **`lg`** | `96` | `2` | `8` | `20` | `[48, 48]` | `29` | `38` | `96` |
| **`xl`** | `136` | `2` | `12` | `20` | `[64, 64]` | `43` | `50` | `136` |

### 2. 非对称圆角形变与视觉光学居中 (`resolveSplitButtonGeometry`)

令外侧胶囊半径 $R_{\text{pill}} = H / 2$，四角顺序 `[topLeft, topRight, bottomRight, bottomLeft]`：

1. **左侧主按钮 (`leadingCorners`)**：
   - 静止态：`[R_pill, r_rest, r_rest, R_pill]`（例如 `SM` 为 `[20, 4, 4, 20]`）；
   - 按压态：`[R_pill, r_active, r_active, R_pill]`（**注意与 `ConnectedButtonGroup` 相反**：`SplitButton` 静止内缝极窄为 `4px`，按压时内角**柔化放大**至 `12px`，产生半独立回弹感）。
2. **右侧菜单触发器 (`trailingCorners`)**：
   - 静止关闭态：`[r_rest, R_pill, R_pill, r_rest]`（`SM` 为 `[4, 20, 20, 4]`）；
   - 按压态：`[r_active, R_pill, R_pill, r_active]`（`SM` 为 `[12, 20, 20, 12]`）；
   - **菜单展开态 (`expanded = true`)**：脱离接缝独立变为对称满胶囊 **`[R_pill, R_pill, R_pill, R_pill]`**（`SM` 为 `[20, 20, 20, 20]`），同时下箭头通过 `fastSpatial` 弹簧做 **`0° → 180°`** 带微过冲翻转！
3. **光学水平居中补偿 (`Modifier.horizontalCenterOptically`)**：
   - 当右侧触发器处于左平（`4px`）右圆（`20px`）的非对称半胶囊态时，几何中心会让箭头显得偏右；
   - 必须施加水平光学偏移（对齐 AOSP `SplitButton.kt` `MaxDistanceCoefficient = 0.11f`）：

$$
\Delta x_{\text{optical}} = -0.11 \times (r_{\text{right}} - r_{\text{left}})
$$

   - 在 `SM` 关闭态下 $\Delta x_{\text{optical}} = -0.11 \times (20 - 4) = -1.76\text{px}$（向内侧平缝微移）；当菜单展开变为对称 `[20, 20, 20, 20]` 时，$\Delta x_{\text{optical}}$ 随弹簧平滑归零至 `0px`！

### 3. 同心圆分段下拉菜单 (`SEGMENTED_MENU_TOKENS`)

展开的下拉菜单同样遵循 M3E 同心圆与分段拓扑约束：
- 外层浮层圆角 $R_{\text{popup}} = 16$，内边距 $P = 4$，项间距 `gap = 2`；
- 首尾菜单项外侧圆角严格满足同心关系 $R_{\text{item,outer}} = R_{\text{popup}} - P = 16 - 4 = 12$，相邻内缝圆角为 `4`；
- 当某菜单项处于键盘/指针高亮（`highlighted`）或选中态时，四角独立圆化为 `[12, 12, 12, 12]`。

---

## 四端实现映射

| 平台 | 非对称圆角与光学偏移实现方式 |
| :--- | :--- |
| **Jetpack Compose** | `SplitButtonLayout` + `SplitButtonDefaults.leadingButton` / `trailingButton`（内置 `horizontalCenterOptically`） |
| **SwiftUI** | 左右两个 `Button` 置于 `HStack(spacing: 2)`，背景使用 `UnevenRoundedRectangle`，右图标附加 `.offset(x: trailingOpticalOffsetPx)` 与 `.rotationEffect(.degrees(chevronDeg))` |
| **Flutter** | `Row(spacing: 2)` + `RoundedRectangleBorder(borderRadius: BorderRadius.only(...))` + `Transform.translate` / `RotationTransition` |
| **Web (`m3eui`)** | `@base-ui/react/button` + `@base-ui/react/menu`，独立 CSS `translate` / `rotate` 属性（含静止态单位变换基线）配合 `useM3ECornerSpring` |
