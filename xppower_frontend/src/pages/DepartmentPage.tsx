import React, { useState } from 'react';
import { Header } from '../components/layout/Header';
import { HrmDashboardPage } from './departments/hrm/HrmDashboardPage';
import { HrmStaffPage } from './departments/hrm/HrmStaffPage';
import { HrmPlaceholderPage } from './departments/hrm/HrmAttendancePage';
import { CanteenManagementPage } from './departments/canteen/CanteenManagementPage';
import { ProductionDashboardPage } from './departments/productions/ProductionDashboardPage';
import { ProductionAssetMapPage } from './departments/productions/ProductionAssetMapPage';

export type HrmSubTabType = 'dashboard' | 'staff' | 'attendance' | 'evaluation' | 'leave' | 'report';

interface DepartmentPageProps {
  onLogout?: () => void;
  onTabChange?: (tab: 'dashboard' | 'assets' | 'department') => void;
}

export const DepartmentPage: React.FC<DepartmentPageProps> = ({ onLogout, onTabChange }) => {
  const [activeDept, setActiveDept] = useState<'hrm' | 'canteen' | 'productions'>('hrm');
  
  // Quản lý tab con của HRM
  const [hrmSubTab, setHrmSubTab] = useState<HrmSubTabType>('dashboard');
  
  // Quản lý tab con của Productions
  const [prodSubTab, setProdSubTab] = useState<'dashboard' | 'lines' | 'map' | 'staff'>('dashboard');

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
          <>
            {hrmSubTab === 'dashboard' && <HrmDashboardPage onNavigate={(tab) => setHrmSubTab(tab)} />}
            {hrmSubTab === 'staff' && <HrmStaffPage onNavigate={(tab) => setHrmSubTab(tab)} />}
            {hrmSubTab === 'attendance' && <HrmPlaceholderPage title="Quản Lý Chấm Công" icon="⏰" onNavigate={(tab) => setHrmSubTab(tab)} />}
            {hrmSubTab === 'evaluation' && <HrmPlaceholderPage title="Đánh Giá Nhân Sự" icon="⭐" onNavigate={(tab) => setHrmSubTab(tab)} />}
            {hrmSubTab === 'leave' && <HrmPlaceholderPage title="Quản Lý Nghỉ Phép" icon="📅" onNavigate={(tab) => setHrmSubTab(tab)} />}
            {hrmSubTab === 'report' && <HrmPlaceholderPage title="Báo Cáo Nhân Sự" icon="📋" onNavigate={(tab) => setHrmSubTab(tab)} />}
          </>
        )}

        {activeDept === 'canteen' && <CanteenManagementPage onLogout={onLogout} onTabChange={onTabChange} />}
        
        {activeDept === 'productions' && (
          <>
            {prodSubTab === 'dashboard' && (
              <ProductionDashboardPage activeSubTab={prodSubTab} onNavigate={(tab) => setProdSubTab(tab)} />
            )}
            {prodSubTab === 'map' && (
              <ProductionAssetMapPage activeSubTab={prodSubTab} onNavigate={(tab) => setProdSubTab(tab)} />
            )}
            {(prodSubTab === 'lines' || prodSubTab === 'staff') && (
              <div className="d-flex min-vh-100 bg-light">
                <aside className="p-3 d-flex flex-column text-white" style={{ width: '240px', minHeight: '100vh', backgroundColor: '#1E2337' }}>
                  <div className="fw-bold fs-6 mb-4 d-flex align-items-center gap-2 px-2"><span>🏭</span> Productions</div>
                  <div className="list-group list-group-flush gap-2">
                    <button className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white bg-transparent" onClick={() => setProdSubTab('dashboard')}>📊 Dashboard</button>
                    <button className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white bg-transparent" onClick={() => setProdSubTab('lines')}>🏭 Production Lines</button>
                    <button className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white bg-transparent" onClick={() => setProdSubTab('map')}>🌳 Sơ đồ quản lý tài sản line</button>
                    <button className="list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 text-white bg-transparent" onClick={() => setProdSubTab('staff')}>👥 Quản lý nhân sự</button>
                  </div>
                </aside>
                <main className="flex-grow-1 p-5 text-center text-muted d-flex align-items-center justify-content-center">
                  <div>
                    <h3>⚙️ Trang quản lý đang được phát triển...</h3>
                    <button className="btn btn-primary mt-3" onClick={() => setProdSubTab('dashboard')}>Quay về Dashboard</button>
                  </div>
                </main>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};