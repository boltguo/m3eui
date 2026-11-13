# 五档按钮与零和挤压按钮组 (`button-and-group`)

> 源码对齐：AOSP `Button.kt`、`ButtonGroup.kt`、`ConnectedButtonGroupSmallTokens.kt`
> 代码事实源：`packages/tokens/src/topology.ts` (`BUTTON_SIZE_SPECS`, `resolveConnectedGroupCorners`, `computeButtonGroupWidths`)

---

## 1. 五档尺寸矩阵 (`XS` – `XL`)

所有单位均为 `1:1` 逻辑像素（Web `px` / SwiftUI `pt` / Android `dp` / Flutter `lp`）：

| 档位 (`size`) | 高度 (`height`) | 水平内边距 (`px`) | 图标尺寸 | 图标间距 | 字号 / 行高 | 胶囊圆角 (`round`) | 方角圆角 (`square`) | 按压圆角 (`pressed`) | `Toggle` 选中圆角 |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`xs`** | `32` | `12` | `18` | `6` | `13 / 18` | `16` | `12` | `8` | `12` |
| **`sm`** | `40` | `16` | `20` | `8` | `14 / 20` | `20` | `12` | `8` | `12` |
| **`md`** | `56` | `24` | `24` | `8` | `16 / 24` | `28` | `16` | `12` | `16` |
| **`lg`** | `96` | `48` | `32` | `12` | `24 / 32` | `48` | `28` | `16` | `28` |
| **`xl`** | `136` | `64` | `40` | `16` | `32 / 40` | `68` | `28` | `16` | `28` |

### 关键交互约束
1. **按压圆角收紧**：指针/键盘按下时，四角通过 `fastSpatial` (`ζ=0.6, k=800`) 弹簧向 `pressedCornerRadius` 收缩；颜色通过 `fastEffects` (`ζ=1.0, k=3800`) 临界阻尼过渡。
2. **快速点击最短驻留 (`MinHold = 95ms`)**：人类快速点击（`pointerdown` → `pointerup` 仅 `15–30ms`）会导致弹簧尚未展开即被取消。实现层必须保证按压态最短保持 `~95ms` 后再释放回弹，确保每次点击都有清晰可见的物理形变。
3. **`ToggleButton` 圆角对调**：默认胶囊态 (`round`) 选中后变为圆角矩形 (`selectedCornerRadius`)，并展示勾选图标；若起始为 `square`，选中后变为胶囊 (`height / 2`)。

---

## 2. `ButtonGroup` 双模式拓扑与默认宽度行为规范

M3E 使用 `ConnectedButtonGroup` 正式取代旧版 M3 的刚性 `SegmentedButton`。**极其关键的职责边界（对齐 AOSP `ButtonGroup.kt` L118–120 与 `ButtonGroupSamples.kt` L75–252）**：

| 模式 | 项间距 (`gap`) | 默认按压膨胀比 (`expandedRatio`) | 圆角与物理反馈规则 `[topLeft, topRight, bottomRight, bottomLeft]` (`pill = height / 2`) |
| :--- | :---: | :---: | :--- |
| **`standard`**<br>*(动作工具栏)* | `12` | **`0.15` (`15%`)**<br>按住触发零和邻项挤压 | 每项独立使用 `Button` / `ToggleButton` 圆角规范；按压时当前项向左右邻居借宽 `15%` |
| **`connected`**<br>*(分段单选/多选器)* | `2` | **`0` (`0%` 恒定锁定)**<br>禁止默认挤压跳宽 | **优先级铁律 (`pressed > checked > rest`，对齐 `ToggleButton.kt` L1714)**：<br>- **按压态 (`isPressed`)**：首项 `[pill, 4, 4, pill]`、中间 `[4, 4, 4, 4]`、末项 `[4, pill, pill, 4]`（即使已选中，按下时内角也收缩至 `4`）<br>- **选中静止态 (`!isPressed && isChecked`)**：完整胶囊 `[pill, pill, pill, pill]`<br>- **未选中静止态**：首项 `[pill, 8, 8, pill]`、中间 `[8, 8, 8, 8]`、末项 `[8, pill, pill, 8]` |

