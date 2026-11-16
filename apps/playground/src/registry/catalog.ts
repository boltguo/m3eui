import type { LocalizedCopy } from "../i18n";
import type { BlockCategoryKey } from "./types";

export interface ComponentCatalogEntry {
  readonly slug: string;
  readonly title: string;
  readonly isNew?: boolean;
  readonly keywords?: readonly string[];
}

export const COMPONENT_CATALOG: readonly ComponentCatalogEntry[] = [
  { slug: "accordion", title: "Accordion" },
  { slug: "alert", title: "Alert", isNew: true },
  { slug: "alert-dialog", title: "AlertDialog" },
  { slug: "avatar", title: "Avatar" },
  { slug: "badge", title: "Badge" },
  { slug: "breadcrumb", title: "Breadcrumb", isNew: true },
  { slug: "button", title: "Button" },
  { slug: "button-group", title: "ButtonGroup" },
  { slug: "card", title: "Card" },
  { slug: "carousel", title: "Carousel" },
  { slug: "checkbox", title: "Checkbox" },
  { slug: "chip", title: "Chip" },
  { slug: "color-picker", title: "ColorPicker", isNew: true },
  { slug: "combobox", title: "Combobox" },
  { slug: "command-palette", title: "CommandPalette", isNew: true },
  { slug: "context-menu", title: "ContextMenu" },
  { slug: "data-table", title: "DataTable" },
  { slug: "date-picker", title: "DatePicker" },
  { slug: "dialog", title: "Dialog" },
  { slug: "divider", title: "Divider" },
  { slug: "docked-toolbar", title: "DockedToolbar" },
  { slug: "drag-handle", title: "DragHandle", isNew: true },
  { slug: "empty", title: "Empty", isNew: true },
  { slug: "fab", title: "FAB" },
  { slug: "fab-menu", title: "FABMenu" },
  { slug: "file-upload", title: "FileUpload", isNew: true },
  { slug: "floating-toolbar", title: "FloatingToolbar" },
  { slug: "form", title: "Form" },
  { slug: "icon-button", title: "IconButton" },
  { slug: "kbd", title: "Kbd", isNew: true },
  { slug: "list", title: "List" },
  { slug: "loading-indicator", title: "LoadingIndicator" },
  { slug: "material-shape", title: "MaterialShape" },
  { slug: "menu", title: "Menu", keywords: ["DropdownMenu"] },
  { slug: "menubar", title: "Menubar" },
  { slug: "meter", title: "Meter" },
  { slug: "navigation-bar", title: "NavigationBar" },
  { slug: "navigation-menu", title: "NavigationMenu" },
  { slug: "navigation-rail", title: "NavigationRail" },
  { slug: "navigation-suite", title: "NavigationSuite" },
  { slug: "number-field", title: "NumberField" },
  { slug: "otp-field", title: "OTPField" },
  { slug: "pagination", title: "Pagination", isNew: true },
  { slug: "popover", title: "Popover" },
  { slug: "progress-indicator", title: "ProgressIndicator" },
  { slug: "pull-to-refresh", title: "PullToRefreshBox", isNew: true },
  { slug: "radio-group", title: "RadioGroup" },
  { slug: "scroll-area", title: "ScrollArea" },
  { slug: "search-bar", title: "SearchBar" },
  { slug: "select", title: "Select" },
  { slug: "sheet", title: "Sheet" },
  { slug: "sidebar", title: "Sidebar", isNew: true },
  { slug: "skeleton", title: "Skeleton" },
  { slug: "slider", title: "Slider" },
  { slug: "snippet", title: "Snippet", isNew: true },
  { slug: "split-button", title: "SplitButton" },
  { slug: "switch", title: "Switch" },
  { slug: "tabs", title: "Tabs" },
  { slug: "text-field", title: "TextField" },
  { slug: "time-picker", title: "TimePicker" },
  { slug: "toast", title: "Toast" },
  { slug: "tooltip", title: "Tooltip" },
  { slug: "top-app-bar", title: "TopAppBar" },
];

export const BLOCK_CATALOG: readonly {
  readonly slug: string;
  readonly category: Exclude<BlockCategoryKey, "featured">;
  readonly title: LocalizedCopy;
}[] = [
  { slug: "dashboard-01", category: "dashboard", title: { zh: "企业分析仪表盘与数据工作台", en: "Analytics Dashboard with Sidebar, Area Chart & Data Table" } },
  { slug: "login-01", category: "auth", title: { zh: "双栏品牌视觉登录与 2FA 验证", en: "Split Brand Login with Passkey & 2FA OTP Step" } },
  { slug: "ai-workspace-01", category: "ai", title: { zh: "AI 智能体对话与推理流工作台", en: "M3E AI Agent & Reasoning Studio" } },
];

export const DOC_CATALOG: readonly { readonly slug: string; readonly title: LocalizedCopy }[] = [
  { slug: "introduction", title: { zh: "介绍与架构", en: "Introduction & Architecture" } },
  { slug: "component-matrix", title: { zh: "组件图谱与溯源", en: "Component Matrix & Provenance" } },
  { slug: "installation", title: { zh: "快速安装", en: "Installation & Setup" } },
  { slug: "theming", title: { zh: "动态主题与色彩", en: "Dynamic Color & Theming" } },
  { slug: "motion-shapes", title: { zh: "物理弹簧与多边形", en: "Spring Physics & Shapes" } },
  { slug: "styling", title: { zh: "样式定制与 @layer", en: "Styling & Cascade Layers" } },
  { slug: "forms-validation", title: { zh: "表单与校验规范", en: "Forms & Validation" } },
  { slug: "i18n-rtl", title: { zh: "国际化与 RTL", en: "Internationalization & RTL" } },
  { slug: "exports-boundaries", title: { zh: "按需导出与边界", en: "Subpath Exports & Boundaries" } },
  { slug: "cli", title: { zh: "CLI 工具链", en: "CLI Toolchain" } },
];
