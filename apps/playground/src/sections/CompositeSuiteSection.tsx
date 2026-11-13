import * as React from "react";
import {
  Accordion,
  AssistChip,
  Button,
  ButtonGroup,
  Checkbox,
  Collapsible,
  DataTable,
  DateRangePicker,
  DropdownMenu,
  FAB,
  Fieldset,
  Form,
  Menubar,
  NavigationDrawer,
  NavigationMenu,
  NavigationSuite,
  type NavigationSuiteLayout,
  type PlainDateRange,
  Skeleton,
  Switch,
  TextField,
  TimePicker,
  TimePickerField,
  useM3E,
  useM3EToast,
} from "m3eui";
import { DocsCategoryHeader, ShowcaseCard } from "../components/ShowcaseCard";

interface TokenBenchmarkRow {
  readonly id: string;
  readonly component: string;
  readonly version: string;
  readonly stiffness: number;
  readonly dampingRatio: number;
  readonly restRadius: string;
}

const BENCHMARK_ROWS: readonly TokenBenchmarkRow[] = [
  {
    id: "btn",
    component: "Button (MD)",
    version: "v1.5.2",
    stiffness: 800,
    dampingRatio: 0.6,
    restRadius: "28px → 12px",
  },
  {
    id: "split",
    component: "SplitButton",
    version: "v1.5.10",
    stiffness: 800,
    dampingRatio: 0.6,
    restRadius: "20/4/4/20px",
  },
  {
    id: "carousel",
    component: "Carousel (Hero)",
    version: "v1.5.1",
    stiffness: 380,
    dampingRatio: 0.8,
    restRadius: "28px / 16px",
  },
  {
    id: "rail",
    component: "WideNavigationRail",
    version: "v1.5.9",
    stiffness: 380,
    dampingRatio: 0.8,
    restRadius: "24px → 12px",
  },
  {
    id: "time",
    component: "TimePicker Dial",
    version: "v1.5.3",
    stiffness: 800,
    dampingRatio: 0.6,
    restRadius: "28px 容器",
  },
];

function MiniNavIcon({ glyph }: { readonly glyph: string }) {
  return (
    <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">
      {glyph}
    </span>
  );
}

