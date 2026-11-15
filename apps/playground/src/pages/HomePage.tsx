import * as React from "react";
import { Link, useNavigate, useOutletContext } from "react-router";
import type { M3EShapeName } from "m3eui/tokens";
import {
  Alert,
  AlertDialog,
  AlertDialogClose,
  AssistChip,
  AvatarGroup,
  Badge,
  Breadcrumb,
  Button,
  ButtonGroup,
  Card,
  Chip,
  CircularWavyProgressIndicator,
  ColorPicker,
  ColorPickerField,
  ContextMenu,
  CopyButton,
  DataTable,
  DateRangePickerField,
  DockedToolbar,
  Empty,
  FAB,
  Fieldset,
  FileUpload,
  FilterChip,
  FloatingToolbar,
  Form,
  IconToggleButton,
  Kbd,
  LinearWavyProgressIndicator,
  LoadingIndicator,
  type M3EDataTableColumn,
  type M3EDataTableSortState,
  type M3EUploadFileItem,
  MaterialShapeView,
  Menubar,
  Meter,
  NavigationSuite,
  type NavigationSuiteLayout,
  NumberField,
  OTPField,
  Pagination,
  type PlainDateRange,
  SearchBar,
  Select,
  SideSheet,
  Skeleton,
  Slider,
  Snippet,
  SplitButton,
  Switch,
  TextField,
  TimePickerField,
  ToggleButton,
  Tooltip,
  useM3E,
  useM3EToast,
} from "m3eui";
import { useCopyResolver, usePlaygroundStrings } from "../i18n";
import {
  BarChartIcon,
  DownloadIcon,
  EditIcon,
  FolderIcon,
  GITHUB_REPO_URL,
  GitHubIcon,
  HeartIcon,
  HomeGlyph,
  SearchIcon,
  SettingsGearIcon,
  ShareIcon,
  ShieldCheckIcon,
  SparkleIcon,
  TrashIcon,
} from "../layout/Icons";
import type { SiteOutletContext } from "../layout/SiteLayout";
import { SeedSwatchDot } from "../layout/ThemeStudioSheet";
import { BLOCKS_REGISTRY } from "../registry/blocks";
import {
  ALL_COMPONENT_DOCS,
  COMPONENT_CATEGORY_ORDER,
  COMPONENTS_BY_CATEGORY,
} from "../registry/components";

const HERO_SHAPES: readonly M3EShapeName[] = [
  "cookie9Sided",
  "clover8Leaf",
  "sunny",
  "softBoom",
  "pentagon",
  "pill",
];

interface EdgeNodeRow {
  readonly id: string;
  readonly service: string;
  readonly region: string;
  readonly status: "healthy" | "syncing" | "degraded";
  readonly p99Ms: number;
}

const EDGE_NODE_ROWS: readonly EdgeNodeRow[] = [
  { id: "edge-01", service: "HCT Token CDN", region: "ap-northeast-1", status: "healthy", p99Ms: 14 },
  { id: "edge-02", service: "Spring ODE Engine", region: "us-west-2", status: "healthy", p99Ms: 18 },
  { id: "edge-03", service: "Polygon SVG Edge", region: "eu-central-1", status: "syncing", p99Ms: 29 },
  { id: "edge-04", service: "BiDi Locale Sync", region: "ap-east-1", status: "degraded", p99Ms: 78 },
  { id: "edge-05", service: "WCAG Audit Gate", region: "us-east-1", status: "healthy", p99Ms: 16 },
];

interface WorkspaceAsset {
  readonly id: string;
  readonly title: string;
  readonly group: string;
  readonly shape: M3EShapeName;
}

const INITIAL_WORKSPACE_ASSETS: readonly WorkspaceAsset[] = [
  { id: "ast-1", title: "Button Corner Topology", group: "m3e.actions", shape: "cookie9Sided" },
  { id: "ast-2", title: "HCT SPEC_2025 Ramp", group: "m3e.color", shape: "clover8Leaf" },
  { id: "ast-3", title: "Spatial Spring Presets", group: "m3e.motion", shape: "sunny" },
  { id: "ast-4", title: "BiDi Logical Matrix", group: "m3e.i18n", shape: "pentagon" },
];

