import type { ComponentDesignSpec } from "../types";

export const INPUTS_DESIGN_SPECS: Readonly<Record<string, ComponentDesignSpec>> = {
  "text-field": {
    provenance: "official-m3e",
    provenanceSummary:
      "Implements official Material 3 Expressive Outlined and Filled text fields (`TextField` and `TextareaField`), aligned with Jetpack Compose `OutlinedTextField.kt` and `TextField.kt` while layered on `@base-ui/react/field` and `@base-ui/react/input` for accessible web form semantics.",
    tokenSources: [
      "TEXT_FIELD_TOKENS",
      "SHAPE_CORNER_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
      "M3E_TYPOGRAPHY_TOKENS",
    ],
    aospSources: [
      "OutlinedTextField.kt",
      "TextField.kt",
      "OutlinedTextFieldTokens.kt",
      "FilledTextFieldTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "True CSS Cutout Notch vs. Background Masking",
        body: "Conventional web ports fake the M3 outlined floating label notch by painting an opaque background patch behind the label, which breaks as soon as the field sits over a tonal card, sheet, or gradient. `TextField` renders an `aria-hidden=\"true\"` `<fieldset>` + `<legend>` outline overlay whose `<legend>` expands from `max-width: 0.01px` to `100%` (`4px` inline notch padding), creating a genuine transparent border cutout over any surface.",
      },
      {
        title: "Dual Label Topology (`floating` vs. `outside`) & Mobile Zoom Prevention",
        body: "Supports both canonical M3 `56px` floating-label containers (`[4, 4, 4, 4]` outlined, `[4, 4, 0, 0]` filled) and dense `48px` outside-label form layouts (`[12, 12, 12, 12]` / `[12, 12, 0, 0]`) where supporting descriptions sit above the control so mobile virtual keyboards never occlude format rules. Enforces `font-size: max(1rem, 16px)` (`minFontSize = 16`) to prevent iOS Safari viewport auto-zoom on focus.",
      },
      {
        title: "Identifier Input Hygiene & Deferred Blur Validation",
        body: "Fields with `type` in `email | url | search | password` automatically disable `autoCorrect`, `autoCapitalize`, and `spellCheck` so mobile keyboards never mutate credentials or URLs. Validation defaults to `validationMode=\"onBlur\"` so users are not interrupted by premature error states on their first keystroke.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "text-field-geometry",
        title: "Container & Typography Geometry (`TEXT_FIELD_TOKENS`)",
        caption:
          "All metrics in 1:1 logical pixels (px / dp / pt). Corner tuples follow [topLeft, topRight, bottomRight, bottomLeft].",
        columns: [
          "Variant & Label Mode",
          "Min Height",
          "Corner Tuple [tl, tr, br, bl]",
          "Inline Padding",
          "Stroke / Indicator",
        ],
        rows: [
          [
            "Outlined · Floating (`default`)",
            "56px (compact 48px)",
            "[4, 4, 4, 4]",
            "16px",
            "1px `outline` rest → 2px `primary` focus (`error` invalid)",
          ],
          [
            "Outlined · Outside Label",
            "48px",
            "[12, 12, 12, 12]",
            "16px",
            "1px `outline` rest → 1px + 1px ring `primary` focus",
          ],
          [
            "Filled · Floating",
            "56px (compact 52px)",
            "[4, 4, 0, 0]",
            "16px",
            "Bottom 1px `on-surface-variant` → 2px inset `primary` focus",
          ],
          [
            "Filled · Outside Label",
            "48px",
            "[12, 12, 0, 0]",
            "16px",
            "Bottom 1px `on-surface-variant` → 2px inset `primary` focus",
          ],
          [
            "TextareaField (`rows >= 3`)",
            "Input min 76px (`padding-block: 12px`)",
            "Matches Outlined / Filled mode",
            "16px",
            "Vertical resize enabled; Filled floated `26px / 10px` block pad",
          ],
        ],
      },
      {
        id: "text-field-motion",
        title: "Floating Label & State Physics",
        columns: [
          "Animated Property",
          "Rest State",
          "Floated / Focused State",
          "Motion Token",
        ],
        rows: [
          [
            "Floating Label Position",
            "Centered (`top: 50%, translate: 0 -50%`); `16px` top in Textarea",
            "Outlined `top: 0, translate: 0 -50%` (`-28px` start shift with leading icon); Filled `top: 8px`",
            "`fastSpatial` (`ζ = 0.6, k = 800`)",
          ],
          [
            "Floating Label Scale & Color",
            "`16px / 24px` (`w400`), `on-surface-variant`",
            "`12px / 16px` (`w500`), `primary` focused / `error` invalid",
            "`fastEffects` (`ζ = 1.0, k = 3800`, zero overshoot)",
          ],
          [
            "Outline Notch & Stroke Crossfade",
            "Transparent Outlined (`1px outline`); Filled `surface-container-highest`",
            "Dual-stroke `2px primary` `opacity: 0 → 1` (`padding-inline: 4px` notch); Filled `surface-container-high`",
            "`defaultEffects` (`180ms cubic-bezier(0.2, 0, 0, 1)`)",
          ],
        ],
      },
    ],
    invariants: [
      "Outlined containers use `transparent` background with dual-stroke `<fieldset>` `opacity` crossfade (`1px outline` → `2px primary`); Filled containers use `surface-container-highest` shifting to `surface-container-high` on hover/focus.",
      "Placeholder text inside `labelPosition=\"floating\"` shells MUST remain `color: transparent` while unfloated so placeholder copy never collides with the resting floating label.",
      "Trailing clear (`t(\"textField.clear\")`) and password visibility (`t(\"textField.showPassword\")` / `t(\"textField.hidePassword\")`) buttons are `32×32px` circular targets with localized `aria-label` strings and zero hardcoded text.",
      "All horizontal insets (`padding-inline`, `inset-inline-start`, `<fieldset>` `text-align: start`) use CSS logical properties so the outline notch and affixes mirror automatically in RTL.",
      "Character counters (`tabular-nums`) use `aria-live=\"off\"` while validation errors render an explicit error icon alongside text inside `BaseField.Error` so state is never conveyed by color alone.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Map directly to `OutlinedTextField` and `TextField` in `androidx.compose.material3`, supplying `ShapeDefaults.ExtraSmall` (`4.dp`) for floating-label fields or `ShapeDefaults.Medium` (`12.dp`) when rendering external labels above the field.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Wrap `TextField` / `SecureField` / `TextEditor` in a `56pt` container using `.overlay` with a custom `Shape` path that leaves a horizontal gap `[notchStart, notchEnd]` along the top edge, animating label offset with `Spring(mass: 1, stiffness: 800, damping: 33.94)`.",
      },
      {
        target: "Flutter",
        guidance:
          "Use `TextFormField` with `InputDecoration(floatingLabelBehavior: FloatingLabelBehavior.auto, contentPadding: EdgeInsets.symmetric(horizontal: 16))` and `OutlineInputBorder(borderRadius: BorderRadius.circular(4))` (`GapPadding: 4`).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Keep native `<input>` / `<textarea>` inside a single flex shell, drive the `<fieldset aria-hidden=\"true\"><legend>` cutout via a `data-floating` attribute (`focused || value.length > 0 || hasPrefix`), and enforce `font-size >= 16px`.",
      },
    ],
    references: [
      {
        label: "Material 3 — Text Fields Overview & Specs",
        url: "https://m3.material.io/components/text-fields/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose — OutlinedTextField.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/OutlinedTextField.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Field & Input Primitives",
        url: "https://base-ui.com/react/components/field",
        kind: "base-ui",
      },
    ],
  },

  "number-field": {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Web-native numeric stepper extrapolated from M3E `SplitButton` and `ConnectedButtonGroup` seam topology (`22px` outer half-pill, `2px` seam gap, `4px → 10px` pressed seam softening) combined with `@base-ui/react/number-field` pointer scrub-dragging and `Intl.NumberFormat` localization.",
    tokenSources: [
      "NUMBER_FIELD_TOKENS",
      "flipCornersHorizontal",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: ["SplitButton.kt", "ButtonGroup.kt"],
    inspirationAndRationale: [
      {
        title: "Connected Asymmetric Pill Extrapolated from `SplitButton`",
        body: "Native `<input type=\"number\">` spin buttons are tiny (`~14×11px`), visually inconsistent across browsers, and prone to accidental scroll-wheel edits. `NumberField` flanks a `44px`-tall tabular numeric readout with `42×44px` connected decrement/increment buttons separated by a `2px` seam (`[22, 4, 4, 22]` and `[4, 22, 22, 4]`), creating a unified `44px` capsule.",
      },
      {
        title: "Inverse Seam Softening (`4px → 10px`) on Press",
        body: "Mirroring AOSP `SplitButton` physics, pressing either stepper softens its inner seam corners from `4px` to `10px` via `fastSpatial` (`ζ = 0.6, k = 800`) with a `~95ms` minimum hold window (`usePressHoldState`), giving tactile per-button separation without shifting the total control width.",
      },
      {
        title: "Desktop Label Scrubbing & Locale-Exact Formatting",
        body: "Wraps the field `<label>` in `BaseNumberField.ScrubArea` (`cursor: ew-resize`) for pro-tool horizontal drag adjustment while formatting and parsing currency, percentages, or decimals through the active `M3EProvider` BCP 47 `locale`.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "number-field-geometry",
        title: "Connected Stepper Topology (`NUMBER_FIELD_TOKENS`)",
        caption:
          "Corner tuples `[tl, tr, br, bl]` shown for LTR; apply `flipCornersHorizontal` (`[tr, tl, bl, br]`) in RTL.",
        columns: [
          "Segment",
          "Dimensions (`W × H`)",
          "Rest Corners (LTR)",
          "Pressed Corners (LTR)",
          "Surface & Content Roles",
        ],
        rows: [
          [
            "Decrement Button (`-`)",
            "42 × 44px",
            "[22, 4, 4, 22]",
            "[22, 10, 10, 22]",
            "`secondary-container` / `on-secondary-container` → active `primary-container`",
          ],
          [
            "Center Numeric Input",
            "88 × 44px (`seamGap: 2px`)",
            "[4, 4, 4, 4]",
            "[4, 4, 4, 4]",
            "`surface-container-high` rest → `inset 0 0 0 2px primary` focus",
          ],
          [
            "Increment Button (`+`)",
            "42 × 44px",
            "[4, 22, 22, 4]",
            "[10, 22, 22, 10]",
            "`secondary-container` / `on-secondary-container` → active `primary-container`",
          ],
        ],
      },
      {
        id: "number-field-motion",
        title: "Spring & Interaction Contract",
        columns: ["Interaction", "Target Property", "Physics / Token"],
        rows: [
          [
            "Stepper Pointer Down / Up",
            "Inner seam corners `4px ↔ 10px` (min-hold `95ms`)",
            "`fastSpatial` (`ζ = 0.6, k = 800`, `c = 33.94`)",
          ],
          [
            "Stepper Hover / Active Tint",
            "`secondary-container` → OKLCH 12% mix → `primary-container`",
            "`fastEffects` (`ζ = 1.0, k = 3800`, zero overshoot)",
          ],
          [
            "Label Horizontal Scrub",
            "Continuous `step`-quantized value delta",
            "Pointer lock / `ew-resize` drag via `@base-ui/react/number-field`",
          ],
        ],
      },
    ],
    invariants: [
      "Outer capsule radius MUST equal half of control height (`44 / 2 = 22px`), separated from the center input by a physical `2px` flex `gap` rather than shared borders.",
      "In RTL (`direction === \"rtl\"`), decrement sits on the inline-start (right) side with corners flipped via `flipCornersHorizontal` to `[4, 22, 22, 4]` rest / `[10, 22, 22, 10]` pressed, and increment flips to `[22, 4, 4, 22]` / `[22, 10, 10, 22]`.",
      "Numeric readout enforces `font-variant-numeric: tabular-nums` (`w600`, centered) so digit increments never jitter adjacent layout.",
      "Decrement and increment buttons resolve localized `aria-label` strings (`t(\"numberField.decrement\")`, `t(\"numberField.increment\")`) and automatically disable at `min` / `max` bounds while `ArrowUp` / `ArrowDown` / `Home` / `End` remain active on the input.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Compose a `Row(horizontalArrangement = Arrangement.spacedBy(2.dp))` with two `42.dp × 44.dp` `FilledTonalIconButton`s using animated `RoundedCornerShape` (`22.dp` outer, `animateDpAsState` `4.dp ↔ 10.dp` inner via `fastSpatial`) around a `BasicTextField`.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Use `HStack(spacing: 2)` with `UnevenRoundedRectangle` steppers (`topLeadingRadius` / `bottomLeadingRadius` mapped to leading/trailing so RTL mirrors automatically) and `.monospacedDigit()` on the central `TextField`.",
      },
      {
        target: "Flutter",
        guidance:
          "Use `Row` with `2.0` `SizedBox` gaps and `BorderRadiusDirectional.horizontal(start: Radius.circular(22), end: Radius.circular(innerR))` so `Directionality.of(context)` mirrors corners automatically.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Avoid `<input type=\"number\">`; use `<input type=\"text\" inputmode=\"decimal\">` with `role=\"spinbutton\"` (`aria-valuenow`, `aria-valuemin`, `aria-valuemax`) to suppress browser spinners and scroll-wheel hijacking.",
      },
    ],
    references: [
      {
        label: "Base UI — Number Field Component",
        url: "https://base-ui.com/react/components/number-field",
        kind: "base-ui",
      },
      {
        label: "WAI-ARIA APG — Spinbutton Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/",
        kind: "aria-apg",
      },
      {
        label: "AOSP Compose — SplitButton.kt (Asymmetric Seam Physics)",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/SplitButton.kt",
        kind: "aosp-source",
      },
    ],
  },

  select: {
    provenance: "official-m3e",
    provenanceSummary:
      "Adapts the Material 3 Exposed Dropdown Menu (`ExposedDropdownMenu.kt`) into an accessible desktop/mobile web `Select` built on `@base-ui/react/select`, pairing the notched `TextField` trigger shell with strictly concentric `16px - 6px = 10px` popup item geometry.",
    tokenSources: [
      "SELECT_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
      "SHAPE_CORNER_TOKENS",
    ],
    aospSources: ["ExposedDropdownMenu.kt", "MenuTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Strict Concentric Popup Geometry (`16px - 6px = 10px`)",
        body: "A popup with `popupRadius = 16px` and `popupPadding = 6px` requires resting option rows to have `itemRadius = 16 - 6 = 10px` so outer and inner arcs share the exact same center of curvature. When selected, the active row expands slightly into a `12px` `secondary-container` pill (`itemSelectedRadius = 12px`) via `fastSpatial`, while pointer press tightens corners to `6px`.",
      },
      {
        title: "Zero-Jitter Bold-Width Reservation",
        body: "Promoting the selected option label from `font-weight: 500` to `600` normally widens intrinsic popup width and shifts text. Each `.m3e-select__item-label[data-text]::after` reserves the hidden `font-weight: 600` box height-zero in flow, and `BaseSelect.ItemIndicator` stays `keepMounted` (`18×18px`, `visibility: hidden` when unselected) so popup width never jumps.",
      },
      {
        title: "Anchor-Aligned Dropdown Positioning (`alignItemWithTrigger={false}`)",
        body: "Follows M3 Exposed Dropdown Menu behavior by anchoring the `surface-container` popup `6px` below the `56px` / `48px` trigger shell (`min-width: var(--anchor-width)`) rather than covering the trigger label with OS-style centered overlays.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "select-geometry",
        title: "Trigger & Concentric Popup Metrics (`SELECT_TOKENS`)",
        columns: [
          "Part",
          "Dimensions",
          "Corner Tuple [tl, tr, br, bl]",
          "Surface & Typography",
        ],
        rows: [
          [
            "Trigger (`outlined` / `filled`)",
            "Min height `56px` (`floating`) / `48px` (`outside`), `padding-inline: 16px` (`44px` end with clear)",
            "Floating `[4, 4, 4, 4]` / `[4, 4, 0, 0]`; Outside `[12, 12, 12, 12]` / `[12, 12, 0, 0]`",
            "Matches `TextField` shell + `18×18px` trailing chevron",
          ],
          [
            "Popup Container",
            "`min-width: var(--anchor-width)`, `padding: 6px`, `sideOffset: 6px`, list `max-height: 296px`",
            "[16, 16, 16, 16]",
            "`surface-container` + `1px outline-variant` border",
          ],
          [
            "Option Row (Rest / Highlighted)",
            "Min height `42px` (`56px` with description), `padding: 8px 12px` (`10px 12px`), `itemGap: 2px`",
            "[10, 10, 10, 10] (`16 - 6` concentric)",
            "Transparent rest → `8% on-surface` state layer highlight (`14px / 20px w500`)",
          ],
          [
            "Option Row (Selected / Pressed)",
            "Same box metrics + `18×18px` trailing checkmark",
            "Selected `[12, 12, 12, 12]`; Pressed `[6, 6, 6, 6]`",
            "`secondary-container` / `on-secondary-container` (`w600`)",
          ],
        ],
      },
      {
        id: "select-motion",
        title: "Chevron, Popup & Option Physics",
        columns: ["Element", "Transition", "Motion Token"],
        rows: [
          [
            "Trigger Chevron",
            "Rotation `0° ↔ 180°` on open/close",
            "`fastSpatial` (`ζ = 0.6, k = 800`, allows subtle rotational overshoot)",
          ],
          [
            "Popup Enter / Exit",
            "`scale: 0.98 0.94 → 1 1`, `translate: 0 -6px → 0 0` + `opacity: 0 → 1`",
            "Scale/translate `fastSpatial` (`ζ = 0.6, k = 800`); opacity `fastEffects` (`ζ = 1.0, k = 3800`)",
          ],
          [
            "Option Corner Morph",
            "`10px` (rest) ↔ `6px` (pressed) ↔ `12px` (selected)",
            "`fastSpatial` on selection, `defaultEffects` (`ζ = 1.0, k = 1600`) on release",
          ],
        ],
      },
    ],
    invariants: [
      "Popup single-surface hierarchy: popup uses `surface-container` while selected rows use `secondary-container` (`on-secondary-container` text + checkmark), avoiding nested tonal surface clashes.",
      "Unfloated `labelPosition=\"floating\"` triggers hide `[data-placeholder]` (`opacity: 0`) so placeholder text never overlaps the resting floating label.",
      "Option labels MUST reserve bold width via `data-text` `::after` pseudo-element and keep the `18×18px` check slot mounted across all rows.",
      "Supports grouped options (`SelectOptionGroup`) separated by `1px outline-variant` dividers (`6px` block margin/padding) and typeahead/arrow-key navigation with `modal={false}`.",
      "Inline clear button (`26×26px` at `inset-inline-end: 36px`) stops event propagation so clearing the value does not accidentally toggle the popup.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use `ExposedDropdownMenuBox` with `MenuAnchorType.PrimaryNotEditable`, `ExposedDropdownMenuDefaults.TrailingIcon(expanded)`, and `DropdownMenu` styled with `RoundedCornerShape(16.dp)` and `6.dp` content padding.",
      },
      {
        target: "SwiftUI",
        guidance:
          "For full M3E fidelity beyond native `Menu`, anchor a custom `.popover` (`presentationCompactAdaptation(.popover)`) with `RoundedRectangle(cornerRadius: 16, style: .continuous)` and `10pt`/`12pt` option backgrounds.",
      },
      {
        target: "Flutter",
        guidance:
          "Use `DropdownMenu<T>` with `MenuStyle(shape: WidgetStatePropertyAll(RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))), padding: WidgetStatePropertyAll(EdgeInsets.all(6)))`.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Implement WAI-ARIA `role=\"combobox\"` button trigger paired with a portaled `role=\"listbox\"` popup; preserve `data-text` bold width reservation and logical `inset-inline-end` clear/chevron offsets for RTL.",
      },
    ],
    references: [
      {
        label: "Material 3 — Menus & Exposed Dropdown Specs",
        url: "https://m3.material.io/components/menus/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose — ExposedDropdownMenu.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ExposedDropdownMenu.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Select Component",
        url: "https://base-ui.com/react/components/select",
        kind: "base-ui",
      },
      {
        label: "WAI-ARIA APG — Select-Only Combobox Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-select-only/",
        kind: "aria-apg",
      },
    ],
  },

  combobox: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Searchable autocomplete and filterable selection adaptation built on `@base-ui/react/combobox` and the WAI-ARIA 1.2 Combobox pattern, unifying M3 `TextField` shell geometry, `InputChip` token metrics for multi-selection patterns, and `SELECT_TOKENS` concentric popup surfaces.",
    tokenSources: [
      "SELECT_TOKENS",
      "TEXT_FIELD_TOKENS",
      "CHIP_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: ["ExposedDropdownMenu.kt", "SearchBar.kt", "ChipTokens.kt"],
    inspirationAndRationale: [
      {
        title: "WAI-ARIA 1.2 Editable Combobox Without Focus Theft",
        body: "Unlike `Select` where focus moves into the popup list, `Combobox` keeps DOM focus strictly on the `<input role=\"combobox\">` (`autoCorrect=\"off\"`, `spellCheck={false}`) while virtualizing option highlight via `aria-activedescendant` and `autoHighlight` so users can type, backspace, and arrow-navigate seamlessly.",
      },
      {
        title: "Unified Concentric Popup & Multi-Chip Composition",
        body: "Shares the exact `16px` popup / `6px` padding / `10px` rest / `12px` selected `secondary-container` row geometry with `Select`, and pairs with `InputChip` (`CHIP_TOKENS`: `32px` height, `8px` rest / `4px` pressed corners) when composing tokenized multi-value tag pickers.",
      },
      {
        title: "Zero-Flash Empty State Handling",
        body: "`BaseCombobox.Empty` renders localized no-match feedback (`t(\"combobox.empty\")`) inside the `surface-container` popup and collapses automatically via `.m3e-combobox__empty:empty { display: none }` whenever at least one option matches.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "combobox-geometry",
        title: "Input Shell, Token Chip & Popup Geometry (`SELECT_TOKENS` & `CHIP_TOKENS`)",
        columns: [
          "Subpart",
          "Dimensions",
          "Corner Tuple [tl, tr, br, bl]",
          "Key Visual Rules",
        ],
        rows: [
          [
            "Editable Input Shell",
            "Min height `56px` (`floating`) / `48px` (`outside`), `padding-inline: 16px`, `gap: 8px`",
            "Floating `[4, 4, 4, 4]` (`outlined`) / `[4, 4, 0, 0]` (`filled`); Outside `[12, 12, 12, 12]` / `[12, 12, 0, 0]`",
            "Leading `17×17px` search icon + `32×32px` trailing `BaseCombobox.Clear`",
          ],
          [
            "Popup & Option Rows",
            "`min-width: var(--anchor-width)`, `max-height: min(300px, var(--available-height))`, `padding: 6px`, `sideOffset: 6px`",
            "Popup `[16, 16, 16, 16]`; Item `[10, 10, 10, 10]` rest → `[12, 12, 12, 12]` selected → `[6, 6, 6, 6]` pressed",
            "`surface-container` popup; `secondary-container` selected pill + `16×16px` checkmark",
          ],
          [
            "Multi-Select `InputChip` Tokens",
            "Height `32px`, `padding-inline: 10px 6px`, `22×22px` remove button",
            "Rest `[8, 8, 8, 8]` → Pressed `[4, 4, 4, 4]`",
            "`surface-container-low` + `1px outline-variant` border",
          ],
        ],
      },
    ],
    invariants: [
      "DOM focus MUST remain inside `<input role=\"combobox\">` during popup filtering; arrow keys move virtual highlight via `aria-activedescendant` with `autoHighlight` selecting the top match on `Enter`.",
      "Floating label floats whenever `isFocused || value !== null || inputText.length > 0`, shifting `inset-inline-start: -28px` in outlined mode to align over the leading `17×17px` search glyph.",
      "Popup and option corners obey `popupRadius (16) - popupPadding (6) = itemRadius (10)`, morphing to `12px` on selection (`fastSpatial` `ζ = 0.6, k = 800`) and `6px` on pointer press.",
      "Clear button (`t(\"combobox.clear\")`) and empty state (`t(\"combobox.empty\")`) source all accessible strings from `useM3EI18n()` with zero hardcoded copy.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use `ExposedDropdownMenuBox` with `MenuAnchorType.PrimaryEditable` wrapping an `OutlinedTextField` / `TextField`, filtering `DropdownMenuItem` children without stealing focus from the text field (`properties = PopupProperties(focusable = false)`).",
      },
      {
        target: "SwiftUI",
        guidance:
          "Attach `.searchable` for list-level filtering or anchor a non-focus-stealing overlay/popover below a custom `56pt` `TextField` container using `RoundedRectangle(cornerRadius: 16, style: .continuous)`.",
      },
      {
        target: "Flutter",
        guidance:
          "Use `Autocomplete<T>` or `DropdownMenu<T>(enableFilter: true, requestFocusOnTap: true)` styled with `16dp` popup radius and `10dp` / `12dp` option shapes.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Pair `<input role=\"combobox\" aria-autocomplete=\"list\" aria-expanded=\"...\" aria-controls=\"...\">` with a `role=\"listbox\"` portal, keeping `font-size: max(1rem, 16px)` to prevent mobile viewport zoom.",
      },
    ],
    references: [
      {
        label: "WAI-ARIA APG — Editable Combobox With List Autocomplete",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/",
        kind: "aria-apg",
      },
      {
        label: "Base UI — Combobox Component",
        url: "https://base-ui.com/react/components/combobox",
        kind: "base-ui",
      },
      {
        label: "AOSP Compose — ExposedDropdownMenu.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ExposedDropdownMenu.kt",
        kind: "aosp-source",
      },
    ],
  },

  "otp-field": {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "One-time verification code input extrapolated from M3E `ConnectedButtonGroup` topology (`4px` slot gap, `16px` outer group corners, `6px` inner seam corners, active focused detachment to `[16, 16, 16, 16]` via `fastSpatial`), built on `@base-ui/react/otp-field` with progressive WebOTP `OTPCredential` SMS autofill.",
    tokenSources: [
      "OTP_FIELD_TOKENS",
      "resolveOtpSlotCorners",
      "flipCornersHorizontal",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: ["ButtonGroup.kt", "ConnectedButtonGroupSmallTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Sub-Group Connected Topology & Focus Detachment",
        body: "Instead of 6 identical isolated boxes, `resolveOtpSlotCorners` treats each hyphen-separated cluster (default `3 + 3` via `separatorAfterIndex = 2`) as a connected M3E group: outer group ends use `16px` corners and internal seams use `6px` corners across a `4px` gap. Focusing any slot springs all four of its corners to `[16, 16, 16, 16]` (`fastSpatial`) with a `2px primary` border, visually detaching the active digit.",
      },
      {
        title: "Above-Slot Helper Placement for Mobile Keyboards",
        body: "Renders `helperText` (`aria-describedby`) directly below the `<label>` and *above* the digit row so mobile virtual keypads and OS SMS autofill bars never cover expiration timers or sender hints.",
      },
      {
        title: "Progressive WebOTP (`OTPCredential`) & Multi-Slot Paste",
        body: "Pairs `autoComplete=\"one-time-code\"` with an `AbortController`-managed `navigator.credentials.get({ otp: { transport: [\"sms\"] } })` listener when `enableWebOTP` is enabled, automatically populating and completing codes on supported mobile browsers without blocking manual entry.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "otp-field-geometry",
        title: "Slot Dimensions & Corner Matrix (`OTP_FIELD_TOKENS` / `resolveOtpSlotCorners`)",
        caption:
          "Tuples `[tl, tr, br, bl]` shown for LTR; RTL applies `flipCornersHorizontal` (`[tr, tl, bl, br]`). Priority: `pressed > focused > group-rest`.",
        columns: [
          "Slot State / Group Position",
          "Slot Size & Gap",
          "LTR Corner Tuple",
          "RTL Corner Tuple",
          "Surface & Stroke",
        ],
        rows: [
          [
            "First in Group (e.g. index `0` or `separatorAfterIndex + 1`)",
            "46 × 54px (`gap: 4px`, `font: 18px`)",
            "[16, 6, 6, 16]",
            "[6, 16, 16, 6]",
            "`surface-container-high` + `1.5px outline-variant`",
          ],
          [
            "Middle in Group (e.g. index `1`, `4`)",
            "46 × 54px (`gap: 4px`)",
            "[6, 6, 6, 6]",
            "[6, 6, 6, 6]",
            "`surface-container-high` + `1.5px outline-variant`",
          ],
          [
            "Last in Group (e.g. index `2` before `–`, or `5`)",
            "46 × 54px (`gap: 4px`)",
            "[6, 16, 16, 6]",
            "[16, 6, 6, 16]",
            "`surface-container-high` + `1.5px outline-variant`",
          ],
          [
            "Focused Slot (`isFocused`) or Single-Slot Group",
            "46 × 54px",
            "[16, 16, 16, 16]",
            "[16, 16, 16, 16]",
            "`surface` + `2px primary` + subtle `primary` halo",
          ],
          [
            "Pointer Pressed Slot (`isPressed`, min-hold `95ms`)",
            "46 × 54px",
            "[10, 10, 10, 10]",
            "[10, 10, 10, 10]",
            "Overrides focus/rest corners via `fastSpatial` (`ζ = 0.6, k = 800`)",
          ],
        ],
      },
    ],
    invariants: [
      "State precedence inside `resolveOtpSlotCorners` MUST strictly evaluate `isPressed ([10,10,10,10]) > isFocused ([16,16,16,16]) > group-boundary rest ([16,6,6,16] / [6,6,6,6] / [6,16,16,6])`.",
      "When `separatorAfterIndex` splits the code (e.g. `XXX – XXX`), `isLastInGroup` applies to `separatorAfterIndex` and `isFirstInGroup` restarts at `separatorAfterIndex + 1` so both halves form complete capsules.",
      "When all `length` digits are filled (`[data-complete]`), unfocused slots tint to `55% secondary-container` mixed over `surface-container-high` with `primary` borders.",
      "Slot 0 associates with the visible `<label htmlFor={firstInputId}>`, while slots `1..length-1` expose localized `t(\"otpField.digitLabel\", { index })` labels and `tabular-nums` monospace glyphs (`minFontSize: 18px`).",
      "`AbortController.abort()` MUST run on unmount or `disabled` transition so pending `navigator.credentials.get` WebOTP requests never leak.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Wrap a single hidden/overlay `BasicTextField` (`KeyboardOptions(keyboardType = KeyboardType.NumberPassword, imeAction = ImeAction.Done)`) with `SmsRetriever` / `autofill` semantics, rendering `46.dp × 54.dp` slot boxes whose `RoundedCornerShape` radii animate via `fastSpatial`.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Bind `.textContentType(.oneTimeCode)` on a backing `TextField` and render `HStack(spacing: 4)` of `UnevenRoundedRectangle` cells (`46×54pt`), animating the active cell to `16pt` corners with `Spring(mass: 1, stiffness: 800, damping: 33.94)`.",
      },
      {
        target: "Flutter",
        guidance:
          "Use `AutofillHints.oneTimeCode` on an underlying `EditableText` and animate each `46×54` cell's `BorderRadiusDirectional` (`16` outer, `6` inner, `16` focused, `10` pressed).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Set `autocomplete=\"one-time-code\"` and `inputmode=\"numeric\"`, support full-string clipboard paste distribution from any slot index, and guard `" +
          "\"OTPCredential\" in window` before invoking `navigator.credentials.get`.",
      },
    ],
    references: [
      {
        label: "Base UI — OTP Field Component",
        url: "https://base-ui.com/react/components/otp-field",
        kind: "base-ui",
      },
      {
        label: "MDN Web Docs — WebOTP API (`OTPCredential`)",
        url: "https://developer.mozilla.org/en-US/docs/Web/API/WebOTP_API",
        kind: "web-standard",
      },
      {
        label: "AOSP Compose — ButtonGroup.kt (Connected Seam Detachment)",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/ButtonGroup.kt",
        kind: "aosp-source",
      },
    ],
  },

  "date-picker": {
    provenance: "official-m3e",
    provenanceSummary:
      "Implements official Material 3 Expressive calendar pickers (`DockedDatePicker`, `DatePickerField`, and `DateRangePicker`), matching AOSP `DatePicker.kt` / `DateRangePicker.kt` `28px` surface geometry and `40px` day targets while enforcing a timezone-drift-free `YYYY-MM-DD` string data model.",
    tokenSources: [
      "DATE_PICKER_TOKENS",
      "SELECT_TOKENS",
      "SHAPE_CORNER_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: [
      "DatePicker.kt",
      "DateRangePicker.kt",
      "DatePickerModalTokens.kt",
    ],
    inspirationAndRationale: [
      {
        title: "Timezone-Drift-Free `YYYY-MM-DD` & UTC-Noon `Intl` Anchoring",
        body: "Passing calendar dates through `new Date(\"2026-11-12\")` parses as UTC midnight and shifts backward by 1 day in negative UTC offsets (Americas). All three pickers accept and emit pure ISO calendar strings (`PlainDateString = \"YYYY-MM-DD\"`), while localized month titles, weekday headers, and screen-reader labels format `Date.UTC(y, m - 1, d, 12, 0, 0)` with `{ timeZone: \"UTC\" }` via `Intl.DateTimeFormat(locale)`.",
      },
      {
        title: "Order-Agnostic Continuous Range Band (`DateRangePicker`)",
        body: "Users can click any two dates in either chronological order (`20th` then `12th` automatically normalizes to `12..20`) with live pointer/keyboard hover preview. In-range cells paint a continuous `secondary-container` band (`inset-block: 3px`) clipped at `50%` inline on the start and end endpoints so `40×40px` `primary` endpoint circles cap the ribbon cleanly.",
      },
      {
        title: "Expressive Day Press Morph (`20px → 10px`)",
        body: "Each `40×40px` day button rests as a `20px` full circle (`daySelectedRadius = 20`) and tightens to a `10px` rounded square (`dayPressedRadius = 10`) on press (`usePressHoldState`), adding tactile M3E feedback to grid selection.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "date-picker-geometry",
        title: "Calendar Surface, Day Cell & Range Band Metrics (`DATE_PICKER_TOKENS`)",
        columns: [
          "Element",
          "Dimensions",
          "Corner Radius / Tuple",
          "Color & Border Roles",
        ],
        rows: [
          [
            "Picker Surface (`Docked` / Popover)",
            "Width `316px`, `padding: 20px`, stack `gap: 12px`",
            "[28, 28, 28, 28]",
            "`surface-container-high` + `1px outline-variant` border",
          ],
          [
            "Day Cell Button (7-column Grid)",
            "40 × 40px (`row gap: 4px`, weekday header `28px`)",
            "Rest/Hover/Selected `20px` circle → Pressed `10px`",
            "Selected `primary` / `on-primary`; Today `1.5px primary` ring + `primary` bold text",
          ],
          [
            "Range Highlight Band (`DateRangePicker`)",
            "Full cell width, `inset-block: 3px` (`34px` band height)",
            "`0px` internal cells; `50%` inline clip behind `20px` start/end caps",
            "`secondary-container` band / `on-secondary-container` in-range numerals",
          ],
          [
            "Year Grid Pill & `DatePickerField` Trigger",
            "Year pill `36px` tall (3-col `8px` gap); Field `56px` (`floating`) / `48px` (`outside`)",
            "Year pill `9999px`; Field `[4, 4, 4, 4]` (`floating`) / `[12, 12, 12, 12]` (`outside`)",
            "Selected year `primary` / `on-primary`; Popover `sideOffset: 6px`",
          ],
        ],
      },
    ],
    invariants: [
      "Public `value` / `defaultValue` / `onValueChange` props MUST strictly exchange `YYYY-MM-DD` `PlainDateString` values (never `Date` instances or timezone-bearing timestamps).",
      "Calendar `role=\"grid\"` implements roving `tabIndex` (exactly one day button in the visible month has `tabIndex={0}`) supporting `ArrowLeft/Right` (`±1` day, sign-flipped by `-1` in RTL), `ArrowUp/Down` (`±7` days), `Home/End` (week start/end), and `PageUp/PageDown` (day-clamped month step).",
      "Today's cell sets `aria-current=\"date\"`, every day button exposes a complete localized `aria-label` (e.g. `'Thursday, November 12, 2026'`), and weekday column headers start on `getLocaleFirstDayOfWeek(locale)` unless overridden.",
      "Month navigation chevrons (`34×34px`) mirror horizontally (`scale: -1 1`) in RTL while preserving chronological `prevMonth` / `nextMonth` actions.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Map to `DatePicker`, `DateRangePicker`, and `DatePickerDialog` in `androidx.compose.material3`; convert between `PlainDateString` and UTC epoch millis at `00:00Z` (`Instant.parse(\"${iso}T00:00:00Z\").toEpochMilli()`).",
      },
      {
        target: "SwiftUI",
        guidance:
          "Represent state with `DateComponents(calendar: .init(identifier: .gregorian), year: y, month: m, day: d)` or a custom `LazyVGrid` (`7` columns, `40×40pt` cells, `28pt` `UnevenRoundedRectangle` card) to avoid `TimeZone.current` midnight shifts.",
      },
      {
        target: "Flutter",
        guidance:
          "Use `CalendarDatePicker` / `showDateRangePicker` themed with `DatePickerThemeData(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)), rangeSelectionBackgroundColor: scheme.secondaryContainer)`.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Format all calendar labels via `new Intl.DateTimeFormat(locale, { ..., timeZone: \"UTC\" })` against `Date.UTC(year, month - 1, day, 12, 0, 0)` and render the range ribbon on `role=\"gridcell\"` `::before` pseudo-elements using logical `inset-inline-start/end: 50%`.",
      },
    ],
    references: [
      {
        label: "Material 3 — Date Pickers Specs",
        url: "https://m3.material.io/components/date-pickers/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose — DatePicker.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/DatePicker.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Date Picker Dialog & Calendar Grid Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/",
        kind: "aria-apg",
      },
    ],
  },

  "time-picker": {
    provenance: "official-m3e",
    provenanceSummary:
      "Implements the official Material 3 Expressive analog clock dial and keyboard input `TimePicker` (`TimePicker` and `TimePickerField`), aligned with AOSP `TimePicker.kt` polar dual-ring geometry (`248px` dial, `92px` outer / `58px` inner rings) and `fastSpatial` shortest-arc hand physics.",
    tokenSources: [
      "TIME_PICKER_TOKENS",
      "resolveClockHandGeometry",
      "SELECT_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
    ],
    aospSources: ["TimePicker.kt", "TimePickerTokens.kt"],
    inspirationAndRationale: [
      {
        title: "248px Polar Dual-Ring Dial (`92px` Outer & `58px` Inner)",
        body: "In 12-hour locales, hours `12, 1..11` sit on a single `92px` radius ring paired with a connected vertical `AM/PM` toggle. In 24-hour locales, `00..11` occupy the `92px` outer ring (`36×36px` targets) and `12..23` occupy a concentric `58px` inner ring (`30×30px` targets) partitioned at radial midpoint `(92 + 58) / 2 = 75px` (with a `< 14px` center pin dead-zone).",
      },
      {
        title: "Shortest-Arc `[-180°, +180°]` Unwrapping & Radial Spring",
        body: "Naively animating raw `[0°, 360°)` angles causes the clock hand to whip `330°` backwards when crossing `11 → 12` or `55 → 00`. `TimePicker` accumulates unwrapped angles constrained to `delta ∈ [-180°, +180°]` while simultaneously springing selector radius (`92px ↔ 58px`) via `fastSpatial` (`ζ = 0.6, k = 800`).",
      },
      {
        title: "Lossless Analog Dial ↔ Keyboard Mode Toggle",
        body: "Provides a one-click header toggle (`t(\"timePicker.switchToKeyboard\")` / `t(\"timePicker.switchToDial\")`) switching between pointer-scrubbable polar dial selection (which auto-advances from hour to minute on pointer release) and dual `88×64px` tabular numeric inputs.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "time-picker-geometry",
        title: "Container, Digital Header & Polar Dial Metrics (`TIME_PICKER_TOKENS`)",
        columns: [
          "Component Part",
          "Dimensions",
          "Corner Tuple / Radius",
          "Color & Geometry Contract",
        ],
        rows: [
          [
            "Picker Surface",
            "Width `min(100%, 316px)`, `padding: 22px`, `gap: 16px`",
            "[28, 28, 28, 28]",
            "`surface-container-high` + `1px outline-variant` border",
          ],
          [
            "Hour / Minute Header Chips",
            "88 × 68px (`keyboard` input `88 × 64px`), `34px` numerals",
            "Rest `12px` → Pressed `8px` (`fastSpatial`)",
            "`surface-container-highest` rest → `primary-container` + `2px primary` active",
          ],
          [
            "Vertical `AM / PM` Switcher (12h)",
            "52 × 68px (`2px` vertical seam gap)",
            "Top `[12, 12, 4, 4]` (`[12, 12, 2, 2]` pressed); Bottom `[4, 4, 12, 12]` (`[2, 2, 12, 12]` pressed)",
            "Selected `tertiary-container` / `on-tertiary-container` + `1px tertiary` border",
          ],
          [
            "Polar Clock Dial & Selector Hand",
            "Dial `248 × 248px`; Outer `r = 92px` (`36px` cells); Inner `r = 58px` (`30px` cells)",
            "Full circles (`9999px`); Center pin `8px`, selector bob `42px`, stem `2px`",
            "Dial `surface-container-highest`; Pin/stem/bob `primary`, active numeral `on-primary`",
          ],
        ],
      },
      {
        id: "time-picker-motion",
        title: "Clock Hand & Chip Physics",
        columns: ["Property", "Formula / Range", "Motion Token"],
        rows: [
          [
            "Unwrapped Hand Angle `θ`",
            "`Δ = targetDeg - (prev mod 360)` wrapped into `[-180°, +180°]`",
            "`fastSpatial` (`ζ = 0.6, k = 800`, `c = 33.94`)",
          ],
          [
            "Hand Length `r` (24h Outer ↔ Inner)",
            "`92px` (`00..11` or minutes) ↔ `58px` (`12..23`)",
            "`fastSpatial` (`ζ = 0.6, k = 800`)",
          ],
          [
            "Segment & Period Press Corners",
            "Field `12px → 8px`; Period inner seam `4px → 2px`",
            "`fastSpatial` (`ζ = 0.6, k = 800`) + `usePressHoldState` (`95ms`)",
          ],
        ],
      },
    ],
    invariants: [
      "Public `value` / `defaultValue` / `onValueChange` exchange canonical 24-hour wall-time strings `\"HH:mm\"` (`00:00`–`23:59`) regardless of whether 12-hour or 24-hour presentation is active.",
      "Hour:minute digital readout (`.m3e-time-picker__digits-ltr`) preserves `HH : MM` mathematical ordering across LTR and RTL while `AM/PM` placement and localized strings (`t(\"timePicker.am\")` / `t(\"timePicker.pm\")`) follow locale direction.",
      "Pointer scrubbing on the dial sets `touch-action: none` during drag, ignores radii `< 14px` around the center pin, and advances `selectionMode` from `\"hour\"` to `\"minute\"` only on pointer release (`pointerup`) or discrete click.",
      "`use24Hour` defaults automatically to `getLocaleUses24Hour(locale)` via `Intl.DateTimeFormat(locale, { hour: \"numeric\" }).resolvedOptions().hour12` when omitted.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Use `TimePicker` (analog dial) and `TimeInput` (keyboard fields) with `rememberTimePickerState(is24Hour = ...)` inside a `28.dp` `Surface(color = MaterialTheme.colorScheme.surfaceContainerHigh)`.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Render a `248×248pt` `ZStack` with `Canvas` or `Path` for the `2pt` stem + `42pt` bob at `(cos(θ - 90°) * r, sin(θ - 90°) * r)`, driving unwrapped `θ` and `r` (`92pt` / `58pt`) with `Spring(mass: 1, stiffness: 800, damping: 33.94)`.",
      },
      {
        target: "Flutter",
        guidance:
          "Map to `showTimePicker(initialEntryMode: TimePickerEntryMode.dial)` themed via `TimePickerThemeData(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(28)), dayPeriodShape: ...)`.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Store cumulative unwrapped degrees in a mutable ref so crossing `354° → 0°` adds `+6°` instead of `-354°`, and bind `setPointerCapture` on the dial container for smooth radial scrubbing.",
      },
    ],
    references: [
      {
        label: "Material 3 — Time Pickers Specs",
        url: "https://m3.material.io/components/time-pickers/specs",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose — TimePicker.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/TimePicker.kt",
        kind: "aosp-source",
      },
      {
        label: "AOSP Compose — TimePickerTokens.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/tokens/TimePickerTokens.kt",
        kind: "aosp-source",
      },
    ],
  },

  form: {
    provenance: "m3e-web-adaptation",
    provenanceSummary:
      "Web-native form validation orchestrator and accessible grouping surfaces (`Form` and `Fieldset`) built on `@base-ui/react/form` and `@base-ui/react/fieldset`, bringing M3E tonal card hierarchy (`20px` `surface-container-low` fieldsets and `error-container` alert summaries) to HTML form workflows.",
    tokenSources: [
      "SHAPE_CORNER_TOKENS",
      "TEXT_FIELD_TOKENS",
      "EXPRESSIVE_MOTION_SCHEME",
      "M3E_TYPOGRAPHY_TOKENS",
    ],
    inspirationAndRationale: [
      {
        title: "Never-Disable-Submit Accessibility Pattern",
        body: "Disabling `<Button type=\"submit\">` while a form is incomplete leaves keyboard and screen-reader users with zero feedback about which field is missing or malformed. `Form` keeps the submit action enabled, runs synchronous/server `errors` validation (`onSubmit | onBlur | onChange`), announces a localized `role=\"alert\"` error summary, and moves focus directly to the first invalid control.",
      },
      {
        title: "Strict First-Child `<legend>` Invariant (`Fieldset`)",
        body: "HTML and screen readers (VoiceOver, NVDA, JAWS) only announce a `<fieldset>` group title when `<legend>` is its **first direct DOM child** — wrapping `<legend>` in a header `<div>` breaks group context on every input inside. `Fieldset` renders `BaseFieldset.Legend render={<legend />}` as child `#1` and uses CSS `float: left; width: 100%` + `+ * { clear: both }` to style M3E `20px` tonal cards cleanly.",
      },
      {
        title: "Unified Client + Server `errors` Dictionary",
        body: "Accepts `errors: Record<string, string | string[]>` keyed by field `name`, routing server-side uniqueness or business-rule errors straight into child `TextField`, `Select`, `NumberField`, and `Combobox` controls alongside the top `showErrorSummary` callout.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "form-fieldset-geometry",
        title: "Form, Error Summary & Fieldset Surface Metrics",
        columns: [
          "Surface / Element",
          "Spacing & Padding",
          "Corner Tuple [tl, tr, br, bl]",
          "Color & Border Roles",
        ],
        rows: [
          [
            "`Form` Stack",
            "Vertical flex column, `gap: 16px`, `width: 100%`",
            "—",
            "Transparent layout orchestrator (`<form>`)",
          ],
          [
            "Error Summary (`showErrorSummary`)",
            "`padding: 12px 16px`, `gap: 6px`, list `padding-inline-start: 18px`",
            "[14, 14, 14, 14]",
            "`error-container` / `on-error-container` + `1px` (`35% error`) border (`role=\"alert\"`)",
          ],
          [
            "`Fieldset` (`variant=\"tonal\"` default)",
            "`padding: 16px 18px 18px`, header `gap: 12px`, body `gap: 14px`",
            "[20, 20, 20, 20] (`largeIncreased`)",
            "`surface-container-low` + `1px outline-variant` border",
          ],
          [
            "`Fieldset` (`outlined` / `plain`)",
            "Outlined `16px 18px 18px`; Plain `padding: 0`",
            "Outlined `[20, 20, 20, 20]`; Plain `[0, 0, 0, 0]`",
            "Outlined `transparent` + `1px outline`; Plain `0` border",
          ],
        ],
      },
    ],
    invariants: [
      "Native `<legend>` MUST always be the first direct DOM child of `<fieldset>` (never wrapped in a `<div>` or `<header>`); optional `description` binds to `<fieldset aria-describedby={descId}>`.",
      "Submit buttons inside `Form` MUST remain enabled prior to validation (only set `loading` during in-flight network requests) so invalid submissions focus the first invalid field and announce `role=\"alert\"`.",
      "Error summary renders only when `showErrorSummary && errorList.length > 0`, using `t(\"form.errorSummaryHeading\", { count })` for plural-safe localized headings.",
      "Setting `disabled` on `Fieldset` propagates native HTML `<fieldset disabled>` semantics to all descendant controls and reduces group opacity to `0.42`.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance:
          "Group related inputs inside a `Surface(shape = RoundedCornerShape(20.dp), color = MaterialTheme.colorScheme.surfaceContainerLow)` with `semantics(mergeDescendants = false) { paneTitle = legend }`, scrolling to and requesting `FocusRequester` on the first invalid field on submit.",
      },
      {
        target: "SwiftUI",
        guidance:
          "Use `Form` / `Section` or custom `20pt` continuous-corner cards (`VStack(spacing: 14)`), binding `@FocusState` to move focus to the first invalid field and posting `AccessibilityNotification.Announcement` for summary errors.",
      },
      {
        target: "Flutter",
        guidance:
          "Wrap sections in `Form` (`GlobalKey<FormState>`) + `Container(decoration: BoxDecoration(borderRadius: BorderRadius.circular(20)))`, calling `formKey.currentState!.validate()` on an always-enabled submit button and focusing the first invalid `FocusNode`.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance:
          "Keep `<legend>` as the first child of `<fieldset>`, apply `min-inline-size: 0` on `<fieldset>` to override legacy browser `min-width: min-content` overflow bugs, and render validation summaries with `role=\"alert\"`.",
      },
    ],
    references: [
      {
        label: "Base UI — Form Validation Primitive",
        url: "https://base-ui.com/react/components/form",
        kind: "base-ui",
      },
      {
        label: "Base UI — Fieldset Primitive",
        url: "https://base-ui.com/react/components/fieldset",
        kind: "base-ui",
      },
      {
        label: "MDN Web Docs — `<fieldset>`: The Field Set Element",
        url: "https://developer.mozilla.org/en-US/docs/Web/HTML/Element/fieldset",
        kind: "web-standard",
      },
    ],
  },
};
