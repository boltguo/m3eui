import * as React from "react";
import {
  Accordion,
  Chip,
  Avatar,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  DataTable,
  Dialog,
  DialogClose,
  Divider,
  DragHandle,
  DropdownMenu,
  Empty,
  IconButton,
  LinearProgressIndicator,
  List,
  ListItem,
  type M3EDataTableColumn,
  type M3EDataTableSortState,
  type M3EShapeName,
  MaterialShapeView,
  Meter,
  NavigationRail,
  OTPField,
  Pagination,
  ScrollArea,
  Select,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  TextField,
  useM3EI18n,
  useM3EToast,
} from "m3eui";
import { resolveCopy } from "../i18n";
import {
  BarChartIcon,
  BellIcon,
  CodeBracketsIcon,
  DownloadIcon,
  EditIcon,
  FolderIcon,
  HomeGlyph,
  PlusIcon,
  SendIcon,
  SettingsGearIcon,
  ShareIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TrashIcon,
  UsersIcon,
} from "../layout/Icons";
import type { BlockSpec } from "./types";

/* -------------------------------------------------------------------------- */
/* Local Helper Icons & Responsive Shell Hook                                 */
/* -------------------------------------------------------------------------- */

function SidebarToggleIcon({ size = 16 }: { readonly size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <line x1="9" y1="3" x2="9" y2="21" />
    </svg>
  );
}

function MoreDotsVerticalIcon({ size = 16 }: { readonly size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="1.8" />
      <circle cx="12" cy="12" r="1.8" />
      <circle cx="12" cy="19" r="1.8" />
    </svg>
  );
}

function PasskeyIcon({ size = 16 }: { readonly size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="15" r="4" />
      <path d="M10.85 12.15 19 4" />
      <path d="m18 5 2 2" />
      <path d="m15 8 2 2" />
    </svg>
  );
}

function useContainerCompact(
  ref: React.RefObject<HTMLElement | null>,
  breakpoint = 820,
): boolean {
  const [compact, setCompact] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const check = () => {
      const w = el.getBoundingClientRect().width;
      if (w > 0) setCompact(w <= breakpoint);
    };
    check();
    if (typeof ResizeObserver === "undefined") return undefined;
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref, breakpoint]);

  return compact;
}

/* -------------------------------------------------------------------------- */
/* Block 1: dashboard-01                                                      */
/* -------------------------------------------------------------------------- */

interface DashboardRow {
  readonly id: string;
  readonly headerZh: string;
  readonly headerEn: string;
  readonly sectionTypeZh: string;
  readonly sectionTypeEn: string;
  readonly status: "done" | "in-process";
  readonly target: number;
  readonly reviewer: string;
  readonly initials: string;
}

const DASHBOARD_ROWS: readonly DashboardRow[] = [
  { id: "sec-01", headerZh: "执行摘要与北极星指标", headerEn: "Executive Summary & North Star", sectionTypeZh: "叙事总览", sectionTypeEn: "Narrative", status: "done", target: 24, reviewer: "Elena Rostova", initials: "ER" },
  { id: "sec-02", headerZh: "HCT 动态色度对比度矩阵", headerEn: "HCT Dynamic Chroma Contrast Matrix", sectionTypeZh: "设计令牌", sectionTypeEn: "Design Token", status: "done", target: 18, reviewer: "Marcus Chen", initials: "MC" },
  { id: "sec-03", headerZh: "弹簧物理微分方程调度器", headerEn: "Spring Physics ODE Frame Scheduler", sectionTypeZh: "架构规范", sectionTypeEn: "Architecture", status: "in-process", target: 32, reviewer: "Aria Takahashi", initials: "AT" },
  { id: "sec-04", headerZh: "连接按钮组非对称圆角拓扑", headerEn: "Connected Group Corner Topology", sectionTypeZh: "几何引擎", sectionTypeEn: "Geometry", status: "done", target: 16, reviewer: "Elena Rostova", initials: "ER" },
  { id: "sec-05", headerZh: "RTL 逻辑属性与双向排版审计", headerEn: "RTL Logical Properties & BiDi Audit", sectionTypeZh: "无障碍标准", sectionTypeEn: "Accessibility", status: "in-process", target: 20, reviewer: "Sami Al-Mansoor", initials: "SA" },
  { id: "sec-06", headerZh: "35 种多边形语义形态插值表", headerEn: "35-Polygon Morph Interpolation Atlas", sectionTypeZh: "架构规范", sectionTypeEn: "Architecture", status: "done", target: 28, reviewer: "Marcus Chen", initials: "MC" },
  { id: "sec-07", headerZh: "数据表键盘焦点与列头排序协议", headerEn: "DataTable Roving Focus & Sort Protocol", sectionTypeZh: "技术实现", sectionTypeEn: "Technical", status: "done", target: 14, reviewer: "Aria Takahashi", initials: "AT" },
  { id: "sec-08", headerZh: "高对比度 2025 规范令牌映射", headerEn: "High-Contrast 2025 Spec Token Mapping", sectionTypeZh: "设计令牌", sectionTypeEn: "Design Token", status: "in-process", target: 22, reviewer: "Elena Rostova", initials: "ER" },
  { id: "sec-09", headerZh: "无头 Base UI 浮层焦点陷阱验证", headerEn: "Headless Base UI Overlay Focus Trap", sectionTypeZh: "无障碍标准", sectionTypeEn: "Accessibility", status: "done", target: 19, reviewer: "Sami Al-Mansoor", initials: "SA" },
  { id: "sec-10", headerZh: "波浪进度指示器自适应振幅曲线", headerEn: "Wavy Progress Adaptive Amplitude Curve", sectionTypeZh: "几何引擎", sectionTypeEn: "Geometry", status: "done", target: 15, reviewer: "Marcus Chen", initials: "MC" },
  { id: "sec-11", headerZh: "CLI 按需源码注入与依赖解析器", headerEn: "CLI Block Registry & AST Resolver", sectionTypeZh: "技术实现", sectionTypeEn: "Technical", status: "in-process", target: 26, reviewer: "Aria Takahashi", initials: "AT" },
  { id: "sec-12", headerZh: "命令面板模糊检索与快捷键绑定", headerEn: "CommandPalette Fuzzy Index & Hotkeys", sectionTypeZh: "技术实现", sectionTypeEn: "Technical", status: "done", target: 12, reviewer: "Elena Rostova", initials: "ER" },
  { id: "sec-13", headerZh: "多语言数字与日期区域格式化器", headerEn: "Intl Number & PlainDate Locale Formatter", sectionTypeZh: "无障碍标准", sectionTypeEn: "Accessibility", status: "done", target: 17, reviewer: "Sami Al-Mansoor", initials: "SA" },
  { id: "sec-14", headerZh: "分段菜单选中项圆角弹性过渡", headerEn: "Segmented Menu Active Corner Spring", sectionTypeZh: "几何引擎", sectionTypeEn: "Geometry", status: "in-process", target: 21, reviewer: "Marcus Chen", initials: "MC" },
  { id: "sec-15", headerZh: "导航侧栏紧凑密度", headerEn: "NavigationRail Compact Density", sectionTypeZh: "架构规范", sectionTypeEn: "Architecture", status: "done", target: 25, reviewer: "Aria Takahashi", initials: "AT" },
  { id: "sec-16", headerZh: "OTP 验证码 WebOTP 自动填充协议", headerEn: "OTPField WebOTP Credential Handshake", sectionTypeZh: "技术实现", sectionTypeEn: "Technical", status: "done", target: 11, reviewer: "Elena Rostova", initials: "ER" },
  { id: "sec-17", headerZh: "企业级批量悬浮工具栏滚动折叠", headerEn: "FloatingToolbar Scroll-Collapse Spec", sectionTypeZh: "叙事总览", sectionTypeEn: "Narrative", status: "in-process", target: 19, reviewer: "Marcus Chen", initials: "MC" },
  { id: "sec-18", headerZh: "Q4 生产环境包体积与摇树基准报告", headerEn: "Q4 Bundle Size & Tree-Shaking Benchmark", sectionTypeZh: "叙事总览", sectionTypeEn: "Narrative", status: "done", target: 30, reviewer: "Aria Takahashi", initials: "AT" },
];

