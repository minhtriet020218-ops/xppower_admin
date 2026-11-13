import React, { useEffect, useState } from 'react';
import type { LeaveDuration, LeaveRequestDTO, LeaveType, MyProfileDTO } from '../../dtos/PersonalDTO';
import { PersonalService } from '../../services/PersonalService';
import { formatDateVN, toDateKey } from '../../utils/personalDate';
import { EMAIL_REGEX } from './constants';
import { StatusBadge } from './StatusBadge';

const LEAVE_TYPES: LeaveType[] = ['Phép năm', 'Nghỉ ốm', 'Nghỉ việc riêng', 'Nghỉ không lương'];
const DURATIONS: LeaveDuration[] = ['Cả ngày', 'Nửa ngày sáng', 'Nửa ngày chiều'];

interface LeaveRequestPanelProps {
  profile: MyProfileDTO | null;
  onNotice: (type: 'success' | 'danger', text: string) => void;
}

type FormErrors = Partial<Record<'manager' | 'leader' | 'supervisor' | 'type' | 'duration' | 'from' | 'to', string>>;

const managerKey = (u: string) => `personal:manager:${u}`;

export const LeaveRequestPanel: React.FC<LeaveRequestPanelProps> = ({ profile, onNotice }) => {
  const username = profile?.username ?? '';
  const [manager, setManager] = useState('');
  const [leader, setLeader] = useState('');
  const [supervisor, setSupervisor] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType | ''>('');
  const [duration, setDuration] = useState<LeaveDuration | ''>('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState<LeaveRequestDTO[]>([]);

  // Nhớ email quản lý đã dùng lần trước để khỏi nhập lại
  useEffect(() => {
    if (!username) return;
    try {
      setManager(localStorage.getItem(managerKey(username)) || '');
    } catch { /* bỏ qua */ }
  }, [username]);

  const loadHistory = async () => setHistory(await PersonalService.getLeaveRequests());

  const toggleHistory = async () => {
    const next = !showHistory;
    setShowHistory(next);
    if (next) await loadHistory();
  };

  const validate = (): FormErrors => {
    const e: FormErrors = {};
    if (!manager.trim()) e.manager = 'Nhập email quản lý.';
    else if (!EMAIL_REGEX.test(manager.trim())) e.manager = 'Email quản lý chưa đúng định dạng.';
    if (leader.trim() && !EMAIL_REGEX.test(leader.trim())) e.leader = 'Email chưa đúng định dạng.';
    if (supervisor.trim() && !EMAIL_REGEX.test(supervisor.trim())) e.supervisor = 'Email chưa đúng định dạng.';
    if (!leaveType) e.type = 'Chọn loại phép.';
    if (!duration) e.duration = 'Chọn thời gian nghỉ.';
    if (!fromDate) e.from = 'Chọn ngày bắt đầu.';
    if (!toDate) e.to = 'Chọn ngày kết thúc.';
    else if (fromDate && toDate < fromDate) e.to = 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.';
    return e;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await PersonalService.createLeaveRequest({
        managerEmail: manager.trim(),
        leaderEmail: leader.trim() || undefined,
        supervisorEmail: supervisor.trim() || undefined,
        leaveType: leaveType as LeaveType,
        duration: duration as LeaveDuration,
        fromDate,
        toDate,
        reason: reason.trim() || undefined,
      });
      try { localStorage.setItem(managerKey(username), manager.trim()); } catch { /* bỏ qua */ }
      onNotice('success', 'Đã gửi yêu cầu nghỉ phép.');
      setLeaveType(''); setDuration(''); setFromDate(''); setToDate(''); setReason('');
      if (showHistory) await loadHistory();
    } catch (err) {
      onNotice('danger', err instanceof Error ? err.message : 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  const fieldClass = (key: keyof FormErrors) => `form-control form-control-sm ${errors[key] ? 'is-invalid' : ''}`;
  const selectClass = (key: keyof FormErrors) => `form-select form-select-sm ${errors[key] ? 'is-invalid' : ''}`;

  return (
    <section className="pp-panel pp-panel-green" aria-label="Xin phép nghỉ">
      <div className="pp-panel-head fs-5">Xin phép nghỉ</div>
      <form className="pp-panel-body d-flex flex-column gap-2" onSubmit={handleSubmit} noValidate>
        <div className="rounded-3 p-2 small" style={{ background: '#f0fdf4', border: '1px solid #86efac' }}>
          <div className="row g-1">
            <div className="col-6"><b>Mã NV:</b> {profile?.username || '-'}</div>
            <div className="col-6"><b>Phòng ban:</b> {profile?.department || '-'}</div>
            <div className="col-6"><b>Họ tên:</b> {profile?.fullName || '-'}</div>
            <div className="col-6"><b>Chức vụ:</b> {profile?.position || '-'}</div>
          </div>
        </div>

        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="lv-manager">Email quản lý (Manager)</label>
          <input id="lv-manager" type="email" className={fieldClass('manager')} value={manager} placeholder="ten@xppower.com" onChange={(e) => setManager(e.target.value)} />
          {errors.manager && <div className="invalid-feedback">{errors.manager}</div>}
        </div>

        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small fw-bold mb-1" htmlFor="lv-leader">Email Leader (tuỳ chọn)</label>
            <input id="lv-leader" type="email" className={fieldClass('leader')} value={leader} placeholder="Email Leader (nếu có)" onChange={(e) => setLeader(e.target.value)} />
            {errors.leader && <div className="invalid-feedback">{errors.leader}</div>}
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold mb-1" htmlFor="lv-supervisor">Email Supervisor (tuỳ chọn)</label>
            <input id="lv-supervisor" type="email" className={fieldClass('supervisor')} value={supervisor} placeholder="Email Supervisor (nếu có)" onChange={(e) => setSupervisor(e.target.value)} />
            {errors.supervisor && <div className="invalid-feedback">{errors.supervisor}</div>}
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small fw-bold mb-1" htmlFor="lv-type">Loại phép</label>
            <select id="lv-type" className={selectClass('type')} value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)}>
              <option value="">Chọn...</option>
              {LEAVE_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.type && <div className="invalid-feedback">{errors.type}</div>}
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold mb-1" htmlFor="lv-duration">Thời gian</label>
            <select id="lv-duration" className={selectClass('duration')} value={duration} onChange={(e) => setDuration(e.target.value as LeaveDuration)}>
              <option value="">Chọn...</option>
              {DURATIONS.map((t) => <option key={t}>{t}</option>)}
            </select>
            {errors.duration && <div className="invalid-feedback">{errors.duration}</div>}
          </div>
        </div>

        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small fw-bold mb-1" htmlFor="lv-from">Từ ngày</label>
            <input id="lv-from" type="date" className={fieldClass('from')} min={toDateKey(new Date())} value={fromDate}
              onChange={(e) => { setFromDate(e.target.value); if (!toDate || toDate < e.target.value) setToDate(e.target.value); }} />
            {errors.from && <div className="invalid-feedback">{errors.from}</div>}
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold mb-1" htmlFor="lv-to">Đến ngày</label>
            <input id="lv-to" type="date" className={fieldClass('to')} min={fromDate || toDateKey(new Date())} value={toDate} onChange={(e) => setToDate(e.target.value)} />
            {errors.to && <div className="invalid-feedback">{errors.to}</div>}
          </div>
        </div>

        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="lv-reason">Lý do (tuỳ chọn)</label>
          <textarea id="lv-reason" className="form-control form-control-sm" rows={3} maxLength={300} value={reason} placeholder="Nhập lý do..." onChange={(e) => setReason(e.target.value)} />
        </div>

        <button type="submit" className="btn btn-success fw-bold" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>
        <button type="button" className="btn btn-outline-success fw-bold" aria-expanded={showHistory} onClick={toggleHistory}>
          Lịch sử
        </button>

        {showHistory && (
          history.length === 0 ? (
            <div className="text-center text-muted small py-2">Chưa có yêu cầu nghỉ phép nào.</div>
          ) : (
            <ul className="list-unstyled m-0 d-flex flex-column gap-2" style={{ maxHeight: 240, overflowY: 'auto' }}>
              {history.map((r) => (
                <li key={r.id} className="border rounded-3 p-2 small">
                  <div className="d-flex justify-content-between align-items-center">
                    <b>{r.leaveType} · {r.duration}</b>
                    <StatusBadge status={r.status} />
                  </div>
                  <div className="text-muted">{formatDateVN(r.fromDate)} – {formatDateVN(r.toDate)}</div>
                  {r.reason && <div>{r.reason}</div>}
                </li>
              ))}
            </ul>
          )
        )}
      </form>
    </section>
  );
};
