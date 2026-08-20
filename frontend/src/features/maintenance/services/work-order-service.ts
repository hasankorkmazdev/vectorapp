import { api } from "@/api/axios";
import type {
  MaintenanceWorkOrder,
  MaintenanceWorkOrderListItem,
  MaintenanceWorkOrderStatus,
  MaintenanceWorkOrderItem,
  MaintenanceNote,
  MechanicOption,
  CreateWorkOrderData,
  AddWorkOrderItemData,
} from "@/features/maintenance/types";

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface WorkOrderListParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: string;
  status?: MaintenanceWorkOrderStatus;
  assignedToUserId?: string;
  equipmentId?: string;
}

function buildODataQuery(params: WorkOrderListParams): string {
  const parts: string[] = [];
  const filterParts: string[] = [];

  if (params.status) filterParts.push(`status eq '${params.status}'`);
  if (params.assignedToUserId) filterParts.push(`assignedToUserId eq ${params.assignedToUserId}`);
  if (params.equipmentId) filterParts.push(`equipmentId eq ${params.equipmentId}`);

  if (filterParts.length > 0) {
    parts.push(`$filter=${filterParts.join(" and ")}`);
  }

  if (params.sortBy) {
    parts.push(`$orderby=${params.sortBy}${params.sortDirection === "desc" ? " desc" : ""}`);
  } else {
    parts.push("$orderby=createdAt desc");
  }

  const top = params.pageSize || 20;
  const skip = ((params.page || 1) - 1) * top;
  parts.push(`$top=${top}`);
  parts.push(`$skip=${skip}`);
  parts.push("$count=true");

  return parts.join("&");
}

type Envelope<T> = { data: T; message: string; error: boolean; code: number };

export const workOrderService = {
  getMechanics: () => api.get<Envelope<MechanicOption[]>>("/maintenanceworkorder/mechanics"),

  getAll: async (params?: WorkOrderListParams, signal?: AbortSignal) => {
    const query = params ? buildODataQuery(params) : "";
    const response = await api.get<{ "@odata.count": number; value: MaintenanceWorkOrderListItem[] }>(`/maintenanceworkorder?${query}`, { signal });
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
        } as PagedResult<MaintenanceWorkOrderListItem>,
      },
    };
  },

  getById: (id: string) =>
    api.get<Envelope<MaintenanceWorkOrder>>(`/maintenanceworkorder/${id}`),

  create: (data: CreateWorkOrderData) =>
    api.post<Envelope<MaintenanceWorkOrder>>("/maintenanceworkorder", data),

  assign: (id: string, assignedToUserId: string) =>
    api.put<Envelope<MaintenanceWorkOrder>>(`/maintenanceworkorder/${id}/assign`, { assignedToUserId }),

  changeStatus: (id: string, status: MaintenanceWorkOrderStatus) =>
    api.put<Envelope<MaintenanceWorkOrder>>(`/maintenanceworkorder/${id}/status`, { status }),

  addItem: (id: string, data: AddWorkOrderItemData) =>
    api.post<Envelope<MaintenanceWorkOrderItem>>(`/maintenanceworkorder/${id}/items`, data),

  removeItem: (id: string, itemId: string) =>
    api.delete<Envelope<boolean>>(`/maintenanceworkorder/${id}/items/${itemId}`),

  addNote: (id: string, body: string) =>
    api.post<Envelope<MaintenanceNote>>(`/maintenanceworkorder/${id}/notes`, { body }),
};
