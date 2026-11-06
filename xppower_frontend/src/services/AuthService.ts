import { type LoginRequestDTO } from '../dtos/AuthDTO';
import { AxiosClient } from './api/AxiosClient';
import { API_ENDPOINTS } from './api/Endpoints';

export interface LoginResponse {
  token: string;
  username: string;
}

export class AuthService {
  static async login(loginDto: LoginRequestDTO): Promise<LoginResponse> {
    try {
      const response = await AxiosClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN, 
        loginDto
      );

      // Lưu vào sessionStorage để TẮT WEB LÀ TỰ ĐỘNG ĐĂNG XUẤT
      if (response && response.token) {
        sessionStorage.setItem('accessToken', response.token);
        if (response.username) {
          sessionStorage.setItem('username', response.username);
        }
      }

      return response;
    } catch (error: any) {
      const errorMsg = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin hoặc kết nối mạng.';
      throw new Error(errorMsg);
    }
  }

  static logout(): void {
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('username');
  }

  static isAuthenticated(): boolean {
    return !!sessionStorage.getItem('accessToken');
  }
}