import { useCallback } from "react";
import { ChevronDown, ChevronUp, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NumberInput } from "@/components/ui/number-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { DateRangeFilter } from "./DateRangeFilter";
import type { Column, SortState, FilterValue, FilterOption } from "./types";

interface DataTableHeaderProps<T> {
  columns: Column<T>[];
  sort?: SortState;
  filterValues: Record<string, FilterValue>;
  onSort: (sortBy: string, sortDirection: "asc" | "desc") => void;
  onFilterChange: (field: string, filter: FilterValue | null) => void;
}

function renderFilterInput(
  col: Column<unknown>,
  currentFilter: FilterValue | undefined,
  onFilterChange: (field: string, filter: FilterValue | null) => void,
) {
  const filterType = col.filterType || "text";

  switch (filterType) {
    case "text":
      return (
        <Input
          placeholder={col.placeholder || ""}
          value={(currentFilter?.value as string) || ""}
          onChange={(e) => {
            const val = e.target.value;
            onFilterChange(col.key, val ? { type: "text", field: col.key, value: val } : null);
          }}
          className="h-7 text-xs px-2"
        />
      );

    case "number":
      return (
        <NumberInput
          placeholder={col.placeholder || ""}
          value={currentFilter?.value as number | undefined}
          onChange={(val) => {
            onFilterChange(col.key, val != null ? { type: "number", field: col.key, value: val, operator: "eq" } : null);
          }}
          className="h-7 text-xs px-2"
        />
      );

    case "date":
      return (
        <DateRangeFilter
          filter={currentFilter}
          onChange={(f) => onFilterChange(col.key, f)}
          field={col.key}
        />
      );

    case "boolean":
      return (
        <div className="flex items-center gap-1">
          <Select
            value={currentFilter?.value != null ? String(currentFilter.value) : "__clear__"}
            onValueChange={(val) => {
              if (val === "__clear__") {
                onFilterChange(col.key, null);
              } else {
                onFilterChange(col.key, { type: "boolean", field: col.key, value: val === "true" });
              }
            }}
          >
            <SelectTrigger className="h-7 text-xs px-2 w-full">
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__clear__">...</SelectItem>
              <SelectItem value="true">Evet</SelectItem>
              <SelectItem value="false">Hayır</SelectItem>
            </SelectContent>
          </Select>
          {currentFilter && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={() => onFilterChange(col.key, null)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );

    case "select": {
      const options = col.filterOptions;
      if (typeof options === "string") {
        return (
          <Input
            placeholder={col.placeholder || "Search..."}
            value=""
            disabled
            className="h-7 text-xs px-2"
          />
        );
      }
      const opts = (options as FilterOption[]) || [];
      return (
        <div className="flex items-center gap-1">
          <Select
            value={currentFilter?.value != null ? String(currentFilter.value) : "__clear__"}
            onValueChange={(val) => {
              if (val === "__clear__") {
                onFilterChange(col.key, null);
              } else {
                const matched = opts.find((o) => String(o.value) === val);
                onFilterChange(col.key, {
                  type: "select",
                  field: col.key,
                  value: matched ? matched.value : val,
                });
              }
            }}
          >
            <SelectTrigger className="h-7 text-xs px-2 w-full">
              <SelectValue placeholder="..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__clear__">...</SelectItem>
              {opts.map((opt) => (
                <SelectItem key={String(opt.value)} value={String(opt.value)}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {currentFilter && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 shrink-0"
              onClick={() => onFilterChange(col.key, null)}
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      );
    }

    case "multi-select":
      return (
        <Input
          placeholder={col.placeholder || "Select..."}
          value=""
          disabled
          className="h-7 text-xs px-2"
        />
      );

    default:
      return (
        <Input
          placeholder={col.placeholder || ""}
          value={(currentFilter?.value as string) || ""}
          onChange={(e) => {
            const val = e.target.value;
            onFilterChange(col.key, val ? { type: "text", field: col.key, value: val } : null);
          }}
          className="h-7 text-xs px-2"
        />
      );
  }
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

  function renderSortIcon(key: string) {
    if (sort?.sortBy !== key) {
      return <ChevronsUpDown className="h-3 w-3 shrink-0 text-muted-foreground/50" />;
    }
    return renderSortDirectionIcon();
  }

  function renderSortDirectionIcon() {
    if (sort!.sortDirection === "asc") {
      return <ChevronUp className="h-3 w-3 shrink-0" />;
    }
    return <ChevronDown className="h-3 w-3 shrink-0" />;
  }

  return (
    <TableHeader>
      <TableRow>
        {columns.map((col) => {
          const canFilter = col.filterable && col.filterType !== "multi-select";
          return (
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
                  {col.sortable && renderSortIcon(col.key)}
                </Button>
                {canFilter && renderFilterInput(
                  col as Column<unknown>,
                  filterValues[col.key],
                  onFilterChange,
                )}
                {col.filterable && !canFilter && (
                  <Input
                    placeholder={col.placeholder || ""}
                    value={""}
                    disabled
                    className="h-7 text-xs px-2"
                  />
                )}
              </div>
            </TableHead>
          );
        })}
      </TableRow>
    </TableHeader>
  );
}
