export interface PropDocRow {
  readonly name: string;
  readonly type: string;
  readonly defaultValue?: string;
  readonly description: string;
}

export const PROPS_CATALOG: Readonly<Record<string, readonly PropDocRow[]>> = {
  "theme-setup": [
    { name: "config", type: "M3EConfig (m3e.json)", description: "声明式工程配置对象（统一指定 seed、schemeVariant、contrastLevel、locale、direction、csp）" },
    { name: "locale / messages", type: "M3ELocale / Partial<M3EMessages>", defaultValue: '"en-US"', description: "激活语言包（内置 zh-CN / en-US / ja-JP / ar-SA）及项目级自定义键值覆写" },
    { name: "directionMode", type: '"auto" | "ltr" | "rtl"', defaultValue: '"auto"', description: "设为 auto 时遇到 ar/he/fa/ur 语言自动切换全局 RTL 镜像布局" },
    { name: "initialSeedHex", type: "string", defaultValue: '"#6750A4"', description: "HCT 动态调色板十六进制种子色（未传 config 时的直接属性）" },
    { name: "initialContrastLevel", type: "number [-1, 1]", defaultValue: "0", description: "HCT 对比度等级（0 标准 / 0.5 中对比 / 1.0 高对比）" },
    { name: "cspNonce", type: "string", description: "透传至底层 Base UI CSPProvider 的内容安全策略 Nonce" },
  ],
  button: [
    { name: "variant", type: '"filled" | "tonal" | "elevated" | "outlined" | "text"', defaultValue: '"filled"', description: "M3E 五种语义色彩层级" },
    { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"sm"', description: "五档高度阶梯（32 / 40 / 56 / 96 / 136px）" },
    { name: "shape", type: '"round" | "square"', defaultValue: '"round"', description: "静息基础形状，按压时自动向小圆角收紧" },
    { name: "pressed", type: "boolean", defaultValue: "false", description: "ToggleButton 受控选中态（选中翻转圆/方形态）" },
  ],
  "icon-split": [
    { name: "widthVariant", type: '"narrow" | "default" | "wide"', defaultValue: '"default"', description: "IconButton 5×3 宽高比矩阵档位" },
    { name: "menuItems", type: "readonly SplitButtonMenuItemSpec[]", description: "SplitButton 右侧下拉触发器关联的分段菜单项" },
    { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"sm"', description: "统一尺寸阶梯，自动计算光学居中偏移 (-0.11×Δr)" },
  ],
  "button-group": [
    { name: "variant", type: '"standard" | "connected"', defaultValue: '"connected"', description: "12px 间距零和挤压组 或 2px 接缝分段选择器" },
    { name: "selectionMode", type: '"none" | "single" | "multiple"', defaultValue: '"single"', description: "无选择工具栏、单选互斥或多选切换" },
    { name: "expandedRatio", type: "number", defaultValue: "0.15 / 0", description: "按压宽度扩张比例（邻项自动等量收缩，总宽度恒定）" },
  ],
  "toolbar-fab": [
    { name: "theme", type: '"standard" | "vibrant"', defaultValue: '"standard"', description: "FloatingToolbar 表面容器或高饱和主色容器" },
    { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "64px 同心胶囊工具栏排列轴向" },
    { name: "items", type: "readonly FABMenuItemSpec[]", description: "FABMenu 错峰弹出的胶囊动作列表" },
  ],
  "fab-extended": [
    { name: "size", type: '"sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "FAB 四档容器规格（40 / 56 / 80 / 96px）" },
    { name: "variant", type: '"primary" | "secondary" | "tertiary" | "surface"', defaultValue: '"primary"', description: "M3E 容器色角色" },
    { name: "expanded", type: "boolean", defaultValue: "true", description: "ExtendedFAB 展开标签或折叠为正方圆角图标按钮" },
  ],
  "search-bar": [
    { name: "suggestions", type: "readonly SearchSuggestion[]", defaultValue: "[]", description: "28px 同心圆联想面板候选项" },
    { name: "onSearch", type: "(query: string) => void", description: "回车提交回调（内置中文 IME 组合输入保护）" },
  ],
  "otp-field": [
    { name: "length", type: "number", defaultValue: "6", description: "验证码槽位数量" },
    { name: "separatorAfterIndex", type: "number", defaultValue: "2", description: "分组连字符插入位置（聚焦槽位自动脱出 16px 圆角）" },
    { name: "enableWebOTP", type: "boolean", defaultValue: "false", description: "渐进式启用浏览器短信 WebOTP 自动填充" },
  ],
  "date-picker": [
    { name: "value", type: "PlainDateString", description: "零时区偏移纯日期字符串 (YYYY-MM-DD)" },
    { name: "onValueChange", type: "(iso: string) => void", description: "选中日期变化回调" },
  ],
  "time-date-range": [
    { name: "value (TimePicker)", type: "PlainTimeString", defaultValue: '"09:30"', description: "24 小时制墙上时间字符串 (HH:MM)" },
    { name: "use24Hour", type: "boolean", defaultValue: "false", description: "启用内外双环 24 小时表盘（00..11 外环 + 12..23 内环）" },
    { name: "defaultInputMode", type: '"dial" | "keyboard"', defaultValue: '"dial"', description: "模拟指针表盘与键盘数字输入双模式切换" },
    { name: "value (DateRangePicker)", type: "{ start: string; end: string }", description: "起止日期区间，自动渲染连续 secondary-container 高亮带" },
  ],
  "form-fieldset": [
    { name: "errors", type: "Record<string, string | string[]>", description: "服务端/异步校验错误映射，按字段 name 自动分发" },
    { name: "validationMode", type: '"onSubmit" | "onBlur" | "onChange"', defaultValue: '"onSubmit"', description: "校验触发时机，提交失败自动聚焦首个非法控件" },
    { name: "showErrorSummary", type: "boolean", defaultValue: "false", description: "在表单顶部渲染无障碍 role='alert' 错误汇总横幅" },
    { name: "legend (Fieldset)", type: "ReactNode", description: "作为 <fieldset> 首个子元素渲染的原生 <legend> 标题" },
  ],
  textfield: [
    { name: "variant", type: '"outlined" | "filled"', defaultValue: '"outlined"', description: "描边圆角框或顶圆角底直边填充框" },
    { name: "errorMessage", type: "ReactNode", description: "无障碍校验错误文案（配合 invalid 控制红框状态）" },
  ],
  "number-combobox": [
    { name: "min / max / step", type: "number", description: "NumberField 步进边界与幅度，支持拖拽标签微调数值" },
    { name: "options", type: "readonly ComboboxOption[]", description: "Combobox 可过滤候选列表" },
  ],
  switch: [
    { name: "checked", type: "boolean", description: "受控开关状态（手柄 16→24→28px 物理形变，RTL 自动镜像位移）" },
    { name: "showIcons", type: "boolean", defaultValue: "false", description: "在手柄内显示 ✓ / ✕ 状态图标" },
  ],
  slider: [
    { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"sm"', description: "宽轨高度规格（16 / 24 / 40px）与 6px 手柄留白切口" },
    { name: "value", type: "number | readonly number[]", description: "单值或双端区间数组，松开鼠标立即恢复 4px 手柄宽度" },
  ],
  "checkbox-radio": [
    { name: "indeterminate", type: "boolean", defaultValue: "false", description: "Checkbox 半选混合态" },
    { name: "orientation", type: '"vertical" | "horizontal"', defaultValue: '"vertical"', description: "RadioGroup 排列方向" },
  ],
  select: [
    { name: "variant", type: '"outlined" | "filled"', defaultValue: '"outlined"', description: "12px 描边触发器 或 12/12/0/0 填充触发器" },
    { name: "options", type: "readonly SelectOption[]", description: "16px 外圆角 - 6px 内边距 = 10px 同心圆菜单项列表" },
  ],
  carousel: [
    { name: "variant", type: '"multi-browse" | "hero"', defaultValue: '"multi-browse"', description: "多焦点渐进浏览或单主卡居中聚光布局" },
    { name: "items", type: "readonly CarouselItemSpec[]", description: "零和总宽度守恒轮播项集合" },
  ],
  "data-table-skeleton": [
    { name: "caption", type: "ReactNode", description: "DataTable 必填无障碍标题（关联滚动区 aria-labelledby）" },
    { name: "columns", type: "readonly M3EDataTableColumn<Row>[]", description: "列定义，sortable 列在 <th> 内渲染 <button> 并维护精确 aria-sort" },
    { name: "selectable", type: "boolean", defaultValue: "false", description: "开启全选/半选 Checkbox 行选择能力" },
    { name: "shape (Skeleton)", type: "M3EShapeName", description: "可选 35 种官方 MaterialShapes 多边形脉冲骨架裁剪" },
  ],
  chips: [
    { name: "selected", type: "boolean", defaultValue: "false", description: "FilterChip 选中后由 8px 圆角平滑膨胀为 16px 胶囊" },
    { name: "onRemove", type: "() => void", description: "InputChip 尾部移除按钮回调" },
  ],
  "avatar-badge": [
    { name: "shape", type: '"circle" | M3EShapeName', defaultValue: '"circle"', description: "Avatar 支持圆形或全部 35 种 MaterialShapes 多边形" },
    { name: "count / dot", type: "number | boolean", description: "Badge 计数胶囊（>max 显示 99+）或 8px 提醒圆点" },
  ],
  cards: [
    { name: "variant", type: '"elevated" | "filled" | "outlined"', defaultValue: '"filled"', description: "M3E 三种卡片表面语义" },
    { name: "interactive", type: "boolean", defaultValue: "false", description: "开启悬停扩张 (16→20px) 与按压收紧 (12px) 物理圆角" },
  ],
  accordion: [
    { name: "multiple", type: "boolean", defaultValue: "false", description: "允许同时展开多个分段手风琴面板（邻项自动圆角避让）" },
  ],
  "preview-scroll-divider": [
    { name: "trigger", type: "ReactElement", description: "PreviewCard 悬停/聚焦触发元素" },
    { name: "maxHeight", type: "number | string", defaultValue: "240", description: "ScrollArea 视口最大高度" },
  ],
  "top-app-bar": [
    { name: "variant", type: '"small" | "center-aligned" | "medium-flexible" | "large-flexible"', defaultValue: '"small"', description: "M3E 1.5 四种顶部栏形态，支持连续折叠比例 collapsedFraction" },
  ],
  navigation: [
    { name: "items", type: "readonly NavigationDestination[]", description: "底部栏与侧边轨共用的导航目的地数组（支持徽标）" },
  ],
  "navigation-suite": [
    { name: "layout (NavigationSuite)", type: '"auto" | "bar" | "rail" | "wide-rail"', defaultValue: '"auto"', description: "基于 ResizeObserver 容器宽度自动切换底部栏 / 窄轨 / 宽轨" },
    { name: "expanded (WideNavigationRail)", type: "boolean", defaultValue: "true", description: "宽轨 84px ↔ 228px 物理弹簧折叠状态" },
    { name: "variant (NavigationDrawer)", type: '"permanent" | "modal"', defaultValue: '"permanent"', description: "常驻内嵌抽屉或支持手势关闭的模态侧滑抽屉" },
  ],
  tabs: [
    { name: "variant", type: '"primary" | "secondary"', defaultValue: '"primary"', description: "3px 圆角指示条主标签页 或 2px 等宽次级标签页" },
  ],
  "segmented-list": [
    { name: "selected / onClick", type: "boolean / () => void", description: "SegmentedListItem 2px 接缝与按压/选中独立圆角脱出" },
  ],
  sheets: [
    { name: "side", type: '"bottom" | "right" | "left"', defaultValue: '"bottom"', description: "28px 抽屉弹出方位，支持物理跟手拖拽关闭" },
  ],
  "popover-menu": [
    { name: "items", type: "readonly M3EMenuItemSpec[]", description: "支持 separatorBefore 多段分组、checked 复选项与递归 submenu 子菜单" },
  ],
  "menubar-submenu": [
    { name: "menus", type: "readonly M3EMenubarMenuSpec[]", description: "应用级连续胶囊菜单栏定义（单一 Tab 停靠点 + 方向键/悬停瞬切）" },
    { name: "submenu", type: "readonly M3EMenuItemSpec[]", description: "递归多级子菜单定义（触发器仅负责展开子级，严禁混绑动作）" },
  ],
  dialog: [
    { name: "trigger / actions", type: "ReactElement / ReactNode", description: "Dialog 与 AlertDialog 触发器及底部动作栏" },
  ],
  "tooltip-toast": [
    { name: "subhead / action", type: "ReactNode", description: "RichTooltip 标题与交互按钮；useM3EToast() 触发全局通知" },
  ],
  "flat-progress-meter": [
    { name: "value / indeterminate", type: "number / boolean", description: "4px 物理轨道裂隙进度条与 70%/90% 阈值变色计量条" },
  ],
  progress: [
    { name: "value", type: "number", description: "WavyProgressIndicator 进度百分比（端点自动平滑收平波幅）" },
  ],
  "site-nav-collapsible": [
    { name: "items (NavigationMenu)", type: "readonly NavigationMenuItemSpec[]", description: "站点顶部导航项与多栏大菜单卡片列表；active=true 自动输出 aria-current='page'" },
    { name: "hiddenUntilFound (Collapsible)", type: "boolean", defaultValue: "true", description: "折叠隐藏时使用原生 hidden='until-found'，支持浏览器页内搜索唤醒" },
    { name: "showExpandAll (Accordion)", type: "boolean", defaultValue: "false", description: "为非排他手风琴渲染键值国际化的「全部展开 / 全部收起」同步按钮" },
  ],
  shapes: [
    { name: "shape / toShape", type: "M3EShapeName", description: "35 种官方归一化多边形名称与目标形变形状" },
  ],
};
