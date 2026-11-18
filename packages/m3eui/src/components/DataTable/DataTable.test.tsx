import { act } from "react";
import { describe, expect, it } from "vitest";
import { PausedWrapper, setupDomTest } from "../../__tests__/domHarness.js";
import { M3EProvider } from "../../context/M3EProvider.js";
import { jaJPMessages } from "../../i18n/index.js";
import { DataTable } from "./DataTable.js";

describe("DataTable", () => {
  const dom = setupDomTest();

  it("manages DataTable aria-sort strictly on active column and localizes status announcements", () => {
    const rows = [
      { id: "1", version: "v10", latency: 42 },
      { id: "2", version: "v2", latency: 18 },
      { id: "3", version: "v1", latency: 95 },
    ];

    act(() => {
      dom.root.render(
        <PausedWrapper locale="zh-CN">
          <DataTable
            caption="版本性能监控表"
            rows={rows}
            getRowKey={(r) => r.id}
            columns={[
              {
                id: "version",
                header: "版本号",
                sortable: true,
                sortAccessor: (r) => r.version,
                cell: (r) => r.version,
              },
              {
                id: "latency",
                header: "延迟 (ms)",
                sortable: true,
                align: "end",
                sortAccessor: (r) => r.latency,
                cell: (r) => r.latency,
              },
            ]}
          />
        </PausedWrapper>,
      );
    });

    const headers = dom.container.querySelectorAll<HTMLTableCellElement>(
      "thead th[scope='col']",
    );
    expect(headers[0]!.hasAttribute("aria-sort")).toBe(false);
    expect(headers[1]!.hasAttribute("aria-sort")).toBe(false);

    const versionSortBtn = headers[0]!.querySelector<HTMLButtonElement>(
      "button.m3e-data-table__sort-btn",
    );
    act(() => {
      versionSortBtn!.click();
    });
    expect(headers[0]!.getAttribute("aria-sort")).toBe("ascending");
    expect(headers[1]!.hasAttribute("aria-sort")).toBe(false);

    const rowHeadersAsc = Array.from(
      dom.container.querySelectorAll("tbody th[scope='row']"),
    ).map((el) => el.textContent);
    expect(rowHeadersAsc).toEqual(["v1", "v2", "v10"]);

    act(() => {
      versionSortBtn!.click();
    });
    expect(headers[0]!.getAttribute("aria-sort")).toBe("descending");
    const status = dom.container.querySelector('[role="status"]');
    expect(status?.textContent).toContain("已按版本号降序排列");
  });

  it("handles select-all checkbox, empty-state localized fallback, sticky columns, and expandable rows", () => {
    let selected: string[] = [];
    act(() => {
      dom.root.render(
        <div>
          <div data-testid="empty-tbl">
            <PausedWrapper locale="ja-JP">
              <DataTable
                caption="空テーブル"
                rows={[]}
                getRowKey={(r: { id: string }) => r.id}
                columns={[{ id: "id", header: "ID", cell: (r) => r.id }]}
              />
            </PausedWrapper>
          </div>
          <div data-testid="sel-tbl">
            <PausedWrapper locale="en-US">
              <DataTable
                caption="Selectable"
                selectable
                onSelectedRowKeysChange={(k) => {
                  selected = [...k];
                }}
                rows={[
                  { id: "r1", name: "Row 1", region: "ap-east" },
                  { id: "r2", name: "Row 2", region: "eu-central" },
                ]}
                getRowKey={(r) => r.id}
                columns={[
                  { id: "name", header: "Name", sticky: "start", width: 160, cell: (r) => r.name },
                  { id: "region", header: "Region", sticky: "end", cell: (r) => r.region },
                ]}
                renderExpandedRow={(row) => (
                  <div data-testid={`expanded-${row.id}`}>Details: {row.region}</div>
                )}
              />
            </PausedWrapper>
          </div>
        </div>,
      );
    });

    expect(
      dom.container.querySelector('[data-testid="empty-tbl"]')?.textContent,
    ).toContain(jaJPMessages["dataTable.empty"]);

    const selectAll = dom.container.querySelector<HTMLElement>(
      '[data-testid="sel-tbl"] [aria-label="Select all rows"]',
    );
    expect(selectAll).not.toBeNull();
    act(() => {
      selectAll!.click();
    });
    expect(selected).toEqual(["r1", "r2"]);

    expect(dom.container.querySelector('th[data-sticky="start"]')).not.toBeNull();
    expect(dom.container.querySelector('td[data-sticky="end"]')).not.toBeNull();

    const expandBtn = dom.container.querySelector<HTMLButtonElement>(
      ".m3e-data-table__expand-btn",
    );
    expect(expandBtn?.getAttribute("aria-expanded")).toBe("false");
    act(() => {
      expandBtn?.click();
    });
    expect(
      dom.container.querySelector('[data-testid="expanded-r1"]')?.textContent,
    ).toContain("ap-east");
  });

  it("preserves cross-page selection keys and accumulates sticky start offsets cleanly", () => {
    let selectedRows = ["r1", "r99"];

    act(() => {
      dom.root.render(
        <M3EProvider syncDocumentRoot={false} initialDirection="rtl" locale="ar-SA">
          <DataTable
            caption="Users"
            selectable
            selectedRowKeys={selectedRows}
            onSelectedRowKeysChange={(next) => {
              selectedRows = next;
            }}
            columns={[
              { id: "id", header: "ID", width: 80, sticky: "start", cell: (r) => r.id },
              { id: "name", header: "Name", width: 140, sticky: "start", cell: (r) => r.name },
            ]}
            rows={[
              { id: "r1", name: "Ada" },
              { id: "r2", name: "Grace" },
            ]}
            getRowKey={(r) => r.id}
          />
        </M3EProvider>,
      );
    });

    const selectAllCheckbox = dom.container.querySelector<HTMLElement>(
      "thead .m3e-checkbox",
    )!;
    act(() => {
      selectAllCheckbox.click();
    });
    expect(selectedRows).toEqual(expect.arrayContaining(["r99", "r1", "r2"]));

    const headerCells = dom.container.querySelectorAll<HTMLTableCellElement>("thead th");
    expect(headerCells[1]?.style.insetInlineStart).toBe("48px");
    expect(headerCells[2]?.style.insetInlineStart).toBe("128px");
  });
});
