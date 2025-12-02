import { mockFrameworkUser } from '../data/mock';
import type { FrameworkUser, TransferPayload } from '../types';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

async function request<T>(
  input: RequestInfo,
  init?: RequestInit,
  fallback?: () => T,
): Promise<T> {
  try {
    const response = await fetch(input, init);
    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }
    return (await response.json()) as T;
  } catch (error) {
    console.warn('Falling back to mock data:', error);
    if (fallback) {
      return fallback();
    }
    throw error;
  }
}

export function login(email: string, password: string): Promise<FrameworkUser> {
  return request(
    `${API_BASE_URL}/api/auth/login`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    },
    () => ({ ...mockFrameworkUser, email }),
  ).then((payload: any) => payload.user ?? payload);
}

export function fetchStreams(): Promise<FrameworkUser['streams']> {
  return request(
    `${API_BASE_URL}/api/streams`,
    undefined,
    () => mockFrameworkUser.streams,
  );
}

export function createTransfer(payload: TransferPayload) {
  return request(
    `${API_BASE_URL}/api/transfers`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    },
    () => ({
      status: 'queued',
      transfer: payload,
      reference: `TRX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    }),
  );
}


