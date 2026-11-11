import { AxiosClient } from './api/AxiosClient';

export interface TabPermission {
  tabName: string;
  permission: 'View + Edit' | 'View only' | 'Không được phép';
}

export interface UserDTO {
  id: string;
  username: string;
  fullName: string;
  email: string;
  department: string;
  role: 'ADMIN' | 'USER';
  status: 'Hoạt động' | 'Đã khóa';
  permissions: TabPermission[];
  password?: string;
}

export class UserService {
  static async getUsers(): Promise<UserDTO[]> {
    return await AxiosClient.get<UserDTO[]>('/api/v1/users');
  }

  static async createUser(data: Omit<UserDTO, 'id'>): Promise<UserDTO> {
    return await AxiosClient.post<UserDTO>('/api/v1/users', data);
  }

  static async updateUser(id: string, data: Partial<UserDTO>): Promise<UserDTO> {
    return await AxiosClient.put<UserDTO>(`/api/v1/users/${id}`, data);
  }

  static async deleteUser(id: string): Promise<void> {
    return await AxiosClient.delete(`/api/v1/users/${id}`);
  }
}