"use client";

import * as React from "react";
import {
  DATA_TABLE_TOKENS,
  type M3EShapeName,
  MATERIAL_SHAPES,
  SKELETON_TOKENS,
  cubicsToSvgPath,
} from "../tokens/index.js";
import { useM3EI18n } from "../context/M3EProvider.js";
import { Checkbox } from "./Checkbox.js";

/* =========================================================================
   1. M3E Sortable & Responsive DataTable
   ========================================================================= */

export type SortDirection = "ascending" | "descending";

export interface M3EDataTableColumn<Row> {
  readonly id: string;
  readonly header: React.ReactNode;
  /** Plain-text label used in screen-reader sort announcements (defaults to `String(header)` if string) */
  readonly headerLabel?: string;
  readonly align?: "start" | "center" | "end";
  readonly sortable?: boolean;
  /** Marks the row's primary identifying column (`<th scope="row">`) */
  readonly isRowHeader?: boolean;
  /** Extracts primitive value for `Intl.Collator` / numeric sorting */
  readonly sortAccessor?: (row: Row) => string | number;
  readonly cell: (row: Row, index: number) => React.ReactNode;
}

export interface M3EDataTableSortState {
  readonly columnId: string;
  readonly direction: SortDirection;
}

export interface M3EDataTableProps<Row> {
  /** Mandatory accessible caption describing the table dataset */
  readonly caption: React.ReactNode;
  /** Visually hides `<caption>` while preserving `aria-labelledby` on the scrollable region */
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
  readonly density?: "comfortable" | "compact";
  readonly stickyHeader?: boolean;
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

/**
 * M3E DataTable
 *
 * Implements `modern-web-guidance` `sortable-table` & `responsive-table`:
 * - Keyboard-focusable horizontal scroll container (`tabIndex={0}`, `role="region"`, `aria-labelledby={captionId}`, `container-type: inline-size`).
 * - `<button type="button">` inside sortable `<th scope="col">` (never clickable `<th>`).
 * - `aria-sort="ascending" | "descending"` set ONLY on the active sorted column (never `aria-sort="none"`).
 * - `Intl.Collator` (`numeric: true, sensitivity: 'base'`) for text + numeric subtraction for numbers.
 * - Polite visually hidden `role="status"` sort announcer outside `<table>`.
 */
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
  density = "comfortable",
  stickyHeader = false,
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

      <div
        tabIndex={0}
        role="region"
        aria-labelledby={captionId}
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
              {selectable ? (
                <th
                  scope="col"
                  className="m3e-data-table__th m3e-data-table__th--checkbox"
                  style={{ height: `${DATA_TABLE_TOKENS.headerHeight}px` }}
                >
                  <Checkbox
                    aria-label={t("dataTable.selectAllRows")}
                    checked={allSelected}
                    indeterminate={someSelected}
                    onCheckedChange={(checked) => {
                      commitSelectedKeys(checked ? [...allRowKeys] : []);
                    }}
                  />
                </th>
              ) : null}

              {columns.map((col) => {
                const isSorted = activeSort?.columnId === col.id;
                const dir: SortDirection = isSorted
                  ? activeSort.direction
                  : "ascending";

                return (
                  <th
                    key={col.id}
                    scope="col"
                    aria-sort={isSorted ? dir : undefined}
                    className="m3e-data-table__th"
                    data-align={col.align ?? "start"}
                    style={{
                      height: `${DATA_TABLE_TOKENS.headerHeight}px`,
                      paddingInline: `${DATA_TABLE_TOKENS.cellPaddingInline}px`,
                    }}
                  >
                    {col.sortable ? (
                      <button
                        type="button"
                        className="m3e-data-table__sort-btn"
                        data-active={isSorted ? "" : undefined}
                        onClick={() => handleSortClick(col)}
                      >
                        <span>{col.header}</span>
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
            {sortedRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="m3e-data-table__empty"
                >
                  {resolvedEmptyMessage}
                </td>
              </tr>
            ) : (
              sortedRows.map((row, rowIndex) => {
                const key = getRowKey(row, rowIndex);
                const isSelected = selectedSet.has(key);

                return (
                  <tr
                    key={key}
                    className="m3e-data-table__row"
                    data-selected={isSelected ? "" : undefined}
                  >
                    {selectable ? (
                      <td
                        className="m3e-data-table__td m3e-data-table__td--checkbox"
                        style={{ height: `${rowHeight}px` }}
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
                          style={{
                            height: `${rowHeight}px`,
                            paddingInline: `${DATA_TABLE_TOKENS.cellPaddingInline}px`,
                          }}
                        >
                          {col.cell(row, rowIndex)}
                        </CellTag>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* =========================================================================
   2. M3E Tonal Shimmer Skeleton (Supports Standard & 35 Expressive Shapes!)
   ========================================================================= */

export interface M3ESkeletonProps {
  readonly variant?: "text" | "rectangular" | "rounded" | "circular";
  /** Optional M3E 35-polygon shape mask (e.g. `"Cookie9Sided"`, `"Clover4Leaf"`, `"SoftBurst"`) */
  readonly shape?: M3EShapeName;
  readonly width?: number | string;
  readonly height?: number | string;
  readonly animated?: boolean;
  readonly className?: string;
  readonly style?: React.CSSProperties;
}

export function Skeleton({
  variant = "rounded",
  shape,
  width,
  height,
  animated = true,
  className,
  style,
}: M3ESkeletonProps): React.JSX.Element {
  if (shape) {
    const numericSize = typeof width === "number" ? width : 56;
    const shapeData = MATERIAL_SHAPES[shape] ?? MATERIAL_SHAPES.circle;
    const pathD = cubicsToSvgPath(shapeData.cubics, numericSize, 0.92);

    return (
      <svg
        width={numericSize}
        height={numericSize}
        viewBox={`0 0 ${numericSize} ${numericSize}`}
        aria-hidden="true"
        className={
          className
            ? `m3e-skeleton m3e-skeleton--shape ${className}`
            : "m3e-skeleton m3e-skeleton--shape"
        }
        data-animated={animated ? "" : undefined}
        style={style}
      >
        <path d={pathD} fill="currentColor" />
      </svg>
    );
  }

  const resolvedRadius =
    variant === "circular"
      ? 9999
      : variant === "text"
        ? SKELETON_TOKENS.textRadius
        : variant === "rectangular"
          ? SKELETON_TOKENS.rectangularRadius
          : SKELETON_TOKENS.roundedRadius;

  const defaultHeight =
    variant === "text" ? 14 : variant === "circular" ? 44 : 36;
  const defaultWidth = variant === "circular" ? (height ?? 44) : "100%";

  return (
    <span
      aria-hidden="true"
      className={className ? `m3e-skeleton ${className}` : "m3e-skeleton"}
      data-variant={variant}
      data-animated={animated ? "" : undefined}
      style={{
        width: width ?? defaultWidth,
        height: height ?? defaultHeight,
        borderRadius: `${resolvedRadius}px`,
        ...style,
      }}
    />
  );
}
