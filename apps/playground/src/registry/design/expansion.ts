import type { ComponentDesignSpec } from "../types";

export const EXPANSION_DESIGN_SPECS: Readonly<
  Record<string, ComponentDesignSpec>
> = {
  "file-upload": {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Pairs M3E spring-tightening dropzone surfaces with LinearWavyProgressIndicator for file transfer feedback.",
    tokenSources: ["FILE_UPLOAD_TOKENS", "EXPRESSIVE_MOTION_SCHEME"],
    inspirationAndRationale: [
      {
        title: "Drag-Over Corner Tightening",
        body: "When files hover over the dropzone or the surface is pressed, corners tighten from 24px to 16px via fastSpatial spring while shifting surface tint to primary-container.",
      },
      {
        title: "Visually Hidden Native File Input",
        body: "Uses an m3e-sr-only <input type=\"file\"> paired with a <label> rather than display:none so keyboard focus, screen readers, and native OS file dialogs remain accessible.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "file-upload-geometry",
        title: "Dropzone & Queue Item Metrics",
        columns: ["Element", "Rest Radius", "Active / Drag Radius", "Padding"],
        rows: [
          ["Dropzone", "24", "16 (fastSpatial)", "28"],
          ["Queue Item Row", "14", "14", "12"],
        ],
      },
    ],
    invariants: [
      "Queue list MUST preserve role=\"list\" when styled with display:flex.",
      "Object URLs created for image previews MUST be revoked on unmount to prevent memory leaks.",
    ],
    crossPlatformNotes: [
      {
        target: "Web / Desktop",
        guidance: "Validate MIME wildcards (image/*) and extensions (.pdf) consistently across drag-drop and picker events.",
      },
    ],
    references: [
      {
        label: "MDN — File Drag and Drop API",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API/File_drag_and_drop",
        kind: "web-standard",
      },
    ],
  },

  "color-picker": {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Native perceptual HCT (Hue, Chroma, Tone) color picker powered directly by Material Color Utilities.",
    tokenSources: ["COLOR_PICKER_TOKENS", "Hct", "TonalPalette"],
    inspirationAndRationale: [
      {
        title: "Perceptually Uniform HCT Sliders",
        body: "Unlike HSL/HSV where equal lightness produces wildly uneven perceived contrast, HCT Tone (0–100) maps directly to CIE L* luminance and WCAG contrast ratios.",
      },
      {
        title: "Live Monet Tonal Ramp",
        body: "Generates T10–T95 tonal stops from the active Hue and Chroma so designers can inspect and pick derived M3 container tones immediately.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "color-picker-geometry",
        title: "ColorPicker & Swatch Metrics",
        columns: ["Element", "Size / Width", "Rest Radius", "Selected / Pressed Radius"],
        rows: [
          ["Panel Surface", "288w", "24", "24"],
          ["ColorSwatch Item", "28 × 28", "14 (circle)", "8 (selected) / 6 (pressed)"],
        ],
      },
    ],
    invariants: [
      "ColorSwatch items render role=\"radio\" inside role=\"radiogroup\" with spring corner morphing.",
      "HEX input disables spellCheck and autoCorrect and normalizes 3- or 6-digit hex codes.",
    ],
    crossPlatformNotes: [
      {
        target: "Android / Jetpack Compose",
        guidance: "Use com.google.android.material.color.utilities.Hct and TonalPalette for identical channel math.",
      },
    ],
    references: [
      {
        label: "Material 3 — Color System (HCT)",
        url: "https://m3.material.io/styles/color/system/how-the-system-works",
        kind: "m3-spec",
      },
    ],
  },

  snippet: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Developer ergonomics trio: semantic <kbd> keycaps, spring-morphing CopyButton, and CLI Snippet bar.",
    tokenSources: ["KBD_SNIPPET_TOKENS", "EXPRESSIVE_MOTION_SCHEME"],
    inspirationAndRationale: [
      {
        title: "Tactile Clipboard Feedback",
        body: "CopyButton morphs its corner radius (16px -> 8px pressed -> 10px copied) via fastSpatial spring while announcing confirmation in a polite live region.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "kbd-snippet-geometry",
        title: "Kbd, CopyButton & Snippet Metrics",
        columns: ["Component", "Height / Size", "Corner Radius"],
        rows: [
          ["Kbd (sm / md)", "19 / 22", "6"],
          ["CopyButton", "32 × 32", "16 rest -> 10 copied"],
          ["Snippet", "min 44h", "14"],
        ],
      },
    ],
    invariants: [
      "Snippet prompt prefix (symbol=\"$\") is aria-hidden and excluded from clipboard payloads.",
      "CopyButton announces copied confirmation via role=\"status\" aria-live=\"polite\".",
    ],
    crossPlatformNotes: [
      {
        target: "Web",
        guidance: "Gracefully handle restricted navigator.clipboard environments without unhandled rejections.",
      },
    ],
    references: [
      {
        label: "MDN — <kbd>: The Keyboard Input element",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/kbd",
        kind: "web-standard",
      },
    ],
  },

  divider: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 1dp outline-variant hairline separator in full-bleed, logical-inset, vertical, and labeled forms.",
    tokenSources: ["DIVIDER_TOKENS"],
    aospSources: ["Divider.kt"],
    inspirationAndRationale: [
      {
        title: "Subtle Grouping Without Heavy Borders",
        body: "Uses --m3e-color-outline-variant at 1px thickness with 16px logical inline-start inset for avatar/icon list alignment.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "divider-geometry",
        title: "Divider Metrics",
        columns: ["Variant", "Thickness", "Inset"],
        rows: [
          ["Horizontal Full", "1", "0"],
          ["Horizontal Inset", "1", "16 (margin-inline-start)"],
          ["Vertical", "1", "0"],
        ],
      },
    ],
    invariants: [
      "Inset spacing MUST use margin-inline-start so RTL layouts indent from the right edge.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Maps to HorizontalDivider and VerticalDivider in Compose Material 3.",
      },
    ],
    references: [
      {
        label: "Material 3 — Divider",
        url: "https://m3.material.io/components/divider/overview",
        kind: "m3-spec",
      },
    ],
  },

  "scroll-area": {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Themed M3 pill-thumb scroll container built on @base-ui/react/scroll-area.",
    tokenSources: ["SCROLL_AREA_TOKENS"],
    inspirationAndRationale: [
      {
        title: "Zero Layout-Shift Overlay Scrollbars",
        body: "Replaces inconsistent OS scrollbars with an 8px track and pill thumb while retaining native browser scroll physics, touch momentum, and trackpad gestures.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "scroll-area-geometry",
        title: "ScrollArea Metrics",
        columns: ["Part", "Size", "Radius"],
        rows: [
          ["Scrollbar Track", "8", "Full pill"],
          ["Thumb", "Auto proportional", "9999"],
        ],
      },
    ],
    invariants: [
      "Single-axis orientation=\"vertical\" hides horizontal overflow while keeping min-width: 0 on content.",
      "Unstyled neutral scroll container (zero forced border, background, or padding) so nested Dialog, Card, and Sheet slots compose without double-boxing.",
    ],
    crossPlatformNotes: [
      {
        target: "Web",
        guidance: "Wraps @base-ui/react/scroll-area Root, Viewport, Content, Scrollbar, and Thumb.",
      },
    ],
    references: [
      {
        label: "Base UI — Scroll Area",
        url: "https://base-ui.com/react/components/scroll-area",
        kind: "base-ui",
      },
    ],
  },

  "drag-handle": {
    provenance: "official-m3e",
    provenanceSummary:
      "Based on AOSP Compose DragHandle.kt & DragHandleTokens.kt for resizable adaptive panes.",
    tokenSources: ["DRAG_HANDLE_TOKENS", "resolveDragHandleGeometry", "EXPRESSIVE_MOTION_SCHEME"],
    aospSources: ["androidx.compose.material3/DragHandle.kt", "tokens/DragHandleTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Press & Drag Bar Expansion",
        body: "At rest the indicator renders as a subtle 4×48px pill (outlineVariant); pressing or dragging expands it to 12×52px with 12px corners via fastSpatial spring.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "drag-handle-geometry",
        title: "DragHandle Geometry",
        columns: ["State", "Visual Bar", "Corner Radius", "Touch Target"],
        rows: [
          ["Rest", "4 × 48", "Full pill", "48 (in 24 seam)"],
          ["Pressed / Dragged", "12 × 52", "12", "48 (in 24 seam)"],
        ],
      },
    ],
    invariants: [
      "Exposes role=\"separator\" with aria-valuenow, aria-valuemin, aria-valuemax, and aria-orientation.",
      "Horizontal arrow keys invert automatically when direction is RTL.",
    ],
    crossPlatformNotes: [
      {
        target: "Android / Jetpack Compose",
        guidance: "Maps directly to VerticalDragHandle in Adaptive PaneScaffold.",
      },
    ],
    references: [
      {
        label: "WAI-ARIA — Window Splitter Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/windowsplitter/",
        kind: "aria-apg",
      },
    ],
  },

  "bottom-app-bar": {
    provenance: "official-m3e",
    provenanceSummary:
      "Based on AOSP Compose AppBar.kt BottomAppBar with overflow-aware AppBarRow and embedded flat FAB.",
    tokenSources: ["BOTTOM_APP_BAR_TOKENS", "EXPRESSIVE_MOTION_SCHEME"],
    aospSources: ["androidx.compose.material3/AppBar.kt"],
    inspirationAndRationale: [
      {
        title: "Embedded Zero-Elevation FAB",
        body: "Trailing FABs inside BottomAppBar automatically receive elevation=\"none\" so shadows never stack inside the 80px container.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "bottom-app-bar-geometry",
        title: "BottomAppBar Metrics",
        columns: ["Metric", "Value"],
        rows: [
          ["Container Height", "80"],
          ["Inline Padding", "16"],
          ["Action Gap", "4"],
        ],
      },
    ],
    invariants: [
      "Excess actionItems collapse into a DropdownMenu trigger when exceeding maxVisibleActions or available width.",
    ],
    crossPlatformNotes: [
      {
        target: "Android / Jetpack Compose",
        guidance: "Matches BottomAppBar + BottomAppBarDefaults.exitAlwaysScrollBehavior.",
      },
    ],
    references: [
      {
        label: "Material 3 — Bottom App Bar",
        url: "https://m3.material.io/components/bottom-app-bar/overview",
        kind: "m3-spec",
      },
    ],
  },

  "pull-to-refresh": {
    provenance: "official-m3e",
    provenanceSummary:
      "Based on AOSP Compose PullToRefreshBox.kt composing M3E ContainedLoadingIndicator polygon morphing.",
    tokenSources: ["PULL_TO_REFRESH_TOKENS", "LOADING_INDICATOR_TOKENS"],
    aospSources: ["androidx.compose.material3.pulltorefresh/PullToRefresh.kt"],
    inspirationAndRationale: [
      {
        title: "Damped Pull & Polygon Morph",
        body: "Applies a 0.5 drag multiplier at scrollTop <= 1 while driving ContainedLoadingIndicator determinate polygon progress and rotation.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "pull-to-refresh-geometry",
        title: "PullToRefresh Metrics",
        columns: ["Metric", "Value"],
        rows: [
          ["Positional Threshold", "80"],
          ["Max Drag Distance", "132"],
          ["Contained Indicator", "48 × 48"],
        ],
      },
    ],
    invariants: [
      "Normal vertical scrolling and child clicks remain unobstructed; pointercancel aborts without invoking onRefresh.",
    ],
    crossPlatformNotes: [
      {
        target: "Android / Jetpack Compose",
        guidance: "Matches PullToRefreshBox + PullToRefreshDefaults.LoadingIndicator.",
      },
    ],
    references: [
      {
        label: "Material 3 — Pull to Refresh",
        url: "https://m3.material.io/Foundations",
        kind: "m3-spec",
      },
    ],
  },
};
