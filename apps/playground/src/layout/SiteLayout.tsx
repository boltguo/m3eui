import * as React from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import {
  Button,
  ButtonGroup,
  Card,
  CommandPalette,
  type CommandPaletteGroup,
  type M3EBuiltInLocale,
  MaterialShapeView,
  NavigationDrawer,
  type NavigationDestination,
  SearchBar,
  useM3E,
} from "m3eui";
import m3ePkg from "../../../../packages/m3eui/package.json";
import { useCopyResolver, usePlaygroundStrings } from "../i18n";
import { BLOCKS_REGISTRY } from "../registry/blocks";
import {
  ALL_COMPONENT_DOCS,
  COMPONENT_CATEGORY_ORDER,
  COMPONENTS_BY_CATEGORY,
} from "../registry/components";
import { DOC_GUIDES } from "../registry/docs";
import { SiteHeader } from "./SiteHeader";
import { GITHUB_REPO_URL } from "./Icons";
import { ThemeStudioSheet } from "./ThemeStudioSheet";

export interface SiteOutletContext {
  readonly openStudio: () => void;
  readonly openCommandPalette: () => void;
}

export function SiteLayout() {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const { locale, setLocale } = useM3E();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileNavOpen, setMobileNavOpen] = React.useState(false);
  const [mobileFilter, setMobileFilter] = React.useState("");
  const [studioOpen, setStudioOpen] = React.useState(false);
  const [commandOpen, setCommandOpen] = React.useState(false);

  // Scroll to top when pathname changes (preserve hash scrolling if #hash is set)
  React.useEffect(() => {
    setMobileNavOpen(false);
    setMobileFilter("");
    if (location.hash) {
      const id = decodeURIComponent(location.hash.slice(1));
      const scrollToHash = () => {
        const el = document.getElementById(id);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
          return true;
        }
        return false;
      };
      if (scrollToHash()) return;
      const rafId = window.requestAnimationFrame(() => {
        if (!scrollToHash()) {
          window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        }
      });
      return () => window.cancelAnimationFrame(rafId);
    }
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [location.pathname, location.hash]);

  // Update document.title dynamically on SPA route transitions (WCAG / Modern Web Guidance)
  React.useEffect(() => {
    const path = location.pathname;
    let prefix = "";
    if (path.startsWith("/components")) {
      const slug = path.split("/")[2];
      const doc = ALL_COMPONENT_DOCS.find((c) => c.slug === slug);
      prefix = doc ? `${doc.title} · ${ui.navComponents}` : ui.navComponents;
    } else if (path.startsWith("/docs")) {
      const slug = path.split("/")[2] ?? "introduction";
      const guide = DOC_GUIDES.find((g) => g.slug === slug);
      prefix = guide ? `${resolve(guide.title)} · ${ui.navDocs}` : ui.navDocs;
    } else if (path.startsWith("/blocks")) {
      prefix = ui.navBlocks;
    }
    document.title = prefix ? `${prefix} — m3eui` : ui.docTitle;
  }, [location.pathname, resolve, ui]);

  const commandGroups = React.useMemo<readonly CommandPaletteGroup[]>(() => {
    return [
      {
        id: "pages",
        heading: ui.cmdGroups.pages,
        items: [
          {
            id: "page-home",
            label: ui.navHome,
            shortcut: "G H",
            onSelect: () => navigate("/"),
          },
          {
            id: "page-docs",
            label: ui.navDocs,
            onSelect: () => navigate("/docs/introduction"),
          },
          {
            id: "page-components",
            label: ui.navComponents,
            onSelect: () => navigate("/components/button"),
          },
          {
            id: "page-blocks",
            label: ui.navBlocks,
            onSelect: () => navigate("/blocks"),
          },
          {
            id: "action-studio",
            label: ui.studioTitle,
            onSelect: () => setStudioOpen(true),
          },
          {
            id: "action-github",
            label: "GitHub",
            description: GITHUB_REPO_URL,
            keywords: ["github", "repo", "source", "boltguo"],
            onSelect: () => {
              window.open(GITHUB_REPO_URL, "_blank", "noopener,noreferrer");
            },
          },
        ],
      },
      {
        id: "docs",
        heading: ui.cmdGroups.docs,
        items: DOC_GUIDES.map((g) => ({
          id: `doc-${g.slug}`,
          label: resolve(g.title),
          description: resolve(g.subtitle),
          keywords: [g.slug],
          onSelect: () => navigate(`/docs/${g.slug}`),
        })),
      },
      {
        id: "components",
        heading: ui.cmdGroups.components,
        items: ALL_COMPONENT_DOCS.map((c) => ({
          id: `comp-${c.slug}`,
          label: c.title,
          description: resolve(c.subtitle),
          keywords: [c.slug, c.category, ui.componentCategories[c.category]],
          onSelect: () => navigate(`/components/${c.slug}`),
        })),
      },
      {
        id: "blocks",
        heading: ui.cmdGroups.blocks,
        items: BLOCKS_REGISTRY.map((blk) => ({
          id: `block-${blk.slug}`,
          label: `${blk.slug} — ${resolve(blk.title)}`,
          description: resolve(blk.description),
          keywords: [blk.slug, blk.category],
          onSelect: () => navigate(`/blocks#${blk.slug}`),
        })),
      },
    ];
  }, [navigate, resolve, ui]);

  const normalizedMobileFilter = mobileFilter.trim().toLowerCase();

  const mobileNavItems = React.useMemo<readonly NavigationDestination<string>[]>(
    () => {
      const matchesFilter = (text: string) =>
        !normalizedMobileFilter ||
        text.toLowerCase().includes(normalizedMobileFilter);

      const pageItems: NavigationDestination<string>[] = [
        { value: "/", label: ui.navHome, section: ui.cmdGroups.pages },
        { value: "/docs/introduction", label: ui.navDocs, section: ui.cmdGroups.pages },
        { value: "/components/button", label: ui.navComponents, section: ui.cmdGroups.pages },
        { value: "/blocks", label: ui.navBlocks, section: ui.cmdGroups.pages },
      ].filter((item) => matchesFilter(String(item.label)));

      const docItems: NavigationDestination<string>[] = DOC_GUIDES.filter((g) =>
        matchesFilter(`${resolve(g.title)} ${g.slug}`),
      ).map((g) => ({
        value: `/docs/${g.slug}`,
        label: resolve(g.title),
        section: ui.navDocs,
      }));

      const blockItems: NavigationDestination<string>[] = BLOCKS_REGISTRY.filter(
        (b) => matchesFilter(`${resolve(b.title)} ${b.slug} ${b.category}`),
      ).map((b) => ({
        value: `/blocks#${b.slug}`,
        label: resolve(b.title),
        section: ui.navBlocks,
      }));

      const componentItems: NavigationDestination<string>[] =
        COMPONENT_CATEGORY_ORDER.flatMap((cat) => {
          const filtered = COMPONENTS_BY_CATEGORY[cat].filter((c) =>
            matchesFilter(`${c.title} ${c.slug} ${resolve(c.subtitle)}`),
          );
          const sectionTitle = `${ui.componentCategories[cat]} (${filtered.length})`;
          return filtered.map((c) => ({
            value: `/components/${c.slug}`,
            label: c.title,
            badgeLabel: c.isNew ? "NEW" : undefined,
            section: sectionTitle,
          }));
        });

      const deduped = new Map<string, NavigationDestination<string>>();
      for (const item of [
        ...pageItems,
        ...docItems,
        ...blockItems,
        ...componentItems,
      ]) {
        if (!deduped.has(item.value)) {
          deduped.set(item.value, item);
        }
      }
      return Array.from(deduped.values());
    },
    [normalizedMobileFilter, resolve, ui],
  );

  const outletCtx = React.useMemo<SiteOutletContext>(
    () => ({
      openStudio: () => setStudioOpen(true),
      openCommandPalette: () => setCommandOpen(true),
    }),
    [],
  );

  return (
    <div id="docs-top" className="m3e-site-root">
      <a href="#main-content" className="docs-skip-link">
        {ui.skipToMain}
      </a>

      <SiteHeader
        onOpenMobileNav={() => setMobileNavOpen(true)}
        onOpenStudio={() => setStudioOpen(true)}
        onOpenCommandPalette={() => setCommandOpen(true)}
      />

      <NavigationDrawer
        variant="modal"
        open={mobileNavOpen}
        onOpenChange={(next) => {
          setMobileNavOpen(next);
          if (!next) setMobileFilter("");
        }}
        aria-label={ui.mobileNavAria}
        headline={
          <SearchBar
            size="sm"
            value={mobileFilter}
            onValueChange={setMobileFilter}
            placeholder={ui.filterComponentsPlaceholder}
            aria-label={ui.filterComponentsPlaceholder}
          />
        }
        items={mobileNavItems}
        value={location.pathname}
        onValueChange={(path) => {
          navigate(path);
          setMobileNavOpen(false);
        }}
        footer={
          <ButtonGroup
            variant="connected"
            size="xs"
            selectionMode="single"
            className="studio-segmented"
            aria-label={ui.languageLabel}
            items={[
              { value: "en-US", label: "EN" },
              { value: "zh-CN", label: "中文" },
              { value: "ja-JP", label: "日本語" },
              { value: "ar-SA", label: "العربية" },
            ]}
            value={[locale]}
            onValueChange={(vals) => {
              const next = vals[0] as M3EBuiltInLocale | undefined;
              if (next) setLocale(next);
            }}
          />
        }
      />

      <ThemeStudioSheet open={studioOpen} onOpenChange={setStudioOpen} />

      <CommandPalette
        open={commandOpen}
        onOpenChange={setCommandOpen}
        enableShortcut
        placeholder={ui.searchPlaceholder}
        groups={commandGroups}
      />

      <div id="main-content" tabIndex={-1} className="m3e-site-main-wrap">
        <Outlet context={outletCtx} />
      </div>

      <footer className="m3e-site-footer">
        <Card variant="filled" className="docs-footer-card">
          <div className="docs-footer__row">
            <div className="docs-footer__brand">
              <MaterialShapeView shape="cookie9Sided" size={28} />
              <div>
                <strong>m3eui v{m3ePkg.version}</strong>
                <div className="docs-footer__sub">
                  Apache-2.0 · Material 3 Expressive · Built on @base-ui/react
                </div>
              </div>
            </div>
            <div className="demo-row" style={{ gap: 6 }}>
              <Button
                size="xs"
                variant="text"
                render={<Link to="/docs/introduction" />}
              >
                {ui.navDocs}
              </Button>
              <Button
                size="xs"
                variant="text"
                render={<Link to="/components/button" />}
              >
                {ui.navComponents}
              </Button>
              <Button size="xs" variant="text" render={<Link to="/blocks" />}>
                {ui.navBlocks}
              </Button>
              <Button
                size="xs"
                variant="text"
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </Button>
              <Button
                size="xs"
                variant="tonal"
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              >
                {ui.backToTop}
              </Button>
            </div>
          </div>
        </Card>
      </footer>
    </div>
  );
}
