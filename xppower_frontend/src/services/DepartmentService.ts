import { AxiosClient } from './api/AxiosClient';

export interface StaffDTO {
  id: string;
  staffCode: string;
  fullName: string;
  position: string;
  department: string;
  email: string;
  hireDate: string;
  shift: string;
}

export class DepartmentService {
  // Lấy danh sách nhân viên từ PostgreSQL
  static async getStaffList(): Promise<StaffDTO[]> {
    return await AxiosClient.get<StaffDTO[]>('/api/v1/staff');
  }

  // ➕ Tạo mới nhân viên và lưu vào database
  static async createStaff(data: Omit<StaffDTO, 'id'>): Promise<StaffDTO> {
    return await AxiosClient.post<StaffDTO>('/api/v1/staff', data);
  }

  // ✏️ Cập nhật thông tin nhân viên trong database
  static async updateStaff(id: string, data: Partial<StaffDTO>): Promise<StaffDTO> {
    return await AxiosClient.put<StaffDTO>(`/api/v1/staff/${id}`, data);
  }

  // 🗑️ Xóa nhân viên khỏi database
  static async deleteStaff(id: string): Promise<void> {
    return await AxiosClient.delete(`/api/v1/staff/${id}`);
  }
}