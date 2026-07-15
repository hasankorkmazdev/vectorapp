import { api } from "@/api/axios";
import type { FilterValue } from "@/components/data-table/types";

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  salePrice: number | null;
  sellingCurrency: string;
  isActive: boolean;
  stockQuantity: number;
  avgCost: number | null;
  lastPurchasePrice: number | null;
  createdAt: string;
  updatedAt: string | null;
  groupId: string | null;
  groupName: string | null;
  bomItems: BomItem[];
}

export interface ProductListItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  salePrice: number | null;
  sellingCurrency: string;
  isActive: boolean;
  stockQuantity: number;
  avgCost: number | null;
  lastPurchasePrice: number | null;
  createdAt: string;
  updatedAt: string | null;
  groupId: string | null;
  groupName: string | null;
}

export interface CreateProductData {
  code: string;
  name: string;
  description?: string;
  unit: string;
  salePrice?: number;
  sellingCurrency: string;
  groupId?: string;
}

export interface UpdateProductData {
  code: string;
  name: string;
  description?: string;
  unit: string;
  salePrice?: number;
  sellingCurrency: string;
  isActive: boolean;
  groupId?: string;
}

export interface BomItem {
  id: string;
  componentProductId: string;
  componentProductCode: string;
  componentProductName: string;
  componentProductUnit: string;
  quantity: number;
  notes: string | null;
  createdAt: string;
}

export interface BomNode {
  id: string;
  productCode: string;
  productName: string;
  productUnit: string;
  quantity: number;
  isRoot: boolean;
}

export interface BomEdge {
  id: string;
  sourceId: string;
  targetId: string;
  quantity: number;
}

export interface BomTree {
  nodes: BomNode[];
  edges: BomEdge[];
}

export interface CreateBomItemData {
  componentProductId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateBomItemData {
  quantity: number;
  notes?: string;
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ProductListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  filters?: FilterValue[];
}

function toFilterValue(filter: FilterValue): string {
  const esc = (s: string) => s.replace(/'/g, "''");

  switch (filter.type) {
    case "text":
      return `contains(tolower(${filter.field}),'${esc(filter.value as string).toLowerCase()}')`;

    case "number":
      return `${filter.field} ${filter.operator || "eq"} ${filter.value}`;

    case "date": {
      const parts: string[] = [];
      if (filter.from) parts.push(`${filter.field} ge ${filter.from}`);
      if (filter.to) parts.push(`${filter.field} le ${filter.to}`);
      return parts.join(" and ");
    }

    case "boolean":
      return `${filter.field} eq ${filter.value}`;

    case "select":
      if (typeof filter.value === "string") {
        return `tolower(${filter.field}) eq tolower('${esc(filter.value)}')`;
      }
      return `${filter.field} eq ${filter.value}`;

    case "multi-select": {
      const vals = filter.value as (string | number)[];
      if (vals.length === 0) return "";
      return vals.map((v) =>
        typeof v === "string"
          ? `${filter.field} eq '${esc(v)}'`
          : `${filter.field} eq ${v}`
      ).join(" or ");
    }

    default:
      return "";
  }
}

function buildODataQuery(params: ProductListParams): string {
  const parts: string[] = [];

  if (params.filters && params.filters.length > 0) {
    const filterParts = params.filters
      .map((f) => toFilterValue(f))
      .filter(Boolean);
    if (filterParts.length > 0) {
      parts.push(`$filter=${filterParts.join(" and ")}`);
    }
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

export const productService = {
  getAll: async (params?: ProductListParams, signal?: AbortSignal) => {
    const query = params ? buildODataQuery(params) : "";
    const response = await api.get<{ "@odata.count": number; value: ProductListItem[] }>(`/product?${query}`, { signal });
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
        } as PagedResult<ProductListItem>,
      },
    };
  },

  getById: (id: string) =>
    api.get<{ data: Product; message: string; error: boolean; code: number }>(`/product/${id}`),

  create: (data: CreateProductData) =>
    api.post<{ data: Product; message: string; error: boolean; code: number }>("/product", data),

  update: (id: string, data: UpdateProductData) =>
    api.put<{ data: Product; message: string; error: boolean; code: number }>(`/product/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/product/${id}`),

  getBomTree: (productId: string) =>
    api.get<{ data: BomTree; message: string; error: boolean; code: number }>(`/product/${productId}/bom-tree`),

  createBomItem: (productId: string, data: CreateBomItemData) =>
    api.post<{ data: BomItem; message: string; error: boolean; code: number }>(`/product/${productId}/bom`, data),

  updateBomItem: (bomItemId: string, data: UpdateBomItemData) =>
    api.put<{ data: BomItem; message: string; error: boolean; code: number }>(`/product/bom/${bomItemId}`, data),

  deleteBomItem: (bomItemId: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/product/bom/${bomItemId}`),
};
