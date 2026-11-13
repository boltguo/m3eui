export interface PropDocRow {
  readonly name: string;
  readonly type: string;
  readonly defaultValue?: string;
  readonly description: string;
}

export const PROPS_CATALOG: Readonly<Record<string, readonly PropDocRow[]>> = {
  "theme-setup": [
    { name: "config", type: "M3EConfig", description: "m3e.json 项目配置对象" },
    { name: "locale / messages", type: "M3ELocale / Partial<M3EMessages>", defaultValue: '"en-US"', description: "当前语言标识与自定义词条覆盖" },
    { name: "initialDirection", type: '"auto" | "ltr" | "rtl"', defaultValue: '"auto"', description: "文本方向模式" },
    { name: "initialSeedHex", type: "string", defaultValue: '"#6750A4"', description: "HCT 种子色" },
    { name: "initialContrastLevel", type: "number [-1, 1]", defaultValue: "0", description: "对比度等级" },
    { name: "cspNonce", type: "string", description: "CSP 样式 Nonce" },
  ],
  button: [
    { name: "variant", type: '"filled" | "tonal" | "elevated" | "outlined" | "text"', defaultValue: '"filled"', description: "视觉变体" },
    { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"sm"', description: "按钮尺寸" },
    { name: "shape", type: '"round" | "square"', defaultValue: '"round"', description: "基础圆角形态" },
    { name: "pressed", type: "boolean", defaultValue: "false", description: "ToggleButton 选中态" },
  ],
  "icon-split": [
    { name: "widthVariant", type: '"narrow" | "default" | "wide"', defaultValue: '"default"', description: "IconButton 宽度比例" },
    { name: "menuItems", type: "readonly SplitButtonMenuItemSpec[]", description: "SplitButton 下拉菜单项" },
    { name: "size", type: '"xs" | "sm" | "md" | "lg" | "xl"', defaultValue: '"sm"', description: "按钮尺寸" },
  ],
  "button-group": [
    { name: "variant", type: '"standard" | "connected"', defaultValue: '"connected"', description: "独立间距组或连接分段组" },
    { name: "selectionMode", type: '"none" | "single" | "multiple"', defaultValue: '"single"', description: "选择模式" },
    { name: "expandedRatio", type: "number", defaultValue: "0.15 / 0", description: "按压宽度扩张比例" },
  ],
  "toolbar-fab": [
    { name: "theme", type: '"standard" | "vibrant"', defaultValue: '"standard"', description: "工具栏配色主题" },
    { name: "orientation", type: '"horizontal" | "vertical"', defaultValue: '"horizontal"', description: "排列方向" },
    { name: "items", type: "readonly FABMenuItemSpec[]", description: "FABMenu 展开菜单项" },
  ],
  "fab-extended": [
    { name: "size", type: '"sm" | "md" | "lg" | "xl"', defaultValue: '"md"', description: "FAB 尺寸" },
    { name: "variant", type: '"primary" | "secondary" | "tertiary" | "surface"', defaultValue: '"primary"', description: "容器配色" },
    { name: "expanded", type: "boolean", defaultValue: "true", description: "ExtendedFAB 是否展开文本" },
  ],
  "search-bar": [
    { name: "suggestions", type: "readonly SearchSuggestion[]", defaultValue: "[]", description: "候选建议列表" },
    { name: "onSearchSubmit", type: "(query: string) => void", description: "回车提交回调" },
  ],
  "otp-field": [
    { name: "length", type: "number", defaultValue: "6", description: "验证码位数" },
    { name: "separatorAfterIndex", type: "number", defaultValue: "2", description: "分组分隔符位置" },
    { name: "enableWebOTP", type: "boolean", defaultValue: "false", description: "启用短信 WebOTP 自动填充" },
  ],
  "date-picker": [
    { name: "value", type: "PlainDateString", description: "日期字符串 (YYYY-MM-DD)" },
    { name: "onValueChange", type: "(iso: string) => void", description: "日期变更回调" },
  ],
  "time-date-range": [
    { name: "value (TimePicker)", type: "PlainTimeString", defaultValue: '"09:30"', description: "时间字符串 (HH:MM)" },
    { name: "use24Hour", type: "boolean", defaultValue: "false", description: "24 小时制表盘" },
    { name: "defaultInputMode", type: '"dial" | "keyboard"', defaultValue: '"dial"', description: "表盘或键盘输入模式" },
    { name: "value (DateRangePicker)", type: "{ start: string; end: string }", description: "起止日期区间" },
  ],
  "form-fieldset": [
    { name: "errors", type: "Record<string, string | string[]>", description: "字段校验错误信息映射" },
    { name: "validationMode", type: '"onSubmit" | "onBlur" | "onChange"', defaultValue: '"onSubmit"', description: "校验触发时机" },
    { name: "showErrorSummary", type: "boolean", defaultValue: "false", description: "顶部显示错误汇总" },
    { name: "legend (Fieldset)", type: "ReactNode", description: "分组标题" },
  ],
  textfield: [
    { name: "variant", type: '"outlined" | "filled"', defaultValue: '"outlined"', description: "输入框外观变体" },
    { name: "errorMessage", type: "ReactNode", description: "校验错误提示文案" },
  ],
  "number-combobox": [
    { name: "min / max / step", type: "number", description: "数值范围与步长" },
    { name: "options", type: "readonly ComboboxOption[]", description: "可检索候选项" },
  ],
  switch: [
    { name: "checked", type: "boolean", description: "受控开关状态" },
    { name: "showIcons", type: "boolean", defaultValue: "false", description: "显示状态图标" },
  ],
  slider: [
    { name: "size", type: '"sm" | "md" | "lg"', defaultValue: '"sm"', description: "轨道尺寸" },
    { name: "value", type: "number | readonly number[]", description: "单值或区间值" },
  ],
  "checkbox-radio": [
    { name: "indeterminate", type: "boolean", defaultValue: "false", description: "半选状态" },
    { name: "orientation", type: '"vertical" | "horizontal"', defaultValue: '"vertical"', description: "排列方向" },
  ],
  select: [
    { name: "variant", type: '"outlined" | "filled"', defaultValue: '"outlined"', description: "触发器样式变体" },
    { name: "options", type: "readonly SelectOption[]", description: "下拉选项列表" },
  ],
  carousel: [
    { name: "variant", type: '"multi-browse" | "hero"', defaultValue: '"multi-browse"', description: "轮播布局模式" },
    { name: "items", type: "readonly CarouselItemSpec[]", description: "轮播项数据" },
  ],
  "data-table-skeleton": [
    { name: "caption", type: "ReactNode", description: "表格无障碍标题" },
    { name: "columns", type: "readonly M3EDataTableColumn<Row>[]", description: "列配置与排序访问器" },
    { name: "selectable", type: "boolean", defaultValue: "false", description: "启用行多选" },
    { name: "shape (Skeleton)", type: "M3EShapeName", description: "多边形骨架形状" },
  ],
  chips: [
    { name: "selected", type: "boolean", defaultValue: "false", description: "FilterChip 选中态" },
    { name: "onRemove", type: "() => void", description: "InputChip 移除回调" },
  ],
  "avatar-badge": [
    { name: "shape", type: '"circle" | M3EShapeName', defaultValue: '"circle"', description: "头像裁剪形状" },
    { name: "count / dot", type: "number | boolean", description: "徽标计数或圆点模式" },
  ],
  cards: [
    { name: "variant", type: '"elevated" | "filled" | "outlined"', defaultValue: '"filled"', description: "卡片变体" },
    { name: "interactive", type: "boolean", defaultValue: "false", description: "启用点击与焦点交互" },
  ],
  accordion: [
    { name: "multiple", type: "boolean", defaultValue: "true", description: "允许同时展开多项" },
    { name: "showExpandAll", type: "boolean", defaultValue: "false", description: "显示全部展开/收起按钮" },
  ],
  "preview-scroll-divider": [
    { name: "trigger", type: "ReactElement", description: "悬停预览触发元素" },
    { name: "maxHeight", type: "number | string", defaultValue: "240", description: "滚动区域最大高度" },
  ],
  "site-nav-collapsible": [
    { name: "items (NavigationMenu)", type: "readonly M3ENavigationMenuItem[]", description: "导航菜单项与下拉面板配置" },
    { name: "active", type: "boolean", defaultValue: "false", description: "当前激活页标识" },
    { name: "untilFound (Collapsible)", type: "boolean", defaultValue: "true", description: "支持浏览器页内查找自动展开" },
  ],
  "navigation-suite": [
    { name: "layout", type: '"auto" | "bar" | "rail" | "wide-rail"', defaultValue: '"auto"', description: "导航布局模式" },
    { name: "expanded (WideNavigationRail)", type: "boolean", description: "宽轨展开状态" },
    { name: "variant (NavigationDrawer)", type: '"permanent" | "modal"', defaultValue: '"modal"', description: "常驻或模态抽屉" },
  ],
  "menubar-submenu": [
    { name: "menus", type: "readonly M3EMenubarMenuSpec[]", description: "菜单栏分组配置" },
    { name: "submenu", type: "readonly DropdownMenuItemSpec[]", description: "嵌套子菜单项" },
  ],
  "top-app-bar": [
    { name: "variant", type: '"small" | "center-aligned" | "medium-flexible" | "large-flexible"', defaultValue: '"small"', description: "顶栏布局变体" },
    { name: "collapsedFraction", type: "number [0, 1]", defaultValue: "0", description: "滚动折叠进度" },
  ],
  navigation: [
    { name: "items", type: "readonly NavigationDestination[]", description: "导航项配置" },
    { name: "value", type: "string", description: "当前激活项" },
  ],
  tabs: [
    { name: "variant", type: '"primary" | "secondary"', defaultValue: '"primary"', description: "主标签或二级标签样式" },
  ],
  "segmented-list": [
    { name: "selected", type: "boolean", defaultValue: "false", description: "列表项选中态" },
  ],
  "popover-menu": [
    { name: "items", type: "readonly DropdownMenuItemSpec[]", description: "菜单动作列表" },
    { name: "danger", type: "boolean", defaultValue: "false", description: "危险操作高亮样式" },
  ],
  dialog: [
    { name: "open / onOpenChange", type: "boolean", description: "弹窗开关状态" },
  ],
  "tooltip-toast": [
    { name: "toast()", type: "(opts: EnqueueToastOptions) => string", description: "触发全局通知条" },
  ],
  "progress-meter": [
    { name: "value", type: "number | null", description: "当前进度百分比；传 null 为不确定态" },
    { name: "thickness", type: '"standard" | "thick"', defaultValue: '"standard"', description: "轨道粗细" },
  ],
  "loading-wavy": [
    { name: "variant", type: '"linear" | "circular"', defaultValue: '"linear"', description: "线性或环形波浪进度" },
  ],
  shapes: [
    { name: "shape / toShape", type: "M3EShapeName", description: "起止多边形名称" },
    { name: "morphProgress", type: "number [0, 1]", defaultValue: "0", description: "形变插值进度" },
  ],
};
