import * as React from "react";
import { Link } from "react-router";
import {
  type ColorSchemeVariant,
  M3E_ALL_SHAPE_NAMES,
  type M3EShapeName,
} from "m3eui/tokens";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  Chip,
  ColorPicker,
  DataTable,
  Fieldset,
  Form,
  type M3EBuiltInLocale,
  type M3EDataTableColumn,
  MaterialShapeView,
  Pagination,
  Popover,
  SearchBar,
  Select,
  Snippet,
  Switch,
  TextField,
  useM3E,
  useM3EI18n,
  useM3EToast,
} from "m3eui";
import { useCopyResolver, usePlaygroundStrings } from "../i18n";
import { CodeBlock } from "../layout/CodeBlock";
import { AOSP_SCHEME_OPTIONS, SeedSwatchDot } from "../layout/ThemeStudioSheet";
import { COMPONENT_CATALOG } from "./catalog";
import { loadComponentMatrixData } from "./loaders";
import type {
  DesignProvenanceKind,
  DocGuideSpec,
} from "./types";

function LiveThemingGuideWidget() {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const {
    seedHex,
    setSeedHex,
    schemeVariant,
    setSchemeVariant,
    contrastLevel,
    setContrastLevel,
    exportConfigJson,
  } = useM3E();
  const { toast } = useM3EToast();

  const surfaceTokens = [
    {
      name: "surface-container-lowest",
      css: "var(--m3e-color-surface-container-lowest)",
      fg: "var(--m3e-color-on-surface)",
    },
    {
      name: "surface-container-low",
      css: "var(--m3e-color-surface-container-low)",
      fg: "var(--m3e-color-on-surface)",
    },
    {
      name: "surface-container",
      css: "var(--m3e-color-surface-container)",
      fg: "var(--m3e-color-on-surface)",
    },
    {
      name: "surface-container-high",
      css: "var(--m3e-color-surface-container-high)",
      fg: "var(--m3e-color-on-surface)",
    },
    {
      name: "surface-container-highest",
      css: "var(--m3e-color-surface-container-highest)",
      fg: "var(--m3e-color-on-surface)",
    },
    {
      name: "primary-container",
      css: "var(--m3e-color-primary-container)",
      fg: "var(--m3e-color-on-primary-container)",
    },
  ];

  const seeds = [
    { hex: "#6750A4", label: ui.seedPurple },
    { hex: "#0B6B58", label: ui.seedJade },
    { hex: "#1A73E8", label: ui.seedOcean },
    { hex: "#B3261E", label: ui.seedVermilion },
    { hex: "#7D5260", label: ui.seedRose },
  ];

  const isPresetSeed = seeds.some(
    (s) => s.hex.toLowerCase() === seedHex.toLowerCase(),
  );

  const contrastItems = [
    { value: "0", label: ui.contrastStandard },
    { value: "0.5", label: ui.contrastMedium },
    { value: "1", label: ui.contrastHigh },
  ];

  return (
    <div className="doc-prose-stack">
      <div className="demo-panel">
        <div className="demo-row" style={{ gap: 8 }}>
          {seeds.map((s) => {
            const selected = seedHex.toLowerCase() === s.hex.toLowerCase();
            return (
              <Button
                key={s.hex}
                size="xs"
                variant="outlined"
                shape="square"
                pressed={selected}
                onPressedChange={() => setSeedHex(s.hex)}
                leadingIcon={<SeedSwatchDot hex={s.hex} />}
              >
                {s.label}
              </Button>
            );
          })}

          <Popover
            aria-label={ui.seedCustomAria}
            side="bottom"
            align="start"
            trigger={
              <Button
                size="xs"
                variant={!isPresetSeed ? "filled" : "outlined"}
                shape={!isPresetSeed ? "round" : "square"}
                aria-label={ui.seedCustomAria}
                leadingIcon={
                  <span
                    className="studio-custom-swatch"
                    style={{ backgroundColor: seedHex }}
                    aria-hidden="true"
                  />
                }
              >
                {!isPresetSeed ? seedHex.toUpperCase() : ui.seedCustom}
              </Button>
            }
          >
            <ColorPicker
              value={seedHex}
              onValueChange={setSeedHex}
            />
          </Popover>
        </div>

        <div className="doc-theming-controls">
          <Select
            labelPosition="outside"
            label={ui.schemeSelectLabel}
            value={schemeVariant}
            onValueChange={(v) => {
              if (v) {
                setSchemeVariant(v as ColorSchemeVariant);
              }
            }}
            options={AOSP_SCHEME_OPTIONS}
          />

          <div className="docs-studio-field">
            <span className="docs-studio-field__label">{ui.contrastLabel}</span>
            <ButtonGroup
              variant="connected"
              size="sm"
              selectionMode="single"
              className="studio-segmented"
              aria-label={ui.contrastLabel}
              items={contrastItems}
              value={[String(contrastLevel)]}
              onValueChange={(vals) => {
                const next = vals[0];
                if (next !== undefined) {
                  setContrastLevel(Number(next));
                }
              }}
            />
          </div>
        </div>

        <div className="surface-ramp">
          {surfaceTokens.map((tok) => (
            <div
              key={tok.name}
              className="doc-swatch-tile"
              style={{ backgroundColor: tok.css, color: tok.fg }}
            >
              <code>{tok.name}</code>
            </div>
          ))}
        </div>

        <div className="demo-row" style={{ justifyContent: "space-between" }}>
          <span className="demo-panel__label">
            SPEC 2025 · {schemeVariant} · contrast {contrastLevel} · {seedHex.toUpperCase()}
          </span>
          <Button
            size="xs"
            variant="tonal"
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(exportConfigJson());
              } catch {
                // ignore
              }
              toast({ title: ui.copiedM3eJsonToast });
            }}
          >
            {ui.copyM3eJson}
          </Button>
        </div>
      </div>

      <CodeBlock
        code={exportConfigJson()}
        lang="json"
        title="m3e.json"
        showHeader
        showCopyButton
      />
      <p className="doc-prose-p">
        {resolve({
          zh: "上方配置可直接保存为项目根目录的 m3e.json，运行 npx m3eui sync 即可生成静态零运行时开销的 CSS 自定义属性。",
          en: "Save the exported JSON as m3e.json in your project root and run npx m3eui sync to pre-generate zero-runtime CSS custom properties.",
        })}
      </p>
    </div>
  );
}