const HeroBannerSection = React.memo(function HeroBannerSection({
  openStudio,
  openCommandPalette,
}: {
  readonly openStudio: () => void;
  readonly openCommandPalette: () => void;
}) {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const navigate = useNavigate();
  const [heroShapeIdx, setHeroShapeIdx] = React.useState(0);
  const currentHeroShape = HERO_SHAPES[heroShapeIdx % HERO_SHAPES.length]!;

  return (
    <Card variant="filled" className="docs-hero-card">
      <div className="docs-hero__top">
        <div className="docs-hero__copy">
          <div className="docs-hero__chips">
            <Chip tone="primary" icon={<SparkleIcon size={13} />}>
              Material 3 Expressive · SPEC 2025
            </Chip>
            <Chip tone="secondary" variant="outlined">
              {ALL_COMPONENT_DOCS.length} {ui.navComponents} · {BLOCKS_REGISTRY.length} Blocks
            </Chip>
          </div>

          <h1 className="docs-hero__title">{ui.heroTitle}</h1>
          <p className="docs-hero__desc">{ui.heroDesc}</p>

          <div className="demo-row" style={{ gap: 10, paddingTop: 4 }}>
            <SplitButton
              size="md"
              variant="filled"
              leadingIcon={<SparkleIcon size={16} />}
              onClick={() => navigate("/components/button")}
              menuTriggerLabel={ui.browseComponentsBtn}
              menuItems={[
                {
                  id: "jump-actions",
                  label: ui.componentCategories.actions,
                  shortcut: "G A",
                  onSelect: () => navigate("/components/button"),
                },
                {
                  id: "jump-inputs",
                  label: ui.componentCategories.inputs,
                  shortcut: "G I",
                  onSelect: () => navigate("/components/color-picker"),
                },
                {
                  id: "jump-display",
                  label: ui.componentCategories.display,
                  shortcut: "G D",
                  onSelect: () => navigate("/components/data-table"),
                },
                {
                  id: "jump-nav",
                  label: ui.componentCategories.navigation,
                  shortcut: "G N",
                  onSelect: () => navigate("/components/command-palette"),
                },
              ]}
            >
              {ui.browseComponentsBtn}
            </SplitButton>

            <Button
              variant="tonal"
              size="md"
              onClick={() => navigate("/blocks")}
            >
              {ui.browseBlocksBtn}
            </Button>

            <Button
              variant="outlined"
              size="md"
              leadingIcon={<SearchIcon size={15} />}
              onClick={openCommandPalette}
            >
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span>{resolve({ zh: "快速检索", en: "Quick Jump" })}</span>
                <Kbd size="sm" keys={["mod", "k"]} />
              </span>
            </Button>

            <Button
              variant="outlined"
              size="md"
              href={GITHUB_REPO_URL}
              target="_blank"
              rel="noopener noreferrer"
              leadingIcon={<GitHubIcon size={16} />}
            >
              GitHub
            </Button>

            <Button variant="text" size="md" onClick={openStudio}>
              {ui.openStudioBtn}
            </Button>
          </div>

          <div className="docs-hero__install-row">
            <Snippet code="pnpm add m3eui" className="docs-hero__snippet" />
            <Snippet code="npx m3eui init" className="docs-hero__snippet" />
          </div>
        </div>

        <Tooltip content={ui.switchPolygonTooltip}>
          <Card
            variant="outlined"
            interactive
            className="docs-hero__emblem"
            onClick={() => setHeroShapeIdx((i) => i + 1)}
          >
            <div className="docs-hero__emblem-mark">
              <MaterialShapeView
                shape={currentHeroShape}
                size={88}
                fill="var(--m3e-color-primary)"
              />
              <span className="docs-hero__emblem-glyph" aria-hidden="true">
                M3
              </span>
            </div>
            <span className="docs-hero__emblem-caption">
              {currentHeroShape}
            </span>
          </Card>
        </Tooltip>
      </div>
    </Card>
  );
});

const BentoThemeStudioCard = React.memo(function BentoThemeStudioCard() {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const {
    seedHex,
    setSeedHex,
    schemeVariant,
    setSchemeVariant,
    motionSchemeName,
    setMotionSchemeName,
  } = useM3E();

  const [draftSeedHex, setDraftSeedHex] = React.useState(seedHex);
  const latestDraftRef = React.useRef(seedHex);
  const isDraggingRangeRef = React.useRef(false);

  React.useEffect(() => {
    latestDraftRef.current = seedHex;
    setDraftSeedHex(seedHex);
  }, [seedHex]);

  React.useEffect(() => {
    const flushDragCommit = () => {
      if (!isDraggingRangeRef.current) return;
      isDraggingRangeRef.current = false;
      const committed = latestDraftRef.current;
      React.startTransition(() => {
        setSeedHex(committed);
      });
    };
    window.addEventListener("pointerup", flushDragCommit, true);
    window.addEventListener("pointercancel", flushDragCommit, true);
    return () => {
      window.removeEventListener("pointerup", flushDragCommit, true);
      window.removeEventListener("pointercancel", flushDragCommit, true);
    };
  }, [setSeedHex]);

  const handleSeedCommit = React.useCallback(
    (nextHex: string) => {
      latestDraftRef.current = nextHex;
      setDraftSeedHex(nextHex);
      if (!isDraggingRangeRef.current) {
        React.startTransition(() => {
          setSeedHex(nextHex);
        });
      }
    },
    [setSeedHex],
  );

  const seeds = React.useMemo(
    () => [
      { hex: "#6750A4", name: ui.seedPurple },
      { hex: "#0B6B58", name: ui.seedJade },
      { hex: "#1A73E8", name: ui.seedOcean },
      { hex: "#B3261E", name: ui.seedVermilion },
      { hex: "#7D5260", name: ui.seedRose },
    ],
    [ui.seedJade, ui.seedOcean, ui.seedPurple, ui.seedRose, ui.seedVermilion],
  );

  return (
    <Card variant="outlined" className="m3e-bento-card m3e-bento-card--wide">
      <div className="m3e-bento-card__head">
        <strong>
          {resolve({
            zh: "HCT 动态色板与弹簧物理工作台",
            en: "HCT Brand Studio & Spring Physics",
          })}
        </strong>
        <Link to="/components/color-picker" className="m3e-inline-more-link">
          ColorPicker →
        </Link>
      </div>

      <div className="m3e-bento-color-split">
        <div className="m3e-bento-stack">
          <div className="demo-row" style={{ gap: 8 }}>
            {seeds.map((s) => (
              <ToggleButton
                key={s.hex}
                size="xs"
                variant="outlined"
                shape="square"
                pressed={draftSeedHex.toLowerCase() === s.hex.toLowerCase()}
                leadingIcon={<SeedSwatchDot hex={s.hex} />}
                onPressedChange={() => {
                  isDraggingRangeRef.current = false;
                  latestDraftRef.current = s.hex;
                  setDraftSeedHex(s.hex);
                  setSeedHex(s.hex);
                }}
              >
                {s.name}
              </ToggleButton>
            ))}
          </div>

          <ColorPickerField
            label={resolve({ zh: "全局 HCT 种子色", en: "Global HCT Seed" })}
            value={draftSeedHex}
            onValueChange={handleSeedCommit}
          />

          <ButtonGroup
            variant="connected"
            size="xs"
            selectionMode="single"
            aria-label="Scheme variant"
            items={[
              { value: "expressive", label: "Expressive" },
              { value: "tonalSpot", label: "TonalSpot" },
              { value: "vibrant", label: "Vibrant" },
              { value: "neutral", label: "Neutral" },
            ]}
            value={[schemeVariant]}
            onValueChange={(vals) => {
              if (vals[0]) setSchemeVariant(vals[0] as typeof schemeVariant);
            }}
          />

          <Switch
            showIcons
            checked={motionSchemeName === "expressive"}
            onCheckedChange={(v) =>
              setMotionSchemeName(v ? "expressive" : "standard")
            }
            label={ui.expressiveSpringLabel}
          />

          <Snippet code={`npx m3eui init --seed "${draftSeedHex}"`} />
        </div>

        <div
          className="m3e-bento-color-picker-wrap"
          onPointerDownCapture={(e) => {
            const target = e.target as HTMLElement | null;
            if (target instanceof HTMLInputElement && target.type === "range") {
              isDraggingRangeRef.current = true;
            }
          }}
        >
          <ColorPicker
            value={draftSeedHex}
            onValueChange={handleSeedCommit}
            className="m3e-bento-color-picker"
          />
        </div>
      </div>
    </Card>
  );
});

