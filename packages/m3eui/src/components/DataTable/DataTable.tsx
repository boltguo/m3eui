"use client";

import * as React from "react";
import { DATA_TABLE_TOKENS } from "../../tokens/topology.js";
import { useM3EI18n } from "../../context/M3EContext.js";
import { SkeletonBase } from "../../internal/skeletonBase.js";
import { Checkbox } from "../Checkbox/Checkbox.js";
import { useIsoLayoutEffect } from "../../internal/useIsoLayoutEffect.js";

export type SortDirection = "ascending" | "descending";

export interface M3EDataTableColumn<Row> {
  readonly id: string;
  readonly header: React.ReactNode;
  readonly headerLabel?: string;
  readonly align?: "start" | "center" | "end";
  readonly width?: number | string;
  readonly sticky?: "start" | "end";
  readonly sortable?: boolean;
  readonly isRowHeader?: boolean;
  readonly sortAccessor?: (row: Row) => string | number;
  readonly cell: (row: Row, index: number) => React.ReactNode;
}

export interface M3EDataTableSortState {
  readonly columnId: string;
  readonly direction: SortDirection;
}

export interface M3EDataTableProps<Row> {
  readonly caption: React.ReactNode;
  readonly hideCaption?: boolean;
  readonly columns: readonly M3EDataTableColumn<Row>[];
  readonly rows: readonly Row[];
  readonly getRowKey: (row: Row, index: number) => string;
  readonly sort?: M3EDataTableSortState | null;
  readonly defaultSort?: M3EDataTableSortState | null;
  readonly onSortChange?: (next: M3EDataTableSortState) => void;
  readonly selectable?: boolean;
  readonly selectedRowKeys?: readonly string[];
  readonly defaultSelectedRowKeys?: readonly string[];
  readonly onSelectedRowKeysChange?: (keys: string[]) => void;
  readonly renderExpandedRow?: (row: Row, index: number) => React.ReactNode;
  readonly expandedRowKeys?: readonly string[];
  readonly defaultExpandedRowKeys?: readonly string[];
  readonly onExpandedRowKeysChange?: (keys: string[]) => void;
  readonly density?: "comfortable" | "compact";
  readonly stickyHeader?: boolean;
  readonly loading?: boolean;
  readonly loadingRows?: number;
  readonly toolbar?: React.ReactNode;
  readonly footer?: React.ReactNode;
  readonly emptyMessage?: React.ReactNode;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

function SortArrowSvg({
  active,
  direction,
}: {
  readonly active: boolean;
  readonly direction: SortDirection;
}) {
  return (
    <svg
      width={14}
      height={14}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="m3e-data-table__sort-icon"
      data-active={active ? "" : undefined}
      style={{
        rotate: active && direction === "descending" ? "180deg" : "0deg",
      }}
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function ExpandChevronSvg({ expanded }: { readonly expanded: boolean }) {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      style={{
        rotate: expanded ? "90deg" : "0deg",
        transition: "rotate 160ms ease-out",
      }}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

export function DataTable<Row>({
  caption,
  hideCaption = false,
  columns,
  rows,
  getRowKey,
  sort: controlledSort,
  defaultSort = null,
  onSortChange,
  selectable = false,
  selectedRowKeys: controlledSelectedKeys,
  defaultSelectedRowKeys = [],
  onSelectedRowKeysChange,
  renderExpandedRow,
  expandedRowKeys: controlledExpandedKeys,
  defaultExpandedRowKeys = [],
  onExpandedRowKeysChange,
  density = "comfortable",
  stickyHeader = false,
  loading = false,
  loadingRows = 4,
  toolbar,
  footer,
  emptyMessage,
  className,
  style,
}: M3EDataTableProps<Row>): React.JSX.Element {
  const { locale, t } = useM3EI18n();
  const resolvedEmptyMessage = emptyMessage ?? t("dataTable.empty");
  const collator = React.useMemo(
    () => new Intl.Collator(locale, { numeric: true, sensitivity: "base" }),
    [locale],
  );
  const captionId = React.useId();

  const [uncontrolledSort, setUncontrolledSort] =
    React.useState<M3EDataTableSortState | null>(defaultSort);
  const activeSort =
    controlledSort !== undefined ? controlledSort : uncontrolledSort;

  const [announcement, setAnnouncement] = React.useState<string>("");

  const [uncontrolledSelected, setUncontrolledSelected] = React.useState<
    readonly string[]
  >(defaultSelectedRowKeys);
  const selectedKeys = controlledSelectedKeys ?? uncontrolledSelected;

  const [uncontrolledExpanded, setUncontrolledExpanded] = React.useState<
    readonly string[]
  >(defaultExpandedRowKeys);
  const expandedKeys = controlledExpandedKeys ?? uncontrolledExpanded;
  const expandedSet = React.useMemo(
    () => new Set(expandedKeys),
    [expandedKeys],
  );
  const expandable = Boolean(renderExpandedRow);

  const commitExpandedKeys = (next: string[]) => {
    if (controlledExpandedKeys === undefined) {
      setUncontrolledExpanded(next);
    }
    onExpandedRowKeysChange?.(next);
  };

  const sortedRows = React.useMemo(() => {
    if (!activeSort) return rows;
    const col = columns.find((c) => c.id === activeSort.columnId);
    if (!col || !col.sortable || !col.sortAccessor) return rows;
    const accessor = col.sortAccessor;
    const sign = activeSort.direction === "ascending" ? 1 : -1;

    return [...rows].sort((a, b) => {
      const va = accessor(a);
      const vb = accessor(b);
      if (typeof va === "number" && typeof vb === "number") {
        return (va - vb) * sign;
      }
      return collator.compare(String(va), String(vb)) * sign;
    });
  }, [rows, columns, activeSort, collator]);

  const allRowKeys = React.useMemo(
    () => sortedRows.map((r, i) => getRowKey(r, i)),
    [sortedRows, getRowKey],
  );
  const selectedSet = React.useMemo(
    () => new Set(selectedKeys),
    [selectedKeys],
  );
  const selectedCount = allRowKeys.filter((k) => selectedSet.has(k)).length;
  const allSelected =
    allRowKeys.length > 0 && selectedCount === allRowKeys.length;
  const someSelected = selectedCount > 0 && !allSelected;

  const commitSelectedKeys = (next: string[]) => {
    if (controlledSelectedKeys === undefined) {
      setUncontrolledSelected(next);
    }
    onSelectedRowKeysChange?.(next);
  };

  const handleSortClick = (col: M3EDataTableColumn<Row>) => {
    const nextDir: SortDirection =
      activeSort?.columnId === col.id && activeSort.direction === "ascending"
        ? "descending"
        : "ascending";
    const nextState: M3EDataTableSortState = {
      columnId: col.id,
      direction: nextDir,
    };
    if (controlledSort === undefined) {
      setUncontrolledSort(nextState);
    }
    onSortChange?.(nextState);
    const colName =
      col.headerLabel ??
      (typeof col.header === "string" ? col.header : col.id);
    setAnnouncement(
      t(
        nextDir === "ascending"
          ? "dataTable.sortedAscending"
          : "dataTable.sortedDescending",
        { column: colName },
      ),
    );
  };

  const rowHeight =
    density === "compact"
      ? DATA_TABLE_TOKENS.compactRowHeight
      : DATA_TABLE_TOKENS.rowHeight;

  const headerCellRefs = React.useRef<Record<string, HTMLTableCellElement | null>>(
    {},
  );
  const [stickyOffsets, setStickyOffsets] = React.useState<
    Record<string, number>
  >({});
  const hasStickyStart = columns.some((c) => c.sticky === "start");
  const hasStickyColumns =
    hasStickyStart || columns.some((c) => c.sticky === "end");

  useIsoLayoutEffect(() => {
    if (!hasStickyColumns) {
      setStickyOffsets((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return undefined;
    }

    const computeOffsets = () => {
      const next: Record<string, number> = {};
      let startAcc = 0;

      if (hasStickyStart && expandable) {
        next.__expand = startAcc;
        const el = headerCellRefs.current.__expand;
        startAcc += Math.round(el?.getBoundingClientRect().width || 44);
      }
      if (hasStickyStart && selectable) {
        next.__select = startAcc;
        const el = headerCellRefs.current.__select;
        startAcc += Math.round(el?.getBoundingClientRect().width || 48);
      }

      for (const col of columns) {
        if (col.sticky === "start") {
          next[col.id] = startAcc;
          const el = headerCellRefs.current[col.id];
          const fallback = typeof col.width === "number" ? col.width : 120;
          startAcc += Math.round(el?.getBoundingClientRect().width || fallback);
        }
      }

      let endAcc = 0;
      for (let i = columns.length - 1; i >= 0; i--) {
        const col = columns[i];
        if (col?.sticky === "end") {
          next[col.id] = endAcc;
          const el = headerCellRefs.current[col.id];
          const fallback = typeof col.width === "number" ? col.width : 120;
          endAcc += Math.round(el?.getBoundingClientRect().width || fallback);
        }
      }

      setStickyOffsets((prev) => {
        const prevKeys = Object.keys(prev);
        const nextKeys = Object.keys(next);
        if (
          prevKeys.length === nextKeys.length &&
          nextKeys.every((k) => prev[k] === next[k])
        ) {
          return prev;
        }
        return next;
      });
    };

    computeOffsets();

    if (typeof ResizeObserver !== "undefined") {
      const ro = new ResizeObserver(computeOffsets);
      for (const el of Object.values(headerCellRefs.current)) {
        if (el) ro.observe(el);
      }
      return () => ro.disconnect();
    }
    return undefined;
  }, [hasStickyColumns, hasStickyStart, expandable, selectable, columns]);

  const getStickyStyle = (
    key: string,
    sticky?: "start" | "end",
  ): React.CSSProperties | undefined => {
    if (!sticky) return undefined;
    const offset = stickyOffsets[key] ?? 0;
    return sticky === "start"
      ? { insetInlineStart: `${offset}px` }
      : { insetInlineEnd: `${offset}px` };
  };

  return (
    <div
      className={
        className
          ? `m3e-data-table-shell ${className}`
          : "m3e-data-table-shell"
      }
      style={{
        borderRadius: `${DATA_TABLE_TOKENS.containerRadius}px`,
        ...style,
      }}
    >
      <div role="status" aria-live="polite" className="m3e-sr-only">
        {announcement}
      </div>

      {toolbar ? <div className="m3e-data-table__toolbar">{toolbar}</div> : null}

      <div
        tabIndex={0}
        role="region"
        aria-labelledby={captionId}
        aria-busy={loading ? true : undefined}
        className="m3e-data-table-wrap"
        data-sticky-header={stickyHeader ? "" : undefined}
      >
        <table className="m3e-data-table" data-density={density}>
          <caption
            id={captionId}
            className={
              hideCaption ? "m3e-sr-only" : "m3e-data-table__caption"
            }
          >
            {caption}
          </caption>

          <thead className="m3e-data-table__head">
            <tr>
              {expandable ? (
                <th
                  ref={(el) => {
                    headerCellRefs.current.__expand = el;
                  }}
                  scope="col"
                  className="m3e-data-table__th m3e-data-table__th--expand"
                  data-sticky={hasStickyStart ? "start" : undefined}
                  style={{
                    height: `${DATA_TABLE_TOKENS.headerHeight}px`,
                    ...getStickyStyle(
                      "__expand",
                      hasStickyStart ? "start" : undefined,
                    ),
                  }}
                >
                  <span className="m3e-sr-only">
                    {t("dataTable.expandColumn")}
                  </span>
                </th>
              ) : null}

              {selectable ? (
                <th
                  ref={(el) => {
                    headerCellRefs.current.__select = el;
                  }}
                  scope="col"
                  className="m3e-data-table__th m3e-data-table__th--checkbox"
                  data-sticky={hasStickyStart ? "start" : undefined}
                  style={{
                    height: `${DATA_TABLE_TOKENS.headerHeight}px`,
                    ...getStickyStyle(
                      "__select",
                      hasStickyStart ? "start" : undefined,
                    ),
                  }}
                >
                  <Checkbox
                    aria-label={t("dataTable.selectAllRows")}
                    disabled={loading}
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={(checked) => {
                      const pageKeySet = new Set(allRowKeys);
                      if (checked) {
                        commitSelectedKeys(
                          Array.from(new Set([...selectedKeys, ...allRowKeys])),
                        );
                      } else {
                        commitSelectedKeys(
                          selectedKeys.filter((k) => !pageKeySet.has(k)),
                        );
                      }
                    }}
                  />
                </th>
              ) : null}

              {columns.map((col) => {
                const isSorted = Boolean(
                  activeSort && activeSort.columnId === col.id,
                );
                const dir: SortDirection =
                  isSorted && activeSort ? activeSort.direction : "ascending";

                return (
                  <th
                    key={col.id}
                    ref={(el) => {
                      headerCellRefs.current[col.id] = el;
                    }}
                    scope="col"
                    aria-sort={isSorted ? dir : undefined}
                    className="m3e-data-table__th"
                    data-align={col.align ?? "start"}
                    data-sticky={col.sticky}
                    style={{
                      height: `${DATA_TABLE_TOKENS.headerHeight}px`,
                      paddingInline: `${DATA_TABLE_TOKENS.cellPaddingInline}px`,
                      width:
                        typeof col.width === "number"
                          ? `${col.width}px`
                          : col.width,
                      ...getStickyStyle(col.id, col.sticky),
                    }}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        disabled={loading}
                        className="m3e-data-table__sort-btn"
                        data-active={isSorted ? "" : undefined}
                        onClick={() => handleSortClick(col)}
                      >
                        <span
                          className="m3e-data-table__sort-label"
                          data-text={
                            typeof col.header === "string"
                              ? col.header
                              : undefined
                          }
                        >
                          {col.header}
                        </span>
                        <SortArrowSvg active={isSorted} direction={dir} />
                      </button>
                    ) : (
                      <span className="m3e-data-table__th-text">
                        {col.header}
                      </span>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="m3e-data-table__body">
            {loading ? (
              Array.from({ length: Math.max(1, loadingRows) }, (_, rIdx) => (
                <tr key={`skeleton-${rIdx}`} className="m3e-data-table__row">
                  {expandable ? (
                    <td
                      className="m3e-data-table__td m3e-data-table__td--expand"
                      data-sticky={hasStickyStart ? "start" : undefined}
                      style={{
                        height: `${rowHeight}px`,
                        ...getStickyStyle(
                          "__expand",
                          hasStickyStart ? "start" : undefined,
                        ),
                      }}
                    >
                      <SkeletonBase variant="circular" width={18} height={18} />
                    </td>
                  ) : null}
                  {selectable ? (
                    <td
                      className="m3e-data-table__td m3e-data-table__td--checkbox"
                      data-sticky={hasStickyStart ? "start" : undefined}
                      style={{
                        height: `${rowHeight}px`,
                        ...getStickyStyle(
                          "__select",
                          hasStickyStart ? "start" : undefined,
                        ),
                      }}
                    >
                      <SkeletonBase variant="rounded" width={18} height={18} />
                    </td>
                  ) : null}
                  {columns.map((col, cIdx) => (
                    <td
                      key={col.id}
                      className="m3e-data-table__td"
                      data-sticky={col.sticky}
                      style={{
                        height: `${rowHeight}px`,
                        paddingInline: `${DATA_TABLE_TOKENS.cellPaddingInline}px`,
                        ...getStickyStyle(col.id, col.sticky),
                      }}
                    >
                      <SkeletonBase
                        variant="text"
                        width={cIdx === 0 ? "72%" : "54%"}
                        height={14}
                      />
                    </td>
                  ))}
                </tr>
              ))
            ) : sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={
                    columns.length + (selectable ? 1 : 0) + (expandable ? 1 : 0)
                  }
                  className="m3e-data-table__empty"
                >
                  {resolvedEmptyMessage}
                </td>
              </tr>
            ) : (
              sortedRows.map((row, rowIndex) => {
                const key = getRowKey(row, rowIndex);
                const isSelected = selectedSet.has(key);
                const isExpanded = expandedSet.has(key);
                const expandRowId = `${captionId}-exp-${rowIndex}`;

                return (
                  <React.Fragment key={key}>
                    <tr
                      className="m3e-data-table__row"
                      data-selected={isSelected ? "" : undefined}
                      data-expanded={isExpanded ? "" : undefined}
                    >
                      {expandable ? (
                        <td
                          className="m3e-data-table__td m3e-data-table__td--expand"
                          data-sticky={hasStickyStart ? "start" : undefined}
                          style={{
                            height: `${rowHeight}px`,
                            ...getStickyStyle(
                              "__expand",
                              hasStickyStart ? "start" : undefined,
                            ),
                          }}
                        >
                          <button
                            type="button"
                            aria-expanded={isExpanded}
                            aria-controls={expandRowId}
                            aria-label={t(
                              isExpanded
                                ? "dataTable.collapseRow"
                                : "dataTable.expandRow",
                              { index: rowIndex + 1 },
                            )}
                            className="m3e-data-table__expand-btn"
                            onClick={() => {
                              if (isExpanded) {
                                commitExpandedKeys(
                                  expandedKeys.filter((k) => k !== key),
                                );
                              } else {
                                commitExpandedKeys([...expandedKeys, key]);
                              }
                            }}
                          >
                            <ExpandChevronSvg expanded={isExpanded} />
                          </button>
                        </td>
                      ) : null}

                      {selectable ? (
                        <td
                          className="m3e-data-table__td m3e-data-table__td--checkbox"
                          data-sticky={hasStickyStart ? "start" : undefined}
                          style={{
                            height: `${rowHeight}px`,
                            ...getStickyStyle(
                              "__select",
                              hasStickyStart ? "start" : undefined,
                            ),
                          }}
                        >
                          <Checkbox
                            aria-label={t("dataTable.selectRow", {
                              index: rowIndex + 1,
                            })}
                            checked={isSelected}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                commitSelectedKeys([...selectedKeys, key]);
                              } else {
                                commitSelectedKeys(
                                  selectedKeys.filter((k) => k !== key),
                                );
                              }
                            }}
                          />
                        </td>
                      ) : null}

                      {columns.map((col, colIndex) => {
                        const isRowHeader =
                          col.isRowHeader ?? colIndex === 0;
                        const CellTag = isRowHeader ? "th" : "td";

                        return (
                          <CellTag
                            key={col.id}
                            scope={isRowHeader ? "row" : undefined}
                            className="m3e-data-table__td"
                            data-align={col.align ?? "start"}
                            data-sticky={col.sticky}
                            style={{
                              height: `${rowHeight}px`,
                              paddingInline: `${DATA_TABLE_TOKENS.cellPaddingInline}px`,
                              width:
                                typeof col.width === "number"
                                  ? `${col.width}px`
                                  : col.width,
                              ...getStickyStyle(col.id, col.sticky),
                            }}
                          >
                            {col.cell(row, rowIndex)}
                          </CellTag>
                        );
                      })}
                    </tr>
                    {expandable && isExpanded && renderExpandedRow ? (
                      <tr
                        id={expandRowId}
                        className="m3e-data-table__expanded-row"
                      >
                        <td
                          colSpan={
                            columns.length +
                            (selectable ? 1 : 0) +
                            (expandable ? 1 : 0)
                          }
                          className="m3e-data-table__expanded-cell"
                        >
                          {renderExpandedRow(row, rowIndex)}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {footer ? <div className="m3e-data-table__footer">{footer}</div> : null}
    </div>
  );
}