function LiveSpringAndShapesGuideWidget() {
  const resolve = useCopyResolver();
  const { motionSchemeName, setMotionSchemeName, playbackRate, setPlaybackRate } = useM3E();
  const [idx, setIdx] = React.useState(0);
  const shapes: readonly M3EShapeName[] = [
    "cookie9Sided",
    "clover8Leaf",
    "sunny",
    "arch",
    "pentagon",
    "pill",
    "pixelCircle",
    "verySunny",
  ];
  const prevShape = shapes[(idx + shapes.length - 1) % shapes.length]!;
  const currShape = shapes[idx % shapes.length]!;

  return (
    <div className="demo-panel">
      <div className="demo-row" style={{ justifyContent: "space-between" }}>
        <div className="demo-row" style={{ gap: 20 }}>
          <MaterialShapeView
            shape={currShape}
            size={84}
          />
          <div style={{ display: "grid", gap: 6 }}>
            <strong>
              {prevShape} → {currShape}
            </strong>
            <span className="demo-panel__label">
              {resolve({
                zh: `共内置 ${M3E_ALL_SHAPE_NAMES.length} 种 AOSP 圆角多边形，支持三次贝塞尔顶点对齐插值。`,
                en: `Includes all ${M3E_ALL_SHAPE_NAMES.length} AOSP RoundedPolygon shapes with cubic Bézier vertex-matched morphing.`,
              })}
            </span>
            <div className="demo-row" style={{ gap: 8 }}>
              <Button size="xs" variant="filled" onClick={() => setIdx((i) => i + 1)}>
                {resolve({ zh: "触发形变", en: "Morph Next Shape" })}
              </Button>
            </div>
          </div>
        </div>

        <div style={{ display: "grid", gap: 10 }}>
          <Switch
            checked={motionSchemeName === "expressive"}
            onCheckedChange={(v) => setMotionSchemeName(v ? "expressive" : "standard")}
            label={resolve({ zh: "Expressive 弹性阻尼", en: "Expressive underdamped spring" })}
          />
          <Switch
            checked={playbackRate < 1}
            onCheckedChange={(v) => setPlaybackRate(v ? 0.25 : 1)}
            label={resolve({ zh: "0.25x 慢动作观测", en: "0.25x slow-motion physics" })}
          />
        </div>
      </div>
    </div>
  );
}

function LiveI18nGuideWidget() {
  const resolve = useCopyResolver();
  const { locale, setLocale, direction, setDirectionMode } = useM3E();
  const { messages } = useM3EI18n();
  const [page, setPage] = React.useState(3);

  return (
    <div className="demo-panel">
      <div className="demo-row" style={{ justifyContent: "space-between" }}>
        <ButtonGroup
          variant="connected"
          size="xs"
          selectionMode="single"
          aria-label="Locale"
          items={[
            { value: "en-US", label: "English (en-US)" },
            { value: "zh-CN", label: "简体中文 (zh-CN)" },
            { value: "ja-JP", label: "日本語 (ja-JP)" },
            { value: "ar-SA", label: "العربية (ar-SA · RTL)" },
          ]}
          value={[locale]}
          onValueChange={(vals) => {
            const next = vals[0] as M3EBuiltInLocale | undefined;
            if (next) {
              setDirectionMode("auto");
              setLocale(next);
            }
          }}
        />
        <Chip tone="primary">
          {locale} · {direction.toUpperCase()} · {Object.keys(messages).length} keys
        </Chip>
      </div>

      <Pagination
        page={page}
        totalPages={9}
        totalItems={180}
        pageSize={20}
        showSummary
        onPageChange={setPage}
      />

      <span className="demo-panel__label">
        {resolve({
          zh: "切换至 العربية (ar-SA) 可实时体验 RTL 逻辑属性翻转、方向性箭头镜像与阿拉伯-印度数字格式化。",
          en: "Switch to العربية (ar-SA) to inspect automatic RTL logical layout mirroring, directional chevrons, and Arabic-Indic numerals.",
        })}
      </span>
    </div>
  );
}

function IntroDocContent() {
  const resolve = useCopyResolver();
  const { messages } = useM3EI18n();
  const localeKeyCount = Object.keys(messages).length;
  return (
    <div className="doc-prose-stack">
      <section id="philosophy" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "设计理念", en: "Design Philosophy" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "m3eui 是面向现代 Web 的 Material 3 Expressive (M3E) React 组件库，将 Android AOSP HCT 动态色彩、二阶解析弹簧微分方程与 35 种圆角多边形几何拓扑与 @base-ui/react 无障碍原语结合。",
            en: "m3eui brings Android AOSP Material 3 Expressive HCT dynamic color, analytical second-order spring physics, and 35 RoundedPolygon geometries to React on top of @base-ui/react primitives.",
          })}
        </p>
        <Alert
          severity="info"
          title={resolve({
            zh: "单运行时依赖与零第三方样式耦合",
            en: "Single Runtime Dependency",
          })}
        >
          {resolve({
            zh: "色彩算法 (Monet SPEC_2025)、弹簧求解器与多边形插值器均内置于 m3eui/tokens，唯一运行时依赖为 @base-ui/react。",
            en: "Monet SPEC_2025 color math, spring physics, and polygon morphing live inside m3eui/tokens with @base-ui/react as the sole runtime dependency.",
          })}
        </Alert>
      </section>

      <section id="architecture" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "分层架构", en: "Layered Architecture" })}</h2>
        <div className="demo-grid-2">
          <Card variant="outlined" title="m3eui/tokens">
            <p className="doc-prose-p">
              {resolve({
                zh: "CAM16/HCT 色彩空间、9 套动态调色方案 (Expressive / TonalSpot / Vibrant 等)、解析物理弹簧与 35 种矢量圆角多边形。",
                en: "CAM16/HCT color space, 9 dynamic schemes (Expressive, TonalSpot, Vibrant, etc.), analytical spring solver, and 35 RoundedPolygons.",
              })}
            </p>
          </Card>
          <Card variant="outlined" title="m3eui/primitives & components">
            <p className="doc-prose-p">
              {resolve({
                zh: `${COMPONENT_CATALOG.length} 组组件模块，覆盖 AOSP M3E 标准组件与桌面 Web 无头原语适配组件。`,
                en: `${COMPONENT_CATALOG.length} component modules spanning official AOSP M3E specs and desktop Web adaptations.`,
              })}
            </p>
          </Card>
          <Card variant="outlined" title="m3eui/i18n">
            <p className="doc-prose-p">
              {resolve({
                zh: `内置 zh-CN、en-US、ja-JP、ar-SA 词条包（${localeKeyCount} 键同构），支持 BCP 47 语言链回退、ICU 复数与自动 RTL 镜像。`,
                en: `Built-in zh-CN, en-US, ja-JP, and ar-SA packs (${localeKeyCount}-key parity) with BCP 47 fallback chains, pluralization, and automatic RTL.`,
              })}
            </p>
          </Card>
          <Card variant="outlined" title="m3eui CLI">
            <p className="doc-prose-p">
              {resolve({
                zh: "提供 init、sync、locale 与 doctor 四大命令，支持构建期生成 CSS 变量与 CI 国际化静态审计。",
                en: "Includes init, sync, locale, and doctor commands for static CSS token generation and CI i18n compliance checks.",
              })}
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
}

interface ProvenanceRow {
  readonly slug: string;
  readonly title: string;
  readonly provenance: DesignProvenanceKind;
  readonly aospSources: readonly string[];
  readonly primitive?: string;
  readonly tokenSources: readonly string[];
}