const BentoPasskeyCard = React.memo(function BentoPasskeyCard() {
  const resolve = useCopyResolver();
  const { toast } = useM3EToast();
  const [liked, setLiked] = React.useState(true);
  const [workspaceDomain, setWorkspaceDomain] = React.useState("aurora");
  const [otpCode, setOtpCode] = React.useState("202588");
  const authScore = Math.min(
    100,
    Math.round((otpCode.length / 6) * 72 + (workspaceDomain ? 28 : 0)),
  );

  return (
    <Card variant="outlined" className="m3e-bento-card">
      <div className="m3e-bento-card__head">
        <strong>
          {resolve({
            zh: "通行密钥、强度表与 2FA 验证",
            en: "Passkey, Meter & 2FA OTP",
          })}
        </strong>
        <Link to="/components/otp-field" className="m3e-inline-more-link">
          OTPField →
        </Link>
      </div>

      <div className="demo-row" style={{ justifyContent: "space-between", gap: 8 }}>
        <AssistChip
          icon={<ShieldCheckIcon size={14} />}
          onClick={() =>
            toast({
              type: "success",
              title: resolve({ zh: "FIDO2 通行密钥已就绪", en: "FIDO2 Passkey ready" }),
            })
          }
        >
          FIDO2 Passkey
        </AssistChip>

        <Badge count={liked ? 9 : 8} color="primary">
          <IconToggleButton
            variant="outlined"
            size="xs"
            pressed={liked}
            onPressedChange={setLiked}
            aria-label="Bookmark"
            icon={<HeartIcon filled={liked} size={15} />}
          />
        </Badge>
      </div>

      <TextField
        label={resolve({ zh: "工作区域名", en: "Workspace URL" })}
        prefixText="https://"
        suffixText=".m3e.app"
        value={workspaceDomain}
        onValueChange={setWorkspaceDomain}
        clearable
      />

      <div className="m3e-bento-otp-box">
        <OTPField
          length={6}
          separatorAfterIndex={2}
          value={otpCode}
          onValueChange={setOtpCode}
        />
      </div>

      <Meter
        value={authScore}
        label={resolve({ zh: "会话信任等级", en: "Session assurance" })}
        valueText={`${authScore}%`}
      />

      <div className="demo-row" style={{ justifyContent: "space-between", gap: 8 }}>
        <SplitButton
          size="sm"
          variant="filled"
          disabled={otpCode.length < 6}
          onClick={() =>
            toast({
              type: "success",
              title: resolve({ zh: "二步验证通过", en: "2FA session verified" }),
            })
          }
          menuTriggerLabel="2FA options"
          menuItems={[
            {
              id: "resend-otp",
              label: resolve({ zh: "重新填充验证码", en: "Refill OTP code" }),
              shortcut: "⌘R",
              onSelect: () => setOtpCode("202588"),
            },
            {
              id: "clear-otp",
              label: resolve({ zh: "清空验证码", en: "Clear OTP digits" }),
              onSelect: () => setOtpCode(""),
            },
          ]}
        >
          {resolve({ zh: "验证会话", en: "Verify 2FA" })}
        </SplitButton>

        <CopyButton value={`https://${workspaceDomain || "app"}.m3e.app`} variant="tonal" />
      </div>
    </Card>
  );
});

