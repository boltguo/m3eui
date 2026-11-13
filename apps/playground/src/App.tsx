import * as React from "react";
import {
  M3E_ALL_SHAPE_NAMES,
  type M3EShapeName,
} from "m3eui/tokens";
import {
  Accordion,
  AlertDialog,
  AlertDialogClose,
  AssistChip,
  Avatar,
  Badge,
  BottomSheet,
  Button,
  ButtonGroup,
  Card,
  Carousel,
  type CarouselItemSpec,
  Checkbox,
  CheckboxGroup,
  CircularProgressIndicator,
  CircularWavyProgressIndicator,
  Combobox,
  type ComboboxOption,
  ContainedLoadingIndicator,
  ContextMenu,
  DatePickerField,
  Dialog,
  DialogClose,
  Divider,
  DockedDatePicker,
  DropdownMenu,
  ExtendedFAB,
  FAB,
  FABMenu,
  Fieldset,
  FilterChip,
  FloatingToolbar,
  IconButton,
  IconToggleButton,
  InputChip,
  LinearProgressIndicator,
  LinearWavyProgressIndicator,
  LoadingIndicator,
  type M3EBuiltInLocale,
  type M3EConfig,
  M3EProvider,
  MaterialShapeView,
  Meter,
  NavigationBar,
  type NavigationDestination,
  NavigationDrawer,
  NavigationRail,
  NumberField,
  OTPField,
  Popover,
  PopoverClose,
  PreviewCard,
  Radio,
  RadioGroup,
  RichTooltip,
  ScrollArea,
  SearchBar,
  type SearchSuggestion,
  SegmentedList,
  SegmentedListItem,
  Select,
  SheetClose,
  SideSheet,
  Skeleton,
  Slider,
  SplitButton,
  Switch,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  TextareaField,
  TextField,
  ToggleButton,
  Tooltip,
  TopAppBar,
  useM3E,
  useM3EI18n,
  useM3EToast,
} from "m3eui";
import m3eProjectConfig from "../../../m3e.json";
import { DocsCategoryHeader, ShowcaseCard } from "./components/ShowcaseCard";

const LOCALE_OPTIONS: readonly { code: M3EBuiltInLocale; label: string }[] = [
  { code: "zh-CN", label: "中文" },
  { code: "en-US", label: "EN" },
  { code: "ja-JP", label: "日本語" },
  { code: "ar-SA", label: "العربية" },
];

const CONTRAST_OPTIONS: readonly { value: number; label: string }[] = [
  { value: 0, label: "标准 0" },
  { value: 0.5, label: "中对比 +0.5" },
  { value: 1, label: "高对比 +1.0" },
];

const CompositeSuiteSection = React.lazy(
  () => import("./sections/CompositeSuiteSection"),
);

const SEED_PRESETS = [
  { hex: "#6750A4", name: "Expressive 紫" },
  { hex: "#0B6B58", name: "翡翠青" },
  { hex: "#1A73E8", name: "海湾蓝" },
  { hex: "#B3261E", name: "朱砂红" },
  { hex: "#7D5260", name: "玫瑰棕" },
] as const;

const COMPONENT_SEARCH_OPTIONS: readonly ComboboxOption[] = [
  { value: "button-group", label: "ButtonGroup 按钮组", description: "零和宽度挤压与 Connected 分段圆角" },
  { value: "slider", label: "Slider 宽轨滑块", description: "竖条手柄 + 6px 两侧留白切口" },
  { value: "accordion", label: "Accordion 分段手风琴", description: "展开独立脱出 [16,16,16,16] + 邻项联动圆角" },
  { value: "sheet", label: "BottomSheet & SideSheet", description: "28px 抽屉表面 + 手势拖拽关闭" },
  { value: "avatar", label: "Avatar 多边形头像", description: "支持 35 种官方 MaterialShapes 矢量裁剪" },
  { value: "wavy", label: "WavyProgressIndicator", description: "极坐标 N=9 整波瓣闭合波浪进度" },
];

const SEARCH_SUGGESTIONS: readonly SearchSuggestion[] = [
  { value: "carousel", label: "Carousel 焦点轮播", category: "M3E 1.5", description: "零和容器宽度守恒 + 28px/20px/16px 动态焦点圆角" },
  { value: "otp-field", label: "OTPField 验证码框", category: "Base UI 1.9", description: "Connected 分段圆角 + 聚焦自动独立脱出 [16,16,16,16]" },
  { value: "top-app-bar", label: "TopAppBar 弹性应用栏", category: "M3E 1.5", description: "LargeFlexible 双行副标题滚动折叠插值" },
  { value: "progress", label: "LinearProgressIndicator", category: "M3E 1.5", description: "标志性 4px 轨道裂隙 (Track Gap) + 4px 终点止动圆点" },
  { value: "date-picker", label: "DockedDatePicker 日历", category: "M3E 1.5", description: "28px 容器表面 + 年份速切网格 + 按压圆角形变" },
];

const CAROUSEL_DEMO_ITEMS: readonly CarouselItemSpec[] = [
  {
    id: "aurora",
    badge: "Multi-Browse 01",
    title: "空间物理弹簧系统",
    subtitle: "ζ = 0.6 · k = 380 欠阻尼丝滑回弹",
    background: "linear-gradient(135deg, #4f378b 0%, #9a82db 100%)",
  },
  {
    id: "emerald",
    badge: "Multi-Browse 02",
    title: "HCT 五级动态表面",
    subtitle: "Lowest → Highest 零投影清晰层级",
    background: "linear-gradient(135deg, #005142 0%, #26a689 100%)",
  },
  {
    id: "ocean",
    badge: "Multi-Browse 03",
    title: "35 种归一化多边形",
    subtitle: "任意形状 1:1 闭合三次贝塞尔插值",
    background: "linear-gradient(135deg, #0b57d0 0%, #5b9bf8 100%)",
  },
  {
    id: "crimson",
    badge: "Multi-Browse 04",
    title: "零和容器宽度守恒",
    subtitle: "焦点扩张与邻项压缩严丝合缝无抖动",
    background: "linear-gradient(135deg, #8c1d18 0%, #e46962 100%)",
  },
  {
    id: "plum",
    badge: "Multi-Browse 05",
    title: "Base UI 1.9 无障碍原语",
    subtitle: "完整 ARIA、键盘焦点环与浮层定位",
    background: "linear-gradient(135deg, #633b48 0%, #b58392 100%)",
  },
];

const NAV_GROUPS = [
  {
    title: "入门与配置",
    items: [
      { id: "theme-setup", label: "m3e.json 主题与国际化", tag: "v1.0" },
    ],
  },
  {
    title: "动作与工具栏",
    items: [
      { id: "button", label: "Button & ToggleButton" },
      { id: "icon-split", label: "IconButton & SplitButton" },
      { id: "button-group", label: "ButtonGroup 按钮组" },
      { id: "toolbar-fab", label: "FloatingToolbar & FABMenu" },
      { id: "fab-extended", label: "FAB & ExtendedFAB", tag: "New" },
    ],
  },
  {
    title: "表单控件",
    items: [
      { id: "search-bar", label: "SearchBar 搜索栏", tag: "New" },
      { id: "otp-field", label: "OTPField 验证码", tag: "New" },
      { id: "date-picker", label: "DatePicker 日历选择", tag: "New" },
      { id: "textfield", label: "TextField & Textarea" },
      { id: "number-combobox", label: "NumberField & Combobox" },
      { id: "switch", label: "Switch 开关" },
      { id: "slider", label: "Slider 滑块" },
      { id: "checkbox-radio", label: "Checkbox & Radio" },
      { id: "select", label: "Select 选择器" },
    ],
  },
  {
    title: "数据展示与容器",
    items: [
      { id: "carousel", label: "Carousel 焦点轮播", tag: "New" },
      { id: "chips", label: "Chip 标签族" },
      { id: "avatar-badge", label: "Avatar & Badge" },
      { id: "cards", label: "Card 卡片容器" },
      { id: "accordion", label: "Accordion 分段手风琴" },
      { id: "preview-scroll-divider", label: "PreviewCard & ScrollArea", tag: "New" },
    ],
  },
  {
    title: "导航与列表",
    items: [
      { id: "top-app-bar", label: "TopAppBar 弹性应用栏", tag: "New" },
      { id: "navigation", label: "NavigationBar & Rail" },
      { id: "tabs", label: "Tabs 标签页" },
      { id: "segmented-list", label: "SegmentedList 分段列表" },
    ],
  },
  {
    title: "浮层、反馈与图形",
    items: [
      { id: "sheets", label: "BottomSheet & SideSheet" },
      { id: "popover-menu", label: "Popover & Menu (右键)" },
      { id: "dialog", label: "Dialog & AlertDialog" },
      { id: "tooltip-toast", label: "Tooltip & Toast" },
      { id: "flat-progress-meter", label: "Progress & Meter 裂隙条", tag: "New" },
      { id: "progress", label: "Loading & WavyProgress" },
      { id: "shapes", label: "MaterialShapeView (35)" },
    ],
  },
  {
    title: "高阶复合套件",
    items: [
      { id: "site-nav-collapsible", label: "NavigationMenu & Collapsible", tag: "v1.0" },
      { id: "time-date-range", label: "TimePicker & 区间日历", tag: "New" },
      { id: "form-fieldset", label: "Form & Fieldset 校验", tag: "New" },
      { id: "navigation-suite", label: "NavigationSuite & 抽屉", tag: "New" },
      { id: "menubar-submenu", label: "Menubar & 多级子菜单", tag: "New" },
      { id: "data-table-skeleton", label: "DataTable & Skeleton", tag: "New" },
    ],
  },
] as const;

/* =========================================================================
   Minimal Inline SVG Icons
   ========================================================================= */

function SparkleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2L14.6 9.4L22 12L14.6 14.6L12 22L9.4 14.6L2 12L9.4 9.4L12 2Z" />
    </svg>
  );
}

function HeartIcon({ filled = false }: { readonly filled?: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1.1L12 21.3l7.8-7.8 1-1.1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M22 2L11 13" />
      <path d="M22 2L15 22L11 13L2 9L22 2Z" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  );
}

function MenuHamburgerIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function SlidersStudioIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  );
}

function NavCategoryGlyph({ index }: { readonly index: number }) {
  switch (index) {
    case 0:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.26.6.77 1.02 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      );
    case 1:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
      );
    case 2:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="4" width="18" height="16" rx="3" />
          <line x1="7" y1="9" x2="17" y2="9" />
          <line x1="7" y1="14" x2="13" y2="14" />
        </svg>
      );
    case 3:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 4:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
        </svg>
      );
    case 5:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    default:
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 2L14.8 9.2L22 12L14.8 14.8L12 22L9.2 14.8L2 12L9.2 9.2L12 2Z" />
        </svg>
      );
  }
}

const NAV_DRAWER_ITEMS: readonly NavigationDestination<string>[] =
  NAV_GROUPS.flatMap((group, groupIdx) =>
    group.items.map((item) => ({
      value: item.id,
      label: item.label,
      href: `#${item.id}`,
      section: group.title,
      icon: <NavCategoryGlyph index={groupIdx} />,
      badgeLabel: "tag" in item && item.tag ? item.tag : undefined,
    })),
  );

const GLOBAL_COMPONENT_SUGGESTIONS: readonly SearchSuggestion[] =
  NAV_GROUPS.flatMap((group) =>
    group.items.map((item) => ({
      value: item.id,
      label: item.label,
      category: group.title,
      description: `#${item.id}`,
    })),
  );

const LOCALE_GROUP_ITEMS = LOCALE_OPTIONS.map((opt) => ({
  value: opt.code,
  label: opt.label,
}));

const SCHEME_GROUP_ITEMS = [
  { value: "expressive", label: "Expressive" },
  { value: "tonalSpot", label: "Tonal" },
  { value: "vibrant", label: "Vibrant" },
] as const;

const CONTRAST_GROUP_ITEMS = CONTRAST_OPTIONS.map((c) => ({
  value: String(c.value),
  label: c.label,
}));

const COLOR_MODE_GROUP_ITEMS = [
  { value: "light", label: "浅色" },
  { value: "dark", label: "深色" },
  { value: "system", label: "跟随系统" },
] as const;

function SeedSwatchDot({ hex }: { readonly hex: string }) {
  return (
    <span
      className="docs-seed-dot"
      style={{ backgroundColor: hex }}
      aria-hidden="true"
    />
  );
}

/* =========================================================================
   1. Sticky Compact TopAppBar (Built 100% with m3eui)
   ========================================================================= */

