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
import { ALL_COMPONENT_DOCS } from "../registry/components";
import { getComponentDesignSpec } from "../registry/design";

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
      ALL_COMPONENT_DOCS.filter(
        (item) =>
          !normalizedFilter ||
          item.title.toLowerCase().includes(normalizedFilter) ||
          item.slug.toLowerCase().includes(normalizedFilter) ||
          resolve(item.subtitle).toLowerCase().includes(normalizedFilter),
      ).map((item) => ({
        value: item.slug,
        label: item.title,
        badgeLabel: item.isNew ? "NEW" : undefined,
      })),
    [normalizedFilter, resolve],
  );

  if (!slug) {
    return <Navigate to="/components/button" replace />;
  }

  const docIndex = ALL_COMPONENT_DOCS.findIndex((item) => item.slug === slug);
  const doc = docIndex >= 0 ? ALL_COMPONENT_DOCS[docIndex] : undefined;

  if (!doc) {
    return <Navigate to="/components/button" replace />;
  }

  const designSpec = getComponentDesignSpec(doc.slug);

  const prevDoc = docIndex > 0 ? ALL_COMPONENT_DOCS[docIndex - 1] : undefined;
  const nextDoc =
    docIndex < ALL_COMPONENT_DOCS.length - 1
      ? ALL_COMPONENT_DOCS[docIndex + 1]
      : undefined;

  const usageTocItems: readonly TocAnchorItem[] = [
    ...doc.scenarios.map((sc) => ({
      id: sc.id,
      label: resolve(sc.title),
    })),
    ...(doc.apis.length > 0 ? [{ id: "api", label: ui.apiHeading }] : []),
  ];

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

  const usageSectionContent = (
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
  );

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
        value={doc.slug}
        onValueChange={(nextSlug) =>
          navigate(`/components/${nextSlug}${tabSuffix}`)
        }
      />

      {/* Center Component Documentation Article */}
      <main className="m3e-doc-article" key={doc.slug}>
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
              key: doc.slug,
              label: doc.title,
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
            <h1 className="m3e-doc-header__title">{doc.title}</h1>
            {doc.isNew && (
              <Chip tone="primary" variant="solid">
                NEW
              </Chip>
            )}
            {doc.primitive?.split(" · ").map((name) => (
              <Chip key={name} tone="neutral" variant="outlined">
                {name}
              </Chip>
            ))}
          </div>
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
        </header>

        {designSpec ? (
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
          {prevDoc ? (
            <Card
              variant="outlined"
              interactive
              render={<Link to={`/components/${prevDoc.slug}${tabSuffix}`} />}
              className="m3e-doc-pager__card-link"
            >
              <span className="m3e-doc-pager__dir">{prevArrow} {ui.prevPage}</span>
              <strong className="m3e-doc-pager__title">{prevDoc.title}</strong>
            </Card>
          ) : (
            <div />
          )}

          {nextDoc ? (
            <Card
              variant="outlined"
              interactive
              render={<Link to={`/components/${nextDoc.slug}${tabSuffix}`} />}
              className="m3e-doc-pager__card-link m3e-doc-pager__card-link--end"
            >
              <span className="m3e-doc-pager__dir">{ui.nextPage} {nextArrow}</span>
              <strong className="m3e-doc-pager__title">{nextDoc.title}</strong>
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