type ChartRange = "90d" | "30d" | "7d";

const AREA_CHART_SERIES: Record<
  ChartRange,
  {
    readonly primaryLine: string;
    readonly primaryArea: string;
    readonly tertiaryLine: string;
    readonly tertiaryArea: string;
    readonly labels: readonly string[];
    readonly totalText: string;
  }
> = {
  "90d": {
    primaryLine:
      "M 0 136 C 58 128, 92 94, 152 98 C 212 102, 248 64, 304 72 C 360 80, 402 42, 456 50 C 510 58, 558 28, 608 36 C 658 44, 710 18, 760 22",
    primaryArea:
      "M 0 136 C 58 128, 92 94, 152 98 C 212 102, 248 64, 304 72 C 360 80, 402 42, 456 50 C 510 58, 558 28, 608 36 C 658 44, 710 18, 760 22 L 760 176 L 0 176 Z",
    tertiaryLine:
      "M 0 156 C 62 150, 96 132, 152 136 C 208 140, 250 112, 304 118 C 358 124, 404 96, 456 102 C 508 108, 560 82, 608 88 C 656 94, 712 68, 760 72",
    tertiaryArea:
      "M 0 156 C 62 150, 96 132, 152 136 C 208 140, 250 112, 304 118 C 358 124, 404 96, 456 102 C 508 108, 560 82, 608 88 C 656 94, 712 68, 760 72 L 760 176 L 0 176 Z",
    labels: ["Aug 18", "Sep 02", "Sep 18", "Oct 04", "Oct 20", "Nov 14"],
    totalText: "142,890",
  },
  "30d": {
    primaryLine:
      "M 0 118 C 64 98, 102 114, 152 86 C 202 58, 252 78, 304 54 C 356 30, 406 62, 456 44 C 506 26, 558 48, 608 28 C 658 14, 710 30, 760 18",
    primaryArea:
      "M 0 118 C 64 98, 102 114, 152 86 C 202 58, 252 78, 304 54 C 356 30, 406 62, 456 44 C 506 26, 558 48, 608 28 C 658 14, 710 30, 760 18 L 760 176 L 0 176 Z",
    tertiaryLine:
      "M 0 148 C 64 136, 102 144, 152 124 C 202 104, 252 118, 304 98 C 356 78, 406 104, 456 92 C 506 80, 558 94, 608 78 C 658 64, 710 74, 760 64",
    tertiaryArea:
      "M 0 148 C 64 136, 102 144, 152 124 C 202 104, 252 118, 304 98 C 356 78, 406 104, 456 92 C 506 80, 558 94, 608 78 C 658 64, 710 74, 760 64 L 760 176 L 0 176 Z",
    labels: ["Oct 16", "Oct 22", "Oct 28", "Nov 03", "Nov 09", "Nov 14"],
    totalText: "54,320",
  },
  "7d": {
    primaryLine:
      "M 0 96 C 64 74, 112 88, 152 62 C 192 36, 250 52, 304 38 C 358 24, 408 46, 456 30 C 504 18, 560 34, 608 22 C 656 14, 712 24, 760 14",
    primaryArea:
      "M 0 96 C 64 74, 112 88, 152 62 C 192 36, 250 52, 304 38 C 358 24, 408 46, 456 30 C 504 18, 560 34, 608 22 C 656 14, 712 24, 760 14 L 760 176 L 0 176 Z",
    tertiaryLine:
      "M 0 132 C 64 118, 112 126, 152 108 C 192 92, 250 102, 304 88 C 358 76, 408 92, 456 80 C 504 70, 560 82, 608 70 C 656 60, 712 68, 760 58",
    tertiaryArea:
      "M 0 132 C 64 118, 112 126, 152 108 C 192 92, 250 102, 304 88 C 358 76, 408 92, 456 80 C 504 70, 560 82, 608 70 C 656 60, 712 68, 760 58 L 760 176 L 0 176 Z",
    labels: ["Fri", "Sun", "Mon", "Tue", "Wed", "Thu"],
    totalText: "14,910",
  },
};

