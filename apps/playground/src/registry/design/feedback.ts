import type { ComponentDesignSpec } from "../types";

export const FEEDBACK_DESIGN_SPECS: Readonly<Record<string, ComponentDesignSpec>> = {
  alert: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Adapts Material 3 Expressive tonal container hierarchy and `SHAPE_CORNER_TOKENS.large` (`16px`) card geometry to inline web status callouts (`Alert`), mapping `info`, `success`, `warning`, and `error` severities onto M3E tonal surfaces with calibrated ARIA live-region politeness.",
    tokenSources: [
      "SHAPE_CORNER_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
      "M3E_TYPOGRAPHY_TOKENS",
    ],
    inspirationAndRationale: [
      {
        title: "Four-Severity Tonal Blending on M3 Surface Containers",
        body: "Material 3 defines native `primary` and `error` container tokens out of the box, whereas enterprise web interfaces additionally require semantic `success` and `warning` inline callouts. `Alert` blends `primary-container` (`56%`) and `error-container` (`62%`) into `surface-container-low` for `info` and `error`, while deriving `light-dark()` perceptual green (`#186c3a` / `#7ee2a0`) and amber (`#8f5700` / `#f7bd48`) accents mixed at `14%–15%` into `surface-container-low` so all four severities share identical luminance contrast across light and dark schemes.",
      },
      {
        title: "Live-Region Politeness Discipline (`status` vs. `alert`)",
        body: "Overusing `role=\"alert\"` (`aria-live=\"assertive\"`) on informational or static page banners interrupts screen readers mid-sentence on route mount. `Alert` defaults `info` and `success` callouts to polite `role=\"status\"`, reserves `role=\"alert\"` for urgent `warning` and `error` feedback, and exposes an explicit `role?: \"alert\" | \"status\" | \"region\"` override so non-urgent persistent banners can downgrade to `\"status\"` or `\"region\"` while reserving assertive announcements strictly for critical errors.",
      },
      {
        title: "Three Surface Emphases Without Geometry Drift",
        body: "Provides `tonal` (default low-glare container tint + `1px` mixed accent border), `outlined` (`surface-container-lowest` + `1px` semantic border for dense forms), and `filled` (high-emphasis solid accent surface for blocking notices) while preserving identical `16px` corner radii, `14px × 16px` padding, and `20×20px` optical icon alignment.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "alert-geometry",
        title: "Inline Callout Geometry & Typography",
        caption:
          "All metrics in 1:1 logical pixels (px / dp / pt). Corner tuples follow [topLeft, topRight, bottomRight, bottomLeft].",
        columns: [
          "Sub-element",
          "Dimensions / Spacing",
          "Corner Tuple [tl, tr, br, bl]",
          "Typography / Optical Alignment",
        ],
        rows: [
          [
            "Root Container (`tonal | outlined | filled`)",
            "`padding: 14px 16px`, inline `gap: 12px`, `1px` border",
            "[16, 16, 16, 16]",
            "`align-items: flex-start` so multi-line copy never shifts leading icon",
          ],
          [
            "Leading Severity Glyph",
            "`20×20px` (`flex-shrink: 0`)",
            "—",
            "`margin-block-start: 1px` optical cap-height alignment with `20px` title line-height",
          ],
          [
            "Body Stack (`title` + `children`)",
            "`flex: 1; min-width: 0`, stack `gap: 3px`",
            "—",
            "Title `14.5px / 20px` (`w650`); Description `13.5px / 20px` (`on-surface-variant`)",
          ],
          [
            "Trailing Action & Dismiss Button",
            "Action `align-self: center`; Close `28×28px`",
            "Close `[9999, 9999, 9999, 9999]`",
            "Localized `aria-label={t(\"alert.close\")}`, `margin-block: -2px`, `margin-inline-end: -4px`",
          ],
        ],
      },
      {
        id: "alert-severity-tokens",
        title: "Severity Color Mapping & ARIA Live Defaults",
        columns: [
          "Severity",
          "Default ARIA Role",
          "Accent Token",
          "Tonal Background Mix",
          "Border Mix (`1px solid`)",
        ],
        rows: [
          [
            "`info`",
            "`role=\"status\"` (polite)",
            "`--m3e-color-primary`",
            "`56% primary-container` + `surface-container-low`",
            "`34% primary` + `outline-variant`",
          ],
          [
            "`success`",
            "`role=\"status\"` (polite)",
            "`light-dark(#186c3a, #7ee2a0)`",
            "`14% accent` + `surface-container-low`",
            "`36% accent` + `outline-variant`",
          ],
          [
            "`warning`",
            "`role=\"alert\"` (override to `\"status\"` when non-urgent)",
            "`light-dark(#8f5700, #f7bd48)`",
            "`15% accent` + `surface-container-low`",
            "`38% accent` + `outline-variant`",
          ],
          [
            "`error`",
            "`role=\"alert\"` (assertive)",
            "`--m3e-color-error`",
            "`62% error-container` + `surface-container-low`",
            "`45% error` + `outline-variant`",
          ],
        ],
      },
    ],
    invariants: [
      "Reserve assertive `role=\"alert\"` for critical errors or urgent dynamic warnings; use `role=\"status\"` (or `role=\"region\"` with a label) for informational, success, and static page callouts so screen readers are not interrupted.",
      "Filled variant (`variant=\"filled\"`) MUST pair `--m3e-color-error` with `--m3e-color-on-error` and `--m3e-color-primary` with `--m3e-color-on-primary` (or `surface-container-lowest` against dark/light-adapted `success`/`warning` accents) to maintain WCAG AA 4.5:1 text contrast.",
      "Dismissible alerts MUST expose a localized `aria-label` via `t(\"alert.close\")` on the `28×28px` close button and transition hover backgrounds via `fastEffects` (`ζ = 1.0, k = 3800`, zero overshoot).",
      "Negative trailing close margin (`margin-inline-end: -4px`) and icon/content layout rely exclusively on CSS logical properties so RTL callouts mirror automatically without flipping directional icons.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Render a `Surface(shape = RoundedCornerShape(16.dp), border = BorderStroke(1.dp, borderColor), color = tonalBg)` with `Row(Modifier.padding(horizontal = 16.dp, vertical = 14.dp), horizontalArrangement = Arrangement.spacedBy(12.dp))`, setting `liveRegion = LiveRegionMode.Assertive` only on critical errors and `LiveRegionMode.Polite` on status callouts.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Use an `HStack(alignment: .top, spacing: 12)` padded by `.padding(.horizontal, 16).padding(.vertical, 14)` inside `RoundedRectangle(cornerRadius: 16, style: .continuous)`, posting `AccessibilityNotification.Announcement` with high priority only for dynamic error transitions.",
      },
      {
        target: "Flutter",
        guidance:
          "Wrap content in `Container(padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14), decoration: BoxDecoration(color: tonalBg, borderRadius: BorderRadius.circular(16), border: Border.all(color: borderColor)))` and wrap dynamic status updates in `Semantics(liveRegion: true)`.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Keep persistent live-region containers mounted or render `role=\"alert\"` only when critical error state appears; use `color-mix(in srgb, ...)` with CSS `light-dark()` tokens so tonal fills adapt cleanly across themes.",
      },
    ],
    references: [
      {
        label: "WAI-ARIA APG — Alert Pattern (`role=\"alert\"`)",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/alert/",
        kind: "aria-apg",
        note: "Defines assertive live-region semantics vs. polite status regions.",
      },
      {
        label: "Material Design 3 — Color Roles & Tonal Containers",
        url: "https://m3.material.io/styles/color/roles",
        kind: "m3-spec",
      },
      {
        label: "MDN Web Docs — ARIA: `status` Role",
        url: "https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Roles/status_role",
        kind: "web-standard",
      },
    ],
  },

  dialog: {
    provenance: "official-m3e",
    provenanceSummary:
      "Implements official Material 3 Expressive basic and destructive confirmation dialogs (`Dialog` and `AlertDialog`), pairing AOSP `DialogTokens` (`28px` `extraLarge` radius, `280–520px` width, `24px` padding) with `@base-ui/react/dialog` and `@base-ui/react/alert-dialog` modal focus management.",
    tokenSources: [
      "DIALOG_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
      "M3E_ELEVATION_TOKENS",
    ],
    aospSources: ["AlertDialog.kt", "DialogTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Semantic Separation of `Dialog` vs. `AlertDialog`",
        body: "Standard M3 dialogs (`Dialog`, `role=\"dialog\"`) allow light dismissal via backdrop click or an optional `36×36px` top-end close button (`showCloseButton`) for non-destructive tasks and form sheets. Destructive or irreversible confirmations use `AlertDialog` (`role=\"alertdialog\"` on `@base-ui/react/alert-dialog`), which blocks accidental outside-click dismissal, colors its hero icon with `error`, and requires an explicit cancel or confirm action.",
      },
      {
        title: "Hero Icon Optical Centering Rule",
        body: "Follows the canonical Material 3 `AlertDialog.kt` layout rule: without an icon, the `22px / 28px` title aligns `start` (`text-align: start`) for rapid F-pattern scanning; when an icon (`24×24px`) is supplied (`data-has-icon`), the icon centers horizontally at the top of the `24px`-padded box and automatically centers the headline beneath it while keeping body copy start-aligned.",
      },
      {
        title: "Dual-Spring Spatial Scale & Zero-Overshoot Scrim",
        body: "Popup scale (`0.92 → 1`) and vertical lift (`translate: 0 10px → 0 0`) run on `fastSpatial` (`ζ = 0.6, k = 800`) for a tactile M3E entrance, whereas popup opacity (`fastEffects`, `ζ = 1.0, k = 3800`) and `42% scrim` backdrop fade (`defaultEffects`, `ζ = 1.0, k = 1600`) remain critically damped so alpha channels never flicker or overshoot.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "dialog-geometry",
        title: "Modal Container & Slot Geometry (`DIALOG_TOKENS`)",
        caption:
          "All metrics in 1:1 logical pixels (px / dp / pt). Corner tuples follow [topLeft, topRight, bottomRight, bottomLeft].",
        columns: [
          "Element",
          "Width / Size",
          "Padding / Spacing",
          "Corner Tuple [tl, tr, br, bl]",
          "Surface & Color Role",
        ],
        rows: [
          [
            "Popup Surface (`Dialog` & `AlertDialog`)",
            "`min 280px`, `max 520px` (`calc(100vw - 32px)`), `max-height: min(85dvh, 680px)`",
            "`padding: 24px`, stack `gap: 14px`",
            "[28, 28, 28, 28]",
            "`surface-container-high` + `1px outline-variant` border, `elevation-3`",
          ],
          [
            "Backdrop Scrim",
            "Fixed `inset: 0` (`overscroll-behavior: contain`)",
            "Viewport safe inset `20px`",
            "[0, 0, 0, 0]",
            "`color-mix(in srgb, scrim 42%, transparent)`",
          ],
          [
            "Optional Hero Icon",
            "`24×24px` centered (`justify-content: center`)",
            "Precedes title (`14px` stack gap)",
            "—",
            "`secondary` (`Dialog`) / `error` (`AlertDialog`)",
          ],
          [
            "Headline & Supporting Body",
            "Title `22px / 28px` (`w600`); Body `14px / 20px`",
            "Scrollable body (`overflow: auto`)",
            "—",
            "Title `on-surface` (centered when `[data-has-icon]`); Body `on-surface-variant`",
          ],
          [
            "Actions Row & Optional Close",
            "Actions `gap: 8px` (`justify-content: flex-end`); Close `36×36px`",
            "Actions `padding-top: 6px`; Close `inset: 16px` top-end",
            "Close `[9999, 9999, 9999, 9999]`",
            "Trailing `text` / `filled` / `tonal` M3E buttons (`Dialog` close uses `t(\"dialog.close\")`)",
          ],
        ],
      },
      {
        id: "dialog-motion",
        title: "Entrance & Dismissal Spring Physics",
        columns: [
          "Target",
          "Starting / Ending State",
          "Open State",
          "Motion Token",
        ],
        rows: [
          [
            "Popup Transform (`scale` + `translate`)",
            "`scale: 0.92`, `translate: 0 10px`",
            "`scale: 1`, `translate: 0 0`",
            "`fastSpatial` (`ζ = 0.6, k = 800`)",
          ],
          [
            "Popup Opacity",
            "`opacity: 0`",
            "`opacity: 1`",
            "`fastEffects` (`ζ = 1.0, k = 3800`, zero overshoot)",
          ],
          [
            "Scrim Backdrop Opacity",
            "`opacity: 0`",
            "`opacity: 1` (`42% scrim`)",
            "`defaultEffects` (`ζ = 1.0, k = 1600`, zero overshoot)",
          ],
        ],
      },
    ],
    invariants: [
      "While open, background document content outside the portal MUST be marked inert, focus MUST be trapped inside the dialog, and focus MUST restore to the invoking trigger on close.",
      "Every `Dialog` and `AlertDialog` MUST expose an accessible title (`Dialog.Title` / `AlertDialog.Title` wired via `aria-labelledby`), with supporting text bound via `aria-describedby`.",
      "Destructive or high-consequence confirmations MUST use `AlertDialog` (`role=\"alertdialog\"`) rather than `Dialog` so pointer clicks on the scrim never silently dismiss the prompt.",
      "Close button placement (`inset-inline-end: 16px`), title alignment (`text-align: start`), and trailing action ordering (`justify-content: flex-end`) use logical CSS properties for automatic RTL mirroring.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use Material 3 `AlertDialog` (or `BasicAlertDialog` with `Surface(shape = RoundedCornerShape(28.dp), color = MaterialTheme.colorScheme.surfaceContainerHigh, tonalElevation = 6.dp)`), setting `DialogProperties(dismissOnClickOutside = false)` for destructive `AlertDialog` flows.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Present a custom modal card (`minWidth: 280, maxWidth: 520`, `RoundedRectangle(cornerRadius: 28, style: .continuous)`, `padding(24)`) with `.accessibilityAddTraits(.isModal)` so VoiceOver traps focus, or map simple destructive confirmations to native `.alert`.",
      },
      {
        target: "Flutter",
        guidance:
          "Use `showDialog(barrierDismissible: !isAlertDialog)` returning `AlertDialog(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)), backgroundColor: colorScheme.surfaceContainerHigh, insetPadding: EdgeInsets.all(20))`.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Use native `<dialog>` (`showModal()`) or WAI-ARIA `role=\"dialog\"` / `role=\"alertdialog\"` with `aria-modal=\"true\"`, `overscroll-behavior: contain` on the backdrop, and decoupled spatial (`transform`) vs. effects (`opacity`) transitions.",
      },
    ],
    references: [
      {
        label: "Material Design 3 — Dialogs",
        url: "https://m3.material.io/components/dialogs/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Jetpack Compose — AlertDialog.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/AlertDialog.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Alert and Message Dialogs Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/alertdialog/",
        kind: "aria-apg",
      },
      {
        label: "Base UI — Dialog & AlertDialog Primitives",
        url: "https://base-ui.com/react/components/dialog",
        kind: "base-ui",
      },
    ],
  },

  sheet: {
    provenance: "official-m3e",
    provenanceSummary:
      "Implements official Material 3 Expressive modal `BottomSheet` and `SideSheet` (`Sheet`), combining AOSP `SheetBottomTokens` / `SheetSideTokens` (`28px` inner-facing corners, `32×4px` drag handle, `640px` / `400px` max widths) with `@base-ui/react/drawer` velocity-aware swipe dismissal and logical RTL direction resolution.",
    tokenSources: [
      "SHEET_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
      "M3E_ELEVATION_TOKENS",
    ],
    aospSources: [
      "ModalBottomSheet.kt",
      "SheetBottomTokens.kt",
      "SheetSideTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Edge-Anchored Asymmetric `28px` Corner Topology",
        body: "Unlike floating dialogs that round all four corners, M3 sheets anchor flush against a viewport edge and round only the two interior-facing corners to `28px` (`extraLarge`): `[28, 28, 0, 0]` for `BottomSheet`, `[28, 0, 0, 28]` for physical right sheets, and `[0, 28, 28, 0]` for physical left sheets, preserving seamless edge attachment during spring settles.",
      },
      {
        title: "Logical `start` / `end` Resolution & RTL Gesture Mirroring",
        body: "`SideSheet` defaults to logical `side=\"end\"` rather than hardcoded `\"right\"`. `Sheet` reads `useM3EDirection()` (`ltr` vs. `rtl`) to resolve both physical anchor placement and `@base-ui/react/drawer` `swipeDirection`: in LTR, `side=\"end\"` docks on the right (`[28, 0, 0, 28]`) and swipes right to dismiss; in RTL, it docks on the left (`[0, 28, 28, 0]`) and swipes left to dismiss.",
      },
      {
        title: "1:1 Gesture Tracking With Live Scrim Progress",
        body: "While the user drags a `BottomSheet` (`32×4px` drag handle) or `SideSheet` (`[data-swiping]`), CSS transitions temporarily disengage (`transition: none`) so pointer translation tracks 1:1 with zero spring lag, while the backdrop scrim modulates continuously via `opacity: calc(1 - var(--drawer-swipe-progress, 0))` before handing off on release to `defaultSpatial` (`ζ = 0.8, k = 380`).",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "sheet-geometry",
        title: "BottomSheet & SideSheet Geometry (`SHEET_TOKENS`)",
        caption:
          "All metrics in 1:1 logical pixels (px / dp / pt). Corner tuples follow [topLeft, topRight, bottomRight, bottomLeft].",
        columns: [
          "Variant & Logical Side",
          "Dimensions",
          "Corner Tuple [tl, tr, br, bl]",
          "Swipe Dismiss Vector",
          "Chrome & Padding",
        ],
        rows: [
          [
            "`BottomSheet` (`side=\"bottom\"`)",
            "`width: 100%`, `maxWidth: 640px`, `maxHeight: min(85dvh, 720px)`",
            "[28, 28, 0, 0]",
            "`swipeDirection=\"down\"`",
            "`padding: 12px 24px 24px` (with `32×4px` drag handle), stack `gap: 14px`",
          ],
          [
            "`SideSheet` · `side=\"end\"` (LTR) / `\"right\"`",
            "`width: 100%`, `maxWidth: 400px`, `height: 100%`",
            "[28, 0, 0, 28]",
            "`swipeDirection=\"right\"`",
            "`padding: 24px`, `34×34px` `surface-container-high` close button (`t(\"sheet.close\")`)",
          ],
          [
            "`SideSheet` · `side=\"end\"` (RTL) / `\"left\"`",
            "`width: 100%`, `maxWidth: 400px`, `height: 100%`",
            "[0, 28, 28, 0]",
            "`swipeDirection=\"left\"`",
            "`padding: 24px`, `34×34px` `surface-container-high` close button (`t(\"sheet.close\")`)",
          ],
          [
            "`Sheet` · `side=\"top\"`",
            "`width: 100%`, `maxWidth: 640px`, `maxHeight: min(85dvh, 720px)`",
            "[0, 0, 28, 28]",
            "`swipeDirection=\"up\"`",
            "`padding: 24px`, `surface-container-low` + `1px outline-variant` border",
          ],
          [
            "Bottom Drag Handle (`showHandle`)",
            "`32×4px` pill (`margin: 0 auto 4px`)",
            "[9999, 9999, 9999, 9999]",
            "Visual drag affordance (`aria-hidden=\"true\"`)",
            "`42% on-surface-variant` tint",
          ],
        ],
      },
      {
        id: "sheet-motion",
        title: "Slide & Gesture Physics",
        columns: [
          "Interaction Phase",
          "Transform / Scrim Formula",
          "Motion Token",
        ],
        rows: [
          [
            "Programmatic Open / Release Settle",
            "Bottom `0 100% → 0 0`; Right `100% 0 → 0 0`; Left `-100% 0 → 0 0`",
            "`defaultSpatial` (`ζ = 0.8, k = 380`)",
          ],
          [
            "Active Pointer Drag (`[data-swiping]`)",
            "`translate: var(--drawer-swipe-movement-x) var(--drawer-swipe-movement-y)`",
            "`transition: none` (direct 1:1 pointer tracking)",
          ],
          [
            "Backdrop Scrim (`42% scrim`)",
            "`opacity: calc(1 - var(--drawer-swipe-progress, 0))`",
            "`defaultEffects` (`ζ = 1.0, k = 1600`); `none` while `[data-swiping]`",
          ],
        ],
      },
    ],
    invariants: [
      "Sheet containers use `surface-container-low` (`--m3e-color-surface-container-low`) with a `1px outline-variant` border and `elevation-3` shadow to separate cleanly from base `surface` backgrounds.",
      "Because the `32×4px` drag handle is purely visual (`aria-hidden=\"true\"`), sheets MUST remain dismissible by keyboard (`Escape`), backdrop click, and an accessible close button (`showCloseButton`, localized via `t(\"sheet.close\")`, enabled by default on `SideSheet`).",
      "`BottomSheet` width MUST clamp to `640px` (`SHEET_TOKENS.bottomMaxWidth`) on tablet and desktop viewports rather than stretching full-bleed across widescreen monitors.",
      "Logical `side=\"start\"` and `side=\"end\"` MUST resolve against the active `M3EProvider` direction (`ltr` / `rtl`) so corner tuples, viewport docking, and swipe-dismiss vectors mirror in unison.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use `ModalBottomSheet(sheetMaxWidth = 640.dp, shape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp), containerColor = MaterialTheme.colorScheme.surfaceContainerLow, dragHandle = { BottomSheetDefaults.DragHandle(width = 32.dp, height = 4.dp) })` for bottom sheets, and a `400.dp` `RoundedCornerShape(topStart = 28.dp, bottomStart = 28.dp)` modal drawer anchored to `Alignment.CenterEnd` (auto-mirrored via `LocalLayoutDirection`) for side sheets.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Present `.sheet` with `.presentationCornerRadius(28)`, `.presentationDragIndicator(.visible)`, and `.presentationBackground(surfaceContainerLow)` on compact widths; on regular/macOS widths, dock a `400pt` leading/trailing inspector panel using `.transition(.move(edge: .trailing))` (which automatically flips in RTL).",
      },
      {
        target: "Flutter",
        guidance:
          "Use `showModalBottomSheet(constraints: BoxConstraints(maxWidth: 640), showDragHandle: true, backgroundColor: colorScheme.surfaceContainerLow, shape: RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(28))))`, and `endDrawer` (`Drawer(width: 400)`) with `BorderRadiusDirectional.horizontal(start: Radius.circular(28))` for RTL-safe side sheets.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Drive drag translation via CSS custom properties with `transition: none` during active pointer capture, then re-enable `defaultSpatial` (`ζ = 0.8, k = 380`) on `pointerup` so gesture velocity and spring settle never fight.",
      },
    ],
    references: [
      {
        label: "Material Design 3 — Bottom Sheets",
        url: "https://m3.material.io/components/bottom-sheets/specs",
        kind: "m3-spec",
      },
      {
        label: "Material Design 3 — Side Sheets",
        url: "https://m3.material.io/components/side-sheets/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Jetpack Compose — ModalBottomSheet.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ModalBottomSheet.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Drawer Primitive",
        url: "https://base-ui.com/react/components/drawer",
        kind: "base-ui",
      },
    ],
  },

  toast: {
    provenance: "official-m3e",
    provenanceSummary:
      "Implements the official Material 3 Expressive Snackbar as a stacked web notification system (`useM3EToast` and `M3EToastViewportHost`), pairing AOSP `SnackbarTokens` (`inverse-surface`, `inverse-primary` action, `48px` min-height, `12px–16px` radius) with `@base-ui/react/toast` viewport queueing and timer pause-on-hover/focus.",
    tokenSources: [
      "SNACKBAR_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
      "M3E_ELEVATION_TOKENS",
    ],
    aospSources: ["Snackbar.kt", "SnackbarTokens.kt"],
    inspirationAndRationale: [
      {
        title: "High-Contrast `inverse-surface` Polarity",
        body: "Transient notifications float over arbitrary cards, tables, and tonal containers without a modal scrim. Using `inverse-surface` with `inverse-on-surface` text and `inverse-primary` action labels guarantees immediate figure-ground separation in both light and dark themes without relying on heavy drop shadows.",
      },
      {
        title: "Bounded Stack Viewport (`limit = 4`, `timeout = 4200ms`)",
        body: "`M3EProvider` mounts a single `<BaseToast.Provider limit={4} timeout={4200}>` and `M3EToastViewportHost` anchored at `inset-inline-end: 20px; bottom: 20px` (`width: min(420px, calc(100vw - 32px))`, `gap: 10px`). Rapid bursts cap cleanly at 4 visible items (`[data-limited]` fades excess items to `opacity: 0`), while pointer hover or keyboard focus automatically pauses auto-dismiss timers.",
      },
      {
        title: "Single Optional Action + Localized Dismiss Affordance",
        body: "Preserves M3 Snackbar ergonomics—concise title (`14px / 20px w500`), optional secondary description (`12.5px / 17px`), at most one `inverse-primary` text action (`Undo`, `Retry`), and a `28×28px` circular close button (`t(\"toast.close\")`) so keyboard and pointer users can dismiss notifications immediately.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "toast-geometry",
        title: "Snackbar / Toast Container & Viewport Geometry (`SNACKBAR_TOKENS`)",
        caption:
          "All metrics in 1:1 logical pixels (px / dp / pt). Corner tuples follow [topLeft, topRight, bottomRight, bottomLeft].",
        columns: [
          "Element",
          "Dimensions / Constraints",
          "Padding / Gap",
          "Corner Tuple [tl, tr, br, bl]",
          "Color Role",
        ],
        rows: [
          [
            "Viewport Stack (`M3EToastViewportHost`)",
            "`width: min(420px, calc(100vw - 32px))`, `limit = 4`",
            "`inset-inline-end: 20px`, `bottom: 20px`, `gap: 10px`",
            "—",
            "Transparent fixed stack (`z-index: 120`)",
          ],
          [
            "Toast Root (`SNACKBAR_TOKENS`)",
            "`minHeight: 48px`, `maxWidth: 420px`",
            "`padding: 12px 16px`, inline `gap: 12px`",
            "[12, 12, 12, 12] (up to `16px` on rich custom cards)",
            "`inverse-surface` fill, `inverse-on-surface` text, `elevation-3`",
          ],
          [
            "Content Column (`Title` + `Description`)",
            "`flex: 1; min-width: 0`",
            "Stack `gap: 2px`",
            "—",
            "Title `14px / 20px w500`; Description `12.5px / 17px` (`84%` opacity)",
          ],
          [
            "Action Button (`Toast.Action`)",
            "Inline compact action (`13px w650`)",
            "`padding: 6px 10px`",
            "[8, 8, 8, 8]",
            "`inverse-primary` text (`16% inverse-primary` hover tint)",
          ],
          [
            "Dismiss Button (`Toast.Close`)",
            "`28×28px` circular icon target",
            "Centered `16×16px` `×` SVG",
            "[9999, 9999, 9999, 9999]",
            "`75% → 100% inverse-on-surface` (`12%` hover tint), `t(\"toast.close\")`",
          ],
        ],
      },
      {
        id: "toast-motion",
        title: "Toast Lifecycle & Stack Physics",
        columns: [
          "Lifecycle Event",
          "Property Transition",
          "Timing / Motion Token",
        ],
        rows: [
          [
            "Toast Enter / Exit Spatial",
            "`scale: 0.95 → 1`, `translate: 0 12px → 0 0`",
            "`fastSpatial` (`ζ = 0.6, k = 800`)",
          ],
          [
            "Toast Enter / Exit & `[data-limited]` Opacity",
            "`opacity: 0 → 1` (`0` when exceeding `limit = 4`)",
            "`fastEffects` (`ζ = 1.0, k = 3800`, zero overshoot)",
          ],
          [
            "Auto-Dismiss Timer",
            "Default `timeout = 4200ms` (per-toast `duration` override)",
            "Pauses automatically while viewport is hovered or focused",
          ],
        ],
      },
    ],
    invariants: [
      "Toast containers MUST use `inverse-surface`, `inverse-on-surface`, and `inverse-primary` tokens—never standard `surface` or raw `primary`, which collapses contrast on dark-mode inverse surfaces (`inverse-primary` swaps luminance polarity).",
      "Critical errors requiring mandatory user acknowledgement MUST use `Alert` or `AlertDialog` rather than auto-expiring toasts; toasts with interactive `action` buttons pause dismissal on pointer hover and keyboard focus.",
      "Every dismiss button MUST render a localized `aria-label` via `t(\"toast.close\")` and never hardcode English strings.",
      "Viewport anchoring uses logical `inset-inline-end: 20px` so the notification stack docks at bottom-right in LTR and bottom-left in RTL without overlapping leading navigation rails.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use `SnackbarHost` + `SnackbarHostState` rendering `Snackbar(shape = RoundedCornerShape(12.dp), containerColor = MaterialTheme.colorScheme.inverseSurface, contentColor = MaterialTheme.colorScheme.inverseOnSurface, actionColor = MaterialTheme.colorScheme.inversePrimary)`.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Overlay an alignment-aware stack (`.bottomTrailing` on macOS/iPadOS, `.bottom` on iPhone) with `minHeight: 48`, `RoundedRectangle(cornerRadius: 12, style: .continuous)`, `.transition(.scale(scale: 0.95).combined(with: .offset(y: 12)).combined(with: .opacity))`, and pause `Task.sleep` timers on hover/VoiceOver focus.",
      },
      {
        target: "Flutter",
        guidance:
          "Call `ScaffoldMessenger.of(context).showSnackBar(SnackBar(behavior: SnackBarBehavior.floating, width: 420, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), showCloseIcon: true))`.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Mount a single portal viewport per app root (`inset-inline-end: 20px; bottom: 20px`), cap concurrent items to `4`, and pause countdown timers on `pointerenter` and `focusin`.",
      },
    ],
    references: [
      {
        label: "Material Design 3 — Snackbar",
        url: "https://m3.material.io/components/snackbar/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Jetpack Compose — Snackbar.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Snackbar.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Toast Primitive",
        url: "https://base-ui.com/react/components/toast",
        kind: "base-ui",
      },
    ],
  },

  "progress-meter": {
    provenance: "official-m3e",
    provenanceSummary:
      "Implements the complete Material 3 Expressive progress and loading family—`LinearProgressIndicator`, `CircularProgressIndicator`, `LinearWavyProgressIndicator`, `CircularWavyProgressIndicator`, `LoadingIndicator`, and `ContainedLoadingIndicator`—directly ported from AOSP `ProgressIndicator.kt`, `WavyProgressIndicator.kt`, `LoadingIndicator.kt`, and `MaterialShapes.kt`, paired with a semantic web `Meter` (`@base-ui/react/meter`) adaptation.",
    tokenSources: [
      "PROGRESS_TOKENS",
      "WAVY_PROGRESS_TOKENS",
      "CIRCULAR_WAVY_TOKENS",
      "LOADING_INDICATOR_TOKENS",
      "LOADING_INDICATOR_SHAPE_SEQUENCE",
      "LOADING_INDICATOR_MORPH_SEQUENCE",
      "METER_TOKENS",
      "resolveCircularProgressArcs",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: [
      "ProgressIndicator.kt",
      "WavyProgressIndicator.kt",
      "LoadingIndicator.kt",
      "MaterialShapes.kt",
      "ProgressIndicatorTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "M3E Disjoint Track Gap (`4px`) & Trailing Stop Dot (`4px`)",
        body: "Material 3 Expressive replaces continuous overlapping tracks with two separated rounded segments divided by an exact `4px` `trackGap`, plus a `4px` `primary` `stopDotSize` circle anchored at the trailing end of determinate linear tracks so total track bounds remain scannable even at `0%`. At `<= 1%` or `>= 99%`, `trackGap` collapses cleanly to `0px` (`resolveCircularProgressArcs` subtracts `seamClearance = trackGap + strokeWidth` to account for round stroke caps).",
      },
      {
        title: "C1 Hermite Linear Waves & Integer-Lobe (`N = 9`) Polar Quantization",
        body: "`LinearWavyProgressIndicator` (`40px` determinate / `20px` indeterminate wavelength, `10px` height, `4px` stroke, `3px` max amplitude) samples quarter-wavelengths via exact Hermite cubic Beziers (`y'(x) = A · k · cos(kx - φ)`) and flattens wave amplitude to `0` at `<= 10%` and `>= 95%` (`500ms` ramp) so low/near-complete states read accurately. `CircularWavyProgressIndicator` (`48px` box, base radius `R0 = 20.4px`, target `λ = 15px`) quantizes lobe count to an exact integer `N = max(4, round(2π · R0 / λ)) = 9`, guaranteeing `r(θ0 + 2π) = r(θ0)` and `r'(θ0 + 2π) = r'(θ0)` for zero-kink C1 seam closure at `100%`.",
      },
      {
        title: "7-Shape Morphing `LoadingIndicator` & Semantic Capacity `Meter`",
        body: "For short indeterminate waits (`< 5s`), `LoadingIndicator` (`48px` container, `38px` active glyph, anti-clipping scale `≈ 0.6605`) cycles through 7 normalized `[0..1]²` cubic-Bezier `MaterialShapes`—`softBurst → cookie9Sided → pentagon → pill → sunny → cookie4Sided → oval`—every `650ms` via an underdamped spring (`ζ = 0.6, k = 200`, `~9.5%` morph overshoot) with a `+90°` quarter-turn per step plus a continuous `4666ms` `360°` global rotation. Conversely, static capacity gauges (storage, quota, battery) use `Meter` (`role=\"meter\"`), which shares M3E `8px` disjoint-gap geometry while shifting fill color across `70%` (`tertiary` warning) and `90%` (`error` critical) thresholds.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "progress-meter-geometry",
        title: "Indicator, Wavy, Morphing & Meter Geometry",
        caption:
          "All metrics in 1:1 logical pixels (px / dp / pt). Corner tuples follow [topLeft, topRight, bottomRight, bottomLeft].",
        columns: [
          "Component",
          "Dimensions / Stroke",
          "Seam & Endpoint Geometry",
          "Wave / Shape Topology",
          "Color Roles",
        ],
        rows: [
          [
            "`LinearProgressIndicator` (`PROGRESS_TOKENS`)",
            "Height `4px` (`thick = 8px`), full pill caps (`9999px`)",
            "`trackGap = 4px` (`0` at `<=1%` / `>=99%`), trailing `stopDotSize = 4px`",
            "Straight disjoint active + rest bars",
            "Active & stop dot `primary`; rest track `secondary-container`",
          ],
          [
            "`CircularProgressIndicator` (`sm | md | lg`)",
            "`sm`: `36px / 4px`; `md`: `48px / 4.5px`; `lg`: `64px / 6px`",
            "Arc clearance `trackGap (4px) + strokeWidth` between round caps",
            "Concentric SVG arcs starting at `-90°` (`12 o'clock`)",
            "Active `primary`; rest arc `secondary-container`",
          ],
          [
            "`LinearWavyProgressIndicator` (`WAVY_PROGRESS_TOKENS`)",
            "Default width `240px`, height `10px`, stroke `4px`, `A_max = 3px`",
            "`trackActiveGap = 4px`, trailing `stopIndicatorSize = 4px`",
            "`λ = 40px` determinate (`20px` indeterminate); flattens `A → 0` at `<=10%` or `>=95%`",
            "Active sinusoid & stop dot `primary`; flat rest line `secondary-container`",
          ],
          [
            "`CircularWavyProgressIndicator` (`CIRCULAR_WAVY_TOKENS`)",
            "`48×48px` (`sm 36px`, `lg 64px`), stroke `4px`, `A_max = 1.6px`",
            "Angular clearance `(strokeWidth + 4px) / R0` (`R0 = 20.4px` at `48px`)",
            "Integer lobes `N = round(2π · 20.4 / 15) = 9` for C1 `2π` closure",
            "Active polar wave `primary`; circular rest arc `secondary-container`",
          ],
          [
            "`LoadingIndicator` & `ContainedLoadingIndicator`",
            "`48×48px` container (`[24, 24, 24, 24]` contained circle), `38px` active glyph",
            "Anti-clipping scale `0.6605` (determinate `circle → softBurst` `0.7917`)",
            "`softBurst → cookie9Sided → pentagon → pill → sunny → cookie4Sided → oval`",
            "Uncontained `primary`; Contained `primary-container` bg + `on-primary-container` glyph",
          ],
          [
            "`Meter` (`METER_TOKENS`)",
            "Track height `8px`, full pill caps (`[9999, 9999, 9999, 9999]`)",
            "`trackGap = 4px` (`0` at `0%` or `100%`), strictly determinate",
            "Threshold fill: `< 70%` normal, `>= 70%` warning, `>= 90%` critical",
            "`< 70%` `primary` · `70%–89%` `tertiary` · `>= 90%` `error`; track `secondary-container`",
          ],
        ],
      },
      {
        id: "progress-meter-motion",
        title: "Spring, Wave Phase & Morph Timing Contracts",
        columns: [
          "Mechanism",
          "Period / Step",
          "Physics / Mathematical Law",
        ],
        rows: [
          [
            "Determinate Progress Scrub (`Linear`, `Circular`, `Meter`)",
            "Continuous on `value` change",
            "`defaultSpatial` (`ζ = 0.8, k = 380`)",
          ],
          [
            "`LoadingIndicator` Shape Morph + Quarter Turn",
            "`morphIntervalMs = 650ms` per shape + `4666ms` `360°` linear spin",
            "Analytical second-order spring `ζ = 0.6, k = 200` (`~9.5%` overshoot; clamped `[0, 1]` on `+90°` step rotation)",
          ],
          [
            "`LinearWavy` Phase Drift & Indeterminate Dual-Line",
            "`1 λ/s` (`40px/s` det, `20px/s` indet); `1800ms` indeterminate cycle",
            "Line 1 (`0ms/750ms` head, `333ms/850ms` tail) + Line 2 (`1000ms/567ms` head, `1267ms/533ms` tail); `500ms` amplitude ramp",
          ],
          [
            "`CircularWavy` Angular Phase & Indeterminate Sweep",
            "`ω = 2π rad/s` (`6.2832 rad/s`); `2400ms` indeterminate cycle",
            "Sweep pulses `12% ↔ 78%` of `2π` via cubic ease-in-out with tail catchup",
          ],
        ],
      },
    ],
    invariants: [
      "Progress indicators (`role=\"progressbar\"`) represent temporal task completion (`aria-valuenow` omitted when `indeterminate`), whereas `Meter` (`role=\"meter\"`) represents static scalar capacity and MUST NEVER render an indeterminate state.",
      "`CircularWavyProgressIndicator` MUST quantize lobe count `N = max(4, round(2π · R0 / targetWavelength))` to an integer (`N = 9` at `48px`) so the `100%` closed wave has continuous position and tangent with zero seam kink.",
      "`LinearWavyProgressIndicator` MUST decay wave amplitude smoothly to `0` when `progress <= 0.10` or `progress >= 0.95` so near-empty and near-complete states never clip against round endcaps or disguise completion.",
      "Under `prefers-reduced-motion: reduce`, continuous `requestAnimationFrame` phase loops (`Wavy` and `LoadingIndicator`) halt automatically: `Wavy` renders a static curve and `LoadingIndicator` holds a steady `softBurst` glyph without spinning.",
      "Linear tracks (`LinearProgressIndicator`, `LinearWavyProgressIndicator`, `Meter`) progress along the inline start-to-end axis so RTL layouts fill right-to-left automatically.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use Material 3 Expressive `LinearProgressIndicator`, `CircularProgressIndicator`, `LinearWavyProgressIndicator`, `CircularWavyProgressIndicator`, `LoadingIndicator`, and `ContainedLoadingIndicator` from `androidx.compose.material3` (`gapSize = 4.dp`); implement `Meter` via a custom `Canvas` or two-box row with `semantics { progressBarRangeInfo = ProgressBarRangeInfo(value, 0f..max) }` and `70% / 90%` color thresholds.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Render wavy and disjoint-gap tracks inside `TimelineView(.animation)` + `Canvas` (pausing when `@Environment(\\.accessibilityReduceMotion)` is true) using the exact Hermite cubic Bezier and `N = 9` polar formulas; map `LoadingIndicator` to pre-paired `[0..1]²` `Path` cubics driven by `Spring(duration: 0.44, bounce: 0.4)` every `650ms`.",
      },
      {
        target: "Flutter",
        guidance:
          "Enable `ProgressIndicatorThemeData(year2023: false, stopIndicatorRadius: 2, trackGap: 4)` for M3E disjoint linear/circular indicators, and implement wavy/polygon-morph indicators via `CustomPainter` + `Ticker` (disabled when `MediaQuery.disableAnimationsOf(context)` is true).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Mutate `<path d>` directly on an SVG ref inside `requestAnimationFrame` rather than reactive framework state at `60fps`, and use semantic `<div role=\"meter\" aria-valuenow aria-valuemin aria-valuemax>` for capacity gauges.",
      },
    ],
    references: [
      {
        label: "Material Design 3 — Progress Indicators",
        url: "https://m3.material.io/components/progress-indicators/specs",
        kind: "m3-spec",
      },
      {
        label: "Material Design 3 — Loading Indicator",
        url: "https://m3.material.io/components/loading-indicator/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Jetpack Compose — WavyProgressIndicator.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/WavyProgressIndicator.kt",
        kind: "aosp-source",
      },
      {
        label: "AOSP Jetpack Compose — LoadingIndicator.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/LoadingIndicator.kt",
        kind: "aosp-source",
      },
    ],
  },

  tooltip: {
    provenance: "official-m3e",
    provenanceSummary:
      "Implements official Material 3 Expressive `Tooltip` (Plain) and `RichTooltip`, pairing AOSP `PlainTooltipTokens` (`inverse-surface`, `8px` radius) and `RichTooltipTokens` (`surface-container-high`, `16px` radius, `312px` max width) with `@base-ui/react/tooltip` shared hover warmup coordination.",
    tokenSources: [
      "TOOLTIP_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
      "M3E_ELEVATION_TOKENS",
    ],
    aospSources: [
      "Tooltip.kt",
      "PlainTooltipTokens.kt",
      "RichTooltipTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Plain (`inverse-surface`) vs. Rich (`surface-container-high`) Dual Hierarchy",
        body: "Plain `Tooltip` labels icon-only controls with concise text (`12px / 16px w500`) on a compact `8px`-radius `inverse-surface` pill (`pointer-events: none` so it never blocks adjacent cursor targets). `RichTooltip` expands into a `16px`-radius `surface-container-high` card (`max-width: 312px`, `12px × 16px` padding) supporting an optional `subhead`, multi-line `content`, and an interactive `action` row.",
      },
      {
        title: "Shared Toolbar Warmup Channel (`delay = 280ms`, `timeout = 400ms`)",
        body: "`M3EProvider` mounts a single top-level `<BaseTooltip.Provider delay={280} timeout={400}>`. Resting on the first icon waits `280ms` (`250ms` on `RichTooltip`) to prevent accidental flyovers, after which scrubbing across sibling toolbar buttons hands off instantaneously (`0ms` delay) until the pointer leaves all triggers for `400ms`.",
      },
      {
        title: "WCAG 1.4.13 Hoverable Persistence on `RichTooltip`",
        body: "Because `RichTooltip` may contain an interactive `action` link or button, it enables `pointer-events: auto` and a `closeDelay` of `140ms`, allowing pointer users to cross the `10px` `sideOffset` gap into the popup without premature dismissal while still dismissing cleanly on `Escape`.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "tooltip-geometry",
        title: "Plain & Rich Tooltip Geometry (`TOOLTIP_TOKENS`)",
        caption:
          "All metrics in 1:1 logical pixels (px / dp / pt). Corner tuples follow [topLeft, topRight, bottomRight, bottomLeft].",
        columns: [
          "Variant",
          "Max Width & Offset",
          "Padding / Internal Gap",
          "Corner Tuple [tl, tr, br, bl]",
          "Surface & Typography",
        ],
        rows: [
          [
            "Plain `Tooltip`",
            "Content-fit, `sideOffset: 8px` (default `side=\"top\"`)",
            "`padding: 6px 10px`",
            "[8, 8, 8, 8]",
            "`inverse-surface` / `inverse-on-surface` (`12px / 16px w500`), `elevation-2`, `pointer-events: none`",
          ],
          [
            "`RichTooltip`",
            "`maxWidth: 312px` (`min(312px, calc(100vw - 24px))`), `sideOffset: 10px` (default `side=\"bottom\"`)",
            "`padding: 12px 16px`, stack `gap: 6px` (action `padding-top: 4px`)",
            "[16, 16, 16, 16]",
            "`surface-container-high` + `1px outline-variant`, `elevation-3`, `pointer-events: auto`",
          ],
          [
            "`RichTooltip` Typography",
            "Subhead + Body + Optional Action",
            "Action row `flex; gap: 8px`",
            "—",
            "Subhead `13.5px / 18px w600 on-surface`; Body `12.5px / 18px on-surface-variant`",
          ],
        ],
      },
      {
        id: "tooltip-motion",
        title: "Warmup Timing & Entrance Physics",
        columns: [
          "Phase",
          "Timing / Property",
          "Motion Token",
        ],
        rows: [
          [
            "Cold Hover Delay",
            "Plain `280ms`; Rich `250ms` (`closeDelay: 140ms` on Rich)",
            "`BaseTooltip.Provider` state machine",
          ],
          [
            "Warm Sibling Handoff Window",
            "`0ms` open delay within `timeout = 400ms` of previous close",
            "Shared `M3EProvider` tooltip warmup context",
          ],
          [
            "Popup Enter / Exit",
            "`opacity: 0 → 1`, `scale: 0.94 → 1`, `translate: 0 3px → 0 0`",
            "`fastEffects` (`ζ = 1.0, k = 3800`, crisp zero-overshoot micro-reveal)",
          ],
        ],
      },
    ],
    invariants: [
      "Plain `Tooltip` MUST ONLY carry supplementary descriptive text (or mirror an icon button's `aria-label`) and keep `pointer-events: none`; interactive links or buttons belong exclusively in `RichTooltip` (`action` slot) or `Popover`.",
      "Both `Tooltip` and `RichTooltip` MUST open on keyboard focus (`focus-visible`) as well as pointer hover, and MUST dismiss immediately on `Escape` without moving focus (WCAG 2.1 SC 1.4.13).",
      "Plain `Tooltip` uses `inverse-surface` / `inverse-on-surface`, whereas `RichTooltip` uses `surface-container-high` (`on-surface` / `on-surface-variant`) with `1px outline-variant` border so multi-line cards never create harsh inverse glare.",
      "Collision-aware positioning (`side`, `align`, `sideOffset`) flips and shifts within viewport bounds across both LTR and RTL document directions.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Wrap triggers in `TooltipBox(positionProvider = TooltipDefaults.rememberPlainTooltipPositionProvider(), tooltip = { PlainTooltip(shape = RoundedCornerShape(8.dp)) { Text(...) } }, state = rememberTooltipState())`, or `RichTooltip(title = ..., action = ..., shape = RoundedCornerShape(16.dp))` (`isPersistent = true` when an action is present).",
      },
      {
        target: "SwiftUI",
        guidance:
          "Map plain tooltips to `.help(\"...\")` on macOS/iPadOS pointer targets (plus `.accessibilityLabel` on icon-only buttons), and implement `RichTooltip` as a `maxWidth: 312` `RoundedRectangle(cornerRadius: 16, style: .continuous)` `.popover` with hover/focus triggers.",
      },
      {
        target: "Flutter",
        guidance:
          "Use `Tooltip(waitDuration: Duration(milliseconds: 280), decoration: BoxDecoration(color: colorScheme.inverseSurface, borderRadius: BorderRadius.circular(8)))` for plain labels and `MenuAnchor` / `OverlayPortal` (`maxWidth: 312`, `borderRadius: 16`) for rich interactive tooltips.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Share a single hover-warmup state machine (`280ms` initial delay, `400ms` handoff timeout) at the app root, wire triggers via `aria-describedby`, and set `closeDelay: 140ms` with `pointer-events: auto` on rich tooltips.",
      },
    ],
    references: [
      {
        label: "Material Design 3 — Tooltips (Plain & Rich)",
        url: "https://m3.material.io/components/tooltips/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Jetpack Compose — Tooltip.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Tooltip.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Tooltip Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/",
        kind: "aria-apg",
      },
      {
        label: "Base UI — Tooltip Primitive",
        url: "https://base-ui.com/react/components/tooltip",
        kind: "base-ui",
      },
    ],
  },
};
