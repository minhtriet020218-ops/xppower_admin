/** Các hàm ngày giờ dùng chung cho Trang cá nhân (luôn dùng giờ địa phương, không dùng toISOString) */

export const pad = (n: number): string => String(n).padStart(2, '0');

export const toDateKey = (d: Date): string =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

export const toMonthKey = (year: number, monthIndex: number): string =>
  `${year}-${pad(monthIndex + 1)}`;

export const parseDateKey = (key: string): Date => {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d);
};

/** "07:46" -> 466 (phút trong ngày) */
export const timeToMinutes = (t: string): number => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};

/** 485 -> "8h05" */
export const formatDuration = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h}h${pad(m)}`;
};

/** Liệt kê các ngày từ from đến to (gồm cả hai đầu). Giới hạn để tránh vòng lặp quá lớn. */
export const eachDayBetween = (from: string, to: string, limit = 62): string[] => {
  if (!from || !to) return [];
  const start = parseDateKey(from);
  const end = parseDateKey(to);
  if (end < start) return [];
  const days: string[] = [];
  const cursor = new Date(start);
  while (cursor <= end && days.length < limit) {
    days.push(toDateKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
};

const WEEKDAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export const formatDayLabel = (key: string): string => {
  const d = parseDateKey(key);
  return `${WEEKDAY_LABELS[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
};

export const formatDateVN = (key: string): string => {
  const d = parseDateKey(key);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};
