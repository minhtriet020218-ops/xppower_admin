import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { AxiosClient } from '../../../services/api/AxiosClient';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface ProductionDashboardPageProps {
  onNavigate: (tab: 'dashboard' | 'lines' | 'map' | 'staff') => void;
  activeSubTab: string;
}

interface ProductionStats {
  totalLines: number;
  totalDevices: number;
  totalCategories: number;
  topLines: { name: string; count: number }[];
  categoryDistribution: { category: string; count: number }[];
}

export const ProductionDashboardPage: React.FC<ProductionDashboardPageProps> = ({ onNavigate, activeSubTab }) => {
  const [stats, setStats] = useState<ProductionStats | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const data = await AxiosClient.get<ProductionStats>('/api/v1/productions/stats');
      setStats(data);
    } catch (err) {
      console.error('Lỗi tải thống kê Productions:', err);
      // Dữ liệu fallback nếu chưa có DB
      setStats({
        totalLines: 161,
        totalDevices: 825,
        totalCategories: 9,
        topLines: [
          { name: 'MITU07', count: 115 },
          { name: 'PRE_02', count: 48 },
          { name: 'CYCLE_COUNT', count: 46 },
          { name: 'MITU05', count: 44 },
          { name: 'HIPOT_01', count: 41 },
          { name: 'NPI', count: 41 },
          { name: 'MITU03', count: 39 },
          { name: 'MITU01', count: 37 },
          { name: 'PRE_01', count: 36 },
          { name: 'SV_ASSY', count: 34 },
        ],
        categoryDistribution: [
          { category: 'Desktop PC', count: 12 },
          { category: 'Mobile Device', count: 85 },
          { category: 'Computer', count: 25 },
          { category: 'Printer', count: 30 },
          { category: 'Monitor', count: 450 },
          { category: 'Monitor Lớn', count: 40 },
          { category: 'Scanner', count: 110 },
          { category: 'Màn Hình', count: 15 },
          { category: 'Desktop', count: 58 }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (isLoading || !stats) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100 bg-light">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  // Dữ liệu cho Bar Chart (Top Lines)
  const barColors = ['#EB4D4B', '#F0932B', '#BADC58', '#6AB04C', '#2ED573', '#2EC4B6', '#487EB0', '#6C5CE7', '#A55EEA', '#E056FD'];
  const barData = {
    labels: stats.topLines.map(item => item.name),
    datasets: [{
      label: 'Số lượng thiết bị',
      data: stats.topLines.map(item => item.count),
      backgroundColor: barColors.slice(0, stats.topLines.length),
      borderRadius: 6,
    }]
  };

  // Dữ liệu cho Doughnut Chart (Cơ cấu loại thiết bị)
  const doughnutColors = ['#EB4D4B', '#F0932B', '#BADC58', '#2ED573', '#487EB0', '#6C5CE7', '#E056FD', '#FF7979', '#F9CA24'];
  const doughnutData = {
    labels: stats.categoryDistribution.map(item => item.category),
    datasets: [{
      data: stats.categoryDistribution.map(item => item.count),
      backgroundColor: doughnutColors.slice(0, stats.categoryDistribution.length),
      borderWidth: 2,
    }]
  };

  return (
    <div className="d-flex min-vh-100 bg-light font-sans">
      {/* 1. SIDEBAR CHO PRODUCTIONS */}
      <aside className="p-3 d-flex flex-column text-white" style={{ width: '240px', minHeight: '100vh', backgroundColor: '#1E2337' }}>
        <div className="fw-bold fs-6 mb-4 d-flex align-items-center gap-2 px-2">
          <span>🏭</span> Productions
        </div>

        <div className="list-group list-group-flush gap-2">
          <button 
            className={`list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 d-flex align-items-center gap-3 fw-bold text-white ${activeSubTab === 'dashboard' ? 'shadow-sm' : ''}`} 
            style={{ 
              background: activeSubTab === 'dashboard' ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' : 'transparent',
              opacity: activeSubTab === 'dashboard' ? 1 : 0.7
            }}
            onClick={() => onNavigate('dashboard')}
          >
            <span>📊</span> Dashboard
          </button>
          <button 
            className={`list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 d-flex align-items-center gap-3 text-white ${activeSubTab === 'lines' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeSubTab === 'lines' ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' : 'transparent',
              opacity: activeSubTab === 'lines' ? 1 : 0.7
            }}
            onClick={() => onNavigate('lines')}
          >
            <span>🏭</span> Production Lines
          </button>
          <button 
            className={`list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 d-flex align-items-center gap-3 text-white ${activeSubTab === 'map' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeSubTab === 'map' ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' : 'transparent',
              opacity: activeSubTab === 'map' ? 1 : 0.7
            }}
            onClick={() => onNavigate('map')}
          >
            <span>🌳</span> Sơ đồ quản lý tài sản line
          </button>
          <button 
            className={`list-group-item list-group-item-action border-0 rounded-3 py-2 px-3 d-flex align-items-center gap-3 text-white ${activeSubTab === 'staff' ? 'shadow-sm' : ''}`}
            style={{ 
              background: activeSubTab === 'staff' ? 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)' : 'transparent',
              opacity: activeSubTab === 'staff' ? 1 : 0.7
            }}
            onClick={() => onNavigate('staff')}
          >
            <span>👥</span> Quản lý nhân sự
          </button>
        </div>
      </aside>

      {/* 2. KHU VỰC NỘI DUNG DASHBOARD CHÍNH */}
      <main className="flex-grow-1 p-4" style={{ backgroundColor: '#F8FAFC' }}>
        {/* Header Title */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fs-4 fw-bold text-dark m-0 d-flex align-items-center gap-2">
              📊 Productions Dashboard
            </h2>
            <div className="text-muted small">Tổng quan lines, thiết bị theo line và theo loại thiết bị</div>
          </div>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 px-3 py-2 fw-bold rounded-2 shadow-sm" onClick={fetchStats} style={{ backgroundColor: '#0EA5E9' }}>
            🔄 Tải lại
          </button>
        </div>

        {/* 3 THẺ METRIC CARDS ĐÚNG THEO ẢNH MẪU */}
        <div className="row g-3 mb-4">
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-3 rounded-4" style={{ backgroundColor: '#E0F2FE' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fs-4">🏭</span>
                <span className="fw-bold text-secondary small">Tổng Lines</span>
              </div>
              <div className="fs-2 fw-bold text-dark">{stats.totalLines}</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-3 rounded-4" style={{ backgroundColor: '#DCFCE7' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fs-4">🖥️</span>
                <span className="fw-bold text-secondary small">Tổng Thiết Bị</span>
              </div>
              <div className="fs-2 fw-bold text-success-emphasis">{stats.totalDevices}</div>
            </div>
          </div>
          <div className="col-12 col-md-4">
            <div className="card border-0 shadow-sm p-3 rounded-4" style={{ backgroundColor: '#FEE2E2' }}>
              <div className="d-flex align-items-center gap-2 mb-2">
                <span className="fs-4">🧩</span>
                <span className="fw-bold text-secondary small">Loại Thiết Bị</span>
              </div>
              <div className="fs-2 fw-bold text-danger-emphasis">{stats.totalCategories}</div>
            </div>
          </div>
        </div>

        {/* CẶP BIỂU ĐỒ BAR CHART VÀ DOUGHNUT CHART [Cấu hình chuẩn theo ảnh] */}
        <div className="row g-4">
          {/* Cột trái: Top Lines theo số lượng thiết bị */}
          <div className="col-12 col-xl-7">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 className="fs-6 fw-bold text-dark mb-4">Top Lines theo số lượng thiết bị</h5>
              <div style={{ height: '420px' }}>
                <Bar 
                  data={barData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false }
                    },
                    scales: {
                      y: { beginAtZero: true, grid: { color: '#F1F5F9' } },
                      x: { grid: { display: false } }
                    }
                  }} 
                />
              </div>
            </div>
          </div>

          {/* Cột phải: Cơ cấu theo loại thiết bị */}
          <div className="col-12 col-xl-5">
            <div className="card border-0 shadow-sm p-4 rounded-4 bg-white h-100">
              <h5 className="fs-6 fw-bold text-dark mb-3">Cơ cấu theo loại thiết bị</h5>
              <div style={{ height: '360px' }} className="d-flex justify-content-center">
                <Doughnut 
                  data={doughnutData} 
                  options={{ 
                    responsive: true, 
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { 
                        position: 'bottom',
                        labels: { boxWidth: 12, padding: 10, font: { size: 10 } }
                      }
                    },
                    cutout: '65%'
                  }} 
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};