import { api } from "@/api/axios";

export interface StockMovement {
  id: string;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  unitCost: number | null;
  currency: string | null;
  totalCost: number | null;
  type: "In" | "Out" | "Adjustment";
  supplierId: string | null;
  supplierName: string | null;
  destination: string | null;
  note: string | null;
  createdAt: string;
  createdByFullName: string;
}

export interface StockInData {
  quantity: number;
  unitCost?: number;
  currency?: string;
  supplierId?: string;
  note?: string;
}

export interface StockOutData {
  quantity: number;
  destination?: string;
  note?: string;
}

export interface StockAdjustData {
  newQuantity: number;
  newAvgCost?: number;
  note?: string;
}

export const stockService = {
  getMovements: (productId: string) =>
    api.get<{ value: StockMovement[] }>(`/product/${productId}/stock-movements`),

  stockIn: (productId: string, data: StockInData) =>
    api.post<{ data: StockMovement }>(`/product/${productId}/stock-in`, data),

  stockOut: (productId: string, data: StockOutData) =>
    api.post<{ data: StockMovement }>(`/product/${productId}/stock-out`, data),

  stockAdjust: (productId: string, data: StockAdjustData) =>
    api.post<{ data: StockMovement }>(`/product/${productId}/stock-adjust`, data),
};
