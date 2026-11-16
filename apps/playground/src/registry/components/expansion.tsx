import * as React from "react";
import { parseShortcutKeys } from "m3eui/tokens";
import {
  Button,
  ColorPicker,
  ColorPickerField,
  ColorSwatch,
  CopyButton,
  Divider,
  DragHandle,
  FileUpload,
  FileUploadDropzone,
  Kbd,
  type M3EUploadFileItem,
  PullToRefreshBox,
  ScrollArea,
  Snippet,
} from "m3eui";
import {
  RefreshIcon,
} from "../../layout/Icons";
import type { ComponentDocSpec } from "../types";
import { useCopyResolver } from "../../i18n";

/* -------------------------------------------------------------------------- */
/* Inputs Demos                                                               */
/* -------------------------------------------------------------------------- */

function FileUploadQueueDemo() {
  const [items, setItems] = React.useState<M3EUploadFileItem[]>([
    {
      id: "spec-pdf",
      name: "m3e-motion-tokens.pdf",
      size: 1_482_900,
      status: "completed",
    },
    {
      id: "bundle-tar",
      name: "theme-snapshot.tar.gz",
      size: 3_920_100,
      status: "uploading",
      progress: 64,
    },
  ]);

  return (
    <div style={{ width: "100%", maxWidth: 500 }}>
      <FileUpload
        value={items}
        onValueChange={setItems}
        accept="image/*,.pdf,.zip,.gz,.json"
        maxFiles={5}
        maxSize={10 * 1024 * 1024}
        hint="PNG, PDF, JSON or archives up to 10 MB (max 5 files)"
      />
    </div>
  );
}

function FileUploadDropzoneDemo() {
  const [lastDrop, setLastDrop] = React.useState<string>("No files dropped yet");

  return (
    <div className="demo-panel" style={{ maxWidth: 460, gap: 10 }}>
      <FileUploadDropzone
        accept=".svg,.png,.webp"
        onFilesAccepted={(files) =>
          setLastDrop(files.map((f) => f.name).join(", ") || "0 files")
        }
        label="Drop vector or bitmap assets"
        hint="SVG, PNG, WebP"
      />
      <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
        Accepted: <code>{lastDrop}</code>
      </span>
    </div>
  );
}

function ColorPickerPanelDemo() {
  const [seed, setSeed] = React.useState("#6750A4");

  return (
    <div className="demo-row" style={{ alignItems: "flex-start", gap: 24 }}>
      <ColorPicker value={seed} onValueChange={setSeed} />
      <div className="demo-panel" style={{ minWidth: 180, gap: 10 }}>
        <div
          style={{
            height: 72,
            borderRadius: 18,
            background: seed,
            border: "1px solid var(--m3e-color-outline-variant)",
          }}
        />
        <div style={{ fontSize: 13, fontWeight: 600 }}>Active Seed: {seed}</div>
        <div style={{ fontSize: 12, color: "var(--m3e-color-on-surface-variant)" }}>
          Adjusts perceptual HCT Hue, Chroma, and Tone with live Monet tonal stops.
        </div>
      </div>
    </div>
  );
}

function ColorPickerFieldDemo() {
  const [accent, setAccent] = React.useState("#0B6B58");

  return (
    <div className="demo-panel" style={{ maxWidth: 360, gap: 16 }}>
      <ColorPickerField
        label="Brand seed color"
        value={accent}
        onValueChange={setAccent}
      />
      <ColorSwatch value={accent} onValueChange={setAccent} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Display Demos                                                              */
/* -------------------------------------------------------------------------- */

function SnippetAndCopyDemo() {
  return (
    <div className="demo-panel" style={{ maxWidth: 480, gap: 12 }}>
      <Snippet code="pnpm add m3eui @base-ui/react" />
      <Snippet
        variant="outlined"
        code={["npx m3eui init", "npx m3eui doctor"]}
      />
      <div className="demo-row" style={{ gap: 10 }}>
        <CopyButton value="https://m3e.dev/tokens.json" variant="tonal" />
        <CopyButton value="npm i m3eui" variant="outlined" />
        <span style={{ fontSize: 12.5, color: "var(--m3e-color-on-surface-variant)" }}>
          Standalone <code>CopyButton</code> variants
        </span>
      </div>
    </div>
  );
}

function KbdDemo() {
  return (
    <div className="demo-row" style={{ gap: 16 }}>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        Command Palette <Kbd keys={parseShortcutKeys("⌘K")} />
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        Format <Kbd keys={["shift", "alt", "f"]} size="sm" />
      </span>
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13 }}>
        Confirm <Kbd keys={["enter"]} size="sm" />
      </span>
    </div>
  );
}