function Dashboard01Block() {
  const { locale } = useM3EI18n();
  const { toast } = useM3EToast();
  const L = React.useCallback(
    (zh: string, en: string) => resolveCopy(locale, { zh, en }),
    [locale],
  );

  const shellRef = React.useRef<HTMLDivElement | null>(null);
  const isCompact = useContainerCompact(shellRef, 820);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = React.useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = React.useState(false);

  const [activeNav, setActiveNav] = React.useState("dashboard");
  const [chartRange, setChartRange] = React.useState<ChartRange>("90d");
  const [tableTab, setTableTab] = React.useState("outline");
  const [page, setPage] = React.useState(1);
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>([
    "sec-01",
    "sec-03",
  ]);
  const [sort, setSort] = React.useState<M3EDataTableSortState | null>(null);

  const gradPrimaryId = React.useId().replace(/:/g, "");
  const gradTertiaryId = React.useId().replace(/:/g, "");

  const primaryNavItems = [
    { id: "dashboard", label: L("仪表盘", "Dashboard"), icon: <HomeGlyph size={15} /> },
    { id: "lifecycle", label: L("生命周期", "Lifecycle"), icon: <SparkleIcon size={15} /> },
    { id: "analytics", label: L("分析洞察", "Analytics"), icon: <BarChartIcon size={15} /> },
    { id: "projects", label: L("项目空间", "Projects"), icon: <FolderIcon size={15} /> },
    { id: "team", label: L("团队成员", "Team"), icon: <UsersIcon size={15} /> },
  ] as const;

  const docNavItems = [
    { id: "data-library", label: L("资产数据库", "Data Library"), icon: <CodeBracketsIcon size={15} /> },
    { id: "reports", label: L("审计报表", "Reports"), icon: <ShieldCheckIcon size={15} /> },
    { id: "release-notes", label: L("发版日志", "Release Notes"), icon: <EditIcon size={15} /> },
  ] as const;

  const allNavItems = [...primaryNavItems, ...docNavItems];
  const currentNavLabel =
    allNavItems.find((i) => i.id === activeNav)?.label ??
    L("仪表盘", "Dashboard");

  const pageSize = 6;
  const pagedRows = React.useMemo(
    () => DASHBOARD_ROWS.slice((page - 1) * pageSize, page * pageSize),
    [page],
  );

  const columns = React.useMemo<readonly M3EDataTableColumn<DashboardRow>[]>(
    () => [
      {
        id: "header",
        header: L("章节标题", "Section Header"),
        isRowHeader: true,
        sortable: true,
        sortAccessor: (r) => L(r.headerZh, r.headerEn),
        cell: (r) => (
          <span style={{ fontWeight: 600, color: "var(--m3e-color-on-surface)" }}>
            {L(r.headerZh, r.headerEn)}
          </span>
        ),
      },
      {
        id: "type",
        header: L("章节类型", "Section Type"),
        cell: (r) => (
          <Chip variant="outlined" size="sm">
            {L(r.sectionTypeZh, r.sectionTypeEn)}
          </Chip>
        ),
      },
      {
        id: "status",
        header: L("状态", "Status"),
        cell: (r) =>
          r.status === "done" ? (
            <Chip dot tone="success" size="sm">
              {L("已完成", "Done")}
            </Chip>
          ) : (
            <Chip dot tone="warning" size="sm">
              {L("进行中", "In Process")}
            </Chip>
          ),
      },
      {
        id: "target",
        header: L("目标页数", "Target"),
        align: "end",
        sortable: true,
        sortAccessor: (r) => r.target,
        cell: (r) => (
          <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
            {r.target}
          </span>
        ),
      },
      {
        id: "reviewer",
        header: L("评审人", "Reviewer"),
        cell: (r) => (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Avatar size="xs" fallback={r.initials} />
            <span>{r.reviewer}</span>
          </span>
        ),
      },
      {
        id: "actions",
        header: "",
        headerLabel: L("操作", "Actions"),
        align: "end",
        cell: (r) => (
          <DropdownMenu
            align="end"
            trigger={
              <IconButton
                size="xs"
                variant="standard"
                aria-label={L("行操作菜单", "Row actions")}
                icon={<MoreDotsVerticalIcon size={15} />}
              />
            }
            items={[
              {
                id: "edit",
                label: L("编辑章节", "Edit section"),
                icon: <EditIcon size={14} />,
                onSelect: () =>
                  toast({
                    title: L("已打开章节编辑器", "Opened section editor"),
                    description: L(r.headerZh, r.headerEn),
                  }),
              },
              {
                id: "share",
                label: L("复制评审链接", "Copy review link"),
                icon: <ShareIcon size={14} />,
                onSelect: () =>
                  toast({ title: L("评审链接已复制", "Review link copied") }),
              },
              {
                id: "archive",
                label: L("归档记录", "Archive row"),
                danger: true,
                separatorBefore: true,
                icon: <TrashIcon size={14} />,
                onSelect: () =>
                  toast({ title: L("已移入归档", "Moved to archive") }),
              },
            ]}
          />
        ),
      },
    ],
    [L, toast],
  );

  const activeSeries = AREA_CHART_SERIES[chartRange];
  const sidebarVisible = isCompact ? mobileSidebarOpen : desktopSidebarOpen;

  const toggleSidebar = () => {
    if (isCompact) {
      setMobileSidebarOpen((v) => !v);
    } else {
      setDesktopSidebarOpen((v) => !v);
    }
  };

  return (
    <div
      ref={shellRef}
      className="m3e-block-app-shell"
      data-sidebar-open={sidebarVisible ? "true" : "false"}
      style={
        !isCompact && !desktopSidebarOpen
          ? { gridTemplateColumns: "minmax(0, 1fr)" }
          : undefined
      }
    >
      <aside
        className="m3e-block-sidebar"
        data-open={sidebarVisible ? "" : undefined}
        style={{
          display: sidebarVisible ? "flex" : "none",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 16,
          padding: 16,
          backgroundColor: "var(--m3e-color-surface-container-low)",
          borderInlineEnd: isCompact
            ? undefined
            : "1px solid var(--m3e-color-outline-variant)",
          borderBottom: isCompact
            ? "1px solid var(--m3e-color-outline-variant)"
            : undefined,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <MaterialShapeView
              shape="cookie9Sided"
              size={30}
              fill="var(--m3e-color-primary)"
            />
            <div style={{ display: "flex", flexDirection: "column", lineHeight: 1.2 }}>
              <strong style={{ fontSize: 14.5 }}>Acme M3E</strong>
              <span style={{ fontSize: 11.5, color: "var(--m3e-color-on-surface-variant)" }}>
                {L("企业遥测工作台", "Enterprise Telemetry")}
              </span>
            </div>
          </div>

          <Button
            variant="filled"
            size="sm"
            fullWidth
            leadingIcon={<PlusIcon size={16} />}
            onClick={() =>
              toast({
                title: L("快速新建面板已就绪", "Quick Create ready"),
                description: L(
                  "正在为您创建新的 M3E 指标看板草稿…",
                  "Creating a new M3E telemetry report draft…",
                ),
              })
            }
          >
            {L("快速新建", "Quick Create")}
          </Button>

          <NavigationRail
            expanded
            aria-label={L("工作台主导航", "Workspace navigation")}
            style={{
              width: "100%",
              border: "none",
              background: "transparent",
              padding: 0,
            }}
            items={[
              ...primaryNavItems.map((item) => ({
                value: item.id,
                label: item.label,
                icon: item.icon,
              })),
              ...docNavItems.map((item) => ({
                value: item.id,
                label: item.label,
                icon: item.icon,
                section: L("文档与资产", "Documents"),
              })),
            ]}
            value={activeNav}
            onValueChange={(nextId: string) => {
              setActiveNav(nextId);
              if (isCompact) setMobileSidebarOpen(false);
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
            padding: "8px 10px",
            borderRadius: 14,
            backgroundColor: "var(--m3e-color-surface-container)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 9, minWidth: 0 }}>
            <Avatar size="sm" shape="cookie7Sided" fallback="ER" />
            <div style={{ minWidth: 0, lineHeight: 1.25 }}>
              <div
                style={{
                  fontSize: 12.5,
                  fontWeight: 650,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                Elena Rostova
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "var(--m3e-color-on-surface-variant)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                elena@acme.m3e
              </div>
            </div>
          </div>

          <DropdownMenu
            align="end"
            side="top"
            trigger={
              <IconButton
                size="xs"
                variant="standard"
                aria-label={L("账户菜单", "Account menu")}
                icon={<MoreDotsVerticalIcon size={15} />}
              />
            }
            items={[
              {
                id: "profile",
                label: L("个人资料与安全", "Profile & Security"),
                icon: <SettingsGearIcon size={14} />,
                onSelect: () =>
                  toast({ title: L("打开账户设置", "Opened account settings") }),
              },
              {
                id: "notifications",
                label: L("通知偏好", "Notification rules"),
                icon: <BellIcon size={14} />,
              },
              {
                id: "signout",
                label: L("退出登录", "Sign out"),
                danger: true,
                separatorBefore: true,
                onSelect: () =>
                  toast({ title: L("已安全退出会话", "Signed out of session") }),
              },
            ]}
          />
        </div>
      </aside>

      <div
        className="m3e-block-main"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 18,
          padding: 20,
          minWidth: 0,
        }}
      >
        {/* Top bar */}
        <header
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
            paddingBottom: 12,
            borderBottom: "1px solid var(--m3e-color-outline-variant)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <IconButton
              size="xs"
              variant={sidebarVisible && isCompact ? "tonal" : "standard"}
              aria-label={L("切换侧边栏", "Toggle sidebar")}
              icon={<SidebarToggleIcon size={16} />}
              onClick={toggleSidebar}
            />
            <Breadcrumb
              separator="chevron"
              items={[
                { key: "org", label: "Acme M3E" },
                { key: "section", label: currentNavLabel },
              ]}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Button
              size="xs"
              variant="tonal"
              leadingIcon={<DownloadIcon size={14} />}
              onClick={() =>
                toast({
                  title: L("报表导出已开始", "Report export started"),
                  description: "acme-q4-telemetry.csv",
                })
              }
            >
              {L("导出 CSV", "Export CSV")}
            </Button>
          </div>
        </header>

        {/* 4 KPI Cards */}
        <div className="m3e-block-kpi-grid">
          <Card variant="outlined">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)", fontWeight: 500 }}>
                  {L("总营收", "Total Revenue")}
                </span>
                <Chip tone="success" size="sm">
                  +12.5%
                </Chip>
              </div>
              <div style={{ fontSize: 24, fontWeight: 750, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                $48,250.00
              </div>
              <span style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
                {L("较上月稳步增长", "Trending up this month")}
              </span>
            </div>
          </Card>

          <Card variant="outlined">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)", fontWeight: 500 }}>
                  {L("新增客户", "New Customers")}
                </span>
                <Chip tone="warning" size="sm">
                  -4.2%
                </Chip>
              </div>
              <div style={{ fontSize: 24, fontWeight: 750, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                1,284
              </div>
              <span style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
                {L("需关注企业漏斗转化", "Acquisition needs attention")}
              </span>
            </div>
          </Card>

          <Card variant="outlined">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)", fontWeight: 500 }}>
                  {L("活跃账户", "Active Accounts")}
                </span>
                <Chip tone="success" size="sm">
                  +14.8%
                </Chip>
              </div>
              <div style={{ fontSize: 24, fontWeight: 750, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                45,678
              </div>
              <span style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
                {L("94.2% 双周留存率", "94.2% bi-weekly retention")}
              </span>
            </div>
          </Card>

          <Card variant="outlined">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)", fontWeight: 500 }}>
                  {L("弹簧帧率", "Spring Frame Rate")}
                </span>
                <Chip tone="primary" size="sm">
                  {L("稳定", "Stable")}
                </Chip>
              </div>
              <div style={{ fontSize: 24, fontWeight: 750, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums" }}>
                120fps
              </div>
              <span style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
                {L("零布局抖动物理引擎", "Zero layout-thrash ODE")}
              </span>
            </div>
          </Card>
        </div>

        {/* Interactive SVG Area Chart Card */}
        <Card variant="outlined">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
                  <strong style={{ fontSize: 15.5 }}>
                    {L("总访问量趋势", "Total Visitors")}
                  </strong>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "var(--m3e-color-primary)",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {activeSeries.totalText}
                  </span>
                </div>
                <div style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
                  {L(
                    "桌面端与移动端双序列流量对比（响应式 HCT 渐变着色）",
                    "Desktop vs. mobile visitor telemetry with live M3E token gradients",
                  )}
                </div>
              </div>

              <ButtonGroup
                variant="connected"
                size="xs"
                selectionMode="single"
                aria-label={L("时间窗口", "Time range")}
                items={[
                  { value: "90d", label: L("近 90 天", "90d") },
                  { value: "30d", label: L("近 30 天", "30d") },
                  { value: "7d", label: L("近 7 天", "7d") },
                ]}
                value={[chartRange]}
                onValueChange={(vals) => {
                  const next = vals[0] as ChartRange | undefined;
                  if (next) setChartRange(next);
                }}
              />
            </div>

            <div style={{ width: "100%", overflow: "hidden" }}>
              <svg
                viewBox="0 0 760 200"
                role="img"
                aria-label={L("总访问量面积图", "Total visitors area chart")}
                style={{ width: "100%", height: "auto", display: "block" }}
              >
                <defs>
                  <linearGradient id={gradPrimaryId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--m3e-color-primary)" stopOpacity="0.38" />
                    <stop offset="100%" stopColor="var(--m3e-color-primary)" stopOpacity="0.02" />
                  </linearGradient>
                  <linearGradient id={gradTertiaryId} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--m3e-color-tertiary)" stopOpacity="0.30" />
                    <stop offset="100%" stopColor="var(--m3e-color-tertiary)" stopOpacity="0.02" />
                  </linearGradient>
                </defs>

                {[36, 82, 128, 176].map((y) => (
                  <line
                    key={y}
                    x1="0"
                    y1={y}
                    x2="760"
                    y2={y}
                    stroke="var(--m3e-color-outline-variant)"
                    strokeOpacity="0.55"
                    strokeDasharray={y === 176 ? undefined : "4 4"}
                  />
                ))}

                <path d={activeSeries.tertiaryArea} fill={`url(#${gradTertiaryId})`} />
                <path
                  d={activeSeries.tertiaryLine}
                  fill="none"
                  stroke="var(--m3e-color-tertiary)"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />

                <path d={activeSeries.primaryArea} fill={`url(#${gradPrimaryId})`} />
                <path
                  d={activeSeries.primaryLine}
                  fill="none"
                  stroke="var(--m3e-color-primary)"
                  strokeWidth="2.6"
                  strokeLinecap="round"
                />

                {activeSeries.labels.map((lbl, idx) => {
                  const x = 28 + idx * ((760 - 56) / (activeSeries.labels.length - 1));
                  return (
                    <text
                      key={lbl}
                      x={x}
                      y={195}
                      textAnchor="middle"
                      fill="var(--m3e-color-on-surface-variant)"
                      fontSize="11"
                    >
                      {lbl}
                    </text>
                  );
                })}
              </svg>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 12 }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    backgroundColor: "var(--m3e-color-primary)",
                  }}
                />
                {L("桌面端访问", "Desktop")}
              </span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 3,
                    backgroundColor: "var(--m3e-color-tertiary)",
                  }}
                />
                {L("移动端访问", "Mobile")}
              </span>
            </div>
          </div>
        </Card>

        {/* Tabbed DataTable Section */}
        <Tabs value={tableTab} onValueChange={setTableTab} variant="secondary">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <TabsList aria-label={L("文档视图切换", "Document views")}>
              <Tab value="outline">{L("架构大纲", "Outline")}</Tab>
              <Tab value="performance" badge="3">
                {L("历史表现", "Past Performance")}
              </Tab>
              <Tab value="focus" badge="2">
                {L("重点文档", "Focus Docs")}
              </Tab>
            </TabsList>

            <Button
              size="xs"
              variant="outlined"
              leadingIcon={<PlusIcon size={14} />}
              onClick={() =>
                toast({ title: L("已添加新规范章节", "Added new spec section") })
              }
            >
              {L("新增章节", "Add Section")}
            </Button>
          </div>

          <TabsPanel value="outline">
            <DataTable
              caption={L("架构规范评审表", "Architecture specification table")}
              hideCaption
              selectable
              density="compact"
              selectedRowKeys={selectedKeys}
              onSelectedRowKeysChange={setSelectedKeys}
              sort={sort}
              onSortChange={setSort}
              columns={columns}
              rows={pagedRows}
              getRowKey={(r) => r.id}
              toolbar={
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                    gap: 8,
                    fontSize: 12.5,
                    color: "var(--m3e-color-on-surface-variant)",
                  }}
                >
                  <span>
                    {L(
                      `已选 ${selectedKeys.length} 项评审条目`,
                      `${selectedKeys.length} section(s) selected`,
                    )}
                  </span>
                  <Chip tone="neutral" size="sm">
                    v2025.11
                  </Chip>
                </div>
              }
              footer={
                <Pagination
                  page={page}
                  totalPages={3}
                  totalItems={18}
                  pageSize={6}
                  showSummary
                  onPageChange={setPage}
                  size="sm"
                />
              }
            />
          </TabsPanel>

          <TabsPanel value="performance">
            <Card variant="outlined">
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <strong style={{ fontSize: 14.5 }}>
                  {L("季度渲染基准与包体积", "Quarterly Render & Bundle Benchmarks")}
                </strong>
                <Meter
                  value={94}
                  label={L("Lighthouse 性能与无障碍得分", "Lighthouse Performance & A11y")}
                  valueText="94 / 100"
                />
                <Meter
                  value={38}
                  label={L("核心运行时 Gzip 预算占用", "Core Runtime Gzip Budget Used")}
                  valueText="15.2 KB / 40 KB"
                />
              </div>
            </Card>
          </TabsPanel>

          <TabsPanel value="focus">
            <Card variant="outlined">
              <Empty
                compact
                shape="sunny"
                title={L("当前周期重点文档均已签署", "All focus documents signed off")}
                description={L(
                  "所有高优设计令牌与无障碍审计文档均已完成同行评审。",
                  "Every priority design-token and accessibility audit document has passed peer review.",
                )}
              />
            </Card>
          </TabsPanel>
        </Tabs>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Block 3: login-01                                                          */
/* -------------------------------------------------------------------------- */

const POSTER_SHAPES: readonly M3EShapeName[] = [
  "cookie9Sided",
  "clover4Leaf",
  "sunny",
  "softBoom",
];

function Login01Block() {
  const { locale } = useM3EI18n();
  const { toast } = useM3EToast();
  const L = React.useCallback(
    (zh: string, en: string) => resolveCopy(locale, { zh, en }),
    [locale],
  );

  const [step, setStep] = React.useState<"credentials" | "otp">("credentials");
  const [shapeIdx, setShapeIdx] = React.useState(0);
  const [email, setEmail] = React.useState("elena@acme.m3e");
  const [password, setPassword] = React.useState("M3Expressive!2025");
  const [otp, setOtp] = React.useState("482");

  const currentShape = POSTER_SHAPES[shapeIdx % POSTER_SHAPES.length]!;

  return (
    <div className="m3e-block-split-auth" style={{ padding: 20 }}>
      {/* Left expressive tonal brand poster */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 24,
          padding: 28,
          borderRadius: 24,
          background:
            "var(--m3e-color-primary-container)",
          color: "var(--m3e-color-on-primary-container)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <MaterialShapeView
              shape={currentShape}
              size={34}
              fill="var(--m3e-color-primary)"
            />
            <strong style={{ fontSize: 16 }}>Acme M3E Cloud</strong>
          </div>
          <Button
            size="xs"
            variant="tonal"
            onClick={() => setShapeIdx((i) => i + 1)}
          >
            {L("切换徽标形态", "Morph Emblem")}
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            gap: 16,
            paddingBlock: 12,
          }}
        >
          <MaterialShapeView
            shape={step === "otp" ? "sunny" : currentShape}
            size={84}
            fill="var(--m3e-color-primary)"
          />
          <blockquote
            style={{
              margin: 0,
              fontSize: 18,
              fontWeight: 650,
              lineHeight: 1.45,
              letterSpacing: "-0.01em",
            }}
          >
            {L(
              "“将零信任通行密钥、WebOTP 双因素认证与富有表现力的物理弹簧微交互融为一体。”",
              "“Zero-trust Passkey authentication paired with expressive Material 3 spring geometry and instant 2FA handoff.”",
            )}
          </blockquote>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Avatar size="sm" fallback="AT" />
            <div style={{ fontSize: 12.5 }}>
              <strong>Aria Takahashi</strong> ·{" "}
              <span>{L("安全架构负责人", "Staff Security Architect")}</span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          <Chip tone="primary" variant="solid" size="sm">
            FIDO2 Passkey
          </Chip>
          <Chip tone="secondary" size="sm">
            WebOTP 2FA
          </Chip>
          <Chip tone="tertiary" size="sm">
            SOC2 Type II
          </Chip>
        </div>
      </div>

      {/* Right login / 2FA card */}
      <Card
        variant="outlined"
        style={{ width: "100%", height: "100%", borderRadius: 24 }}
      >
        {step === "credentials" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 20 }}>
                  {L("欢迎回到工作空间", "Welcome back")}
                </strong>
                <Chip tone="primary" size="sm">
                  {L("步骤 1 / 2", "Step 1 / 2")}
                </Chip>
              </div>
              <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
                {L(
                  "使用通行密钥一键登录，或输入企业邮箱继续双因素验证。",
                  "Sign in with a hardware Passkey or continue with your work email.",
                )}
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Button
                variant="outlined"
                fullWidth
                leadingIcon={<PasskeyIcon size={16} />}
                onClick={() =>
                  toast({
                    title: L("已发起 WebAuthn 通行密钥验证", "Passkey challenge initiated"),
                    description: "navigator.credentials.get({ publicKey })",
                  })
                }
              >
                {L("使用 Passkey 通行密钥登录", "Continue with Passkey")}
              </Button>
              <Button
                variant="tonal"
                fullWidth
                leadingIcon={<ShieldCheckIcon size={16} />}
                onClick={() => setStep("otp")}
              >
                {L("企业 SSO 单点登录", "Continue with Enterprise SSO")}
              </Button>
            </div>

            <Divider label={L("或使用邮箱密码", "OR EMAIL & PASSWORD")} />

            <TextField
              type="email"
              label={L("企业邮箱", "Work Email")}
              value={email}
              onValueChange={setEmail}
              clearable
            />

            <TextField
              type="password"
              label={L("登录密码", "Password")}
              value={password}
              onValueChange={setPassword}
            />

            <Button
              variant="filled"
              fullWidth
              onClick={() => {
                setShapeIdx((i) => i + 1);
                setStep("otp");
              }}
            >
              {L("下一步：2FA 动态口令验证 →", "Continue to 2FA Verification →")}
            </Button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontSize: 20 }}>
                  {L("双因素安全验证", "Two-Factor Verification")}
                </strong>
                <Chip tone="success" dot size="sm">
                  {L("步骤 2 / 2", "Step 2 / 2")}
                </Chip>
              </div>
              <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
                {L(
                  `请输入发送至 ${email} 或验证器应用的 6 位数字验证码。`,
                  `Enter the 6-digit security code from your authenticator for ${email}.`,
                )}
              </span>
            </div>

            <OTPField
              length={6}
              separatorAfterIndex={2}
              value={otp}
              onValueChange={setOtp}
              label={L("6 位一次性验证码", "6-Digit Authenticator Code")}
              helperText={L(
                "聚焦槽位圆角会实时触发快空间弹簧形变",
                "Focused slot corners morph with fastSpatial spring physics",
              )}
            />

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Chip
                icon={<SparkleIcon size={14} />}
                onClick={() => setOtp("482910")}
              >
                {L("一键填入演示验证码 482-910", "Autofill demo code 482-910")}
              </Chip>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <Button
                variant="filled"
                fullWidth
                disabled={otp.length < 6}
                onClick={() =>
                  toast({
                    type: "success",
                    title: L("2FA 验证通过，登录成功！", "2FA verified — signed in!"),
                    description: email,
                  })
                }
              >
                {L("验证并进入工作台", "Verify & Enter Workspace")}
              </Button>
              <Button
                variant="text"
                fullWidth
                onClick={() => setStep("credentials")}
              >
                {L("← 返回账号密码步骤", "← Back to credentials")}
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Block 6: ai-workspace-01                                                   */
/* -------------------------------------------------------------------------- */

