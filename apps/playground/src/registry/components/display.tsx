import * as React from "react";
import {
  Chip,
  Avatar,
  AvatarGroup,
  Badge,
  Button,
  Card,
  Carousel,
  type CarouselItemSpec,
  type ChipTone,
  DataTable,
  Empty,
  IconButton,
  List,
  ListItem,
  M3E_ALL_SHAPE_NAMES,
  type M3EDataTableColumn,
  type M3EShapeName,
  MaterialShapeView,
  Pagination,
  SearchBar,
  Skeleton,
  Slider,
  Switch,
} from "m3eui";
import { useCopyResolver } from "../../i18n";
import {
  BarChartIcon,
  BellIcon,
  CheckTinyIcon,
  DownloadIcon,
  EditIcon,
  FolderIcon,
  HeartIcon,
  PlusIcon,
  RefreshIcon,
  SendIcon,
  SettingsGearIcon,
  ShareIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TrashIcon,
  UsersIcon,
} from "../../layout/Icons";
import type { ComponentDocSpec } from "../types";

/* -------------------------------------------------------------------------- */
/* Helper Demos                                                               */
/* -------------------------------------------------------------------------- */

function CardInteractiveDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [selectedId, setSelectedId] = React.useState<string>("spatial");
  const [pressCount, setPressCount] = React.useState<number>(0);

  const items = [
    {
      id: "spatial",
      variant: "filled" as const,
      title: copy({ zh: "空间物理弹簧", en: "Spatial Spring" }),
      subtitle: "fastSpatial · ζ=0.6, k=800",
      body: copy({
        zh: "悬停时圆角扩展至 20px，按住时弹性收紧至 12px。",
        en: "Corners expand to 20px on hover and compress to 12px while pressed.",
      }),
    },
    {
      id: "monet",
      variant: "elevated" as const,
      title: copy({ zh: "AOSP 动态色调", en: "Dynamic Monet Tones" }),
      subtitle: "SPEC_2025 · HCT Chroma",
      body: copy({
        zh: "支持标准、中等与高对比度三级无障碍表面色阶。",
        en: "Adapts across standard, medium, and high-contrast surface ramps.",
      }),
    },
    {
      id: "shapes",
      variant: "outlined" as const,
      title: copy({ zh: "35 种多边形形变", en: "35 Morphing Polygons" }),
      subtitle: "Cubic Bézier Normalization",
      body: copy({
        zh: "点击卡片切换激活焦点并实时触发圆角物理回弹。",
        en: "Click any card to switch focus and feel live corner spring physics.",
      }),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="demo-grid-3">
        {items.map((item) => {
          const active = selectedId === item.id;
          return (
            <Card
              key={item.id}
              variant={item.variant}
              interactive
              title={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                  <span>{item.title}</span>
                  {active ? (
                    <Chip size="sm" tone="primary">
                      {copy({ zh: "当前选中", en: "Active" })}
                    </Chip>
                  ) : null}
                </span>
              }
              subtitle={item.subtitle}
              onClick={() => {
                setSelectedId(item.id);
                setPressCount((c) => c + 1);
              }}
              style={
                active
                  ? {
                      outline: "2px solid var(--m3e-color-primary)",
                      outlineOffset: "-2px",
                    }
                  : undefined
              }
            >
              {item.body}
            </Card>
          );
        })}
      </div>
      <div
        style={{
          fontSize: 12.5,
          color: "var(--m3e-color-on-surface-variant)",
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <SparkleIcon size={14} />
        <span>
          {copy({
            zh: `已触发卡片交互 ${pressCount} 次（长按卡片可观察圆角形变）`,
            en: `Triggered ${pressCount} card activations (press and hold to inspect corner morph)`,
          })}
        </span>
      </div>
    </div>
  );
}

function CardRichLayoutDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [liked, setLiked] = React.useState(false);

  return (
    <div style={{ maxWidth: 420 }}>
      <Card
        variant="outlined"
        media={
          <div
            style={{
              height: 148,
              background:
                "var(--m3e-color-primary-container)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "20px 24px",
              color: "var(--m3e-color-on-primary-container)",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <Chip size="sm" tone="primary" variant="solid">
                Material 3 Expressive
              </Chip>
              <span style={{ fontSize: 19, fontWeight: 750, letterSpacing: "-0.02em" }}>
                Design System Release v1.5
              </span>
            </div>
            <MaterialShapeView
              shape="clover8Leaf"
              size={68}
              fill="var(--m3e-color-primary)"
            />
          </div>
        }
        title={
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <Badge dot color="primary">
                <Avatar fallback="ML" size="sm" shape="cookie9Sided" />
              </Badge>
              <div>
                <div style={{ fontSize: 15.5, fontWeight: 650 }}>
                  {copy({ zh: "动效与多边形实验室", en: "Motion & Polygon Studio" })}
                </div>
                <div
                  style={{
                    fontSize: 12,
                    fontWeight: 400,
                    color: "var(--m3e-color-on-surface-variant)",
                  }}
                >
                  {copy({ zh: "更新于 12 分钟前 · 4 位协作者", en: "Updated 12m ago · 4 collaborators" })}
                </div>
              </div>
            </div>
            <IconButton
              icon={<HeartIcon filled={liked} size={17} />}
              variant={liked ? "tonal" : "standard"}
              aria-label={copy({ zh: "收藏项目", en: "Bookmark project" })}
              onClick={() => setLiked((v) => !v)}
            />
          </div>
        }
        actions={
          <>
            <Button variant="text" size="xs" leadingIcon={<ShareIcon size={15} />}>
              {copy({ zh: "分享", en: "Share" })}
            </Button>
            <Button variant="filled" size="xs" leadingIcon={<DownloadIcon size={15} />}>
              {copy({ zh: "获取令牌", en: "Get Tokens" })}
            </Button>
          </>
        }
      >
        {copy({
          zh: "整合解析二阶阻尼弹簧 ODE、35 种规范化圆角多边形与 AOSP HCT 动态调色板，开箱支持 RTL 与无障碍高对比度。",
          en: "Combines analytical second-order spring ODE physics, 35 normalized rounded polygons, and AOSP HCT dynamic color with full RTL and high-contrast support.",
        })}
      </Card>
    </div>
  );
}

function CardDisabledComparisonDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [clicks, setClicks] = React.useState(1);

  return (
    <div className="demo-grid-2">
      <Card
        variant="outlined"
        interactive
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span>{copy({ zh: "可交互卡片", en: "Active Interactive Card" })}</span>
            <Chip size="sm" tone="success" dot>
              {copy({ zh: "可用", en: "Enabled" })}
            </Chip>
          </span>
        }
        subtitle={copy({
          zh: `点击或按住体验弹性圆角 · 已点击 ${clicks} 次`,
          en: `Click or hold for spring corner morph · ${clicks} clicks`,
        })}
        onClick={() => setClicks((c) => c + 1)}
      >
        {copy({
          zh: "具备键盘焦点环、悬停阴影抬升与按压态圆角物理收缩反馈。",
          en: "Provides keyboard focus ring, hover elevation lift, and pressed corner spring compression.",
        })}
      </Card>

      <Card
        variant="outlined"
        interactive={false}
        title={
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span>{copy({ zh: "已禁用交互卡片", en: "Disabled Interactive Card" })}</span>
            <Chip size="sm" tone="neutral">
              {copy({ zh: "只读锁定", en: "Locked" })}
            </Chip>
          </span>
        }
        subtitle={copy({
          zh: "权限受限 · 不响应指针按压与焦点激活",
          en: "Restricted · Ignores pointer press and focus activation",
        })}
        style={{
          opacity: 0.48,
          cursor: "not-allowed",
          userSelect: "none",
        }}
      >
        {copy({
          zh: "当归档或缺少写权限时关闭 interactive 并降级为静态容器，避免误触提交。",
          en: "Disable interactive mode when archived or read-only so pointer and keyboard events cannot fire.",
        })}
      </Card>
    </div>
  );
}

interface ServiceMetricRow {
  readonly id: string;
  readonly service: string;
  readonly region: string;
  readonly status: "healthy" | "degraded" | "Deploying";
  readonly latencyMs: number;
  readonly rps: number;
  readonly uptime: number;
}

const SERVICE_ROWS: readonly ServiceMetricRow[] = [
  {
    id: "edge-gw",
    service: "edge-gateway",
    region: "ap-northeast-1",
    status: "healthy",
    latencyMs: 18,
    rps: 14820,
    uptime: 99.99,
  },
  {
    id: "token-svc",
    service: "monet-token-engine",
    region: "us-west-2",
    status: "healthy",
    latencyMs: 11,
    rps: 9340,
    uptime: 99.98,
  },
  {
    id: "morph-worker",
    service: "polygon-morph-worker",
    region: "eu-central-1",
    status: "Deploying",
    latencyMs: 34,
    rps: 4210,
    uptime: 99.92,
  },
  {
    id: "audit-log",
    service: "telemetry-ingestor",
    region: "ap-east-1",
    status: "degraded",
    latencyMs: 86,
    rps: 6150,
    uptime: 99.74,
  },
  {
    id: "i18n-cdn",
    service: "cldr-bundle-cdn",
    region: "us-east-1",
    status: "healthy",
    latencyMs: 9,
    rps: 22490,
    uptime: 100.0,
  },
];

function DataTableSortableDemo(): React.JSX.Element {
  const copy = useCopyResolver();

  const columns: readonly M3EDataTableColumn<ServiceMetricRow>[] = [
    {
      id: "service",
      header: copy({ zh: "服务名称", en: "Service" }),
      sortable: true,
      sortAccessor: (r) => r.service,
      cell: (r) => <span style={{ fontWeight: 600 }}>{r.service}</span>,
    },
    {
      id: "region",
      header: copy({ zh: "可用区", en: "Region" }),
      sortable: true,
      sortAccessor: (r) => r.region,
      cell: (r) => (
        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12.5 }}>
          {r.region}
        </span>
      ),
    },
    {
      id: "status",
      header: copy({ zh: "运行状态", en: "Status" }),
      cell: (r) =>
        r.status === "healthy" ? (
          <Chip size="sm" tone="success" dot>
            {copy({ zh: "健康", en: "Healthy" })}
          </Chip>
        ) : r.status === "Deploying" ? (
          <Chip size="sm" tone="primary" dot>
            {copy({ zh: "发布中", en: "Deploying" })}
          </Chip>
        ) : (
          <Chip size="sm" tone="warning" dot>
            {copy({ zh: "延迟升高", en: "Degraded" })}
          </Chip>
        ),
    },
    {
      id: "latencyMs",
      header: copy({ zh: "P95 延迟", en: "P95 Latency" }),
      align: "end",
      sortable: true,
      sortAccessor: (r) => r.latencyMs,
      cell: (r) => `${r.latencyMs} ms`,
    },
    {
      id: "rps",
      header: copy({ zh: "吞吐量 (RPS)", en: "Throughput (RPS)" }),
      align: "end",
      sortable: true,
      sortAccessor: (r) => r.rps,
      cell: (r) => r.rps.toLocaleString(),
    },
    {
      id: "uptime",
      header: copy({ zh: "可用率", en: "SLA Uptime" }),
      align: "end",
      sortable: true,
      sortAccessor: (r) => r.uptime,
      cell: (r) => `${r.uptime.toFixed(2)}%`,
    },
  ];

  return (
    <DataTable
      caption={copy({
        zh: "核心微服务实时吞吐与延迟指标",
        en: "Core microservice throughput and latency metrics",
      })}
      hideCaption
      columns={columns}
      rows={SERVICE_ROWS}
      getRowKey={(r) => r.id}
      defaultSort={{ columnId: "rps", direction: "descending" }}
    />
  );
}

interface ReleaseArtifactRow {
  readonly id: string;
  readonly pkg: string;
  readonly channel: "stable" | "rc" | "canary";
  readonly bundleKb: number;
  readonly downloads: number;
}

const RELEASE_ARTIFACTS: readonly ReleaseArtifactRow[] = [
  { id: "rel-1", pkg: "m3eui", channel: "stable", bundleKb: 42.6, downloads: 18420 },
  { id: "rel-2", pkg: "m3eui/tokens", channel: "stable", bundleKb: 14.2, downloads: 15910 },
  { id: "rel-3", pkg: "m3eui/primitives", channel: "stable", bundleKb: 9.8, downloads: 8430 },
  { id: "rel-4", pkg: "m3eui/i18n", channel: "rc", bundleKb: 6.4, downloads: 5190 },
  { id: "rel-5", pkg: "m3eui/cli", channel: "stable", bundleKb: 19.5, downloads: 11280 },
  { id: "rel-6", pkg: "@m3e/figma-sync", channel: "canary", bundleKb: 11.1, downloads: 2740 },
  { id: "rel-7", pkg: "@m3e/theme-inspector", channel: "rc", bundleKb: 8.7, downloads: 3620 },
  { id: "rel-8", pkg: "@m3e/storybook-addon", channel: "canary", bundleKb: 15.3, downloads: 1980 },
];

function DataTableSelectionToolbarDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [query, setQuery] = React.useState("");
  const [selectedKeys, setSelectedKeys] = React.useState<string[]>(["rel-1", "rel-2"]);
  const [archivedIds, setArchivedIds] = React.useState<string[]>([]);
  const [page, setPage] = React.useState(1);
  const pageSize = 4;

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return RELEASE_ARTIFACTS.filter(
      (r) =>
        !archivedIds.includes(r.id) &&
        (q.length === 0 || r.pkg.toLowerCase().includes(q) || r.channel.includes(q)),
    );
  }, [query, archivedIds]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedRows = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const columns: readonly M3EDataTableColumn<ReleaseArtifactRow>[] = [
    {
      id: "pkg",
      header: copy({ zh: "包名称", en: "Package" }),
      sortable: true,
      sortAccessor: (r) => r.pkg,
      cell: (r) => (
        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontWeight: 600 }}>
          {r.pkg}
        </span>
      ),
    },
    {
      id: "channel",
      header: copy({ zh: "发布通道", en: "Channel" }),
      cell: (r) => (
        <Chip
          size="sm"
          tone={r.channel === "stable" ? "success" : r.channel === "rc" ? "primary" : "tertiary"}
        >
          {r.channel}
        </Chip>
      ),
    },
    {
      id: "bundleKb",
      header: copy({ zh: "Gzip 体积", en: "Gzip Size" }),
      align: "end",
      sortable: true,
      sortAccessor: (r) => r.bundleKb,
      cell: (r) => `${r.bundleKb.toFixed(1)} kB`,
    },
    {
      id: "downloads",
      header: copy({ zh: "周下载量", en: "Weekly Downloads" }),
      align: "end",
      sortable: true,
      sortAccessor: (r) => r.downloads,
      cell: (r) => r.downloads.toLocaleString(),
    },
  ];

  return (
    <DataTable
      caption={copy({ zh: "构建产物包管理表", en: "Release package artifacts" })}
      hideCaption
      selectable
      selectedRowKeys={selectedKeys}
      onSelectedRowKeysChange={setSelectedKeys}
      columns={columns}
      rows={pagedRows}
      getRowKey={(r) => r.id}
      toolbar={
        <>
          <div style={{ flex: "1 1 240px", maxWidth: 320 }}>
            <SearchBar
              size="sm"
              value={query}
              onValueChange={(next) => {
                setQuery(next);
                setPage(1);
              }}
              placeholder={copy({ zh: "检索包名或通道…", en: "Filter package or channel…" })}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            {selectedKeys.length > 0 ? (
              <>
                <Chip tone="primary">
                  {copy({
                    zh: `已选 ${selectedKeys.length} 项`,
                    en: `${selectedKeys.length} selected`,
                  })}
                </Chip>
                <Button
                  size="xs"
                  variant="tonal"
                  intent="danger"
                  leadingIcon={<TrashIcon size={14} />}
                  onClick={() => {
                    setArchivedIds((prev) => [...prev, ...selectedKeys]);
                    setSelectedKeys([]);
                  }}
                >
                  {copy({ zh: "批量归档", en: "Archive Selected" })}
                </Button>
              </>
            ) : archivedIds.length > 0 ? (
              <Button
                size="xs"
                variant="outlined"
                leadingIcon={<RefreshIcon size={14} />}
                onClick={() => setArchivedIds([])}
              >
                {copy({ zh: "恢复全部", en: "Restore All" })}
              </Button>
            ) : null}
          </div>
        </>
      }
      footer={
        <Pagination
          size="sm"
          page={safePage}
          totalItems={filtered.length}
          pageSize={pageSize}
          showSummary
          onPageChange={setPage}
        />
      }
    />
  );
}