const BentoDataExplorerCard = React.memo(function BentoDataExplorerCard() {
  const resolve = useCopyResolver();
  const { toast } = useM3EToast();
  const [tableQuery, setTableQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<"all" | EdgeNodeRow["status"]>("all");
  const [tableLoading, setTableLoading] = React.useState(false);
  const [selectedRows, setSelectedRows] = React.useState<string[]>(["edge-01", "edge-02"]);
  const [tableSort, setTableSort] = React.useState<M3EDataTableSortState | null>({
    columnId: "p99Ms",
    direction: "ascending",
  });
  const [tablePage, setTablePage] = React.useState(1);

  const filteredTableRows = React.useMemo(() => {
    const q = tableQuery.trim().toLowerCase();
    return EDGE_NODE_ROWS.filter((r) => {
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      if (!q) return true;
      return (
        r.service.toLowerCase().includes(q) ||
        r.region.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q)
      );
    });
  }, [statusFilter, tableQuery]);

  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(filteredTableRows.length / pageSize));
  const safePage = Math.min(tablePage, totalPages);
  const visibleRows = filteredTableRows.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize,
  );

  const tableColumns = React.useMemo<readonly M3EDataTableColumn<EdgeNodeRow>[]>(
    () => [
      {
        id: "service",
        header: resolve({ zh: "边缘服务", en: "Service" }),
        isRowHeader: true,
        sortable: true,
        sortAccessor: (r) => r.service,
        cell: (r) => <strong style={{ fontSize: 13 }}>{r.service}</strong>,
      },
      {
        id: "region",
        header: resolve({ zh: "可用区", en: "Region" }),
        cell: (r) => (
          <code style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
            {r.region}
          </code>
        ),
      },
      {
        id: "status",
        header: resolve({ zh: "状态", en: "Health" }),
        cell: (r) => (
          <Chip
            size="sm"
            dot
            tone={
              r.status === "healthy"
                ? "success"
                : r.status === "syncing"
                  ? "primary"
                  : "warning"
            }
          >
            {r.status === "healthy"
              ? resolve({ zh: "正常", en: "Healthy" })
              : r.status === "syncing"
                ? resolve({ zh: "同步中", en: "Syncing" })
                : resolve({ zh: "降级", en: "Degraded" })}
          </Chip>
        ),
      },
      {
        id: "p99Ms",
        header: "P99",
        align: "end",
        sortable: true,
        sortAccessor: (r) => r.p99Ms,
        cell: (r) => (
          <span style={{ fontVariantNumeric: "tabular-nums", fontWeight: 600 }}>
            {r.p99Ms} ms
          </span>
        ),
      },
    ],
    [resolve],
  );

  return (
    <Card variant="outlined" className="m3e-bento-card m3e-bento-card--wide">
      <div className="m3e-bento-card__head">
        <Breadcrumb
          separator="chevron"
          items={[
            { key: "root", label: "m3eui", icon: <HomeGlyph size={13} /> },
            { key: "clusters", label: resolve({ zh: "边缘集群", en: "Clusters" }) },
            { key: "nodes", label: resolve({ zh: "节点检索", en: "Edge Explorer" }) },
          ]}
        />
        <div className="demo-row" style={{ gap: 12 }}>
          <Switch
            checked={tableLoading}
            onCheckedChange={setTableLoading}
            label="Skeleton"
          />
          <Link to="/components/data-table" className="m3e-inline-more-link">
            DataTable →
          </Link>
        </div>
      </div>

      <div className="demo-row" style={{ justifyContent: "space-between", gap: 10 }}>
        <div style={{ flex: "1 1 220px", maxInlineSize: 340 }}>
          <SearchBar
            size="sm"
            value={tableQuery}
            onValueChange={(v) => {
              setTableQuery(v);
              setTablePage(1);
            }}
            placeholder={resolve({ zh: "检索服务或可用区…", en: "Filter service or region…" })}
            trailingSlot={<Kbd size="sm" keys={["/"]} />}
          />
        </div>

        <div className="demo-row" style={{ gap: 6 }}>
          {(["all", "healthy", "syncing", "degraded"] as const).map((st) => (
            <FilterChip
              key={st}
              selected={statusFilter === st}
              onSelectedChange={() => {
                setStatusFilter(st);
                setTablePage(1);
              }}
            >
              {st === "all"
                ? resolve({ zh: "全部", en: "All" })
                : st === "healthy"
                  ? resolve({ zh: "正常", en: "Healthy" })
                  : st === "syncing"
                    ? resolve({ zh: "同步中", en: "Syncing" })
                    : resolve({ zh: "降级", en: "Degraded" })}
            </FilterChip>
          ))}
        </div>
      </div>

      {tableLoading ? (
        <div className="m3e-bento-stack">
          <Skeleton variant="rounded" height={34} />
          <Skeleton variant="text" />
          <Skeleton variant="text" width="86%" />
        </div>
      ) : (
        <DataTable
          caption="Edge cluster nodes"
          hideCaption
          selectable
          selectedRowKeys={selectedRows}
          onSelectedRowKeysChange={setSelectedRows}
          sort={tableSort}
          onSortChange={setTableSort}
          columns={tableColumns}
          rows={visibleRows}
          getRowKey={(r) => r.id}
          emptyMessage={
            <Empty
              compact
              title={resolve({ zh: "未匹配到边缘节点", en: "No matching nodes" })}
              actions={
                <Button
                  size="xs"
                  variant="tonal"
                  onClick={() => {
                    setTableQuery("");
                    setStatusFilter("all");
                  }}
                >
                  {resolve({ zh: "重置", en: "Reset" })}
                </Button>
              }
            />
          }
          footer={
            <Pagination
              page={safePage}
              totalPages={totalPages}
              totalItems={filteredTableRows.length}
              pageSize={pageSize}
              showSummary
              size="sm"
              onPageChange={setTablePage}
            />
          }
        />
      )}

      <div className="m3e-bento-bulk-bar">
        {selectedRows.length > 0 ? (
          <>
            <Chip tone="primary">
              {resolve({
                zh: `已选中 ${selectedRows.length} 项`,
                en: `${selectedRows.length} selected`,
              })}
            </Chip>

            <FloatingToolbar
              theme="vibrant"
              aria-label="Bulk node actions"
              items={[
                {
                  id: "sync",
                  label: resolve({ zh: "触发同步", en: "Sync" }),
                  icon: <SparkleIcon size={18} />,
                  selected: true,
                  onClick: () =>
                    toast({
                      type: "success",
                      title: resolve({
                        zh: `已同步 ${selectedRows.length} 个边缘节点`,
                        en: `Synced ${selectedRows.length} node(s)`,
                      }),
                    }),
                },
                {
                  id: "export",
                  label: resolve({ zh: "导出快照", en: "Export CSV" }),
                  icon: <DownloadIcon size={18} />,
                  onClick: () =>
                    toast({
                      title: resolve({ zh: "已导出遥测 CSV", en: "Exported telemetry CSV" }),
                    }),
                },
                {
                  id: "clear",
                  label: resolve({ zh: "清空选择", en: "Clear selection" }),
                  icon: <TrashIcon size={18} />,
                  separatorBefore: true,
                  onClick: () => setSelectedRows([]),
                },
              ]}
              companionFab={
                <FAB
                  size="sm"
                  icon={<ShareIcon size={18} />}
                  aria-label="Broadcast"
                  onClick={() =>
                    toast({
                      title: resolve({ zh: "已广播集群配置", en: "Broadcasted cluster config" }),
                    })
                  }
                />
              }
            />
          </>
        ) : (
          <Button
            size="xs"
            variant="tonal"
            onClick={() => setSelectedRows(["edge-01", "edge-02"])}
          >
            {resolve({
              zh: "勾选表格行以唤醒批量悬浮工具栏",
              en: "Select rows to reveal Bulk FloatingToolbar",
            })}
          </Button>
        )}
      </div>
    </Card>
  );
});

