# 浮层模态、反馈指示器与参数化多边形规范 (`overlays-and-feedback`)

本文档规定 `m3eui` 模态与非模态浮层、全局通知、进度/计量条以及 35 种参数化多边形组件的视觉与物理契约。

---

## 一、模态与非模态浮层体系

| 组件 | 底层原语 | 容器表面与圆角 | 核心交互契约 |
| :--- | :--- | :--- | :--- |
| **`Dialog` & `AlertDialog`** | `Dialog` / `AlertDialog` | `SurfaceContainerHigh` · `28px` | 模态焦点锁定、背景惰性化；`Dialog` 支持可选 `showCloseButton`（自动使用 `t("dialog.close")` 无障碍标签）；破坏性确认统一使用 `AlertDialog`。 |
| **`BottomSheet` & `SideSheet`** | `Drawer` | `SurfaceContainerLow` · `28px` | 支持顶部拖拽把手（Drag Handle）跟手阻尼关闭；关闭按钮默认取 `t("sheet.close")`；RTL 模式下 `SideSheet` 自动按逻辑方位滑入。 |
| **`DropdownMenu` & `ContextMenu`** | `Menu` / `ContextMenu` | `SurfaceContainer` · `16px`（内项 `12px`） | 支持跨分组 `separatorBefore` 动态圆角、复选菜单项以及无限级递归 `submenu`（拥有 `submenu` 的父项仅负责展开子级，严禁混绑 `onSelect`）。 |
| **`Popover` & `PreviewCard`** | `Popover` / `PreviewCard` | `SurfaceContainerHigh` · `20px` | 视口碰撞自动翻转定位；`PreviewCard` 用于链接悬停/聚焦富媒体预览，不劫持主键盘流。 |
| **`Tooltip` & `RichTooltip`** | `Tooltip` | `InverseSurface` (`8px`) / `SurfaceContainerHigh` (`16px`) | 全局共享 `BaseTooltip.Provider` 悬停预热通道，相邻提示框瞬时切换零延迟。 |
| **`Toast` (`useM3EToast`)** | `Toast` | `InverseSurface` · `16px` | 支持堆叠展开、动作按钮与本地化关闭按钮 `t("toast.close")`。 |

---

## 二、反馈指示器与参数化几何图形

1. **裂隙平面进度条与计量条 (`LinearProgressIndicator`, `CircularProgressIndicator`, `Meter`)**
   - 严格还原 M3E 1.5 标志性的 **`4px` 物理轨道裂隙 (`trackGap`)** 与线性进度条末端 **`4px` 止动圆点 (`stopIndicator`)**。
   - `Meter` 表达静态容量占用（如磁盘、GPU 显存），在超过 `70%`（警告）与 `90%`（临界错误）阈值时通过临界阻尼色彩平滑切换语义色，绝不混用不确定态动画。

2. **波浪进度条 (`WavyProgressIndicator` / `LinearWavyProgressIndicator` / `CircularWavyProgressIndicator`)**
   - 圆形波浪采用极坐标严格整波瓣闭合约束（$N = 9$），首尾一阶导数连续无折角；端点处自动平滑衰减波幅以确保 `0%` 与 `100%` 严丝合缝。

3. **多边形加载器、骨架屏与形状视图 (`LoadingIndicator`, `Skeleton`, `MaterialShapeView`)**
   - `m3eui/tokens` 内置 Google AOSP `MaterialShapes` 全量 **35 个 `[0..1]` 归一化闭合三次贝塞尔多边形**。
   - `LoadingIndicator` / `ContainedLoadingIndicator` 在 7 个高表现力多边形序列间配合连续旋转与空间弹簧插值循环形变。
   - `Avatar` 与 `Skeleton` 均原生支持任意 `shape: M3EShapeName` 矢量裁剪，且在 `@media (prefers-reduced-motion: reduce)` 下自动降级静态呈现。
