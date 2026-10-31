import type { AssetDTO, AssetFilterParams } from '../dtos/AssetDTO';
import { AxiosClient } from './api/AxiosClient';
import { API_ENDPOINTS } from './api/Endpoints';

export class AssetService {
  // Lấy danh sách
  static async getAssets(params?: AssetFilterParams): Promise<AssetDTO[]> {
    return await AxiosClient.get<AssetDTO[]>(API_ENDPOINTS.ASSETS.GET_LIST, params);
  }

  // Tạo mới
  static async createAsset(data: Omit<AssetDTO, 'id'>): Promise<AssetDTO> {
    return await AxiosClient.post<AssetDTO>(API_ENDPOINTS.ASSETS.GET_LIST, data);
  }

  // Cập nhật
  static async updateAsset(id: string, data: Partial<AssetDTO>): Promise<AssetDTO> {
    return await AxiosClient.put<AssetDTO>(`${API_ENDPOINTS.ASSETS.GET_LIST}/${id}`, data);
  }

  // Xóa / Thanh lý (Asset Liquidation)
  static async deleteAssets(ids: string[]): Promise<void> {
    // Sử dụng cấu hình request với body cho phương thức DELETE
    await AxiosClient.delete(API_ENDPOINTS.ASSETS.GET_LIST, { data: { ids } });
  }
}