function DividerDemo() {
  return (
    <div className="demo-panel" style={{ maxWidth: 440, gap: 14 }}>
      <div style={{ fontSize: 13.5, fontWeight: 600 }}>Full-width & Inset</div>
      <Divider />
      <div style={{ fontSize: 13, paddingInlineStart: 16 }}>Indented item row</div>
      <Divider inset />
      <Divider label="OR CONTINUE WITH" />
      <div className="demo-row" style={{ height: 28, gap: 12, fontSize: 13 }}>
        <span>Tokens</span>
        <Divider orientation="vertical" />
        <span>Motion</span>
        <Divider orientation="vertical" />
        <span>Shapes</span>
      </div>
    </div>
  );
}

function ScrollAreaDemo() {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 420,
        border: "1px solid var(--m3e-color-outline-variant)",
        borderRadius: 16,
        background: "var(--m3e-color-surface-container-low)",
      }}
    >
      <ScrollArea maxHeight={180}>
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 12 }, (_, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: 13,
                padding: "6px 10px",
                borderRadius: 10,
                background: "var(--m3e-color-surface)",
              }}
            >
              <span>Shape preset #{idx + 1}</span>
              <code style={{ fontSize: 12 }}>fastSpatial</code>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

function DragHandleSplitPaneDemo() {
  const copy = useCopyResolver();
  const rowRef = React.useRef<HTMLDivElement | null>(null);
  const colRef = React.useRef<HTMLDivElement | null>(null);
  const [split, setSplit] = React.useState(40);
  const [rowSplit, setRowSplit] = React.useState(55);

  return (
    <div className="demo-panes-stack">
      <div ref={rowRef} className="demo-panes">
        <div className="demo-pane" style={{ flex: `0 0 calc(${split}% - 12px)` }}>
          <strong>{copy({ zh: "列表", en: "List" })}</strong>
          <code>{Math.round(split)}%</code>
        </div>
        <DragHandle containerRef={rowRef} value={split} onValueChange={setSplit} min={25} max={75} />
        <div className="demo-pane" style={{ flex: 1 }}>
          <strong>{copy({ zh: "详情", en: "Detail" })}</strong>
          <code>{Math.round(100 - split)}%</code>
        </div>
      </div>

      <div ref={colRef} className="demo-panes demo-panes--column">
        <div className="demo-pane" style={{ flex: `0 0 calc(${rowSplit}% - 12px)` }}>
          <strong>{copy({ zh: "编辑器", en: "Editor" })}</strong>
          <code>{Math.round(rowSplit)}%</code>
        </div>
        <DragHandle
          orientation="horizontal"
          containerRef={colRef}
          value={rowSplit}
          onValueChange={setRowSplit}
          min={25}
          max={75}
        />
        <div className="demo-pane" style={{ flex: 1 }}>
          <strong>{copy({ zh: "终端", en: "Terminal" })}</strong>
          <code>{Math.round(100 - rowSplit)}%</code>
        </div>
      </div>
    </div>
  );
}

function PullToRefreshDemo() {
  const [refreshing, setRefreshing] = React.useState(false);
  const [variant, setVariant] = React.useState<"contained" | "circular">("contained");
  const [revision, setRevision] = React.useState(1);

  const triggerRefresh = React.useCallback(() => {
    setRefreshing(true);
    window.setTimeout(() => {
      setRevision((r) => r + 1);
      setRefreshing(false);
    }, 1100);
  }, []);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: "100%", maxWidth: 460 }}>
      <div className="demo-row" style={{ gap: 8 }}>
        <Button
          size="xs"
          variant={variant === "contained" ? "filled" : "outlined"}
          onClick={() => setVariant("contained")}
        >
          contained
        </Button>
        <Button
          size="xs"
          variant={variant === "circular" ? "filled" : "outlined"}
          onClick={() => setVariant("circular")}
        >
          circular
        </Button>
        <Button
          size="xs"
          variant="tonal"
          leadingIcon={<RefreshIcon size={15} />}
          disabled={refreshing}
          onClick={triggerRefresh}
        >
          Refresh
        </Button>
      </div>
      <PullToRefreshBox
        refreshing={refreshing}
        onRefresh={triggerRefresh}
        indicatorVariant={variant}
        style={{
          height: 220,
          borderRadius: 20,
          border: "1px solid var(--m3e-color-outline-variant)",
          background: "var(--m3e-color-surface-container-low)",
        }}
      >
        <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          {Array.from({ length: 6 }, (_, idx) => (
            <div
              key={idx}
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "10px 14px",
                borderRadius: 12,
                background: "var(--m3e-color-surface)",
                fontSize: 13,
              }}
            >
              <span>Feed snapshot #{idx + 1}</span>
              <code style={{ fontSize: 12 }}>v{revision}</code>
            </div>
          ))}
        </div>
      </PullToRefreshBox>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Exported Registry Arrays                                                   */