interface ChatTurn {
  readonly id: string;
  readonly userPrompt: string;
  readonly reasoningSteps: readonly string[];
  readonly answer: string;
}

function AiWorkspace01Block() {
  const { locale } = useM3EI18n();
  const { toast } = useM3EToast();
  const L = React.useCallback(
    (zh: string, en: string) => resolveCopy(locale, { zh, en }),
    [locale],
  );

  const [model, setModel] = React.useState("gemini-4-carbon");
  const [streaming, setStreaming] = React.useState(true);
  const [contextFiles, setContextFiles] = React.useState<string[]>([
    "tokens/topology.ts",
    "M3EProvider.tsx",
    "m3e.json",
  ]);
  const [prompt, setPrompt] = React.useState("");
  const [extraTurns, setExtraTurns] = React.useState<readonly ChatTurn[]>([]);

  const templates = [
    {
      label: L("审计连接按钮组圆角拓扑", "Audit Connected Corner Topology"),
      text: L(
        "请推导 3 项水平 ButtonGroup 在选中第 2 项时的四角半径元组，并检查 RTL 翻转对称性。",
        "Derive the 4-corner radius tuple for item #2 in a 3-item connected ButtonGroup and verify RTL mirroring.",
      ),
    },
    {
      label: L("生成翡翠绿 HCT 2025 主题", "Generate Jade HCT 2025 Palette"),
      text: L(
        "基于种子色 #006B5E 生成符合 WCAG AAA 的暗色高对比度表面容器层级建议。",
        "Generate WCAG AAA high-contrast dark surface container ramps from seed #006B5E.",
      ),
    },
    {
      label: L("优化 DataTable 批量操作键盘流", "Optimize DataTable Bulk A11y"),
      text: L(
        "如何让 DataTable 多选状态与底部 FloatingToolbar 无缝共享无障碍播报？",
        "How should DataTable row selection announce contextual FloatingToolbar actions to screen readers?",
      ),
    },
  ];

  const handleSend = () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      toast({
        title: L("请先输入提示词或点击上方模板芯片", "Enter a prompt or pick a template chip"),
      });
      return;
    }
    setStreaming(true);
    setExtraTurns((prev) => [
      ...prev,
      {
        id: `turn-${Date.now()}`,
        userPrompt: trimmed,
        reasoningSteps: [
          L("解析当前挂载的上下文文件与 M3E 令牌契约", "Parsed attached context files & M3E token contracts"),
          L("校验快空间弹簧阻尼比 ζ = 0.6 与刚度 k = 800", "Verified fastSpatial spring damping ζ = 0.6, stiffness k = 800"),
        ],
        answer: L(
          `已完成针对「${trimmed}」的组件树与令牌验证：所有圆角插值均走独立 RAF 订阅通道，不会引起父级 React 重渲染。`,
          `Completed M3E token & geometry synthesis for "${trimmed}": corner springs update via isolated RAF refs with zero parent re-renders.`,
        ),
      },
    ]);
    setPrompt("");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 16,
        padding: 20,
      }}
    >
      {/* Studio Top Bar */}
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
          paddingBottom: 12,
          borderBottom: "1px solid var(--m3e-color-outline-variant)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <MaterialShapeView
            shape="clover4Leaf"
            size={30}
            fill="var(--m3e-color-primary)"
          />
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <strong style={{ fontSize: 15.5 }}>
                {L("M3E 智能体推理工作台", "M3E Reasoning Studio")}
              </strong>
              <Chip tone="primary" size="sm">
                Agentic
              </Chip>
            </div>
            <span style={{ fontSize: 11.5, color: "var(--m3e-color-on-surface-variant)" }}>
              {L("结构化思维链 · 实时波浪流式进度", "Structured CoT trace · Live wavy token streaming")}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
          <div style={{ minWidth: 190 }}>
            <Select
              aria-label={L("选择推理模型", "Select reasoning model")}
              value={model}
              onValueChange={(v) => {
                if (v) setModel(v);
              }}
              options={[
                { value: "gemini-4-carbon", label: "Gemini 4 Carbon" },
                { value: "gemini-4-flash", label: "Gemini 4 Flash" },
              ]}
            />
          </div>
          <Button
            size="xs"
            variant={streaming ? "tonal" : "outlined"}
            leadingIcon={<SparkleIcon size={14} />}
            onClick={() => setStreaming((s) => !s)}
          >
            {streaming
              ? L("停止流式演示", "Pause Stream")
              : L("模拟流式输出", "Simulate Streaming")}
          </Button>
        </div>
      </header>

      {/* Prompt template chips */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {templates.map((tpl) => (
          <Chip
            key={tpl.label}
            icon={<SparkleIcon size={14} />}
            onClick={() => setPrompt(tpl.text)}
          >
            {tpl.label}
          </Chip>
        ))}
      </div>

      {/* Conversation Thread */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {/* User message */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <div
            style={{
              maxWidth: 580,
              padding: "12px 16px",
              borderRadius: "20px 20px 6px 20px",
              backgroundColor: "var(--m3e-color-primary-container)",
              color: "var(--m3e-color-on-primary-container)",
              fontSize: 13.5,
            }}
          >
            {L(
              "帮我检查连接态 ButtonGroup 在按压与选中切换时的非对称圆角计算，并给出 RTL 适配方案。",
              "Inspect how connected ButtonGroup computes asymmetric inner/outer corners during press & selection, including RTL mirroring.",
            )}
          </div>
          <Avatar size="sm" fallback="ER" />
        </div>

        {/* Assistant reasoning card */}
        <Card variant="outlined">
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <MaterialShapeView
                  shape="sunny"
                  size={24}
                  fill="var(--m3e-color-primary)"
                />
                <strong style={{ fontSize: 13.5 }}>
                  {model === "gemini-4-carbon" ? "Gemini 4 Carbon" : "Gemini 4 Flash"}
                </strong>
                <Chip tone="success" size="sm">
                  {L("已验证拓扑", "Topology Verified")}
                </Chip>
              </div>
              <span style={{ fontSize: 11.5, color: "var(--m3e-color-on-surface-variant)" }}>
                1.2s · 412 tokens
              </span>
            </div>

            <Accordion
              multiple
              defaultValue={["cot"]}
              items={[
                {
                  value: "cot",
                  title: L("查看模型推理链 (3 步)", "Reasoning Trace (3 steps)"),
                  subtitle: L("已读取 tokens/topology.ts 与 M3EProvider.tsx", "Inspected tokens/topology.ts & M3EProvider.tsx"),
                  content: (
                    <ol
                      style={{
                        margin: "0 0 8px",
                        paddingInlineStart: 18,
                        fontSize: 12.5,
                        color: "var(--m3e-color-on-surface-variant)",
                        display: "flex",
                        flexDirection: "column",
                        gap: 4,
                      }}
                    >
                      <li>
                        {L(
                          "外侧端点保持胶囊全圆角 R_pill，内侧相邻边收敛至 8px 紧凑圆角。",
                          "Outer endpoints retain full pill radius while inner shared edges tighten to 8px.",
                        )}
                      </li>
                      <li>
                        {L(
                          "选中态触发全圆角恢复 [R, R, R, R]，按压瞬间下潜至 pressedRadius。",
                          "Selected items expand to full pill [R, R, R, R]; active press dips to pressedRadius.",
                        )}
                      </li>
                      <li>
                        {L(
                          "在 dir='rtl' 下调用 flipCornersHorizontal([tl, tr, br, bl]) 精确交换左右圆角。",
                          "Under dir='rtl', flipCornersHorizontal([tl, tr, br, bl]) mirrors start/end radii.",
                        )}
                      </li>
                    </ol>
                  ),
                },
              ]}
            />

            {streaming ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <span style={{ fontSize: 11.5, color: "var(--m3e-color-primary)", fontWeight: 600 }}>
                  {L("正在流式生成弹簧几何校验摘要…", "Streaming spring geometry verification…")}
                </span>
                <LinearProgressIndicator
                  wavy
                  aria-label={L("AI 流式生成进度", "AI token streaming progress")}
                />
              </div>
            ) : null}

            <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.6 }}>
              {L(
                "在 M3E 中，`resolveConnectedGroupCorners` 会根据索引位置、选中态与按压态返回精确的四元圆角数组 `[topLeft, topRight, bottomRight, bottomLeft]`，并由 `useM3ECornerSpringRef` 在独立物理帧中驱动平滑形变。",
                "In M3E, `resolveConnectedGroupCorners` computes an exact 4-tuple `[topLeft, topRight, bottomRight, bottomLeft]` per item state, animated smoothly via `useM3ECornerSpringRef` without React re-renders.",
              )}
            </p>
          </div>
        </Card>

        {extraTurns.map((turn) => (
          <React.Fragment key={turn.id}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <div
                style={{
                  maxWidth: 580,
                  padding: "10px 15px",
                  borderRadius: "20px 20px 6px 20px",
                  backgroundColor: "var(--m3e-color-primary-container)",
                  color: "var(--m3e-color-on-primary-container)",
                  fontSize: 13.5,
                }}
              >
                {turn.userPrompt}
              </div>
              <Avatar size="sm" fallback="ER" />
            </div>
            <Card variant="outlined">
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Chip tone="primary" size="sm">
                  {model}
                </Chip>
                <p style={{ margin: 0, fontSize: 13.5 }}>{turn.answer}</p>
              </div>
            </Card>
          </React.Fragment>
        ))}
      </div>

      {/* Rich Composer Bar */}
      <Card variant="filled">
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
            {contextFiles.map((file) => (
              <Chip
                key={file}
                onRemove={() =>
                  setContextFiles((prev) => prev.filter((f) => f !== file))
                }
              >
                {file}
              </Chip>
            ))}
            {contextFiles.length < 3 ? (
              <Chip
                icon={<PlusIcon size={14} />}
                onClick={() =>
                  setContextFiles([
                    "tokens/topology.ts",
                    "M3EProvider.tsx",
                    "m3e.json",
                  ])
                }
              >
                {L("恢复上下文文件", "Restore Context")}
              </Chip>
            ) : null}
          </div>

          <div style={{ display: "flex", alignItems: "flex-end", gap: 10 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <TextField
                multiline
                rows={2}
                label={L("向 M3E 智能体提问", "Ask M3E Agent")}
                placeholder={L(
                  "输入组件架构、HCT 色板或无障碍问题…",
                  "Ask about component geometry, HCT palettes, or accessibility…",
                )}
                value={prompt}
                onValueChange={setPrompt}
              />
            </div>
            <IconButton
              size="md"
              variant="filled"
              aria-label={L("发送消息", "Send prompt")}
              icon={<SendIcon size={18} />}
              onClick={handleSend}
            />
          </div>
        </div>
      </Card>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Exported BLOCKS_REGISTRY                                                   */
/* -------------------------------------------------------------------------- */

export const BLOCKS_REGISTRY: readonly BlockSpec[] = [
  {
    slug: "dashboard-01",
    category: "dashboard",
    featured: true,
    title: {
      zh: "企业分析仪表盘与数据工作台",
      en: "Analytics Dashboard with Sidebar, Area Chart & Data Table",
    },
    description: {
      zh: "包含可折叠应用侧栏、四栏 KPI 指标卡、连接按钮组切换的双序列渐变面积图与多标签可选择分页数据表。",
      en: "Full-page telemetry workspace featuring a collapsible sidebar, 4 KPI cards, dual-series gradient area chart, and tabbed selectable DataTable.",
    },
    minHeight: 680,
    render: () => <Dashboard01Block />,
    code: `import * as React from "react";
import {
  Avatar,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  DataTable,
  DropdownMenu,
  IconButton,
  MaterialShapeView,
  Pagination,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
} from "m3eui";

export function AnalyticsDashboardBlock() {
  const [range, setRange] = React.useState("90d");
  const [page, setPage] = React.useState(1);
  const [selected, setSelected] = React.useState<string[]>(["sec-01"]);

  return (
    <div className="m3e-block-app-shell">
      <aside className="m3e-block-sidebar">
        <MaterialShapeView shape="cookie9Sided" size={30} fill="var(--m3e-color-primary)" />
        <Button variant="filled" size="sm" fullWidth>Quick Create</Button>
      </aside>

      <main className="m3e-block-main">
        <Breadcrumb items={[{ label: "Acme M3E" }, { label: "Dashboard" }]} />

        <div className="m3e-block-kpi-grid">
          <Card variant="outlined" title="Total Revenue" subtitle="$48,250.00" />
        </div>

        <Card variant="outlined" title="Total Visitors">
          <ButtonGroup
            variant="connected"
            size="xs"
            selectionMode="single"
            items={[
              { value: "90d", label: "90d" },
              { value: "30d", label: "30d" },
              { value: "7d", label: "7d" },
            ]}
            value={[range]}
            onValueChange={(v) => v[0] && setRange(v[0])}
          />
          {/* Responsive SVG dual-series area chart using var(--m3e-color-primary) */}
        </Card>

        <Tabs defaultValue="outline" variant="secondary">
          <TabsList>
            <Tab value="outline">Outline</Tab>
            <Tab value="performance" badge="3">Past Performance</Tab>
          </TabsList>
          <TabsPanel value="outline">
            <DataTable
              caption="Specification sections"
              hideCaption
              selectable
              selectedRowKeys={selected}
              onSelectedRowKeysChange={setSelected}
              columns={columns}
              rows={rows}
              getRowKey={(r) => r.id}
              footer={
                <Pagination
                  page={page}
                  totalPages={3}
                  totalItems={18}
                  pageSize={6}
                  showSummary
                  onPageChange={setPage}
                  size="sm"
                />
              }
            />
          </TabsPanel>
        </Tabs>
      </main>
    </div>
  );
}`,
  },
  {
    slug: "login-01",
    category: "auth",
    featured: true,
    title: {
      zh: "双栏品牌视觉登录与 2FA 验证",
      en: "Split Brand Login with Passkey & 2FA OTP Step",
    },
    description: {
      zh: "左栏动态多边形徽标品牌海报，右栏整合 Passkey 通行密钥、企业 SSO 与 6 位弹簧圆角 OTPField 二步验证。",
      en: "Expressive tonal brand poster with morphing MaterialShapeView paired with Passkey/SSO login and an interactive 6-digit OTPField step.",
    },
    minHeight: 540,
    render: () => <Login01Block />,
    code: `import * as React from "react";
import {
  Chip,
  Button,
  Card,
  Divider,
  MaterialShapeView,
  OTPField,
  TextField,
} from "m3eui";

export function SplitBrandLogin() {
  const [step, setStep] = React.useState<"credentials" | "otp">("credentials");
  const [otp, setOtp] = React.useState("");

  return (
    <div className="m3e-block-split-auth">
      <section className="brand-poster">
        <MaterialShapeView shape="cookie9Sided" size={84} fill="var(--m3e-color-primary)" />
        <Chip>FIDO2 Passkey</Chip>
      </section>

      <Card variant="outlined">
        {step === "credentials" ? (
          <>
            <Button variant="outlined" fullWidth>Continue with Passkey</Button>
            <Divider label="OR EMAIL" />
            <TextField type="email" label="Work Email" clearable />
            <TextField type="password" label="Password" />
            <Button variant="filled" fullWidth onClick={() => setStep("otp")}>
              Continue to 2FA
            </Button>
          </>
        ) : (
          <>
            <OTPField length={6} separatorAfterIndex={2} value={otp} onValueChange={setOtp} />
            <Button variant="filled" fullWidth disabled={otp.length < 6}>Verify & Sign In</Button>
          </>
        )}
      </Card>
    </div>
  );
}`,
  },
  {
    slug: "ai-workspace-01",
    category: "ai",
    featured: true,
    title: {
      zh: "AI 智能体对话与推理流工作台",
      en: "M3E AI Agent & Reasoning Studio",
    },
    description: {
      zh: "模型切换器、提示词模板芯片、可折叠 Accordion 思维链轨迹、wavy 进度条流式进度与富上下文输入栏。",
      en: "Model Select, prompt chips, collapsible Accordion reasoning trace, live wavy progress streaming, and a context chip composer.",
    },
    minHeight: 580,
    render: () => <AiWorkspace01Block />,
    code: `import * as React from "react";
import {
  Accordion,
  Chip,
  Button,
  Card,
  IconButton,
  LinearProgressIndicator,
  Select,
  TextField,
} from "m3eui";

export function AiReasoningStudio() {
  const [model, setModel] = React.useState("gemini-4-carbon");
  const [streaming, setStreaming] = React.useState(true);
  const [prompt, setPrompt] = React.useState("");

  return (
    <section>
      <Select
        value={model}
        onValueChange={(v) => v && setModel(v)}
        options={[
          { value: "gemini-4-carbon", label: "Gemini 4 Carbon" },
          { value: "gemini-4-flash", label: "Gemini 4 Flash" },
        ]}
      />
      <Card variant="outlined">
        <Accordion
          defaultValue={["trace"]}
          items={[{ value: "trace", title: "Reasoning Trace (3 steps)", content: "..." }]}
        />
        {streaming && <LinearProgressIndicator wavy aria-label="Streaming tokens" />}
      </Card>
      <Card variant="filled">
        <Chip onRemove={() => {}}>tokens/topology.ts</Chip>
        <TextField multiline label="Ask M3E Agent" value={prompt} onValueChange={setPrompt} />
      </Card>
    </section>
  );
}`,
  },
  {
    slug: "split-pane-01",
    category: "sidebar",
    featured: true,
    title: {
      zh: "可拖拽双栏文档工作台",
      en: "Resizable Split-Pane Workspace with DragHandle",
    },
    description: {
      zh: "DragHandle 联动左右双栏百分比宽度调节、ScrollArea + 分段列表目录及移动端自适应全屏 Dialog 详情编辑。",
      en: "Keyboard- and pointer-resizable Split Pane via DragHandle, segmented List inside ScrollArea, and responsive Dialog.",
    },
    minHeight: 460,
    render: () => <SplitPane01Block />,
    code: `import * as React from "react";
import {
  Button,
  Card,
  Dialog,
  DialogClose,
  DragHandle,
  List,
  ListItem,
  ScrollArea,
  TextField,
} from "m3eui";

export function ResizableSplitWorkspace() {
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [splitPct, setSplitPct] = React.useState(34);
  const [activeId, setActiveId] = React.useState("tokens");
  const [editOpen, setEditOpen] = React.useState(false);

  return (
    <div ref={containerRef} style={{ display: "flex", minHeight: 380 }}>
      <div id="split-pane-sidebar" style={{ flexBasis: \`\${splitPct}%\`, minWidth: 160 }}>
        <ScrollArea maxHeight={360}>
          <List variant="segmented" aria-label="Specs">
            <ListItem headline="Color Tokens" selected={activeId === "tokens"} onClick={() => setActiveId("tokens")} />
            <ListItem headline="Spring Physics" selected={activeId === "spring"} onClick={() => setActiveId("spring")} />
          </List>
        </ScrollArea>
      </div>
      <DragHandle
        containerRef={containerRef}
        value={splitPct}
        min={22}
        max={56}
        onValueChange={setSplitPct}
        aria-controls="split-pane-sidebar"
      />
      <Card variant="outlined" style={{ flex: 1 }}>
        <Button variant="tonal" onClick={() => setEditOpen(true)}>Edit Spec</Button>
        <Dialog
          open={editOpen}
          onOpenChange={setEditOpen}
          fullScreen="mobile"
          title="Edit Specification"
          actions={<DialogClose render={<Button variant="filled">Save</Button>} />}
        >
          <TextField label="Title" defaultValue={activeId} />
        </Dialog>
      </Card>
    </div>
  );
}`,
  },
];

interface SplitSpecDoc {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly owner: string;
}

const SPLIT_PANE_DOCS: readonly SplitSpecDoc[] = [
  {
    id: "tokens",
    title: "HCT Dynamic Color",
    summary: "61 semantic roles computed via 2025 AOSP Monet curves across light, dark, and +0.5/+1.0 contrast.",
    owner: "Design Tokens",
  },
  {
    id: "springs",
    title: "Analytical Spring ODE",
    summary: "Velocity-preserving spatial and effects springs driving DOM refs without React re-renders.",
    owner: "Motion Core",
  },
  {
    id: "shapes",
    title: "MaterialShapes",
    summary: "35 morphable RoundedPolygons with normalized cubic Bezier outlines for indicators and avatars.",
    owner: "Geometry",
  },
  {
    id: "a11y",
    title: "Accessibility & RTL",
    summary: "Built on @base-ui/react primitives with forced-colors fallbacks and CSS logical properties.",
    owner: "Platform UI",
  },
];

function SplitPane01Block() {
  const { locale } = useM3EI18n();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const [splitPct, setSplitPct] = React.useState(34);
  const [activeId, setActiveId] = React.useState(SPLIT_PANE_DOCS[0]!.id);
  const [editOpen, setEditOpen] = React.useState(false);

  const activeDoc =
    SPLIT_PANE_DOCS.find((doc) => doc.id === activeId) ?? SPLIT_PANE_DOCS[0]!;

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        alignItems: "stretch",
        gap: 6,
        minHeight: 380,
      }}
    >
      <div
        id="split-pane-sidebar"
        style={{
          flexBasis: `${splitPct}%`,
          flexShrink: 0,
          minWidth: 168,
        }}
      >
        <ScrollArea maxHeight={380}>
          <List
            variant="segmented"
            aria-label={resolveCopy(locale, {
              zh: "规范条目",
              en: "Specification sections",
            })}
          >
            {SPLIT_PANE_DOCS.map((doc) => (
              <ListItem
                key={doc.id}
                headline={doc.title}
                supportingText={doc.owner}
                selected={doc.id === activeDoc.id}
                onClick={() => setActiveId(doc.id)}
              />
            ))}
          </List>
        </ScrollArea>
      </div>

      <DragHandle
        containerRef={containerRef}
        value={splitPct}
        min={24}
        max={56}
        onValueChange={setSplitPct}
        aria-controls="split-pane-sidebar"
      />

      <Card
        variant="outlined"
        style={{
          flex: 1,
          minWidth: 220,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          gap: 16,
          padding: 20,
        }}
      >
        <div style={{ display: "grid", gap: 10 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 8,
            }}
          >
            <strong style={{ fontSize: 18 }}>{activeDoc.title}</strong>
            <Chip size="sm" tone="primary" variant="tonal">
              {Math.round(splitPct)}%
            </Chip>
          </div>
          <p style={{ margin: 0, color: "var(--m3e-color-on-surface-variant)" }}>
            {activeDoc.summary}
          </p>
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
          <Button
            size="sm"
            variant="tonal"
            onClick={() => setEditOpen(true)}
          >
            {resolveCopy(locale, { zh: "编辑条目", en: "Edit Section" })}
          </Button>
        </div>

        <Dialog
          open={editOpen}
          onOpenChange={setEditOpen}
          fullScreen="mobile"
          showCloseButton
          title={activeDoc.title}
          actions={
            <DialogClose
              render={
                <Button variant="filled">
                  {resolveCopy(locale, { zh: "完成", en: "Done" })}
                </Button>
              }
            />
          }
        >
          <TextField
            label={resolveCopy(locale, { zh: "标题", en: "Title" })}
            defaultValue={activeDoc.title}
          />
          <TextField
            multiline
            label={resolveCopy(locale, { zh: "摘要", en: "Summary" })}
            defaultValue={activeDoc.summary}
          />
        </Dialog>
      </Card>
    </div>
  );
}
