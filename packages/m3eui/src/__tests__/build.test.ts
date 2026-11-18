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
    ]) {
      const code = readFileSync(resolve(distRoot, rel), "utf8").trimStart();
      expect(code.startsWith('"use client"'), `${rel} must stay RSC-safe`).toBe(
        false,
      );
    }

    for (const rel of [
      "context/M3EContext.js",
      "context/M3EProvider.js",
      "context/M3EPortal.js",
      "components/Button/Button.js",
      "components/Tabs/Tabs.js",
      "components/TopAppBar/TopAppBar.js",
      "components/DragHandle/DragHandle.js",
      "components/Navigation/Navigation.js",
    ]) {
      const code = readFileSync(resolve(distRoot, rel), "utf8").trimStart();
      expect(
        code.startsWith('"use client"'),
        `${rel} must declare "use client"`,
      ).toBe(true);
    }

    expect(existsSync(resolve(distRoot, "components/Button/Button.js"))).toBe(true);
    expect(existsSync(resolve(distRoot, "components/Button/Button.d.ts"))).toBe(true);

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
