import * as React from "react";
import {
  type ColorSchemeVariant,
  type ColorSpecVersion,
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
import { usePlaygroundStrings } from "./i18n";

const LOCALE_OPTIONS: readonly { code: M3EBuiltInLocale; label: string }[] = [
  { code: "zh-CN", label: "中文" },
  { code: "en-US", label: "EN" },
  { code: "ja-JP", label: "日本語" },
  { code: "ar-SA", label: "العربية" },
];

const CompositeSuiteSection = React.lazy(
  () => import("./sections/CompositeSuiteSection"),
);

const COMPONENT_SEARCH_OPTIONS: readonly ComboboxOption[] = [
  { value: "button-group", label: "ButtonGroup", description: "按钮组" },
  { value: "slider", label: "Slider", description: "滑块" },
  { value: "accordion", label: "Accordion", description: "手风琴" },
  { value: "sheet", label: "BottomSheet & SideSheet", description: "抽屉面板" },
  { value: "avatar", label: "Avatar", description: "多边形头像" },
  { value: "wavy", label: "WavyProgressIndicator", description: "波浪进度条" },
];

const SEARCH_SUGGESTIONS: readonly SearchSuggestion[] = [
  { value: "carousel", label: "Carousel", category: "展示", description: "轮播容器" },
  { value: "otp-field", label: "OTPField", category: "表单", description: "验证码输入" },
  { value: "top-app-bar", label: "TopAppBar", category: "导航", description: "顶部应用栏" },
  { value: "progress", label: "LinearProgressIndicator", category: "反馈", description: "线性进度条" },
  { value: "date-picker", label: "DockedDatePicker", category: "表单", description: "日期选择器" },
];

const CAROUSEL_DEMO_ITEMS: readonly CarouselItemSpec[] = [
  {
    id: "aurora",
    badge: "01",
    title: "物理弹簧",
    subtitle: "Spatial & Effects",
    background: "linear-gradient(135deg, #4f378b 0%, #9a82db 100%)",
  },
  {
    id: "emerald",
    badge: "02",
    title: "HCT 色彩",
    subtitle: "Dynamic Tonal Palette",
    background: "linear-gradient(135deg, #005142 0%, #26a689 100%)",
  },
  {
    id: "ocean",
    badge: "03",
    title: "矢量多边形",
    subtitle: "35 MaterialShapes",
    background: "linear-gradient(135deg, #0b57d0 0%, #5b9bf8 100%)",
  },
  {
    id: "crimson",
    badge: "04",
    title: "圆角拓扑",
    subtitle: "Dynamic Corner Morph",
    background: "linear-gradient(135deg, #8c1d18 0%, #e46962 100%)",
  },
  {
    id: "plum",
    badge: "05",
    title: "无障碍原语",
    subtitle: "Built on Base UI",
    background: "linear-gradient(135deg, #633b48 0%, #b58392 100%)",
  },
];

const NAV_GROUPS = [
  {
    title: "入门与配置",
    items: [
      { id: "theme-setup", label: "主题与国际化" },
    ],
  },
  {
    title: "动作与工具栏",
    items: [
      { id: "button", label: "Button & ToggleButton" },
      { id: "icon-split", label: "IconButton & SplitButton" },
      { id: "button-group", label: "ButtonGroup" },
      { id: "toolbar-fab", label: "FloatingToolbar & FABMenu" },
      { id: "fab-extended", label: "FAB & ExtendedFAB" },
    ],
  },
  {
    title: "表单控件",
    items: [
      { id: "search-bar", label: "SearchBar" },
      { id: "otp-field", label: "OTPField" },
      { id: "date-picker", label: "DatePicker" },
      { id: "textfield", label: "TextField & Textarea" },
      { id: "number-combobox", label: "NumberField & Combobox" },
      { id: "switch", label: "Switch" },
      { id: "slider", label: "Slider" },
      { id: "checkbox-radio", label: "Checkbox & Radio" },
      { id: "select", label: "Select" },
    ],
  },
  {
    title: "数据展示与容器",
    items: [
      { id: "carousel", label: "Carousel" },
      { id: "chips", label: "Chip" },
      { id: "avatar-badge", label: "Avatar & Badge" },
      { id: "cards", label: "Card" },
      { id: "accordion", label: "Accordion" },
      { id: "preview-scroll-divider", label: "PreviewCard & ScrollArea" },
    ],
  },
  {
    title: "导航与列表",
    items: [
      { id: "top-app-bar", label: "TopAppBar" },
      { id: "navigation", label: "NavigationBar & Rail" },
      { id: "tabs", label: "Tabs" },
      { id: "segmented-list", label: "SegmentedList" },
    ],
  },
  {
    title: "浮层与反馈",
    items: [
      { id: "sheets", label: "BottomSheet & SideSheet" },
      { id: "popover-menu", label: "Popover & Menu" },
      { id: "dialog", label: "Dialog & AlertDialog" },
      { id: "tooltip-toast", label: "Tooltip & Toast" },
      { id: "flat-progress-meter", label: "Progress & Meter" },
      { id: "progress", label: "Loading & WavyProgress" },
      { id: "shapes", label: "MaterialShapeView" },
    ],
  },
  {
    title: "复合组件",
    items: [
      { id: "site-nav-collapsible", label: "NavigationMenu & Collapsible" },
      { id: "time-date-range", label: "TimePicker & DateRangePicker" },
      { id: "form-fieldset", label: "Form & Fieldset" },
      { id: "navigation-suite", label: "NavigationSuite & Drawer" },
      { id: "menubar-submenu", label: "Menubar & DropdownMenu" },
      { id: "data-table-skeleton", label: "DataTable & Skeleton" },
    ],
  },
] as const;

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

const LOCALE_GROUP_ITEMS = LOCALE_OPTIONS.map((opt) => ({
  value: opt.code,
  label: opt.label,
}));

const LOCALE_MENU_OPTIONS: readonly {
  code: M3EBuiltInLocale;
  shortLabel: string;
  fullLabel: string;
}[] = [
  { code: "zh-CN", shortLabel: "中文", fullLabel: "简体中文 (zh-CN)" },
  { code: "en-US", shortLabel: "EN", fullLabel: "English (en-US)" },
  { code: "ja-JP", shortLabel: "日本語", fullLabel: "日本語 (ja-JP)" },
  { code: "ar-SA", shortLabel: "العربية", fullLabel: "العربية (ar-SA)" },
];

function SeedSwatchDot({ hex }: { readonly hex: string }) {
  return (
    <span
      className="docs-seed-dot"
      style={{ backgroundColor: hex }}
      aria-hidden="true"
    />
  );
}

function GlobeIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function ChevronDownTinyIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ColorModeGlyph({ mode }: { readonly mode: "light" | "dark" | "system" }) {
  if (mode === "light") {
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
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }
  if (mode === "dark") {
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
        <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
      </svg>
    );
  }
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
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v18a9 9 0 0 0 0-18z" fill="currentColor" stroke="none" />
    </svg>
  );
}

function DocsBrandMark({ isScrolled }: { readonly isScrolled: boolean }) {
  return (
    <span className="docs-brand-mark" aria-hidden="true">
      <MaterialShapeView
        shape={isScrolled ? "clover8Leaf" : "cookie9Sided"}
        size={34}
        scaleFactor={0.95}
        fill="var(--m3e-color-primary)"
      />
      <span className="docs-brand-mark__glyph">M3</span>
    </span>
  );
}

