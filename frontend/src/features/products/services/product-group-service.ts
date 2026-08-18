import { api } from "@/api/axios";

export interface ProductGroup {
  id: string;
  name: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateProductGroupData {
  name: string;
  icon: string;
}

export const productGroupService = {
  getAll: () =>
    api.get<{ value: ProductGroup[] }>("/productgroup?$orderby=name"),

  create: (data: CreateProductGroupData) =>
    api.post<{ data: ProductGroup; message: string; error: boolean; code: number }>(
      "/productgroup",
      data
    ),

  delete: (id: string) =>
    api.delete<{ message: string; error: boolean; code: number }>(
      `/productgroup/${id}`
    ),
};
