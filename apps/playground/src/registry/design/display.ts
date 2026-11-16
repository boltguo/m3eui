import type { ComponentDesignSpec } from "../types";

export const DISPLAY_DESIGN_SPECS: Readonly<Record<string, ComponentDesignSpec>> = {
  card: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive surface container across elevated, filled, and outlined variants with spring-driven interactive corner morphing.",
    tokenSources: [
      "CARD_TOKENS",
      "SHAPE_CORNER_TOKENS",
      "M3E_ELEVATION_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: [
      "Card.kt",
      "ElevatedCardTokens.kt",
      "FilledCardTokens.kt",
      "OutlinedCardTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Deterministic Five-Tier Surface Hierarchy over Drop Shadows",
        body: "Material 3 Expressive replaces arbitrary opacity overlays and heavy shadow stacks with HCT surface-container temperature steps: elevated cards float on surface-container-low with subtle ambient/key shadow, filled cards sit on high-chroma surface-container-highest with zero shadow, and outlined cards anchor on surface-container-lowest (or surface) with a crisp 1px outline-variant border.",
      },
      {
        title: "Bidirectional Interactive Corner Morphing (16px → 20px → 12px)",
        body: "Static cards lock at 16px corners so reading layouts stay calm. Interactive cards respond to pointer hover by expanding their silhouette from 16px to 20px (inviting touch/click) and tighten to 12px on press under the underdamped fastSpatial spring (ζ = 0.6, k = 800) with a 95ms minimum press-hold latch.",
      },
      {
        title: "Semantic Element Polymorphism (Article vs Action Surface)",
        body: "Read-only cards render as semantic <article> landmarks so nested buttons or links inside actions slots never violate HTML interactive-content nesting rules, whereas whole-card interactive surfaces bind @base-ui/react/button keyboard and pointer activation.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "card-surface-and-corner-matrix",
        title: "Card Variant Surface & Corner Physics Matrix (px = dp / pt)",
        caption: "Surface roles, border strokes, elevation, and corner radii from CARD_TOKENS",
        columns: [
          "Variant",
          "Container Role",
          "Border / Shadow",
          "Body Padding",
          "Rest Radius",
          "Hover Radius (Interactive)",
          "Pressed Radius (Interactive)",
        ],
        rows: [
          [
            "elevated",
            "surface-container-low",
            "1px transparent + level1/2 ambient-key shadow",
            "20",
            "16",
            "20",
            "12",
          ],
          [
            "filled",
            "surface-container-highest",
            "1px transparent, 0dp shadow",
            "20",
            "16",
            "20",
            "12",
          ],
          [
            "outlined",
            "surface-container-lowest / surface",
            "1px solid outline-variant, 0dp shadow",
            "20",
            "16",
            "20",
            "12",
          ],
        ],
      },
    ],
    invariants: [
      "Interactive corner priority MUST follow pressed (12px) > hovered (20px) > rest (16px), driven exclusively by fastSpatial (ζ = 0.6, k = 800) with a >= 4px radius clamp against negative underdamped spikes.",
      "Background color, border color, and hover elevation lift MUST use critically damped effects tokens (defaultEffects, ζ = 1.0, k = 1600) so shadow and color transitions never overshoot.",
      "Non-interactive cards (interactive = false) MUST remain locked at restRadius = 16px and ignore pointer hover/press corner morphing.",
      "Media bleed slots (.m3e-card__media) MUST clip seamlessly against the parent container's live animated border-radius via overflow: hidden.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use Card / ElevatedCard / OutlinedCard with CardDefaults.shape animated via animateDpAsState(targetRadius, spring(dampingRatio = 0.6f, stiffness = 800f)) driven by MutableInteractionSource hover and press states.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Clip card VStack(spacing: 0) with RoundedRectangle(cornerRadius: r, style: .continuous), driving r between 16pt, 20pt (.onHover), and 12pt (ButtonStyle configuration.isPressed with 95ms latch) using Spring(mass: 1, stiffness: 800, damping: 33.94).",
      },
      {
        target: "Flutter",
        guidance:
          "Wrap Material(color: surfaceRole, clipBehavior: Clip.antiAlias, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(r))) and step r via SpringSimulation(SpringDescription.withDampingRatio(mass: 1, stiffness: 800, ratio: 0.6)).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Drive element.style.borderRadius from a requestAnimationFrame scalar spring loop while delegating box-shadow and background-color to CSS effects transitions.",
      },
    ],
    references: [
      {
        label: "Material 3 — Cards Specification",
        url: "https://m3.material.io/components/cards/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — Card.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Card.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Button Primitive",
        url: "https://base-ui.com/react/components/button",
        kind: "base-ui",
      },
    ],
  },

  "data-table": {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "M3E Web adaptation extrapolated from M3 tonal container surfaces, CSS inline-size container queries, and the WAI-ARIA Sortable Table Authoring Practices Guide.",
    tokenSources: ["DATA_TABLE_TOKENS", "CHECKBOX_TOKENS", "SKELETON_TOKENS"],
    inspirationAndRationale: [
      {
        title: "Why Extrapolated Beyond Android Compose",
        body: "Android Material 3 deprecated legacy mobile DataTable in favor of LazyColumn lists because narrow touch screens struggle with multi-column grids. Enterprise web applications require dense, keyboard-scrollable tabular data; m3eui bridges M3E five-tier surface containers with semantic HTML <table> markup and CSS @container queries.",
      },
      {
        title: "Strict Active-Only aria-sort & Polite Live Announcements",
        body: "Per WAI-ARIA Sortable Table APG best practices, unsorted headers omit aria-sort entirely rather than broadcasting aria-sort=\"none\" on every column, preventing screen reader chatter. Activating a sort button updates aria-sort=\"ascending\" | \"descending\" on the active <th scope=\"col\"> and announces the localized sort state via role=\"status\".",
      },
      {
        title: "Locale-Aware Natural Collation & Tabular Numerals",
        body: "String sorting uses Intl.Collator(locale, { numeric: true, sensitivity: 'base' }) so version tags (v1.2 < v1.10) and CJK/Latin scripts sort naturally, while font-variant-numeric: tabular-nums aligns decimal and integer columns without monospace font compromises.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "data-table-geometry",
        title: "DataTable Structural & Responsive Geometry (Logical Pixels)",
        caption: "Exact dimensions from DATA_TABLE_TOKENS and container-query breakpoints",
        columns: [
          "Element / Mode",
          "Height / Width",
          "Inline Padding",
          "Surface / Typography Role",
          "Behavioral Contract",
        ],
        rows: [
          [
            "Outer Shell (.m3e-data-table-shell)",
            "100% width, r = 16",
            "0 (clips children)",
            "surface-container-lowest + 1px outline-variant",
            "Clips sticky header and bottom footer corners cleanly",
          ],
          [
            "Scroll Region (.m3e-data-table-wrap)",
            "max-height: 340 (when sticky)",
            "0",
            "container-type: inline-size",
            "tabIndex={0}, role=\"region\", aria-labelledby={captionId}",
          ],
          [
            "Header Row (<th scope=\"col\">)",
            "48 height",
            "16 (10 when @container <= 520px)",
            "surface-container, 12.5px w650 on-surface-variant",
            "position: sticky; top: 0; z-index: 2 when stickyHeader = true",
          ],
          [
            "Checkbox Column",
            "48 fixed width",
            "16 start / 8 end",
            "Centered 18px Checkbox (40px state layer)",
            "Header Checkbox supports tri-state indeterminate",
          ],
          [
            "Comfortable Row",
            "52 height",
            "16 (10 when @container <= 520px)",
            "13.5px tabular-nums on-surface",
            "Selected row tinted with secondary-container",
          ],
          [
            "Compact Row",
            "40 height",
            "16 (10 when @container <= 520px)",
            "13.5px tabular-nums on-surface",
            "High-density telemetry and log inspection mode",
          ],
        ],
      },
    ],
    invariants: [
      "aria-sort MUST be mounted exclusively on the currently sorted <th scope=\"col\"> (\"ascending\" | \"descending\"); unsorted column headers MUST omit aria-sort completely.",
      "Every sortable column header MUST place a native <button type=\"button\"> inside <th scope=\"col\"> rather than making <th> itself focusable.",
      "The primary identifier column (isRowHeader ?? colIndex === 0) MUST render <th scope=\"row\"> so screen readers announce row context during horizontal cell navigation.",
      "During loading = true, the scroll region MUST set aria-busy=\"true\", disable header sort/select controls, and preserve exact rowHeight geometry using Skeleton placeholders.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "On tablet/desktop Compose targets, wrap a stickyHeader LazyColumn inside Surface(shape = RoundedCornerShape(16.dp), border = BorderStroke(1.dp, outlineVariant)) with 48.dp header and 52.dp / 40.dp row heights.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Map to SwiftUI Table on macOS/iPadOS with SortComparator(.localizedStandard) (equivalent to numeric Intl.Collator) and .monospacedDigit() typography.",
      },
      {
        target: "Flutter",
        guidance:
          "Use DataTable or SliverMainAxisGroup inside ClipRRect(borderRadius: BorderRadius.circular(16)) with headingRowHeight: 48, dataRowMinHeight: 40/52, and FontFeature.tabularFigures().",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Preserve container-type: inline-size on the horizontal scroll wrapper so cell inline padding steps down from 16px to 10px based on component width rather than window width.",
      },
    ],
    references: [
      {
        label: "WAI-ARIA APG — Sortable Table Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/",
        kind: "aria-apg",
      },
      {
        label: "MDN — CSS Container Queries (@container)",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_containment/Container_queries",
        kind: "web-standard",
      },
      {
        label: "MDN — Intl.Collator (Natural Numeric Collation)",
        url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Collator",
        kind: "web-standard",
      },
    ],
  },

  list: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive segmented list replacing 1px hairline dividers with 2px physical seams and dynamic per-corner detachment.",
    tokenSources: [
      "SEGMENTED_LIST_TOKENS",
      "resolveSegmentedListCorners",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: ["ListItem.kt", "ListTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Physical 2px Seams Over Hairline Dividers",
        body: "Legacy lists sliced rows inside a single rigid rectangle using 1px borders. Material 3 Expressive groups related items as an articulated stack separated by a 2px physical gap, pairing 16px outer group corners with crisp 4px inner seam corners.",
      },
      {
        title: "Desktop Pointer Hover Stabilization (Fixing AOSP Wedge Jitter)",
        body: "AOSP ListItemDefaults.segmentedShapes left hoveredShape = 12dp from plain borderless lists, which shrinks outer 16dp corners to 12dp and opens asymmetric 12px-vs-4px wedge gaps across the 2px seam when sweeping a mouse across items. m3eui aligns hover behavior with ConnectedButtonGroup: hover shifts surface tone (surface-container-low → surface-container-high) via fastEffects while keeping inner corners locked at 4px.",
      },
      {
        title: "Full Detachment on Press & Selection + Single-Item Convergence",
        body: "Pressing or selecting an item springs all four of its corners to [16, 16, 16, 16] via fastSpatial while swapping the leading slot to a checkmark badge. When filtering reduces the list to count === 1, the sole item automatically converges to [16, 16, 16, 16] with no orphaned 4px bottom corners.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "segmented-list-corner-matrix",
        title: "Deterministic Per-Corner Topology [TL, TR, BR, BL] (Logical Pixels)",
        caption: "Exact output of resolveSegmentedListCorners across list count, index, and state",
        columns: [
          "List Count",
          "Item Position",
          "Rest Corners",
          "Hover Corners (Unselected)",
          "Pressed / Selected / Expanded",
        ],
        rows: [
          ["count === 1", "Sole item (index = 0)", "[16, 16, 16, 16]", "[16, 16, 16, 16]", "[16, 16, 16, 16]"],
          ["count > 1", "First (index = 0)", "[16, 16, 4, 4]", "[16, 16, 4, 4]", "[16, 16, 16, 16]"],
          ["count > 1", "Middle (0 < i < count - 1)", "[4, 4, 4, 4]", "[4, 4, 4, 4]", "[16, 16, 16, 16]"],
          ["count > 1", "Last (index = count - 1)", "[4, 4, 16, 16]", "[4, 4, 16, 16]", "[16, 16, 16, 16]"],
        ],
      },
      {
        id: "segmented-list-dimensions",
        title: "Row Density & Spacing Tokens (SEGMENTED_LIST_TOKENS)",
        columns: ["Token", "Value (px)", "Specification Contract"],
        rows: [
          ["gap", "2", "Physical vertical gap between <li> rows; never replace with border-bottom"],
          ["oneLineMinHeight", "56", "Single-line item minimum block size"],
          ["twoLineMinHeight", "72", "Headline + supportingText item minimum block size"],
          ["threeLineMinHeight", "88", "Multi-line supporting copy minimum block size"],
          ["paddingHorizontal / paddingVertical", "16 / 10", "Inline and block item padding (12px internal slot gap)"],
        ],
      },
    ],
    invariants: [
      "When count === 1, resolveSegmentedListCorners MUST return [16, 16, 16, 16] in all states so dynamic list filtering never leaves 4px bottom corners.",
      "Pointer hover on unselected items MUST NOT mutate corner radii; hover only transitions container color from surface-container-low to surface-container-high via fastEffects (ζ = 1.0, k = 3800).",
      "Selected items MUST convey state via three simultaneous channels: secondary-container fill, [16, 16, 16, 16] corner detachment (fastSpatial), and leading checkmark icon swap.",
      "Web markup MUST render <ul role=\"list\"> wrapping <li><button type=\"button\" aria-pressed={selected}> — never <li role=\"button\"> — preserving Safari VoiceOver list item enumeration.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use ListItem with ListItemDefaults.segmentedShapes(index, count), overriding hoveredShape to match resting shape on pointer-capable Android/Desktop targets and verticalArrangement = Arrangement.spacedBy(2.dp).",
      },
      {
        target: "SwiftUI",
        guidance:
          "Place items in VStack(spacing: 2) clipped by UnevenRoundedRectangle(topLeadingRadius: tl, bottomLeadingRadius: bl, bottomTrailingRadius: br, topTrailingRadius: tr, style: .continuous) animated with Spring(mass: 1, stiffness: 800, damping: 33.94).",
      },
      {
        target: "Flutter",
        guidance:
          "Use ListView.separated(separatorBuilder: (_, __) => const SizedBox(height: 2)) with BorderRadius.only(...) interpolated via SpringSimulation.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Compute count from valid element children in parent context so adding/removing items immediately updates first/middle/last/single corner targets.",
      },
    ],
    references: [
      {
        label: "Material 3 — Lists Overview & Expressive Specs",
        url: "https://m3.material.io/components/lists/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — ListItem.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ListItem.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Button Primitive",
        url: "https://base-ui.com/react/components/button",
        kind: "base-ui",
      },
    ],
  },

  chip: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive 32px AssistChip, FilterChip, InputChip, and SuggestionChip family alongside compact 22px/26px semantic Chip status pills.",
    tokenSources: ["CHIP_TOKENS", "SHAPE_CORNER_TOKENS", "EXPRESSIVE_MOTION_SCHEME"],
    aospSources: [
      "Chip.kt",
      "AssistChipTokens.kt",
      "FilterChipTokens.kt",
      "InputChipTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Compact 32px Tactile Silhouette Morphing (8px → 4px → 16px)",
        body: "At rest, interactive M3 chips present an 8px small-rounded rectangle that clearly distinguishes them from full-pill Primary Buttons. Pressing tightens corners to 4px via fastSpatial (ζ = 0.6, k = 800), and toggling a FilterChip selected expands its silhouette into a full 16px capsule (height / 2).",
      },
      {
        title: "Unified Compact Semantic Chip (Read-Only Span vs Interactive Action)",
        body: "Dashboards and tables need compact status pills (22px sm / 26px md) across 7 HCT-harmonized tones (neutral, primary, secondary, tertiary, success, warning, error) and 3 variants (tonal, outlined, solid). Chip renders a non-focusable <span> by default so static metadata never impersonates a button, and upgrades to an accessible @base-ui/react/button with spring corner compression (13px/11px → 6px) only when onClick is supplied.",
      },
      {
        title: "Non-Nested Accessible Removal",
        body: "Both InputChip and removable Chip render a neutral <span> container with an independent trailing <button type=\"button\" aria-label={t('chip.remove')}>, avoiding invalid nested <button> markup.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "chip-family-matrix",
        title: "Chip Variant Geometry & Corner State Matrix (CHIP_TOKENS)",
        caption: "Units: px (= dp / pt)",
        columns: [
          "Component",
          "Height",
          "Inline Pad",
          "Icon / Close Size",
          "Rest Radius",
          "Pressed Radius",
          "Selected Radius",
          "Underlying Primitive",
        ],
        rows: [
          [
            "Chip (sm / md)",
            "22 / 26",
            "8 / 10",
            "7 dot · 12 close",
            "11 / 13 (pill)",
            "6 (when onClick)",
            "—",
            "<span> (or @base-ui/react/button when onClick)",
          ],
          [
            "AssistChip",
            "32",
            "12",
            "18",
            "8",
            "4",
            "— (stateless action)",
            "@base-ui/react/button",
          ],
          [
            "FilterChip",
            "32",
            "12",
            "18 (15 check)",
            "8",
            "4",
            "16 (full pill)",
            "@base-ui/react/toggle (aria-pressed)",
          ],
          [
            "InputChip",
            "32",
            "10–12",
            "Avatar + 14 close",
            "8",
            "— (trailing button)",
            "—",
            "<span> + trailing remove <button>",
          ],
          [
            "SuggestionChip",
            "32",
            "12",
            "18",
            "8",
            "4",
            "16 (full pill)",
            "@base-ui/react/button (aria-pressed)",
          ],
        ],
      },
    ],
    invariants: [
      "Static Chip (without onClick) MUST render a non-interactive <span> without tabindex or role=\"button\"; passing onClick upgrades it to BaseButton with :focus-visible outline and fastSpatial corner compression.",
      "FilterChip corner priority MUST obey pressed (4px) > selected (16px) > rest (8px) so pressing an active filter chip still produces tactile corner compression.",
      "Corner radius animation MUST use fastSpatial (ζ = 0.6, k = 800) with a >= 2px lower clamp; container and border color transitions MUST use fastEffects (ζ = 1.0, k = 3800).",
      "InputChip and removable Chip MUST NEVER nest their trailing remove <button> inside another <button>; the remove button MUST expose a localized aria-label (t('chip.remove')).",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Maps to AssistChip, FilterChip, InputChip, and SuggestionChip (32.dp) or compact Surface(shape = CircleShape) pills (22.dp / 26.dp) for semantic status Chips.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Render HStack(spacing: 6) at frame(height: 32) clipped to RoundedRectangle(cornerRadius: r, style: .continuous) with r driven by Spring(mass: 1, stiffness: 800, damping: 33.94).",
      },
      {
        target: "Flutter",
        guidance:
          "Use ActionChip / FilterChip / InputChip with shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(r)) driven by a shared SpringSimulation.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Bind aria-pressed on FilterChip and enforce the 95ms minimum press-hold latch so quick trackpad taps visibly compress from 8px to 4px before expanding to 16px.",
      },
    ],
    references: [
      {
        label: "Material 3 — Chips Specification",
        url: "https://m3.material.io/components/chips/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — Chip.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Chip.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Toggle Primitive",
        url: "https://base-ui.com/react/components/toggle",
        kind: "base-ui",
      },
    ],
  },

  avatar: {
    provenance: "official-m3e",
    provenanceSummary:
      "Five-size Avatar and overlapping +N AvatarGroup supporting circle, rounded square, and all 35 normalized MaterialShapes polygon clip paths.",
    tokenSources: [
      "AVATAR_SIZE_SPECS",
      "MATERIAL_SHAPES",
      "M3E_ALL_SHAPE_NAMES",
      "cubicsToSvgPath",
    ],
    aospSources: ["MaterialShapes.kt"],
    inspirationAndRationale: [
      {
        title: "Expressive Polygon Avatar Masks Beyond Plain Circles",
        body: "Material 3 Expressive uses geometric silhouettes (cookie9Sided, clover8Leaf, sunny, pentagon, arch) to distinguish AI agents, workspaces, and verified creators from regular circular user portraits. Avatar generates an exact SVG <clipPath> from normalized cubic Bézier curves at 0.98 scale factor.",
      },
      {
        title: "Shape-Consistent Overlapping AvatarGroup",
        body: "AvatarGroup stacks avatars with negative logical inline-start margins (-0.24 × size) and collapses excess members into a localized +N slot sharing the exact polygon silhouette.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "avatar-size-matrix",
        title: "Avatar Five-Size Scale & Silhouette Rules (AVATAR_SIZE_SPECS)",
        columns: ["Size Tier", "Footprint (px)", "Circle Radius", "Square Radius (0.28 × px)", "Polygon Clip Scale"],
        rows: [
          ["xs", "28 × 28", "9999", "8", "0.98 × 28px SVG <clipPath>"],
          ["sm", "36 × 36", "9999", "10", "0.98 × 36px SVG <clipPath>"],
          ["md (default)", "44 × 44", "9999", "12", "0.98 × 44px SVG <clipPath>"],
          ["lg", "56 × 56", "9999", "16", "0.98 × 56px SVG <clipPath>"],
          ["xl", "72 × 72", "9999", "20", "0.98 × 72px SVG <clipPath>"],
        ],
      },
    ],
    invariants: [
      "Polygon clipping MUST apply to the inner Avatar box while outer .m3e-avatar-wrap stays unclipped so anchored Badges are never sliced by the polygon clipPath.",
      "Image load failures MUST fall back seamlessly to initials/icon content via @base-ui/react/avatar without broken-image icons.",
      "AvatarGroup overlap spacing MUST use margin-inline-start so stacking order mirrors naturally in RTL.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Clip AsyncImage with Modifier.clip(MaterialShapes.Cookie9Sided.toShape()) and stack groups with Arrangement.spacedBy((-10).dp).",
      },
      {
        target: "SwiftUI",
        guidance:
          "Apply .clipShape(MaterialPolygonShape(cubics)) on AsyncImage with fallback initials ZStack.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Sanitize React.useId() / component IDs when generating <clipPath id=\"...\"> URLs so colons never break CSS url(#id) references in Safari.",
      },
    ],
    references: [
      {
        label: "AOSP Compose Material 3 — MaterialShapes.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Avatar Primitive",
        url: "https://base-ui.com/react/components/avatar",
        kind: "base-ui",
      },
    ],
  },

  badge: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 notification Badge providing an 8×8px unread dot and an 18px CLDR-localized numeric count capsule with 99+ overflow capping.",
    tokenSources: ["BADGE_TOKENS"],
    aospSources: ["Badge.kt", "BadgeTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Canonical Two-Tier Notification Badge (8px Dot vs 18px Pill)",
        body: "Aligned with AOSP BadgeTokens, unnumbered presence/unread states use a minimal 8×8px dot so UI chrome stays quiet, while numeric unread counts expand into an 18px-tall capsule (min-width 18px, 5px inline padding) formatted via locale-aware Intl.NumberFormat with automatic 99+ overflow capping.",
      },
      {
        title: "Anchored Overlay or Standalone Inline Indicator",
        body: "Wrapping an IconButton or Avatar anchors the badge to its logical top-inline-end corner (auto-mirroring to top-left in RTL), while omitting children renders an inline pill or dot suitable for list rows, tabs, and navigation items.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "badge-tokens-table",
        title: "Badge Notification Indicator Geometry (BADGE_TOKENS)",
        columns: ["Mode", "Dimensions (px)", "Inline Padding", "Default Role", "Overflow Contract"],
        rows: [
          ["dot = true", "8 × 8", "0", "error (or primary / secondary)", "Renders whenever !hidden"],
          ["count > 0", "min 18 × 18 height", "5", "error + on-error", "count > max (99) → localized '99+'"],
        ],
      },
    ],
    invariants: [
      "When count === 0 and dot === false, Badge MUST auto-hide so zero-unread states never leave visual noise.",
      "Numeric badge counts MUST format digits through Intl.NumberFormat(locale) (supporting Arabic-Indic numerals in ar-SA) and localize overflow via t('badge.overflow').",
      "Anchored placement MUST use logical inset-inline-end so badges mirror automatically to the top-left corner under dir=\"rtl\".",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Maps directly to BadgedBox(badge = { Badge { Text(count) } }) and empty Badge() for 8.dp dot indicators.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Overlay an 8pt Circle() or 18pt Capsule() on ZStack(alignment: .topTrailing) so layout direction flips automatically in RTL.",
      },
      {
        target: "Flutter",
        guidance:
          "Maps directly to Flutter Material 3 Badge() (small 8lp dot) and Badge.count(count: n, maxCount: 99).",
      },
    ],
    references: [
      {
        label: "Material 3 — Badges Specification",
        url: "https://m3.material.io/components/badges/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — Badge.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Badge.kt",
        kind: "aosp-source",
      },
    ],
  },

  carousel: {
    provenance: "official-m3e",
    provenanceSummary:
      "Material 3 Expressive carousel driven by AOSP keylines: items scroll natively and are masked to the size of the keyline they pass.",
    tokenSources: [
      "CAROUSEL_TOKENS",
      "resolveCarouselKeylineStrategy",
      "resolveCarouselItemFrame",
      "resolveCarouselSnapOffset",
    ],
    aospSources: ["Keylines.kt", "Arrangement.kt", "KeylineList.kt", "KeylineSnapPosition.kt", "Strategy.kt", "CarouselState.kt"],
    inspirationAndRationale: [
      {
        title: "Keylines, ported",
        body: "multi-browse and hero choose large / medium / small counts with AOSP Arrangement.findLowestCostArrangement: small targets large / 3 clamped to 40–56, medium is (large + small) / 2, and the arrangement whose large size is closest to preferredItemWidth wins. When the item count is lower than the keylines, small and then medium keylines are dropped.",
      },
      {
        title: "Masks, not resizing",
        body: "Every item keeps its full slot width; a mask clips it to the interpolated keyline size and its corner follows the mask (16 at the smallest keyline → 28 at the largest). Start and end steps shift keylines so the first and last items can reach the focal position.",
      },
      {
        title: "Controls only when they move something",
        body: "If every item fits, arrows and markers are not rendered. Arrows jump to the next index whose snap offset differs, so positions that resolve to the same scroll offset are skipped.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "carousel-keylines",
        title: "Keyline arrangement",
        caption: "CAROUSEL_TOKENS",
        columns: ["Variant", "Keylines (start → end)", "Alignment"],
        rows: [
          ["multi-browse", "anchor 10 · large × n · medium × 0–1 · small × 0–1 · anchor 10", "Start"],
          ["hero", "anchor 10 · large × n · small × 1 · anchor 10", "Start"],
          ["centered-hero", "anchor 10 · small · large × n · small · anchor 10 (≥ 3 items)", "Center"],
          ["uncontained", "anchor ≥ 10 · (preferredItemWidth + gap) × n · medium × 0–1 · anchor 10", "Start"],
        ],
      },
      {
        id: "carousel-metrics",
        title: "Carousel metrics",
        columns: ["Metric", "Value"],
        rows: [
          ["Item gap", "8"],
          ["Small item", "40–56 (target large / 3)"],
          ["Anchor", "10"],
          ["Corner", "16 → 28, linear in mask size"],
          ["Preferred large width", "220 (multi-browse, uncontained); container width (hero)"],
          ["Flick threshold", "0.35 px/ms"],
        ],
      },
    ],
    invariants: [
      "Keyline sizes match AOSP multiBrowseKeylineList / heroKeylineList / uncontainedKeylineList for the same width, preferred size, spacing, and item count.",
      "With no scrollable distance, prev / next and markers are not rendered; looping (loop = true) needs count ≥ 3.",
      "In RTL (direction === 'rtl'), ArrowLeft / ArrowRight keys, pointer drag sign, and prev/next chevron SVGs MUST invert direction symmetrically.",
      "Accessibility landmarks MUST expose aria-roledescription=\"carousel\" on the section, aria-roledescription=\"slide\" on each item, aria-current=\"true\" on pagination markers, and polite role=\"status\" announcements on index change.",
      "Captions sit on a solid scrim (--m3e-color-scrim at 55%) sized to the text, never a full-card gradient.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Maps to HorizontalMultiBrowseCarousel and HorizontalUncontainedCarousel / Hero layouts using CarouselDefaults and RoundedCornerShape(28.dp).",
      },
      {
        target: "SwiftUI",
        guidance:
          "Measure width with GeometryReader, compute keylines once per width, and clip each item in a ScrollView(.horizontal) with scrollTargetBehavior(.viewAligned).",
      },
      {
        target: "Flutter",
        guidance:
          "Aligns with Flutter Material 3 CarouselView / CarouselView.weighted(flexWeights: ...) with itemSnapping: true and shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Observe track clientWidth via ResizeObserver and setPointerCapture only after crossing the 6px drag deadzone so child slide click handlers still fire on stationary taps.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Carousel Specification",
        url: "https://m3.material.io/components/carousel/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — Carousel.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/carousel/Carousel.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Carousel Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/carousel/",
        kind: "aria-apg",
      },
    ],
  },

  empty: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Structured zero-data state pairing a tonal MaterialShapeView emblem with typographic hierarchy and recovery action slots.",
    tokenSources: [
      "MATERIAL_SHAPES",
      "M3E_ALL_SHAPE_NAMES",
      "M3E_TYPOGRAPHY_TOKENS",
    ],
    inspirationAndRationale: [
      {
        title: "Expressive Geometric Emblem Over Generic Illustrations",
        body: "Blank tables, empty search results, and cleared inboxes often degrade into raw muted text or mismatched stock art. Empty anchors zero-data states with an authentic MaterialShapeView polygon emblem (default cookie9Sided in secondary-container with an on-secondary-container foreground glyph) that automatically adapts to any HCT seed color.",
      },
      {
        title: "Two Density Tiers for Full-Page vs Inline Panel Contexts",
        body: "Standard mode frames full-section zero states with a 76px emblem and 24px dashed container corners, while compact mode scales down to a 56px emblem and 18px corners for sidebars, popovers, and card bodies.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "empty-density-matrix",
        title: "Empty State Standard vs Compact Geometry (Logical Pixels)",
        columns: [
          "Density Mode",
          "Container Radius & Border",
          "Padding (Block × Inline)",
          "Emblem / Glyph Size",
          "Copy Max Width & Vertical Gap",
        ],
        rows: [
          [
            "Standard (compact = false)",
            "24px, 1px dashed outline-variant",
            "36 × 24",
            "76 × 76 emblem / 28 glyph",
            "420px max-width, 14px stack gap",
          ],
          [
            "Compact (compact = true)",
            "18px, 1px dashed outline-variant",
            "22 × 16",
            "56 × 56 emblem / 22 glyph",
            "420px max-width, 10px stack gap",
          ],
        ],
      },
    ],
    invariants: [
      "The decorative polygon emblem and icon wrapper MUST carry aria-hidden=\"true\" so assistive technologies read straight through to the localized title, description, and recovery CTA buttons.",
      "Default title copy MUST resolve through useM3EI18n() (t('empty.title')) with zero hardcoded strings; description renders only when provided.",
      "Emblem fill MUST default to secondary-container paired with on-secondary-container glyph stroke so contrast holds across all 9 HCT scheme variants.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Compose a Column(horizontalAlignment = Alignment.CenterHorizontally) with a Box(Modifier.size(76.dp)) layering MaterialShapes.Cookie9Sided background behind an Icon.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Map to ContentUnavailableView on iOS 17+ or a custom VStack overlaying an icon onto MaterialShapeView(shape: .cookie9Sided, size: 76).",
      },
      {
        target: "Flutter",
        guidance:
          "Center a Column inside a dashed RRect CustomPaint container with a 76×76 Stack emblem and Wrap(spacing: 8) action bar.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Layer the SVG shape and foreground glyph via single-cell CSS Grid (grid-area: 1 / 1) rather than absolute pixel offsets so arbitrary custom icons remain perfectly centered.",
      },
    ],
    references: [
      {
        label: "Material 3 — Empty States & Communication",
        url: "https://m3.material.io/styles/shape/overview-principles",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — MaterialShapes.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt",
        kind: "aosp-source",
      },
    ],
  },

  skeleton: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Layout-preserving tonal shimmer placeholder supporting text, rectangular, rounded, circular, and all 35 MaterialShapes polygons with reduced-motion static fallback.",
    tokenSources: [
      "SKELETON_TOKENS",
      "MATERIAL_SHAPES",
      "M3E_ALL_SHAPE_NAMES",
      "cubicsToSvgPath",
    ],
    inspirationAndRationale: [
      {
        title: "Shape-Exact Loading Placeholders Eliminate Cumulative Layout Shift",
        body: "Spinners collapse container height until data arrives, causing jarring layout jumps. Skeleton mirrors exact M3E component silhouettes — including all 35 MaterialShapes polygons so polygon Avatars and MaterialShapeViews never flash as plain squares while loading.",
      },
      {
        title: "Tonal Surface Shimmer & Vestibular Motion Safety",
        body: "Instead of harsh white glare streaks that clash in dark mode, Skeleton sweeps between surface-container-high and surface-container-highest (1.65s cycle) or pulses polygon opacity (0.92 ↔ 0.48, 1.5s cycle), automatically freezing to a static tonal fill when prefers-reduced-motion: reduce is active.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "skeleton-variant-tokens",
        title: "Skeleton Variant Geometry & Animation Contract (SKELETON_TOKENS)",
        columns: [
          "Variant / Mode",
          "Corner Radius (px)",
          "Default Footprint",
          "Surface & Shimmer Physics",
        ],
        rows: [
          [
            "text",
            "6",
            "100% × 14px",
            "surface-container-high → surface-container-highest 220% linear-gradient (1.65s)",
          ],
          [
            "rounded (default)",
            "12",
            "100% × 36px",
            "surface-container-high → surface-container-highest 220% linear-gradient (1.65s)",
          ],
          [
            "rectangular",
            "4",
            "100% × 36px",
            "surface-container-high → surface-container-highest 220% linear-gradient (1.65s)",
          ],
          [
            "circular",
            "9999",
            "44 × 44px",
            "surface-container-high → surface-container-highest 220% linear-gradient (1.65s)",
          ],
          [
            "shape = M3EShapeName",
            "Normalized cubic Bézier",
            "56 × 56px SVG (scaleFactor 0.92)",
            "surface-container-highest opacity pulse 0.92 ↔ 0.48 (1.5s)",
          ],
        ],
      },
    ],
    invariants: [
      "Every Skeleton node MUST render aria-hidden=\"true\" so screen readers never announce decorative placeholder blocks; loading state MUST be communicated by aria-busy=\"true\" on the parent region.",
      "Under @media (prefers-reduced-motion: reduce) or animated = false, CSS shimmer and opacity pulse animations MUST halt completely, rendering a calm static tonal block.",
      "When shape is provided, Skeleton MUST render an inline <svg> path using cubicsToSvgPath(cubics, size, 0.92) matching the exact winding and aspect of MaterialShapeView.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Apply a custom drawWithCache linear-gradient brush sweep over SurfaceContainerHigh / SurfaceContainerHighest clipped to RoundedCornerShape or MaterialShapes.toShape(), gated by LocalAccessibilityManager / scale duration.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Use .redacted(reason: .placeholder) for typography and overlay a phaseAnimator tonal gradient clipped to MaterialPolygonShape when !accessibilityReduceMotion.",
      },
      {
        target: "Flutter",
        guidance:
          "Drive a ShaderMask linear gradient over surfaceContainerHigh containers, checking MediaQuery.disableAnimationsOf(context) for static fallback.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Animate background-position (220% 100% gradient) or opacity only — never width or height — so placeholder animation stays compositor-friendly.",
      },
    ],
    references: [
      {
        label: "MDN — prefers-reduced-motion Media Feature",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion",
        kind: "web-standard",
      },
      {
        label: "WAI-ARIA — aria-busy State",
        url: "https://www.w3.org/TR/wai-aria-1.2/#aria-busy",
        kind: "web-standard",
      },
    ],
  },

  "material-shape": {
    provenance: "official-m3e",
    provenanceSummary:
      "Complete 35-polygon AOSP MaterialShapes.kt catalog normalized to [0..1] closed cubic Bézier curves with a 1,225-pair arc-length De Casteljau morphing engine.",
    tokenSources: [
      "MATERIAL_SHAPES",
      "M3E_ALL_SHAPE_NAMES",
      "getShapeMorphPair",
      "interpolateMorphCubics",
      "cubicsToSvgPath",
      "stepSpringSimulation",
    ],
    aospSources: [
      "MaterialShapes.kt",
      "RoundedPolygon.kt",
      "Morph.kt",
      "FeatureMapping.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Why Pre-Normalized [0..1] Cubic Béziers Beat Ad-Hoc SVG Paths",
        body: "Hand-drawing rounded stars or clovers separately in SwiftUI, Flutter, and Web leads to mismatched corner smoothing, winding inversions, and twisted morphs. m3eui derives the shapes from androidx.graphics.shapes RoundedPolygon rounding into [0..1] × [0..1] space centered at (0.5, 0.5) with clockwise winding and 3-o'clock (0 rad) angular origin.",
      },
      {
        title: "1,225-Pair Arc-Length De Casteljau Subdivision (getShapeMorphPair)",
        body: "To morph cleanly between any two of the 35 shapes (e.g., 4-edge square → 12-lobe cookie12Sided), getShapeMorphPair computes the union of normalized cumulative arc-length cut points and subdivides both cubic loops via exact De Casteljau splitting so startCubics.length === endCubics.length. Every platform then performs pure linear 8-tuple interpolation C_k(p) = C_start + p × (C_end - C_start).",
      },
      {
        title: "Differences From AOSP",
        body: "Shape normalization, the oval vertex count, and how morph curves are subdivided differ from androidx.graphics.shapes. Outlines and morphs are close to Compose, not identical.",
      },
      {
        title: "Zero-Re-Render Spring Path Mutation & Overshoot Headroom",
        body: "Underdamped spatial springs (defaultSpatial ζ = 0.8, k = 380 or fastSpatial ζ = 0.6, k = 800) allow morphProgress p > 1.0 (~1.5% to ~9.5% organic overshoot). Default scaleFactor = 0.88 reserves radial margin inside the viewBox so vertices never clip against SVG bounds, while requestAnimationFrame mutates pathElement.setAttribute('d', ...) directly.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "material-shapes-catalog",
        title: "Official 35 MaterialShapes Geometric Taxonomy (M3E_ALL_SHAPE_NAMES)",
        caption: "Same 35 names as androidx.compose.material3.MaterialShapes",
        columns: ["Family", "Count", "Canonical Shape Names (M3EShapeName)"],
        rows: [
          [
            "Basic Geometry",
            "10",
            "circle, square, slanted, arch, fan, arrow, semiCircle, oval, pill, triangle",
          ],
          ["Multifaceted & Gems", "4", "diamond, clamShell, pentagon, gem"],
          [
            "Sunny & Cookie Badges",
            "7",
            "sunny, verySunny, cookie4Sided, cookie6Sided, cookie7Sided, cookie9Sided, cookie12Sided",
          ],
          [
            "Organic & Stickers",
            "10",
            "ghostish, clover4Leaf, clover8Leaf, burst, softBurst, boom, softBoom, flower, puffy, puffyDiamond",
          ],
          ["Pixel & Emotive", "4", "pixelCircle, pixelTriangle, bun, heart"],
        ],
      },
      {
        id: "material-shape-view-params",
        title: "MaterialShapeView Coordinate & Spring Parameters",
        columns: ["Parameter", "Default", "Mathematical Contract"],
        rows: [
          ["Normalized Space", "[0..1] × [0..1]", "Centroid (0.5, 0.5), CW winding, 0 rad start angle"],
          ["CubicTuple", "8 floats", "[x0, y0, c1x, c1y, c2x, c2y, x1, y1]"],
          ["size / scaleFactor", "64px / 0.88", "6% radial inset per side prevents overshoot clipping"],
          ["motionToken", "defaultSpatial", "ζ = 0.8, k = 380 (critically damped ζ = 1.0 under reduced-motion)"],
        ],
      },
    ],
    invariants: [
      "For every (from, to) pair in M3E_ALL_SHAPE_NAMES × M3E_ALL_SHAPE_NAMES (1,225 pairs), getShapeMorphPair(from, to) MUST guarantee startCubics.length === endCubics.length with matching clockwise orientation.",
      "interpolateMorphCubics(pair, p) MUST NOT clamp p to [0, 1] so underdamped spatial spring overshoot produces authentic elastic vertex expansion.",
      "Decorative MaterialShapeView instances without aria-label MUST set aria-hidden=\"true\"; labeled instances MUST expose role=\"img\" and aria-label.",
      "Under prefersReducedMotion, morph transitions MUST clamp dampingRatio to 1.0 (stiffness >= 900) to eliminate elastic bounce without abrupt visual popping.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Uses androidx.graphics.shapes.Morph(MaterialShapes.From, MaterialShapes.To) rendered via Morph.toPath(progress) inside Modifier.drawWithCache.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Export startCubics/endCubics from m3eui/tokens and implement Shape + Animatable where animatableData = morphProgress linearly interpolates the 8-tuple Path.addCurve segments.",
      },
      {
        target: "Flutter",
        guidance:
          "Implement a CustomPainter iterating the pre-matched CubicTuple list with path.cubicTo(...) scaled by size * scaleFactor around Offset(size / 2, size / 2).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Mutate SVGPathElement.setAttribute('d', cubicsToSvgPath(...)) inside requestAnimationFrame rather than reactive state to sustain 120fps across dozens of simultaneous shapes.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Shape & Morphing Principles",
        url: "https://m3.material.io/styles/shape/overview-principles",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — MaterialShapes.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/MaterialShapes.kt",
        kind: "aosp-source",
      },
      {
        label: "AOSP AndroidX Graphics Shapes — Morph.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:graphics/graphics-shapes/src/commonMain/kotlin/androidx/graphics/shapes/Morph.kt",
        kind: "aosp-source",
      },
    ],
  },

  kbd: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Inline keyboard keys and shortcuts rendered with the semantic kbd element.",
    tokenSources: ["KBD_SNIPPET_TOKENS", "parseShortcutKeys"],
    inspirationAndRationale: [
      {
        title: "One key per box",
        body: "A shortcut string such as ⌘⇧K is split into separate keys, so modifiers and keys stay legible without + separators.",
      },
      {
        title: "Keycap depth",
        body: "A 2px bottom border on a surface-container-low fill gives a key edge without shadows.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "kbd-geometry",
        title: "Kbd metrics",
        caption: "KBD_SNIPPET_TOKENS",
        columns: ["Metric", "md", "sm"],
        rows: [
          ["Height", "22", "19"],
          ["Radius", "6", "6"],
          ["Padding-inline", "6", "5"],
          ["Font", "11.5 / 600 monospace", "10.5 / 600 monospace"],
          ["Border", "1 outline-variant, bottom 2", "1 outline-variant, bottom 2"],
        ],
      },
    ],
    invariants: [
      "A shortcut renders as one kbd element with a span per key, so it is read as a single keyboard input.",
      "Platform modifier symbols are not translated; the shortcut string comes from the caller.",
    ],
    crossPlatformNotes: [
      { target: "SwiftUI", guidance: ".keyboardShortcut displays shortcuts natively in menus." },
    ],
    references: [
      { label: "HTML — the kbd element", url: "https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element", kind: "web-standard" },
    ],
  },
};
