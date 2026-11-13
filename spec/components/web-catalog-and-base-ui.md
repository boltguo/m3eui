# M3E Web 组件全景契约（`m3eui` × `@base-ui/react` 1.9）

本指南记录 `m3eui` 全量 **55+ 个 Web React 组件与 Hooks** 的无障碍原语映射、几何拓扑常量、RTL 双向镜像与交互物理规范。

---

## 一、分层职责边界

| 层级 | 包名 / 模块 | 职责边界 |
| :--- | :--- | :--- |
| **纯数学与设计契约层** | `m3eui/tokens` + `tokens.json` | HCT 动态色彩与五级 `SurfaceContainer`、对比度等级 `[-1, 1]`、双轨物理弹簧（Spatial 欠阻尼 vs Effects 临界阻尼 `ζ = 1.0`）、零和宽度守恒（`ButtonGroup` & `Carousel`）、多段圆角矩阵、`flipCornersHorizontal` RTL 圆角翻转、极坐标表盘指针几何、35 种归一化闭合三次贝塞尔多边形与极坐标波浪路径。 |
| **无障碍与交互原语层** | `@base-ui/react` (`1.9.0`) + `m3eui/primitives` | 全量 34 个无头原语覆盖：`CSPProvider` 安全策略、`DirectionProvider` 双向导航、`NavigationMenu` 站点大菜单、`Collapsible` 页内可搜索折叠面板、`Form` / `Fieldset` 校验编排、`Menubar` & `SubmenuRoot` 多级菜单、Portal 视口防碰撞定位、手势抽屉关闭与 OTP 自动跳转。 |
| **国际化、配置与表现层** | `m3eui` + `m3eui` (`m3e.json`) | 零硬编码 UI 文案（71 键强类型 `M3EMessages`，内置 `zh-CN`/`en-US`/`ja-JP`/`ar-SA` + 自动 RTL + `Intl` 本地化）、声明式 `m3e.json` + `m3e init/sync/locale/doctor` CLI、全模块 `"use client";` SSR 就绪、零闪烁静态 CSS 生成与实时几何标尺（`debugGeometry`）。 |

---

## 二、全量组件与原语对照矩阵

### 1. 动作与悬浮工具栏（Actions & Toolbars）
- `Button` / `ToggleButton`（`@base-ui/react/button`, `@base-ui/react/toggle`）：`xs–xl` 五档高度（`32–136px`），按压圆角收缩，`ToggleButton` 胶囊与方圆角互换。
- `IconButton` / `IconToggleButton`：`5 尺寸 × 3 宽高比`（`narrow / default / wide`）共 15 档规格，严格遵循 `pressed > selected > rest` 圆角优先级。
- `SplitButton`（`@base-ui/react/button` + `@base-ui/react/menu`）：`2px` 中缝非对称半胶囊 + `-0.11 × Δr` 视觉中心偏移补偿 + `0° → 180°` 空间弹簧箭头旋转（RTL 自动翻转左右圆角与光学偏移符号）。
- `ButtonGroup`（`standard` / `connected`）：`Standard` 支持 `15%` 零和邻项挤压；`Connected` 采用外胶囊、内小圆角（`8px → 4px`）与选中态完整胶囊分离（RTL 自动镜像首尾胶囊圆角）。
- `FloatingToolbar` & `FABMenu`（`@base-ui/react/toolbar`）：`32px - 8px = 24px` 同心圆胶囊工具栏；`ToggleFAB` 展开时平滑形变为 `56px` 关闭圆钮并逐项交错弹出。
- `FAB` & `ExtendedFAB`：对齐 M3E 1.5 四档尺寸（`40 / 56 / 80 / 96px`）与四色容器变体；`ExtendedFAB` 收起/展开时按空间弹簧插值容器宽度。

