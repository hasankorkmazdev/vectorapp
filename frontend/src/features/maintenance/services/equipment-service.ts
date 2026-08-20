import { api } from "@/api/axios";
import type { FilterValue } from "@/components/data-table/types";
import type {
  Equipment,
  EquipmentListItem,
  CreateEquipmentData,
  UpdateEquipmentData,
} from "@/features/maintenance/types";

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface EquipmentListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  filters?: FilterValue[];
  accountId?: string;
}

function toFilterValue(filter: FilterValue): string {
  const esc = (s: string) => s.replace(/'/g, "''");
  switch (filter.type) {
    case "text":
      return `contains(tolower(${filter.field}),'${esc(filter.value as string).toLowerCase()}')`;
    case "boolean":
      return `${filter.field} eq ${filter.value}`;
    case "select":
      if (typeof filter.value === "string") {
        return `tolower(${filter.field}) eq tolower('${esc(filter.value)}')`;
      }
      return `${filter.field} eq ${filter.value}`;
    default:
      return "";
  }
}

function buildODataQuery(params: EquipmentListParams): string {
  const parts: string[] = [];
  const filterParts: string[] = [];

  if (params.accountId) {
    filterParts.push(`accountId eq ${params.accountId}`);
  }
  if (params.filters && params.filters.length > 0) {
    filterParts.push(...params.filters.map(toFilterValue).filter(Boolean));
  }
  if (filterParts.length > 0) {
    parts.push(`$filter=${filterParts.join(" and ")}`);
  }

  if (params.sortBy) {
    parts.push(`$orderby=${params.sortBy}${params.sortDirection === "desc" ? " desc" : ""}`);
  }

  const top = params.pageSize || 20;
  const skip = ((params.page || 1) - 1) * top;
  parts.push(`$top=${top}`);
  parts.push(`$skip=${skip}`);
  parts.push("$count=true");

  return parts.join("&");
}

export const equipmentService = {
  getAll: async (params?: EquipmentListParams, signal?: AbortSignal) => {
    const query = params ? buildODataQuery(params) : "";
    const response = await api.get<{ "@odata.count": number; value: EquipmentListItem[] }>(`/equipment?${query}`, { signal });
    const body = response.data;
    const items = Array.isArray(body) ? body : body?.value ?? [];
    const totalCount = body?.["@odata.count"] ?? items.length;
    return {
      ...response,
      data: {
        data: {
          items,
          totalCount,
          page: params?.page || 1,
          pageSize: params?.pageSize || 20,
          totalPages: Math.ceil(totalCount / (params?.pageSize || 20)),
        } as PagedResult<EquipmentListItem>,
      },
    };
  },

  getById: (id: string) =>
    api.get<{ data: Equipment; message: string; error: boolean; code: number }>(`/equipment/${id}`),

  create: (data: CreateEquipmentData) =>
    api.post<{ data: Equipment; message: string; error: boolean; code: number }>("/equipment", data),

  update: (id: string, data: UpdateEquipmentData) =>
    api.put<{ data: Equipment; message: string; error: boolean; code: number }>(`/equipment/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/equipment/${id}`),
};
