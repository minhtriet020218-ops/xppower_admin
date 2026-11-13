/** Một ngày chấm công (giờ dạng "HH:mm", ngày dạng "YYYY-MM-DD") */
export interface AttendanceDayDTO {
  date: string;
  checkIn?: string | null;
  checkOut?: string | null;
}

export type LeaveType = "Phép năm" | "Nghỉ ốm" | "Nghỉ việc riêng" | "Nghỉ không lương";
export type LeaveDuration = "Cả ngày" | "Nửa ngày sáng" | "Nửa ngày chiều";
export type RequestStatus = "Chờ duyệt" | "Đã duyệt" | "Từ chối";

export interface LeaveRequestPayload {
  managerEmail: string;
  leaderEmail?: string;
  supervisorEmail?: string;
  leaveType: LeaveType;
  duration: LeaveDuration;
  fromDate: string;
  toDate: string;
  reason?: string;
}

export interface LeaveRequestDTO extends LeaveRequestPayload {
  id: string;
  status: RequestStatus;
  createdAt: string;
}

export interface ShiftChangePayload {
  currentShift: string;
  desiredShift: string;
  reason: string;
}

export interface ShiftChangeDTO extends ShiftChangePayload {
  id: string;
  status: RequestStatus;
  createdAt: string;
}

export interface MealOrderItem {
  date: string;
  shift: string;
  dish: string;
}

export interface MealOrderDTO {
  id: string;
  items: MealOrderItem[];
  createdAt: string;
}

/** Thông tin người đang đăng nhập, ghép từ users + staff */
export interface MyProfileDTO {
  username: string;
  fullName: string;
  email: string;
  department: string;
  position: string;
  shift: string;
  role: string;
}

/** Kết quả kèm cờ cho biết dữ liệu có phải dữ liệu mẫu (backend chưa có API) hay không */
export interface WithSource<T> {
  data: T;
  isMock: boolean;
}
