import { api } from "@/api/axios";
import type { Supplier, CreateSupplierData, UpdateSupplierData } from "@/features/suppliers/types";

export const supplierService = {
  getAll: async (signal?: AbortSignal) => {
    const response = await api.get<{ value: Supplier[] }>(
      "/supplier?$orderby=name&$top=500",
      { signal }
    );
    return response.data.value ?? [];
  },

  create: (data: CreateSupplierData) =>
    api.post<{ data: Supplier }>("/supplier", data),

  update: (id: string, data: UpdateSupplierData) =>
    api.put<{ data: Supplier }>(`/supplier/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/supplier/${id}`),
};