function ComponentMatrixDocContent() {
  const resolve = useCopyResolver();
  const [filter, setFilter] = React.useState<"all" | DesignProvenanceKind>("all");
  const [query, setQuery] = React.useState("");
  const [allRows, setAllRows] = React.useState<readonly ProvenanceRow[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let cancelled = false;
    loadComponentMatrixData().then(({ docs, specs }) => {
      if (cancelled) return;
      setAllRows(
        docs.map((doc) => {
          const spec = specs[doc.slug];
          return {
            slug: doc.slug,
            title: doc.title,
            provenance: spec?.provenance ?? "m3e-web-adaptation",
            aospSources: spec?.aospSources ?? [],
            primitive: doc.primitive,
            tokenSources: spec?.tokenSources ?? [],
          };
        }),
      );
      setIsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const officialCount = React.useMemo(
    () => allRows.filter((r) => r.provenance === "official-m3e").length,
    [allRows],
  );
  const webCount = allRows.length - officialCount;

  const filteredRows = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return allRows.filter((row) => {
      if (filter !== "all" && row.provenance !== filter) return false;
      if (!q) return true;
      return (
        row.title.toLowerCase().includes(q) ||
        row.slug.toLowerCase().includes(q) ||
        row.aospSources.some((s) => s.toLowerCase().includes(q)) ||
        (row.primitive?.toLowerCase().includes(q) ?? false)
      );
    });
  }, [allRows, filter, query]);

  const columns = React.useMemo<readonly M3EDataTableColumn<ProvenanceRow>[]>(
    () => [
      {
        id: "component",
        header: resolve({ zh: "组件模块", en: "Component" }),
        isRowHeader: true,
        sortable: true,
        sortAccessor: (r) => r.title,
        cell: (row) => (
          <Link
            to={`/components/${row.slug}`}
            style={{
              color: "var(--m3e-color-primary)",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            {row.title}
          </Link>
        ),
      },
      {
        id: "provenance",
        header: resolve({ zh: "规范归属", en: "Provenance" }),
        sortable: true,
        sortAccessor: (r) => r.provenance,
        cell: (row) =>
          row.provenance === "official-m3e" ? (
            <Chip tone="primary" variant="tonal" size="sm">
              {resolve({ zh: "AOSP M3E 标准", en: "AOSP M3E" })}
            </Chip>
          ) : (
            <Chip tone="neutral" variant="outlined" size="sm">
              {resolve({ zh: "Web 衍生适配", en: "Web Adaptation" })}
            </Chip>
          ),
      },
      {
        id: "sources",
        header: resolve({ zh: "AOSP 源码 / Web 原语", en: "AOSP Source / Web Primitive" }),
        cell: (row) => (
          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
            {row.aospSources.length > 0 ? (
              <code style={{ fontSize: 12 }}>
                {row.aospSources.slice(0, 2).join(", ")}
              </code>
            ) : null}
            {row.primitive ? (
              <span style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
                {row.primitive}
              </span>
            ) : null}
          </div>
        ),
      },
      {
        id: "spec",
        header: resolve({ zh: "设计契约", en: "Design Spec" }),
        align: "end",
        cell: (row) => (
          <Link
            to={`/components/${row.slug}?tab=design`}
            style={{
              fontSize: 12.5,
              color: "var(--m3e-color-primary)",
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            {resolve({ zh: "查看规范 →", en: "Spec →" })}
          </Link>
        ),
      },
    ],
    [resolve],
  );

  return (
    <div className="doc-prose-stack">
      <section id="summary" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "溯源分类统计", en: "Provenance Breakdown" })}</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 12 }}>
          <Card variant="outlined" title={`${allRows.length}`}>
            <p className="doc-prose-p">
              {resolve({
                zh: "组件总数",
                en: "Total components",
              })}
            </p>
          </Card>
          <Card variant="filled" title={`${officialCount}`}>
            <p className="doc-prose-p">
              {resolve({
                zh: "AOSP M3E 官方标准组件 — 直接对应 androidx.compose.material3 规范与几何/弹簧令牌",
                en: "Official AOSP M3E components — mapped directly to androidx.compose.material3 specs and tokens.",
              })}
            </p>
          </Card>
          <Card variant="outlined" title={`${webCount}`}>
            <p className="doc-prose-p">
              {resolve({
                zh: "M3E Web 衍生适配组件 — 针对桌面与 Web 场景基于 @base-ui/react 与 --m3e-* 令牌补齐",
                en: "M3E Web adaptations — desktop & web patterns built on @base-ui/react and --m3e-* tokens.",
              })}
            </p>
          </Card>
        </div>
      </section>

      <section id="matrix" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "全量组件对照表", en: "Component Provenance Matrix" })}</h2>
        <DataTable
          caption={resolve({ zh: "m3eui 组件规范溯源矩阵", en: "m3eui Component Provenance Matrix" })}
          hideCaption
          density="compact"
          loading={isLoading}
          loadingRows={8}
          rows={filteredRows}
          getRowKey={(r) => r.slug}
          columns={columns}
          toolbar={
            <div className="demo-row" style={{ width: "100%", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
              <ButtonGroup
                variant="connected"
                size="xs"
                selectionMode="single"
                aria-label={resolve({ zh: "按规范来源筛选", en: "Filter by provenance" })}
                items={[
                  {
                    value: "all",
                    label: resolve({
                      zh: `全部 (${allRows.length})`,
                      en: `All (${allRows.length})`,
                    }),
                  },
                  {
                    value: "official-m3e",
                    label: resolve({
                      zh: `AOSP M3E 标准 (${officialCount})`,
                      en: `AOSP M3E (${officialCount})`,
                    }),
                  },
                  {
                    value: "m3e-web-adaptation",
                    label: resolve({
                      zh: `Web 衍生 (${webCount})`,
                      en: `Web Adaptation (${webCount})`,
                    }),
                  },
                ]}
                value={[filter]}
                onValueChange={(vals) => {
                  const next = vals[0] as "all" | DesignProvenanceKind | undefined;
                  if (next) setFilter(next);
                }}
              />
              <SearchBar
                value={query}
                onValueChange={setQuery}
                placeholder={resolve({
                  zh: "搜索组件名、Compose 源码或原语…",
                  en: "Filter component, AOSP file, or primitive…",
                })}
                style={{ minWidth: 240, flex: "1 1 240px", maxWidth: 340 }}
              />
            </div>
          }
        />
      </section>

      <section id="boundary" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "收敛边界原则", en: "Scope & Boundary Principles" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "核心库坚持最小正交集：能通过现有原语属性表达的能力绝不拆分为冗余组件（例如静态标签直接复用不传 onClick/onRemove 的只读 Chip + tone，多选直接用 Select / Combobox 的 multiple）；强业务流程型复杂控件（如穿梭框、产品导览、级联选择器等）不进入核心包，可在应用层基于 m3eui 组件自由组合。",
            en: "Core exports stay orthogonal: capabilities expressible via existing props never become redundant components (e.g., static tags use non-interactive Chip + tone; multi-value inputs use Select / Combobox with multiplebox), keeping domain-heavy widgets out of the core bundle.",
          })}
        </p>
      </section>
    </div>
  );
}

