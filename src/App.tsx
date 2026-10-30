import { useState } from 'react';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [hasLoggedOut, setHasLoggedOut] = useState<boolean>(false);

  return (
    <div className="app-container">
      {!isLoggedIn ? (
        <LoginPage 
          onLoginSuccess={() => {
            setIsLoggedIn(true);
            setHasLoggedOut(false); // Reset cờ khi đăng nhập thành công
          }} 
          showLogoutMessage={hasLoggedOut}
        />
      ) : (
        <DashboardPage 
          onLogout={() => {
            setIsLoggedIn(false);
            setHasLoggedOut(true); // Bật cờ thông báo khi bấm đăng xuất
          }} 
        />
      )}
    </div>
  );
}

export default App;