import type { ReactNode } from "react";

export type FilterType = "text" | "number" | "date" | "boolean" | "select" | "multi-select";

export interface FilterValue {
  field: string;
  type: FilterType;
  value?: string | number | boolean | (string | number)[] | null;
  operator?: string;
  from?: string;
  to?: string;
}

export interface FilterOption {
  label: string;
  value: string | number;
}

export interface Column<T> {
  key: string;
  label: string;
  placeholder?: string;
  icon: ReactNode;
  render: (item: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: FilterType;
  filterOptions?: FilterOption[] | string;
  className?: string;
  headerClassName?: string;
}

export interface SortState {
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  loading?: boolean;
  emptyMessage?: string;
  sort?: SortState;
  filters?: FilterValue[];
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
  onSort: (sortBy: string, sortDirection: "asc" | "desc") => void;
  onFilter: (filters: FilterValue[]) => void;
}
