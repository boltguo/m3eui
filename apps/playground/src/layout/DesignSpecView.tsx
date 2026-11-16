import * as React from "react";
import { Button, Card, Chip, IconButton, useM3EToast } from "m3eui";
import { usePlaygroundStrings } from "../i18n";
import { serializeDesignSpecToMarkdown } from "../registry/design";
import type {
  ComponentDesignSpec,
  ComponentDocSpec,
  DesignContractTable,
  DesignReferenceKind,
} from "../registry/types";
import { CheckTinyIcon, CopyIcon, ExternalLinkIcon, SparkleIcon } from "./Icons";

const REF_KIND_LABELS: Readonly<Record<DesignReferenceKind, string>> = {
  "m3-spec": "M3 Guidelines",
  "aosp-source": "AOSP Source",
  "aria-apg": "WAI-ARIA APG",
  "web-standard": "Web Standard",
  "base-ui": "Base UI",
};

function ChevronInlineIcon({
  direction,
}: {
  readonly direction: "left" | "right";
}) {
  return (
    <svg
      width={15}
      height={15}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {direction === "left" ? (
        <polyline points="15 18 9 12 15 6" />
      ) : (
        <polyline points="9 18 15 12 9 6" />
      )}
    </svg>
  );
}

function DesignContractTableCard({
  slug,
  table,
}: {
  readonly slug: string;
  readonly table: DesignContractTable;
}) {
  const headingId = `design-table-${slug}-${table.id}`;
  const scrollerRef = React.useRef<HTMLDivElement>(null);
  const [scrollState, setScrollState] = React.useState({
    hasOverflow: false,
    canScrollLeft: false,
    canScrollRight: false,
  });

  const syncScrollState = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const maxScroll = Math.max(0, el.scrollWidth - el.clientWidth);
    const hasOverflow = maxScroll > 2;
    const canScrollLeft = hasOverflow && el.scrollLeft > 2;
    const canScrollRight = hasOverflow && el.scrollLeft < maxScroll - 2;
    setScrollState((prev) =>
      prev.hasOverflow === hasOverflow &&
      prev.canScrollLeft === canScrollLeft &&
      prev.canScrollRight === canScrollRight
        ? prev
        : { hasOverflow, canScrollLeft, canScrollRight },
    );
  }, []);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    syncScrollState();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => syncScrollState());
    ro.observe(el);
    if (el.firstElementChild) {
      ro.observe(el.firstElementChild);
    }
    return () => ro.disconnect();
  }, [syncScrollState, table]);

  const scrollHorizontal = (direction: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = Math.max(200, Math.round(el.clientWidth * 0.55));
    el.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="m3e-api-card m3e-design-table-card">
      <div className="m3e-api-card__header m3e-design-table-header">
        <div className="m3e-design-table-header__copy">
          <h3 id={headingId} className="m3e-api-card__title">
            {table.title}
          </h3>
          {table.caption && (
            <p className="m3e-api-card__desc">{table.caption}</p>
          )}
        </div>

        {scrollState.hasOverflow && (
          <div
            className="m3e-design-table-header__controls"
            role="group"
            aria-label={`Scroll ${table.title} horizontally`}
          >
            <IconButton
              size="xs"
              variant="standard"
              disabled={!scrollState.canScrollLeft}
              aria-label="Scroll table left"
              icon={<ChevronInlineIcon direction="left" />}
              onClick={() => scrollHorizontal(-1)}
            />
            <IconButton
              size="xs"
              variant="standard"
              disabled={!scrollState.canScrollRight}
              aria-label="Scroll table right"
              icon={<ChevronInlineIcon direction="right" />}
              onClick={() => scrollHorizontal(1)}
            />
          </div>
        )}
      </div>

      <div
        ref={scrollerRef}
        tabIndex={0}
        role="region"
        aria-labelledby={headingId}
        onScroll={syncScrollState}
        data-scrolled-left={scrollState.canScrollLeft ? "" : undefined}
        className="m3e-api-table-scroll m3e-design-table-region"
      >
        <table className="m3e-api-table m3e-design-table">
          <thead>
            <tr>
              {table.columns.map((col) => (
                <th key={col} scope="col">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, rowIdx) => (
              <tr key={`${table.id}-r-${rowIdx}`}>
                {row.map((cell, cellIdx) =>
                  cellIdx === 0 ? (
                    <th
                      key={`${table.id}-c-${rowIdx}-${cellIdx}`}
                      scope="row"
                      className="m3e-design-table__key"
                    >
                      <code>{cell}</code>
                    </th>
                  ) : (
                    <td
                      key={`${table.id}-c-${rowIdx}-${cellIdx}`}
                      data-prose={cell.length > 28 ? "" : undefined}
                      className="m3e-design-table__cell"
                    >
                      {cell}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function DesignSpecView({
  doc,
  spec,
}: {
  readonly doc: ComponentDocSpec;
  readonly spec: ComponentDesignSpec;
}) {
  const ui = usePlaygroundStrings();
  const { toast } = useM3EToast();
  const [copiedSpec, setCopiedSpec] = React.useState(false);

  const handleCopyMarkdown = async () => {
    const md = serializeDesignSpecToMarkdown(doc, spec);
    try {
      await navigator.clipboard.writeText(md);
    } catch {
      // Clipboard fallback handled by toast confirmation
    }
    setCopiedSpec(true);
    toast({ title: ui.copiedDesignSpecToast(doc.title) });
    window.setTimeout(() => setCopiedSpec(false), 1800);
  };

  const isOfficial = spec.provenance === "official-m3e";

  return (
    <div className="m3e-design-view" lang="en" dir="ltr">
      {/* 1. Provenance & AI Blueprint Banner */}
      <section id="design-provenance" tabIndex={-1} className="m3e-design-section">
        <Card variant="filled" className="m3e-design-provenance-card">
          <div className="m3e-design-provenance__top">
            <div className="m3e-design-provenance__badges">
              <Chip
                tone={isOfficial ? "primary" : "tertiary"}
                variant="solid"
                icon={<SparkleIcon size={13} />}
              >
                {isOfficial
                  ? "Official M3E Specification"
                  : "M3E Web Extrapolation"}
              </Chip>
              <Chip tone="secondary" variant="tonal">
                Units: px · dp · pt · lp
              </Chip>
            </div>

            <Button
              size="xs"
              variant="tonal"
              leadingIcon={copiedSpec ? <CheckTinyIcon /> : <CopyIcon />}
              onClick={handleCopyMarkdown}
            >
              {copiedSpec ? "Copied Spec Markdown" : "Copy Spec for AI (.md)"}
            </Button>
          </div>

          <p className="m3e-design-provenance__summary">
            {spec.provenanceSummary}
          </p>

          <div className="m3e-design-meta-grid">
            {spec.tokenSources.length > 0 && (
              <div className="m3e-design-meta-group">
                <span className="m3e-design-meta-label">
                  Token Contract (<code>m3eui/tokens</code>)
                </span>
                <div className="m3e-design-code-chips">
                  {spec.tokenSources.map((src) => (
                    <code key={src} className="m3e-design-code-chip">
                      {src}
                    </code>
                  ))}
                </div>
              </div>
            )}

            {spec.aospSources && spec.aospSources.length > 0 && (
              <div className="m3e-design-meta-group">
                <span className="m3e-design-meta-label">
                  AOSP Compose Canonical Files
                </span>
                <div className="m3e-design-code-chips">
                  {spec.aospSources.map((src) => (
                    <code
                      key={src}
                      className="m3e-design-code-chip m3e-design-code-chip--aosp"
                    >
                      {src}
                    </code>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>
      </section>

      {/* 2. Inspiration & Design Rationale */}
      <section
        id="design-rationale"
        tabIndex={-1}
        aria-labelledby="design-rationale-heading"
        className="m3e-design-section"
      >
        <h2 id="design-rationale-heading" className="m3e-section-heading">
          Inspiration & Design Rationale
        </h2>
        <div className="m3e-design-rationale-grid">
          {spec.inspirationAndRationale.map((item) => (
            <div key={item.title} className="m3e-design-rationale-card">
              <h3 className="m3e-design-rationale__title">{item.title}</h3>
              <p className="m3e-design-rationale__body">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Platform-Agnostic Geometry & Motion Contract */}
      <section
        id="design-geometry"
        tabIndex={-1}
        aria-labelledby="design-geometry-heading"
        className="m3e-design-section"
      >
        <h2 id="design-geometry-heading" className="m3e-section-heading">
          Geometry & Motion Contract
        </h2>
        <div className="m3e-api-stack">
          {spec.geometryAndMotionTables.map((table) => (
            <DesignContractTableCard
              key={table.id}
              slug={doc.slug}
              table={table}
            />
          ))}
        </div>
      </section>

      {/* 4. Token, BiDi & Accessibility Invariants */}
      <section
        id="design-invariants"
        tabIndex={-1}
        aria-labelledby="design-invariants-heading"
        className="m3e-design-section"
      >
        <h2 id="design-invariants-heading" className="m3e-section-heading">
          Token, BiDi & Accessibility Invariants
        </h2>
        <div className="m3e-design-invariants-box">
          <ul className="m3e-design-invariants-list">
            {spec.invariants.map((inv, idx) => (
              <li key={idx}>{inv}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* 5. Cross-Language & AI Porting Blueprint */}
      <section
        id="design-porting"
        tabIndex={-1}
        aria-labelledby="design-porting-heading"
        className="m3e-design-section"
      >
        <h2 id="design-porting-heading" className="m3e-section-heading">
          Cross-Language Porting Blueprint
        </h2>
        <div className="m3e-design-porting-grid">
          {spec.crossPlatformNotes.map((note) => (
            <div key={note.target} className="m3e-design-porting-card">
              <div className="m3e-design-porting__target">{note.target}</div>
              <p className="m3e-design-porting__body">{note.guidance}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Authoritative References */}
      <section
        id="design-references"
        tabIndex={-1}
        aria-labelledby="design-references-heading"
        className="m3e-design-section"
      >
        <h2 id="design-references-heading" className="m3e-section-heading">
          Authoritative References & Sources
        </h2>
        <div className="m3e-design-ref-grid">
          {spec.references.map((ref) => (
            <a
              key={ref.url + ref.label}
              href={ref.url}
              target="_blank"
              rel="noopener noreferrer"
              className="m3e-design-ref-card"
            >
              <div className="m3e-design-ref__top">
                <Chip size="sm" tone="secondary" variant="tonal">
                  {REF_KIND_LABELS[ref.kind]}
                </Chip>
                <ExternalLinkIcon size={14} />
              </div>
              <strong className="m3e-design-ref__title">{ref.label}</strong>
              {ref.note && (
                <span className="m3e-design-ref__note">{ref.note}</span>
              )}
              <span className="m3e-design-ref__url">{ref.url}</span>
            </a>
          ))}
        </div>
      </section>
    </div>
  );
}