const BentoWavyMediaCard = React.memo(function BentoWavyMediaCard() {
  const resolve = useCopyResolver();
  const [playing, setPlaying] = React.useState(true);
  const [progress, setProgress] = React.useState(68);
  const [actionGroup, setActionGroup] = React.useState<string[]>(["spatial", "morph"]);

  return (
    <Card variant="filled" className="m3e-bento-card">
      <div className="m3e-bento-card__head">
        <strong>
          {resolve({
            zh: "波浪进度、多边形与空间滑块",
            en: "Wavy Media, Polygons & Slider",
          })}
        </strong>
        <Link to="/components/progress-meter" className="m3e-inline-more-link">
          WavyProgress →
        </Link>
      </div>

      <div className="demo-row" style={{ justifyContent: "space-between", gap: 12 }}>
        <AvatarGroup
          size="sm"
          shape="clover8Leaf"
          max={3}
          items={[
            { id: "a1", fallback: "M3" },
            { id: "a2", fallback: "UI" },
            { id: "a3", fallback: "HC" },
            { id: "a4", fallback: "+2" },
          ]}
        />
        <div className="demo-row" style={{ gap: 10 }}>
          <CircularWavyProgressIndicator
            value={progress}
            paused={!playing}
            size={40}
            aria-label="Circular wavy progress"
          />
          <LoadingIndicator contained size={40} />
        </div>
      </div>

      <LinearWavyProgressIndicator
        value={progress}
        paused={!playing}
        aria-label="Linear wavy progress"
      />

      <Slider
        size="sm"
        min={0}
        max={100}
        value={progress}
        onValueChange={(val) => {
          if (typeof val === "number") setProgress(val);
        }}
        showValueBubble
        aria-label="Wave progress"
      />

      <ButtonGroup
        variant="standard"
        size="xs"
        selectionMode="multiple"
        aria-label="Spring channels"
        items={[
          { value: "spatial", label: "Spatial" },
          { value: "effects", label: "Effects" },
          { value: "morph", label: "Morph" },
        ]}
        value={actionGroup}
        onValueChange={setActionGroup}
      />

      <div className="demo-row" style={{ justifyContent: "space-between" }}>
        <ToggleButton
          size="xs"
          variant="tonal"
          pressed={playing}
          onPressedChange={setPlaying}
        >
          {playing
            ? resolve({ zh: "波浪运行中", en: "Wave Active" })
            : resolve({ zh: "已暂停", en: "Paused" })}
        </ToggleButton>
        <Chip tone="primary" size="sm">
          {progress}%
        </Chip>
      </div>
    </Card>
  );
});

