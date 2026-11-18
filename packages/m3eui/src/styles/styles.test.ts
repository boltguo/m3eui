import { readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const readLibraryCss = (): string => {
  const srcDir = resolve(__dirname, "..");
  const css = readdirSync(srcDir, { recursive: true, encoding: "utf8" })
    .filter((f) => f.endsWith(".css"))
    .sort()
    .map((f) => readFileSync(join(srcDir, f), "utf8"))
    .join("\n");
  expect(css.length).toBeGreaterThan(200_000);
  return css;
};

describe("m3eui/styles — Layering, Scrollbars & Hover Contracts", () => {
  it("styles scrollbars via scoped webkit pseudo-elements without disabling overlay scrollbars", () => {
    const css = readLibraryCss();
    expect(css).not.toMatch(/scrollbar-color:|scrollbar-width:\s*thin/);
    expect(css).not.toMatch(/(?:^|[\s,])(?:html|body|:root|\*)::-webkit-scrollbar/);
  });

  it("layers floating popup positioners above Dialog, Sheet, SearchView, and CommandPalette modals", () => {
    const css = readLibraryCss();
    const getZIndex = (selector: string): number => {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = css.match(
        new RegExp(`${escaped}\\s*\\{[^}]*?z-index:\\s*(\\d+)`, "m"),
      );
      if (!match) {
        throw new Error(`Missing z-index for ${selector}`);
      }
      return Number(match[1]);
    };

    const modalZIndices = [
      getZIndex(".m3e-dialog__backdrop"),
      getZIndex(".m3e-dialog__viewport"),
      getZIndex(".m3e-sheet__backdrop"),
      getZIndex(".m3e-sheet__viewport"),
      getZIndex(".m3e-search-view__modal-popup"),
      getZIndex(".m3e-command-palette"),
    ];
    const maxModalZ = Math.max(...modalZIndices);

    expect(getZIndex(".m3e-search-view__modal-popup")).toBeGreaterThan(
      getZIndex(".m3e-dialog__backdrop"),
    );

    const popupPositioners = [
      ".m3e-select__positioner",
      ".m3e-segmented-menu__positioner",
      ".m3e-popover__positioner",
      ".m3e-search-bar__positioner",
    ];
    for (const selector of popupPositioners) {
      expect(getZIndex(selector)).toBeGreaterThan(maxModalZ);
    }

    expect(getZIndex(".m3e-tooltip__positioner")).toBeGreaterThan(
      getZIndex(".m3e-select__positioner"),
    );
    expect(getZIndex(".m3e-toast__viewport")).toBeGreaterThan(
      getZIndex(".m3e-tooltip__positioner"),
    );
  });

  it("prevents unselected :hover rules from overriding [data-selected] or solid backgrounds via specificity inflation", () => {
    const css = readLibraryCss();

    expect(css).toContain(
      '.m3e-button[data-variant="outlined"]:hover:where(:not([data-disabled], [data-selected], [data-pressed]))',
    );
    expect(css).toContain(
      ".m3e-button[data-selected]:hover:where(:not([data-disabled], [data-pressed]))",
    );
    expect(css).toContain(
      '.m3e-icon-button[data-variant="outlined"]:hover:where(:not([data-disabled], [data-selected], [data-pressed]))',
    );
    expect(css).toContain(
      ".m3e-icon-button[data-toggle][data-selected]:hover:where(:not([data-disabled], [data-pressed]))",
    );
    expect(css).toContain(
      '.m3e-chip-status[data-variant="solid"][data-tone="primary"]',
    );
    expect(css).toContain("--m3e-chip-status-bg: var(--m3e-color-primary);");
  });

  it("gates every :hover rule in library CSS inside @media (hover: hover)", () => {
    const lines = readLibraryCss().split("\n");
    let depth = 0;
    let hoverMediaStack: number[] = [];
    const ungated: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      const isHoverMedia = /@media\s*\(\s*hover\s*:\s*hover\s*\)/.test(line);
      for (const ch of line) {
        if (ch === "{") {
          depth++;
          if (isHoverMedia && !hoverMediaStack.includes(depth)) {
            hoverMediaStack.push(depth);
          }
        } else if (ch === "}") {
          hoverMediaStack = hoverMediaStack.filter((d) => d !== depth);
          depth--;
        }
      }
      if (line.includes(":hover") && hoverMediaStack.length === 0) {
        ungated.push(`${i + 1}: ${line.trim()}`);
      }
    }

    expect(ungated).toEqual([]);
  });
});
