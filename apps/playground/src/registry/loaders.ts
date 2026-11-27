import type { ComponentDesignSpec, ComponentDocSpec } from "./types";

export type ComponentCategoryKey =
  | "actions"
  | "inputs"
  | "selection"
  | "display"
  | "feedback"
  | "navigation"
  | "expansion";

export const COMPONENT_DOC_CATEGORY: Readonly<Record<string, ComponentCategoryKey>> = {
  button: "actions",
  "icon-button": "actions",
  "button-group": "actions",
  "split-button": "actions",
  fab: "actions",
  "fab-menu": "actions",
  "floating-toolbar": "actions",
  "text-field": "inputs",
  "number-field": "inputs",
  select: "inputs",
  combobox: "inputs",
  "otp-field": "inputs",
  "date-picker": "inputs",
  "time-picker": "inputs",
  form: "inputs",
  checkbox: "selection",
  "radio-group": "selection",
  switch: "selection",
  slider: "selection",
  card: "display",
  "data-table": "display",
  list: "display",
  chip: "display",
  avatar: "display",
  badge: "display",
  carousel: "display",
  empty: "display",
  skeleton: "display",
  "material-shape": "display",
  alert: "feedback",
  dialog: "feedback",
  "alert-dialog": "feedback",
  sheet: "feedback",
  toast: "feedback",
  "loading-indicator": "feedback",
  "progress-indicator": "feedback",
  meter: "feedback",
  tooltip: "feedback",
  "navigation-bar": "navigation",
  "navigation-rail": "navigation",
  breadcrumb: "navigation",
  pagination: "navigation",
  tabs: "navigation",
  accordion: "navigation",
  menu: "navigation",
  "context-menu": "navigation",
  popover: "navigation",
  "command-palette": "navigation",
  "top-app-bar": "navigation",
  "search-bar": "navigation",
  "file-upload": "expansion",
  "color-picker": "expansion",
  kbd: "expansion",
  snippet: "expansion",
  divider: "expansion",
  "scroll-area": "expansion",
  "drag-handle": "expansion",
};

export const COMPONENT_DESIGN_CATEGORY: Readonly<Record<string, ComponentCategoryKey>> = {
  ...COMPONENT_DOC_CATEGORY,
  kbd: "display",
  popover: "feedback",
};

const docCategoryCache = new Map<
  ComponentCategoryKey,
  Promise<readonly ComponentDocSpec[]>
>();
const designCategoryCache = new Map<
  ComponentCategoryKey,
  Promise<Readonly<Record<string, ComponentDesignSpec>>>
>();

async function loadDocCategory(
  category: ComponentCategoryKey,
): Promise<readonly ComponentDocSpec[]> {
  let cached = docCategoryCache.get(category);
  if (!cached) {
    cached = (async () => {
      switch (category) {
        case "actions":
          return (await import("./components/actions")).ACTIONS_COMPONENT_DOCS;
        case "inputs":
          return (await import("./components/inputs")).INPUTS_COMPONENT_DOCS;
        case "selection":
          return (await import("./components/selection")).SELECTION_COMPONENT_DOCS;
        case "display":
          return (await import("./components/display")).DISPLAY_COMPONENT_DOCS;
        case "feedback":
          return (await import("./components/feedback")).FEEDBACK_COMPONENT_DOCS;
        case "navigation":
          return (await import("./components/navigation")).NAVIGATION_COMPONENT_DOCS;
        case "expansion": {
          const m = await import("./components/expansion");
          return [
            ...m.EXPANSION_INPUTS_DOCS,
            ...m.EXPANSION_DISPLAY_DOCS,
            ...m.EXPANSION_FEEDBACK_DOCS,
            ...m.EXPANSION_NAVIGATION_DOCS,
          ];
        }
      }
    })();
    docCategoryCache.set(category, cached);
  }
  return cached;
}

async function loadDesignCategory(
  category: ComponentCategoryKey,
): Promise<Readonly<Record<string, ComponentDesignSpec>>> {
  let cached = designCategoryCache.get(category);
  if (!cached) {
    cached = (async () => {
      switch (category) {
        case "actions":
          return (await import("./design/actions")).ACTIONS_DESIGN_SPECS;
        case "inputs":
          return (await import("./design/inputs")).INPUTS_DESIGN_SPECS;
        case "selection":
          return (await import("./design/selection")).SELECTION_DESIGN_SPECS;
        case "display":
          return (await import("./design/display")).DISPLAY_DESIGN_SPECS;
        case "feedback":
          return (await import("./design/feedback")).FEEDBACK_DESIGN_SPECS;
        case "navigation":
          return (await import("./design/navigation")).NAVIGATION_DESIGN_SPECS;
        case "expansion":
          return (await import("./design/expansion")).EXPANSION_DESIGN_SPECS;
      }
    })();
    designCategoryCache.set(category, cached);
  }
  return cached;
}

export async function loadComponentDoc(
  slug: string,
): Promise<ComponentDocSpec | undefined> {
  const category = COMPONENT_DOC_CATEGORY[slug];
  if (!category) return undefined;
  const docs = await loadDocCategory(category);
  return docs.find((item) => item.slug === slug);
}

export async function loadComponentDesignSpec(
  slug: string,
): Promise<ComponentDesignSpec | undefined> {
  const category = COMPONENT_DESIGN_CATEGORY[slug];
  if (!category) return undefined;
  const specs = await loadDesignCategory(category);
  return specs[slug];
}

export async function loadComponentMatrixData(): Promise<{
  readonly docs: readonly ComponentDocSpec[];
  readonly specs: Readonly<Record<string, ComponentDesignSpec>>;
}> {
  const [{ ALL_COMPONENT_DOCS }, { ALL_COMPONENT_DESIGN_SPECS }] =
    await Promise.all([import("./components"), import("./design")]);
  return {
    docs: ALL_COMPONENT_DOCS,
    specs: ALL_COMPONENT_DESIGN_SPECS,
  };
}
