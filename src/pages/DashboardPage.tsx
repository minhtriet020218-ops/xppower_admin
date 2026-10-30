import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import type { DashboardStatsDTO } from '../dtos/DashboardDTO';
import { Header } from '../components/layout/Header';
import { DashboardService } from '../services/DashboardService';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface DashboardPageProps {
  onLogout?: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onLogout }) => {
  const [data, setData] = useState<DashboardStatsDTO | null>(null);

  useEffect(() => {
    DashboardService.getStats()
      .then((res) => setData(res))
      .catch((err) => console.error("Lỗi tải thống kê:", err));
  }, []);

  if (!data) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const barData = {
    labels: data.departmentDistribution.map(d => d.name),
    datasets: [{
      label: 'Số lượng tài sản',
      data: data.departmentDistribution.map(d => d.count),
      backgroundColor: '#3B82F6',
      borderRadius: 4
    }]
  };

  const statusData = {
    labels: data.statusDistribution.map(s => s.status),
    datasets: [{
      data: data.statusDistribution.map(s => s.count),
      backgroundColor: ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658']
    }]
  };

  return (
    <div className="bg-light min-vh-100 font-sans">
      {/* Header component có gắn Dropdown và Đăng xuất */}
      <Header onLogout={onLogout} />

      {/* Main Content */}
      <main className="container-fluid px-4 py-4">
        <div className="text-center mb-4">
          <h2 className="fs-4 fw-bold text-dark">📊 Dashboard Tổng Quan</h2>
          <p className="text-muted small">Thống kê tài sản IT theo bộ phận, trạng thái và loại thiết bị</p>
        </div>

        {/* Charts Grid */}
        <div className="row g-4 mb-4">
          {/* Horizontal Bar Chart Card với chiều cao động và thanh cuộn */}
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100 p-3">
              <h3 className="fs-6 text-center mb-3 fw-bold text-secondary">📊 Bộ phận được cấp ({data.departmentDistribution.length} bộ phận)</h3>
              
              {/* Khung chứa có thanh cuộn dọc khi danh sách dài */}
              <div 
                style={{ 
                  maxHeight: '720px', 
                  overflowY: 'auto', 
                  overflowX: 'hidden',
                  paddingRight: '10px' 
                }}
              >
                {/* Tính chiều cao động: mỗi bộ phận nhân thêm ~25px để không bị dính chữ */}
                <div style={{ height: `${Math.max(350, data.departmentDistribution.length * 25)}px` }}>
                  <Bar 
                    data={barData} 
                    options={{ 
                      indexAxis: 'y', 
                      responsive: true, 
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false }
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="col-12 col-lg-6 d-flex flex-column gap-4">
            <div className="card border-0 shadow-sm p-3">
              <h3 className="fs-6 text-center mb-2 fw-bold text-secondary">📈 Trạng thái tài sản</h3>
              <div style={{ height: '360px' }} className="d-flex justify-content-center">
                <Doughnut data={statusData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div className="card border-0 shadow-sm p-3">
              <h3 className="fs-6 text-center mb-2 fw-bold text-secondary">🔧 Loại thiết bị</h3>
              <div style={{ height: '360px' }} className="d-flex justify-content-center">
                <Doughnut data={statusData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="row g-3">
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border border-info bg-info-subtle text-center p-3 shadow-sm">
              <div className="fs-3 fw-bold text-info-emphasis">{data.totalAssets}</div>
              <div className="small text-info-emphasis fw-semibold">Tổng tài sản</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border border-success bg-success-subtle text-center p-3 shadow-sm">
              <div className="fs-3 fw-bold text-success-emphasis">{data.activeAssets}</div>
              <div className="small text-success-emphasis fw-semibold">Tài sản hoạt động</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border border-warning bg-warning-subtle text-center p-3 shadow-sm">
              <div className="fs-3 fw-bold text-warning-emphasis">{data.departmentsCount}</div>
              <div className="small text-warning-emphasis fw-semibold">Bộ phận</div>
            </div>
          </div>
          <div className="col-12 col-sm-6 col-xl-3">
            <div className="card border border-danger bg-danger-subtle text-center p-3 shadow-sm">
              <div className="fs-3 fw-bold text-danger-emphasis">{data.deviceTypesCount}</div>
              <div className="small text-danger-emphasis fw-semibold">Loại thiết bị</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};