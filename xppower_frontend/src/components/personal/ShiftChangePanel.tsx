import React, { useEffect, useState } from 'react';
import type { MyProfileDTO, ShiftChangeDTO } from '../../dtos/PersonalDTO';
import { PersonalService } from '../../services/PersonalService';
import { formatDateVN, toDateKey } from '../../utils/personalDate';
import { SHIFTS } from './constants';
import { StatusBadge } from './StatusBadge';

interface ShiftChangePanelProps {
  profile: MyProfileDTO | null;
  onNotice: (type: 'success' | 'danger', text: string) => void;
}

export const ShiftChangePanel: React.FC<ShiftChangePanelProps> = ({ profile, onNotice }) => {
  const currentShift = profile?.shift && profile.shift !== '-' ? profile.shift : '';
  const [desired, setDesired] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<{ desired?: string; reason?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [requests, setRequests] = useState<ShiftChangeDTO[]>([]);

  useEffect(() => {
    let alive = true;
    PersonalService.getShiftChanges().then((list) => { if (alive) setRequests(list); });
    return () => { alive = false; };
  }, []);

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!desired) e.desired = 'Chọn ca muốn đổi.';
    else if (desired === currentShift) e.desired = 'Ca muốn đổi phải khác ca hiện tại.';
    if (!reason.trim()) e.reason = 'Nhập lý do đổi ca.';
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setSubmitting(true);
    try {
      const created = await PersonalService.createShiftChange({ currentShift: currentShift || '-', desiredShift: desired, reason: reason.trim() });
      setRequests((prev) => [created, ...prev]);
      setDesired('');
      setReason('');
      onNotice('success', 'Đã gửi yêu cầu đổi ca.');
    } catch (err) {
      onNotice('danger', err instanceof Error ? err.message : 'Không thể gửi yêu cầu. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pp-panel pp-panel-green" style={{ borderStyle: 'dashed' }} aria-label="Yêu cầu đổi ca">
      <form className="pp-panel-body d-flex flex-column gap-2" onSubmit={handleSubmit} noValidate>
        <h2 className="fs-6 fw-bold m-0">Yêu cầu đổi ca</h2>

        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="sc-current">Ca hiện tại</label>
          <input id="sc-current" className="form-control form-control-sm" readOnly value={currentShift || '-'} />
        </div>

        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="sc-desired">Ca muốn đổi</label>
          <select id="sc-desired" className={`form-select form-select-sm ${errors.desired ? 'is-invalid' : ''}`} value={desired} onChange={(e) => setDesired(e.target.value)}>
            <option value="">-- Chọn ca --</option>
            {SHIFTS.filter((s) => s !== currentShift).map((s) => <option key={s}>{s}</option>)}
          </select>
          {errors.desired && <div className="invalid-feedback">{errors.desired}</div>}
        </div>

        <div>
          <label className="form-label small fw-bold mb-1" htmlFor="sc-reason">Lý do</label>
          <textarea id="sc-reason" className={`form-control form-control-sm ${errors.reason ? 'is-invalid' : ''}`} rows={2} maxLength={200} value={reason} placeholder="Nhập lý do (ngắn)" onChange={(e) => setReason(e.target.value)} />
          {errors.reason && <div className="invalid-feedback">{errors.reason}</div>}
        </div>

        <button type="submit" className="btn btn-success fw-bold" disabled={submitting}>
          {submitting ? 'Đang gửi...' : 'Gửi yêu cầu'}
        </button>

        <hr className="my-1" />
        {requests.length === 0 ? (
          <div className="text-center text-muted small py-2">Chưa có yêu cầu nào.</div>
        ) : (
          <ul className="list-unstyled m-0 d-flex flex-column gap-2" style={{ maxHeight: 200, overflowY: 'auto' }}>
            {requests.map((r) => (
              <li key={r.id} className="border rounded-3 p-2 small bg-white">
                <div className="d-flex justify-content-between align-items-center">
                  <b>{r.currentShift} → {r.desiredShift}</b>
                  <StatusBadge status={r.status} />
                </div>
                <div className="text-muted">{formatDateVN(toDateKey(new Date(r.createdAt)))} · {r.reason}</div>
              </li>
            ))}
          </ul>
        )}
      </form>
    </section>
  );
};
