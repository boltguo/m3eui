import * as React from "react";
import {
  Accordion,
  Avatar,
  Breadcrumb,
  Button,
  ButtonGroup,
  Chip,
  CommandPalette,
  type CommandPaletteGroup,
  type CommandPaletteItem,
  ContextMenu,
  DropdownMenu,
  FAB,
  IconButton,
  Kbd,
  Menubar,
  NavigationBar,
  type NavigationDestination,
  NavigationMenu,
  type NavigationMenuItemSpec,
  NavigationRail,
  NavigationSuite,
  type NavigationSuiteLayout,
  Pagination,
  Popover,
  PopoverClose,
  SearchBar,
  type SearchSuggestion,
  SearchView,
  Sidebar,
  Slider,
  Switch,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  TopAppBar,
  useM3EToast,
} from "m3eui";
import { useCopyResolver } from "../../i18n";
import {
  BarChartIcon,
  BellIcon,
  CodeBracketsIcon,
  CopyIcon,
  DownloadIcon,
  EditIcon,
  FolderIcon,
  HeartIcon,
  HomeGlyph,
  PlusIcon,
  RefreshIcon,
  SearchIcon,
  SettingsGearIcon,
  ShareIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TerminalIcon,
  TrashIcon,
  UsersIcon,
} from "../../layout/Icons";
import type { ComponentDocSpec } from "../types";

const STACK_COL: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
  width: "100%",
};

const ROW_WRAP: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  alignItems: "center",
  gap: 12,
};

function MenuHamburgerGlyph() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
    </svg>
  );
}

function NavigationBarDemo() {
  const copy = useCopyResolver();
  const [active, setActive] = React.useState("home");

  const items: readonly NavigationDestination[] = [
    {
      value: "home",
      label: copy({ zh: "概览", en: "Home" }),
      icon: <HomeGlyph size={18} />,
    },
    {
      value: "analytics",
      label: copy({ zh: "统计", en: "Analytics" }),
      icon: <BarChartIcon size={18} />,
      badgeDot: true,
    },
    {
      value: "inbox",
      label: copy({ zh: "通知", en: "Inbox" }),
      icon: <BellIcon size={18} />,
      badgeCount: 12,
    },
    {
      value: "settings",
      label: copy({ zh: "设置", en: "Settings" }),
      icon: <SettingsGearIcon size={18} />,
    },
  ];

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 460,
        borderRadius: 20,
        overflow: "hidden",
        border: "1px solid var(--m3e-color-outline-variant)",
        background: "var(--m3e-color-surface-container-lowest)",
      }}
    >
      <div
        style={{
          padding: "20px 18px",
          fontSize: 13.5,
          color: "var(--m3e-color-on-surface-variant)",
        }}
      >
        {copy({
          zh: `当前激活视图：${active}`,
          en: `Active destination: ${active}`,
        })}
      </div>
      <NavigationBar
        items={items}
        value={active}
        onValueChange={setActive}
        style={{
          borderRadius: 0,
          borderInline: 0,
          borderBlockEnd: 0,
        }}
      />
    </div>
  );
}

function useRailItems(): readonly NavigationDestination[] {
  const copy = useCopyResolver();
  return [
    {
      value: "projects",
      label: copy({ zh: "工作区", en: "Projects" }),
      icon: <FolderIcon size={18} />,
      badgeCount: 4,
    },
    {
      value: "team",
      label: copy({ zh: "成员", en: "Members" }),
      icon: <UsersIcon size={18} />,
    },
    {
      value: "security",
      label: copy({ zh: "安全审计", en: "Security" }),
      icon: <ShieldCheckIcon size={18} />,
      badgeDot: true,
    },
    {
      value: "settings",
      label: copy({ zh: "设置", en: "Settings" }),
      icon: <SettingsGearIcon size={18} />,
    },
  ];
}

function NavigationRailDemo() {
  const items = useRailItems();
  const [railVal, setRailVal] = React.useState("projects");
  const [wideVal, setWideVal] = React.useState("projects");

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 20, alignItems: "stretch" }}>
      <NavigationRail
        items={items}
        value={railVal}
        onValueChange={setRailVal}
        header={<FAB size="sm" icon={<PlusIcon size={18} />} aria-label="Create" />}
      />
      <NavigationRail
        collapsible
        defaultExpanded
        items={items}
        value={wideVal}
        onValueChange={setWideVal}
      />
    </div>
  );
}

function NavigationRailModalDemo() {
  const copy = useCopyResolver();
  const items = useRailItems();
  const [active, setActive] = React.useState("projects");

  return (
    <NavigationRail
      modal
      items={items}
      value={active}
      onValueChange={setActive}
      trigger={
        <Button variant="tonal" leadingIcon={<MenuHamburgerGlyph />}>
          {copy({ zh: "打开导航", en: "Open navigation" })}
        </Button>
      }
    />
  );
}

function SidebarDemo() {
  const copy = useCopyResolver();
  const [active, setActive] = React.useState("button");
  const [query, setQuery] = React.useState("");
  const [open, setOpen] = React.useState(false);

  const groups: readonly [string, readonly string[]][] = [
    [copy({ zh: "操作", en: "Actions" }), ["Button", "IconButton", "ButtonGroup", "SplitButton", "FAB"]],
    [copy({ zh: "输入", en: "Inputs" }), ["TextField", "NumberField", "Select", "Combobox", "DatePicker", "TimePicker"]],
    [copy({ zh: "选择", en: "Selection" }), ["Checkbox", "RadioGroup", "Switch", "Slider"]],
    [copy({ zh: "展示", en: "Display" }), ["Card", "List", "Chip", "Avatar", "Badge", "Carousel"]],
  ];
  const q = query.trim().toLowerCase();
  const items: readonly NavigationDestination[] = groups.flatMap(([section, names]) =>
    names
      .filter((name) => !q || name.toLowerCase().includes(q))
      .map((name) => ({ value: name.toLowerCase(), label: name, section })),
  );

  return (
    <div className="demo-sidebar-frame">
      <Sidebar
        items={items}
        value={active}
        onValueChange={setActive}
        open={open}
        onOpenChange={setOpen}
        header={
          <SearchBar
            size="sm"
            value={query}
            onValueChange={setQuery}
            placeholder={copy({ zh: "筛选", en: "Filter" })}
            aria-label={copy({ zh: "筛选", en: "Filter" })}
          />
        }
        style={{ maxBlockSize: 380 }}
      />
      <div className="demo-sidebar-frame__content">
        <IconButton
          className="demo-narrow-only"
          variant="standard"
          size="sm"
          aria-label={copy({ zh: "打开侧栏", en: "Open sidebar" })}
          icon={<MenuHamburgerGlyph />}
          onClick={() => setOpen(true)}
        />
        <strong style={{ fontSize: 18 }}>{items.find((i) => i.value === active)?.label ?? active}</strong>
      </div>
    </div>
  );
}

function NavigationSuiteAdaptiveDemo() {
  const copy = useCopyResolver();
  const [layout, setLayout] = React.useState<NavigationSuiteLayout>("auto");
  const [active, setActive] = React.useState("overview");

  const items: readonly NavigationDestination[] = [
    {
      value: "overview",
      label: copy({ zh: "总览", en: "Overview" }),
      icon: <HomeGlyph size={18} />,
    },
    {
      value: "metrics",
      label: copy({ zh: "遥测", en: "Telemetry" }),
      icon: <BarChartIcon size={18} />,
      badgeCount: 5,
    },
    {
      value: "repos",
      label: copy({ zh: "代码库", en: "Packages" }),
      icon: <CodeBracketsIcon size={18} />,
    },
  ];

  return (
    <div style={STACK_COL}>
      <ButtonGroup
        variant="connected"
        selectionMode="single"
        size="xs"
        value={[layout]}
        onValueChange={(vals) => {
          const next = vals[0] as NavigationSuiteLayout | undefined;
          if (next) setLayout(next);
        }}
        items={[
          { value: "auto", label: "auto" },
          { value: "bar", label: "bar" },
          { value: "rail", label: "rail" },
          { value: "expanded-rail", label: "expanded-rail" },
        ]}
      />

      <NavigationSuite
        layout={layout}
        items={items}
        value={active}
        onValueChange={setActive}
        style={{ minHeight: 220 }}
      >
        <div style={{ padding: 20 }}>
          <strong style={{ fontSize: 15 }}>{active}</strong>
        </div>
      </NavigationSuite>
    </div>
  );
}

function BreadcrumbCustomRenderDemo() {
  const copy = useCopyResolver();
  const [selectedCrumb, setSelectedCrumb] = React.useState("Pagination.tsx");

  return (
    <div style={STACK_COL}>
      <Breadcrumb
        separator="chevron"
        items={[
          {
            key: "repo",
            label: "m3eui",
            icon: <CodeBracketsIcon size={14} />,
            render: <a href="#repo" />,
            onClick: (e) => {
              e.preventDefault();
              setSelectedCrumb("m3eui");
            },
          },
          {
            key: "pkg",
            label: "components",
            icon: <FolderIcon size={14} />,
            render: <a href="#components" />,
            onClick: (e) => {
              e.preventDefault();
              setSelectedCrumb("components");
            },
          },
          {
            key: "file",
            label: "Pagination.tsx",
            onClick: (e) => {
              e.preventDefault();
              setSelectedCrumb("Pagination.tsx");
            },
          },
        ]}
      />
      <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
        {copy({
          zh: `最近点击路由节点：${selectedCrumb}`,
          en: `Last activated route segment: ${selectedCrumb}`,
        })}
      </span>
    </div>
  );
}

function PaginationBasicDemo() {
  const copy = useCopyResolver();
  const [page, setPage] = React.useState(4);

  return (
    <div style={STACK_COL}>
      <Pagination page={page} totalPages={12} onPageChange={setPage} />
      <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
        {copy({
          zh: `受控当前页码：第 ${page} / 12 页（激活页自动形变为 12px 圆角矩形）`,
          en: `Controlled page: ${page} of 12 (active page morphs from pill to 12px squircle)`,
        })}
      </span>
    </div>
  );
}

function PaginationSummaryDemo() {
  const [page, setPage] = React.useState(2);

  return (
    <Pagination
      page={page}
      onPageChange={setPage}
      totalItems={248}
      pageSize={20}
      showSummary
    />
  );
}

function DropdownMenuRichDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [showGrid, setShowGrid] = React.useState(true);
  const [showRuler, setShowRuler] = React.useState(false);
  const [density, setDensity] = React.useState<"comfortable" | "compact">("comfortable");

  return (
    <div style={ROW_WRAP}>
      <DropdownMenu
        trigger={
          <Button variant="tonal" leadingIcon={<SettingsGearIcon size={16} />}>
            {copy({ zh: "打开多级分段菜单", en: "Open rich DropdownMenu" })}
          </Button>
        }
        items={[
          {
            id: "duplicate",
            label: copy({ zh: "克隆画布节点", en: "Duplicate artboard" }),
            icon: <CopyIcon size={15} />,
            shortcut: "⌘D",
            onSelect: () => toast({ title: copy({ zh: "已克隆节点", en: "Artboard duplicated" }) }),
          },
          {
            id: "export",
            label: copy({ zh: "导出主题产物", en: "Export theme bundle" }),
            icon: <DownloadIcon size={15} />,
            submenu: [
              {
                id: "export-json",
                label: "m3e.json (HCT Config)",
                onSelect: () => toast({ title: "Exported m3e.json" }),
              },
              {
                id: "export-css",
                label: "tokens.css (CSS Variables)",
                onSelect: () => toast({ title: "Exported tokens.css" }),
              },
            ],
          },
          {
            id: "grid",
            separatorBefore: true,
            label: copy({ zh: "显示基线网格", en: "Show baseline grid" }),
            checked: showGrid,
            onCheckedChange: setShowGrid,
            shortcut: "⌘'",
          },
          {
            id: "ruler",
            label: copy({ zh: "几何圆角标尺 HUD", en: "Geometry ruler HUD" }),
            checked: showRuler,
            onCheckedChange: setShowRuler,
          },
          {
            id: "density-comfortable",
            separatorBefore: true,
            label: copy({ zh: "密度：标准舒适", en: "Density: Comfortable" }),
            checked: density === "comfortable",
            onCheckedChange: () => setDensity("comfortable"),
          },
          {
            id: "density-compact",
            label: copy({ zh: "密度：紧凑排布", en: "Density: Compact" }),
            checked: density === "compact",
            onCheckedChange: () => setDensity("compact"),
          },
          {
            id: "delete",
            separatorBefore: true,
            danger: true,
            icon: <TrashIcon size={15} />,
            label: copy({ zh: "删除当前画板", en: "Delete artboard" }),
            shortcut: "⌫",
            onSelect: () =>
              toast({
                title: copy({ zh: "画板已移至回收站", en: "Moved to trash" }),
                type: "error",
              }),
          },
        ]}
      />
      <Chip tone="neutral" size="sm">
        {`grid:${showGrid ? "on" : "off"} · ${density}`}
      </Chip>
      <DropdownMenu
        theme="vibrant"
        variant="segmented"
        trigger={<Button variant="filled">Vibrant Segmented Groups</Button>}
        items={[
          { id: "v-pin", label: "Pin to workspace", shortcut: "⌘P" },
          { id: "v-share", label: "Share link", shortcut: "⇧⌘S" },
          { id: "v-archive", separatorBefore: true, label: "Archive thread" },
          { id: "v-del", danger: true, label: "Delete permanently" },
        ]}
      />
    </div>
  );
}

function ContextMenuCanvasDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();

  return (
    <ContextMenu
      items={[
        {
          id: "inspect",
          label: copy({ zh: "检查弹簧帧率", en: "Inspect spring telemetry" }),
          icon: <SparkleIcon size={15} />,
          shortcut: "⌥⌘I",
          onSelect: () => toast({ title: "Spring ODE inspector opened" }),
        },
        {
          id: "share",
          label: copy({ zh: "分享快照链接", en: "Share snapshot" }),
          icon: <ShareIcon size={15} />,
          submenu: [
            {
              id: "copy-url",
              label: copy({ zh: "复制永久链接", en: "Copy permalink" }),
              onSelect: () => toast({ title: "Permalink copied" }),
            },
            {
              id: "export-svg",
              label: copy({ zh: "复制 SVG 路径", en: "Copy SVG path" }),
              onSelect: () => toast({ title: "SVG path copied" }),
            },
          ],
        },
        {
          id: "reset",
          separatorBefore: true,
          danger: true,
          icon: <TrashIcon size={15} />,
          label: copy({ zh: "清空画布缓存", en: "Purge canvas cache" }),
          onSelect: () => toast({ title: "Canvas cache cleared" }),
        },
      ]}
    >
      <div
        style={{
          padding: "28px 20px",
          borderRadius: 18,
          border: "1.5px dashed var(--m3e-color-outline)",
          background: "var(--m3e-color-surface-container-low)",
          color: "var(--m3e-color-on-surface-variant)",
          textAlign: "center",
          fontSize: 13.5,
          cursor: "context-menu",
          userSelect: "none",
        }}
      >
        {copy({
          zh: "在此交互画布区域内点击鼠标右键（或触控板双指点按）打开 ContextMenu",
          en: "Right-click (or two-finger tap) anywhere inside this surface to open ContextMenu",
        })}
      </div>
    </ContextMenu>
  );
}

function MenubarAppDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [wordWrap, setWordWrap] = React.useState(true);

  return (
    <Menubar
      menus={[
        {
          id: "file",
          label: copy({ zh: "文件 (File)", en: "File" }),
          items: [
            {
              id: "new-theme",
              label: copy({ zh: "新建主题配置", en: "New theme config" }),
              icon: <PlusIcon size={15} />,
              shortcut: "⌘N",
              onSelect: () => toast({ title: "Created untitled m3e.json" }),
            },
            {
              id: "export",
              label: copy({ zh: "导出 CSS 令牌", en: "Export CSS tokens" }),
              icon: <DownloadIcon size={15} />,
              shortcut: "⇧⌘E",
              onSelect: () => toast({ title: "Exported tokens.css" }),
            },
          ],
        },
        {
          id: "edit",
          label: copy({ zh: "编辑 (Edit)", en: "Edit" }),
          items: [
            {
              id: "copy-seed",
              label: copy({ zh: "复制 HCT 种子色", en: "Copy HCT seed hex" }),
              icon: <CopyIcon size={15} />,
              shortcut: "⌘C",
              onSelect: () => toast({ title: "Copied #6750A4" }),
            },
            {
              id: "rename",
              label: copy({ zh: "重命名方案", en: "Rename scheme" }),
              icon: <EditIcon size={15} />,
            },
          ],
        },
        {
          id: "view",
          label: copy({ zh: "视图 (View)", en: "View" }),
          items: [
            {
              id: "wrap",
              label: copy({ zh: "代码自动换行", en: "Word wrap" }),
              checked: wordWrap,
              onCheckedChange: setWordWrap,
              shortcut: "⌥Z",
            },
          ],
        },
      ]}
    />
  );
}

function PopoverFilterDemo() {
  const copy = useCopyResolver();
  const [contrast, setContrast] = React.useState(50);
  const [includeExperimental, setIncludeExperimental] = React.useState(true);

  return (
    <div style={ROW_WRAP}>
      <Popover
        title={copy({ zh: "渲染管线筛选器", en: "Pipeline filter settings" })}
        description={copy({
          zh: "实时调整预览视口的对比度增益与实验特性开关。",
          en: "Tune contrast boost and experimental polygon morph flags.",
        })}
        trigger={
          <Button variant="outlined" leadingIcon={<SettingsGearIcon size={16} />}>
            {copy({ zh: "打开 Popover 设置面板", en: "Open filter Popover" })}
          </Button>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14, paddingTop: 8, minWidth: 250 }}>
          <Slider
            label={copy({ zh: "色度增益", en: "Chroma boost" })}
            value={contrast}
            onValueChange={setContrast}
            min={0}
            max={100}
            showValue
          />
          <Switch
            label={copy({ zh: "包含实验性组件", en: "Include experimental specs" })}
            checked={includeExperimental}
            onCheckedChange={setIncludeExperimental}
          />
          <div style={{ display: "flex", justifyContent: "flex-end" }}>
            <PopoverClose
              render={<Button size="xs" variant="tonal">{copy({ zh: "完成", en: "Done" })}</Button>}
            />
          </div>
        </div>
      </Popover>
    </div>
  );
}

function NavigationMenuSiteDemo() {
  const copy = useCopyResolver();

  const items: readonly NavigationMenuItemSpec[] = [
    {
      value: "foundations",
      label: copy({ zh: "设计基础", en: "Foundations" }),
      featured: {
        eyebrow: "SPEC_2025",
        title: copy({ zh: "AOSP Monet 动态色彩", en: "AOSP Monet Dynamic Color" }),
        description: copy({
          zh: "零外部依赖自包含 HCT 感知色彩空间与 9 种调色板。",
          en: "Self-contained perceptual HCT color space and 9 scheme variants.",
        }),
        href: "#navigation-menu",
        onClick: (e) => e.preventDefault(),
      },
      links: [
        {
          id: "spring",
          title: copy({ zh: "解析物理弹簧", en: "Analytical Springs" }),
          description: copy({ zh: "二阶微分方程闭合解", en: "Closed-form second-order ODE" }),
          href: "#navigation-menu",
          icon: <SparkleIcon size={16} />,
          onClick: (e) => e.preventDefault(),
        },
        {
          id: "shapes",
          title: copy({ zh: "35 种圆角多边形", en: "35 Material Polygons" }),
          description: copy({ zh: "平滑三次贝塞尔顶点插值", en: "Cubic Bezier morphing paths" }),
          href: "#navigation-menu",
          icon: <HeartIcon size={16} />,
          badge: "35",
          onClick: (e) => e.preventDefault(),
        },
      ],
    },
    {
      value: "tooling",
      label: copy({ zh: "开发者工具", en: "Developer Tooling" }),
      links: [
        {
          id: "cli",
          title: "m3e CLI",
          description: copy({ zh: "按需拷贝源码级组件", en: "Copy-paste source registry CLI" }),
          href: "#navigation-menu",
          icon: <TerminalIcon size={16} />,
          onClick: (e) => e.preventDefault(),
        },
        {
          id: "a11y",
          title: "Base UI Primitives",
          description: copy({ zh: "WAI-ARIA 键盘与焦点管理", en: "WAI-ARIA keyboard & focus management" }),
          href: "#navigation-menu",
          icon: <ShieldCheckIcon size={16} />,
          onClick: (e) => e.preventDefault(),
        },
      ],
    },
    {
      value: "changelog",
      label: copy({ zh: "更新日志", en: "Changelog" }),
      href: "#navigation-menu",
      onClick: (e) => e.preventDefault(),
    },
  ];

  return (
    <NavigationMenu
      brand={<strong style={{ fontSize: 14, paddingInline: 8 }}>m3eui</strong>}
      items={items}
    />
  );
}

function CommandPaletteModalDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [open, setOpen] = React.useState(false);

  const groups: readonly CommandPaletteGroup[] = [
    {
      id: "navigation",
      heading: copy({ zh: "快速跳转", en: "Quick Jump" }),
      items: [
        {
          id: "go-tokens",
          label: copy({ zh: "打开主题与动效工作台", en: "Open Theme & Motion Studio" }),
          description: copy({ zh: "调整 HCT 种子色与对比度", en: "Customize HCT seed hex and contrast" }),
          icon: <SparkleIcon size={16} />,
          shortcut: "⇧⌘T",
          keywords: ["theme", "color", "hct", "studio"],
          onSelect: () =>
            toast({ title: copy({ zh: "已执行：打开主题工作台", en: "Executed: Open Theme Studio" }) }),
        },
        {
          id: "go-cli",
          label: copy({ zh: "复制 CLI 初始化命令", en: "Copy CLI init command" }),
          description: "npx m3eui init --variant expressive",
          icon: <TerminalIcon size={16} />,
          shortcut: "⌘I",
          keywords: ["cli", "install", "npx"],
          onSelect: () =>
            toast({
              title: copy({ zh: "已复制 npx m3eui init", en: "Copied npx m3eui init" }),
              type: "success",
            }),
        },
      ],
    },
    {
      id: "actions",
      heading: copy({ zh: "系统操作", en: "Workspace Actions" }),
      items: [
        {
          id: "export-json",
          label: copy({ zh: "导出 m3e.json 配置文件", en: "Export m3e.json configuration" }),
          icon: <DownloadIcon size={16} />,
          shortcut: "⌘E",
          onSelect: () => toast({ title: "Exported m3e.json" }),
        },
      ],
    },
  ];

  return (
    <div style={ROW_WRAP}>
      <Button
        leadingIcon={<SearchIcon size={16} />}
        onClick={() => setOpen(true)}
      >
        {copy({ zh: "打开命令面板 (CommandPalette)", en: "Launch CommandPalette" })}
      </Button>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        groups={groups}
        placeholder={copy({
          zh: "输入命令名称、关键字或快捷键检索…",
          en: "Type a command or search keywords…",
        })}
      />
    </div>
  );
}

function CommandPaletteFilteredDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [open, setOpen] = React.useState(false);

  const items: readonly CommandPaletteItem[] = [
    {
      id: "sync-locales",
      label: copy({ zh: "同步 CLDR 多语言词典", en: "Sync CLDR locale dictionaries" }),
      description: "zh-CN · en-US · ja-JP · ar-SA",
      icon: <RefreshIcon size={16} />,
      keywords: ["i18n", "rtl", "locale"],
      onSelect: () => toast({ title: "Locales synchronized", type: "success" }),
    },
    {
      id: "publish-prod",
      label: copy({ zh: "发布生产镜像（需管理员权限）", en: "Publish production release (Admin required)" }),
      description: copy({ zh: "当前预览账号处于只读权限", en: "Disabled for read-only preview sessions" }),
      icon: <ShieldCheckIcon size={16} />,
      shortcut: "⇧⌘P",
      disabled: true,
      onSelect: () => {},
    },
    {
      id: "purge-edge",
      label: copy({ zh: "清除全球 CDN 缓存（维护锁定中）", en: "Purge global CDN cache (Locked)" }),
      icon: <TrashIcon size={16} />,
      disabled: true,
      onSelect: () => {},
    },
  ];

  return (
    <div style={ROW_WRAP}>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        {copy({ zh: "测试禁用项与自定义空状态", en: "Open with disabled commands" })}
      </Button>
      <Chip size="sm" tone="secondary">
        {copy({
          zh: "提示：输入 i18n 检索别名，上下方向键自动跳过 disabled 项",
          en: "Tip: Type 'i18n' to match keywords; Arrow keys skip disabled items",
        })}
      </Chip>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        items={items}
        placeholder={copy({
          zh: "试试输入 i18n 或不存在的词查看空提示…",
          en: "Try typing 'i18n' or an unmatched query…",
        })}
        emptyMessage={copy({
          zh: "未找到匹配的工作区指令，请尝试其他关键字。",
          en: "No matching workspace commands — try another keyword.",
        })}
      />
    </div>
  );
}

function CommandPaletteShortcutDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [listenShortcut, setListenShortcut] = React.useState(false);
  const [open, setOpen] = React.useState(false);

  return (
    <div style={STACK_COL}>
      <div style={ROW_WRAP}>
        <Switch
          label={copy({
            zh: "启用当前示例全局快捷键监听 (⌘K / Ctrl+K)",
            en: "Enable ⌘K / Ctrl+K listener on this demo instance",
          })}
          checked={listenShortcut}
          onCheckedChange={setListenShortcut}
        />
        <Button size="xs" variant="tonal" onClick={() => setOpen(true)}>
          {copy({ zh: "手动唤起", en: "Open palette" })}
        </Button>
      </div>
      <CommandPalette
        open={open}
        onOpenChange={setOpen}
        enableShortcut={listenShortcut}
        footerHint={copy({
          zh: "↑↓ 移动焦点 · Enter 立即执行 · Esc 关闭面板",
          en: "↑↓ Navigate · Enter Execute · Esc Close",
        })}
        items={[
          {
            id: "copy-config",
            label: copy({ zh: "复制当前主题 JSON", en: "Copy active theme JSON" }),
            icon: <CopyIcon size={16} />,
            shortcut: "⌘C",
            onSelect: () => toast({ title: "Copied m3e.json" }),
          },
        ]}
      />
    </div>
  );
}

function TopAppBarFlexibleDemo() {
  const copy = useCopyResolver();
  const [fraction, setFraction] = React.useState(25);

  return (
    <div style={STACK_COL}>
      <Slider
        label={copy({
          zh: "模拟滚动折叠比例 (collapsedFraction)",
          en: "Simulated scroll collapse (collapsedFraction)",
        })}
        value={fraction}
        onValueChange={setFraction}
        min={0}
        max={100}
        formatValue={(v) => `${(v / 100).toFixed(2)}`}
        showValue
      />

      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid var(--m3e-color-outline-variant)",
        }}
      >
        <TopAppBar
          variant="medium-flexible"
          collapsedFraction={fraction / 100}
          title={copy({ zh: "Medium Flexible 应用栏", en: "Medium Flexible App Bar" })}
          subtitle={copy({
            zh: "随滚动比例在双行大标题与单行紧凑栏之间弹性插值",
            en: "Smoothly interpolates height and typography from 112px two-row to 64px single-row",
          })}
          navigationIcon={
            <IconButton icon={<MenuHamburgerGlyph />} aria-label="Menu" />
          }
          actions={
            <>
              <IconButton icon={<SearchIcon size={18} />} aria-label="Search" />
              <IconButton icon={<BellIcon size={18} />} aria-label="Notifications" />
            </>
          }
        />
      </div>

      <div
        style={{
          borderRadius: 18,
          overflow: "hidden",
          border: "1px solid var(--m3e-color-outline-variant)",
        }}
      >
        <TopAppBar
          variant="large-flexible"
          collapsedFraction={fraction / 100}
          title={copy({ zh: "Large Flexible 沉浸顶栏", en: "Large Flexible Hero Bar" })}
          subtitle={copy({
            zh: "148px 展开高度，折叠超过 0.72 阈值时自动收拢至顶行",
            en: "148px expanded height that reflows inline once collapsedFraction crosses 0.72",
          })}
          navigationIcon={
            <IconButton icon={<MenuHamburgerGlyph />} aria-label="Menu" />
          }
          actions={
            <IconButton icon={<SettingsGearIcon size={18} />} aria-label="Settings" />
          }
        />
      </div>
    </div>
  );
}

function SearchBarSuggestionsDemo() {
  const copy = useCopyResolver();
  const { toast } = useM3EToast();
  const [query, setQuery] = React.useState("");

  const suggestions: readonly SearchSuggestion[] = [
    {
      value: "alert",
      label: "Alert",
      category: copy({ zh: "反馈", en: "Feedback" }),
      description: copy({ zh: "多严重度内联状态横幅", en: "Inline status callout banner" }),
      icon: <BellIcon size={16} />,
    },
    {
      value: "pagination",
      label: "Pagination",
      category: copy({ zh: "导航", en: "Navigation" }),
      description: copy({ zh: "弹簧圆角形变分页器", en: "Spring-morphing page navigation" }),
      icon: <SparkleIcon size={16} />,
    },
    {
      value: "command-palette",
      label: "CommandPalette",
      category: copy({ zh: "导航", en: "Navigation" }),
      description: copy({ zh: "全局模态命令检索面板", en: "Modal command launcher (⌘K)" }),
      icon: <TerminalIcon size={16} />,
    },
    {
      value: "wavy",
      label: "LinearProgressIndicator",
      category: copy({ zh: "反馈", en: "Feedback" }),
      description: copy({ zh: "正弦波浪进度指示器", en: "Expressive sinusoidal progress bar" }),
      icon: <BarChartIcon size={16} />,
    },
  ];

  return (
    <div style={{ maxWidth: 480, width: "100%" }}>
      <SearchBar
        value={query}
        onValueChange={setQuery}
        suggestions={suggestions}
        placeholder={copy({
          zh: "搜索组件（点击输入框即可展开建议列表）…",
          en: "Search components (click to browse autocomplete)…",
        })}
        onSearchSubmit={(submitted) =>
          toast({
            title: copy({
              zh: `检索提交：${submitted || "(空)"}`,
              en: `Submitted query: ${submitted || "(empty)"}`,
            }),
          })
        }
      />
    </div>
  );
}

function SearchViewModesDemo() {
  const [recent, setRecent] = React.useState<string[]>([
    "fastSpatial spring",
    "TonalPalette",
  ]);
  const [open, setOpen] = React.useState(false);
  const copy = useCopyResolver();

  const suggestions: readonly SearchSuggestion[] = [
    { value: "color-picker", label: "ColorPicker", category: "Inputs", description: "Native HCT picker" },
    { value: "badge", label: "Badge", category: "Display", description: "Count & dot notification badge" },
    { value: "chip", label: "Chip", category: "Display", description: "Semantic & M3 interactive chips" },
  ];

  return (
    <>
      <Button variant="tonal" onClick={() => setOpen(true)}>
        {copy({ zh: "打开搜索", en: "Open search" })}
      </Button>
      <SearchView
        open={open}
        onOpenChange={setOpen}
        recentSearches={recent}
        onClearRecent={() => setRecent([])}
        suggestions={suggestions}
      />
    </>
  );
}

