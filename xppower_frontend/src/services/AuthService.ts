import { type LoginRequestDTO } from '../dtos/AuthDTO';
import { AxiosClient } from './api/AxiosClient';
import { API_ENDPOINTS } from './api/Endpoints';

export interface LoginResponse {
  token: string;
  username: string;
}

export class AuthService {
  /**
   * Gửi yêu cầu đăng nhập đến Backend thực tế
   * @param loginDto Dữ liệu đăng nhập đã được build và sanitize an toàn
   * @returns Promise chứa token xác thực và tên tài khoản
   */
  static async login(loginDto: LoginRequestDTO): Promise<LoginResponse> {
    try {
      // Gọi API thực tế thông qua AxiosClient với endpoint chuẩn từ cấu hình
      const response = await AxiosClient.post<LoginResponse>(
        API_ENDPOINTS.AUTH.LOGIN, 
        loginDto
      );

      // Kiểm tra và lưu trữ token bảo mật vào localStorage nếu phản hồi hợp lệ
      if (response && response.token) {
        localStorage.setItem('accessToken', response.token);
      } else {
        throw new Error('Phản hồi từ máy chủ không hợp lệ.');
      }

      return response;
    } catch (error: any) {
      // Bắt và xử lý ngoại lệ chi tiết (lỗi kết nối mạng, lỗi 401 Unauthorized, 500 Server Error,...)
      const errorMsg = error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin hoặc kết nối mạng.';
      throw new Error(errorMsg);
    }
  }

  /**
   * Xử lý đăng xuất, xóa phiên làm việc của người dùng
   */
  static logout(): void {
    localStorage.removeItem('accessToken');
  }

  /**
   * Kiểm tra trạng thái xác thực hiện tại của người dùng
   */
  static isAuthenticated(): boolean {
    return !!localStorage.getItem('accessToken');
  }
}