function DocsHeader({
  onOpenMobileNav,
  onOpenStudio,
  onJumpToSection,
}: {
  readonly onOpenMobileNav: () => void;
  readonly onOpenStudio: () => void;
  readonly onJumpToSection: (sectionId: string) => void;
}) {
  const {
    seedHex,
    setSeedHex,
    schemeVariant,
    setSchemeVariant,
    contrastLevel,
    setContrastLevel,
    colorMode,
    setColorMode,
    locale,
    setLocale,
    setDirectionMode,
  } = useM3E();

  const [isScrolled, setIsScrolled] = React.useState(false);
  const [quickQuery, setQuickQuery] = React.useState("");

  React.useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const resolveAndJump = (queryOrLabel: string) => {
    const trimmed = queryOrLabel.trim().toLowerCase();
    if (!trimmed) return;
    const exact = GLOBAL_COMPONENT_SUGGESTIONS.find(
      (s) =>
        s.label.toLowerCase() === trimmed ||
        s.value.toLowerCase() === trimmed,
    );
    const fuzzy =
      exact ??
      GLOBAL_COMPONENT_SUGGESTIONS.find(
        (s) =>
          s.label.toLowerCase().includes(trimmed) ||
          s.value.toLowerCase().includes(trimmed),
      );
    if (fuzzy) {
      onJumpToSection(fuzzy.value);
      setQuickQuery("");
    }
  };

  return (
    <TopAppBar
      variant="small"
      scrolled={isScrolled}
      className="docs-top-app-bar"
      navigationIcon={
        <div className="docs-brand-cluster">
          <IconButton
            size="sm"
            variant="standard"
            aria-label="打开组件导航抽屉"
            className="docs-mobile-menu-btn"
            icon={<MenuHamburgerIcon />}
            onClick={onOpenMobileNav}
          />
          <a href="#docs-top" className="docs-brand-link">
            <MaterialShapeView
              shape="cookie9Sided"
              toShape="clover8Leaf"
              morphProgress={isScrolled ? 1 : 0}
              size={32}
            />
            <span className="docs-brand__title">m3eui</span>
          </a>
          <AssistChip
            className="docs-brand__chip"
            onClick={() => onJumpToSection("theme-setup")}
          >
            v1.0 · m3e.json
          </AssistChip>
        </div>
      }
      title={
        <div className="docs-header-search-wrap">
          <SearchBar
            size="sm"
            className="docs-global-search"
            suggestions={GLOBAL_COMPONENT_SUGGESTIONS}
            value={quickQuery}
            onValueChange={(val) => {
              setQuickQuery(val);
              const matched = GLOBAL_COMPONENT_SUGGESTIONS.find(
                (s) => s.label === val,
              );
              if (matched) {
                onJumpToSection(matched.value);
                setQuickQuery("");
              }
            }}
            onSearchSubmit={resolveAndJump}
            placeholder="快速跳转 48+ 组件与规范 (如 Button, DatePicker, Tabs)…"
            aria-label="全局搜索并跳转组件章节"
          />
        </div>
      }
      actions={
        <div className="docs-header-actions">
          <ButtonGroup
            variant="connected"
            size="xs"
            selectionMode="single"
            aria-label="国际化语言 (i18n)"
            items={LOCALE_GROUP_ITEMS}
            value={[locale]}
            onValueChange={(vals) => {
              const next = vals[0] as M3EBuiltInLocale | undefined;
              if (next) {
                setDirectionMode("auto");
                setLocale(next);
              }
            }}
          />

          <div className="docs-header-desktop-only">
            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              aria-label="明暗模式"
              items={COLOR_MODE_GROUP_ITEMS}
              value={[colorMode]}
              onValueChange={(vals) => {
                const next = vals[0] as "light" | "dark" | "system" | undefined;
                if (next) setColorMode(next);
              }}
            />
          </div>

          <Popover
            align="end"
            title="HCT 动态主题与对比度"
            description="实时切换种子色、调色板算法与无障碍对比度层级"
            trigger={
              <Button
                size="xs"
                variant="outlined"
                leadingIcon={<SeedSwatchDot hex={seedHex} />}
              >
                主题调色
              </Button>
            }
          >
            <div className="docs-theme-popover-body">
              <div className="docs-studio-field">
                <span className="docs-studio-field__label">HCT 种子色预设</span>
                <div className="demo-row" style={{ gap: 6 }}>
                  {SEED_PRESETS.map((preset) => (
                    <FilterChip
                      key={preset.hex}
                      selected={
                        seedHex.toLowerCase() === preset.hex.toLowerCase()
                      }
                      icon={<SeedSwatchDot hex={preset.hex} />}
                      onSelectedChange={() => setSeedHex(preset.hex)}
                    >
                      {preset.name}
                    </FilterChip>
                  ))}
                  <label className="docs-color-picker-chip">
                    <input
                      type="color"
                      aria-label="自定义种子色"
                      className="docs-color-input"
                      value={seedHex}
                      onChange={(e) => setSeedHex(e.target.value)}
                    />
                    <span>自定义</span>
                  </label>
                </div>
              </div>

              <div className="docs-studio-field">
                <span className="docs-studio-field__label">调色板风格</span>
                <ButtonGroup
                  variant="connected"
                  size="xs"
                  selectionMode="single"
                  aria-label="调色板风格"
                  items={SCHEME_GROUP_ITEMS}
                  value={[schemeVariant]}
                  onValueChange={(vals) => {
                    const next = vals[0] as
                      | "expressive"
                      | "tonalSpot"
                      | "vibrant"
                      | undefined;
                    if (next) setSchemeVariant(next);
                  }}
                />
              </div>

              <div className="docs-studio-field">
                <span className="docs-studio-field__label">对比度层级</span>
                <ButtonGroup
                  variant="connected"
                  size="xs"
                  selectionMode="single"
                  aria-label="对比度层级"
                  items={CONTRAST_GROUP_ITEMS}
                  value={[String(contrastLevel)]}
                  onValueChange={(vals) => {
                    const next = vals[0];
                    if (next !== undefined) setContrastLevel(Number(next));
                  }}
                />
              </div>
            </div>
          </Popover>

          <Button
            size="xs"
            variant="tonal"
            leadingIcon={<SlidersStudioIcon />}
            onClick={onOpenStudio}
          >
            工作台
          </Button>
        </div>
      }
    />
  );
}

/* =========================================================================
   2. SideSheet Theme & Physics Studio (Built 100% with m3eui)
   ========================================================================= */

function ThemeStudioSheet({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const {
    seedHex,
    setSeedHex,
    schemeVariant,
    setSchemeVariant,
    contrastLevel,
    setContrastLevel,
    colorMode,
    setColorMode,
    locale,
    setLocale,
    direction,
    directionMode,
    setDirection,
    setDirectionMode,
    motionSchemeName,
    setMotionSchemeName,
    playbackRate,
    setPlaybackRate,
    debugGeometry,
    setDebugGeometry,
    exportConfigJson,
  } = useM3E();
  const { toast } = useM3EToast();

  return (
    <SideSheet
      open={open}
      onOpenChange={onOpenChange}
      side={direction === "rtl" ? "left" : "right"}
      title="M3E 主题与双轨物理工作台"
      description="所有参数实时联动全站 48+ 组件，并自动序列化为项目级 m3e.json 声明式配置。"
      footer={
        <div className="demo-row" style={{ justifyContent: "space-between", width: "100%" }}>
          <Button
            variant="filled"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(exportConfigJson());
              } catch {
                // Ignore clipboard restriction
              }
              toast({ title: "已复制实时 m3e.json 配置" });
            }}
          >
            复制 m3e.json
          </Button>
          <SheetClose
            render={
              <Button variant="tonal" size="sm">
                完成
              </Button>
            }
          />
        </div>
      }
    >
      <ScrollArea maxHeight="calc(100dvh - 210px)">
        <div className="docs-studio-sheet-content">
          <Fieldset
            legend="HCT 动态色彩与对比度"
            description="基于 CAM16 + CIELAB 感知均匀空间实时计算浅/深双套色阶"
          >
            <div className="demo-row" style={{ gap: 8 }}>
              {SEED_PRESETS.map((preset) => (
                <FilterChip
                  key={preset.hex}
                  selected={
                    seedHex.toLowerCase() === preset.hex.toLowerCase()
                  }
                  icon={<SeedSwatchDot hex={preset.hex} />}
                  onSelectedChange={() => setSeedHex(preset.hex)}
                >
                  {preset.name}
                </FilterChip>
              ))}
            </div>

            <Select
              label="调色板变体 (schemeVariant)"
              value={schemeVariant}
              onValueChange={(v) => {
                if (v) {
                  setSchemeVariant(
                    v as "expressive" | "tonalSpot" | "vibrant" | "neutral",
                  );
                }
              }}
              options={[
                { value: "expressive", label: "Expressive (高表现力色相偏移)" },
                { value: "tonalSpot", label: "Tonal Spot (温和色调焦点)" },
                { value: "vibrant", label: "Vibrant (高饱和活力)" },
                { value: "neutral", label: "Neutral (低饱和中性)" },
              ]}
            />

            <div className="docs-studio-field">
              <span className="docs-studio-field__label">对比度层级</span>
              <ButtonGroup
                variant="connected"
                size="xs"
                selectionMode="single"
                aria-label="工作台对比度层级"
                items={CONTRAST_GROUP_ITEMS}
                value={[String(contrastLevel)]}
                onValueChange={(vals) => {
                  if (vals[0] !== undefined) setContrastLevel(Number(vals[0]));
                }}
              />
            </div>

            <div className="docs-studio-field">
              <span className="docs-studio-field__label">明暗模式</span>
              <ButtonGroup
                variant="connected"
                size="xs"
                selectionMode="single"
                aria-label="工作台明暗模式"
                items={COLOR_MODE_GROUP_ITEMS}
                value={[colorMode]}
                onValueChange={(vals) => {
                  const next = vals[0] as "light" | "dark" | "system" | undefined;
                  if (next) setColorMode(next);
                }}
              />
            </div>
          </Fieldset>

          <Fieldset
            legend="国际化语言与排版方向"
            description="78 个强类型文案 Key，切换到阿拉伯语时自动开启全局 RTL 镜像"
          >
            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              aria-label="工作台国际化语言"
              items={LOCALE_GROUP_ITEMS}
              value={[locale]}
              onValueChange={(vals) => {
                const next = vals[0] as M3EBuiltInLocale | undefined;
                if (next) {
                  setDirectionMode("auto");
                  setLocale(next);
                }
              }}
            />

            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              aria-label="书写方向模式"
              items={[
                { value: "auto", label: `自动 (${direction.toUpperCase()})` },
                { value: "ltr", label: "强制 LTR →" },
                { value: "rtl", label: "强制 ← RTL" },
              ]}
              value={[directionMode]}
              onValueChange={(vals) => {
                const next = vals[0] as "auto" | "ltr" | "rtl" | undefined;
                if (!next) return;
                if (next === "auto") {
                  setDirectionMode("auto");
                } else {
                  setDirection(next);
                }
              }}
            />
          </Fieldset>

          <Fieldset
            legend="双轨物理弹簧与几何调试"
            description="空间轨迹支持 ζ=0.6 弹性回弹，颜色/不透明度严格临界阻尼 ζ=1.0"
          >
            <Switch
              checked={motionSchemeName === "expressive"}
              onCheckedChange={(checked) =>
                setMotionSchemeName(checked ? "expressive" : "standard")
              }
              label="启用 Expressive 欠阻尼弹性弹簧"
            />
            <Switch
              checked={playbackRate < 1}
              onCheckedChange={(checked) => setPlaybackRate(checked ? 0.25 : 1)}
              label="0.25x 物理慢动作检查 (观察圆角与挤压插值)"
            />
            <Switch
              checked={debugGeometry}
              onCheckedChange={setDebugGeometry}
              label="显示实时圆角半径与零和宽度几何标尺"
            />
          </Fieldset>
        </div>
      </ScrollArea>
    </SideSheet>
  );
}

/* =========================================================================
   3. Interactive Documentation Body (100% m3eui Shell)
   ========================================================================= */

