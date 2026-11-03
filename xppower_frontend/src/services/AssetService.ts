import type { AssetDTO, AssetFilterParams } from '../dtos/AssetDTO';
import { AxiosClient } from './api/AxiosClient';
import { API_ENDPOINTS } from './api/Endpoints';

type AssetPayload = Partial<Omit<AssetDTO, 'id' | 'imageUrl'>>;

/** Đóng gói dữ liệu + file ảnh thành multipart/form-data. imageUrl do server quản lý nên không gửi. */
const toFormData = (data: AssetPayload, image: File): FormData => {
  const form = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) form.append(key, String(value));
  });
  form.append('image', image);
  return form;
};

export class AssetService {
  // Lấy danh sách
  static async getAssets(params?: AssetFilterParams): Promise<AssetDTO[]> {
    return await AxiosClient.get<AssetDTO[]>(API_ENDPOINTS.ASSETS.GET_LIST, params);
  }

  // Tạo mới (có thể kèm hình ảnh)
  static async createAsset(data: Omit<AssetDTO, 'id'>, image?: File | null): Promise<AssetDTO> {
    return image
      ? await AxiosClient.postForm<AssetDTO>(API_ENDPOINTS.ASSETS.GET_LIST, toFormData(data, image))
      : await AxiosClient.post<AssetDTO>(API_ENDPOINTS.ASSETS.GET_LIST, data);
  }

  // Cập nhật (có thể kèm hình ảnh mới; không kèm thì giữ nguyên ảnh cũ)
  static async updateAsset(id: string, data: Partial<AssetDTO>, image?: File | null): Promise<AssetDTO> {
    const url = `${API_ENDPOINTS.ASSETS.GET_LIST}/${id}`;
    return image
      ? await AxiosClient.putForm<AssetDTO>(url, toFormData(data, image))
      : await AxiosClient.put<AssetDTO>(url, data);
  }

  // Xóa / Thanh lý (Asset Liquidation)
  static async deleteAssets(ids: string[]): Promise<void> {
    // AxiosClient.delete nhận trực tiếp body; server đọc req.body.ids
    await AxiosClient.delete(API_ENDPOINTS.ASSETS.GET_LIST, { ids });
  }
}