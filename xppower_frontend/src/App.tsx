import { useState, useEffect } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetManagementPage } from './pages/AssetManagementPage';
import { AuthService } from './services/AuthService';

function App() {
  // 1. Quản lý trạng thái đăng nhập
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return AuthService.isAuthenticated();
  });
  const [hasLoggedOut, setHasLoggedOut] = useState<boolean>(false);

  // 2. Quản lý tab hiện tại - Đảm bảo mặc định luôn là 'dashboard' nếu chưa đăng nhập hoặc không có dữ liệu
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'assets'>(() => {
    if (!AuthService.isAuthenticated()) return 'dashboard';
    const savedTab = localStorage.getItem('currentTab');
    return (savedTab === 'assets' || savedTab === 'dashboard') ? savedTab : 'dashboard';
  });

  // Đồng bộ tab vào localStorage mỗi khi thay đổi
  const handleTabChange = (tab: 'dashboard' | 'assets') => {
    setCurrentTab(tab);
    localStorage.setItem('currentTab', tab);
  };

  // Xử lý khi đăng nhập thành công: Luôn đưa về 'dashboard' và lưu vào storage
  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setHasLoggedOut(false);
    setCurrentTab('dashboard');
    localStorage.setItem('currentTab', 'dashboard');
  };

  // Xử lý khi đăng xuất: Xóa sạch token và reset tab về mặc định
  const handleLogout = () => {
    AuthService.logout();
    localStorage.removeItem('currentTab');
    setCurrentTab('dashboard');
    setIsLoggedIn(false);
    setHasLoggedOut(true);
  };

  if (!isLoggedIn) {
    return (
      <LoginPage 
        onLoginSuccess={handleLoginSuccess} 
        showLogoutMessage={hasLoggedOut}
      />
    );
  }

  return (
    <div className="app-container">
      {currentTab === 'dashboard' ? (
        <DashboardPage 
          onLogout={handleLogout} 
          onTabChange={handleTabChange}
        />
      ) : (
        <AssetManagementPage 
          onLogout={handleLogout} 
          onTabChange={handleTabChange}
        />
      )}
    </div>
  );
}

export default App;