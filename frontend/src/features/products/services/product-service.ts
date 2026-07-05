import { api } from "@/api/axios";

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string | null;
  unit: string;
  salePrice: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  bomItems: BomItem[];
}

export interface ProductListItem {
  id: string;
  code: string;
  name: string;
  unit: string;
  salePrice: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProductData {
  name: string;
  description?: string;
  unit: string;
  salePrice?: number;
}

export interface UpdateProductData {
  name: string;
  description?: string;
  unit: string;
  salePrice?: number;
  isActive: boolean;
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
  filters?: { field: string; value: string }[];
}

function buildODataQuery(params: ProductListParams): string {
  const parts: string[] = [];

  if (params.filters && params.filters.length > 0) {
    const filterParts = params.filters.map(
      (f) => `contains(${f.field},'${f.value.replace(/'/g, "''")}')`
    );
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