/* -------------------------------------------------------------------------- */

export const EXPANSION_INPUTS_DOCS: readonly ComponentDocSpec[] = [
  {
    slug: "file-upload",
    title: "FileUpload",
    isNew: true,
    subtitle: {
      zh: "支持弹簧圆角拖拽热区与波浪进度条的文件上传器。",
      en: "Drag-and-drop file uploader with spring-morphing dropzone corners and wavy upload progress indicators.",
    },
    importStatement: 'import { FileUpload, FileUploadDropzone } from "m3eui";',
    scenarios: [
      {
        id: "file-upload-queue",
        title: { zh: "文件队列与波浪上传进度", en: "Upload Queue & Wavy Progress" },
        description: {
          zh: "内置 MIME/扩展名校验、单文件体积限制与上传中波浪进度条展示。",
          en: "Validates file types and byte limits while rendering live wavy progress bars.",
        },
        code: `<FileUpload
  value={items}
  onValueChange={setItems}
  accept="image/*,.pdf,.zip"
  maxFiles={5}
  maxSize={10 * 1024 * 1024}
/>`,
        render: () => <FileUploadQueueDemo />,
      },
      {
        id: "file-upload-dropzone",
        title: { zh: "独立拖拽触发热区", en: "Standalone FileUploadDropzone" },
        description: {
          zh: "仅需拖拽与点击选文件热区时可单独使用 FileUploadDropzone，拖拽悬停时圆角由 24px 收缩至 16px。",
          en: "Use FileUploadDropzone directly when managing custom upload state externally.",
        },
        code: `<FileUploadDropzone
  accept=".svg,.png,.webp"
  onFilesAccepted={(files) => console.log(files)}
/>`,
        render: () => <FileUploadDropzoneDemo />,
      },
    ],
    apis: [
      {
        title: "FileUpload Props",
        rows: [
          {
            name: "value / defaultValue",
            type: "readonly M3EUploadFileItem[]",
            defaultValue: "[]",
            description: { zh: "受控或非受控上传文件列表。", en: "Controlled or initial file items." },
          },
          {
            name: "onValueChange / onFilesRejected",
            type: "(items: M3EUploadFileItem[]) => void / (errors: string[]) => void",
            description: { zh: "队列变更与校验拒绝回调。", en: "Queue update and validation rejection handlers." },
          },
          {
            name: "accept / maxFiles / maxSize",
            type: "string / number / number",
            description: { zh: "允许的文件类型、最大数量与单文件最大字节数。", en: "Accepted MIME/extensions, max count, and max byte size." },
          },
        ],
      },
    ],
  },
  {
    slug: "color-picker",
    title: "ColorPicker",
    isNew: true,
    subtitle: {
      zh: "基于内置 Google Monet HCT 感知均匀色彩空间引擎的取色面板、表单选择框与预设色板。",
      en: "Perceptual HCT (Hue, Chroma, Tone) color picker, popover field, and spring-animated swatch radio group.",
    },
    importStatement:
      'import { ColorPicker, ColorPickerField, ColorSwatch } from "m3eui";',
    primitive: "@base-ui/react/popover",
    scenarios: [
      {
        id: "color-picker-panel",
        title: { zh: "原生 HCT 三通道与派生色阶面板", en: "Inline HCT Panel & Derived Tonal Ramp" },
        description: {
          zh: "实时解算 Hue (0–360°)、Chroma (0–100)、Tone (0–100) 与 HEX，并生成 T10–T95 动态色阶条。",
          en: "Solves perceptual Hue, Chroma, and Tone alongside HEX input and a live T10–T95 Monet tonal ramp.",
        },
        code: `<ColorPicker value={seed} onValueChange={setSeed} />`,
        render: () => <ColorPickerPanelDemo />,
      },
      {
        id: "color-picker-field",
        title: { zh: "弹出式表单取色框与预设色块", en: "Popover ColorPickerField & ColorSwatch" },
        description: {
          zh: "ColorPickerField 适配表单布局，ColorSwatch 支持独立作为单选预设色块组。",
          en: "Pair ColorPickerField in forms or render ColorSwatch as a standalone preset selector.",
        },
        code: `<ColorPickerField label="Brand seed color" value={accent} onValueChange={setAccent} />
<ColorSwatch value={accent} onValueChange={setAccent} />`,
        render: () => <ColorPickerFieldDemo />,
      },
    ],
    apis: [
      {
        title: "ColorPicker & ColorPickerField Props",
        rows: [
          {
            name: "value / defaultValue",
            type: "string",
            defaultValue: '"#6750A4"',
            description: { zh: "当前选中 HEX 颜色值。", en: "Controlled or initial HEX color string." },
          },
          {
            name: "onValueChange",
            type: "(hex: string) => void",
            description: { zh: "颜色变更时返回规范化大写 HEX。", en: "Emits normalized 6-digit uppercase HEX." },
          },
          {
            name: "onValueCommitted",
            type: "(hex: string) => void",
            description: { zh: "松开滑块、确认输入或点选色块时触发。", en: "Fires on slider release, confirmed input, or swatch pick." },
          },
          {
            name: "swatches / showTonalRamp",
            type: "readonly string[] / boolean",
            defaultValue: "DEFAULT_SWATCHES / true",
            description: { zh: "底部预设色板列表与是否渲染 HCT 派生色阶。", en: "Preset HEX swatches and Monet tonal ramp toggle." },
          },
        ],
      },
    ],
  },
];

