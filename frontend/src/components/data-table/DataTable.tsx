import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Table, TableBody, TableCell, TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import type { DataTableProps } from "./types";
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

  const [localFilters, setLocalFilters] = useState<Record<string, string>>(
    () => Object.fromEntries(filters.map((f) => [f.field, f.value]))
  );
  const prevFilterStr = useRef(JSON.stringify(filters));
  const prevEntriesStr = useRef("[]");
  const debounceTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const str = JSON.stringify(filters);
    if (str !== prevFilterStr.current) {
      prevFilterStr.current = str;
      setLocalFilters(Object.fromEntries(filters.map((f) => [f.field, f.value])));
    }
  }, [filters]);

  useEffect(() => {
    const entries = Object.entries(localFilters)
      .filter(([, v]) => v.length > 0)
      .map(([field, value]) => ({ field, value }));
    const str = JSON.stringify(entries);
    if (str !== prevEntriesStr.current) {
      prevEntriesStr.current = str;
      clearTimeout(debounceTimer.current);
      debounceTimer.current = setTimeout(() => onFilter(entries), 300);
    }
  }, [localFilters]);

  const handleFilterChange = (field: string, value: string) => {
    setLocalFilters((prev) => ({ ...prev, [field]: value }));
  };

  const isEmpty = !loading && data.length === 0;

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
            {loading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                  </div>
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-40 text-center text-muted-foreground">
                  <p className="text-sm">{emptyMessage || t("common.empty")}</p>
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow key={item.id}>
                  {columns.map((col) => (
                    <TableCell key={col.key} className={cn("px-5 pt-3 pb-3 ",col.className)}>
                      {col.render(item)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
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
