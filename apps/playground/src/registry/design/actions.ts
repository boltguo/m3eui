import type { ComponentDesignSpec } from "../types";

export const ACTIONS_DESIGN_SPECS: Readonly<Record<string, ComponentDesignSpec>> = {
  button: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive five-size button and toggle button specification aligned 1:1 with AOSP Jetpack Compose Material 3 1.4/1.5.",
    tokenSources: ["BUTTON_SIZE_SPECS", "EXPRESSIVE_MOTION_SCHEME", "M3E_STATE_LAYER_TOKENS"],
    aospSources: [
      "Button.kt",
      "ToggleButton.kt",
      "ButtonSmallTokens.kt",
      "ButtonLargeTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Five-Tier Expressive Scale (XS to XL)",
        body: "Material 3 Expressive expands the single 40px legacy button into a 5-step scale (32px, 40px, 56px, 96px, 136px) so primary hero actions (camera shutters, media transport, checkout CTAs) establish unmistakable focal hierarchy through physical scale rather than drop-shadow noise.",
      },
      {
        title: "Minimum 95ms Press-Hold Latch & Corner Tightening",
        body: "On pointerdown or keyboard activation, all four corners tighten toward pressedCornerRadius under the underdamped fastSpatial spring (ζ = 0.6, k = 800). Because rapid human taps last only 15–30ms, a 95ms minimum hold latch ensures the spring visibly compresses before releasing.",
      },
      {
        title: "Shape Inversion on ToggleButton Selection",
        body: "To avoid relying on color alone (WCAG 1.4.1), ToggleButton inverts its resting silhouette when selected: a resting pill (round) morphs into a soft rounded rectangle (selectedCornerRadius), while a resting square morphs into a full pill (height / 2).",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "button-size-matrix",
        title: "Five-Size Logical Pixel Matrix (1:1 px / dp / pt)",
        caption: "Button & ToggleButton dimensions and corner radii across XS–XL",
        columns: [
          "Size",
          "Height",
          "Inline Pad",
          "Icon / Gap",
          "Font / Line",
          "Round Rest",
          "Square Rest",
          "Pressed Radius",
          "Toggle Selected",
        ],
        rows: [
          ["xs", "32", "12", "20 / 8", "14 / 20", "16", "12", "8", "12 (or 16 if square)"],
          ["sm", "40", "16", "20 / 8", "14 / 20", "20", "12", "8", "12 (or 20 if square)"],
          ["md", "56", "24", "24 / 8", "16 / 24", "28", "16", "12", "16 (or 28 if square)"],
          ["lg", "96", "48", "32 / 12", "24 / 32", "48", "28", "16", "28 (or 48 if square)"],
          ["xl", "136", "64", "40 / 16", "32 / 40", "68", "28", "16", "28 (or 68 if square)"],
        ],
      },
    ],
    invariants: [
      "Corner radius morphing MUST use fastSpatial (ζ = 0.6, k = 800); background, border, and foreground color transitions MUST use fastEffects (ζ = 1.0, k = 3800) with zero overshoot.",
      "Corner state priority strictly follows pressed > selected > rest so pressing an already-selected ToggleButton still visibly compresses its corners.",
      "When href or render={<Link />} is supplied, render a native <a> anchor without role=\"button\" or type=\"button\" while preserving corner spring physics.",
      "Five surface emphases map deterministically to HCT roles: filled (primary), tonal (secondary-container), elevated (surface-container-low + level1 shadow), outlined (outline-variant 1px), and text (transparent).",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Maps directly to Button / FilledTonalButton / ToggleButton with ButtonDefaults.shapesFor(height) and spring(dampingRatio = 0.6f, stiffness = 800f).",
      },
      {
        target: "SwiftUI",
        guidance: "Drive RoundedRectangle(cornerRadius: r, style: .continuous) via withAnimation(.spring(mass: 1, stiffness: 800, damping: 33.94)) and enforce a 95ms Task.sleep minimum press latch.",
      },
      {
        target: "Flutter",
        guidance: "Animate RoundedRectangleBorder(borderRadius: BorderRadius.circular(r)) with SpringSimulation(SpringDescription.withDampingRatio(mass: 1, stiffness: 800, ratio: 0.6)).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Step an analytical 2nd-order ODE in requestAnimationFrame writing element.style.borderRadius directly to avoid React/VDOM re-renders on every frame.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Buttons Overview",
        url: "https://m3.material.io/components/all-buttons",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — Button.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Button.kt",
        kind: "aosp-source",
      },
      {
        label: "AOSP Compose Material 3 — ToggleButton.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ToggleButton.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Button Primitive",
        url: "https://base-ui.com/react/components/button",
        kind: "base-ui",
      },
    ],
  },

  "icon-button": {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive 5-size × 3-width (15-configuration) icon button and toggle icon button specification.",
    tokenSources: ["ICON_BUTTON_SIZE_SPECS", "resolveIconButtonGeometry", "EXPRESSIVE_MOTION_SCHEME"],
    aospSources: [
      "IconButton.kt",
      "XSmallIconButtonTokens.kt",
      "SmallIconButtonTokens.kt",
      "MediumIconButtonTokens.kt",
      "LargeIconButtonTokens.kt",
      "XLargeIconButtonTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "15-Point Aspect Ratio Grid (Narrow / Default / Wide)",
        body: "Legacy M3 restricted icon buttons to a single 40×40 circle. M3E introduces narrow, default, and wide horizontal footprints at every height (W = iconSize + 2 × paddingInline), letting dense formatting toolbars use narrow pills while primary media controls expand into wide capsules.",
      },
      {
        title: "Deterministic Shape Inversion for Toggle States",
        body: "IconToggleButton flips between pill and rounded-square silhouettes on selection (e.g., SM round 20px ↔ 12px) while tightening to 8px on press, giving color-vision-deficient and forced-colors users unambiguous geometric state feedback.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "icon-button-grid",
        title: "Height × Width Variant Matrix (Logical Pixels)",
        caption: "Exact widths (narrow / default / wide), icon sizes, stroke widths, and corner radii",
        columns: [
          "Size",
          "Height",
          "Icon",
          "Narrow W",
          "Default W",
          "Wide W",
          "Round / Square",
          "Pressed",
          "Outline",
        ],
        rows: [
          ["xs", "32", "20", "28 (pad 4)", "32 (pad 6)", "40 (pad 10)", "16 / 12", "8", "1"],
          ["sm", "40", "24", "32 (pad 4)", "40 (pad 8)", "52 (pad 14)", "20 / 12", "8", "1"],
          ["md", "56", "24", "48 (pad 12)", "56 (pad 16)", "72 (pad 24)", "28 / 16", "12", "1"],
          ["lg", "96", "32", "64 (pad 16)", "96 (pad 32)", "128 (pad 48)", "48 / 28", "16", "2"],
          ["xl", "136", "40", "104 (pad 32)", "136 (pad 48)", "184 (pad 72)", "68 / 28", "16", "3"],
        ],
      },
    ],
    invariants: [
      "Every IconButton and IconToggleButton requires a non-empty aria-label; inner SVG glyphs MUST carry aria-hidden=\"true\".",
      "Minimum hit target never drops below 24×24px (WCAG 2.5.8 AA); coarse pointers expand hit slop around xs controls.",
      "Priority order pressed > selected > rest governs resolveIconButtonGeometry across all 15 size/width combinations.",
      "When href is passed, IconButton renders a semantic <a> anchor without role=\"button\" so browser link context menus work natively.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Aligns with IconButton / FilledIconToggleButton + IconButtonDefaults.shapes() and width variants in Compose Material 3 1.4+.",
      },
      {
        target: "SwiftUI",
        guidance: "Frame button explicitly to (width, height) from ICON_BUTTON_SIZE_SPECS and clip with RoundedRectangle(cornerRadius: r, style: .continuous).",
      },
      {
        target: "Flutter",
        guidance: "Use IconButton.filled / filledTonal / outlined with BoxConstraints.tightFor(width: w, height: h) and spring-animated borderRadius.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Reuse resolveIconButtonGeometry({ size, widthVariant, shape, isPressed, isSelected }) directly from a shared pure-TS token module.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Icon Buttons",
        url: "https://m3.material.io/components/icon-buttons/overview",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — IconButton.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/IconButton.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Button & Toggle Button Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/button/",
        kind: "aria-apg",
      },
    ],
  },

  "button-group": {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive ButtonGroup & ConnectedButtonGroup replacing legacy M3 SegmentedButton with zero-sum neighbor width borrowing and seam-corner morphing.",
    tokenSources: [
      "BUTTON_GROUP_TOKENS",
      "resolveConnectedGroupCorners",
      "computeButtonGroupWidths",
      "flipCornersHorizontal",
    ],
    aospSources: [
      "ButtonGroup.kt",
      "ButtonGroupSamples.kt",
      "ConnectedButtonGroupSmallTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Zero-Sum 15% Neighbor Width Borrowing (Standard Mode)",
        body: "When item i is pressed in standard mode (gap = 12px, expandedRatio = 0.15), it expands by up to 15% of its resting width by borrowing Δ equally from its immediate left and right neighbors (clamped to each neighbor's horizontal padding so labels never clip or truncate), keeping total group width strictly constant: ∑ w'_k ≡ ∑ w_k.",
      },
      {
        title: "Why Connected Mode Defaults to expandedRatio = 0",
        body: "Following AOSP SingleSelectConnectedButtonGroupSample (ButtonGroupSamples.kt L158–252), connected segmented switchers (gap = 2px) default to 0% width expansion. High-frequency view switchers already express tactile feedback via inner seam corner morphing (8px → 4px press → full pill on selection); adding width expansion by default would jitter adjacent tab labels horizontally.",
      },
      {
        title: "Bold Label Advance-Width Reservation",
        body: "Selected segments promote typography weight without shifting container width by reserving the bold label's advance width in a zero-height hidden ::after pseudo-element (content: attr(data-text)).",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "button-group-modes",
        title: "Standard vs Connected Topology Contract ([tl, tr, br, bl], pill = H/2)",
        caption: "Seam spacing, width borrowing ratio, and corner state transitions",
        columns: [
          "Variant",
          "Gap",
          "Default Ratio",
          "Unselected Rest",
          "Pressed (isPressed)",
          "Selected (!isPressed)",
        ],
        rows: [
          [
            "standard",
            "12px",
            "0.15 (15%)",
            "[pill, pill, pill, pill]",
            "[r_press, r_press, r_press, r_press] + borrow 15% width",
            "Toggle shape inversion [r_sel, r_sel, r_sel, r_sel]",
          ],
          [
            "connected (first)",
            "2px",
            "0 (opt-in 0.15)",
            "[pill, 8, 8, pill]",
            "[pill, 4, 4, pill]",
            "[pill, pill, pill, pill]",
          ],
          [
            "connected (middle)",
            "2px",
            "0 (opt-in 0.15)",
            "[8, 8, 8, 8]",
            "[4, 4, 4, 4]",
            "[pill, pill, pill, pill]",
          ],
          [
            "connected (last)",
            "2px",
            "0 (opt-in 0.15)",
            "[8, pill, pill, 8]",
            "[4, pill, pill, 4]",
            "[pill, pill, pill, pill]",
          ],
        ],
      },
    ],
    invariants: [
      "In RTL direction, outer end-cap corners on first and last connected items MUST be mirrored horizontally via flipCornersHorizontal ([tl, tr, br, bl] → [tr, tl, bl, br]).",
      "Width borrowing MUST be absorbed 100% by inline padding; label spans set flex-shrink: 0 and white-space: nowrap so neighbors never flash ellipsis during spring overshoot.",
      "Never dynamically insert an unreserved checkmark icon on click in connected mode unless equal icon slot width is pre-allocated, preventing baseWidths re-measurement jumps.",
      "Single-select connected groups expose role=\"radiogroup\" / aria-checked or toggle semantics with roving arrow-key navigation.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Maps to ButtonGroup(expandedRatio = 0.15f) with Modifier.animateWidth(interactionSource) and ButtonGroupDefaults.connectedLeadingButtonShapes().",
      },
      {
        target: "SwiftUI",
        guidance: "Implement a custom Layout (iOS 16+) caching natural child widths in sizeThatFits and distributing computeButtonGroupWidths in placeSubviews alongside UnevenRoundedRectangle.",
      },
      {
        target: "Flutter",
        guidance: "Use CustomMultiChildLayout to measure resting widths once and assign tight width constraints driven by a fastSpatial SpringSimulation.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Measure resting getBoundingClientRect().width on mount/resize only, then drive inline style.width from computeButtonGroupWidths(baseWidths, pressProgress).",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Button Groups",
        url: "https://m3.material.io/components/button-groups/overview",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — ButtonGroup.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ButtonGroup.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Toggle Group Primitive",
        url: "https://base-ui.com/react/components/toggle-group",
        kind: "base-ui",
      },
    ],
  },

  "split-button": {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive asymmetric two-piece SplitButton with optical chevron centering (-0.11 × Δr) and concentric segmented menu popup.",
    tokenSources: [
      "SPLIT_BUTTON_TOKENS",
      "SPLIT_BUTTON_SPECS",
      "SEGMENTED_MENU_TOKENS",
      "resolveSplitButtonGeometry",
    ],
    aospSources: [
      "SplitButton.kt",
      "SplitButtonSmallTokens.kt",
      "SplitButtonMediumTokens.kt",
      "MenuDefaults.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Softening Inner Seam & Full-Pill Detachment",
        body: "SplitButton joins a primary leading action and a trailing menu trigger across a 2px seam. Unlike ConnectedButtonGroup, its resting inner corners start crisp (4px on XS–MD) and soften outward (8px/12px) on hover/press; when the menu opens, the trailing button detaches into a symmetric full pill [H/2, H/2, H/2, H/2] while rotating its chevron 180° via fastSpatial.",
      },
      {
        title: "Optical Centering Compensation (Δx = -0.11 × (r_right - r_left))",
        body: "Because the closed trailing trigger is flat on the inner seam (4px) and semicircular on the outer edge (20px at SM), geometric centering makes the chevron appear visually pushed toward the curved edge. Ported directly from AOSP Modifier.horizontalCenterOptically, an inline offset of -0.11 × Δr (-1.76px at SM rest) optically centers the glyph and smoothly springs back to 0px as the trigger becomes a symmetric pill.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "split-button-specs",
        title: "Five-Size SplitButton Geometry (Gap = 2px)",
        caption: "Leading/trailing metrics and inner seam radii across XS–XL",
        columns: [
          "Size",
          "Height",
          "Outer Pill",
          "Inner Rest → Active",
          "Leading Pad [S, E]",
          "Trailing Width",
          "Chevron Size",
          "Closed Optical Δx",
        ],
        rows: [
          ["xs", "32", "16", "4 → 8", "[12, 10]", "48", "22", "-1.32px"],
          ["sm", "40", "20", "4 → 12", "[16, 12]", "48", "22", "-1.76px"],
          ["md", "56", "28", "4 → 12", "[24, 24]", "56", "26", "-2.64px"],
          ["lg", "96", "48", "8 → 20", "[48, 48]", "96", "38", "-4.40px"],
          ["xl", "136", "68", "12 → 20", "[64, 64]", "136", "50", "-6.16px"],
        ],
      },
    ],
    invariants: [
      "Trailing menu trigger MUST expose aria-haspopup=\"menu\", aria-expanded, and an explicit accessible label distinct from the leading primary button.",
      "In RTL, flip both leadingCorners and trailingCorners horizontally and negate opticalOffsetPx so the chevron shifts toward the RTL inner seam.",
      "Opened menu popup uses concentric geometry: 16px outer popup radius, 4px padding, 2px item gap, 12px outer item corners, and 4px inner item corners.",
      "Chevron rotation (0° → 180°) runs on fastSpatial (ζ = 0.6, k = 800), producing a crisp ~9.5% expressive settle.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Maps 1:1 to SplitButtonLayout with SplitButtonDefaults.LeadingButton and SplitButtonDefaults.TrailingButton.",
      },
      {
        target: "SwiftUI",
        guidance: "Place two Buttons in HStack(spacing: 2) with UnevenRoundedRectangle backgrounds; apply .offset(x: opticalOffset) and .rotationEffect(.degrees(chevronDeg)) to the chevron.",
      },
      {
        target: "Flutter",
        guidance: "Compose Row(spacing: 2) with RoundedRectangleBorder(borderRadius: BorderRadius.only(...)) and Transform.translate on the trailing icon.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Bind independent CSS translate and rotate properties on the chevron span alongside corner spring radii from resolveSplitButtonGeometry.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Split Button",
        url: "https://m3.material.io/components/split-button/overview",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — SplitButton.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/SplitButton.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Menu Primitive",
        url: "https://base-ui.com/react/components/menu",
        kind: "base-ui",
      },
    ],
  },

  fab: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive FAB, ExtendedFAB, and morphing FABMenu (ToggleFAB + bottom-up staggered capsule actions).",
    tokenSources: [
      "FAB_SIZE_SPECS",
      "EXTENDED_FAB_SPECS",
      "TOGGLE_FAB_SPECS",
      "FAB_MENU_TOKENS",
      "resolveToggleFabGeometry",
    ],
    aospSources: [
      "FloatingActionButton.kt",
      "FloatingActionButtonMenu.kt",
      "FabMenuBaselineTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Continuous ToggleFAB Morphing (S₀ → 56px Circle + 45° Icon Rotation)",
        body: "Instead of abruptly swapping icons when opening a speed-dial menu, M3E morphs the trigger FAB from its resting squircle (e.g., MD 80×80 r=20 or LG 96×96 r=28) into a compact 56×56 full-circle close button (r=28) while rotating the '+' glyph 45° into '×' and shifting container color from primary-container to primary.",
      },
      {
        title: "Bottom-Up Staggered Capsule Choreography",
        body: "FABMenu items (56px height, 28px full-pill radius, 4px vertical gap) emerge sequentially from bottom to top with Δt_open(i) = (N - 1 - i) × 35ms on open, and collapse top-down with Δt_close(i) = i × 25ms on close.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "fab-size-matrix",
        title: "FAB, ExtendedFAB & ToggleFAB Scale (Logical Pixels)",
        caption: "Resting squircle radii, pressed tightening, and FABMenu collapsed-to-expanded interpolation",
        columns: [
          "Component / Tier",
          "Dimensions",
          "Rest Radius",
          "Pressed Radius",
          "Icon Size",
          "FABMenu Open Target",
        ],
        rows: [
          ["FAB xs", "40 × 40", "12", "8", "24", "—"],
          ["FAB sm (Baseline)", "56 × 56", "16", "12", "24", "56 × 56, r=28, icon=20"],
          ["FAB md", "80 × 80", "20", "14", "28", "56 × 56, r=28, icon=20"],
          ["FAB lg", "96 × 96", "28", "18", "36", "56 × 56, r=28, icon=20"],
          ["ExtendedFAB sm / md / lg", "H: 56 / 80 / 96", "16 / 20 / 28", "12 / 14 / 18", "24 / 28 / 32", "Collapses inline width smoothly"],
          ["FABMenu Item", "H: 56 (auto W)", "28 (pill)", "16", "24 (gap 8)", "Stagger 35ms open / 25ms close"],
        ],
      },
    ],
    invariants: [
      "ToggleFAB size and radius interpolate via fastSpatial (p > 1 overshoot clamped safely on radius), while primary-container → primary color uses fastEffects (ζ = 1.0).",
      "FABMenu item entrance pairs defaultSpatial (translateY 18px → 0, scale 0.88 → 1) with critically damped fastEffects opacity so items never flicker.",
      "Pressing Escape while FABMenu is open MUST collapse the menu and restore keyboard focus to ToggleFAB.",
      "Four tonal palettes are supported across FAB & ExtendedFAB: primaryContainer, primary, secondaryContainer, and tertiaryContainer.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Maps directly to SmallFloatingActionButton, MediumFloatingActionButton, LargeFloatingActionButton, ExtendedFloatingActionButton, and FloatingActionButtonMenu.",
      },
      {
        target: "SwiftUI",
        guidance: "Drive ToggleFAB frame and clipShape from a single spring progress p, and stagger menu items with .transition(.scale(scale: 0.88).combined(with: .opacity)).animation(.spring.delay(...)).",
      },
      {
        target: "Flutter",
        guidance: "Use Stack + Positioned aligned to bottomEnd, driving each menu capsule with Interval-staggered SpringSimulation controllers.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Use resolveToggleFabGeometry(size, progress) for exact interpolated size, corner radius, icon scale, and 45° rotation.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — FAB & Extended FAB",
        url: "https://m3.material.io/components/floating-action-button/overview",
        kind: "m3-spec",
      },
      {
        label: "Material 3 Expressive — FAB Menu",
        url: "https://m3.material.io/components/fab-menu/overview",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — FloatingActionButtonMenu.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/FloatingActionButtonMenu.kt",
        kind: "aosp-source",
      },
    ],
  },

  "floating-toolbar": {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive FloatingToolbar replacing legacy edge-docked BottomAppBar with a detached concentric pill bar in horizontal and vertical orientations.",
    tokenSources: ["FLOATING_TOOLBAR_TOKENS", "EXPRESSIVE_MOTION_SCHEME"],
    aospSources: ["FloatingToolbar.kt", "FloatingToolbarTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Detached Concentric Capsule (32px Outer − 8px Padding = 24px Inner)",
        body: "M3E deprecates full-bleed bottom app bars in favor of a floating 64px-cross-axis capsule inset at least 16px from viewport edges. With 8px uniform padding around 48px action buttons, the inner button radius (24px) and outer bar radius (32px) share an exact geometric center, eliminating uneven corner pinching.",
      },
      {
        title: "Standard vs Vibrant Dual-Theme Contrast",
        body: "Standard theme uses surface-container-high for low-distraction reading flows, whereas Vibrant theme uses primary-container with high-contrast surface-container-lowest active pills to anchor creative or media canvases.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "floating-toolbar-contract",
        title: "FloatingToolbar Geometry & Theme Roles",
        caption: "Concentric capsule dimensions and color role mapping",
        columns: ["Parameter / Role", "Standard Theme", "Vibrant Theme", "Geometric Rule"],
        rows: [
          ["Cross-Axis Size", "64px", "64px", "Height in horizontal mode; width in vertical mode"],
          ["Outer Radius / Padding", "32px / 8px", "32px / 8px", "Full capsule (64 / 2 = 32)"],
          ["Action Item Size / Radius", "48px / 24px", "48px / 24px", "Strict concentricity: 32 − 8 = 24"],
          ["Item Gap / Companion FAB Gap", "4px / 8px", "4px / 8px", "16px minimum viewport safe-area margin"],
          ["Container Surface", "surface-container-high", "primary-container", "level3 elevation shadow"],
          ["Active Item Pill", "secondary-container", "surface-container-lowest", "Pressed corner tightens 24 → 12 via fastSpatial"],
        ],
      },
    ],
    invariants: [
      "Exposes role=\"toolbar\" and aria-orientation (\"horizontal\" | \"vertical\") with single-tab-stop roving arrow-key focus via @base-ui/react/toolbar.",
      "Internal dividers MUST render via CSS border rather than background-color alone so they remain visible in Windows High Contrast (forced-colors: active).",
      "Companion FAB sits outside the toolbar role group separated by an 8px gap so toolbar roving focus remains pure.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Maps 1:1 to HorizontalFloatingToolbar and VerticalFloatingToolbar with FloatingToolbarDefaults.standardFloatingToolbarColors() / vibrantFloatingToolbarColors().",
      },
      {
        target: "SwiftUI",
        guidance: "Render HStack/VStack(spacing: 4) with .padding(8), .background(.regularMaterial or tonal token, in: Capsule()), and safeAreaInset(edge: .bottom).",
      },
      {
        target: "Flutter",
        guidance: "Wrap action IconButtons in Material(shape: StadiumBorder(), elevation: 6) padded by EdgeInsets.all(8) inside SafeArea.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Implement roving tabindex matching aria-orientation (Left/Right for horizontal, Up/Down for vertical) and Home/End jump keys.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Toolbars (Floating Toolbar)",
        url: "https://m3.material.io/components/toolbars/overview",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — FloatingToolbar.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/FloatingToolbar.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Toolbar Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/",
        kind: "aria-apg",
      },
      {
        label: "Base UI — Toolbar Primitive",
        url: "https://base-ui.com/react/components/toolbar",
        kind: "base-ui",
      },
    ],
  },
};