export const EXPANSION_DISPLAY_DOCS: readonly ComponentDocSpec[] = [
  {
    slug: "kbd",
    title: "Kbd",
    isNew: true,
    subtitle: {
      zh: "语义化键帽，按平台把 mod / shift / alt / enter 映射为对应符号。",
      en: "Semantic keycaps mapping mod, shift, alt, and enter to platform glyphs.",
    },
    importStatement:
      'import { Kbd } from "m3eui";',
    scenarios: [
      {
        id: "kbd-keys",
        title: { zh: "快捷键徽标 (Kbd)", en: "Keyboard Shortcut Keycaps" },
        description: {
          zh: "传入 keys 自动映射修饰键符号（⌘、⇧、⌥、⌃、↵），支持 sm 与 md 两档高度。",
          en: "Maps modifier aliases (mod, shift, alt, enter) to crisp platform keycap glyphs.",
        },
        code: `import { Kbd } from "m3eui";
import { parseShortcutKeys } from "m3eui/tokens";

<Kbd keys={parseShortcutKeys("⌘K")} />
<Kbd keys={["shift", "alt", "f"]} size="sm" />`,
        render: () => <KbdDemo />,
      },
    ],
    apis: [
      {
        title: "Kbd Props",
        rows: [
          {
            name: "keys / size",
            type: 'readonly KbdKeyAlias[] / "sm" | "md"',
            defaultValue: 'undefined / "md"',
            description: { zh: "按键别名数组与徽标尺寸。", en: "Modifier/key aliases and keycap height." },
          },
          {
            name: "parseShortcutKeys(shortcut)",
            type: "(shortcut: string) => KbdKeyAlias[]",
            defaultValue: 'from "m3eui/tokens"',
            description: { zh: "将快捷键字符串（如 \"⌘K\"、\"Ctrl+Shift+P\"）解析为 Kbd 按键序列。", en: "Parses shortcut strings (e.g., \"⌘K\", \"Ctrl+Shift+P\") into Kbd key tokens." },
          },
        ],
      },
    ],
  },
  {
    slug: "snippet",
    title: "Snippet",
    isNew: true,
    subtitle: {
      zh: "可复制的命令行片段与独立的 CopyButton，复制状态通过 aria-live 播报。",
      en: "Copyable CLI snippet and standalone CopyButton with aria-live copy status.",
    },
    importStatement:
      'import { Snippet, CopyButton } from "m3eui";',
    scenarios: [
      {
        id: "snippet-copy",
        title: { zh: "命令行代码条与独立复制按钮", en: "CLI Snippets & CopyButton" },
        description: {
          zh: "Snippet 前缀提示符（$）不参与复制；CopyButton 复制后切换对勾图标并通过 aria-live 播报。",
          en: "Prompt symbols are excluded from copied text; CopyButton announces state via aria-live.",
        },
        code: `<Snippet code="pnpm add m3eui @base-ui/react" />
<Snippet variant="outlined" code={["npx m3eui init", "npx m3eui doctor"]} />
<CopyButton value="https://m3e.dev/tokens.json" variant="tonal" />`,
        render: () => <SnippetAndCopyDemo />,
      },
    ],
    apis: [
      {
        title: "Snippet & CopyButton Props",
        rows: [
          {
            name: "Snippet.code / symbol / variant",
            type: 'string | readonly string[] / ReactNode | false / "filled" | "outlined"',
            defaultValue: '- / "$" / "filled"',
            description: { zh: "单行或多行命令文本、前缀符号与容器表面样式。", en: "Command lines, prompt prefix, and surface variant." },
          },
          {
            name: "CopyButton.value / variant / timeout",
            type: 'string / "ghost" | "tonal" | "outlined" / number',
            defaultValue: '- / "ghost" / 1800',
            description: { zh: "写入剪贴板的文本、按钮外观与复位毫秒数。", en: "Clipboard text, button style, and reset timeout." },
          },
        ],
      },
    ],
  },
  {
    slug: "divider",
    title: "Divider",
    subtitle: {
      zh: "支持水平通栏、前导内缩（inset）、垂直行内分隔以及居中文字标签的 M3 分割线。",
      en: "Horizontal, logical-inset, vertical, and text-labeled Material 3 separator lines.",
    },
    importStatement: 'import { Divider } from "m3eui";',
    primitive: "@base-ui/react/separator",
    scenarios: [
      {
        id: "divider-variants",
        title: { zh: "通栏、内缩、嵌字与垂直分割", en: "Full, Inset, Labeled & Vertical" },
        description: {
          zh: "inset 使用逻辑属性 margin-inline-start: 16px，在 RTL 下自动切换为右侧留白。",
          en: "Logical inset spacing adapts automatically in RTL layouts.",
        },
        code: `<Divider />
<Divider inset />
<Divider label="OR CONTINUE WITH" />
<Divider orientation="vertical" />`,
        render: () => <DividerDemo />,
      },
    ],
    apis: [
      {
        title: "Divider Props",
        rows: [
          {
            name: "orientation",
            type: '"horizontal" | "vertical"',
            defaultValue: '"horizontal"',
            description: { zh: "分割线方向。", en: "Separator axis." },
          },
          {
            name: "inset / label",
            type: "boolean / React.ReactNode",
            defaultValue: "false / undefined",
            description: { zh: "16px 起始内缩；水平居中文字标签。", en: "16px inline-start inset; centered text label." },
          },
        ],
      },
    ],
  },
  {
    slug: "scroll-area",
    title: "ScrollArea",
    subtitle: {
      zh: "跨平台一致的悬浮胶囊滚动条视口容器，保留原生惯性滚动与无障碍可访问性。",
      en: "Custom pill-thumb scroll container preserving native momentum scrolling and keyboard accessibility.",
    },
    importStatement: 'import { ScrollArea } from "m3eui";',
    primitive: "@base-ui/react/scroll-area",
    scenarios: [
      {
        id: "scroll-area-vertical",
        title: { zh: "限高滚动面板", en: "Bounded Scroll Viewport" },
        description: {
          zh: "通过 maxHeight 与 orientation 控制垂直、水平或双向自定义滚动条。",
          en: "Constrain height with maxHeight while rendering themed M3 scrollbars.",
        },
        code: `<ScrollArea maxHeight={180}>{/* Scrollable content */}</ScrollArea>`,
        render: () => <ScrollAreaDemo />,
      },
    ],
    apis: [
      {
        title: "ScrollArea Props",
        rows: [
          {
            name: "maxHeight",
            type: "number | string",
            defaultValue: "220",
            description: { zh: "滚动视口最大高度。", en: "Maximum viewport height." },
          },
          {
            name: "orientation",
            type: '"vertical" | "horizontal" | "both"',
            defaultValue: '"vertical"',
            description: { zh: "启用自定义滚动条的轴向。", en: "Active scrollbar axes." },
          },
        ],
      },
    ],
  },
  {
    slug: "drag-handle",
    title: "DragHandle",
    isNew: true,
    subtitle: {
      zh: "调整相邻窗格尺寸的把手（AOSP VerticalDragHandle）。弹层抓手用 Sheet。",
      en: "Resizes adjacent panes (AOSP VerticalDragHandle). For a sheet grabber, use Sheet.",
    },
    importStatement: 'import { DragHandle } from "m3eui";',
    scenarios: [
      {
        id: "drag-handle-split-pane",
        title: { zh: "左右与上下窗格", en: "Side-by-side & stacked panes" },
        description: {
          zh: "把手放在两块窗格之间 24px 的空隙里；方向键、Home / End 调整，RTL 自动镜像。",
          en: "The handle sits in the 24px gap between two panes. Arrow keys and Home / End resize; RTL mirrors.",
        },
        code: `<div ref={hostRef} style={{ display: "flex" }}>
  <div style={{ flex: \`0 0 calc(\${split}% - 12px)\` }}>List</div>
  <DragHandle containerRef={hostRef} value={split} onValueChange={setSplit} min={25} max={75} />
  <div style={{ flex: 1 }}>Detail</div>
</div>`,
        render: () => <DragHandleSplitPaneDemo />,
      },
    ],
    apis: [
      {
        title: "DragHandle Props",
        rows: [
          {
            name: "value / defaultValue / onValueChange",
            type: "number / (value: number) => void",
            defaultValue: "50",
            description: { zh: "分栏百分比位置与变更回调。", en: "Controlled or uncontrolled split percentage and callback." },
          },
          {
            name: "min / max / step",
            type: "number",
            defaultValue: "15 / 85 / 2",
            description: { zh: "允许的最小/最大百分比与方向键步长。", en: "Percentage bounds and keyboard step increment." },
          },
          {
            name: "orientation",
            type: '"vertical" | "horizontal"',
            defaultValue: '"vertical"',
            description: { zh: "手柄方向。", en: "Handle orientation." },
          },
        ],
      },
    ],
  },
];

