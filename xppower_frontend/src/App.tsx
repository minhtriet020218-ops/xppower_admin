import { useState, useEffect, useRef } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetManagementPage } from './pages/AssetManagementPage';
import { AuthService } from './services/AuthService';
import { DepartmentPage } from './pages/DepartmentPage';
import { UserManagementSettingPage } from './pages/UserManagementSettingPage'; // Import trang Cài đặt

const IDLE_TIMEOUT = 10 * 60 * 1000; // 10 phút

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return AuthService.isAuthenticated();
  });
  const [hasLoggedOut, setHasLoggedOut] = useState<boolean>(false);

  // Thêm 'settings' vào union type của currentTab
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'assets' | 'department' | 'settings'>(() => {
    if (!AuthService.isAuthenticated()) return 'dashboard';
    const savedTab = sessionStorage.getItem('currentTab');
    return (savedTab === 'assets' || savedTab === 'dashboard' || savedTab === 'department' || savedTab === 'settings') ? savedTab : 'dashboard';
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTabChange = (tab: 'dashboard' | 'assets' | 'department' | 'settings') => {
    setCurrentTab(tab);
    sessionStorage.setItem('currentTab', tab);
  };

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
    setHasLoggedOut(false);
    setCurrentTab('dashboard');
    sessionStorage.setItem('currentTab', 'dashboard');
  };

  const handleLogout = () => {
    AuthService.logout();
    sessionStorage.removeItem('currentTab');
    setCurrentTab('dashboard');
    setIsLoggedIn(false);
    setHasLoggedOut(true);
  };

  useEffect(() => {
    if (!isLoggedIn) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        alert('Phiên làm việc đã hết hạn do bạn không hoạt động trong 10 phút!');
        handleLogout();
      }, IDLE_TIMEOUT);
    };

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));
    resetTimer();

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      events.forEach(event => window.removeEventListener(event, resetTimer));
    };
  }, [isLoggedIn]);

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
      {currentTab === 'dashboard' && (
        <DashboardPage onLogout={handleLogout} onTabChange={handleTabChange} />
      )}
      {currentTab === 'assets' && (
        <AssetManagementPage onLogout={handleLogout} onTabChange={handleTabChange} />
      )}
      {currentTab === 'department' && (
        <DepartmentPage onLogout={handleLogout} onTabChange={handleTabChange} />
      )}
      {/* Thêm điều kiện render trang Cài Đặt (UserManagementSettingPage) */}
      {currentTab === 'settings' && (
        <UserManagementSettingPage />
      )}
    </div>
  );
}

export default App;