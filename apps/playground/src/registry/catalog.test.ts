import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { expect, it } from "vitest";
import { BLOCKS_REGISTRY } from "./blocks";
import { BLOCK_CATALOG, COMPONENT_CATALOG, DOC_CATALOG } from "./catalog";
import { ALL_COMPONENT_DOCS } from "./components";
import { DOC_GUIDES } from "./docs";
import {
  COMPONENT_DESIGN_CATEGORY,
  COMPONENT_DOC_CATEGORY,
  loadComponentDesignSpec,
  loadComponentDoc,
} from "./loaders";

it("keeps the lightweight catalog in sync with the full registry", async () => {
  expect(COMPONENT_CATALOG.map(({ slug, title, isNew }) => ({ slug, title, isNew }))).toEqual(
    ALL_COMPONENT_DOCS.map(({ slug, title, isNew }) => ({ slug, title, isNew })),
  );
  expect(BLOCK_CATALOG).toEqual(
    BLOCKS_REGISTRY.map(({ slug, category, title }) => ({ slug, category, title })),
  );
  expect(DOC_CATALOG).toEqual(DOC_GUIDES.map(({ slug, title }) => ({ slug, title })));

  for (const entry of COMPONENT_CATALOG) {
    expect(COMPONENT_DOC_CATEGORY[entry.slug]).toBeDefined();
    expect(COMPONENT_DESIGN_CATEGORY[entry.slug]).toBeDefined();
  }

  const [kbdDoc, kbdSpec, popoverDoc, popoverSpec] = await Promise.all([
    loadComponentDoc("kbd"),
    loadComponentDesignSpec("kbd"),
    loadComponentDoc("popover"),
    loadComponentDesignSpec("popover"),
  ]);
  expect(kbdDoc?.slug).toBe("kbd");
  expect(kbdSpec).toBeDefined();
  expect(popoverDoc?.slug).toBe("popover");
  expect(popoverSpec).toBeDefined();

  const llmsPath = resolve(__dirname, "../../public/llms.txt");
  if (existsSync(llmsPath)) {
    const llms = readFileSync(llmsPath, "utf8");
    expect(llms).toContain("m3eui/tailwind.css");
    expect(llms).toContain("m3eui/i18n/*");
    for (const entry of COMPONENT_CATALOG) {
      expect(llms).toContain(`/components/${entry.slug}`);
    }
  }

  const llmsFullPath = resolve(__dirname, "../../public/llms-full.txt");
  if (existsSync(llmsFullPath)) {
    const llmsFull = readFileSync(llmsFullPath, "utf8");
    expect(llmsFull).toContain("m3eui/i18n/*");
    expect(llmsFull).toContain("theme.autoContrast");
    expect(llmsFull).toContain("--m3e-color-primary");
    expect(llmsFull).toContain("fullScreen");
  }
});