function InstallationDocContent() {
  const resolve = useCopyResolver();
  return (
    <div className="doc-prose-stack">
      <section id="install" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "1. 安装依赖", en: "1. Install Package" })}</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <Snippet code="pnpm add m3eui" />
          <Snippet code="npm install m3eui" variant="outlined" />
        </div>
      </section>

      <section id="provider" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "2. 配置 M3EProvider 与样式", en: "2. Configure M3EProvider & Styles" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "静态主题 CSS（推荐）由 CLI 生成并在构建期注入全部颜色变量；仅在需要运行时动态切换种子色、配色方案或对比度时，显式传入 generateM3EThemeTokens 作为 themeEngine。",
            en: "Static theme CSS (recommended) supplies all color tokens from build-time CSS. Pass generateM3EThemeTokens to themeEngine only when changing seed, scheme variant, or contrast dynamically at runtime.",
          })}
        </p>
        <CodeBlock
          lang="tsx"
          title="src/App.tsx"
          showHeader
          showCopyButton
          code={`import "./styles/m3e-theme.css";
import "m3eui/styles.css";
import { M3EProvider, Button } from "m3eui";
import { generateM3EThemeTokens } from "m3eui/tokens";
import m3eConfig from "../m3e.json";

// Default lightweight path (uses static m3e-theme.css):
export function StaticApp() {
  return (
    <M3EProvider config={m3eConfig}>
      <Button variant="filled">Hello Material 3 Expressive</Button>
    </M3EProvider>
  );
}

// Runtime HCT recoloring path (pass themeEngine explicitly):
export function DynamicThemeApp() {
  return (
    <M3EProvider
      config={m3eConfig}
      themeEngine={generateM3EThemeTokens}
      initialSeedHex="#0B6B58"
      initialSchemeVariant="vibrant"
    >
      <Button variant="filled">Dynamic HCT Theme</Button>
    </M3EProvider>
  );
}`}
        />
      </section>

      <section id="static-css" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "3. 零闪烁 SSR / Next.js App Router 接入", en: "3. Zero-FOUC SSR & Next.js App Router" })}</h2>
        <Snippet
          code={[
            'npx m3eui init --seed "#6750A4" --variant expressive',
            "npx m3eui sync",
          ]}
        />
        <CodeBlock
          lang="tsx"
          title="app/layout.tsx"
          showHeader
          showCopyButton
          code={`import "./styles/m3e-theme.css";
import "m3eui/styles.css";
import { CSPProvider, M3EProvider, getM3EInitScript } from "m3eui";
import m3eConfig from "../m3e.json";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="light dark" />
        <script dangerouslySetInnerHTML={{ __html: getM3EInitScript() }} />
      </head>
      <body>
        <CSPProvider>
          <M3EProvider config={m3eConfig}>{children}</M3EProvider>
        </CSPProvider>
      </body>
    </html>
  );
}`}
        />
      </section>
    </div>
  );
}

function ThemingDocContent() {
  const resolve = useCopyResolver();
  return (
    <div className="doc-prose-stack">
      <section id="monet" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "AOSP Monet SPEC_2025 动态色彩", en: "AOSP Monet SPEC_2025 Dynamic Color" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "只需提供一个十六进制种子色，m3eui 即可在感知均匀的 HCT (Hue-Chroma-Tone) 空间实时推导浅色/深色与三种无障碍对比度等级（0 / +0.5 / +1.0）下的完整表面层级与语义容器色。",
            en: "From a single hex seed color, m3eui computes full light/dark surface hierarchies and semantic role tokens in perceptually uniform HCT space across 3 contrast levels (0, +0.5, +1.0).",
          })}
        </p>
      </section>
      <section id="playground" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "实时调色板与 m3e.json 导出", en: "Interactive Palette & m3e.json Exporter" })}</h2>
        <LiveThemingGuideWidget />
      </section>
      <section id="image-custom-colors" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "图片取色、自定义语义色与系统高对比度", en: "Image Seed Extraction, Custom Roles & autoContrast" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "支持直接从图片提取 HCT 种子色（extractSeedHexFromImage）、用 harmonizeHexColor 协调品牌辅色、通过 customColors 输出语义容器变量，以及开启 autoContrast 自动响应系统 prefers-contrast: more。",
            en: "Extract dominant HCT seeds from images (extractSeedHexFromImage), harmonize brand accents (harmonizeHexColor), emit custom role tokens via customColors, and enable autoContrast on M3EProvider for OS prefers-contrast: more tracking.",
          })}
        </p>
        <CodeBlock
          lang="tsx"
          title="src/theme.tsx"
          showHeader
          showCopyButton
          code={`import { M3EProvider } from "m3eui";
import {
  extractSeedHexFromImage,
  generateM3EThemeTokens,
  harmonizeHexColor,
} from "m3eui/tokens";

const seedHex = await extractSeedHexFromImage(coverImgEl);
const accentHex = harmonizeHexColor("#006C51", seedHex);
const tokens = generateM3EThemeTokens({
  seedHex,
  customColors: { brand: "#006C51" },
});
// Outputs --m3e-color-brand, --m3e-color-on-brand, and container tokens.

<M3EProvider autoContrast theme={{ seed: seedHex }}>
  <App />
</M3EProvider>;`}
        />
      </section>
    </div>
  );
}

function MotionShapesDocContent() {
  const resolve = useCopyResolver();
  return (
    <div className="doc-prose-stack">
      <section id="spring-ode" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "解析物理弹簧 ODE", en: "Analytical Spring Physics ODE" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "不同于传统固定时长贝塞尔曲线，m3eui 使用二阶常微分方程解析解计算欠阻尼（Expressive）与临界阻尼（Standard）弹簧轨迹，支持手势中途打断时的连续速度继承。例如 Button 在按压瞬间圆角由满胶囊动态形变为方形圆角。",
            en: "Instead of fixed-duration cubic curves, m3eui solves second-order spring differential equations analytically—preserving velocity across mid-flight interruptions for press corner morphing, switches, and indicators.",
          })}
        </p>
      </section>
      <section id="polygons" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "35 种圆角多边形实时插值", en: "35 Morphing RoundedPolygons" })}</h2>
        <LiveSpringAndShapesGuideWidget />
      </section>
    </div>
  );
}

function I18nDocContent() {
  const resolve = useCopyResolver();
  return (
    <div className="doc-prose-stack">
      <section id="live-i18n" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "CLDR 多语言与 BiDi / RTL 实时预览", en: "Live CLDR Locale & BiDi / RTL Tester" })}</h2>
        <LiveI18nGuideWidget />
      </section>

      <section id="custom-pack" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "自定义词条覆盖与扩展语言包", en: "Custom Message Overrides & Locale Packs" })}</h2>
        <CodeBlock
          lang="tsx"
          title="src/App.tsx"
          showHeader
          showCopyButton
          code={`import { M3EProvider } from "m3eui";
import { frFRMessages } from "./i18n/fr-FR"; // generated via: npx m3eui locale fr-FR

// Pass a custom locale pack (via CLI scaffold) or override keys per provider:
<M3EProvider
  locale="fr-FR"
  messages={{
    ...frFRMessages,
    "command.placeholder": "Rechercher une commande…",
  }}
>
  <App />
</M3EProvider>`}
        />
      </section>
    </div>
  );
}

