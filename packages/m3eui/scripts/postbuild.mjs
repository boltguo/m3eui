import {
  chmodSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const pkgRoot = resolve(__dirname, "..");
const distDir = join(pkgRoot, "dist");
const cssSrc = join(pkgRoot, "src", "styles", "m3e.css");
const cssDest = join(distDir, "styles.css");

mkdirSync(distDir, { recursive: true });
copyFileSync(cssSrc, cssDest);

// 1. Prepend "use client" to browser React modules while preserving CLI shebang & server-safe tokens
const NON_CLIENT_PREFIXES = ["cli/", "cli\\", "tokens/", "tokens\\"];

function prependUseClient(dir) {
  for (const entry of readdirSync(dir)) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      prependUseClient(fullPath);
      continue;
    }
    if (!fullPath.endsWith(".js")) continue;
    const rel = relative(distDir, fullPath);
    if (NON_CLIENT_PREFIXES.some((p) => rel.startsWith(p))) continue;

    const raw = readFileSync(fullPath, "utf8");
    const trimmed = raw.trimStart();
    if (
      !trimmed.startsWith('"use client"') &&
      !trimmed.startsWith("'use client'") &&
      !trimmed.startsWith("#!")
    ) {
      writeFileSync(fullPath, `"use client";\n${raw}`, "utf8");
    }
  }
}

prependUseClient(distDir);

// 2. Ensure CLI binary is executable
const cliBinPath = join(distDir, "cli", "bin.js");
if (existsSync(cliBinPath)) {
  chmodSync(cliBinPath, 0o755);
}

// 3. Emit static dist/tokens.json for cross-platform pipelines (Swift, Kotlin, Figma)
const tokens = await import(join(distDir, "tokens", "index.js"));

function resolveSchemeMap(scheme) {
  const out = {};
  for (const [key, spec] of Object.entries(scheme)) {
    out[key] = tokens.resolveCrossPlatformSpring(spec, 1);
  }
  return out;
}

const shapesSummary = {};
for (const name of tokens.M3E_ALL_SHAPE_NAMES) {
  const data = tokens.MATERIAL_SHAPES[name];
  shapesSummary[name] = {
    cubicCount: data.cubics.length,
    svgPath64: tokens.cubicsToSvgPath(data.cubics, 64, 0.9),
  };
}

const payload = {
  meta: {
    package: "m3eui",
    version: "0.1.0",
    specification: "Material 3 Expressive (1.5.0)",
  },
  themes: {
    expressiveViolet: tokens.generateM3EThemeTokens({
      seedHex: "#6750A4",
      variant: "expressive",
    }),
    vibrantViolet: tokens.generateM3EThemeTokens({
      seedHex: "#6750A4",
      variant: "vibrant",
    }),
  },
  motion: {
    expressive: resolveSchemeMap(tokens.EXPRESSIVE_MOTION_SCHEME),
    standard: resolveSchemeMap(tokens.STANDARD_MOTION_SCHEME),
  },
  topology: {
    shapeCorners: tokens.SHAPE_CORNER_TOKENS,
    buttonSizes: tokens.BUTTON_SIZE_SPECS,
    iconButtonSizes: tokens.ICON_BUTTON_SIZE_SPECS,
    splitButtonSizes: tokens.SPLIT_BUTTON_SPECS,
    fabSizes: tokens.FAB_SIZE_SPECS,
    extendedFabSizes: tokens.EXTENDED_FAB_SPECS,
    switch: tokens.SWITCH_TOKENS,
    sliderSizes: tokens.SLIDER_SIZE_SPECS,
    select: tokens.SELECT_TOKENS,
    datePicker: tokens.DATE_PICKER_TOKENS,
    timePicker: tokens.TIME_PICKER_TOKENS,
    navigation: tokens.NAVIGATION_TOKENS,
    wideNavigationRail: tokens.WIDE_NAVIGATION_RAIL_TOKENS,
    navigationDrawer: tokens.NAVIGATION_DRAWER_TOKENS,
    menubar: tokens.MENUBAR_TOKENS,
    dataTable: tokens.DATA_TABLE_TOKENS,
    skeleton: tokens.SKELETON_TOKENS,
  },
  shapes: shapesSummary,
};

writeFileSync(
  join(distDir, "tokens.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8",
);
