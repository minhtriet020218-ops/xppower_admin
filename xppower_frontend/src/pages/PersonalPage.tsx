import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Header } from '../components/layout/Header';
import { AttendanceCalendar } from '../components/personal/AttendanceCalendar';
import { MyAssetsPanel } from '../components/personal/MyAssetsPanel';
import { CanteenOrderPanel } from '../components/personal/CanteenOrderPanel';
import { LeaveRequestPanel } from '../components/personal/LeaveRequestPanel';
import { ShiftChangePanel } from '../components/personal/ShiftChangePanel';
import type { AttendanceDayDTO, MyProfileDTO } from '../dtos/PersonalDTO';
import type { AssetDTO } from '../dtos/AssetDTO';
import { PersonalService } from '../services/PersonalService';
import { toMonthKey } from '../utils/personalDate';
import './PersonalPage.css';

type Tab = 'dashboard' | 'assets' | 'department' | 'personal' | 'settings';

interface PersonalPageProps {
  onLogout?: () => void;
  onTabChange?: (tab: Tab) => void;
}

interface Notice {
  type: 'success' | 'danger';
  text: string;
}

export const PersonalPage: React.FC<PersonalPageProps> = ({ onLogout, onTabChange }) => {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [monthIndex, setMonthIndex] = useState(now.getMonth());

  const [profile, setProfile] = useState<MyProfileDTO | null>(null);
  const [owned, setOwned] = useState<AssetDTO[]>([]);
  const [managed, setManaged] = useState<AssetDTO[]>([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [assetsError, setAssetsError] = useState<string | null>(null);

  const [records, setRecords] = useState<AttendanceDayDTO[]>([]);
  const [attLoading, setAttLoading] = useState(true);
  const [attMock, setAttMock] = useState(false);

  const [notice, setNotice] = useState<Notice | null>(null);
  const noticeTimer = useRef<number | undefined>(undefined);

  const showNotice = useCallback((type: Notice['type'], text: string) => {
    setNotice({ type, text });
    window.clearTimeout(noticeTimer.current);
    noticeTimer.current = window.setTimeout(() => setNotice(null), 4000);
  }, []);

  useEffect(() => () => window.clearTimeout(noticeTimer.current), []);

  // Hồ sơ + tài sản của người đăng nhập
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const me = await PersonalService.getMyProfile();
        if (!alive) return;
        setProfile(me);
        const result = await PersonalService.getMyAssets(me);
        if (!alive) return;
        setOwned(result.owned);
        setManaged(result.managed);
      } catch {
        if (alive) setAssetsError('Không tải được danh sách thiết bị. Kiểm tra kết nối máy chủ rồi tải lại trang.');
      } finally {
        if (alive) setAssetsLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  // Chấm công theo tháng đang xem
  useEffect(() => {
    let alive = true;
    setAttLoading(true);
    PersonalService.getAttendance(toMonthKey(year, monthIndex)).then((res) => {
      if (!alive) return;
      setRecords(res.data);
      setAttMock(res.isMock);
      setAttLoading(false);
    });
    return () => { alive = false; };
  }, [year, monthIndex]);

  const shiftMonth = (delta: number) => {
    const d = new Date(year, monthIndex + delta, 1);
    setYear(d.getFullYear());
    setMonthIndex(d.getMonth());
  };

  return (
    <div className="bg-light min-vh-100 font-sans">
      <Header onLogout={onLogout} activeTab="personal" onTabChange={onTabChange} />

      {notice && (
        <div className="pp-toast">
          <div className={`alert alert-${notice.type} shadow d-flex justify-content-between align-items-start gap-2 m-0`} role="status">
            <span>{notice.text}</span>
            <button type="button" className="btn-close" aria-label="Đóng thông báo" onClick={() => setNotice(null)} />
          </div>
        </div>
      )}

      <main className="container-fluid px-4 py-4">
        <h1 className="fs-3 fw-bold mb-4">Trang cá nhân</h1>

        <div className="pp-layout">
          <div className="d-flex flex-column gap-3">
            <MyAssetsPanel owned={owned} managed={managed} loading={assetsLoading} error={assetsError} />
            <CanteenOrderPanel username={profile?.username ?? PersonalService.getCurrentUsername()} onNotice={showNotice} />
          </div>

          <AttendanceCalendar
            year={year}
            monthIndex={monthIndex}
            records={records}
            loading={attLoading}
            isMock={attMock}
            onPrev={() => shiftMonth(-1)}
            onNext={() => shiftMonth(1)}
          />

          <div className="d-flex flex-column gap-3">
            <LeaveRequestPanel profile={profile} onNotice={showNotice} />
            <ShiftChangePanel profile={profile} onNotice={showNotice} />
          </div>
        </div>
      </main>
    </div>
  );
};
