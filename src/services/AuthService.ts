import { LoginRequestDTO } from '../dtos/AuthDTO';
import { AxiosClient } from './api/AxiosClient';
import { API_ENDPOINTS } from './api/Endpoints';

export class AuthService {
  static async login(loginDto: LoginRequestDTO): Promise<{ token: string; username: string }> {
    try {
      // Gọi API thực tế thông qua AxiosClient
      // const res = await AxiosClient.post<{ token: string; username: string }>(API_ENDPOINTS.AUTH.LOGIN, loginDto);
      // return res;

      // Mock dữ liệu khi chưa có Backend
      if (loginDto.username === 'admin' && loginDto.passwordHash === 'admin123') {
        const mockToken = 'mock_jwt_token_12345';
        sessionStorage.setItem('accessToken', mockToken);
        return { token: mockToken, username: loginDto.username };
      }
      throw new Error('Tên đăng nhập hoặc mật khẩu không chính xác!');
    } catch (error: any) {
      throw new Error(error.message || 'Đăng nhập thất bại');
    }
  }

  static logout(): void {
    sessionStorage.removeItem('accessToken');
  }

  static isAuthenticated(): boolean {
    return !!sessionStorage.getItem('accessToken');
  }
}