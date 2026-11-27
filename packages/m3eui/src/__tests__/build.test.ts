import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { describe, expect, it } from "vitest";

describe("m3eui dist build invariants", () => {
  it("preserves RSC-safe server entrypoints, client directives, and subpath outputs without leaking tests", () => {
    const pkgRoot = resolve(process.cwd(), "packages/m3eui");
    const distRoot = resolve(pkgRoot, "dist");
    if (!existsSync(distRoot)) return;

    for (const rel of [
      "index.js",
      "config.js",
      "tokens/index.js",
      "i18n/index.js",
      "i18n/locales/en-US.js",
      "i18n/locales/zh-CN.js",
      "i18n/locales/ja-JP.js",
      "i18n/locales/ar-SA.js",
    ]) {
      expect(existsSync(resolve(distRoot, rel)), `${rel} must exist`).toBe(true);
      const code = readFileSync(resolve(distRoot, rel), "utf8").trimStart();
      expect(code.startsWith('"use client"'), `${rel} must stay RSC-safe`).toBe(
        false,
      );
    }

    const clientFiles: string[] = [
      "primitives.js",
      ...readdirSync(resolve(distRoot, "context"))
        .filter((f) => f.endsWith(".js"))
        .map((f) => `context/${f}`),
      ...readdirSync(resolve(distRoot, "hooks"))
        .filter((f) => f.endsWith(".js"))
        .map((f) => `hooks/${f}`),
      ...readdirSync(resolve(distRoot, "components"))
        .filter((dir) => existsSync(resolve(distRoot, "components", dir, `${dir}.js`)))
        .map((dir) => `components/${dir}/${dir}.js`),
    ];
    expect(clientFiles.length).toBeGreaterThan(50);

    for (const rel of clientFiles) {
      const code = readFileSync(resolve(distRoot, rel), "utf8").trimStart();
      expect(
        code.startsWith('"use client"'),
        `${rel} must declare "use client"`,
      ).toBe(true);
    }

    expect(existsSync(resolve(distRoot, "components/Button/Button.js"))).toBe(true);
    expect(existsSync(resolve(distRoot, "components/Button/Button.d.ts"))).toBe(true);

    const stylesCss = readFileSync(resolve(distRoot, "styles.css"), "utf8");
    expect(stylesCss).toContain(".m3e-type-title-medium");
    expect(stylesCss).toContain(".m3e-type-headline-small-emphasized");

    const baseStylesCss = readFileSync(resolve(distRoot, "styles/base.css"), "utf8");
    expect(baseStylesCss).toContain("@layer m3e.tokens, m3e.base, m3e.components;");
    expect(baseStylesCss).toContain(".m3e-type-title-medium");

    const srcComponentsRoot = resolve(pkgRoot, "src/components");
    const cssComponentDirs = readdirSync(srcComponentsRoot).filter((dir) =>
      existsSync(resolve(srcComponentsRoot, dir, `${dir}.css`)),
    );
    expect(cssComponentDirs.length).toBeGreaterThan(45);
    for (const dir of cssComponentDirs) {
      expect(
        existsSync(resolve(distRoot, "components", dir, "styles.css")),
        `components/${dir}/styles.css must exist`,
      ).toBe(true);
    }
    expect(readFileSync(resolve(distRoot, "components/Button/styles.css"), "utf8")).toContain(
      ".m3e-button",
    );
    expect(
      readFileSync(resolve(distRoot, "components/TextField/styles.css"), "utf8"),
    ).toContain(".m3e-field");

    const tailwindCss = readFileSync(resolve(distRoot, "tailwind.css"), "utf8");
    expect(tailwindCss).toContain("@theme inline");
    expect(tailwindCss).toContain("--color-m3e-primary: var(--m3e-color-primary);");
    expect(tailwindCss).toContain("--radius-m3e-medium: var(--m3e-shape-corner-medium);");
    expect(tailwindCss).toContain("--shadow-m3e-level2: var(--m3e-elevation-level2);");

    const emitted = readdirSync(distRoot, { recursive: true, encoding: "utf8" });
    const leakedTests = emitted.filter(
      (f) => f.includes(".test.") || f.includes("__tests__"),
    );
    expect(leakedTests).toEqual([]);
  });

  it("has zero duplicate runtime star-export symbols across dist/index.js", async () => {
    const distRoot = resolve(process.cwd(), "packages/m3eui/dist");
    const indexPath = resolve(distRoot, "index.js");
    if (!existsSync(indexPath)) return;

    const indexCode = readFileSync(indexPath, "utf8");
    const barrelSources = [...indexCode.matchAll(/export \* from "([^"]+)";/g)].map(
      (m) => m[1]!,
    );
    expect(barrelSources.length).toBeGreaterThan(10);

    const seen = new Map<string, string[]>();
    for (const rel of barrelSources) {
      const targetUrl = pathToFileURL(resolve(distRoot, rel)).href;
      const mod = (await import(/* @vite-ignore */ targetUrl)) as Record<string, unknown>;
      for (const name of Object.keys(mod)) {
        const list = seen.get(name) ?? [];
        list.push(rel);
        seen.set(name, list);
      }
    }

    const collisions = [...seen.entries()]
      .filter(([, files]) => files.length > 1)
      .map(([name, files]) => `${name}: ${files.join(", ")}`);
    expect(collisions).toEqual([]);

    const rootMod = (await import(
      /* @vite-ignore */ pathToFileURL(indexPath).href
    )) as Record<string, unknown>;
    expect(rootMod.CSPProvider).toBeDefined();
  });
});
