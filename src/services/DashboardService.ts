import { DashboardStatsDTO, DashboardStatsDTOBuilder } from '../dtos/DashboardDTO';
import { AxiosClient } from './api/AxiosClient';
import { API_ENDPOINTS } from './api/Endpoints';

export class DashboardService {
  static async getStats(): Promise<DashboardStatsDTO> {
    try {
      // Thực tế sẽ gọi API:
      // return await AxiosClient.get<DashboardStatsDTO>(API_ENDPOINTS.DASHBOARD.GET_STATS);

      // Mock data sử dụng Builder Pattern
      return new DashboardStatsDTOBuilder()
        .setTotals(2198, 2112, 70, 15)
        .setDepartmentDistribution([
          { name: 'PS Production', count: 558 },
          { name: 'Không xác định', count: 328 },
          { name: 'ENG-PS-IDL', count: 261 },
          { name: 'IE-IDL', count: 180 },
          { name: 'NPI-IDL', count: 100 },
          { name: 'PMC', count: 88 },
          { name: 'PP/Cable-PS Off', count: 61 }
        ])
        .setStatusDistribution([
          { status: 'In Stock', count: 180 },
          { status: 'In Use', count: 1635 },
          { status: 'Damaged', count: 45 },
          { status: 'Không xác định', count: 465 },
          { status: 'Write off', count: 20 },
          { status: 'Retired', count: 15 },
          { status: 'Backup', count: 10 }
        ])
        .setTypeDistribution([
          { type: 'Laptop', count: 611 },
          { type: 'Monitor', count: 822 },
          { type: 'Network Device', count: 369 },
          { type: 'Desktop', count: 100 },
          { type: 'Scanner', count: 45 }
        ])
        .build();
    } catch (error) {
      console.error('Failed to fetch dashboard stats', error);
      throw error;
    }
  }
}