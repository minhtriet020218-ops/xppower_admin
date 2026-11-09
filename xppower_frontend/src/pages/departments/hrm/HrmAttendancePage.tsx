import React from 'react';

interface HrmPlaceholderPageProps {
  title: string;
  icon: string;
  onNavigate: (tab: 'dashboard' | 'staff') => void;
}

export const HrmPlaceholderPage: React.FC<HrmPlaceholderPageProps> = ({ title, icon, onNavigate }) => {
  return (
    <div className="d-flex min-vh-100 bg-light font-sans">
      {/* 1. SIDEBAR */}
      <aside className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '260px', minHeight: '100vh' }}>
        <div className="list-group list-group-flush gap-2">
          <button 
            className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3"
            onClick={() => onNavigate('dashboard')}
          >
            <span>📊</span> Dashboard
          </button>
          <button 
            className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3"
            onClick={() => onNavigate('staff')}
          >
            <span>👥</span> Quản Lý Nhân Sự
          </button>
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>⏰</span> Chấm Công
          </button>
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>⭐</span> Đánh Giá
          </button>
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>📅</span> Nghỉ Phép
          </button>
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>📋</span> Báo Cáo
          </button>
        </div>
      </aside>

      {/* 2. MAIN CONTENT */}
      <main className="flex-grow-1 p-5 d-flex flex-column align-items-center justify-content-center text-center">
        <div className="card border-0 shadow-sm p-5 rounded-4 bg-white" style={{ maxWidth: '600px', width: '100%' }}>
          <div className="fs-1 mb-3">{icon}</div>
          <h3 className="fw-bold text-dark mb-2">{title}</h3>
          <p className="text-muted mb-4">Tính năng này đang được phát triển và sẽ sớm ra mắt trong các phiên bản cập nhật tiếp theo của hệ thống HRM.</p>
          <div className="d-flex justify-content-center gap-3">
            <button className="btn btn-primary fw-bold px-4 rounded-pill" onClick={() => onNavigate('dashboard')}>
              Về Dashboard
            </button>
            <button className="btn btn-outline-secondary fw-bold px-4 rounded-pill" onClick={() => onNavigate('staff')}>
              Quản lý Nhân sự
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};