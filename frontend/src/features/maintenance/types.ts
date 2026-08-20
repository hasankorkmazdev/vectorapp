export type MaintenanceWorkOrderStatus =
  | "Open"
  | "InProgress"
  | "OnHold"
  | "Completed"
  | "Closed"
  | "Cancelled";

export type MaintenanceWorkOrderItemType = "Part" | "Labor";

export interface Equipment {
  id: string;
  accountId: string;
  accountName: string | null;
  productId: string | null;
  productName: string | null;
  name: string;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

export interface EquipmentListItem {
  id: string;
  accountId: string;
  accountName: string | null;
  productId: string | null;
  productName: string | null;
  name: string;
  category: string | null;
  manufacturer: string | null;
  model: string | null;
  serialNumber: string | null;
  isActive: boolean;
  createdAt: string;
}

export interface CreateEquipmentData {
  accountId: string;
  productId?: string;
  name: string;
  category?: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  note?: string;
}

export interface UpdateEquipmentData extends CreateEquipmentData {
  isActive: boolean;
}

export interface MaintenanceWorkOrderItem {
  id: string;
  type: MaintenanceWorkOrderItemType;
  productId: string | null;
  productName: string | null;
  description: string | null;
  quantity: number;
  unitCost: number | null;
  currency: string | null;
  totalCost: number | null;
  removedAt: string | null;
  note: string | null;
  createdAt: string;
  createdById: string | null;
}

export interface MaintenanceNote {
  id: string;
  body: string;
  createdAt: string;
  createdById: string;
  createdByName: string | null;
}

export interface MaintenanceWorkOrder {
  id: string;
  equipmentId: string;
  equipmentName: string | null;
  accountId: string;
  accountName: string | null;
  title: string;
  description: string | null;
  status: MaintenanceWorkOrderStatus;
  assignedToUserId: string | null;
  assignedToUserName: string | null;
  requestedAt: string;
  startedAt: string | null;
  completedAt: string | null;
  closedAt: string | null;
  laborCost: number | null;
  currency: string | null;
  createdAt: string;
  updatedAt: string | null;
  items: MaintenanceWorkOrderItem[];
  notes: MaintenanceNote[];
}

export interface MaintenanceWorkOrderListItem {
  id: string;
  equipmentId: string;
  equipmentName: string | null;
  accountId: string;
  accountName: string | null;
  title: string;
  status: MaintenanceWorkOrderStatus;
  assignedToUserId: string | null;
  assignedToUserName: string | null;
  requestedAt: string;
  completedAt: string | null;
  closedAt: string | null;
  laborCost: number | null;
  createdAt: string;
}

export interface CreateWorkOrderData {
  equipmentId: string;
  title: string;
  description?: string;
  assignedToUserId?: string;
}

export interface MechanicOption {
  id: string;
  fullName: string;
}

export interface AddWorkOrderItemData {
  type: MaintenanceWorkOrderItemType;
  productId?: string;
  description?: string;
  quantity: number;
  unitCost?: number;
  note?: string;
}