const COMPACT_LOG_ROWS = Array.from({ length: 10 }, (_, idx) => ({
  id: `evt-${1040 + idx}`,
  timestamp: `11:2${idx}:0${(idx * 3) % 9}`,
  token: [
    "fastSpatial",
    "defaultSpatial",
    "slowSpatial",
    "fastEffects",
    "defaultEffects",
  ][idx % 5]!,
  component: [
    "Button",
    "SplitButton",
    "List",
    "Carousel",
    "MaterialShapeView",
  ][idx % 5]!,
  durationMs: 140 + idx * 28,
}));

function DataTableCompactStickyDemo(): React.JSX.Element {
  const copy = useCopyResolver();

  const columns: readonly M3EDataTableColumn<(typeof COMPACT_LOG_ROWS)[number]>[] = [
    {
      id: "id",
      header: copy({ zh: "事件 ID", en: "Event ID" }),
      cell: (r) => (
        <span style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}>
          #{r.id}
        </span>
      ),
    },
    {
      id: "component",
      header: copy({ zh: "目标组件", en: "Component" }),
      cell: (r) => r.component,
    },
    {
      id: "token",
      header: copy({ zh: "弹簧令牌", en: "Motion Token" }),
      cell: (r) => <Chip size="sm" tone="secondary">{r.token}</Chip>,
    },
    {
      id: "timestamp",
      header: copy({ zh: "采样时间", en: "Timestamp" }),
      align: "end",
      cell: (r) => r.timestamp,
    },
    {
      id: "durationMs",
      header: copy({ zh: "收敛耗时", en: "Settle Time" }),
      align: "end",
      sortable: true,
      sortAccessor: (r) => r.durationMs,
      cell: (r) => `${r.durationMs} ms`,
    },
  ];

  return (
    <DataTable
      caption={copy({ zh: "物理弹簧采样日志（紧凑粘性表头）", en: "Spring telemetry log (compact sticky header)" })}
      hideCaption
      density="compact"
      stickyHeader
      columns={columns}
      rows={COMPACT_LOG_ROWS}
      getRowKey={(r) => r.id}
    />
  );
}

function DataTableLoadingDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [loading, setLoading] = React.useState(true);

  const columns: readonly M3EDataTableColumn<ServiceMetricRow>[] = [
    {
      id: "service",
      header: copy({ zh: "服务节点", en: "Service Node" }),
      cell: (r) => r.service,
    },
    {
      id: "region",
      header: copy({ zh: "区域", en: "Region" }),
      cell: (r) => r.region,
    },
    {
      id: "latencyMs",
      header: copy({ zh: "P95 延迟", en: "P95 Latency" }),
      align: "end",
      cell: (r) => `${r.latencyMs} ms`,
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div>
        <Switch
          checked={loading}
          onCheckedChange={setLoading}
          label={copy({ zh: "模拟异步加载骨架屏 (loading)", en: "Simulate async skeleton rows (loading)" })}
        />
      </div>
      <DataTable
        caption={copy({ zh: "节点延迟监控", en: "Node latency monitor" })}
        hideCaption
        selectable
        loading={loading}
        loadingRows={4}
        columns={columns}
        rows={SERVICE_ROWS.slice(0, 4)}
        getRowKey={(r) => r.id}
      />
    </div>
  );
}

function DataTableEmptyDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [populated, setPopulated] = React.useState(false);

  const columns: readonly M3EDataTableColumn<ServiceMetricRow>[] = [
    {
      id: "service",
      header: copy({ zh: "服务名称", en: "Service" }),
      cell: (r) => r.service,
    },
    {
      id: "region",
      header: copy({ zh: "区域", en: "Region" }),
      cell: (r) => r.region,
    },
    {
      id: "uptime",
      header: copy({ zh: "可用率", en: "Uptime" }),
      align: "end",
      cell: (r) => `${r.uptime.toFixed(2)}%`,
    },
  ];

  return (
    <DataTable
      caption={copy({ zh: "自定义筛选结果", en: "Filtered service results" })}
      hideCaption
      columns={columns}
      rows={populated ? SERVICE_ROWS.slice(0, 2) : []}
      getRowKey={(r) => r.id}
      emptyMessage={
        <Empty
          compact
          shape="clover8Leaf"
          title={copy({ zh: "未匹配到任何服务节点", en: "No matching service nodes" })}
          description={copy({
            zh: "当前筛选条件下暂无遥测记录，可导入示例集群或重置条件。",
            en: "No telemetry records match the active filter. Load sample nodes to preview rows.",
          })}
          actions={
            <Button
              size="xs"
              variant="tonal"
              leadingIcon={<PlusIcon size={15} />}
              onClick={() => setPopulated(true)}
            >
              {copy({ zh: "载入示例数据", en: "Load Sample Rows" })}
            </Button>
          }
        />
      }
      toolbar={
        populated ? (
          <Button size="xs" variant="outlined" onClick={() => setPopulated(false)}>
            {copy({ zh: "清空数据查看空状态", en: "Clear Rows to Preview Empty" })}
          </Button>
        ) : undefined
      }
    />
  );
}

function SegmentedListSelectableDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [selected, setSelected] = React.useState<string[]>(["expressive", "hct"]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const options = [
    {
      id: "expressive",
      headline: copy({ zh: "Expressive 物理弹簧", en: "Expressive Spring Physics" }),
      supporting: copy({
        zh: "选中项自动独立膨胀为 16px 全圆角胶囊",
        en: "Selected items detach into full 16px rounded corners",
      }),
      tag: "ζ=0.6",
    },
    {
      id: "hct",
      headline: copy({ zh: "HCT 感知色彩空间", en: "HCT Perceptual Color Space" }),
      supporting: copy({
        zh: "自动保证文本与表面背景满足 WCAG 对比度预算",
        en: "Preserves perceptual tone contrast across light and dark modes",
      }),
      tag: "SPEC_2025",
    },
    {
      id: "bidi",
      headline: copy({ zh: "原生 RTL 镜像排版", en: "Native BiDi & RTL Mirroring" }),
      supporting: copy({
        zh: "基于逻辑属性自动翻转圆角元组与滑动手势方向",
        en: "Logical CSS properties mirror corner tuples and drag gestures",
      }),
      tag: "ar-SA",
    },
  ];

  return (
    <div style={{ maxWidth: 520 }}>
      <List variant="segmented" aria-label={copy({ zh: "设计系统特性开关", en: "Design system capabilities" })}>
        {options.map((opt) => (
          <ListItem
            key={opt.id}
            headline={opt.headline}
            supportingText={opt.supporting}
            selected={selected.includes(opt.id)}
            onClick={() => toggle(opt.id)}
            trailing={<Chip size="sm" tone="secondary">{opt.tag}</Chip>}
          />
        ))}
      </List>
    </div>
  );
}

function SegmentedListControlsDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [pushEnabled, setPushEnabled] = React.useState(true);
  const [digestEnabled, setDigestEnabled] = React.useState(false);

  return (
    <div style={{ maxWidth: 540 }}>
      <List variant="segmented" aria-label={copy({ zh: "工作区成员与通知控制", en: "Workspace notifications and controls" })}>
        <ListItem
          leading={<Avatar fallback="AL" size="sm" shape="cookie9Sided" />}
          headline={copy({ zh: "实时构建推送", en: "Live Build Push Alerts" })}
          supportingText={copy({
            zh: "CI 流水线失败或金丝雀就绪时立即提醒",
            en: "Notify immediately when CI pipelines fail or canary builds deploy",
          })}
          onClick={() => setPushEnabled((v) => !v)}
          trailing={
            <span onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={pushEnabled}
                onCheckedChange={setPushEnabled}
                aria-label={copy({ zh: "切换实时构建推送", en: "Toggle live build push alerts" })}
              />
            </span>
          }
        />
        <ListItem
          leading={<Avatar fallback="WD" size="sm" shape="clover8Leaf" />}
          headline={copy({ zh: "每周性能周报", en: "Weekly Performance Digest" })}
          supportingText={copy({
            zh: "汇总包体积预算与 Core Web Vitals 趋势",
            en: "Summarizes bundle budgets and Core Web Vitals regressions",
          })}
          onClick={() => setDigestEnabled((v) => !v)}
          trailing={
            <span onClick={(e) => e.stopPropagation()}>
              <Switch
                checked={digestEnabled}
                onCheckedChange={setDigestEnabled}
                aria-label={copy({ zh: "切换每周性能周报", en: "Toggle weekly performance digest" })}
              />
            </span>
          }
        />
        <ListItem
          leading={<Avatar fallback="SG" size="sm" shape="pentagon" />}
          headline={copy({ zh: "生产密钥轮换策略", en: "Production Key Rotation" })}
          supportingText={copy({
            zh: "已启用硬件安全模块托管自动轮换",
            en: "Managed automatically by hardware security module policy",
          })}
          trailing={
            <Chip size="sm" tone="success" dot>
              {copy({ zh: "受保护", en: "Protected" })}
            </Chip>
          }
        />
        <ListItem
          disabled
          leading={<Avatar fallback="LK" size="sm" shape="square" />}
          headline={copy({ zh: "旧版 Webhook 转发（已停用）", en: "Legacy Webhook Relay (Deprecated)" })}
          supportingText={copy({
            zh: "迁移至事件总线 v2 后此通道只读",
            en: "Read-only after migrating to Event Bus v2",
          })}
          trailing={<Chip size="sm" tone="neutral">v1</Chip>}
        />
      </List>
    </div>
  );
}

function ChipFilterGroupDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [activeFilters, setActiveFilters] = React.useState<string[]>(["spring", "a11y"]);

  const items = [
    { id: "spring", label: copy({ zh: "弹簧物理", en: "Spring Physics" }), icon: <SparkleIcon size={15} /> },
    { id: "a11y", label: copy({ zh: "WCAG 无障碍", en: "WCAG Accessible" }), icon: <ShieldCheckIcon size={15} /> },
    { id: "rtl", label: copy({ zh: "RTL 双向排版", en: "RTL Ready" }), icon: <UsersIcon size={15} /> },
    { id: "tokens", label: copy({ zh: "设计令牌", en: "Design Tokens" }), icon: <BarChartIcon size={15} /> },
  ];

  const toggle = (id: string, next: boolean) => {
    setActiveFilters((prev) =>
      next ? [...prev, id] : prev.filter((item) => item !== id),
    );
  };

  return (
    <div className="demo-row">
      {items.map((item) => (
        <Chip
          key={item.id}
          icon={item.icon}
          selected={activeFilters.includes(item.id)}
          onSelectedChange={(next) => toggle(item.id, next)}
        >
          {item.label}
        </Chip>
      ))}
    </div>
  );
}

const INITIAL_REVIEWERS = [
  { id: "lin", name: "Linnea Chen", initials: "LC", shape: "cookie9Sided" as M3EShapeName },
  { id: "omar", name: "Omar Al-Farsi", initials: "OA", shape: "clover8Leaf" as M3EShapeName },
  { id: "yuki", name: "Yuki Takahashi", initials: "YT", shape: "sunny" as M3EShapeName },
];

function ChipInputListDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [reviewers, setReviewers] = React.useState(INITIAL_REVIEWERS);

  return (
    <div className="demo-row">
      {reviewers.map((person) => (
        <Chip
          key={person.id}
          avatar={<Avatar fallback={person.initials} size="xs" shape={person.shape} />}
          onRemove={() =>
            setReviewers((prev) => prev.filter((item) => item.id !== person.id))
          }
          removeLabel={copy({
            zh: `移除评审人 ${person.name}`,
            en: `Remove reviewer ${person.name}`,
          })}
        >
          {person.name}
        </Chip>
      ))}
      {reviewers.length < INITIAL_REVIEWERS.length ? (
        <Button
          size="xs"
          variant="text"
          leadingIcon={<RefreshIcon size={14} />}
          onClick={() => setReviewers(INITIAL_REVIEWERS)}
        >
          {copy({ zh: "重置列表", en: "Reset Chips" })}
        </Button>
      ) : null}
    </div>
  );
}

const INITIAL_REMOVABLE_CHIPS: readonly {
  readonly id: string;
  readonly label: string;
  readonly tone: ChipTone;
}[] = [
  { id: "t1", label: "react-19", tone: "primary" },
  { id: "t2", label: "monet-2025", tone: "secondary" },
  { id: "t3", label: "zero-runtime-css", tone: "tertiary" },
  { id: "t4", label: "strict-ts", tone: "success" },
];

function ChipStatusDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [chips, setChips] = React.useState(INITIAL_REMOVABLE_CHIPS);
  const [activeTopic, setActiveTopic] = React.useState("monet");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div className="demo-row">
        <Chip size="sm" tone="primary">
          size=&quot;sm&quot; (22px)
        </Chip>
        <Chip size="md" tone="primary">
          size=&quot;md&quot; (26px)
        </Chip>
        <Chip
          size="md"
          tone={activeTopic === "monet" ? "primary" : "neutral"}
          variant={activeTopic === "monet" ? "solid" : "outlined"}
          onClick={() => setActiveTopic((cur) => (cur === "monet" ? "spring" : "monet"))}
        >
          {copy({
            zh: `可点击胶囊 (${activeTopic})`,
            en: `Interactive onClick (${activeTopic})`,
          })}
        </Chip>
      </div>

      <div className="demo-row">
        {chips.map((item) => (
          <Chip
            key={item.id}
            tone={item.tone}
            onRemove={() =>
              setChips((prev) => prev.filter((t) => t.id !== item.id))
            }
          >
            {item.label}
          </Chip>
        ))}
        {chips.length < INITIAL_REMOVABLE_CHIPS.length ? (
          <Button
            size="xs"
            variant="text"
            leadingIcon={<RefreshIcon size={14} />}
            onClick={() => setChips(INITIAL_REMOVABLE_CHIPS)}
          >
            {copy({ zh: "恢复纸片", en: "Restore Chips" })}
          </Button>
        ) : null}
      </div>
    </div>
  );
}

function BadgeCountsDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [unread, setUnread] = React.useState(7);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="demo-row" style={{ gap: 28 }}>
        <Badge count={unread} color="error">
          <IconButton
            variant="tonal"
            icon={<BellIcon size={18} />}
            aria-label={copy({ zh: "通知中心", en: "Notifications" })}
          />
        </Badge>

        <Badge count={24} color="primary">
          <IconButton
            variant="outlined"
            icon={<FolderIcon size={18} />}
            aria-label={copy({ zh: "待审工单", en: "Open tickets" })}
          />
        </Badge>

        <Badge count={128} max={99} color="error">
          <IconButton
            variant="tonal"
            icon={<SendIcon size={18} />}
            aria-label={copy({ zh: "消息队列", en: "Message queue" })}
          />
        </Badge>

        <Badge count={0} color="secondary">
          <IconButton
            variant="outlined"
            icon={<CheckTinyIcon size={18} />}
            aria-label={copy({ zh: "清零状态（徽标自动隐藏）", en: "Zero count (badge auto-hidden)" })}
          />
        </Badge>
      </div>

      <div className="demo-row">
        <Button
          size="xs"
          variant="outlined"
          onClick={() => setUnread((n) => Math.max(0, n - 1))}
        >
          -1
        </Button>
        <Button
          size="xs"
          variant="tonal"
          onClick={() => setUnread((n) => n + 5)}
        >
          +5
        </Button>
        <Button size="xs" variant="text" onClick={() => setUnread(0)}>
          {copy({ zh: "清零 (0)", en: "Set 0 (Hidden)" })}
        </Button>
        <Button size="xs" variant="text" onClick={() => setUnread(120)}>
          {copy({ zh: "设为 120 (99+)", en: "Set 120 (99+)" })}
        </Button>
      </div>
    </div>
  );
}

const CAROUSEL_FILLS = [
  "var(--m3e-color-primary-container)",
  "var(--m3e-color-secondary-container)",
  "var(--m3e-color-tertiary-container)",
  "var(--m3e-color-surface-container-highest)",
] as const;

const CAROUSEL_TOPICS = [
  { zh: "海岸", en: "Coast" },
  { zh: "森林", en: "Forest" },
  { zh: "沙漠", en: "Desert" },
  { zh: "冰川", en: "Glacier" },
  { zh: "峡谷", en: "Canyon" },
  { zh: "湖泊", en: "Lake" },
  { zh: "草原", en: "Prairie" },
  { zh: "火山", en: "Volcano" },
  { zh: "雨林", en: "Rainforest" },
  { zh: "群岛", en: "Archipelago" },
  { zh: "苔原", en: "Tundra" },
  { zh: "瀑布", en: "Waterfall" },
] as const;

function useCarouselSlides(count: number): readonly CarouselItemSpec[] {
  const copy = useCopyResolver();
  return Array.from({ length: count }, (_, idx) => ({
    id: `slide-${idx}`,
    title: copy(CAROUSEL_TOPICS[idx % CAROUSEL_TOPICS.length]!),
    background: CAROUSEL_FILLS[idx % CAROUSEL_FILLS.length],
  }));
}

function CarouselMultiBrowseDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  return (
    <Carousel
      variant="multi-browse"
      height={220}
      items={useCarouselSlides(10)}
      aria-label={copy({ zh: "地貌", en: "Landscapes" })}
    />
  );
}

function CarouselHeroDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  return (
    <Carousel
      variant="hero"
      height={252}
      items={useCarouselSlides(6)}
      aria-label={copy({ zh: "精选", en: "Featured" })}
    />
  );
}

function CarouselCenteredAndUncontainedDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [mode, setMode] = React.useState<"centered-hero" | "uncontained">("centered-hero");
  const slides = useCarouselSlides(12);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div className="demo-row" style={{ gap: 8 }}>
        <Button
          size="xs"
          variant={mode === "centered-hero" ? "filled" : "outlined"}
          onClick={() => setMode("centered-hero")}
        >
          centered-hero
        </Button>
        <Button
          size="xs"
          variant={mode === "uncontained" ? "filled" : "outlined"}
          onClick={() => setMode("uncontained")}
        >
          uncontained
        </Button>
      </div>
      <Carousel
        variant={mode}
        preferredItemWidth={mode === "uncontained" ? 196 : undefined}
        height={210}
        items={slides}
        aria-label={copy({ zh: "图库", en: "Gallery" })}
      />
    </div>
  );
}

function EmptyActionsShapesDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [shape, setShape] = React.useState<M3EShapeName>("sunny");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="demo-row">
        {(["sunny", "clover8Leaf", "cookie9Sided", "softBurst"] as const).map((s) => (
          <Chip
            key={s}
            selected={shape === s}
            onSelectedChange={() => setShape(s)}
          >
            shape=&quot;{s}&quot;
          </Chip>
        ))}
      </div>

      <Empty
        shape={shape}
        icon={<SparkleIcon size={26} />}
        title={copy({ zh: "尚未创建自动化工作流", en: "No automation workflows yet" })}
        description={copy({
          zh: "从预设模板快速初始化定时任务，或连接代码仓库触发构建流水线。",
          en: "Bootstrap a scheduled workflow from a template or connect a repository trigger.",
        })}
        actions={
          <>
            <Button size="sm" variant="filled" leadingIcon={<PlusIcon size={16} />}>
              {copy({ zh: "新建工作流", en: "Create Workflow" })}
            </Button>
            <Button size="sm" variant="outlined">
              {copy({ zh: "浏览模板库", en: "Browse Templates" })}
            </Button>
          </>
        }
      />
    </div>
  );
}

function SkeletonCardCompositionDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [loading, setLoading] = React.useState(true);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 420 }}>
      <div>
        <Switch
          checked={loading}
          onCheckedChange={setLoading}
          label={copy({ zh: "加载态骨架屏 (loading)", en: "Loading skeleton state" })}
        />
      </div>

      <Card variant="outlined">
        {loading ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Skeleton shape="cookie9Sided" width={52} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton variant="text" width="58%" height={16} />
                <Skeleton variant="text" width="38%" height={12} />
              </div>
            </div>
            <Skeleton variant="rounded" width="100%" height={92} />
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              <Skeleton variant="text" width="94%" />
              <Skeleton variant="text" width="76%" />
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar fallback="MC" size="lg" shape="cookie9Sided" />
                <div>
                  <div style={{ fontWeight: 700, fontSize: 15.5, color: "var(--m3e-color-on-surface)" }}>
                     Maya Chen
                  </div>
                  <div style={{ fontSize: 12.5 }}>Staff Design Technologist</div>
                </div>
              </div>
              <Chip size="sm" tone="success" dot>
                Online
              </Chip>
            </div>
            <div
              style={{
                height: 92,
                borderRadius: 12,
                background:
                  "var(--m3e-color-secondary-container)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 650,
                color: "var(--m3e-color-on-secondary-container)",
              }}
            >
              {copy({ zh: "Q4 动效规范里程碑已完成 92%", en: "Q4 Motion Token Milestone · 92% Complete" })}
            </div>
            <div style={{ color: "var(--m3e-color-on-surface-variant)", fontSize: 13.5 }}>
              {copy({
                zh: "负责 Material 3 Expressive 多边形顶点对齐算法与无障碍高对比度调色板验证。",
                en: "Maintaining Material 3 Expressive polygon vertex alignment and high-contrast HCT verification.",
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

const MORPH_PRESETS: readonly {
  readonly label: string;
  readonly from: M3EShapeName;
  readonly to: M3EShapeName;
}[] = [
  { label: "cookie9Sided → clover8Leaf", from: "cookie9Sided", to: "clover8Leaf" },
  { label: "circle → softBurst", from: "circle", to: "softBurst" },
  { label: "pentagon → sunny", from: "pentagon", to: "sunny" },
  { label: "pill → heart", from: "pill", to: "heart" },
];

function ShapeMorphPlaygroundDemo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [pair, setPair] = React.useState(MORPH_PRESETS[0]!);
  const [progress, setProgress] = React.useState(0.45);
  const [springFlipped, setSpringFlipped] = React.useState(false);

  const liveSpringShape = springFlipped ? pair.to : pair.from;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      <div className="demo-row">
        {MORPH_PRESETS.map((preset) => (
          <Chip
            key={preset.label}
            selected={pair.label === preset.label}
            onSelectedChange={() => {
              setPair(preset);
              setSpringFlipped(false);
            }}
          >
            {preset.label}
          </Chip>
        ))}
      </div>

      <div className="demo-grid-2">
        <div className="demo-panel" style={{ alignItems: "center", textAlign: "center" }}>
          <span className="demo-panel__label">
            {copy({
              zh: `手动插值进度 (morphProgress = ${progress.toFixed(2)})`,
              en: `Manual Scrubbing (morphProgress = ${progress.toFixed(2)})`,
            })}
          </span>
          <MaterialShapeView
            shape={pair.from}
            toShape={pair.to}
            morphProgress={progress}
            size={108}
            fill="var(--m3e-color-primary)"
            aria-label={`${pair.from} to ${pair.to}`}
          />
          <div style={{ width: "100%", maxWidth: 280 }}>
            <Slider
              min={0}
              max={1}
              step={0.01}
              value={progress}
              onValueChange={setProgress}
              aria-label={copy({ zh: "多边形形变进度", en: "Morph progress" })}
            />
          </div>
        </div>

        <div className="demo-panel" style={{ alignItems: "center", textAlign: "center", justifyContent: "space-between" }}>
          <span className="demo-panel__label">
            {copy({
              zh: `自动物理弹簧形变 (shape="${liveSpringShape}")`,
              en: `Automatic Spring Morph (shape="${liveSpringShape}")`,
            })}
          </span>
          <MaterialShapeView
            shape={liveSpringShape}
            size={108}
            motionToken="defaultSpatial"
            fill="var(--m3e-color-tertiary)"
            aria-label={liveSpringShape}
          />
          <Button
            size="xs"
            variant="tonal"
            leadingIcon={<RefreshIcon size={14} />}
            onClick={() => setSpringFlipped((v) => !v)}
          >
            {copy({ zh: "触发弹簧形变切换", en: "Trigger Spring Morph" })}
          </Button>
        </div>
      </div>
    </div>
  );
}

function ShapeGallery35Demo(): React.JSX.Element {
  const copy = useCopyResolver();
  const [activeShape, setActiveShape] = React.useState<M3EShapeName>("cookie9Sided");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div
        className="demo-panel"
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <MaterialShapeView
            shape={activeShape}
            size={84}
            fill="var(--m3e-color-primary)"
            aria-label={activeShape}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 16,
                  fontWeight: 750,
                }}
              >
                {activeShape}
              </span>
              <Chip size="sm" tone="primary">
                {`${M3E_ALL_SHAPE_NAMES.indexOf(activeShape) + 1} / ${M3E_ALL_SHAPE_NAMES.length}`}
              </Chip>
            </div>
            <span style={{ fontSize: 13, color: "var(--m3e-color-on-surface-variant)" }}>
              {copy({
                zh: "点击下方任意多边形磁贴，上方预览将通过二阶弹簧实时平滑形变。",
                en: "Click any of the 35 AOSP polygon tiles below to spring-morph the live specimen.",
              })}
            </span>
          </div>
        </div>
      </div>

      <div className="shape-grid">
        {M3E_ALL_SHAPE_NAMES.map((name) => {
          const isSelected = name === activeShape;
          return (
            <Card
              key={name}
              variant={isSelected ? "filled" : "outlined"}
              interactive
              onClick={() => setActiveShape(name)}
              className={
                isSelected
                  ? "shape-tile-card shape-tile-card--selected"
                  : "shape-tile-card"
              }
            >
              <MaterialShapeView
                shape={name}
                size={40}
                fill={
                  isSelected
                    ? "var(--m3e-color-primary)"
                    : "var(--m3e-color-on-surface-variant)"
                }
              />
              <span
                style={{
                  fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                  fontSize: 10.5,
                  fontWeight: 560,
                  WebkitTextStroke: isSelected
                    ? "0.28px currentColor"
                    : undefined,
                  color: isSelected
                    ? "var(--m3e-color-on-surface)"
                    : "var(--m3e-color-on-surface-variant)",
                  wordBreak: "break-word",
                }}
              >
                {name}
              </span>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Data Display Component Docs Registry                                       */
/* -------------------------------------------------------------------------- */

export const DISPLAY_COMPONENT_DOCS: readonly ComponentDocSpec[] = [
  /* -------------------------------- 1. Card ------------------------------- */
  {
    slug: "card",
    title: "Card",
    subtitle: {
      zh: "具备填充、抬升与描边三种表面层级的内容卡片容器，支持交互态弹性圆角形变。",
      en: "Surface container in filled, elevated, and outlined variants with spring-driven interactive corner morphing.",
    },
    importStatement: 'import { Card } from "m3eui";',
    primitive: "@base-ui/react/button",
    scenarios: [
      {
        id: "card-variants",
        title: {
          zh: "三种表面变体",
          en: "Surface Variants",
        },
        description: {
          zh: "提供 filled（最高表面色阶）、elevated（阴影抬升）与 outlined（细边框）三种 Material 3 标准容器。",
          en: "Choose between filled, elevated, and outlined surface treatments to establish visual hierarchy.",
        },
        code: `import { Card } from "m3eui";

<div className="demo-grid-3">
  <Card variant="filled" title="Filled Card" subtitle="surface-container-highest">
    High-emphasis tonal container for grouped metrics and featured callouts.
  </Card>
  <Card variant="elevated" title="Elevated Card" subtitle="surface-container-low + shadow">
    Raised surface separating cards from dense backgrounds.
  </Card>
  <Card variant="outlined" title="Outlined Card" subtitle="outline-variant border">
    Clean hairline border ideal for dashboards and multi-column grids.
  </Card>
</div>`,
        render: () => (
          <div className="demo-grid-3">
            <Card
              variant="filled"
              title="Filled Card"
              subtitle="surface-container-highest"
            >
              High-emphasis tonal container for grouped metrics and featured callouts.
            </Card>
            <Card
              variant="elevated"
              title="Elevated Card"
              subtitle="surface-container-low + shadow"
            >
              Raised surface separating cards from dense backgrounds.
            </Card>
            <Card
              variant="outlined"
              title="Outlined Card"
              subtitle="outline-variant border"
            >
              Clean hairline border ideal for dashboards and multi-column grids.
            </Card>
          </div>
        ),
      },
      {
        id: "card-interactive",
        title: {
          zh: "可交互按压与弹簧圆角",
          en: "Interactive Spring Morphing",
        },
        description: {
          zh: "开启 interactive 后渲染无障碍按钮语义，圆角在 16px（静止）、20px（悬停）与 12px（按压）间通过 fastSpatial 物理弹簧平滑过渡。",
          en: "Setting interactive enables keyboard and pointer semantics while morphing corners between 16px rest, 20px hover, and 12px pressed states.",
        },
        code: `import { Card, Chip } from "m3eui";

const [selected, setSelected] = React.useState("spatial");

<Card
  variant="filled"
  interactive
  title="Spatial Spring"
  subtitle="fastSpatial · ζ=0.6, k=800"
  onClick={() => setSelected("spatial")}
>
  Corners expand to 20px on hover and compress to 12px while pressed.
</Card>`,
        render: () => <CardInteractiveDemo />,
      },
      {
        id: "card-rich-layout",
        title: {
          zh: "富媒体头部与操作栏布局",
          en: "Rich Media, Avatar & Actions Layout",
        },
        description: {
          zh: "组合 media 横幅插槽、Avatar 徽标头部、正文描述与底部 actions 操作按钮。",
          en: "Compose media banners, Avatar/Badge headers, body copy, and footer action buttons.",
        },
        code: `import { Avatar, Badge, Button, Card, Chip, MaterialShapeView } from "m3eui";

<Card
  variant="outlined"
  media={
    <div style={{ height: 148, padding: 24 }}>
      <Chip size="sm" tone="primary" variant="solid">Material 3 Expressive</Chip>
      <MaterialShapeView shape="clover8Leaf" size={68} fill="var(--m3e-color-primary)" />
    </div>
  }
  title={
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <Badge dot color="primary">
        <Avatar fallback="ML" size="sm" shape="cookie9Sided" />
      </Badge>
      <span>Motion & Polygon Studio</span>
    </div>
  }
  actions={
    <>
      <Button variant="text" size="xs">Share</Button>
      <Button variant="filled" size="xs">Get Tokens</Button>
    </>
  }
>
  Combines analytical second-order spring ODE physics and 35 rounded polygons.
</Card>`,
        render: () => <CardRichLayoutDemo />,
      },
      {
        id: "card-disabled",
        title: {
          zh: "禁用态与激活态对比",
          en: "Disabled vs Active Interactive Card",
        },
        description: {
          zh: "对比可点击的交互卡片与锁定只读状态的卡片表现。",
          en: "Side-by-side comparison between an active interactive card and a locked non-interactive card.",
        },
        code: `import { Card, Chip } from "m3eui";

<div className="demo-grid-2">
  <Card
    variant="outlined"
    interactive
    title="Active Interactive Card"
    subtitle="Click or hold for spring corner morph"
    onClick={() => console.log("Activated")}
  >
    Provides keyboard focus ring and pressed corner spring compression.
  </Card>

  <Card
    variant="outlined"
    interactive={false}
    title="Disabled Interactive Card"
    subtitle="Restricted · Ignores pointer press"
    style={{ opacity: 0.48, cursor: "not-allowed" }}
  >
    Disable interactive mode when archived or read-only.
  </Card>
</div>`,
        render: () => <CardDisabledComparisonDemo />,
      },
    ],
    apis: [
      {
        title: "Card Props",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "卡片主体内容区域。",
              en: "Primary body content rendered inside the card.",
            },
          },
          {
            name: "variant",
            type: '"filled" | "elevated" | "outlined"',
            defaultValue: '"filled"',
            description: {
              zh: "卡片表面层级样式。",
              en: "Visual surface treatment of the card container.",
            },
          },
          {
            name: "title",
            type: "React.ReactNode",
            description: {
              zh: "可选卡片头部主标题或自定义头部节点。",
              en: "Optional header title or custom header row.",
            },
          },
          {
            name: "subtitle",
            type: "React.ReactNode",
            description: {
              zh: "可选卡片头部副标题。",
              en: "Optional supporting subtitle below the title.",
            },
          },
          {
            name: "media",
            type: "React.ReactNode",
            description: {
              zh: "卡片顶部通栏媒体横幅插槽。",
              en: "Full-bleed top media slot for images, illustrations, or banners.",
            },
          },
          {
            name: "actions",
            type: "React.ReactNode",
            description: {
              zh: "底部右对齐操作按钮插槽。",
              en: "Footer slot aligned to the inline end for action buttons.",
            },
          },
          {
            name: "interactive",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "开启后支持键盘与指针点击，并启用悬停/按压弹簧圆角形变。",
              en: "Enables button interaction semantics and spring corner radius morphing.",
            },
          },
          {
            name: "onClick",
            type: "React.MouseEventHandler<HTMLElement>",
            description: {
              zh: "interactive 开启时的点击回调。",
              en: "Click handler invoked when interactive is true.",
            },
          },
          {
            name: "className",
            type: "string",
            description: {
              zh: "附加自定义类名。",
              en: "Additional CSS class name.",
            },
          },
          {
            name: "style",
            type: "React.CSSProperties",
            description: {
              zh: "附加行内样式。",
              en: "Inline style overrides.",
            },
          },
        ],
      },
    ],
  },

  /* ----------------------------- 2. DataTable ----------------------------- */
  {
    slug: "data-table",
    title: "DataTable",
    subtitle: {
      zh: "支持多语言感知排序、多选批量操作栏、紧凑粘性表头与加载骨架屏的数据表格。",
      en: "Accessible data grid with locale-aware sorting, multi-row selection, sticky headers, skeleton loading, and custom empty states.",
    },
    importStatement: 'import { DataTable } from "m3eui";',
    scenarios: [
      {
        id: "data-table-sortable",
        title: {
          zh: "列排序与等宽数值右对齐",
          en: "Sortable Columns & Tabular Numerics",
        },
        description: {
          zh: "通过 sortable 与 sortAccessor 开启 Intl.Collator 本地化排序，配合 align=\"end\" 呈现等宽数值列。",
          en: "Enable locale-aware column sorting via sortable and sortAccessor with align=\"end\" tabular numeric formatting.",
        },
        code: `import { Chip, DataTable, type M3EDataTableColumn } from "m3eui";

const columns: readonly M3EDataTableColumn<ServiceRow>[] = [
  { id: "service", header: "Service", sortable: true, sortAccessor: (r) => r.service, cell: (r) => r.service },
  { id: "status", header: "Status", cell: (r) => <Chip size="sm" tone="success" dot>{r.status}</Chip> },
  { id: "latencyMs", header: "P95 Latency", align: "end", sortable: true, sortAccessor: (r) => r.latencyMs, cell: (r) => \`\${r.latencyMs} ms\` },
  { id: "rps", header: "Throughput (RPS)", align: "end", sortable: true, sortAccessor: (r) => r.rps, cell: (r) => r.rps.toLocaleString() },
];

<DataTable
  caption="Core microservice metrics"
  hideCaption
  columns={columns}
  rows={rows}
  getRowKey={(r) => r.id}
  defaultSort={{ columnId: "rps", direction: "descending" }}
/>`,
        render: () => <DataTableSortableDemo />,
      },
      {
        id: "data-table-selection-toolbar",
        title: {
          zh: "多行勾选、搜索工具栏与底部分页",
          en: "Row Selection, Search Toolbar & Pagination",
        },
        description: {
          zh: "开启 selectable 支持全选/半选复选框，并在 toolbar 与 footer 插槽内集成搜索过滤、批量归档与 Pagination 分页器。",
          en: "Combine selectable checkboxes with a toolbar search/bulk-action bar and a footer Pagination control.",
        },
        code: `import { Button, Chip, DataTable, Pagination, SearchBar } from "m3eui";

<DataTable
  caption="Release package artifacts"
  hideCaption
  selectable
  selectedRowKeys={selectedKeys}
  onSelectedRowKeysChange={setSelectedKeys}
  columns={columns}
  rows={pagedRows}
  getRowKey={(r) => r.id}
  toolbar={
    <>
      <SearchBar size="sm" value={query} onValueChange={setQuery} />
      {selectedKeys.length > 0 && (
        <Button size="xs" variant="tonal" intent="danger" onClick={archiveSelected}>
          Archive ({selectedKeys.length})
        </Button>
      )}
    </>
  }
  footer={
    <Pagination
      size="sm"
      page={page}
      totalItems={filtered.length}
      pageSize={4}
      showSummary
      onPageChange={setPage}
    />
  }
/>`,
        render: () => <DataTableSelectionToolbarDemo />,
      },
      {
        id: "data-table-density-sticky",
        title: {
          zh: "紧凑行高与固定粘性表头",
          en: "Compact Density & Sticky Header",
        },
        description: {
          zh: "设置 density=\"compact\" 将行高收敛至 40px，搭配 stickyHeader 在限高滚动区域中锁定表头。",
          en: "Use density=\"compact\" (40px rows) and stickyHeader with a bounded scroll height.",
        },
        code: `import { DataTable } from "m3eui";

<DataTable
  caption="Spring telemetry log"
  hideCaption
  density="compact"
  stickyHeader
  columns={columns}
  rows={logRows}
  getRowKey={(r) => r.id}
/>`,
        render: () => <DataTableCompactStickyDemo />,
      },
      {
        id: "data-table-loading",
        title: {
          zh: "加载骨架屏状态",
          en: "Loading Skeleton Rows",
        },
        description: {
          zh: "开启 loading 与 loadingRows={4} 在保持列宽与复选框对齐的前提下渲染占位脉冲骨架行。",
          en: "Toggle loading with loadingRows={4} to render layout-stable skeleton rows while data is fetching.",
        },
        code: `import { DataTable, Switch } from "m3eui";

const [loading, setLoading] = React.useState(true);

<Switch checked={loading} onCheckedChange={setLoading} label="Simulate async skeleton rows" />
<DataTable
  caption="Node latency monitor"
  hideCaption
  selectable
  loading={loading}
  loadingRows={4}
  columns={columns}
  rows={rows}
  getRowKey={(r) => r.id}
/>`,
        render: () => <DataTableLoadingDemo />,
      },
      {
        id: "data-table-empty",
        title: {
          zh: "自定义空数据占位",
          en: "Custom Empty State Slot",
        },
        description: {
          zh: "当 rows 为空数组时通过 emptyMessage 渲染紧凑多边形 Empty 组件与恢复动作。",
          en: "Pass a compact Empty component to emptyMessage when the dataset is empty.",
        },
        code: `import { Button, DataTable, Empty } from "m3eui";

<DataTable
  caption="Filtered service results"
  hideCaption
  columns={columns}
  rows={[]}
  getRowKey={(r) => r.id}
  emptyMessage={
    <Empty
      compact
      shape="clover8Leaf"
      title="No matching service nodes"
      description="Load sample nodes to preview rows."
      actions={<Button size="xs" variant="tonal">Load Sample Rows</Button>}
    />
  }
/>`,
        render: () => <DataTableEmptyDemo />,
      },
      {
        id: "data-table-sticky-expandable",
        title: {
          zh: "固定首尾列与可展开行详情",
          en: "Sticky Columns & Expandable Rows",
        },
        description: {
          zh: "列定义支持 sticky=\"start\" | \"end\" 逻辑固定列，传入 renderExpandedRow 即可开启内联详情抽屉。",
          en: "Pin start/end columns with logical sticky offsets and render inline row details via renderExpandedRow.",
        },
        code: `<DataTable
  caption="Service nodes"
  hideCaption
  columns={[
    { id: "node", header: "Node", width: 160, sticky: "start", cell: (r) => r.id },
    { id: "region", header: "Region", width: 220, cell: (r) => r.region },
    { id: "latency", header: "P99", width: 140, align: "end", sticky: "end", cell: (r) => r.p99 },
  ]}
  rows={nodes}
  getRowKey={(r) => r.id}
  defaultExpandedRowKeys={["edge-tokyo-01"]}
  renderExpandedRow={(r) => <div>TLS 1.3 · {r.detail}</div>}
/>`,
        render: () => {
          const rows = [
            { id: "edge-tokyo-01", region: "ap-northeast-1", runtime: "Node 22 LTS", p99: "18 ms", detail: "Healthy · 0 packet drops in last 24h" },
            { id: "edge-fra-04", region: "eu-central-1", runtime: "Node 22 LTS", p99: "24 ms", detail: "Healthy · Auto-scaled to 6 replicas" },
          ];
          const cols: readonly M3EDataTableColumn<(typeof rows)[number]>[] = [
            { id: "node", header: "Node", width: 170, sticky: "start", cell: (r) => <code>{r.id}</code> },
            { id: "region", header: "Region", width: 200, cell: (r) => r.region },
            { id: "runtime", header: "Runtime", width: 200, cell: (r) => r.runtime },
            { id: "p99", header: "P99", width: 120, align: "end", sticky: "end", cell: (r) => <Chip size="sm" tone="success">{r.p99}</Chip> },
          ];
          return (
            <div style={{ maxWidth: 520, width: "100%" }}>
              <DataTable
                caption="Edge nodes"
                hideCaption
                density="compact"
                columns={cols}
                rows={rows}
                getRowKey={(r) => r.id}
                defaultExpandedRowKeys={["edge-tokyo-01"]}
                renderExpandedRow={(r) => (
                  <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
                    {r.detail}
                  </span>
                )}
              />
            </div>
          );
        },
      },
    ],
    apis: [
      {
        title: "DataTable Props",
        rows: [
          {
            name: "caption",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "无障碍表格标题（关联滚动区域 aria-labelledby）。",
              en: "Accessible table caption linked to the scrollable region.",
            },
          },
          {
            name: "hideCaption",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "视觉隐藏标题但保留屏幕阅读器语义。",
              en: "Visually hides the caption while keeping it accessible to screen readers.",
            },
          },
          {
            name: "columns",
            type: "readonly M3EDataTableColumn<Row>[]",
            required: true,
            description: {
              zh: "列定义数组。",
              en: "Column definitions describing headers, alignment, sorting, and cell renderers.",
            },
          },
          {
            name: "rows",
            type: "readonly Row[]",
            required: true,
            description: {
              zh: "数据源行数组。",
              en: "Array of row records to render.",
            },
          },
          {
            name: "getRowKey",
            type: "(row: Row, index: number) => string",
            required: true,
            description: {
              zh: "生成每行唯一稳定主键的函数。",
              en: "Returns a unique, stable string key for each row.",
            },
          },
          {
            name: "sort",
            type: "M3EDataTableSortState | null",
            description: {
              zh: "受控排序状态（包含 columnId 与 direction）。",
              en: "Controlled sort state ({ columnId, direction }).",
            },
          },
          {
            name: "defaultSort",
            type: "M3EDataTableSortState | null",
            defaultValue: "null",
            description: {
              zh: "非受控初始排序状态。",
              en: "Initial sort state in uncontrolled mode.",
            },
          },
          {
            name: "onSortChange",
            type: "(next: M3EDataTableSortState) => void",
            description: {
              zh: "点击可排序列头时的回调。",
              en: "Called when the user toggles a sortable column header.",
            },
          },
          {
            name: "renderExpandedRow / expandedRowKeys",
            type: "(row: Row, index: number) => ReactNode / readonly string[]",
            description: {
              zh: "可展开行面板渲染函数及受控展开主键列表。",
              en: "Expandable detail renderer and controlled expanded row keys.",
            },
          },
          {
            name: "selectable",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否在首列渲染多选与全选/半选 Checkbox。",
              en: "Renders row selection checkboxes and a select-all header checkbox.",
            },
          },
          {
            name: "selectedRowKeys",
            type: "readonly string[]",
            description: {
              zh: "受控已选行主键数组。",
              en: "Controlled list of selected row keys.",
            },
          },
          {
            name: "defaultSelectedRowKeys",
            type: "readonly string[]",
            defaultValue: "[]",
            description: {
              zh: "非受控初始已选行主键数组。",
              en: "Initial selected row keys in uncontrolled mode.",
            },
          },
          {
            name: "onSelectedRowKeysChange",
            type: "(keys: string[]) => void",
            description: {
              zh: "行勾选状态变更回调。",
              en: "Callback fired whenever row selection changes.",
            },
          },
          {
            name: "density",
            type: '"comfortable" | "compact"',
            defaultValue: '"comfortable"',
            description: {
              zh: "行高密度：comfortable (52px) 或 compact (40px)。",
              en: "Row height density: comfortable (52px) or compact (40px).",
            },
          },
          {
            name: "stickyHeader",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "纵向滚动时固定表头。",
              en: "Pins the table header while scrolling vertically.",
            },
          },
          {
            name: "loading",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否显示骨架屏占位行。",
              en: "Renders skeleton placeholder rows and marks the region aria-busy.",
            },
          },
          {
            name: "loadingRows",
            type: "number",
            defaultValue: "4",
            description: {
              zh: "loading 状态下渲染的骨架屏行数。",
              en: "Number of skeleton rows rendered while loading is true.",
            },
          },
          {
            name: "toolbar",
            type: "React.ReactNode",
            description: {
              zh: "表格顶部工具栏插槽（用于放置检索框或批量动作）。",
              en: "Top toolbar slot for search inputs, filters, or bulk actions.",
            },
          },
          {
            name: "footer",
            type: "React.ReactNode",
            description: {
              zh: "表格底部插槽（常用于放置 Pagination 分页组件）。",
              en: "Bottom footer slot typically used for Pagination or summaries.",
            },
          },
          {
            name: "emptyMessage",
            type: "React.ReactNode",
            description: {
              zh: "空数据集时的自定义占位内容。",
              en: "Custom content rendered when rows is empty and loading is false.",
            },
          },
        ],
      },
      {
        title: "M3EDataTableColumn<Row>",
        rows: [
          {
            name: "id",
            type: "string",
            required: true,
            description: {
              zh: "列唯一标识符。",
              en: "Unique column identifier.",
            },
          },
          {
            name: "header",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "表头渲染内容。",
              en: "Header cell content.",
            },
          },
          {
            name: "headerLabel",
            type: "string",
            description: {
              zh: "header 为非纯文本节点时供无障碍排序播报使用的列名。",
              en: "Plain-text column label used for live region sort announcements.",
            },
          },
          {
            name: "align",
            type: '"start" | "center" | "end"',
            defaultValue: '"start"',
            description: {
              zh: "列水平对齐方式（数值列推荐使用 \"end\"）。",
              en: "Inline alignment of header and body cells.",
            },
          },
          {
            name: "width / sticky",
            type: 'number | string / "start" | "end"',
            description: {
              zh: "列固定宽度与横向滚动时的首/尾逻辑吸附位置。",
              en: "Column width and logical inline sticky edge.",
            },
          },
          {
            name: "sortable",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否允许点击表头切换升序/降序。",
              en: "Enables interactive ascending/descending header sorting.",
            },
          },
          {
            name: "sortAccessor",
            type: "(row: Row) => string | number",
            description: {
              zh: "排序取值函数，支持数值比较与本地化字符串排序。",
              en: "Extracts the primitive sort key (number or string) for built-in sorting.",
            },
          },
          {
            name: "isRowHeader",
            type: "boolean",
            defaultValue: "colIndex === 0",
            description: {
              zh: "是否将该列单元格渲染为 <th scope=\"row\">。",
              en: "Renders cells in this column as <th scope=\"row\">.",
            },
          },
          {
            name: "cell",
            type: "(row: Row, index: number) => React.ReactNode",
            required: true,
            description: {
              zh: "单元格内容渲染函数。",
              en: "Cell render function receiving the row record and index.",
            },
          },
        ],
      },
    ],
  },

  /* --------------------------------- 3. List ------------------------------ */
  {
    slug: "list",
    title: "List",
    subtitle: {
      zh: "variant=\"segmented\" 为 M3E 分段圆角列表；默认为连续列表，支持 full / inset 分割线。",
      en: "variant=\"segmented\" gives the M3E grouped list with spring seam corners; the default is a continuous list with full / inset dividers.",
    },
    importStatement:
      'import { List, ListItem } from "m3eui";',
    primitive: "@base-ui/react/button",
    scenarios: [
      {
        id: "segmented-list-basic",
        title: {
          zh: "分组圆角拓扑基础用法",
          en: "Grouped Seam Topology",
        },
        description: {
          zh: "列表自动感知子项索引：首项顶部 16px、中间接缝 4px、末项底部 16px，悬停与按压时独立进行四元圆角物理回弹。",
          en: "Automatically assigns 16px outer caps and 4px inner seam corners across items, animating each corner via fastSpatial springs.",
        },
        code: `import { List, ListItem } from "m3eui";

<List variant="segmented" aria-label="Project quick links">
  <ListItem
    headline="Color & Contrast Tokens"
    supportingText="HCT palettes, tone contrast curves, and CSS custom properties"
  />
  <ListItem
    headline="Motion Physics & Springs"
    supportingText="Second-order harmonic oscillator specs for spatial and effects tokens"
  />
  <ListItem
    headline="Polygon Morphing Shapes"
    supportingText="35 normalized AOSP rounded polygons and SVG clip-path helpers"
  />
</List>`,
        render: () => (
          <div style={{ maxWidth: 520 }}>
            <List variant="segmented" aria-label="Project quick links">
              <ListItem
                leading={<SparkleIcon size={17} />}
                headline="Color & Contrast Tokens"
                supportingText="HCT palettes, tone contrast curves, and CSS custom properties"
              />
              <ListItem
                leading={<BarChartIcon size={17} />}
                headline="Motion Physics & Springs"
                supportingText="Second-order harmonic oscillator specs for spatial and effects tokens"
              />
              <ListItem
                leading={<SettingsGearIcon size={17} />}
                headline="Polygon Morphing Shapes"
                supportingText="35 normalized AOSP rounded polygons and SVG clip-path helpers"
              />
            </List>
          </div>
        ),
      },
      {
        id: "segmented-list-selectable",
        title: {
          zh: "可交互多选与胶囊分离",
          en: "Interactive Selectable Items",
        },
        description: {
          zh: "当 selected 为 true 时，列表项四角圆角自动膨胀为 16px 并切换前置勾选徽标，从紧邻分组中视觉凸显。",
          en: "Selected items expand all four corners to 16px and replace the leading slot with a checkmark badge.",
        },
        code: `import { Chip, List, ListItem } from "m3eui";

const [selected, setSelected] = React.useState(["expressive"]);

<List variant="segmented" aria-label="Capabilities">
  <ListItem
    headline="Expressive Spring Physics"
    supportingText="Selected items detach into full 16px rounded corners"
    selected={selected.includes("expressive")}
    onClick={() => toggle("expressive")}
    trailing={<Chip size="sm" tone="secondary">ζ=0.6</Chip>}
  />
</List>`,
        render: () => <SegmentedListSelectableDemo />,
      },
      {
        id: "segmented-list-controls",
        title: {
          zh: "前置多边形头像与尾部控件",
          en: "Leading Avatars, Trailing Controls & Disabled Row",
        },
        description: {
          zh: "支持组合前置多边形 Avatar、双行描述、尾部 Switch 开关、状态 Chip 以及 disabled 禁用项。",
          en: "Combine leading polygon Avatars, supporting descriptions, trailing Switches or Chips, and disabled rows.",
        },
        code: `import { Avatar, Chip, List, ListItem, Switch } from "m3eui";

<List variant="segmented" aria-label="Workspace notifications">
  <ListItem
    leading={<Avatar fallback="AL" size="sm" shape="cookie9Sided" />}
    headline="Live Build Push Alerts"
    supportingText="Notify immediately when CI pipelines fail"
    trailing={<Switch checked={pushEnabled} onCheckedChange={setPushEnabled} />}
  />
  <ListItem
    disabled
    leading={<Avatar fallback="LK" size="sm" shape="square" />}
    headline="Legacy Webhook Relay (Deprecated)"
    supportingText="Read-only after migrating to Event Bus v2"
    trailing={<Chip size="sm" tone="neutral">v1</Chip>}
  />
</List>`,
        render: () => <SegmentedListControlsDemo />,
      },
      {
        id: "standard-list-dividers",
        title: {
          zh: "标准连续列表与内缩分割线 (List & ListItem)",
          en: "Standard Continuous List & Inset Dividers",
        },
        description: {
          zh: "使用 List（即 variant=\"standard\"）配合 dividers=\"inset\" 渲染经典 M3 连续卡片内列表。",
          en: "Render classic M3 continuous lists with full or logical-inset hairline dividers.",
        },
        code: `<List dividers="inset" aria-label="Team members">
  <ListItem leading={<Avatar fallback="AL" size="sm" />} headline="Ada Lovelace" supportingText="Compiler Core" />
  <ListItem leading={<Avatar fallback="GH" size="sm" />} headline="Grace Hopper" supportingText="Runtime Diagnostics" />
</List>`,
        render: () => (
          <div style={{ maxWidth: 460 }}>
            <List dividers="inset" aria-label="Team members">
              <ListItem
                leading={<Avatar fallback="AL" size="sm" />}
                headline="Ada Lovelace"
                supportingText="Compiler Core"
                trailing={<Chip size="sm" tone="primary">Maintainer</Chip>}
              />
              <ListItem
                leading={<Avatar fallback="GH" size="sm" />}
                headline="Grace Hopper"
                supportingText="Runtime Diagnostics"
                trailing={<Chip size="sm" tone="neutral">Reviewer</Chip>}
              />
            </List>
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "List Props",
        rows: [
          {
            name: "variant / dividers",
            type: '"segmented" | "standard" / "none" | "full" | "inset"',
            defaultValue: '"segmented" / "none" ("full" on List)',
            description: {
              zh: "分段圆角模式或连续列表模式，以及分割线样式。",
              en: "Segmented vs standard continuous geometry and divider mode.",
            },
          },
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "由 ListItem 组成的列表子元素。",
              en: "ListItem elements to group and index.",
            },
          },
          {
            name: "aria-label",
            type: "string",
            description: {
              zh: "列表容器的无障碍标签。",
              en: "Accessible label applied to the underlying list element.",
            },
          },
          {
            name: "className",
            type: "string",
            description: {
              zh: "附加自定义类名。",
              en: "Additional CSS class name.",
            },
          },
        ],
      },
      {
        title: "ListItem Props",
        rows: [
          {
            name: "headline",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "列表项主标题文本或节点。",
              en: "Primary headline text or node.",
            },
          },
          {
            name: "supportingText",
            type: "React.ReactNode",
            description: {
              zh: "主标题下方的辅助说明文案。",
              en: "Secondary supporting description beneath the headline.",
            },
          },
          {
            name: "leading",
            type: "React.ReactNode",
            description: {
              zh: "前置插槽（如图标或多边形 Avatar；选中时自动切换为对勾图标）。",
              en: "Leading icon or Avatar slot (replaced by a checkmark when selected).",
            },
          },
          {
            name: "trailing",
            type: "React.ReactNode",
            description: {
              zh: "尾部插槽（如 Switch、Chip 或辅助元数据）。",
              en: "Trailing slot for controls, badges, or metadata.",
            },
          },
          {
            name: "lines",
            type: "1 | 2 | 3",
            defaultValue: "supportingText ? 2 : 1",
            description: {
              zh: "最小高度行数规格（56px / 72px / 88px）。",
              en: "Minimum height line spec (1-line 56px, 2-line 72px, 3-line 88px).",
            },
          },
          {
            name: "selected",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否处于选中态（四角圆角扩展为 16px 并设置 aria-pressed）。",
              en: "Marks the item selected with aria-pressed and full 16px corners.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用点击与按压物理反馈。",
              en: "Disables interaction and spring press feedback.",
            },
          },
          {
            name: "onClick",
            type: "() => void",
            description: {
              zh: "点击列表项时的回调。",
              en: "Handler invoked when the list item is activated.",
            },
          },
        ],
      },
    ],
  },

  /* -------------------------------- 4. Chip ------------------------------- */
  {
    slug: "chip",
    title: "Chip",
    subtitle: {
      zh: "一个 Chip 覆盖 M3 四种纸片：onClick → assist，selected / onSelectedChange → filter，onRemove → input；tone / variant 为只读标签。",
      en: "One Chip covers the M3 chip types: onClick → assist, selected / onSelectedChange → filter, onRemove → input; tone / variant give a static label.",
    },
    importStatement:
      'import { Chip } from "m3eui";',
    primitive: "@base-ui/react/button · @base-ui/react/toggle",
    scenarios: [
      {
        id: "chip-tones",
        title: {
          zh: "紧凑语义纸片：七种色阶 (Chip)",
          en: "Compact Chip: 7 Semantic Tones",
        },
        description: {
          zh: "默认作为只读语义胶囊渲染，覆盖 neutral、primary、secondary、tertiary 四种主题色与 success、warning、error 三种状态色。",
          en: "Renders static semantic pills across neutral, primary, secondary, tertiary, success, warning, and error tones.",
        },
        code: `import { Chip } from "m3eui";

<div className="demo-row">
  <Chip tone="neutral">Neutral</Chip>
  <Chip tone="primary">Primary</Chip>
  <Chip tone="secondary">Secondary</Chip>
  <Chip tone="tertiary">Tertiary</Chip>
  <Chip tone="success">Success</Chip>
  <Chip tone="warning">Warning</Chip>
  <Chip tone="error">Error</Chip>
</div>`,
        render: () => (
          <div className="demo-row">
            <Chip tone="neutral">Neutral</Chip>
            <Chip tone="primary">Primary</Chip>
            <Chip tone="secondary">Secondary</Chip>
            <Chip tone="tertiary">Tertiary</Chip>
            <Chip tone="success">Success</Chip>
            <Chip tone="warning">Warning</Chip>
            <Chip tone="error">Error</Chip>
          </div>
        ),
      },
      {
        id: "chip-variants-dots",
        title: {
          zh: "填充风格、状态圆点与前置图标",
          en: "Tonal, Outlined, Solid & Status Dots",
        },
        description: {
          zh: "支持 tonal、outlined、solid 三种表面权重，配合 dot 状态点或前置 icon 增强无障碍视觉辨识度。",
          en: "Combine tonal, outlined, or solid fills with 7px status dots or leading icons.",
        },
        code: `import { Chip } from "m3eui";

<div className="demo-row">
  <Chip variant="tonal" tone="primary">Tonal</Chip>
  <Chip variant="outlined" tone="primary">Outlined</Chip>
  <Chip variant="solid" tone="primary">Solid</Chip>
  <Chip tone="success" dot>Operational</Chip>
  <Chip tone="warning" variant="outlined" dot>Degraded</Chip>
  <Chip tone="tertiary" icon={<ShieldCheckIcon size={12} />}>Verified</Chip>
</div>`,
        render: () => (
          <div className="demo-row">
            <Chip variant="tonal" tone="primary">
              Tonal
            </Chip>
            <Chip variant="outlined" tone="primary">
              Outlined
            </Chip>
            <Chip variant="solid" tone="primary">
              Solid
            </Chip>
            <Chip tone="success" dot>
              Operational
            </Chip>
            <Chip tone="warning" variant="outlined" dot>
              Degraded
            </Chip>
            <Chip tone="tertiary" icon={<ShieldCheckIcon size={12} />}>
              Verified
            </Chip>
          </div>
        ),
      },
      {
        id: "chip-removable-clickable",
        title: {
          zh: "尺寸规格、可点击与可移除胶囊",
          en: "Sizes, Interactive onClick & Removable Chips",
        },
        description: {
          zh: "提供 sm (22px) 与 md (26px) 尺寸；传入 onClick 升级为弹性圆角按钮，传入 onRemove 渲染尾部无障碍关闭按钮。",
          en: "Supports sm (22px) and md (26px) heights, spring-animated onClick buttons, and trailing onRemove actions.",
        },
        code: `import { Chip } from "m3eui";

<Chip size="sm" tone="primary">size="sm"</Chip>
<Chip tone="primary" onClick={() => selectTopic("monet")}>Interactive</Chip>
<Chip tone="secondary" onRemove={() => handleRemove(id)}>monet-2025</Chip>`,
        render: () => <ChipStatusDemo />,
      },
      {
        id: "chip-assist",
        title: {
          zh: "辅助动作（assist）",
          en: "Assist & elevated",
        },
        description: {
          zh: "传 onClick 即为辅助动作，也用于建议与快捷回复；浮在媒体上时设 elevated。",
          en: "onClick makes an assist chip, also used for suggestions and quick replies; set elevated over media.",
        },
        code: `import { Chip } from "m3eui";

<div className="demo-row">
  <Chip icon={<SparkleIcon size={15} />}>Summarize Thread</Chip>
  <Chip icon={<EditIcon size={15} />}>Draft Release Notes</Chip>
  <Chip elevated icon={<ShareIcon size={15} />}>Elevated Share</Chip>
  <Chip elevated icon={<DownloadIcon size={15} />}>Export JSON</Chip>
</div>`,
        render: () => (
          <div className="demo-row">
            <Chip icon={<SparkleIcon size={15} />}>Summarize Thread</Chip>
            <Chip icon={<EditIcon size={15} />}>Draft Release Notes</Chip>
            <Chip elevated icon={<ShareIcon size={15} />}>
              Elevated Share
            </Chip>
            <Chip elevated icon={<DownloadIcon size={15} />}>
              Export JSON
            </Chip>
          </div>
        ),
      },
      {
        id: "chip-filter",
        title: {
          zh: "多选筛选（filter）",
          en: "Multi-select filter",
        },
        description: {
          zh: "未选中为 8px 描边，选中后弹簧形变为 16px 胶囊并显示对勾。",
          en: "Morphs from 8px outlined corners to a 16px tonal pill with a checkmark when selected.",
        },
        code: `import { Chip } from "m3eui";

const [filters, setFilters] = React.useState(["spring", "a11y"]);

<Chip
  selected={filters.includes("spring")}
  onSelectedChange={(next) => toggle("spring", next)}
>
  Spring Physics
</Chip>`,
        render: () => <ChipFilterGroupDemo />,
      },
      {
        id: "chip-input",
        title: {
          zh: "可移除输入（input）",
          en: "Removable input",
        },
        description: {
          zh: "传 onRemove 即为输入纸片，用于收件人、评审者等已录入实体，可带 Avatar。",
          en: "onRemove makes an input chip for entered people or entities, optionally with an Avatar.",
        },
        code: `import { Avatar, Chip } from "m3eui";

<Chip
  avatar={<Avatar fallback="LC" size="xs" shape="cookie9Sided" />}
  onRemove={() => removeReviewer("lin")}
>
  Linnea Chen
</Chip>`,
        render: () => <ChipInputListDemo />,
      },
      {
        id: "chip-disabled",
        title: {
          zh: "禁用状态集合",
          en: "Disabled Chip States",
        },
        description: {
          zh: "标签、assist、filter（选中与未选中）与 input 的禁用态。",
          en: "Disabled label, assist, filter (selected and unselected), and input chips.",
        },
        code: `import { Chip } from "m3eui";

<div className="demo-row">
  <Chip disabled tone="primary" onClick={() => {}}>Chip Disabled</Chip>
  <Chip disabled icon={<SparkleIcon size={15} />}>Assist Disabled</Chip>
  <Chip defaultSelected={false} disabled>Filter Unselected</Chip>
  <Chip disabled defaultSelected>Filter Selected</Chip>
  <Chip disabled onRemove={() => {}}>Locked Entity</Chip>
</div>`,
        render: () => (
          <div className="demo-row">
            <Chip disabled tone="primary" onClick={() => {}}>
              Chip Disabled
            </Chip>
            <Chip disabled icon={<SparkleIcon size={15} />}>
              Assist Disabled
            </Chip>
            <Chip defaultSelected={false} disabled>Filter Unselected</Chip>
            <Chip disabled defaultSelected>
              Filter Selected
            </Chip>
            <Chip disabled onRemove={() => {}}>
              Locked Entity
            </Chip>
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "Chip Props",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "胶囊显示文本。",
              en: "Label content of the chip.",
            },
          },
          {
            name: "tone",
            type: '"neutral" | "primary" | "secondary" | "tertiary" | "success" | "warning" | "error"',
            defaultValue: '"neutral"',
            description: {
              zh: "语义色彩主题。",
              en: "Semantic color tone.",
            },
          },
          {
            name: "variant",
            type: '"tonal" | "outlined" | "solid"',
            defaultValue: '"tonal"',
            description: {
              zh: "视觉填充变体。",
              en: "Visual fill and border treatment.",
            },
          },
          {
            name: "size",
            type: '"sm" | "md"',
            defaultValue: '"md"',
            description: {
              zh: "高度规格：sm (22px) 或 md (26px)。",
              en: "Chip height: sm (22px) or md (26px).",
            },
          },
          {
            name: "dot / icon",
            type: "boolean / React.ReactNode",
            defaultValue: "false / undefined",
            description: {
              zh: "前置 7px 状态圆点或自定义图标。",
              en: "Leading 7px status dot or custom icon node.",
            },
          },
          {
            name: "onClick",
            type: "React.MouseEventHandler<HTMLElement>",
            description: {
              zh: "传入时升级为带弹簧按压反馈的无障碍按钮。",
              en: "Upgrades the static pill into a spring-animated button.",
            },
          },
          {
            name: "onRemove / removeLabel",
            type: "(() => void) / string",
            description: {
              zh: "传入 onRemove 时渲染尾部无障碍关闭按钮。",
              en: "Renders a trailing accessible remove button.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用交互或移除按钮。",
              en: "Disables button click or remove interaction.",
            },
          },
        ],
      },
      {
        title: "Chip Props (assist)",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "纸片文本内容。",
              en: "Chip label content.",
            },
          },
          {
            name: "icon",
            type: "React.ReactNode",
            description: {
              zh: "前置 18px 图标插槽。",
              en: "Leading icon element.",
            },
          },
          {
            name: "elevated",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "使用低表面填充色与投影替代描边。",
              en: "Applies surface-container-low fill and elevation shadow instead of an outline.",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否禁用。",
              en: "Disables button interaction.",
            },
          },
          {
            name: "onClick",
            type: "React.MouseEventHandler<HTMLElement>",
            description: {
              zh: "点击回调。",
              en: "Click event handler.",
            },
          },
        ],
      },
      {
        title: "Chip Props (filter)",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "筛选标签文本。",
              en: "Filter chip label.",
            },
          },
          {
            name: "selected",
            type: "boolean",
            description: {
              zh: "受控选中状态。",
              en: "Controlled selected state.",
            },
          },
          {
            name: "defaultSelected",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "非受控初始选中状态。",
              en: "Initial selected state when uncontrolled.",
            },
          },
          {
            name: "onSelectedChange",
            type: "(selected: boolean) => void",
            description: {
              zh: "选中状态切换回调。",
              en: "Called when the toggle state changes.",
            },
          },
          {
            name: "icon",
            type: "React.ReactNode",
            description: {
              zh: "未选中时展示的前置图标（选中后切换为对勾）。",
              en: "Leading icon shown when unselected (replaced by a checkmark when selected).",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "是否禁用。",
              en: "Disables toggle interaction.",
            },
          },
        ],
      },
      {
        title: "Chip Props (input)",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "实体名称文本。",
              en: "Entity label text.",
            },
          },
          {
            name: "avatar",
            type: "React.ReactNode",
            description: {
              zh: "前置紧凑头像节点（推荐 Avatar size=\"xs\"）。",
              en: "Leading avatar node (such as <Avatar size=\"xs\" />).",
            },
          },
          {
            name: "onRemove",
            type: "() => void",
            description: {
              zh: "传入时渲染尾部关闭移除按钮。",
              en: "Renders the trailing remove button and fires when clicked.",
            },
          },
          {
            name: "removeLabel",
            type: "string",
            description: {
              zh: "移除按钮的 aria-label（默认使用本地化内置文案）。",
              en: "Accessible label for the remove button (defaults to localized i18n string).",
            },
          },
          {
            name: "disabled",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "禁用状态。",
              en: "Disables the chip and its remove button.",
            },
          },
        ],
      },
    ],
  },

  /* ------------------------- 5. Avatar & AvatarGroup ---------------------- */
  {
    slug: "avatar",
    title: "Avatar",
    subtitle: {
      zh: "支持 35 种 AOSP 多边形裁切的单体头像 Avatar 与叠放溢出计数头像组 AvatarGroup。",
      en: "Polygon-clipped Avatar and overlapping AvatarGroup with +N overflow.",
    },
    importStatement: 'import { Avatar, AvatarGroup } from "m3eui";',
    primitive: "@base-ui/react/avatar",
    scenarios: [
      {
        id: "avatar-shapes",
        title: {
          zh: "圆形与 M3E 多边形裁切头像",
          en: "Circle & M3E Polygon Shapes",
        },
        description: {
          zh: "shape 属性支持 circle、square 以及任意 M3EShapeName 多边形（如 cookie9Sided、clover8Leaf、pentagon、sunny、pill）。",
          en: "Set shape to circle, square, or any M3EShapeName polygon using automatic SVG clipPath generation.",
        },
        code: `import { Avatar } from "m3eui";

<div className="demo-row">
  <Avatar fallback="CR" size="lg" shape="circle" />
  <Avatar fallback="C9" size="lg" shape="cookie9Sided" />
  <Avatar fallback="CL" size="lg" shape="clover8Leaf" />
  <Avatar fallback="PT" size="lg" shape="pentagon" />
  <Avatar fallback="SN" size="lg" shape="sunny" />
  <Avatar fallback="PL" size="lg" shape="pill" />
</div>`,
        render: () => (
          <div className="demo-row" style={{ gap: 22 }}>
            {(
              [
                { fb: "CR", shape: "circle" },
                { fb: "C9", shape: "cookie9Sided" },
                { fb: "CL", shape: "clover8Leaf" },
                { fb: "PT", shape: "pentagon" },
                { fb: "SN", shape: "sunny" },
                { fb: "PL", shape: "pill" },
              ] as const
            ).map((item) => (
              <div
                key={item.shape}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Avatar fallback={item.fb} size="lg" shape={item.shape} />
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 11,
                    color: "var(--m3e-color-on-surface-variant)",
                  }}
                >
                  {item.shape}
                </span>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "avatar-sizes",
        title: {
          zh: "五级尺寸规格与缩写回退",
          en: "Size Scale & Initials Fallback",
        },
        description: {
          zh: "内置 xs (28px)、sm (36px)、md (44px)、lg (56px)、xl (72px) 五档尺寸，当图片未提供或加载失败时平稳回退至 fallback。",
          en: "Supports xs (28px), sm (36px), md (44px), lg (56px), and xl (72px) token sizes with automatic fallback initials.",
        },
        code: `import { Avatar } from "m3eui";

<div className="demo-row">
  <Avatar size="xs" fallback="XS" />
  <Avatar size="sm" fallback="SM" />
  <Avatar size="md" fallback="MD" shape="cookie9Sided" />
  <Avatar size="lg" fallback="LG" shape="clover8Leaf" />
  <Avatar size="xl" fallback="XL" shape="sunny" />
</div>`,
        render: () => (
          <div className="demo-row" style={{ alignItems: "flex-end", gap: 22 }}>
            {(
              [
                { size: "xs", px: 28, shape: "circle" },
                { size: "sm", px: 36, shape: "circle" },
                { size: "md", px: 44, shape: "cookie9Sided" },
                { size: "lg", px: 56, shape: "clover8Leaf" },
                { size: "xl", px: 72, shape: "sunny" },
              ] as const
            ).map((s) => (
              <div
                key={s.size}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Avatar
                  size={s.size}
                  shape={s.shape}
                  fallback={s.size.toUpperCase()}
                />
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 11,
                    color: "var(--m3e-color-on-surface-variant)",
                  }}
                >
                  {`${s.size} (${s.px}px)`}
                </span>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "avatar-group-overflow",
        title: {
          zh: "叠放头像组与 +N 溢出计数 (AvatarGroup)",
          en: "Overlapping AvatarGroup & +N Overflow",
        },
        description: {
          zh: "超出 max 上限时自动渲染同尺寸同多边形轮廓的本地化 +N 溢出徽标。",
          en: "Automatically collapses excess avatars into a matching +N overflow slot.",
        },
        code: `<AvatarGroup max={4} size="md">
  <Avatar fallback="AL" />
  <Avatar fallback="GH" />
  <Avatar fallback="DK" />
  <Avatar fallback="LT" />
  <Avatar fallback="MR" />
  <Avatar fallback="JS" />
</AvatarGroup>`,
        render: () => (
          <div className="demo-row" style={{ gap: 28 }}>
            <AvatarGroup max={4} size="md">
              <Avatar fallback="AL" />
              <Avatar fallback="GH" />
              <Avatar fallback="DK" />
              <Avatar fallback="LT" />
              <Avatar fallback="MR" />
              <Avatar fallback="JS" />
            </AvatarGroup>
            <AvatarGroup
              max={3}
              size="md"
              shape="cookie9Sided"
              items={[
                { fallback: "M3" },
                { fallback: "UI" },
                { fallback: "HC" },
                { fallback: "SP" },
                { fallback: "RT" },
              ]}
            />
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "Avatar Props",
        rows: [
          {
            name: "fallback",
            type: "React.ReactNode",
            required: true,
            description: {
              zh: "图片未设置或加载失败时展示的缩写字符或图标。",
              en: "Fallback initials or glyph shown when src is absent or fails to load.",
            },
          },
          {
            name: "src",
            type: "string",
            description: {
              zh: "头像图片地址。",
              en: "Image URL for the avatar.",
            },
          },
          {
            name: "alt",
            type: "string",
            defaultValue: '""',
            description: {
              zh: "头像图片替代文本。",
              en: "Accessible alt text for the image.",
            },
          },
          {
            name: "size",
            type: '"xs" | "sm" | "md" | "lg" | "xl"',
            defaultValue: '"md"',
            description: {
              zh: "预设像素尺寸：xs(28)、sm(36)、md(44)、lg(56)、xl(72)。",
              en: "Token size preset: xs (28px), sm (36px), md (44px), lg (56px), xl (72px).",
            },
          },
          {
            name: "shape",
            type: '"circle" | "square" | M3EShapeName',
            defaultValue: '"circle"',
            description: {
              zh: "外轮廓几何形状，支持全部 35 种 M3E 多边形名称。",
              en: "Clipping geometry: circle, rounded square, or any of the 35 M3E polygon names.",
            },
          },
        ],
      },
      {
        title: "AvatarGroup Props",
        rows: [
          {
            name: "items / children",
            type: "readonly M3EAvatarGroupItem[] / React.ReactNode",
            description: {
              zh: "可通过数据数组或 Avatar 子元素传入成员列表。",
              en: "Supply avatars via items array or Avatar children.",
            },
          },
          {
            name: "max / spacing / shape",
            type: 'number / number / "circle" | "square" | M3EShapeName',
            defaultValue: '4 / -0.24 * size / "circle"',
            description: {
              zh: "最大可见头像数、负间距像素值与统一裁切几何轮廓。",
              en: "Visible cap before +N badge, negative overlap px, and shared polygon shape.",
            },
          },
        ],
      },
    ],
  },

  /* -------------------------------- 6. Badge ------------------------------ */
  {
    slug: "badge",
    title: "Badge",
    subtitle: {
      zh: "Material 3 红点与数值通知徽标，支持本地化数字格式化、99+ 封顶溢出、清零隐藏、右上角逻辑锚定与独立行内渲染。",
      en: "Material 3 notification dot and numeric count badge with CLDR numerals, max overflow, RTL logical anchoring, and standalone inline display.",
    },
    importStatement: 'import { Badge } from "m3eui";',
    scenarios: [
      {
        id: "badge-counts",
        title: {
          zh: "数量徽标、99+ 封顶与清零自动隐藏",
          en: "Numeric Counts, 99+ Cap & Zero Auto-Hide",
        },
        description: {
          zh: "自动按当前语言格式化本地数字，超出 max={99} 显示 99+，当 count={0} 时自动隐藏。",
          en: "Formats counts with CLDR numerals, caps overflow at max={99} (99+), and hides automatically when count is 0.",
        },
        code: `import { Badge, IconButton } from "m3eui";

<Badge count={7} color="error">
  <IconButton variant="tonal" icon={<BellIcon />} aria-label="Notifications" />
</Badge>
<Badge count={128} max={99} color="error">
  <IconButton variant="tonal" icon={<SendIcon />} aria-label="Messages" />
</Badge>
<Badge count={0}>
  <IconButton variant="outlined" icon={<CheckTinyIcon />} aria-label="Zero count" />
</Badge>`,
        render: () => <BadgeCountsDemo />,
      },
      {
        id: "badge-dots",
        title: {
          zh: "红点与状态圆点提示",
          en: "Notification Red Dot & Semantic Dots",
        },
        description: {
          zh: "开启 dot 在 IconButton 或多边形 Avatar 逻辑右上角（RTL 下自动镜像至左上角）锚定 8px 未读红点或主题色状态点。",
          en: "Wrap IconButton or Avatar with <Badge dot> for 8px unread indicators that mirror automatically in RTL.",
        },
        code: `import { Avatar, Badge, IconButton } from "m3eui";

<div className="demo-row">
  <Badge dot color="error">
    <IconButton variant="outlined" icon={<BellIcon />} aria-label="Unread alerts" />
  </Badge>
  <Badge dot color="primary">
    <Avatar fallback="MC" size="md" shape="cookie9Sided" />
  </Badge>
  <Badge dot color="secondary">
    <Avatar fallback="OA" size="md" shape="clover8Leaf" />
  </Badge>
</div>`,
        render: () => (
          <div className="demo-row" style={{ gap: 26 }}>
            <Badge dot color="error">
              <IconButton
                variant="outlined"
                icon={<BellIcon size={18} />}
                aria-label="Unread alerts"
              />
            </Badge>
            <Badge dot color="primary">
              <Avatar fallback="MC" size="md" shape="cookie9Sided" />
            </Badge>
            <Badge dot color="secondary">
              <Avatar fallback="OA" size="md" shape="clover8Leaf" />
            </Badge>
          </div>
        ),
      },
      {
        id: "badge-standalone",
        title: {
          zh: "独立行内徽标（无包裹子元素）",
          en: "Standalone Inline Badges",
        },
        description: {
          zh: "省略 children 时直接渲染为行内计数胶囊或 8px 圆点，可直接嵌入列表尾部、菜单项或标签栏。",
          en: "Omit children to render standalone inline count pills or 8px dots inside list rows, tabs, or menus.",
        },
        code: `import { Badge } from "m3eui";

<div className="demo-row">
  <Badge count={8} color="error" />
  <Badge count={128} max={99} color="primary" />
  <Badge count={3} color="secondary" />
  <Badge dot color="error" />
</div>`,
        render: () => (
          <div className="demo-row" style={{ gap: 20 }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              <span>Inbox</span>
              <Badge count={8} color="error" />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              <span>Mentions</span>
              <Badge count={128} max={99} color="primary" />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              <span>Drafts</span>
              <Badge count={3} color="secondary" />
            </span>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13.5 }}>
              <span>Live Sync</span>
              <Badge dot color="error" />
            </span>
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "Badge Props",
        rows: [
          {
            name: "children",
            type: "React.ReactNode",
            description: {
              zh: "被包裹的锚点元素（省略时渲染为独立行内徽标）。",
              en: "Target element to anchor the badge onto (renders standalone if omitted).",
            },
          },
          {
            name: "count",
            type: "number",
            description: {
              zh: "通知数值；小于等于 0 时默认隐藏。",
              en: "Numeric count; automatically hidden when 0 or negative unless dot is true.",
            },
          },
          {
            name: "max",
            type: "number",
            defaultValue: "99",
            description: {
              zh: "最大显示数值，超出显示如 99+。",
              en: "Maximum count threshold before displaying localized overflow (e.g., 99+).",
            },
          },
          {
            name: "dot",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "渲染无数字的 8px 小圆点指示器。",
              en: "Renders an 8px indicator dot without text.",
            },
          },
          {
            name: "hidden",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "强制隐藏徽标。",
              en: "Explicitly hides the badge indicator.",
            },
          },
          {
            name: "color",
            type: '"error" | "primary" | "secondary"',
            defaultValue: '"error"',
            description: {
              zh: "徽标背景语义色。",
              en: "Semantic color role of the badge.",
            },
          },
        ],
      },
    ],
  },

  /* ------------------------------ 7. Carousel ----------------------------- */
  {
    slug: "carousel",
    title: "Carousel",
    subtitle: {
      zh: "按 AOSP keyline 裁切的横向轮播：multi-browse、hero、centered-hero、uncontained。",
      en: "Horizontal carousel masked by AOSP keylines: multi-browse, hero, centered-hero, uncontained.",
    },
    importStatement: 'import { Carousel } from "m3eui";',
    scenarios: [
      {
        id: "carousel-multi-browse",
        title: {
          zh: "多卡片基准线浏览 (Multi-Browse)",
          en: "Multi-Browse Keyline Layout",
        },
        description: {
          zh: "按 AOSP multiBrowseKeylineList 选出大 / 中 / 小项；全部放得下时不显示箭头与指示点。",
          en: "Large, medium, and small items come from AOSP multiBrowseKeylineList. Arrows and markers hide when everything fits.",
        },
        code: `import { Carousel } from "m3eui";

<Carousel
  variant="multi-browse"
  height={220}
  items={slides}
/>`,
        render: () => <CarouselMultiBrowseDemo />,
      },
      {
        id: "carousel-hero",
        title: {
          zh: "主视觉聚光灯模式 (Hero)",
          en: "Hero Spotlight Carousel",
        },
        description: {
          zh: "起始对齐：一个大项加尾端小项，前一项收进起始锚点。需要两侧预览时用 centered-hero。",
          en: "Start-aligned: one large item and a trailing peek; the previous item collapses into the start anchor. Use centered-hero for peeks on both sides.",
        },
        code: `import { Carousel } from "m3eui";

<Carousel
  variant="hero"
  height={252}
  items={heroSlides}
/>`,
        render: () => <CarouselHeroDemo />,
      },
      {
        id: "carousel-centered-uncontained",
        title: {
          zh: "居中聚光灯与无约束流模式 (Centered-Hero & Uncontained)",
          en: "Centered-Hero & Uncontained Variants",
        },
        description: {
          zh: "centered-hero 两侧各露一个小项；uncontained 按 preferredItemWidth 等宽排列。",
          en: "centered-hero shows a small item on each side; uncontained lays out items at preferredItemWidth.",
        },
        code: `<Carousel variant="centered-hero" items={slides} />
<Carousel variant="uncontained" preferredItemWidth={196} items={slides} />`,
        render: () => <CarouselCenteredAndUncontainedDemo />,
      },
    ],
    apis: [
      {
        title: "Carousel Props",
        rows: [
          {
            name: "items",
            type: "readonly CarouselItemSpec[]",
            required: true,
            description: {
              zh: "轮播卡片数据数组（包含 id、title、subtitle、badge、background、content）。",
              en: "Slide descriptors ({ id, title, subtitle, badge, background, content }).",
            },
          },
          {
            name: "variant",
            type: '"multi-browse" | "hero" | "centered-hero" | "uncontained"',
            defaultValue: '"multi-browse"',
            description: {
              zh: "AOSP M3E 视口基准线策略变体。",
              en: "AOSP M3E keyline arrangement strategy.",
            },
          },
          {
            name: "preferredItemWidth",
            type: "number",
            defaultValue: "220",
            description: {
              zh: "大项目标宽度（px）。hero / centered-hero 未设置时取容器宽度。",
              en: "Target large-item width in px. hero / centered-hero default to the container width.",
            },
          },
          {
            name: "activeIndex",
            type: "number",
            description: {
              zh: "受控当前焦点卡片索引。",
              en: "Controlled focal slide index.",
            },
          },
          {
            name: "defaultActiveIndex",
            type: "number",
            defaultValue: "0",
            description: {
              zh: "非受控初始焦点索引。",
              en: "Initial focal slide index when uncontrolled.",
            },
          },
          {
            name: "onActiveIndexChange",
            type: "(index: number) => void",
            description: {
              zh: "焦点卡片切换回调。",
              en: "Callback fired when the active slide changes.",
            },
          },
          {
            name: "height",
            type: "number",
            defaultValue: "240",
            description: {
              zh: "轮播轨道像素高度。",
              en: "Track height in pixels.",
            },
          },
          {
            name: "loop",
            type: "boolean",
            defaultValue: "true",
            description: {
              zh: "当卡片数不少于 3 张时是否允许首尾循环切换。",
              en: "Enables wrap-around navigation when 3 or more items are present.",
            },
          },
          {
            name: "aria-label",
            type: "string",
            description: {
              zh: "轮播区域无障碍标签。",
              en: "Accessible label for the carousel landmark.",
            },
          },
        ],
      },
    ],
  },

  /* -------------------------------- 8. Empty ------------------------------ */
  {
    slug: "empty",
    title: "Empty",
    isNew: true,
    subtitle: {
      zh: "内置 Material 3 Expressive 多边形徽章底座的空状态占位组件，支持自定义恢复操作与紧凑内联布局。",
      en: "Expressive empty state placeholder featuring an AOSP polygon emblem backdrop, custom icons, recovery actions, and compact inline sizing.",
    },
    importStatement: 'import { Empty } from "m3eui";',
    scenarios: [
      {
        id: "empty-default",
        title: {
          zh: "默认多边形空状态",
          en: "Default M3E Polygon Placeholder",
        },
        description: {
          zh: "零配置渲染 cookie9Sided 多边形徽章与内置多语言标题；未显式传入 description 时不输出冗余副标题。",
          en: "Renders a cookie9Sided secondary-container emblem with a localized default title; omits secondary copy unless description is provided.",
        },
        code: `import { Empty } from "m3eui";

<Empty />`,
        render: () => <Empty />,
      },
      {
        id: "empty-actions-shapes",
        title: {
          zh: "切换多边形底座与引导按钮",
          en: "Custom Polygon Shapes & Recovery Actions",
        },
        description: {
          zh: "通过 shape 切换如 sunny、clover8Leaf 等多边形底座，由于底层复用 MaterialShapeView，切换时自动附带物理弹簧形变动画。",
          en: "Customize shape (e.g., sunny or clover8Leaf) and pass primary/secondary recovery buttons to actions.",
        },
        code: `import { Button, Empty } from "m3eui";

<Empty
  shape="sunny"
  title="No automation workflows yet"
  description="Bootstrap a scheduled workflow from a template or connect a repository trigger."
  actions={
    <>
      <Button size="sm" variant="filled">Create Workflow</Button>
      <Button size="sm" variant="outlined">Browse Templates</Button>
    </>
  }
/>`,
        render: () => <EmptyActionsShapesDemo />,
      },
      {
        id: "empty-compact",
        title: {
          zh: "卡片内紧凑内联模式",
          en: "Compact Inline Empty State",
        },
        description: {
          zh: "开启 compact 将多边形徽章缩小至 56px 并收紧内边距，适合嵌入侧边卡片、弹窗或数据表格空行。",
          en: "Set compact to shrink padding and the polygon emblem (56px) for nested cards, popovers, or table slots.",
        },
        code: `import { Card, Empty } from "m3eui";

<Card variant="outlined" title="Pinned Shortcuts">
  <Empty
    compact
    shape="pentagon"
    title="No pinned shortcuts"
    description="Star any command or page to keep it handy here."
  />
</Card>`,
        render: () => (
          <div style={{ maxWidth: 420 }}>
            <Card variant="outlined" title="Pinned Shortcuts">
              <Empty
                compact
                shape="pentagon"
                title="No pinned shortcuts"
                description="Star any command or page to keep it handy here."
              />
            </Card>
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "Empty Props",
        rows: [
          {
            name: "title",
            type: "React.ReactNode",
            description: {
              zh: "主标题文案（默认读取当前语言 empty.title）。",
              en: "Headline text (defaults to localized empty.title).",
            },
          },
          {
            name: "description",
            type: "React.ReactNode",
            description: {
              zh: "辅助说明文案；传 null 可隐藏。",
              en: "Supporting description; pass null to omit.",
            },
          },
          {
            name: "icon",
            type: "React.ReactNode",
            description: {
              zh: "多边形徽章中央的自定义图标。",
              en: "Custom glyph centered inside the polygon emblem.",
            },
          },
          {
            name: "shape",
            type: "M3EShapeName",
            defaultValue: '"cookie9Sided"',
            description: {
              zh: "背景多边形名称（支持全部 35 种 AOSP 多边形）。",
              en: "Backdrop polygon shape from the 35 AOSP shapes.",
            },
          },
          {
            name: "actions",
            type: "React.ReactNode",
            description: {
              zh: "底部恢复或新建操作按钮区域。",
              en: "Action buttons rendered beneath the copy.",
            },
          },
          {
            name: "compact",
            type: "boolean",
            defaultValue: "false",
            description: {
              zh: "紧凑尺寸模式（适用于局部容器或表格空状态）。",
              en: "Reduces padding and emblem size (56px) for inline containers.",
            },
          },
        ],
      },
    ],
  },

  /* ------------------------------ 9. Skeleton ----------------------------- */
  {
    slug: "skeleton",
    title: "Skeleton",
    subtitle: {
      zh: "支持文本、圆形、圆角矩形与全部 35 种多边形轮廓的加载占位骨架屏，自动响应系统减弱动态效果偏好。",
      en: "Layout-preserving loading placeholders supporting text lines, circles, rounded rectangles, and all 35 M3E polygon silhouettes.",
    },
    importStatement: 'import { Skeleton } from "m3eui";',
    scenarios: [
      {
        id: "skeleton-variants",
        title: {
          zh: "基础几何骨架变体",
          en: "Text, Circular & Media Variants",
        },
        description: {
          zh: "提供 text（6px 圆角行）、circular（圆形头像）、rounded（12px 卡片块）与 rectangular（4px 媒体块）四种常规变体。",
          en: "Compose text lines, circular avatars, rounded blocks, and rectangular media placeholders.",
        },
        code: `import { Skeleton } from "m3eui";

<div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}>
  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
    <Skeleton variant="circular" width={44} height={44} />
    <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton variant="text" width="65%" />
      <Skeleton variant="text" width="40%" />
    </div>
  </div>
  <Skeleton variant="rounded" width="100%" height={84} />
  <Skeleton variant="rectangular" width="100%" height={40} />
</div>`,
        render: () => (
          <div style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 380 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <Skeleton variant="circular" width={44} height={44} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                <Skeleton variant="text" width="65%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
            <Skeleton variant="rounded" width="100%" height={84} />
            <Skeleton variant="rectangular" width="100%" height={40} />
          </div>
        ),
      },
      {
        id: "skeleton-shapes",
        title: {
          zh: "M3E 多边形裁切骨架",
          en: "Polygon-Clipped Shape Skeletons",
        },
        description: {
          zh: "传入 shape 属性直接生成对应多边形 SVG 脉冲占位块，确保与多边形 Avatar 或徽章切换至真实内容时零布局偏移。",
          en: "Pass shape to match polygon Avatars and emblems without layout shift when content resolves.",
        },
        code: `import { Skeleton } from "m3eui";

<div className="demo-row">
  <Skeleton shape="cookie9Sided" width={56} />
  <Skeleton shape="clover8Leaf" width={56} />
  <Skeleton shape="arch" width={56} />
  <Skeleton shape="sunny" width={56} />
</div>`,
        render: () => (
          <div className="demo-row" style={{ gap: 22 }}>
            {(["cookie9Sided", "clover8Leaf", "arch", "sunny"] as const).map((s) => (
              <div
                key={s}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                }}
              >
                <Skeleton shape={s} width={56} />
                <span
                  style={{
                    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
                    fontSize: 11,
                    color: "var(--m3e-color-on-surface-variant)",
                  }}
                >
                  {s}
                </span>
              </div>
            ))}
          </div>
        ),
      },
      {
        id: "skeleton-card-composition",
        title: {
          zh: "个人资料卡片平滑加载切换",
          en: "Profile Card Loading Composition",
        },
        description: {
          zh: "演示完整资料卡片从多边形 Skeleton 占位平滑过渡至真实 Avatar、Chip 与指标横幅。",
          en: "Realistic profile card toggling between a composite Skeleton layout and resolved content.",
        },
        code: `import { Avatar, Card, Skeleton, Switch } from "m3eui";

const [loading, setLoading] = React.useState(true);

<Card variant="outlined">
  {loading ? (
    <>
      <Skeleton shape="cookie9Sided" width={52} />
      <Skeleton variant="text" width="58%" />
      <Skeleton variant="rounded" width="100%" height={92} />
    </>
  ) : (
    <ProfileDetails />
  )}
</Card>`,
        render: () => <SkeletonCardCompositionDemo />,
      },
    ],
    apis: [
      {
        title: "Skeleton Props",
        rows: [
          {
            name: "variant",
            type: '"text" | "rectangular" | "rounded" | "circular"',
            defaultValue: '"rounded"',
            description: {
              zh: "未指定 shape 时的基础几何形状。",
              en: "Base placeholder geometry when shape is not set.",
            },
          },
          {
            name: "shape",
            type: "M3EShapeName",
            description: {
              zh: "可选 AOSP 多边形名称；设置后优先渲染多边形 SVG 骨架。",
              en: "Optional AOSP polygon name; renders an SVG polygon skeleton when provided.",
            },
          },
          {
            name: "width",
            type: "number | string",
            description: {
              zh: "宽度（多边形模式下传入数值像素尺寸，默认 56）。",
              en: "Width in px or CSS length (numeric px size in shape mode, default 56).",
            },
          },
          {
            name: "height",
            type: "number | string",
            description: {
              zh: "高度（像素数值或百分比字符串）。",
              en: "Height in px or CSS length.",
            },
          },
          {
            name: "animated",
            type: "boolean",
            defaultValue: "true",
            description: {
              zh: "是否启用柔和透明度脉冲动画。",
              en: "Enables the shimmer/pulse animation.",
            },
          },
        ],
      },
    ],
  },

  /* -------------------------- 10. MaterialShapeView ----------------------- */
  {
    slug: "material-shape",
    title: "MaterialShape",
    subtitle: {
      zh: "AOSP Material Shapes 多边形渲染与形变引擎，支持全部 35 种规范圆角多边形之间的手动插值或二阶物理弹簧平滑过渡。",
      en: "Vector polygon renderer and morph engine supporting manual cubic Bézier scrubbing and spring-driven transitions across all 35 AOSP Material shapes.",
    },
    importStatement: 'import { MaterialShapeView } from "m3eui";',
    scenarios: [
      {
        id: "shape-morph-playground",
        title: {
          zh: "多边形插值进度与弹簧形变实验台",
          en: "Interactive Shape Morph Playground",
        },
        description: {
          zh: "既可通过 shape + toShape + morphProgress 手动逐帧拖动三次贝塞尔形变进度，也可仅切换 shape 交由物理弹簧自动驱动过渡。",
          en: "Scrub morphProgress manually between shape and toShape, or mutate shape directly for automatic spring-driven morphing.",
        },
        code: `import { MaterialShapeView, Slider } from "m3eui";

// 1. Manual scrub between two shapes:
<MaterialShapeView
  shape="cookie9Sided"
  toShape="clover8Leaf"
  morphProgress={progress}
  size={108}
  fill="var(--m3e-color-primary)"
/>

// 2. Automatic analytical spring morph when shape prop changes:
<MaterialShapeView
  shape={activeShape}
  size={108}
  motionToken="defaultSpatial"
  fill="var(--m3e-color-tertiary)"
/>`,
        render: () => <ShapeMorphPlaygroundDemo />,
      },
      {
        id: "shape-gallery-35",
        title: {
          zh: "完整 35 种 AOSP 多边形交互图鉴",
          en: "Complete 35 AOSP Shapes Interactive Gallery",
        },
        description: {
          zh: "展示 M3E_ALL_SHAPE_NAMES 中的全部 35 种规范化圆角多边形，点击任意磁贴即可观察顶部主图形的实时弹簧形变。",
          en: "All 35 normalized shapes in M3E_ALL_SHAPE_NAMES. Click any tile to morph the live specimen above.",
        },
        code: `import { M3E_ALL_SHAPE_NAMES, MaterialShapeView } from "m3eui";

{M3E_ALL_SHAPE_NAMES.map((name) => (
  <MaterialShapeView
    key={name}
    shape={name}
    size={40}
    fill="var(--m3e-color-primary)"
  />
))}`,
        render: () => <ShapeGallery35Demo />,
      },
      {
        id: "shape-custom-fills",
        title: {
          zh: "自定义尺寸、填充色与描边轮廓",
          en: "Custom Sizes, Fills & Stroked Outlines",
        },
        description: {
          zh: "自由指定像素 size、动态主题变量 fill，或结合 fill=\"transparent\" 与 SVG stroke 样式绘制线框多边形。",
          en: "Customize pixel sizes, theme token fills, or combine fill=\"transparent\" with SVG stroke styles for wireframe outlines.",
        },
        code: `import { MaterialShapeView } from "m3eui";

<div className="demo-row">
  <MaterialShapeView shape="sunny" size={44} fill="var(--m3e-color-primary)" />
  <MaterialShapeView shape="clover8Leaf" size={64} fill="var(--m3e-color-tertiary)" />
  <MaterialShapeView shape="gem" size={84} fill="var(--m3e-color-secondary-container)" />
  <MaterialShapeView
    shape="cookie12Sided"
    size={84}
    fill="transparent"
    style={{ stroke: "var(--m3e-color-primary)", strokeWidth: 2.5 }}
  />
  <MaterialShapeView
    shape="heart"
    size={84}
    fill="color-mix(in srgb, var(--m3e-color-error) 18%, transparent)"
    style={{ stroke: "var(--m3e-color-error)", strokeWidth: 2, strokeDasharray: "5 3" }}
  />
</div>`,
        render: () => (
          <div className="demo-row" style={{ gap: 24 }}>
            <MaterialShapeView
              shape="sunny"
              size={44}
              fill="var(--m3e-color-primary)"
            />
            <MaterialShapeView
              shape="clover8Leaf"
              size={64}
              fill="var(--m3e-color-tertiary)"
            />
            <MaterialShapeView
              shape="gem"
              size={84}
              fill="var(--m3e-color-secondary-container)"
            />
            <MaterialShapeView
              shape="cookie12Sided"
              size={84}
              fill="transparent"
              style={{
                stroke: "var(--m3e-color-primary)",
                strokeWidth: 2.5,
              }}
            />
            <MaterialShapeView
              shape="heart"
              size={84}
              fill="color-mix(in srgb, var(--m3e-color-error) 18%, transparent)"
              style={{
                stroke: "var(--m3e-color-error)",
                strokeWidth: 2,
                strokeDasharray: "5 3",
              }}
            />
          </div>
        ),
      },
    ],
    apis: [
      {
        title: "MaterialShapeView Props",
        rows: [
          {
            name: "shape",
            type: "M3EShapeName",
            required: true,
            description: {
              zh: "当前多边形名称（未提供 toShape 时，更新此属性将自动触发弹簧形变）。",
              en: "Active polygon shape name (changing this prop triggers a spring morph when toShape is omitted).",
            },
          },
          {
            name: "toShape",
            type: "M3EShapeName",
            description: {
              zh: "手动进度模式下的目标多边形名称（需配合 morphProgress 使用）。",
              en: "Target shape name for manual progress interpolation (used together with morphProgress).",
            },
          },
          {
            name: "morphProgress",
            type: "number",
            description: {
              zh: "手动形变进度（0 到 1 之间，支持弹簧超调数值）。",
              en: "Manual interpolation progress between shape (0) and toShape (1).",
            },
          },
          {
            name: "size",
            type: "number",
            defaultValue: "64",
            description: {
              zh: "SVG 视口宽高像素值。",
              en: "Width and height of the SVG viewport in pixels.",
            },
          },
          {
            name: "scaleFactor",
            type: "number",
            defaultValue: "0.88",
            description: {
              zh: "多边形相对于视口的缩放比例（预留弹簧欠阻尼超调边距）。",
              en: "Polygon scale factor inside the viewport to leave headroom for spring overshoot.",
            },
          },
          {
            name: "motionToken",
            type: "MotionTokenKey",
            defaultValue: '"defaultSpatial"',
            description: {
              zh: "自动形变使用的物理弹簧令牌（如 fastSpatial、defaultSpatial、slowSpatial）。",
              en: "Spring physics token used during automatic shape transitions.",
            },
          },
          {
            name: "fill",
            type: "string",
            defaultValue: '"currentColor"',
            description: {
              zh: "SVG path 填充颜色或 CSS 变量。",
              en: "SVG path fill value (supports CSS custom properties).",
            },
          },
          {
            name: "aria-label",
            type: "string",
            description: {
              zh: "传入时赋予图形 role=\"img\"，省略时默认 aria-hidden。",
              en: "Sets role=\"img\" with an accessible label; defaults to aria-hidden when omitted.",
            },
          },
        ],
      },
    ],
  },
];
