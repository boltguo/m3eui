import * as React from "react";
import { Link, Navigate, useNavigate, useOutletContext, useParams } from "react-router";
import {
  Breadcrumb,
  Card,
  type NavigationDestination,
  Sidebar,
  useM3EI18n,
} from "m3eui";
import { useCopyResolver, usePlaygroundStrings } from "../i18n";
import { OnThisPage } from "../layout/OnThisPage";
import type { SiteOutletContext } from "../layout/SiteLayout";
import { SiteSectionLinks } from "../layout/SiteSections";
import { DOC_GUIDES } from "../registry/docs";

export function DocsPage() {
  const { slug } = useParams<{ slug?: string }>();
  const navigate = useNavigate();
  const { navOpen, setNavOpen } = useOutletContext<SiteOutletContext>();
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();
  const { direction } = useM3EI18n();
  const prevArrow = direction === "rtl" ? "→" : "←";
  const nextArrow = direction === "rtl" ? "←" : "→";

  const sidebarItems = React.useMemo<readonly NavigationDestination<string>[]>(
    () =>
      DOC_GUIDES.map((g) => ({
        value: g.slug,
        label: resolve(g.title),
        section: ui.navDocs,
      })),
    [resolve, ui.navDocs],
  );

  if (!slug) {
    return <Navigate to="/docs/introduction" replace />;
  }

  const guideIndex = DOC_GUIDES.findIndex((g) => g.slug === slug);
  const guide = guideIndex >= 0 ? DOC_GUIDES[guideIndex] : undefined;

  if (!guide) {
    return <Navigate to="/docs/introduction" replace />;
  }

  const prevGuide = guideIndex > 0 ? DOC_GUIDES[guideIndex - 1] : undefined;
  const nextGuide =
    guideIndex < DOC_GUIDES.length - 1 ? DOC_GUIDES[guideIndex + 1] : undefined;

  const tocItems = guide.sections.map((s) => ({
    id: s.id,
    label: resolve(s.heading),
  }));

  return (
    <div className="m3e-doc-layout">
      <Sidebar
        className="m3e-playground-sidebar"
        open={navOpen}
        onOpenChange={setNavOpen}
        footer={<SiteSectionLinks />}
        aria-label={ui.navDocs}
        items={sidebarItems}
        value={guide.slug}
        onValueChange={(nextSlug) => navigate(`/docs/${nextSlug}`)}
      />

      <main className="m3e-doc-article">
        <Breadcrumb
          items={[
            {
              key: "home",
              label: ui.navHome,
              render: <Link to="/" />,
            },
            {
              key: "docs",
              label: ui.navDocs,
              render: <Link to="/docs/introduction" />,
            },
            {
              key: guide.slug,
              label: resolve(guide.title),
            },
          ]}
        />

        <header className="m3e-doc-header">
          <h1 className="m3e-doc-header__title">{resolve(guide.title)}</h1>
          <p className="m3e-doc-header__subtitle">{resolve(guide.subtitle)}</p>
        </header>

        {guide.render()}

        <nav className="m3e-doc-pager" aria-label={ui.docsPaginationAria}>
          {prevGuide ? (
            <Card
              variant="outlined"
              interactive
              render={<Link to={`/docs/${prevGuide.slug}`} />}
              className="m3e-doc-pager__card-link"
            >
              <span className="m3e-doc-pager__dir">{prevArrow} {ui.prevPage}</span>
              <strong className="m3e-doc-pager__title">
                {resolve(prevGuide.title)}
              </strong>
            </Card>
          ) : (
            <div />
          )}

          {nextGuide ? (
            <Card
              variant="outlined"
              interactive
              render={<Link to={`/docs/${nextGuide.slug}`} />}
              className="m3e-doc-pager__card-link m3e-doc-pager__card-link--end"
            >
              <span className="m3e-doc-pager__dir">{ui.nextPage} {nextArrow}</span>
              <strong className="m3e-doc-pager__title">
                {resolve(nextGuide.title)}
              </strong>
            </Card>
          ) : (
            <div />
          )}
        </nav>
      </main>

      <OnThisPage items={tocItems} />
    </div>
  );
}
