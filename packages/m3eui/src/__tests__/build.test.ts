import { existsSync, readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
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
});
