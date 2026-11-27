import { describe, expect, it } from "vitest";
import {
  defineM3EConfig,
  generateM3EStaticThemeCss,
  getM3EInitScript,
  resolveM3EConfig,
  serializeM3EConfig,
} from "./config.js";
import * as Primitives from "./primitives.js";

describe("m3eui/config & m3eui/primitives", () => {
  it("generates a safe synchronous SSR zero-FOUC init script", () => {
    const script = getM3EInitScript("custom-theme-key");
    expect(script).toContain('"custom-theme-key"');
    expect(script).toContain('meta[name="color-scheme"]');
    expect(script).toContain("light dark");
  });

  it("resolves m3e.json config, clamps contrast, auto-detects RTL locales, and generates static light-dark() CSS", () => {
    const cfg = defineM3EConfig({
      style: "expressive",
      theme: {
        seed: "#0B6B58",
        schemeVariant: "vibrant",
        contrastLevel: 0.5,
        colorMode: "dark",
      },
      i18n: {
        locale: "ar-SA",
        direction: "auto",
      },
    });

    const resolved = resolveM3EConfig(cfg);
    expect(resolved.seedHex).toBe("#0B6B58");
    expect(resolved.schemeVariant).toBe("vibrant");
    expect(resolved.contrastLevel).toBe(0.5);
    expect(resolved.resolvedDirection).toBe("rtl");

    const clamped = resolveM3EConfig({ theme: { contrastLevel: 3.2 } });
    expect(clamped.contrastLevel).toBe(1);

    const css = generateM3EStaticThemeCss(cfg);
    expect(css).toContain(":root {");
    expect(css).toContain("color-scheme: dark;");
    expect(css).toContain("--m3e-color-primary: light-dark(");
    expect(css).toContain("--m3e-spatial-fast-easing:");
  });

  it("re-exports complete compound Base UI primitives from m3eui/primitives", () => {
    expect(Primitives.AccordionPrimitives).toBeDefined();
    expect(Primitives.CollapsiblePrimitives).toBeDefined();
    expect(Primitives.NavigationMenuPrimitives).toBeDefined();
    expect(Primitives.CSPProvider).toBeDefined();
    expect(Primitives.DialogPrimitives).toBeDefined();
    expect(Primitives.SelectPrimitives).toBeDefined();
    expect(typeof Primitives.mergeProps).toBe("function");
  });

  it("supports theme.autoContrast and theme.customColors in resolver, static CSS, and serializer", () => {
    const cfg = defineM3EConfig({
      theme: {
        seed: "#6750A4",
        autoContrast: true,
        customColors: {
          brand: "#006C51",
          accent: { hex: "#D84315", harmonize: false },
        },
      },
    });

    const resolved = resolveM3EConfig(cfg);
    expect(resolved.autoContrast).toBe(true);
    expect(resolved.customColors).toEqual({
      brand: "#006C51",
      accent: { hex: "#D84315", harmonize: false },
    });

    const css = generateM3EStaticThemeCss(cfg);
    expect(css).toContain("--m3e-color-brand: light-dark(");
    expect(css).toContain("--m3e-color-brand-container: light-dark(");
    expect(css).toContain("--m3e-color-accent: light-dark(");
    expect(css).toContain("@media (prefers-contrast: more) {");
    expect(css).toMatch(
      /@supports not \(color: light-dark\(white, black\)\)[\s\S]*--m3e-color-brand: var\(--m3e-color-brand-light/,
    );

    const defaultSerialized = JSON.parse(serializeM3EConfig({}));
    expect(defaultSerialized.theme.autoContrast).toBeUndefined();
    expect(defaultSerialized.theme.customColors).toBeUndefined();

    const customSerialized = JSON.parse(
      serializeM3EConfig({
        autoContrast: true,
        customColors: { brand: "#006C51" },
      }),
    );
    expect(customSerialized.theme.autoContrast).toBe(true);
    expect(customSerialized.theme.customColors).toEqual({ brand: "#006C51" });
  });
});