function StylingDocContent() {
  const resolve = useCopyResolver();

  interface TokenRow {
    readonly token: string;
    readonly group: string;
    readonly usage: string;
    readonly swatch?: string;
  }

  const tokenRows = React.useMemo<readonly TokenRow[]>(
    () => [
      {
        token: "--m3e-color-primary / --m3e-color-on-primary",
        group: resolve({ zh: "主语义色", en: "Primary" }),
        usage: resolve({ zh: "核心填充按钮、选中指示器、聚焦描边", en: "Filled actions, active indicators, focus strokes" }),
        swatch: "var(--m3e-color-primary)",
      },
      {
        token: "--m3e-color-secondary-container / --m3e-color-on-secondary-container",
        group: resolve({ zh: "色调容器", en: "Tonal Container" }),
        usage: resolve({ zh: "Tonal 按钮、选中导航胶囊、筛选 Chip", en: "Tonal buttons, selected nav pills, filter chips" }),
        swatch: "var(--m3e-color-secondary-container)",
      },
      {
        token: "--m3e-color-surface-container-{lowest..highest}",
        group: resolve({ zh: "五级表面海拔", en: "Surface Ramp" }),
        usage: resolve({ zh: "卡片、抽屉、菜单浮层与 Filled 表单底色", en: "Cards, sheets, popups, and Filled field fills" }),
        swatch: "var(--m3e-color-surface-container-high)",
      },
      {
        token: "--m3e-color-outline / --m3e-color-outline-variant",
        group: resolve({ zh: "描边与分隔", en: "Borders & Dividers" }),
        usage: resolve({ zh: "Outlined 控件 1px 描边、分割线与表格边框", en: "Outlined control borders, dividers, table rules" }),
        swatch: "var(--m3e-color-outline)",
      },
      {
        token: "--m3e-spatial-fast-duration / --m3e-spatial-fast-easing",
        group: resolve({ zh: "空间弹簧 CSS 变量", en: "Spatial Motion" }),
        usage: resolve({ zh: "位移、缩放、切口展开（允许弹性超调）", en: "Position, scale, and notch geometry transitions" }),
      },
      {
        token: "--m3e-effects-default-duration / --m3e-effects-default-easing",
        group: resolve({ zh: "视觉效果过渡变量", en: "Effects Motion" }),
        usage: resolve({ zh: "颜色、透明度与阴影过渡（临界阻尼零超调）", en: "Color, opacity, and shadow transitions (zero overshoot)" }),
      },
    ],
    [resolve],
  );

  const tokenColumns = React.useMemo<readonly M3EDataTableColumn<TokenRow>[]>(
    () => [
      {
        id: "token",
        header: resolve({ zh: "CSS 变量", en: "CSS Custom Property" }),
        isRowHeader: true,
        cell: (row) => (
          <div className="demo-row" style={{ gap: 8 }}>
            {row.swatch ? (
              <span
                aria-hidden="true"
                style={{
                  inlineSize: 14,
                  blockSize: 14,
                  borderRadius: 9999,
                  backgroundColor: row.swatch,
                  border: "1px solid var(--m3e-color-outline-variant)",
                  flexShrink: 0,
                }}
              />
            ) : null}
            <code style={{ fontSize: 12 }}>{row.token}</code>
          </div>
        ),
      },
      {
        id: "group",
        header: resolve({ zh: "类别", en: "Category" }),
        cell: (row) => row.group,
      },
      {
        id: "usage",
        header: resolve({ zh: "典型用途", en: "Typical Usage" }),
        cell: (row) => row.usage,
      },
    ],
    [resolve],
  );

  return (
    <div className="doc-prose-stack">
      <section id="cascade-layers" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "CSS @layer 级联层优先级", en: "CSS @layer Cascade Order" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "m3eui/styles.css 将全部内置规则封装在 @layer m3e.tokens, m3e.base, m3e.components 中。按照浏览器 CSS Cascade Layers 规范，任何未分层的业务样式、CSS Modules 或 Tailwind utilities 层优先级均高于 m3e.components，无需编写 !important 即可直接覆盖组件样式。",
            en: "m3eui/styles.css scopes every built-in rule inside @layer m3e.tokens, m3e.base, m3e.components. Unlayered app styles, CSS Modules, and Tailwind utilities naturally win over m3e.components without !important.",
          })}
        </p>
        <CodeBlock
          lang="css"
          title="app.css"
          showHeader
          showCopyButton
          code={`/* m3eui internal layer order: */
@layer m3e.tokens, m3e.base, m3e.components;

/* App overrides win automatically without !important: */
.checkout-submit.m3e-button {
  min-inline-size: 220px;
}

/* If using Tailwind CSS v4, keep m3e layers before utilities: */
@layer theme, base, m3e.tokens, m3e.base, m3e.components, components, utilities;`}
        />
      </section>

      <section id="tailwind-typography" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "Tailwind v4 主题桥接与排版工具类", en: "Tailwind v4 Bridge & Typography Utilities" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "引入 m3eui/tailwind.css 即可将全部 M3E 色彩、圆角、海拔阴影与字体映射为 Tailwind v4 @theme inline 工具类（如 bg-m3e-primary、rounded-m3e-large、shadow-m3e-level2）；同时 m3eui/styles.css 在 m3e.base 层内置了 .m3e-type-* 排版工具类。",
            en: "Import m3eui/tailwind.css to map all M3E colors, corner radii, elevation shadows, and fonts into Tailwind v4 utilities via @theme inline, and use built-in .m3e-type-* typography classes bundled in m3eui/styles.css.",
          })}
        </p>
        <CodeBlock
          lang="css"
          title="app.css"
          showHeader
          showCopyButton
          code={`@import "tailwindcss";
@import "m3eui/styles.css";
@import "m3eui/tailwind.css";

/* Ready in JSX/HTML: */
/* <h2 className="m3e-type-headline-small-emphasized">Heading</h2> */
/* <div className="bg-m3e-surface-container text-m3e-on-surface rounded-m3e-large shadow-m3e-level2" /> */`}
        />
      </section>

      <section id="token-reference" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "核心 --m3e-* 令牌速查", en: "Core --m3e-* Token Reference" })}</h2>
        <DataTable
          caption={resolve({ zh: "核心 CSS 变量速查表", en: "Core CSS custom properties" })}
          hideCaption
          density="compact"
          rows={tokenRows}
          getRowKey={(r) => r.token}
          columns={tokenColumns}
        />
      </section>

      <section id="primitives" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "m3eui/primitives 无头原语组合", en: "Headless Escape Hatch (m3eui/primitives)" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "当标准 M3E 组件结构无法满足高度定制的交互布局时，可直接从 m3eui/primitives 引入透出的 @base-ui/react 原语并复用 --m3e-* 变量，无需额外安装第二套无头组件库：",
            en: "When a custom layout goes beyond standard M3E anatomy, import headless @base-ui/react primitives directly from m3eui/primitives and pair them with --m3e-* tokens:",
          })}
        </p>
        <CodeBlock
          lang="tsx"
          title="CustomStatusPopover.tsx"
          showHeader
          showCopyButton
          code={`import { PopoverPrimitives } from "m3eui/primitives";

export function CustomStatusPopover() {
  return (
    <PopoverPrimitives.Root>
      <PopoverPrimitives.Trigger className="custom-pill">
        Status
      </PopoverPrimitives.Trigger>
      <PopoverPrimitives.Portal>
        <PopoverPrimitives.Positioner sideOffset={8}>
          <PopoverPrimitives.Popup
            style={{
              padding: 16,
              borderRadius: 16,
              background: "var(--m3e-color-surface-container-high)",
              color: "var(--m3e-color-on-surface)",
            }}
          >
            Custom headless surface with M3E HCT tokens
          </PopoverPrimitives.Popup>
        </PopoverPrimitives.Positioner>
      </PopoverPrimitives.Portal>
    </PopoverPrimitives.Root>
  );
}`}
        />
      </section>
    </div>
  );
}

