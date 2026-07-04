import type { ReactNode } from "react";

export interface Column<T> {
  key: string;
  label: string;
  render: (item: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  className?: string;
  headerClassName?: string;
}

export interface SortState {
  sortBy: string;
  sortDirection: "asc" | "desc";
}

export interface FilterValue {
  field: string;
  value: string;
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