function DocsHeader({
  onOpenMobileNav,
  onOpenStudio,
  onJumpToSection,
}: {
  readonly onOpenMobileNav: () => void;
  readonly onOpenStudio: () => void;
  readonly onJumpToSection: (sectionId: string) => void;
}) {
  const ui = usePlaygroundStrings();
  const {
    seedHex,
    colorMode,
    setColorMode,
    locale,
    setLocale,
    setDirectionMode,
  } = useM3E();

  const activeLocaleOption = React.useMemo(() => {
    const langPrefix = locale.split(/[-_]/)[0]?.toLowerCase();
    return (
      LOCALE_MENU_OPTIONS.find(
        (opt) => opt.code.split("-")[0]?.toLowerCase() === langPrefix,
      ) ?? LOCALE_MENU_OPTIONS[0]!
    );
  }, [locale]);

  const localeMenuItems = React.useMemo(
    () =>
      LOCALE_MENU_OPTIONS.map((opt) => ({
        id: opt.code,
        label: opt.fullLabel,
        checked: activeLocaleOption.code === opt.code,
        onCheckedChange: () => {
          setDirectionMode("auto");
          setLocale(opt.code);
        },
      })),
    [activeLocaleOption.code, setDirectionMode, setLocale],
  );

  const colorModeMenuItems = React.useMemo(
    () => [
      {
        id: "light",
        label: ui.modeLight,
        icon: <ColorModeGlyph mode="light" />,
        checked: colorMode === "light",
        onCheckedChange: () => setColorMode("light"),
      },
      {
        id: "dark",
        label: ui.modeDark,
        icon: <ColorModeGlyph mode="dark" />,
        checked: colorMode === "dark",
        onCheckedChange: () => setColorMode("dark"),
      },
      {
        id: "system",
        label: ui.modeSystem,
        icon: <ColorModeGlyph mode="system" />,
        checked: colorMode === "system",
        onCheckedChange: () => setColorMode("system"),
      },
    ],
    [colorMode, setColorMode, ui.modeDark, ui.modeLight, ui.modeSystem],
  );

  const globalSuggestions = React.useMemo<readonly SearchSuggestion[]>(
    () =>
      NAV_GROUPS.flatMap((group, gIdx) =>
        group.items.map((item) => ({
          value: item.id,
          label: item.id === "theme-setup" ? ui.navGroups[0] : item.label,
          category: ui.navGroups[gIdx] ?? group.title,
          description: `#${item.id}`,
        })),
      ),
    [ui],
  );

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
    const exact = globalSuggestions.find(
      (s) =>
        s.label.toLowerCase() === trimmed ||
        s.value.toLowerCase() === trimmed,
    );
    const fuzzy =
      exact ??
      globalSuggestions.find(
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
            aria-label={ui.openNavDrawer}
            className="docs-mobile-menu-btn"
            icon={<MenuHamburgerIcon />}
            onClick={onOpenMobileNav}
          />
          <a href="#docs-top" className="docs-brand-link">
            <DocsBrandMark isScrolled={isScrolled} />
            <span className="docs-brand__title">m3eui</span>
          </a>
          <AssistChip
            className="docs-brand__chip"
            onClick={() => onJumpToSection("theme-setup")}
          >
            v0.1.0
          </AssistChip>
        </div>
      }
      title={
        <div className="docs-header-search-wrap">
          <SearchBar
            size="sm"
            className="docs-global-search"
            suggestions={globalSuggestions}
            value={quickQuery}
            onValueChange={(val) => {
              setQuickQuery(val);
              const matched = globalSuggestions.find(
                (s) => s.label === val,
              );
              if (matched) {
                onJumpToSection(matched.value);
                setQuickQuery("");
              }
            }}
            onSearchSubmit={resolveAndJump}
            placeholder={ui.searchPlaceholder}
            aria-label={ui.searchAriaLabel}
          />
        </div>
      }
      actions={
        <div className="docs-header-actions">
          <DropdownMenu
            align="end"
            items={localeMenuItems}
            trigger={
              <Button
                size="xs"
                variant="outlined"
                aria-label={ui.languageLabel}
                leadingIcon={<GlobeIcon />}
                trailingIcon={<ChevronDownTinyIcon />}
              >
                {activeLocaleOption.shortLabel}
              </Button>
            }
          />

          <DropdownMenu
            align="end"
            items={colorModeMenuItems}
            trigger={
              <IconButton
                size="sm"
                variant="standard"
                aria-label={ui.colorModeLabel}
                icon={<ColorModeGlyph mode={colorMode} />}
              />
            }
          />

          <Button
            size="xs"
            variant="tonal"
            leadingIcon={<SeedSwatchDot hex={seedHex} />}
            trailingIcon={<SlidersStudioIcon />}
            onClick={onOpenStudio}
          >
            {ui.studioButton}
          </Button>
        </div>
      }
    />
  );
}