function FormsValidationDocContent() {
  const resolve = useCopyResolver();
  const { toast } = useM3EToast();
  const [variant, setVariant] = React.useState<"outlined" | "filled">("outlined");
  const [serverErrors, setServerErrors] = React.useState<Record<string, string>>({});

  return (
    <div className="doc-prose-stack">
      <section id="label-modes" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "floating 与 outside 标签布局选型", en: "Floating vs. Outside Label Ergonomics" })}</h2>
        <div className="demo-panel">
          <div className="demo-row" style={{ justifyContent: "space-between" }}>
            <ButtonGroup
              variant="connected"
              size="xs"
              selectionMode="single"
              aria-label="Field variant"
              items={[
                { value: "outlined", label: "Outlined" },
                { value: "filled", label: "Filled" },
              ]}
              value={[variant]}
              onValueChange={(vals) => {
                const next = vals[0] as "outlined" | "filled" | undefined;
                if (next) setVariant(next);
              }}
            />
          </div>
          <div className="demo-grid-2">
            <Card
              variant="outlined"
              title='labelPosition="floating" (4px / AOSP)'
            >
              <div style={{ display: "grid", gap: 14 }}>
                <TextField
                  variant={variant}
                  labelPosition="floating"
                  label={resolve({ zh: "服务标识", en: "Service slug" })}
                  defaultValue="edge-gateway"
                />
                <Select
                  variant={variant}
                  labelPosition="floating"
                  label={resolve({ zh: "部署区域", en: "Region" })}
                  defaultValue="tokyo"
                  options={[
                    { value: "tokyo", label: "ap-northeast-1 (Tokyo)" },
                    { value: "frankfurt", label: "eu-central-1 (Frankfurt)" },
                  ]}
                />
              </div>
            </Card>
            <Card
              variant="outlined"
              title='labelPosition="outside" (12px)'
            >
              <div style={{ display: "grid", gap: 14 }}>
                <TextField
                  variant={variant}
                  labelPosition="outside"
                  label={resolve({ zh: "服务标识", en: "Service slug" })}
                  defaultValue="edge-gateway"
                />
                <Select
                  variant={variant}
                  labelPosition="outside"
                  label={resolve({ zh: "部署区域", en: "Region" })}
                  defaultValue="tokyo"
                  options={[
                    { value: "tokyo", label: "ap-northeast-1 (Tokyo)" },
                    { value: "frankfurt", label: "eu-central-1 (Frankfurt)" },
                  ]}
                />
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section id="live-validation" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "Form + Fieldset 与非打扰式校验", en: "Form, Fieldset & Non-Intrusive Validation" })}</h2>
        <p className="doc-prose-p">
          {resolve({
            zh: "遵循失焦校验（validationMode=\"onBlur\"）、输入即清除错误与提交汇总提示原则；底层结合 HTML 原生约束（required、minLength、pattern）与 CSS :user-invalid 伪类，避免用户尚未输入完就提前标红：",
            en: "Validate on blur (validationMode=\"onBlur\"), clear errors on input, and pair native HTML constraints (required, minLength, pattern) with :user-invalid so empty fields never show premature errors:",
          })}
        </p>
        <div className="demo-panel">
          <Form
            validationMode="onBlur"
            errors={serverErrors}
            showErrorSummary
            onFormSubmit={(values) => {
              const slug = String(values.slug ?? "").trim();
              if (slug === "admin") {
                setServerErrors({
                  slug: resolve({
                    zh: "标识 \"admin\" 为系统保留字，请更换。",
                    en: "Slug \"admin\" is reserved.",
                  }),
                });
                return;
              }
              setServerErrors({});
              toast({
                title: resolve({
                  zh: `已提交工作区：${slug}`,
                  en: `Submitted workspace: ${slug}`,
                }),
              });
            }}
          >
            <Fieldset
              variant="plain"
              legend={resolve({ zh: "新建工作区（输入 admin 可测试服务端错误注入）", en: "Create Workspace (try \"admin\" for server error)" })}
            >
              <div style={{ display: "grid", gap: 14, maxWidth: 460 }}>
                <TextField
                  name="slug"
                  labelPosition="outside"
                  label={resolve({ zh: "工作区标识", en: "Workspace slug" })}
                  placeholder="acme-design"
                  autoComplete="off"
                  enterKeyHint="done"
                  required
                  minLength={3}
                  pattern="[a-z0-9-]+"
                  onValueChange={() => {
                    if (serverErrors.slug) setServerErrors({});
                  }}
                  description={resolve({
                    zh: "仅限小写字母、数字与连字符，至少 3 个字符。",
                    en: "Lowercase letters, digits, and hyphens (3+ chars).",
                  })}
                />
                <div className="demo-row" style={{ gap: 10 }}>
                  <Button type="submit" variant="filled">
                    {resolve({ zh: "创建工作区", en: "Create Workspace" })}
                  </Button>
                </div>
              </div>
            </Fieldset>
          </Form>
        </div>
      </section>
    </div>
  );
}

