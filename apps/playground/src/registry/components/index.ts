import type { ComponentDocSpec } from "../types";
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

export const ALL_COMPONENT_DOCS: readonly ComponentDocSpec[] = [
  ...ACTIONS_COMPONENT_DOCS,
  ...INPUTS_COMPONENT_DOCS,
  ...EXPANSION_INPUTS_DOCS,
  ...SELECTION_COMPONENT_DOCS,
  ...DISPLAY_COMPONENT_DOCS,
  ...EXPANSION_DISPLAY_DOCS,
  ...FEEDBACK_COMPONENT_DOCS,
  ...EXPANSION_FEEDBACK_DOCS,
  ...NAVIGATION_COMPONENT_DOCS,
  ...EXPANSION_NAVIGATION_DOCS,
].sort((a, b) => a.title.localeCompare(b.title, "en"));

export function findComponentDoc(slug: string | undefined): ComponentDocSpec | undefined {
  if (!slug) return undefined;
  return ALL_COMPONENT_DOCS.find((item) => item.slug === slug);
}
