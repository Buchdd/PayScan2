// api/client.ts
import type { FrameworkUser, Stream, TransferPayload, LoginResponse, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:4000/api';

// Универсальный метод для запросов
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API Error at ${endpoint}:`, error);
    throw error;
  }
}

// Реальная авторизация через БД
export async function login(email: string, password: string): Promise<FrameworkUser> {
  try {
    const response = await fetchApi<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    if (response.user) {
      // Сохраняем токен если есть
      if (response.token) {
        localStorage.setItem('token', response.token);
      }
      return response.user;
    } else {
      throw new Error(response.message || 'Авторизация не удалась');
    }
  } catch (error) {
    console.error('Login failed:', error);
    // Если сервер недоступен, используем заглушку
    throw error;
  }
}

// Получение потоков/стримов пользователя
export async function fetchStreams(): Promise<Stream[]> {
  try {
    const response = await fetchApi<ApiResponse<Stream[]>>('/streams');
    
    if (response.status === 'success' && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Не удалось загрузить потоки');
    }
  } catch (error) {
    console.error('Failed to fetch streams:', error);
    throw error;
  }
}

// Создание перевода
export async function createTransfer(payload: TransferPayload): Promise<{ reference: string }> {
  try {
    const response = await fetchApi<ApiResponse<{ reference: string }>>('/transfers', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (response.status === 'success' && response.data) {
      return response.data;
    } else {
      throw new Error(response.message || 'Не удалось создать перевод');
    }
  } catch (error) {
    console.error('Transfer failed:', error);
    throw error;
  }
}

// Проверка здоровья API
export async function checkApiHealth(): Promise<boolean> {
  try {
    const response = await fetchApi<{ status: string }>('/health');
    return response.status === 'ok';
  } catch {
    return false;
  }
}

// Проверка подключения к БД
export async function checkDbHealth(): Promise<boolean> {
  try {
    const response = await fetchApi<{ status: string }>('/db-health');
    return response.status === 'ok';
  } catch {
    return false;
  }
}