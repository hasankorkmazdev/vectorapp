import type { FilterValue } from "@/components/data-table/types";

export interface CustomerContact {
  id: string;
  fullName: string;
  title: string | null;
  email: string | null;
  phone: string | null;
  gsm?: string | null;
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

export type UpdateCustomerData = CreateCustomerData;

export interface CreateContactData {
  fullName: string;
  title?: string;
  email?: string;
  phone?: string;
  gsm?: string;
  isPrimary?: boolean;
}

export type UpdateContactData = CreateContactData;

export interface CreateAddressData {
  label: string;
  country?: string;
  city?: string;
  district?: string;
  postalCode?: string;
  address?: string;
  isPrimary?: boolean;
}

export type UpdateAddressData = CreateAddressData;

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
  filters?: FilterValue[];
}