export default function CompositeSuiteSection(): React.JSX.Element {
  const { toast } = useM3EToast();
  const { debugGeometry, setDebugGeometry } = useM3E();

  // 1. TimePicker & DateRangePicker state
  const [alarmTime, setAlarmTime] = React.useState("09:30");
  const [use24h, setUse24h] = React.useState(false);
  const [sprintRange, setSprintRange] = React.useState<PlainDateRange>({
    start: "2026-11-10",
    end: "2026-11-16",
  });

  // 2. Form & Fieldset state
  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [workspaceSlug, setWorkspaceSlug] = React.useState("m3e-core");
  const [strictA11y, setStrictA11y] = React.useState(true);

  // 3. NavigationSuite & Drawer state
  const [suiteDest, setSuiteDest] = React.useState("overview");
  const [suiteLayout, setSuiteLayout] =
    React.useState<NavigationSuiteLayout>("wide-rail");
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  // 4. Menubar checkable state
  const [snapToGrid, setSnapToGrid] = React.useState(true);
  const [showPixelRuler, setShowPixelRuler] = React.useState(false);

  // 5. DataTable & Skeleton state
  const [selectedRows, setSelectedRows] = React.useState<string[]>(["btn", "split"]);
  const [showSkeletons, setShowSkeletons] = React.useState(false);

  const navItems = [
    {
      value: "overview",
      label: "总览看板",
      icon: <MiniNavIcon glyph="◈" />,
      section: "工作台",
    },
    {
      value: "tokens",
      label: "物理令牌",
      icon: <MiniNavIcon glyph="✦" />,
      badgeCount: 6,
      section: "工作台",
    },
    {
      value: "shapes",
      label: "多边形库",
      icon: <MiniNavIcon glyph="⬡" />,
      section: "设计资产",
    },
    {
      value: "a11y",
      label: "无障碍审计",
      icon: <MiniNavIcon glyph="✓" />,
      badgeDot: true,
      section: "设计资产",
    },
  ] as const;

  return (
    <div id="cat-composite" className="docs-category">
      <DocsCategoryHeader
        indexLabel="07"
        title="高阶复合组件与响应式套件"
        countLabel="6 组套件"
        subtitle="完整覆盖 M3E 站点顶部大菜单、页内可搜索折叠面板、模拟表盘时间选择器、区间日历、服务端校验表单、自适应导航骨架、多级应用菜单栏与可排序数据表格。"
      />

      {/* 0. NavigationMenu & Collapsible + Accordion ExpandAll */}
      <ShowcaseCard
        id="site-nav-collapsible"
        title="NavigationMenu 站点大菜单 · Collapsible 页内搜索折叠面板"
        primitive="@base-ui/react/navigation-menu · @base-ui/react/collapsible"
        description="NavigationMenu 保持标准 Tab 焦点流并通过 aria-current='page' 强化当前页指示；Collapsible 默认开启 hidden='until-found' 支持浏览器 Ctrl/Cmd+F 自动唤醒；Accordion 新增 showExpandAll 一键全部展开/收起。"
        code={`import { NavigationMenu, Collapsible, Accordion } from "m3eui";

<NavigationMenu
  brand="M3E System"
  items={[
    { value: "docs", label: "概览文档", href: "#theme-setup", active: true },
    {
      value: "foundations",
      label: "设计基石",
      links: [
        { id: "hct", title: "HCT 动态色", description: "五级表面容器算法", href: "#theme-setup" },
        { id: "spring", title: "双轨物理弹簧", description: "Spatial vs Effects 阻尼", href: "#button" },
      ],
    },
  ]}
/>

<Collapsible title="架构说明（支持 Ctrl/Cmd+F 搜索唤醒）" defaultOpen={false}>
  隐藏状态下依然可被浏览器页内查找命中并自动展开面板。
</Collapsible>`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <NavigationMenu
            brand={
              <span>
                <MiniNavIcon glyph="✦" /> M3E Docs
              </span>
            }
            trailing={
              <Button
                size="xs"
                variant="tonal"
                onClick={() => toast({ title: "已打开 v1.0 快速开始指南" })}
              >
                v1.0.0
              </Button>
            }
            items={[
              {
                value: "overview-link",
                label: "入门配置",
                href: "#theme-setup",
                active: true,
              },
              {
                value: "foundations",
                label: "设计基石",
                featured: {
                  eyebrow: "Material 3 Expressive 1.5",
                  title: "双轨物理与 HCT 色彩",
                  description:
                    "空间弹簧允许轻盈回弹，视觉效果保持临界阻尼零闪烁，配合 m3e.json 一键生成静态变量。",
                  href: "#theme-setup",
                },
                links: [
                  {
                    id: "nav-hct",
                    title: "m3e.json 声明式配置",
                    description: "统一收敛种子色、对比度、语言与自动 RTL",
                    badge: "v1.0",
                    href: "#theme-setup",
                    icon: <MiniNavIcon glyph="◈" />,
                  },
                  {
                    id: "nav-i18n",
                    title: "Key 驱动多语言 i18n",
                    description: "内置 zh-CN / en-US / ja-JP / ar-SA 字典",
                    href: "#date-picker",
                    icon: <MiniNavIcon glyph="🌐" />,
                  },
                  {
                    id: "nav-shapes",
                    title: "35 种归一化多边形",
                    description: "三次贝塞尔闭合曲线实时插值形变",
                    href: "#shapes",
                    icon: <MiniNavIcon glyph="⬡" />,
                  },
                  {
                    id: "nav-cli",
                    title: "m3eui 命令行工具",
                    description: "init / sync / locale / doctor 全链路体检",
                    href: "#theme-setup",
                    icon: <MiniNavIcon glyph="⚡" />,
                  },
                ],
              },
              {
                value: "primitives",
                label: "复合原语",
                links: [
                  {
                    id: "nav-time",
                    title: "TimePicker 256px 表盘",
                    description: "24h 内外双环与键盘双模式",
                    href: "#time-date-range",
                    icon: <MiniNavIcon glyph="◷" />,
                  },
                  {
                    id: "nav-table",
                    title: "DataTable 自然排序表",
                    description: "Intl.Collator 本地化数值自然排序",
                    href: "#data-table-skeleton",
                    icon: <MiniNavIcon glyph="▤" />,
                  },
                ],
              },
              {
                value: "spec-link",
                label: "规范表盘",
                href: "#data-table-skeleton",
              },
            ]}
          />

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: 14,
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Collapsible
                title="Collapsible 独立折叠面板 (Tonal)"
                subtitle="默认启用 hidden='until-found' 页内搜索唤醒"
                trailingBadge="Find-in-Page"
                defaultOpen
              >
                折叠面板将内边距与顶部分隔线置于内层容器而非{" "}
                <code>[hidden=&quot;until-found&quot;]</code> 宿主节点，避免折叠态残留空白并在 RTL 语言下自动镜像箭头旋转方向。
              </Collapsible>
              <Collapsible
                variant="outlined"
                title="CSPProvider 严格内容安全策略支持"
                subtitle="通过 m3e.json 的 csp.nonce 自动透传"
              >
                当宿主环境启用严格 <code>Content-Security-Policy</code> 时，只需在{" "}
                <code>m3e.json</code> 或 <code>&lt;M3EProvider cspNonce=&quot;...&quot;&gt;</code>{" "}
                中声明 Nonce，底层全部浮层与过渡样式均安全合规。
              </Collapsible>
            </div>

            <Accordion
              showExpandAll
              aria-label="架构常见问题"
              defaultValue={["faq-i18n"]}
              items={[
                {
                  value: "faq-i18n",
                  title: "切换顶部语言按钮时发生了什么？",
                  content:
                    "切换至 العربية (ar-SA) 时，M3EProvider 会自动将 html[lang='ar-SA'] 与 html[dir='rtl'] 同步就位，所有内置按钮提示、日历星期与时间选择器瞬时切换。",
                },
                {
                  value: "faq-cli",
                  title: "如何像 shadcn/ui 一样管理主题？",
                  content:
                    "修改根目录 m3e.json 后执行 pnpm m3e:sync，即可重新生成首屏零 JS 闪烁的 light-dark() 静态样式表。",
                },
              ]}
            />
          </div>
        </div>
      </ShowcaseCard>

      {/* 1. TimePicker & DateRangePicker */}
      <ShowcaseCard
        id="time-date-range"
        title="TimePicker 模拟表盘 & DateRangePicker 日期区间"
        primitive="m3eui/tokens · Polar Clock Hand + Range Strip"
        description="TimePicker 支持 12h AM/PM 与 24h 内外双环表盘、最短弧度物理弹簧指针扫掠及键盘数字输入切换；DateRangePicker 提供起止胶囊与连续 secondary-container 区间色带。"
        code={`import { TimePicker, TimePickerField, DateRangePicker } from "m3eui";

<TimePicker value={time} onValueChange={setTime} use24Hour={use24h} />
<TimePickerField label="提醒时间" value={time} onValueChange={setTime} />
<DateRangePicker value={range} onValueChange={setRange} />`}
      >
        <div className="demo-row" style={{ justifyContent: "space-between" }}>
          <Switch
            checked={use24h}
            onCheckedChange={setUse24h}
            label="启用 24 小时内外双环表盘"
          />
          <TimePickerField
            label="弹窗式 TimePickerField"
            value={alarmTime}
            use24Hour={use24h}
            onValueChange={setAlarmTime}
          />
        </div>
        <div className="demo-grid-2" style={{ alignItems: "start" }}>
          <TimePicker
            value={alarmTime}
            use24Hour={use24h}
            onValueChange={setAlarmTime}
            title={`设定构建窗口 (${alarmTime})`}
          />
          <DateRangePicker
            value={sprintRange}
            onValueChange={(next) => {
              setSprintRange(next);
              toast({
                title: "已更新迭代周期",
                description: `${next.start} → ${next.end}`,
              });
            }}
            title="迭代排期区间 (点击两日自动排序)"
          />
        </div>
      </ShowcaseCard>

      {/* 2. Form & Fieldset */}
      <ShowcaseCard
        id="form-fieldset"
        title="Form 校验编排 & Fieldset 语义分组"
        primitive="@base-ui/react/form · @base-ui/react/fieldset"
        description="基于 Base UI Form 协调原生与服务端异步 errors 映射，提交失败自动聚焦首个非法控件；Fieldset 严格保证原生 <legend> 作为 <fieldset> 首个子元素渲染。"
        code={`import { Form, Fieldset, TextField, Switch, Button } from "m3eui";

<Form errors={errors} showErrorSummary onSubmit={handleSubmit}>
  <Fieldset legend="工作区标识" description="用于生成包作用域与令牌前缀">
    <TextField name="slug" label="空间短名称" required />
    <Switch name="strictA11y" label="强制对比度与焦点环守卫" defaultChecked />
  </Fieldset>
  <Button type="submit" variant="filled">保存配置</Button>
</Form>`}
      >
        <Form
          errors={formErrors}
          showErrorSummary
          onSubmit={(e) => {
            e.preventDefault();
            if (workspaceSlug.trim() === "admin" || workspaceSlug.trim().length < 3) {
              setFormErrors({
                slug:
                  workspaceSlug.trim() === "admin"
                    ? "保留字「admin」已被系统占用，请更换空间标识。"
                    : "空间标识至少需要 3 个字符。",
              });
              return;
            }
            setFormErrors({});
            toast({
              title: "表单校验通过并已保存",
              description: `空间标识: ${workspaceSlug}`,
            });
          }}
        >
          <Fieldset
            legend="设计令牌工程配置"
            description="试试将下方输入改为「admin」或少于 3 个字符再点击提交，体验服务端错误回填与汇总横幅。"
          >
            <TextField
              name="slug"
              label="空间短标识 (Slug)"
              value={workspaceSlug}
              onValueChange={(v) => {
                setWorkspaceSlug(v);
                if (formErrors.slug) setFormErrors({});
              }}
              invalid={Boolean(formErrors.slug)}
              errorMessage={formErrors.slug}
              required
            />
            <Checkbox
              checked={strictA11y}
              onCheckedChange={setStrictA11y}
              label="构建时自动校验 WCAG AA 对比度与 aria-sort 约束"
            />
          </Fieldset>
          <div className="demo-row">
            <Button type="submit" variant="filled">
              提交保存
            </Button>
            <Button
              type="button"
              variant="tonal"
              onClick={() => {
                setWorkspaceSlug("admin");
                setFormErrors({
                  slug: "保留字「admin」已被系统占用，请更换空间标识。",
                });
              }}
            >
              模拟服务端冲突错误
            </Button>
          </div>
        </Form>
      </ShowcaseCard>

      {/* 3. WideNavigationRail, NavigationDrawer & NavigationSuite */}
      <ShowcaseCard
        id="navigation-suite"
        title="WideNavigationRail, NavigationDrawer & NavigationSuite"
        primitive="@base-ui/react/drawer · ResizeObserver Adaptive Shell"
        description="NavigationSuite 根据容器宽度自动在底部 NavigationBar (<640px)、窄版 NavigationRail 与可折叠弹簧宽轨 WideNavigationRail (84px ↔ 228px) 之间无缝切换。"
        code={`import { NavigationSuite, NavigationDrawer, FAB } from "m3eui";

<NavigationSuite
  layout="auto"
  value={active}
  onValueChange={setActive}
  items={navItems}
>
  <main>自适应主内容区</main>
</NavigationSuite>`}
      >
        <div className="demo-row" style={{ justifyContent: "space-between" }}>
          <ButtonGroup
            variant="connected"
            size="xs"
            value={[suiteLayout]}
            onValueChange={(vals) => {
              const next = vals[0] as NavigationSuiteLayout | undefined;
              if (next) setSuiteLayout(next);
            }}
            items={[
              { value: "wide-rail", label: "宽轨 (WideRail)" },
              { value: "rail", label: "窄轨 (Rail)" },
              { value: "bar", label: "底栏 (Bar)" },
              { value: "auto", label: "自适应 (Auto)" },
            ]}
          />

          <NavigationDrawer
            variant="modal"
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            headline="M3E 模态抽屉导航"
            items={navItems}
            value={suiteDest}
            onValueChange={setSuiteDest}
            trigger={<Button variant="outlined">打开模态 NavigationDrawer</Button>}
          />
        </div>

        <NavigationSuite
          layout={suiteLayout}
          items={navItems}
          value={suiteDest}
          onValueChange={setSuiteDest}
          header={
            <FAB
              size="sm"
              variant="tertiary"
              icon="+"
              aria-label="新建组件快照"
              onClick={() => toast({ title: "已创建导航快照" })}
            />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AssistChip>
              {`当前形态: ${suiteLayout} · 当前路由: ${suiteDest}`}
            </AssistChip>
            <h4 style={{ margin: "4px 0 0", fontSize: 17 }}>
              M3E 响应式导航工作区
            </h4>
            <p
              style={{
                margin: 0,
                fontSize: 13.5,
                color: "var(--m3e-color-on-surface-variant)",
              }}
            >
              在宽轨模式下点击左上角汉堡折叠按钮，观察 228px ↔ 84px 的空间物理弹簧过渡；切换顶部 RTL 按钮还可验证抽屉自动镜像从右侧滑出。
            </p>
          </div>
        </NavigationSuite>
      </ShowcaseCard>

      {/* 4. Menubar & Nested Submenu */}
      <ShowcaseCard
        id="menubar-submenu"
        title="Menubar 应用命令栏 & 多级嵌套 Submenu"
        primitive="@base-ui/react/menubar · Menu.SubmenuRoot"
        description="遵循现代桌面 Web 规范：整条 Menubar 为单一连续胶囊（单一 Tab 停靠点，展开任一菜单后鼠标掠过相邻标题瞬时切换）；支持无限级嵌套子菜单与复选菜单项。"
        code={`import { Menubar } from "m3eui";

<Menubar
  menus={[
    {
      id: "file",
      label: "文件",
      items: [
        { id: "new", label: "新建画布", shortcut: "⌘N" },
        {
          id: "export",
          label: "导出设计令牌",
          submenu: [
            { id: "json", label: "导出 tokens.json" },
            { id: "css", label: "导出 light-dark() CSS" },
          ],
        },
      ],
    },
  ]}
/>`}
      >
        <div className="demo-row" style={{ gap: 16 }}>
          <Menubar
            menus={[
              {
                id: "file",
                label: "文件 (File)",
                items: [
                  {
                    id: "new-spec",
                    label: "新建主题预设",
                    shortcut: "⌘N",
                    onSelect: () => toast({ title: "已新建空白主题预设" }),
                  },
                  {
                    id: "export-sub",
                    label: "导出跨平台令牌",
                    submenu: [
                      {
                        id: "exp-json",
                        label: "JSON 静态产物 (tokens.json)",
                        onSelect: () => toast({ title: "已导出 tokens.json" }),
                      },
                      {
                        id: "exp-css",
                        label: "Web CSS (light-dark 变量)",
                        onSelect: () => toast({ title: "已导出 m3e.css" }),
                      },
                      {
                        id: "exp-compose",
                        label: "Jetpack Compose Kotlin",
                        separatorBefore: true,
                        onSelect: () => toast({ title: "已导出 Compose 弹簧配置" }),
                      },
                    ],
                  },
                  {
                    id: "reset",
                    label: "重置工作区",
                    danger: true,
                    separatorBefore: true,
                    onSelect: () => toast({ title: "工作区状态已重置" }),
                  },
                ],
              },
              {
                id: "view",
                label: "视图 (View)",
                items: [
                  {
                    id: "grid",
                    label: "对齐 4px 基线网格",
                    checked: snapToGrid,
                    onCheckedChange: setSnapToGrid,
                  },
                  {
                    id: "ruler",
                    label: "显示像素标尺参考线",
                    checked: showPixelRuler,
                    onCheckedChange: setShowPixelRuler,
                  },
                  {
                    id: "debug-geo",
                    label: "实时几何圆角标尺",
                    checked: debugGeometry,
                    onCheckedChange: setDebugGeometry,
                    separatorBefore: true,
                  },
                ],
              },
              {
                id: "help",
                label: "帮助 (Help)",
                items: [
                  {
                    id: "llms",
                    label: "查看 AI llms.txt 指南",
                    onSelect: () =>
                      toast({
                        title: "AI 规范已就绪",
                        description: "位于仓库根目录 /llms.txt 与 /spec/AI_SKILL.md",
                      }),
                  },
                ],
              },
            ]}
          />

          <DropdownMenu
            trigger={<Button variant="tonal">独立多级 DropdownMenu</Button>}
            items={[
              {
                id: "copy-import",
                label: "复制 import 语句",
                shortcut: "⌘C",
                onSelect: () => toast({ title: "已复制 m3eui 导入代码" }),
              },
              {
                id: "spring-preset",
                label: "切换弹簧阻尼预设",
                submenu: [
                  {
                    id: "sp-fast",
                    label: "fastSpatial (ζ=0.6, k=800)",
                    onSelect: () => toast({ title: "已检视 fastSpatial" }),
                  },
                  {
                    id: "sp-default",
                    label: "defaultSpatial (ζ=0.8, k=380)",
                    onSelect: () => toast({ title: "已检视 defaultSpatial" }),
                  },
                ],
              },
            ]}
          />
        </div>
      </ShowcaseCard>

      {/* 5. DataTable & Skeleton */}
      <ShowcaseCard
        id="data-table-skeleton"
        title="DataTable 可排序数据表 & Skeleton 多边形骨架屏"
        primitive="Intl.Collator · Container Query · MaterialShapes"
        description="DataTable 采用 tabIndex=0 无障碍横向滚动容器、表头内嵌 <button> 与精确 aria-sort 状态机（未排序列绝不挂载冗余属性），搭配支持 35 种官方多边形裁剪的 Skeleton。"
        code={`import { DataTable, Skeleton } from "m3eui";

<DataTable
  caption="M3E 组件弹簧参数基准表"
  selectable
  selectedRowKeys={selected}
  onSelectedRowKeysChange={setSelected}
  rows={rows}
  getRowKey={(r) => r.id}
  columns={columns}
/>

<Skeleton shape="cookie9Sided" width={52} />`}
      >
        <div className="demo-row" style={{ justifyContent: "space-between" }}>
          <Switch
            checked={showSkeletons}
            onCheckedChange={setShowSkeletons}
            label="切换 Skeleton 加载态预览（含多边形骨架）"
          />
          <span
            style={{
              fontSize: 12.5,
              color: "var(--m3e-color-on-surface-variant)",
            }}
          >
            已选中 {selectedRows.length} / {BENCHMARK_ROWS.length} 行 · 点击「版本号」体验 v1.5.2 &lt; v1.5.10 自然排序
          </span>
        </div>

        {showSkeletons ? (
          <div
            className="demo-panel"
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div className="demo-row" style={{ gap: 16 }}>
              <Skeleton shape="cookie9Sided" width={52} />
              <Skeleton shape="clover4Leaf" width={52} />
              <Skeleton shape="softBurst" width={52} />
              <div
                style={{
                  flex: "1 1 220px",
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <Skeleton variant="text" width="55%" height={16} />
                <Skeleton variant="text" width="85%" height={13} />
              </div>
            </div>
            <Skeleton variant="rounded" height={128} />
          </div>
        ) : (
          <DataTable
            caption="Material 3 Expressive 核心组件几何与弹簧基准"
            selectable
            selectedRowKeys={selectedRows}
            onSelectedRowKeysChange={setSelectedRows}
            defaultSort={{ columnId: "version", direction: "ascending" }}
            rows={BENCHMARK_ROWS}
            getRowKey={(r) => r.id}
            columns={[
              {
                id: "component",
                header: "组件名称",
                sortable: true,
                isRowHeader: true,
                sortAccessor: (r) => r.component,
                cell: (r) => r.component,
              },
              {
                id: "version",
                header: "规范版本",
                sortable: true,
                sortAccessor: (r) => r.version,
                cell: (r) => r.version,
              },
              {
                id: "stiffness",
                header: "刚度 k",
                align: "end",
                sortable: true,
                sortAccessor: (r) => r.stiffness,
                cell: (r) => `${r.stiffness}`,
              },
              {
                id: "damping",
                header: "阻尼比 ζ",
                align: "end",
                sortable: true,
                sortAccessor: (r) => r.dampingRatio,
                cell: (r) => r.dampingRatio.toFixed(2),
              },
              {
                id: "radius",
                header: "圆角拓扑",
                align: "end",
                cell: (r) => r.restRadius,
              },
            ]}
          />
        )}
      </ShowcaseCard>
    </div>
  );
}
