import { Chip, DataTable } from "m3eui";
import { useCopyResolver, usePlaygroundStrings } from "../i18n";
import type { ApiTableSpec } from "../registry/types";

export function ApiTableSection({
  apis,
}: {
  readonly apis: readonly ApiTableSpec[];
}) {
  const ui = usePlaygroundStrings();
  const resolve = useCopyResolver();

  if (apis.length === 0) return null;

  return (
    <section id="api" tabIndex={-1} className="m3e-api-section">
      <h2 className="m3e-section-heading">{ui.apiHeading}</h2>
      <div className="m3e-api-stack">
        {apis.map((api) => (
            <DataTable
              key={api.title}
              className="m3e-api-card"
              toolbar={
                <div>
                  <h3 className="m3e-api-card__title">{api.title}</h3>
                  {api.description && (
                    <p className="m3e-api-card__desc">{resolve(api.description)}</p>
                  )}
                </div>
              }
              caption={api.title}
              hideCaption
              density="compact"
              rows={api.rows}
              getRowKey={(row) => row.name}
              columns={[
                {
                  id: "prop",
                  header: ui.propColName,
                  isRowHeader: true,
                  cell: (row) => (
                    <>
                      <code>{row.name}</code>
                      {row.required && (
                        <Chip size="sm" tone="error" variant="tonal" style={{ marginInlineStart: 6 }}>
                          {ui.propRequired}
                        </Chip>
                      )}
                    </>
                  ),
                },
                { id: "desc", header: ui.propColDesc, cell: (row) => resolve(row.description) },
                { id: "type", header: ui.propColType, cell: (row) => <code>{row.type}</code> },
                {
                  id: "default",
                  header: ui.propColDefault,
                  cell: (row) => (row.defaultValue ? <code>{row.defaultValue}</code> : "—"),
                },
              ]}
            />
        ))}
      </div>
    </section>
  );
}