> **为什么 `ConnectedButtonGroup` 默认 `expandedRatio = 0`（宽度恒定不变）？**
> 在 AOSP 官方示例 `SingleSelectConnectedButtonGroupSample` 与 `MultiSelectConnectedButtonGroupSample`（`ButtonGroupSamples.kt` L158–252）中，连接态分段选择器直接承载于 `2dp` 间距容器中，**默认不挂载 `Modifier.animateWidth`**。因为分段切换器（如「日视图 / 周视图 / 月度概览 / 全年」）承担高频视图切换职责，其 Expressive 物理反馈已由 **「接缝内角 `8 → 4 → 胶囊 20` 脱离形变 + 同尺寸图标槽位原位切换」** 完整表达；若再默认叠加 `15%` 宽度膨胀，会导致每次点击切 Tab 时相邻文字左右横跳，破坏视觉锚点。仅当开发者显式传入 `expandedRatio = 0.15` 时才开启挤压。

---

## 3. 零和 15% 宽度扩展与邻项挤压算法 (`computeButtonGroupWidths`)

当按钮组内第 $i$ 项被按下（弹簧进度为 $p_i \ge 0$，允许欠阻尼过冲超过 $1.0$），其目标膨胀比例为 `ExpandedRatio = 0.15`（`15%`），膨胀所需像素**完全向紧邻按钮借用**，从而保证整行总宽度恒定不变：

$$
\sum_{k=0}^{n-1} w'_k \equiv \sum_{k=0}^{n-1} w_k
$$

- **中间项 ($0 < i < n - 1$)**：目标单侧借用 $\Delta = p_i \cdot \min\left(\frac{0.15 w_i}{2},\; L_{i-1},\; L_{i+1}\right)$，左右邻居各缩减 $\Delta$，当前项增加 $2\Delta$（其中压缩上限 $L_k$ 默认取该按钮的水平内边距 `paddingHorizontal`，保证邻居文字绝不被裁切）。
- **首项 ($i = 0$)**：目标借用 $\Delta = p_0 \cdot \min(0.15 w_0,\; L_1)$，仅向右侧第 `1` 项借用 $\Delta$。
- **末项 ($i = n - 1$)**：目标借用 $\Delta = p_{n-1} \cdot \min(0.15 w_{n-1},\; L_{n-2})$，仅向左侧第 `n-2` 项借用 $\Delta$。

### 各平台落地提示与防抖动铁律
1. **内边距吸收挤压原则（严禁文字省略号重排）**：
   AOSP `ButtonGroup.kt`（L1206–1211）明确为按钮文本指定 `maxLines = 1, softWrap = false, overflow = TextOverflow.Visible`。当邻居按钮在 `15%` 挤压中宽度缩减时，**缩减量必须 100% 由左右水平内边距（`paddingHorizontal`）吸收**，内部文本盒子不可缩水触发 `...`（Web 端在锁定动态 `width` 后应将按钮自身 `padding-inline` 置 `0` 并居中对齐，且对 `.label` 设置 `flex-shrink: 0; overflow: visible`）。
2. **等宽图标槽位原则（严禁选中瞬间插入图标跳宽）**：
   不同于旧版 M3 `SegmentedButton`，AOSP `SingleSelectConnectedButtonGroupSample`（`ButtonGroupSamples.kt` L158–197）规定：要么采用纯文本（靠内角 `8` → 完整胶囊 `pill` 形态切换表达选中），要么未选中与选中态均常驻同尺寸图标槽位（例如 `Outlined` 图标原位切换为 `Filled / Check` 图标）。**严禁在选中点击瞬间动态插入一个原本不存在的图标**，否则会在按压弹簧尚未回弹时引发基准宽度 `baseWidths` 二次突变抖动。
3. **跨平台布局挂载**：
   - **Web (`m3eui`)**：仅在挂载或尺寸档位变化时采集一次静止宽度 `baseWidths`（点击切换选中态绝不重置测量），由 `useM3EScalarSpring` 驱动 `pressProgress` 实时代入 `computeButtonGroupWidths`。
   - **SwiftUI**：使用自定义 `Layout` 协议（iOS 16+），在 `sizeThatFits` 中缓存子视图理想宽度，在 `placeSubviews` 中直接调用同构公式分配 `ProposedViewSize(width: wPrime[i], height: height)`。
   - **Flutter**：在 `CustomMultiChildLayout` 的 `performLayout` 中先测量自然基准宽度，再按 `pressProgress` 分配紧约束宽度。