export const EXPANSION_NAVIGATION_DOCS: readonly ComponentDocSpec[] = [];

export const EXPANSION_FEEDBACK_DOCS: readonly ComponentDocSpec[] = [
  {
    slug: "pull-to-refresh",
    title: "PullToRefreshBox",
    isNew: true,
    subtitle: {
      zh: "AOSP M3E 下拉刷新容器（PullToRefreshBox），内置 0.5 阻尼下拉系数与 contained LoadingIndicator 多边形形变指示器。",
      en: "AOSP M3E pull-to-refresh surface composing a contained LoadingIndicator polygon morph with 0.5 drag resistance.",
    },
    importStatement: 'import { PullToRefreshBox } from "m3eui";',
    scenarios: [
      {
        id: "pull-to-refresh-box",
        title: { zh: "多边形形变与圆环下拉刷新", en: "Contained Polygon & Circular Pull-to-Refresh" },
        description: {
          zh: "在列表顶部向下拖拽时按进度连续形变并旋转指示器，松手越过阈值触发 onRefresh。",
          en: "Drag downward at scrollTop 0 to morph and rotate the M3E indicator; releasing past threshold triggers onRefresh.",
        },
        code: `<PullToRefreshBox
  refreshing={refreshing}
  onRefresh={handleRefresh}
  indicatorVariant="contained"
>
  {feedItems}
</PullToRefreshBox>`,
        render: () => <PullToRefreshDemo />,
      },
    ],
    apis: [
      {
        title: "PullToRefresh & PullToRefreshBox Props",
        rows: [
          {
            name: "refreshing / onRefresh",
            type: "boolean / () => void",
            required: true,
            description: { zh: "当前是否处于刷新加载态与释放触发回调。", en: "Active refresh state and threshold release callback." },
          },
          {
            name: "indicatorVariant",
            type: '"contained" | "circular"',
            defaultValue: '"contained"',
            description: { zh: "指示器样式：M3E 7 形态多边形容器或经典圆弧。", en: "M3E contained polygon morph indicator or circular arc spinner." },
          },
          {
            name: "threshold / maxDragDistance",
            type: "number",
            defaultValue: "80 / 132",
            description: { zh: "触发刷新的位移阈值与最大阻尼下拉距离（px）。", en: "Trigger threshold and maximum damped pull offset in pixels." },
          },
        ],
      },
    ],
  },
];
