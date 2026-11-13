# 分段列表单/多条圆角拓扑规范 (`segmented-list`)

> 源码对齐：AOSP `ListTokens.kt` (`v29.0.0`) & `ListItem.kt` (`ListItemDefaults.segmentedShapes`)
> 代码事实源：`packages/tokens/src/topology.ts` (`SEGMENTED_LIST_TOKENS`, `resolveSegmentedListCorners`)

---

## 1. 为什么传统分割线列表在 M3E 中被升级？

传统列表使用 `1px` 分割线将条目切碎在同一个直角卡片内；M3E 引入 **`SegmentedList`（分段卡片流）**：通过 **`2px` 物理缝隙 (`SegmentedGap = 2`)** 与 **非对称内外圆角对比（外角 `16` vs 内角 `4`）** 将一组相关条目聚合为一个视觉整体，同时允许被按压或选中的条目动态「脱离」为独立圆角卡片。

---

## 2. 确定性圆角状态矩阵 (`resolveSegmentedListCorners`)

返回值顺序为 `[topLeft, topRight, bottomRight, bottomLeft]`（逻辑像素）：

| 列表总条数 (`count`) | 当前项位置 (`index`) | 静止态 (`rest`) | 悬停态 (`hover`, 未选中) | 按压 / 选中 / 展开 (`pressed \| selected \| expanded`) |
| :---: | :--- | :---: | :---: | :---: |
| **`count === 1`（单条）** | 唯一项 (`index = 0`) | **`[16, 16, 16, 16]`** | **`[16, 16, 16, 16]`** | `[16, 16, 16, 16]` |
| **`count > 1`（多条）** | 首项 (`index = 0`) | **`[16, 16, 4, 4]`** | **`[16, 16, 4, 4]`**（仅变背景色） | **`[16, 16, 16, 16]`** |
| **`count > 1`（多条）** | 中间项 (`0 < i < count - 1`) | **`[4, 4, 4, 4]`** | **`[4, 4, 4, 4]`**（仅变背景色） | **`[16, 16, 16, 16]`** |
| **`count > 1`（多条）** | 末项 (`index = count - 1`) | **`[4, 4, 16, 16]`** | **`[4, 4, 16, 16]`**（仅变背景色） | **`[16, 16, 16, 16]`** |

> **关键易错点 1（单条收敛）**：当列表因筛选、删除或异步加载变为 **仅剩 1 条 (`count === 1`)** 时，该条目**绝不能**残留 `[16, 16, 4, 4]` 的底部小直角，必须自动收敛为 `[16, 16, 16, 16]`。
>
> **关键易错点 2（AOSP 源码 Hover 缺陷修正）**：AOSP `ListItemDefaults.kt`（L449–521）在实现 `segmentedShapes` 时仅覆写了默认 `shape`，遗留了面向普通无边框列表的 `hoveredShape = CornerMedium (12dp)`。在桌面/Web 鼠标悬停时，若将首项底部内角放大为 `12px`，不仅在 AOSP 中会把顶部外角从 `16dp` 错误缩小回 `12dp`，更会在 `2px` 缝隙处与下一项的 `4px` 顶角形成不对称楔形缺口，且鼠标划过列表时引发持续果冻抖动。因此分段列表必须与 `ConnectedButtonGroup`（`ButtonGroup.kt` L251–277）保持一致：**`hover` 仅通过 `effects` 弹簧切换容器底色（`surfaceContainerLow` → `surfaceContainerHigh`），内角保持 `4px` 严丝合缝；仅在 `pressed / selected / expanded / dragged` 时才分离为 `[16, 16, 16, 16]`**。

---

## 3. 尺寸、间距与色彩角色约束

- **项间垂直间距 (`gap`)**：严格固定为 `2`（不可用 `border-bottom` 代替）。
- **最小行高 (`minHeight`)**：单行 `56`、双行（含辅助说明）`72`、三行 `88`。
- **内边距与内部间距**：水平内边距 `16`，垂直内边距 `10`（三行模式 `12`），前导区/正文/尾随区水平间距 `12`。
- **表面与选中态语义色**：
  - 静止底色：`surfaceContainerLow`，文本 `onSurface`，辅助文本 `onSurfaceVariant`；
  - 悬停底色：`surfaceContainerHigh`；
  - 选中底色：`secondaryContainer`，文本 `onSecondaryContainer`，前导徽章切换为 `primary` 底色 + `onPrimary` 勾选图标；
  - 四角半径过渡必须绑定 `fastSpatial` 弹簧，背景色过渡必须绑定 `fastEffects` 临界阻尼弹簧。

---

## 4. 四端实现要点

- **Web**：外层使用 `<ul role="list">`（Safari 在 `list-style: none` 下会剥离默认列表语义，显式 `role="list"` 可恢复读屏播报条数），每项为 `<li><button type="button" aria-pressed="...">`，禁止写成 `<li role="button">`。
- **SwiftUI**：使用 `VStack(spacing: 2)` 配合 `UnevenRoundedRectangle(topLeadingRadius: tl, bottomLeadingRadius: bl, bottomTrailingRadius: br, topTrailingRadius: tr, style: .continuous)`，状态变化包裹在 `withAnimation(.spring(mass: 1, stiffness: 800, damping: 33.94))`。
- **Flutter**：使用 `Column` / `ListView.separated(separatorBuilder: (_, __) => SizedBox(height: 2))` 配合 `BorderRadius.only(...)` 与物理弹簧动画控制器。
