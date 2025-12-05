// types.ts
export type CurrencyCode = 'RUB' | 'USD' | 'EUR' | 'CNY' | 'THB';

export interface Client {
  client_id: number;
  first_name: string;
  last_name: string;
  full_name?: string; // будем вычислять
  email: string;
  phone: string;
  country: string;
  status: 'active' | 'inactive' | 'suspended';
  date_of_birth?: string;
  created_at: string;
}

export interface Wallet {
  id: number;
  wallet_id: number;
  client_id: number;
  currency_code: CurrencyCode | string;
  balance: number;
  wallet_type: 'main' | 'savings' | 'business';
  is_active: boolean;
  label?: string; // будем вычислять
}

export interface Tenant {
  id: string;
  title: string;
  client_id: number;
  wallets: Wallet[];
}

export interface Stream {
  id: string;
  type: 'personal' | 'business' | 'savings';
  label: string;
  description?: string;
  tenants: Tenant[];
}

export interface FrameworkUser {
  id: number;
  client_id: number;
  name: string;
  full_name: string;
  email: string;
  phone: string;
  country: string;
  status: string;
  streams: Stream[];
}

export interface TransferPayload {
  fromWallet: string | number;
  toWallet: string | number;
  amount: number;
  memo?: string;
}

// Типы для авторизации
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  user: FrameworkUser;
  message?: string;
}

// Типы для API
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  error?: string;
}