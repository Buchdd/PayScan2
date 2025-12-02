export type CurrencyCode = 'RUB' | 'THB' | 'CNY' | 'USD';

export interface Wallet {
  id: string;
  currency: CurrencyCode | string;
  balance: number;
  label?: string;
}

export interface Tenant {
  id: string;
  title: string;
  wallets: Wallet[];
}

export interface Stream {
  id: string;
  type: string;
  label: string;
  description?: string;
  tenants: Tenant[];
}

export interface FrameworkUser {
  id: string;
  name: string;
  email: string;
  streams: Stream[];
}

export interface TransferPayload {
  fromWallet: string;
  toWallet: string;
  amount: number;
  memo?: string;
}


