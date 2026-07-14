import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Table, TableBody, TableCell, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DataTableProps, FilterValue } from "./types";
import { DataTableHeader } from "./DataTableHeader";
import { DataTablePagination } from "./DataTablePagination";
import { cn } from "@/lib/utils";

export function DataTable<T extends { id: string }>({
  columns,
  data = [],
  totalCount,
  page,
  pageSize,
  loading,
  emptyMessage,
  sort,
  filters = [],
  onPageChange,
  onPageSizeChange,
  onSort,
  onFilter,
}: DataTableProps<T>) {
  const { t } = useTranslation();

  const [localFilters, setLocalFilters] = useState<Record<string, FilterValue>>(
    () => Object.fromEntries(filters.map((f) => [f.field, f]))
  );
  const prevFilterStr = useRef(JSON.stringify(filters));
  const prevEntriesStr = useRef("[]");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const str = JSON.stringify(filters);
    if (str !== prevFilterStr.current) {
      prevFilterStr.current = str;
      setLocalFilters(Object.fromEntries(filters.map((f) => [f.field, f])));
    }
  }, [filters]);

  useEffect(() => {
    const entries = Object.values(localFilters).filter((f) => {
      if (f.type === "text") return (f.value as string).length > 0;
      if (f.type === "number") return f.value != null;
      if (f.type === "date") return !!(f.from || f.to);
      if (f.type === "boolean") return f.value != null;
      if (f.type === "select") return f.value != null && f.value !== "";
      if (f.type === "multi-select") return Array.isArray(f.value) && f.value.length > 0;
      return false;
    });
    const str = JSON.stringify(entries);
    if (str !== prevEntriesStr.current) {
      prevEntriesStr.current = str;
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => onFilter(entries), 400);
    }
  }, [localFilters]);

  const handleFilterChange = (field: string, filter: FilterValue | null) => {
    setLocalFilters((prev) => {
      const next = { ...prev };
      if (filter) {
        next[field] = filter;
      } else {
        delete next[field];
      }
      return next;
    });
  };

  const isEmpty = !loading && data.length === 0;

  function renderLoading() {
    return Array.from({ length: 5 }).map((_, i) => (
      <TableRow key={`skeleton-${i}`}>
        {columns.map((col) => (
          <TableCell key={col.key} className={cn("px-5 pt-3 pb-3", col.className)}>
            <Skeleton className="h-4 w-full" />
          </TableCell>
        ))}
      </TableRow>
    ));
  }

  function renderEmpty() {
    return (
      <TableRow>
        <TableCell colSpan={columns.length} className="h-40 text-center text-muted-foreground">
          <p className="text-sm">{emptyMessage || t("common.empty")}</p>
        </TableCell>
      </TableRow>
    );
  }

  function renderContent() {
    return data.map((item) => (
      <TableRow key={item.id}>
        {columns.map((col) => (
          <TableCell key={col.key} className={cn("px-5 pt-3 pb-3 ",col.className)}>
            {col.render(item)}
          </TableCell>
        ))}
      </TableRow>
    ));
  }

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <DataTableHeader
            columns={columns}
            sort={sort}
            filterValues={localFilters}
            onSort={onSort}
            onFilterChange={handleFilterChange}
          />
          <TableBody>
            {loading ? renderLoading() : isEmpty ? renderEmpty() : renderContent()}
          </TableBody>
        </Table>

        {!isEmpty && (
          <DataTablePagination
            page={page}
            pageSize={pageSize}
            totalCount={totalCount}
            onPageChange={onPageChange}
            onPageSizeChange={onPageSizeChange}
          />
        )}
      </CardContent>
    </Card>
  );
}
