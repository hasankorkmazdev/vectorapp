export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string | null;
  email: string | null;
  createdAt: string;
  updatedAt: string | null;
}

export interface CreateSupplierData {
  name: string;
  phone?: string;
  email?: string;
}

export interface UpdateSupplierData {
  name: string;
  phone?: string;
  email?: string;
}
