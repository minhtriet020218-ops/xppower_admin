import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { HrmDashboardPage } from './departments/hrm/HrmDashboardPage';

interface DepartmentPageProps {
  onLogout?: () => void;
  onTabChange?: (tab: 'dashboard' | 'assets' | 'department') => void;
}

export const DepartmentPage: React.FC<DepartmentPageProps> = ({ onLogout, onTabChange }) => {
  // Quản lý xem đang ở bộ phận nào: 'hrm' | 'canteen' | 'productions'
  const [activeDept, setActiveDept] = useState<'hrm' | 'canteen' | 'productions'>('hrm');

  return (
    <div className="bg-light min-vh-100 font-sans">
      {/* Header chung của hệ thống */}
      <Header onLogout={onLogout} activeTab="department" onTabChange={onTabChange} />

      {/* Thanh chọn nhanh các bộ phận (Dropdown hoặc Tabs chuyển đổi) */}
      <div className="bg-white border-bottom px-4 py-2 d-flex gap-3 align-items-center shadow-sm">
        <span className="fw-bold text-muted small">KHU VỰC BỘ PHẬN:</span>
        <button 
          className={`btn btn-sm px-3 fw-bold rounded-pill ${activeDept === 'hrm' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setActiveDept('hrm')}
        >
          🏢 HRM (Nhân sự)
        </button>
        <button 
          className={`btn btn-sm px-3 fw-bold rounded-pill ${activeDept === 'canteen' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setActiveDept('canteen')}
        >
          🍽️ Canteen (Căng tin)
        </button>
        <button 
          className={`btn btn-sm px-3 fw-bold rounded-pill ${activeDept === 'productions' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => setActiveDept('productions')}
        >
          ⚙️ Productions (Sản xuất)
        </button>
      </div>

      {/* Hiển thị nội dung tương ứng theo bộ phận được chọn */}
      <div className="department-content">
        {activeDept === 'hrm' && <HrmDashboardPage />}
        {activeDept === 'canteen' && (
          <div className="p-5 text-center text-muted">
            <h3>🍽️ Trang quản lý Canteen đang được phát triển...</h3>
          </div>
        )}
        {activeDept === 'productions' && (
          <div className="p-5 text-center text-muted">
            <h3>⚙️ Trang quản lý Productions đang được phát triển...</h3>
          </div>
        )}
      </div>
    </div>
  );
};