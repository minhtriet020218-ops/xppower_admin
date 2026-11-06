import { useState, useEffect, useRef } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AssetManagementPage } from './pages/AssetManagementPage';
import { AuthService } from './services/AuthService';

const IDLE_TIMEOUT = 5 * 60 * 1000; // 5 phút (tính theo milisecond)

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return AuthService.isAuthenticated();
  });
  const [hasLoggedOut, setHasLoggedOut] = useState<boolean>(false);

  const [currentTab, setCurrentTab] = useState<'dashboard' | 'assets'>(() => {
    if (!AuthService.isAuthenticated()) return 'dashboard';
    const savedTab = sessionStorage.getItem('currentTab');
    return (savedTab === 'assets' || savedTab === 'dashboard') ? savedTab : 'dashboard';
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handleTabChange = (tab: 'dashboard' | 'assets') => {
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

  // --- HÀM ĐẾM THỜI GIAN KHÔNG HOẠT ĐỘNG (AUTO LOGOUT 5 PHÚT) ---
  useEffect(() => {
    if (!isLoggedIn) return;

    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        alert('Phiên làm việc đã hết hạn do bạn không hoạt động trong 5 phút!');
        handleLogout();
      }, IDLE_TIMEOUT);
    };

    // Các sự kiện tương tác của người dùng
    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];
    events.forEach(event => window.addEventListener(event, resetTimer));

    // Khởi tạo bộ đếm lần đầu
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