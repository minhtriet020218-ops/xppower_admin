import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { HrmDashboardPage } from './departments/hrm/HrmDashboardPage';
import { HrmStaffPage } from './departments/hrm/HrmStaffPage';

interface DepartmentPageProps {
  onLogout?: () => void;
  onTabChange?: (tab: 'dashboard' | 'assets' | 'department') => void;
}

export const DepartmentPage: React.FC<DepartmentPageProps> = ({ onLogout, onTabChange }) => {
  const [activeDept, setActiveDept] = useState<'hrm' | 'canteen' | 'productions'>('hrm');
  const [hrmSubTab, setHrmSubTab] = useState<'dashboard' | 'staff'>('dashboard');

  return (
    <div className="bg-light min-vh-100 font-sans">
      <Header onLogout={onLogout} activeTab="department" onTabChange={onTabChange} />

      {/* Thanh chọn nhanh bộ phận */}
      <div className="bg-white border-bottom px-4 py-2 d-flex gap-3 align-items-center shadow-sm">
        <span className="fw-bold text-muted small">KHU VỰC BỘ PHẬN:</span>
        <button 
          className={`btn btn-sm px-3 fw-bold rounded-pill ${activeDept === 'hrm' ? 'btn-primary' : 'btn-light'}`}
          onClick={() => { setActiveDept('hrm'); setHrmSubTab('dashboard'); }}
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

      <div className="department-content">
        {activeDept === 'hrm' && (
          <div>
            {hrmSubTab === 'dashboard' && <HrmDashboardPage onNavigate={(tab) => setHrmSubTab(tab)} />}
            {hrmSubTab === 'staff' && <HrmStaffPage onNavigate={(tab) => setHrmSubTab(tab)} />}
          </div>
        )}

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