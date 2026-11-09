import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { AxiosClient } from '../../../services/api/AxiosClient';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface HrmDashboardPageProps {
  onNavigate: (tab: 'dashboard' | 'staff') => void;
}

interface HrmStats {
  totalStaff: number;
  forgotCheckIn: number;
  forgotCheckOut: number;
  departmentDistribution: { name: string; count: number }[];
  shiftDistribution: { shift: string; count: number }[];
}

export const HrmDashboardPage: React.FC<HrmDashboardPageProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<HrmStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchHrmStats = async () => {
    setIsLoading(true);
    try {
      const data = await AxiosClient.get<HrmStats>('/api/v1/hrm/stats');
      setStats(data);
    } catch (error) {
      console.error('Không thể tải thống kê HRM từ database:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHrmStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status"></div>
        <span className="ms-2 fw-bold text-muted">Đang tải dữ liệu nhân sự từ Database...</span>
      </div>
    );
  }

  // Cấu hình dữ liệu cho biểu đồ cột (Nhân viên theo phòng ban)
  const barData = {
    labels: stats.departmentDistribution.map(d => d.name),
    datasets: [{
      label: 'Số lượng nhân viên',
      data: stats.departmentDistribution.map(d => d.count),
      backgroundColor: '#3B82F6',
      borderRadius: 6
    }]
  };

  // Cấu hình dữ liệu cho biểu đồ tròn (Phân bổ ca làm việc)
  const shiftData = {
    labels: stats.shiftDistribution.map(s => s.shift),
    datasets: [{
      data: stats.shiftDistribution.map(s => s.count),
      backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#6366F1', '#EC4899']
    }]
  };

  return (
    <div className="d-flex min-vh-100 bg-light font-sans">
      {/* 1. SIDEBAR */}
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

      {/* 2. MAIN CONTENT */}
      <main className="flex-grow-1 p-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h2 className="fs-3 fw-bold text-dark m-0">Dashboard Nhân Sự (HRM)</h2>
          <button 
            className="btn btn-primary btn-sm d-flex align-items-center gap-2 px-3 py-2 fw-bold shadow-sm" 
            style={{ backgroundColor: '#0284c7' }}
            onClick={fetchHrmStats}
          >
            🔄 Làm mới số liệu
          </button>
        </div>

        {/* 4 THẺ THỐNG KÊ (METRIC CARDS) */}
        <div className="row g-4 mb-4">
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm text-white p-3 rounded-4" style={{ background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)', minHeight: '140px' }}>
              <div className="small text-white-50 fw-bold">Tổng Nhân Viên (DB)</div>
              <div className="fs-2 fw-bold my-2">{stats.totalStaff}</div>
              <div className="small text-white-50">Đang lưu trữ vĩnh viễn</div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm text-white p-3 rounded-4" style={{ backgroundColor: '#d97706', minHeight: '140px' }}>
              <div className="small text-white-50 fw-bold">Quên Chấm Vào</div>
              <div className="fs-2 fw-bold my-2">{stats.forgotCheckIn}</div>
              <div className="small text-white-50">Tháng này</div>
            </div>
          </div>
          <div className="col-12 col-md-6 col-xl-3">
            <div className="card border-0 shadow-sm text-white p-3 rounded-4" style={{ backgroundColor: '#dc2626', minHeight: '140px' }}>
              <div className="small text-white-50 fw-bold">Quên Chấm Ra</div>
              <div className="fs-2 fw-bold my-2">{stats.forgotCheckOut}</div>
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
              <div className="fs-5 fw-bold my-1">Gán ca • Thêm sửa xóa</div>
              <div className="small text-white-50">Mở danh sách nhân sự</div>
              <span className="position-absolute bottom-0 end-0 p-3 fs-1 opacity-25">👥</span>
            </div>
          </div>
        </div>

        {/* KHUNG BIỂU ĐỒ THỐNG KÊ THỰC TẾ */}
        <div className="row g-4">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
              <h5 className="fw-bold text-secondary mb-3">📊 Nhân Viên Theo Phòng Ban</h5>
              <div style={{ height: '320px' }}>
                <Bar 
                  data={barData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                  }} 
                />
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm p-4 rounded-4 h-100 bg-white">
              <h5 className="fw-bold text-secondary mb-3">🕒 Phân Bổ Ca Làm Việc</h5>
              <div style={{ height: '320px' }} className="d-flex justify-content-center">
                <Doughnut data={shiftData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};