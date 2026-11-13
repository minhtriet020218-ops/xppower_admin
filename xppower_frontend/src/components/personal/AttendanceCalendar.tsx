import React, { useMemo } from 'react';
import type { AttendanceDayDTO } from '../../dtos/PersonalDTO';
import { formatDuration, pad, timeToMinutes, toDateKey } from '../../utils/personalDate';

/** Số phút nghỉ trưa trừ khỏi giờ làm. Đổi theo quy định công ty (đặt 0 nếu không trừ). */
const LUNCH_BREAK_MINUTES = 60;

const MONTH_NAMES = [
  'Tháng Một', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư', 'Tháng Năm', 'Tháng Sáu',
  'Tháng Bảy', 'Tháng Tám', 'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai',
];
const DOW = ['Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy', 'Chủ nhật'];

interface AttendanceCalendarProps {
  year: number;
  monthIndex: number; // 0-11
  records: AttendanceDayDTO[];
  loading: boolean;
  isMock: boolean;
  onPrev: () => void;
  onNext: () => void;
}

const workedMinutes = (r?: AttendanceDayDTO): number | null => {
  if (!r?.checkIn || !r?.checkOut) return null;
  const span = timeToMinutes(r.checkOut) - timeToMinutes(r.checkIn);
  return span > 0 ? Math.max(0, span - LUNCH_BREAK_MINUTES) : null;
};

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  year, monthIndex, records, loading, isMock, onPrev, onNext,
}) => {
  const todayKey = toDateKey(new Date());

  const byDate = useMemo(() => {
    const map = new Map<string, AttendanceDayDTO>();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  const cells = useMemo(() => {
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
    const lead = (new Date(year, monthIndex, 1).getDay() + 6) % 7; // Thứ hai là cột đầu
    const total = Math.ceil((lead + daysInMonth) / 7) * 7;
    return Array.from({ length: total }, (_, i) => {
      const day = i - lead + 1;
      return day >= 1 && day <= daysInMonth ? day : null;
    });
  }, [year, monthIndex]);

  const summary = useMemo(() => {
    let fullDays = 0;
    let missing = 0;
    let minutes = 0;
    records.forEach((r) => {
      const worked = workedMinutes(r);
      if (worked !== null) {
        fullDays += 1;
        minutes += worked;
      } else if (r.checkIn && !r.checkOut && r.date < todayKey) {
        missing += 1;
      }
    });
    return { fullDays, missing, minutes };
  }, [records, todayKey]);

  return (
    <section className="pp-cal" aria-label="Lịch chấm công">
      <div className="d-flex justify-content-between align-items-center mb-3 gap-2">
        <button type="button" className="btn btn-light btn-sm fw-semibold border" onClick={onPrev}>
          ← Tháng trước
        </button>
        <h2 className="fs-5 fw-bold m-0 text-center">{MONTH_NAMES[monthIndex]} {year}</h2>
        <button type="button" className="btn btn-light btn-sm fw-semibold border" onClick={onNext}>
          Tháng sau →
        </button>
      </div>

      <div className="pp-sum mb-3" aria-live="polite">
        <span>Ngày đủ công: <b>{summary.fullDays}</b></span>
        <span>Thiếu giờ ra: <b className={summary.missing ? 'text-warning-emphasis' : ''}>{summary.missing}</b></span>
        <span>Tổng giờ làm: <b>{formatDuration(summary.minutes)}</b>
          {LUNCH_BREAK_MINUTES > 0 && <span className="text-muted"> (đã trừ nghỉ trưa {LUNCH_BREAK_MINUTES} phút/ngày)</span>}
        </span>
      </div>

      {isMock && (
        <div className="alert alert-warning py-2 small mb-3" role="status">
          Đang hiển thị dữ liệu chấm công mẫu vì máy chủ chưa có API chấm công.
        </div>
      )}

      <div className="pp-cal-grid" style={{ opacity: loading ? 0.5 : 1 }}>
        {DOW.map((name, i) => (
          <div key={name} className={`pp-cal-dow ${i === 6 ? 'is-sun' : i === 5 ? 'is-sat' : ''}`}>{name}</div>
        ))}

        {cells.map((day, idx) => {
          if (day === null) return <div key={`b${idx}`} className="pp-cell is-blank" aria-hidden="true" />;

          const key = `${year}-${pad(monthIndex + 1)}-${pad(day)}`;
          const rec = byDate.get(key);
          const col = idx % 7;
          const isWeekend = col >= 5;
          const isToday = key === todayKey;
          const worked = workedMinutes(rec);
          const missingOut = !!rec?.checkIn && !rec?.checkOut && key < todayKey;

          const label = rec
            ? `Ngày ${day}: vào ${rec.checkIn ?? 'chưa có'}, ra ${rec.checkOut ?? 'chưa có'}${worked !== null ? `, làm ${formatDuration(worked)}` : ''}`
            : `Ngày ${day}: không có dữ liệu chấm công`;

          return (
            <div
              key={key}
              className={`pp-cell ${isWeekend ? 'is-weekend' : ''} ${isToday ? 'is-today' : ''}`}
              aria-label={label}
              title={worked !== null ? `Làm ${formatDuration(worked)}` : undefined}
            >
              <span className="pp-cell-day">{day}</span>
              {rec?.checkIn && <span className="pp-badge pp-badge-in">↓ {rec.checkIn}</span>}
              {rec?.checkOut && <span className="pp-badge pp-badge-out">↑ {rec.checkOut}</span>}
              {missingOut && <span className="pp-badge pp-badge-missing">Thiếu ra</span>}
            </div>
          );
        })}
      </div>
    </section>
  );
};
