import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runM3ECli, runM3EDoctor, watchM3EThemeCss } from "./index.js";

describe("m3eui CLI — Declarative m3e.json & Theme Sync CLI Suite", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = mkdtempSync(join(tmpdir(), "m3e-cli-test-"));
  });

  afterEach(() => {
    rmSync(tempDir, { recursive: true, force: true });
  });

  it("initializes m3e.json + static theme CSS and refuses accidental overwrite without --force", () => {
    const logs: string[] = [];
    const errors: string[] = [];

    const code1 = runM3ECli(
      [
        "init",
        "--seed",
        "#0B6B58",
        "--variant",
        "vibrant",
        "--locale",
        "ja-JP",
        "--output",
        "styles/theme.css",
      ],
      {
        cwd: tempDir,
        log: (l) => logs.push(l),
        error: (e) => errors.push(e),
      },
    );

    expect(code1).toBe(0);
    expect(errors).toEqual([]);
    expect(existsSync(join(tempDir, "m3e.json"))).toBe(true);
    expect(existsSync(join(tempDir, "styles/theme.css"))).toBe(true);

    const cfg = JSON.parse(readFileSync(join(tempDir, "m3e.json"), "utf8"));
    expect(cfg.theme.seed).toBe("#0B6B58");
    expect(cfg.theme.schemeVariant).toBe("vibrant");
    expect(cfg.i18n.locale).toBe("ja-JP");

    const code2 = runM3ECli(["init"], {
      cwd: tempDir,
      log: () => {},
      error: (e) => errors.push(e),
    });
    expect(code2).toBe(1);
    expect(errors[0]).toContain("already exists");
  });

  it("detects stale CSS or invalid seed/contrast in doctor and passes after sync", () => {
    runM3ECli(["init"], { cwd: tempDir, log: () => {}, error: () => {} });

    const configPath = join(tempDir, "m3e.json");
    const parsed = JSON.parse(readFileSync(configPath, "utf8"));
    parsed.theme.seed = "#1A73E8";
    writeFileSync(configPath, JSON.stringify(parsed, null, 2), "utf8");

    const staleReport = runM3EDoctor(tempDir);
    expect(staleReport.ok).toBe(false);
    expect(
      staleReport.checks.find((c) => c.name === "static-theme-css-sync")?.passed,
    ).toBe(false);

    const syncCode = runM3ECli(["sync"], {
      cwd: tempDir,
      log: () => {},
      error: () => {},
    });
    expect(syncCode).toBe(0);

    const cleanReport = runM3EDoctor(tempDir);
    expect(cleanReport.ok).toBe(true);
  });

  it("lists built-in locales and scaffolds a typed custom locale pack", () => {
    const listOutput: string[] = [];
    expect(
      runM3ECli(["locale", "--list"], {
        cwd: tempDir,
        log: (l) => listOutput.push(l),
      }),
    ).toBe(0);
    expect(listOutput[0]).toContain("en-US, zh-CN, ja-JP, ar-SA");

    expect(
      runM3ECli(["locale", "fr-FR", "--out", "src/locales/fr-FR.ts"], {
        cwd: tempDir,
        log: () => {},
      }),
    ).toBe(0);

    const generated = readFileSync(
      join(tempDir, "src/locales/fr-FR.ts"),
      "utf8",
    );
    expect(generated).toContain("export const frFRMessages: M3EMessages");
    expect(generated).toContain('"datePicker.title"');
    expect(generated).toContain('"accordion.expandAll"');
  });

  it("passes full workspace m3e doctor audit on the repository root", () => {
    const repoRoot = resolve(__dirname, "../../../..");
    const syncCode = runM3ECli(["sync"], {
      cwd: repoRoot,
      log: () => {},
      error: () => {},
    });
    expect(syncCode).toBe(0);

    const report = runM3EDoctor(repoRoot);
    expect(report.ok).toBe(true);
    expect(
      report.checks.find((c) => c.name === "zero-hardcoded-cjk")?.passed,
    ).toBe(true);
  });

  it("flags invalid hex seed and out-of-range contrastLevel in m3e doctor", () => {
    writeFileSync(
      join(tempDir, "m3e.json"),
      JSON.stringify({
        theme: { seed: "not-a-hex", contrastLevel: 2.5 },
      }),
      "utf8",
    );
    const report = runM3EDoctor(tempDir);
    expect(report.ok).toBe(false);
    expect(
      report.checks.find((c) => c.name === "theme-seed-hex")?.passed,
    ).toBe(false);
    expect(
      report.checks.find((c) => c.name === "theme-contrast-range")?.passed,
    ).toBe(false);
  });

  it("allows overwriting existing m3e.json when --force is passed", () => {
    runM3ECli(["init", "--seed", "#6750A4"], {
      cwd: tempDir,
      log: () => {},
      error: () => {},
    });
    const code = runM3ECli(["init", "--seed", "#B3261E", "--force"], {
      cwd: tempDir,
      log: () => {},
      error: () => {},
    });
    expect(code).toBe(0);
    const cfg = JSON.parse(readFileSync(join(tempDir, "m3e.json"), "utf8"));
    expect(cfg.theme.seed).toBe("#B3261E");
  });

  it("prints package version for --version/-v and rejects malformed CLI flags, commands, and config values", () => {
    const versionLogs: string[] = [];
    expect(runM3ECli(["--version"], { cwd: tempDir, log: (l) => versionLogs.push(l) })).toBe(0);
    expect(versionLogs[0]).toMatch(/^\d+\.\d+\.\d+/);

    const badCases: string[][] = [
      ["unknown-cmd"],
      ["init", "--unknown-flag"],
      ["init", "--seed"],
      ["init", "--seed", "--force"],
      ["init", "extra-positional"],
      ["init", "--variant", "not-a-variant"],
      ["init", "--seed", "not-hex"],
      ["locale", "bad locale!"],
      ["locale", "fr-FR", "extra-arg"],
    ];

    for (const argv of badCases) {
      const errs: string[] = [];
      const code = runM3ECli(argv, {
        cwd: tempDir,
        log: () => {},
        error: (e) => errs.push(e),
      });
      expect(code).toBe(1);
      expect(errs.length).toBeGreaterThan(0);
    }

    writeFileSync(
      join(tempDir, "m3e.json"),
      JSON.stringify({
        unknownTopKey: true,
        theme: {
          seed: "#6750A4",
          schemeVariant: "expressive",
          colorMode: "invalid",
          motionScheme: "bouncy",
        },
        i18n: { locale: "bad locale!", direction: "diagonal" },
      }),
      "utf8",
    );
    const doctorReport = runM3EDoctor(tempDir);
    expect(doctorReport.ok).toBe(false);
    expect(
      doctorReport.checks.find((c) => c.name === "config-schema")?.passed,
    ).toBe(false);
    expect(
      doctorReport.checks.find((c) => c.name === "theme-motion-scheme")?.passed,
    ).toBe(false);
    expect(
      doctorReport.checks.find((c) => c.name === "i18n-locale-resolution")
        ?.passed,
    ).toBe(false);
  });

  it("scans nested component directories for hardcoded UI literals in m3e doctor", () => {
    runM3ECli(["init"], {
      cwd: tempDir,
      log: () => {},
      error: () => {},
    });
    const nestedDir = join(tempDir, "packages/m3eui/src/components/Button");
    mkdirSync(nestedDir, { recursive: true });
    writeFileSync(
      join(nestedDir, "Button.tsx"),
      'export function Button() { return <button aria-label="Close">x</button>; }\n',
      "utf8",
    );
    const report = runM3EDoctor(tempDir);
    const check = report.checks.find((c) => c.name === "zero-hardcoded-ui-literals");
    expect(report.ok).toBe(false);
    expect(check?.passed).toBe(false);
    expect(check?.detail).toContain("Button");
  });

  it("refuses to overwrite existing --output CSS or locale files unless --force is passed", () => {
    const existingCssRel = "src/app.css";
    const existingCssAbs = resolve(tempDir, existingCssRel);
    mkdirSync(resolve(tempDir, "src"), { recursive: true });
    const sentinelCss = "/* user custom styles */\nbody { margin: 0; }\n";
    writeFileSync(existingCssAbs, sentinelCss, "utf8");

    const initErrors: string[] = [];
    const initBlocked = runM3ECli(["init", "--output", existingCssRel], {
      cwd: tempDir,
      log: () => {},
      error: (e) => initErrors.push(e),
    });
    expect(initBlocked).toBe(1);
    expect(initErrors[0]).toContain("--force");
    expect(readFileSync(existingCssAbs, "utf8")).toBe(sentinelCss);
    expect(existsSync(resolve(tempDir, "m3e.json"))).toBe(false);

    expect(
      runM3ECli(["init", "--output", existingCssRel, "--force"], {
        cwd: tempDir,
        log: () => {},
        error: () => {},
      }),
    ).toBe(0);
    expect(existsSync(resolve(tempDir, "m3e.json"))).toBe(true);
    expect(readFileSync(existingCssAbs, "utf8")).not.toBe(sentinelCss);

    expect(
      runM3ECli(["locale", "fr-FR"], {
        cwd: tempDir,
        log: () => {},
        error: () => {},
      }),
    ).toBe(0);
    const localePath = resolve(tempDir, "src/i18n/fr-FR.ts");
    const editedLocale = readFileSync(localePath, "utf8").replace(
      '"Close dialog"',
      '"Fermer"',
    );
    writeFileSync(localePath, editedLocale, "utf8");

    const localeErrors: string[] = [];
    const localeBlocked = runM3ECli(["locale", "fr-FR"], {
      cwd: tempDir,
      log: () => {},
      error: (e) => localeErrors.push(e),
    });
    expect(localeBlocked).toBe(1);
    expect(localeErrors[0]).toContain("--force");
    expect(readFileSync(localePath, "utf8")).toBe(editedLocale);

    expect(
      runM3ECli(["locale", "fr-FR", "--force"], {
        cwd: tempDir,
        log: () => {},
        error: () => {},
      }),
    ).toBe(0);
    expect(readFileSync(localePath, "utf8")).toContain('"Close dialog"');
  });

  it("validates theme.autoContrast and theme.customColors in m3e doctor", () => {
    runM3ECli(["init"], {
      cwd: tempDir,
      log: () => {},
      error: () => {},
    });

    writeFileSync(
      join(tempDir, "m3e.json"),
      JSON.stringify({
        theme: {
          seed: "#6750A4",
          autoContrast: true,
          customColors: {
            brand: "#006C51",
            accent: { hex: "#D84315", harmonize: false },
          },
        },
      }),
      "utf8",
    );
    const validReport = runM3EDoctor(tempDir);
    expect(
      validReport.checks.find((c) => c.name === "config-schema")?.passed,
    ).toBe(true);

    writeFileSync(
      join(tempDir, "m3e.json"),
      JSON.stringify({
        theme: {
          autoContrast: "yes",
          customColors: {
            brand: "not-a-hex",
            accent: { hex: "#D84315", extraKey: 1 },
          },
        },
      }),
      "utf8",
    );
    const invalidReport = runM3EDoctor(tempDir);
    const schemaCheck = invalidReport.checks.find(
      (c) => c.name === "config-schema",
    );
    expect(invalidReport.ok).toBe(false);
    expect(schemaCheck?.passed).toBe(false);
    expect(schemaCheck?.detail).toContain("theme.autoContrast");
    expect(schemaCheck?.detail).toContain("theme.customColors.brand");
    expect(schemaCheck?.detail).toContain("theme.customColors.accent.extraKey");
  });

  it("checks static-theme-css-sync with customColors/autoContrast and runs external project health checks", () => {
    runM3ECli(["init"], {
      cwd: tempDir,
      log: () => {},
      error: () => {},
    });

    writeFileSync(
      join(tempDir, "m3e.json"),
      JSON.stringify({
        theme: {
          seed: "#6750A4",
          autoContrast: true,
          customColors: { brand: "#006C51" },
        },
      }),
      "utf8",
    );
    expect(
      runM3ECli(["sync"], {
        cwd: tempDir,
        log: () => {},
        error: () => {},
      }),
    ).toBe(0);

    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^19.0.0" } }),
      "utf8",
    );
    writeFileSync(
      join(tempDir, "index.html"),
      '<!doctype html><html><head><meta name="color-scheme" content="light dark"></head><body></body></html>',
      "utf8",
    );

    const healthyReport = runM3EDoctor(tempDir);
    expect(healthyReport.ok).toBe(true);
    expect(
      healthyReport.checks.find((c) => c.name === "static-theme-css-sync")?.passed,
    ).toBe(true);
    expect(
      healthyReport.checks.find((c) => c.name === "react-peer-version")?.passed,
    ).toBe(true);
    expect(
      healthyReport.checks.find((c) => c.name === "html-color-scheme-meta")?.passed,
    ).toBe(true);

    writeFileSync(
      join(tempDir, "package.json"),
      JSON.stringify({ dependencies: { react: "^17.0.2" } }),
      "utf8",
    );
    writeFileSync(
      join(tempDir, "index.html"),
      "<!doctype html><html><head></head><body></body></html>",
      "utf8",
    );

    const unhealthyReport = runM3EDoctor(tempDir);
    expect(unhealthyReport.ok).toBe(false);
    expect(
      unhealthyReport.checks.find((c) => c.name === "react-peer-version")?.passed,
    ).toBe(false);
    expect(
      unhealthyReport.checks.find((c) => c.name === "html-color-scheme-meta")?.passed,
    ).toBe(false);
  });

  it("re-syncs theme CSS automatically in watchM3EThemeCss when m3e.json changes", async () => {
    runM3ECli(["init", "--seed", "#6750A4"], {
      cwd: tempDir,
      log: () => {},
      error: () => {},
    });

    const logs: string[] = [];
    const watcher = watchM3EThemeCss(tempDir, undefined, {
      log: (line) => logs.push(line),
      error: () => {},
    });

    try {
      const cssPath = join(tempDir, "src/styles/m3e-theme.css");
      const beforeCss = readFileSync(cssPath, "utf8");

      writeFileSync(
        join(tempDir, "m3e.json"),
        JSON.stringify({ theme: { seed: "#0B6B58" } }),
        "utf8",
      );

      await new Promise<void>((resolveWait) => {
        const deadline = Date.now() + 2000;
        const poll = () => {
          if (readFileSync(cssPath, "utf8") !== beforeCss || Date.now() >= deadline) {
            resolveWait();
          } else {
            setTimeout(poll, 30);
          }
        };
        setTimeout(poll, 120);
      });

      const afterCss = readFileSync(cssPath, "utf8");
      expect(afterCss).not.toBe(beforeCss);
      expect(logs.some((l) => l.includes("Synced static theme CSS"))).toBe(true);
    } finally {
      watcher.close();
    }
  });
});