function ThemeStudioSheet({
  open,
  onOpenChange,
}: {
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  const ui = usePlaygroundStrings();
  const {
    seedHex,
    setSeedHex,
    schemeVariant,
    setSchemeVariant,
    specVersion,
    setSpecVersion,
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

  const seedPresets = React.useMemo(
    () => [
      { hex: "#6750A4", name: ui.seedPurple },
      { hex: "#0B6B58", name: ui.seedJade },
      { hex: "#1A73E8", name: ui.seedOcean },
      { hex: "#B3261E", name: ui.seedVermilion },
      { hex: "#7D5260", name: ui.seedRose },
    ],
    [ui],
  );
  const contrastItems = React.useMemo(
    () => [
      { value: "0", label: ui.contrastStandard },
      { value: "0.5", label: ui.contrastMedium },
      { value: "1", label: ui.contrastHigh },
    ],
    [ui],
  );
  const colorModeItems = React.useMemo(
    () => [
      { value: "light", label: ui.modeLight },
      { value: "dark", label: ui.modeDark },
      { value: "system", label: ui.modeSystem },
    ],
    [ui],
  );

  return (
    <SideSheet
      open={open}
      onOpenChange={onOpenChange}
      side="end"
      title={ui.studioTitle}
      footer={
        <div className="demo-row" style={{ justifyContent: "space-between", width: "100%" }}>
          <Button
            variant="filled"
            size="sm"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(exportConfigJson());
              } catch {
              }
              toast({ title: ui.copiedM3eJsonToast });
            }}
          >
            {ui.copyM3eJson}
          </Button>
          <SheetClose
            render={
              <Button variant="tonal" size="sm">
                {ui.done}
              </Button>
            }
          />
        </div>
      }
    >
      <ScrollArea maxHeight="calc(100dvh - 210px)">
        <div className="docs-studio-sheet-content">
          <Fieldset legend={ui.colorAndContrastLegend}>
            <div className="demo-row" style={{ gap: 8 }}>
              {seedPresets.map((preset) => (
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
                  aria-label={ui.seedCustomAria}
                  className="docs-color-input"
                  value={seedHex}
                  onChange={(e) => setSeedHex(e.target.value)}
                />
                <span>{ui.seedCustom}</span>
              </label>
            </div>

            <Select
              label={ui.schemeSelectLabel}
              value={schemeVariant}
              onValueChange={(v) => {
                if (v) {
                  setSchemeVariant(v as ColorSchemeVariant);
                }
              }}
              options={[
                { value: "expressive", label: "Expressive (M3E)" },
                { value: "tonalSpot", label: "Tonal Spot" },
                { value: "vibrant", label: "Vibrant" },
                { value: "neutral", label: "Neutral" },
                { value: "fidelity", label: "Fidelity" },
                { value: "content", label: "Content" },
                { value: "monochrome", label: "Monochrome" },
                { value: "rainbow", label: "Rainbow" },
                { value: "fruitSalad", label: "Fruit Salad" },
              ]}
            />

            <div className="docs-studio-field">
              <span className="docs-studio-field__label">{ui.specVersionLabel}</span>
              <ButtonGroup
                variant="connected"
                size="xs"
                selectionMode="single"
                aria-label={ui.specVersionLabel}
                items={[
                  { value: "2025", label: "SPEC 2025 (M3E)" },
                  { value: "2026", label: "SPEC 2026" },
                  { value: "2021", label: "SPEC 2021" },
                ]}
                value={[specVersion]}
                onValueChange={(vals) => {
                  const next = vals[0] as ColorSpecVersion | undefined;
                  if (next) setSpecVersion(next);
                }}
              />
            </div>

            <div className="docs-studio-field">
              <span className="docs-studio-field__label">{ui.contrastLabel}</span>
              <ButtonGroup
                variant="connected"
                size="xs"
                selectionMode="single"
                aria-label={ui.contrastLabel}
                items={contrastItems}
                value={[String(contrastLevel)]}
                onValueChange={(vals) => {
                  if (vals[0] !== undefined) setContrastLevel(Number(vals[0]));
                }}
              />
            </div>

            <div className="docs-studio-field">
              <span className="docs-studio-field__label">{ui.colorModeLabel}</span>
              <ButtonGroup
                variant="connected"
                size="xs"
                selectionMode="single"
                aria-label={ui.colorModeLabel}
                items={colorModeItems}
                value={[colorMode]}
                onValueChange={(vals) => {
                  const next = vals[0] as "light" | "dark" | "system" | undefined;
                  if (next) setColorMode(next);
                }}
              />
            </div>
          </Fieldset>

          <Fieldset legend={ui.langAndDirLegend}>
            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              aria-label={ui.languageLabel}
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
              aria-label={ui.writingDirLabel}
              items={[
                { value: "auto", label: ui.autoDirLabel(direction.toUpperCase()) },
                { value: "ltr", label: "LTR →" },
                { value: "rtl", label: "← RTL" },
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

          <Fieldset legend={ui.motionAndDebugLegend}>
            <Switch
              checked={motionSchemeName === "expressive"}
              onCheckedChange={(checked) =>
                setMotionSchemeName(checked ? "expressive" : "standard")
              }
              label={ui.expressiveSpringLabel}
            />
            <Switch
              checked={playbackRate < 1}
              onCheckedChange={(checked) => setPlaybackRate(checked ? 0.25 : 1)}
              label={ui.slowMotionLabel}
            />
            <Switch
              checked={debugGeometry}
              onCheckedChange={setDebugGeometry}
              label={ui.geometryRulerLabel}
            />
          </Fieldset>
        </div>
      </ScrollArea>
    </SideSheet>
  );
}

function DocsBody() {
  const ui = usePlaygroundStrings();
  const {
    seedHex,
    schemeVariant,
    specVersion,
    direction,
    exportConfigJson,
  } = useM3E();
  const { locale, t } = useM3EI18n();
  const { toast } = useM3EToast();

  React.useEffect(() => {
    document.title = ui.docTitle;
  }, [ui.docTitle]);

  const navDrawerItems = React.useMemo<readonly NavigationDestination<string>[]>(
    () =>
      NAV_GROUPS.flatMap((group, groupIdx) =>
        group.items.map((item) => ({
          value: item.id,
          label: item.id === "theme-setup" ? ui.navGroups[0] : item.label,
          href: `#${item.id}`,
          section: ui.navGroups[groupIdx] ?? group.title,
          icon: <NavCategoryGlyph index={groupIdx} />,
        })),
      ),
    [ui],
  );
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

  const scrollToSection = React.useCallback((sectionId: string) => {
    setActiveSection(sectionId);
    const target = document.getElementById(sectionId);
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      target.focus({ preventScroll: true });
    }
  }, []);

  const [favSelected, setFavSelected] = React.useState(false);
  const [iconToggleOn, setIconToggleOn] = React.useState(true);
  const [viewPeriod, setViewPeriod] = React.useState("week");
  const [toolbarTheme, setToolbarTheme] = React.useState<"standard" | "vibrant">("vibrant");
  const [toolbarCollapsed, setToolbarCollapsed] = React.useState(false);
  const [toolbarTool, setToolbarTool] = React.useState("brush");

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

  const [emailInput, setEmailInput] = React.useState("architect@m3e.dev");
  const [bioInput, setBioInput] = React.useState(
    "Material 3 Expressive React 组件库。",
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

  const [primaryTab, setPrimaryTab] = React.useState("overview");
  const [secondaryTab, setSecondaryTab] = React.useState("tokens");
  const [selectedListItem, setSelectedListItem] = React.useState<number>(1);
  const [singleListSelected, setSingleListSelected] = React.useState(false);

  const [progressVal, setProgressVal] = React.useState<number>(0.62);
  const [fromShape, setFromShape] = React.useState<M3EShapeName>("cookie9Sided");
  const [toShape, setToShape] = React.useState<M3EShapeName>("heart");
  const [morphProgress, setMorphProgress] = React.useState<number>(0);

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
        {ui.skipToMain}
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
        aria-label={ui.mobileNavAria}
        headline={ui.mobileNavHeadline}
        items={navDrawerItems}
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
              aria-label={ui.sidebarHeading}
              headline={ui.sidebarHeading}
              items={navDrawerItems}
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
                    Material 3 Expressive
                  </AssistChip>
                  <AssistChip>{`AOSP SPEC ${specVersion}`}</AssistChip>
                </div>

                <h1 className="docs-hero__title">
                  {ui.heroTitle}
                </h1>
                <p className="docs-hero__desc">
                  {ui.heroDesc}
                </p>

                <div className="demo-row">
                  <Button
                    variant="filled"
                    leadingIcon={<SparkleIcon />}
                    onClick={() => scrollToSection("theme-setup")}
                  >
                    {ui.quickStartBtn}
                  </Button>
                  <Button
                    variant="tonal"
                    leadingIcon={<SeedSwatchDot hex={seedHex} />}
                    trailingIcon={<SlidersStudioIcon />}
                    onClick={() => setStudioOpen(true)}
                  >
                    {ui.openStudioBtn}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => scrollToSection("site-nav-collapsible")}
                  >
                    {ui.compositeSuiteBtn}
                  </Button>
                </div>
              </div>

              <Tooltip content={ui.switchPolygonTooltip}>
                <Card
                  interactive
                  variant="outlined"
                  className="docs-hero__emblem"
                  onClick={() => setHeroShapeIdx((n) => n + 1)}
                >
                  <span className="docs-hero__emblem-mark" aria-hidden="true">
                    <MaterialShapeView
                      shape={currentHeroShape}
                      size={84}
                      fill="var(--m3e-color-primary)"
                    />
                    <span className="docs-hero__emblem-glyph">M3</span>
                  </span>
                  <span className="docs-hero__emblem-caption">
                    {currentHeroShape}
                  </span>
                </Card>
              </Tooltip>
            </div>
          </Card>

          <div className="docs-category">
            <DocsCategoryHeader indexLabel="01" title={ui.navGroups[0]} />

            <ShowcaseCard
              id="theme-setup"
              title="m3e.json · M3EProvider · i18n"
              code={`import "./m3e-theme.generated.css";
import "m3eui/styles.css";
import { M3EProvider, Button } from "m3eui";
import m3eConfig from "./m3e.json";

export function App() {
  return (
    <M3EProvider config={m3eConfig}>
      <Button variant="filled">开始使用</Button>
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
                        <code>m3e.json</code> {ui.configCardSuffix}
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
                          }
                          toast({ title: ui.copiedM3eJsonToast });
                        }}
                      >
                        {copiedConfig ? ui.cardCopied : ui.cardCopy}
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
                      {ui.i18nEntriesLabel} (<code>{locale}</code> ·{" "}
                      <code>dir=&quot;{direction}&quot;</code>)
                    </span>
                  }
                >
                  <SegmentedList aria-label={ui.i18nEntriesLabel}>
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
                    <AssistChip>npx m3eui init</AssistChip>
                    <AssistChip>npx m3eui sync</AssistChip>
                    <AssistChip>npx m3eui locale fr-FR</AssistChip>
                    <AssistChip>npx m3eui doctor</AssistChip>
                  </div>
                </Card>
              </div>
            </ShowcaseCard>
          </div>

          <div className="docs-category">
            <DocsCategoryHeader indexLabel="02" title={ui.navGroups[1]} />

          <ShowcaseCard
            id="button"
            title="Button & ToggleButton"
            code={`import { Button, ToggleButton } from "m3eui";

<Button variant="filled" leadingIcon={<SparkleIcon />}>主要操作</Button>
<Button variant="tonal">次要操作</Button>
<Button variant="outlined">描边按钮</Button>
<ToggleButton
  variant="tonal"
  pressed={pressed}
  onPressedChange={setPressed}
>
  收藏
</ToggleButton>`}
          >
            <div className="demo-row">
              <Button variant="filled" leadingIcon={<SparkleIcon />}>
                Filled
              </Button>
              <Button variant="tonal">Tonal</Button>
              <Button variant="elevated">Elevated</Button>
              <Button variant="outlined">Outlined</Button>
              <Button variant="text">Text</Button>
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
            title="IconButton & SplitButton"
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
                onClick={() => toast({ title: "已发送" })}
                menuItems={[
                  {
                    id: "now",
                    label: "立即发送",
                    shortcut: "⌘↵",
                    selected: true,
                    onSelect: () => toast({ title: "已发送" }),
                  },
                  {
                    id: "schedule",
                    label: "明早 09:00 发送",
                    onSelect: () => toast({ title: "已设置定时发送" }),
                  },
                  {
                    id: "draft",
                    label: "存为草稿",
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
            title="ButtonGroup"
            code={`import { ButtonGroup } from "m3eui";

<ButtonGroup
  variant="connected"
  selectionMode="single"
  value={[period]}
  onValueChange={(vals) => setPeriod(vals[0] ?? "week")}
  items={[
    { value: "day", label: "日" },
    { value: "week", label: "周" },
    { value: "month", label: "月" },
    { value: "year", label: "年" },
  ]}
/>`}
          >
            <div className="demo-panel">
              <span className="demo-panel__label">Connected</span>
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
                  { value: "month", label: "月视图" },
                  { value: "year", label: "年视图" },
                ]}
              />
            </div>

            <div className="demo-panel">
              <span className="demo-panel__label">Standard (15% Squish + Overflow Menu)</span>
              <ButtonGroup
                variant="standard"
                buttonVariant="tonal"
                maxVisibleItems={3}
                onAction={(action) => toast({ title: `执行操作: ${action}` })}
                items={[
                  { value: "reply", label: "回复" },
                  { value: "forward", label: "转发" },
                  { value: "archive", label: "归档" },
                  { value: "snooze", label: "稍后提醒" },
                  { value: "mute", label: "静音会话" },
                ]}
              />
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="toolbar-fab"
            title="FloatingToolbar & FABMenu"
            code={`import { FloatingToolbar, FABMenu } from "m3eui";

<FloatingToolbar
  theme="vibrant"
  aria-label="工具栏"
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
        { id: "send", label: "分享", icon: <SendIcon /> },
      ]}
    />
  }
/>`}
          >
            <div className="demo-row" style={{ justifyContent: "space-between" }}>
              <FloatingToolbar
                theme={toolbarTheme}
                collapsed={toolbarCollapsed}
                onCollapsedChange={setToolbarCollapsed}
                aria-label="悬浮工具栏"
                items={[
                  {
                    id: "brush",
                    label: "润色",
                    icon: <SparkleIcon />,
                    selected: toolbarTool === "brush",
                    onClick: () => setToolbarTool("brush"),
                  },
                  {
                    id: "fav",
                    label: "收藏",
                    icon: <HeartIcon filled={toolbarTool === "fav"} />,
                    selected: toolbarTool === "fav",
                    onClick: () => setToolbarTool("fav"),
                  },
                  {
                    id: "notify",
                    label: "提醒",
                    icon: <BellIcon />,
                    separatorBefore: true,
                    selected: toolbarTool === "notify",
                    onClick: () => setToolbarTool("notify"),
                  },
                ]}
                companionFab={
                  <FABMenu
                    size="sm"
                    triggerLabel="新建"
                    items={[
                      {
                        id: "ai",
                        label: "新建草稿",
                        icon: <SparkleIcon />,
                        onSelect: () => toast({ title: "已新建草稿" }),
                      },
                      {
                        id: "share",
                        label: "复制链接",
                        icon: <SendIcon />,
                        onSelect: () => toast({ title: "链接已复制" }),
                      },
                    ]}
                  />
                }
              />

              <div className="demo-row" style={{ gap: 8 }}>
                <Button
                  size="xs"
                  variant="tonal"
                  onClick={() => setToolbarCollapsed((c) => !c)}
                >
                  {toolbarCollapsed ? "展开工具栏" : "折叠至 FAB"}
                </Button>
                <Button
                  size="xs"
                  variant="outlined"
                  onClick={() =>
                    setToolbarTheme((t) => (t === "vibrant" ? "standard" : "vibrant"))
                  }
                >
                  {toolbarTheme === "vibrant" ? "Standard" : "Vibrant"}
                </Button>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="fab-extended"
            title="FAB & ExtendedFAB"
            code={`import { FAB, ExtendedFAB } from "m3eui";

<FAB size="sm" variant="surface" icon={<SparkleIcon />} aria-label="快捷操作" />
<FAB size="md" variant="primary" icon={<SendIcon />} aria-label="发送" />
<FAB size="lg" variant="secondary" icon={<HeartIcon />} aria-label="收藏" />
<FAB size="xl" variant="tertiary" icon={<SparkleIcon />} aria-label="新建" />

<ExtendedFAB expanded={expanded} icon={<SparkleIcon />} onClick={() => setExpanded(!expanded)}>
  新建项目
</ExtendedFAB>`}
          >
            <div className="demo-row" style={{ gap: 16 }}>
              <FAB
                size="sm"
                variant="surface"
                icon={<SparkleIcon />}
                aria-label="SM FAB"
                onClick={() => toast({ title: "SM FAB" })}
              />
              <FAB
                size="md"
                variant="primary"
                icon={<SendIcon />}
                aria-label="MD FAB"
                onClick={() => toast({ title: "MD FAB" })}
              />
              <FAB
                size="lg"
                variant="secondary"
                icon={<HeartIcon filled />}
                aria-label="LG FAB"
                onClick={() => toast({ title: "LG FAB" })}
              />
              <FAB
                size="xl"
                variant="tertiary"
                icon={<SparkleIcon />}
                aria-label="XL FAB"
                onClick={() => toast({ title: "XL FAB" })}
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
                新建项目
              </ExtendedFAB>

              <ExtendedFAB
                size="md"
                variant="secondary"
                expanded={fabExpanded}
                icon={<SendIcon />}
                onClick={() => setFabExpanded((v) => !v)}
              >
                发起评审
              </ExtendedFAB>

              <Button
                size="xs"
                variant="outlined"
                onClick={() => setFabExpanded((v) => !v)}
              >
                {fabExpanded ? "收起标签" : "展开标签"}
              </Button>
            </div>
          </ShowcaseCard>
        </div>

        <div className="docs-category">
          <DocsCategoryHeader indexLabel="03" title={ui.navGroups[2]} />

          <ShowcaseCard
            id="search-bar"
            title="SearchBar"
            code={`import { SearchBar } from "m3eui";

<SearchBar
  value={query}
  onValueChange={setQuery}
  suggestions={SEARCH_SUGGESTIONS}
  onSearchSubmit={(q) => console.log(q)}
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
                    toast({ title: `搜索：${q}` });
                  }
                }}
              />
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="otp-field"
            title="OTPField"
            code={`import { OTPField } from "m3eui";

<OTPField
  length={6}
  separatorAfterIndex={2}
  label="双因素验证码"
  value={otpCode}
  onValueChange={setOtpCode}
  onValueComplete={(code) => console.log(code)}
/>`}
          >
            <div className="demo-grid-2">
              <OTPField
                length={6}
                separatorAfterIndex={2}
                label="双因素验证码"
                helperText="请输入 6 位数字验证码"
                value={otpCode}
                onValueChange={setOtpCode}
                onValueComplete={(code) =>
                  toast({ title: `验证完成：${code}` })
                }
              />

              <div className="demo-panel" style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 10 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600 }}>
                  当前输入：{otpCode ? otpCode : "—"}（{otpCode.length} / 6）
                </div>
                <div className="demo-row">
                  <Button
                    size="xs"
                    variant="tonal"
                    onClick={() => {
                      setOtpCode("849206");
                      toast({ title: "已填入 849206" });
                    }}
                  >
                    填入示例
                  </Button>
                  <Button
                    size="xs"
                    variant="outlined"
                    onClick={() => setOtpCode("")}
                  >
                    清空
                  </Button>
                </div>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="date-picker"
            title="DockedDatePicker & DatePickerField"
            code={`import { DockedDatePicker, DatePickerField } from "m3eui";

<DockedDatePicker value={date} onValueChange={setDate} />
<DatePickerField label="发版日期" value={date} onValueChange={setDate} />`}
          >
            <div className="demo-row" style={{ alignItems: "flex-start", gap: 24 }}>
              <DockedDatePicker
                title="选择日期"
                value={releaseDate}
                onValueChange={(next) => {
                  setReleaseDate(next);
                  toast({ title: `已选：${next}` });
                }}
              />

              <div style={{ display: "flex", flexDirection: "column", gap: 14, minWidth: 240 }}>
                <DatePickerField
                  label="发版日期"
                  value={releaseDate}
                  onValueChange={setReleaseDate}
                />
                <div className="demo-panel" style={{ fontSize: 13 }}>
                  当前值：<code>{releaseDate}</code>
                </div>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="textfield"
            title="TextField & TextareaField"
            code={`import { TextField, TextareaField } from "m3eui";

<TextField
  label="工作邮箱"
  type="email"
  required
  clearable
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
  label="备注"
  maxLength={160}
  showCharacterCount
  value={bio}
  onValueChange={setBio}
/>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <TextField
                  label="工作邮箱"
                  type="email"
                  name="work_email"
                  autoComplete="email"
                  required
                  clearable
                  description="architect@m3e.dev"
                  errorMessage="请输入有效的邮箱地址。"
                  value={emailInput}
                  onValueChange={setEmailInput}
                />

                <TextField
                  label="访问密钥"
                  variant="filled"
                  type="password"
                  name="api_secret"
                  autoComplete="current-password"
                  minLength={8}
                  defaultValue="m3e-expressive-2026"
                  description="至少 8 位字符"
                  errorMessage="密钥长度不能少于 8 位。"
                />
              </div>

              <div className="demo-panel">
                <TextareaField
                  label="项目简介"
                  name="design_note"
                  rows={4}
                  maxLength={160}
                  showCharacterCount
                  value={bioInput}
                  onValueChange={setBioInput}
                />
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="number-combobox"
            title="NumberField & Combobox"
            code={`import { NumberField, Combobox } from "m3eui";

<NumberField
  label="刚度"
  min={100}
  max={1200}
  step={20}
  value={stiffness}
  onValueChange={setStiffness}
/>

<Combobox
  label="选择组件"
  options={COMPONENT_SEARCH_OPTIONS}
  value={selected}
  onValueChange={setSelected}
/>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">NumberField</span>
                <div className="demo-row" style={{ gap: 20 }}>
                  <NumberField
                    label="刚度 k"
                    min={100}
                    max={1200}
                    step={20}
                    value={stiffnessVal}
                    onValueChange={setStiffnessVal}
                  />
                  <NumberField
                    label="阻尼 ζ"
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
                  label="检索组件"
                  placeholder="输入组件名称…"
                  options={COMPONENT_SEARCH_OPTIONS}
                  value={selectedCombo}
                  onValueChange={setSelectedCombo}
                />
                <span className="demo-panel__label">
                  当前选中：{selectedCombo ? selectedCombo.label : "未选择"}
                </span>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="switch"
            title="Switch"
            code={`import { Switch } from "m3eui";

<Switch
  label="无线网络"
  checked={wifiOn}
  onCheckedChange={setWifiOn}
/>
<Switch
  label="状态图标"
  showIcons
  checked={hapticOn}
  onCheckedChange={setHapticOn}
/>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <Switch
                  label="无线网络"
                  description="自动连接可用频段"
                  checked={wifiOn}
                  onCheckedChange={setWifiOn}
                />
                <Switch
                  label="状态图标"
                  description="显示开启与关闭符号"
                  showIcons
                  checked={hapticOn}
                  onCheckedChange={setHapticOn}
                />
                <Switch
                  label="勿扰模式"
                  description="静音通知提醒"
                  checked={dndOn}
                  onCheckedChange={setDndOn}
                />
              </div>

              <div className="demo-panel" style={{ justifyContent: "center" }}>
                <span className="demo-panel__label">独立开关与禁用态</span>
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
            title="Slider"
            code={`import { Slider } from "m3eui";

<Slider
  label="媒体音量"
  showValue
  value={volume}
  onValueChange={setVolume}
  formatValue={(v) => \`\${v}%\`}
/>

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
                  label="媒体音量 (SM)"
                  showValue
                  value={volume}
                  onValueChange={setVolume}
                  formatValue={(v) => `${v}%`}
                />
                <Slider
                  size="md"
                  label="屏幕亮度 (MD · 刻度)"
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
                  label="价格区间 (Range)"
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
                  label="增益调节 (LG)"
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
            code={`import { Checkbox, CheckboxGroup, Radio, RadioGroup } from "m3eui";

<CheckboxGroup
  value={selectedPerms}
  allValues={["read", "write", "deploy"]}
  onValueChange={setSelectedPerms}
>
  <Checkbox parent label="全部权限" />
  <Checkbox value="read" label="读取代码" />
  <Checkbox value="write" label="推送提交" />
  <Checkbox value="deploy" label="生产部署" />
</CheckboxGroup>

<RadioGroup value={channel} onValueChange={setChannel}>
  <Radio value="push" label="即时推送" />
  <Radio value="email" label="邮件摘要" />
</RadioGroup>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">CheckboxGroup</span>
                <CheckboxGroup
                  aria-label="仓库权限"
                  value={selectedPerms}
                  allValues={[...ALL_PERMS]}
                  onValueChange={setSelectedPerms}
                >
                  <Checkbox parent label="全部权限" />
                  <div style={{ paddingInlineStart: 20, display: "flex", flexDirection: "column" }}>
                    <Checkbox value="read" label="读取代码" description="克隆与查看记录" />
                    <Checkbox value="write" label="推送提交" description="创建分支与合并请求" />
                    <Checkbox value="deploy" label="生产部署" description="触发发布流水线" />
                  </div>
                </CheckboxGroup>
              </div>

              <div className="demo-panel">
                <span className="demo-panel__label">RadioGroup</span>
                <RadioGroup
                  aria-label="通知渠道"
                  value={notifyChannel}
                  onValueChange={setNotifyChannel}
                >
                  <Radio value="push" label="即时推送" description="实时送达在线设备" />
                  <Radio value="email" label="邮件摘要" description="每日 18:00 汇总发送" />
                  <Radio value="none" label="仅站内信" description="不发送外部通知" />
                </RadioGroup>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="select"
            title="Select"
            code={`import { Select } from "m3eui";

<Select
  label="模型"
  variant="outlined"
  value={model}
  onValueChange={setModel}
  options={[
    { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  ]}
/>`}
          >
            <div className="demo-grid-2">
              <Select
                label="模型 (Outlined)"
                variant="outlined"
                value={modelId}
                onValueChange={setModelId}
                options={[
                  {
                    value: "gemini-2.5-pro",
                    label: "Gemini 2.5 Pro",
                    description: "复杂推理与编码",
                  },
                  {
                    value: "gemini-2.5-flash",
                    label: "Gemini 2.5 Flash",
                    description: "均衡速度与多模态",
                  },
                  {
                    value: "gemini-2.5-lite",
                    label: "Gemini 2.5 Flash-Lite",
                    description: "轻量低延迟批处理",
                  },
                ]}
              />

              <Select
                label="可用区 (Filled)"
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

        <div className="docs-category">
          <DocsCategoryHeader indexLabel="04" title={ui.navGroups[3]} />

          <ShowcaseCard
            id="carousel"
            title="Carousel"
            code={`import { Carousel } from "m3eui";

<Carousel
  aria-label="精选内容"
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
                Multi-Browse
              </Button>
              <Button
                size="xs"
                variant={carouselVariant === "hero" ? "filled" : "outlined"}
                onClick={() => setCarouselVariant("hero")}
              >
                Hero
              </Button>
            </div>

            <Carousel
              aria-label="精选轮播"
              variant={carouselVariant}
              items={CAROUSEL_DEMO_ITEMS}
              height={224}
            />
          </ShowcaseCard>

          <ShowcaseCard
            id="chips"
            title="Chip"
            code={`import { AssistChip, FilterChip, InputChip, Avatar } from "m3eui";

<AssistChip icon={<SparkleIcon />}>导出配置</AssistChip>
<FilterChip selected={selected} onSelectedChange={setSelected}>
  物理弹簧
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
                <span className="demo-panel__label">FilterChip & AssistChip</span>
                <div className="demo-row">
                  {[
                    { id: "spring", label: "物理弹簧" },
                    { id: "hct", label: "HCT 色彩" },
                    { id: "a11y", label: "Base UI" },
                    { id: "shapes", label: "多边形" },
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
                    onClick={() => toast({ title: "已生成配色" })}
                  >
                    生成配色
                  </AssistChip>
                  <AssistChip
                    elevated
                    icon={<SendIcon />}
                    onClick={() => toast({ title: "已导出 JSON" })}
                  >
                    导出 JSON
                  </AssistChip>
                </div>
              </div>

              <div className="demo-panel">
                <span className="demo-panel__label">InputChip</span>
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
                      恢复默认
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="avatar-badge"
            title="Avatar & Badge"
            code={`import { Avatar, Badge, IconButton } from "m3eui";

<Avatar size="lg" shape="cookie9Sided" fallback="M3" />
<Avatar size="lg" shape="clover4Leaf" fallback="UI" />
<Avatar size="lg" shape="sunny" fallback="EX" />

<Badge count={unreadCount}>
  <IconButton aria-label="通知" variant="tonal" icon={<BellIcon />} />
</Badge>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">Avatar</span>
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
                    <Tooltip key={shapeName} content={shapeName}>
                      <span>
                        <Avatar size="lg" shape={shapeName} fallback={initials} />
                      </span>
                    </Tooltip>
                  ))}
                </div>
              </div>

              <div className="demo-panel">
                <span className="demo-panel__label">Badge</span>
                <div className="demo-row" style={{ gap: 20 }}>
                  <Badge count={unreadCount}>
                    <IconButton
                      aria-label="通知"
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
                    +5
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
            title="Card"
            code={`import { Card } from "m3eui";

<Card
  variant="filled"
  interactive
  title="项目概览"
  subtitle="最近更新于 5 分钟前"
  onClick={() => toast({ title: "已打开详情" })}
>
  卡片内容区域。
</Card>`}
          >
            <div className="demo-grid-3">
              <Card
                variant="elevated"
                title="Elevated"
                subtitle="带柔和阴影"
                actions={
                  <Button
                    size="xs"
                    variant="tonal"
                    onClick={() => toast({ title: "已打开详情" })}
                  >
                    详情
                  </Button>
                }
              >
                用于突出展示独立内容块。
              </Card>

              <Card
                variant="outlined"
                title="Outlined"
                subtitle="描边容器"
                actions={
                  <Button
                    size="xs"
                    variant="outlined"
                    onClick={() => toast({ title: "已固定" })}
                  >
                    固定
                  </Button>
                }
              >
                适合并列信息分组与设置面板。
              </Card>

              <Card
                variant="filled"
                interactive
                title="Interactive"
                subtitle="可点击卡片"
                onClick={() => toast({ title: "已触发点击" })}
              >
                支持鼠标点击与键盘回车触发。
              </Card>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="accordion"
            title="Accordion"
            code={`import { Accordion } from "m3eui";

<Accordion
  defaultValue={["theme"]}
  items={[
    { value: "theme", title: "主题配置", content: "通过 m3e.json 配置种子色与对比度。" },
    { value: "i18n", title: "多语言支持", content: "内置中、英、日、阿四套语言包。" },
  ]}
/>`}
          >
            <Accordion
              aria-label="常见问题"
              defaultValue={["theme"]}
              items={[
                {
                  value: "theme",
                  leading: <SparkleIcon />,
                  title: "如何自定义主题色？",
                  subtitle: "m3e.json",
                  content: "修改 m3e.json 中的 theme.seed 字段，或向 M3EProvider 传入 initialSeedHex。",
                },
                {
                  value: "i18n",
                  leading: <HeartIcon />,
                  title: "如何扩展自定义语言包？",
                  subtitle: "m3eui/i18n",
                  content: "执行 npx m3eui locale fr-FR 生成词条模板，并通过 M3EProvider 的 messages 属性传入。",
                },
                {
                  value: "ssr",
                  leading: <BellIcon />,
                  title: "是否支持服务端渲染 (SSR)？",
                  subtitle: "Next.js / Remix",
                  content: "支持。可在 head 中注入 getM3EInitScript() 同步明暗模式状态。",
                },
              ]}
            />
          </ShowcaseCard>

          <ShowcaseCard
            id="preview-scroll-divider"
            title="PreviewCard, ScrollArea & Divider"
            code={`import { PreviewCard, ScrollArea, Divider } from "m3eui";

<PreviewCard trigger={<a href="#shapes">m3eui/tokens</a>}>
  <div>色彩、弹簧与多边形计算模块</div>
</PreviewCard>

<Divider label="模块列表" />
<ScrollArea maxHeight={160}>...</ScrollArea>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.7 }}>
                  悬停查看{" "}
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
                        m3eui/tokens
                      </a>
                    }
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Avatar size="sm" shape="sunny" fallback="TK" />
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>m3eui/tokens</div>
                          <div style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
                            v0.1.0
                          </div>
                        </div>
                      </div>
                      <Divider />
                      <div style={{ fontSize: 12.5, lineHeight: 1.55, color: "var(--m3e-color-on-surface-variant)" }}>
                        提供 HCT 色板生成、弹簧参数换算与 35 种归一化矢量多边形。
                      </div>
                    </div>
                  </PreviewCard>{" "}
                  模块信息。
                </div>

                <Divider label="分割线" />

                <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 13 }}>
                  <span>Tokens</span>
                  <Divider orientation="vertical" />
                  <span>Components</span>
                  <Divider orientation="vertical" />
                  <span>CLI</span>
                </div>
              </div>

              <ScrollArea maxHeight={156}>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13 }}>
                  <div style={{ fontWeight: 700 }}>子路径导出</div>
                  <div>1. m3eui — 组件与 Hooks</div>
                  <div>2. m3eui/styles.css — 核心样式表</div>
                  <div>3. m3eui/tokens — 色彩与物理令牌</div>
                  <div>4. m3eui/i18n — 多语言字典</div>
                  <div>5. m3eui/config — m3e.json 配置解析</div>
                  <div>6. m3eui/primitives — Base UI 无头原语</div>
                  <div>7. m3eui/cli — 命令行编程接口</div>
                </div>
              </ScrollArea>
            </div>
          </ShowcaseCard>
        </div>

        <div className="docs-category">
          <DocsCategoryHeader indexLabel="05" title={ui.navGroups[4]} />

          <ShowcaseCard
            id="top-app-bar"
            title="TopAppBar"
            code={`import { TopAppBar, IconButton } from "m3eui";

<TopAppBar
  variant="large-flexible"
  title="项目工作台"
  subtitle="最近同步于刚刚"
  collapsedFraction={scrollRatio}
  navigationIcon={<IconButton variant="standard" icon={<SparkleIcon />} aria-label="导航" />}
/>`}
          >
            <div className="demo-row" style={{ marginBottom: 10 }}>
              {(
                [
                  ["large-flexible", "Large Flexible"],
                  ["medium-flexible", "Medium Flexible"],
                  ["center-aligned", "Center Aligned"],
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
                title="项目工作台"
                subtitle="概览与构建状态"
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
                      aria-label="通知"
                    />
                    <IconButton
                      size="sm"
                      variant="tonal"
                      icon={<SendIcon />}
                      aria-label="发布"
                    />
                  </>
                }
              />
            </div>

            <Slider
              size="sm"
              label="折叠进度"
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
            title="NavigationBar & NavigationRail"
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
                    aria-label="新建"
                    variant="filled"
                    size="sm"
                    icon={<SparkleIcon />}
                    onClick={() => toast({ title: "已新建" })}
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
                  NavigationBar（当前：<code>{navDest}</code>）
                </span>
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
            title="Tabs"
            code={`import { Tabs, TabsList, Tab, TabsPanel } from "m3eui";

<Tabs variant="primary" value={tab} onValueChange={setTab}>
  <TabsList aria-label="项目视图">
    <Tab value="overview" icon={<SparkleIcon />}>概览</Tab>
    <Tab value="activity" icon={<BellIcon />} badge={3}>动态</Tab>
    <Tab value="messages" icon={<SendIcon />}>消息</Tab>
  </TabsList>
  <TabsPanel value="overview">概览内容</TabsPanel>
</Tabs>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">Primary</span>
                <Tabs
                  variant="primary"
                  value={primaryTab}
                  onValueChange={setPrimaryTab}
                >
                  <TabsList aria-label="主标签">
                    <Tab value="overview" icon={<SparkleIcon />}>
                      概览
                    </Tab>
                    <Tab value="alerts" icon={<BellIcon />} badge={3}>
                      通知
                    </Tab>
                    <Tab value="favorites" icon={<HeartIcon />}>
                      收藏
                    </Tab>
                  </TabsList>
                  <TabsPanel value="overview">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      项目运行状态正常。
                    </div>
                  </TabsPanel>
                  <TabsPanel value="alerts">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      3 条未读通知。
                    </div>
                  </TabsPanel>
                  <TabsPanel value="favorites">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      已收藏的常用预设。
                    </div>
                  </TabsPanel>
                </Tabs>
              </div>

              <div className="demo-panel">
                <span className="demo-panel__label">Secondary</span>
                <Tabs
                  variant="secondary"
                  value={secondaryTab}
                  onValueChange={setSecondaryTab}
                >
                  <TabsList aria-label="二级标签">
                    <Tab value="tokens">令牌</Tab>
                    <Tab value="a11y">键盘</Tab>
                    <Tab value="motion">动效</Tab>
                  </TabsList>
                  <TabsPanel value="tokens">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      色板与圆角参数配置。
                    </div>
                  </TabsPanel>
                  <TabsPanel value="a11y">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      支持方向键与 Home / End 切换。
                    </div>
                  </TabsPanel>
                  <TabsPanel value="motion">
                    <div style={{ fontSize: 13.5, color: "var(--m3e-color-on-surface-variant)" }}>
                      弹簧阻尼与刚度配置。
                    </div>
                  </TabsPanel>
                </Tabs>
              </div>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="segmented-list"
            title="SegmentedList"
            code={`import { SegmentedList, SegmentedListItem } from "m3eui";

<SegmentedList aria-label="构建流水线">
  <SegmentedListItem headline="单元测试" supportingText="56/56 通过" trailing="43ms" />
  <SegmentedListItem selected headline="构建产物" supportingText="ESM + d.ts" trailing="进行中" />
  <SegmentedListItem headline="部署预览" supportingText="Cloudflare Pages" trailing="排队中" />
</SegmentedList>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">多项分段列表</span>
                <SegmentedList aria-label="构建流水线">
                  {[
                    {
                      title: "类型检查",
                      desc: "tsc --noEmit",
                      meta: "通过",
                    },
                    {
                      title: "组件构建",
                      desc: "packages/m3eui",
                      meta: "进行中",
                    },
                    {
                      title: "静态站点打包",
                      desc: "apps/playground",
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
                <span className="demo-panel__label">单项列表</span>
                <SegmentedList aria-label="单项设置">
                  <SegmentedListItem
                    lines={2}
                    selected={singleListSelected}
                    onClick={() => setSingleListSelected((v) => !v)}
                    leading={<BellIcon />}
                    headline="版本更新通知"
                    supportingText="新版本发布时接收邮件提醒"
                    trailing={singleListSelected ? "已开启" : "未开启"}
                  />
                </SegmentedList>
              </div>
            </div>
          </ShowcaseCard>
        </div>

        <div className="docs-category">
          <DocsCategoryHeader indexLabel="06" title={ui.navGroups[5]} />

          <ShowcaseCard
            id="sheets"
            title="BottomSheet & SideSheet"
            code={`import { BottomSheet, SideSheet, SheetClose, Button } from "m3eui";

<BottomSheet
  trigger={<Button variant="filled">打开 BottomSheet</Button>}
  title="导出选项"
  footer={<SheetClose render={<Button variant="tonal">完成</Button>} />}
>
  ...
</BottomSheet>

<SideSheet
  side="right"
  trigger={<Button variant="tonal">打开 SideSheet</Button>}
  title="属性面板"
>
  ...
</SideSheet>`}
          >
            <div className="demo-row">
              <BottomSheet
                trigger={<Button variant="filled">BottomSheet</Button>}
                title="导出主题配置"
                description="选择要导出的样式格式"
                footer={
                  <>
                    <SheetClose render={<Button variant="text">取消</Button>} />
                    <SheetClose
                      render={
                        <Button
                          variant="filled"
                          onClick={() => toast({ title: "已复制 CSS 变量" })}
                        >
                          复制 CSS
                        </Button>
                      }
                    />
                  </>
                }
              >
                <div className="demo-row">
                  <FilterChip defaultSelected>light-dark() 变量</FilterChip>
                  <FilterChip defaultSelected>弹簧时间变量</FilterChip>
                  <FilterChip>压缩输出</FilterChip>
                </div>
              </BottomSheet>

              <SideSheet
                side="right"
                trigger={<Button variant="tonal">右侧 SideSheet</Button>}
                title="属性面板"
                footer={
                  <SheetClose render={<Button variant="filled">完成</Button>} />
                }
              >
                <Switch label="同步色相偏移" defaultChecked />
                <Slider
                  size="sm"
                  label="不透明度"
                  defaultValue={70}
                  showValue
                />
              </SideSheet>

              <SideSheet
                side="left"
                trigger={<Button variant="outlined">左侧 SideSheet</Button>}
                title="快捷导航"
              >
                <SegmentedList aria-label="快捷入口">
                  <SegmentedListItem headline="总览" trailing="⌘1" />
                  <SegmentedListItem selected headline="组件列表" trailing="⌘2" />
                  <SegmentedListItem headline="主题设置" trailing="⌘3" />
                </SegmentedList>
              </SideSheet>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="popover-menu"
            title="Popover, DropdownMenu & ContextMenu"
            code={`import { Popover, DropdownMenu, ContextMenu, Button } from "m3eui";

<Popover
  trigger={<Button variant="tonal">打开气泡</Button>}
  title="提示信息"
>
  ...
</Popover>

<DropdownMenu
  trigger={<Button variant="outlined">更多操作 ▾</Button>}
  items={[
    { id: "copy", label: "复制引用", shortcut: "⌘C" },
    { id: "delete", label: "删除", danger: true, separatorBefore: true },
  ]}
/>`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel">
                <span className="demo-panel__label">Popover & DropdownMenu</span>
                <div className="demo-row">
                  <Popover
                    trigger={<Button variant="tonal">Popover</Button>}
                    title="表面色阶"
                    description="使用五级 Surface Container 区分容器层级。"
                  >
                    <div className="demo-row" style={{ justifyContent: "flex-end" }}>
                      <PopoverClose render={<Button size="xs" variant="filled">关闭</Button>} />
                    </div>
                  </Popover>

                  <DropdownMenu
                    trigger={<Button variant="outlined">更多操作 ▾</Button>}
                    items={[
                      {
                        id: "tsx",
                        label: "复制代码",
                        icon: <SparkleIcon />,
                        shortcut: "⌘C",
                        onSelect: () => toast({ title: "已复制代码" }),
                      },
                      {
                        id: "share",
                        label: "分享链接",
                        icon: <SendIcon />,
                        shortcut: "⇧⌘L",
                        onSelect: () => toast({ title: "链接已生成" }),
                      },
                      {
                        id: "reset",
                        label: "删除快照",
                        icon: <TrashIcon />,
                        danger: true,
                        separatorBefore: true,
                        onSelect: () => toast({ title: "已删除" }),
                      },
                    ]}
                  />
                </div>
              </div>

              <ContextMenu
                items={[
                  {
                    id: "inspect",
                    label: "切换标尺",
                    icon: <SparkleIcon />,
                    shortcut: "⌥D",
                    onSelect: () => toast({ title: "已切换标尺" }),
                  },
                  {
                    id: "duplicate",
                    label: "复制节点",
                    icon: <SendIcon />,
                    shortcut: "⌘D",
                    onSelect: () => toast({ title: "已复制节点" }),
                  },
                  {
                    id: "remove",
                    label: "清空图层",
                    icon: <TrashIcon />,
                    danger: true,
                    separatorBefore: true,
                    onSelect: () => toast({ title: "已清空" }),
                  },
                ]}
              >
                <div className="context-canvas">
                  <strong style={{ color: "var(--m3e-color-on-surface)" }}>
                    右键点击此处
                  </strong>
                  <span>打开 ContextMenu</span>
                </div>
              </ContextMenu>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="dialog"
            title="Dialog & AlertDialog"
            code={`import { Dialog, DialogClose, AlertDialog, AlertDialogClose, Button } from "m3eui";

<Dialog
  trigger={<Button variant="filled">打开弹窗</Button>}
  icon={<SparkleIcon />}
  title="保存主题配置"
  description="将当前种子色与动效方案保存为默认配置。"
  actions={
    <>
      <DialogClose render={<Button variant="text">取消</Button>} />
      <DialogClose render={<Button variant="filled">保存</Button>} />
    </>
  }
/>`}
          >
            <div className="demo-row">
              <Dialog
                trigger={<Button variant="filled">Dialog</Button>}
                icon={<SparkleIcon />}
                title="导出主题配置"
                description="确认导出当前种子色与调色板配置。"
                actions={
                  <>
                    <DialogClose render={<Button variant="text">取消</Button>} />
                    <DialogClose
                      render={
                        <Button
                          variant="filled"
                          onClick={() =>
                            toast({
                              title: "已导出配置",
                              description: `${seedHex} · ${schemeVariant}`,
                            })
                          }
                        >
                          导出
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
                trigger={<Button variant="tonal">AlertDialog</Button>}
                icon={<TrashIcon />}
                title="重置本地设置？"
                description="此操作将恢复默认种子色与明暗模式设置。"
                actions={
                  <>
                    <AlertDialogClose render={<Button variant="text">取消</Button>} />
                    <AlertDialogClose
                      render={
                        <Button
                          variant="filled"
                          onClick={() =>
                            toast({
                              title: "已重置",
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
            title="Tooltip, RichTooltip & Toast"
            code={`import { Tooltip, RichTooltip, Button, useM3EToast } from "m3eui";

const { toast } = useM3EToast();

<Tooltip content="快捷键 ⌘K">
  <Button variant="outlined">Plain Tooltip</Button>
</Tooltip>

<RichTooltip subhead="快捷键" content="按下 ⌘K 打开组件搜索框。">
  <Button variant="tonal">Rich Tooltip</Button>
</RichTooltip>

<Button onClick={() => toast({ title: "已归档", actionLabel: "撤销" })}>
  触发通知
</Button>`}
          >
            <div className="demo-row">
              <Tooltip content="快捷键 ⌘K">
                <Button variant="outlined">Plain Tooltip</Button>
              </Tooltip>

              <RichTooltip
                subhead="主题同步"
                content="可执行 npx m3eui sync 将 m3e.json 编译为静态 CSS 变量。"
                action={
                  <Button
                    size="xs"
                    variant="text"
                    onClick={() => toast({ title: "已复制命令" })}
                  >
                    复制命令
                  </Button>
                }
              >
                <Button variant="tonal">Rich Tooltip</Button>
              </RichTooltip>

              <Button
                variant="filled"
                onClick={() =>
                  toast({
                    title: "配置已保存",
                    actionLabel: "撤销",
                    onAction: () => toast({ title: "已撤销" }),
                  })
                }
              >
                触发 Toast
              </Button>
            </div>
          </ShowcaseCard>

          <ShowcaseCard
            id="flat-progress-meter"
            title="Progress & Meter"
            code={`import {
  LinearProgressIndicator,
  CircularProgressIndicator,
  Meter,
} from "m3eui";

<LinearProgressIndicator label="上传进度" value={76} showValue thickness="thick" />
<CircularProgressIndicator value={76} size="lg" showValue />
<Meter label="显存占用" value={76} valueText="18.2 / 24 GB" />`}
          >
            <div className="demo-grid-2">
              <div className="demo-panel" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <LinearProgressIndicator
                  label="标准进度条"
                  value={gpuUsage}
                  showValue
                />
                <LinearProgressIndicator
                  label="加粗进度条 (Thick)"
                  thickness="thick"
                  value={gpuUsage}
                  showValue
                />
                <LinearProgressIndicator
                  label="不确定态 (Indeterminate)"
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
                  label="显存占用"
                  value={gpuUsage}
                  valueText={`${gpuUsage}% · ${(gpuUsage * 0.24).toFixed(1)} / 24 GB`}
                />
              </div>
            </div>

            <Slider
              size="sm"
              label="数值调节"
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
              label="波浪进度"
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
            title="MaterialShapeView"
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
                  label={`${fromShape} → ${toShape}`}
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
                <strong>m3eui v0.1.0</strong>
                <div className="docs-footer__sub">
                  Apache-2.0 · Built on @base-ui/react
                </div>
              </div>
            </div>
            <div className="demo-row" style={{ gap: 8 }}>
              <Button
                size="xs"
                variant="tonal"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {ui.backToTop}
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
