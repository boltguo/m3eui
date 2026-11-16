import type * as React from "react";
import type { LocalizedCopy } from "../i18n";

export interface PropSpec {
  readonly name: string;
  readonly type: string;
  readonly defaultValue?: string;
  readonly required?: boolean;
  readonly description: LocalizedCopy;
}

export interface ApiTableSpec {
  readonly title: string;
  readonly description?: LocalizedCopy;
  readonly rows: readonly PropSpec[];
}

export type DesignProvenanceKind = "official-m3e" | "m3e-web-adaptation";

export type DesignReferenceKind =
  | "m3-spec"
  | "aosp-source"
  | "aria-apg"
  | "web-standard"
  | "base-ui";

export interface DesignReferenceLink {
  readonly label: string;
  readonly url: string;
  readonly kind: DesignReferenceKind;
  readonly note?: string;
}

export interface DesignContractTable {
  readonly id: string;
  readonly title: string;
  readonly caption?: string;
  readonly columns: readonly string[];
  readonly rows: readonly (readonly string[])[];
}

export interface ComponentDesignSpec {
  readonly provenance: DesignProvenanceKind;
  readonly provenanceSummary: string;
  readonly tokenSources: readonly string[];
  readonly aospSources?: readonly string[];
  readonly inspirationAndRationale: readonly {
    readonly title: string;
    readonly body: string;
  }[];
  readonly geometryAndMotionTables: readonly DesignContractTable[];
  readonly invariants: readonly string[];
  readonly crossPlatformNotes: readonly {
    readonly target: string;
    readonly guidance: string;
  }[];
  readonly references: readonly DesignReferenceLink[];
}

export interface ComponentScenarioSpec {
  readonly id: string;
  readonly title: LocalizedCopy;
  readonly description: LocalizedCopy;
  readonly code: string;
  readonly render: () => React.ReactNode;
}

export interface ComponentDocSpec {
  readonly slug: string;
  readonly title: string;
  readonly subtitle: LocalizedCopy;
  readonly importStatement: string;
  readonly primitive?: string;
  readonly isNew?: boolean;
  readonly scenarios: readonly ComponentScenarioSpec[];
  readonly apis: readonly ApiTableSpec[];
}

export type BlockCategoryKey =
  | "featured"
  | "dashboard"
  | "sidebar"
  | "auth"
  | "settings"
  | "ai";

export const BLOCK_CATEGORY_ORDER: readonly BlockCategoryKey[] = [
  "featured",
  "dashboard",
  "sidebar",
  "auth",
  "settings",
  "ai",
];

export interface BlockSpec {
  readonly slug: string;
  readonly category: Exclude<BlockCategoryKey, "featured">;
  readonly featured?: boolean;
  readonly title: LocalizedCopy;
  readonly description: LocalizedCopy;
  readonly minHeight?: number;
  readonly code: string;
  readonly render: () => React.ReactNode;
}

export interface DocGuideSpec {
  readonly slug: string;
  readonly title: LocalizedCopy;
  readonly subtitle: LocalizedCopy;
  readonly sections: readonly {
    readonly id: string;
    readonly heading: LocalizedCopy;
  }[];
  readonly render: () => React.ReactNode;
}
