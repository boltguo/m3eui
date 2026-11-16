import type { TocAnchorItem } from "../../layout/OnThisPage";
import type { ComponentDesignSpec, ComponentDocSpec } from "../types";
import { ACTIONS_DESIGN_SPECS } from "./actions";
import { DISPLAY_DESIGN_SPECS } from "./display";
import { EXPANSION_DESIGN_SPECS } from "./expansion";
import { FEEDBACK_DESIGN_SPECS } from "./feedback";
import { INPUTS_DESIGN_SPECS } from "./inputs";
import { NAVIGATION_DESIGN_SPECS } from "./navigation";
import { SELECTION_DESIGN_SPECS } from "./selection";

export const ALL_COMPONENT_DESIGN_SPECS: Readonly<
  Record<string, ComponentDesignSpec>
> = {
  ...ACTIONS_DESIGN_SPECS,
  ...INPUTS_DESIGN_SPECS,
  ...SELECTION_DESIGN_SPECS,
  ...DISPLAY_DESIGN_SPECS,
  ...FEEDBACK_DESIGN_SPECS,
  ...NAVIGATION_DESIGN_SPECS,
  ...EXPANSION_DESIGN_SPECS,
};

export function getComponentDesignSpec(
  slug: string,
): ComponentDesignSpec | undefined {
  return ALL_COMPONENT_DESIGN_SPECS[slug];
}

export const DESIGN_TOC_ITEMS: readonly TocAnchorItem[] = [
  { id: "design-provenance", label: "Provenance & Sources" },
  { id: "design-rationale", label: "Inspiration & Rationale" },
  { id: "design-geometry", label: "Geometry & Motion Contract" },
  { id: "design-invariants", label: "State & A11y Invariants" },
  { id: "design-porting", label: "Cross-Language Blueprint" },
  { id: "design-references", label: "References" },
];

export function serializeDesignSpecToMarkdown(
  doc: ComponentDocSpec,
  spec: ComponentDesignSpec,
): string {
  const lines: string[] = [];
  const badge =
    spec.provenance === "official-m3e"
      ? "Official Material 3 Expressive Specification"
      : "M3E Web Extrapolation & Adaptation";

  lines.push(`# ${doc.title} — Material 3 Expressive Design Specification`);
  lines.push("");
  lines.push(`- **Slug**: \`${doc.slug}\``);
  lines.push(`- **Provenance**: ${badge}`);
  if (doc.primitive) {
    lines.push(`- **Web Headless Primitive**: \`${doc.primitive}\``);
  }
  lines.push(`- **Token Sources (\`m3eui/tokens\`)**: ${spec.tokenSources.map((t) => `\`${t}\``).join(", ")}`);
  if (spec.aospSources && spec.aospSources.length > 0) {
    lines.push(`- **AOSP Compose Sources**: ${spec.aospSources.map((s) => `\`${s}\``).join(", ")}`);
  }
  lines.push("");
  lines.push(`> ${spec.provenanceSummary}`);
  lines.push("");

  lines.push("## 1. Inspiration & Design Rationale");
  lines.push("");
  for (const item of spec.inspirationAndRationale) {
    lines.push(`### ${item.title}`);
    lines.push(item.body);
    lines.push("");
  }

  lines.push("## 2. Platform-Agnostic Geometry & Motion Contract");
  lines.push("");
  lines.push(
    "_Units: logical pixels (`px` on Web, `dp` on Android/Compose, `pt` on iOS/SwiftUI, `lp` on Flutter)._",
  );
  lines.push("");
  for (const table of spec.geometryAndMotionTables) {
    lines.push(`### ${table.title}`);
    if (table.caption) {
      lines.push(`_${table.caption}_`);
      lines.push("");
    }
    lines.push(`| ${table.columns.join(" | ")} |`);
    lines.push(`| ${table.columns.map(() => "---").join(" | ")} |`);
    for (const row of table.rows) {
      lines.push(`| ${row.map((cell) => cell.replace(/\|/g, "\\|")).join(" | ")} |`);
    }
    lines.push("");
  }

  lines.push("## 3. Token, BiDi & Accessibility Invariants");
  lines.push("");
  for (const inv of spec.invariants) {
    lines.push(`- ${inv}`);
  }
  lines.push("");

  lines.push("## 4. Cross-Language & Multi-Platform Porting Blueprint");
  lines.push("");
  for (const note of spec.crossPlatformNotes) {
    lines.push(`- **${note.target}**: ${note.guidance}`);
  }
  lines.push("");

  lines.push("## 5. Authoritative References");
  lines.push("");
  for (const ref of spec.references) {
    const suffix = ref.note ? ` — ${ref.note}` : "";
    lines.push(`- [${ref.label}](${ref.url}) (\`${ref.kind}\`)${suffix}`);
  }

  return lines.join("\n");
}
