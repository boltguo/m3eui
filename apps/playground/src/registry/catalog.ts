import type { LocalizedCopy } from "../i18n";
import { COMPONENT_CATEGORY_ORDER, type BlockCategoryKey, type ComponentCategoryKey } from "./types";

export interface ComponentCatalogEntry {
  readonly slug: string;
  readonly title: string;
  readonly category: ComponentCategoryKey;
  readonly isNew?: boolean;
  readonly keywords?: readonly string[];
}

export const COMPONENT_CATALOG: readonly ComponentCatalogEntry[] = [
  { slug: "button", title: "Button", category: "actions" },
  { slug: "icon-button", title: "IconButton", category: "actions" },
  { slug: "button-group", title: "ButtonGroup", category: "actions" },
  { slug: "split-button", title: "SplitButton", category: "actions" },
  { slug: "fab", title: "FAB", category: "actions" },
  { slug: "floating-toolbar", title: "FloatingToolbar", category: "actions" },
  { slug: "text-field", title: "TextField", category: "inputs" },
  { slug: "number-field", title: "NumberField", category: "inputs" },
  { slug: "select", title: "Select", category: "inputs" },
  { slug: "combobox", title: "Combobox", category: "inputs" },
  { slug: "otp-field", title: "OTPField", category: "inputs" },
  { slug: "date-picker", title: "DatePicker", category: "inputs" },
  { slug: "time-picker", title: "TimePicker", category: "inputs" },
  { slug: "form", title: "Form", category: "inputs" },
  { slug: "file-upload", title: "FileUpload", category: "inputs", isNew: true },
  { slug: "color-picker", title: "ColorPicker", category: "inputs", isNew: true },
  { slug: "checkbox", title: "Checkbox", category: "selection" },
  { slug: "radio-group", title: "RadioGroup", category: "selection" },
  { slug: "switch", title: "Switch", category: "selection" },
  { slug: "slider", title: "Slider", category: "selection" },
  { slug: "card", title: "Card", category: "display" },
  { slug: "data-table", title: "DataTable", category: "display" },
  { slug: "segmented-list", title: "List", category: "display" },
  { slug: "chip", title: "Chip", category: "display" },
  { slug: "avatar", title: "Avatar", category: "display" },
  { slug: "badge", title: "Badge", category: "display" },
  { slug: "carousel", title: "Carousel", category: "display" },
  { slug: "empty", title: "Empty", category: "display", isNew: true },
  { slug: "skeleton", title: "Skeleton", category: "display" },
  { slug: "material-shape", title: "MaterialShape", category: "display" },
  { slug: "kbd", title: "Kbd", category: "display", isNew: true },
  { slug: "snippet", title: "Snippet", category: "display", isNew: true },
  { slug: "divider", title: "Divider", category: "display" },
  { slug: "scroll-area", title: "ScrollArea", category: "display" },
  { slug: "drag-handle", title: "DragHandle", category: "display", isNew: true },
  { slug: "alert", title: "Alert", category: "feedback", isNew: true },
  { slug: "dialog", title: "Dialog", category: "feedback" },
  { slug: "sheet", title: "Sheet", category: "feedback" },
  { slug: "toast", title: "Toast", category: "feedback" },
  { slug: "loading-indicator", title: "LoadingIndicator", category: "feedback" },
  { slug: "progress-indicator", title: "ProgressIndicator", category: "feedback" },
  { slug: "meter", title: "Meter", category: "feedback" },
  { slug: "tooltip", title: "Tooltip", category: "feedback" },
  { slug: "preview-card", title: "PreviewCard", category: "feedback" },
  { slug: "pull-to-refresh", title: "PullToRefreshBox", category: "feedback", isNew: true },
  { slug: "navigation", title: "Navigation", category: "navigation" },
  { slug: "breadcrumb", title: "Breadcrumb", category: "navigation", isNew: true },
  { slug: "pagination", title: "Pagination", category: "navigation", isNew: true },
  { slug: "tabs", title: "Tabs", category: "navigation" },
  { slug: "accordion", title: "Accordion", category: "navigation" },
  { slug: "collapsible", title: "Collapsible", category: "navigation" },
  {
    slug: "menu",
    title: "Menu",
    category: "navigation",
    keywords: ["DropdownMenu", "ContextMenu", "Menubar"],
  },
  { slug: "popover", title: "Popover", category: "navigation" },
  { slug: "navigation-menu", title: "NavigationMenu", category: "navigation" },
  { slug: "command-palette", title: "CommandPalette", category: "navigation", isNew: true },
  { slug: "top-app-bar", title: "TopAppBar", category: "navigation" },
  { slug: "search-bar", title: "SearchBar", category: "navigation" },
  { slug: "bottom-app-bar", title: "BottomAppBar", category: "navigation", isNew: true },
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
export { COMPONENT_CATEGORY_ORDER };

export const COMPONENT_CATALOG_BY_CATEGORY: Readonly<
  Record<ComponentCategoryKey, readonly ComponentCatalogEntry[]>
> = {
  actions: COMPONENT_CATALOG.filter((c) => c.category === "actions"),
  inputs: COMPONENT_CATALOG.filter((c) => c.category === "inputs"),
  selection: COMPONENT_CATALOG.filter((c) => c.category === "selection"),
  display: COMPONENT_CATALOG.filter((c) => c.category === "display"),
  feedback: COMPONENT_CATALOG.filter((c) => c.category === "feedback"),
  navigation: COMPONENT_CATALOG.filter((c) => c.category === "navigation"),
};
