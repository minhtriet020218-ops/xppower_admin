import { type DashboardStatsDTO, DashboardStatsDTOBuilder } from '../dtos/DashboardDTO';
import { AxiosClient } from './api/AxiosClient';
import { API_ENDPOINTS } from './api/Endpoints';

export class DashboardService {
  static async getStats(): Promise<DashboardStatsDTO> {
    try {
      return new DashboardStatsDTOBuilder()
        .setTotals(2198, 2112, 70, 15)
        .setDepartmentDistribution([
          { name: 'PS Production', count: 558 },
          { name: 'Không xác định', count: 323 },
          { name: 'ENG-PS-IDL', count: 261 },
          { name: 'IE-IDL', count: 180 },
          { name: 'NPI-IDL', count: 100 },
          { name: 'PMC', count: 68 },
          { name: 'PP/Cable-PS Off', count: 63 },
          { name: 'HVHP-PS Off', count: 51 },
          { name: 'FINANCE', count: 51 },
          { name: 'FACILITY', count: 46 },
          { name: 'P&O', count: 40 },
          { name: 'Engineering', count: 29 },
          { name: 'TRO', count: 25 },
          { name: 'Quality', count: 24 },
          { name: 'ENG-Mags', count: 24 },
          { name: 'QA-HVHP', count: 18 },
          { name: 'EMCO-PS', count: 18 },
          { name: 'HVHP & RF Project', count: 17 },
          { name: 'EMCO-ENG-PS', count: 16 },
          { name: 'P&O IDL', count: 15 },
          { name: 'WH-DL OU', count: 15 },
          { name: 'Category Sourcing HVHP', count: 15 },
          { name: 'Production', count: 15 },
          { name: 'Global Planning', count: 14 },
          { name: 'Component Engineering', count: 14 },
          { name: 'QA-Mags', count: 13 },
          { name: 'EMCO-QA', count: 12 },
          { name: 'Mags Production Off', count: 12 },
          { name: 'Operations', count: 10 },
          { name: 'WH-DL OU2', count: 10 }
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