import { type DashboardStatsDTO } from '../dtos/DashboardDTO';
import { AxiosClient } from './api/AxiosClient';
import { API_ENDPOINTS } from './api/Endpoints';

export class DashboardService {
  /**
   * Lấy số liệu thống kê tổng quan cho Dashboard từ Backend
   */
  static async getStats(): Promise<DashboardStatsDTO> {
    try {
      // Gọi API thực tế thông qua AxiosClient phương thức GET
      const response = await AxiosClient.get<DashboardStatsDTO>(
        API_ENDPOINTS.DASHBOARD.GET_STATS
      );

      return response;
    } catch (error: any) {
      console.error('Failed to fetch dashboard stats:', error);
      throw new Error(error.message || 'Không thể tải dữ liệu thống kê từ máy chủ.');
    }
  }
}