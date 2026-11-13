# 自适应导航、站点大菜单、折叠披露与表面容器规范 (`navigation-and-surfaces`)

本文档规定 `m3eui` 导航体系、折叠披露组件、数据表格与表面容器的交互语义与几何不变量。

---

## 一、站点导航 vs 应用命令栏 vs 应用自适应导航

| 组件 | 适用场景 | 焦点与 ARIA 模型 |
| :--- | :--- | :--- |
| **`NavigationMenu`** (`@base-ui/react/navigation-menu`) | 营销站、文档站顶部导航与多栏大菜单 (Mega-menu) | 渲染语义化 `<nav aria-label={t("navigation.siteMenuLabel")}>`；链接保持自然 `Tab` 键顺序（不使用 `role="menubar"`）；当前页链接挂载 `aria-current="page"` 并叠加胶囊底色与底部 `3px` 指示条（非单一颜色区分，对比度 ≥ 3:1）。 |
| **`Menubar`** (`@base-ui/react/menubar`) | 桌面级生产力应用顶部命令栏（文件 / 编辑 / 视图） | 整条胶囊栏为单一 `Tab` 停靠点，方向键与悬停瞬切相邻菜单，支持无限级递归 `submenu` 与复选菜单项。 |
| **`NavigationSuite` / `NavigationBar` / `NavigationRail` / `WideNavigationRail` / `NavigationDrawer`** | 应用级主导航骨架 | `NavigationSuite` 通过 `ResizeObserver` 在 `<640px` 底栏、`640–1023px` 窄轨、`≥1024px` 可折叠宽轨（`84px ↔ 228px` 空间弹簧）间无闪烁切换。 |
| **`TopAppBar`** | 页面顶部应用栏 | 支持 `small`、`center-aligned`、`medium-flexible`、`large-flexible` 四种形态，随 `collapsedFraction ∈ [0, 1]` 连续插值高度与主副标题字号。 |

---

## 二、折叠披露与分段手风琴 (`Collapsible` & `Accordion`)

1. **`Collapsible` (`@base-ui/react/collapsible`)**
   - 默认开启 `hiddenUntilFound = true`（渲染原生 `hidden="until-found"`），使折叠隐藏的内容依然能被浏览器页内查找（`Ctrl/Cmd + F`）检索命中并自动展开。
   - **关键布局守则**：`[hidden="until-found"]` 面板元素本身严禁设置内边距、边框、背景或 `display: none`；所有内边距与顶部分隔线均施加在内部 `.m3e-collapsible__content` 包装层上，彻底避免折叠态残留边线。
   - **双向旋转箭头**：收起态在 LTR 下旋转 `-90deg`、在 RTL 下自动旋转 `+90deg`，展开态统一通过 `fastSpatial` 弹簧旋转至 `0deg`，绝不硬切替换图标。

2. **`Accordion` (`@base-ui/react/accordion`)**
   - 默认非排他模式（`multiple = true`），便于用户同时展开多项比对内容；展开项圆角独立脱出为 `[16, 16, 16, 16]`，相邻未展开项内缝圆角自动联动。
   - **一键全部展开/收起 (`showExpandAll`)**：开启后在顶部工具栏渲染按钮并严格同步 `aria-expanded`——仅当所有可用项全部展开时 `aria-expanded="true"`（文案显示 `t("collapsible.collapseAll")`）；部分展开或全部收起时均为 `aria-expanded="false"`（文案显示 `t("collapsible.expandAll")`），点击即刻展开全部。

---

## 三、数据展示与表面容器 (`DataTable`, `Carousel`, `Card`, `SegmentedList`, `Tabs`)

- **`DataTable`**：外层滚动区设置 `tabIndex={0}`、`role="region"` 与 `container-type: inline-size`；可排序 `<th scope="col">` 内部嵌套 `<button type="button">`，**仅在当前排序列挂载 `aria-sort="ascending" | "descending"`**（未排序列绝不挂载 `aria-sort="none"`），切换排序时通过隐藏 `role="status"` 区域礼貌播报本地化状态。
- **`Carousel`**：严格满足零和容器宽度守恒（$\sum w_i + (n-1)\cdot g = W_{\text{container}}$），焦点卡片 `28px` 圆角、次级卡片 `20px`、边缘窥视卡片 `16px`，RTL 下左右方向键自动镜像。
- **`Card` / `SegmentedList` / `Tabs`**：`Card` 交互态在静息 `16px`、悬停 `20px`、按压 `28px` 间弹簧过渡并支持 `forwardRef`；`SegmentedList` 处理 `2px` 接缝与选中项圆角脱出；`Tabs` 提供主级 `3px` 圆角短指示条与次级 `2px` 等宽指示条。
