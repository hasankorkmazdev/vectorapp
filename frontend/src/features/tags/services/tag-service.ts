import { api } from "@/api/axios";
import type { Tag, CreateTagData, UpdateTagData } from "@/features/tags/types";

export const tagService = {
  getAll: async (signal?: AbortSignal) => {
    const response = await api.get<Tag[] | { value: Tag[] }>(
      "/tag?$orderby=name&$top=100",
      { signal }
    );
    const body = response.data;
    return Array.isArray(body) ? body : body?.value ?? [];
  },

  create: (data: CreateTagData) =>
    api.post<{ data: Tag }>("/tag", data),

  update: (id: string, data: UpdateTagData) =>
    api.put<{ data: Tag }>(`/tag/${id}`, data),

  delete: (id: string) =>
    api.delete<{ message: string }>(`/tag/${id}`),
};
