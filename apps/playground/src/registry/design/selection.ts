import type { ComponentDesignSpec } from "../types";

export const SELECTION_DESIGN_SPECS: Readonly<Record<string, ComponentDesignSpec>> = {
  checkbox: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Checkbox and CheckboxGroup with tri-state indeterminate parent-child synchronization and pressed corner softening.",
    tokenSources: ["CHECKBOX_TOKENS", "EXPRESSIVE_MOTION_SCHEME", "M3E_STATE_LAYER_TOKENS"],
    aospSources: ["Checkbox.kt", "CheckboxTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Compact 18px Visual Box Inside a 40px/48px Hit Target",
        body: "Checkbox keeps its crisp 18×18px glyph (2px stroke, 2px resting radius softening to 4px on press) so dense data tables and filter sidebars stay clean, while an invisible centered 40px state layer (48px minimum touch target on coarse pointers) prevents mis-taps.",
      },
      {
        title: "Tri-State Indeterminate Cascade",
        body: "Parent select-all checkboxes distinguish partial selection (aria-checked=\"mixed\" with horizontal dash) from full selection (checkmark SVG stroke draw) and support error palette overrides for required consent fields.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "checkbox-metrics",
        title: "Checkbox & CheckboxGroup Geometry",
        caption: "Visual indicator, state halo, and spring assignments",
        columns: ["Token", "Value", "Behavior & Role"],
        rows: [
          ["boxSize / strokeWidth", "18px / 2px", "Unchecked border uses on-surface-variant; checked fill uses primary (or error)"],
          ["cornerRadius → pressedCornerRadius", "2px → 4px", "Animated via fastSpatial (ζ = 0.6, k = 800) with 95ms press latch"],
          ["stateLayerSize / minTouchTarget", "40px / 48px", "Circular hover (8%) & press (10%) halo centered on the 18px box"],
          ["Checkmark / Dash Glyph", "14×14 SVG", "Scale & stroke transition via fastSpatial; container fill via fastEffects"],
        ],
      },
    ],
    invariants: [
      "Always pair Checkbox with a visible <label> or explicit aria-label; never wrap groups of checkboxes in <ul>/<li> (screen readers already announce group item counts).",
      "Indeterminate state MUST expose aria-checked=\"mixed\" to assistive technologies.",
      "CheckboxGroup wraps related options in a semantic group/fieldset with accessible group labelling.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Maps to Checkbox and TriStateCheckbox(state = ToggleableState.Indeterminate).",
      },
      {
        target: "SwiftUI",
        guidance: "Create a custom ToggleStyle rendering an 18×18 RoundedRectangle(cornerRadius: isPressed ? 6 : 4) inside a .contentShape(Rectangle()) of at least 44×44pt.",
      },
      {
        target: "Flutter",
        guidance: "Matches Checkbox(tristate: true, materialTapTargetSize: MaterialTapTargetSize.padded).",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Synchronize input.indeterminate = true via DOM ref or @base-ui/react/checkbox indeterminate prop.",
      },
    ],
    references: [
      {
        label: "Material 3 — Checkbox Guidelines",
        url: "https://m3.material.io/components/checkbox/overview",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — Checkbox.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Checkbox.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Checkbox (Two-State & Tri-State)",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/",
        kind: "aria-apg",
      },
      {
        label: "Base UI — Checkbox Primitive",
        url: "https://base-ui.com/react/components/checkbox",
        kind: "base-ui",
      },
    ],
  },

  "radio-group": {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Radio and RadioGroup featuring underdamped inner-dot spatial spring pop (0 → 10px) and roving arrow-key navigation.",
    tokenSources: ["RADIO_TOKENS", "EXPRESSIVE_MOTION_SCHEME"],
    aospSources: ["RadioButton.kt", "RadioButtonTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Spatial Spring Inner Dot Pop",
        body: "Rather than fading the inner dot in with opacity, M3E scales the 10px center disc from 0 → 1 inside the 20px outer ring using fastSpatial (ζ = 0.6, k = 800), giving mutually exclusive selection a crisp tactile snap.",
      },
      {
        title: "Single-Tab-Stop Roving RadioGroup",
        body: "Following native HTML radio groups and WAI-ARIA radiogroup rules, Tab enters the group directly on the checked option (or first option if none is checked), while Arrow keys both move focus and select adjacent options.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "radio-metrics",
        title: "Radio Geometry & Motion Tokens",
        caption: "Concentric ring and dot dimensions",
        columns: ["Token", "Value", "Specification"],
        rows: [
          ["ringSize / strokeWidth", "20px / 2px", "Outer circular border (on-surface-variant → primary when selected)"],
          ["dotSize", "10px", "Concentric inner disc scaling 0 → 1 via fastSpatial (peak ~10.9px overshoot)"],
          ["stateLayerSize / minTouchTarget", "40px / 48px", "Circular state halo ensuring WCAG 2.5.8 target compliance"],
        ],
      },
    ],
    invariants: [
      "RadioGroup MUST render role=\"radiogroup\" with aria-labelledby pointing to its visible group label.",
      "Do NOT wrap Radio items inside <ul>/<li> markup to avoid duplicate list + radiogroup count announcements in screen readers.",
      "Ring color transitions use fastEffects (ζ = 1.0) while inner dot scale uses fastSpatial (ζ = 0.6).",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Maps to RadioButton inside Column(Modifier.selectableGroup()) with Role.RadioButton.",
      },
      {
        target: "SwiftUI",
        guidance: "Animate an inner Circle().frame(width: 10, height: 10).scaleEffect(isSelected ? 1 : 0) with Spring(mass: 1, stiffness: 800, damping: 33.94).",
      },
      {
        target: "Flutter",
        guidance: "Matches Radio<T> / RadioListTile<T> with custom spring scale animation on the inner 10lp dot.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Use @base-ui/react/radio-group or native <input type=\"radio\" name=\"...\"> with appearance: none.",
      },
    ],
    references: [
      {
        label: "Material 3 — Radio Button Guidelines",
        url: "https://m3.material.io/components/radio-button/overview",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — RadioButton.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/RadioButton.kt",
        kind: "aosp-source",
      },
      {
        label: "WAI-ARIA APG — Radio Group Pattern",
        url: "https://www.w3.org/WAI/ARIA/apg/patterns/radio/",
        kind: "aria-apg",
      },
    ],
  },

  switch: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive 52×32px Switch with three-stage thumb diameter morphing (16px → 24px → 28px pressed) and BiDi-symmetric signed translation.",
    tokenSources: ["SWITCH_TOKENS", "resolveSwitchGeometry", "EXPRESSIVE_MOTION_SCHEME"],
    aospSources: ["Switch.kt", "SwitchTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Three-Stage Thumb Diameter Morphing (16 → 24 → 28px)",
        body: "An unchecked Switch without an icon rests with a compact 16px thumb (inset 8px from the 2px outline), grows to 24px when checked (inset 4px), and swells to 28px (inset 2px) while held down—giving immediate physical mass to every toggle.",
      },
      {
        title: "Pixel-Exact RTL Signed Translation",
        body: "Positioning the thumb from logical inset-inline-start: 0 and multiplying thumbOffsetX by -1 when direction === 'rtl' guarantees pixel-identical travel across LTR and Arabic/Hebrew RTL layouts without duplicating CSS keyframes.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "switch-geometry",
        title: "Switch Track & Thumb State Matrix",
        caption: "Exact dimensions and thumb centers across unchecked, checked, and pressed states",
        columns: [
          "State",
          "Track (W × H, r)",
          "Thumb Size",
          "Inline Start Offset",
          "Surface & Thumb Tokens",
        ],
        rows: [
          ["Unchecked (no icon)", "52 × 32, r=16 (2px border)", "16px", "8px", "surface-container-highest / outline"],
          ["Unchecked (with icon)", "52 × 32, r=16 (2px border)", "24px", "4px", "surface-container-highest / outline"],
          ["Checked (rest)", "52 × 32, r=16 (0px border)", "24px", "24px", "primary / on-primary (icon: on-primary-container)"],
          ["Pressed (unchecked)", "52 × 32, r=16", "28px", "2px", "Thumb swells 16/24 → 28 via fastSpatial"],
          ["Pressed (checked)", "52 × 32, r=16", "28px", "22px", "Thumb swells 24 → 28 via fastSpatial"],
        ],
      },
    ],
    invariants: [
      "Thumb diameter and horizontal travel animate via fastSpatial (ζ = 0.6, k = 800); track fill and border colors animate via fastEffects (ζ = 1.0).",
      "Exposes role=\"switch\" and aria-checked (\"true\" | \"false\"), toggling on both Space and Enter/Click.",
      "Minimum interactive hit target is 48px block height for touch accessibility.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Corresponds to Switch(checked, onCheckedChange, thumbContent) in Compose Material 3.",
      },
      {
        target: "SwiftUI",
        guidance: "Build a custom ToggleStyle using Capsule().frame(width: 52, height: 32) and Circle().frame(width: thumbSize) driven by fastSpatial.",
      },
      {
        target: "Flutter",
        guidance: "Matches Switch(value, onChanged) with ThemeData(useMaterial3: true) trackOutlineColor and thumbIcon.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Compute { thumbSize, thumbOffsetX } via resolveSwitchGeometry({ checked, pressed, hasUncheckedIcon }) and negate offset in RTL.",
      },
    ],
    references: [
      {
        label: "Material 3 — Switch Guidelines",
        url: "https://m3.material.io/components/switch/overview",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — Switch.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Switch.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Switch Primitive",
        url: "https://base-ui.com/react/components/switch",
        kind: "base-ui",
      },
    ],
  },

  slider: {
    provenance: "official-m3e",
    provenanceSummary:
      "Canonical Material 3 Expressive thick split-track Slider & RangeSlider (16 / 24 / 40px track heights) with vertical bar thumb compression (4px → 2px) and track gap cutouts.",
    tokenSources: ["SLIDER_TOKENS", "SLIDER_SIZE_SPECS", "resolveSliderThumbGeometry"],
    aospSources: ["Slider.kt", "SliderTokens.kt"],
    inspirationAndRationale: [
      {
        title: "Split Track Cutouts & Vertical Handle Bar",
        body: "M3E replaces the thin 4px line-and-circle slider with a bold split capsule track interrupted by a 6px breathing gap on both sides of a vertical pill handle (4px wide at rest). Active and inactive segments use asymmetric outer pill corners (8/12/16px) and crisp inner corners (2/3/4px) facing the handle.",
      },
      {
        title: "Global Pointer-Up Handle Recovery (4px → 2px → 4px)",
        body: "While dragging, the vertical handle compresses from 4px to 2px (preserving a constant 6px thumbTrackGap) while surfacing a floating value badge. Attaching global window pointerup/pointercancel listeners guarantees the handle springs back to 4px the instant the pointer releases—even outside the track—without staying stuck until blur.",
      },
    ],
    geometryAndMotionTables: [
      {
        id: "slider-size-matrix",
        title: "Slider Track & Handle Scale (SM / MD / LG)",
        caption: "Track thickness, outer/inner split-track radii, and handle bar heights",
        columns: [
          "Size",
          "Track Height",
          "Outer Track Radius",
          "Inner Gap Radius",
          "Handle Height",
          "Handle Width (Rest → Drag)",
          "Track Cutout Gap",
        ],
        rows: [
          ["sm (Default)", "16px", "8px", "2px", "44px", "4px → 2px", "6px"],
          ["md", "24px", "12px", "3px", "48px", "4px → 2px", "6px"],
          ["lg", "40px", "16px", "4px", "56px", "4px → 2px", "6px"],
        ],
      },
    ],
    invariants: [
      "Determinate single-thumb sliders render a 4px stop indicator dot inset 6px from the trailing end of the inactive track (`secondary-container`).",
      "Discrete stepped sliders render 4px tick dots along both active (`on-primary` at 60%) and inactive (`on-secondary-container` at 50%) segments.",
      "RangeSlider supports dual thumbs (`[minVal, maxVal]`) with 3-segment split tracks (inactive start · active middle · inactive end).",
      "Keyboard ArrowLeft/Down and ArrowRight/Up increment by step (mirrored automatically in RTL via DirectionProvider), with PageUp/PageDown and Home/End support.",
    ],
    crossPlatformNotes: [
      {
        target: "Jetpack Compose",
        guidance: "Corresponds to Compose Material 3 Slider and RangeSlider with SliderDefaults.Thumb and SliderDefaults.Track (trackInsideCornerSize, thumbTrackGapSize = 6.dp).",
      },
      {
        target: "SwiftUI",
        guidance: "Render custom Canvas or GeometryReader split-capsule segments subtracting (thumbWidth / 2 + gap) around the normalized thumb x-coordinate.",
      },
      {
        target: "Flutter",
        guidance: "Enable Slider(year2023: false) in Flutter Material 3 to activate the M3E gapped track and vertical bar thumb.",
      },
      {
        target: "Vue / Svelte / Web",
        guidance: "Listen to window pointerup/pointercancel once pointerdown begins so active drag state never leaks when releasing outside the element.",
      },
    ],
    references: [
      {
        label: "Material 3 Expressive — Sliders",
        url: "https://m3.material.io/components/sliders/overview",
        kind: "m3-spec",
      },
      {
        label: "AOSP Compose Material 3 — Slider.kt",
        url: "https://cs.android.com/androidx/platform/frameworks/support/+/androidx-main:compose/material3/material3/src/commonMain/kotlin/androidx/compose/material3/Slider.kt",
        kind: "aosp-source",
      },
      {
        label: "Base UI — Slider Primitive",
        url: "https://base-ui.com/react/components/slider",
        kind: "base-ui",
      },
    ],
  },
};
