import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import type { MealOrderDTO, MealOrderItem } from '../../dtos/PersonalDTO';
import { PersonalService } from '../../services/PersonalService';
import { eachDayBetween, formatDateVN, formatDayLabel, toDateKey } from '../../utils/personalDate';
import { Modal } from './Modal';
import { SHIFTS } from './constants';

const DISHES = ['Món mặn', 'Món chay'];
const MAX_DAYS = 31;

interface DayChoice {
  shift: string; // '' = không đặt ngày này
  dish: string;
}

interface CanteenOrderPanelProps {
  username: string;
  onNotice: (type: 'success' | 'danger', text: string) => void;
}

export const CanteenOrderPanel: React.FC<CanteenOrderPanelProps> = ({ username, onNotice }) => {
  const today = toDateKey(new Date());
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [useDefault, setUseDefault] = useState(false);
  const [defaultDish, setDefaultDish] = useState(DISHES[0]);
  const [choices, setChoices] = useState<Record<string, DayChoice>>({});
  const [history, setHistory] = useState<MealOrderDTO[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const days = useMemo(() => eachDayBetween(fromDate, toDate, MAX_DAYS), [fromDate, toDate]);
  const rangeInvalid = !!fromDate && !!toDate && toDate < fromDate;
  const rangeTooLong = !!fromDate && !!toDate && !rangeInvalid && eachDayBetween(fromDate, toDate, 366).length > MAX_DAYS;

  const loadHistory = useCallback(async () => {
    setHistory(await PersonalService.getMealOrders());
  }, []);

  useEffect(() => {
    let alive = true;
    PersonalService.getMealOrders().then((list) => { if (alive) setHistory(list); });
    return () => { alive = false; };
  }, []);

  const getChoice = (d: string): DayChoice => choices[d] ?? { shift: SHIFTS[0], dish: defaultDish };

  const setChoice = (d: string, patch: Partial<DayChoice>) =>
    setChoices((prev) => ({ ...prev, [d]: { ...getChoice(d), ...patch } }));

  const handleSubmit = async () => {
    if (!fromDate || !toDate) return onNotice('danger', 'Hãy chọn khoảng ngày cần đặt cơm.');
    if (rangeInvalid) return onNotice('danger', 'Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.');
    if (rangeTooLong) return onNotice('danger', `Chỉ đặt tối đa ${MAX_DAYS} ngày mỗi lần.`);

    const items: MealOrderItem[] = days
      .map((d) => ({ d, c: getChoice(d) }))
      .filter(({ c }) => c.shift)
      .map(({ d, c }) => ({ date: d, shift: c.shift, dish: useDefault ? defaultDish : c.dish }));

    if (items.length === 0) return onNotice('danger', 'Bạn chưa chọn ca cho ngày nào.');

    setSubmitting(true);
    try {
      await PersonalService.createMealOrder(items);
      onNotice('success', `Đã đặt cơm ${items.length} ngày.`);
      setFromDate('');
      setToDate('');
      setChoices({});
      await loadHistory();
    } catch (e) {
      onNotice('danger', e instanceof Error ? e.message : 'Không thể đặt cơm. Vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="pp-panel pp-panel-blue" aria-label="Đặt cơm Canteen">
      <div className="pp-panel-head fs-5">Đặt cơm Canteen</div>
      <div className="pp-panel-body d-flex flex-column gap-3">
        <div className="row g-2">
          <div className="col-6">
            <label className="form-label small fw-bold mb-1" htmlFor="meal-from">Từ ngày</label>
            <input id="meal-from" type="date" className="form-control form-control-sm" min={today}
              value={fromDate} onChange={(e) => { setFromDate(e.target.value); if (!toDate || toDate < e.target.value) setToDate(e.target.value); }} />
          </div>
          <div className="col-6">
            <label className="form-label small fw-bold mb-1" htmlFor="meal-to">Đến ngày</label>
            <input id="meal-to" type="date" className="form-control form-control-sm" min={fromDate || today}
              value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>
        </div>
        {rangeInvalid && <div className="text-danger small">Ngày kết thúc phải sau hoặc bằng ngày bắt đầu.</div>}
        {rangeTooLong && <div className="text-danger small">Chỉ đặt tối đa {MAX_DAYS} ngày mỗi lần.</div>}

        <div className="border rounded-3 p-2 bg-white">
          <div className="form-check mb-2">
            <input id="meal-default" className="form-check-input" type="checkbox" checked={useDefault} onChange={(e) => setUseDefault(e.target.checked)} />
            <label className="form-check-label small fw-bold" htmlFor="meal-default">
              Dùng món mặc định cho tất cả các ngày
              <span className="d-block fw-normal text-muted">Không cần chọn món theo từng ngày</span>
            </label>
          </div>
          <label className="form-label small fw-bold mb-1" htmlFor="meal-default-dish">Món mặc định</label>
          <select id="meal-default-dish" className="form-select form-select-sm" value={defaultDish} onChange={(e) => setDefaultDish(e.target.value)}>
            {DISHES.map((d) => <option key={d}>{d}</option>)}
          </select>
          <div className="small text-muted mt-2">Bạn vẫn cần chọn ca ăn cho từng ngày vì ca có thể thay đổi theo lịch.</div>
        </div>

        <div className="border rounded-3 p-2" style={{ borderStyle: 'dashed' }}>
          {days.length === 0 ? (
            <div className="text-center text-muted small py-2">Chọn khoảng ngày để chọn ca và món</div>
          ) : (
            <ul className="list-unstyled m-0 d-flex flex-column gap-2" style={{ maxHeight: 260, overflowY: 'auto' }}>
              {days.map((d) => {
                const c = getChoice(d);
                return (
                  <li key={d} className="d-flex align-items-center gap-2">
                    <span className="small fw-semibold" style={{ width: 78 }}>{formatDayLabel(d)}</span>
                    <select aria-label={`Ca ăn ngày ${formatDateVN(d)}`} className="form-select form-select-sm" value={c.shift} onChange={(e) => setChoice(d, { shift: e.target.value })}>
                      <option value="">Không đặt</option>
                      {SHIFTS.map((s) => <option key={s}>{s}</option>)}
                    </select>
                    {!useDefault && (
                      <select aria-label={`Món ăn ngày ${formatDateVN(d)}`} className="form-select form-select-sm" disabled={!c.shift} value={c.dish} onChange={(e) => setChoice(d, { dish: e.target.value })}>
                        {DISHES.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <button type="button" className="btn text-white fw-bold" style={{ backgroundColor: '#f97316' }} onClick={() => setShowMenu(true)}>
          Xem menu món ăn tuần này
        </button>
        <button type="button" className="btn btn-primary fw-bold" disabled={submitting} onClick={handleSubmit}>
          {submitting ? 'Đang gửi...' : 'Xác nhận đặt cơm'}
        </button>

        <div className="border rounded-3 p-3 bg-white">
          <div className="d-flex gap-3 align-items-center">
            <div className="border rounded-2 p-1 bg-white lh-1">
              <QRCodeSVG value={username || 'unknown'} size={88} />
            </div>
            <div>
              <div className="fw-bold text-primary">Mã QR cá nhân</div>
              <div className="small text-muted mb-1">Dùng mã này để quét nhận cơm cho tất cả các ca đã đặt.</div>
              <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => setShowQr(true)} disabled={!username}>Phóng to</button>
            </div>
          </div>

          <h3 className="fs-6 fw-bold mt-3 mb-2">Lịch sử đã đặt</h3>
          {history.length === 0 ? (
            <div className="text-center text-muted small border rounded-3 py-3" style={{ borderStyle: 'dashed' }}>Chưa có suất ăn nào được đặt</div>
          ) : (
            <ul className="list-unstyled m-0 small d-flex flex-column gap-1" style={{ maxHeight: 180, overflowY: 'auto' }}>
              {history.flatMap((o) => o.items).sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 30).map((it, i) => (
                <li key={`${it.date}-${i}`} className="d-flex justify-content-between border-bottom pb-1">
                  <span>{formatDateVN(it.date)}</span>
                  <span className="text-muted">{it.shift} · {it.dish}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {showMenu && (
        <Modal title="Menu món ăn tuần này" onClose={() => setShowMenu(false)}>
          <p className="text-muted m-0">Bộ phận Canteen chưa đăng menu cho tuần này. Bạn vẫn có thể đặt cơm theo ca và món mặc định.</p>
        </Modal>
      )}
      {showQr && (
        <Modal title="Mã QR cá nhân" onClose={() => setShowQr(false)} maxWidth={380}>
          <div className="text-center">
            <QRCodeSVG value={username} size={280} />
            <div className="fw-bold mt-2">{username}</div>
          </div>
        </Modal>
      )}
    </section>
  );
};
