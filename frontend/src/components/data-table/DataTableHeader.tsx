import { useCallback } from "react";
import {
  ChevronDown, ChevronUp, ChevronsUpDown,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import type { Column, SortState } from "./types";

interface DataTableHeaderProps<T> {
  columns: Column<T>[];
  sort?: SortState;
  filterValues: Record<string, string>;
  onSort: (sortBy: string, sortDirection: "asc" | "desc") => void;
  onFilterChange: (field: string, value: string) => void;
}

export function DataTableHeader<T>({
  columns,
  sort,
  filterValues,
  onSort,
  onFilterChange,
}: DataTableHeaderProps<T>) {
  const handleSort = useCallback((key: string) => {
    if (sort?.sortBy === key) {
      onSort(key, sort.sortDirection === "asc" ? "desc" : "asc");
    } else {
      onSort(key, "asc");
    }
  }, [sort, onSort]);

  return (
    <TableHeader>
      <TableRow>
        {columns.map((col) => (
          <TableHead key={col.key} className={cn(col.headerClassName)}>
            <div className="flex flex-col gap-1 m-2">
              <Button
                variant="ghost"
                size="sm"
                className={cn(
                  "h-auto px-0 font-medium justify-start my-1 text-muted-foreground hover:text-foreground",
                  !col.sortable && "pointer-events-none",
                )}
                onClick={() => col.sortable && handleSort(col.key)}
              >
                {col.icon && <span className="">{col.icon}</span>}
                {col.label}
                {col.sortable && (
                  sort?.sortBy === col.key
                    ? sort.sortDirection === "asc"
                      ? <ChevronUp className="h-3 w-3 shrink-0" />
                      : <ChevronDown className="h-3 w-3 shrink-0" />
                    : <ChevronsUpDown className="h-3 w-3 shrink-0 text-muted-foreground/50" />
                )}
              </Button>
              <Input
                placeholder={col.placeholder || ""}
                value={filterValues[col.key] || ""}
                onChange={(e) => col.filterable && onFilterChange(col.key, e.target.value)}
                disabled={!col.filterable}
                className="h-7 text-xs px-2"
              />
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
