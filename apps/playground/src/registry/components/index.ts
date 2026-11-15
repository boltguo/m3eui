import {
  COMPONENT_CATEGORY_ORDER,
  type ComponentCategoryKey,
  type ComponentDocSpec,
} from "../types";
import { ACTIONS_COMPONENT_DOCS } from "./actions";
import { DISPLAY_COMPONENT_DOCS } from "./display";
import {
  EXPANSION_DISPLAY_DOCS,
  EXPANSION_FEEDBACK_DOCS,
  EXPANSION_INPUTS_DOCS,
  EXPANSION_NAVIGATION_DOCS,
} from "./expansion";
import { FEEDBACK_COMPONENT_DOCS } from "./feedback";
import { INPUTS_COMPONENT_DOCS } from "./inputs";
import { NAVIGATION_COMPONENT_DOCS } from "./navigation";
import { SELECTION_COMPONENT_DOCS } from "./selection";

const MERGED_INPUTS_DOCS: readonly ComponentDocSpec[] = [
  ...INPUTS_COMPONENT_DOCS,
  ...EXPANSION_INPUTS_DOCS,
];
const MERGED_DISPLAY_DOCS: readonly ComponentDocSpec[] = [
  ...DISPLAY_COMPONENT_DOCS,
  ...EXPANSION_DISPLAY_DOCS,
];
const MERGED_FEEDBACK_DOCS: readonly ComponentDocSpec[] = [
  ...FEEDBACK_COMPONENT_DOCS,
  ...EXPANSION_FEEDBACK_DOCS,
];
const MERGED_NAVIGATION_DOCS: readonly ComponentDocSpec[] = [
  ...NAVIGATION_COMPONENT_DOCS,
  ...EXPANSION_NAVIGATION_DOCS,
];

export const ALL_COMPONENT_DOCS: readonly ComponentDocSpec[] = [
  ...ACTIONS_COMPONENT_DOCS,
  ...MERGED_INPUTS_DOCS,
  ...SELECTION_COMPONENT_DOCS,
  ...MERGED_DISPLAY_DOCS,
  ...MERGED_FEEDBACK_DOCS,
  ...MERGED_NAVIGATION_DOCS,
];

export const COMPONENTS_BY_CATEGORY: Readonly<
  Record<ComponentCategoryKey, readonly ComponentDocSpec[]>
> = {
  actions: ACTIONS_COMPONENT_DOCS,
  inputs: MERGED_INPUTS_DOCS,
  selection: SELECTION_COMPONENT_DOCS,
  display: MERGED_DISPLAY_DOCS,
  feedback: MERGED_FEEDBACK_DOCS,
  navigation: MERGED_NAVIGATION_DOCS,
};

export function findComponentDoc(slug: string | undefined): ComponentDocSpec | undefined {
  if (!slug) return undefined;
  return ALL_COMPONENT_DOCS.find((item) => item.slug === slug);
}

export { COMPONENT_CATEGORY_ORDER };
