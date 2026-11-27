import * as React from "react";
import {
  Link,
  Navigate,
  useNavigate,
  useOutletContext,
  useParams,
  useSearchParams,
} from "react-router";
import {
  Breadcrumb,
  Card,
  Chip,
  CopyButton,
  NavigationRail,
  type NavigationDestination,
  SearchBar,
  Skeleton,
  Tab,
  Tabs,
  TabsList,
  TabsPanel,
  useM3EI18n,
  useM3EToast,
} from "m3eui";
import { useCopyResolver, usePlaygroundStrings } from "../i18n";
import { ApiTableSection } from "../layout/ApiTable";
import { CodeBlock } from "../layout/CodeBlock";
import { DemoBox } from "../layout/DemoBox";
import { DesignSpecView } from "../layout/DesignSpecView";
import { OnThisPage, type TocAnchorItem } from "../layout/OnThisPage";
import type { SiteOutletContext } from "../layout/SiteLayout";
import { SiteSectionLinks } from "../layout/SiteSections";
import { COMPONENT_CATALOG } from "../registry/catalog";
import { loadComponentDesignSpec, loadComponentDoc } from "../registry/loaders";
import type { ComponentDesignSpec, ComponentDocSpec } from "../registry/types";

type ComponentDocTab = "usage" | "design";