function PopoverHoverDemo() {
  const copy = useCopyResolver();

  return (
    <div style={{ fontSize: 14, color: "var(--m3e-color-on-surface)" }}>
      {copy({ zh: "将指针悬停在组件库维护者 ", en: "Hover over maintainer handle " })}
      <Popover
        openOnHover
        trigger={
          <a
            href="#popover-hover"
            onClick={(e) => e.preventDefault()}
            style={{
              color: "var(--m3e-color-primary)",
              fontWeight: 650,
              textDecoration: "underline",
              textUnderlineOffset: 3,
            }}
          >
            @m3e-design-core
          </a>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar fallback="M3" shape="clover4Leaf" size="md" />
            <div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>M3E Design Engineering</div>
              <div style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
                @m3e-design-core · SPEC_2025
              </div>
            </div>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
            {copy({
              zh: "负责维护 HCT 色彩空间算法、35 种圆角多边形路径与 Base UI 无障碍原语封装。",
              en: "Maintains HCT color science, 35 morphing rounded polygons, and accessible Base UI primitives.",
            })}
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <Chip size="sm" tone="primary">
              45 Modules
            </Chip>
            <Chip size="sm" tone="success">
              WCAG AAA Ready
            </Chip>
          </div>
        </div>
      </Popover>
      {copy({ zh: " 即可预览悬浮资料卡片。", en: " to inspect the rich hover card." })}
    </div>
  );
}

export const NAVIGATION_COMPONENT_DOCS: readonly ComponentDocSpec[] = [
  {
    slug: "navigation-bar",
    title: "NavigationBar",
    subtitle: {
      zh: "紧凑屏底部一级导航，3–5 个目标。",
      en: "Bottom primary navigation for compact windows, 3–5 destinations.",
    },
    importStatement: 'import { NavigationBar } from "m3eui";',
    scenarios: [
      {
        id: "navigation-bar",
        title: { zh: "角标", en: "Badges" },
        description: { zh: "计数与圆点角标。", en: "Count and dot badges." },
        code: `<NavigationBar
  value={active}
  onValueChange={setActive}
  items={[
    { value: "home", label: "Home", icon: <HomeGlyph /> },
    { value: "analytics", label: "Analytics", icon: <BarChartIcon />, badgeDot: true },
    { value: "inbox", label: "Inbox", icon: <BellIcon />, badgeCount: 12 },
  ]}
/>`,
        render: () => <NavigationBarDemo />,
      },
    ],
    apis: [
      {
        title: "NavigationDestination<Value>",
        rows: [
          { name: "value", type: "Value extends string", required: true, description: { zh: "唯一标识。", en: "Unique identifier." } },
          { name: "label", type: "React.ReactNode", required: true, description: { zh: "名称。", en: "Label." } },
          { name: "icon / activeIcon", type: "React.ReactNode", description: { zh: "图标与激活态图标。", en: "Icon and active-state icon." } },
          { name: "badgeCount / badgeDot / badgeLabel", type: "number / boolean / React.ReactNode", description: { zh: "数字、圆点或文本角标。", en: "Count, dot, or text badge." } },
          { name: "href / disabled", type: "string / boolean", description: { zh: "渲染为链接；禁用。", en: "Render as a link; disable." } },
          { name: "section", type: "string", description: { zh: "分组名，相邻项变化时渲染标题与分割线（展开态 rail、Sidebar）。", en: "Group name; renders a heading and divider when it changes (expanded rail, Sidebar)." } },
        ],
      },
      {
        title: "NavigationBar Props",
        rows: [
          { name: "items", type: "readonly NavigationDestination<Value>[]", required: true, description: { zh: "导航目标。", en: "Destinations." } },
          { name: "value / onValueChange", type: "Value / (value: Value) => void", required: true, description: { zh: "当前项与切换回调。", en: "Active destination and change handler." } },
        ],
      },
    ],
  },
  {
    slug: "navigation-rail",
    title: "NavigationRail",
    primitive: "@base-ui/react/drawer",
    subtitle: {
      zh: "中宽屏一级导航。收起为 96px 图标栏，展开为 220–360px 带分组的列表；modal 在窄屏滑出。",
      en: "Primary navigation for medium and wide windows. Collapses to a 96px icon rail, expands to a 220–360px grouped list; modal slides in on narrow windows.",
    },
    importStatement: 'import { NavigationRail } from "m3eui";',
    scenarios: [
      {
        id: "navigation-rail-expand",
        title: { zh: "收起与展开", en: "Collapsed & expanded" },
        description: { zh: "collapsible 显示切换按钮，宽度弹簧过渡。", en: "collapsible adds the toggle; width animates on a spring." },
        code: `<NavigationRail
  items={items}
  value={value}
  onValueChange={setValue}
  header={<FAB size="sm" icon={<PlusIcon />} aria-label="Create" />}
/>

<NavigationRail
  collapsible
  defaultExpanded
  items={items}
  value={value}
  onValueChange={setValue}
/>`,
        render: () => <NavigationRailDemo />,
      },
      {
        id: "navigation-rail-modal",
        title: { zh: "模态", en: "Modal" },
        description: { zh: "窄屏由汉堡按钮打开，选中后关闭。", en: "Opened from a menu button on narrow windows; closes on selection." },
        code: `<NavigationRail
  modal
  items={items}
  value={value}
  onValueChange={setValue}
  trigger={<Button variant="tonal">Open navigation</Button>}
/>`,
        render: () => <NavigationRailModalDemo />,
      },
    ],
    apis: [
      {
        title: "NavigationDestination<Value>",
        rows: [
          { name: "value", type: "Value extends string", required: true, description: { zh: "唯一标识。", en: "Unique identifier." } },
          { name: "label", type: "React.ReactNode", required: true, description: { zh: "名称。", en: "Label." } },
          { name: "icon / activeIcon", type: "React.ReactNode", description: { zh: "图标与激活态图标。", en: "Icon and active-state icon." } },
          { name: "badgeCount / badgeDot / badgeLabel", type: "number / boolean / React.ReactNode", description: { zh: "数字、圆点或文本角标。", en: "Count, dot, or text badge." } },
          { name: "href / disabled", type: "string / boolean", description: { zh: "渲染为链接；禁用。", en: "Render as a link; disable." } },
          { name: "section", type: "string", description: { zh: "分组名，相邻项变化时渲染标题与分割线（展开态 rail、Sidebar）。", en: "Group name; renders a heading and divider when it changes (expanded rail, Sidebar)." } },
        ],
      },
      {
        title: "NavigationRail Props",
        rows: [
          { name: "items", type: "readonly NavigationDestination<Value>[]", required: true, description: { zh: "导航目标。", en: "Destinations." } },
          { name: "value / onValueChange", type: "Value / (value: Value) => void", required: true, description: { zh: "当前项与切换回调。", en: "Active destination and change handler." } },
          { name: "expanded / defaultExpanded / onExpandedChange", type: "boolean / boolean / (expanded: boolean) => void", defaultValue: "— / false", description: { zh: "展开状态。", en: "Expanded state." } },
          { name: "collapsible", type: "boolean", defaultValue: "false", description: { zh: "显示展开 / 收起按钮。", en: "Shows the expand/collapse toggle." } },
          { name: "modal / open / defaultOpen / onOpenChange / trigger", type: "boolean / boolean / boolean / (open: boolean) => void / React.ReactElement", defaultValue: "false", description: { zh: "以模态抽屉呈现。", en: "Renders as a modal drawer." } },
          { name: "header / footer", type: "React.ReactNode", description: { zh: "顶部（如 FAB）与底部插槽。", en: "Top (e.g. FAB) and bottom slots." } },
        ],
      },
    ],
  },
  {
    slug: "navigation-suite",
    title: "NavigationSuite",
    subtitle: {
      zh: "按容器宽度在 NavigationBar 与 NavigationRail 间切换的应用外壳。",
      en: "App shell that switches between NavigationBar and NavigationRail by container width.",
    },
    importStatement: 'import { NavigationSuite } from "m3eui";',
    scenarios: [
      {
        id: "navigation-suite-adaptive",
        title: { zh: "自适应布局", en: "Adaptive layout" },
        description: { zh: "auto 按容器宽度选择；也可固定为某一布局。", en: "auto picks by container width; any layout can be forced." },
        code: `<NavigationSuite
  layout="auto"
  items={items}
  value={active}
  onValueChange={setActive}
>
  <main />
</NavigationSuite>`,
        render: () => <NavigationSuiteAdaptiveDemo />,
      },
    ],
    apis: [
      {
        title: "NavigationSuite Props",
        rows: [
          { name: "items", type: "readonly NavigationDestination<Value>[]", required: true, description: { zh: "导航目标。", en: "Destinations." } },
          { name: "value / onValueChange", type: "Value / (value: Value) => void", required: true, description: { zh: "当前项与切换回调。", en: "Active destination and change handler." } },
          { name: "layout", type: '"auto" | "bar" | "rail" | "expanded-rail"', defaultValue: '"auto"', description: { zh: "布局策略。", en: "Layout strategy." } },
          { name: "header", type: "React.ReactNode", description: { zh: "rail 顶部插槽。", en: "Rail header slot." } },
          { name: "children", type: "React.ReactNode", required: true, description: { zh: "内容区。", en: "Content area." } },
        ],
      },
    ],
  },
  {
    slug: "sidebar",
    title: "Sidebar",
    isNew: true,
    primitive: "@base-ui/react/drawer",
    subtitle: {
      zh: "栏目内的长列表导航（文档目录、设置分类、后台菜单）。≥840px 常驻并 sticky，窄屏变为模态抽屉。",
      en: "Long in-section navigation (docs, settings, admin menus). Sticky at ≥840px; a modal drawer on narrow windows.",
    },
    importStatement: 'import { Sidebar } from "m3eui";',
    scenarios: [
      {
        id: "sidebar-filter",
        title: { zh: "分组与筛选", en: "Groups & filter" },
        description: { zh: "缩小窗口到 840px 以下，侧栏收进汉堡按钮。", en: "Below 840px the sidebar moves behind the menu button." },
        code: `<Sidebar
  items={items}
  value={active}
  onValueChange={setActive}
  open={open}
  onOpenChange={setOpen}
  header={<SearchBar size="sm" value={query} onValueChange={setQuery} />}
/>`,
        render: () => <SidebarDemo />,
      },
    ],
    apis: [
      {
        title: "NavigationDestination<Value>",
        rows: [
          { name: "value", type: "Value extends string", required: true, description: { zh: "唯一标识。", en: "Unique identifier." } },
          { name: "label", type: "React.ReactNode", required: true, description: { zh: "名称。", en: "Label." } },
          { name: "icon / activeIcon", type: "React.ReactNode", description: { zh: "图标与激活态图标。", en: "Icon and active-state icon." } },
          { name: "badgeCount / badgeDot / badgeLabel", type: "number / boolean / React.ReactNode", description: { zh: "数字、圆点或文本角标。", en: "Count, dot, or text badge." } },
          { name: "href / disabled", type: "string / boolean", description: { zh: "渲染为链接；禁用。", en: "Render as a link; disable." } },
          { name: "section", type: "string", description: { zh: "分组名，相邻项变化时渲染标题与分割线（展开态 rail、Sidebar）。", en: "Group name; renders a heading and divider when it changes (expanded rail, Sidebar)." } },
        ],
      },
      {
        title: "Sidebar Props",
        rows: [
          { name: "items", type: "readonly NavigationDestination<Value>[]", required: true, description: { zh: "导航目标，section 分组。", en: "Destinations, grouped by section." } },
          { name: "value / onValueChange", type: "Value | null / (value: Value) => void", required: true, description: { zh: "当前项与切换回调。", en: "Active destination and change handler." } },
          { name: "open / onOpenChange", type: "boolean / (open: boolean) => void", defaultValue: "false", description: { zh: "窄屏抽屉的开关，选中后自动关闭。", en: "Narrow-window drawer state; closes on selection." } },
          { name: "header / footer", type: "React.ReactNode", description: { zh: "列表上下插槽。", en: "Slots above and below the list." } },
          { name: "--m3e-sidebar-top", type: "CSS length", defaultValue: "0px", description: { zh: "sticky 偏移（如顶栏高度）。", en: "Sticky offset, e.g. the app bar height." } },
        ],
      },
    ],
  },
  {
    slug: "breadcrumb",
    title: "Breadcrumb",
    isNew: true,
    subtitle: {
      zh: "层级路径面包屑导航，自动为末级节点标注 aria-current=\"page\"，并在超长层级下将中间祖先折叠进无障碍下拉菜单。",
      en: "Hierarchical trail navigation with automatic aria-current=\"page\" semantics and DropdownMenu overflow collapsing.",
    },
    importStatement: 'import { Breadcrumb } from "m3eui";',
    scenarios: [
      {
        id: "breadcrumb-basic",
        title: {
          zh: "标准斜杠层级路径",
          en: "Standard slash trail",
        },
        description: {
          zh: "默认使用斜杠分隔符，最后一项自动识别为当前页面。",
          en: "Uses slash separators by default and marks the trailing item with aria-current=\"page\".",
        },
        code: `<Breadcrumb
  items={[
    { label: "Workspace", href: "#workspace" },
    { label: "Design Tokens", href: "#tokens" },
    { label: "Color Schemes" },
  ]}
/>`,
        render: () => (
          <Breadcrumb
            items={[
              { label: "Workspace", href: "#breadcrumb-basic", onClick: (e) => e.preventDefault() },
              { label: "Design Tokens", href: "#breadcrumb-basic", onClick: (e) => e.preventDefault() },
              { label: "Color Schemes" },
            ]}
          />
        ),
      },
      {
        id: "breadcrumb-chevron-icons",
        title: {
          zh: "尖括号分隔符与前导图标",
          en: "Chevron separator & item icons",
        },
        description: {
          zh: "设置 separator=\"chevron\" 并为各级节点配置前导图标，在 RTL 布局中尖括号方向自动水平翻转。",
          en: "Switch to separator=\"chevron\" with leading icons; chevrons mirror automatically in RTL.",
        },
        code: `<Breadcrumb
  separator="chevron"
  items={[
    { label: "Home", icon: <HomeGlyph size={14} />, href: "#home" },
    { label: "Packages", icon: <FolderIcon size={14} />, href: "#packages" },
    { label: "m3eui", icon: <SparkleIcon size={14} /> },
  ]}
/>`,
        render: () => (
          <Breadcrumb
            separator="chevron"
            items={[
              {
                label: "Home",
                icon: <HomeGlyph size={14} />,
                href: "#breadcrumb-chevron-icons",
                onClick: (e) => e.preventDefault(),
              },
              {
                label: "Packages",
                icon: <FolderIcon size={14} />,
                href: "#breadcrumb-chevron-icons",
                onClick: (e) => e.preventDefault(),
              },
              {
                label: "m3eui",
                icon: <SparkleIcon size={14} />,
              },
            ]}
          />
        ),
      },
      {
        id: "breadcrumb-collapsed",
        title: {
          zh: "超长路径自动折叠菜单 (maxItems)",
          en: "Collapsed middle ancestors via DropdownMenu",
        },
        description: {
          zh: "设置 maxItems={3} 后保留根节点与末尾两级，中间省略号按钮点击可展开完整祖先列表。",
          en: "Setting maxItems={3} preserves the root and last two items while collapsing middle ancestors into an accessible DropdownMenu.",
        },
        code: `<Breadcrumb
  maxItems={3}
  separator="chevron"
  items={[
    { label: "Organization" },
    { label: "Platform Engineering" },
    { label: "Design Systems" },
    { label: "m3eui" },
    { label: "Release v0.4" },
  ]}
/>`,
        render: () => (
          <Breadcrumb
            maxItems={3}
            separator="chevron"
            items={[
              { label: "Organization" },
              { label: "Platform Engineering" },
              { label: "Design Systems" },
              { label: "m3eui" },
              { label: "Release v0.4" },
            ]}
          />
        ),
      },
      {
        id: "breadcrumb-custom-render",
        title: {
          zh: "自定义路由链接组合 (render)",
          en: "Custom router link composition",
        },
        description: {
          zh: "通过节点 render 属性接入单页路由 Link 组件并响应 onClick 事件。",
          en: "Use the per-item render prop to compose framework router links alongside click callbacks.",
        },
        code: `<Breadcrumb
  separator="chevron"
  items={[
    { label: "m3eui", render: <RouterLink to="/" /> },
    { label: "components", render: <RouterLink to="/components" /> },
    { label: "Pagination.tsx" },
  ]}
/>`,
        render: () => <BreadcrumbCustomRenderDemo />,
      },
    ],
    apis: [
      {
        title: "Breadcrumb Props",
        rows: [
          {
            name: "items",
            type: "readonly M3EBreadcrumbItem[]",
            required: true,
            description: {
              zh: "按层级顺序排列的面包屑节点列表。",
              en: "Ordered array of breadcrumb items from root to current page.",
            },
          },
          {
            name: "separator",
            type: '"slash" | "chevron"',
            defaultValue: '"slash"',
            description: {
              zh: "节点间视觉分隔符类型。",
              en: "Visual separator glyph rendered between items.",
            },
          },
          {
            name: "maxItems",
            type: "number",
            description: {
              zh: "最大直接展示节点数（≥ 3）；超出时中间层级自动收纳进 DropdownMenu。",
              en: "Maximum visible items (minimum 3) before collapsing middle items into a menu.",
            },
          },
          {
            name: "aria-label",
            type: "string",
            description: {
              zh: "nav 容器的无障碍标签，默认随当前语言自动本地化。",
              en: "Accessible label for the landmark nav element (localized by default).",
            },
          },
        ],
      },
      {
        title: "M3EBreadcrumbItem (BreadcrumbItemSpec)",
        rows: [
          {
            name: "label",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "节点展示内容。",
              en: "Visible label node for the breadcrumb item.",
            },
          },
          {
            name: "textLabel",
            type: "string",
            description: {
              zh: "当 label 为复杂 JSX 且节点被折叠进下拉菜单时使用的纯文本标题。",
              en: "Plain-text fallback label used when the item is collapsed inside DropdownMenu.",
            },
          },
          {
            name: "href",
            type: "string",
            description: {
              zh: "目标跳转地址。",
              en: "Target URL for the anchor element.",
            },
          },
          {
            name: "icon",
            type: "React.ReactNode",
            description: {
              zh: "可选的前导图标。",
              en: "Optional leading icon rendered before the label.",
            },
          },
          {
            name: "render",
            type: "React.ReactElement",
            description: {
              zh: "自定义链接宿主元素（如 Next.js Link 或 React Router Link）。",
              en: "Custom link element cloned with breadcrumb classes and aria-current.",
            },
          },
          {
            name: "onClick",
            type: "React.MouseEventHandler<HTMLAnchorElement>",
            description: {
              zh: "节点点击回调。",
              en: "Click handler invoked when activating the item.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "pagination",
    title: "Pagination",
    isNew: true,
    subtitle: {
      zh: "具备物理弹簧圆角形变的分页导航器，支持受控/非受控页码、智能省略号窗口、CLDR 本地化数字与条目范围摘要。",
      en: "Page navigation with spring-animated corner morphing, smart ellipsis windowing, CLDR numeral formatting, and item range summaries.",
    },
    importStatement: 'import { Pagination } from "m3eui";',
    scenarios: [
      {
        id: "pagination-basic",
        title: {
          zh: "受控分页与弹簧圆角形变",
          en: "Controlled Pagination with corner morph",
        },
        description: {
          zh: "未选中页码为圆形胶囊，按压时收缩至 8px 圆角，激活页弹性收敛为 12px 圆角方块。",
          en: "Inactive page buttons rest as circular pills, squish to 8px on press, and settle at a 12px rounded square when active.",
        },
        code: `const [page, setPage] = React.useState(4);

<Pagination page={page} totalPages={12} onPageChange={setPage} />`,
        render: () => <PaginationBasicDemo />,
      },
      {
        id: "pagination-summary",
        title: {
          zh: "条目总数推导与本地化范围摘要",
          en: "Localized item range summary",
        },
        description: {
          zh: "传入 totalItems={248}、pageSize={20} 与 showSummary，自动计算总页数并输出本地化范围读数。",
          en: "Derives total pages from totalItems and pageSize while rendering a localized start–end of total readout.",
        },
        code: `<Pagination
  defaultPage={2}
  totalItems={248}
  pageSize={20}
  showSummary
/>`,
        render: () => <PaginationSummaryDemo />,
      },
      {
        id: "pagination-sizes-siblings",
        title: {
          zh: "尺寸档位与邻近页码宽度 (size & siblingCount)",
          en: "Compact size & siblingCount window",
        },
        description: {
          zh: "对比紧凑型 size=\"sm\"（34px）与标准 size=\"md\"（40px）以及更宽的 siblingCount={2} 窗口。",
          en: "Compare compact size=\"sm\" (34px) against standard size=\"md\" (40px) with siblingCount={2}.",
        },
        code: `<Pagination defaultPage={6} totalPages={20} size="sm" />
<Pagination defaultPage={6} totalPages={20} size="md" siblingCount={2} />`,
        render: () => (
          <div style={STACK_COL}>
            <Pagination defaultPage={6} totalPages={20} size="sm" />
            <Pagination defaultPage={6} totalPages={20} size="md" siblingCount={2} />
          </div>
        ),
      },
      {
        id: "pagination-disabled",
        title: {
          zh: "禁用状态",
          en: "Disabled state",
        },
        description: {
          zh: "数据重新请求或锁定期间通过 disabled 禁用全部翻页与页码按钮。",
          en: "Lock all step and page buttons while data is reloading.",
        },
        code: `<Pagination defaultPage={3} totalPages={8} disabled />`,
        render: () => <Pagination defaultPage={3} totalPages={8} disabled />,
      },
    ],
    apis: [
      {
        title: "Pagination Props",
        rows: [
          {
            name: "page",
            type: "number",
            description: {
              zh: "受控当前页码（从 1 开始）。",
              en: "Controlled 1-based current page.",
            },
          },
          {
            name: "defaultPage",
            type: "number",
            defaultValue: "1",
            description: {
              zh: "非受控初始页码。",
              en: "Initial 1-based page when uncontrolled.",
            },
          },
          {
            name: "totalPages",
            type: "number",
            description: {
              zh: "显式指定总页数；若未传则由 Math.ceil(totalItems / pageSize) 推导。",
              en: "Explicit page count; otherwise derived from totalItems and pageSize.",
            },
          },
          {
            name: "totalItems / pageSize",
            type: "number",
            defaultValue: "undefined / 10",
            description: {
              zh: "总记录条数与每页条数，用于自动计算总页数及渲染 showSummary 文本。",
              en: "Total item count and page size used for page derivation and summary formatting.",
            },
          },
          {
            name: "onPageChange",
            type: "(page: number) => void",
            description: {
              zh: "页码切换回调。",
              en: "Callback invoked with the newly selected 1-based page number.",
            },
          },
          {
            name: "siblingCount",
            type: "number",
            defaultValue: "1",
            description: {
              zh: "当前页左右两侧各展示的相邻页码数量。",
              en: "Number of sibling page buttons shown on each side of the active page.",
            },
          },
          {
            name: "size",
            type: '"sm" | "md"',
            defaultValue: '"md"',
            description: {
              zh: "按钮尺寸（sm 为 34px，md 为 40px）。",
              en: "Button box size preset (\"sm\" = 34px, \"md\" = 40px).",
            },
          },
          {
            name: "showSummary",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "当提供 totalItems 时显示本地化的条目起止范围。",
              en: "Displays localized item range summary when totalItems is provided.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用全部交互按钮。",
              en: "Disables all page and previous/next step buttons.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "tabs",
    title: "Tabs",
    primitive: "@base-ui/react/tabs",
    subtitle: {
      zh: "支持主级（Primary）与次级（Secondary）双视觉层级的选项卡组件，具备平滑滑动激活指示条与完整键盘焦点环路。",
      en: "Primary and secondary Material 3 Tabs with animated sliding indicators, optional icons/badges, and roving keyboard focus.",
    },
    importStatement: 'import { Tabs, TabsList, Tab, TabsPanel } from "m3eui";',
    scenarios: [
      {
        id: "tabs-primary",
        title: {
          zh: "主级选项卡与内容面板 (Primary)",
          en: "Primary Tabs with animated indicator",
        },
        description: {
          zh: "主级选项卡使用贴合文字宽度的圆角底部指示器，用于顶层视图分区。",
          en: "Primary tabs feature a pill-shaped bottom indicator and switch associated TabsPanel views.",
        },
        code: `<Tabs defaultValue="tokens" variant="primary">
  <TabsList aria-label="Specification sections">
    <Tab value="tokens">Color Tokens</Tab>
    <Tab value="motion">Motion Physics</Tab>
    <Tab value="shapes">Shapes</Tab>
  </TabsList>
  <TabsPanel value="tokens">HCT tonal palettes and contrast curves.</TabsPanel>
  <TabsPanel value="motion">Analytical second-order ODE springs.</TabsPanel>
  <TabsPanel value="shapes">35 morphable rounded polygons.</TabsPanel>
</Tabs>`,
        render: () => (
          <Tabs defaultValue="tokens" variant="primary" style={{ width: "100%" }}>
            <TabsList aria-label="Specification sections">
              <Tab value="tokens">Color Tokens</Tab>
              <Tab value="motion">Motion Physics</Tab>
              <Tab value="shapes">Shapes</Tab>
            </TabsList>
            <TabsPanel value="tokens" style={{ paddingTop: 14, fontSize: 13.5 }}>
              HCT tonal palettes, 9 dynamic schemes, and WCAG-aware contrast curves.
            </TabsPanel>
            <TabsPanel value="motion" style={{ paddingTop: 14, fontSize: 13.5 }}>
              Closed-form under-damped and critically damped SpringSimulation solver.
            </TabsPanel>
            <TabsPanel value="shapes" style={{ paddingTop: 14, fontSize: 13.5 }}>
              35 normalized cubic Bezier polygons ready for continuous SVG morphing.
            </TabsPanel>
          </Tabs>
        ),
      },
      {
        id: "tabs-secondary",
        title: {
          zh: "次级选项卡 (Secondary)",
          en: "Secondary Tabs",
        },
        description: {
          zh: "variant=\"secondary\" 采用等宽底边指示条，适合卡片内部或二级内容切换。",
          en: "Secondary tabs span full tab width indicators and suit nested sub-views or code/preview switchers.",
        },
        code: `<Tabs defaultValue="preview" variant="secondary">
  <TabsList aria-label="View mode">
    <Tab value="preview">Preview</Tab>
    <Tab value="code">Source TSX</Tab>
    <Tab value="tokens">CSS Variables</Tab>
  </TabsList>
  <TabsPanel value="preview">Interactive preview canvas.</TabsPanel>
  <TabsPanel value="code">TypeScript React source.</TabsPanel>
  <TabsPanel value="tokens">--m3e-color-primary: ...</TabsPanel>
</Tabs>`,
        render: () => (
          <Tabs defaultValue="preview" variant="secondary" style={{ width: "100%" }}>
            <TabsList aria-label="View mode">
              <Tab value="preview">Preview</Tab>
              <Tab value="code">Source TSX</Tab>
              <Tab value="tokens">CSS Variables</Tab>
            </TabsList>
            <TabsPanel value="preview" style={{ paddingTop: 14, fontSize: 13.5 }}>
              Interactive preview surface rendered with live theme tokens.
            </TabsPanel>
            <TabsPanel value="code" style={{ paddingTop: 14, fontSize: 13.5 }}>
              Copy-ready TypeScript JSX snippet with strict prop typing.
            </TabsPanel>
            <TabsPanel value="tokens" style={{ paddingTop: 14, fontSize: 13.5 }}>
              <code>--m3e-color-primary</code> · <code>--m3e-color-surface-container</code>
            </TabsPanel>
          </Tabs>
        ),
      },
      {
        id: "tabs-icons",
        title: {
          zh: "带图标与角标的选项卡",
          en: "Primary Tabs with icons & badges",
        },
        description: {
          zh: "传入 icon 时主级选项卡高度自动扩展至 64px，并可通过 badge 附加计数提示。",
          en: "Primary tabs expand to 64px height when icons are present and accept inline badge nodes.",
        },
        code: `<Tabs defaultValue="overview">
  <TabsList aria-label="Workspace views">
    <Tab value="overview" icon={<HomeGlyph size={18} />}>Overview</Tab>
    <Tab value="metrics" icon={<BarChartIcon size={18} />} badge="4">Metrics</Tab>
    <Tab value="security" icon={<ShieldCheckIcon size={18} />}>Audit</Tab>
  </TabsList>
</Tabs>`,
        render: () => (
          <Tabs defaultValue="overview" style={{ width: "100%" }}>
            <TabsList aria-label="Workspace views">
              <Tab value="overview" icon={<HomeGlyph size={18} />}>
                Overview
              </Tab>
              <Tab value="metrics" icon={<BarChartIcon size={18} />} badge="4">
                Metrics
              </Tab>
              <Tab value="security" icon={<ShieldCheckIcon size={18} />}>
                Audit
              </Tab>
            </TabsList>
          </Tabs>
        ),
      },
      {
        id: "tabs-disabled",
        title: {
          zh: "包含禁用项的选项卡列表",
          en: "Disabled Tab item",
        },
        description: {
          zh: "键盘左右方向键导航时会自动跳过 disabled={true} 的选项卡。",
          en: "Roving keyboard navigation automatically skips disabled tab triggers.",
        },
        code: `<Tabs defaultValue="general">
  <TabsList aria-label="Settings">
    <Tab value="general">General</Tab>
    <Tab value="billing" disabled>Enterprise Billing (Locked)</Tab>
    <Tab value="members">Members</Tab>
  </TabsList>
</Tabs>`,
        render: () => (
          <Tabs defaultValue="general" style={{ width: "100%" }}>
            <TabsList aria-label="Settings">
              <Tab value="general">General</Tab>
              <Tab value="billing" disabled>
                Enterprise Billing (Locked)
              </Tab>
              <Tab value="members">Members</Tab>
            </TabsList>
          </Tabs>
        ),
      },
    ],
    apis: [
      {
        title: "Tabs, TabsList, Tab & TabsPanel Props",
        rows: [
          {
            name: "Tabs.variant",
            type: '"primary" | "secondary"',
            defaultValue: '"primary"',
            description: {
              zh: "控制指示条形态与最小高度规范。",
              en: "Selects primary pill indicator or secondary full-width underline indicator.",
            },
          },
          {
            name: "Tabs.value / defaultValue / onValueChange",
            type: "Value / (value: Value) => void",
            description: {
              zh: "受控或非受控当前激活标签值。",
              en: "Controlled or uncontrolled active tab value and change callback.",
            },
          },
          {
            name: "TabsList.activateOnFocus / loopFocus",
            type: "boolean",
            defaultValue: "true / true",
            description: {
              zh: "方向键聚焦时是否立即激活面板，以及首尾焦点循环。",
              en: "Whether arrow key focus immediately activates tabs and wraps around ends.",
            },
          },
          {
            name: "Tab.value / icon / badge / disabled",
            type: "Value / React.ReactNode / React.ReactNode / boolean",
            description: {
              zh: "单个选项卡标识值、前导图标、徽标插槽与禁用态。",
              en: "Tab value, optional icon, trailing badge node, and disabled state.",
            },
          },
          {
            name: "TabsPanel.keepMounted",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "隐藏未激活面板时是否保留其 DOM 节点。",
              en: "Keeps inactive panel DOM mounted when hidden.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "accordion",
    title: "Accordion",
    primitive: "@base-ui/react/accordion",
    subtitle: {
      zh: "分段圆角手风琴：相邻折叠项共享 4px 内缝，展开项脱离为 16px 圆角。",
      en: "Segmented accordion: collapsed neighbors share 4px seams, expanded items detach with 16px corners.",
    },
    importStatement:
      'import { Accordion } from "m3eui";',
    scenarios: [
      {
        id: "accordion-multiple",
        title: {
          zh: "多选展开与全部展开工具栏 (showExpandAll)",
          en: "Multi-expand Accordion with Expand All",
        },
        description: {
          zh: "相邻折叠项内侧共享 4px 紧凑圆角，展开项独立浮起并恢复 16px 外圆角与间距。",
          en: "Collapsed neighbors share tight 4px inner seams while expanded items detach with full 16px corners.",
        },
        code: `<Accordion
  multiple
  showExpandAll
  defaultValue={["color"]}
  items={[
    {
      value: "color",
      title: "HCT Perceptual Color",
      subtitle: "Hue · Chroma · Tone",
      content: "Guarantees predictable contrast ratios across light, dark, and high-contrast modes.",
    },
    {
      value: "spring",
      title: "Analytical Spring Physics",
      subtitle: "Zero-allocation ODE solver",
      content: "Evaluates displacement directly at elapsed time t without Euler drift.",
    },
  ]}
/>`,
        render: () => (
          <Accordion
            multiple
            showExpandAll
            defaultValue={["color"]}
            style={{ width: "100%" }}
            items={[
              {
                value: "color",
                leading: <SparkleIcon size={18} />,
                title: "HCT Perceptual Color · 感知色彩引擎",
                subtitle: "Hue · Chroma · Tone",
                content:
                  "Guarantees predictable WCAG contrast ratios across light, dark, medium (+0.5), and high (+1.0) contrast levels.",
              },
              {
                value: "spring",
                leading: <RefreshIcon size={18} />,
                title: "Analytical Spring Physics · 解析物理弹簧",
                subtitle: "Zero-allocation ODE solver",
                content:
                  "Evaluates exact second-order differential equation displacement at elapsed time t without numerical integration drift.",
              },
              {
                value: "bidi",
                leading: <ShieldCheckIcon size={18} />,
                title: "CLDR & BiDi Directionality · 多语言与双向排版",
                subtitle: "zh-CN · en-US · ja-JP · ar-SA",
                content:
                  "Logical CSS properties and corner tuple flipping mirror connected buttons, drawers, and menus in RTL.",
              },
            ]}
          />
        ),
      },
      {
        id: "accordion-single",
        title: {
          zh: "手风琴单选互斥与禁用项",
          en: "Exclusive single-expand & disabled item",
        },
        description: {
          zh: "设置 multiple={false} 后同一时刻仅允许展开一个条目，并支持单条 disabled 锁定。",
          en: "With multiple={false}, opening a section closes any previously open panel while respecting per-item disabled.",
        },
        code: `<Accordion
  multiple={false}
  defaultValue={["tier-pro"]}
  items={[
    { value: "tier-free", title: "Community Tier", content: "MIT licensed core primitives." },
    { value: "tier-pro", title: "Team Workspace", content: "Shared m3e.json presets and CI checks." },
    { value: "tier-legacy", title: "Legacy v0.1 Adapter (Deprecated)", disabled: true, content: "..." },
  ]}
/>`,
        render: () => (
          <Accordion
            multiple={false}
            defaultValue={["tier-pro"]}
            style={{ width: "100%" }}
            items={[
              {
                value: "tier-free",
                title: "Community Tier",
                content: "MIT-licensed Material 3 Expressive components and token generator.",
              },
              {
                value: "tier-pro",
                title: "Team Workspace",
                content: "Shared m3e.json design token presets and automated contrast linting.",
              },
              {
                value: "tier-legacy",
                title: "Legacy v0.1 Adapter (Deprecated)",
                disabled: true,
                content: "Deprecated compatibility layer.",
              },
            ]}
          />
        ),
      },
      {
        id: "accordion-single-item",
        title: { zh: "单项与表面", en: "Single item & surface" },
        description: { zh: "单项即展开卡片；variant 切换 tonal / outlined / plain。", en: "One item is a disclosure card; variant switches tonal / outlined / plain." },
        code: `<Accordion
  variant="outlined"
  defaultValue={["log"]}
  items={[
    {
      value: "log",
      title: "Build diagnostics",
      subtitle: "12 modules verified",
      trailingBadge: <Chip size="sm" tone="success">Passed</Chip>,
      content: <pre>{log}</pre>,
    },
  ]}
/>`,
        render: () => (
          <Accordion
            variant="outlined"
            defaultValue={["log"]}
            style={{ width: "100%" }}
            items={[
              {
                value: "log",
                leading: <TerminalIcon size={16} />,
                title: "Build diagnostics",
                subtitle: "12 modules verified in 420ms",
                trailingBadge: (
                  <Chip size="sm" tone="success">
                    Passed
                  </Chip>
                ),
                content: (
                  <div
                    style={{
                      fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                      fontSize: 12,
                      display: "flex",
                      flexDirection: "column",
                      gap: 6,
                      color: "var(--m3e-color-on-surface-variant)",
                    }}
                  >
                    <div>[01/04] Generating SPEC_2025 schemes… OK</div>
                    <div>[02/04] Precomputing MaterialShapes… OK</div>
                    <div>[03/04] Auditing ARIA &amp; RTL… OK</div>
                    <div>[04/04] Bundle emitted… DONE</div>
                  </div>
                ),
              },
            ]}
          />
        ),
      },
    ],
    apis: [
      {
        title: "Accordion Props & AccordionItemSpec",
        rows: [
          {
            name: "items",
            type: "readonly AccordionItemSpec[]",
            required: true,
            description: {
              zh: "包含 { value, title, subtitle?, leading?, trailingBadge?, content, disabled? } 的面板配置数组。",
              en: "Array of { value, title, subtitle?, leading?, trailingBadge?, content, disabled? } item specs.",
            },
          },
          {
            name: "variant",
            type: '"tonal" | "outlined" | "plain"',
            defaultValue: '"tonal"',
            description: { zh: "容器表面。", en: "Container surface." },
          },
          {
            name: "multiple",
            type: "boolean",
            defaultValue: "true",
            description: {
              zh: "是否允许同时展开多个面板。",
              en: "Allows multiple accordion panels to remain open simultaneously.",
            },
          },
          {
            name: "showExpandAll",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "当 multiple 为 true 时渲染“全部展开/全部收起”工具栏按钮。",
              en: "Renders an Expand All / Collapse All toggle button when multiple is true.",
            },
          },
          {
            name: "hiddenUntilFound",
            type: "boolean",
            defaultValue: "true",
            description: {
              zh: "支持浏览器页内搜索（⌘F）自动命中并展开折叠面板内容。",
              en: "Enables browser find-in-page (⌘F) matching inside collapsed panels.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "menu",
    title: "Menu",
    primitive: "@base-ui/react/menu",
    subtitle: {
      zh: "M3E 分段圆角下拉菜单，支持分组、子菜单、勾选项与快捷键。",
      en: "M3E segmented dropdown menu with groups, submenus, checkable items, and shortcuts.",
    },
    importStatement:
      'import { DropdownMenu } from "m3eui";',
    scenarios: [
      {
        id: "dropdown-menu-rich",
        title: {
          zh: "下拉菜单",
          en: "DropdownMenu",
        },
        description: {
          zh: "集成键盘快捷键提示、多选复选框、互斥密度组、多级嵌套 submenu 与危险操作高亮。",
          en: "Combines keyboard shortcuts, checkable items, exclusive option groups, nested submenus, and danger items.",
        },
        code: `<DropdownMenu
  trigger={<Button variant="tonal">Open rich DropdownMenu</Button>}
  items={[
    { id: "dup", label: "Duplicate artboard", shortcut: "⌘D", onSelect: duplicate },
    {
      id: "export",
      label: "Export theme bundle",
      submenu: [
        { id: "json", label: "m3e.json" },
        { id: "css", label: "tokens.css" },
      ],
    },
    { id: "grid", separatorBefore: true, label: "Show grid", checked: showGrid, onCheckedChange: setShowGrid },
    { id: "del", separatorBefore: true, danger: true, label: "Delete artboard", shortcut: "⌫" },
  ]}
/>`,
        render: () => <DropdownMenuRichDemo />,
      },
    ],
    apis: [
      {
        title: "M3EMenuItemSpec",
        rows: [
          {
            name: "id / label",
            type: "string / React.ReactNode",
            required: true,
            description: {
              zh: "菜单项唯一键与显示内容。",
              en: "Unique item identifier and visible label.",
            },
          },
          {
            name: "icon / shortcut",
            type: "React.ReactNode / string",
            description: {
              zh: "前导图标与右侧快捷键提示文本。",
              en: "Optional leading icon and trailing keyboard shortcut hint.",
            },
          },
          {
            name: "checked / onCheckedChange",
            type: "boolean / (checked: boolean) => void",
            description: {
              zh: "提供 boolean 时渲染为可勾选的 CheckboxItem。",
              en: "When defined, renders the item as a checkable menu item.",
            },
          },
          {
            name: "href / render",
            type: "string / React.ReactElement",
            description: {
              zh: "渲染为链接项；render 可传入路由的 Link。",
              en: "Renders a link item; pass a router Link via render.",
            },
          },
          {
            name: "submenu",
            type: "readonly M3EMenuItemSpec[]",
            description: {
              zh: "嵌套次级菜单项列表。",
              en: "Nested submenu items array.",
            },
          },
          {
            name: "separatorBefore / danger / disabled",
            type: "boolean",
            description: {
              zh: "上方分割线、危险红色高亮或禁用态开关。",
              en: "Renders a leading separator, destructive error styling, or disabled state.",
            },
          },
        ],
      },
      {
        title: "DropdownMenu Props",
        rows: [
          {
            name: "trigger / side / align",
            type: 'React.ReactElement · "top" | "bottom" | "left" | "right" · "start" | "center" | "end"',
            defaultValue: '"bottom" / "start"',
            description: {
              zh: "触发按钮元素及浮层弹出定位。",
              en: "Trigger element and menu placement options.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "context-menu",
    title: "ContextMenu",
    primitive: "@base-ui/react/context-menu",
    subtitle: {
      zh: "在指针位置打开的右键菜单，与 DropdownMenu 共用菜单项。",
      en: "Right-click menu opened at the pointer; shares DropdownMenu's item model.",
    },
    importStatement: 'import { ContextMenu } from "m3eui";',
    scenarios: [
      {
        id: "context-menu",
        title: {
          zh: "右键菜单",
          en: "ContextMenu",
        },
        description: {
          zh: "包裹任意工作区或列表项，在指针坐标处唤起分段圆角上下文菜单并支持子菜单。",
          en: "Wraps any canvas or surface to open a segmented menu at the pointer coordinates on contextmenu.",
        },
        code: `<ContextMenu
  items={[
    { id: "inspect", label: "Inspect spring telemetry", shortcut: "⌥⌘I" },
    { id: "share", label: "Share snapshot", submenu: [{ id: "url", label: "Copy permalink" }] },
    { id: "reset", separatorBefore: true, danger: true, label: "Purge canvas cache" },
  ]}
>
  <div>Right-click inside this canvas</div>
</ContextMenu>`,
        render: () => <ContextMenuCanvasDemo />,
      },
    ],
    apis: [
      {
        title: "M3EMenuItemSpec",
        rows: [
          {
            name: "id / label",
            type: "string / React.ReactNode",
            required: true,
            description: {
              zh: "菜单项唯一键与显示内容。",
              en: "Unique item identifier and visible label.",
            },
          },
          {
            name: "icon / shortcut",
            type: "React.ReactNode / string",
            description: {
              zh: "前导图标与右侧快捷键提示文本。",
              en: "Optional leading icon and trailing keyboard shortcut hint.",
            },
          },
          {
            name: "checked / onCheckedChange",
            type: "boolean / (checked: boolean) => void",
            description: {
              zh: "提供 boolean 时渲染为可勾选的 CheckboxItem。",
              en: "When defined, renders the item as a checkable menu item.",
            },
          },
          {
            name: "href / render",
            type: "string / React.ReactElement",
            description: {
              zh: "渲染为链接项；render 可传入路由的 Link。",
              en: "Renders a link item; pass a router Link via render.",
            },
          },
          {
            name: "submenu",
            type: "readonly M3EMenuItemSpec[]",
            description: {
              zh: "嵌套次级菜单项列表。",
              en: "Nested submenu items array.",
            },
          },
          {
            name: "separatorBefore / danger / disabled",
            type: "boolean",
            description: {
              zh: "上方分割线、危险红色高亮或禁用态开关。",
              en: "Renders a leading separator, destructive error styling, or disabled state.",
            },
          },
        ],
      },
      {
        title: "ContextMenu Props",
        rows: [
          {
            name: "children / items",
            type: "React.ReactNode / readonly M3EMenuItemSpec[]",
            required: true,
            description: {
              zh: "响应右键事件的包裹区域与菜单列表。",
              en: "Target surface children and right-click menu items.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "menubar",
    title: "Menubar",
    primitive: "@base-ui/react/menubar",
    subtitle: {
      zh: "桌面应用菜单栏，方向键在菜单间横向漫游。",
      en: "Desktop application menu bar with arrow-key roving across menus.",
    },
    importStatement: 'import { Menubar } from "m3eui";',
    scenarios: [
      {
        id: "menubar",
        title: {
          zh: "菜单栏",
          en: "Menubar",
        },
        description: {
          zh: "支持 File / Edit / View 横向方向键漫游切换，顶栏触发器按压时同样具备圆角物理形变。",
          en: "Supports horizontal arrow-key navigation across File, Edit, and View menus with spring-morphing triggers.",
        },
        code: `<Menubar
  menus={[
    { id: "file", label: "File", items: [{ id: "new", label: "New config", shortcut: "⌘N" }] },
    { id: "edit", label: "Edit", items: [{ id: "copy", label: "Copy seed hex", shortcut: "⌘C" }] },
    { id: "view", label: "View", items: [{ id: "wrap", label: "Word wrap", checked: true }] },
  ]}
/>`,
        render: () => <MenubarAppDemo />,
      },
    ],
    apis: [
      {
        title: "M3EMenuItemSpec",
        rows: [
          {
            name: "id / label",
            type: "string / React.ReactNode",
            required: true,
            description: {
              zh: "菜单项唯一键与显示内容。",
              en: "Unique item identifier and visible label.",
            },
          },
          {
            name: "icon / shortcut",
            type: "React.ReactNode / string",
            description: {
              zh: "前导图标与右侧快捷键提示文本。",
              en: "Optional leading icon and trailing keyboard shortcut hint.",
            },
          },
          {
            name: "checked / onCheckedChange",
            type: "boolean / (checked: boolean) => void",
            description: {
              zh: "提供 boolean 时渲染为可勾选的 CheckboxItem。",
              en: "When defined, renders the item as a checkable menu item.",
            },
          },
          {
            name: "href / render",
            type: "string / React.ReactElement",
            description: {
              zh: "渲染为链接项；render 可传入路由的 Link。",
              en: "Renders a link item; pass a router Link via render.",
            },
          },
          {
            name: "submenu",
            type: "readonly M3EMenuItemSpec[]",
            description: {
              zh: "嵌套次级菜单项列表。",
              en: "Nested submenu items array.",
            },
          },
          {
            name: "separatorBefore / danger / disabled",
            type: "boolean",
            description: {
              zh: "上方分割线、危险红色高亮或禁用态开关。",
              en: "Renders a leading separator, destructive error styling, or disabled state.",
            },
          },
        ],
      },
      {
        title: "Menubar Props",
        rows: [
          {
            name: "menus",
            type: "readonly M3EMenubarMenuSpec[]",
            required: true,
            description: {
              zh: "顶部菜单栏配置数组 { id, label, disabled?, items }。",
              en: "Top-level menu definitions { id, label, disabled?, items }.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "popover",
    title: "Popover",
    primitive: "@base-ui/react/popover",
    subtitle: {
      zh: "锚定在触发器旁的非模态浮层，承载滑块、开关与轻量表单。",
      en: "Anchored non-modal surface for sliders, switches, and lightweight forms.",
    },
    importStatement:
      'import { Popover, PopoverClose } from "m3eui";',
    scenarios: [
      {
        id: "popover",
        title: {
          zh: "筛选浮层",
          en: "Filter popover",
        },
        description: {
          zh: "用于承载滑块、开关或轻量表单的非全屏锚定浮层，支持 PopoverClose 一键收起。",
          en: "Anchored non-modal surface ideal for quick filter sliders, switches, and inspector controls.",
        },
        code: `<Popover
  title="Pipeline filter settings"
  description="Tune contrast boost and experimental flags."
  trigger={<Button variant="outlined">Open filter Popover</Button>}
>
  <Slider label="Chroma boost" defaultValue={50} />
  <PopoverClose render={<Button size="xs" variant="tonal">Done</Button>} />
</Popover>`,
        render: () => <PopoverFilterDemo />,
      },
      {
        id: "popover-hover",
        title: { zh: "悬停预览", en: "Hover preview" },
        description: { zh: "openOnHover 在悬停或聚焦时打开，用于链接预览。", en: "openOnHover opens on hover or focus, for link previews." },
        code: `<Popover
  openOnHover
  trigger={<a href="/team/core">@m3e-design-core</a>}
>
  <ProfileCard />
</Popover>`,
        render: () => <PopoverHoverDemo />,
      },
    ],
    apis: [
      {
        title: "Popover Props",
        rows: [
          {
            name: "trigger / title / description / sideOffset",
            type: "React.ReactElement / React.ReactNode / number",
            description: {
              zh: "Popover 触发器、可选标题说明与间距偏移（默认 8px）。",
              en: "Popover trigger element, optional header copy, and popup offset.",
            },
          },
          {
            name: "aria-label",
            type: "string",
            description: {
              zh: "没有 title 时的弹层名称。",
              en: "Accessible name when there is no title.",
            },
          },
          {
            name: "openOnHover / delay / closeDelay",
            type: "boolean / number / number",
            defaultValue: "false / 280 / 200",
            description: {
              zh: "悬停或聚焦打开，及其延迟毫秒数。",
              en: "Open on hover or focus, with delays in milliseconds.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "navigation-menu",
    title: "NavigationMenu",
    primitive: "@base-ui/react/navigation-menu",
    subtitle: {
      zh: "站点顶栏导航，支持精选卡片与多列链接面板。",
      en: "Site header navigation with featured cards and multi-column link panels.",
    },
    importStatement:
      'import { NavigationMenu } from "m3eui";',
    scenarios: [
      {
        id: "navigation-menu",
        title: {
          zh: "站点顶栏",
          en: "Site header",
        },
        description: {
          zh: "适合营销页与文档站顶栏，支持精选导览卡片 featured 与双列图文链接网格 links。",
          en: "Site header navigation featuring rich multi-column link grids and highlighted featured callout cards.",
        },
        code: `<NavigationMenu
  brand={<strong>m3eui</strong>}
  items={[
    {
      value: "foundations",
      label: "Foundations",
      featured: { eyebrow: "SPEC_2025", title: "Dynamic Color", description: "HCT engine", href: "#color" },
      links: [{ id: "spring", title: "Analytical Springs", href: "#springs" }],
    },
    { value: "changelog", label: "Changelog", href: "#changelog" },
  ]}
/>`,
        render: () => <NavigationMenuSiteDemo />,
      },
    ],
    apis: [
      {
        title: "NavigationMenu Props",
        rows: [
          {
            name: "items / brand / trailing",
            type: "readonly NavigationMenuItemSpec[] / React.ReactNode",
            description: {
              zh: "站点导航项列表及左右品牌与操作插槽。",
              en: "Top-level navigation specs plus optional brand and trailing slots.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "command-palette",
    title: "CommandPalette",
    isNew: true,
    primitive: "@base-ui/react/dialog",
    subtitle: {
      zh: "模态命令面板与全局快速跳转启动器，内置关键词与分组检索过滤、ARIA Combobox 焦点同步与 ⌘K / Ctrl+K 快捷键开关。",
      en: "Modal command launcher with instant keyword/group filtering, WAI-ARIA combobox keyboard navigation, and optional ⌘K / Ctrl+K shortcut binding.",
    },
    importStatement: 'import { CommandPalette } from "m3eui";',
    scenarios: [
      {
        id: "command-palette-modal",
        title: {
          zh: "分组命令面板与动作反馈",
          en: "Grouped modal CommandPalette",
        },
        description: {
          zh: "支持按分组展示图标、副标题说明与快捷键徽标，选中回车或点击后自动关闭并触发回调。",
          en: "Displays grouped commands with icons, descriptions, and kbd shortcuts; selecting an item closes the dialog and runs onSelect.",
        },
        code: `<Button onClick={() => setOpen(true)}>Launch CommandPalette</Button>
<CommandPalette
  open={open}
  onOpenChange={setOpen}
  groups={[
    {
      id: "nav",
      heading: "Quick Jump",
      items: [
        { id: "studio", label: "Open Theme Studio", shortcut: "⇧⌘T", onSelect: openStudio },
      ],
    },
  ]}
/>`,
        render: () => <CommandPaletteModalDemo />,
      },
      {
        id: "command-palette-filtered",
        title: {
          zh: "关键词别名检索与禁用命令项",
          en: "Keyword aliases, empty state & disabled items",
        },
        description: {
          zh: "支持通过 keywords 数组匹配隐藏同义词、自定义 emptyMessage，且键盘上下键自动跳过 disabled 项。",
          en: "Matches hidden keywords aliases, renders custom emptyMessage copy, and skips disabled commands during arrow-key traversal.",
        },
        code: `<CommandPalette
  open={open}
  onOpenChange={setOpen}
  items={[
    { id: "i18n", label: "Sync CLDR locales", keywords: ["rtl", "locale"], onSelect: sync },
    { id: "prod", label: "Publish production release", disabled: true, onSelect: noop },
  ]}
  emptyMessage="No matching workspace commands."
/>`,
        render: () => <CommandPaletteFilteredDemo />,
      },
      {
        id: "command-palette-shortcut",
        title: {
          zh: "全局快捷键绑定与底栏提示 (enableShortcut)",
          en: "Global ⌘K / Ctrl+K shortcut & footerHint",
        },
        description: {
          zh: "开启 enableShortcut 后自动监听全局 ⌘K / Ctrl+K 切换开关，并可自定义底栏导航提示。",
          en: "Set enableShortcut to bind window-level ⌘K / Ctrl+K toggling and customize footerHint.",
        },
        code: `<CommandPalette
  enableShortcut
  footerHint="↑↓ Navigate · Enter Execute · Esc Close"
  items={items}
/>`,
        render: () => <CommandPaletteShortcutDemo />,
      },
    ],
    apis: [
      {
        title: "CommandPalette Props",
        rows: [
          {
            name: "groups",
            type: "readonly CommandPaletteGroup[]",
            description: {
              zh: "带分组标题的命令集合 { id, heading, items }。",
              en: "Grouped command sections { id, heading, items }.",
            },
          },
          {
            name: "items",
            type: "readonly CommandPaletteItem[]",
            defaultValue: "[]",
            description: {
              zh: "不分组时的扁平命令数组（传入 groups 时优先使用 groups）。",
              en: "Flat list of commands used when groups is omitted.",
            },
          },
          {
            name: "open / defaultOpen / onOpenChange",
            type: "boolean / (open: boolean) => void",
            defaultValue: "false",
            description: {
              zh: "受控或非受控模态框开关状态。",
              en: "Controlled or uncontrolled open state props.",
            },
          },
          {
            name: "enableShortcut",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否注册全局 ⌘K / Ctrl+K 键盘快捷键监听。",
              en: "Registers a global ⌘K / Ctrl+K keydown listener when true.",
            },
          },
          {
            name: "placeholder / emptyMessage / footerHint",
            type: "string / React.ReactNode / React.ReactNode",
            description: {
              zh: "搜索框占位符、无匹配结果提示与底部键盘说明文案。",
              en: "Custom search placeholder, empty-result node, and footer hint copy.",
            },
          },
        ],
      },
      {
        title: "CommandPaletteItem (CommandItemSpec)",
        rows: [
          {
            name: "id / label",
            type: "string",
            required: true,
            description: {
              zh: "命令唯一标识与主标题文本。",
              en: "Unique command ID and primary label.",
            },
          },
          {
            name: "onSelect",
            type: "() => void",
            required: true,
            description: {
              zh: "回车或点击执行命令时触发的回调。",
              en: "Callback invoked when the command is executed.",
            },
          },
          {
            name: "description",
            type: "string",
            description: {
              zh: "次要描述说明（同时参与全文检索过滤）。",
              en: "Secondary description text (also indexed during search filtering).",
            },
          },
          {
            name: "keywords",
            type: "readonly string[]",
            description: {
              zh: "用于提升搜索命中率的附加隐藏关键词列表。",
              en: "Additional search keywords matched against the user query.",
            },
          },
          {
            name: "icon / shortcut / disabled",
            type: "React.ReactNode / string / boolean",
            description: {
              zh: "前导图标、右侧快捷键标签与禁用锁定状态。",
              en: "Optional leading icon, kbd shortcut badge, and disabled flag.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "top-app-bar",
    title: "TopAppBar",
    primitive: "@base-ui/react/toolbar",
    subtitle: {
      zh: "Material 3 顶部应用栏，涵盖 small、center-aligned、medium-flexible 与 large-flexible 四种形态，内置弹簧平滑折叠与无障碍工具栏。",
      en: "Material 3 TopAppBar supporting small, center-aligned, medium-flexible, and large-flexible variants with spring-smoothed scroll collapse.",
    },
    importStatement: 'import { TopAppBar } from "m3eui";',
    scenarios: [
      {
        id: "top-app-bar-small-center",
        title: {
          zh: "紧凑型与居中对齐应用栏 (small & center-aligned)",
          en: "Small & center-aligned variants",
        },
        description: {
          zh: "64px 标准高度顶栏，右侧操作按钮自动包裹在无障碍 Toolbar.Root 内支持方向键导航。",
          en: "64px single-row bars wrapping trailing action buttons inside an accessible Base UI Toolbar.",
        },
        code: `<TopAppBar
  variant="small"
  title="Component Explorer"
  navigationIcon={<IconButton icon={<MenuGlyph />} aria-label="Menu" />}
  actions={
    <>
      <IconButton icon={<SearchIcon />} aria-label="Search" />
      <IconButton icon={<SettingsGearIcon />} aria-label="Settings" />
    </>
  }
/>

<TopAppBar
  variant="center-aligned"
  title="m3eui Studio"
  navigationIcon={<IconButton icon={<MenuGlyph />} aria-label="Menu" />}
  actions={<Avatar fallback="M3" size="xs" />}
/>`,
        render: () => (
          <div style={STACK_COL}>
            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid var(--m3e-color-outline-variant)",
              }}
            >
              <TopAppBar
                variant="small"
                title="Component Explorer"
                navigationIcon={
                  <IconButton icon={<MenuHamburgerGlyph />} aria-label="Menu" />
                }
                actions={
                  <>
                    <IconButton icon={<SearchIcon size={18} />} aria-label="Search" />
                    <IconButton icon={<SettingsGearIcon size={18} />} aria-label="Settings" />
                  </>
                }
              />
            </div>

            <div
              style={{
                borderRadius: 18,
                overflow: "hidden",
                border: "1px solid var(--m3e-color-outline-variant)",
              }}
            >
              <TopAppBar
                variant="center-aligned"
                title="m3eui Studio"
                navigationIcon={
                  <IconButton icon={<MenuHamburgerGlyph />} aria-label="Menu" />
                }
                actions={<Avatar fallback="M3" size="xs" />}
              />
            </div>
          </div>
        ),
      },
      {
        id: "top-app-bar-flexible",
        title: {
          zh: "可折叠弹性大标题栏 (medium-flexible & large-flexible)",
          en: "Interactive flexible scroll collapse",
        },
        description: {
          zh: "拖动滑块改变 0–1 的 collapsedFraction，观测高度、字号、副标题透明度与单双行重排的实时弹簧过渡。",
          en: "Scrub collapsedFraction from 0 to 1 to inspect spring-smoothed height, title scale, subtitle fade, and single-row reflow.",
        },
        code: `<TopAppBar
  variant="medium-flexible"
  collapsedFraction={collapsedFraction}
  title="Medium Flexible App Bar"
  subtitle="Smoothly interpolates height and typography"
  navigationIcon={<IconButton icon={<MenuGlyph />} aria-label="Menu" />}
/>`,
        render: () => <TopAppBarFlexibleDemo />,
      },
      {
        id: "top-app-bar-scrolled",
        title: {
          zh: "滚动抬升表面与副标题 (scrolled & subtitle)",
          en: "Elevated scrolled state & subtitle",
        },
        description: {
          zh: "传入 scrolled={true} 显式激活 data-elevated 容器色调抬升状态，展示页面发生滚动后的视觉层次。",
          en: "Pass scrolled={true} to activate the elevated tonal container surface when content scrolls underneath.",
        },
        code: `<TopAppBar
  variant="small"
  scrolled
  title="Release Pipeline"
  subtitle="Branch: main · 45 checks green"
  actions={<Button size="xs" variant="tonal">Deploy</Button>}
/>`,
        render: () => (
          <div
            style={{
              borderRadius: 18,
              overflow: "hidden",
              border: "1px solid var(--m3e-color-outline-variant)",
            }}
          >
            <TopAppBar
              variant="small"
              scrolled
              title="Release Pipeline"
              subtitle="Branch: main · 45 checks green"
              navigationIcon={
                <IconButton icon={<CodeBracketsIcon size={18} />} aria-label="Repo" />
              }
              actions={
                <Button size="xs" variant="tonal">
                  Deploy
                </Button>
              }
            />
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "TopAppBar Props",
        rows: [
          {
            name: "title",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "应用栏主标题。",
              en: "Primary title node.",
            },
          },
          {
            name: "subtitle",
            type: "React.ReactNode",
            description: {
              zh: "可选副标题，在 flexible 模式下随折叠比例渐隐。",
              en: "Optional subtitle that fades out smoothly as flexible variants collapse.",
            },
          },
          {
            name: "variant",
            type: '"small" | "center-aligned" | "medium-flexible" | "large-flexible"',
            defaultValue: '"small"',
            description: {
              zh: "顶部应用栏尺寸与排版变体。",
              en: "Layout and height variant preset.",
            },
          },
          {
            name: "navigationIcon",
            type: "React.ReactNode",
            description: {
              zh: "左侧导航或返回图标按钮插槽。",
              en: "Leading navigation or back button slot.",
            },
          },
          {
            name: "actions",
            type: "React.ReactNode",
            description: {
              zh: "右侧工具栏动作按钮集合（内置 Toolbar 键盘导航）。",
              en: "Trailing action controls wrapped in an accessible Toolbar.",
            },
          },
          {
            name: "collapsedFraction",
            type: "number",
            defaultValue: "0",
            description: {
              zh: "0（完全展开）至 1（完全折叠）之间的连续折叠系数。",
              en: "0 (expanded) to 1 (collapsed) scroll fraction for flexible variants.",
            },
          },
          {
            name: "scrolled",
            type: "boolean",
            description: {
              zh: "是否启用滚动后的容器抬升背景色。",
              en: "Forces elevated container surface styling.",
            },
          },
        ],
      },
    ],
  },
  {
    slug: "search-bar",
    title: "SearchBar",
    primitive: "@base-ui/react/autocomplete · @base-ui/react/dialog",
    subtitle: {
      zh: "胶囊搜索栏 SearchBar 与全屏搜索视图 SearchView（最近搜索历史与 IME 安全提交）。",
      en: "Pill SearchBar and fullscreen SearchView with recent history and IME-safe submission.",
    },
    importStatement: 'import { SearchBar, SearchView } from "m3eui";',
    scenarios: [
      {
        id: "search-bar-suggestions",
        title: {
          zh: "自动补全建议与分类标签",
          en: "Autocomplete suggestions with categories",
        },
        description: {
          zh: "传入 suggestions 列表后聚焦或输入即可过滤匹配项，建议行按压时带有圆角弹性反馈。",
          en: "Focus or type to filter rich suggestions featuring icons, descriptions, category tags, and press-morphing rows.",
        },
        code: `<SearchBar
  suggestions={[
    { value: "alert", label: "Alert", category: "Feedback", description: "Inline banner" },
    { value: "pagination", label: "Pagination", category: "Navigation", description: "Page nav" },
  ]}
  onSearchSubmit={(query) => console.log(query)}
/>`,
        render: () => <SearchBarSuggestionsDemo />,
      },
      {
        id: "search-bar-sizes",
        title: {
          zh: "紧凑顶栏尺寸与标准独立尺寸 (sm vs md)",
          en: "Compact sm vs standalone md sizes",
        },
        description: {
          zh: "size=\"sm\"（40px 高）适配嵌入 TopAppBar，size=\"md\"（56px 高）适合页面主搜索框并可配置 trailingSlot。",
          en: "Compare 40px header-ready size=\"sm\" against 56px standalone size=\"md\" with a custom trailingSlot.",
        },
        code: `<SearchBar size="sm" placeholder="Compact header search (40px)…" />
<SearchBar
  size="md"
  defaultValue="SpringSimulation"
  trailingSlot={<Kbd size="sm" keys={["mod", "k"]} />}
/>`,
        render: () => (
          <div style={{ ...STACK_COL, maxWidth: 480 }}>
            <SearchBar size="sm" placeholder="Compact header search (40px)…" />
            <SearchBar
              size="md"
              defaultValue="SpringSimulation"
              trailingSlot={<Kbd size="sm" keys={["mod", "k"]} />}
            />
          </div>
        ),
      },
      {
        id: "search-bar-disabled",
        title: {
          zh: "禁用状态",
          en: "Disabled SearchBar",
        },
        description: {
          zh: "索引尚未构建完成时通过 disabled 锁定输入与提交按钮。",
          en: "Disables input, clear action, and submit button while search indexing is offline.",
        },
        code: `<SearchBar disabled placeholder="Indexing documentation…" />`,
        render: () => (
          <div style={{ maxWidth: 480, width: "100%" }}>
            <SearchBar disabled placeholder="Indexing documentation…" />
          </div>
        ),
      },
      {
        id: "search-view-modes",
        title: {
          zh: "全屏搜索视图 (SearchView)",
          en: "Fullscreen SearchView",
        },
        description: {
          zh: "内置最近搜索历史（支持一键清空）与实时过滤建议。",
          en: "Displays recent searches and live-filtered suggestions.",
        },
        code: `<SearchView
  open={open}
  onOpenChange={setOpen}
  recentSearches={recent}
  onClearRecent={() => setRecent([])}
  suggestions={suggestions}
/>`,
        render: () => <SearchViewModesDemo />,
      },
    ],
    apis: [
      {
        title: "SearchBar Props & SearchSuggestion",
        rows: [
          {
            name: "suggestions",
            type: "readonly SearchSuggestion[]",
            defaultValue: "[]",
            description: {
              zh: "自动补全建议项列表 { value, label, category?, description?, icon? }。",
              en: "Autocomplete items { value, label, category?, description?, icon? }.",
            },
          },
          {
            name: "value / defaultValue / onValueChange",
            type: "string / (value: string) => void",
            defaultValue: '""',
            description: {
              zh: "受控或非受控查询字符串。",
              en: "Controlled or uncontrolled query string and change handler.",
            },
          },
          {
            name: "onSearchSubmit",
            type: "(query: string) => void",
            description: {
              zh: "点击搜索按钮、按回车（避开 IME 选词）或点选建议项时触发。",
              en: "Invoked on form submit, IME-safe Enter press, or suggestion selection.",
            },
          },
          {
            name: "size",
            type: '"md" | "sm"',
            defaultValue: '"md"',
            description: {
              zh: "搜索框高度规格（md 为 56px，sm 为 40px）。",
              en: "Bar height preset (\"md\" = 56px, \"sm\" = 40px).",
            },
          },
          {
            name: "trailingSlot",
            type: "React.ReactNode",
            description: {
              zh: "右侧附加元素插槽（如语音图标、头像或快捷键徽标）。",
              en: "Optional trailing node rendered after the clear button.",
            },
          },
          {
            name: "placeholder / emptyText",
            type: "string / React.ReactNode",
            description: {
              zh: "输入框占位文案与无匹配建议提示（默认自动本地化）。",
              en: "Placeholder and empty-autocomplete message (localized by default).",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用搜索框。",
              en: "Disables the search input and submit button.",
            },
          },
        ],
      },
      {
        title: "SearchView Props",
        rows: [
          {
            name: "open / onOpenChange",
            type: "boolean / (open: boolean) => void",
            defaultValue: "false",
            description: {
              zh: "控制 SearchView 展开与收起。",
              en: "Controlled open visibility state.",
            },
          },
          {
            name: "recentSearches / onClearRecent",
            type: "readonly string[] / () => void",
            defaultValue: "[]",
            description: {
              zh: "空查询时展示的最近搜索历史与清空回调。",
              en: "Recent search history entries and clear handler.",
            },
          },
        ],
      },
    ],
  },
];
