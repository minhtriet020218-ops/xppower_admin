import { API_ENDPOINTS } from './Endpoints';

export interface HttpResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Abstraction API Client theo nguyên lý Dependency Inversion (DIP)
 */
export class AxiosClient {
  private static baseUrl = 'http://localhost:8080';

  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const token = sessionStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}${endpoint}${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static async post<T>(endpoint: string, body: any): Promise<T> {
    const token = sessionStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // ⭐ BỔ SUNG PHƯƠNG THỨC PUT (GIỮ NGUYÊN CẤU TRÚC FETCH)
  static async put<T>(endpoint: string, body: any): Promise<T> {
    const token = sessionStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  // ⭐ BỔ SUNG PHƯƠNG THỨC DELETE (GIỮ NGUYÊN CẤU TRÚC FETCH)
  static async delete<T>(endpoint: string, body?: any): Promise<T> {
    const token = sessionStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': sessionStorage.getItem('csrfToken') || '',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    // Trường hợp trả về rỗng hoặc JSON
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }
}