function DocsBody() {
  const {
    seedHex,
    setSeedHex,
    schemeVariant,
    setSchemeVariant,
    contrastLevel,
    setContrastLevel,
    direction,
    directionMode,
    setDirection,
    motionSchemeName,
    setMotionSchemeName,
    playbackRate,
    setPlaybackRate,
    debugGeometry,
    setDebugGeometry,
    exportConfigJson,
  } = useM3E();
  const { locale, t } = useM3EI18n();
  const { toast } = useM3EToast();
  const [activeSection, setActiveSection] = React.useState<string>("theme-setup");
  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [studioOpen, setStudioOpen] = React.useState(false);
  const [copiedConfig, setCopiedConfig] = React.useState(false);
  const [heroShapeIdx, setHeroShapeIdx] = React.useState(0);

  const HERO_SHAPES: readonly M3EShapeName[] = [
    "cookie9Sided",
    "clover8Leaf",
    "sunny",
    "flower",
    "heart",
  ];
  const currentHeroShape = HERO_SHAPES[heroShapeIdx % HERO_SHAPES.length]!;
  const prevHeroShape =
    HERO_SHAPES[
      (heroShapeIdx - 1 + HERO_SHAPES.length) % HERO_SHAPES.length
    ]!;

  const scrollToSection = React.useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus({ preventScroll: true });
    }
  }, []);

  // Actions state
  const [favSelected, setFavSelected] = React.useState(false);
  const [iconToggleOn, setIconToggleOn] = React.useState(true);
  const [viewPeriod, setViewPeriod] = React.useState("week");
  const [toolbarTheme, setToolbarTheme] = React.useState<"standard" | "vibrant">("vibrant");
  const [toolbarTool, setToolbarTool] = React.useState("brush");

  // Form controls state
  const [wifiOn, setWifiOn] = React.useState(true);
  const [hapticOn, setHapticOn] = React.useState(true);
  const [dndOn, setDndOn] = React.useState(false);

  const [volume, setVolume] = React.useState<number>(64);
  const [brightness, setBrightness] = React.useState<number>(40);
  const [priceRange, setPriceRange] = React.useState<readonly number[]>([25, 78]);

  const ALL_PERMS = ["read", "write", "deploy"] as const;
  const [selectedPerms, setSelectedPerms] = React.useState<string[]>(["read", "write"]);
  const [notifyChannel, setNotifyChannel] = React.useState("push");

  const [modelId, setModelId] = React.useState<string | null>("gemini-2.5-pro");
  const [regionId, setRegionId] = React.useState<string | null>("tokyo");

  // Phase 4 Form, Display, Nav & Sheet state
  const [emailInput, setEmailInput] = React.useState("architect@m3e.dev");
  const [bioInput, setBioInput] = React.useState(
    "基于 Base UI 1.x 与 M3E 双轨物理弹簧构建的高表现力 Web React 组件库。",
  );
  const [stiffnessVal, setStiffnessVal] = React.useState<number | null>(380);
  const [dampingVal, setDampingVal] = React.useState<number | null>(0.6);
  const [selectedCombo, setSelectedCombo] = React.useState<ComboboxOption | null>(
    COMPONENT_SEARCH_OPTIONS[0] ?? null,
  );

  const [selectedFilters, setSelectedFilters] = React.useState<string[]>([
    "spring",
    "hct",
  ]);
  const [inputTags, setInputTags] = React.useState<string[]>([
    "m3eui/tokens",
    "m3eui",
    "@base-ui/react",
  ]);
  const [unreadCount, setUnreadCount] = React.useState<number>(6);
  const [navDest, setNavDest] = React.useState<string>("explore");

  // Navigation & List state
  const [primaryTab, setPrimaryTab] = React.useState("overview");
  const [secondaryTab, setSecondaryTab] = React.useState("tokens");
  const [selectedListItem, setSelectedListItem] = React.useState<number>(1);
  const [singleListSelected, setSingleListSelected] = React.useState(false);

  // Progress & Shapes state
  const [progressVal, setProgressVal] = React.useState<number>(0.62);
  const [fromShape, setFromShape] = React.useState<M3EShapeName>("cookie9Sided");
  const [toShape, setToShape] = React.useState<M3EShapeName>("heart");
  const [morphProgress, setMorphProgress] = React.useState<number>(0);

  // Phase 5 state: ExtendedFAB, SearchBar, OTPField, DatePicker, Carousel, TopAppBar, Meter
  const [fabExpanded, setFabExpanded] = React.useState<boolean>(true);
  const [searchQuery, setSearchQuery] = React.useState<string>("");
  const [otpCode, setOtpCode] = React.useState<string>("528");
  const [releaseDate, setReleaseDate] = React.useState<string>("2026-11-18");
  const [carouselVariant, setCarouselVariant] = React.useState<"multi-browse" | "hero">("multi-browse");
  const [appBarCollapse, setAppBarCollapse] = React.useState<number>(0);
  const [appBarVariant, setAppBarVariant] = React.useState<
    "large-flexible" | "medium-flexible" | "center-aligned"
  >("large-flexible");
  const [gpuUsage, setGpuUsage] = React.useState<number>(76);

  return (
    <div id="docs-top" className="docs-app-root">
      <a href="#docs-main" className="docs-skip-link">
        跳至主内容
      </a>

      <DocsHeader
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onOpenStudio={() => setStudioOpen(true)}
        onJumpToSection={scrollToSection}
      />

      <ThemeStudioSheet open={studioOpen} onOpenChange={setStudioOpen} />

      <NavigationDrawer
        variant="modal"
        open={mobileNavOpen}
        onOpenChange={setMobileNavOpen}
        aria-label="移动端组件规范导航"
        headline="m3eui 组件规范目录"
        items={NAV_DRAWER_ITEMS}
        value={activeSection}
        onValueChange={(nextId) => scrollToSection(nextId)}
      />

      <div className="docs-shell">
        <div className="docs-sidebar-container">
          <ScrollArea
            maxHeight="calc(100dvh - 88px)"
            className="docs-sidebar-scroll"
          >
            <NavigationDrawer
              variant="permanent"
              scrollSpy
              aria-label="组件规范目录"
              headline="组件规范目录 (34 组)"
              items={NAV_DRAWER_ITEMS}
              value={activeSection}
              onValueChange={setActiveSection}
              className="docs-nav-drawer"
            />
          </ScrollArea>
        </div>

        <main id="docs-main" tabIndex={-1} className="docs-main">
          <Card variant="filled" className="docs-hero-card">
            <div className="docs-hero__top">
              <div className="docs-hero__copy">
                <div className="docs-hero__chips">
                  <AssistChip icon={<SparkleIcon />}>
                    Material 3 Expressive 1.5
                  </AssistChip>
                  <AssistChip>48+ 全量 Web 组件 (v1.0)</AssistChip>
                  <AssistChip>m3e.json + m3eui</AssistChip>
                  <AssistChip>100% Key 驱动 i18n · Auto RTL</AssistChip>
                </div>

                <h1 className="docs-hero__title">
                  基于 Base UI 无头原语与真实物理弹簧的 M3E 组件库
                </h1>
                <p className="docs-hero__desc">
                  整站界面同样 100% 由 <code>m3eui</code> 自身组件（
                  <code>TopAppBar</code>、<code>NavigationDrawer</code>、
                  <code>SearchBar</code>、<code>Tabs</code>、
                  <code>ButtonGroup</code>、<code>DataTable</code>、
                  <code>SideSheet</code>、<code>Card</code>）构建：底层基于{" "}
                  <code>@base-ui/react</code> 1.9 处理完整键盘焦点与无障碍语义，视觉严格还原动态圆角拓扑、双轨物理弹簧与 HCT 五级表面色阶。
                </p>

                <div className="demo-row">
                  <Button
                    variant="filled"
                    leadingIcon={<SparkleIcon />}
                    onClick={() => scrollToSection("theme-setup")}
                  >
                    快速上手 m3e.json
                  </Button>
                  <Button
                    variant="tonal"
                    leadingIcon={<SlidersStudioIcon />}
                    onClick={() => setStudioOpen(true)}
                  >
                    打开主题与物理工作台
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => scrollToSection("site-nav-collapsible")}
                  >
                    浏览 v1.0 新增原语
                  </Button>
                </div>
              </div>

              <Tooltip content="点击切换 M3E 归一化多边形徽章">
                <Card
                  interactive
                  variant="outlined"
                  className="docs-hero__emblem"
                  onClick={() => setHeroShapeIdx((n) => n + 1)}
                >
                  <MaterialShapeView
                    shape={prevHeroShape}
                    toShape={currentHeroShape}
                    morphProgress={1}
                    size={84}
                  />
                  <span className="docs-hero__emblem-caption">
                    {currentHeroShape}
                  </span>
                </Card>
              </Tooltip>
            </div>

            <Divider />

            <div className="docs-hero__studio-bar" aria-label="快捷主题与物理控制栏">
              <div className="docs-hero__studio-group">
                <span className="docs-studio-field__label">种子色</span>
                <div className="demo-row" style={{ gap: 6 }}>
                  {SEED_PRESETS.map((preset) => (
                    <FilterChip
                      key={preset.hex}
                      selected={
                        seedHex.toLowerCase() === preset.hex.toLowerCase()
                      }
                      icon={<SeedSwatchDot hex={preset.hex} />}
                      onSelectedChange={() => setSeedHex(preset.hex)}
                    >
                      {preset.name}
                    </FilterChip>
                  ))}
                </div>
              </div>

              <div className="docs-hero__studio-group">
                <span className="docs-studio-field__label">调色板</span>
                <ButtonGroup
                  variant="connected"
                  size="xs"
                  selectionMode="single"
                  aria-label="快捷调色板风格"
                  items={SCHEME_GROUP_ITEMS}
                  value={[schemeVariant]}
                  onValueChange={(vals) => {
                    const next = vals[0] as
                      | "expressive"
                      | "tonalSpot"
                      | "vibrant"
                      | undefined;
                    if (next) setSchemeVariant(next);
                  }}
                />
              </div>

              <div className="docs-hero__studio-group">
                <span className="docs-studio-field__label">对比度</span>
                <ButtonGroup
                  variant="connected"
                  size="xs"
                  selectionMode="single"
                  aria-label="快捷对比度层级"
                  items={CONTRAST_GROUP_ITEMS}
                  value={[String(contrastLevel)]}
                  onValueChange={(vals) => {
                    if (vals[0] !== undefined) setContrastLevel(Number(vals[0]));
                  }}
                />
              </div>

              <div className="docs-hero__studio-group">
                <span className="docs-studio-field__label">弹簧与调试</span>
                <div className="demo-row" style={{ gap: 6 }}>
                  <FilterChip
                    selected={motionSchemeName === "expressive"}
                    onSelectedChange={(on) =>
                      setMotionSchemeName(on ? "expressive" : "standard")
                    }
                  >
                    {motionSchemeName === "expressive" ? "弹性弹簧" : "标准弹簧"}
                  </FilterChip>
                  <FilterChip
                    selected={playbackRate < 1}
                    onSelectedChange={(slow) => setPlaybackRate(slow ? 0.25 : 1)}
                  >
                    {playbackRate === 1 ? "1x 速度" : "0.25x 慢放"}
                  </FilterChip>
                  <FilterChip
                    selected={debugGeometry}
                    onSelectedChange={setDebugGeometry}
                  >
                    几何标尺
                  </FilterChip>
                  <FilterChip
                    selected={direction === "rtl"}
                    onSelectedChange={(rtl) => setDirection(rtl ? "rtl" : "ltr")}
                  >
                    {direction === "ltr" ? "LTR →" : "← RTL"}
                  </FilterChip>
                </div>
              </div>
            </div>
          </Card>

          {/* ===============================================================
              1. 入门、m3e.json 配置与国际化
              =============================================================== */}
          <div className="docs-category">
            <DocsCategoryHeader
              indexLabel="01"
              title="入门、m3e.json 配置与国际化"
              countLabel="工程基石"
              subtitle={
                <>
                  对标 <code>shadcn/ui</code> 的声明式工程配置：根目录{" "}
                  <code>m3e.json</code> 统一收敛主题色、调色板、对比度、物理阻尼与默认语言（支持自动 RTL），配合{" "}
                  <code>m3eui</code> 零闪烁同步静态 CSS 变量。
                </>
              }
            />

            <ShowcaseCard
              id="theme-setup"
              title="m3e.json 工程配置 · M3EProvider · Key 驱动国际化"
              primitive="m3eui/config · m3eui/i18n · m3eui"
              description={`当前种子色 ${seedHex}（${schemeVariant} · 对比度 ${contrastLevel}），当前语言 ${locale}（书写方向 ${direction.toUpperCase()} / 模式 ${directionMode}）。组件内部零硬编码文案，全部通过 t(key) 与 Intl API 实时响应切换。`}
              code={`import "./m3e-theme.generated.css"; // m3e sync 静态生成，首屏零闪烁
import "m3eui/styles.css";
import { M3EProvider, Button } from "m3eui";
import m3eConfig from "./m3e.json";

export function App() {
  return (
    <M3EProvider config={m3eConfig}>
      <Button variant="filled">开始构建</Button>
    </M3EProvider>
  );
}`}
            >
              <div className="surface-ramp">
                {[
                  ["Lowest", "var(--m3e-color-surface-container-lowest)"],
                  ["Low", "var(--m3e-color-surface-container-low)"],
                  ["Container", "var(--m3e-color-surface-container)"],
                  ["High", "var(--m3e-color-surface-container-high)"],
                  ["Highest", "var(--m3e-color-surface-container-highest)"],
                ].map(([name, cssVar]) => (
                  <Card
                    key={name}
                    variant="outlined"
                    className="surface-swatch-card"
                    style={{ backgroundColor: cssVar }}
                  >
                    <strong>Surface {name}</strong>
                    <code style={{ fontSize: 11, opacity: 0.75 }}>{cssVar}</code>
                  </Card>
                ))}
              </div>

              <div className="demo-grid-2">
                <Card
                  variant="outlined"
                  title={
                    <div className="docs-inline-card-head">
                      <span>
                        实时生成的 <code>m3e.json</code> 配置
                      </span>
                      <Button
                        size="xs"
                        variant="tonal"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(
                              exportConfigJson(),
                            );
                            setCopiedConfig(true);
                            setTimeout(() => setCopiedConfig(false), 1600);
                          } catch {
                            // Ignore clipboard restriction
                          }
                          toast({ title: "已复制当前 m3e.json 配置" });
                        }}
                      >
                        {copiedConfig ? "已复制 m3e.json" : "复制 m3e.json"}
                      </Button>
                    </div>
                  }
                >
                  <ScrollArea maxHeight={240} orientation="both">
                    <pre
                      data-testid="live-m3e-json"
                      className="docs-code-pre"
                    >
                      <code>{exportConfigJson()}</code>
                    </pre>
                  </ScrollArea>
                </Card>

                <Card
                  variant="outlined"
                  title={
                    <span>
                      国际化字典实时映射 (<code>{locale}</code> ·{" "}
                      <code>dir=&quot;{direction}&quot;</code>)
                    </span>
                  }
                >
                  <SegmentedList aria-label="国际化字典实时映射示例">
                    <SegmentedListItem
                      headline={<strong>{t("datePicker.title")}</strong>}
                      supportingText="Key: datePicker.title"
                    />
                    <SegmentedListItem
                      headline={<strong>{t("timePicker.title")}</strong>}
                      supportingText="Key: timePicker.title"
                    />
                    <SegmentedListItem
                      headline={<strong>{t("searchBar.placeholder")}</strong>}
                      supportingText="Key: searchBar.placeholder"
                    />
                    <SegmentedListItem
                      headline={<strong>{t("collapsible.expandAll")}</strong>}
                      supportingText="Key: collapsible.expandAll"
                    />
                    <SegmentedListItem
                      headline={
                        <strong>
                          {t("form.errorSummaryHeading", { count: 2 })}
                        </strong>
                      }
                      supportingText="Key: form.errorSummaryHeading"
                    />
                  </SegmentedList>
                  <div className="demo-row" style={{ marginTop: 10, gap: 6 }}>
                    <AssistChip>pnpm m3e init</AssistChip>
                    <AssistChip>pnpm m3e sync</AssistChip>
                    <AssistChip>pnpm m3e locale fr-FR</AssistChip>
                    <AssistChip>pnpm m3e doctor</AssistChip>
                  </div>
                </Card>
              </div>
            </ShowcaseCard>
          </div>

          {/* ===============================================================
              2. 动作与工具栏
              =============================================================== */}
          <div className="docs-category">
            <DocsCategoryHeader
              indexLabel="02"
              title="动作与工具栏 (Actions)"
              countLabel="5 组规范"
              subtitle="五档尺寸按钮、按压圆角收缩、非对称分裂按钮、零和宽度挤压按钮组与悬浮胶囊工具栏。"
            />

          <ShowcaseCard
            id="button"
            title="Button & ToggleButton"
            primitive="@base-ui/react/button · @base-ui/react/toggle"
            description="支持 xs–xl 五档尺寸与 5 种色彩变体；按压时空间弹簧收缩圆角，ToggleButton 选中时由胶囊切换为方圆角。"
            code={`import { Button, ToggleButton } from "m3eui";

<Button variant="filled" leadingIcon={<SparkleIcon />}>主要操作</Button>
<Button variant="tonal">次要操作</Button>
<Button variant="outlined">描边按钮</Button>
<ToggleButton
  variant="tonal"
  pressed={pressed}
  onPressedChange={setPressed}
>
  收藏文章
</ToggleButton>`}
          >
            <div className="demo-row">
              <Button variant="filled" leadingIcon={<SparkleIcon />}>
                Filled 填充
              </Button>
              <Button variant="tonal">Tonal 色调</Button>
              <Button variant="elevated">Elevated 浮起</Button>
              <Button variant="outlined">Outlined 描边</Button>
              <Button variant="text">Text 文本</Button>
              <ToggleButton
                variant="tonal"
                pressed={favSelected}
                onPressedChange={setFavSelected}
                leadingIcon={<HeartIcon filled={favSelected} />}
              >
                {favSelected ? "已收藏" : "收藏"}
              </ToggleButton>
            </div>
            <div className="demo-row">
              {(["xs", "sm", "md", "lg"] as const).map((sz) => (
                <Button key={sz} size={sz} variant="tonal">
                  Size {sz.toUpperCase()}
                </Button>
              ))}
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="icon-split"
            title="IconButton (5×3) & SplitButton"
            primitive="@base-ui/react/button · @base-ui/react/menu"
            description="IconButton 提供 narrow / default / wide 三种宽高比；SplitButton 具备 2px 非对称内缝、光学居中偏移与同心圆分段菜单。"
            code={`import { IconButton, IconToggleButton, SplitButton } from "m3eui";

<IconButton aria-label="通知" variant="tonal" widthVariant="narrow" icon={<BellIcon />} />
<IconToggleButton aria-label="喜欢" pressed={liked} onPressedChange={setLiked} icon={<HeartIcon />} />

<SplitButton
  variant="filled"
  leadingIcon={<SendIcon />}
  menuItems={[
    { id: "now", label: "立即发送", shortcut: "⌘↵" },
    { id: "schedule", label: "定时发送…" },
    { id: "draft", label: "存为草稿" },
  ]}
>
  发送邮件
</SplitButton>`}
          >
            <div className="demo-row">
              <IconButton
                aria-label="窄版图标按钮"
                variant="tonal"
                widthVariant="narrow"
                icon={<BellIcon />}
              />
              <IconButton
                aria-label="标准图标按钮"
                variant="filled"
                widthVariant="default"
                icon={<SparkleIcon />}
              />
              <IconButton
                aria-label="宽版图标按钮"
                variant="outlined"
                widthVariant="wide"
                icon={<SendIcon />}
              />
              <IconToggleButton
                aria-label="切换收藏"
                variant="tonal"
                pressed={iconToggleOn}
                onPressedChange={setIconToggleOn}
                icon={<HeartIcon filled={iconToggleOn} />}
              />
              <SplitButton
                variant="filled"
                leadingIcon={<SendIcon />}
                onClick={() => toast({ title: "邮件已立即发送" })}
                menuItems={[
                  {
                    id: "now",
                    label: "立即发送",
                    shortcut: "⌘↵",
                    selected: true,
                    onSelect: () => toast({ title: "邮件已立即发送" }),
                  },
                  {
                    id: "schedule",
                    label: "明早 09:00 定时发送",
                    onSelect: () => toast({ title: "已排期至明早 09:00" }),
                  },
                  {
                    id: "draft",
                    label: "保存为模板草稿",
                    onSelect: () => toast({ title: "已存入草稿箱" }),
                  },
                ]}
              >
                发送邮件
              </SplitButton>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="button-group"
            title="ButtonGroup 按钮组 (Standard 挤压 vs Connected 分段)"
            primitive="@base-ui/react/toggle-group · @base-ui/react/toolbar"
            description="Connected 模式保持页签宽度恒定并通过 8px → 4px → 胶囊形变表达交互；Standard 动作栏按压时展开 15% 并零和压缩邻项。"
            code={`import { ButtonGroup } from "m3eui";

{/* Connected 分段选择器（宽度恒定，圆角形变） */}
<ButtonGroup
  variant="connected"
  selectionMode="single"
  value={[period]}
  onValueChange={(vals) => setPeriod(vals[0] ?? "week")}
  items={[
    { value: "day", label: "日视图" },
    { value: "week", label: "周视图" },
    { value: "month", label: "月度概览" },
    { value: "year", label: "全年" },
  ]}
/>`}
          >
            <div className="demo-panel">
              <span className="demo-panel__label">Connected 分段切换（宽度锁定，内缝圆角弹簧过渡）</span>
              <ButtonGroup
                variant="connected"
                selectionMode="single"
                value={[viewPeriod]}
                onValueChange={(vals) => {
                  if (vals[0]) setViewPeriod(vals[0]);
                }}
                items={[
                  { value: "day", label: "日视图" },
                  { value: "week", label: "周视图" },
                  { value: "month", label: "月度概览" },
                  { value: "year", label: "全年" },
                ]}
              />
            </div>

            <div className="demo-panel">
              <span className="demo-panel__label">Standard 动作组（按压享 15% 零和宽度挤压，总宽不变）</span>
              <ButtonGroup
                variant="standard"
                buttonVariant="tonal"
                items={[
                  { value: "reply", label: "回复" },
                  { value: "forward", label: "转发同事" },
                  { value: "archive", label: "归档会话" },
                ]}
              />
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="toolbar-fab"
            title="FloatingToolbar & FABMenu"
            primitive="@base-ui/react/toolbar"
            description="64px 外胶囊嵌套 48px 同心圆动作项（32 - 8 = 24px），右侧可伴随 ToggleFAB 展开级联胶囊菜单。"
            code={`import { FloatingToolbar, FABMenu } from "m3eui";

<FloatingToolbar
  theme="vibrant"
  aria-label="编辑工具栏"
  items={[
    { id: "brush", label: "画笔", icon: <SparkleIcon />, selected: true },
    { id: "like", label: "标记", icon: <HeartIcon /> },
    { id: "share", label: "分享", icon: <SendIcon />, separatorBefore: true },
  ]}
  companionFab={
    <FABMenu
      size="sm"
      items={[
        { id: "doc", label: "新建文档", icon: <SparkleIcon /> },
        { id: "send", label: "快速分享", icon: <SendIcon /> },
      ]}
    />
  }
/>`}
          >
            <div className="demo-row" style={{ justifyContent: "space-between" }}>
              <FloatingToolbar
                theme={toolbarTheme}
                aria-label="画布悬浮工具栏"
                items={[
                  {
                    id: "brush",
                    label: "智能润色",
                    icon: <SparkleIcon />,
                    selected: toolbarTool === "brush",
                    onClick: () => setToolbarTool("brush"),
                  },
                  {
                    id: "fav",
                    label: "收藏图层",
                    icon: <HeartIcon filled={toolbarTool === "fav"} />,
                    selected: toolbarTool === "fav",
                    onClick: () => setToolbarTool("fav"),
                  },
                  {
                    id: "notify",
                    label: "提醒协作者",
                    icon: <BellIcon />,
                    separatorBefore: true,
                    selected: toolbarTool === "notify",
                    onClick: () => setToolbarTool("notify"),
                  },
                ]}
                companionFab={
                  <FABMenu
                    size="sm"
                    triggerLabel="新建操作"
                    items={[
                      {
                        id: "ai",
                        label: "AI 生成草稿",
                        icon: <SparkleIcon />,
                        onSelect: () => toast({ title: "已创建 AI 草稿" }),
                      },
                      {
                        id: "share",
                        label: "发送审阅链接",
                        icon: <SendIcon />,
                        onSelect: () => toast({ title: "审阅链接已复制" }),
                      },
                    ]}
                  />
                }
              />

              <Button
                size="xs"
                variant="outlined"
                onClick={() =>
                  setToolbarTheme((t) => (t === "vibrant" ? "standard" : "vibrant"))
                }
              >
                切换 {toolbarTheme === "vibrant" ? "Standard" : "Vibrant"} 主题
              </Button>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="fab-extended"
            title="FAB & ExtendedFAB (4 档尺寸 + 弹性伸缩悬浮动作按钮)"
            primitive="@base-ui/react/button · m3eui/tokens"
            description="对齐 AOSP M3E 1.5 四档 FAB 尺寸（40 / 56 / 80 / 96px）与四色容器变体；ExtendedFAB 展开/收起时通过空间弹簧平滑插值宽度，标签透明度使用临界阻尼零过冲过渡。"
            code={`import { FAB, ExtendedFAB } from "m3eui";

<FAB size="sm" variant="surface" icon={<SparkleIcon />} aria-label="快捷灵感" />
<FAB size="md" variant="primary" icon={<SendIcon />} aria-label="新建会话" />
<FAB size="lg" variant="secondary" icon={<HeartIcon />} aria-label="收藏合集" />
<FAB size="xl" variant="tertiary" icon={<SparkleIcon />} aria-label="创作中心" />

<ExtendedFAB expanded={expanded} icon={<SparkleIcon />} onClick={() => setExpanded(!expanded)}>
  新建画布工程
</ExtendedFAB>`}
          >
            <div className="demo-row" style={{ gap: 16 }}>
              <FAB
                size="sm"
                variant="surface"
                icon={<SparkleIcon />}
                aria-label="SM Surface FAB"
                onClick={() => toast({ title: "触发 Small FAB (40px, r=12)" })}
              />
              <FAB
                size="md"
                variant="primary"
                icon={<SendIcon />}
                aria-label="MD Primary FAB"
                onClick={() => toast({ title: "触发 Baseline FAB (56px, r=16)" })}
              />
              <FAB
                size="lg"
                variant="secondary"
                icon={<HeartIcon filled />}
                aria-label="LG Secondary FAB"
                onClick={() => toast({ title: "触发 Medium Expressive FAB (80px, r=20)" })}
              />
              <FAB
                size="xl"
                variant="tertiary"
                icon={<SparkleIcon />}
                aria-label="XL Tertiary FAB"
                onClick={() => toast({ title: "触发 Large Expressive FAB (96px, r=28)" })}
              />
            </div>

            <div className="demo-row" style={{ gap: 14 }}>
              <ExtendedFAB
                size="sm"
                variant="primary"
                expanded={fabExpanded}
                icon={<SparkleIcon />}
                onClick={() => setFabExpanded((v) => !v)}
              >
                新建画布工程
              </ExtendedFAB>

              <ExtendedFAB
                size="md"
                variant="secondary"
                expanded={fabExpanded}
                icon={<SendIcon />}
                onClick={() => setFabExpanded((v) => !v)}
              >
                发起多端评审
              </ExtendedFAB>

              <Button
                size="xs"
                variant="outlined"
                onClick={() => setFabExpanded((v) => !v)}
              >
                {fabExpanded ? "收起为纯图标 FAB" : "展开 ExtendedFAB 标签"}
              </Button>
            </div>
          </ShowcaseCard>
        </div>

        {/* ===============================================================
            3. 表单控件 (Form Controls)
            =============================================================== */}
        <div className="docs-category">
          <DocsCategoryHeader
            indexLabel="03"
            title="表单控件 (Form Controls)"
            countLabel="9 组规范"
            subtitle={
              <>
                基于 <code>@base-ui/react</code>{" "}
                原生表单状态构建，完整保留隐藏 input 提交能力、失焦后置校验、键盘方向键与 M3E 空间弹簧微交互。
              </>
            }
          />

          <ShowcaseCard
            id="search-bar"
            title="SearchBar 自动补全搜索栏 (IME 输入法安全提交)"
            primitive="@base-ui/react/autocomplete"
            description="56px 全胶囊高容器表面搜索栏，展开 28px 同心圆建议浮层（20px 内部选项胶囊），内置中文/日文输入法组词期间（isComposing / Safari timestamp）Enter 防误触提交保护。"
            code={`import { SearchBar } from "m3eui";

<SearchBar
  value={query}
  onValueChange={setQuery}
  suggestions={SEARCH_SUGGESTIONS}
  onSearchSubmit={(q) => console.log("搜索:", q)}
/>`}
          >
            <div className="demo-row">
              <SearchBar
                value={searchQuery}
                onValueChange={setSearchQuery}
                suggestions={SEARCH_SUGGESTIONS}
                trailingSlot={
                  <Avatar size="xs" shape="cookie9Sided" fallback="M3" />
                }
                onSearchSubmit={(q) => {
                  if (q) {
                    toast({ title: `执行搜索：${q}` });
                  }
                }}
              />
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="otp-field"
            title="OTPField 分段连接验证码 (聚焦自动独立脱出)"
            primitive="@base-ui/react/otp-field"
            description="基于 Base UI 1.9 OTPField 原语：说明文案置顶防软键盘遮挡，支持粘贴自动填充、one-time-code 自动补全与聚焦格 [16, 16, 16, 16] 空间弹簧脱出。"
            code={`import { OTPField } from "m3eui";

<OTPField
  length={6}
  separatorAfterIndex={2}
  label="双因素安全验证码"
  helperText="请输入发送至验证器的 6 位数字动态口令（支持直接粘贴整串数字）"
  value={otpCode}
  onValueChange={setOtpCode}
  onValueComplete={(code) => console.log("验证完成:", code)}
/>`}
          >
            <div className="demo-grid-2">
              <OTPField
                length={6}
                separatorAfterIndex={2}
                label="双因素安全验证码 (3 + 3 分段拓扑)"
                helperText="点击任意槽位观察内角 6px → 16px 弹簧脱出，填满 6 位自动点亮容器色"
                value={otpCode}
                onValueChange={setOtpCode}
                onValueComplete={(code) =>
                  toast({ title: `验证码输入完成：${code}` })
                }
              />

              <div className="demo-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  当前口令状态：{otpCode ? otpCode : "未输入"}（{otpCode.length} / 6）
                </div>
                <div className="demo-row">
                  <Button
                    size="xs"
                    variant="tonal"
                    onClick={() => {
                      setOtpCode("849206");
                      toast({ title: "已模拟剪贴板整串粘贴 849206" });
                    }}
                  >
                    模拟填入 6 位验证码
                  </Button>
                  <Button
                    size="xs"
                    variant="outlined"
                    onClick={() => setOtpCode("")}
                  >
                    清空重填
                  </Button>
                </div>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="date-picker"
            title="DockedDatePicker & DatePickerField 日历选择器"
            primitive="@base-ui/react/popover · Plain ISO Date"
            description="遵循 M3E 28px 高表面日历面板规范：采用无时区偏移风险的 YYYY-MM-DD 纯日期模型，内置年份速切网格与日期圆钮按压圆角收缩（20px → 10px）。"
            code={`import { DockedDatePicker, DatePickerField } from "m3eui";

<DockedDatePicker value={date} onValueChange={setDate} />
<DatePickerField label="计划发版日期" value={date} onValueChange={setDate} />`}
          >
            <div className="demo-row" style={{ alignItems: "flex-start", gap: 24 }}>
              <DockedDatePicker
                title="里程碑排期日历"
                value={releaseDate}
                onValueChange={(next) => {
                  setReleaseDate(next);
                  toast({ title: `已选定排期：${next}` });
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 240 }}>
                <DatePickerField
                  label="弹出式日期输入字段 (Popover DatePicker)"
                  value={releaseDate}
                  onValueChange={setReleaseDate}
                />
                <div className="demo-panel" style={{ fontSize: 13, lineHeight: 1.6 }}>
                  当前绑定值：<code>{releaseDate}</code>
                  <br />
                  提示：点击日历左上角年份标题可一键展开 15 年速切胶囊网格。
                </div>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="textfield"
            title="TextField & TextareaField 文本域"
            primitive="@base-ui/react/field · @base-ui/react/input"
            description="支持 Outlined 与 Filled 形态、失焦后置校验 (:user-invalid)、前置格式提示、一键清空、密码明文切换按钮与字数统计。"
            code={`import { TextField, TextareaField } from "m3eui";

<TextField
  label="工作邮箱"
  type="email"
  required
  clearable
  description="格式示例：architect@m3e.dev（失焦后触发格式校验）"
  value={email}
  onValueChange={setEmail}
/>

<TextField
  label="访问密钥"
  variant="filled"
  type="password"
  minLength={8}
  defaultValue="m3e-spring-2026"
/>

<TextareaField
  label="组件设计备注"
  maxLength={160}
  showCharacterCount
  value={bio}
  onValueChange={setBio}
/>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <TextField
                  label="工作邮箱 (Outlined · Clearable)"
                  type="email"
                  name="work_email"
                  autoComplete="email"
                  required
                  clearable
                  description="格式示例：architect@m3e.dev（清空或输入非法邮箱并失焦可观察 :user-invalid 校验态）"
                  errorMessage="请输入格式正确的邮箱地址，例如 architect@m3e.dev。"
                  value={emailInput}
                  onValueChange={setEmailInput}
                />

                <TextField
                  label="访问令牌密码 (Filled · 明文切换)"
                  variant="filled"
                  type="password"
                  name="api_secret"
                  autoComplete="current-password"
                  minLength={8}
                  defaultValue="m3e-expressive-2026"
                  description="至少 8 位字符，右侧内置 aria-pressed 明文预览切换按钮"
                  errorMessage="访问令牌密码长度不能少于 8 位字符。"
                />
              </div>

              <div className="demo-panel">
                <TextareaField
                  label="架构说明备注 (保留原生纵向拖拽缩放)"
                  name="design_note"
                  rows={4}
                  maxLength={160}
                  showCharacterCount
                  description="支持实时字数统计，字号保持 ≥16px 防止移动端聚焦自动缩放"
                  value={bioInput}
                  onValueChange={setBioInput}
                />
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="number-combobox"
            title="NumberField 数值步进器 & Combobox 搜索选择器"
            primitive="@base-ui/react/number-field · @base-ui/react/combobox"
            description="NumberField 采用 M3E 非对称半胶囊步进按钮（按压内缝圆角 8px → 4px 收缩 + Scrub 标签拖拽）；Combobox 支持实时关键词过滤与同心圆弹出层。"
            code={`import { NumberField, Combobox } from "m3eui";

<NumberField
  label="空间弹簧刚度 (Stiffness)"
  min={100}
  max={1200}
  step={20}
  value={stiffness}
  onValueChange={setStiffness}
/>

<Combobox
  label="快速检索 M3E 组件"
  options={COMPONENT_SEARCH_OPTIONS}
  value={selected}
  onValueChange={setSelected}
/>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">M3E 连接式半胶囊 NumberField（支持按住标签左右拖拽调节）</span>
                <div className="demo-row" style={{ gap: 20 }}>
                  <NumberField
                    label="弹簧刚度 Stiffness"
                    min={100}
                    max={1200}
                    step={20}
                    value={stiffnessVal}
                    onValueChange={setStiffnessVal}
                  />
                  <NumberField
                    label="阻尼比 Damping ζ"
                    min={0.2}
                    max={1.2}
                    step={0.05}
                    format={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }}
                    value={dampingVal}
                    onValueChange={setDampingVal}
                  />
                </div>
              </div>

              <div className="demo-panel">
                <Combobox
                  label="检索组件规范 (实时过滤 + 清空按钮)"
                  placeholder="输入 Slider / Avatar / Sheet…"
                  options={COMPONENT_SEARCH_OPTIONS}
                  value={selectedCombo}
                  onValueChange={setSelectedCombo}
                />
                <span className="demo-panel__label">
                  当前选中：{selectedCombo ? `${selectedCombo.label} (${selectedCombo.value})` : "未选择"}
                </span>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="switch"
            title="Switch 开关"
            primitive="@base-ui/react/switch"
            description="52×32px 胶囊轨道；滑块直径在未选中 16px、选中 24px、按压膨胀 28px 之间以空间弹簧平滑过渡，整行满足 ≥44px 触控热区。"
            code={`import { Switch } from "m3eui";

<Switch
  label="自适应无线网络"
  description="信号较弱时自动切换至低延迟频段"
  checked={wifiOn}
  onCheckedChange={setWifiOn}
/>
<Switch
  label="物理触感反馈"
  showIcons
  checked={hapticOn}
  onCheckedChange={setHapticOn}
/>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <Switch
                  label="自适应无线网络"
                  description="信号较弱时自动切换至低延迟频段"
                  checked={wifiOn}
                  onCheckedChange={setWifiOn}
                />
                <Switch
                  label="空间弹簧触感图标 (showIcons)"
                  description="滑块内置 ✓ / ✕ 状态符号，未选中直径 24px"
                  showIcons
                  checked={hapticOn}
                  onCheckedChange={setHapticOn}
                />
                <Switch
                  label="勿扰模式"
                  description="静音所有非紧急通知横幅"
                  checked={dndOn}
                  onCheckedChange={setDndOn}
                />
              </div>

              <div className="demo-panel" style={{ justifyContent: "center" }}>
                <span className="demo-panel__label">独立无标签用法 & 禁用态</span>
                <div className="demo-row" style={{ gap: 20 }}>
                  <Switch
                    aria-label="独立开关"
                    checked={wifiOn}
                    onCheckedChange={setWifiOn}
                  />
                  <Switch
                    aria-label="带图标独立开关"
                    showIcons
                    checked={hapticOn}
                    onCheckedChange={setHapticOn}
                  />
                  <Switch aria-label="禁用未选中" disabled />
                  <Switch aria-label="禁用已选中" defaultChecked disabled showIcons />
                </div>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="slider"
            title="Slider 滑块 (单值 / 区间 / 离散刻度)"
            primitive="@base-ui/react/slider"
            description="标志性 M3E 宽轨道 (16 / 24 / 40px) + 竖条手柄 (4px → 拖拽收窄至 2px) + 手柄两侧 6px 留白切口与弹簧数值气泡。"
            code={`import { Slider } from "m3eui";

{/* 标准连续滑块 */}
<Slider
  label="媒体音量"
  showValue
  value={volume}
  onValueChange={setVolume}
  formatValue={(v) => \`\${v}%\`}
/>

{/* 双手柄区间滑块 */}
<Slider
  size="md"
  label="预算区间"
  showValue
  value={priceRange}
  onValueChange={setPriceRange}
  formatValue={(v) => \`¥\${v}0\`}
/>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <Slider
                  size="sm"
                  label="媒体音量 (SM · 16px 轨道)"
                  showValue
                  value={volume}
                  onValueChange={setVolume}
                  formatValue={(v) => `${v}%`}
                />
                <Slider
                  size="md"
                  label="屏幕亮度 · 离散刻度 (MD · 24px 轨道)"
                  step={10}
                  showTicks
                  showValue
                  value={brightness}
                  onValueChange={setBrightness}
                  formatValue={(v) => `${v} nit`}
                />
              </div>

              <div className="demo-panel">
                <Slider
                  size="md"
                  label="双滑块价格区间 (Range Slider)"
                  min={0}
                  max={100}
                  minStepsBetweenValues={8}
                  showValue
                  value={priceRange}
                  onValueChange={setPriceRange}
                  formatValue={(v) => `¥${v * 10}`}
                />
                <Slider
                  size="lg"
                  label="高表现力巨型滑块 (LG · 40px 轨道)"
                  defaultValue={72}
                  showValue
                  formatValue={(v) => `${v} dB`}
                />
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="checkbox-radio"
            title="CheckboxGroup & RadioGroup"
            primitive="@base-ui/react/checkbox · @base-ui/react/radio-group"
            description="支持父级全选 / 半选 (indeterminate) 联动，以及单选圆点 0 → 1 空间弹簧缩放。"
            code={`import { Checkbox, CheckboxGroup, Radio, RadioGroup } from "m3eui";

<CheckboxGroup
  value={selectedPerms}
  allValues={["read", "write", "deploy"]}
  onValueChange={setSelectedPerms}
>
  <Checkbox parent label="授予全部仓库权限" />
  <Checkbox value="read" label="读取代码与分支" />
  <Checkbox value="write" label="推送提交与合并请求" />
  <Checkbox value="deploy" label="触发生产环境部署" />
</CheckboxGroup>

<RadioGroup value={channel} onValueChange={setChannel}>
  <Radio value="push" label="移动端即时推送" />
  <Radio value="email" label="每日邮件摘要" />
</RadioGroup>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">CheckboxGroup（含父级 Indeterminate 联动）</span>
                <CheckboxGroup
                  aria-label="仓库权限设置"
                  value={selectedPerms}
                  allValues={[...ALL_PERMS]}
                  onValueChange={setSelectedPerms}
                >
                  <Checkbox parent label="授予全部仓库权限" />
                  <div style={{ paddingInlineStart: 20, display: "flex", flexDirection: "column" }}>
                    <Checkbox
                      value="read"
                      label="读取代码与分支"
                      description="允许克隆与浏览提交历史"
                    />
                    <Checkbox
                      value="write"
                      label="推送提交与合并请求"
                      description="允许向受保护分支发起 PR"
                    />
                    <Checkbox
                      value="deploy"
                      label="触发生产环境部署"
                      description="高危操作需二次审批"
                    />
                  </div>
                </CheckboxGroup>
              </div>

              <div className="demo-panel">
                <span className="demo-panel__label">RadioGroup（方向键循环切换 + 弹簧圆点）</span>
                <RadioGroup
                  aria-label="通知投递渠道"
                  value={notifyChannel}
                  onValueChange={setNotifyChannel}
                >
                  <Radio
                    value="push"
                    label="移动端即时推送"
                    description="毫秒级实时送达在线设备"
                  />
                  <Radio
                    value="email"
                    label="每日邮件摘要"
                    description="每天 18:00 汇总发送一次"
                  />
                  <Radio
                    value="none"
                    label="仅在应用内展示"
                    description="不发送任何外部打扰提醒"
                  />
                </RadioGroup>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="select"
            title="Select 选择器 (Outlined & Filled)"
            primitive="@base-ui/react/select"
            description="遵循 M3E ExposedDropdownMenu 规范：统一 SurfaceContainer 浮层（16px 外圆角 - 6px 内边距 = 10px 同心圆选项），未选中项透明呼吸留白，选中项采用 12px 二级容器色圆角胶囊且与悬停态同色系平滑过渡。"
            code={`import { Select } from "m3eui";

<Select
  label="推理模型"
  variant="outlined"
  value={model}
  onValueChange={setModel}
  options={[
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", description: "深度推理与复杂编码" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", description: "低延迟高吞吐响应" },
  ]}
/>`}
          >
            <div className="demo-grid-2">
              <Select
                label="推理模型 (Outlined · 双行说明)"
                variant="outlined"
                value={modelId}
                onValueChange={setModelId}
                options={[
                  {
                    value: "gemini-2.5-pro",
                    label: "Gemini 2.5 Pro",
                    description: "适合复杂架构设计与推理",
                  },
                  {
                    value: "gemini-2.5-flash",
                    label: "Gemini 2.5 Flash",
                    description: "平衡响应速度与多模态能力",
                  },
                  {
                    value: "gemini-2.5-lite",
                    label: "Gemini 2.5 Flash-Lite",
                    description: "极低成本实时批处理",
                  },
                ]}
              />

              <Select
                label="部署可用区 (Filled · 平底激活指示线)"
                variant="filled"
                value={regionId}
                onValueChange={setRegionId}
                options={[
                  { value: "tokyo", label: "亚太东北 (东京)" },
                  { value: "singapore", label: "亚太东南 (新加坡)" },
                  { value: "frankfurt", label: "欧洲中部 (法兰克福)" },
                  { value: "oregon", label: "北美西部 (俄勒冈)" },
                ]}
              />
            </div>
          </ShowcaseCard>
        </div>

        {/* ===============================================================
            4. 数据展示与容器 (Data Display & Containers)
            =============================================================== */}
        <div className="docs-category">
          <DocsCategoryHeader
            indexLabel="04"
            title="数据展示与容器 (Data Display & Containers)"
            countLabel="6 组规范"
            subtitle="零和焦点轮播、圆角弹簧标签族、支持 35 种官方 M3E 多边形矢量裁剪的头像与徽标、三态卡片容器与分段手风琴。"
          />

          <ShowcaseCard
            id="carousel"
            title="Carousel 焦点形变轮播 (Multi-Browse & Centered Hero)"
            primitive="m3eui/tokens · resolveCarouselLayout"
            description="复刻 AOSP Carousel.kt 零和容器宽度守恒算法：主焦点卡片扩张至 28px 大圆角，次级与窥视卡片平滑压缩为 20px / 16px，整行总宽度恒定零抖动。"
            code={`import { Carousel } from "m3eui";

<Carousel
  aria-label="M3E 核心视觉特性"
  variant="multi-browse"
  items={CAROUSEL_DEMO_ITEMS}
/>`}
          >
            <div className="demo-row" style={{ marginBottom: 8 }}>
              <Button
                size="xs"
                variant={carouselVariant === "multi-browse" ? "filled" : "outlined"}
                onClick={() => setCarouselVariant("multi-browse")}
              >
                Multi-Browse 多级浏览模式
              </Button>
              <Button
                size="xs"
                variant={carouselVariant === "hero" ? "filled" : "outlined"}
                onClick={() => setCarouselVariant("hero")}
              >
                Centered Hero 聚光灯模式
              </Button>
            </div>

            <Carousel
              aria-label="M3E 核心特性焦点轮播"
              variant={carouselVariant}
              items={CAROUSEL_DEMO_ITEMS}
              height={224}
            />
          </ShowcaseCard>

          <ShowcaseCard
            id="chips"
            title="Chip 标签族 (AssistChip / FilterChip / InputChip)"
            primitive="@base-ui/react/button · @base-ui/react/toggle"
            description="FilterChip 静息态 8px 圆角，选中时以空间弹簧形变为 16px 胶囊并浮现勾选符（按压收缩至 4px）；InputChip 内置头像槽位与无障碍移除按钮。"
            code={`import { AssistChip, FilterChip, InputChip, Avatar } from "m3eui";

<AssistChip icon={<SparkleIcon />}>生成设计令牌</AssistChip>
<FilterChip selected={selected} onSelectedChange={setSelected}>
  空间物理弹簧
</FilterChip>
<InputChip
  avatar={<Avatar size="xs" shape="cookie9Sided" fallback="T" />}
  onRemove={() => removeTag("m3eui/tokens")}
>
  m3eui/tokens
</InputChip>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">FilterChip（点击观察 8px → 16px 胶囊弹簧形变）& AssistChip</span>
                <div className="demo-row">
                  {[
                    { id: "spring", label: "空间物理弹簧" },
                    { id: "hct", label: "HCT 动态色阶" },
                    { id: "a11y", label: "Base UI 无障碍" },
                    { id: "shapes", label: "35 种多边形" },
                  ].map((chip) => {
                    const isSel = selectedFilters.includes(chip.id);
                    return (
                      <FilterChip
                        key={chip.id}
                        selected={isSel}
                        onSelectedChange={(next) =>
                          setSelectedFilters((prev) =>
                            next
                              ? [...prev, chip.id]
                              : prev.filter((item) => item !== chip.id),
                          )
                        }
                      >
                        {chip.label}
                      </FilterChip>
                    );
                  })}
                </div>
                <div className="demo-row">
                  <AssistChip
                    icon={<SparkleIcon />}
                    onClick={() => toast({ title: "已执行智能主题配色建议" })}
                  >
                    AI 配色建议
                  </AssistChip>
                  <AssistChip
                    elevated
                    icon={<SendIcon />}
                    onClick={() => toast({ title: "已复制当前设计令牌 JSON" })}
                  >
                    Elevated 导出令牌
                  </AssistChip>
                </div>
              </div>

              <div className="demo-panel">
                <span className="demo-panel__label">InputChip（带多边形微缩头像与移除交互）</span>
                <div className="demo-row">
                  {inputTags.map((tag, i) => (
                    <InputChip
                      key={tag}
                      avatar={
                        <Avatar
                          size="xs"
                          shape={i % 2 === 0 ? "cookie9Sided" : "clover4Leaf"}
                          fallback={tag.replace("@", "")[0]?.toUpperCase() ?? "M"}
                        />
                      }
                      removeLabel={`移除 ${tag}`}
                      onRemove={() =>
                        setInputTags((prev) => prev.filter((t) => t !== tag))
                      }
                    >
                      {tag}
                    </InputChip>
                  ))}
                  {inputTags.length < 3 ? (
                    <Button
                      size="xs"
                      variant="text"
                      onClick={() =>
                        setInputTags(["m3eui/tokens", "m3eui", "@base-ui/react"])
                      }
                    >
                      恢复默认标签
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="avatar-badge"
            title="Avatar 多边形裁剪头像 & Badge 计数徽标"
            primitive="@base-ui/react/avatar · MaterialShapes SVG ClipPath"
            description="Avatar 除 circle / square 外，可直接传入任意 35 种官方 MaterialShapes（如 cookie9Sided、clover4Leaf、sunny、arch）实现高表现力裁剪。"
            code={`import { Avatar, Badge, IconButton } from "m3eui";

<Avatar size="lg" shape="cookie9Sided" fallback="M3" />
<Avatar size="lg" shape="clover4Leaf" fallback="UI" />
<Avatar size="lg" shape="sunny" fallback="EX" />

<Badge count={unreadCount}>
  <IconButton aria-label="未读通知" variant="tonal" icon={<BellIcon />} />
</Badge>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">M3E 官方多边形矢量裁剪头像 (circle / cookie9Sided / clover4Leaf / sunny / arch / gem)</span>
                <div className="demo-row" style={{ gap: 14 }}>
                  {(
                    [
                      ["circle", "C"],
                      ["square", "SQ"],
                      ["cookie9Sided", "9S"],
                      ["clover4Leaf", "4L"],
                      ["sunny", "SN"],
                      ["arch", "AR"],
                      ["gem", "GM"],
                    ] as const
                  ).map(([shapeName, initials]) => (
                    <Tooltip key={shapeName} content={`shape="${shapeName}"`}>
                      <span>
                        <Avatar size="lg" shape={shapeName} fallback={initials} />
                      </span>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="demo-panel">
                <span className="demo-panel__label">Badge 徽标（支持圆点、数字封顶 99+ 与多种语义色）</span>
                <div className="demo-row" style={{ gap: 20 }}>
                  <Badge count={unreadCount}>
                    <IconButton
                      aria-label="消息通知"
                      variant="tonal"
                      icon={<BellIcon />}
                      onClick={() => setUnreadCount((c) => c + 1)}
                    />
                  </Badge>
                  <Badge count={128} color="primary">
                    <Avatar size="md" shape="cookie9Sided" fallback="PR" />
                  </Badge>
                  <Badge dot>
                    <Avatar size="md" shape="clover4Leaf" fallback="ON" />
                  </Badge>
                  <Button
                    size="xs"
                    variant="outlined"
                    onClick={() => setUnreadCount((c) => c + 5)}
                  >
                    +5 未读
                  </Button>
                  <Button
                    size="xs"
                    variant="text"
                    onClick={() => setUnreadCount(0)}
                  >
                    清零
                  </Button>
                </div>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="cards"
            title="Card 卡片容器 (Elevated / Filled / Outlined & Interactive)"
            primitive="@base-ui/react/button · M3E Surface Roles"
            description="提供三种 M3E 标准容器层级；开启 interactive 后卡片获得完整键盘焦点与 16px → 悬停 20px → 按压 12px 空间弹簧圆角。"
            code={`import { Card, Button } from "m3eui";

<Card
  variant="filled"
  interactive
  title="交互式弹性卡片"
  subtitle="悬停圆角扩张至 20px，按压收紧至 12px"
  onClick={() => toast({ title: "已打开卡片详情" })}
>
  点击或按压体验 M3E 卡片容器的实时空间圆角反馈。
</Card>`}
          >
            <div className="demo-grid-3">
              <Card
                variant="elevated"
                title="Elevated 浮起卡片"
                subtitle="Surface Container Low + 柔和双层阴影"
                actions={
                  <Button
                    size="xs"
                    variant="tonal"
                    onClick={() => toast({ title: "已查看双轨物理文档" })}
                  >
                    查看详情
                  </Button>
                }
              >
                适合在浅色画布上承载独立模块摘要与关键指标概览。
              </Card>

              <Card
                variant="outlined"
                title="Outlined 描边卡片"
                subtitle="Surface Container Lowest + Outline Variant"
                actions={
                  <Button
                    size="xs"
                    variant="outlined"
                    onClick={() => toast({ title: "已固定至仪表盘" })}
                  >
                    固定面板
                  </Button>
                }
              >
                信息边界清晰克制，适合高密度后台设置页与并列对比视图。
              </Card>

              <Card
                variant="filled"
                interactive
                title="Filled 交互式弹簧卡片 ✦"
                subtitle="点击或按住观察 16 → 20 → 12px 圆角形变"
                onClick={() =>
                  toast({
                    title: "触发交互式 Card 点击事件",
                    description: "支持回车 / 空格键无障碍触发",
                  })
                }
              >
                开启 <code>interactive</code> 后由 Base UI Button 驱动，自带键盘可访问性与按压物理形变。
              </Card>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="accordion"
            title="Accordion 分段脱出式手风琴"
            primitive="@base-ui/react/accordion"
            description="折叠时保持 2px 紧凑分段堆栈；展开项自动独立脱出为四角 16px 并撑开上下间距，相邻折叠项接缝同步圆化为 16px。"
            code={`import { Accordion } from "m3eui";

<Accordion
  defaultValue={["physics"]}
  items={[
    {
      value: "physics",
      title: "为什么 M3E 严格区分空间弹簧与效果弹簧？",
      subtitle: "Spatial vs Effects Dual-Track Motion",
      content: "位移、尺寸与圆角允许欠阻尼回弹；颜色与不透明度使用临界阻尼杜绝过冲闪烁。",
    },
    { value: "topology", title: "相邻分段圆角如何联动？", content: "..." },
  ]}
/>`}
          >
            <Accordion
              aria-label="M3E 架构常见问题"
              defaultValue={["physics"]}
              items={[
                {
                  value: "physics",
                  leading: <SparkleIcon />,
                  title: "为什么 M3E 严格区分空间弹簧 (Spatial) 与效果弹簧 (Effects)？",
                  subtitle: "双轨物理系统核心准则",
                  content:
                    "空间属性（位置、尺寸、圆角拓扑）使用 ζ < 1 的欠阻尼弹簧，赋予界面真实物理弹性；而颜色、阴影与透明度必须使用 ζ = 1 的临界阻尼弹簧，防止过冲导致色彩溢出或背景频闪。",
                },
                {
                  value: "topology",
                  leading: <HeartIcon />,
                  title: "展开手风琴子项时，上下相邻卡片的圆角发生了什么变化？",
                  subtitle: "resolveAccordionItemCorners 邻项联动拓扑",
                  content:
                    "当中间某一项展开时，不仅自身四角变为 [16, 16, 16, 16] 并增加纵向呼吸间距，它上方的卡片底角会自动变为 [..., 16, 16]，下方的卡片顶角自动变为 [16, 16, ...]，避免裸露生硬的 4px 内缝直角。",
                },
                {
                  value: "baseui",
                  leading: <BellIcon />,
                  title: "为什么默认开启非互斥多开 (multiple = true) 与 hiddenUntilFound？",
                  subtitle: "遵循现代 Web 可用性与页内搜索规范",
                  content:
                    "允许用户同时展开多个章节以便上下对照阅读，避免互斥折叠造成视口跳动；同时支持浏览器 Ctrl/Cmd+F 页内检索直接命中并自动展开隐藏面板。",
                },
              ]}
            />
          </ShowcaseCard>

          <ShowcaseCard
            id="preview-scroll-divider"
            title="PreviewCard, ScrollArea & Divider 容器辅助原语"
            primitive="@base-ui/react/preview-card · scroll-area · separator"
            description="悬停触发的 24px 富资料预览卡、带胶囊自适应滚动条的可控滚动视口，以及支持水平/垂直与居中副标题的语义化分割线。"
            code={`import { PreviewCard, ScrollArea, Divider } from "m3eui";

<PreviewCard trigger={<a href="#shapes">m3eui/tokens</a>}>
  <div>纯数学 M3E 物理弹簧、HCT 色阶与 35 种归一化矢量多边形引擎</div>
</PreviewCard>

<Divider label="最近变更日志" />
<ScrollArea maxHeight={160}>...</ScrollArea>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                  将鼠标悬停在链接{" "}
                  <PreviewCard
                    trigger={
                      <a
                        href="#shapes"
                        style={{
                          color: "var(--m3e-color-primary)",
                          fontWeight: 700,
                          textDecoration: "underline",
                          textUnderlineOffset: "3px",
                        }}
                      >
                        m3eui/tokens 设计物理引擎
                      </a>
                    }
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar size="sm" shape="sunny" fallback="TK" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>m3eui/tokens v0.1.0</div>
                          <div style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
                            零 DOM 纯数学几何与物理契约层
                          </div>
                        </div>
                      </div>
                      <Divider />
                      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--m3e-color-on-surface-variant)" }}>
                        内置 HCT 色彩空间生成、双轨谐振子弹簧求解器、按钮组与轮播零和宽度守恒公式及 35 种归一化闭合多边形。
                      </div>
                    </div>
                  </PreviewCard>{" "}
                  上即可唤出 24px 高表面悬浮资料卡。
                </div>

                <Divider label="带副标题语义分割线 (Separator)" />

                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
                  <span>Spatial Spring</span>
                  <Divider orientation="vertical" />
                  <span>Effects Spring</span>
                  <Divider orientation="vertical" />
                  <span>HCT Surface</span>
                </div>
              </div>

              <ScrollArea maxHeight={156}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ fontWeight: 700 }}>ScrollArea 胶囊滚动视口（悬停右侧查看自定义滑块）</div>
                  <div>1. `ButtonGroup` — 15% 按压膨胀与零和邻项宽度守恒</div>
                  <div>2. `SegmentedList` — 单条 [16,16,16,16] 与多条首尾圆角拓扑</div>
                  <div>3. `Select & Combobox` — 同心圆单层 SurfaceContainer 浮层</div>
                  <div>4. `Slider` — 宽轨切口 + 全局 pointerup 手柄即时回弹</div>
                  <div>5. `Carousel` — Multi-Browse / Hero 连续焦点圆角形变</div>
                  <div>6. `OTPField` — Base UI 1.9 验证码聚焦格独立脱出</div>
                  <div>7. `Progress & Meter` — 4px 标志性轨道裂隙与阈值计量</div>
                </div>
              </ScrollArea>
            </div>
          </ShowcaseCard>
        </div>

        {/* ===============================================================
            5. 导航与列表
            =============================================================== */}
        <div className="docs-category">
          <DocsCategoryHeader
            indexLabel="05"
            title="导航与列表 (Navigation & Lists)"
            countLabel="4 组规范"
            subtitle="弹性双行折叠顶部应用栏、带 56×32px 空间弹簧胶囊指示器的底栏/侧边导航轨、横向滚动标签页与分段列表。"
          />

          <ShowcaseCard
            id="top-app-bar"
            title="TopAppBar 弹性折叠顶部应用栏 (Flexible Two-Row)"
            primitive="@base-ui/react/toolbar · resolveTopAppBarGeometry"
            description="对齐 AOSP M3E 1.5 MediumFlexible / LargeFlexible 规范：支持双行主副标题随滚动比例（0% → 100%）平滑收缩高度与字号，并自动切换 SurfaceContainer 抬升色阶。"
            code={`import { TopAppBar, IconButton } from "m3eui";

<TopAppBar
  variant="large-flexible"
  title="设计系统审计工作台"
  subtitle="45 个 Web 原语已同步至最新 Expressive 色盘"
  collapsedFraction={scrollRatio}
  navigationIcon={<IconButton variant="standard" icon={<SparkleIcon />} aria-label="导航" />}
/>`}
          >
            <div className="demo-row" style={{ marginBottom: 10 }}>
              {(
                [
                  ["large-flexible", "Large Flexible (148→64px)"],
                  ["medium-flexible", "Medium Flexible (112→64px)"],
                  ["center-aligned", "Center Aligned (64px)"],
                ] as const
              ).map(([v, label]) => (
                <Button
                  key={v}
                  size="xs"
                  variant={appBarVariant === v ? "filled" : "outlined"}
                  onClick={() => setAppBarVariant(v)}
                >
                  {label}
                </Button>
              ))}
            </div>

            <div
              style={{
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid var(--m3e-color-outline-variant)",
              }}
            >
              <TopAppBar
                variant={appBarVariant}
                collapsedFraction={appBarCollapse / 100}
                title="Material 3 Expressive 工作台"
                subtitle="向下滚动时双行标题平滑收拢为紧凑单行顶栏，并点亮容器底色"
                navigationIcon={
                  <IconButton
                    size="sm"
                    variant="standard"
                    icon={<SparkleIcon />}
                    aria-label="主菜单"
                  />
                }
                actions={
                  <>
                    <IconButton
                      size="sm"
                      variant="standard"
                      icon={<BellIcon />}
                      aria-label="通知中心"
                    />
                    <IconButton
                      size="sm"
                      variant="tonal"
                      icon={<SendIcon />}
                      aria-label="发布构建"
                    />
                  </>
                }
              />
            </div>

            <Slider
              size="sm"
              label="拖动模拟页面滚动折叠比例 (collapsedFraction)"
              min={0}
              max={100}
              showValue
              value={appBarCollapse}
              onValueChange={setAppBarCollapse}
              formatValue={(v) => `${v}%`}
            />
          </ShowcaseCard>

          <ShowcaseCard
            id="navigation"
            title="NavigationBar & NavigationRail 响应式导航栏/导航轨"
            primitive="m3eui/Navigation · Badge"
            description="激活态药丸指示器（56×32px）以横向空间弹簧（0.35 → 1.0）平滑舒展，原生集成未读计数与圆点徽标。"
            code={`import { NavigationBar, NavigationRail } from "m3eui";

<NavigationBar
  value={dest}
  onValueChange={setDest}
  items={[
    { value: "explore", label: "探索", icon: <SparkleIcon /> },
    { value: "alerts", label: "通知", icon: <BellIcon />, badgeCount: 6 },
    { value: "saved", label: "收藏", icon: <HeartIcon />, badgeDot: true },
  ]}
/>`}
          >
            <div className="demo-row" style={{ alignItems: "stretch", gap: 24 }}>
              <NavigationRail
                value={navDest}
                onValueChange={setNavDest}
                header={
                  <IconButton
                    aria-label="快速新建"
                    variant="filled"
                    size="sm"
                    icon={<SparkleIcon />}
                    onClick={() => toast({ title: "从 NavigationRail 发起快速新建" })}
                  />
                }
                items={[
                  { value: "explore", label: "探索", icon: <SparkleIcon /> },
                  {
                    value: "alerts",
                    label: "动态",
                    icon: <BellIcon />,
                    badgeCount: unreadCount,
                  },
                  {
                    value: "saved",
                    label: "收藏",
                    icon: <HeartIcon />,
                    activeIcon: <HeartIcon filled />,
                    badgeDot: true,
                  },
                  { value: "outbox", label: "投递", icon: <SendIcon /> },
                ]}
              />

              <div
                className="demo-panel"
                style={{ flex: "1 1 320px", justifyContent: "space-between" }}
              >
                <span className="demo-panel__label">
                  移动端 / 紧凑视口底部 NavigationBar（与左侧 NavigationRail 共享状态：<code>{navDest}</code>）
                </span>
                <div
                  style={{
                    padding: "16px",
                    borderRadius: 14,
                    backgroundColor: "var(--m3e-color-surface-container-lowest)",
                    border: "1px solid var(--m3e-color-outline-variant)",
                    fontSize: 13.5,
                    color: "var(--m3e-color-on-surface-variant)",
                  }}
                >
                  切换底部或左侧导航项，观察 56×32px 二级容器色胶囊的横向空间弹簧展开动画与 <code>aria-current="page"</code> 状态同步。
                </div>
                <NavigationBar
                  value={navDest}
                  onValueChange={setNavDest}
                  items={[
                    { value: "explore", label: "探索", icon: <SparkleIcon /> },
                    {
                      value: "alerts",
                      label: "动态",
                      icon: <BellIcon />,
                      badgeCount: unreadCount,
                    },
                    {
                      value: "saved",
                      label: "收藏",
                      icon: <HeartIcon />,
                      activeIcon: <HeartIcon filled />,
                      badgeDot: true,
                    },
                    { value: "outbox", label: "投递", icon: <SendIcon /> },
                  ]}
                />
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="tabs"
            title="Tabs 标签页 (Primary & Secondary)"
            primitive="@base-ui/react/tabs"
            description="单行不换行横向滚动、选中态不改变字重/内边距以杜绝抖动，指示条使用 border 绘制兼容高对比度模式。"
            code={`import { Tabs, TabsList, Tab, TabsPanel } from "m3eui";

<Tabs variant="primary" value={tab} onValueChange={setTab}>
  <TabsList aria-label="项目视图">
    <Tab value="overview" icon={<SparkleIcon />}>概览</Tab>
    <Tab value="activity" icon={<BellIcon />} badge={3}>动态</Tab>
    <Tab value="messages" icon={<SendIcon />}>消息</Tab>
  </TabsList>
  <TabsPanel value="overview">概览面板内容</TabsPanel>
</Tabs>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">Primary Tabs（顶部圆角胶囊短划线指示器）</span>
                <Tabs
                  variant="primary"
                  value={primaryTab}
                  onValueChange={setPrimaryTab}
                >
                  <TabsList aria-label="主导航标签">
                    <Tab value="overview" icon={<SparkleIcon />}>
                      概览
                    </Tab>
                    <Tab value="alerts" icon={<BellIcon />} badge={3}>
                      通知
                    </Tab>
                    <Tab value="favorites" icon={<HeartIcon />}>
                      收藏夹
                    </Tab>
                  </TabsList>
                  <TabsPanel value="overview">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      Primary 变体指示条内缩 16px 并以 3px 顶部圆角呈现，切换时平滑跟随 <code>--active-tab-left</code>。
                    </div>
                  </TabsPanel>
                  <TabsPanel value="alerts">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      当前共有 3 条未读构建通知等待确认。
                    </div>
                  </TabsPanel>
                  <TabsPanel value="favorites">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      已置顶常用主题配置与组件预设。
                    </div>
                  </TabsPanel>
                </Tabs>
              </div>

              <div className="demo-panel">
                <span className="demo-panel__label">Secondary Tabs（等宽 2px 底部指示线，适合容器内二级切换）</span>
                <Tabs
                  variant="secondary"
                  value={secondaryTab}
                  onValueChange={setSecondaryTab}
                >
                  <TabsList aria-label="二级规格标签">
                    <Tab value="tokens">设计令牌</Tab>
                    <Tab value="a11y">无障碍键盘</Tab>
                    <Tab value="motion">物理曲线</Tab>
                  </TabsList>
                  <TabsPanel value="tokens">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      全部颜色、圆角与弹簧常量均来自类型安全的 <code>m3eui/tokens</code>。
                    </div>
                  </TabsPanel>
                  <TabsPanel value="a11y">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      支持 Home / End / 左右方向键导航与自动焦点激活。
                    </div>
                  </TabsPanel>
                  <TabsPanel value="motion">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      指示条位移采用空间弹簧，背景高亮采用临界阻尼零过冲过渡。
                    </div>
                  </TabsPanel>
                </Tabs>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="segmented-list"
            title="SegmentedList 分段列表"
            primitive="m3eui/SegmentedList"
            description="单条自动四角 16px；多条首项 [16,16,4,4]、中项 [4,4,4,4]、末项 [4,4,16,16]，2px 间距，选中或按压独立脱出为 [16,16,16,16]。"
            code={`import { SegmentedList, SegmentedListItem } from "m3eui";

<SegmentedList aria-label="构建流水线">
  <SegmentedListItem headline="类型检查与单元测试" supportingText="15/15 通过" trailing="43ms" />
  <SegmentedListItem selected headline="构建 m3eui 产物" supportingText="ESM + d.ts" trailing="进行中" />
  <SegmentedListItem headline="部署文档预览站点" supportingText="Cloud CDN" trailing="排队中" />
</SegmentedList>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">多条分组 (count = 3 · 2px 缝隙，悬停保持 4px 内缝不破相)</span>
                <SegmentedList aria-label="工作区流水线">
                  {[
                    {
                      title: "设计令牌校验 (m3eui/tokens)",
                      desc: "HCT 色彩与物理弹簧单元测试",
                      meta: "通过",
                    },
                    {
                      title: "无头组件编译 (m3eui)",
                      desc: "Base UI 1.x 原语与语义 CSS 绑定",
                      meta: "当前项",
                    },
                    {
                      title: "浏览器交互回归测试",
                      desc: "焦点环、键盘导航与零控制台报错",
                      meta: "就绪",
                    },
                  ].map((row, idx) => (
                    <SegmentedListItem
                      key={row.title}
                      lines={2}
                      selected={selectedListItem === idx}
                      onClick={() => setSelectedListItem(idx)}
                      leading={<SparkleIcon />}
                      headline={row.title}
                      supportingText={row.desc}
                      trailing={row.meta}
                    />
                  ))}
                </SegmentedList>
              </div>

              <div className="demo-panel">
                <span className="demo-panel__label">独立单条 (count = 1 · 自动四角全圆 16px)</span>
                <SegmentedList aria-label="独立设置项">
                  <SegmentedListItem
                    lines={2}
                    selected={singleListSelected}
                    onClick={() => setSingleListSelected((v) => !v)}
                    leading={<BellIcon />}
                    headline="发布版本变更订阅"
                    supportingText="点击切换选中态，观察单条列表始终维持 [16, 16, 16, 16] 圆角"
                    trailing={singleListSelected ? "已开启" : "未开启"}
                  />
                </SegmentedList>
              </div>
            </div>
          </ShowcaseCard>
        </div>

        {/* ===============================================================
            6. 浮层、反馈与图形
            =============================================================== */}
        <div className="docs-category">
          <DocsCategoryHeader
            indexLabel="06"
            title="浮层、反馈与多边形图形 (Overlays & Feedback)"
            countLabel="7 组规范"
            subtitle="手势抽屉面板、同心圆菜单/右键菜单、模态对话框、轻/富文本提示、全局 Snackbar 队列，以及 AOSP 35 种归一化多边形形变与波浪进度条。"
          />

          <ShowcaseCard
            id="sheets"
            title="BottomSheet & SideSheet 手势抽屉面板"
            primitive="@base-ui/react/drawer"
            description="28px 内侧圆角、底部抽屉自带 32×4px 拖拽手柄，基于 --drawer-swipe-movement-x/y 支持丝滑跟手拖拽关闭与临界阻尼遮罩。"
            code={`import { BottomSheet, SideSheet, SheetClose, Button } from "m3eui";

<BottomSheet
  trigger={<Button variant="filled">打开 BottomSheet</Button>}
  title="快速分享与导出选项"
  description="向下拖拽面板或按 Esc 键即可关闭"
  footer={<SheetClose render={<Button variant="tonal">完成</Button>} />}
>
  ...
</BottomSheet>

<SideSheet
  side="right"
  trigger={<Button variant="tonal">打开右侧 SideSheet</Button>}
  title="令牌实时检查器"
>
  ...
</SideSheet>`}
          >
            <div className="demo-row">
              <BottomSheet
                trigger={<Button variant="filled">打开 BottomSheet (底部抽屉)</Button>}
                title="快速导出 M3E 主题令牌"
                description="顶部 28px 圆角 + 32×4px 拖拽胶囊手柄，支持指针/触控向下拖拽关闭。"
                footer={
                  <>
                    <SheetClose render={<Button variant="text">取消</Button>} />
                    <SheetClose
                      render={
                        <Button
                          variant="filled"
                          onClick={() =>
                            toast({ title: "已复制 CSS Custom Properties 主题快照" })
                          }
                        >
                          复制 CSS 变量
                        </Button>
                      }
                    />
                  </>
                }
              >
                <div className="demo-row">
                  <FilterChip defaultSelected>包含浅/深色 light-dark()</FilterChip>
                  <FilterChip defaultSelected>包含双轨弹簧时长变量</FilterChip>
                  <FilterChip>压缩单行输出</FilterChip>
                </div>
              </BottomSheet>

              <SideSheet
                side="right"
                trigger={<Button variant="tonal">打开右侧 SideSheet</Button>}
                title="组件设计检查器 (SideSheet)"
                description="右侧抽屉左侧上下角均为 28px，支持向右滑动手势收起。"
                footer={
                  <SheetClose render={<Button variant="filled">应用更改</Button>} />
                }
              >
                <Switch
                  label="实时同步 HCT 色相旋转"
                  description="Expressive 变体自动为三级色注入高表现力色相偏移"
                  defaultChecked
                />
                <Slider
                  size="sm"
                  label="抽屉内嵌连续滑块预览"
                  defaultValue={70}
                  showValue
                />
              </SideSheet>

              <SideSheet
                side="left"
                trigger={<Button variant="outlined">打开左侧导航抽屉</Button>}
                title="工作区导航抽屉"
                description="side='left' 模式右侧上下角自动应用 28px 圆角。"
              >
                <SegmentedList aria-label="抽屉快捷入口">
                  <SegmentedListItem headline="设计系统总览" trailing="⌘1" />
                  <SegmentedListItem selected headline="Base UI 组件矩阵" trailing="⌘2" />
                  <SegmentedListItem headline="物理弹簧实验室" trailing="⌘3" />
                </SegmentedList>
              </SideSheet>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="popover-menu"
            title="Popover 气泡卡片、DropdownMenu & ContextMenu 右键菜单"
            primitive="@base-ui/react/popover · @base-ui/react/menu · @base-ui/react/context-menu"
            description="DropdownMenu 与 ContextMenu 共享 M3E 同心圆分段拓扑（外框 16px、首尾 12px、内缝 4px、悬停独立变圆为 12px，危险操作高亮为 Error Container）。"
            code={`import { Popover, DropdownMenu, ContextMenu, Button } from "m3eui";

<Popover
  trigger={<Button variant="tonal">物理参数微调</Button>}
  title="空间弹簧速查"
>
  ...
</Popover>

<DropdownMenu
  trigger={<Button variant="outlined">更多操作 ▾</Button>}
  items={[
    { id: "copy", label: "复制组件引用", shortcut: "⌘C" },
    { id: "delete", label: "移除预设", danger: true, separatorBefore: true },
  ]}
/>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">Popover 非模态浮层 & DropdownMenu 同心圆菜单</span>
                <div className="demo-row">
                  <Popover
                    trigger={<Button variant="tonal">打开 Popover 浮层</Button>}
                    title="HCT 表面色阶提示"
                    description="M3E 废弃传统阴影叠加，改用 Surface Container 五级明度表达深度。"
                  >
                    <div className="demo-row" style={{ justifyContent: "flex-end" }}>
                      <PopoverClose render={<Button size="xs" variant="filled">知道了</Button>} />
                    </div>
                  </Popover>

                  <DropdownMenu
                    trigger={<Button variant="outlined">组件更多操作 ▾</Button>}
                    items={[
                      {
                        id: "tsx",
                        label: "复制 TSX 示例代码",
                        icon: <SparkleIcon />,
                        shortcut: "⌘C",
                        onSelect: () => toast({ title: "已复制 TSX 代码片段" }),
                      },
                      {
                        id: "share",
                        label: "生成预览分享链接",
                        icon: <SendIcon />,
                        shortcut: "⇧⌘L",
                        onSelect: () => toast({ title: "分享链接已生成" }),
                      },
                      {
                        id: "reset",
                        label: "删除自定义快照",
                        icon: <TrashIcon />,
                        danger: true,
                        separatorBefore: true,
                        onSelect: () => toast({ title: "已删除自定义快照" }),
                      },
                    ]}
                  />
                </div>
              </div>

              <ContextMenu
                items={[
                  {
                    id: "inspect",
                    label: "切换几何圆角标尺",
                    icon: <SparkleIcon />,
                    shortcut: "⌥D",
                    onSelect: () => toast({ title: "右键菜单：已执行检查动作" }),
                  },
                  {
                    id: "duplicate",
                    label: "克隆当前画布节点",
                    icon: <SendIcon />,
                    shortcut: "⌘D",
                    onSelect: () => toast({ title: "右键菜单：已克隆节点" }),
                  },
                  {
                    id: "remove",
                    label: "清空选中图层",
                    icon: <TrashIcon />,
                    danger: true,
                    separatorBefore: true,
                    onSelect: () => toast({ title: "右键菜单：已清空选中图层" }),
                  },
                ]}
              >
                <div className="context-canvas">
                  <strong style={{ color: "var(--m3e-color-on-surface)" }}>
                    在此区域点击鼠标右键（ContextMenu）
                  </strong>
                  <span>体验 M3E 同心圆分段右键菜单与键盘方向键高亮</span>
                </div>
              </ContextMenu>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="dialog"
            title="Dialog & AlertDialog 模态对话框"
            primitive="@base-ui/react/dialog · @base-ui/react/alert-dialog"
            description="28px ExtraLarge 容器圆角、overscroll-behavior: contain 防穿透；遮罩采用临界阻尼纯透明度过渡，弹窗采用空间弹簧缩放。"
            code={`import { Dialog, DialogClose, AlertDialog, AlertDialogClose, Button } from "m3eui";

<Dialog
  trigger={<Button variant="filled">配置主题预设</Button>}
  icon={<SparkleIcon />}
  title="保存当前主题配置"
  description="将当前 HCT 种子色与弹簧方案导出为项目默认预设。"
  actions={
    <>
      <DialogClose render={<Button variant="text">取消</Button>} />
      <DialogClose render={<Button variant="filled">确认保存</Button>} />
    </>
  }
/>`}
          >
            <div className="demo-row">
              <Dialog
                trigger={<Button variant="filled">打开标准 Dialog</Button>}
                icon={<SparkleIcon />}
                title="导出 M3E 主题预设"
                description="导出后团队成员可直接复用同一套种子色、调色板变体与双轨物理弹簧参数。"
                actions={
                  <>
                    <DialogClose render={<Button variant="text">取消</Button>} />
                    <DialogClose
                      render={
                        <Button
                          variant="filled"
                          onClick={() =>
                            toast({
                              title: "主题预设已导出",
                              description: `Seed ${seedHex} · ${schemeVariant}`,
                            })
                          }
                        >
                          确认导出
                        </Button>
                      }
                    />
                  </>
                }
              >
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: 12,
                    backgroundColor: "var(--m3e-color-surface-container)",
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 12.5,
                  }}
                >
                  {`{ seedHex: "${seedHex}", variant: "${schemeVariant}" }`}
                </div>
              </Dialog>

              <AlertDialog
                trigger={<Button variant="tonal">打开危险确认 AlertDialog</Button>}
                icon={<TrashIcon />}
                title="确认重置本地主题缓存？"
                description="此操作将清除浏览器保存的明暗模式偏好并恢复默认紫罗兰种子色。"
                actions={
                  <>
                    <AlertDialogClose render={<Button variant="text">保留当前设置</Button>} />
                    <AlertDialogClose
                      render={
                        <Button
                          variant="filled"
                          onClick={() =>
                            toast({
                              title: "已重置缓存",
                              actionLabel: "撤销",
                              onAction: () => {},
                            })
                          }
                        >
                          确认重置
                        </Button>
                      }
                    />
                  </>
                }
              />
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="tooltip-toast"
            title="Tooltip / RichTooltip & Toast (Snackbar)"
            primitive="@base-ui/react/tooltip · @base-ui/react/toast"
            description="M3EProvider 内置全局 Tooltip.Provider 与 Toast 队列宿主，任意子组件调用 useM3EToast() 即可弹出带撤销动作的 Snackbar。"
            code={`import { Tooltip, RichTooltip, Button, useM3EToast } from "m3eui";

const { toast } = useM3EToast();

<Tooltip content="快捷键 ⌘K">
  <Button variant="outlined">悬停查看 Plain Tooltip</Button>
</Tooltip>

<RichTooltip subhead="空间物理弹簧" content="用于位移、尺寸与圆角形变，允许自然弹性回弹。">
  <Button variant="tonal">悬停查看 Rich Tooltip</Button>
</RichTooltip>

<Button onClick={() => toast({ title: "已归档 3 个会话", actionLabel: "撤销" })}>
  触发 Snackbar
</Button>`}
          >
            <div className="demo-row">
              <Tooltip content="Plain Tooltip · 反色紧凑提示 (8px 圆角)">
                <Button variant="outlined">悬停 Plain Tooltip</Button>
              </Tooltip>

              <RichTooltip
                subhead="M3E 双轨弹簧准则"
                content="空间属性（位移、圆角、尺寸）使用欠阻尼弹性弹簧；颜色与透明度严禁使用过冲弹簧。"
                action={
                  <Button
                    size="xs"
                    variant="text"
                    onClick={() => toast({ title: "已复制双轨物理速查说明" })}
                  >
                    复制准则
                  </Button>
                }
              >
                <Button variant="tonal">悬停 Rich Tooltip</Button>
              </RichTooltip>

              <Button
                variant="filled"
                onClick={() =>
                  toast({
                    title: "组件配置已同步至本地",
                    description: "包含 9 个新增表单与浮层原语",
                    actionLabel: "撤销",
                    onAction: () =>
                      toast({ title: "已撤销刚才的同步操作" }),
                  })
                }
              >
                触发 Snackbar 通知
              </Button>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="flat-progress-meter"
            title="LinearProgress, CircularProgress & Meter (4px 轨道裂隙规范)"
            primitive="@base-ui/react/progress · @base-ui/react/meter"
            description="除波浪进度条外，M3E 1.5 标准平直进度条与环形进度环同样引入标志性的 4px 激活段/剩余轨道物理裂隙与 4px 末端止动圆点；Meter 支持容量阈值三级变色。"
            code={`import {
  LinearProgressIndicator,
  CircularProgressIndicator,
  Meter,
} from "m3eui";

<LinearProgressIndicator label="制品包上传进度" value={76} showValue thickness="thick" />
<CircularProgressIndicator value={76} size="lg" showValue />
<Meter label="显存负载配额 (VRAM)" value={76} valueText="18.2 / 24 GB" />`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <LinearProgressIndicator
                  label="标准平直进度条 (4px 裂隙 + 末端止动点)"
                  value={gpuUsage}
                  showValue
                />
                <LinearProgressIndicator
                  label="高表现力加粗轨道 (8px Thick)"
                  thickness="thick"
                  value={gpuUsage}
                  showValue
                />
                <LinearProgressIndicator
                  label="不确定态双段追逐动画 (Indeterminate)"
                  indeterminate
                />
              </div>

              <div className="demo-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", gap: 16 }}>
                <div className="demo-row" style={{ gap: 20 }}>
                  <CircularProgressIndicator value={gpuUsage} size="sm" />
                  <CircularProgressIndicator value={gpuUsage} size="md" showValue />
                  <CircularProgressIndicator value={gpuUsage} size="lg" showValue />
                  <CircularProgressIndicator indeterminate size="md" />
                </div>

                <Meter
                  label="集群显存配额负载 (≥70% 预警色 / ≥90% 告警色)"
                  value={gpuUsage}
                  valueText={`${gpuUsage}% · ${(gpuUsage * 0.24).toFixed(1)} / 24 GB`}
                />
              </div>
            </div>

            <Slider
              size="sm"
              label="拖动调节进度与配额负载（观察 4px 裂隙与 70% / 90% 计量条变色）"
              min={0}
              max={100}
              showValue
              value={gpuUsage}
              onValueChange={setGpuUsage}
              formatValue={(v) => `${v}%`}
            />
          </ShowcaseCard>

          <ShowcaseCard
            id="progress"
            title="LoadingIndicator & WavyProgressIndicator"
            primitive="@base-ui/react/progress · SVG Parametric Curves"
            description="7 阶段连续多边形形变加载器，以及端点自动收平的线性与极坐标整波瓣闭合（N=9）环形波浪进度条。"
            code={`import {
  LoadingIndicator,
  ContainedLoadingIndicator,
  LinearWavyProgressIndicator,
  CircularWavyProgressIndicator,
} from "m3eui";

<LoadingIndicator size={44} />
<ContainedLoadingIndicator size={48} />
<LinearWavyProgressIndicator value={62} />
<CircularWavyProgressIndicator value={62} />`}
          >
            <div className="demo-row" style={{ gap: 24 }}>
              <LoadingIndicator size={44} />
              <ContainedLoadingIndicator size={48} />
              <CircularWavyProgressIndicator
                value={Math.round(progressVal * 100)}
                size={48}
              />
              <CircularWavyProgressIndicator size={48} />
              <div style={{ flex: "1 1 260px", minWidth: 240, display: "flex", flexDirection: "column", gap: 14 }}>
                <LinearWavyProgressIndicator value={Math.round(progressVal * 100)} />
                <LinearWavyProgressIndicator />
              </div>
            </div>
            <Slider
              size="sm"
              label="拖动调节确定性波浪进度（观察 ≤10% 与 ≥95% 端点振幅自动平滑收平）"
              min={0}
              max={100}
              showValue
              value={Math.round(progressVal * 100)}
              onValueChange={(v) => setProgressVal(v / 100)}
              formatValue={(v) => `${v}%`}
            />
          </ShowcaseCard>

          <ShowcaseCard
            id="shapes"
            title="MaterialShapeView (全量 35 种官方形状与任意形变)"
            primitive="m3eui/tokens · MaterialShapes"
            description="内置 AOSP MaterialShapes 全部 35 个 [0..1] 归一化闭合三次贝塞尔多边形，支持任意两形状 1:1 实时弹簧插值。"
            code={`import { MaterialShapeView } from "m3eui";

<MaterialShapeView
  shape="cookie9Sided"
  toShape="heart"
  morphProgress={morphProgress}
  size={72}
/>`}
          >
            <div className="demo-row" style={{ gap: 24 }}>
              <MaterialShapeView
                shape={fromShape}
                toShape={toShape}
                morphProgress={morphProgress}
                size={76}
              />
              <div style={{ flex: "1 1 260px" }}>
                <Slider
                  size="sm"
                  label={`形变插值: ${fromShape} → ${toShape}`}
                  min={0}
                  max={100}
                  showValue
                  value={Math.round(morphProgress * 100)}
                  onValueChange={(v) => setMorphProgress(v / 100)}
                  formatValue={(v) => `${v}%`}
                />
              </div>
            </div>

            <div className="shape-grid">
              {M3E_ALL_SHAPE_NAMES.map((name) => {
                const isSelected = name === fromShape || name === toShape;
                return (
                  <Card
                    key={name}
                    interactive
                    variant={isSelected ? "filled" : "outlined"}
                    className={
                      isSelected
                        ? "shape-tile-card shape-tile-card--selected"
                        : "shape-tile-card"
                    }
                    onClick={() => {
                      setFromShape(toShape);
                      setToShape(name);
                      setMorphProgress(1);
                    }}
                  >
                    <MaterialShapeView shape={name} size={32} />
                    <span>{name}</span>
                  </Card>
                );
              })}
            </div>
          </ShowcaseCard>
        </div>

        <React.Suspense
          fallback={
            <Card variant="outlined">
              <div className="demo-row" style={{ gap: 16 }}>
                <LoadingIndicator size={36} />
                <div style={{ flex: 1, display: "grid", gap: 8 }}>
                  <Skeleton width="42%" height={18} />
                  <Skeleton width="78%" height={14} />
                </div>
              </div>
            </Card>
          }
        >
          <CompositeSuiteSection />
        </React.Suspense>

        <Card variant="filled" className="docs-footer-card">
          <div className="docs-footer__row">
            <div className="docs-footer__brand">
              <MaterialShapeView shape="cookie9Sided" size={28} />
              <div>
                <strong>m3eui v1.0.0</strong>
                <div className="docs-footer__sub">
                  Material 3 Expressive 1.5 · Built on @base-ui/react 1.9 · Zero Tailwind
                </div>
              </div>
            </div>
            <div className="demo-row" style={{ gap: 8 }}>
              <AssistChip>m3eui/tokens</AssistChip>
              <AssistChip>m3eui</AssistChip>
              <AssistChip>m3eui</AssistChip>
              <Button
                size="xs"
                variant="tonal"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                返回顶部 ↑
              </Button>
            </div>
          </div>
        </Card>
      </main>
      </div>
    </div>
  );
}

export function App(): React.JSX.Element {
  return (
    <M3EProvider config={m3eProjectConfig as M3EConfig}>
      <DocsBody />
    </M3EProvider>
  );
}
