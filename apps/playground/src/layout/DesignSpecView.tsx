import * as React from "react";
import { Button, Card, Chip, DataTable, useM3EToast } from "m3eui";
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

function DesignContractTableCard({
  table,
}: {
  readonly table: DesignContractTable;
}) {
  return (
    <DataTable
        className="m3e-api-card"
        toolbar={
          <div>
            <h3 className="m3e-api-card__title">{table.title}</h3>
            {table.caption && <p className="m3e-api-card__desc">{table.caption}</p>}
          </div>
        }
        caption={table.title}
        hideCaption
        density="compact"
        rows={table.rows}
        getRowKey={(_, i) => `${table.id}-${i}`}
        columns={table.columns.map((col, c) => ({
          id: `c${c}`,
          header: col,
          isRowHeader: c === 0,
          sticky: c === 0 ? ("start" as const) : undefined,
          cell: (row: readonly string[]) => (c === 0 ? <code>{row[c]}</code> : row[c]),
        }))}
      />
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
                  Token Contract (<code>src/tokens</code>)
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
