import { api } from "@/api/axios";

export interface CustomerContact {
  id: string;
  fullName: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  gsm: string | null;
  isPrimary: boolean;
}

export interface CustomerAddress {
  id: string;
  label: string;
  country: string | null;
  city: string | null;
  district: string | null;
  postalCode: string | null;
  address: string | null;
  isPrimary: boolean;
}

export interface Customer {
  id: string;
  code: string;
  companyName: string;
  taxNumber: string | null;
  taxOffice: string | null;
  phone: string[];
  email: string[];
  createdAt: string;
  updatedAt: string | null;
  contacts: CustomerContact[];
  addresses: CustomerAddress[];
}

export interface CreateCustomerData {
  companyName: string;
  taxNumber?: string;
  taxOffice?: string;
  phone?: string[];
  email?: string[];
}

export interface UpdateCustomerData extends CreateCustomerData {}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CustomerListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  filters?: { field: string; value: string }[];
}

function buildODataQuery(params: CustomerListParams): string {
  const parts: string[] = [];

  if (params.filters && params.filters.length > 0) {
    const filterParts = params.filters.map((f) => {
      const val = f.value.replace(/'/g, "''");
      return `contains(${f.field},'${val}')`;
    });
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

export const customerService = {
  getAll: async (params?: CustomerListParams, signal?: AbortSignal) => {
    const query = params ? buildODataQuery(params) : "";
    const response = await api.get<{ "@odata.count": number; value: Customer[] }>(`/customer?${query}`, { signal });
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
        } as PagedResult<Customer>,
      },
    };
  },

  getById: (id: string) =>
    api.get<{ data: Customer; message: string; error: boolean; code: number }>(`/customer/${id}`),

  create: (data: CreateCustomerData) =>
    api.post<{ data: Customer; message: string; error: boolean; code: number }>("/customer", data),

  update: (id: string, data: UpdateCustomerData) =>
    api.put<{ data: Customer; message: string; error: boolean; code: number }>(`/customer/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/customer/${id}`),
};
