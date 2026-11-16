import type { ComponentDesignSpec } from "../types";

export const NAVIGATION_DESIGN_SPECS: Readonly<Record<string, ComponentDesignSpec>> = {
  navigation: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive adaptive navigation suite spanning NavigationBar, NavigationRail, spring-collapsible WideNavigationRail, NavigationDrawer, and ResizeObserver-driven NavigationSuite.",
    tokenSources: [
      "NAVIGATION_TOKENS",
      "WIDE_NAVIGATION_RAIL_TOKENS",
      "NAVIGATION_DRAWER_TOKENS",
      "NAVIGATION_SUITE_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: [
      "NavigationBar.kt",
      "NavigationRail.kt",
      "WideNavigationRail.kt",
      "NavigationDrawer.kt",
      "NavigationSuiteScaffold.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Container-Driven Adaptive Topology (NavigationSuite)",
        body: "Viewport media queries fail inside resizable split panes, IDE docks, and preview frames. NavigationSuite measures its own host inline size via ResizeObserver and switches seamlessly across < 600px bottom NavigationBar, 600–839px NavigationRail (80px), and >= 840px WideNavigationRail, matching the M3 compact / medium / expanded window size classes.",
      },
      {
        title: "Spring-Collapsible WideNavigationRail (96px ↔ 220px)",
        body: "Material 3 Expressive introduces WideNavigationRail to bridge narrow icon rails and full permanent drawers. Toggling expansion drives container width between 96px and 220px under defaultSpatial (ζ = 0.8, k = 380), transitioning items between 56×32px vertical indicator pills and 48px-tall full-row 24px capsules (tightening to 12px on press).",
      },
      {
        title: "Permanent & Gesture Modal NavigationDrawer + Progressive ScrollSpy",
        body: "NavigationDrawer renders either a 280px inline permanent surface (28px corners) with optional native CSS scroll-target-group / IntersectionObserver scroll-spy, or a swipe-dismissible @base-ui/react/drawer modal sheet with RTL-mirrored 28px end-edge corners.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "navigation-family-geometry",
        title: "Navigation Component Family Geometry Matrix (px = dp / pt)",
        caption: "Exact tokens from NAVIGATION_TOKENS, WIDE_NAVIGATION_RAIL_TOKENS, and NAVIGATION_DRAWER_TOKENS",
        columns: [
          "Component",
          "Container Size",
          "Corner Radius",
          "Active Indicator / Item Spec",
          "Motion Physics",
        ],
        rows: [
          [
            "NavigationBar",
            "min-height: 72, 100% width",
            "0 (docked bar)",
            "56 × 32 pill (r = 16) secondary-container",
            "Pill X-scale 0.35 → 1.0 via fastSpatial (ζ = 0.6, k = 800)",
          ],
          [
            "NavigationRail",
            "width: 84",
            "0 (docked rail)",
            "56 × 32 pill (r = 16) + optional FAB header",
            "Pill X-scale 0.35 → 1.0 via fastSpatial",
          ],
          [
            "WideNavigationRail",
            "96 collapsed ↔ 220 expanded",
            "Item r = 24 rest / 12 pressed",
            "48 min-height horizontal pill when expanded",
            "Width via defaultSpatial (ζ = 0.8, k = 380); press via fastSpatial",
          ],
          [
            "NavigationDrawer",
            "width: 280 (pad 12)",
            "28 (modal: 0 28 28 0 LTR / 28 0 0 28 RTL)",
            "48 min-height item (r = 24 rest / 12 pressed)",
            "Modal swipe sheet + fastSpatial item press",
          ],
        ],
      },
      {
        id: "navigation-suite-breakpoints",
        title: "NavigationSuite Container Width Breakpoints (NAVIGATION_SUITE_TOKENS)",
        columns: ["Container Width (W)", "Resolved Mode", "Rendered Surface"],
        rows: [
          ["W < 600px", "\"bar\"", "Bottom NavigationBar (64px height)"],
          ["600px <= W < 840px", "\"rail\"", "Leading NavigationRail (80px width)"],
          ["W >= 840px", "\"wide-rail\"", "Leading collapsible WideNavigationRail (96px ↔ 220px)"],
        ],
      },
    ],
    invariants: [
      "Active destinations MUST expose aria-current=\"page\" (or aria-current=\"true\" for in-page #hash scroll-spy anchors) alongside non-color indicator pill geometry.",
      "NavigationBar and NavigationRail indicator pills MUST expand horizontally from scaleX(0.35) to scaleX(1) using fastSpatial while opacity transitions critically damped without overshoot.",
      "Modal NavigationDrawer MUST mirror its slide origin, swipe dismissal direction, and asymmetric 28px end corners automatically when direction === 'rtl'.",
      "WideNavigationRail collapse toggle button MUST synchronize aria-expanded and localized aria-label (navigation.collapseRail / navigation.expandRail).",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Corresponds to NavigationSuiteScaffold, NavigationBar, NavigationRail, WideNavigationRail, and ModalNavigationDrawer / PermanentNavigationDrawer.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Map < 600pt to TabView, 600–839pt to a custom 80pt rail column, and >= 840pt to NavigationSplitView(columnVisibility:) with a 220pt–280pt sidebar.",
      },
      {
        target: "Flutter",
        guidance:
          "Switch via LayoutBuilder constraints.maxWidth (< 600, < 840, >= 840) between NavigationBar, NavigationRail(extended: false), and NavigationRail(extended: true, minExtendedWidth: 220).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Progressively enhance permanent drawer scroll-spy with CSS scroll-target-group: auto and :target-current where supported, falling back to IntersectionObserver.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Navigation Bar, Rail & Drawer",
        url: "https://m3.material.io/components/navigation-rail/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — WideNavigationRail.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/WideNavigationRail.kt",
        kind: "aosp-source",
      },
      {
        label: "AOSP Compose Material 3 Adaptive — NavigationSuiteScaffold.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3-adaptive-navigation-suite/src/commonMain/kotlin/androidx/compose/material3/adaptive/navigationsuite/NavigationSuiteScaffold.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Drawer Primitive",
        url: "https://base-ui.com/react/components/drawer",
        kind: "base-ui",
      },
    ],
  },

  breadcrumb: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Semantic <nav><ol> hierarchy trail combining WAI-ARIA Breadcrumb APG rules, bold width-locked terminal crumbs, overflow DropdownMenu collapsing, and RTL chevron mirroring.",
    tokenSources: ["SEGMENTED_MENU_TOKENS", "M3E_TYPOGRAPHY_TOKENS"],
    inspirationAndRationale: [
      {
        title: "Desktop & Web Deep-Hierarchy Orientation",
        body: "Native mobile apps traverse shallow stacks via TopAppBar back arrows, whereas documentation portals, cloud consoles, and file browsers expose multi-level hierarchies. Breadcrumb adapts M3E typography, 8px pill hover targets, and segmented overflow menus to semantic <nav><ol><li><a> HTML.",
      },
      {
        title: "Zero-Shift Bold Terminal Crumb Reservation",
        body: "Highlighting the current terminal route with font-weight: 700 normally widens its bounding box and jitters adjacent crumbs during client-side navigation. Each label reserves its bold inline width upfront via an invisible ::after { content: attr(data-text); font-weight: 700; height: 0 } pseudo-element.",
      },
      {
        title: "Silent CSS Separators & Accessible Middle Ellipsis Menu",
        body: "Separators render via CSS content: '/' / '' (or '›' / '' mirrored to '‹' / '' under :dir(rtl)) with empty alt text so screen readers never announce 'slash' or 'greater than' between items, while maxItems >= 3 collapses middle ancestors into a keyboard-navigable Segmented DropdownMenu.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "breadcrumb-geometry",
        title: "Breadcrumb Crumb & Overflow Geometry (Logical Pixels)",
        columns: [
          "Element",
          "Dimensions & Radius",
          "Typography",
          "RTL / Accessibility Behavior",
        ],
        rows: [
          [
            "Crumb Link (.m3e-breadcrumb__link)",
            "min-height: 26, pad-inline: 6, r = 8, gap: 5",
            "13.5px / 20px, w500 (w700 when current)",
            "aria-current=\"page\" on terminal item; render prop supports router <Link>",
          ],
          [
            "Separator (::before)",
            "Inline flex gap",
            "13px '/' or 15px '›'",
            "CSS alt text '' suppresses SR announcement; :dir(rtl) flips '›' → '‹'",
          ],
          [
            "Ellipsis Trigger (.m3e-breadcrumb__ellipsis)",
            "Compact button → 16px Segmented DropdownMenu",
            "Localized aria-label={t('breadcrumb.more')}",
            "Activated when maxItems >= 3 and items.length > maxItems",
          ],
        ],
      },
    ],
    invariants: [
      "Markup MUST render <nav aria-label={t('breadcrumb.ariaLabel')}><ol><li>...</li></ol></nav> with aria-current=\"page\" strictly on the last item.",
      "Decorative separators MUST NOT exist as DOM text nodes or announceable glyphs in the accessibility tree.",
      "When maxItems >= 3 collapses the trail, the first root ancestor and the last two trailing items MUST remain visible around the DropdownMenu trigger.",
      "Chevron separators MUST mirror automatically from '›' to '‹' in RTL layouts.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "On Desktop/Web Compose targets, lay out a Row(verticalAlignment = Alignment.CenterVertically) with SemanticsPropertyReceiver.isTraversalGroup = true and DropdownMenu for collapsed ancestors.",
      },
      {
        target: "SwiftUI",
        guidance:
          "On macOS/iPadOS path bars, pair HStack with Image(systemName: 'chevron.forward') (auto-flips in .rightToLeft layoutDirection) and Menu for truncated middle segments.",
      },
      {
        target: "Flutter",
        guidance:
          "Render Row with Directionality-aware Icons.chevron_right and Semantics(container: true, label: 'Breadcrumb').",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Support element composition (render={<RouterLink to=\"...\" />}) so SPA client routers intercept clicks without losing aria-current=\"page\" or focus-visible rings.",
      },
    ],
    references: [
      {
        label: "WAI-ARIA APG — Breadcrumb Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/",
        kind: "aria-apg",
      },
      {
        label: "MDN — CSS content Alternative Text Syntax",
        url: "https://developer.mozilla.org/en-US/docs/Web/CSS/content",
        kind: "web-standard",
      },
    ],
  },

  pagination: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Page navigation bar extrapolated from M3E IconButton and ToggleButton shape-inversion physics (round pill → 12px active rounded square) with constant-slot ellipsis windowing.",
    tokenSources: [
      "ICON_BUTTON_SIZE_SPECS",
      "SHAPE_CORNER_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    inspirationAndRationale: [
      {
        title: "Shape Inversion Physics Borrowed from IconToggleButton",
        body: "Material 3 has no native mobile pagination widget because mobile feeds infinite-scroll. For paginated web tables and search results, Pagination directly applies M3E IconToggleButton geometry: inactive page buttons rest as circular pills (20px md / 17px sm), pressing compresses corners to 8px via fastSpatial (ζ = 0.6, k = 800), and the active page settles into a 12px secondary-container rounded square.",
      },
      {
        title: "Constant-Slot Ellipsis Windowing Prevents Button Drift",
        body: "Naive pagination bars change total item count when moving from page 1 (one ellipsis) to page 5 (two ellipses), causing the Next button to jump under the user's cursor. buildPageTokens locks visible slot count to 2 × siblingCount + 5 (7 slots at default siblingCount = 1) whenever totalPages exceeds that threshold.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "pagination-size-and-corner-matrix",
        title: "Pagination Button Size & Corner Morphing Matrix (Logical Pixels)",
        columns: [
          "Size Tier",
          "Min Box Footprint",
          "Inactive Rest Radius",
          "Pressed Radius",
          "Active Page Radius (aria-current=\"page\")",
          "Active Surface Role",
        ],
        rows: [
          [
            "sm",
            "34 × 34",
            "17 (full circle/pill)",
            "8",
            "12 (rounded square)",
            "secondary-container / on-secondary-container",
          ],
          [
            "md (default)",
            "40 × 40",
            "20 (full circle/pill)",
            "8",
            "12 (rounded square)",
            "secondary-container / on-secondary-container",
          ],
        ],
      },
    ],
    invariants: [
      "Corner radius priority on page buttons MUST obey pressed (8px) > active (12px) > inactive rest (boxSize / 2), animated via fastSpatial (ζ = 0.6, k = 800).",
      "For totalPages > 2 × siblingCount + 5, buildPageTokens MUST emit exactly 2 × siblingCount + 5 slots across start-boundary, middle, and end-boundary windows so prev/next buttons never shift horizontally.",
      "Page numbers and optional range summaries MUST format through Intl.NumberFormat(locale) with font-variant-numeric: tabular-nums and hidden bold ::after width reservation.",
      "Active page button MUST set aria-current=\"page\"; ellipsis items MUST set aria-hidden=\"true\".",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Compose a Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) of 40.dp IconToggleButtons using RoundedCornerShape animated between 20.dp, 8.dp, and 12.dp.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Render HStack(spacing: 4) with .monospacedDigit() labels clipped to RoundedRectangle(cornerRadius: r, style: .continuous) driven by Spring(mass: 1, stiffness: 800, damping: 33.94).",
      },
      {
        target: "Flutter",
        guidance:
          "Pair buildPageTokens windowing with 40×40 buttons animating BorderRadius.circular(r) via SpringSimulation.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Mirror prev/next step chevrons in RTL via CSS :dir(rtl) transform so directional stepping matches reading order.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Icon Buttons & Shape Morphing",
        url: "https://m3.material.io/components/icon-buttons/specs",
        kind: "m3-spec",
      },
      {
        label: "MDN — aria-current=\"page\" Attribute",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Attributes/aria-current",
        kind: "web-standard",
      },
    ],
  },

  tabs: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Primary and Secondary Tabs with spatial-spring indicator tracking and WAI-ARIA roving arrow navigation.",
    tokenSources: ["TABS_TOKENS", "EXPRESSIVE_MOTION_SCHEME"],
    aospSources: [
      "TabRow.kt",
      "Tab.kt",
      "PrimaryNavigationTabTokens.kt",
      "SecondaryNavigationTabTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Two-Tier Hierarchy: Primary Pill Indicator vs Secondary Full-Cell Underline",
        body: "Material 3 separates top-level content switching (Primary Tabs) from nested sub-views (Secondary Tabs). Primary Tabs stand 48px tall (64px with stacked icon + label) and render a 3px-thick top-rounded pill indicator (min-width 24px) in primary; Secondary Tabs stay compact at 48px inline-row layout with a full-cell 2px underline and on-surface text.",
      },
      {
        title: "Spatial Spring Indicator Gliding",
        body: "Instead of blinking indicators on and off, BaseTabs.Indicator tracks --active-tab-left and --active-tab-width continuously across sibling tabs using spatial spring timing so users perceive physical continuity between peer views.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "tabs-variant-tokens",
        title: "Primary vs Secondary Tabs Specification (TABS_TOKENS)",
        caption: "Units: px (= dp / pt)",
        columns: [
          "Variant",
          "Min Height",
          "Inline Padding",
          "Icon + Label Layout",
          "Active Text Role",
          "Indicator Geometry",
        ],
        rows: [
          [
            "primary (text only)",
            "48",
            "20",
            "Centered label (+ optional badge)",
            "primary",
            "3px height, top-rounded (3px 3px 0 0), min-width 24px",
          ],
          [
            "primary (with icon)",
            "64",
            "20",
            "Vertical column (20px icon + 4px gap + label)",
            "primary",
            "3px height, top-rounded (3px 3px 0 0), min-width 24px",
          ],
          [
            "secondary",
            "48",
            "20",
            "Horizontal row (20px icon + 8px gap + label)",
            "on-surface",
            "2px height, full tab cell width, flat ends",
          ],
        ],
      },
    ],
    invariants: [
      "TabsList MUST implement single-tab-stop roving tabindex (ArrowLeft / ArrowRight cycling with automatic RTL direction inversion, Home / End jumping).",
      "Primary tab indicators MUST maintain a minimum inline width of 24px (primaryIndicatorMinWidth) and 3px thickness; Secondary tab indicators MUST span 100% of the active tab cell at 2px thickness.",
      "Each TabsPanel MUST link bidirectionally to its controlling Tab via aria-controls and aria-labelledby.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Maps directly to PrimaryTabRow / SecondaryTabRow (and Scrollable variants) with TabRowDefaults.PrimaryIndicator(height = 3.dp, minWidth = 24.dp) animated via fastSpatial.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Use matchedGeometryEffect(id: 'tabIndicator', in: tabNamespace) on a 3pt / 2pt bottom capsule inside withAnimation(.spring(mass: 1, stiffness: 800, damping: 33.94)).",
      },
      {
        target: "Flutter",
        guidance:
          "Configure TabBar(indicatorSize: isPrimary ? TabBarIndicatorSize.label : TabBarIndicatorSize.tab, indicatorWeight: isPrimary ? 3 : 2).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Drive indicator translate and width from CSS custom properties updated via ResizeObserver so font loading or window resizes never misalign the underline.",
      },
    ],
    references: [
      {
        label: "Material 3 — Tabs Specification",
        url: "https://m3.material.io/components/tabs/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — TabRow.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TabRow.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Tabs Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/tabs/",
        kind: "aria-apg",
      },
      {
        label: "Base UI — Tabs Primitive",
        url: "https://base-ui.com/react/components/tabs",
        kind: "base-ui",
      },
    ],
  },

  accordion: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Segmented disclosure and accordion system pairing neighbor-aware 16px/4px corner detachment with native hidden=\"until-found\" find-in-page auto-expansion and RTL chevron physics.",
    tokenSources: [
      "ACCORDION_TOKENS",
      "resolveAccordionItemCorners",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    inspirationAndRationale: [
      {
        title: "Neighbor-Aware Segmented Detachment (resolveAccordionItemCorners)",
        body: "Collapsed Accordion items stack with a 2px physical gap and SegmentedList corners ([16,16,4,4] → [4,4,4,4] → [4,4,16,16]). When item i expands, it detaches into a standalone [16,16,16,16] card with 6px vertical block margin via fastSpatial — AND its collapsed neighbors (i - 1 bottom corners, i + 1 top corners) simultaneously round to 16px so no sharp 4px seam ever faces an open gap.",
      },
      {
        title: "Native Browser Find-in-Page Auto-Expansion (hidden=\"until-found\")",
        body: "Standard display: none accordions hide collapsed text from Ctrl+F / ⌘F browser search, frustrating documentation and FAQ readers. Both Collapsible and Accordion default to hiddenUntilFound = true so browser find-in-page automatically fires beforematch and expands the matching panel.",
      },
      {
        title: "Inner Wrapper Padding Isolation & Bidirectional Chevron Physics",
        body: "Applying padding or border-top directly on a [hidden=\"until-found\"] panel leaks ghost hairlines when collapsed. All padding and divider borders live strictly inside nested .m3e-collapsible__content / .m3e-accordion__content wrappers. Standalone Collapsible rotates its chevron from -90° (LTR) or +90° (RTL) to 0° via fastSpatial.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "accordion-corner-topology",
        title: "Neighbor-Aware Accordion Corner Matrix [TL, TR, BR, BL] (ACCORDION_TOKENS)",
        caption: "Exact output of resolveAccordionItemCorners(index, count, isOpen, prevOpen, nextOpen)",
        columns: [
          "Item State & Neighbor Context",
          "Top Corners [TL, TR]",
          "Bottom Corners [BR, BL]",
          "Block Margin & Surface",
        ],
        rows: [
          [
            "Open item (isOpen = true) or count === 1",
            "16, 16",
            "16, 16",
            "marginBlock: 6px, surface-container + 1px outline-variant",
          ],
          [
            "Collapsed first item (index = 0, next collapsed)",
            "16, 16",
            "4, 4",
            "marginBlock: 0px (2px stack gap), surface-container-low",
          ],
          [
            "Collapsed middle item (prev & next collapsed)",
            "4, 4",
            "4, 4",
            "marginBlock: 0px (2px stack gap), surface-container-low",
          ],
          [
            "Collapsed item immediately BELOW an open item (prevOpen = true)",
            "16, 16",
            "4 (or 16 if last/nextOpen)",
            "Facing top edge rounds to 16px symmetrically",
          ],
          [
            "Collapsed item immediately ABOVE an open item (nextOpen = true)",
            "4 (or 16 if first/prevOpen)",
            "16, 16",
            "Facing bottom edge rounds to 16px symmetrically",
          ],
        ],
      },
      {
        id: "collapsible-vs-accordion-specs",
        title: "Standalone Collapsible vs Segmented Accordion Dimensions",
        columns: ["Component", "Header Min Height", "Inline Padding", "Corner Morphing", "Chevron Rotation (Closed → Open)"],
        rows: [
          ["Collapsible", "52px", "18px (content start 46px)", "18px → 24px (fastSpatial)", "-90° LTR / +90° RTL → 0°"],
          ["Accordion Item", "56px", "18px", "resolveAccordionItemCorners", "0° → 180° (fastSpatial)"],
        ],
      },
    ],
    invariants: [
      "Panel elements carrying [hidden=\"until-found\"] MUST NEVER declare padding, border, background, or display: none; all inner spacing and top divider borders MUST live on the nested .m3e-collapsible__content / .m3e-accordion__content child.",
      "When showExpandAll = true (requires multiple = true), the toolbar toggle button MUST set aria-expanded=\"true\" ONLY when every enabled item is open; partial or zero open states MUST set aria-expanded=\"false\" with localized copy t('collapsible.expandAll').",
      "Chevron icons MUST animate continuously via fastSpatial (ζ = 0.6, k = 800) rather than swapping separate SVG icons on toggle.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use Column(verticalArrangement = Arrangement.spacedBy(2.dp)) with AnimatedVisibility(expandVertically() + fadeIn()) and RoundedCornerShape driven by resolveAccordionItemCorners.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Wrap DisclosureGroup items in VStack(spacing: 2) clipped with UnevenRoundedRectangle animated via Spring(mass: 1, stiffness: 800, damping: 33.94), checking layoutDirection for -90°/+90° closed chevron angle.",
      },
      {
        target: "Flutter",
        guidance:
          "Replace rigid ExpansionPanelList dividers with a 2px-gapped Column using AnimatedSize and neighbor-aware BorderRadius.only.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Listen to native beforematch events on hidden=\"until-found\" panels (built into @base-ui/react/collapsible) to synchronize controlled open state when find-in-page reveals matches.",
      },
    ],
    references: [
      {
        label: "WAI-ARIA APG — Accordion Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/accordion/",
        kind: "aria-apg",
      },
      {
        label: "MDN — HTML hidden=\"until-found\" Attribute",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/hidden",
        kind: "web-standard",
      },
      {
        label: "Base UI — Accordion & Collapsible Primitives",
        url: "https://base-ui.com/react/components/accordion",
        kind: "base-ui",
      },
    ],
  },

  menu: {
    provenance: "official-m3e",
    provenanceSummary:
      "Official M3E vertical menu with gaps (DropdownMenu, ContextMenu) ported from AOSP Menu.kt, paired with a desktop single-tab-stop Menubar.",
    tokenSources: [
      "SEGMENTED_MENU_TOKENS",
      "resolveSegmentedMenuItemCorners",
      "MENUBAR_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: [
      "Menu.kt",
      "MenuDefaults.kt",
      "SegmentedMenuTokens.kt",
      "StandardMenuTokens.kt",
      "VibrantMenuTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Grouped Menu Geometry (16px - 4px = 12px)",
        body: "Each group is its own surface-container-low surface at elevation level 2 with no outline. Groups stack with a 2px gap: the first group keeps 16px top corners and 8px bottom corners, middle groups use 8px, and the last group mirrors the first. Inside a group, 44px items sit 4px from the edge, so boundary items take concentric 12px outer corners (16 - 4) and 4px inner corners. Items carry no resting fill; hover, focus, and press add a state layer only, and a checked item becomes a 12px tertiary-container shape.",
      },
      {
        title: "Desktop Productivity Menubar vs Site NavigationMenu",
        body: "Menubar models desktop command bars (File / Edit / View) inside a 40px full-pill bar (20px radius, 4px padding, concentric 32px-tall / 16px-radius triggers → 8px pressed): the entire bar is a single Tab stop with instant hover/arrow menu switching and infinite recursive submenus.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "menu-surface-matrix",
        title: "Menu & Menubar Tokens (Logical Pixels)",
        columns: [
          "Surface / Component",
          "Container Geometry",
          "Inner Item / Trigger Spec",
          "Corner Morphing Rules",
        ],
        rows: [
          [
            "DropdownMenu & ContextMenu",
            "Group r = 16 outer / 8 inner, pad = 4, group gap = 2 (surface-container-low, level 2)",
            "min-height: 44, pad-inline: 12, icon 20, icon gap 12 (8 on coarse pointers)",
            "Outer 12 / Inner 4 → Checked [12,12,12,12] (tertiary-container)",
          ],
          [
            "Menubar",
            "height: 40, r = 20, pad = 4",
            "Trigger height: 32, pad-inline: 14",
            "Concentric trigger r = 16 rest → 8 pressed (fastSpatial)",
          ],
        ],
      },
    ],
    invariants: [
      "Strict Submenu-Trigger Non-Action Invariant: any menu item with a non-empty submenu array MUST render SubmenuTrigger solely to open its nested SubmenuRoot and MUST NEVER execute an onSelect side effect.",
      "Items preceded by separatorBefore = true (and the item immediately preceding a separator) MUST be treated as group boundaries (isFirstInGroup / isLastInGroup) receiving 12px outer corners.",
      "When any sibling item in a menu level defines an icon or checkbox state, iconless siblings MUST reserve an aligned leading icon gutter (hasAnyLeadingSlot) so labels align vertically.",
      "Submenu carets MUST mirror horizontally (scale: -1 1) when direction === 'rtl'.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use DropdownMenuPopup with DropdownMenuGroup and MenuDefaults.groupShape(index, count) / itemShape(index, count).",
      },
      {
        target: "SwiftUI",
        guidance:
          "Map DropdownMenu / ContextMenu to native Menu and .contextMenu on iOS/macOS.",
      },
      {
        target: "Flutter",
        guidance:
          "Use MenuAnchor and MenuBar with MenuStyle(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)), padding: EdgeInsets.all(4)).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Keep DropdownMenu and Menubar modal={false} with Portal collision positioning so scrolling or clicking outside dismisses cleanly without layout-shifting body scrollbars.",
      },
    ],
    references: [
      {
        label: "Material 3 — Menus Specification",
        url: "https://m3.material.io/components/menus/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — Menu.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Menu.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Menu and Menubar Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/menubar/",
        kind: "aria-apg",
      },
      {
        label: "Base UI — Menu",
        url: "https://base-ui.com/react/components/menu",
        kind: "base-ui",
      },
    ],
  },

  "command-palette": {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Modal ⌘K / Ctrl+K command launcher fusing M3E high-elevation dialog surfaces, WAI-ARIA 1.2 combobox-listbox virtual focus, and CJK-safe live filtering.",
    tokenSources: [
      "DIALOG_TOKENS",
      "SELECT_TOKENS",
      "SHAPE_CORNER_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    inspirationAndRationale: [
      {
        title: "M3E Modal Surface Applied to Keyboard-First Web Productivity",
        body: "Modern developer tools, workspaces, and AI apps rely on a global ⌘K / Ctrl+K omnibox. CommandPalette adapts M3E Dialog's surface-container-high backdrop, high-elevation shadow, and fastSpatial scale/translate entrance (0.95 → 1, -8px → 0) into a top-anchored modal launcher (top: min(14dvh, 110px)).",
      },
      {
        title: "DOM Focus Permanence via aria-activedescendant",
        body: "Moving real DOM focus out of the search <input> onto result rows would break continuous typing, Backspace editing, and CJK IME composition. The input retains DOM focus as role=\"combobox\" while ArrowUp / ArrowDown / Home / End cycle aria-activedescendant across selectable role=\"option\" pills.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "command-palette-geometry",
        title: "CommandPalette Modal & Option Geometry (Logical Pixels)",
        columns: [
          "Part",
          "Dimensions & Radius",
          "Surface & Typography",
          "Interaction / Motion Contract",
        ],
        rows: [
          [
            "Modal Popup (.m3e-command-palette)",
            "width: min(580px, 100dvw - 28px), max-height: min(72dvh, 520px), r = 24",
            "surface-container-high + 1px outline-variant",
            "Entrance scale 0.95 → 1 & translateY -8px → 0 (fastSpatial); opacity (fastEffects)",
          ],
          [
            "Search Input Bar",
            "padding: 14 × 18, 10px icon gap",
            "16px / 24px input font (prevents iOS Safari auto-zoom)",
            "role=\"combobox\", autoFocus, live haystack filter across label + desc + heading + keywords",
          ],
          [
            "Option Row (.m3e-command-palette__item)",
            "padding: 10 × 12, r = 14 (12–14 pill), gap: 12",
            "Highlighted: secondary-container / on-secondary-container",
            "Skips disabled options during cyclic ArrowUp/ArrowDown traversal",
          ],
        ],
      },
    ],
    invariants: [
      "Global ⌘K / Ctrl+K listener MUST register ONLY when enableShortcut = true so multiple mounted instances or custom host shortcuts never collide.",
      "Search <input> font-size MUST be >= 16px so opening the palette on mobile WebKit never triggers destructive viewport zoom.",
      "Closing the palette (via Escape, backdrop click, or item execution) MUST reset query to '' and activeIndex to 0 cleanly.",
      "Disabled items (disabled = true) MUST expose aria-disabled=\"true\", remain visible for discoverability, and be excluded from flatSelectable keyboard traversal and Enter execution.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Combine Dialog(properties = DialogProperties(usePlatformDefaultWidth = false)) with a Surface(shape = RoundedCornerShape(24.dp), color = surfaceContainerHigh) and LazyColumn.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Bind .keyboardShortcut('k', modifiers: .command) on macOS/iPadOS to present a top-aligned overlay panel with @FocusState locked on the search TextField.",
      },
      {
        target: "Flutter",
        guidance:
          "Register CallbackShortcuts(bindings: { SingleActivator(LogicalKeyboardKey.keyK, meta: true): ... }) opening showGeneralDialog with Shortcuts/Actions arrow traversal.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Guard Enter execution against e.isComposing so CJK IME candidate confirmation never prematurely triggers the highlighted command.",
      },
    ],
    references: [
      {
        label: "Material 3 — Dialogs & Search View Surfaces",
        url: "https://m3.material.io/components/search/specs",
        kind: "m3-spec",
      },
      {
        label: "WAI-ARIA APG — Combobox with Listbox Autocomplete",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
        kind: "aria-apg",
      },
      {
        label: "Base UI — Dialog Primitive",
        url: "https://base-ui.com/react/components/dialog",
        kind: "base-ui",
      },
    ],
  },

  "top-app-bar": {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive TopAppBar across small, center-aligned, medium-flexible (112→64px), and large-flexible (148→64px) variants with continuous scroll interpolation.",
    tokenSources: [
      "TOP_APP_BAR_SPECS",
      "resolveTopAppBarGeometry",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: [
      "AppBar.kt",
      "TopAppBarDefaults.kt",
      "AppBarSmallTokens.kt",
      "AppBarMediumFlexibleTokens.kt",
      "AppBarLargeFlexibleTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Continuous Flexible Collapse & Title Scale Interpolation",
        body: "Material 3 Expressive replaces legacy static Medium/Large bars with MediumFlexible (112px → 64px) and LargeFlexible (148px → 64px) bars supporting optional subtitles. As collapsedFraction t ∈ [0, 1] advances (smoothed via fastSpatial), resolveTopAppBarGeometry continuously interpolates container height, title font size (24/28px → 20px), and subtitle fade-out.",
      },
      {
        title: "Choreographed Subtitle Fade Before Two-Row Reflow (t = 0.72)",
        body: "In flexible variants, subtitleOpacity = max(0, 1 - 1.4 × t) reaches 0 at t ≈ 0.714 — immediately before isTwoRow flips from expanded bottom-row layout to compact inline top-row layout at t = 0.72 — preventing multi-line overlap during rapid scroll.",
      },
      {
        title: "Tonal Scroll Elevation Over Drop Shadows",
        body: "Once scrolled (scrolled = true or collapsedFraction > 0.08 on flexible / > 0.04 on small), TopAppBar transitions its background from surface to surface-container via critically damped effects timing, visually separating pinned header controls from scrolling page content without muddy shadows.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "top-app-bar-variant-specs",
        title: "TopAppBar Four-Variant Interpolation Matrix (TOP_APP_BAR_SPECS)",
        caption: "Exact output of resolveTopAppBarGeometry for t = collapsedFraction ∈ [0, 1]",
        columns: [
          "Variant",
          "Expanded Height (t = 0)",
          "Collapsed Height (t = 1)",
          "Title Font Scale (t = 0 → 1)",
          "Row Topology & Subtitle Fade",
        ],
        rows: [
          [
            "small",
            "64",
            "64",
            "20px fixed",
            "Single inline row (16px horizontal padding); elevated when scrolled",
          ],
          [
            "center-aligned",
            "64",
            "64",
            "20px fixed",
            "Single inline row with centered title/subtitle group",
          ],
          [
            "medium-flexible",
            "112",
            "64",
            "24px → 20px",
            "Two-row for t < 0.72; subtitleOpacity = max(0, 1 - 1.4t); elevated for t > 0.08",
          ],
          [
            "large-flexible",
            "148",
            "64",
            "28px → 20px",
            "Two-row for t < 0.72; subtitleOpacity = max(0, 1 - 1.4t); elevated for t > 0.08",
          ],
        ],
      },
    ],
    invariants: [
      "collapsedFraction MUST be clamped to [0, 1] and smoothed through fastSpatial before evaluating resolveTopAppBarGeometry so discrete mouse-wheel ticks never cause stepped height jumps.",
      "Trailing action buttons MUST be wrapped in a roving-tabindex Toolbar (@base-ui/react/toolbar) with localized aria-label={t('topAppBar.actionsLabel')}.",
      "Tonal elevation background shift (surface → surface-container) MUST use effects timing (ζ = 1.0) with zero color overshoot.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Corresponds to TopAppBar, CenterAlignedTopAppBar, MediumFlexibleTopAppBar, and LargeFlexibleTopAppBar with TopAppBarDefaults.exitUntilCollapsedScrollBehavior().",
      },
      {
        target: "SwiftUI",
        guidance:
          "Map medium/large-flexible to NavigationStack with .navigationBarTitleDisplayMode(.large) or drive a custom safeAreaInset(edge: .top) header from ScrollView.onScrollGeometryChange.",
      },
      {
        target: "Flutter",
        guidance:
          "Use SliverAppBar / SliverAppBar.medium / SliverAppBar.large with scrolledUnderElevation: 0 and surfaceContainer background tint.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Compute collapsedFraction = Math.min(1, scrollTop / (expandedHeight - 64)) inside a passive scroll listener.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — App Bars Specification",
        url: "https://m3.material.io/components/app-bars/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — AppBar.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AppBar.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Toolbar Primitive",
        url: "https://base-ui.com/react/components/toolbar",
        kind: "base-ui",
      },
    ],
  },

  "search-bar": {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive 56px full-pill SearchBar paired with a concentric 28px/20px suggestion popup and triple-layered CJK IME composition guard.",
    tokenSources: ["SEARCH_BAR_TOKENS", "EXPRESSIVE_MOTION_SCHEME"],
    aospSources: ["SearchBar.kt", "SearchBarTokens.kt", "SearchViewTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Strict Concentric Capsule Geometry (28px - 8px = 20px)",
        body: "SearchBar pairs a 56px full-capsule input bar (28px radius, 16px inline padding) with an anchored suggestion popup sharing the exact 28px outer radius and 8px uniform padding. Each suggestion row therefore takes a concentric 20px resting corner radius (28 - 8 = 20) and tightens to 10px on press via fastSpatial (ζ = 0.6, k = 800).",
      },
      {
        title: "Triple-Layered CJK IME Composition Guard",
        body: "In Chinese, Japanese, and Korean input methods, pressing Enter confirms pinyin/kana composition rather than submitting the search query — and WebKit/Safari dispatches compositionend milliseconds BEFORE the confirming keydown Enter event. SearchBar guards Enter submission across e.nativeEvent.isComposing, keyCode === 229, and a 50ms post-compositionend timestamp window.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "search-bar-tokens-table",
        title: "SearchBar & Concentric Suggestion Popup Geometry (SEARCH_BAR_TOKENS)",
        caption: "Units: px (= dp / pt)",
        columns: [
          "Element / Size",
          "Dimensions",
          "Corner Radius",
          "Padding / Icon",
          "Interaction Contract",
        ],
        rows: [
          [
            "SearchBar (md default)",
            "min-height: 56",
            "28 (full capsule)",
            "16 inline pad, 20–22 icon",
            "Wrapped in semantic <form role=\"search\">",
          ],
          [
            "SearchBar (sm compact)",
            "min-height: 40",
            "28 (full capsule)",
            "12 inline pad",
            "Dense toolbar & TopAppBar inline slot variant",
          ],
          [
            "Suggestion Popup",
            "sideOffset: 6",
            "28",
            "8 uniform padding",
            "Portaled @base-ui/react/autocomplete popup",
          ],
          [
            "Suggestion Row",
            "Full popup inner width",
            "20 rest → 10 pressed",
            "Concentric 28 - 8 = 20",
            "fastSpatial (ζ = 0.6, k = 800) with 95ms press latch",
          ],
        ],
      },
    ],
    invariants: [
      "Outer wrapper MUST render <form role=\"search\"> so screen reader landmark navigation locates the search bar immediately.",
      "Enter keydown MUST NEVER trigger form submission when e.nativeEvent.isComposing is true, e.keyCode === 229, within 50ms of compositionend, or while aria-activedescendant points to a highlighted autocomplete suggestion.",
      "Suggestion item rest radius MUST equal popupRadius - popupPadding (28 - 8 = 20px) to preserve optical concentricity.",
      "Clear button MUST appear only when query.length > 0 and expose localized aria-label={t('searchBar.clear')}.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Maps to SearchBar / DockedSearchBar with SearchBarDefaults.inputFieldHeight = 56.dp and RoundedCornerShape(28.dp).",
      },
      {
        target: "SwiftUI",
        guidance:
          "Pair .searchable(text:placement:) or a custom 56pt Capsule() bar with UITextInput markedTextRange checks (SwiftUI native TextField handles IME commit automatically before onSubmit).",
      },
      {
        target: "Flutter",
        guidance:
          "Use SearchAnchor.bar(constraints: BoxConstraints(minHeight: 56), viewShape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28))) and inspect TextEditingValue.composing.isValid.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Always record e.timeStamp on compositionend and ignore Enter keydowns with |e.timeStamp - lastCompositionEnd| < 50ms to prevent premature search submission in macOS Safari.",
      },
    ],
    references: [
      {
        label: "Material 3 — Search Specification",
        url: "https://m3.material.io/components/search/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — SearchBar.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/SearchBar.kt",
        kind: "aosp-source",
      },
      {
        label: "MDN — Element compositionend & IME Keydown Ordering",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/Element/compositionend_event",
        kind: "web-standard",
      },
      {
        label: "Base UI — Autocomplete Primitive",
        url: "https://base-ui.com/react/components/autocomplete",
        kind: "base-ui",
      },
    ],
  },
};
