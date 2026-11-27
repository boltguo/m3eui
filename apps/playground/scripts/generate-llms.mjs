import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const playgroundDir = resolve(__dirname, "..");
const repoRoot = resolve(playgroundDir, "../..");

const pkgJson = JSON.parse(
  readFileSync(resolve(repoRoot, "packages/m3eui/package.json"), "utf8"),
);
const tokensPath = resolve(repoRoot, "packages/m3eui/dist/tokens.json");
const tokensJson = existsSync(tokensPath)
  ? JSON.parse(readFileSync(tokensPath, "utf8"))
  : null;

const catalogSrc = readFileSync(
  resolve(playgroundDir, "src/registry/catalog.ts"),
  "utf8",
);

function extractEntries(blockName) {
  const blockMatch = catalogSrc.match(
    new RegExp(`export const ${blockName}[^=]*=\\s*\\[([\\s\\S]*?)\\];`),
  );
  if (!blockMatch) return [];
  const entries = [];
  for (const line of blockMatch[1].split("\n")) {
    const slugMatch = line.match(/slug:\s*"([^"]+)"/);
    if (!slugMatch) continue;
    const titleMatch =
      line.match(/en:\s*"([^"]+)"/) ?? line.match(/title:\s*"([^"]+)"/);
    entries.push({
      slug: slugMatch[1],
      title: titleMatch ? titleMatch[1] : slugMatch[1],
    });
  }
  return entries;
}

const components = extractEntries("COMPONENT_CATALOG");
const docs = extractEntries("DOC_CATALOG");
const blocks = extractEntries("BLOCK_CATALOG");

const colorRoles = tokensJson?.themes?.expressiveViolet?.light
  ? Object.keys(tokensJson.themes.expressiveViolet.light).length
  : 61;
const shapeCount = tokensJson?.shapes ? Object.keys(tokensJson.shapes).length : 35;
const typeCount = tokensJson?.typography?.scale
  ? Object.keys(tokensJson.typography.scale).length
  : 30;

const lines = [
  `# m3eui v${pkgJson.version}`,
  "",
  `> ${pkgJson.description}`,
  "",
  "- Docs & Playground: https://m3eui.vercel.app",
  "- Repository: https://github.com/boltguo/m3eui",
  "- Sole runtime dependency: `@base-ui/react` (`react >= 18`, `react-dom >= 18`)",
  "",
  "## Quick Start",
  "",
  "```bash",
  "pnpm add m3eui",
  'npx m3eui init --seed "#6750A4" --variant expressive --locale en-US',
  "```",
  "",
  "```tsx",
  'import "./styles/m3e-theme.css";',
  'import "m3eui/styles.css";',
  'import { M3EProvider, Button } from "m3eui";',
  'import m3eConfig from "../m3e.json";',
  "",
  "export function App() {",
  "  return (",
  "    <M3EProvider config={m3eConfig}>",
  '      <Button variant="filled">Continue</Button>',
  "    </M3EProvider>",
  "  );",
  "}",
  "```",
  "",
  "## Subpath Exports",
  "",
  "- `m3eui` — Components, hooks (`useM3EToast`, `useM3E`, `useM3EI18n`, spring hooks), `M3EProvider`, `M3EPortal`, `CSPProvider`",
  "- `m3eui/styles.css` — Layered component CSS (`@layer m3e.tokens, m3e.base, m3e.components`, `light-dark()`, `.m3e-type-*`)",
  "- `m3eui/tailwind.css` — Tailwind CSS v4 `@theme inline` token mapping (`--color-m3e-*`, `--radius-m3e-*`, `--shadow-m3e-*`)",
  `- \`m3eui/tokens\` — Pure RSC-safe HCT palette generator (${colorRoles} roles), \`extractSeedHexFromImage\`, \`harmonizeHexColor\`, spring solver, corner topology, ${shapeCount} \`MaterialShapes\``,
  "- `m3eui/i18n` — Built-in `en-US`, `zh-CN`, `ja-JP`, `ar-SA` dictionaries, BCP 47 RTL & CLDR helpers",
  "- `m3eui/config` — `defineM3EConfig`, `resolveM3EConfig`, `generateM3EStaticThemeCss`, `getM3EInitScript`",
  "- `m3eui/primitives` — Re-exported `@base-ui/react` primitives",
  "- `m3eui/components/*` — Individual component modules",
  "",
  "## Integration Notes",
  "",
  "- Use `themeEngine={generateM3EThemeTokens}` on `<M3EProvider>` only when dynamic browser seed/variant switching is needed.",
  "- Use `syncDocumentRoot={false}` for isolated/embedded themes (`M3EPortal` keeps overlays scoped).",
  "- Use `render={<Link to=\"...\" />}` on `Button`, `IconButton`, `FAB`, `Card`, `ListItem`, `Breadcrumb`, and `NavigationDestination` for SPA routing.",
  `- Tokens: ${colorRoles} \`--m3e-color-*\` roles, ${typeCount} \`.m3e-type-*\` / \`--m3e-typescale-*\` scales, \`--m3e-shape-corner-*\`, \`--m3e-elevation-level0..5\`, \`--m3e-spatial-*\` / \`--m3e-effects-*\`.`,
  "",
  "## CLI",
  "",
  "- `npx m3eui init [--seed] [--variant] [--locale] [--output] [--force]`",
  "- `npx m3eui sync [--config]`",
  "- `npx m3eui locale --list | <bcp47-tag> [--out] [--force]`",
  "- `npx m3eui doctor [--config]`",
  "",
  "## Documentation",
  "",
  ...docs.map((d) => `- [${d.title}](https://m3eui.vercel.app/docs/${d.slug})`),
  "",
  `## Components (${components.length})`,
  "",
  ...components.map(
    (c) => `- [${c.title}](https://m3eui.vercel.app/components/${c.slug})`,
  ),
  "",
  `## Blocks (${blocks.length})`,
  "",
  ...blocks.map(
    (b) => `- [${b.title}](https://m3eui.vercel.app/blocks#${b.slug})`,
  ),
  "",
];

const outPath = resolve(playgroundDir, "public/llms.txt");
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, `${lines.join("\n")}\n`, "utf8");
console.log(`[llms] Generated ${outPath} (${components.length} components)`);
