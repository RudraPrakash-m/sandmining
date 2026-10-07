import React, { useState, useMemo } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  Eye,
  Pencil,
  Trash2,
  Download,
} from "lucide-react";
import Button from "../../Button";

export interface ColumnDef<T> {
  key: string;
  header: string;
  sortable?: boolean;
  width?: string;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface AdminTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: ColumnDef<T>[];
  data: T[];
  loading?: boolean;
  searchPlaceholder?: string;
  searchable?: boolean;
  searchFields?: (keyof T)[];
  onAddRecord?: () => void;
  addRecordLabel?: string;
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onExport?: (filteredData: T[]) => void;
  actionsHeader?: string;
  emptyMessage?: string;
  initialPageSize?: number;
}

export function AdminTable<T extends Record<string, any>>({
  title,
  subtitle,
  columns,
  data,
  loading = false,
  searchPlaceholder = "Search in table...",
  searchable = true,
  searchFields,
  onAddRecord,
  addRecordLabel = "Add Record",
  onView,
  onEdit,
  onDelete,
  onExport,
  actionsHeader = "Actions",
  emptyMessage = "No records found matching your criteria.",
  initialPageSize = 10,
}: Readonly<AdminTableProps<T>>) {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Filtering
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      if (searchFields && searchFields.length > 0) {
        return searchFields.some((field) => {
          const val = item[field];
          return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
        });
      }
      return Object.values(item).some((val) => {
        return val !== null && val !== undefined && String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchFields]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }
      return sortDirection === "asc"
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortDirection]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const currentData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else {
        setSortKey(null);
        setSortDirection("asc");
      }
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const hasRowActions = Boolean(onView || onEdit || onDelete);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-border-color dark:border-gray-800 shadow-xs overflow-hidden transition-colors">
      {/* Top Toolbar */}
      {(title || searchable || onAddRecord || onExport) && (
        <div className="p-4 sm:p-5 border-b border-border-color dark:border-gray-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            {title && (
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            {searchable && (
              <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                <Search
                  size={15}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={searchPlaceholder}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-gray-800 border border-border-color dark:border-gray-700 rounded-lg text-gray-800 dark:text-gray-200 placeholder:text-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                />
              </div>
            )}

            {onExport && (
              <Button
                variant="outline"
                size="sm"
                icon={<Download size={14} />}
                onClick={() => onExport(sortedData)}
              >
                Export
              </Button>
            )}

            {onAddRecord && (
              <Button
                variant="primary"
                size="sm"
                onClick={onAddRecord}
              >
                + {addRecordLabel}
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-start border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-gray-800/80 border-b border-border-color dark:border-gray-800 text-gray-600 dark:text-gray-300 text-xs font-semibold uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{ width: col.width }}
                  className={`px-4 py-3.5 text-start select-none ${
                    col.sortable ? "cursor-pointer hover:text-primary transition-colors" : ""
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && (
                      <ArrowUpDown
                        size={12}
                        className={`transition-colors ${
                          sortKey === col.key ? "text-primary" : "text-gray-400"
                        }`}
                      />
                    )}
                  </div>
                </th>
              ))}

              {hasRowActions && (
                <th className="px-4 py-3.5 text-end font-semibold text-xs tracking-wider">
                  {actionsHeader}
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-border-color dark:divide-gray-800">
            {loading ? (
              <tr>
                <td
                  colSpan={columns.length + (hasRowActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm text-gray-500"
                >
                  <div className="flex items-center justify-center gap-2">
                    <span className="size-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    <span>Loading table records...</span>
                  </div>
                </td>
              </tr>
            ) : currentData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasRowActions ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              currentData.map((item, idx) => (
                <tr
                  key={item.id || idx}
                  className="hover:bg-slate-50/80 dark:hover:bg-gray-800/40 transition-colors"
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className="px-4 py-3.5 text-sm text-gray-700 dark:text-gray-200"
                    >
                      {col.render ? col.render(item, idx) : item[col.key]}
                    </td>
                  ))}

                  {hasRowActions && (
                    <td className="px-4 py-3.5 text-end text-sm">
                      <div className="flex items-center justify-end gap-1">
                        {onView && (
                          <button
                            type="button"
                            onClick={() => onView(item)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(item)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-primary hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(item)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-danger hover:bg-danger/10 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer / Pagination */}
      <div className="p-3 sm:p-4 border-t border-border-color dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400 bg-slate-50/40 dark:bg-gray-800/20">
        <div className="flex items-center gap-2">
          <span>Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-gray-800 border border-border-color dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-800 dark:text-gray-200 focus:outline-none focus:border-primary"
          >
            {[5, 10, 20, 50].map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span className="hidden sm:inline">
            Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage(1)}
            className="p-1.5 rounded border border-border-color dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </button>
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="p-1.5 rounded border border-border-color dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          <span className="px-3 py-1 font-semibold text-gray-800 dark:text-gray-200">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="p-1.5 rounded border border-border-color dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => setCurrentPage(totalPages)}
            className="p-1.5 rounded border border-border-color dark:border-gray-700 bg-white dark:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-gray-700 transition-colors"
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminTable;
