import type {
  AttendanceDayDTO,
  LeaveRequestDTO,
  LeaveRequestPayload,
  MealOrderDTO,
  MealOrderItem,
  MyProfileDTO,
  ShiftChangeDTO,
  ShiftChangePayload,
  WithSource,
} from '../dtos/PersonalDTO';
import type { AssetDTO } from '../dtos/AssetDTO';
import { AxiosClient } from './api/AxiosClient';
import { API_ENDPOINTS } from './api/Endpoints';
import { AssetService } from './AssetService';
import { UserService } from './UserService';
import { DepartmentService } from './DepartmentService';
import { pad, toDateKey } from '../utils/personalDate';


/**
 * Backend hiện CHƯA có các API /api/v1/personal/*.
 * Mỗi hàm bên dưới gọi API thật trước; nếu lỗi thì rơi về dữ liệu mẫu lưu trong localStorage
 * (theo từng username) để giao diện chạy được. Khi backend xong, không cần sửa UI,
 * chỉ cần dựng đúng các endpoint trong Endpoints.ts (PERSONAL).
 */

const storageKey = (kind: string, username: string) => `personal:${kind}:${username}`;

const readLocal = <T>(kind: string, username: string): T[] => {
  try {
    const raw = localStorage.getItem(storageKey(kind, username));
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
};

const writeLocal = <T>(kind: string, username: string, list: T[]): void => {
  try {
    localStorage.setItem(storageKey(kind, username), JSON.stringify(list));
  } catch {
    /* localStorage đầy hoặc bị chặn: bỏ qua, dữ liệu mẫu chỉ mang tính tạm */
  }
};

const newId = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

/** Sinh dữ liệu chấm công mẫu cho một tháng: ngày thường đến trước hôm nay, thỉnh thoảng thiếu giờ ra. */
const buildMockAttendance = (monthKey: string): AttendanceDayDTO[] => {
  const [year, month] = monthKey.split('-').map(Number);
  const todayKey = toDateKey(new Date());
  const lastDay = new Date(year, month, 0).getDate();
  const result: AttendanceDayDTO[] = [];

  for (let day = 1; day <= lastDay; day++) {
    const date = `${year}-${pad(month)}-${pad(day)}`;
    const weekday = new Date(year, month - 1, day).getDay();
    if (weekday === 0 || weekday === 6 || date >= todayKey) continue;

    const seed = (year * 372 + month * 31 + day) % 97;
    const inMin = 7 * 60 + 40 + (seed % 14);        // 07:40 - 07:53
    const outMin = 16 * 60 + 36 + ((seed * 7) % 24); // 16:36 - 16:59
    const fmt = (m: number) => `${pad(Math.floor(m / 60))}:${pad(m % 60)}`;
    result.push({
      date,
      checkIn: fmt(inMin),
      checkOut: seed % 11 === 0 ? null : fmt(outMin),
    });
  }
  return result;
};

export class PersonalService {
  static getCurrentUsername(): string {
    return sessionStorage.getItem('username') || '';
  }

  /** Ghép thông tin từ bảng users (họ tên, email, bộ phận) và staff (chức vụ, ca làm). */
  static async getMyProfile(): Promise<MyProfileDTO> {
    const username = this.getCurrentUsername();
    const base: MyProfileDTO = {
      username,
      fullName: username,
      email: '',
      department: '-',
      position: '-',
      shift: '-',
      role: '-',
    };

    const [users, staff] = await Promise.allSettled([
      UserService.getUsers(),
      DepartmentService.getStaffList(),
    ]);

    if (users.status === 'fulfilled') {
      const u = users.value.find((x) => x.username === username);
      if (u) {
        base.fullName = u.fullName || base.fullName;
        base.email = u.email || '';
        base.department = u.department || base.department;
        base.role = u.role;
      }
    }
    if (staff.status === 'fulfilled') {
      const s = staff.value.find((x) => x.staffCode === username);
      if (s) {
        base.fullName = s.fullName || base.fullName;
        base.position = s.position || base.position;
        base.department = s.department || base.department;
        base.shift = s.shift || base.shift;
        base.email = base.email || s.email || '';
      }
    }
    return base;
  }

  /** Tài sản liên quan tới người dùng: đang dùng (staffCode) và đang quản lý (managedBy). */
  static async getMyAssets(profile: MyProfileDTO): Promise<{ owned: AssetDTO[]; managed: AssetDTO[] }> {
    const all = await AssetService.getAssets();
    const same = (a?: string | null, b?: string | null) =>
      !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

    const owned = all.filter(
      (a) => same(a.staffCode, profile.username) || (!!profile.email && same(a.mailUser, profile.email)),
    );
    const managed = all.filter(
      (a) => same(a.managedBy, profile.username) || same(a.managedBy, profile.fullName),
    );
    return { owned, managed };
  }

  static async getAttendance(monthKey: string): Promise<WithSource<AttendanceDayDTO[]>> {
    try {
      const data = await AxiosClient.get<AttendanceDayDTO[]>(API_ENDPOINTS.PERSONAL.ATTENDANCE, { month: monthKey });
      return { data, isMock: false };
    } catch {
      return { data: buildMockAttendance(monthKey), isMock: true };
    }
  }

  // ---------- Nghỉ phép ----------
  static async getLeaveRequests(): Promise<LeaveRequestDTO[]> {
    try {
      return await AxiosClient.get<LeaveRequestDTO[]>(API_ENDPOINTS.PERSONAL.LEAVE);
    } catch {
      return readLocal<LeaveRequestDTO>('leave', this.getCurrentUsername());
    }
  }

  static async createLeaveRequest(payload: LeaveRequestPayload): Promise<LeaveRequestDTO> {
    try {
      return await AxiosClient.post<LeaveRequestDTO>(API_ENDPOINTS.PERSONAL.LEAVE, payload);
    } catch {
      const username = this.getCurrentUsername();
      const item: LeaveRequestDTO = { ...payload, id: newId(), status: 'Chờ duyệt', createdAt: new Date().toISOString() };
      writeLocal('leave', username, [item, ...readLocal<LeaveRequestDTO>('leave', username)]);
      return item;
    }
  }

  // ---------- Đổi ca ----------
  static async getShiftChanges(): Promise<ShiftChangeDTO[]> {
    try {
      return await AxiosClient.get<ShiftChangeDTO[]>(API_ENDPOINTS.PERSONAL.SHIFT_CHANGE);
    } catch {
      return readLocal<ShiftChangeDTO>('shift', this.getCurrentUsername());
    }
  }

  static async createShiftChange(payload: ShiftChangePayload): Promise<ShiftChangeDTO> {
    try {
      return await AxiosClient.post<ShiftChangeDTO>(API_ENDPOINTS.PERSONAL.SHIFT_CHANGE, payload);
    } catch {
      const username = this.getCurrentUsername();
      const item: ShiftChangeDTO = { ...payload, id: newId(), status: 'Chờ duyệt', createdAt: new Date().toISOString() };
      writeLocal('shift', username, [item, ...readLocal<ShiftChangeDTO>('shift', username)]);
      return item;
    }
  }

  // ---------- Đặt cơm ----------
  static async getMealOrders(): Promise<MealOrderDTO[]> {
    try {
      return await AxiosClient.get<MealOrderDTO[]>(API_ENDPOINTS.PERSONAL.MEAL_ORDERS);
    } catch {
      return readLocal<MealOrderDTO>('meal', this.getCurrentUsername());
    }
  }

  static async createMealOrder(items: MealOrderItem[]): Promise<MealOrderDTO> {
    try {
      return await AxiosClient.post<MealOrderDTO>(API_ENDPOINTS.PERSONAL.MEAL_ORDERS, { items });
    } catch {
      const username = this.getCurrentUsername();
      const item: MealOrderDTO = { id: newId(), items, createdAt: new Date().toISOString() };
      writeLocal('meal', username, [item, ...readLocal<MealOrderDTO>('meal', username)]);
      return item;
    }
  }
}
