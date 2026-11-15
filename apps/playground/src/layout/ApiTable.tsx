import { Chip } from "m3eui";
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
          <div key={api.title} className="m3e-api-card">
            <div className="m3e-api-card__header">
              <h3 className="m3e-api-card__title">{api.title}</h3>
              {api.description && (
                <p className="m3e-api-card__desc">{resolve(api.description)}</p>
              )}
            </div>
            <div className="m3e-api-table-scroll">
              <table className="m3e-api-table">
                <thead>
                  <tr>
                    <th scope="col">{ui.propColName}</th>
                    <th scope="col">{ui.propColDesc}</th>
                    <th scope="col">{ui.propColType}</th>
                    <th scope="col">{ui.propColDefault}</th>
                  </tr>
                </thead>
                <tbody>
                  {api.rows.map((row) => (
                    <tr key={row.name}>
                      <td className="m3e-api-table__prop">
                        <code>{row.name}</code>
                        {row.required && (
                          <Chip size="sm" tone="error" variant="tonal" style={{ marginInlineStart: 6 }}>
                            {ui.propRequired}
                          </Chip>
                        )}
                      </td>
                      <td className="m3e-api-table__desc">
                        {resolve(row.description)}
                      </td>
                      <td className="m3e-api-table__type">
                        <code>{row.type}</code>
                      </td>
                      <td className="m3e-api-table__default">
                        {row.defaultValue ? <code>{row.defaultValue}</code> : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
