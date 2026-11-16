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

const pkgJson = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));
const schemaJson = JSON.parse(
  readFileSync(join(pkgRoot, "m3e.schema.json"), "utf8"),
);
const NON_CLIENT_FILES = new Set(["index.js", "config.js", "version.js"]);
const NON_CLIENT_PREFIXES = [
  "cli/",
  "cli\\",
  "tokens/",
  "tokens\\",
  "i18n/",
  "i18n\\",
];

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
    if (NON_CLIENT_FILES.has(rel)) continue;
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

const cliBinPath = join(distDir, "cli", "bin.js");
if (existsSync(cliBinPath)) {
  chmodSync(cliBinPath, 0o755);
}

const versionMod = await import(join(distDir, "version.js"));
if (versionMod.M3E_PACKAGE_VERSION !== pkgJson.version) {
  throw new Error(
    `Version mismatch: src/version.ts (${versionMod.M3E_PACKAGE_VERSION}) !== package.json (${pkgJson.version})`,
  );
}
if (
  typeof schemaJson.$id !== "string" ||
  !schemaJson.$id.includes(`@${pkgJson.version}/`)
) {
  throw new Error(
    `Schema $id mismatch: m3e.schema.json (${String(schemaJson.$id)}) must reference @${pkgJson.version}/`,
  );
}

const tokens = {
  ...(await import(join(distDir, "tokens", "motion.js"))),
  ...(await import(join(distDir, "tokens", "shapes.js"))),
  ...(await import(join(distDir, "tokens", "color.js"))),
  ...(await import(join(distDir, "tokens", "typography.js"))),
  ...(await import(join(distDir, "tokens", "elevation.js"))),
  ...(await import(join(distDir, "tokens", "topology.js"))),
};

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
    package: pkgJson.name ?? "m3eui",
    version: pkgJson.version ?? "0.1.0",
    specification: "Material 3 Expressive",
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
  typography: {
    typefaces: tokens.M3E_TYPEFACE_TOKENS,
    scale: tokens.M3E_TYPOGRAPHY_TOKENS,
  },
  elevation: tokens.M3E_ELEVATION_TOKENS,
  stateLayer: tokens.M3E_STATE_LAYER_TOKENS,
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
    navigationRail: tokens.NAVIGATION_RAIL_TOKENS,
    dataTable: tokens.DATA_TABLE_TOKENS,
    skeleton: tokens.SKELETON_TOKENS,
    searchView: tokens.SEARCH_VIEW_TOKENS,
    fileUpload: tokens.FILE_UPLOAD_TOKENS,
    kbdSnippet: tokens.KBD_SNIPPET_TOKENS,
    colorPicker: tokens.COLOR_PICKER_TOKENS,
  },
  shapes: shapesSummary,
};

writeFileSync(
  join(distDir, "tokens.json"),
  `${JSON.stringify(payload, null, 2)}\n`,
  "utf8",
);
