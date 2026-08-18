import { api } from "@/api/axios";
import type { FilterValue } from "@/components/data-table/types";
import type {
  Account,
  AccountContact,
  AccountAddress,
  CreateAccountData,
  UpdateAccountData,
  CreateContactData,
  UpdateContactData,
  CreateAddressData,
  UpdateAddressData,
  PagedResult,
  AccountListParams,
} from "@/features/account/types";

const COLLECTION_FIELDS = new Set(["phone", "email"]);

function toFilterValue(filter: FilterValue): string {
  const esc = (s: string) => s.replace(/'/g, "''");

  if (filter.field === "tags") {
    const names = (Array.isArray(filter.value) ? filter.value : [filter.value])
      .filter((n): n is string | number => n != null);
    if (names.length === 0) return "";
    const expr = names.map((n) => `tags/any(t: t/name eq '${esc(String(n))}')`).join(" or ");
    return names.length > 1 ? `(${expr})` : expr;
  }

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

function buildODataQuery(params: AccountListParams): string {
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

export const accountService = {
  getAll: async (params?: AccountListParams, signal?: AbortSignal) => {
    const query = params ? buildODataQuery(params) : "";
    const response = await api.get<{ "@odata.count": number; value: Account[] }>(`/account?${query}`, { signal });
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
        } as PagedResult<Account>,
      },
    };
  },

  getByTag: async (tagName: string, signal?: AbortSignal) => {
    const esc = tagName.replace(/'/g, "''");
    const response = await api.get<Account[] | { value: Account[] }>(
      `/account?$filter=${encodeURIComponent(`tags/any(t: t/name eq '${esc}')`)}&$top=100`,
      { signal }
    );
    const body = response.data;
    return Array.isArray(body) ? body : body?.value ?? [];
  },

  getById: (id: string) =>
    api.get<{ data: Account; message: string; error: boolean; code: number }>(`/account/${id}`),

  create: (data: CreateAccountData) =>
    api.post<{ data: Account; message: string; error: boolean; code: number }>("/account", data),

  update: (id: string, data: UpdateAccountData) =>
    api.put<{ data: Account; message: string; error: boolean; code: number }>(`/account/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/account/${id}`),

  createContact: (accountId: string, data: CreateContactData) =>
    api.post<{ data: AccountContact; message: string; error: boolean; code: number }>(`/account/${accountId}/contacts`, data),

  updateContact: (accountId: string, contactId: string, data: UpdateContactData) =>
    api.put<{ data: AccountContact; message: string; error: boolean; code: number }>(`/account/${accountId}/contacts/${contactId}`, data),

  deleteContact: (accountId: string, contactId: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/account/${accountId}/contacts/${contactId}`),

  createAddress: (accountId: string, data: CreateAddressData) =>
    api.post<{ data: AccountAddress; message: string; error: boolean; code: number }>(`/account/${accountId}/addresses`, data),

  updateAddress: (accountId: string, addressId: string, data: UpdateAddressData) =>
    api.put<{ data: AccountAddress; message: string; error: boolean; code: number }>(`/account/${accountId}/addresses/${addressId}`, data),

  deleteAddress: (accountId: string, addressId: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/account/${accountId}/addresses/${addressId}`),

  assignTag: (accountId: string, tagId: string) =>
    api.post<{ message: string; error: boolean; code: number }>(`/account/${accountId}/tags/${tagId}`),

  removeTag: (accountId: string, tagId: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(`/account/${accountId}/tags/${tagId}`),
};
