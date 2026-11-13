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
import { usePlaygroundStrings } from "../i18n";

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
    component: "TimePicker",
    version: "v1.5.3",
    stiffness: 800,
    dampingRatio: 0.6,
    restRadius: "28px",
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
  const ui = usePlaygroundStrings();
  const { toast } = useM3EToast();
  const { debugGeometry, setDebugGeometry } = useM3E();

  const [alarmTime, setAlarmTime] = React.useState("09:30");
  const [use24h, setUse24h] = React.useState(false);
  const [sprintRange, setSprintRange] = React.useState<PlainDateRange>({
    start: "2026-11-10",
    end: "2026-11-16",
  });

  const [formErrors, setFormErrors] = React.useState<Record<string, string>>({});
  const [workspaceSlug, setWorkspaceSlug] = React.useState("m3e-core");
  const [strictA11y, setStrictA11y] = React.useState(true);

  const [suiteDest, setSuiteDest] = React.useState("overview");
  const [suiteLayout, setSuiteLayout] =
    React.useState<NavigationSuiteLayout>("wide-rail");
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const [snapToGrid, setSnapToGrid] = React.useState(true);
  const [showPixelRuler, setShowPixelRuler] = React.useState(false);

  const [selectedRows, setSelectedRows] = React.useState<string[]>(["btn", "split"]);
  const [showSkeletons, setShowSkeletons] = React.useState(false);

  const navItems = [
    {
      value: "overview",
      label: "总览",
      icon: <MiniNavIcon glyph="◈" />,
      section: "工作台",
    },
    {
      value: "tokens",
      label: "设计令牌",
      icon: <MiniNavIcon glyph="✦" />,
      badgeCount: 6,
      section: "工作台",
    },
    {
      value: "shapes",
      label: "多边形",
      icon: <MiniNavIcon glyph="⬡" />,
      section: "资源",
    },
    {
      value: "a11y",
      label: "无障碍",
      icon: <MiniNavIcon glyph="✓" />,
      badgeDot: true,
      section: "资源",
    },
  ] as const;

  return (
    <div id="cat-composite" className="docs-category">
      <DocsCategoryHeader indexLabel="07" title={ui.navGroups[6]} />

      <ShowcaseCard
        id="site-nav-collapsible"
        title="NavigationMenu & Collapsible"
        code={`import { NavigationMenu, Collapsible } from "m3eui";

<NavigationMenu
  brand="m3eui"
  items={[
    { value: "docs", label: "文档", href: "#theme-setup", active: true },
    {
      value: "foundations",
      label: "设计基础",
      links: [
        { id: "hct", title: "HCT 色彩", href: "#theme-setup" },
        { id: "spring", title: "物理弹簧", href: "#button" },
      ],
    },
  ]}
/>

<Collapsible title="部署配置" defaultOpen={false}>
  构建产物输出至 dist 目录。
</Collapsible>`}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <NavigationMenu
            brand={
              <span>
                <MiniNavIcon glyph="✦" /> m3eui
              </span>
            }
            trailing={
              <Button
                size="xs"
                variant="tonal"
                onClick={() => toast({ title: "v0.1.0" })}
              >
                v0.1.0
              </Button>
            }
            items={[
              {
                value: "overview-link",
                label: "入门",
                href: "#theme-setup",
                active: true,
              },
              {
                value: "foundations",
                label: "基础模块",
                featured: {
                  eyebrow: "m3eui",
                  title: "主题与动效",
                  description: "HCT 色板、弹簧参数与多语言配置。",
                  href: "#theme-setup",
                },
                links: [
                  {
                    id: "nav-hct",
                    title: "m3e.json",
                    description: "主题色与对比度配置",
                    badge: "v0.1",
                    href: "#theme-setup",
                    icon: <MiniNavIcon glyph="◈" />,
                  },
                  {
                    id: "nav-i18n",
                    title: "国际化",
                    description: "zh-CN / en-US / ja-JP / ar-SA",
                    href: "#date-picker",
                    icon: <MiniNavIcon glyph="🌐" />,
                  },
                  {
                    id: "nav-shapes",
                    title: "MaterialShapes",
                    description: "35 种矢量多边形",
                    href: "#shapes",
                    icon: <MiniNavIcon glyph="⬡" />,
                  },
                  {
                    id: "nav-cli",
                    title: "CLI",
                    description: "init / sync / locale / doctor",
                    href: "#theme-setup",
                    icon: <MiniNavIcon glyph="⚡" />,
                  },
                ],
              },
              {
                value: "primitives",
                label: "复合组件",
                links: [
                  {
                    id: "nav-time",
                    title: "TimePicker",
                    description: "12h / 24h 表盘与键盘输入",
                    href: "#time-date-range",
                    icon: <MiniNavIcon glyph="◷" />,
                  },
                  {
                    id: "nav-table",
                    title: "DataTable",
                    description: "排序与行选择表格",
                    href: "#data-table-skeleton",
                    icon: <MiniNavIcon glyph="▤" />,
                  },
                ],
              },
              {
                value: "spec-link",
                label: "数据表",
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
                title="构建输出"
                subtitle="Tonal 样式"
                trailingBadge="Vite"
                defaultOpen
              >
                静态资源默认输出至 <code>dist/assets</code>，支持相对路径部署。
              </Collapsible>
              <Collapsible
                variant="outlined"
                title="CSP 配置"
                subtitle="Outlined 样式"
              >
                通过 <code>m3e.json</code> 的 <code>csp.nonce</code> 字段传入安全策略标识。
              </Collapsible>
            </div>

            <Accordion
              showExpandAll
              aria-label="常见问题"
              defaultValue={["faq-i18n"]}
              items={[
                {
                  value: "faq-i18n",
                  title: "支持哪些内置语言？",
                  content: "内置简体中文、英语、日语与阿拉伯语（自动切换 RTL 布局）。",
                },
                {
                  value: "faq-cli",
                  title: "如何更新静态主题样式？",
                  content: "修改 m3e.json 后执行 npx m3eui sync 重新生成主题 CSS。",
                },
              ]}
            />
          </div>
        </div>
      </ShowcaseCard>

      <ShowcaseCard
        id="time-date-range"
        title="TimePicker & DateRangePicker"
        code={`import { TimePicker, TimePickerField, DateRangePicker } from "m3eui";

<TimePicker value={time} onValueChange={setTime} use24Hour={use24h} />
<TimePickerField label="提醒时间" value={time} onValueChange={setTime} />
<DateRangePicker value={range} onValueChange={setRange} />`}
      >
        <div className="demo-row" style={{ justifyContent: "space-between" }}>
          <Switch
            checked={use24h}
            onCheckedChange={setUse24h}
            label="24 小时制"
          />
          <TimePickerField
            label="选择时间"
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
            title={`时间 (${alarmTime})`}
          />
          <DateRangePicker
            value={sprintRange}
            onValueChange={(next) => {
              setSprintRange(next);
              toast({
                title: "已更新日期区间",
                description: `${next.start} → ${next.end}`,
              });
            }}
            title="日期区间"
          />
        </div>
      </ShowcaseCard>

      <ShowcaseCard
        id="form-fieldset"
        title="Form & Fieldset"
        code={`import { Form, Fieldset, TextField, Switch, Button } from "m3eui";

<Form errors={errors} showErrorSummary onSubmit={handleSubmit}>
  <Fieldset legend="工作区设置">
    <TextField name="slug" label="空间标识" required />
    <Switch name="strictA11y" label="开启对比度检查" defaultChecked />
  </Fieldset>
  <Button type="submit" variant="filled">保存</Button>
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
                    ? "保留字「admin」不可用。"
                    : "至少输入 3 个字符。",
              });
              return;
            }
            setFormErrors({});
            toast({
              title: "保存成功",
              description: workspaceSlug,
            });
          }}
        >
          <Fieldset legend="工作区设置">
            <TextField
              name="slug"
              label="空间标识"
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
              label="启用无障碍对比度校验"
            />
          </Fieldset>
          <div className="demo-row">
            <Button type="submit" variant="filled">
              保存
            </Button>
            <Button
              type="button"
              variant="tonal"
              onClick={() => {
                setWorkspaceSlug("admin");
                setFormErrors({
                  slug: "保留字「admin」不可用。",
                });
              }}
            >
              触发错误示例
            </Button>
          </div>
        </Form>
      </ShowcaseCard>

      <ShowcaseCard
        id="navigation-suite"
        title="NavigationSuite & NavigationDrawer"
        code={`import { NavigationSuite, NavigationDrawer } from "m3eui";

<NavigationSuite
  layout="auto"
  value={active}
  onValueChange={setActive}
  items={navItems}
>
  <main>主内容区</main>
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
              { value: "wide-rail", label: "WideRail" },
              { value: "rail", label: "Rail" },
              { value: "bar", label: "Bar" },
              { value: "auto", label: "Auto" },
            ]}
          />

          <NavigationDrawer
            variant="modal"
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            headline="导航目录"
            items={navItems}
            value={suiteDest}
            onValueChange={setSuiteDest}
            trigger={<Button variant="outlined">打开模态抽屉</Button>}
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
              aria-label="新建"
              onClick={() => toast({ title: "已新建项目" })}
            />
          }
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <AssistChip>{`${suiteLayout} · ${suiteDest}`}</AssistChip>
            <h4 style={{ margin: "4px 0 0", fontSize: 17 }}>工作区内容</h4>
          </div>
        </NavigationSuite>
      </ShowcaseCard>

      <ShowcaseCard
        id="menubar-submenu"
        title="Menubar & DropdownMenu"
        code={`import { Menubar } from "m3eui";

<Menubar
  menus={[
    {
      id: "file",
      label: "文件",
      items: [
        { id: "new", label: "新建", shortcut: "⌘N" },
        {
          id: "export",
          label: "导出",
          submenu: [
            { id: "json", label: "tokens.json" },
            { id: "css", label: "m3e-theme.css" },
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
                label: "文件",
                items: [
                  {
                    id: "new-spec",
                    label: "新建预设",
                    shortcut: "⌘N",
                    onSelect: () => toast({ title: "已新建预设" }),
                  },
                  {
                    id: "export-sub",
                    label: "导出令牌",
                    submenu: [
                      {
                        id: "exp-json",
                        label: "tokens.json",
                        onSelect: () => toast({ title: "已导出 tokens.json" }),
                      },
                      {
                        id: "exp-css",
                        label: "m3e-theme.css",
                        onSelect: () => toast({ title: "已导出 m3e-theme.css" }),
                      },
                      {
                        id: "exp-compose",
                        label: "Compose Kotlin",
                        separatorBefore: true,
                        onSelect: () => toast({ title: "已导出 Compose 配置" }),
                      },
                    ],
                  },
                  {
                    id: "reset",
                    label: "重置工作区",
                    danger: true,
                    separatorBefore: true,
                    onSelect: () => toast({ title: "已重置" }),
                  },
                ],
              },
              {
                id: "view",
                label: "视图",
                items: [
                  {
                    id: "grid",
                    label: "对齐网格",
                    checked: snapToGrid,
                    onCheckedChange: setSnapToGrid,
                  },
                  {
                    id: "ruler",
                    label: "显示标尺",
                    checked: showPixelRuler,
                    onCheckedChange: setShowPixelRuler,
                  },
                  {
                    id: "debug-geo",
                    label: "几何调试",
                    checked: debugGeometry,
                    onCheckedChange: setDebugGeometry,
                    separatorBefore: true,
                  },
                ],
              },
            ]}
          />

          <DropdownMenu
            trigger={<Button variant="tonal">多级菜单</Button>}
            items={[
              {
                id: "copy-import",
                label: "复制导入语句",
                shortcut: "⌘C",
                onSelect: () => toast({ title: "已复制" }),
              },
              {
                id: "spring-preset",
                label: "弹簧预设",
                submenu: [
                  {
                    id: "sp-fast",
                    label: "fastSpatial",
                    onSelect: () => toast({ title: "fastSpatial" }),
                  },
                  {
                    id: "sp-default",
                    label: "defaultSpatial",
                    onSelect: () => toast({ title: "defaultSpatial" }),
                  },
                ],
              },
            ]}
          />
        </div>
      </ShowcaseCard>

      <ShowcaseCard
        id="data-table-skeleton"
        title="DataTable & Skeleton"
        code={`import { DataTable, Skeleton } from "m3eui";

<DataTable
  caption="弹簧参数表"
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
            label="显示骨架屏"
          />
          <span
            style={{
              fontSize: 12.5,
              color: "var(--m3e-color-on-surface-variant)",
            }}
          >
            已选 {selectedRows.length} / {BENCHMARK_ROWS.length}
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
            caption="组件弹簧参数"
            selectable
            selectedRowKeys={selectedRows}
            onSelectedRowKeysChange={setSelectedRows}
            defaultSort={{ columnId: "version", direction: "ascending" }}
            rows={BENCHMARK_ROWS}
            getRowKey={(r) => r.id}
            columns={[
              {
                id: "component",
                header: "组件",
                sortable: true,
                isRowHeader: true,
                sortAccessor: (r) => r.component,
                cell: (r) => r.component,
              },
              {
                id: "version",
                header: "版本",
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
                header: "阻尼 ζ",
                align: "end",
                sortable: true,
                sortAccessor: (r) => r.dampingRatio,
                cell: (r) => r.dampingRatio.toFixed(2),
              },
              {
                id: "radius",
                header: "圆角",
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