export function ComponentsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { navOpen, setNavOpen } = useOutletContext<SiteOutletContext>();
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const { direction } = useM3EI18n();
  const { toast } = useM3EToast();

  const [filterQuery, setFilterQuery] = React.useState("");
  const [loadedState, setLoadedState] = React.useState<{
    readonly slug: string;
    readonly doc: ComponentDocSpec | undefined;
    readonly designSpec: ComponentDesignSpec | undefined;
  } | null>(null);

  const activeTab: ComponentDocTab =
    searchParams.get("tab") === "design" ? "design" : "usage";

  const selectTab = React.useCallback(
    (next: ComponentDocTab) => {
      setSearchParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          if (next === "design") {
            updated.set("tab", "design");
          } else {
            updated.delete("tab");
          }
          return updated;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const normalizedFilter = filterQuery.trim().toLowerCase();

  const sidebarItems = React.useMemo<readonly NavigationDestination<string>[]>(
    () =>
      COMPONENT_CATALOG.filter(
        (item) =>
          !normalizedFilter ||
          item.title.toLowerCase().includes(normalizedFilter) ||
          item.slug.toLowerCase().includes(normalizedFilter) ||
          (item.keywords?.some((kw) =>
            kw.toLowerCase().includes(normalizedFilter),
          ) ??
            false),
      ).map((item) => ({
        value: item.slug,
        label: item.title,
        badgeLabel: item.isNew ? "NEW" : undefined,
      })),
    [normalizedFilter],
  );

  const catalogIndex = slug
    ? COMPONENT_CATALOG.findIndex((item) => item.slug === slug)
    : -1;
  const catalogEntry =
    catalogIndex >= 0 ? COMPONENT_CATALOG[catalogIndex] : undefined;

  React.useEffect(() => {
    if (!slug || !catalogEntry) return undefined;
    let cancelled = false;
    Promise.all([loadComponentDoc(slug), loadComponentDesignSpec(slug)]).then(
      ([doc, designSpec]) => {
        if (!cancelled) {
          setLoadedState({ slug, doc, designSpec });
        }
      },
    );
    return () => {
      cancelled = true;
    };
  }, [slug, catalogEntry]);

  if (!slug || !catalogEntry) {
    return <Navigate to="/components/button" replace />;
  }

  const prevEntry =
    catalogIndex > 0 ? COMPONENT_CATALOG[catalogIndex - 1] : undefined;
  const nextEntry =
    catalogIndex < COMPONENT_CATALOG.length - 1
      ? COMPONENT_CATALOG[catalogIndex + 1]
      : undefined;

  const isDocReady = loadedState?.slug === slug && loadedState.doc !== undefined;
  const doc = isDocReady ? loadedState.doc : undefined;
  const designSpec = isDocReady ? loadedState.designSpec : undefined;

  const usageTocItems: readonly TocAnchorItem[] = doc
    ? [
        ...doc.scenarios.map((sc) => ({
          id: sc.id,
          label: resolve(sc.title),
        })),
        ...(doc.apis.length > 0 ? [{ id: "api", label: ui.apiHeading }] : []),
      ]
    : [];

  const designTocItems: readonly TocAnchorItem[] = [
    { id: "design-provenance", label: ui.designToc.provenance },
    { id: "design-rationale", label: ui.designToc.rationale },
    { id: "design-geometry", label: ui.designToc.geometry },
    { id: "design-invariants", label: ui.designToc.invariants },
    { id: "design-porting", label: ui.designToc.porting },
    { id: "design-references", label: ui.designToc.references },
  ];

  const tocItems: readonly TocAnchorItem[] =
    activeTab === "design" && designSpec ? designTocItems : usageTocItems;

  const prevArrow = direction === "rtl" ? "→" : "←";
  const nextArrow = direction === "rtl" ? "←" : "→";

  const tabSuffix = activeTab === "design" ? "?tab=design" : "";

  const usageSectionContent = doc ? (
    <div className="m3e-doc-tabpanel__inner">
      <section
        aria-labelledby="examples-heading"
        className="m3e-examples-section"
      >
        <h2 id="examples-heading" className="m3e-section-heading">
          {ui.examplesHeading}
        </h2>
        <div className="m3e-examples-stack">
          {doc.scenarios.map((scenario, idx) => (
            <DemoBox
              key={scenario.id}
              scenario={scenario}
              defaultExpanded={idx === 0 && doc.scenarios.length === 1}
            />
          ))}
        </div>
      </section>

      <ApiTableSection apis={doc.apis} />
    </div>
  ) : null;

  return (
    <div className="m3e-doc-layout">
      <NavigationRail
        expanded
        modal="auto"
        density="compact"
        className="m3e-playground-sidebar"
        open={navOpen}
        onOpenChange={setNavOpen}
        footer={<SiteSectionLinks />}
        aria-label={ui.navComponents}
        header={
          <SearchBar
            size="sm"
            value={filterQuery}
            onValueChange={setFilterQuery}
            placeholder={ui.filterComponentsPlaceholder}
            aria-label={ui.filterComponentsPlaceholder}
          />
        }
        items={sidebarItems}
        value={catalogEntry.slug}
        onValueChange={(nextSlug) =>
          navigate(`/components/${nextSlug}${tabSuffix}`)
        }
      />

      {/* Center Component Documentation Article */}
      <main className="m3e-doc-article" key={catalogEntry.slug}>
        <Breadcrumb
          items={[
            {
              key: "home",
              label: ui.navHome,
              render: <Link to="/" />,
            },
            {
              key: "components",
              label: ui.navComponents,
              render: <Link to="/components/button" />,
            },
            {
              key: catalogEntry.slug,
              label: catalogEntry.title,
            },
          ]}
        />

        <header
          className={
            designSpec
              ? "m3e-doc-header m3e-doc-header--with-tabs"
              : "m3e-doc-header"
          }
        >
          <div className="demo-row" style={{ gap: 10 }}>
            <h1 className="m3e-doc-header__title">{catalogEntry.title}</h1>
            {catalogEntry.isNew && (
              <Chip tone="primary" variant="solid">
                NEW
              </Chip>
            )}
            {doc?.primitive?.split(" · ").map((name) => (
              <Chip key={name} tone="neutral" variant="outlined">
                {name}
              </Chip>
            ))}
          </div>
          {doc ? (
            <>
              <p className="m3e-doc-header__subtitle">{resolve(doc.subtitle)}</p>

              <div className="m3e-import-banner">
                <div className="m3e-import-banner__code">
                  <CodeBlock code={doc.importStatement} lang="tsx" compact />
                </div>
                <CopyButton
                  value={doc.importStatement}
                  variant="ghost"
                  label={ui.copyImportAria(doc.title)}
                  copiedLabel={ui.cardCopied}
                  onCopy={() => toast({ title: ui.cardCopiedCodeToast(doc.title) })}
                />
              </div>
            </>
          ) : null}
        </header>

        {!doc ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Skeleton variant="rounded" width="100%" height={56} />
            <Skeleton variant="rounded" width="100%" height={220} />
          </div>
        ) : designSpec ? (
          <Tabs
            variant="primary"
            className="m3e-doc-tabs"
            value={activeTab}
            onValueChange={(next) => selectTab(next as ComponentDocTab)}
          >
            <TabsList
              activateOnFocus={false}
              aria-label={ui.sectionsAria(doc.title)}
            >
              <Tab value="usage">{ui.docTabUsage}</Tab>
              <Tab value="design">
                <span className="m3e-doc-tab__inner">
                  <span>{ui.docTabDesign}</span>
                  <Chip
                    size="sm"
                    tone={
                      designSpec.provenance === "official-m3e"
                        ? "primary"
                        : "secondary"
                    }
                    variant="tonal"
                  >
                    {designSpec.provenance === "official-m3e" ? "M3E" : "Web"}
                  </Chip>
                </span>
              </Tab>
            </TabsList>

            <TabsPanel value="usage">
              {usageSectionContent}
            </TabsPanel>

            <TabsPanel value="design">
              <DesignSpecView doc={doc} spec={designSpec} />
            </TabsPanel>
          </Tabs>
        ) : (
          usageSectionContent
        )}

        <nav className="m3e-doc-pager" aria-label={ui.componentPaginationAria}>
          {prevEntry ? (
            <Card
              variant="outlined"
              interactive
              render={<Link to={`/components/${prevEntry.slug}${tabSuffix}`} />}
              className="m3e-doc-pager__card-link"
            >
              <span className="m3e-doc-pager__dir">{prevArrow} {ui.prevPage}</span>
              <strong className="m3e-doc-pager__title">{prevEntry.title}</strong>
            </Card>
          ) : (
            <div />
          )}

          {nextEntry ? (
            <Card
              variant="outlined"
              interactive
              render={<Link to={`/components/${nextEntry.slug}${tabSuffix}`} />}
              className="m3e-doc-pager__card-link m3e-doc-pager__card-link--end"
            >
              <span className="m3e-doc-pager__dir">{ui.nextPage} {nextArrow}</span>
              <strong className="m3e-doc-pager__title">{nextEntry.title}</strong>
            </Card>
          ) : (
            <div />
          )}
        </nav>
      </main>

      {/* Right Sticky Anchor Rail */}
      <OnThisPage items={tocItems} />
    </div>
  );
}