const BentoWorkspaceCard = React.memo(function BentoWorkspaceCard() {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const { toast } = useM3EToast();
  const { seedHex } = useM3E();
  const [suiteMode, setSuiteMode] = React.useState<NavigationSuiteLayout>("auto");
  const [navDest, setNavDest] = React.useState("tokens");
  const [dockTool, setDockTool] = React.useState("grid");
  const [assets, setAssets] = React.useState<readonly WorkspaceAsset[]>(INITIAL_WORKSPACE_ASSETS);
  const [inspecting, setInspecting] = React.useState<WorkspaceAsset | null>(null);
  const [inspectTitle, setInspectTitle] = React.useState("");
  const [confirmArchive, setConfirmArchive] = React.useState<WorkspaceAsset | null>(null);

  const openInspector = React.useCallback((asset: WorkspaceAsset) => {
    setInspecting(asset);
    setInspectTitle(asset.title);
  }, []);

  const menubarMenus = React.useMemo(
    () => [
      {
        id: "file",
        label: resolve({ zh: "文件", en: "File" }),
        items: [
          {
            id: "new-spec",
            label: resolve({ zh: "新建令牌草稿", en: "New Token Draft" }),
            shortcut: "⌘N",
            onSelect: () =>
              toast({ title: resolve({ zh: "已新建令牌草稿", en: "Created token draft" }) }),
          },
          {
            id: "restore-assets",
            label: resolve({ zh: "重置示例资产", en: "Reset Sample Assets" }),
            shortcut: "⇧⌘R",
            onSelect: () => setAssets(INITIAL_WORKSPACE_ASSETS),
          },
        ],
      },
      {
        id: "view",
        label: resolve({ zh: "视图", en: "View" }),
        items: [
          {
            id: "layout-auto",
            label: "Auto",
            shortcut: "⌘1",
            onSelect: () => setSuiteMode("auto"),
          },
          {
            id: "layout-rail",
            label: "Rail",
            shortcut: "⌘2",
            onSelect: () => setSuiteMode("rail"),
          },
          {
            id: "layout-bar",
            label: "Bar",
            shortcut: "⌘3",
            onSelect: () => setSuiteMode("bar"),
          },
        ],
      },
    ],
    [resolve, toast],
  );

  return (
    <>
      <Card variant="outlined" className="m3e-bento-card m3e-bento-card--wide">
        <div className="m3e-bento-card__head">
          <Menubar
            menus={menubarMenus}
            aria-label={resolve({ zh: "工作区菜单栏", en: "Workspace menubar" })}
          />

          <div className="demo-row" style={{ gap: 10 }}>
            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              aria-label="NavigationSuite layout"
              items={[
                { value: "auto", label: "Auto" },
                { value: "rail", label: "Rail" },
                { value: "bar", label: "Bar" },
              ]}
              value={[suiteMode]}
              onValueChange={(vals) => {
                const next = vals[0] as NavigationSuiteLayout | undefined;
                if (next) setSuiteMode(next);
              }}
            />
            <Link to="/components/navigation" className="m3e-inline-more-link">
              NavigationSuite →
            </Link>
          </div>
        </div>

        <NavigationSuite
          layout={suiteMode}
          value={navDest}
          onValueChange={setNavDest}
          className="m3e-bento-suite"
          items={[
            {
              value: "tokens",
              label: resolve({ zh: "令牌", en: "Tokens" }),
              icon: <SparkleIcon size={18} />,
              badgeCount: assets.length,
            },
            {
              value: "components",
              label: resolve({ zh: "组件", en: "Library" }),
              icon: <FolderIcon size={18} />,
            },
            {
              value: "audits",
              label: resolve({ zh: "门禁", en: "Audits" }),
              icon: <ShieldCheckIcon size={18} />,
              badgeDot: true,
            },
            {
              value: "settings",
              label: resolve({ zh: "设置", en: "Config" }),
              icon: <SettingsGearIcon size={18} />,
            },
          ]}
        >
          <div className="m3e-bento-suite__canvas">
            <div className="m3e-bento-asset-grid">
              {assets.map((asset) => (
                <ContextMenu
                  key={asset.id}
                  items={[
                    {
                      id: "inspect",
                      label: resolve({ zh: "打开属性抽屉", en: "Inspect in SideSheet" }),
                      shortcut: "⌘I",
                      icon: <EditIcon size={14} />,
                      onSelect: () => openInspector(asset),
                    },
                    {
                      id: "share",
                      label: resolve({ zh: "复制令牌路径", en: "Copy Token Path" }),
                      shortcut: "⌘C",
                      icon: <ShareIcon size={14} />,
                      onSelect: () =>
                        toast({ title: `${asset.group} · ${asset.title}` }),
                    },
                    {
                      id: "archive",
                      label: resolve({ zh: "归档资产", en: "Archive Asset" }),
                      shortcut: "⌫",
                      danger: true,
                      separatorBefore: true,
                      icon: <TrashIcon size={14} />,
                      onSelect: () => setConfirmArchive(asset),
                    },
                  ]}
                >
                  <div>
                    <Card
                      variant="outlined"
                      interactive
                      className="m3e-bento-asset-card"
                      onClick={() => openInspector(asset)}
                    >
                      <div className="m3e-bento-asset-row">
                        <MaterialShapeView
                          shape={asset.shape}
                          size={32}
                          fill="var(--m3e-color-secondary-container)"
                        />
                        <div className="m3e-bento-asset-meta">
                          <strong>{asset.title}</strong>
                          <span>{asset.group}</span>
                        </div>
                      </div>
                    </Card>
                  </div>
                </ContextMenu>
              ))}
            </div>
          </div>

          <DockedToolbar
            elevated={false}
            aria-label="Workspace tools"
            items={[
              {
                id: "grid",
                label: "Grid",
                icon: <FolderIcon size={17} />,
                selected: dockTool === "grid",
                onClick: () => setDockTool("grid"),
              },
              {
                id: "metrics",
                label: "Metrics",
                icon: <BarChartIcon size={17} />,
                selected: dockTool === "metrics",
                onClick: () => setDockTool("metrics"),
              },
              {
                id: "audit",
                label: "WCAG",
                icon: <ShieldCheckIcon size={17} />,
                selected: dockTool === "audit",
                onClick: () => setDockTool("audit"),
              },
            ]}
            primaryAction={
              assets[0] ? (
                <Button
                  size="xs"
                  variant="tonal"
                  leadingIcon={<EditIcon size={13} />}
                  onClick={() => openInspector(assets[0]!)}
                >
                  SideSheet
                </Button>
              ) : undefined
            }
          />
        </NavigationSuite>
      </Card>

      <SideSheet
        open={inspecting !== null}
        onOpenChange={(open) => {
          if (!open) setInspecting(null);
        }}
        title={inspecting?.title ?? resolve({ zh: "资产检查器", en: "Asset Inspector" })}
        description={inspecting ? `${inspecting.group} · ${seedHex.toUpperCase()}` : undefined}
        footer={
          <Button
            size="sm"
            variant="filled"
            fullWidth
            onClick={() => {
              if (inspecting && inspectTitle.trim()) {
                setAssets((prev) =>
                  prev.map((a) =>
                    a.id === inspecting.id ? { ...a, title: inspectTitle.trim() } : a,
                  ),
                );
              }
              setInspecting(null);
              toast({
                type: "success",
                title: resolve({ zh: "资产属性已更新", en: "Asset properties updated" }),
              });
            }}
          >
            {ui.done}
          </Button>
        }
      >
        {inspecting ? (
          <div className="m3e-bento-stack">
            <TextField
              label={resolve({ zh: "资产名称", en: "Asset Title" })}
              value={inspectTitle}
              onValueChange={setInspectTitle}
              clearable
            />
            <Snippet code={`import { ${inspecting.shape} } from "m3eui/tokens";`} />
            <Alert
              severity="success"
              variant="tonal"
              title={resolve({
                zh: "逻辑属性与 RTL 双向镜像已自动就绪",
                en: "CSS logical properties & RTL mirroring active",
              })}
            />
          </div>
        ) : null}
      </SideSheet>

      <AlertDialog
        open={confirmArchive !== null}
        onOpenChange={(open) => {
          if (!open) setConfirmArchive(null);
        }}
        title={resolve({ zh: "确认归档该资产？", en: "Archive this asset?" })}
        description={
          confirmArchive
            ? resolve({
                zh: `「${confirmArchive.title}」将从工作区移除，可通过通知栏一键撤销。`,
                en: `"${confirmArchive.title}" will be archived with instant Undo support.`,
              })
            : undefined
        }
        actions={
          <>
            <AlertDialogClose
              render={
                <Button variant="text">{resolve({ zh: "取消", en: "Cancel" })}</Button>
              }
            />
            <Button
              variant="filled"
              intent="danger"
              onClick={() => {
                const target = confirmArchive;
                setConfirmArchive(null);
                if (!target) return;
                setAssets((prev) => prev.filter((a) => a.id !== target.id));
                toast({
                  title: resolve({
                    zh: `已归档 ${target.title}`,
                    en: `Archived ${target.title}`,
                  }),
                  actionLabel: resolve({ zh: "撤销", en: "Undo" }),
                  onAction: () => {
                    setAssets((prev) =>
                      prev.some((a) => a.id === target.id) ? prev : [...prev, target],
                    );
                  },
                });
              }}
            >
              {resolve({ zh: "确认归档", en: "Archive" })}
            </Button>
          </>
        }
      />
    </>
  );
});

