import React from 'react';

interface HeaderProps {
  username?: string;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ username = 'VN2612246', onLogout }) => {
  return (
    <header style={{ backgroundColor: '#fff', padding: '10px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ backgroundColor: '#000', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold' }}>XP IT</div>
        <span style={{ fontWeight: 'bold', fontSize: '18px' }}>Asset Management</span>
        <nav style={{ marginLeft: '20px', display: 'flex', gap: '15px', fontSize: '13px', color: '#4B5563' }}>
          <span style={{ backgroundColor: '#E5E7EB', padding: '5px 12px', borderRadius: '15px', fontWeight: 'bold', cursor: 'pointer' }}>Trang chủ</span>
          <span style={{ padding: '5px 10px', cursor: 'pointer' }}>Quản Lý Tài sản</span>
          <span style={{ padding: '5px 10px', cursor: 'pointer' }}>🏛 Bộ phận</span>
          <span style={{ padding: '5px 10px', cursor: 'pointer' }}>Trang cá nhân</span>
          <span style={{ padding: '5px 10px', cursor: 'pointer' }}>Cài Đặt</span>
        </nav>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <div style={{ fontSize: '12px', textAlign: 'right' }}>
          <div style={{ fontWeight: 'bold' }}>{username}</div>
          <div style={{ color: '#6B7280' }}>Admin</div>
        </div>
        <div 
          onClick={onLogout}
          title="Bấm để đăng xuất"
          style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#8B5CF6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', cursor: 'pointer' }}
        >
          V
        </div>
      </div>
    </header>
  );
};