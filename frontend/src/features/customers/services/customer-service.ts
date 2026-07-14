import { api } from "@/api/axios";
import type { FilterValue } from "@/components/data-table/types";
import type {
  Customer,
  CustomerContact,
  CustomerAddress,
  CreateCustomerData,
  UpdateCustomerData,
  CreateContactData,
  UpdateContactData,
  CreateAddressData,
  UpdateAddressData,
  PagedResult,
  CustomerListParams,
} from "@/features/customers/types";

const COLLECTION_FIELDS = new Set(["phone", "email"]);

function toFilterValue(filter: FilterValue): string {
  const esc = (s: string) => s.replace(/'/g, "''");

  switch (filter.type) {
    case "text":
      if (COLLECTION_FIELDS.has(filter.field)) {
        return `${filter.field}/any(x: contains(tolower(x),'${esc(filter.value as string).toLowerCase()}'))`;
      }
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
        return `${filter.field} eq '${esc(filter.value)}'`;
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

function buildODataQuery(params: CustomerListParams): string {
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

  createContact: (customerId: string, data: CreateContactData) =>
    api.post<{ data: CustomerContact; message: string; error: boolean; code: number }>(`/customer/${customerId}/contacts`, data),

  updateContact: (customerId: string, contactId: string, data: UpdateContactData) =>
    api.put<{ data: CustomerContact; message: string; error: boolean; code: number }>(`/customer/${customerId}/contacts/${contactId}`, data),

  deleteContact: (customerId: string, contactId: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/customer/${customerId}/contacts/${contactId}`),

  createAddress: (customerId: string, data: CreateAddressData) =>
    api.post<{ data: CustomerAddress; message: string; error: boolean; code: number }>(`/customer/${customerId}/addresses`, data),

  updateAddress: (customerId: string, addressId: string, data: UpdateAddressData) =>
    api.put<{ data: CustomerAddress; message: string; error: boolean; code: number }>(`/customer/${customerId}/addresses/${addressId}`, data),

  deleteAddress: (customerId: string, addressId: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/customer/${customerId}/addresses/${addressId}`),
};