function ExportsBoundariesDocContent() {
  const resolve = useCopyResolver();

  interface SubpathRow {
    readonly entry: string;
    readonly runtime: string;
    readonly contents: string;
  }

  const rows = React.useMemo<readonly SubpathRow[]>(
    () => [
      {
        entry: "m3eui",
        runtime: "SSR + CSR",
        contents: resolve({
          zh: "全量 UI 组件、M3EProvider、弹簧 Hooks、配置与国际化工具（支持 Bundler Tree-shaking）",
          en: "All UI components, M3EProvider, spring hooks, config, and i18n helpers (tree-shakeable ESM)",
        }),
      },
      {
        entry: "m3eui/components/*",
        runtime: "SSR + CSR",
        contents: resolve({
          zh: "单组件模块直连入口（如 m3eui/components/Button、m3eui/components/DataTable）",
          en: "Direct single-module component entrypoints (e.g., m3eui/components/Button)",
        }),
      },
      {
        entry: "m3eui/styles.css",
        runtime: "CSS (@layer)",
        contents: resolve({
          zh: "组件级联层样式表（@layer m3e.tokens, m3e.base, m3e.components、.m3e-type-* 排版工具类与 light-dark()）",
          en: "Layered component stylesheet (@layer m3e.tokens, m3e.base, m3e.components, .m3e-type-* utilities, and light-dark())",
        }),
      },
      {
        entry: "m3eui/tailwind.css",
        runtime: "Tailwind v4",
        contents: resolve({
          zh: "@theme inline 语义令牌桥接（--color-m3e-*、--radius-m3e-*、--shadow-m3e-* 与字体族）",
          en: "@theme inline token bridge (--color-m3e-*, --radius-m3e-*, --shadow-m3e-*, and font families)",
        }),
      },
      {
        entry: "m3eui/tokens",
        runtime: "Pure ESM / RSC-safe",
        contents: resolve({
          zh: "零 React/DOM 依赖的 CAM16/HCT 色彩数学、图片取色/色彩协调与自定义色、弹簧求解器与 35 种 MaterialShapes",
          en: "Zero-React/DOM CAM16/HCT color math, image seed/harmonize & custom colors, SpringSimulation, and 35 MaterialShapes",
        }),
      },
      {
        entry: "m3eui/tokens.json",
        runtime: "Static JSON",
        contents: resolve({
          zh: "预编译静态色彩、圆角拓扑与多边形路径 JSON，供构建脚本或跨语言工具消费",
          en: "Precomputed static color, shape, and polygon path JSON for build tools",
        }),
      },
      {
        entry: "m3eui/config",
        runtime: "Pure ESM / RSC-safe",
        contents: resolve({
          zh: "defineM3EConfig、resolveM3EConfig、generateM3EStaticThemeCss 等配置构建函数",
          en: "defineM3EConfig, resolveM3EConfig, and generateM3EStaticThemeCss",
        }),
      },
      {
        entry: "m3eui/i18n",
        runtime: "Pure ESM / RSC-safe",
        contents: resolve({
          zh: "zh-CN、en-US、ja-JP、ar-SA 语言包、BCP 47 解析与本地化数字/日期格式化",
          en: "Built-in locale packs, BCP 47 resolution, and localized number/date formatters",
        }),
      },
      {
        entry: "m3eui/primitives",
        runtime: "SSR + CSR",
        contents: resolve({
          zh: "透出的 @base-ui/react 无头组件原语、mergeProps 与 useRender",
          en: "Re-exported @base-ui/react headless primitives, mergeProps, and useRender",
        }),
      },
      {
        entry: "m3eui/cli",
        runtime: "Node.js >= 20",
        contents: resolve({
          zh: "init / sync / locale / doctor 命令的 Node 编程接口（隔离全部 node:* I/O）",
          en: "Programmatic Node.js API for init, sync, locale, and doctor (isolates node:* I/O)",
        }),
      },
      {
        entry: "m3eui/m3e.schema.json",
        runtime: "JSON Schema",
        contents: resolve({
          zh: "m3e.json 编辑器自动补全与静态校验 Schema",
          en: "JSON Schema for m3e.json IDE autocomplete and validation",
        }),
      },
    ],
    [resolve],
  );

  const columns = React.useMemo<readonly M3EDataTableColumn<SubpathRow>[]>(
    () => [
      {
        id: "entry",
        header: resolve({ zh: "导出路径", en: "Subpath" }),
        isRowHeader: true,
        cell: (r) => <code style={{ fontSize: 12.5 }}>{r.entry}</code>,
      },
      {
        id: "runtime",
        header: resolve({ zh: "运行时边界", en: "Runtime Boundary" }),
        cell: (r) => (
          <Chip tone="primary" variant="tonal" size="sm">
            {r.runtime}
          </Chip>
        ),
      },
      {
        id: "contents",
        header: resolve({ zh: "职责与内容", en: "Contents" }),
        cell: (r) => r.contents,
      },
    ],
    [resolve],
  );

  return (
    <div className="doc-prose-stack">
      <section id="subpaths" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "子路径导出与运行时矩阵", en: "Subpath Exports & Runtime Matrix" })}</h2>
        <DataTable
          caption={resolve({ zh: "m3eui 子路径导出矩阵", en: "m3eui subpath exports" })}
          hideCaption
          density="compact"
          rows={rows}
          getRowKey={(r) => r.entry}
          columns={columns}
        />
      </section>

      <section id="rsc-tokens" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "服务端 RSC 令牌计算与单组件按需导入", en: "Server RSC Token Synthesis & Direct Imports" })}</h2>
        <CodeBlock
          lang="tsx"
          title="app/theme-preview/page.tsx"
          showHeader
          showCopyButton
          code={`// Pure math in React Server Components / Edge Workers (zero React state or DOM):
import { generateM3EStaticThemeCss } from "m3eui/config";
import { generateM3EThemeTokens } from "m3eui/tokens";

// Direct single-component import when targeting minimal bundle slices:
import { Button } from "m3eui/components/Button";

export default function ThemePreviewPage() {
  const tokens = generateM3EThemeTokens({
    seedHex: "#0B6B58",
    variant: "vibrant",
  });
  const staticCss = generateM3EStaticThemeCss({
    theme: { seed: "#0B6B58", schemeVariant: "vibrant" },
  });

  return (
    <section data-primary={tokens.light.primary}>
      <style>{staticCss}</style>
      <Button variant="filled">Server-synthesized theme</Button>
    </section>
  );
}`}
        />
      </section>
    </div>
  );
}

function CliDocContent() {
  const resolve = useCopyResolver();
  const { messages } = useM3EI18n();
  const localeKeyCount = Object.keys(messages).length;
  return (
    <div className="doc-prose-stack">
      <section id="commands" tabIndex={-1} className="doc-prose-section">
        <h2>{resolve({ zh: "m3eui CLI 命令速查", en: "m3eui CLI Reference" })}</h2>
        <CodeBlock
          lang="bash"
          title="CLI"
          showHeader
          showCopyButton
          code={`# 1. 初始化项目配置文件 m3e.json 与静态主题 CSS
npx m3eui init --seed "#6750A4" --variant expressive --locale zh-CN

# 2. 根据 m3e.json 重新同步静态 HCT 主题 CSS 变量文件
npx m3eui sync

# 3. 脚手架生成新的区域语言包模板 (含全部 ${localeKeyCount} 个类型安全词条键)
npx m3eui locale fr-FR --out src/locales/fr-FR.ts

# 4. 运行配置、词条同构与零硬编码合规检查
npx m3eui doctor`}
        />
      </section>
    </div>
  );
}

