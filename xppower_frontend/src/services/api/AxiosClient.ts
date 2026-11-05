export interface HttpResponse<T> {
  data: T;
  status: number;
  message?: string;
}

/**
 * Abstraction API Client theo nguyên lý Dependency Inversion (DIP)
 */
export class AxiosClient {
  // Lấy theo địa chỉ đang mở web: trên máy tính là localhost, trên điện thoại là IP của máy tính (vd 192.168.1.20)
  private static baseUrl = `${window.location.protocol}//${window.location.hostname}:8080`;

  static async get<T>(endpoint: string, params?: Record<string, any>): Promise<T> {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    const token = localStorage.getItem('accessToken'); // 🔄 Đồng bộ sang localStorage

    const response = await fetch(`${this.baseUrl}${endpoint}${query}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': localStorage.getItem('csrfToken') || '',
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static async post<T>(endpoint: string, body: any): Promise<T> {
    const token = localStorage.getItem('accessToken'); // 🔄 Đồng bộ sang localStorage

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': localStorage.getItem('csrfToken') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static async put<T>(endpoint: string, body: any): Promise<T> {
    const token = localStorage.getItem('accessToken'); // 🔄 Đồng bộ sang localStorage

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': localStorage.getItem('csrfToken') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static async delete<T>(endpoint: string, body?: any): Promise<T> {
    const token = localStorage.getItem('accessToken'); // 🔄 Đồng bộ sang localStorage

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': localStorage.getItem('csrfToken') || '',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }

  /** Ghép đường dẫn tương đối của server (vd /uploads/a.jpg) thành URL đầy đủ để hiển thị trong <img>. */
  static resolveUrl(path?: string | null): string {
    if (!path) return '';
    return /^https?:\/\//i.test(path) ? path : `${this.baseUrl}${path}`;
  }

  /** Gửi multipart/form-data. Không tự set Content-Type để trình duyệt tự thêm boundary. */
  private static async sendForm<T>(method: 'POST' | 'PUT', endpoint: string, form: FormData): Promise<T> {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': token ? `Bearer ${token}` : '',
        'X-CSRF-Token': localStorage.getItem('csrfToken') || '',
      },
      body: form,
    });

    if (!response.ok) {
      // Ưu tiên hiển thị thông báo lỗi cụ thể từ server (vd: "Ảnh vượt quá 5MB!")
      const err = await response.json().catch(() => null);
      throw new Error(err?.message || `API Error: ${response.statusText}`);
    }

    return response.json();
  }

  static postForm<T>(endpoint: string, form: FormData): Promise<T> {
    return this.sendForm<T>('POST', endpoint, form);
  }

  static putForm<T>(endpoint: string, form: FormData): Promise<T> {
    return this.sendForm<T>('PUT', endpoint, form);
  }
}