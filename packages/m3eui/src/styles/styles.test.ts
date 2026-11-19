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

  it("uses unified .m3e-ripple::before state layers for :hover without overriding [data-selected] or solid backgrounds", () => {
    const css = readLibraryCss();

    expect(css).toContain(
      ".m3e-button:hover:where(:not(:disabled, [data-disabled], [data-explicit-disabled])) > .m3e-ripple::before",
    );
    expect(css).toContain(
      ".m3e-icon-button:hover:where(:not(:disabled, [data-disabled], [data-explicit-disabled])) > .m3e-ripple::before",
    );
    expect(css).not.toMatch(/\.m3e-button\[data-variant="outlined"\][^{]*:hover/);
    expect(css).not.toMatch(/\.m3e-icon-button\[data-variant="outlined"\][^{]*:hover/);
    expect(css).toContain(
      '.m3e-chip-status[data-variant="solid"][data-tone="primary"]',
    );
    expect(css).toContain("--m3e-chip-status-bg: var(--m3e-color-primary);");
  });

  it("omits transparent 1px padding-box border rims on non-outlined ripple controls", () => {
    const css = readLibraryCss();
    for (const selector of [
      ".m3e-floating-toolbar__button",
      ".m3e-toggle-fab",
      ".m3e-fab-menu__item",
      ".m3e-snackbar",
    ]) {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = css.match(new RegExp(`${escaped}\\s*\\{[^}]*\\}`, "m"));
      expect(match?.[0]).toBeTruthy();
      expect(match?.[0]).toContain("border: 0;");
    }
    expect(css).not.toMatch(/\.m3e-snackbar:is\([^)]*\)\s*\{[^}]*border:/m);
  });

  it("keeps M3 modals, popovers, pickers, and tonal surfaces borderless outside forced-colors", () => {
    const css = readLibraryCss();
    for (const selector of [
      ".m3e-popover",
      ".m3e-date-picker",
      ".m3e-time-picker",
      ".m3e-time-picker-dialog",
      ".m3e-color-picker",
      ".m3e-search-bar",
      ".m3e-search-bar__popup",
      ".m3e-command-palette",
      ".m3e-nav-rail",
      '.m3e-segmented-list[data-variant="standard"]',
      '.m3e-fieldset[data-variant="tonal"]',
      ".m3e-form__error-summary",
    ]) {
      const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const match = css.match(new RegExp(`${escaped}\\s*\\{[^}]*\\}`, "m"));
      expect(match?.[0], `Expected CSS rule for ${selector}`).toBeTruthy();
      expect(match?.[0], `Expected border: 0; on ${selector}`).toContain("border: 0;");
    }
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

  it("omits outer drop box-shadows on :hover rules so interactive state stays flat", () => {
    const css = readLibraryCss();
    const offenders: string[] = [];

    for (const match of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = match[1]!.trim();
      const body = match[2]!;
      if (!selector.includes(":hover")) continue;
      for (const shadowMatch of body.matchAll(/box-shadow\s*:\s*([^;]+);/g)) {
        const value = shadowMatch[1]!.trim();
        if (value !== "none" && !value.startsWith("inset")) {
          offenders.push(`${selector} -> ${value}`);
        }
      }
    }

    expect(offenders).toEqual([]);
  });

  it("keeps dropdown items free of :focus-visible outline boxes outside forced-colors and keeps OTPField resting slots borderless", () => {
    const css = readLibraryCss();
    const lines = css.split("\n");
    const nonForcedCssLines: string[] = [];
    let depth = 0;
    let forcedColorsDepth: number | null = null;

    for (const line of lines) {
      if (
        forcedColorsDepth === null &&
        /@media\s*\(\s*forced-colors\s*:\s*active\s*\)/.test(line)
      ) {
        forcedColorsDepth = depth + 1;
      }
      const inForcedColors =
        forcedColorsDepth !== null && depth >= forcedColorsDepth;
      if (!inForcedColors) {
        nonForcedCssLines.push(line);
      }
      for (const ch of line) {
        if (ch === "{") depth++;
        else if (ch === "}") {
          if (forcedColorsDepth !== null && depth === forcedColorsDepth) {
            forcedColorsDepth = null;
          }
          depth--;
        }
      }
    }

    const nonForcedCss = nonForcedCssLines.join("\n");
    const focusOffenders: string[] = [];
    for (const match of nonForcedCss.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const selector = match[1]!.trim();
      const body = match[2]!;
      if (
        /\.(?:m3e-dropdown-item|m3e-segmented-menu__item|m3e-select__item|m3e-search-bar__item)\b/.test(
          selector,
        ) &&
        selector.includes(":focus-visible") &&
        /outline\s*:/.test(body)
      ) {
        focusOffenders.push(selector);
      }
    }
    expect(focusOffenders).toEqual([]);

    const otpSlotMatch = css.match(/\.m3e-otp-field__slot\s*\{([^}]*)\}/m);
    expect(otpSlotMatch?.[1]).toBeTruthy();
    expect(otpSlotMatch?.[1]).not.toContain("var(--m3e-color-outline-variant)");
  });
});