const BentoRolloutCard = React.memo(function BentoRolloutCard() {
  const resolve = useCopyResolver();
  const { toast } = useM3EToast();
  const [rolloutWindow, setRolloutWindow] = React.useState<PlainDateRange>({
    start: "2026-11-16",
    end: "2026-11-20",
  });
  const [releaseTime, setReleaseTime] = React.useState("14:30");
  const [canaryPct, setCanaryPct] = React.useState<number | null>(25);
  const [region, setRegion] = React.useState("ap-east");
  const [artifacts, setArtifacts] = React.useState<M3EUploadFileItem[]>([
    {
      id: "art-1",
      name: "m3e-theme.css",
      size: 14_280,
      status: "completed",
    },
  ]);

  return (
    <Card variant="outlined" className="m3e-bento-card">
      <div className="m3e-bento-card__head">
        <strong>
          {resolve({
            zh: "灰度发布窗口与产物上传",
            en: "Release Rollout & FileUpload",
          })}
        </strong>
        <Link to="/components/file-upload" className="m3e-inline-more-link">
          FileUpload →
        </Link>
      </div>

      <Form
        onSubmit={(e) => {
          e.preventDefault();
          toast({
            type: "success",
            title: resolve({
              zh: "灰度发布计划已生效",
              en: "Canary rollout scheduled",
            }),
            description: `${region} · ${canaryPct ?? 0}% · ${releaseTime}`,
          });
        }}
      >
        <Fieldset
          variant="plain"
          legend={resolve({ zh: "发布参数与构建包", en: "Rollout Gate & Bundle" })}
        >
          <div className="m3e-bento-stack">
            <DateRangePickerField
              label={resolve({ zh: "灰度日期窗口", en: "Rollout Window" })}
              value={rolloutWindow}
              onValueChange={setRolloutWindow}
            />

            <div className="m3e-bento-inputs-grid">
              <TimePickerField
                label={resolve({ zh: "变更时刻", en: "Window Time" })}
                value={releaseTime}
                onValueChange={setReleaseTime}
              />

              <NumberField
                label={resolve({ zh: "金丝雀 (%)", en: "Canary (%)" })}
                min={5}
                max={100}
                step={5}
                value={canaryPct}
                onValueChange={setCanaryPct}
              />
            </div>

            <Select
              label={resolve({ zh: "目标区域", en: "Edge Region" })}
              value={region}
              onValueChange={(v) => {
                if (v) setRegion(v);
              }}
              options={[
                { value: "ap-east", label: "Asia Pacific · Tokyo" },
                { value: "us-west", label: "US West · Oregon" },
                { value: "eu-central", label: "EU Central · Zurich" },
              ]}
            />

            <FileUpload
              accept=".css,.json,.tgz,.svg"
              maxFiles={3}
              value={artifacts}
              onValueChange={setArtifacts}
            />

            <Button type="submit" variant="filled" size="sm" fullWidth>
              {resolve({ zh: "提交灰度发布", en: "Schedule Rollout" })}
            </Button>
          </div>
        </Fieldset>
      </Form>
    </Card>
  );
});

