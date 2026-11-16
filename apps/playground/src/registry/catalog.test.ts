import { expect, it } from "vitest";
import { BLOCKS_REGISTRY } from "./blocks";
import { BLOCK_CATALOG, COMPONENT_CATALOG, DOC_CATALOG } from "./catalog";
import { ALL_COMPONENT_DOCS } from "./components";
import { DOC_GUIDES } from "./docs";

it("keeps the lightweight catalog in sync with the full registry", () => {
  expect(COMPONENT_CATALOG.map(({ slug, title, category, isNew }) => ({ slug, title, category, isNew }))).toEqual(
    ALL_COMPONENT_DOCS.map(({ slug, title, category, isNew }) => ({ slug, title, category, isNew })),
  );
  expect(BLOCK_CATALOG).toEqual(
    BLOCKS_REGISTRY.map(({ slug, category, title }) => ({ slug, category, title })),
  );
  expect(DOC_CATALOG).toEqual(DOC_GUIDES.map(({ slug, title }) => ({ slug, title })));
});