export const DOC_GUIDES: readonly DocGuideSpec[] = [
  {
    slug: "introduction",
    title: { zh: "介绍与架构", en: "Introduction & Architecture" },
    subtitle: {
      zh: "了解 m3eui 如何将 AOSP Material 3 Expressive 规范转化为高可访问性的现代 React 组件系统。",
      en: "How m3eui brings Android AOSP Material 3 Expressive color, motion, and geometry to accessible React apps.",
    },
    sections: [
      { id: "philosophy", heading: { zh: "设计理念", en: "Design Philosophy" } },
      { id: "architecture", heading: { zh: "分层架构", en: "Layered Architecture" } },
    ],
    render: () => <IntroDocContent />,
  },
  {
    slug: "component-matrix",
    title: { zh: "组件图谱与溯源", en: "Component Matrix & Provenance" },
    subtitle: {
      zh: "统计与检索 AOSP Material 3 Expressive 原生标准组件与桌面 Web 衍生适配组件的完整对应关系。",
      en: "Live breakdown of official AOSP Material 3 Expressive specs versus desktop and web adaptations.",
    },
    sections: [
      { id: "summary", heading: { zh: "溯源分类统计", en: "Provenance Breakdown" } },
      { id: "matrix", heading: { zh: "全量组件对照表", en: "Component Matrix" } },
      { id: "boundary", heading: { zh: "收敛边界原则", en: "Boundary Principles" } },
    ],
    render: () => <ComponentMatrixDocContent />,
  },
  {
    slug: "installation",
    title: { zh: "快速安装", en: "Installation & Setup" },
    subtitle: {
      zh: "三步接入 Vite、Next.js 或任意现代 React 18/19 工程。",
      en: "Get up and running in Vite, Next.js, or any React 18/19 application in minutes.",
    },
    sections: [
      { id: "install", heading: { zh: "安装依赖", en: "Install Package" } },
      { id: "provider", heading: { zh: "配置 M3EProvider", en: "Configure M3EProvider" } },
      { id: "static-css", heading: { zh: "静态主题预编译", en: "Static CSS Sync" } },
    ],
    render: () => <InstallationDocContent />,
  },
  {
    slug: "theming",
    title: { zh: "动态主题与色彩", en: "Dynamic Color & Theming" },
    subtitle: {
      zh: "HCT 感知色彩空间、9 种调色变体与高对比度自适应规则。",
      en: "Perceptual HCT color space, 9 AOSP scheme variants, and contrast-adaptive tokens.",
    },
    sections: [
      { id: "monet", heading: { zh: "Monet SPEC_2025", en: "Monet SPEC_2025" } },
      { id: "playground", heading: { zh: "实时调色与导出", en: "Interactive Exporter" } },
      { id: "image-custom-colors", heading: { zh: "图片取色与自定义色", en: "Image Seed & Custom Colors" } },
    ],
    render: () => <ThemingDocContent />,
  },
  {
    slug: "motion-shapes",
    title: { zh: "物理弹簧与多边形", en: "Spring Physics & Shapes" },
    subtitle: {
      zh: "解析二阶弹簧微分方程与 35 种 AOSP 圆角多边形实时形变。",
      en: "Analytical second-order spring ODE solver and 35 morphing AOSP RoundedPolygons.",
    },
    sections: [
      { id: "spring-ode", heading: { zh: "解析物理弹簧", en: "Analytical Spring ODE" } },
      { id: "polygons", heading: { zh: "35 种圆角多边形", en: "35 Morphing Polygons" } },
    ],
    render: () => <MotionShapesDocContent />,
  },
  {
    slug: "styling",
    title: { zh: "样式定制与 @layer", en: "Styling & Cascade Layers" },
    subtitle: {
      zh: "利用 CSS @layer 无冲突覆盖样式、查阅核心 --m3e-* 令牌，或结合 m3eui/primitives 构建自定义无头组件。",
      en: "Override styles cleanly with CSS @layer, reference --m3e-* tokens, and compose headless primitives.",
    },
    sections: [
      { id: "cascade-layers", heading: { zh: "CSS @layer 优先级", en: "CSS @layer Order" } },
      { id: "tailwind-typography", heading: { zh: "Tailwind v4 与排版类", en: "Tailwind v4 & Type Utilities" } },
      { id: "token-reference", heading: { zh: "核心令牌速查", en: "Token Reference" } },
      { id: "primitives", heading: { zh: "无头原语组合", en: "Headless Primitives" } },
    ],
    render: () => <StylingDocContent />,
  },
  {
    slug: "forms-validation",
    title: { zh: "表单与校验规范", en: "Forms & Validation" },
    subtitle: {
      zh: "掌握 floating / outside 标签布局选型、Form + Fieldset 组合以及失焦非打扰式校验模式。",
      en: "Choose between floating and outside labels, group controls with Fieldset, and validate non-intrusively.",
    },
    sections: [
      { id: "label-modes", heading: { zh: "标签布局选型", en: "Floating vs. Outside" } },
      { id: "live-validation", heading: { zh: "非打扰式校验", en: "Form Validation" } },
    ],
    render: () => <FormsValidationDocContent />,
  },
  {
    slug: "i18n-rtl",
    title: { zh: "国际化与 RTL", en: "Internationalization & RTL" },
    subtitle: {
      zh: "零硬编码多语言体系、BCP 47 语言链回退、本地化数字与双向文字布局。",
      en: "Zero-hardcoded UI strings, BCP 47 fallback chains, localized numerals, and BiDi / RTL.",
    },
    sections: [
      { id: "live-i18n", heading: { zh: "实时切换预览", en: "Live Locale & RTL Tester" } },
      { id: "custom-pack", heading: { zh: "自定义语言包", en: "Custom Locale Packs" } },
    ],
    render: () => <I18nDocContent />,
  },
  {
    slug: "exports-boundaries",
    title: { zh: "按需导出与边界", en: "Subpath Exports & Boundaries" },
    subtitle: {
      zh: "全量子路径职责矩阵、服务端 RSC 安全令牌计算与单组件模块按需加载说明。",
      en: "Subpath export matrix, RSC-safe pure token synthesis, and direct component entrypoints.",
    },
    sections: [
      { id: "subpaths", heading: { zh: "子路径导出矩阵", en: "Subpath Matrix" } },
      { id: "rsc-tokens", heading: { zh: "RSC 与按需导入", en: "RSC & Direct Imports" } },
    ],
    render: () => <ExportsBoundariesDocContent />,
  },
  {
    slug: "cli",
    title: { zh: "CLI 工具链", en: "CLI Toolchain" },
    subtitle: {
      zh: "使用 m3eui init / sync / locale / doctor 实现工程化配置与自动化规范审计。",
      en: "Automate token generation, locale scaffolding, and compliance checks with the m3eui CLI.",
    },
    sections: [
      { id: "commands", heading: { zh: "命令速查", en: "CLI Reference" } },
    ],
    render: () => <CliDocContent />,
  },
];
