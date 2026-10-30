import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { DashboardStatsDTO, DashboardStatsDTOBuilder } from '../dtos/DashboardDTO';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export const DashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardStatsDTO | null>(null);

  useEffect(() => {
    // Giả lập load dữ liệu sử dụng DTO Builder
    const mockData = new DashboardStatsDTOBuilder()
      .setTotals(2198, 2112, 70, 15)
      .setDepartmentDistribution([
        { name: 'PS Production', count: 558 },
        { name: 'Không xác định', count: 328 },
        { name: 'ENG-PS-IDL', count: 261 },
        { name: 'IE-IDL', count: 180 },
        { name: 'NPI-IDL', count: 100 },
        { name: 'PMC', count: 88 },
        { name: 'PP/Cable-PS Off', count: 61 }
      ])
      .setStatusDistribution([
        { status: 'In Stock', count: 180 },
        { status: 'In Use', count: 1635 },
        { status: 'Damaged', count: 45 },
        { status: 'Không xác định', count: 465 },
        { status: 'Write off', count: 20 },
        { status: 'Retired', count: 15 },
        { status: 'Backup', count: 10 }
      ])
      .setTypeDistribution([
        { type: 'Laptop', count: 611 },
        { type: 'Monitor', count: 822 },
        { type: 'Network Device', count: 369 },
        { type: 'Desktop', count: 100 },
        { type: 'Scanner', count: 45 }
      ])
      .build();

    setData(mockData);
  }, []);

  if (!data) return <div>Loading...</div>;

  // Chart configs
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
    <div style={{ backgroundColor: '#F3F4F6', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      {/* Top Header Navigation */}
      <header style={{ backgroundColor: '#fff', padding: '10px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ backgroundColor: '#000', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>XP IT</div>
          <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Asset Management</span>
          <nav style={{ marginLeft: '20px', display: 'flex', gap: '15px', fontSize: '13px', color: '#4B5563' }}>
            <span style={{ backgroundColor: '#E5E7EB', padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold' }}>Trang chủ</span>
            <span style={{ padding: '5px 10px', cursor: 'pointer' }}>Quản Lý Tài sản</span>
            <span style={{ padding: '5px 10px', cursor: 'pointer' }}>🏛 Bộ phận</span>
            <span style={{ padding: '5px 10px', cursor: 'pointer' }}>Trang cá nhân</span>
            <span style={{ padding: '5px 10px', cursor: 'pointer' }}>Cài Đặt</span>
          </nav>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ fontSize: '12px', textAlign: 'right' }}>
            <div style={{ fontWeight: 'bold' }}>VN2612246</div>
            <div style={{ color: '#6B7280' }}>Admin</div>
          </div>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#8B5CF6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>V</div>
        </div>
      </header>

      {/* Main Content Area */}
      <main style={{ padding: '20px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1F2937' }}>📊 Dashboard Tổng Quan</h2>
          <p style={{ fontSize: '12px', color: '#6B7280' }}>Thống kê tài sản IT theo bộ phận, trạng thái và loại thiết bị</p>
        </div>

        {/* Charts Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          {/* Horizontal Bar Chart Card */}
          <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '14px', textAlign: 'center', marginBottom: '15px' }}>📊 Bộ phận được cấp</h3>
            <div style={{ height: '350px' }}>
              <Bar data={barData} options={{ indexAxis: 'y', responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>

          {/* Right Pie/Donut Charts Column */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flex: 1 }}>
              <h3 style={{ fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>📈 Trạng thái tài sản</h3>
              <div style={{ height: '180px', display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={statusData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', flex: 1 }}>
              <h3 style={{ fontSize: '14px', textAlign: 'center', marginBottom: '10px' }}>🔧 Loại thiết bị</h3>
              <div style={{ height: '180px', display: 'flex', justifyContent: 'center' }}>
                <Doughnut data={statusData} options={{ maintainAspectRatio: false }} />
              </div>
            </div>
          </div>
        </div>

        {/* Metric Cards Bottom */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          <div style={{ backgroundColor: '#E0F2FE', border: '1px solid #7DD3FC', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#0284C7' }}>{data.totalAssets}</div>
            <div style={{ fontSize: '12px', color: '#0369A1' }}>Tổng tài sản</div>
          </div>
          <div style={{ backgroundColor: '#DCFCE7', border: '1px solid #86EFAC', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#16A34A' }}>{data.activeAssets}</div>
            <div style={{ fontSize: '12px', color: '#15803D' }}>Tài sản hoạt động</div>
          </div>
          <div style={{ backgroundColor: '#FEF3C7', border: '1px solid #FCD34D', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#D97706' }}>{data.departmentsCount}</div>
            <div style={{ fontSize: '12px', color: '#B45309' }}>Bộ phận</div>
          </div>
          <div style={{ backgroundColor: '#FCE7F3', border: '1px solid #FBCFE8', borderRadius: '8px', padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#DB2777' }}>{data.deviceTypesCount}</div>
            <div style={{ fontSize: '12px', color: '#BE185D' }}>Loại thiết bị</div>
          </div>
        </div>
      </main>
    </div>
  );
};