const BlocksDirectorySection = React.memo(function BlocksDirectorySection() {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const navigate = useNavigate();
  const { direction } = useM3E();
  const inlineArrow = direction === "rtl" ? "←" : "→";

  return (
    <section className="m3e-home-directory">
      <div className="m3e-home-directory__head">
        <h2 className="m3e-section-heading" style={{ margin: 0 }}>
          Blocks ({BLOCKS_REGISTRY.length})
        </h2>
        <Button
          variant="tonal"
          size="sm"
          onClick={() => navigate("/blocks")}
        >
          {ui.browseBlocksBtn} {inlineArrow}
        </Button>
      </div>

      <div className="m3e-home-blocks-grid">
        {BLOCKS_REGISTRY.map((blk) => (
          <Card
            key={blk.slug}
            variant="outlined"
            interactive
            className="m3e-home-block-card"
            onClick={() => navigate(`/blocks#${blk.slug}`)}
          >
            <div className="m3e-home-block-card__top">
              <Chip tone="primary" size="sm">
                {ui.blockCategories[blk.category]}
              </Chip>
              <code className="m3e-home-block-card__slug">{blk.slug}</code>
            </div>
            <strong className="m3e-home-block-card__title">
              {resolve(blk.title)}
            </strong>
            <p className="m3e-home-block-card__desc">
              {resolve(blk.description)}
            </p>
          </Card>
        ))}
      </div>
    </section>
  );
});

const ComponentsDirectorySection = React.memo(function ComponentsDirectorySection() {
  const ui = usePlaygroundStrings();
  const navigate = useNavigate();
  const { direction } = useM3E();
  const inlineArrow = direction === "rtl" ? "←" : "→";

  return (
    <section className="m3e-home-directory">
      <div className="m3e-home-directory__head">
        <h2 className="m3e-section-heading" style={{ margin: 0 }}>
          {ui.navComponents} ({ALL_COMPONENT_DOCS.length})
        </h2>
        <Button
          variant="tonal"
          size="sm"
          onClick={() => navigate("/components/button")}
        >
          {ui.browseComponentsBtn} {inlineArrow}
        </Button>
      </div>

      <div className="m3e-category-cards-grid">
        {COMPONENT_CATEGORY_ORDER.map((cat) => {
          const list = COMPONENTS_BY_CATEGORY[cat];
          return (
            <Card key={cat} variant="outlined" className="m3e-category-card">
              <div className="m3e-category-card__head">
                <strong>{ui.componentCategories[cat]}</strong>
                <Chip tone="secondary" size="sm">
                  {list.length}
                </Chip>
              </div>
              <div className="m3e-category-card__pills">
                {list.map((doc) => (
                  <Button
                    key={doc.slug}
                    size="xs"
                    variant="outlined"
                    shape="square"
                    render={<Link to={`/components/${doc.slug}`} />}
                  >
                    <span className="m3e-comp-pill__inner">
                      <span>{doc.title}</span>
                      {doc.isNew ? (
                        <Chip tone="primary" variant="solid" size="sm">
                          NEW
                        </Chip>
                      ) : null}
                    </span>
                  </Button>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
});

export function HomePage() {
  const { openStudio, openCommandPalette } = useOutletContext<SiteOutletContext>();

  return (
    <div className="m3e-home-container">
      <HeroBannerSection
        openStudio={openStudio}
        openCommandPalette={openCommandPalette}
      />

      <section aria-label="Interactive Composite Showcase" className="m3e-bento-grid">
        <BentoThemeStudioCard />
        <BentoPasskeyCard />
        <BentoDataExplorerCard />
        <BentoWavyMediaCard />
        <BentoWorkspaceCard />
        <BentoRolloutCard />
      </section>

      <BlocksDirectorySection />
      <ComponentsDirectorySection />
    </div>
  );
}