### 2. 表单、校验与时间日期（Forms, Validation & Pickers）
- `Form` & `Fieldset`（`@base-ui/react/form`, `@base-ui/react/fieldset`）：协调客户端与服务端异步 `errors` 映射，提交失败自动聚焦首个非法控件并可选渲染 `role="alert"` 汇总横幅；`Fieldset` 通过 `render={<legend />}` 严格保证原生 `<legend>` 作为 `<fieldset>` 首个子元素。
- `SearchBar`（`@base-ui/react/autocomplete`）：`56px` 全胶囊搜索栏 + `28px` 同心圆建议浮层，内置中文 IME 组词安全保护。
- `OTPField`（`@base-ui/react/otp-field`）：分段连接验证码槽位，聚焦槽自动独立脱出为 `[16, 16, 16, 16]`，顶部提示防软键盘遮挡，渐进支持 WebOTP `OTPCredential`。
- `DockedDatePicker`, `DatePickerField` & `DateRangePicker`（`@base-ui/react/popover`）：`28px` 高表面日历面板，采用无时区漂移的 `YYYY-MM-DD` 纯日期字符串；`DateRangePicker` 支持任意先后点击自动排序、悬停区间预览与连续 `secondary-container` 区间高亮色带。
- `TimePicker` & `TimePickerField`：`28px` 表面时间选择器，支持 12h（垂直连接式 `AM/PM` 切换器）与 24h（外环 `00..11` `92px` + 内环 `12..23` `58px` 双环表盘），配备最短弧度解缠绕空间弹簧指针、表盘拖拽选时以及键盘数字输入双模式切换。
- `TextField` & `TextareaField`（`@base-ui/react/field`, `@base-ui/react/input`）：`Outlined`（`12px` 四角）与 `Filled`（`12px 12px 0 0` 平底指示线），`validationMode="onBlur"` 失焦后置校验。
- `NumberField`（`@base-ui/react/number-field`）：M3E 分段步进器（外端 `22px` 半胶囊、内缝 `4px → 10px` 按压软化，RTL 自动镜像），支持拖拽 Scrub 调值。
- `Select` & `Combobox`（`@base-ui/react/select`, `@base-ui/react/combobox`）：统一单层 `SurfaceContainer` 浮层（`16px - 6px = 10px` 同心圆），选中项采用 `12px` 二级容器色胶囊，与悬停态同色系零撞色。
- `Switch`（`@base-ui/react/switch`）：`52×32px` 轨道，滑块直径 `16px → 24px → 28px` 空间弹簧插值，基于 `inset-inline-start` + 有符号位移实现像素级对称 RTL 镜像。
- `Slider`（`@base-ui/react/slider`）：`16 / 24 / 40px` 宽轨道 + 两侧 `6px` 留白切口 + 竖条手柄（挂载全局 `window` `pointerup` 监听确保松开鼠标即刻由 `2px` 恢复至 `4px`，无需失焦）。
- `Checkbox` / `CheckboxGroup` & `Radio` / `RadioGroup`：支持父级半选（`indeterminate`）联动与单选圆点 `0 → 1` 空间弹簧缩放。

### 3. 数据展示、自适应导航与浮层反馈（Display, Adaptive Navigation & Overlays）
- `DataTable` & `Skeleton`：`DataTable` 采用 `tabIndex={0}` + `role="region"` + `container-type: inline-size` 响应式滚动容器，可排序 `<th scope="col">` 内嵌 `<button type="button">` 并仅在当前激活列挂载 `aria-sort="ascending" | "descending"`，内置 `Intl.Collator` 自然文本/版本号排序、`role="status"` 礼貌播报与全选/半选行勾选；`Skeleton` 支持文本/圆角/圆形及全部 35 种 `MaterialShapes` 多边形骨架并遵循 `prefers-reduced-motion`。
- `Carousel`（`multi-browse` / `hero`）：零和容器宽度守恒轮播，主焦点卡片 `28px` 圆角，次级与窥视卡片 `20px / 16px` 平滑压缩。
- `TopAppBar`（`small / center-aligned / medium-flexible / large-flexible`）：双行主副标题随 `collapsedFraction` 平滑折叠高度与字号。
- `NavigationBar`, `NavigationRail`, `WideNavigationRail`, `NavigationDrawer` & `NavigationSuite`：`WideNavigationRail` 支持 `84px ↔ 228px` 空间弹簧折叠；`NavigationDrawer` 支持常驻内嵌与 `@base-ui/react/drawer` 手势模态抽屉（RTL 自动从右侧滑出）；`NavigationSuite` 基于 `ResizeObserver` 容器宽度在底栏、窄轨、宽轨三态间自动切换。
- `Menubar`, `DropdownMenu` & `ContextMenu`（`@base-ui/react/menubar`, `@base-ui/react/menu`, `@base-ui/react/context-menu`）：`Menubar` 渲染为单一连续胶囊栏（单一 `Tab` 停靠点、展开后悬停瞬切相邻菜单）；菜单全面支持分隔线跨段圆角、复选菜单项（`CheckboxItem`）与无限级递归子菜单（`SubmenuRoot` + `SubmenuTrigger`，严格遵守子菜单触发器不混绑执行动作准则）。
- `NavigationMenu`（`@base-ui/react/navigation-menu`）：站点顶部导航与多栏卡片大菜单，链接保持自然 `Tab` 顺序并通过 `aria-current="page"` 高亮当前页。
- `Collapsible`（`@base-ui/react/collapsible`）& `Accordion`（`@base-ui/react/accordion`）：默认启用 `hidden="until-found"` 页内搜索自动展开，内层包装隔离边距边框；`Accordion` 支持 `showExpandAll` 键值国际化全部展开/收起同步按钮。
- `AssistChip` / `FilterChip` / `InputChip`、`Avatar`（35 多边形裁剪）& `Badge`、`Card`、`Tabs`、`SegmentedList`。
- `BottomSheet` & `SideSheet`、`Popover`、`Dialog` & `AlertDialog`、`Tooltip` & `RichTooltip`、`useM3EToast`、`PreviewCard`、`ScrollArea` & `Divider`。
- `LinearProgressIndicator`、`CircularProgressIndicator` & `Meter`（`4px` 轨道裂隙 + `4px` 止动圆点）、`LoadingIndicator`（7 多边形连续形变）、`WavyProgressIndicator`（极坐标 `N=9` 整波瓣闭合波浪）与 `MaterialShapeView`（全量 35 种官方形状）。
