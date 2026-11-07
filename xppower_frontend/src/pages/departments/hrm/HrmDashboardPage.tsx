import React from 'react';

interface HrmDashboardPageProps {
  onNavigate: (tab: 'dashboard' | 'staff') => void;
}

export const HrmDashboardPage: React.FC<HrmDashboardPageProps> = ({ onNavigate }) => {
  return (
    <div className="d-flex min-vh-100 bg-light font-sans">
      {/* 1. THANH MENU BÊN TRÁI (SIDEBAR) */}
      <aside className="bg-dark text-white p-3 d-flex flex-column" style={{ width: '260px', minHeight: '100vh' }}>
        <div className="list-group list-group-flush gap-2">
          <button 
            className="list-group-item list-group-item-action active bg-gradient border-0 rounded-2 py-3 d-flex align-items-center gap-3 fw-bold text-white shadow-sm" 
            style={{ background: 'linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%)' }}
            onClick={() => onNavigate('dashboard')}
          >
            <span>📊</span> Dashboard
          </button>
          <button 
            className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3"
            onClick={() => onNavigate('staff')}
            style={{ cursor: 'pointer' }}
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
        <div className="mt-auto pt-3 border-top border-secondary">
          <button className="list-group-item list-group-item-action bg-transparent text-white-50 border-0 rounded-2 py-2 d-flex align-items-center gap-3">
            <span>⚙️</span> Cài Đặt
          </button>
        </div>
      </aside>

      {/* 2. KHU VỰC NỘI DUNG CHÍNH (MAIN CONTENT) */}
      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fs-3 fw-bold text-dark m-0">Dashboard</h2>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-bold shadow-sm" style={{ backgroundColor: '#0284c7' }}>
            🔄 Làm mới
          </button>
        </div>

        {/* 4 THẺ THỐNG KÊ (METRIC CARDS) */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm text-white p-3 rounded-4" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', minHeight: '140px' }}>
              <div className="small text-white-50 fw-bold">Tổng Nhân Viên</div>
              <div className="fs-2 fw-bold my-2">10.673</div>
              <div className="small text-white-50">Tất cả bộ phận</div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm text-white p-3 rounded-4" style={{ backgroundColor: '#d97706', minHeight: '140px' }}>
              <div className="small text-white-50 fw-bold">Quên Chấm Vào</div>
              <div className="fs-2 fw-bold my-2">—</div>
              <div className="small text-white-50">Tháng này</div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm text-white p-3 rounded-4" style={{ backgroundColor: '#dc2626', minHeight: '140px' }}>
              <div className="small text-white-50 fw-bold">Quên Chấm Ra</div>
              <div className="fs-2 fw-bold my-2">—</div>
              <div className="small text-white-50">Tháng này</div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div 
              className="card border-0 shadow-sm text-white p-3 rounded-4 position-relative overflow-hidden" 
              style={{ backgroundColor: '#059669', minHeight: '140px', cursor: 'pointer' }}
              onClick={() => onNavigate('staff')}
            >
              <div className="small text-white-50 fw-bold">Quản Lý Nhân Viên</div>
              <div className="fs-5 fw-bold my-1">Gán ca • Gán quản lý</div>
              <div className="small text-white-50">Mở nhanh mục Nhân sự</div>
              <span className="position-absolute bottom-0 end-0 p-3 fs-1 opacity-25">👥</span>
            </div>
          </div>
        </div>

        {/* KHUNG BIỂU ĐỒ */}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
              <h5 className="fw-bold text-secondary mb-3">👥 Nhân Viên Theo Bộ Phận</h5>
              <div style={{ height: '300px' }} className="d-flex align-items-center justify-content-center text-muted border rounded-3 bg-light">
                [Biểu đồ phân bổ nhân viên theo bộ phận]
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
              <h5 className="fw-bold text-secondary mb-3">📊 Quên Chấm Công Theo Ngày</h5>
              <div style={{ height: '300px' }} className="d-flex align-items-center justify-content-center text-muted border rounded-3 bg-light">
                [Biểu đồ thống kê quên chấm công]
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};