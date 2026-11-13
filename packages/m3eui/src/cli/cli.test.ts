import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runM3ECli, runM3EDoctor } from "./index.js";

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

    // Second init without --force fails safely
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

    // Mutate m3e.json without running sync -> doctor reports stale CSS
    const configPath = join(tempDir, "m3e.json");
    const parsed = JSON.parse(readFileSync(configPath, "utf8"));
    parsed.theme.seed = "#1A73E8";
    writeFileSync(configPath, JSON.stringify(parsed, null, 2), "utf8");

    const staleReport = runM3EDoctor(tempDir);
    expect(staleReport.ok).toBe(false);
    expect(
      staleReport.checks.find((c) => c.name === "static-theme-css-sync")?.passed,
    ).toBe(false);

    // Run m3e sync -> doctor passes!
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
    expect(generated).toContain('"collapsible.expandAll"');
  });

  it("passes full workspace m3e doctor audit on the repository root", () => {
    const repoRoot = resolve(__dirname, "../../../..");
    // Sync first so generated CSS matches root m3e.json
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
});
